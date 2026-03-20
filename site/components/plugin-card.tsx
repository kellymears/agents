import Link from 'next/link'
import type { PluginEntry } from '@/lib/content'
import { CategoryBadge, TypeBadge, getCategoryBorderClass } from './metadata-badges'

interface PluginCardProps {
  entry: PluginEntry
  href: string
}

export function PluginCard({ entry, href }: PluginCardProps) {
  const borderClass = getCategoryBorderClass(entry.category)
  const skillCount = entry.skills.length
  const commandCount = entry.commands.length

  return (
    <Link
      href={href}
      className={`flat-card border-l-2 ${borderClass} p-5 my-3 block group hover:bg-muted/50 transition-colors relative`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-sans font-semibold text-foreground">
            {entry.name}
          </span>
          <CategoryBadge category={entry.category} />
          <TypeBadge type={entry.type} />
        </div>
        <div className="flex items-center gap-2">
          {skillCount > 0 && (
            <span className="text-[11px] text-muted-foreground/60 font-mono">
              {skillCount} {skillCount === 1 ? 'skill' : 'skills'}
            </span>
          )}
          {commandCount > 0 && (
            <span className="text-[11px] text-muted-foreground/60 font-mono">
              {commandCount} {commandCount === 1 ? 'command' : 'commands'}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground/40 font-mono">
            v{entry.version}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 pr-6">
        {entry.description}
      </p>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors text-sm">
        &rarr;
      </span>
    </Link>
  )
}
