#!/usr/bin/env python3
"""One-off transforms for revenue layout: wrap inline ads, sidebar on sizes/guides/reference, ads-layout.js."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

ADS_SCRIPT = '  <script src="/js/ads-layout.js" defer></script>\n'

INLINE_EN = (
    '      <aside class="ad-slot ad-slot--inline" aria-label="Advertisement" '
    'data-ad-placeholder="true"></aside>'
)
INLINE_EN_WRAP = """      <div class="ad-container">
        <div class="ad-label">Sponsored</div>
        <aside class="ad-slot ad-slot--inline" aria-label="Advertisement" data-ad-placeholder="true"></aside>
      </div>"""

INLINE_ES = (
    '      <aside class="ad-slot ad-slot--inline" aria-label="Publicidad" '
    'data-ad-placeholder="true"></aside>'
)
INLINE_ES_WRAP = """      <div class="ad-container">
        <div class="ad-label">Patrocinado</div>
        <aside class="ad-slot ad-slot--inline" aria-label="Publicidad" data-ad-placeholder="true"></aside>
      </div>"""

SIDEBAR_BLOCK = """    <aside class="sidebar-ad" aria-label="Advertisement">
      <div class="ad-slot ad-slot--sidebar" data-ad-placeholder="true"></div>
    </aside>
"""

INLINE_GUIDE_EN = """      <div class="ad-container">
        <div class="ad-label">Sponsored</div>
        <aside class="ad-slot ad-slot--inline" aria-label="Advertisement" data-ad-placeholder="true"></aside>
      </div>

"""

INLINE_GUIDE_ES = """      <div class="ad-container">
        <div class="ad-label">Patrocinado</div>
        <aside class="ad-slot ad-slot--inline" aria-label="Publicidad" data-ad-placeholder="true"></aside>
      </div>

"""


def add_ads_script(html: str) -> str:
    if "ads-layout.js" in html:
        return html
    # Insert before </body>
    if "</body>" not in html:
        return html
    return html.replace("</body>", ADS_SCRIPT + "</body>", 1)


def wrap_inline_ads(html: str) -> str:
    """Wrap standalone inline ad; skip lines already inside .ad-container (idempotent)."""

    def wrap_line(html_in: str, inline: str, wrap: str) -> str:
        pos = 0
        while True:
            idx = html_in.find(inline, pos)
            if idx == -1:
                return html_in
            before = html_in[max(0, idx - 120) : idx]
            if 'ad-label' in before:
                pos = idx + len(inline)
                continue
            return html_in[:idx] + wrap + html_in[idx + len(inline) :]

    html = wrap_line(html, INLINE_EN, INLINE_EN_WRAP)
    html = wrap_line(html, INLINE_ES, INLINE_ES_WRAP)
    return html


def inject_sidebar_layout(html: str) -> str:
    """Wrap <article>...</article> in layout + sidebar. Idempotent."""
    if "layout--with-sidebar" in html:
        return html
    # After <main id="content" class="container"> (with optional newline variants)
    main_open = re.search(
        r'(<main id="content" class="container">\s*)',
        html,
    )
    if not main_open:
        return html
    # Find </article> that is followed by related-links or footer pattern — first closing article before related-links inside main
    # Use non-greedy: from main to first </article> before <div id="related-links"
    m = re.search(
        r'<main id="content" class="container">\s*<article>',
        html,
    )
    if not m:
        return html

    idx = m.end() - len("<article>")
    # Insert opening layout + article reopen — actually we need: main -> div.layout -> article
    # Simpler: replace `<main id="content" class="container">\n    <article>` with main + div + article

    html = re.sub(
        r'<main id="content" class="container">\s*<article>',
        '<main id="content" class="container">\n  <div class="layout layout--with-sidebar">\n    <article>',
        html,
        count=1,
    )

    # After </article> that precedes <div id="related-links"
    html = re.sub(
        r'(</article>)\s*(<div id="related-links")',
        r"\1\n" + SIDEBAR_BLOCK + r"  </div>\n  \2",
        html,
        count=1,
    )
    return html


def add_guide_inline_ad(html: str, spanish: bool) -> str:
    """Insert inline ad before guide-links section, or before </article> if no guide-links."""
    block = INLINE_GUIDE_ES if spanish else INLINE_GUIDE_EN
    gl = "<section class=\"card guide-links\">"
    if gl in html:
        idx_gl = html.find(gl)
        idx_ad = html.find("ad-container")
        if idx_ad != -1 and idx_ad < idx_gl:
            return html
        return html.replace("      " + gl, block + "      " + gl, 1)

    if "ad-slot--inline" in html:
        return html

    # Hub pages: </article> then sidebar (after layout inject) or related-links only
    m = re.search(
        r"(\s+)(</article>\s*\n\s*<aside class=\"sidebar-ad\")",
        html,
    )
    if m:
        return html.replace(m.group(0), m.group(1) + block + m.group(1) + m.group(2), 1)

    return re.sub(
        r"(\s+)(</article>\s*\n\s*<div id=\"related-links\")",
        r"\1" + block + r"\1\2",
        html,
        count=1,
    )


def process_file(path: Path) -> None:
    rel = path.relative_to(ROOT)
    text = path.read_text(encoding="utf-8")
    orig = text

    text = wrap_inline_ads(text)

    s = str(rel).replace("\\", "/")
    if s.startswith("sizes/") or s.startswith("es/sizes/"):
        text = inject_sidebar_layout(text)
    if s.startswith("guides/"):
        text = inject_sidebar_layout(text)
        text = add_guide_inline_ad(text, spanish=False)
    if s.startswith("es/guides/"):
        text = inject_sidebar_layout(text)
        text = add_guide_inline_ad(text, spanish=True)
    if s.startswith("reference/"):
        text = inject_sidebar_layout(text)
        text = add_guide_inline_ad(text, spanish=False)

    text = add_ads_script(text)

    if text != orig:
        path.write_text(text, encoding="utf-8")
        print("updated", rel)


def main() -> None:
    globs = [
        "tools/*.html",
        "sizes/*.html",
        "guides/*.html",
        "reference/*.html",
        "es/tools/*.html",
        "es/sizes/*.html",
        "es/guides/*.html",
    ]
    for pattern in globs:
        for path in sorted(ROOT.glob(pattern)):
            process_file(path)


if __name__ == "__main__":
    main()
