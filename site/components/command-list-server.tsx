import { getCommands } from '@/lib/content'
import { CommandListClient } from './command-list'

export async function CommandList() {
  const commands = await getCommands()
  return <CommandListClient commands={commands} />
}
