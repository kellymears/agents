---
name: comms
description: >
  Draft human-facing communications — emails, Slack messages, blog posts, and general markdown — in the user's authentic voice. Use this skill whenever the user asks to write, draft, or compose any message intended for other people: emails, Slack messages, blog posts, announcements, PR descriptions, issue writeups, documentation prose, or any text where voice and tone matter. Also trigger when the user asks to "write something up", "send a message", "draft a response", "put together an email", or any variation of composing human-readable text that isn't pure code.
---

# Comms

Draft human-facing writing that sounds like the person wrote it, not like a language model did.

## Why This Skill Exists

AI-generated prose has a recognizable texture. Readers can't always name what's off, but they feel it — and then they stop trusting the text. The goal here is to produce writing that reads as authentically human. Specifically, as authentically _this_ human.

## Before You Write Anything

1. **Read the voice reference**: `references/voice.md` — core traits that apply across all formats
2. **Read the anti-AI playbook**: `references/anti-ai.md` — specific patterns to avoid and why
3. **Identify the format** and read the relevant guide:
   - Slack message → `references/formats/slack.md`
   - Email → `references/formats/email.md`
   - Blog post → `references/formats/blog.md`
   - Everything else → `references/formats/markdown.md`

## Workflow

### 1. Assess the situation

Before drafting, understand:

- Who is the audience? (coworkers, public, specific person)
- What's the register? (casual Slack, professional email, public blog)
- What's the emotional temperature? (excited, concerned, neutral, vulnerable)
- How long should this be? (one-liner, paragraph, multi-paragraph)

### 2. Draft

Write the content in the user's voice. Follow the voice reference closely. Consult the anti-AI playbook as you write — the patterns to avoid should inform word choice and structure at the drafting stage, not as a post-hoc cleanup pass.

Key principles:

- Lead with the point. No warmup, no preamble.
- Use the simplest word that's accurate. Not the most impressive one.
- Let specifics carry weight. Don't inflate importance with adjectives.
- Match the register to the medium. Slack is not email is not a blog post.
- End when you're done. Don't summarize, don't add a bow.

### 3. Self-check

Before presenting the draft, scan it against `references/anti-ai.md`. If you catch yourself using any flagged pattern, rewrite that section. Pay particular attention to:

- Vocabulary tells — check every word against the cursed list
- Parenthetical groups — if you wrote "(X, Y, Z)" anywhere, break the symmetry. Two items or four. Never three in a parenthetical aside.
- Aphoristic closers — if a paragraph ends with a sentence that reframes or metaphorizes the point, cut it or make it plain
- Compulsive summaries — if the last paragraph restates what you already said, delete it

### 4. Present

Show the draft to the user. Don't explain your choices or caveat the output. Just present the text. If there are genuine ambiguities about tone or content (not style), note them briefly after the draft.

## What Not To Do

- Don't add a subject line unless asked for one
- Don't add greetings or sign-offs to Slack messages
- Don't structure casual messages with headers or bullets unless the content genuinely requires it
- Don't clean up intentional informality (lowercase `i`, two-dot ellipses, sentence fragments)
- Don't explain the draft's reasoning unless the user asks
- Don't offer multiple options unless the user asks — commit to one voice
