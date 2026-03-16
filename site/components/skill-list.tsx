'use client'

import type { SkillEntry } from '@/lib/content'
import { useState } from 'react'
import { SkillCard } from './command-card'
import { ContentModal } from './content-modal'

export function SkillListClient({ skills }: { skills: SkillEntry[] }) {
  const [selected, setSelected] = useState<SkillEntry | null>(null)

  return (
    <>
      {skills.map((skill) => (
        <SkillCard
          key={skill.name}
          entry={skill}
          onClick={() => { setSelected(skill); }}
        />
      ))}
      {selected && (
        <ContentModal
          entry={{ type: 'skill', data: selected }}
          open={true}
          onClose={() => { setSelected(null); }}
        />
      )}
    </>
  )
}
