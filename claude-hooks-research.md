---
title: "Claude Code Hooks — Personalized Recommendations for Kelly Mears"
date: "2026-03-28"
sources: 6
verified: 4
domain: "developer tooling"
---

# Claude Code Hooks — What You Should Be Using

A personalized guide to Claude Code hooks based on your stack (JS/TS/PHP/Shell), your conventions (Prettier, ESLint, strict TypeScript, conventional commits), your plugin ecosystem (git, research, comms, HUD, memory bridge), and your philosophy (DX-first, modular, tools-for-tools-makers).

## Current State

You have exactly one hook configured:

```json
"hooks": {
  "SessionStart": [{
    "matcher": "",
    "hooks": [{
      "type": "command",
      "command": "/Users/kellymears/code/git/kellymears/claude-memory-bridge/scripts/check-inbox.sh"
    }]
  }]
}
```

This is the memory bridge inbox checker — it scans for pending items from Claude Desktop and injects them as context. It's well-built: structured JSON output, `suppressOutput: true` to keep the terminal clean, silent exit when nothing is pending. Good foundation.

Everything below builds on this.

### Plugin Implementation

These hooks are packaged as plugins in the `kellymears/agents` marketplace:

- **Git safety rails** → `plugins/git/hooks/` (added to existing git plugin, v1.1.0)
- **Everything else** → `plugins/guardrails/hooks/` (new plugin, v1.0.0)

Enable them in your settings:

```json
{
  "enabledPlugins": {
    "git@kellymears": true,
    "guardrails@kellymears": true
  }
}
```

---

## Recommended Hooks

Organized by purpose, from highest-value to nice-to-have. Each recommendation includes the *why* — which of your patterns it reinforces — and the exact configuration.

### 1. Auto-Format on Edit/Write (PostToolUse)

**Why this matters for you:** You enforce Prettier with `printWidth: 80`, 2-space tabs, LF endings across your projects. Claude generally respects formatting, but Edit operations that insert or modify lines can drift from your config — especially in JSX/TSX where Prettier's line-breaking decisions are non-trivial. Running Prettier after every file modification means you never have to think about it.

**What it does:** After any Edit or Write tool call succeeds, extracts the file path and runs Prettier on it. Silent on success, logs on failure (doesn't block Claude).

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'FILE=$(jq -r \".tool_input.file_path\"); npx prettier --write \"$FILE\" 2>/dev/null || true'",
          "timeout": 15,
          "statusMessage": "Formatting..."
        }
      ]
    }
  ]
}
```

**Scope:** Global (`~/.claude/settings.json`). You want this everywhere — agents repo, Carrot, personal projects.

**Edge cases:**
- Files without a Prettier config get Prettier defaults, which are close to yours. Acceptable.
- Binary files and non-formattable extensions: Prettier exits silently. The `|| true` ensures exit 0.
- The `2>/dev/null` suppresses Prettier's "no parser" warnings for files it can't handle.

---

### 2. Git Safety Rails (PreToolUse)

**Why this matters for you:** You have a git-centric workflow — four git-related skills (commits, PR, issue, work), conventional commit conventions, multi-branch development across kellymears/* and oncarrot/*. Force pushes, `--no-verify`, and `reset --hard` are the kind of footguns that lose work quietly. Your CLAUDE.md already tells Claude not to do these things, but hooks enforce it at the harness level — instructions can be lost to compaction, hooks can't.

**What it does:** Blocks force push, `--no-verify`, `reset --hard`, and `checkout .` / `restore .` on all Bash commands that start with `git`.

**Script** (`plugins/git/hooks/validate-git.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

COMMAND=$(jq -r '.tool_input.command' <&0)

# Force push — loses remote history
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*(-f|--force)'; then
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
```

**Configuration:**

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "if": "Bash(git *)",
          "command": "\"${CLAUDE_PLUGIN_ROOT}\"/hooks/validate-git.sh"
        }
      ]
    }
  ]
}
```

**Scope:** Global. These rules apply everywhere.

