'use client'

import type { FileTreeNode } from '@/lib/content'
import { useState } from 'react'

function FolderIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function TreeNode({ node, depth }: { node: FileTreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2)

  if (node.type === 'file') {
    return (
      <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: `${String(depth * 16)}px` }}>
        <FileIcon />
        <span className="text-xs font-mono text-muted-foreground">{node.name}</span>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        className="flex items-center gap-1.5 py-0.5 w-full text-left hover:bg-muted/30 rounded-sm transition-colors"
        style={{ paddingLeft: `${String(depth * 16)}px` }}
        onClick={() => { setExpanded(!expanded); }}
      >
        <span className={`text-[10px] text-muted-foreground/60 w-3 text-center transition-transform ${expanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
        <FolderIcon />
        <span className="text-xs font-mono text-foreground/80">{node.name}</span>
      </button>
      {expanded && node.children?.map((child) => (
        <TreeNode key={child.name} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export function FileTree({ nodes }: { nodes: FileTreeNode[] }) {
  if (nodes.length === 0) return null

  return (
    <div className="code-block p-3 rounded-lg">
      {nodes.map((node) => (
        <TreeNode key={node.name} node={node} depth={0} />
      ))}
    </div>
  )
}
