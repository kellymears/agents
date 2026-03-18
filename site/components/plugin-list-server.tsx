import { getPlugins } from '@/lib/content'
import { PluginCard } from './plugin-card'

export async function PluginList() {
  const plugins = await getPlugins()

  return (
    <>
      {plugins.map((plugin) => (
        <PluginCard
          key={plugin.name}
          entry={plugin}
          href={`/plugins/${plugin.name}`}
        />
      ))}
    </>
  )
}
