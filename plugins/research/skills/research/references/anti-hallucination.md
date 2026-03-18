# Anti-Hallucination Contract

This is the epistemic contract for research reports. Every rule here exists because a specific type of fabrication can cause real harm.

## The Core Principle

A research report that contains fabricated citations is worse than no report at all. A user who acts on a fabricated source — citing a nonexistent paper in a legal brief, making a medical decision based on a study that doesn't exist, investing based on a fake analyst report — faces consequences that can't be undone by a later correction.

Intellectual honesty is the prerequisite for this skill being useful.

## Fabrication Severity Hierarchy

Ordered by potential for real-world harm:

1. **URLs** — A fabricated URL is immediately verifiable and immediately discrediting. The user clicks it, gets a 404, and loses all trust in the report. Worse: the URL could resolve to an unrelated or malicious page.
2. **Author names** — Fabricated authors can be searched. When they don't exist (or exist but didn't write the attributed work), the user's credibility is damaged if they cite them.
3. **Publication titles** — Fabricated paper titles are searchable and falsifiable. Less immediately harmful than fake authors but still damaging.
4. **Dates** — Wrong dates are harder to catch but can mislead about recency and relevance.
5. **Claims** — A fabricated claim with a real source is the hardest to catch and can propagate through the user's downstream work.

## Operational Rules

### Rule 1: Never fabricate source metadata

Do not invent URLs, DOIs, author names, publication titles, volume numbers, page numbers, or dates. If you don't know the exact metadata, say so:

- Good: `"A 2023 study in The Lancet found..." [TRAINING DATA]`
- Bad: `"Smith, J. et al. (2023). 'Effects of...' The Lancet, 401(3), pp. 234-241."` (when you're not sure those details are correct)

### Rule 2: Tag every claim with verification status

Use the verification statuses defined in `citation-system.md`. No exceptions. Every factual claim in the report must be traceable to a source with a status tag.

### Rule 3: The "I don't know" protocol

When research turns up gaps:

1. State the gap explicitly in the report: "No authoritative source was found for [specific claim/question]."
2. Explain what was searched: "WebSearch queries for [terms] returned [N] results, none addressing [specific aspect]."
3. If training data has something relevant, present it clearly tagged: "Based on training data (not verified this session): [claim]. [TRAINING DATA]"
4. Never fill a gap with invented information to make the report feel complete.

Information gaps are expected and normal. A report that honestly says "this question couldn't be answered with available sources" is more valuable than one that fabricates an answer.

### Rule 4: Conflicting sources

When sources disagree:

1. Present both positions with their evidence.
2. Attribute each position to its source(s).
3. Do not arbitrate between them unless one is clearly more authoritative (e.g., a systematic review vs. a blog post).
4. If you do assess relative credibility, explain why: source type, sample size, recency, methodological rigor.
5. Never quietly pick one side and present it as settled when it isn't.

### Rule 5: Cross-reference numerical claims

Statistics, percentages, dates, and quantities are high-risk for hallucination. When a quantitative claim appears:

1. Check it against at least 2 sources when possible.
2. If sources disagree on a number, report the range: "Estimates range from X to Y."
3. If only one source provides a number, note this: "According to [source] (single source)."
4. If the number comes from training data, tag it and note that it wasn't cross-verified.

### Rule 6: Training data disclosure

Training data is a legitimate information source. Do not treat it as shameful. But do treat it as unverified:

- Present training data claims clearly tagged as `[TRAINING DATA]`
- Do not mix training data claims with verified claims without distinguishing them
- When a training data claim is central to a conclusion, note the verification gap
- If web search confirms a training data claim, upgrade the tag to `[RETRIEVED]` or `[VERIFIED]`

### Rule 7: Scope honesty

Be honest about the limits of the research:

- Note when search results were thin or irrelevant
- Note when paywalls or access restrictions limited source quality
- Note when the topic is too recent for substantial published analysis
- Note when the question crosses into domains where web sources are unreliable
- Never imply comprehensive coverage when the search was limited

## Self-Check Before Delivery

Before presenting any research report, scan it against this checklist:

- [ ] Every URL in the report was actually retrieved (not recalled from training data and assumed to be correct)
- [ ] Every author name is either from a verified source or tagged as training data
- [ ] Every numerical claim has a source citation with verification status
- [ ] Information gaps are explicitly stated, not papered over
- [ ] Conflicting sources are presented as conflicting, not quietly resolved
- [ ] The confidence assessment honestly reflects the quality and coverage of the research
- [ ] No claim is presented with more certainty than the evidence supports
