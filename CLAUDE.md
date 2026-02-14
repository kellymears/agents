# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Claude Code configuration repository with custom commands, agents, and a documentation site.

## Structure

```
.claude/
├── commands/           # Custom slash commands (/cpr, /tdd)
├── agents/             # Custom agent definitions (9 agents)
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

### /tdd - Test-Driven Development

Enforces the red-green-refactor cycle. Language-agnostic — works with any tester agent. Write a failing test, make it pass, clean up, repeat.

## Agents

9 custom agents in `.claude/agents/`, symlinked globally to `~/.claude/agents/`.

| Agent | Model | Role |
| --- | --- | --- |
| archivist | sonnet | Git history curator |
| php-tester | sonnet | PHP test specialist (PHPUnit, WP_Mock, Mockery) — discovery-driven, behavior-focused |
| ts-tester | sonnet | TypeScript test specialist (Vitest, Storybook, MSW) — discovery-driven, behavior-focused |
| ruby-tester | sonnet | Ruby/Rails test specialist (RSpec, FactoryBot, VCR) — discovery-driven, behavior-focused |
| project-manager | sonnet | GitHub issue manager via `gh` CLI |
| technical-writer | sonnet | Documentation specialist |
| wordpress-specialist | sonnet | WordPress ecosystem expert (Gutenberg, REST APIs, CPTs, theme.json) |
| roots-specialist | sonnet | Roots ecosystem expert (Bedrock, Sage, Acorn, Bud.js) |
| reviewer | sonnet | Read-only code reviewer |

## Documentation Site

Built with Next.js + MDX. Deployed to Netlify.

```bash
cd site && npm run dev    # Development
cd site && npm run build  # Production build
npx netlify deploy --prod # Deploy to Netlify
```
