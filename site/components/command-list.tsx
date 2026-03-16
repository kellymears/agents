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
          entry={command}
          onClick={() => { setSelected(command); }}
        />
      ))}
      {selected && (
        <ContentModal
          entry={{ type: 'command', data: selected }}
          open={true}
          onClose={() => { setSelected(null); }}
        />
      )}
    </>
  )
}
