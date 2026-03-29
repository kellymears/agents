#!/usr/bin/env bash
set -euo pipefail

# Project-specific context takes priority
if [[ -f "${CLAUDE_PROJECT_DIR:-.}/.claude/compact-context.txt" ]]; then
  cat "$CLAUDE_PROJECT_DIR/.claude/compact-context.txt"
  exit 0
fi

# Global fallback
if [[ -f "$HOME/.claude/compact-context.txt" ]]; then
  cat "$HOME/.claude/compact-context.txt"
  exit 0
fi

exit 0
