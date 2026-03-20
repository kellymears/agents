---
title: Overview
---

# Claude HUD

A real-time statusline for Claude Code that displays context health, usage limits, git status, tool activity, and agent tracking — all in a compact, always-visible display below your input field.

## Default Layout

The HUD ships with a clean 2-line default:

```
[Opus | Max] │ my-project git:(main*)
Context █████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h)
```

**Line 1** shows the active model, plan tier, project name, and git branch with dirty indicator.

**Line 2** shows context window usage and API rate limit consumption side by side.

## Core Features (Always On)

These are always enabled and cannot be turned off:

- **Model name** — `[Opus]`, `[Sonnet]`, etc.
- **Context bar** — Visual progress bar with percentage: `████░░░░░░ 45%`

The context bar uses native percentage data from Claude Code when available, with automatic fallback to manual calculation for older versions. It accounts for the autocompact buffer so the percentage matches what `/context` reports.

## Optional Features

All optional features are hidden by default. Enable them via `/hud:configure` or by editing `~/.claude/plugins/hud/config.json`:

| Feature | Example | Config Key |
|---------|---------|------------|
| Tools activity | `◐ Edit: file.ts │ ✓ Read ×3` | `display.showTools` |
| Agent status | `◐ explore [haiku]: Finding code` | `display.showAgents` |
| Todo progress | `▸ Fix bug (2/5 tasks)` | `display.showTodos` |
| Git status | `git:(main* ↑2 ↓1)` | `gitStatus.enabled` |
| Usage limits | `5h: 25% │ 7d: 10%` | `display.showUsage` |
| Config counts | `2 CLAUDE.md │ 4 rules │ 1 MCP` | `display.showConfigCounts` |
| Token breakdown | `(in: 45k, cache: 12k)` | `display.showTokenBreakdown` |
| Output speed | `out: 42.1 tok/s` | `display.showSpeed` |
| Session duration | `⏱️ 5m` | `display.showDuration` |

## How It Works

The HUD runs as a statusline command — Claude Code pipes JSON context to stdin on each render cycle. The program parses model info, context window state, and the conversation transcript to extract tool/agent/todo activity, then formats and writes the display to stdout.
