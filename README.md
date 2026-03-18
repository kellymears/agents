# kellymears/agents

Claude Code plugin marketplace — git workflows, research, writing, browser automation, and more.

## Install

Add the marketplace, then install plugins by name:

```
/plugin marketplace add kellymears/agents
/plugin install git@kellymears
```

## Plugins

| Plugin | Description |
|--------|-------------|
| `git` | Commit curation, PR creation, issue filing, and context switching |
| `research` | Deep-dive multi-source research with cited evidence |
| `comms` | Draft emails, Slack messages, blog posts in your voice |
| `playwright-cli` | Browser automation for testing and data extraction |
| `progressive-sim` | Timed progressive coding assessments |
| `sprint-worker` | Batch-process GitHub issues with parallel agents |
| `tdd` | Red-green-refactor TDD cycle |
| `obsidian` | Write notes to Obsidian vaults (configurable path) |

## Documentation Site

The `site/` directory contains a Next.js + MDX documentation site with page-based routing for plugin and skill detail views.

```bash
cd site && npm install && npm run dev
```

### Routes

| Route | Description |
|-------|-------------|
| `/plugins` | Plugin listing |
| `/plugins/[name]` | Plugin detail — skills, commands, install |
| `/plugins/[name]/skills/[skill]` | Skill detail — SKILL.md, reference files, file tree |

### Features

- **Source/rendered toggle** — switch between raw markdown and formatted view; preference persisted to localStorage and applied globally
- **File sidebar** — GitHub-style sidebar for browsing SKILL.md and reference files within a skill
- **Copy as markdown** — copy button on every content block

## Links

- [Documentation Site](https://claude-config-site.netlify.app)
- [Source Code](https://github.com/kellymears/agents)
- [Claude Code](https://claude.ai/code)
