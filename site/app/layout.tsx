import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'kellymears/agents',
  description: "Kelly Mears' personal Claude Code configuration — custom commands, agents, and workflows",
}

function Logo() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="text-foreground"
    >
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen relative overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background">
          <nav className="max-w-4xl mx-auto h-14 px-6 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <Logo />
              <span className="font-sans font-semibold text-foreground tracking-tight">
                kellymears<span className="text-muted-foreground">/</span>agents
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link href="/commands" className="nav-link">
                Commands
              </Link>
              <Link href="/agents" className="nav-link">
                Agents
              </Link>
              <a
                href="https://github.com/kellymears/agents"
                className="nav-link flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Source on GitHub"
              >
                <GithubIcon />
                <span className="hidden sm:inline">Source</span>
              </a>
            </div>
          </nav>
          <div className="h-px bg-border" />
        </header>

        {/* Main content */}
        <main className="relative max-w-4xl mx-auto px-6 pt-8 pb-24">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative border-t border-border">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Logo />
                <span className="font-sans">kellymears/agents</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a
                  href="https://kellymears.me"
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  kellymears.me
                </a>
                <a
                  href="https://github.com/kellymears/agents"
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  href="https://claude.ai/code"
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Claude Code
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
