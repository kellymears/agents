#!/usr/bin/env bash
set -euo pipefail

CONTEXT_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/subagent-context.txt"

if [[ -f "$CONTEXT_FILE" ]]; then
  CONTEXT=$(jq -Rs . < "$CONTEXT_FILE")
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"SubagentStart\",\"additionalContext\":${CONTEXT}}}"
  exit 0
fi

exit 0
