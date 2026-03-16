---
name: git:commits
description: >
  Organize messy git changes into clean, well-scoped conventional commits. Use when the user wants to clean up their commit history, organize uncommitted changes into logical commits, squash or reorganize recent commits, or curate a changeset before pushing. Triggers on phrases like "clean up my commits", "organize these changes", "split this into commits", "curate history", "make my commits cleaner", or any request to restructure git history into atomic, meaningful units.
---

# Git Commit Curator

Transform intermingled changes into a clean series of atomic, conventional commits — each with a clear scope and meaningful message.

## Philosophy

Good commit history tells a story. Each commit should do one thing well, be independently understandable, and build logically on the commits before it. The goal is a history that a future reader can follow without context about the development process.

## Workflow

### 1. Survey

Understand the current state before planning anything.

```bash
git status
git log --oneline -10
git diff --stat
git diff --cached --stat
```

Determine the situation:

- **Uncommitted changes** — unstaged/staged work to organize into commits
- **Recent commits** — a series of commits to consolidate or reorder
- **Mixed** — both uncommitted changes and commits to reorganize

### 2. Categorize

Group changes by logical scope. Each group becomes one commit.

| Type       | When to use                          |
| ---------- | ------------------------------------ |
| `feat`     | New functionality                    |
| `fix`      | Bug correction                       |
| `refactor` | Code improvement, no behavior change |
| `docs`     | README, comments, documentation      |
| `style`    | Formatting, whitespace               |
| `test`     | Adding or updating tests             |
| `chore`    | Build config, dependencies, tooling  |

Scope is the affected area — a package name, module, or component (e.g., `auth`, `ui`, `api`).

### 3. Plan

Draft the commit series before touching anything:

1. List each commit: type, scope, files, and one-line description
2. Verify no commit is too large (doing multiple unrelated things) or too small (trivial standalone change)
3. Confirm the order is logical — foundational changes first, dependent changes after

**Present the plan to the user and wait for confirmation before proceeding.**

### 4. Execute

**For uncommitted changes** — stage and commit in logical groups:

```bash
git add <files-for-commit-1>
git commit -m "type(scope): description"

git add <files-for-commit-2>
git commit -m "type(scope): description"
```

**For reorganizing recent commits** — soft reset to preserve changes, then restage:

```bash
git reset --soft HEAD~N
# Then stage and commit in logical groups as above
```

**Commit message format:**

```
type(scope): concise description

Optional body explaining the "why" if not obvious.
```

Use a HEREDOC to pass multi-line messages:

```bash
git commit -m "$(cat <<'EOF'
type(scope): concise description

Body paragraph here.
EOF
)"
```

### 5. Verify

After all commits are created, show the result:

```bash
git log --oneline -N  # N = number of commits just created
```

Confirm with the user that the history looks right. If they want to push and open a PR, invoke `git:pr`.

### 6. Summarize for teammates

End with a short, plain-language summary the user can share with other contributors — in Slack, a standup, or a PR description. This isn't a commit log restatement; it's a conversational explanation of what changed and why, written so someone unfamiliar with the commits can quickly understand the impact.

Keep it to 2-4 sentences. Lead with the most important change. Mention affected areas without listing every file.

**Example:**

> Fixed a race condition in session expiration that was causing sporadic logouts. Added an outline variant to the button component with theme support. Updated the README to document the new variant.

## Safety Rules

- **Never force push to main/master** — warn and stop
- **Never skip hooks** — no `--no-verify`
- **Preserve work** — use `git stash` before destructive operations
- **Ask before any reset or rebase** — confirm with the user first
- **If a commit fails** due to pre-commit hooks, fix the issue and create a new commit (don't amend the previous one)
- **Don't commit secrets** — skip `.env`, credentials, tokens

## Example

Given mixed changes across auth and UI:

```
M  src/auth/login.ts      (bug fix)
M  src/auth/session.ts    (bug fix)
M  src/ui/button.tsx      (new variant)
M  src/ui/theme.ts        (new variant support)
M  README.md              (updated docs)
```

The plan:

1. `fix(auth): resolve session expiration race condition` — login.ts, session.ts
2. `feat(ui): add outline button variant` — button.tsx, theme.ts
3. `docs: update README with button variant examples` — README.md
