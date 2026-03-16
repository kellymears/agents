const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  git: { bg: 'bg-orange-500/10', text: 'text-orange-400/80', border: 'border-l-orange-500/40' },
  browser: { bg: 'bg-purple-500/10', text: 'text-purple-400/80', border: 'border-l-purple-500/40' },
  writing: { bg: 'bg-emerald-500/10', text: 'text-emerald-400/80', border: 'border-l-emerald-500/40' },
  automation: { bg: 'bg-blue-500/10', text: 'text-blue-400/80', border: 'border-l-blue-500/40' },
  practice: { bg: 'bg-amber-500/10', text: 'text-amber-400/80', border: 'border-l-amber-500/40' },
  testing: { bg: 'bg-cyan-500/10', text: 'text-cyan-400/80', border: 'border-l-cyan-500/40' },
  review: { bg: 'bg-rose-500/10', text: 'text-rose-400/80', border: 'border-l-rose-500/40' },
  docs: { bg: 'bg-teal-500/10', text: 'text-teal-400/80', border: 'border-l-teal-500/40' },
  wordpress: { bg: 'bg-sky-500/10', text: 'text-sky-400/80', border: 'border-l-sky-500/40' },
  management: { bg: 'bg-indigo-500/10', text: 'text-indigo-400/80', border: 'border-l-indigo-500/40' },
  notes: { bg: 'bg-violet-500/10', text: 'text-violet-400/80', border: 'border-l-violet-500/40' },
  general: { bg: 'bg-zinc-500/10', text: 'text-zinc-400/80', border: 'border-l-zinc-500/40' },
}

export function getCategoryBorderClass(category: string): string {
  const general = 'border-l-zinc-500/40'
  return categoryColors[category]?.border ?? general
}

export function CategoryBadge({ category }: { category: string }) {
  const general = { bg: 'bg-zinc-500/10', text: 'text-zinc-400/80' }
  const colors = categoryColors[category] ?? general
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
      {category}
    </span>
  )
}

export function DateBadge({ label, date }: { label?: string; date: string | null }) {
  if (!date) return null
  return (
    <span className="text-xs text-muted-foreground">
      {label && <span className="text-muted-foreground/60">{label} </span>}
      {date}
    </span>
  )
}

export function ToolsBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border font-mono">
      {count} {count === 1 ? 'tool' : 'tools'}
    </span>
  )
}

export function ModelBadge({ model }: { model: string }) {
  return (
    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border font-mono">
      {model}
    </span>
  )
}
