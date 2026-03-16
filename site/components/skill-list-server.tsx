import { getSkills } from '@/lib/content'
import { SkillListClient } from './skill-list'

export async function SkillList() {
  const skills = await getSkills()
  return <SkillListClient skills={skills} />
}
