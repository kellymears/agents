import Link from 'next/link'
import type { PluginEntry } from '@/lib/content'
import { getCategoryBorderClass } from './metadata-badges'

interface SkillPluginBodyProps {
  entry: PluginEntry
}

export function SkillPluginBody({ entry }: SkillPluginBodyProps) {
  return (
    <>
      {/* Skills */}
      {entry.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3">
            Skills ({entry.skills.length})
          </h2>
          <div className="space-y-3">
            {entry.skills.map((skill) => {
              const borderClass = getCategoryBorderClass(skill.category)
              return (
                <Link
                  key={skill.slug}
                  href={`/plugins/${entry.name}/skills/${skill.slug}`}
                  className={`flat-card border-l-2 ${borderClass} p-4 block group hover:bg-muted/50 transition-colors relative`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans font-medium text-foreground text-sm">
                      {skill.title}
                    </span>
                    {skill.title !== skill.name && (
                      <code className="text-xs font-mono text-muted-foreground/40">
                        {skill.name}
                      </code>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed pr-6">
                    {skill.shortDescription}
                  </p>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors text-sm">
                    &rarr;
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Commands */}
      {entry.commands.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3">
            Commands ({entry.commands.length})
          </h2>
          <div className="space-y-3">
            {entry.commands.map((cmd) => (
              <div key={cmd.name} className="flat-card p-4">
                <code className="font-mono font-medium text-foreground text-sm">
                  {cmd.name}
                </code>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {cmd.shortDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
