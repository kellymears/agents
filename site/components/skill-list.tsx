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
          name={skill.name}
          title={skill.title}
          description={skill.description}
          onClick={() => { setSelected(skill); }}
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
