# Claude Code Configuration

Personal Claude Code configuration with custom commands, agents, and a
documentation site.

## Structure

```
.claude/
├── commands/           # Custom slash commands
│   └── cpr.md          # Commit, push, and PR workflow
├── agents/             # Custom agent definitions
│   └── archivist.md    # Git history curator
└── settings.local.json # Local permission overrides

site/                   # Next.js + MDX documentation site
```

## Custom Commands

### /cpr - Commit, Push, and Pull Request

Complete git workflow command that:

- Commits with conventional format (`type(scope): description`)
- Pushes to remote
- Creates GitHub PR via `gh pr create`

**Commit types:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` |
`chore`

## Custom Agents

### Archivist

A git history curator that organizes messy changes into clean, well-scoped
commits. Use when you need to:

- Organize uncommitted changes into logical commits
- Consolidate or reorder recent commits
- Create a clean commit history before opening a PR

## Documentation Site

The `site/` directory contains a Next.js + MDX documentation site with full
details on commands, agents, and configuration.

```bash
cd site && npm install && npm run dev
```

## Links

- [Documentation Site](https://github.com/kellymears/agents)
- [Claude Code](https://claude.ai/code)

## Archive

See `ARCHIVE.md` for preserved ideas from removed planning documents.
