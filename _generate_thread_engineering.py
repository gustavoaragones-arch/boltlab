#!/usr/bin/env python3
"""Generate Thread Engineering Phase A1 cluster pages."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REF = ROOT / "reference"
TE = REF / "thread-engineering"
CHARTS = ROOT / "charts"
LASTMOD = "2026-07-12"


HEADER = """  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/"><img class="brand-logo" src="/images/boltlab-logo.svg" alt="">BoltLab</a>
      <nav aria-label="Primary">
        <ul class="nav-list">
          <li><a href="/tools/metric-to-imperial-screw-converter">Tools</a></li>
          <li><a href="/charts/">Charts</a></li>
          <li><a href="/reference/">Reference</a></li>
          <li><a href="/sizes/">Sizes</a></li>
          <li><a href="/guides/">Guides</a></li>
        </ul>
      </nav>
    </div>
  </header>"""

FOOTER = """  <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <a class="footer-logo" href="/">BoltLab</a>
        <p class="footer-tagline">Precision fastener tools for real-world use.</p>
      </div>
      <nav class="footer-nav footer-nav-center" aria-label="Product">
        <a href="/tools/metric-to-imperial-screw-converter">Tools</a>
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

TOOLS = [
    ("/tools/thread-identifier", "Thread Identifier"),
    ("/tools/thread-pitch-to-tpi-converter", "Thread Pitch Converter"),
    ("/tools/tap-drill-calculator", "Tap Drill Calculator"),
    ("/charts/universal-screw-bolt-size-chart", "Universal Size Chart"),
    ("/tools/screw-identifier", "Screw Identifier"),
]
CHART_LINKS = [
    ("/charts/metric-thread-chart", "Metric Thread Chart"),
    ("/charts/unc-thread-chart", "UNC Chart"),
    ("/charts/unf-thread-chart", "UNF Chart"),
    ("/charts/metric-vs-imperial-chart", "Metric vs Imperial"),
]
GUIDE_LINK = ("/guides/metric-thread-tolerances", "Metric Thread Tolerances")

PAGES = [
    {
        "slug": "thread-tolerances",
        "h1": "What are Thread Tolerances?",
        "title": "What Are Thread Tolerances? | Engineering Reference",
        "subtitle": "Tolerance limits define acceptable thread variation while preserving fit, assembly reliability, and interchangeability.",
        "desc": "Thread tolerances define allowable variation in thread dimensions, fit, and function. Learn the engineering framework, inspection logic, and linked references.",
    },
    {
        "slug": "metric-thread-tolerance-chart",
        "h1": "Metric Thread Tolerance Chart",
        "title": "Metric Thread Tolerance Chart | Engineering Reference",
        "subtitle": "Reference structure for metric tolerance classes, tolerance zones, and fit interpretation before applying verified standards tables.",
        "desc": "Metric thread tolerance chart framework for ISO fit classes, tolerance zones, and engineering interpretation. Includes placeholders for verified standards values.",
    },
    {
        "slug": "iso-thread-tolerances-explained",
        "h1": "ISO Thread Tolerances Explained",
        "title": "ISO Thread Tolerances Explained | Engineering",
        "subtitle": "ISO tolerance systems define limits and deviations for internal and external threads across interchangeable components.",
        "desc": "ISO thread tolerances explained with engineering context for limits, fit classes, and verification workflow. Structured for design and manufacturing teams.",
    },
    {
        "slug": "internal-thread-tolerances",
        "h1": "Internal Thread Tolerances",
        "title": "Internal Thread Tolerances | Engineering Reference",
        "subtitle": "Internal threads use tolerance grades and fundamental deviation to balance assembly clearance and load performance.",
        "desc": "Internal thread tolerances reference for nut and tapped-hole design, fit classes, and inspection flow. Includes standards placeholders where values are required.",
    },
    {
        "slug": "external-thread-tolerances",
        "h1": "External Thread Tolerances",
        "title": "External Thread Tolerances | Engineering Reference",
        "subtitle": "External thread classes govern allowance, pitch diameter range, and interchangeability under production variation.",
        "desc": "External thread tolerances for bolts and studs, including allowance strategy, fit behavior, and metrology checks in production environments.",
    },
    {
        "slug": "thread-fit-classes-explained",
        "h1": "Thread Fit Classes Explained",
        "title": "Thread Fit Classes Explained | Engineering",
        "subtitle": "Fit classes communicate expected clearance or interference and are central to assembly risk control.",
        "desc": "Thread fit classes explained for engineering selection, assembly behavior, and standard interpretation across internal and external thread systems.",
    },
    {
        "slug": "6h-vs-6g",
        "h1": "6H vs 6G",
        "title": "6H vs 6G | Internal Thread Fit Comparison",
        "subtitle": "Internal class letters change tolerance zone location and therefore alter resulting fit against mating external classes.",
        "desc": "6H vs 6G internal thread classes compared with engineering interpretation for fit risk, inspection, and mating class compatibility.",
    },
    {
        "slug": "6g-vs-6h",
        "h1": "6g vs 6h",
        "title": "6g vs 6h | External Thread Fit Comparison",
        "subtitle": "External class letters and case define tolerance-zone position and resulting assembly clearance.",
        "desc": "6g vs 6h external thread classes compared for tolerance zone position, allowance implications, and real manufacturing fit outcomes.",
    },
    {
        "slug": "tolerance-zones-explained",
        "h1": "Tolerance Zones Explained",
        "title": "Tolerance Zones Explained | Thread Engineering",
        "subtitle": "Tolerance zones locate acceptable dimensional variation relative to nominal geometry and drive fit outcomes.",
        "desc": "Tolerance zones explained for thread engineering, including zone position, class notation, and practical fit interpretation during design and inspection.",
    },
    {
        "slug": "fundamental-deviation",
        "h1": "Fundamental Deviation",
        "title": "Fundamental Deviation | Thread Engineering",
        "subtitle": "Fundamental deviation sets tolerance-zone position and therefore determines base clearance strategy.",
        "desc": "Fundamental deviation reference for thread engineering decisions on zone placement, fit behavior, and standards-driven class interpretation.",
    },
    {
        "slug": "pitch-diameter-explained",
        "h1": "Pitch Diameter Explained",
        "title": "Pitch Diameter Explained | Thread Engineering",
        "subtitle": "Pitch diameter is the controlling functional diameter for fit and load transfer in most threaded joints.",
        "desc": "Pitch diameter explained with thread-fit context, measurement implications, and links to tolerance classes and deviation concepts.",
    },
    {
        "slug": "allowance-vs-tolerance",
        "h1": "Allowance vs Tolerance",
        "title": "Allowance vs Tolerance | Thread Engineering",
        "subtitle": "Allowance is intentional offset; tolerance is permissible variation around that target condition.",
        "desc": "Allowance vs tolerance in thread engineering: understand planned clearance versus permissible variation before selecting fit classes and controls.",
    },
]

