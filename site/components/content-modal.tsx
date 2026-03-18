'use client'

import type { CommandEntry, SkillEntry } from '@/lib/content'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FileTree } from './file-tree'
import { CategoryBadge, DateBadge, ToolsBadge } from './metadata-badges'

export type ModalEntry =
  | { type: 'command'; data: CommandEntry }
  | { type: 'skill'; data: SkillEntry }

interface ContentModalProps {
  entry: ModalEntry
  open: boolean
  onClose: () => void
}

function getTitle(entry: ModalEntry): string {
  if (entry.type === 'skill') return entry.data.title
  return entry.data.name
}

function getRaw(entry: ModalEntry): string {
  return entry.data.raw
}

function getTools(entry: ModalEntry): string[] {
  switch (entry.type) {
    case 'command': return entry.data.allowedTools
    case 'skill': return []
  }
}

export function ContentModal({ entry, open, onClose }: ContentModalProps) {
  const [copied, setCopied] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    modalRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  const handleCopy = () => {
    void navigator.clipboard.writeText(getRaw(entry)).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false); }, 2000)
    })
  }

  if (!open) return null

  const title = getTitle(entry)
  const tools = getTools(entry)
  const { data } = entry

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-label={title}
        tabIndex={-1}
        className="flat-card bg-background mx-4 flex max-h-[85vh] w-full max-w-3xl flex-col"
        onClick={(e) => { e.stopPropagation(); }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-sans text-lg font-semibold text-foreground">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-sm px-3 py-1.5 border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              {copied ? 'Copied!' : 'Copy Source'}
            </button>
            <button
              onClick={onClose}
              className="text-sm px-2.5 py-1.5 border border-border rounded-md text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
              type="button"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Metadata section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={data.category} />
              {tools.length > 0 && <ToolsBadge count={tools.length} />}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {data.dates.createdAt && (
                <DateBadge label="Created" date={data.dates.createdAt} />
              )}
              {data.dates.modifiedAt && (
                <DateBadge label="Updated" date={data.dates.modifiedAt} />
              )}
            </div>

            {tools.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span className="text-muted-foreground/60">Tools: </span>
                {tools.join(', ')}
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* File tree (skills with references only) */}
          {entry.type === 'skill' && entry.data.fileTree.length > 0 && (
            <>
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">
                  Reference Files
                </h3>
                <FileTree nodes={entry.data.fileTree} />
              </div>
              <hr className="border-border" />
            </>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">
              Description
            </h3>
            <p className="text-sm leading-relaxed text-foreground/90">
              {data.description}
            </p>
          </div>

          <hr className="border-border" />

          {/* Raw source (collapsible) */}
          <details className="group/details">
            <summary className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 cursor-pointer hover:text-muted-foreground transition-colors select-none">
              Raw Source
            </summary>
            <div className="code-block p-4 mt-2">
              <pre className="overflow-x-auto text-sm leading-relaxed text-muted-foreground">
                <code>{getRaw(entry)}</code>
              </pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
