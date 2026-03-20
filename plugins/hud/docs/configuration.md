---
title: Configuration
---

# Configuration

Config is stored at `~/.claude/plugins/hud/config.json`. You can edit it directly or use the interactive command:

```
/hud:configure
```

## Presets

Three presets provide starting points. Use `/hud:configure` to select one and then fine-tune individual elements.

| Preset | Activity | Info | Git |
|--------|----------|------|-----|
| **Full** | Tools, Agents, Todos | Counts, Tokens, Usage, Duration | Branch + dirty |
| **Essential** | Tools, Agents, Todos | Duration only | Branch + dirty |
| **Minimal** (default) | — | — | Branch + dirty |

All presets include the always-on core: model name and context bar.

## Layouts

### Expanded (default)

Splits the display into semantic lines:

```
[Opus | Pro] │ my-project git:(main*)
Context ████░░░░░ 45% │ Usage ██░░░░░░░░ 25% (1h 30m / 5h)
◐ Edit: file.ts | ✓ Read ×3
▸ Fix auth bug (2/5)
```

### Compact

Everything on a single line:

```
[Opus | Pro] ████░░░░░ 45% | my-project git:(main*) | 5h: 25% | ⏱️ 5m
◐ Edit: file.ts | ✓ Read ×3
```

### Compact + Separators

Same as compact with a visual separator before the activity section:

```
[Opus | Pro] ████░░░░░ 45% | my-project git:(main*) | 5h: 25%
─────────────────────────────────────────────────────
◐ Edit: file.ts | ✓ Read ×3
```

**Layout config:**

| Layout | `lineLayout` | `showSeparators` |
|--------|-------------|-----------------|
| Expanded | `"expanded"` | `false` |
| Compact | `"compact"` | `false` |
| Compact + Separators | `"compact"` | `true` |

## Display Elements

Every element can be toggled independently:

| Element | Config Key | Example |
|---------|------------|---------|
| Tools activity | `display.showTools` | `◐ Edit: file.ts │ ✓ Read ×3` |
| Agent status | `display.showAgents` | `◐ explore [haiku]: Finding code` |
| Todo progress | `display.showTodos` | `▸ Fix bug (2/5 tasks)` |
| Git status | `gitStatus.enabled` | `git:(main* ↑2 ↓1)` |
| Config counts | `display.showConfigCounts` | `2 CLAUDE.md │ 4 rules │ 1 MCP` |
| Token breakdown | `display.showTokenBreakdown` | `(in: 45k, cache: 12k)` |
| Output speed | `display.showSpeed` | `out: 42.1 tok/s` |
| Usage limits | `display.showUsage` | `5h: 25% │ 7d: 10%` |
| Usage bar style | `display.usageBarEnabled` | `██░░ 25% (1h 30m / 5h)` vs `5h: 25%` |
| Session duration | `display.showDuration` | `⏱️ 5m` |

**Always on** (not configurable): model name (`display.showModel`) and context bar (`display.showContextBar`).

## Git Styles

Control how much git information the branch indicator shows:

| Style | Example | Config |
|-------|---------|--------|
| Branch only | `git:(main)` | `showDirty: false, showAheadBehind: false` |
| Branch + dirty | `git:(main*)` | `showDirty: true, showAheadBehind: false` |
| Full details | `git:(main* ↑2 ↓1)` | `showDirty: true, showAheadBehind: true` |
| File stats | `git:(main* !2 +1 ?3)` | `showDirty: true, showFileStats: true` |

## Advanced Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `display.usageThreshold` | `number` | `0` | Only show usage line when >= N% consumed |
| `display.environmentThreshold` | `number` | `0` | Only show environment line when config counts >= N |
| `display.autocompactBuffer` | `string` | `"enabled"` | `"enabled"` shows buffered % (matches `/context` with autocompact on), `"disabled"` shows raw % |
| `pathLevels` | `number` | `1` | Number of directory segments to show (1–3) |

## Example Config

```json
{
  "lineLayout": "expanded",
  "showSeparators": false,
  "pathLevels": 2,
  "display": {
    "showTools": true,
    "showAgents": true,
    "showTodos": true,
    "showUsage": true,
    "usageBarEnabled": true,
    "showDuration": false,
    "showConfigCounts": false,
    "showTokenBreakdown": false,
    "showSpeed": false,
    "usageThreshold": 10,
    "autocompactBuffer": "enabled"
  },
  "gitStatus": {
    "enabled": true,
    "showDirty": true,
    "showAheadBehind": false,
    "showFileStats": false
  }
}
```
