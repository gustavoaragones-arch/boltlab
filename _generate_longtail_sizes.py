#!/usr/bin/env python3
"""Generate M3–M20 long-tail size spoke pages. Run from repo root; delete after use."""
from __future__ import annotations

import json
import re
from html import escape, unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SIZES = ROOT / "sizes"
LASTMOD = "2026-04-15"

# Coarse pitch (mm), fine pitch (mm or None), tap drill coarse (mm), clearance medium (mm), hex (mm str), closest UNC/imperial label
SPECS: dict[int, dict] = {
    3: {"coarse": 0.5, "fine": 0.35, "tap": 2.5, "clear": 3.4, "hex": "5.5", "inch": "#4-40"},
    4: {"coarse": 0.7, "fine": 0.5, "tap": 3.3, "clear": 4.5, "hex": "7", "inch": "#8-32"},
    5: {"coarse": 0.8, "fine": 0.5, "tap": 4.2, "clear": 5.5, "hex": "8", "inch": "#10-24"},
    6: {"coarse": 1.0, "fine": 0.75, "tap": 5.0, "clear": 6.6, "hex": "10", "inch": "1/4-20"},
    7: {"coarse": 1.0, "fine": 0.75, "tap": 6.0, "clear": 7.6, "hex": "11", "inch": "between M6 and 1/4\""},
    8: {"coarse": 1.25, "fine": 1.0, "tap": 6.8, "clear": 9.0, "hex": "13", "inch": "5/16-18"},
    9: {"coarse": 1.25, "fine": 1.0, "tap": 7.8, "clear": 10.0, "hex": "14", "inch": "between M8 and M10"},
    10: {"coarse": 1.5, "fine": 1.25, "tap": 8.5, "clear": 11.0, "hex": "17", "inch": "3/8-16"},
    11: {"coarse": 1.5, "fine": 1.25, "tap": 9.5, "clear": 12.0, "hex": "18", "inch": "7/16-14 (approx.)"},
    12: {"coarse": 1.75, "fine": 1.5, "tap": 10.2, "clear": 13.5, "hex": "19", "inch": "1/2-13"},
    13: {"coarse": 1.75, "fine": 1.5, "tap": 11.2, "clear": 14.5, "hex": "20", "inch": "1/2-13 (approx.)"},
    14: {"coarse": 2.0, "fine": 1.5, "tap": 12.0, "clear": 15.5, "hex": "22", "inch": "9/16-12"},
    15: {"coarse": 1.5, "fine": 1.0, "tap": 13.5, "clear": 16.5, "hex": "24", "inch": "5/8-11 (approx.)"},
    16: {"coarse": 2.0, "fine": 1.5, "tap": 14.0, "clear": 17.5, "hex": "24", "inch": "5/8-11"},
    17: {"coarse": 1.5, "fine": 1.0, "tap": 15.5, "clear": 18.0, "hex": "27", "inch": "5/8-11 (approx.)"},
    18: {"coarse": 2.5, "fine": 2.0, "tap": 15.5, "clear": 20.0, "hex": "27", "inch": "3/4-10"},
    19: {"coarse": 2.5, "fine": 2.0, "tap": 16.5, "clear": 21.0, "hex": "30", "inch": "3/4-10 (approx.)"},
    20: {"coarse": 2.5, "fine": 1.5, "tap": 17.5, "clear": 22.0, "hex": "30", "inch": "3/4-10"},
}


def vs_partner(n: int) -> int:
    m = {3: 4, 4: 5, 5: 6, 6: 8, 7: 8, 8: 10, 9: 10, 10: 12, 11: 12, 12: 14, 13: 14, 14: 16, 15: 16, 16: 18, 17: 18, 18: 20, 19: 20, 20: 18}
    return m[n]


def prev_size(n: int) -> int | None:
    return None if n <= 3 else n - 1


def next_size(n: int) -> int | None:
    return None if n >= 20 else n + 1


def es_href(n: int) -> str:
    return f"https://boltlab.io/es/sizes/perno-m{n}.html"


def clamp_meta(s: str) -> str:
    s = s.strip()
    if len(s) > 155:
        s = s[:152].rsplit(" ", 1)[0] + "."
    if len(s) < 140:
        s = (s + " Check drawings before production runs.").strip()
        if len(s) < 140:
            s = (s + " Use hub tables for tolerances.").strip()
        if len(s) < 140:
            s = (s + " Compare prints to hardware.").strip()
    if len(s) > 155:
        s = s[:152].rsplit(" ", 1)[0] + "."
    return s


