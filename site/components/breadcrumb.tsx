import Link from 'next/link'

interface BreadcrumbSegment {
  label: string
  href?: string
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[]
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1
        return (
          <span key={segment.label} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-muted-foreground/40">/</span>
            )}
            {segment.href && !isLast ? (
              <Link
                href={segment.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {segment.label}
              </Link>
            ) : (
              <span className="text-foreground">{segment.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
