# Claude Code Configuration

Personal Claude Code configuration with custom commands, agents, and a documentation site.

## Structure

```
.claude/
├── commands/           # Custom slash commands
│   ├── cpr.md          # Commit, push, and PR workflow
│   └── tdd.md          # Red-green-refactor TDD cycle
├── agents/             # Custom agent definitions (9 agents)
│   ├── archivist.md    # Git history curator
│   ├── php-tester.md   # PHP test specialist (PHPUnit)
│   ├── ts-tester.md    # TypeScript test specialist (Vitest, Storybook)
│   ├── ruby-tester.md  # Ruby/Rails test specialist (RSpec)
│   ├── project-manager.md  # GitHub issue manager
│   ├── technical-writer.md # Documentation specialist
│   ├── wordpress-specialist.md # WordPress ecosystem expert
│   ├── roots-specialist.md # Roots ecosystem expert
│   └── reviewer.md     # Code reviewer
└── settings.local.json # Local permission overrides

site/                   # Next.js + MDX documentation site
```

## Custom Commands

### /cpr — Commit, Push, and Pull Request

Complete git workflow command that:

- Commits with conventional format (`type(scope): description`)
- Pushes to remote
- Creates GitHub PR via `gh pr create`

**Commit types:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore`

### /tdd — Test-Driven Development

Enforces the red-green-refactor cycle. Language-agnostic discipline that works with any tester agent — write a failing test, make it pass, clean up, repeat.

## Agents

### Git & Workflow

| Agent | Model | Description |
| --- | --- | --- |
| **archivist** | sonnet | Git history curator — organizes changes into clean, well-scoped commits |

### Quality & Review

| Agent | Model | Description |
| --- | --- | --- |
| **reviewer** | sonnet | Code reviewer — read-only, prioritized feedback (Must Fix / Should Fix / Consider / Praise) |
| **php-tester** | sonnet | PHP test specialist — PHPUnit, WP_Mock, Mockery; discovers project infrastructure, applies testing judgment |
| **ts-tester** | sonnet | TypeScript test specialist — Vitest, Storybook, MSW; discovers project infrastructure, applies testing judgment |
| **ruby-tester** | sonnet | Ruby/Rails test specialist — RSpec, FactoryBot, VCR; discovers project infrastructure, applies testing judgment |

### Architecture & Design

| Agent | Model | Description |
| --- | --- | --- |
| **wordpress-specialist** | sonnet | WordPress expert — Gutenberg, REST APIs, CPTs, theme.json, anonymous class hooks |
| **roots-specialist** | sonnet | Roots ecosystem expert — Bedrock, Sage, Acorn, Bud.js, Composer-managed WordPress |

### Documentation & Project Management

| Agent | Model | Description |
| --- | --- | --- |
| **technical-writer** | sonnet | Documentation specialist — README, API docs, CHANGELOG, MDX pages |
| **project-manager** | sonnet | GitHub issue manager — bugs, features, epics via `gh` CLI |

## Global Installation

Agents are symlinked to `~/.claude/agents/` so edits in this repo are immediately available globally:

```bash
ln -s /path/to/this/repo/.claude/agents ~/.claude/agents
```

## Documentation Site

The `site/` directory contains a Next.js + MDX documentation site with full details on commands, agents, and configuration.

```bash
cd site && npm install && npm run dev
```

## Links

- [Documentation Site](https://claude-config-site.netlify.app)
- [Source Code](https://github.com/kellymears/agents)
- [Claude Code](https://claude.ai/code)

## Archive

See `ARCHIVE.md` for preserved ideas from removed planning documents.
