# Output Formats

Research reports can be delivered in three formats. The user chooses, or the skill suggests based on report length.

## Format Selection Logic

- **TUI** (terminal): Default for reports under ~200 lines. Quick to scan, no file artifacts.
- **Markdown**: Suggested for longer reports or when the user wants a persistent file. Written to `<topic-slug>-research.md` in the current working directory.
- **PDF**: For formal deliverables. Generated from markdown via `scripts/report-pdf.py`. Written to `<topic-slug>-research.pdf`.

Always ask the user's preference before generating. If they don't specify, default to TUI for short reports and offer markdown for longer ones.

## TUI Format

Direct terminal output with tree-style layout for scannability. Structure:

```sh
<Topic> — Research Brief

  Confidence Assessment
  ├── Source Quality       <Tier> — <1-line justification>
  ├── Consensus            <Tier> — <1-line justification>
  ├── Recency              <Tier> — <1-line justification>
  ├── Domain Familiarity   <Tier> — <1-line justification>
  └── Evidence             <Tier> — <1-line justification>

  Executive Summary
  <2-4 paragraphs of key findings>

  Perspectives
  ├── <Position A>         <Plausibility Tier>
  │   <2-3 sentence summary with key evidence>
  ├── <Position B>         <Plausibility Tier>
  │   <2-3 sentence summary with key evidence>
  └── <Position C>         <Plausibility Tier>
      <2-3 sentence summary with key evidence>

  Key Findings
  <Numbered list of specific, citable findings with inline confidence tags>

  Sources   <N> retrieved, <N> verified, <N> training-data
  Output    <file path or "displayed above">
```

For the TUI format:

- Keep the tree structure clean with box-drawing characters (├── └── │)
- Indent consistently (2 spaces for section content)
- Confidence tiers right-aligned or tab-aligned for visual scanning
- No markdown formatting (no `**bold**`, no `_italic_`) — plain text only
- Source summary line at the bottom gives a quick count by verification status

## Markdown Format

Full report written to a file. Structure follows the canonical section ordering from `assets/report-template.json`.

### Frontmatter

```yaml
---
title: "<Research Topic>"
date: "<YYYY-MM-DD>"
sources: <total count>
verified: <verified count>
domain: "<primary domain>"
---
```

### Sections

1. **Executive Summary** — 2-4 paragraphs covering the core findings, key tensions, and confidence level. This is the section where comms voice applies — it should read as clear, direct prose, not AI-textured filler.

2. **Findings** — Detailed findings organized by sub-question or theme. Each finding includes:
   - The claim with inline confidence tag (for high-stakes domains)
   - Supporting evidence with footnote citations
   - Context and caveats

3. **Perspectives** — Multiple viewpoints with plausibility tier assignments. Each perspective gets:
   - Position statement
   - Tier with rationale
   - Key supporting and opposing evidence

4. **Confidence Assessment** — The 5-dimension assessment as a table: | Dimension | Tier | Assessment | |---|---|---| | Source Quality | Strong | 4 peer-reviewed articles, 2 govt reports | | ... | ... | ... |

5. **Quantitative Analysis** — (Optional) Results from any computational exploration. Include the script used and its output.

6. **Methodology** — Brief description of search strategy: queries used, sources consulted, access limitations encountered.

7. **Sources & Citations** — Full citation list with verification statuses, formatted per `citation-system.md`.

### Prose Style

For the executive summary and analytical prose sections:

- Read `comms/references/voice.md` and `comms/references/anti-ai.md`
- Apply the user's voice to analysis and interpretation
- Keep data, citations, and methodology sections clinical and precise
- The goal: prose sections sound like a person wrote them; data sections are clean reference material

## PDF Format

Generated from a markdown report using `scripts/report-pdf.py`.

### Generation Steps

1. First generate the markdown report (as above)
2. Run: `python3 .claude/skills/research/scripts/report-pdf.py --input <file>.md --output <file>.pdf`
3. Verify the PDF was created successfully

### PDF Layout

- **Title page**: Report title, date, source count, domain
- **Body**: Sections in canonical order, with proper heading hierarchy
- **Footnotes**: Collected at the end of each page or in a final section, with verification status indicators
- **Page numbers**: Bottom center
- **Font**: Readable serif for body, sans-serif for headings

### Verification Status Indicators in PDF

Since PDF can't easily use colored badges, verification statuses use text markers:

- VERIFIED: ✓
- RETRIEVED: ○
- TRAINING DATA: △
- UNVERIFIABLE: ?
