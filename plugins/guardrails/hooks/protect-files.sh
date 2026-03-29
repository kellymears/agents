#!/usr/bin/env bash
set -euo pipefail

FILE=$(jq -r '.tool_input.file_path' <&0)

# Block .env files (any variant)
if echo "$FILE" | grep -qE '\.env(\.[a-z]+)?$'; then
  echo "Blocked: direct .env file modification. Edit manually or use a template." >&2
  exit 2
fi

# Block .git internals
if echo "$FILE" | grep -q '\.git/'; then
  echo "Blocked: never modify .git internals directly." >&2
  exit 2
fi

# Block credential files
if echo "$FILE" | grep -qE '(credentials|secrets|tokens)\.(json|yaml|yml|toml)$'; then
  echo "Blocked: credential file. Manage secrets manually." >&2
  exit 2
fi

exit 0
