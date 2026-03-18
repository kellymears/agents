import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlugin, getPlugins } from '@/lib/content'
import { Breadcrumb } from '@/components/breadcrumb'
import { CategoryBadge, getCategoryBorderClass } from '@/components/metadata-badges'

export async function generateStaticParams() {
  const plugins = await getPlugins()
  return plugins.map((p) => ({ name: p.name }))
}

interface PluginPageProps {
  params: Promise<{ name: string }>
}

export default async function PluginPage({ params }: PluginPageProps) {
  const { name } = await params
  const entry = await getPlugin(name)
  if (!entry) notFound()

  return (
    <div>
      <Breadcrumb
        segments={[
          { label: 'Plugins', href: '/plugins' },
          { label: entry.name },
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-sans text-2xl font-bold text-foreground">
          {entry.name}
        </h1>
        <CategoryBadge category={entry.category} />
        <span className="text-xs text-muted-foreground/40 font-mono">
          v{entry.version}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-foreground/90 mb-6">
        {entry.description}
      </p>

      {/* Install */}
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
    </div>
  )
}
