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

export interface AgentEntry {
  name: string
  description: string
  model: string
  tools: string[]
  raw: string
}

export interface CommandEntry {
  name: string
  description: string
  allowedTools: string[]
  raw: string
}

const agentsDir = path.join(process.cwd(), '..', '.claude', 'agents')
const commandsDir = path.join(process.cwd(), '..', '.claude', 'commands')

export async function getAgents(): Promise<AgentEntry[]> {
  const files = await fs.readdir(agentsDir)
  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(agentsDir, file), 'utf-8')
        const { data } = matter(fixBlockScalars(raw))
        return {
          name: String(data['name'] ?? file.replace(/\.md$/, '')),
          description: String(data['description'] ?? ''),
          model: String(data['model'] ?? 'sonnet'),
          tools: Array.isArray(data['tools'])
            ? data['tools'].map(String)
            : [],
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
        const raw = await fs.readFile(path.join(commandsDir, file), 'utf-8')
        const { data } = matter(fixBlockScalars(raw))
        return {
          name: `/${file.replace(/\.md$/, '')}`,
          description: String(data['description'] ?? ''),
          allowedTools: Array.isArray(data['allowed-tools'])
            ? data['allowed-tools'].map(String)
            : [],
          raw,
        } satisfies CommandEntry
      }),
  )
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}
