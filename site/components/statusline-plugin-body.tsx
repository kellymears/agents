import type { PluginEntry } from '@/lib/content'
import { StatuslineDocTabs } from './statusline-doc-tabs'

interface StatuslinePluginBodyProps {
  entry: PluginEntry
}

export function StatuslinePluginBody({ entry }: StatuslinePluginBodyProps) {
  const { statusline } = entry
  if (!statusline) return null

  const tabs = [
    ...statusline.docs.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      content: doc.content,
    })),
    ...(statusline.changelog
      ? [{ slug: 'changelog', title: 'Changelog', content: statusline.changelog }]
      : []),
  ]

  return (
    <>
      {/* Upstream attribution */}
      {statusline.upstream && (
        <div className="mb-6">
          <span className="text-sm text-muted-foreground">
            Fork of{' '}
            <a
              href={statusline.upstream.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2 hover:text-foreground/80 transition-colors"
            >
              {statusline.upstream.name}
            </a>
            <span className="text-muted-foreground/50 ml-2">{statusline.upstream.license}</span>
          </span>
        </div>
      )}

      {/* Keywords */}
      {statusline.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {statusline.keywords.map((kw) => (
            <span
              key={kw}
              className="text-xs font-mono text-muted-foreground/60 px-2 py-0.5 rounded-md bg-muted/50 border border-border/50"
            >
              {kw}
            </span>
          ))}
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

      {/* Documentation tabs */}
      {tabs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3">
            Documentation
          </h2>
          <div className="flat-card p-6">
            <StatuslineDocTabs tabs={tabs} />
          </div>
        </div>
      )}
    </>
  )
}
