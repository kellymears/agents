# Claude Code Configuration

Personal Claude Code configuration with custom commands, agents, and a
documentation site.

## Structure

```
.claude/
├── commands/           # Custom slash commands
│   └── cpr.md          # Commit, push, and PR workflow
├── agents/             # Custom agent definitions (11 agents)
│   ├── archivist.md    # Git history curator
│   ├── tester.md       # Test generator & runner
│   ├── project-manager.md  # GitHub issue manager
│   ├── lint-guardian.md    # Lint & format enforcer
│   ├── technical-writer.md # Documentation specialist
│   ├── improvement-scout.md # Autonomous improvement finder
│   ├── architect.md    # Software architect (opus)
│   ├── wordpress-specialist.md # WordPress ecosystem expert
│   ├── dependency-doctor.md # Dependency management
│   ├── reviewer.md     # Code reviewer
│   └── migrator.md     # Migration specialist
└── settings.local.json # Local permission overrides

site/                   # Next.js + MDX documentation site
```

## Custom Commands

### /cpr — Commit, Push, and Pull Request

Complete git workflow command that:

- Commits with conventional format (`type(scope): description`)
- Pushes to remote
- Creates GitHub PR via `gh pr create`

**Commit types:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` |
`chore`

## Agents

### Git & Workflow

| Agent | Model | Description |
|-------|-------|-------------|
| **archivist** | sonnet | Git history curator — organizes changes into clean, well-scoped commits |
| **migrator** | sonnet | Migration specialist — framework upgrades, codemods, CJS→ESM, JS→TS |

### Quality & Review

| Agent | Model | Description |
|-------|-------|-------------|
| **reviewer** | sonnet | Code reviewer — read-only, prioritized feedback (Must Fix / Should Fix / Consider / Praise) |
| **tester** | sonnet | Test generator & runner — vitest, Storybook, PHPUnit with adversarial thinking |
| **lint-guardian** | sonnet | Lint & format enforcer — auto-fixes, monorepo-aware, pre-push checklist |

### Architecture & Design

| Agent | Model | Description |
|-------|-------|-------------|
| **architect** | opus | Software architect — read-only advisor with trade-off matrices (plan mode) |
| **wordpress-specialist** | sonnet | WordPress expert — Gutenberg, Roots, anonymous class hook patterns |

### Maintenance & Operations

| Agent | Model | Description |
|-------|-------|-------------|
| **improvement-scout** | sonnet | Autonomous scanner — security, performance, dependency, and maintainability reports |
| **dependency-doctor** | sonnet | Dependency management — audit, categorize, upgrade safely |

### Documentation & Project Management

| Agent | Model | Description |
|-------|-------|-------------|
| **technical-writer** | sonnet | Documentation specialist — README, API docs, CHANGELOG, MDX pages |
| **project-manager** | sonnet | GitHub issue manager — bugs, features, epics via `gh` CLI |

## Global Installation

Agents are symlinked to `~/.claude/agents/` so edits in this repo are
immediately available globally:

```bash
ln -s /path/to/this/repo/.claude/agents ~/.claude/agents
```

## Documentation Site

The `site/` directory contains a Next.js + MDX documentation site with full
details on commands, agents, and configuration.

```bash
cd site && npm install && npm run dev
```

## Links

- [Documentation Site](https://claude-config-site.netlify.app)
- [Source Code](https://github.com/kellymears/agents)
- [Claude Code](https://claude.ai/code)

## Archive

See `ARCHIVE.md` for preserved ideas from removed planning documents.
