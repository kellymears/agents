# Claude Code Configuration

Personal Claude Code configuration with custom commands and a documentation site.

## Structure

```
.claude/
├── commands/           # Custom slash commands
└── settings.local.json # Local permission overrides

site/                   # Next.js + MDX documentation site
```

## Custom Commands

### /cpr - Commit, Push, and Pull Request

Complete git workflow: commit with conventional format, push, and create PR.

## Documentation Site

The `site/` directory contains a Next.js documentation site. See `site/README.md` for details.

```bash
cd site && npm install && npm run dev
```

## Archive

See `ARCHIVE.md` for preserved ideas from removed planning documents.
