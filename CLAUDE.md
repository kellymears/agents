# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Repository Purpose

Claude Code configuration repository with custom commands and a documentation
site.

## Structure

```
.claude/
├── commands/           # Custom slash commands (e.g., /cpr)
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