**Why `if` instead of parsing in the script:** The `if: "Bash(git *)"` field means the hook process only spawns for git commands. Every other Bash call (npm, make, ls) skips the hook entirely — zero overhead.

---

### 3. Block Sensitive File Edits (PreToolUse)

**Why this matters for you:** You work across multiple projects with different credentials — Carrot has its own config at `~/.claude-carrot`, your projects have `.env` files, there's Obsidian vault paths and API tokens. Claude should never write to `.env`, `.env.local`, credentials files, or anything in `.git/`.

**What it does:** Blocks Edit and Write operations on sensitive file patterns.

**Script** (`plugins/guardrails/hooks/protect-files.sh`):

```bash
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
```

**Configuration:**

```json
{
  "PreToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "\"${CLAUDE_PLUGIN_ROOT}\"/hooks/protect-files.sh"
        }
      ]
    }
  ]
}
```

**Scope:** Global.

---

### 4. Context Recovery After Compaction (SessionStart)

**Why this matters for you:** You run on Opus with 1M context and `effortLevel: high`, which means long sessions. When compaction fires, Claude loses nuance — project-specific conventions, in-progress decisions, the feedback you've given this session. Your memory bridge handles cross-session persistence, but within-session compaction recovery is a different problem.

**What it does:** When a session resumes after compaction, injects a brief context reminder. You can customize the content per-project using `.claude/compact-context.txt` files, falling back to a global default.

**Script** (`plugins/guardrails/hooks/restore-context.sh`):

```bash
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

# Nothing to inject
exit 0
```

**Configuration:**

```json
{
  "SessionStart": [
    {
      "matcher": "compact",
      "hooks": [
        {
          "type": "command",
          "command": "\"${CLAUDE_PLUGIN_ROOT}\"/hooks/restore-context.sh"
        }
      ]
    }
  ]
}
```

**Scope:** Global. Per-project overrides live in the project's `.claude/compact-context.txt`.

**Example `compact-context.txt` for the agents repo:**

```
Context recovery: you're working in kellymears/agents — the Claude Code plugin marketplace.
Key conventions: plugins live in plugins/{name}/, skills in skills/{skill-name}/SKILL.md.
The site is Next.js + MDX at site/, deployed to Netlify.
All blockquote asides must have bold typed headings (★ Insight, ★ TMYK, etc).
```

---

### 5. ESLint After TypeScript Changes (PostToolUse)

**Why this matters for you:** You run strict TypeScript with ESLint across your projects. Prettier handles formatting, but ESLint catches actual problems — unused imports, type errors that `tsc` would catch but Claude might miss, React hook dependency issues in your Next.js site. Running it after TS/TSX changes catches these before they accumulate.

**What it does:** After Edit/Write on TypeScript files, runs ESLint with `--fix`. Non-blocking — if ESLint fails, the error is logged but Claude continues.

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "if": "Edit(*.ts)|Edit(*.tsx)|Write(*.ts)|Write(*.tsx)",
          "command": "bash -c 'FILE=$(jq -r \".tool_input.file_path\"); npx eslint --fix \"$FILE\" 2>/dev/null || true'",
          "timeout": 30,
          "statusMessage": "Linting..."
        }
      ]
    }
  ]
}
```

**Scope:** Global. Projects without ESLint configs: the command exits silently (no config = no lint).

**Why separate from Prettier:** Prettier runs on all files. ESLint only runs on TS/TSX. Different tools, different scopes, different `if` filters. Keeping them as separate hooks means you can disable one without touching the other.

---

### 6. Package.json Watcher (FileChanged)

**Why this matters for you:** Your plugin work involves frequent dependency changes — you're managing 9 plugins plus a Next.js site, each with their own dependencies. When `package.json` changes (from a manual edit, a merge, or Claude adding a dependency), the environment should know about it.

**What it does:** Watches `package.json` and logs the change. A practical place to add `npm install` auto-runs if you want them later.

```json
{
  "FileChanged": [
    {
      "matcher": "package.json",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'echo \"[$(date +%H:%M:%S)] package.json changed in $CLAUDE_PROJECT_DIR\" >> \"$HOME/.claude/file-changes.log\"'"
        }
      ]
    }
  ]
}
```

**Scope:** Global. Light-touch — just logging for now.

**Why not auto-install:** Auto-running `npm install` on every package.json change would slow things down during multi-dependency additions and could interfere with in-progress work. The log gives you awareness; you decide when to install.

---

### 7. Subagent Context Injection (SubagentStart)

**Why this matters for you:** You have experimental agent teams enabled and you spawn Explore/Plan agents regularly. Subagents don't inherit the full conversation context — they get a prompt and tools, but they don't know your conventions, your project structure shortcuts, or in-progress decisions. A SubagentStart hook can inject a brief orientation.

**Script** (`plugins/guardrails/hooks/subagent-context.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