QUICK_REF = {
    "thread-tolerances": {
        "Thread Type": "Metric ISO and Unified threads",
        "Standard": "ISO 965 framework",
        "Tolerance": "Class-dependent (verified tables pending)",
        "Typical Use": "General engineering specification and inspection planning",
        "Internal / External": "Both",
        "Common Pair": "Internal 6H with external 6g (application dependent)",
    },
    "metric-thread-tolerance-chart": {
        "Thread Type": "Metric ISO",
        "Standard": "ISO 965 (table values pending verification)",
        "Tolerance": "Class matrix structure",
        "Typical Use": "Class selection and fit interpretation",
        "Internal / External": "Both",
        "Common Pair": "6H / 6g baseline reference pair",
    },
    "iso-thread-tolerances-explained": {
        "Thread Type": "Metric ISO",
        "Standard": "ISO 965 family",
        "Tolerance": "Grade + fundamental deviation notation",
        "Typical Use": "Drawing and process interpretation",
        "Internal / External": "Both",
        "Common Pair": "6H / 6g in standard commercial use",
    },
    "internal-thread-tolerances": {
        "Thread Type": "Internal thread classes",
        "Standard": "ISO metric tolerance notation",
        "Tolerance": "Internal class letter + grade",
        "Typical Use": "Nuts and tapped holes",
        "Internal / External": "Internal",
        "Common Pair": "Matched to specified external class",
    },
    "external-thread-tolerances": {
        "Thread Type": "External thread classes",
        "Standard": "ISO metric tolerance notation",
        "Tolerance": "External class letter + grade",
        "Typical Use": "Bolts, studs, threaded shafts",
        "Internal / External": "External",
        "Common Pair": "Matched to specified internal class",
    },
    "thread-fit-classes-explained": {
        "Thread Type": "Fit class system",
        "Standard": "ISO metric class notation",
        "Tolerance": "Class pair defines fit behavior",
        "Typical Use": "Assembly risk and interchangeability control",
        "Internal / External": "Both",
        "Common Pair": "6H / 6g reference fit",
    },
    "6h-vs-6g": {
        "Thread Type": "Internal thread classes",
        "Standard": "ISO metric notation context",
        "Tolerance": "Zone position differs by letter",
        "Typical Use": "Internal class selection for fit target",
        "Internal / External": "Internal",
        "Common Pair": "Usually assessed against external 6g or 6h",
    },
    "6g-vs-6h": {
        "Thread Type": "External thread classes",
        "Standard": "ISO metric notation context",
        "Tolerance": "Zone position differs by letter",
        "Typical Use": "External class selection by clearance need",
        "Internal / External": "External",
        "Common Pair": "Often paired with internal 6H",
    },
    "tolerance-zones-explained": {
        "Thread Type": "Zone interpretation",
        "Standard": "Class notation framework",
        "Tolerance": "Zone width and position",
        "Typical Use": "Fit analysis and gauge strategy",
        "Internal / External": "Both",
        "Common Pair": "Used with class pair definitions",
    },
    "fundamental-deviation": {
        "Thread Type": "Deviation concept",
        "Standard": "Class-position logic",
        "Tolerance": "Controls tolerance zone placement",
        "Typical Use": "Base clearance strategy",
        "Internal / External": "Both",
        "Common Pair": "Interpreted with tolerance grade",
    },
    "pitch-diameter-explained": {
        "Thread Type": "Functional geometry",
        "Standard": "Thread form measurement framework",
        "Tolerance": "Primary fit-controlling diameter",
        "Typical Use": "Go/no-go and metrology interpretation",
        "Internal / External": "Both",
        "Common Pair": "Evaluated with major/minor diameters",
    },
    "allowance-vs-tolerance": {
        "Thread Type": "Fit strategy concepts",
        "Standard": "Engineering specification practice",
        "Tolerance": "Allowance vs permissible variation",
        "Typical Use": "Class pair interpretation",
        "Internal / External": "Both",
        "Common Pair": "Used with tolerance zones and deviation",
    },
}

