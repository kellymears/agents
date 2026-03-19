'use client'

import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useViewMode } from './view-mode-provider'

interface MarkdownBlockProps {
  content: string
  filename?: string
}

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n*/

function stripFrontmatter(text: string): string {
  return text.replace(FRONTMATTER_RE, '')
}

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function MarkdownBlock({ content, filename }: MarkdownBlockProps) {
  const { mode, toggle } = useViewMode()
  const [copied, setCopied] = useState(false)
  const isRendered = mode === 'rendered'

  const renderedContent = useMemo(() => stripFrontmatter(content), [content])

  const handleCopy = () => {
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false) }, 2000)
    })
  }

  return (
    <div className="flat-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        {filename && (
          <span className="text-xs font-mono text-muted-foreground truncate mr-4">
            {filename}
          </span>
        )}
        {!filename && <span />}
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="text-[11px] text-muted-foreground">Show Rendered</span>
            <button
              type="button"
              role="switch"
              aria-checked={isRendered}
              onClick={toggle}
              className={`
                relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-colors
                ${isRendered
                  ? 'bg-foreground border-foreground'
                  : 'bg-muted border-border'}
              `}
            >
              <span
                className={`
                  inline-block h-2.5 w-2.5 rounded-full bg-background transition-transform
                  ${isRendered ? 'translate-x-3.5' : 'translate-x-0.5'}
                `}
              />
            </button>
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-x-auto">
        {mode === 'source' ? (
          <pre className="text-sm leading-relaxed text-muted-foreground">
            <code>{content}</code>
          </pre>
        ) : (
          <div className="prose-markdown text-sm leading-relaxed">
            <Markdown remarkPlugins={[remarkGfm]}>{renderedContent}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}
