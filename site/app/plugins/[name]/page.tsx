import { notFound } from 'next/navigation'
import { getPlugin, getPlugins } from '@/lib/content'
import { Breadcrumb } from '@/components/breadcrumb'
import { PluginHeader } from '@/components/plugin-header'
import { SkillPluginBody } from '@/components/skill-plugin-body'
import { StatuslinePluginBody } from '@/components/statusline-plugin-body'

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

      <PluginHeader entry={entry} />

      {entry.type === 'statusline'
        ? <StatuslinePluginBody entry={entry} />
        : <SkillPluginBody entry={entry} />}
    </div>
  )
}