# Read project-specific subagent context if available
CONTEXT_FILE="${CLAUDE_PROJECT_DIR:-.}/.claude/subagent-context.txt"
if [[ -f "$CONTEXT_FILE" ]]; then
  CONTEXT=$(cat "$CONTEXT_FILE" | jq -Rs .)
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"SubagentStart\",\"additionalContext\":${CONTEXT}}}"
  exit 0
fi

exit 0
```

**Configuration:**

```json
{
  "SubagentStart": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "command": "\"${CLAUDE_PLUGIN_ROOT}\"/hooks/subagent-context.sh"
        }
      ]
    }
  ]
}
```

**Scope:** Global. Per-project overrides via `.claude/subagent-context.txt`.

---

## Hooks You Should NOT Add

Your philosophy is DX-first and minimal — three similar lines of code is better than a premature abstraction. The same principle applies to hooks. Here's what I considered and rejected:

### Stop hooks (quality gates)

A Stop hook that runs `npm test` before Claude can finish sounds appealing but has real problems:
- **Not every conversation involves code changes.** Research, comms, planning — these don't need test verification.
- **Infinite loop risk.** If the Stop hook blocks and Claude can't fix the test, you're stuck. The `stop_hook_active` guard prevents infinite recursion but the failure mode is still bad UX.
- **You already have this covered.** Your CLAUDE.md instructions + the TDD plugin handle test-driven workflows when you want them. A global Stop hook is a blunt instrument for a scalpel problem.

### UserPromptSubmit hooks

Filtering or modifying your own prompts before Claude sees them adds a layer of indirection for zero gain. You know what you're typing.

### TypeScript type-checking after every edit

Running `npx tsc --noEmit` after every file change is too slow (full project type-check) and too noisy (cascading errors during multi-file refactors). Let Claude finish its work, then run `tsc` once. Your existing `Bash(npx tsc:*)` permission already makes this easy to do on demand.

### Notification hooks (desktop alerts)

macOS notification hooks seem useful but you're already in the terminal (Ghostty) watching Claude work. The HUD plugin gives you real-time status. A notification bubble adds noise without information.

### PermissionRequest auto-approve hooks

Auto-approving permissions defeats the safety model. Your current `permissions.allow` list in settings.json is the right approach — explicit, auditable, scoped. A hook that auto-approves based on heuristics is a security regression.

---

## Plugin Layout

These hooks are distributed as two plugins in the `kellymears/agents` marketplace:

### `git` plugin (v1.1.0) — git safety rails

```
plugins/git/
├── .claude-plugin/plugin.json
├── hooks/
│   ├── hooks.json              ← PreToolUse for Bash(git *)
│   └── validate-git.sh         ← blocks force push, --no-verify, reset --hard
└── skills/
    └── (existing git-commits, git-pr, git-issue, git-work)
```

### `guardrails` plugin (v1.0.0) — code quality hooks

```
plugins/guardrails/
├── .claude-plugin/plugin.json
└── hooks/
    ├── hooks.json              ← all non-git hooks
    ├── protect-files.sh        ← blocks .env, .git/, credential files
    ├── restore-context.sh      ← re-injects context after compaction
    └── subagent-context.sh     ← injects project context into subagents
