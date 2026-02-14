'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface ContentModalProps {
  title: string
  content: string
  open: boolean
  onClose: () => void
}

export function ContentModal({
  title,
  content,
  open,
  onClose,
}: ContentModalProps) {
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
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false); }, 2000)
    })
  }

  if (!open) return null

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
              {copied ? 'Copied!' : 'Copy'}
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

        <div className="overflow-y-auto p-6">
          <div className="code-block p-4">
            <pre className="overflow-x-auto text-sm leading-relaxed text-muted-foreground">
              <code>{content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
