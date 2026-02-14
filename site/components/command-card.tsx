interface CommandCardProps {
  name: string
  description: string
  usage: string
  onClick?: () => void
}

export function CommandCard({ name, description, usage, onClick }: CommandCardProps) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      className={`flat-card p-5 my-6 group hover:bg-muted/50 transition-colors w-full text-left${onClick ? ' cursor-pointer' : ''}`}
      {...(onClick ? { onClick, type: 'button' as const } : {})}
    >
      <div className="flex items-center justify-between mb-3">
        <code className="text-lg font-mono font-semibold text-foreground">
          {name}
        </code>

        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border font-mono">
          {usage}
        </span>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </Wrapper>
  )
}

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

interface AgentCardProps {
  name: string
  description: string
  model?: string
  onClick?: () => void
}

export function AgentCard({ name, description, model, onClick }: AgentCardProps) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      className={`flat-card p-5 my-6 group hover:bg-muted/50 transition-colors w-full text-left${onClick ? ' cursor-pointer' : ''}`}
      {...(onClick ? { onClick, type: 'button' as const } : {})}
    >
      <div className="flex items-center justify-between mb-3">
        <code className="text-lg font-mono font-semibold text-foreground">
          {name}
        </code>

        {model && (
          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border font-mono">
            {model}
          </span>
        )}
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </Wrapper>
  )
}
