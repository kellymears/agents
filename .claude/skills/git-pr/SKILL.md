---
name: git:pr
description: >
  Open a pull request against the main branch with a conventional commit title and structured body. Use when the user wants to open a PR, create a pull request, submit changes for review, or share a branch with their team. Triggers on phrases like "open a PR", "create a pull request", "submit this for review", "PR this", "send a PR", or any request to open a pull request on GitHub. Also triggers when the user invokes /git:commits or asks to push and open a PR after committing.
---

# Pull Request Creator

Open a well-structured pull request with a conventional commit title, clear change summary, and verification steps — then generate a short announcement the user can share with their team.

## Philosophy

A pull request is a communication tool. The title tells reviewers what kind of change this is at a glance. The body tells them why it matters, what moved, and how to verify it works. Keep it honest and scannable — no filler, no marketing. Reviewers are busy.

## Workflow

### 1. Survey

Understand the current state before drafting anything.

```bash
git branch --show-current
git log --oneline -10
git diff main...HEAD --stat
gh issue list --limit 5 --state open
```

Determine:

- **Current branch** — if on `main` or `master`, ask the user to create or name a branch first
- **Commits on branch** — the full set of commits since diverging from `main` (not just the latest)
- **Files changed** — additions, removals, modifications
- **Related issues** — check branch name, commit messages, and recent open issues for an obvious link

### 2. Draft

Compose the PR title and body before creating anything.

**Title** follows conventional commit format:

```
type(scope): concise description
```

Use the same type/scope conventions as `git:commits`:

| Type       | When to use                          |
| ---------- | ------------------------------------ |
| `feat`     | New functionality                    |
| `fix`      | Bug correction                       |
| `refactor` | Code improvement, no behavior change |
| `docs`     | README, comments, documentation      |
| `style`    | Formatting, whitespace               |
| `test`     | Adding or updating tests             |
| `chore`    | Build config, dependencies, tooling  |

If commits span multiple types, use the most significant one for the title. The body will capture the full picture.

**Body** uses this template:

```markdown
[Two sentence description of change]

Closes: #[ISSUE_ID]

## Why

[Two sentence description of benefit(s)]

## What changed

- [ ] Added: [file] - [description of addition]
- [ ] Removed: [file] - [description of removal]
- [ ] Changed: [file] - [description of change]
- [ ] Formatted: [file] - [description of formatting]

## Verification

- [ ] Proposed verification step
- [ ] This could be running a certain command
- [ ] Opening a page in a web browser and observing a behavior
- [ ] Whatever is needed to gain assurance that the code works
```

Rules for the body:

- **Description**: Two sentences. First sentence states the change. Second sentence adds context or scope.
- **Closes line**: Include only if the PR clearly references an issue. If it seems like it might but you're not sure, ask the user. If there's no related issue, omit the line entirely.
- **Why**: Two sentences explaining the benefit or motivation. Focus on the "so what" — why should a reviewer care?
- **What changed**: One line per meaningful file change. Group by Added/Removed/Changed/Formatted. Skip generated files, lockfiles, and noise. Use checkboxes so reviewers can track their review progress.
- **Verification**: Concrete steps someone can follow to confirm the change works. Be specific — name commands to run, pages to visit, behaviors to observe. These should be actionable, not vague.

### 3. Confirm

Present the draft title and body to the user. Wait for confirmation before creating the PR.

If there's ambiguity about an issue reference, ask now:

> "This looks like it might relate to #42 — should I include `Closes: #42` in the PR body, or is this unrelated?"

### 4. Push and Create

Ensure the branch is pushed to the remote:

```bash
git push -u origin $(git branch --show-current)
```

Create the PR:

```bash
gh pr create --title "type(scope): description" --body "$(cat <<'EOF'
[the body from step 2]
EOF
)"
```

### 5. Announce

After the PR is created, return two things:

1. **The PR URL** so the user can find it
2. **A short announcement** (2-4 sentences) the user can paste into Slack, a team channel, or a release note. Write it in a friendly, straight-forward, and pragmatic tone. Explain what changed and why it matters — no hype, no hedging. Address the audience as peers.

**Example announcement:**

> Opened [#47](url) — we now validate session tokens on every API request instead of only at login. This closes a gap where expired sessions could keep making calls until the next page refresh. Give it a look when you get a chance.

## Safety Rules

- **Never force push** — warn and stop
- **Never skip hooks** — no `--no-verify`
- **Don't open PRs against main from main** — ask the user to branch first
- **Don't commit secrets** — skip `.env`, credentials, tokens
- **Ask before creating** — always confirm the draft with the user
