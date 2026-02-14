'use client'

import type { CommandEntry } from '@/lib/content'
import { useState } from 'react'
import { CommandCard } from './command-card'
import { ContentModal } from './content-modal'

export function CommandListClient({ commands }: { commands: CommandEntry[] }) {
  const [selected, setSelected] = useState<CommandEntry | null>(null)

  return (
    <>
      {commands.map((command) => (
        <CommandCard
          key={command.name}
          name={command.name}
          description={command.description}
          usage={command.name}
          onClick={() => { setSelected(command); }}
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
