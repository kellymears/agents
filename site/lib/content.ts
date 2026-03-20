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

export type PluginType = 'skill' | 'statusline'

export interface GitDates {
  createdAt: string | null
  modifiedAt: string | null
}

export interface FileTreeNode {
  name: string
  type: 'file' | 'directory'
  children?: FileTreeNode[]
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

export interface ReferenceFile {
  path: string      // relative to references/, e.g. "formats/email.md"
  name: string      // display name, e.g. "formats/email"
  content: string   // raw markdown source
}

export interface SkillEntry {
  name: string
  slug: string      // directory name, URL-safe (e.g. "git-pr" not "git:pr")
  title: string
  description: string
  shortDescription: string
  category: string
  dates: GitDates
  fileTree: FileTreeNode[]
  references: ReferenceFile[]
  raw: string
}

export interface DocSection {
  slug: string
  title: string
  content: string
}

export interface StatuslineData {
  docs: DocSection[]
  changelog: string | null
  upstream: { name: string; url: string; license: string } | null
  keywords: string[]
}

export interface PluginEntry {
  name: string
  type: PluginType
  description: string
  version: string
  category: string
  owner: { name: string }
  skills: SkillEntry[]
  commands: CommandEntry[]
  statusline?: StatuslineData
}

interface MarketplacePlugin {
  name: string
  source: string
  description: string
  version: string
  category: string
  type?: string
}

interface MarketplaceManifest {
  name: string
  description: string
  version: string
  owner: { name: string }
  plugins: MarketplacePlugin[]
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
      'git', ['log', '--diff-filter=A', '--format=%aI', '--follow', '--', rel], opts,
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

// ── Directories ──────────────────────────────────────────────────────

const marketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json')

// ── Reference scanner ────────────────────────────────────────────────

async function scanReferences(refsDir: string, base = ''): Promise<ReferenceFile[]> {
  try {
    const entries = await fs.readdir(refsDir, { withFileTypes: true })
    const results: ReferenceFile[] = []

    for (const entry of entries) {
      const fullPath = path.join(refsDir, entry.name)
      const relPath = base ? `${base}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        results.push(...await scanReferences(fullPath, relPath))
      } else if (entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8')
        results.push({
          path: relPath,
          name: relPath.replace(/\.md$/, ''),
          content,
        })
      }
    }

    return results.sort((a, b) => a.path.localeCompare(b.path))
  } catch {
    return []
  }
}

// ── Plugin scanner ───────────────────────────────────────────────────

async function scanSkills(pluginDir: string, category: string): Promise<SkillEntry[]> {
  const skillsDir = path.join(pluginDir, 'skills')
  try {
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
          const references = await scanReferences(
            path.join(skillsDir, dir.name, 'references'),
          )
          return {
            name,
            slug: dir.name,
            title: titleMatch?.[1] ?? name,
            description,
            shortDescription: truncate(description),
            category,
            dates: getGitDates(skillPath),
            fileTree: buildFileTree(path.join(skillsDir, dir.name)),
            references,
            raw,
          } satisfies SkillEntry
        }),
    )
    return entries.filter((e): e is SkillEntry => e !== null)
  } catch {
    return []
  }
}

async function scanCommands(pluginDir: string, pluginName: string, category: string): Promise<CommandEntry[]> {
  const commandsDir = path.join(pluginDir, 'commands')
  try {
    const files = await fs.readdir(commandsDir)
    const entries = await Promise.all(
      files
        .filter((f) => f.endsWith('.md'))
        .map(async (file) => {
          const filePath = path.join(commandsDir, file)
          const raw = await fs.readFile(filePath, 'utf-8')
          const { data } = matter(fixBlockScalars(raw))
          const description = String(data['description'] ?? '')
          const cmdName = `/${pluginName}:${file.replace(/\.md$/, '')}`
          return {
            name: cmdName,
            description,
            shortDescription: truncate(description),
            category,
            allowedTools: Array.isArray(data['allowed-tools'])
              ? data['allowed-tools'].map(String)
              : [],
            dates: getGitDates(filePath),
            raw,
          } satisfies CommandEntry
        }),
    )
    return entries
  } catch {
    return []
  }
}

// ── Statusline scanner ──────────────────────────────────────────────

async function scanStatuslineData(pluginDir: string): Promise<StatuslineData> {
  const docsDir = path.join(pluginDir, 'docs')
  const docs: DocSection[] = []

  try {
    const files = await fs.readdir(docsDir)
    const mdFiles = files.filter((f) => f.endsWith('.md')).sort()
    for (const file of mdFiles) {
      const raw = await fs.readFile(path.join(docsDir, file), 'utf-8')
      const { data, content } = matter(raw)
      docs.push({
        slug: file.replace(/\.md$/, ''),
        title: String(data['title'] ?? file.replace(/\.md$/, '')),
        content,
      })
    }
  } catch { /* no docs directory */ }

  let changelog: string | null = null
  try {
    changelog = await fs.readFile(path.join(pluginDir, 'CHANGELOG.md'), 'utf-8')
  } catch { /* no changelog */ }

  let upstream: StatuslineData['upstream'] = null
  try {
    const pluginJson = JSON.parse(await fs.readFile(
      path.join(pluginDir, '.claude-plugin', 'plugin.json'), 'utf-8',
    ))
    if (pluginJson.upstream) {
      upstream = {
        name: String(pluginJson.upstream.name),
        url: String(pluginJson.upstream.url),
        license: String(pluginJson.upstream.license),
      }
    }
  } catch { /* no plugin.json or no upstream */ }

  let keywords: string[] = []
  try {
    const pkg = JSON.parse(await fs.readFile(path.join(pluginDir, 'package.json'), 'utf-8'))
    if (Array.isArray(pkg.keywords)) {
      keywords = pkg.keywords.map(String)
    }
  } catch { /* no package.json */ }

  return { docs, changelog, upstream, keywords }
}

// ── Getters ──────────────────────────────────────────────────────────

export async function getPlugins(): Promise<PluginEntry[]> {
  const raw = await fs.readFile(marketplacePath, 'utf-8')
  const manifest: MarketplaceManifest = JSON.parse(raw)

  const entries = await Promise.all(
    manifest.plugins.map(async (plugin) => {
      const pluginDir = path.join(repoRoot, plugin.source)
      const type: PluginType = plugin.type === 'statusline' ? 'statusline' : 'skill'

      if (type === 'statusline') {
        const [statusline, commands] = await Promise.all([
          scanStatuslineData(pluginDir),
          scanCommands(pluginDir, plugin.name, plugin.category),
        ])
        return {
          name: plugin.name,
          type,
          description: plugin.description,
          version: plugin.version,
          category: plugin.category,
          owner: manifest.owner,
          skills: [],
          commands,
          statusline,
        } satisfies PluginEntry
      }

      const [skills, commands] = await Promise.all([
        scanSkills(pluginDir, plugin.category),
        scanCommands(pluginDir, plugin.name, plugin.category),
      ])
      return {
        name: plugin.name,
        type,
        description: plugin.description,
        version: plugin.version,
        category: plugin.category,
        owner: manifest.owner,
        skills,
        commands,
      } satisfies PluginEntry
    }),
  )

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getPlugin(name: string): Promise<PluginEntry | undefined> {
  const plugins = await getPlugins()
  return plugins.find((p) => p.name === name)
}

export async function getSkill(
  pluginName: string,
  skillSlug: string,
): Promise<{ plugin: PluginEntry; skill: SkillEntry } | undefined> {
  const plugin = await getPlugin(pluginName)
  if (!plugin) return undefined
  const skill = plugin.skills.find((s) => s.slug === skillSlug)
  if (!skill) return undefined
  return { plugin, skill }
}