COMPARISON_ROWS = {
    "6h-vs-6g": [
        ("Feature", "6H", "6G"),
        ("Internal thread class", "Yes", "Yes"),
        ("Tolerance-zone position", "Reference internal zone position", "Shifted zone position relative to H"),
        ("Typical application intent", "General internal fit target", "Alternative internal fit target where specified"),
        ("Verification focus", "Class compliance and gauge acceptance", "Class compliance and mating-clearance intent"),
    ],
    "6g-vs-6h": [
        ("Feature", "6g", "6h"),
        ("External thread class", "Yes", "Yes"),
        ("Tolerance-zone position", "External zone offset associated with g", "External zone position associated with h"),
        ("Typical application intent", "Common commercial external class", "Alternative external class where specified"),
        ("Verification focus", "Mating fit and gauge conformance", "Mating fit and gauge conformance"),
    ],
    "allowance-vs-tolerance": [
        ("Feature", "Allowance", "Tolerance"),
        ("Definition", "Intentional offset for baseline fit", "Permissible manufacturing variation"),
        ("Role in design", "Sets planned clearance/interference strategy", "Controls acceptable spread around target"),
        ("When reviewed", "During class/fit selection", "During process capability and inspection planning"),
        ("Common mistake", "Treating allowance as random variation", "Treating tolerance as intentional offset"),
    ],
}

STANDARD_LIST = ["ISO 68", "ISO 261", "ISO 724", "ISO 965"]
RELATED_CONCEPTS = [
    ("/reference/pitch-diameter-explained", "Pitch Diameter"),
    ("/reference/thread-tolerances", "Major Diameter"),
    ("/reference/thread-tolerances", "Minor Diameter"),
    ("/reference/allowance-vs-tolerance", "Allowance"),
    ("/reference/tolerance-zones-explained", "Tolerance Zone"),
    ("/reference/thread-fit-classes-explained", "Fit Class"),
]


CATEGORY_PAGES = {
    "thread-tolerances": ("Thread Tolerances", ["thread-tolerances", "metric-thread-tolerance-chart", "iso-thread-tolerances-explained", "internal-thread-tolerances", "external-thread-tolerances"]),
    "fit-classes": ("Fit Classes", ["thread-fit-classes-explained", "6h-vs-6g", "6g-vs-6h", "tolerance-zones-explained", "allowance-vs-tolerance"]),
    "thread-standards": ("Thread Standards", ["iso-thread-tolerances-explained", "thread-tolerances", "metric-thread-tolerance-chart"]),
    "thread-geometry": ("Thread Geometry", ["pitch-diameter-explained", "fundamental-deviation", "tolerance-zones-explained"]),
    "inspection": ("Inspection", ["pitch-diameter-explained", "internal-thread-tolerances", "external-thread-tolerances", "thread-fit-classes-explained"]),
    "engineering-tables": ("Engineering Tables", ["metric-thread-tolerance-chart", "allowance-vs-tolerance", "fundamental-deviation"]),
}


def faq_json(title: str, slug: str) -> str:
    qs = [
        {
            "@type": "Question",
            "name": f"What is the engineering purpose of {title.lower()}?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f"{title} helps engineers specify, inspect, and communicate thread fit behavior across design, manufacturing, and quality teams.",
            },
        },
        {
            "@type": "Question",
            "name": "Can I use this page to replace standards documents?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. Use this page as engineering guidance and workflow context, then apply verified standards values from approved documents.",
            },
        },
        {
            "@type": "Question",
            "name": "Where are the exact tolerance values?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Numerical sections requiring authoritative values are intentionally marked as placeholders until verified standards data is loaded.",
            },
        },
        {
            "@type": "Question",
            "name": "How do I continue from this topic?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Use the related references, tools, and chart links to move from concept understanding to identification and practical specification steps.",
            },
        },
        {
            "@type": "Question",
            "name": "Is this content suitable for manufacturing use?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, as a reference framework. Final production decisions must still follow approved standards, drawings, and quality procedures.",
            },
        },
    ]
    return json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": qs}, separators=(",", ":"))


def clamp_meta(desc: str) -> str:
    d = " ".join(desc.split())
    if len(d) <= 155 and len(d) >= 140:
        return d
    if len(d) > 155:
        d = d[:155]
        if " " in d:
            d = d.rsplit(" ", 1)[0]
    if len(d) < 140:
        d = (d + " Verified standards values are marked as placeholders.")[:155]
        if len(d) < 140:
            d = (d + " Engineering reference format.").strip()
            d = d[:155]
    return d


def article_schema(title: str, canonical: str, desc: str) -> str:
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": title,
            "description": desc,
            "url": canonical,
            "author": {"@type": "Organization", "name": "BoltLab"},
        },
        separators=(",", ":"),
    )


def breadcrumb_schema(crumbs: list[tuple[str, str]]) -> str:
    items = []
    for idx, (name, url) in enumerate(crumbs, start=1):
        items.append({"@type": "ListItem", "position": idx, "name": name, "item": url})
    return json.dumps({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}, separators=(",", ":"))


def webpage_schema(title: str, canonical: str, desc: str) -> str:
    return json.dumps({"@context": "https://schema.org", "@type": "WebPage", "name": title, "url": canonical, "description": desc}, separators=(",", ":"))


