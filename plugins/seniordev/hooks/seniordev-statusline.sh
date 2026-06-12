#!/usr/bin/env bash
flag="$HOME/.claude/.seniordev-active"
[ -f "$flag" ] || exit 0

mode=$(head -n1 "$flag" | tr -d '[:space:]')

if [ -z "$mode" ] || [ "$mode" = "full" ]; then
    printf '\033[38;5;108m[SENIORDEV]\033[0m'
else
    printf '\033[38;5;108m[SENIORDEV:%s]\033[0m' "$(printf '%s' "$mode" | tr '[:lower:]' '[:upper:]')"
fi