HEADER = """  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/">BoltLab</a>
      <nav aria-label="Primary">
        <ul class="nav-list">
          <li><a href="/tools/metric-to-imperial-screw-converter.html">Tools</a></li>
          <li><a href="/charts/">Charts</a></li>
          <li><a href="/reference/">Reference</a></li>
          <li><a href="/sizes/">Sizes</a></li>
          <li><a href="/guides/">Guides</a></li>
        </ul>
      </nav>
      <div class="lang-switch" role="navigation" aria-label="Language">
        <a href="{en_url}" class="lang-switch-link lang-switch-link--active" hreflang="en" aria-current="page">EN</a>
        <span class="lang-switch-sep" aria-hidden="true">|</span>
        <a href="{es_url}" class="lang-switch-link" hreflang="es">ES</a>
      </div>
    </div>
  </header>"""

FOOTER = """      <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <a class="footer-logo" href="/">BoltLab</a>
        <p class="footer-tagline">Precision fastener tools for real-world use.</p>
      </div>
      <nav class="footer-nav footer-nav-center" aria-label="Product">
        <a href="/tools/metric-to-imperial-screw-converter.html">Tools</a>
        <a href="/charts/">Charts</a>
        <a href="/sizes/">Sizes</a>
        <a href="/guides/">Guides</a>
      </nav>
      <nav class="footer-nav footer-nav-right" aria-label="Company">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
      </nav>
    </div>
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p class="footer-copyright">© BoltLab — A product of Albor Digital LLC</p>
        <p class="footer-domains"><span class="footer-domains-label">Supporting domains:</span> screwsizechart.com · boltgradechart.com</p>
      </div>
    </div>
  </footer>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Albor Digital LLC","url":"https://albor.digital","email":"contact@albor.digital","sameAs":["https://boltlab.io","https://screwsizechart.com","https://boltgradechart.com"]}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"BoltLab","url":"https://boltlab.io","publisher":{"@type":"Organization","name":"Albor Digital LLC"}}</script>
  <script src="/js/link-engine.js" defer></script>
  <script src="/js/context-anchor-engine.js" defer></script>
  <script src="/js/anchor-engine.js" defer></script>

  <script src="/js/ads-layout.js" defer></script>"""


def internal_block(n: int, en_path: str) -> str:
    hub = f"/sizes/m{n}-bolt-size.html"
    prev_n = prev_size(n)
    next_n = next_size(n)
    lines = [
        '      <section class="card">',
        f"        <h2>M{n} links and tools</h2>",
        f'        <p>Open the <a href="{hub}">bolt size chart (M{n})</a> for hex, pitch, and tap drill in one hub table.</p>',
        '        <p>Use <a href="/tools/tap-drill-calculator.html">tap drill size</a> when pitch differs from coarse or you need a quick recalculation.</p>',
        '        <p>Run the <a href="/tools/thread-identifier.html">thread identifier</a> after you measure major diameter and pitch on a sample thread.</p>',
        '        <p>Compare stocked inch hardware with <a href="/tools/metric-to-imperial-screw-converter.html">screw size conversion</a> when you cross-shop bins.</p>',
        '        <p>Convert pitch units with the <a href="/tools/thread-pitch-to-tpi-converter.html">thread pitch chart</a> tool when drawings mix mm and TPI.</p>',
        '        <p>Review <a href="/reference/thread-types.html">metric vs unc thread</a> naming before you mix UNC taps with metric holes.</p>',
    ]
    if prev_n:
        lines.append(
            f'        <p>Neighbor metric hub: <a href="/sizes/m{prev_n}-bolt-size.html">bolt size chart (M{prev_n})</a> for the next smaller shank.</p>'
        )
    if next_n:
        lines.append(
            f'        <p>Neighbor metric hub: <a href="/sizes/m{next_n}-bolt-size.html">bolt size chart (M{next_n})</a> for the next larger shank.</p>'
        )
    lines.append("      </section>")
    return "\n".join(lines)


