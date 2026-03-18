---
name: research
description: >
  Deep-dive research across any domain — science, history, law, medicine, policy, philosophy, finance, technology, or anything else. Use this skill when the user asks to research a topic, look into something, do a deep dive, fact check a claim, investigate a question, prepare a briefing, or wants to understand "what do we know about X." Also triggers on phrases like "what's the evidence for", "is it true that", "summarize the research on", "compare perspectives on", or any request for rigorous, multi-source analysis with cited evidence. Produces reports with multiple viewpoints, plausibility tiers, qualitative confidence assessment, and verification-tagged citations.
---

# Research

Rigorous, multi-source research with epistemic honesty. The goal: help users make informed, fact-based decisions by presenting what's known, what's contested, what's uncertain, and where the gaps are.

## Why This Skill Exists

A single hallucinated source or fabricated citation can cause real harm — bad medical decisions, flawed legal strategies, wasted investments. This skill produces research reports that clearly distinguish verified claims from training-data recall, present competing viewpoints with honest plausibility assessments, and disclose information gaps rather than papering over them.

## Before Starting Any Research

Read these references — they define the standards the report must meet:

1. `references/anti-hallucination.md` — the epistemic contract. Read this first. Every rule exists because a specific type of fabrication causes specific harm.
2. `references/confidence-framework.md` — the 5-dimension qualitative self-assessment and perspective plausibility tiers
3. `references/citation-system.md` — verification statuses, footnote format, inline confidence tags
4. `references/output-formats.md` — TUI, markdown, and PDF specs
5. `assets/report-template.json` — canonical section ordering

## Workflow

### Phase 1: Scope & Decompose

Before searching, understand the question.

1. **Parse the query** — What is the user actually asking? Identify the core question and any implicit sub-questions.
2. **Identify the domain** — Science, law, medicine, policy, finance, history, technology, philosophy, etc. Domain affects which sources to prioritize and whether inline confidence tags are needed (medical, legal, and financial claims always get tags).
3. **Decompose into sub-questions** — Break the query into 3-7 specific, searchable sub-questions. Each should be answerable independently.
4. **Present the research plan** — Show the user:
   - The core question as you understand it
   - The sub-questions you'll investigate
   - The domain and any special handling (e.g., "medical domain — will use inline confidence tags")
   - Estimated scope (quick brief vs. deep dive)
5. **Wait for confirmation** — The user may want to adjust scope, add sub-questions, or redirect focus. Do not proceed until they confirm.

### Phase 2: Search & Gather

Systematic evidence collection. Cast a wide net, then go deep on promising sources.

1. **Broad search** — Use WebSearch for each sub-question. Use varied query formulations: plain language, technical terms, "scholarly" or "peer-reviewed" variants where appropriate. Aim for 3-5 searches per sub-question.
2. **Evaluate results** — For each search result, assess: Is this source authoritative? Is it recent? Is it primary or secondary? Does it address the sub-question directly?
3. **Deep fetch** — Use WebFetch on the most promising sources (aim for 5-10 full fetches per report). Read the full text. Extract specific claims, data, and quotes.
4. **Record everything** — For each source, capture:
   - URL (only if actually retrieved)
   - Title
   - Author/organization
   - Date
   - Key claims and data points
   - Verification status (Verified/Retrieved per `references/citation-system.md`)
5. **Record gaps** — If a sub-question yields no useful results, record that explicitly. Do not infer an answer from thin evidence to fill the gap.
6. **Training data supplement** — For well-established facts, training data is fine — but tag it. If training data provides claims that web search can confirm, upgrade the tag.

### Phase 3: Analyze & Assess

Synthesize findings into a structured analysis.

1. **Map the evidence landscape** — What positions exist on this topic? Where do sources agree? Where do they diverge?
2. **Build perspectives** — Identify 2-5 distinct viewpoints or positions. For each:
   - State the position clearly
   - Assign a plausibility tier (Strong/Moderate/Weak/Speculative) per `references/confidence-framework.md`
   - Cite supporting evidence with verification tags
   - Note key counterarguments
3. **Perform confidence self-assessment** — Evaluate the 5 dimensions from `references/confidence-framework.md`:
   - Source Quality & Availability
   - Consensus Level
   - Recency & Currency
   - Domain Familiarity
   - Evidence Strength
