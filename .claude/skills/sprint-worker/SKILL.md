---
name: sprint-worker
description: Batch-process GitHub issues using parallel agents. Use when the user wants to automate implementation of a set of issues.
allowed-tools: Bash(gh:*), Bash(git:*), Bash(jq:*), Bash(make:*), Bash(dcr:*), Bash(docker:*)
---

# Sprint Worker

Batch-process GitHub issues using parallel agents. The user provides a list of issue numbers, and agents implement each one — creating draft PRs, self-reviewing, and reporting results.

## Phase 1: Prerequisites & Issue Gathering

### 1.1 Auth Check

Verify GitHub CLI is authenticated:

```bash
gh auth status 2>&1
```

If authentication fails, tell the user to run `gh auth login` and re-invoke `/sprint-worker`.

### 1.2 Get Current User

```bash
GITHUB_USER=$(gh api user --jq '.login')
```

### 1.3 Collect Issue Numbers

If the user provided issue numbers as arguments (e.g., `/sprint-worker 8601 8590 8575`), use those directly.

If no arguments were provided, use `AskUserQuestion` to ask:

> Which issue numbers should I work on? (space or comma-separated, e.g. `8601, 8590, 8575`)

Parse the response into a list of issue numbers (strip `#` prefixes if present).

### 1.4 Fetch Issue Details

For each issue number, get type and metadata:

```bash
gh api "/repos/oncarrot/app/issues/<N>" --jq '{
  number,
  title,
  type: .type.name,
  labels: [.labels[].name],
  pull_request: .pull_request
}'
```

### 1.5 Filter

**Include** issues with type: `Story`, `Task`, or `Bug`.

**Exclude** issues that:

- Already have a linked PR (`.pull_request` is non-null)
- Have the `🤖 AI-Completed` label
- Have the `🤝 AI-Assisted` label

Report any excluded issues and the reason to the user.

### 1.6 Present Confirmation

Display a table of eligible issues to the user:

| #    | Type  | Title              | Points |
| ---- | ----- | ------------------ | ------ |
| 8601 | Bug   | fix(editor): ...   | 2      |
| 8590 | Story | feat(preview): ... | 3      |

Use `AskUserQuestion` to ask:

1. **Which issues to include** — default: all listed issues
2. **Concurrency limit** — default: 3, max: 5

If no eligible issues remain after filtering, report that and stop.

## Phase 2: Team Orchestration

### 2.1 Create Team

```
TeamCreate with team_name: "sprint-worker"
```

### 2.2 Create Tasks

For each confirmed issue, create a task via `TaskCreate` with:

- **subject**: `Implement #<N>: <title>`
- **description**: The full agent prompt from Phase 3 with the issue number interpolated
- **activeForm**: `Implementing #<N>`

### 2.3 Spawn Workers

For each issue (up to concurrency limit), spawn a `general-purpose` Task agent:

```
Task with:
  subagent_type: "general-purpose"
  team_name: "sprint-worker"
  name: "worker-<N>"
  prompt: <full agent prompt from Phase 3>
```

### 2.4 Monitor Progress

- Track via `TaskList` and idle notifications
- As workers complete, spawn the next batch (if any remain)
- Workers send messages to team lead with PR URLs and status

## Phase 3: Agent Prompt

Each spawned worker agent receives this prompt (with `ISSUE_NUMBER`, `GITHUB_USER`, and `ISSUE_TITLE` interpolated):

---

You are a sprint worker agent implementing GitHub issue #ISSUE_NUMBER for the Carrot WordPress application.

**Your goal**: Implement the issue, create a draft PR, self-review, and report back.

### Step 1: Read Project Guidelines

Read these files to understand coding standards and architecture:

- `AGENTS.md`
- `AGENTS_ORG.md`
- `ARCHITECTURE.md`
- `ISSUE_STANDARDS.md`

### Step 2: Read and Validate Issue

```bash
gh issue view ISSUE_NUMBER
```

Verify the issue has these required sections (per ISSUE_STANDARDS.md):

- `## Summary`
- `## Acceptance Criteria` or `## Definition of Done` with `- [ ]` items
- `## Scope Boundary` with "Out of scope" items
- At least one file path reference

**If the issue is underspecified** (missing 2+ required sections): message the team lead explaining what's missing, mark your task as completed with a skip note, and stop. Do NOT guess at requirements.

### Step 3: Explore Codebase

- Read all files listed in `## Code Location` and `## Files to Modify`
- Grep for related functions, hooks, classes referenced in the issue
- Understand existing patterns before making changes

### Step 4: Plan

Determine the minimal set of changes that satisfy ALL acceptance criteria while staying within the scope boundary. Do not touch anything listed as "Out of scope".

### Step 5: Create Branch

Determine branch name from issue type:

