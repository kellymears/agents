# Format: General Markdown

Catch-all for communications that aren't Slack, email, or blog posts. This covers PR descriptions, issue writeups, documentation prose, announcements, READMEs, and anything else that's markdown-formatted and human-facing.

## Principles

- Structure follows content. Use headers, lists, and formatting when the information genuinely benefits from it — not as decoration or to make short prose look more substantial.
- Voice stays direct and specific even in "official" contexts. A PR description doesn't need to sound like a press release.
- Match the level of formality to the audience and venue. A GitHub issue can be conversational. A public README should be clear and efficient.

## PR Descriptions

- Summary: what changed and why, in 1-3 sentences.
- If there's a test plan or migration step, call it out.
- Don't restate the diff. The reviewer can read the diff. Explain what the diff can't show: motivation, tradeoffs, things you considered and rejected.

## Issue Writeups

- Lead with what's wrong or what's needed.
- Steps to reproduce for bugs. Acceptance criteria for features.
- Link to relevant code, PRs, or Slack threads.
- Keep it scannable. Someone triaging 30 issues needs to understand yours in 10 seconds.

## Documentation

- Write for the person who needs the information, not for completeness.
- Code examples over prose explanations where possible.
- Keep command references copy-pasteable.
- Don't document the obvious. Focus on what someone wouldn't figure out on their own.

## Announcements

- Lead with what changed or what's happening.
- Then why it matters to the audience.
- Then what they need to do, if anything.
- End. Don't add a "we're excited about this" paragraph.