4. **Tag claim verification** — Every factual claim gets a verification status. In high-stakes domains (medical, legal, financial), add inline confidence tags per `references/citation-system.md`.
5. **Check for conflicts** — Where sources disagree, present both sides per Rule 4 of `references/anti-hallucination.md`. Do not quietly resolve conflicts.

### Phase 4: Mathematical Exploration (Conditional)

Skip this phase if there's no quantitative dimension to the research.

If the topic involves numerical claims, statistics, projections, or calculations:

1. **Identify quantitative claims** — Which findings involve numbers that can be verified or explored computationally?
2. **Write and execute scripts** — Use Bash to run Python or other scripts that:
   - Cross-reference numerical claims from different sources
   - Calculate derived statistics
   - Model projections or scenarios
   - Validate mathematical relationships
3. **Include scripts with findings** — The report's Quantitative Analysis section should include both the script and its output, so the user can reproduce and verify.

### Phase 5: Compose Report

Assemble the findings into a coherent report.

1. **Read comms references** — Before writing prose sections, read:
   - `../comms/references/voice.md` — the user's voice traits
   - `../comms/references/anti-ai.md` — AI-texture patterns to avoid
2. **Apply voice selectively** — The executive summary and analytical prose should sound like the user wrote them (direct, specific, no AI texture). Data sections, methodology, and citations should stay clinical and precise.
3. **Follow canonical ordering** — Use the section order from `assets/report-template.json`:
   - Frontmatter → Executive Summary → Findings → Perspectives → Confidence Assessment → Quantitative Analysis (optional) → Methodology → Sources & Citations
4. **Run the anti-hallucination checklist** — Before finalizing, check every item in the self-check list from `references/anti-hallucination.md`.

### Phase 6: Deliver

Present the report in the user's preferred format.

1. **Ask format preference** — If the user hasn't specified:
   - Short reports (under ~200 lines): suggest TUI (terminal display)
   - Longer reports: suggest markdown file, offer PDF
2. **TUI delivery** — Display directly in terminal using the tree-style format from `references/output-formats.md`. Include the confidence tree, perspectives, key findings, and source summary.
3. **Markdown delivery** — Write to `<topic-slug>-research.md` in the current working directory. Include YAML frontmatter.
4. **PDF delivery** — First generate the markdown file, then run:

   ```sh
   python3 .claude/skills/research/scripts/report-pdf.py --input <file>.md --output <file>.pdf
   ```

5. **Present the summary** — Regardless of format, show a brief terminal summary:

   ```sh
   <Topic> — Research Brief

     Confidence Assessment
     ├── Source Quality       <Tier> — <justification>
     ├── Consensus            <Tier> — <justification>
     ├── Recency              <Tier> — <justification>
     ├── Domain Familiarity   <Tier> — <justification>
     └── Evidence             <Tier> — <justification>

     Perspectives
     ├── <Position A>         <Tier>
     │   <summary>
     ├── <Position B>         <Tier>
     │   <summary>
     └── <Position C>         <Tier>
         <summary>

     Sources   <N> retrieved, <N> verified, <N> training-data
     Output    <file path or "displayed above">
   ```

## Safety Rules

These are non-negotiable. They come from `references/anti-hallucination.md` and are repeated here for emphasis:

1. **Never fabricate URLs, author names, publication titles, or dates.** If you don't know the exact metadata, say so. Omit rather than invent.
2. **Tag every factual claim** with a verification status from `references/citation-system.md`.
3. **Disclose information gaps explicitly.** "No sources found for this sub-question" is a valid and valuable finding.
4. **Present conflicting sources as conflicting.** Do not quietly pick sides.
5. **Cross-reference numerical claims** against 2+ sources when possible.
6. **Tag training data clearly.** It's a legitimate source — but the user must know it wasn't verified this session.
7. **Scope honesty.** Note search limitations, paywalls, thin results, or recency gaps.

## What Not To Do

- Don't skip the research plan confirmation in Phase 1 — the user may want to redirect
- Don't fabricate sources to fill gaps — gaps are findings too
- Don't present training data as verified
- Don't assign numerical confidence scores — use qualitative tiers with evidence
- Don't resolve conflicts silently — present competing views
- Don't use AI-textured prose in analytical sections (consult comms references)
- Don't generate PDF without first generating markdown (PDF is derived from markdown)
