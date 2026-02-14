import { getAgents } from '@/lib/content'
import { AgentListClient } from './agent-list'

export async function AgentList() {
  const agents = await getAgents()
  return <AgentListClient agents={agents} />
}