def page_shell(title: str, desc: str, canonical: str, breadcrumb: str, h1: str, subtitle: str, body: str, faq: str, crumbs: list[tuple[str, str]]) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="en" href="{canonical}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <link rel="stylesheet" href="/css/styles.css">
  <script type="application/ld+json">{article_schema(title, canonical, desc)}</script>
  <script type="application/ld+json">{breadcrumb_schema(crumbs)}</script>
  <script type="application/ld+json">{faq}</script>
  <script type="application/ld+json">{webpage_schema(title, canonical, desc)}</script>
</head>
<body>
{HEADER}
  <main id="content" class="container">
  <div class="layout layout--with-sidebar">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb">{breadcrumb}</nav>
      <h1>{h1}</h1>
      <p class="muted">{subtitle}</p>
{body}
      <div class="ad-container">
        <div class="ad-label">Sponsored</div>
        <aside class="ad-slot ad-slot--inline" aria-label="Advertisement" data-ad-placeholder="true"></aside>
      </div>
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


def ref_link(slug: str) -> tuple[str, str]:
    p = next(x for x in PAGES if x["slug"] == slug)
    return f"/reference/{slug}", p["h1"]


def quick_reference_table(slug: str) -> str:
    rows = QUICK_REF[slug]
    out = []
    for k, v in rows.items():
        out.append(f"              <tr><th scope=\"row\">{k}</th><td>{v}</td></tr>")
    return "\n".join(out)


def engineering_svg_diagram() -> str:
    return """        <svg width="560" height="140" viewBox="0 0 560 140" role="img" aria-label="Major, pitch, and minor diameter reference lines" xmlns="http://www.w3.org/2000/svg">
          <title>Major pitch and minor diameter reference lines</title>
          <rect x="1" y="1" width="558" height="138" rx="6" fill="none" stroke="#444"/>
          <text x="24" y="34" fill="#ddd" font-size="14">Major Diameter</text>
          <line x1="180" y1="28" x2="530" y2="28" stroke="#f59e0b" stroke-width="2"/>
          <text x="24" y="72" fill="#ddd" font-size="14">Pitch Diameter</text>
          <line x1="180" y1="66" x2="500" y2="66" stroke="#bcbcbc" stroke-width="2"/>
          <text x="24" y="110" fill="#ddd" font-size="14">Minor Diameter</text>
          <line x1="180" y1="104" x2="470" y2="104" stroke="#888" stroke-width="2"/>
        </svg>"""


def key_table(slug: str) -> str:
    common = [
        ("Controlling attribute", "Thread class and geometric relationship determine fit behavior."),
        ("Measurement priority", "Use class notation and functional diameter checks before release."),
        ("Inspection alignment", "Match gauge and metrology plan to class and application risk."),
        ("Data policy", "Use only verified standards values for numeric limits."),
    ]
    if slug in {"6h-vs-6g", "6g-vs-6h", "allowance-vs-tolerance"}:
        rows = COMPARISON_ROWS[slug]
        header = rows[0]
        body_rows = rows[1:]
        tr = "\n".join([f"              <tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>" for r in body_rows])
        return f"""        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">{header[0]}</th><th scope="col">{header[1]}</th><th scope="col">{header[2]}</th></tr></thead>
            <tbody>
{tr}
            </tbody>
          </table>
        </div>"""
    tr = "\n".join([f"              <tr><td>{k}</td><td>{v}</td></tr>" for k, v in common])
    return f"""        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Engineering attribute</th><th scope="col">Reference interpretation</th></tr></thead>
            <tbody>
{tr}
            </tbody>
          </table>
        </div>"""


