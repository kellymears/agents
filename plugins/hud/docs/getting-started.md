---
title: Getting Started
---

# Getting Started

## Installation

Install the marketplace, then the plugin:

```bash
# Add the marketplace
/plugin marketplace add kellymears/agents

# Install the HUD plugin
/plugin install hud@kellymears
```

## Setup

Run the setup command inside Claude Code:

```
/hud:setup
```

Setup will:

1. **Detect your platform** — macOS, Linux, or Windows (including WSL)
2. **Find the runtime** — prefers Bun for performance, falls back to Node.js
3. **Generate the statusline command** — dynamically resolves the plugin path so updates are automatic
4. **Write your settings** — merges the `statusLine` config into `~/.claude/settings.json`
5. **Offer optional features** — tools activity, agents & todos, session info

After setup, the HUD appears below your input field immediately.

## Platform Support

| Platform | Shell | Status |
|----------|-------|--------|
| macOS | bash/zsh | Fully supported |
| Linux | bash/zsh | Fully supported |
| Windows | PowerShell | Fully supported |
| WSL | bash/zsh | Supported (use Linux instructions) |

**Runtime requirements**: Node.js 18+ or Bun. The setup command auto-detects which is available.

## Troubleshooting

### Plugin not found after install

Check for a ghost installation — a partially completed install that left orphaned state:

```bash
# Check cache and registry consistency
CACHE=$(ls -d ~/.claude/plugins/cache/kellymears/hud 2>/dev/null && echo "YES" || echo "NO")
REG=$(grep -q "hud" ~/.claude/plugins/installed_plugins.json 2>/dev/null && echo "YES" || echo "NO")
echo "Cache: $CACHE | Registry: $REG"
```

If cache exists but registry doesn't (or vice versa), run `/hud:setup` which will detect and offer to clean up the inconsistency.

### Linux: cross-device filesystem error

If `/tmp` and your home directory are on different filesystems, the plugin install can fail with `EXDEV: cross-device link not permitted`:

```bash
mkdir -p ~/.cache/tmp && TMPDIR=~/.cache/tmp claude /install kellymears/agents
```

### HUD stops working after update

Re-run `/hud:setup`. The generated command uses dynamic path resolution, so it usually survives updates — but runtime path changes (e.g., after a Node.js version switch via nvm/fnm) can break it.

### Windows: "bash not recognized"

Setup generated a bash command but you're on native Windows. Re-run `/hud:setup` — it will detect the platform and generate a PowerShell command instead.