```

### Per-Project Context Files

These are optional files you create in individual projects to customize hook behavior:

| File | Path | Purpose |
|------|------|---------|
| `compact-context.txt` | Per-project `.claude/compact-context.txt` | Project-specific compaction recovery context |
| `subagent-context.txt` | Per-project `.claude/subagent-context.txt` | Project-specific subagent orientation |

---

## How These Hooks Interact With Your Existing Setup

| Existing Feature | Hook Interaction |
|-----------------|-----------------|
| **Memory bridge** (`check-inbox.sh`) | Unchanged. The new SessionStart `compact` hook is a separate matcher group — both fire on their respective triggers, never conflicting. |
| **HUD plugin** (statusline) | `statusMessage` fields on PostToolUse hooks give the HUD something to display during formatting/linting. |
| **Git skills** (commits, PR, work) | The `validate-git.sh` hook protects against the same operations your CLAUDE.md warns about, but at the harness level. Skills that run normal git operations (add, commit, push) pass through unblocked. |
| **Permissions allow list** | Hooks and permissions are complementary. Your `Bash(npx prettier:*)` permission lets Prettier run without prompting. The PostToolUse hook calls Prettier automatically. No conflict. |
| **Agent teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`) | SubagentStart hook injects context into all spawned agents. This is particularly useful when agent teams spawn multiple subagents that each need project awareness. |

---

## Confidence Assessment

| Dimension | Tier | Assessment |
|-----------|------|------------|
| Source Quality | **Strong** | Official Claude Code hooks documentation (2 pages retrieved and verified), plus direct inspection of your settings.json and existing hook scripts |
| Consensus | **Settled** | Hook configuration is deterministic — the docs define the contract. Recommendations are opinionated but grounded in your observed patterns. |
| Recency | **Current** | Documentation fetched 2026-03-28. Hooks API is stable since v2.1.85+ (introduced `if` field). |
| Domain Familiarity | **Deep** | Claude Code hooks are core product documentation with thorough training data coverage. Your specific setup was verified by reading actual config files. |
| Evidence | **Robust** | Recommendations based on: (1) official docs, (2) your actual settings.json, (3) your GitHub profile and language usage, (4) your CLAUDE.md conventions, (5) your plugin ecosystem |

---

## Methodology

**Research approach:**
1. Retrieved official Claude Code hooks documentation from `docs.anthropic.com` (redirected to `code.claude.com/docs/en/hooks` and `hooks-guide`)
2. Read your `~/.claude/settings.json` to understand existing configuration
3. Read `check-inbox.sh` to understand your hook scripting patterns
4. Analyzed your GitHub profile (57 public repos, 90 gists) for language distribution and project patterns
5. Read project CLAUDE.md files for convention context
6. Cross-referenced hook capabilities against your specific stack and workflows

**Limitations:**
- Could not access private repos or the Carrot codebase (`oncarrot/app`) — recommendations for that context are inferred from your global settings
- Hook behavior was verified against documentation, not runtime testing — all scripts should be tested locally before deploying

---

## Sources & Citations

[1] Claude Code. "Hooks Reference." code.claude.com/docs/en/hooks. Retrieved 2026-03-28. [VERIFIED]

[2] Claude Code. "Hooks Guide." code.claude.com/docs/en/hooks-guide. Retrieved 2026-03-28. [VERIFIED]

[3] Kelly Mears. `~/.claude/settings.json`. Local file, read 2026-03-28. [VERIFIED]

[4] Kelly Mears. `claude-memory-bridge/scripts/check-inbox.sh`. Local file, read 2026-03-28. [VERIFIED]

[5] GitHub API. `users/kellymears` and `users/kellymears/repos`. Retrieved 2026-03-28. [RETRIEVED]

[6] Claude Code hook execution model — exit codes, stdin/stdout protocol, matcher semantics. [TRAINING DATA — consistent with retrieved documentation]
