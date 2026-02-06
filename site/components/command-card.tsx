interface CommandCardProps {
  name: string
  description: string
  usage: string
}

export function CommandCard({ name, description, usage }: CommandCardProps) {
  return (
    <div className="glass-card p-5 my-6 group hover:shadow-glow-sm transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <code className="text-lg font-mono font-semibold text-glass-400 group-hover:text-glow transition-[text-shadow] duration-300">
          {name}
        </code>
        <span className="text-xs text-obsidian-400 bg-obsidian-800/50 px-2.5 py-1 rounded-lg border border-white/[0.05] font-mono">
          {usage}
        </span>
      </div>
      <p className="text-obsidian-300 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

interface FeatureCardProps {
  icon?: React.ReactNode
  title: string
  description: string
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="glass-card p-6 group hover:shadow-glow-sm transition-shadow duration-300">
      {icon && (
        <div className="w-10 h-10 rounded-xl bg-glass-500/10 border border-glass-500/20 flex items-center justify-center mb-4 text-glass-400 group-hover:shadow-glow-sm transition-shadow duration-300">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-obsidian-100 mb-2">{title}</h3>
      <p className="text-obsidian-400 text-sm leading-relaxed">{description}</p>
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
      <div className="text-3xl font-display font-bold gradient-text mb-1">{value}</div>
      <div className="text-sm text-obsidian-400">{label}</div>
    </div>
  )
}

interface AgentCardProps {
  name: string
  description: string
  model?: string
}

export function AgentCard({ name, description, model }: AgentCardProps) {
  return (
    <div className="glass-card p-5 my-6 group hover:shadow-glow-sm transition-shadow duration-300">
      <div className="flex items-center justify-between mb-3">
        <code className="text-lg font-mono font-semibold text-ember-400 group-hover:text-glow transition-[text-shadow] duration-300">
          {name}
        </code>
        {model && (
          <span className="text-xs text-obsidian-400 bg-obsidian-800/50 px-2.5 py-1 rounded-lg border border-white/[0.05] font-mono">
            {model}
          </span>
        )}
      </div>
      <p className="text-obsidian-300 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
