import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlugins, getSkill } from '@/lib/content'
import { Breadcrumb } from '@/components/breadcrumb'
import { CategoryBadge, DateBadge } from '@/components/metadata-badges'
import { FileTree } from '@/components/file-tree'

export async function generateStaticParams() {
  const plugins = await getPlugins()
  return plugins.flatMap((p) =>
    p.skills.map((s) => ({ name: p.name, skill: s.slug })),
  )
}

interface SkillPageProps {
  params: Promise<{ name: string; skill: string }>
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { name, skill: skillSlug } = await params
  const result = await getSkill(name, skillSlug)
  if (!result) notFound()

  const { plugin, skill } = result

  return (
    <div>
      <Breadcrumb
        segments={[
          { label: 'Plugins', href: '/plugins' },
          { label: plugin.name, href: `/plugins/${plugin.name}` },
          { label: skill.title },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-sans text-2xl font-bold text-foreground">
            {skill.title}
          </h1>
          {skill.title !== skill.name && (
            <code className="text-sm font-mono text-muted-foreground/40">
              {skill.name}
            </code>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={skill.category} />
          {skill.dates.createdAt && (
            <DateBadge label="Created" date={skill.dates.createdAt} />
          )}
          {skill.dates.modifiedAt && (
            <DateBadge label="Updated" date={skill.dates.modifiedAt} />
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-foreground/90 mb-8">
        {skill.description}
      </p>

      <hr className="border-border mb-8" />

      {/* SKILL.md source */}
      <div className="mb-8">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">
          SKILL.md
        </h2>
        <div className="code-block p-4">
          <pre className="overflow-x-auto text-sm leading-relaxed text-muted-foreground">
            <code>{skill.raw}</code>
          </pre>
        </div>
      </div>

      {/* Reference files */}
      {skill.references.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-3">
            Reference Files ({skill.references.length})
          </h2>
          <div className="space-y-2">
            {skill.references.map((ref, i) => (
              <details
                key={ref.path}
                className="flat-card"
                open={i === 0}
              >
                <summary className="px-4 py-3 cursor-pointer text-sm font-mono text-foreground/80 hover:bg-muted/50 transition-colors select-none">
                  {ref.path}
                </summary>
                <div className="border-t border-border">
                  <div className="code-block rounded-none border-0 p-4">
                    <pre className="overflow-x-auto text-sm leading-relaxed text-muted-foreground">
                      <code>{ref.content}</code>
                    </pre>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* File tree */}
      {skill.fileTree.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">
            File Tree
          </h2>
          <FileTree nodes={skill.fileTree} />
        </div>
      )}

      {/* Back link */}
      <Link
        href={`/plugins/${plugin.name}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to {plugin.name}
      </Link>
    </div>
  )
}
