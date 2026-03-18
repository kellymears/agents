# Citation System

Every claim in a research report must be traceable. This system ensures the user knows exactly which claims were independently verified, which were merely found, and which came from training data.

## Verification Statuses

Four statuses, ordered by decreasing confidence:

### Verified

The source was retrieved via WebFetch, the full text (or substantial excerpt) was read, and the specific claim matches what the source actually says.

Tag: `[VERIFIED]`

This is the gold standard. It means Claude read the source this session and confirmed the claim against it.

### Retrieved

The source was found via WebSearch and snippets were read, but the full text was not fetched or the specific claim wasn't confirmed against the complete source.

Tag: `[RETRIEVED]`

Common when a source appears in search results with a relevant snippet, but WebFetch failed, was rate-limited, or the full text is behind a paywall.

### Training Data

The claim comes from Claude's training data. The source may be real and accurately recalled, but it was not independently verified during this research session.

Tag: `[TRAINING DATA]`

This is not shameful — training data contains vast amounts of accurate information. But the user deserves to know which claims were checked this session and which weren't. Training data citations are particularly common for:

- Well-known facts and established science
- Historical events and dates
- Foundational papers and landmark studies
- Statistical figures that are widely cited

### Unverifiable

No source was found to confirm or deny the claim. The information may be accurate but couldn't be traced to an authoritative source.

Tag: `[UNVERIFIABLE]`

If a claim is tagged unverifiable, the report should explicitly note this and explain why verification failed (e.g., "no public data available", "search returned no relevant results", "claim appears in multiple secondary sources but no primary source was located").

## Footnote Format

Each citation follows this format:

```text
[N] Author/Organization. "Title." Publication/Source. Date. URL. [STATUS]
```

Examples:

```text
[1] WHO. "Intermittent fasting and health — a review." WHO Technical Report. 2024-03-15. https://example.org/who-if-review. [VERIFIED]
[2] Smith, J. et al. "Metabolic effects of time-restricted eating." Nature Metabolism. 2023. https://example.org/smith-tre. [RETRIEVED]
[3] Longo, V. & Panda, S. "Fasting, circadian rhythms, and time-restricted feeding." Cell Metabolism, 23(6). 2016. [TRAINING DATA]
[4] Unpublished dataset referenced in conference presentation. [UNVERIFIABLE]
```

When a field is unknown, omit it rather than fabricating it:

```text
[5] "Effects of prolonged fasting on immune function." [Source and date unknown]. [TRAINING DATA]
```

## Inline Confidence Tags

For high-stakes domains (medical, legal, financial), add per-claim inline confidence after the claim:

- `(high confidence)` — claim verified against multiple independent sources
- `(moderate confidence)` — claim supported by at least one credible source, but not cross-verified
- `(uncertain)` — claim based on limited evidence or training data only

Use these sparingly. Not every sentence needs a tag — apply them to specific factual claims, statistics, and recommendations, not to general framing or connective prose.

Example: "Time-restricted eating has been associated with improved insulin sensitivity in multiple RCTs (high confidence), though the optimal fasting window remains debated (moderate confidence)."

## Citation Rules

1. **Every factual claim gets a footnote.** General knowledge framing does not, but any specific fact, statistic, date, or attributed position does.
2. **Never fabricate URLs.** If you can't recall or find the exact URL, omit it and tag the citation as `[TRAINING DATA]`.
3. **Never fabricate author names or publication titles.** If uncertain, use a descriptive placeholder: "A 2023 systematic review in Nature Medicine" rather than inventing author names.
4. **Group related claims.** If three claims come from the same source, use the same footnote number for all three.
5. **Separate claims from interpretation.** The source citation covers what the source says. The report's interpretation of that source should be clearly distinguishable from the source's own conclusions.