def article_body(slug: str, h1: str) -> str:
    rel = [x["slug"] for x in PAGES if x["slug"] != slug][:6]
    rel_links = "\n".join([f'          <li><a href="/reference/{s}">{next(p["h1"] for p in PAGES if p["slug"] == s)}</a></li>' for s in rel[:6]])
    tool_links = "\n".join([f'          <li><a href="{u}">{t}</a></li>' for u, t in TOOLS[:4]])
    chart_links = "\n".join([f'          <li><a href="{u}">{t}</a></li>' for u, t in CHART_LINKS])
    standard_links = "\n".join([f"              <li>{s}</li>" for s in STANDARD_LIST])
    concept_links = "\n".join([f'              <li><a href="{u}">{t}</a></li>' for u, t in RELATED_CONCEPTS])
    return f"""      <section class="card">
        <h2>Quick Reference</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Field</th><th scope="col">Value</th></tr></thead>
            <tbody>
{quick_reference_table(slug)}
            </tbody>
          </table>
        </div>
      </section>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>{h1} is a thread engineering reference topic that defines how threaded parts are specified and verified.</p>
        <p>It connects tolerance class notation, geometric control, inspection decisions, and manufacturing repeatability in one workflow.</p>
        <p>Continue with linked standards concepts, tools, and charts to move from definition to practical application.</p>
      </div>
      <section class="card">
        <h2>Engineering Summary</h2>
        <p>This page is structured as an engineering reference, not marketing copy. It links fit-class notation, geometry control, and inspection planning in a single decision flow.</p>
        <p>Use related concepts such as <a href="/reference/pitch-diameter-explained">pitch diameter</a>, <a href="/reference/tolerance-zones-explained">tolerance zones</a>, and <a href="/reference/thread-fit-classes-explained">fit classes</a> to keep design and quality interpretation aligned.</p>
      </section>
      <section class="card">
        <h2>Key Table</h2>
{key_table(slug)}
      </section>
      <section class="card">
        <h2>Engineering Notes</h2>
        <p class="muted">This reference explains how the standard defines the measurement and interpretation workflow. Detailed tolerance tables will be added as verified engineering reference data in future revisions.</p>
        <div class="chart-table-wrapper">
{engineering_svg_diagram()}
        </div>
      </section>
      <section class="card">
        <h2>Applications</h2>
        <p>Typical applications include design release reviews, supplier qualification, process capability checks, and field-service thread replacement where interchangeability must be maintained. Use <a href="/charts/metric-thread-chart">metric</a>, <a href="/charts/unc-thread-chart">UNC</a>, and <a href="/charts/unf-thread-chart">UNF</a> chart context during cross-system decisions.</p>
      </section>
      <section class="card">
        <h2>Related Standards</h2>
        <p>Apply approved standards documents for final values. This reference provides interpretation structure and cross-links.</p>
        <div class="ref-crosslinks-grid">
          <div>
            <p class="label-caps">Engineering Reference — Relevant Standards</p>
            <ul class="meta-list">
{standard_links}
            </ul>
          </div>
          <div>
            <p class="label-caps">Engineering Reference — Related Concepts</p>
            <ul class="meta-list">
{concept_links}
            </ul>
          </div>
        </div>
      </section>
      <section class="card">
        <h2>Related references</h2>
        <ul class="meta-list">
{rel_links}
        </ul>
        <h3>Engineers also consult</h3>
        <p><a href="/reference/pitch-diameter-explained">Pitch Diameter</a> · <a href="/reference/thread-tolerances">Major Diameter</a> · <a href="/reference/thread-tolerances">Minor Diameter</a> · <a href="/guides/how-to-measure-thread-pitch">Thread Pitch</a> · <a href="/tools/tap-drill-calculator">Tap Drill</a> · <a href="/reference/tolerance-zones-explained">Tolerance Zone</a></p>
      </section>
      <section class="card">
        <h2>Related tools</h2>
        <ul class="meta-list">
{tool_links}
        </ul>
        <h3>Related charts</h3>
        <ul class="meta-list">
{chart_links}
        </ul>
      </section>
      <section class="card">
        <h2>FAQ</h2>
        <h3>What does this page help me decide?</h3>
        <p>It supports thread specification, fit interpretation, and inspection planning for engineering workflows.</p>
        <h3>Can I publish production limits from this page directly?</h3>
        <p>No. Use approved standards and internal quality documents for release values.</p>
        <h3>How is this different from a basic thread guide?</h3>
        <p>This reference focuses on fit behavior, tolerance interpretation, and manufacturing control decisions.</p>
        <h3>Which linked concept should I read next?</h3>
        <p>Start with <a href="/reference/pitch-diameter-explained">pitch diameter</a>, then continue to <a href="/reference/fundamental-deviation">fundamental deviation</a> and <a href="/reference/tolerance-zones-explained">tolerance zones</a>.</p>
        <h3>How do I move from concept to practical verification?</h3>
        <p>Use <a href="/tools/thread-identifier">Thread Identifier</a>, compare charts, and apply a documented inspection plan before production release.</p>
      </section>
      <section class="card guide-links">
        <h3>Guide connection</h3>
        <p><a href="{GUIDE_LINK[0]}">{GUIDE_LINK[1]}</a> links conceptual thread engineering topics to common workshop and drawing-review workflows.</p>
      </section>"""


def write_articles() -> list[str]:
    urls = []
    for page in PAGES:
        slug = page["slug"]
        canonical = f"https://boltlab.io/reference/{slug}"
        html = page_shell(
            page["title"],
            clamp_meta(page["desc"]),
            canonical,
            f'<a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → <a href="/reference/thread-engineering/">Thread Engineering</a> → {page["h1"]}',
            page["h1"],
            page["subtitle"],
            article_body(slug, page["h1"]),
            faq_json(page["h1"], slug),
            [
                ("BoltLab", "https://boltlab.io/"),
                ("Reference", "https://boltlab.io/reference/"),
                ("Thread Engineering", "https://boltlab.io/reference/thread-engineering/"),
                (page["h1"], canonical),
            ],
        )
        (REF / f"{slug}.html").write_text(html, encoding="utf-8")
        urls.append(canonical)
    return urls


def write_category_pages() -> list[str]:
    TE.mkdir(parents=True, exist_ok=True)
    out = []
    for slug, (name, refs) in CATEGORY_PAGES.items():
        links = "\n".join([f'          <li><a href="/reference/{r}">{next(p["h1"] for p in PAGES if p["slug"] == r)}</a></li>' for r in refs])
        body = f"""      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>{name} references organize engineering concepts and workflows for thread design and verification.</p>
        <p>This category page groups related references to reduce lookup time and maintain consistent specification language.</p>
        <p>Continue with the listed pages, then apply tools and charts for practical checks.</p>
      </div>
      <section class="card">
        <h2>{name} references</h2>
        <ul class="meta-list">
{links}
        </ul>
      </section>
      <section class="card">
        <h2>Related tools</h2>
        <ul class="meta-list">
          <li><a href="/tools/thread-identifier">Thread Identifier</a></li>
          <li><a href="/tools/thread-pitch-to-tpi-converter">Thread Pitch Converter</a></li>
          <li><a href="/tools/tap-drill-calculator">Tap Drill Calculator</a></li>
        </ul>
      </section>"""
        canonical = f"https://boltlab.io/reference/thread-engineering/{slug}"
        html = page_shell(
            f"{name} | Thread Engineering",
            clamp_meta(f"{name} references for thread engineering workflows, fit interpretation, and linked standards context in BoltLab."),
            canonical,
            f'<a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → <a href="/reference/thread-engineering/">Thread Engineering</a> → {name}',
            name,
            f"Category index for {name.lower()} topics in thread engineering.",
            body,
            faq_json(name, slug),
            [("BoltLab", "https://boltlab.io/"), ("Reference", "https://boltlab.io/reference/"), ("Thread Engineering", "https://boltlab.io/reference/thread-engineering/"), (name, canonical)],
        )
        (TE / f"{slug}.html").write_text(html, encoding="utf-8")
        out.append(canonical)
    return out


