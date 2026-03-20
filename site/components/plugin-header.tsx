import type { PluginEntry } from '@/lib/content'
import { CategoryBadge, TypeBadge } from './metadata-badges'

interface PluginHeaderProps {
  entry: PluginEntry
}

export function PluginHeader({ entry }: PluginHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-sans text-2xl font-bold text-foreground">
          {entry.name}
        </h1>
        <CategoryBadge category={entry.category} />
        <TypeBadge type={entry.type} />
        <span className="text-xs text-muted-foreground/40 font-mono">
          v{entry.version}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-foreground/90 mb-6">
        {entry.description}
      </p>

      <div className="mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">
          Install
        </h2>
        <div className="code-block p-3">
          <code className="text-sm text-muted-foreground">
            /plugin install {entry.name}@kellymears
          </code>
        </div>
      </div>

      <hr className="border-border mb-8" />
    </>
  )
}
