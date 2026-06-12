---
name: seniordev-help
description: >
  Quick-reference card for all seniordev modes, skills, and commands.
  One-shot display, not a persistent mode. Trigger: /seniordev-help,
  "seniordev help", "what seniordev commands", "how do I use seniordev".
---

# Seniordev Help

Display this reference card when invoked. One-shot — do NOT change mode,
write flag files, or persist anything.

## Levels

| Level | Trigger | What change |
|-------|---------|-------------|
| **Lite** | `/seniordev lite` | Build what's asked, name the lazier alternative in one line. |
| **Full** | `/seniordev` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |
| **Ultra** | `/seniordev ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |

Level sticks until changed or session end.

## Skills

| Skill | Trigger | What it does |
|-------|---------|--------------|
| **seniordev** | `/seniordev` | Lazy mode itself. Simplest solution that works. |
| **seniordev-review** | `/seniordev-review` | Over-engineering review: `L42: yagni: factory, one product. Inline.` |
| **seniordev-help** | `/seniordev-help` | This card. |

Codex uses `@seniordev`, `@seniordev-review`, and `@seniordev-help`; Claude Code
uses the slash-command forms above.

## Deactivate

Say "stop seniordev" or "normal mode". Resume anytime with `/seniordev`.
`/seniordev off` also works.

## Configure Default Mode

Default mode = `full`, auto-active every session. Change it:

**Environment variable** (highest priority):
```bash
export SENIORDEV_DEFAULT_MODE=ultra
```

**Config file** (`~/.config/seniordev/config.json`, Windows: `%APPDATA%\seniordev\config.json`):
```json
{ "defaultMode": "lite" }
```

Set `"off"` to disable auto-activation on session start — activate manually
with `/seniordev` when wanted.

Resolution: env var > config file > `full`.

## More

Forked from **ponytail** by Dietrich Gebert — upstream docs + examples:
https://github.com/DietrichGebert/ponytail