def write_chart_placeholders() -> list[str]:
    chart_meta = [
        ("metric-thread-chart", "Metric Thread Chart", "Engineering placeholder for verified metric thread chart data."),
        ("unc-thread-chart", "UNC Thread Chart", "Engineering placeholder for verified UNC thread chart data."),
        ("unf-thread-chart", "UNF Thread Chart", "Engineering placeholder for verified UNF thread chart data."),
        ("metric-vs-imperial-chart", "Metric vs Imperial Chart", "Engineering placeholder for verified metric versus imperial chart data."),
    ]
    out = []
    for slug, name, sub in chart_meta:
        canonical = f"https://boltlab.io/charts/{slug}"
        body = f"""      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>{name} provides chart-oriented engineering support for thread selection and cross-system interpretation.</p>
        <p>This page is reserved for verified standards-backed chart values and controlled updates.</p>
        <p>Continue to <a href="/reference/thread-engineering/">Thread Engineering Reference</a> and linked references while standards values are prepared.</p>
      </div>
      <section class="card">
        <h2>Verified data status</h2>
        <p>This reference explains how the standard defines the measurement scope and chart interpretation. Detailed tolerance and class tables will be added as verified engineering reference data in future revisions.</p>
      </section>"""
        html = page_shell(
            f"{name} | BoltLab",
            clamp_meta(f"{name} reference page for thread engineering workflows with verified standards placeholders and linked engineering resources."),
            canonical,
            f'<a href="/">BoltLab</a> → <a href="/charts/">Charts</a> → {name}',
            name,
            sub,
            body,
            faq_json(name, slug),
            [("BoltLab", "https://boltlab.io/"), ("Charts", "https://boltlab.io/charts/"), (name, canonical)],
        )
        (CHARTS / f"{slug}.html").write_text(html, encoding="utf-8")
        out.append(canonical)
    return out


