# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Claude Code plugin marketplace with reusable plugins for git workflows, research, writing, browser automation, and more.

## Plugin Structure

```
.claude-plugin/marketplace.json    # Master index of all plugins
plugins/{name}/
  .claude-plugin/plugin.json       # Plugin metadata
  skills/{skill-name}/SKILL.md     # Skill definitions + references
  commands/{name}.md               # Command definitions
```

## Documentation Site

Built with Next.js + MDX. Static export deployed to Netlify.

```bash
cd site && npm run dev    # Development
cd site && npm run build  # Production build
npx netlify deploy --prod # Deploy to Netlify
```

### Site Routes

- `/plugins` — plugin list (server component, links to detail pages)
- `/plugins/[name]` — plugin detail page (`generateStaticParams` from marketplace.json)
- `/plugins/[name]/skills/[skill]` — skill detail with file viewer (`generateStaticParams` from plugin skills)

### Key Site Components

- `ViewModeProvider` — global React context for source/rendered toggle, persisted to localStorage
- `MarkdownBlock` — renders markdown as source or formatted HTML (react-markdown + remark-gfm), with copy button
- `SkillFileViewer` — two-panel file browser (sidebar + content) for SKILL.md and reference files
- `Breadcrumb` — server component breadcrumb navigation