def page_shell(
    title: str,
    desc: str,
    canonical: str,
    en_path: str,
    h1: str,
    breadcrumb_tail: str,
    aeo_p1: str,
    aeo_p2: str,
    aeo_p3: str,
    body_inner: str,
    faq_json: dict | None,
) -> str:
    es = es_href(int(re.search(r"M(\d+)", h1).group(1))) if re.search(r"M(\d+)", h1) else "https://boltlab.io/es/sizes/"
    faq_block = ""
    if faq_json:
        faq_block = (
            "\n  <script type=\"application/ld+json\">\n  "
            + json.dumps(faq_json, separators=(",", ":"))
            + "\n  </script>"
        )
    org = (
        '  <script type="application/ld+json">'
        '{"@context":"https://schema.org","@type":"Article","headline":"'
        + json.dumps(h1)[1:-1]
        + '","url":"'
        + canonical
        + '"}</script>'
    )
    if faq_json:
        org = faq_block
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{escape(desc, quote=True)}">
  <link rel="canonical" href="{canonical}">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="alternate" hreflang="en" href="{canonical}" />
  <link rel="alternate" hreflang="es" href="{es}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
{org if not faq_json else faq_block}
</head>
<body>
{HEADER.format(en_url="https://boltlab.io" + en_path, es_url=es)}
  <main id="content" class="container">
  <div class="layout layout--with-sidebar">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/sizes/">Bolt Sizes</a> → {breadcrumb_tail}</nav>
      <h1>{h1}</h1>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>{aeo_p1}</p>
        <p>{aeo_p2}</p>
        <p>{aeo_p3}</p>
      </div>
{body_inner}
{internal_block(int(re.search("M([0-9]+)", h1).group(1)), en_path)}
      <div class="ad-container">
        <div class="ad-label">Sponsored</div>
        <aside class="ad-slot ad-slot--inline" aria-label="Advertisement" data-ad-placeholder="true"></aside>
      </div>
      <section class="card guide-links">
        <h3>Related on BoltLab</h3>
        <p><a href="/reference/thread-types.html">metric vs unc thread</a> · <a href="/tools/thread-pitch-to-tpi-converter.html">thread pitch chart</a></p>
      </section>
    </article>
    <aside class="sidebar-ad" aria-label="Advertisement">
      <div class="ad-slot ad-slot--sidebar" data-ad-placeholder="true"></div>
    </aside>
  </div>
  <div id="related-links" class="related-links" aria-label="Related links"></div>
  </main>
{FOOTER}
</body>
</html>
"""


def faq_page(name: str, text: str) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{"@type": "Question", "name": name, "acceptedAnswer": {"@type": "Answer", "text": text}}],
    }


def gen_tap_drill(n: int) -> str:
    s = SPECS[n]
    p, c, t = s["fine"], s["coarse"], s["tap"]
    fine_txt = f"{p} mm" if p else "special order"
    title = f"M{n} Tap Drill Size (mm chart + calculator)"
    desc = clamp_meta(
        f"M{n} tap drill is {t}mm for ISO coarse pitch {c}mm. Use the calculator and hub chart to adjust for fine {fine_txt} pitch."
    )
    h1 = f"M{n} tap drill size (ISO coarse)"
    bc = f"M{n} tap drill"
    a1 = f"M{n} tap drill size is {t} mm for standard {c} mm coarse pitch under common ISO workshop tables."
    a2 = f"Fine pitch {fine_txt} changes the subtractive tap drill rule, so always confirm against your tap manufacturer sheet."
    a3 = "Use the tap drill calculator below on BoltLab, then cross-check the bolt size chart hub for hex and pitch context."
    body = f"""      <p class="muted">Workshop practice often uses major diameter minus pitch; your tap packaging may specify a slightly different pilot for thread percentage.</p>
      <section class="card">
        <h2>M{n} tap drill reference</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead>
            <tbody>
              <tr><td>Coarse pitch</td><td>{c} mm</td></tr>
              <tr><td>Typical tap drill (coarse)</td><td>{t} mm</td></tr>
              <tr><td>Fine pitch (common)</td><td>{fine_txt}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Shop workflow</h2>
        <p>Drill the pilot, chamfer the hole, then tap with cutting fluid and aligned squareness. Re-measure pitch with a gauge if the part is safety-critical.</p>
      </section>"""
    fq = faq_page(
        f"What tap drill for M{n} coarse?",
        f"For M{n} × {c} mm coarse, a {t} mm pilot is the common ISO workshop value; verify with your tap maker for exact thread percentage.",
    )
    return page_shell(
        title,
        desc,
        f"https://boltlab.io/sizes/m{n}-tap-drill.html",
        f"/sizes/m{n}-tap-drill.html",
        h1,
        bc,
        a1,
        a2,
        a3,
        body,
        fq,
    )


def gen_clearance(n: int) -> str:
    s = SPECS[n]
    cl = s["clear"]
    title = f"M{n} Clearance Hole Size (standard chart)"
    desc = clamp_meta(
        f"M{n} clearance hole about {cl}mm suits medium-fit through holes for shank clearance. Compare with the hub chart before you burnish plates."
    )
    h1 = f"M{n} clearance hole size (medium fit)"
    a1 = f"A practical medium clearance hole for an M{n} shank is about {cl} mm for slip fit in sheet and plate layouts."
    a2 = "Tight or close fits use smaller pilots; oversized holes add play and lower bearing on the bolt shoulder."
    a3 = "Compare the hub bolt size chart, then open screw size conversion if you must align metric holes with inch hardware bins."
    body = f"""      <p class="muted">These values target common machine-design slip fits; verify against ISO 273 or your assembly drawing tolerance class.</p>
      <section class="card">
        <h2>M{n} clearance hole</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Fit intent</th><th scope="col">Clearance diameter</th></tr></thead>
            <tbody>
              <tr><td>Nominal bolt</td><td>M{n}</td></tr>
              <tr><td>Medium slip (typical)</td><td>{cl} mm</td></tr>
              <tr><td>Notes</td><td>Deburr; add positional tolerance for stacked plates.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>When clearance changes</h2>
        <p>Paint thickness, thermal growth, or sleeve bushings can require opening holes slightly; never shrink below tap-drill sizes on threaded bosses.</p>
      </section>"""
    fq = faq_page(
        f"What clearance hole for M{n}?",
        f"A common medium clearance is near {cl} mm for M{n} bolts; confirm with your drawing tolerance block.",
    )
    return page_shell(
        title,
        desc,
        f"https://boltlab.io/sizes/m{n}-clearance-hole.html",
        f"/sizes/m{n}-clearance-hole.html",
        h1,
        f"M{n} clearance",
        a1,
        a2,
        a3,
        body,
        fq,
    )


def gen_pitch(n: int) -> str:
    s = SPECS[n]
    c, f = s["coarse"], s["fine"]
    fv = f"{f} mm" if f else "see supplier"
    title = f"M{n} Thread Pitch Chart (coarse vs fine)"
    desc = clamp_meta(
        f"M{n} coarse pitch is {c}mm; fine is often {fv}. Use the pitch converter and hub chart before you retap an existing hole."
    )
    h1 = f"M{n} thread pitch (coarse vs fine)"
    a1 = f"M{n} ISO coarse pitch is {c} mm; fine-series pitches are commonly near {fv} when listed on drawings."
    a2 = "Mixing coarse and fine on the same nominal diameter yields different tap drills and gauge results."
    a3 = "Use the thread pitch chart tool on BoltLab, then the thread identifier if field threads look worn or double-started."
    body = f"""      <p class="muted">Pitch is axial distance per thread in millimeters for metric; always match tap, gauge, and nut class to the same series.</p>
      <section class="card">
        <h2>M{n} pitch table</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Series</th><th scope="col">Pitch</th></tr></thead>
            <tbody>
              <tr><td>ISO coarse (common)</td><td>{c} mm</td></tr>
              <tr><td>Fine (typical when shown)</td><td>{fv}</td></tr>
              <tr><td>Tap drill (coarse)</td><td>{s["tap"]} mm</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Design note</h2>
        <p>Fine threads allow finer adjustment and more threads in a blind hole; coarse threads strip less easily in softer materials when engagement length is short.</p>
      </section>"""
    fq = faq_page(
        f"What is M{n} coarse pitch?",
        f"M{n} coarse pitch is {c} mm in common ISO listings; fine variants differ by class and supplier.",
    )
    return page_shell(
        title,
        desc,
        f"https://boltlab.io/sizes/m{n}-thread-pitch.html",
        f"/sizes/m{n}-thread-pitch.html",
        h1,
        f"M{n} pitch",
        a1,
        a2,
        a3,
        body,
        fq,
    )


def gen_vs(n: int) -> str:
    b = vs_partner(n)
    sa, sb = SPECS[n], SPECS[b]
    fname = f"m{n}-vs-m{b}.html"
    title = f"M{n} vs M{b} Bolt Size (full comparison)"
    desc = clamp_meta(
        f"M{n} uses {n}mm major diameter; M{b} uses {b}mm with stronger shank and larger hex. Use the hub charts and conversion tool to pick stock."
    )
    h1 = f"M{n} vs M{b} bolt size comparison"
    a1 = f"M{n} runs a {n} mm major diameter with {sa['coarse']} mm coarse pitch, while M{b} steps to {b} mm and {sb['coarse']} mm coarse pitch."
    a2 = f"Hex grows from {sa['hex']} mm to {sb['hex']} mm keys, and tap drills move from {sa['tap']} mm to {sb['tap']} mm pilots for coarse threads."
    a3 = "Open each bolt size chart hub, then run screw size conversion when you must match mixed metric bins to inch racks."
    body = f"""      <p class="muted">Choose the smaller fastener when sheet thickness and head height are tight; upsize when joint slip or fatigue margins demand more clamp area.</p>
      <section class="card">
        <h2>Side-by-side</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Spec</th><th scope="col">M{n}</th><th scope="col">M{b}</th></tr></thead>
            <tbody>
              <tr><td>Major diameter</td><td>{n} mm</td><td>{b} mm</td></tr>
              <tr><td>Coarse pitch</td><td>{sa['coarse']} mm</td><td>{sb['coarse']} mm</td></tr>
              <tr><td>Tap drill (coarse)</td><td>{sa['tap']} mm</td><td>{sb['tap']} mm</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Load and tooling</h2>
        <p>Larger diameters increase tensile area roughly with d² trend; wrench fit and head height also jump, so check tool clearance before you change series.</p>
      </section>"""
    fq = faq_page(
        f"When pick M{n} instead of M{b}?",
        f"M{n} fits lighter gauges and smaller bosses; M{b} adds strength and larger drive tools—match to joint loads and wrench access.",
    )
    # internal block still uses n as primary for hub M{n}
    html = page_shell(
        title,
        desc,
        f"https://boltlab.io/sizes/{fname}",
        f"/sizes/{fname}",
        h1,
        f"M{n} vs M{b}",
        a1,
        a2,
        a3,
        body,
        fq,
    )
    # fix internal_block anchor hub - still M{n} primary page topic
    return html


def gen_to_inch(n: int) -> str:
    s = SPECS[n]
    inch = s["inch"]
    title = f"M{n} to Inch Conversion (chart + tool)"
    desc = clamp_meta(
        f"M{n} maps closest to {inch} in many North American racks. Use screw size conversion, then verify pitch with the thread identifier."
    )
    h1 = f"M{n} to inch bolt conversion"
    a1 = f"M{n} metric major diameter {n} mm often pairs in shops with closest inch stock near {inch} for rough hardware swaps."
    a2 = "Threads are not drop-in identical: pitch in millimeters differs from UNC TPI even when diameters look close on calipers."
    a3 = "Run screw size conversion on BoltLab, then read metric vs unc thread notes before you retap mixed-material joints."
    body = f"""      <p class="muted">Use this page when you are translating BOM lines or field repairs between metric bins and imperial assortments.</p>
      <section class="card">
        <h2>M{n} inch reference</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Field</th><th scope="col">Value</th></tr></thead>
            <tbody>
              <tr><td>Metric nominal</td><td>M{n}</td></tr>
              <tr><td>Coarse pitch</td><td>{s['coarse']} mm</td></tr>
              <tr><td>Common inch counterpart (rough)</td><td>{inch}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Verification</h2>
        <p>Measure major diameter and pitch, then compare against the thread pitch chart tool output when a drawing lists TPI instead of millimeters.</p>
      </section>"""
    fq = faq_page(
        f"What inch bolt is closest to M{n}?",
        f"Many shops stock {inch} as a rough counterpart to M{n}; always verify pitch and class before interchange.",
    )
    return page_shell(
        title,
        desc,
        f"https://boltlab.io/sizes/m{n}-to-inch.html",
        f"/sizes/m{n}-to-inch.html",
        h1,
        f"M{n} to inch",
        a1,
        a2,
        a3,
        body,
        fq,
    )


def fix_page_shell_article_json(n: int, en_path: str, h1: str, faq_json: dict | None) -> None:
    """page_shell incorrectly used faq_block vs article - simplify: always FAQ for spokes."""
    pass


# Fix gen: page_shell org variable logic - use FAQ when faq_json provided
def page_shell2(
    title: str,
    desc: str,
    canonical: str,
    en_path: str,
    h1: str,
    breadcrumb_tail: str,
    aeo_p1: str,
    aeo_p2: str,
    aeo_p3: str,
    body_inner: str,
    faq_json: dict | None,
    n: int,
) -> str:
    es = es_href(n)
    head_json = ""
    if faq_json:
        head_json = (
            "\n  <script type=\"application/ld+json\">\n  "
            + json.dumps(faq_json, separators=(",", ":"))
            + "\n  </script>"
        )
    else:
        head_json = (
            "\n  <script type=\"application/ld+json\">\n  "
            + json.dumps(
                {
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": h1,
                    "url": canonical,
                },
                separators=(",", ":"),
            )
            + "\n  </script>"
        )
    ib = internal_block(n, en_path)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{escape(desc, quote=True)}">
  <link rel="canonical" href="{canonical}">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="alternate" hreflang="en" href="{canonical}" />
  <link rel="alternate" hreflang="es" href="{es}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
{head_json}
</head>
<body>
{HEADER.format(en_url="https://boltlab.io" + en_path, es_url=es)}
  <main id="content" class="container">
  <div class="layout layout--with-sidebar">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/sizes/">Bolt Sizes</a> → {breadcrumb_tail}</nav>
      <h1>{h1}</h1>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>{aeo_p1}</p>
        <p>{aeo_p2}</p>
        <p>{aeo_p3}</p>
      </div>
{body_inner}
{ib}
      <div class="ad-container">
        <div class="ad-label">Sponsored</div>
        <aside class="ad-slot ad-slot--inline" aria-label="Advertisement" data-ad-placeholder="true"></aside>
      </div>
      <section class="card guide-links">
        <h3>Related on BoltLab</h3>
        <p><a href="/reference/thread-types.html">metric vs unc thread</a> · <a href="/tools/thread-pitch-to-tpi-converter.html">thread pitch chart</a></p>
      </section>
    </article>
    <aside class="sidebar-ad" aria-label="Advertisement">
      <div class="ad-slot ad-slot--sidebar" data-ad-placeholder="true"></div>
    </aside>
  </div>
  <div id="related-links" class="related-links" aria-label="Related links"></div>
  </main>
{FOOTER}
</body>
</html>
"""