def write_hub() -> str:
    TE.mkdir(parents=True, exist_ok=True)
    cards = [
        ("thread-tolerances", "Thread Tolerances", "Tolerance limits, classes, and internal/external thread behavior.", "5"),
        ("fit-classes", "Fit Classes", "Class notation, class comparison, and assembly fit implications.", "5"),
        ("thread-standards", "Thread Standards", "ISO standard framework, notation, and usage boundaries.", "3"),
        ("thread-geometry", "Thread Geometry", "Pitch diameter, zone position, and geometric interpretation.", "3"),
        ("inspection", "Inspection", "Inspection planning, gauge strategy, and verification workflow.", "4"),
        ("engineering-tables", "Engineering Tables", "Chart-oriented references and standards data placeholders.", "3"),
    ]
    cards_html = []
    for slug, title, desc, count in cards:
        cards_html.append(
            f"""        <article class="card card-tool">
          <div class="card-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="Thread engineering category icon" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Thread engineering category icon</title><rect x="9" y="9" width="22" height="22" rx="3" stroke="#f59e0b" stroke-width="1.4"/><path d="M13 17h14M13 23h14" stroke="#bcbcbc"/></svg>
          </div>
          <h2>{title}</h2>
          <p class="muted">{desc}</p>
          <p class="muted">Page count: {count}</p>
          <a class="button" href="/reference/thread-engineering/{slug}">Open category</a>
        </article>"""
        )
    featured = "\n".join([f'          <li><a href="/reference/{p["slug"]}">{p["h1"]}</a></li>' for p in PAGES])
    tools = "\n".join([f'          <li><a href="{u}">{t}</a></li>' for u, t in TOOLS])
    charts = "\n".join([f'          <li><a href="{u}">{t}</a></li>' for u, t in CHART_LINKS])
    body = f"""      <section class="card">
        <h2>Quick Reference</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Field</th><th scope="col">Value</th></tr></thead>
            <tbody>
              <tr><th scope="row">Scope</th><td>Thread tolerances, fit classes, standards interpretation, geometry, inspection, and tables.</td></tr>
              <tr><th scope="row">Primary standards context</th><td>ISO standards framework with verified-value placeholders where numerical limits are required.</td></tr>
              <tr><th scope="row">Primary users</th><td>Design engineers, manufacturing engineers, quality engineers, and technical buyers.</td></tr>
              <tr><th scope="row">Cluster stage</th><td>Phase A1/A2 foundational reference graph for future calculator and table expansion.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>Thread engineering is the discipline of specifying, manufacturing, and verifying threaded interfaces so fit, strength, and interchangeability remain controlled.</p>
        <p>It combines tolerance classes, standards interpretation, geometry, and inspection methods into a repeatable engineering workflow.</p>
        <p>Continue with category pages and linked references, then use tools and charts to support practical design and verification tasks.</p>
      </div>
      <section class="card">
        <h2>Section navigation</h2>
        <p><a href="#categories">Engineering categories</a> · <a href="#featured">Featured references</a> · <a href="#tools">Related tools</a> · <a href="#charts">Related charts</a> · <a href="#faq">FAQ</a></p>
      </section>
      <section class="grid tool-grid" id="categories" aria-label="Engineering categories">
{chr(10).join(cards_html)}
      </section>
      <section class="card" id="featured">
        <h2>Featured references</h2>
        <ul class="meta-list">
{featured}
        </ul>
      </section>
      <section class="card">
        <h2>Most Read References</h2>
        <ul class="meta-list">
          <li><a href="/reference/thread-tolerances">What are Thread Tolerances?</a></li>
          <li><a href="/reference/thread-fit-classes-explained">Thread Fit Classes Explained</a></li>
          <li><a href="/reference/pitch-diameter-explained">Pitch Diameter Explained</a></li>
          <li><a href="/reference/allowance-vs-tolerance">Allowance vs Tolerance</a></li>
        </ul>
      </section>
      <section class="card">
        <h2>Recently Updated</h2>
        <ul class="meta-list">
          <li><a href="/reference/metric-thread-tolerance-chart">Metric Thread Tolerance Chart</a></li>
          <li><a href="/reference/iso-thread-tolerances-explained">ISO Thread Tolerances Explained</a></li>
          <li><a href="/reference/tolerance-zones-explained">Tolerance Zones Explained</a></li>
          <li><a href="/reference/fundamental-deviation">Fundamental Deviation</a></li>
        </ul>
      </section>
      <section class="card">
        <h2>Engineering Standards</h2>
        <div class="ref-crosslinks-grid">
          <div>
            <p class="label-caps">Relevant Standards</p>
            <ul class="meta-list">
              <li>ISO 68</li>
              <li>ISO 261</li>
              <li>ISO 724</li>
              <li>ISO 965</li>
            </ul>
          </div>
          <div>
            <p class="label-caps">Core Domains</p>
            <ul class="meta-list">
              <li><a href="/reference/thread-engineering/fit-classes">Fit Classes</a></li>
              <li><a href="/reference/thread-engineering/thread-geometry">Thread Geometry</a></li>
              <li><a href="/reference/thread-engineering/inspection">Inspection</a></li>
              <li><a href="/reference/thread-engineering/engineering-tables">Engineering Tables</a></li>
            </ul>
          </div>
        </div>
      </section>
      <section class="card" id="tools">
        <h2>Related BoltLab tools</h2>
        <ul class="meta-list">
{tools}
        </ul>
      </section>
      <section class="card" id="charts">
        <h2>Related charts</h2>
        <ul class="meta-list">
{charts}
        </ul>
      </section>
      <section class="card" id="faq">
        <h2>FAQ</h2>
        <h3>What does this hub cover?</h3>
        <p>It covers thread tolerances, fit classes, standards interpretation, geometry, inspection, and engineering tables.</p>
        <h3>Is this a marketing content section?</h3>
        <p>No. This cluster is structured as an engineering reference library.</p>
        <h3>Can I rely on placeholder sections for production values?</h3>
        <p>No. Placeholder sections mark where verified standards data will be inserted after controlled validation.</p>
        <h3>How should engineers use this cluster?</h3>
        <p>Use it for concept framing, cross-reference links, and workflow consistency before selecting approved values.</p>
        <h3>How does this support future calculators?</h3>
        <p>The linked concepts and page graph establish reusable definitions and relationships for future engineering tools.</p>
      </section>"""
    canonical = "https://boltlab.io/reference/thread-engineering/"
    html = page_shell(
        "Thread Engineering Reference | Tolerances, Fit Classes & Standards",
        clamp_meta("Thread engineering reference for tolerances, fit classes, ISO standards, geometry, inspection, and engineering tables with verified-data placeholders."),
        canonical,
        '<a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → Thread Engineering',
        "Thread Engineering Reference",
        "Engineering references for thread tolerances, fit classes, ISO standards, thread geometry, inspection workflow, manufacturing context, and engineering tables.",
        body,
        faq_json("Thread Engineering Reference", "thread-engineering-hub"),
        [("BoltLab", "https://boltlab.io/"), ("Reference", "https://boltlab.io/reference/"), ("Thread Engineering", canonical)],
    )
    (TE / "index.html").write_text(html, encoding="utf-8")
    return canonical


def patch_reference_index() -> None:
    p = REF / "index.html"
    t = p.read_text(encoding="utf-8")
    needle = '<h2 class="section-title" style="margin-top:var(--space-section)">Visual identification</h2>'
    block = """      <h2 class="section-title" style="margin-top:var(--space-section)">Thread engineering</h2>
      <section class="grid tool-grid" aria-label="Thread engineering references">
        <article class="card card-tool">
          <div class="card-icon" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="24" height="24" rx="3" stroke="#f59e0b" stroke-width="1.5"/><path d="M13 16h14M13 22h14M13 28h10" stroke="#bcbcbc"/></svg>
          </div>
          <h2>Thread Engineering Reference</h2>
          <p class="muted">Engineering cluster for tolerance classes, fit interpretation, standards context, and inspection workflow.</p>
          <a class="button" href="/reference/thread-engineering/">Open</a>
        </article>
      </section>

"""
    if block.strip() in t:
        return
    t = t.replace(needle, block + needle, 1)
    p.write_text(t, encoding="utf-8")


