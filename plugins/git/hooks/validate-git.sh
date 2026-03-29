#!/usr/bin/env bash
set -euo pipefail

COMMAND=$(jq -r '.tool_input.command' <&0)

# Force push — loses remote history
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*(-f|--force)\b'; then
  echo "Blocked: force push. Use --force-with-lease if you really need this." >&2
  exit 2
fi

# Skip hooks — bypasses pre-commit safety
if echo "$COMMAND" | grep -q -- '--no-verify'; then
  echo "Blocked: --no-verify bypasses pre-commit hooks. Fix the hook failure instead." >&2
  exit 2
fi

# Hard reset — discards uncommitted work
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo "Blocked: reset --hard discards uncommitted changes. Stash first." >&2
  exit 2
fi

# Blanket restore/checkout — discards all unstaged changes
if echo "$COMMAND" | grep -qE 'git\s+(checkout|restore)\s+\.$'; then
  echo "Blocked: this discards all unstaged changes. Be specific about which files." >&2
  exit 2
fi

exit 0
