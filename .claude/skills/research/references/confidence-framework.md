# Confidence Framework

Qualitative self-assessment guide for research reports. No numerical scores — narrative descriptions backed by evidence.

## Why Qualitative Over Quantitative

Numerical confidence scores (e.g., "72% confident") imply a precision that doesn't exist. Claude can't meaningfully distinguish between 70% and 75% confidence on a subjective assessment. Narrative descriptions with cited evidence give the user the _reasoning_ behind the assessment, letting them calibrate trust themselves.

## The Five Dimensions

Assess every research report across these five dimensions. Each gets a tier label and a 1-sentence justification citing specific evidence.

### 1. Source Quality & Availability

Were authoritative, accessible sources found during research?

| Tier | Meaning |
| --- | --- |
| **Strong** | Multiple peer-reviewed, institutional, or primary sources retrieved and read |
| **Adequate** | Several credible sources found; mix of primary and secondary |
| **Thin** | Few sources, mostly secondary or journalistic; limited primary material |
| **Absent** | No reliable sources found; relying on training data or general knowledge |

Justification should cite: number of sources retrieved, types of publications (peer-reviewed, government, journalistic, blog), and whether full text was accessible.

Example: "Strong — 4 peer-reviewed articles retrieved via WebFetch, 2 government agency reports, 1 systematic review."

### 2. Consensus Level

Do domain experts and authoritative sources agree, or is this actively debated?

| Tier | Meaning |
| --- | --- |
| **Settled** | Broad expert agreement; dissent is fringe or outdated |
| **Mainstream-with-dissent** | Strong majority position exists, but credible minority disagrees |
| **Contested** | Two or more credible camps; no dominant position |
| **Fragmented** | No coherent camps; many conflicting views, limited agreement |

Justification should cite: which positions were found, whether major institutions align, and the nature of disagreement.

Example: "Contested — two major interpretive frameworks in the literature, both published in top-tier journals, with neither commanding majority support."

### 3. Recency & Currency

Is the information current, or has the landscape likely shifted since the sources were published?

| Tier | Meaning |
| --- | --- |
| **Current** | Most sources from the last 1-2 years; field is not fast-moving, or sources reflect latest developments |
| **Recent** | Sources from last 3-5 years; no major known shifts since publication |
| **Aging** | Sources 5-10 years old; field may have evolved |
| **Outdated** | Sources over 10 years old, or known to be superseded by newer work |

Justification should cite: date range of sources found, whether the field is fast-moving, and any known recent developments.

Example: "Current — most sources from 2024-2025, field has active ongoing research."

### 4. Domain Familiarity

How well does Claude's training data cover this topic? This is an honest self-assessment of potential blind spots.

| Tier | Meaning |
| --- | --- |
| **Deep** | Well-covered in training data; high volume of academic and professional literature on this topic |
| **Moderate** | Reasonably covered; mainstream aspects well-known, niche areas less so |
| **Partial** | Training data coverage is uneven; some aspects well-known, significant gaps in others |
| **Sparse** | Niche topic, recent developments, or specialized subfield with limited training data coverage |

Justification should cite: whether the topic is mainstream or niche, whether sub-questions fell into known gaps, and whether web search filled those gaps.

Example: "Moderate — well-covered mainstream topic, but gaps in subfield-specific methodology debate."

### 5. Evidence Strength

What type of evidence supports the findings? Empirical, theoretical, anecdotal?

| Tier | Meaning |
| --- | --- |
| **Robust** | Multiple independent empirical studies, meta-analyses, or systematic reviews |
| **Solid** | Empirical studies exist but limited in number or scope; strong theoretical backing |
| **Mixed** | Some empirical data, but also significant reliance on expert opinion, case studies, or theoretical argument |
| **Thin** | Primarily anecdotal, theoretical, or based on limited/pilot data |

Justification should cite: types of evidence found (RCTs, observational studies, case reports, expert consensus, theoretical papers), and any notable limitations.

Example: "Mixed — epidemiological evidence strong (3 large cohort studies), but RCT data limited to short-term interventions."

## Perspective Plausibility Tiers

When presenting multiple perspectives or positions, assign each a plausibility tier:

| Tier | Meaning |
| --- | --- |
| **Strong** | Well-supported by available evidence; widely accepted among domain experts |
| **Moderate** | Credible empirical or theoretical support; actively debated, not fringe |
| **Weak** | Limited supporting evidence; minority position among experts |
| **Speculative** | Little to no direct evidence; largely theoretical, novel, or untested |

Each perspective's tier assignment should include a 1-sentence rationale explaining why that tier was chosen, citing specific evidence or the lack thereof.

## Presentation Format

In the TUI confidence tree:

```sh
Confidence Assessment
├── Source Quality       Strong — 4 peer-reviewed articles, 2 govt reports
├── Consensus            Contested — two major camps, both credible
├── Recency              Current — most sources 2024-2025
├── Domain Familiarity   Moderate — well-covered, gaps in subfield
└── Evidence             Mixed — epidemiological strong, RCT limited
```

In markdown reports, present as a table in the Confidence Assessment section.
