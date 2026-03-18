'use client'

import { useState } from 'react'
import type { ReferenceFile } from '@/lib/content'
import { MarkdownBlock } from './markdown-block'

interface FileEntry {
  id: string
  label: string
  filename: string
  content: string
}

interface SkillFileViewerProps {
  skillRaw: string
  references: ReferenceFile[]
}

function FileIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-foreground' : 'text-muted-foreground/50'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function buildFileEntries(skillRaw: string, references: ReferenceFile[]): FileEntry[] {
  const entries: FileEntry[] = [
    { id: 'SKILL.md', label: 'SKILL.md', filename: 'SKILL.md', content: skillRaw },
  ]

  for (const ref of references) {
    entries.push({
      id: ref.path,
      label: ref.path,
      filename: `references/${ref.path}`,
      content: ref.content,
    })
  }

  return entries
}

interface SidebarTree {
  name: string
  isDir: boolean
  path: string
  children: SidebarTree[]
}

function buildTree(entries: FileEntry[]): SidebarTree[] {
  const root: SidebarTree[] = []

  for (const entry of entries) {
    const parts = entry.label.split('/')
    let level = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      const isLast = i === parts.length - 1

      if (isLast) {
        level.push({ name: part, isDir: false, path: entry.id, children: [] })
      } else {
        let dir = level.find((n) => n.isDir && n.name === part)
        if (!dir) {
          dir = { name: part, isDir: true, path: '', children: [] }
          level.push(dir)
        }
        level = dir.children
      }
    }
  }

  return root
}

function SidebarNode({
  node,
  depth,
  activeId,
  onSelect,
}: {
  node: SidebarTree
  depth: number
  activeId: string
  onSelect: (id: string) => void
}) {
  if (node.isDir) {
    return (
      <div>
        <div
          className="flex items-center gap-1.5 py-1 text-xs text-muted-foreground/60"
          style={{ paddingLeft: `${String(depth * 12)}px` }}
        >
          <FolderIcon />
          <span className="font-mono">{node.name}</span>
        </div>
        {node.children.map((child) => (
          <SidebarNode
            key={child.isDir ? `dir-${child.name}` : child.path}
            node={child}
            depth={depth + 1}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
      </div>
    )
  }

  const active = node.path === activeId

  return (
    <button
      type="button"
      onClick={() => { onSelect(node.path) }}
      className={`flex items-center gap-1.5 py-1 w-full text-left text-xs font-mono rounded-sm transition-colors ${
        active
          ? 'text-foreground bg-muted/50'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
      }`}
      style={{ paddingLeft: `${String(depth * 12)}px` }}
    >
      <FileIcon active={active} />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

export function SkillFileViewer({ skillRaw, references }: SkillFileViewerProps) {
  const entries = buildFileEntries(skillRaw, references)
  const tree = buildTree(entries)
  const [activeId, setActiveId] = useState(entries[0]!.id)
  const activeEntry = entries.find((e) => e.id === activeId) ?? entries[0]!

  if (entries.length === 1) {
    return <MarkdownBlock content={activeEntry.content} filename={activeEntry.filename} />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
      {/* Sidebar */}
      <div className="flat-card p-3 md:self-start md:sticky md:top-20 overflow-y-auto md:max-h-[calc(100vh-6rem)]">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40 mb-2 px-1">
          Files ({entries.length})
        </div>
        <nav>
          {tree.map((node) => (
            <SidebarNode
              key={node.isDir ? `dir-${node.name}` : node.path}
              node={node}
              depth={0}
              activeId={activeId}
              onSelect={setActiveId}
            />
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <MarkdownBlock content={activeEntry.content} filename={activeEntry.filename} />
      </div>
    </div>
  )
}
