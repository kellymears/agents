# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Repository Purpose

Claude Code configuration repository with custom commands, agents, and a
documentation site.

## Structure

```
.claude/
├── commands/           # Custom slash commands (e.g., /cpr)
├── agents/             # Custom agent definitions (11 agents)
└── settings.local.json # Local permission overrides

site/                   # Next.js + MDX documentation site
```

## Custom Commands

### /cpr - Commit, Push, and Pull Request

A complete git workflow command that:

- Commits with conventional commit format (`type(scope): description`)
- Pushes to remote
- Creates a GitHub PR via `gh pr create`

Commit types: `feat|fix|docs|style|refactor|test|chore`

## Agents

11 custom agents in `.claude/agents/`, symlinked globally to `~/.claude/agents/`.

| Agent | Model | Role |
|-------|-------|------|
| archivist | sonnet | Git history curator |
| tester | sonnet | Test generator & runner (vitest, Storybook, PHPUnit) |
| project-manager | sonnet | GitHub issue manager via `gh` CLI |
| lint-guardian | sonnet | Lint & format enforcer |
| technical-writer | sonnet | Documentation specialist |
| improvement-scout | sonnet | Read-only improvement scanner |
| architect | opus | Software architect (plan mode) |
| wordpress-specialist | sonnet | WordPress ecosystem expert |
| dependency-doctor | sonnet | Dependency management |
| reviewer | sonnet | Read-only code reviewer |
| migrator | sonnet | Migration specialist |

## Documentation Site

Built with Next.js + MDX. Deployed to Netlify.

```bash
cd site && npm run dev    # Development
cd site && npm run build  # Production build
npx netlify deploy --prod # Deploy to Netlify
```
