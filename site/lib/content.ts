import { execFileSync } from 'node:child_process'
import fsSync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

/**
 * Some files use `>-` block scalar syntax inline (e.g. `>- text`),
 * which gray-matter's YAML parser rejects. Strip it to a plain string.
 */
function fixBlockScalars(raw: string): string {
  return raw.replace(/^(\s*)>-\s+/gm, '$1')
}

// ── Types ────────────────────────────────────────────────────────────

export interface GitDates {
  createdAt: string | null
  modifiedAt: string | null
}

export interface FileTreeNode {
  name: string
  type: 'file' | 'directory'
  children?: FileTreeNode[]
}

export interface AgentEntry {
  name: string
  description: string
  shortDescription: string
  category: string
  model: string
  tools: string[]
  memory: boolean
  dates: GitDates
  raw: string
}

export interface CommandEntry {
  name: string
  description: string
  shortDescription: string
  category: string
  allowedTools: string[]
  dates: GitDates
  raw: string
}

export interface SkillEntry {
  name: string
  title: string
  description: string
  shortDescription: string
  category: string
  dates: GitDates
  fileTree: FileTreeNode[]
  raw: string
}

// ── Helpers ──────────────────────────────────────────────────────────

const repoRoot = path.join(process.cwd(), '..')

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getGitDates(filePath: string): GitDates {
  try {
    const rel = path.relative(repoRoot, filePath)
    const opts = { cwd: repoRoot, encoding: 'utf-8' as const }

    const createdOutput = execFileSync(
      'git', ['log', '--diff-filter=A', '--format=%aI', '--', rel], opts,
    ).trim()
    const created = createdOutput.split('\n').pop() ?? null

    const modifiedOutput = execFileSync(
      'git', ['log', '-1', '--format=%aI', '--', rel], opts,
    ).trim()
    const modified = modifiedOutput || null

    return {
      createdAt: created ? formatDate(created) : null,
      modifiedAt: modified ? formatDate(modified) : null,
    }
  } catch {
    return { createdAt: null, modifiedAt: null }
  }
}

function buildFileTree(dirPath: string, exclude = new Set<string>(['SKILL.md'])): FileTreeNode[] {
  try {
    const entries = fsSync.readdirSync(dirPath, { withFileTypes: true })
    const nodes: FileTreeNode[] = []

    for (const entry of entries) {
      if (entry.name.startsWith('.') || exclude.has(entry.name)) continue

      if (entry.isDirectory()) {
        const children = buildFileTree(path.join(dirPath, entry.name), exclude)
        nodes.push({ name: entry.name, type: 'directory', children })
      } else {
        nodes.push({ name: entry.name, type: 'file' })
      }
    }

    return nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  } catch {
    return []
  }
}

function truncate(text: string, maxLen = 140): string {
  const firstSentence = /^[^.!?]*[.!?]/.exec(text)
  const candidate = firstSentence?.[0] ?? text
  if (candidate.length <= maxLen) return candidate
  return `${text.slice(0, maxLen).trimEnd()}…`
}

const categoryMap: Record<string, string> = {
  'git-commits': 'git',
  'git-issue': 'git',
  'git-pr': 'git',
  'git-work': 'git',
  'git:commits': 'git',
  'git:issue': 'git',
  'git:pr': 'git',
  'git:work': 'git',
  'playwright-cli': 'browser',
  comms: 'writing',
  'sprint-worker': 'automation',
  'progressive-sim': 'practice',
  obsidian: 'notes',
  tdd: 'testing',
}

const keywordCategories: [RegExp, string][] = [
  [/test/i, 'testing'],
  [/review/i, 'review'],
  [/wordpress|wp|gutenberg/i, 'wordpress'],
  [/docs?|writ/i, 'docs'],
  [/manage|project/i, 'management'],
]

function deriveCategory(name: string, description: string): string {
  const clean = name.replace(/^\//, '')
  if (categoryMap[clean]) return categoryMap[clean]

  for (const [re, cat] of keywordCategories) {
    if (re.test(clean) || re.test(description)) return cat
  }

  return 'general'
}

// ── Directories ──────────────────────────────────────────────────────

const agentsDir = path.join(process.cwd(), '..', '.claude', 'agents')
const commandsDir = path.join(process.cwd(), '..', '.claude', 'commands')
const skillsDir = path.join(process.cwd(), '..', '.claude', 'skills')

// ── Getters ──────────────────────────────────────────────────────────

export async function getAgents(): Promise<AgentEntry[]> {
  const files = await fs.readdir(agentsDir)
  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(agentsDir, file)
        const raw = await fs.readFile(filePath, 'utf-8')
        const { data } = matter(fixBlockScalars(raw))
        const description = String(data['description'] ?? '')
        const name = String(data['name'] ?? file.replace(/\.md$/, ''))
        return {
          name,
          description,
          shortDescription: truncate(description),
          category: deriveCategory(name, description),
          model: String(data['model'] ?? 'sonnet'),
          tools: Array.isArray(data['tools'])
            ? data['tools'].map(String)
            : [],
          memory: data['memory'] === 'user',
          dates: getGitDates(filePath),
          raw,
        } satisfies AgentEntry
      }),
  )
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getCommands(): Promise<CommandEntry[]> {
  const files = await fs.readdir(commandsDir)
  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(commandsDir, file)
        const raw = await fs.readFile(filePath, 'utf-8')
        const { data } = matter(fixBlockScalars(raw))
        const description = String(data['description'] ?? '')
        const cmdName = `/${file.replace(/\.md$/, '')}`
        return {
          name: cmdName,
          description,
          shortDescription: truncate(description),
          category: deriveCategory(cmdName, description),
          allowedTools: Array.isArray(data['allowed-tools'])
            ? data['allowed-tools'].map(String)
            : [],
          dates: getGitDates(filePath),
          raw,
        } satisfies CommandEntry
      }),
  )
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getSkills(): Promise<SkillEntry[]> {
  const dirs = await fs.readdir(skillsDir, { withFileTypes: true })
  const entries = await Promise.all(
    dirs
      .filter((d) => d.isDirectory())
      .map(async (dir) => {
        const skillPath = path.join(skillsDir, dir.name, 'SKILL.md')
        const raw = await fs.readFile(skillPath, 'utf-8').catch(() => null)
        if (!raw) return null
        const { data, content } = matter(fixBlockScalars(raw))
        const titleMatch = /^#\s+(.+)$/m.exec(content)
        const description = String(data['description'] ?? '')
        const name = String(data['name'] ?? dir.name)
        return {
          name,
          title: titleMatch?.[1] ?? name,
          description,
          shortDescription: truncate(description),
          category: deriveCategory(name, description),
          dates: getGitDates(skillPath),
          fileTree: buildFileTree(path.join(skillsDir, dir.name)),
          raw,
        } satisfies SkillEntry
      }),
  )
  return entries
    .filter((e): e is SkillEntry => e !== null)
    .sort((a, b) => a.name.localeCompare(b.name))
}