- Bug → `fix/ISSUE_NUMBER-<slug>`
- Story → `feat/ISSUE_NUMBER-<slug>`
- Task → `chore/ISSUE_NUMBER-<slug>`

Where `<slug>` is a short kebab-case summary (max 5 words) derived from the title.

First check if the branch already exists:

```bash
git branch -a | grep ISSUE_NUMBER
```

If it exists, append `-v2`, `-v3`, etc.

Create and switch to the branch from master:

```bash
git checkout -b <branch-name> master
```

### Step 6: Implement

Make focused changes following project standards:

- **PHP**: PSR-12, PHP 8.0-8.4 compatible, no deprecation warnings, short arrays
- **JS/TS**: Prettier (single quotes, 2-space indent, trailing commas, semicolons, 80 char width)
- **WordPress**: Sanitize/escape output, use nonces for forms, consider multisite context
- **General**: Guard clauses over deep nesting, small focused functions, DRY

### Step 7: Lint

Run linters and fix any errors:

```bash
# PHP files changed
dcr --no-deps web ./vendor/bin/phpcs <changed-php-files>

# JS/TS files changed
npx prettier --check <changed-js-ts-files>
npx prettier --write <changed-js-ts-files>  # auto-fix if needed
```

### Step 8: Commit

Use conventional commit format: `type(scope): #ISSUE_NUMBER description`

Stage specific files only (never `git add -A` or `git add .`):

```bash
git add <specific-files>
git commit -m "$(cat <<'EOF'
type(scope): #ISSUE_NUMBER description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### Step 9: Push and Create Draft PR

```bash
git push -u origin <branch-name>
```

Create draft PR:

```bash
gh pr create --draft \
  --assignee GITHUB_USER \
  --label "🤖 AI-Completed" \
  --title "type(scope): #ISSUE_NUMBER short description" \
  --body "$(cat <<'PREOF'
## Summary
<1-3 bullet points describing what changed and why>

Closes #ISSUE_NUMBER

## Test plan
- [ ] <specific verification steps from acceptance criteria>
- [ ] Linters pass (`dcr --no-deps web ./vendor/bin/phpcs`, `npx prettier --check`)
- [ ] No regressions on [specific areas]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
PREOF
)"
```

### Step 10: Self-Review

Review your own diff:

```bash
gh pr diff
```

Check for:

- **Bugs**: Logic errors, off-by-one, null handling
- **Security**: XSS, SQL injection, unsanitized output, missing nonces
- **Scope creep**: Changes outside the scope boundary
- **Multisite impact**: Does this affect other sites in the network?
- **Cache concerns**: Will this work with full-page caching enabled?
- **PHP compatibility**: Any 8.0-8.4 deprecation risks?

### Step 11: Fix Issues (If Any)

If the self-review reveals problems:

1. Make an additional commit fixing the issues
2. Push the fix
3. Add a PR comment explaining what was reconsidered:

   ```bash
   gh pr comment --body "$(cat <<'EOF'
   **Self-review fix:** [description of what was caught and corrected]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

### Step 12: Report

Send a message to the team lead with:

- PR URL
- Brief summary of changes
- Any concerns or follow-ups needed
- Whether the self-review caught anything

Then mark your task as completed via `TaskUpdate`.

---

## Phase 4: Summary & Cleanup

After all agents complete (or fail):

### 4.1 Present Results

Display a results table:

| # | Type | Title | Result | PR | Notes |
| --- | --- | --- | --- | --- | --- |
| 8601 | Bug | fix(editor): ... | ✅ Done | #8650 | Self-review caught XSS |
| 8590 | Story | feat(preview): ... | ⏭️ Skipped | — | Missing acceptance criteria |
| 8575 | Task | chore(cleanup): ... | ❌ Failed | — | Lint errors unfixable |

### 4.2 Follow-Ups

List any items needing attention:

- Issues that were skipped (need grooming)
- PRs with self-review concerns (need human review priority)
- High-risk changes (multisite impact, cache implications)

### 4.3 Shutdown Workers

Send shutdown requests to all workers via `SendMessage`:

```
SendMessage with type: "shutdown_request" to each worker
```

### 4.4 Clean Up Team

```
TeamDelete
```

## Error Handling

| Scenario | Action |
| --- | --- |
| Agent fails mid-implementation | Don't push broken branches. Delete remote branch if already pushed (`git push origin --delete <branch>`). Report failure with error details. |
| Branch already exists | Append `-v2`, `-v3` suffix and retry. |
| Rate limiting from GitHub API | Wait 60s, retry once. If still failing, report and move on. |
| Issue not found (404) | Report the invalid issue number to the user and skip it. |
| Issue is underspecified | Skip with clear message about what sections are missing. |
| Lint errors unfixable | Report the specific errors. Do not push code that fails linting. |
| No eligible issues after filtering | Report cleanly and stop — no team creation needed. |
