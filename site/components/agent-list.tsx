'use client'

import type { AgentEntry } from '@/lib/content'
import { useState } from 'react'
import { AgentCard } from './command-card'
import { ContentModal } from './content-modal'

export function AgentListClient({ agents }: { agents: AgentEntry[] }) {
  const [selected, setSelected] = useState<AgentEntry | null>(null)

  return (
    <>
      {agents.map((agent) => (
        <AgentCard
          key={agent.name}
          entry={agent}
          onClick={() => { setSelected(agent); }}
        />
      ))}
      {selected && (
        <ContentModal
          entry={{ type: 'agent', data: selected }}
          open={true}
          onClose={() => { setSelected(null); }}
        />
      )}
    </>
  )
}
