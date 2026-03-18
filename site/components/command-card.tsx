import Link from 'next/link'
import type { CommandEntry, SkillEntry } from '@/lib/content'
import { CategoryBadge, DateBadge, ToolsBadge, getCategoryBorderClass } from './metadata-badges'

function countFileTreeNodes(nodes: SkillEntry['fileTree']): number {
  let count = 0
  for (const node of nodes) {
    if (node.type === 'file') count++
    if (node.children) count += countFileTreeNodes(node.children)
  }
  return count
}

// ── Shared wrapper ───────────────────────────────────────────────────

function CardWrapper({
  onClick,
  children,
}: {
  onClick?: (() => void) | undefined
  children: React.ReactNode
}) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      className={`flat-card p-5 my-3 group hover:bg-muted/50 transition-colors w-full text-left relative${onClick ? ' cursor-pointer' : ''}`}
      {...(onClick ? { onClick, type: 'button' as const } : {})}
    >
      {children}
      {onClick && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors text-sm">
          &rarr;
        </span>
      )}
    </Wrapper>
  )
}

// ── Command Card ─────────────────────────────────────────────────────

interface CommandCardProps {
  entry: CommandEntry
  onClick?: () => void
}

export function CommandCard({ entry, onClick }: CommandCardProps) {
  return (
    <CardWrapper onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CategoryBadge category={entry.category} />
          <DateBadge date={entry.dates.modifiedAt} />
        </div>
        <ToolsBadge count={entry.allowedTools.length} />
      </div>
      <code className="text-base font-mono font-semibold text-foreground">
        {entry.name}
      </code>
      <p className="text-muted-foreground text-sm leading-relaxed mt-1.5 line-clamp-2 pr-6">
        {entry.shortDescription}
      </p>
    </CardWrapper>
  )
}

// ── Skill Card ───────────────────────────────────────────────────────

interface SkillCardProps {
  entry: SkillEntry
  href?: string
  onClick?: () => void
}

export function SkillCard({ entry, href, onClick }: SkillCardProps) {
  const refCount = countFileTreeNodes(entry.fileTree)
  const borderClass = getCategoryBorderClass(entry.category)
  const interactive = !!(href ?? onClick)
  const className = `flat-card border-l-2 ${borderClass} p-5 my-3 group hover:bg-muted/50 transition-colors w-full text-left relative${interactive ? ' cursor-pointer' : ''}`

  const content = (
    <>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-sans font-semibold text-foreground">
            {entry.title}
          </span>
          {entry.title !== entry.name && (
            <code className="text-xs font-mono text-muted-foreground/40">
              {entry.name}
            </code>
          )}
        </div>
        <div className="flex items-center gap-2">
          {refCount > 0 && (
            <span className="text-[11px] text-muted-foreground/60 font-mono">
              {refCount} {refCount === 1 ? 'file' : 'files'}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground/40 font-mono">
            {entry.category}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 pr-6">
        {entry.shortDescription}
      </p>
      {interactive && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors text-sm">
          &rarr;
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={`${className} block`}>
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    )
  }

  return <div className={className}>{content}</div>
}

// ── Feature Card ─────────────────────────────────────────────────────

interface FeatureCardProps {
  icon?: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flat-card p-6 group hover:bg-muted/50 transition-colors">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center mb-4 text-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-sans font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

// ── Stat Card (unchanged) ────────────────────────────────────────────

interface StatCardProps {
  value: string
  label: string
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="text-center">
      <div className="text-3xl font-sans font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
