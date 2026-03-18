---
name: git:work
description: >
  Start working on an issue, PR, or idea — handles branch creation, context switching, and uncommitted changes. Use when the user wants to work on something, pick up an issue, switch to a PR, resume work, start a task, or context switch. Triggers on phrases like "work on", "pick up", "start", "switch to", "resume", "grab that issue", "context switch", "let me work on #N", "check out PR #N", or any request to begin or resume work on a specific item.
---

# Work Starter

Start working on an issue, PR, or idea — routing to the right branch with the right context, handling uncommitted changes along the way.

## Philosophy

The hardest part of context switching is the first five minutes: finding the issue, figuring out if someone already started a branch, stashing your current work, checking out, and re-orienting. This skill pays that tax for you.

It should feel like opening a door, not filling out a form. When in doubt, ask — but never ask what you can look up.

## Workflow

### 1. Detect Intent

Parse the user's input to determine what they want to work on:

- **Number** (`#N` or just `N`) — could be an issue or a PR. Disambiguate with a single API call:

```bash
gh api repos/{owner}/{repo}/issues/<N> --jq '.pull_request // empty'
```

If the `pull_request` field is present, it's a PR — route to step 3. If empty, it's an issue — route to step 2.

- **Not a number** — a description or search query. Route to step 4.

Get the owner/repo from the current git remote:

```bash
gh repo view --json nameWithOwner --jq '.nameWithOwner'
```

### 2. Issue Path

The user wants to work on issue `#N`.

**Fetch the issue:**

```bash
gh issue view <N> --json title,body,labels,assignees,state,url
```

If the issue is closed, mention it and ask whether to proceed anyway.

**Search for existing PRs or branches targeting this issue:**

```bash
gh pr list --state open --search "<N>" --json number,title,headRefName,url
git branch -a | grep <N>
```

If a PR or branch already exists, present the findings:

> "Found PR #42 on branch `fix/17-session-bug` targeting this issue. Want to check out that branch, or start fresh?"

Wait for the user's choice. If they choose the existing branch, handle uncommitted changes (step 5), then check out.

**If no existing branch — create one:**

Derive the branch name from the issue:

| Issue label or type      | Branch prefix |
| ------------------------ | ------------- |
| `bug`                    | `fix/`        |
| `feature`, `enhancement` | `feat/`       |
| `documentation`, `docs`  | `docs/`       |
| default                  | `chore/`      |

Branch format: `<prefix><N>-<slug>` where slug is a 3-5 word kebab-case summary of the issue title.

Check that the branch doesn't already exist:

```bash
git branch -a | grep <N>
```

Handle uncommitted changes (step 5), then create the branch:

```bash
git checkout -b <branch-name> main
```

**Orient the user** — summarize the issue in 2-3 sentences so they can start working without reading the full thread. Mention acceptance criteria if present.

### 3. PR Path

The user wants to pick up or resume PR `#N`.

**Fetch PR details:**

```bash
gh pr view <N> --json title,body,state,headRefName,baseRefName,url,reviewDecision,reviews,comments,commits,labels
```

If the PR is merged or closed, mention it and ask whether to proceed.

Handle uncommitted changes (step 5), then checkout:

```bash
gh pr checkout <N>
git pull
```

**Summarize recent activity** to orient the user:

- Review status: approvals, requested changes, pending reviews
- Recent comments: who said what (conversational tone, not a list dump)
- Commit count and last commit date

Use calibrated language:

- If there's activity: "@alice approved, @bob requested changes about the error handling in `auth.ts`"
- If no activity: "No reviews or comments yet — you're the first one here."

### 4. Description Path

The user described what they want to work on without a number. Search for matching issues and PRs:

```bash
gh issue list --state open --limit 10 --search "<keywords>"
gh pr list --state open --limit 10 --search "<keywords>"
```

Present findings with **calibrated confidence**:

- **Strong match** (1-2 obvious hits): "This looks like #23 — 'Add rate limiting to public API'. Want to work on that?"
- **Ambiguous** (several partial matches): "Found a few that might be related:" then list them briefly.
- **No match**: "I don't see anything matching that in open issues or PRs."

Regardless of search quality, always present these options:

- **(a)** Work on a surfaced item — routes to step 2 (issue) or step 3 (PR)
- **(b)** Create a new issue first with `git:issue`, then branch from it
- **(c)** Create a bespoke branch — no issue, no PR, just a working branch

Options (b) and (c) are always visible. This skill is a router, not a gatekeeper.

For option (c), ask for a short description and create a branch using the same naming convention (e.g., `feat/add-rate-limiting`), handle uncommitted changes (step 5), then create the branch from `main`.

### 5. Handle Uncommitted Changes

Before any branch switch, check for uncommitted work:

```bash
git status --porcelain
```

If the working tree is clean, proceed silently.

If there are uncommitted changes, show what's pending:

```bash
git diff --stat
```

Then present options:

- **(a) Stash** (safe default) — stash with a descriptive message:

```bash
git stash push -m "git:work auto-stash from <current-branch> — <YYYY-MM-DD>"
```

- **(b) Commit** — invoke `git:commits` to organize and commit the changes, then resume the branch switch.

- **(c) Discard** — requires explicit second confirmation ("This will permanently delete uncommitted changes. Are you sure?"). Only then:

```bash
git checkout -- .
git clean -fd
```

If the user doesn't choose, default to (a) stash.

## Safety Rules

- **Never force push** — warn and stop
- **Never skip hooks** — no `--no-verify`
- **Never discard without confirmation** — require explicit second confirmation before `git checkout -- .` or `git clean`
- **Never switch silently with uncommitted changes** — always check and handle first
- **Check for existing branches** before creating — avoid duplicates
- **Use descriptive stash messages** — include source branch and date so stashes are findable
- **Don't commit secrets** — skip `.env`, credentials, tokens

## Examples

**Issue path:**

User: "work on #17" → Fetch issue #17, find no existing branch, create `fix/17-session-timeout-bug` from main, summarize the issue.

**PR path:**

User: "pick up PR #42" → Fetch PR #42, checkout the branch, pull latest, summarize: "@alice approved, one comment from @bob about test coverage."

**Description with match:**

User: "I want to work on the rate limiting feature" → Search finds issue #23 "Add rate limiting to public API". Present it as a strong match with options to work on it, create a new issue, or branch without an issue.

**Description with no match:**

User: "start on the new onboarding flow" → Search returns nothing. Say so, then offer: (a) create an issue with `git:issue` first, or (b) create a bespoke branch `feat/new-onboarding-flow`.

**Uncommitted changes:**

User: "switch to #17" (while on `feat/12-dashboard` with uncommitted changes) → Show `git diff --stat`, offer stash/commit/discard. User picks stash → `git stash push -m "git:work auto-stash from feat/12-dashboard — 2026-03-10"`, then proceed with checkout.