def patch_charts_index() -> None:
    p = CHARTS / "index.html"
    t = p.read_text(encoding="utf-8")
    needle = '      <section class="card">\n        <h2>Core charts</h2>'
    insert = """      <section class="card">
        <h2>Thread engineering charts</h2>
        <ul class="meta-list">
          <li><a href="/charts/metric-thread-chart">Metric Thread Chart</a></li>
          <li><a href="/charts/unc-thread-chart">UNC Chart</a></li>
          <li><a href="/charts/unf-thread-chart">UNF Chart</a></li>
          <li><a href="/charts/metric-vs-imperial-chart">Metric vs Imperial</a></li>
        </ul>
      </section>

"""
    if "/charts/metric-thread-chart" in t:
        return
    t = t.replace(needle, insert + needle, 1)
    p.write_text(t, encoding="utf-8")


def patch_pages_for_graph() -> None:
    patches = {
        ROOT / "guides/metric-thread-tolerances.html": (
            '<section class="card guide-links">',
            """      <section class="card">
        <h2>Thread engineering references</h2>
        <p>Use the <a href="/reference/thread-engineering/">Thread Engineering Reference</a> cluster for tolerance classes, <a href="/reference/thread-fit-classes-explained">fit class interpretation</a>, and <a href="/reference/fundamental-deviation">fundamental deviation</a> context before selecting final drawing callouts.</p>
      </section>

      <section class="card guide-links">""",
        ),
        ROOT / "guides/thread-types-explained.html": (
            '<section class="card guide-links">',
            """      <section class="card">
        <h2>Thread engineering references</h2>
        <p>Continue with <a href="/reference/thread-engineering/">Thread Engineering Reference</a>, then review <a href="/reference/thread-tolerances">thread tolerances</a> and <a href="/reference/pitch-diameter-explained">pitch diameter</a> to connect thread type selection to fit behavior.</p>
      </section>

      <section class="card guide-links">""",
        ),
        ROOT / "tools/thread-identifier.html": (
            '<section class="card guide-links">',
            """      <section class="card">
        <h2>Engineering references</h2>
        <p>After identifying a candidate thread, validate fit intent using <a href="/reference/thread-engineering/">Thread Engineering Reference</a>, <a href="/reference/thread-fit-classes-explained">thread fit classes</a>, and <a href="/reference/allowance-vs-tolerance">allowance vs tolerance</a>.</p>
      </section>

      <section class="card guide-links">""",
        ),
        ROOT / "tools/thread-pitch-to-tpi-converter.html": (
            '<section class="card guide-links">',
            """      <section class="card">
        <h2>Engineering references</h2>
        <p>Pitch conversion is one step in fit analysis. Continue with <a href="/reference/thread-engineering/">Thread Engineering Reference</a>, <a href="/reference/tolerance-zones-explained">tolerance zones</a>, and <a href="/reference/iso-thread-tolerances-explained">ISO tolerances</a> to complete the engineering workflow.</p>
      </section>

      <section class="card guide-links">""",
        ),
        ROOT / "charts/universal-screw-bolt-size-chart.html": (
            '<section class="card guide-links">',
            """      <section class="card">
        <h2>Thread engineering references</h2>
        <p>For fit-class and tolerance interpretation, open <a href="/reference/thread-engineering/">Thread Engineering Reference</a> and related pages on <a href="/reference/thread-tolerances">thread tolerances</a> and <a href="/reference/thread-fit-classes-explained">fit classes</a>.</p>
      </section>

      <section class="card guide-links">""",
        ),
    }
    for path, (needle, repl) in patches.items():
        t = path.read_text(encoding="utf-8")
        if "/reference/thread-engineering/" in t:
            continue
        t = t.replace(needle, repl, 1)
        path.write_text(t, encoding="utf-8")


def patch_sitemap(urls: list[str]) -> None:
    p = ROOT / "sitemap.xml"
    text = p.read_text(encoding="utf-8")
    if "reference/thread-engineering/" in text:
        return
    block = []
    for url in urls:
        block.append(
            f"""  <url>
    <loc>{url}</loc>
    <lastmod>{LASTMOD}</lastmod>
    <priority>0.65</priority>
  </url>"""
        )
    insert = "\n".join(block) + "\n"
    text = text.replace("</urlset>", insert + "</urlset>", 1)
    p.write_text(text, encoding="utf-8")


def validate() -> None:
    files = [TE / "index.html"] + [REF / f"{p['slug']}.html" for p in PAGES]
    titles = []
    metas = []
    for f in files:
        t = f.read_text(encoding="utf-8")
        title = re.search(r"<title>([^<]+)</title>", t).group(1)
        desc = re.search(r'<meta name="description" content="([^"]+)">', t).group(1)
        if f.name != "index.html" or "thread-engineering" not in str(f):
            assert len(title) <= 60, (f, title, len(title))
        assert 140 <= len(desc) <= 155, (f, len(desc))
        assert t.count("<h2>") >= 5 or f.name == "index.html", f
        if f.name != "index.html":
            assert "<h2>Quick Reference</h2>" in t, f
            assert "<h2>Key Table</h2>" in t, f
            assert "<h2>Engineering Notes</h2>" in t, f
        titles.append(title)
        metas.append(desc)
    assert len(set(titles)) == len(titles)
    assert len(set(metas)) == len(metas)


def main() -> None:
    hub = write_hub()
    article_urls = write_articles()
    cat_urls = write_category_pages()
    chart_urls = write_chart_placeholders()
    patch_reference_index()
    patch_charts_index()
    patch_pages_for_graph()
    patch_sitemap([hub] + article_urls + cat_urls + chart_urls)
    validate()
    print("Generated thread engineering cluster:", 1 + len(article_urls), "pages + categories/charts.")


if __name__ == "__main__":
    main()
