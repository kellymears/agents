---
name: git:issue
description: >
  Create a GitHub issue from a PR, Slack message, or ad-hoc description. Use when the user wants to file an issue, track a bug, request a feature, or turn a conversation into a trackable work item. Triggers on phrases like "create an issue", "file a bug", "open an issue for this", "track this", "make a ticket", "turn this into an issue", or any request to create a GitHub issue. Also triggers when the user pastes a Slack message, PR URL, or describes a problem and wants it tracked.
---

# Issue Creator

Create a well-titled GitHub issue from a pull request, a Slack message, or a plain description — with duplicate detection and structured output.

## Philosophy

An issue is a promise to do something. The title should be scannable in a list of 50 other issues. The body should give someone enough context to start working without asking follow-up questions. If the work is already tracked somewhere, don't create noise — link to what exists.

## Workflow

### 1. Detect Source

Determine where the issue content is coming from:

- **PR reference** — the user mentions a PR number, URL, or says "from this PR"
- **Slack message** — the user pastes a message (often with timestamps, usernames, or conversational tone)
- **Ad-hoc** — the user describes the issue directly

### 2. Gather Context

**From a PR:**

```bash
gh pr view <number> --json title,body,labels,url,closingIssuesReferences
```

Check `closingIssuesReferences` — if the PR already links to an issue, surface it:

> "This PR already references #34. Do you want to create a new issue anyway, or is #34 the one you're looking for?"

Wait for confirmation before proceeding. Don't create duplicate tracking.

Also read the PR diff to understand the scope of changes:

```bash
gh pr diff <number> --stat
```

**From a Slack message:**

The user will paste the message content. Extract:

- The core problem or request (strip conversational filler)
- Any mentioned files, errors, or URLs
- Who raised it (if visible) — useful for the issue body as context, not as an assignee

**From ad-hoc input:**

Take what the user gives you. Ask clarifying questions only if the description is genuinely too vague to write a useful issue — a single sentence is often enough.

### 3. Check for Duplicates

Before drafting, search for existing issues that might cover the same ground:

```bash
gh issue list --state open --limit 20 --search "<key terms>"
```

If something looks like a match, surface it:

> "Found #12 which looks related: 'Session tokens not invalidated on logout'. Is this the same issue, or something different?"

Only proceed to creation after the user confirms it's new.

### 4. Draft

Compose the issue title and body.

**Title** follows conventional commit style — type and concise description:

```
type(scope): concise description
```

| Type   | When to use                     |
| ------ | ------------------------------- |
| `bug`  | Something is broken             |
| `feat` | New functionality requested     |
| `docs` | Documentation gap or error      |
| `task` | Maintenance, refactor, or chore |

**Body** uses this template:

```markdown
[One to two sentence description of the issue]

Source: [PR #N / Slack / reported by user]

## Context

[2-3 sentences of relevant background. What's happening now, what should happen instead, or what's missing. Include error messages, file paths, or URLs if available.]

## Acceptance Criteria

- [ ] [Concrete, verifiable outcome]
- [ ] [Another outcome if needed]
```

Rules for the body:

- **Description**: Brief and direct. State what's wrong or what's needed.
- **Source line**: Credit where the issue came from. For Slack, you can say "Raised in Slack by [name]" if the name is visible. For PRs, link the PR. For ad-hoc, omit the source line.
- **Context**: Enough background that someone unfamiliar can understand the issue without reading a PR or Slack thread. Include reproduction steps for bugs.
- **Acceptance Criteria**: Checkboxes describing what "done" looks like. Keep them concrete and testable. 2-4 items is typical.

### 5. Labels

Suggest labels based on the issue type and content. Check what labels exist in the repo first:

```bash
gh label list --limit 50
```

Map to existing labels where possible rather than inventing new ones. Present the suggested labels with the draft for the user to confirm.

### 6. Confirm

Present the draft title, body, and suggested labels to the user. Wait for confirmation before creating.

### 7. Create

```bash
gh issue create --title "type(scope): description" --label "label1,label2" --body "$(cat <<'EOF'
[the body from step 4]
EOF
)"
```

Return the issue URL to the user.

## Safety Rules

- **Always check for linked issues on PRs** — don't create duplicates
- **Always search for existing issues** — surface potential matches
- **Always confirm the draft** — don't create without user approval
- **Don't assign without asking** — mention potential assignees but let the user decide
- **Respect privacy** — if a Slack message contains sensitive context, note it but don't paste it verbatim into a public issue

## Examples

**From a PR:**

User: "create an issue from PR #47" → Read the PR, check for linked issues, draft an issue capturing the problem the PR solves (or a follow-up task discovered during the PR).

**From Slack:**

User pastes: "hey has anyone noticed the dashboard is super slow when you filter by date range? it takes like 10 seconds to load" → Title: `bug(dashboard): date range filter causes slow load times` → Body captures the symptom, asks about reproduction steps if needed.

**Ad-hoc:**

User: "we need to add rate limiting to the public API" → Title: `feat(api): add rate limiting to public endpoints` → Body describes the need, suggests acceptance criteria like "returns 429 after threshold".
