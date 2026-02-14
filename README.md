# Claude Code Configuration

Personal Claude Code configuration with custom commands, agents, and a documentation site.

## Global Installation

Agents are symlinked to `~/.claude/agents/` so edits in this repo are immediately available globally:

```bash
ln -s /path/to/this/repo/.claude/agents ~/.claude/agents
```

Commands are symlinked to `~/.claude/commands/` so edits in this repo are immediately available globally:

```bash
ln -s /path/to/this/repo/.claude/commands ~/.claude/commands
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