# Re-define generators to use page_shell2 and fix internal_block extraction of n


def write_all() -> None:
    for n in range(3, 21):
        s = SPECS[n]
        p, c, t = s["fine"], s["coarse"], s["tap"]
        fine_txt = f"{p} mm" if p else "special order"
        # tap drill
        fq = faq_page(
            f"What tap drill for M{n} coarse?",
            f"For M{n} × {c} mm coarse, a {t} mm pilot is the common ISO workshop value; verify with your tap maker for exact thread percentage.",
        )
        body_td = f"""      <p class="muted">Workshop practice often uses major diameter minus pitch; your tap packaging may specify a slightly different pilot for thread percentage.</p>
      <section class="card">
        <h2>M{n} tap drill reference</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead>
            <tbody>
              <tr><td>Coarse pitch</td><td>{c} mm</td></tr>
              <tr><td>Typical tap drill (coarse)</td><td>{t} mm</td></tr>
              <tr><td>Fine pitch (common)</td><td>{fine_txt}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Shop workflow</h2>
        <p>Drill the pilot, chamfer the hole, then tap with cutting fluid and aligned squareness. Re-measure pitch with a gauge if the part is safety-critical.</p>
      </section>"""
        (SIZES / f"m{n}-tap-drill.html").write_text(
            page_shell2(
                f"M{n} Tap Drill Size (mm chart + calculator)",
                clamp_meta(
                    f"M{n} tap drill is {t}mm for ISO coarse pitch {c}mm. Use the calculator and hub chart to adjust for fine {fine_txt} pitch."
                ),
                f"https://boltlab.io/sizes/m{n}-tap-drill.html",
                f"/sizes/m{n}-tap-drill.html",
                f"M{n} tap drill size (ISO coarse)",
                f"M{n} tap drill",
                f"M{n} tap drill size is {t} mm for standard {c} mm coarse pitch under common ISO workshop tables.",
                f"Fine pitch {fine_txt} changes the subtractive tap drill rule, so always confirm against your tap manufacturer sheet.",
                "Use the tap drill calculator on BoltLab, then cross-check the bolt size chart hub for hex and pitch context.",
                body_td,
                fq,
                n,
            ),
            encoding="utf-8",
        )
        # clearance
        cl = s["clear"]
        fq2 = faq_page(
            f"What clearance hole for M{n}?",
            f"A common medium clearance is near {cl} mm for M{n} bolts; confirm with your drawing tolerance block.",
        )
        body_cl = f"""      <p class="muted">These values target common machine-design slip fits; verify against ISO 273 or your assembly drawing tolerance class.</p>
      <section class="card">
        <h2>M{n} clearance hole</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Fit intent</th><th scope="col">Clearance diameter</th></tr></thead>
            <tbody>
              <tr><td>Nominal bolt</td><td>M{n}</td></tr>
              <tr><td>Medium slip (typical)</td><td>{cl} mm</td></tr>
              <tr><td>Notes</td><td>Deburr; add positional tolerance for stacked plates.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>When clearance changes</h2>
        <p>Paint thickness, thermal growth, or sleeve bushings can require opening holes slightly; never shrink below tap-drill sizes on threaded bosses.</p>
      </section>"""
        (SIZES / f"m{n}-clearance-hole.html").write_text(
            page_shell2(
                f"M{n} Clearance Hole Size (standard chart)",
                clamp_meta(
                    f"M{n} clearance hole about {cl}mm suits medium-fit through holes for shank clearance. Compare with the hub chart before you burnish plates."
                ),
                f"https://boltlab.io/sizes/m{n}-clearance-hole.html",
                f"/sizes/m{n}-clearance-hole.html",
                f"M{n} clearance hole size (medium fit)",
                f"M{n} clearance",
                f"A practical medium clearance hole for an M{n} shank is about {cl} mm for slip fit in sheet and plate layouts.",
                "Tight or close fits use smaller pilots; oversized holes add play and lower bearing on the bolt shoulder.",
                "Compare the hub bolt size chart, then open screw size conversion if you must align metric holes with inch hardware bins.",
                body_cl,
                fq2,
                n,
            ),
            encoding="utf-8",
        )
        # pitch
        fv = f"{s['fine']} mm" if s["fine"] else "see supplier"
        fq3 = faq_page(
            f"What is M{n} coarse pitch?",
            f"M{n} coarse pitch is {c} mm in common ISO listings; fine variants differ by class and supplier.",
        )
        body_pt = f"""      <p class="muted">Pitch is axial distance per thread in millimeters for metric; always match tap, gauge, and nut class to the same series.</p>
      <section class="card">
        <h2>M{n} pitch table</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Series</th><th scope="col">Pitch</th></tr></thead>
            <tbody>
              <tr><td>ISO coarse (common)</td><td>{c} mm</td></tr>
              <tr><td>Fine (typical when shown)</td><td>{fv}</td></tr>
              <tr><td>Tap drill (coarse)</td><td>{t} mm</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Design note</h2>
        <p>Fine threads allow finer adjustment and more threads in a blind hole; coarse threads strip less easily in softer materials when engagement length is short.</p>
      </section>"""
        (SIZES / f"m{n}-thread-pitch.html").write_text(
            page_shell2(
                f"M{n} Thread Pitch Chart (coarse vs fine)",
                clamp_meta(
                    f"M{n} coarse pitch is {c}mm; fine is often {fv}. Use the pitch converter and hub chart before you retap an existing hole."
                ),
                f"https://boltlab.io/sizes/m{n}-thread-pitch.html",
                f"/sizes/m{n}-thread-pitch.html",
                f"M{n} thread pitch (coarse vs fine)",
                f"M{n} pitch",
                f"M{n} ISO coarse pitch is {c} mm; fine-series pitches are commonly near {fv} when listed on drawings.",
                "Mixing coarse and fine on the same nominal diameter yields different tap drills and gauge results.",
                "Use the thread pitch chart tool on BoltLab, then the thread identifier if field threads look worn or double-started.",
                body_pt,
                fq3,
                n,
            ),
            encoding="utf-8",
        )
        # vs
        b = vs_partner(n)
        sa, sb = SPECS[n], SPECS[b]
        fname = f"m{n}-vs-m{b}.html"
        fq4 = faq_page(
            f"When pick M{n} instead of M{b}?",
            f"M{n} fits lighter gauges and smaller bosses; M{b} adds strength and larger drive tools—match to joint loads and wrench access.",
        )
        body_vs = f"""      <p class="muted">Choose the smaller fastener when sheet thickness and head height are tight; upsize when joint slip or fatigue margins demand more clamp area.</p>
      <section class="card">
        <h2>Side-by-side</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Spec</th><th scope="col">M{n}</th><th scope="col">M{b}</th></tr></thead>
            <tbody>
              <tr><td>Major diameter</td><td>{n} mm</td><td>{b} mm</td></tr>
              <tr><td>Coarse pitch</td><td>{sa['coarse']} mm</td><td>{sb['coarse']} mm</td></tr>
              <tr><td>Tap drill (coarse)</td><td>{sa['tap']} mm</td><td>{sb['tap']} mm</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Load and tooling</h2>
        <p>Larger diameters increase tensile area roughly with d² trend; wrench fit and head height also jump, so check tool clearance before you change series.</p>
      </section>"""
        (SIZES / fname).write_text(
            page_shell2(
                f"M{n} vs M{b} Bolt Size (full comparison)",
                clamp_meta(
                    f"M{n} uses {n}mm major diameter; M{b} uses {b}mm with stronger shank and larger hex. Use the hub charts and conversion tool to pick stock."
                ),
                f"https://boltlab.io/sizes/{fname}",
                f"/sizes/{fname}",
                f"M{n} vs M{b} bolt size comparison",
                f"M{n} vs M{b}",
                f"M{n} runs a {n} mm major diameter with {sa['coarse']} mm coarse pitch, while M{b} steps to {b} mm and {sb['coarse']} mm coarse pitch.",
                f"Hex grows from {sa['hex']} mm to {sb['hex']} mm keys, and tap drills move from {sa['tap']} mm to {sb['tap']} mm pilots for coarse threads.",
                "Open each bolt size chart hub, then run screw size conversion when you must match mixed metric bins to inch racks.",
                body_vs,
                fq4,
                n,
            ),
            encoding="utf-8",
        )
        # inch
        inch = s["inch"]
        fq5 = faq_page(
            f"What inch bolt is closest to M{n}?",
            f"Many shops stock {inch} as a rough counterpart to M{n}; always verify pitch and class before interchange.",
        )
        body_in = f"""      <p class="muted">Use this page when you are translating BOM lines or field repairs between metric bins and imperial assortments.</p>
      <section class="card">
        <h2>M{n} inch reference</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Field</th><th scope="col">Value</th></tr></thead>
            <tbody>
              <tr><td>Metric nominal</td><td>M{n}</td></tr>
              <tr><td>Coarse pitch</td><td>{c} mm</td></tr>
              <tr><td>Common inch counterpart (rough)</td><td>{inch}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Verification</h2>
        <p>Measure major diameter and pitch, then compare against the thread pitch chart tool output when a drawing lists TPI instead of millimeters.</p>
      </section>"""
        (SIZES / f"m{n}-to-inch.html").write_text(
            page_shell2(
                f"M{n} to Inch Conversion (chart + tool)",
                clamp_meta(
                    f"M{n} maps closest to {inch} in many North American racks. Use screw size conversion, then verify pitch with the thread identifier."
                ),
                f"https://boltlab.io/sizes/m{n}-to-inch.html",
                f"/sizes/m{n}-to-inch.html",
                f"M{n} to inch bolt conversion",
                f"M{n} to inch",
                f"M{n} metric major diameter {n} mm often pairs in shops with closest inch stock near {inch} for rough hardware swaps.",
                "Threads are not drop-in identical: pitch in millimeters differs from UNC TPI even when diameters look close on calipers.",
                "Run screw size conversion on BoltLab, then read metric vs unc thread notes before you retap mixed-material joints.",
                body_in,
                fq5,
                n,
            ),
            encoding="utf-8",
        )


