import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPlugins, getSkill } from '@/lib/content'
import { Breadcrumb } from '@/components/breadcrumb'
import { CategoryBadge, DateBadge } from '@/components/metadata-badges'
import { SkillFileViewer } from '@/components/skill-file-viewer'

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

      {/* File viewer */}
      <SkillFileViewer skillRaw={skill.raw} references={skill.references} />

      {/* Back link */}
      <div className="mt-8">
        <Link
          href={`/plugins/${plugin.name}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to {plugin.name}
        </Link>
      </div>
    </div>
  )
}
