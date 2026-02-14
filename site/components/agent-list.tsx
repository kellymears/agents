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
          name={agent.name}
          description={agent.description}
          model={agent.model}
          onClick={() => { setSelected(agent); }}
        />
      ))}
      {selected && (
        <ContentModal
          title={selected.name}
          content={selected.raw}
          open={true}
          onClose={() => { setSelected(null); }}
        />
      )}
    </>
  )
}