HUB_NEEDLE = '      <section class="card">\n        <h2>How to choose the right bolt size</h2>'
HUB_BLOCK_TMPL = """      <section class="card">
        <h2>M{n} specifications and tools</h2>
        <ul class="meta-list">
          <li><a href="/sizes/m{n}-tap-drill.html">M{n} tap drill size</a></li>
          <li><a href="/sizes/m{n}-clearance-hole.html">M{n} clearance hole</a></li>
          <li><a href="/sizes/m{n}-thread-pitch.html">M{n} thread pitch</a></li>
          <li><a href="/sizes/m{n}-vs-m{vs}.html">M{n} vs M{vs} comparison</a></li>
          <li><a href="/sizes/m{n}-to-inch.html">M{n} to inch conversion</a></li>
        </ul>
      </section>

"""


def patch_hubs() -> None:
    for n in range(3, 21):
        p = SIZES / f"m{n}-bolt-size.html"
        html = p.read_text(encoding="utf-8")
        if "M{n} specifications and tools".replace("{n}", str(n)) in html:
            continue
        b = vs_partner(n)
        block = HUB_BLOCK_TMPL.format(n=n, vs=b)
        if HUB_NEEDLE not in html:
            raise SystemExit(f"Missing needle in {p}")
        html = html.replace(HUB_NEEDLE, block + HUB_NEEDLE, 1)
        p.write_text(html, encoding="utf-8")


