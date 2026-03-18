#!/usr/bin/env python3
"""
Generate a literary-aesthetic PDF research report from a markdown file.

Warm cream backgrounds, bold serifs, generous whitespace, big pullquotes.
The Anthropic house style: austere, confident, beautiful.

Usage:
    python3 report-pdf.py --input <file>.md --output <file>.pdf

Single dependency: reportlab (installed automatically if missing).
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

try:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import inch, mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import (
        BaseDocTemplate,
        Frame,
        Flowable,
        KeepTogether,
        NextPageTemplate,
        PageBreak,
        PageTemplate,
        Paragraph,
        Preformatted,
        Spacer,
        Table,
        TableStyle,
    )
except ImportError:
    print("reportlab not found — installing...", file=sys.stderr)
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import inch, mm
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import (
        BaseDocTemplate,
        Frame,
        Flowable,
        KeepTogether,
        NextPageTemplate,
        PageBreak,
        PageTemplate,
        Paragraph,
        Preformatted,
        Spacer,
        Table,
        TableStyle,
    )


# ── Design tokens ────────────────────────────────────────────────────
# Warm, literary palette. Cream paper, deep brown ink, terracotta accents.

PALETTE = {
    "cream": colors.HexColor("#FAF6F0"),
    "cream_dark": colors.HexColor("#F0EBE3"),
    "ink": colors.HexColor("#1C1612"),
    "ink_light": colors.HexColor("#3D322A"),
    "ink_muted": colors.HexColor("#6B5D52"),
    "ink_faint": colors.HexColor("#9C8E82"),
    "accent": colors.HexColor("#C2632A"),
    "accent_light": colors.HexColor("#E8CDB8"),
    "accent_faint": colors.HexColor("#F2E6D9"),
    "rule": colors.HexColor("#D4C9BC"),
    "code_bg": colors.HexColor("#F0EAE0"),
    "code_border": colors.HexColor("#D4C9BC"),
    "white": colors.HexColor("#FFFFFF"),
}

PAGE_W, PAGE_H = letter
MARGIN_TOP = 1.0 * inch
MARGIN_BOTTOM = 0.85 * inch
MARGIN_LEFT = 1.15 * inch
MARGIN_RIGHT = 1.15 * inch
CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT

# Serif stack: Times is reportlab's built-in serif. Clean and literary.
SERIF = "Times-Roman"
SERIF_BOLD = "Times-Bold"
SERIF_ITALIC = "Times-Italic"
SERIF_BOLD_ITALIC = "Times-BoldItalic"
SANS = "Helvetica"
SANS_BOLD = "Helvetica-Bold"
MONO = "Courier"


# ── Custom flowables ─────────────────────────────────────────────────

class PullQuote(Flowable):
    """
    A big, indented blockquote with a thick left accent bar.
    Literary. Commanding. The kind of thing you'd see in a long-read.
    """

    def __init__(self, text: str, style: ParagraphStyle, bar_color=None, width=None):
        super().__init__()
        self.text = text
        self.style = style
        self.bar_color = bar_color or PALETTE["accent"]
        self._width = width or CONTENT_W
        self.bar_width = 3
        self.bar_padding = 16
        self.inner_width = self._width - self.bar_width - self.bar_padding - 24
        self._para = Paragraph(text, style)
        self._para.wrap(self.inner_width, PAGE_H)

    def wrap(self, availWidth, availHeight):
        self.inner_width = availWidth - self.bar_width - self.bar_padding - 24
        self._para = Paragraph(self.text, self.style)
        w, h = self._para.wrap(self.inner_width, availHeight)
        self.height = h + 20  # vertical padding
        self.width = availWidth
        return self.width, self.height

    def draw(self):
        canvas = self.canv
        # Thick accent bar
        canvas.setStrokeColor(self.bar_color)
        canvas.setLineWidth(self.bar_width)
        x = 12
        canvas.line(x, 0, x, self.height)
        # Draw paragraph
        self._para.drawOn(
            canvas,
            x + self.bar_padding,
            10,  # bottom padding
        )


class DecorativeRule(Flowable):
    """
    A thin horizontal rule with an optional center ornament.
    The kind of section break you'd see in a literary journal.
    """

    def __init__(self, width=None, color=None, thickness=0.5, ornament=True):
        super().__init__()
        self._width = width or CONTENT_W
        self.color = color or PALETTE["rule"]
        self.thickness = thickness
        self.ornament = ornament

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        self.height = 24
        return self.width, self.height

    def draw(self):
        canvas = self.canv
        canvas.setStrokeColor(self.color)
        canvas.setLineWidth(self.thickness)
        y = self.height / 2
        if self.ornament:
            # Line with center diamond
            mid = self.width / 2
            gap = 8
            canvas.line(0, y, mid - gap, y)
            canvas.line(mid + gap, y, self.width, y)
            # Small diamond ornament
            canvas.setFillColor(self.color)
            canvas.saveState()
            canvas.translate(mid, y)
            canvas.rotate(45)
            size = 2.5
            canvas.rect(-size, -size, size * 2, size * 2, fill=1, stroke=0)
            canvas.restoreState()
        else:
            canvas.line(0, y, self.width, y)


class ThinRule(Flowable):
    """A simple thin rule — no ornament, minimal height."""

    def __init__(self, width=None, color=None):
        super().__init__()
        self._width = width or CONTENT_W
        self.color = color or PALETTE["rule"]

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        self.height = 10
        return self.width, self.height

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(0.4)
        self.canv.line(0, self.height / 2, self.width, self.height / 2)


class ConfidenceTree(Flowable):
    """
    Renders the confidence assessment as a tree with box-drawing characters,
    tier labels, and justification text. Monospaced, austere.
    """

    def __init__(self, rows: list[tuple[str, str, str]], width=None):
        """rows: list of (dimension, tier, justification)"""
        super().__init__()
        self._width = width or CONTENT_W
        self.rows = rows
        self.line_height = 18
        self.font_size = 9.5

    def wrap(self, availWidth, availHeight):
        self.width = availWidth
        self.height = len(self.rows) * self.line_height + 8
        return self.width, self.height

    def draw(self):
        canvas = self.canv
        y = self.height - 4
        for idx, (dimension, tier, justification) in enumerate(self.rows):
            is_last = idx == len(self.rows) - 1
            connector = "\u2514\u2500\u2500" if is_last else "\u251C\u2500\u2500"

            # Tree connector
            canvas.setFont(MONO, self.font_size)
            canvas.setFillColor(PALETTE["ink_faint"])
            canvas.drawString(16, y, connector)

            # Dimension label
            canvas.setFont(SERIF, self.font_size)
            canvas.setFillColor(PALETTE["ink"])
            canvas.drawString(46, y, dimension)

            # Tier badge
            canvas.setFont(SERIF_BOLD, self.font_size)
            canvas.setFillColor(PALETTE["accent"])
            canvas.drawString(200, y, tier)

            # Justification
            canvas.setFont(SERIF_ITALIC, 8.5)
            canvas.setFillColor(PALETTE["ink_muted"])
            canvas.drawString(310, y, justification[:60])

            y -= self.line_height


# ── Page templates ───────────────────────────────────────────────────

def _draw_page_background(canvas, doc):
    """Cream background, thin top/bottom rules, page number."""
    canvas.saveState()

    # Full page cream fill
    canvas.setFillColor(PALETTE["cream"])
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # Thin accent rule at top
    canvas.setStrokeColor(PALETTE["rule"])
    canvas.setLineWidth(0.4)
    canvas.line(
        MARGIN_LEFT, PAGE_H - MARGIN_TOP + 14,
        PAGE_W - MARGIN_RIGHT, PAGE_H - MARGIN_TOP + 14,
    )

    # Page number — bottom center, small serif
    canvas.setFont(SERIF, 7.5)
    canvas.setFillColor(PALETTE["ink_faint"])
    canvas.drawCentredString(PAGE_W / 2, MARGIN_BOTTOM - 20, f"{doc.page}")

    canvas.restoreState()


def _draw_title_page(canvas, doc):
    """Title page: cream background, no header rule, no page number."""
    canvas.saveState()
    canvas.setFillColor(PALETTE["cream"])
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.restoreState()


def _draw_body_page(canvas, doc):
    """Body pages: background + running header with report title."""
    _draw_page_background(canvas, doc)
    canvas.saveState()
    title = getattr(doc, "_report_title", "")
    if title:
        canvas.setFont(SANS, 6.5)
        canvas.setFillColor(PALETTE["ink_faint"])
        canvas.drawString(MARGIN_LEFT, PAGE_H - MARGIN_TOP + 22, title.upper())
    canvas.restoreState()


# ── Styles ───────────────────────────────────────────────────────────

def build_styles() -> dict[str, ParagraphStyle]:
    """Typographic system. Big serifs, warm ink, generous leading."""

    return {
        # ── Title page ──
        "title": ParagraphStyle(
            "Title",
            fontName=SERIF_BOLD,
            fontSize=32,
            leading=38,
            textColor=PALETTE["ink"],
            alignment=TA_LEFT,
            spaceAfter=0,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            fontName=SERIF_ITALIC,
            fontSize=13,
            leading=18,
            textColor=PALETTE["ink_muted"],
            alignment=TA_LEFT,
            spaceAfter=0,
        ),
        "meta_label": ParagraphStyle(
            "MetaLabel",
            fontName=SANS,
            fontSize=7,
            leading=10,
            textColor=PALETTE["ink_faint"],
            alignment=TA_LEFT,
            spaceBefore=0,
            spaceAfter=1,
        ),
        "meta_value": ParagraphStyle(
            "MetaValue",
            fontName=SERIF,
            fontSize=10,
            leading=14,
            textColor=PALETTE["ink_light"],
            alignment=TA_LEFT,
            spaceAfter=8,
        ),

        # ── Headings ──
        "h1": ParagraphStyle(
            "H1",
            fontName=SERIF_BOLD,
            fontSize=22,
            leading=28,
            textColor=PALETTE["ink"],
            spaceBefore=28,
            spaceAfter=10,
        ),
        "h2": ParagraphStyle(
            "H2",
            fontName=SERIF_BOLD,
            fontSize=15,
            leading=20,
            textColor=PALETTE["ink"],
            spaceBefore=22,
            spaceAfter=7,
        ),
        "h3": ParagraphStyle(
            "H3",
            fontName=SERIF_ITALIC,
            fontSize=12.5,
            leading=17,
            textColor=PALETTE["ink_light"],
            spaceBefore=16,
            spaceAfter=5,
        ),
        "h4": ParagraphStyle(
            "H4",
            fontName=SANS_BOLD,
            fontSize=9.5,
            leading=13,
            textColor=PALETTE["ink_muted"],
            spaceBefore=12,
            spaceAfter=4,
        ),

        # ── Body ──
        "body": ParagraphStyle(
            "Body",
            fontName=SERIF,
            fontSize=10.5,
            leading=15.5,
            textColor=PALETTE["ink"],
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        ),
        "body_first": ParagraphStyle(
            "BodyFirst",
            fontName=SERIF,
            fontSize=10.5,
            leading=15.5,
            textColor=PALETTE["ink"],
            alignment=TA_JUSTIFY,
            spaceAfter=8,
            firstLineIndent=0,
        ),

        # ── Lists ──
        "bullet_1": ParagraphStyle(
            "Bullet1",
            fontName=SERIF,
            fontSize=10.5,
            leading=15,
            textColor=PALETTE["ink"],
            leftIndent=22,
            bulletIndent=8,
            spaceAfter=3,
        ),
        "bullet_2": ParagraphStyle(
            "Bullet2",
            fontName=SERIF,
            fontSize=10,
            leading=14,
            textColor=PALETTE["ink_light"],
            leftIndent=42,
            bulletIndent=28,
            spaceAfter=2,
        ),
        "bullet_3": ParagraphStyle(
            "Bullet3",
            fontName=SERIF,
            fontSize=9.5,
            leading=13,
            textColor=PALETTE["ink_muted"],
            leftIndent=62,
            bulletIndent=48,
            spaceAfter=2,
        ),
        "numbered": ParagraphStyle(
            "Numbered",
            fontName=SERIF,
            fontSize=10.5,
            leading=15,
            textColor=PALETTE["ink"],
            leftIndent=22,
            bulletIndent=4,
            spaceAfter=3,
        ),

        # ── Blockquote / pullquote ──
        "pullquote": ParagraphStyle(
            "PullQuote",
            fontName=SERIF_ITALIC,
            fontSize=13,
            leading=19,
            textColor=PALETTE["ink_light"],
            alignment=TA_LEFT,
        ),
        "blockquote": ParagraphStyle(
            "BlockQuote",
            fontName=SERIF_ITALIC,
            fontSize=10.5,
            leading=15,
            textColor=PALETTE["ink_light"],
            alignment=TA_LEFT,
        ),

        # ── Code ──
        "code_block": ParagraphStyle(
            "CodeBlock",
            fontName=MONO,
            fontSize=8,
            leading=11,
            textColor=PALETTE["ink_light"],
            backColor=PALETTE["code_bg"],
            borderColor=PALETTE["code_border"],
            borderWidth=0.5,
            borderPadding=(8, 10, 8, 10),
            spaceAfter=10,
            spaceBefore=4,
        ),
        "code_inline": ParagraphStyle(
            "CodeInline",
            fontName=MONO,
            fontSize=9,
            textColor=PALETTE["ink_light"],
        ),

        # ── Tables ──
        "table_header": ParagraphStyle(
            "TableHeader",
            fontName=SANS_BOLD,
            fontSize=8.5,
            leading=12,
            textColor=PALETTE["ink"],
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            fontName=SERIF,
            fontSize=9,
            leading=13,
            textColor=PALETTE["ink_light"],
        ),

        # ── Footnotes / citations ──
        "footnote": ParagraphStyle(
            "Footnote",
            fontName=SERIF,
            fontSize=8,
            leading=11,
            textColor=PALETTE["ink_muted"],
            leftIndent=14,
            firstLineIndent=-14,
            spaceAfter=3,
        ),
        "footnote_header": ParagraphStyle(
            "FootnoteHeader",
            fontName=SANS,
            fontSize=7,
            leading=10,
            textColor=PALETTE["ink_faint"],
            spaceBefore=16,
            spaceAfter=6,
        ),
    }


# ── Frontmatter parsing ──────────────────────────────────────────────

def parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    """Extract YAML frontmatter and return (metadata, body)."""
    if not text.startswith("---"):
        return {}, text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text

    meta: dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip().strip('"').strip("'")

    return meta, parts[2].strip()


# ── Inline formatting ────────────────────────────────────────────────

VERIFICATION_MARKERS = {
    "[VERIFIED]": "VERIFIED",
    "[RETRIEVED]": "RETRIEVED",
    "[TRAINING DATA]": "TRAINING",
    "[UNVERIFIABLE]": "UNVERIF.",
}


def escape_xml(text: str) -> str:
    """Escape XML special characters for reportlab Paragraph."""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text


def inline_format(text: str) -> str:
    """Convert markdown inline formatting to reportlab XML markup."""
    text = escape_xml(text)

    # Bold italic (must come before bold and italic)
    text = re.sub(
        r"\*\*\*(.+?)\*\*\*",
        rf'<font face="{SERIF_BOLD_ITALIC}">\1</font>',
        text,
    )

    # Bold
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)

    # Italic
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"<i>\1</i>", text)

    # Inline code
    text = re.sub(
        r"`(.+?)`",
        rf'<font face="{MONO}" size="9" color="{PALETTE["ink_light"]}">\1</font>',
        text,
    )

    # Links: [text](url) → text with small arrow indicator
    link_arrow = "\u2197"
    text = re.sub(
        r"\[(.+?)\]\((.+?)\)",
        rf'\1<super><font size="7" color="#C2632A"> {link_arrow}</font></super>',
        text,
    )

    # Strikethrough
    text = re.sub(r"~~(.+?)~~", r"<strike>\1</strike>", text)

    # Verification markers → styled text badges, color-coded by trust level
    _marker_colors = {
        "VERIFIED": "#4A7C59",    # muted green — confirmed
        "RETRIEVED": "#8B7355",   # warm brown — found but unconfirmed
        "TRAINING": "#9C8E82",    # faint — from memory
        "UNVERIF.": "#C2632A",    # accent — caution
    }
    for marker, label in VERIFICATION_MARKERS.items():
        escaped = escape_xml(marker)
        color = _marker_colors.get(label, "#9C8E82")
        badge = (
            f'<font face="{SANS}" size="6.5" color="{color}">'
            f" {label}</font>"
        )
        text = text.replace(escaped, badge)

    # Inline confidence tags
    for tag in ("high confidence", "moderate confidence", "uncertain"):
        escaped = escape_xml(f"({tag})")
        styled = (
            f'<font face="{SANS}" size="8" color="#6B5D52">'
            f"({tag})</font>"
        )
        text = text.replace(escaped, styled)

    return text


# ── Markdown parser ──────────────────────────────────────────────────

def _indent_level(line: str) -> int:
    """Count leading spaces to determine nesting depth."""
    return len(line) - len(line.lstrip())


def _is_bullet(stripped: str) -> bool:
    return bool(re.match(r"^[-*+]\s+", stripped))


def _is_numbered(stripped: str) -> bool:
    return bool(re.match(r"^\d+\.\s+", stripped))


def _is_blockquote(stripped: str) -> bool:
    return stripped.startswith(">")


def _strip_blockquote(line: str) -> str:
    """Remove one level of > prefix."""
    stripped = line.lstrip()
    if stripped.startswith("> "):
        return stripped[2:]
    if stripped.startswith(">"):
        return stripped[1:]
    return line


def markdown_to_flowables(body: str, styles: dict[str, ParagraphStyle]) -> list:
    """Parse markdown body into reportlab flowables."""
    flowables: list = []
    lines = body.splitlines()
    i = 0
    in_code_block = False
    code_lines: list[str] = []

    while i < len(lines):
        line = lines[i]

        # ── Code blocks ──
        if line.strip().startswith("```"):
            if in_code_block:
                code_text = escape_xml("\n".join(code_lines))
                flowables.append(Spacer(1, 4))
                flowables.append(Preformatted(
                    "\n".join(code_lines),
                    styles["code_block"],
                ))
                flowables.append(Spacer(1, 4))
                code_lines = []
                in_code_block = False
            else:
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        stripped = line.strip()

        # ── Empty lines ──
        if not stripped:
            i += 1
            continue

        # ── Horizontal rules ──
        if re.match(r"^[-*_]{3,}\s*$", stripped):
            flowables.append(Spacer(1, 6))
            flowables.append(DecorativeRule())
            flowables.append(Spacer(1, 6))
            i += 1
            continue

        # ── Headers ──
        header_match = re.match(r"^(#{1,4})\s+(.*)", stripped)
        if header_match:
            level = len(header_match.group(1))
            text = header_match.group(2)
            style_key = f"h{level}"
            if style_key in styles:
                flowables.append(Paragraph(inline_format(text), styles[style_key]))
                # Add a thin rule after h1
                if level == 1:
                    flowables.append(ThinRule())
            i += 1
            continue

        # ── Blockquotes → pullquotes ──
        if _is_blockquote(stripped):
            quote_lines: list[str] = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(_strip_blockquote(lines[i]))
                i += 1

            quote_text = " ".join(ln.strip() for ln in quote_lines if ln.strip())

            # Large pullquote for short quotes, regular blockquote for long ones
            if len(quote_text) < 200:
                flowables.append(Spacer(1, 10))
                flowables.append(PullQuote(
                    inline_format(quote_text),
                    styles["pullquote"],
                ))
                flowables.append(Spacer(1, 10))
            else:
                flowables.append(Spacer(1, 6))
                flowables.append(PullQuote(
                    inline_format(quote_text),
                    styles["blockquote"],
                ))
                flowables.append(Spacer(1, 6))
            continue

        # ── Bullet lists (with nesting) ──
        if _is_bullet(stripped):
            bullet_items: list = []
            while i < len(lines):
                current = lines[i]
                current_stripped = current.strip()
                if not current_stripped:
                    # Blank line inside a list — peek ahead to see if list continues
                    if (i + 1 < len(lines) and _is_bullet(lines[i + 1].strip())):
                        i += 1
                        continue
                    break
                if not _is_bullet(current_stripped):
                    break

                indent = _indent_level(current)
                text = re.sub(r"^[-*+]\s+", "", current_stripped)

                # Nesting: 0 = depth 1, 2+ = depth 2, 4+ = depth 3
                if indent >= 4:
                    depth = 3
                elif indent >= 2:
                    depth = 2
                else:
                    depth = 1

                # Bullet character varies by depth for visual hierarchy
                bullet_char = (
                    "\u2022" if depth == 1    # bullet
                    else "\u2013" if depth == 2  # en-dash
                    else "\u00b7"               # middle dot
                )
                style_key = f"bullet_{depth}"
                bullet_items.append(
                    Paragraph(f"{bullet_char} {inline_format(text)}", styles[style_key])
                )
                i += 1

            if bullet_items:
                flowables.extend(bullet_items)
                flowables.append(Spacer(1, 4))
            continue

        # ── Numbered lists ──
        if _is_numbered(stripped):
            while i < len(lines):
                current_stripped = lines[i].strip()
                if not current_stripped:
                    i += 1
                    continue
                num_match = re.match(r"^(\d+)\.\s+(.*)", current_stripped)
                if not num_match:
                    break
                num = num_match.group(1)
                text = num_match.group(2)
                flowables.append(
                    Paragraph(
                        f'<font face="{SERIF_BOLD}" color="{PALETTE["accent"]}">'
                        f"{num}.</font> {inline_format(text)}",
                        styles["numbered"],
                    )
                )
                i += 1
            flowables.append(Spacer(1, 4))
            continue

        # ── Pipe tables ──
        if "|" in stripped and stripped.startswith("|"):
            table_rows: list[str] = []
            while (
                i < len(lines)
                and "|" in lines[i].strip()
                and lines[i].strip().startswith("|")
            ):
                row = lines[i].strip()
                if not re.match(r"^\|[\s\-:|]+\|$", row):
                    table_rows.append(row)
                i += 1

            if table_rows:
                table_data: list[list] = []
                for row_idx, row in enumerate(table_rows):
                    cells_raw = row.strip("|").split("|")
                    style = styles["table_header"] if row_idx == 0 else styles["table_cell"]
                    cells = [Paragraph(inline_format(c.strip()), style) for c in cells_raw]
                    table_data.append(cells)

                if table_data:
                    num_cols = max(len(r) for r in table_data)
                    col_width = (CONTENT_W - 4) / num_cols
                    t = Table(table_data, colWidths=[col_width] * num_cols, repeatRows=1)
                    t.setStyle(TableStyle([
                        # Header row
                        ("BACKGROUND", (0, 0), (-1, 0), PALETTE["accent_faint"]),
                        ("FONTSIZE", (0, 0), (-1, 0), 8.5),
                        # All rows
                        ("FONTSIZE", (0, 1), (-1, -1), 9),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                        # Subtle grid
                        ("LINEBELOW", (0, 0), (-1, 0), 0.6, PALETTE["accent"]),
                        ("LINEBELOW", (0, 1), (-1, -1), 0.3, PALETTE["rule"]),
                        # Alternating row background
                        *[
                            ("BACKGROUND", (0, r), (-1, r), PALETTE["cream_dark"])
                            for r in range(2, len(table_data), 2)
                        ],
                    ]))
                    flowables.append(Spacer(1, 6))
                    flowables.append(t)
                    flowables.append(Spacer(1, 10))
            continue

        # ── Footnote lines [N] — render inline, don't collect ──
        if re.match(r"^\[\d+\]", stripped):
            flowables.append(Paragraph(inline_format(stripped), styles["footnote"]))
            i += 1
            continue

        # ── Regular paragraphs (collect continuation lines) ──
        para_lines = [stripped]
        i += 1
        while i < len(lines):
            next_stripped = lines[i].strip()
            if (
                not next_stripped
                or next_stripped.startswith("#")
                or _is_bullet(next_stripped)
                or next_stripped.startswith("```")
                or next_stripped.startswith("|")
                or next_stripped.startswith(">")
                or _is_numbered(next_stripped)
                or re.match(r"^\[\d+\]", next_stripped)
                or re.match(r"^[-*_]{3,}\s*$", next_stripped)
            ):
                break
            para_lines.append(next_stripped)
            i += 1

        paragraph_text = " ".join(para_lines)
        flowables.append(Paragraph(inline_format(paragraph_text), styles["body"]))

    return flowables


# ── Title page builder ───────────────────────────────────────────────

def build_title_page(meta: dict[str, str], styles: dict[str, ParagraphStyle]) -> list:
    """Construct the title page flowables. Dramatic, austere."""
    story: list = []

    # Push title down for visual balance
    story.append(Spacer(1, 2.8 * inch))

    # Title — big, bold, serif
    title = meta.get("title", "Research Report")
    story.append(Paragraph(escape_xml(title), styles["title"]))
    story.append(Spacer(1, 6))

    # Thin accent rule under title
    story.append(ThinRule(color=PALETTE["accent"]))
    story.append(Spacer(1, 18))

    # Metadata block — stacked labels and values
    meta_fields = [
        ("DATE", meta.get("date", "")),
        ("DOMAIN", meta.get("domain", "")),
        ("SOURCES", meta.get("sources", "")),
        ("VERIFIED", meta.get("verified", "")),
    ]
    for label, value in meta_fields:
        if value:
            story.append(Paragraph(label, styles["meta_label"]))
            story.append(Paragraph(escape_xml(str(value)), styles["meta_value"]))

    story.append(NextPageTemplate("body"))
    story.append(PageBreak())

    return story


# ── Document assembly ────────────────────────────────────────────────

def generate_pdf(input_path: str, output_path: str) -> None:
    """Generate a literary-aesthetic PDF from a markdown research report."""
    source = Path(input_path).read_text(encoding="utf-8")
    meta, body = parse_frontmatter(source)
    styles = build_styles()

    # Build document with two page templates: title + body
    frame = Frame(
        MARGIN_LEFT, MARGIN_BOTTOM,
        CONTENT_W, PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
        id="main",
    )

    doc = BaseDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        leftMargin=MARGIN_LEFT,
        rightMargin=MARGIN_RIGHT,
    )

    # Store title for running header
    doc._report_title = meta.get("title", "Research Report")

    doc.addPageTemplates([
        PageTemplate(id="title", frames=[frame], onPage=_draw_title_page),
        PageTemplate(id="body", frames=[frame], onPage=_draw_body_page),
    ])

    story: list = []

    # Title page
    story.extend(build_title_page(meta, styles))

    # Body content
    story.extend(markdown_to_flowables(body, styles))

    # Build the PDF
    doc.build(story)
    print(f"PDF generated: {output_path}")


# ── CLI ──────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate a literary-aesthetic PDF from a markdown research report"
    )
    parser.add_argument("--input", required=True, help="Input markdown file")
    parser.add_argument("--output", required=True, help="Output PDF file")
    args = parser.parse_args()

    if not Path(args.input).exists():
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    generate_pdf(args.input, args.output)


if __name__ == "__main__":
    main()
