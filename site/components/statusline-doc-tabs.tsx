'use client'

import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Tab {
  slug: string
  title: string
  content: string
}

interface StatuslineDocTabsProps {
  tabs: Tab[]
}

export function StatuslineDocTabs({ tabs }: StatuslineDocTabsProps) {
  const [active, setActive] = useState(0)
  const current = tabs[active]

  if (!current) return null

  return (
    <div>
      <div className="flex gap-0 border-b border-border mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => { setActive(i) }}
            className={`
              px-4 py-2 text-sm font-medium transition-colors relative
              ${i === active
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/80'}
            `}
          >
            {tab.title}
            {i === active && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-foreground" />
            )}
          </button>
        ))}
      </div>

      <div className="prose-markdown text-sm leading-relaxed">
        <Markdown remarkPlugins={[remarkGfm]}>{current.content}</Markdown>
      </div>
    </div>
  )
}