def patch_sitemap() -> None:
    sm = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    if "m3-tap-drill.html" in sm:
        return
    urls = []
    for n in range(3, 21):
        b = vs_partner(n)
        for path in (
            f"m{n}-tap-drill.html",
            f"m{n}-clearance-hole.html",
            f"m{n}-thread-pitch.html",
            f"m{n}-vs-m{b}.html",
            f"m{n}-to-inch.html",
        ):
            urls.append(
                f"""  <url>
    <loc>https://boltlab.io/sizes/{path}</loc>
    <lastmod>{LASTMOD}</lastmod>
    <priority>0.65</priority>
  </url>"""
            )
    insert = "\n".join(urls) + "\n"
    sm = sm.replace("</urlset>", insert + "</urlset>", 1)
    (ROOT / "sitemap.xml").write_text(sm, encoding="utf-8")


def validate() -> None:
    titles = []
    for p in sorted(SIZES.glob("m*-*.html")):
        t = re.search(r"<title>([^<]+)</title>", p.read_text(encoding="utf-8"))
        if t:
            titles.append(t.group(1))
            assert len(t.group(1)) <= 60, (p, len(t.group(1)), t.group(1))
        m = re.search(r'<meta name="description" content="([^"]*)"', p.read_text(encoding="utf-8"))
        meta_plain = unescape(m.group(1)) if m else ""
        assert m and 140 <= len(meta_plain) <= 155, (p, len(meta_plain) if m else 0, meta_plain)
        assert 'class="aeo-answer-block"' in p.read_text(encoding="utf-8")
    dup = [x for x in set(titles) if titles.count(x) > 1]
    assert not dup, dup


if __name__ == "__main__":
    write_all()
    patch_hubs()
    patch_sitemap()
    validate()
    print("OK: 90 pages, hubs, sitemap, validated")
