#!/usr/bin/env python3
"""Generate English /sizes/m{mm}-bolt-size.html for metric sizes not yet present. Run from repo root."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "sizes"

# (mm, coarse_pitch, tap_drill_mm, hex_mm, imperial_hint, fine_pitch_or_None, intro, uses, aeo_h2, aeo_p)
# Technical values aligned with scripts/generate_es_sizes.py METRIC / FINE_ROW.
ROWS = [
    (
        7,
        1.0,
        6.0,
        11,
        "between M6 and 1/4\"",
        0.75,
        "M7 is less common than M6 or M8 but appears in some European equipment and specialty hardware. Confirm availability of matching nuts and wrenches before specifying.",
        "Special mechanisms, some bicycle components, and replacement parts that call out M7 on drawings.",
        "What is an M7 bolt?",
        "An M7 bolt has 7 mm nominal major diameter. The usual ISO coarse pitch is 1.0 mm, with 0.75 mm fine pitch also seen in some applications.",
    ),
    (
        9,
        1.25,
        7.8,
        14,
        "between M8 and M10",
        1.0,
        "M9 is an intermediate metric size that is not as widely stocked as M8 or M10. Always verify pitch and strength class against the original part.",
        "Imported machinery, specialty equipment, and applications where documentation specifies M9.",
        "What is an M9 bolt?",
        "An M9 bolt has 9 mm nominal diameter with typical coarse pitch 1.25 mm. It bridges M8 and M10 but is less common in general hardware assortments.",
    ),
    (
        11,
        1.5,
        9.5,
        18,
        "7/16-14 (approx.)",
        1.25,
        "M11 is less common than M10 or M12. Check fastener catalogs for nuts, washers, and tools before relying on M11 in new designs.",
        "Special machinery, some automotive and industrial spares that specify M11.",
        "What is an M11 bolt?",
        "An M11 bolt has 11 mm nominal diameter; coarse pitch is typically 1.5 mm. Availability is weaker than M10 or M12, so confirm parts before field use.",
    ),
    (
        13,
        1.75,
        11.2,
        20,
        "1/2-13 (approx.)",
        1.5,
        "M13 is uncommon compared with M12 or M14. Treat manufacturer drawings as authoritative for pitch and strength.",
        "Equipment that explicitly lists M13 in service documentation.",
        "What is an M13 bolt?",
        "An M13 bolt has 13 mm nominal diameter with typical coarse pitch 1.75 mm. It is a specialty size—verify taps, dies, and mating hardware.",
    ),
    (
        14,
        2.0,
        12.0,
        22,
        "9/16-12",
        1.5,
        "M14 is used in heavy machinery and larger assemblies where higher clamp loads and shank area are required.",
        "Machine frames, shafts, presses, and industrial equipment with medium-to-heavy loads.",
        "What is an M14 bolt?",
        "An M14 bolt has 14 mm nominal diameter and 2.0 mm coarse pitch under common ISO tables. It is a standard step between M12 and M16 in large equipment.",
    ),
    (
        15,
        1.5,
        13.5,
        24,
        "5/8-11 (approx.)",
        None,
        "M15 is non-standard in many ISO coarse series listings; pitch can vary by application. Always match the original specification when replacing fasteners.",
        "Machine builds and OEM parts lists that explicitly specify M15.",
        "What is an M15 bolt?",
        "An M15 bolt has 15 mm nominal diameter. Coarse pitch is often 1.5 mm in practice, but you must confirm against the part or drawing.",
    ),
    (
        16,
        2.0,
        14.0,
        24,
        "5/8-11",
        1.5,
        "M16 is widely used in structural steel, large machinery, and heavy flanges where high preload and durable threads are required.",
        "Steel construction, machine tools, large flanges, and heavy-duty mechanical joints.",
        "What is an M16 bolt?",
        "An M16 bolt has 16 mm nominal diameter with 2.0 mm coarse pitch in typical ISO listings. Fine pitches such as 1.5 mm are used when specified.",
    ),
    (
        17,
        1.5,
        15.5,
        27,
        "5/8-11 (approx.)",
        None,
        "M17 is uncommon compared with M16 or M18. Replacement usually requires matching the exact thread pitch and strength class from the equipment manual.",
        "Specialized equipment and spares that call out M17 explicitly.",
        "What is an M17 bolt?",
        "An M17 bolt has 17 mm nominal diameter. Pitch and thread form must be taken from the application; it is not a high-availability stock size.",
    ),
    (
        18,
        2.5,
        15.5,
        27,
        "3/4-10",
        2.0,
        "M18 serves very high-load joints in heavy machinery and large structural connections. Use torque specs and lubrication class appropriate to the bolt grade.",
        "Heavy engineering, large spindles, flanges, and industrial equipment with high clamping requirements.",
        "What is an M18 bolt?",
        "An M18 bolt has 18 mm nominal diameter with 2.5 mm coarse pitch commonly listed for ISO metric coarse. Fine pitches are used where drawings require them.",
    ),
    (
        19,
        2.5,
        16.5,
        30,
        "3/4-10 (approx.)",
        None,
        "M19 is rare in general hardware; sourcing taps, dies, and mates may require industrial suppliers. Follow OEM documentation.",
        "Applications where M19 is specified on original equipment documentation.",
        "What is an M19 bolt?",
        "An M19 bolt has 19 mm nominal diameter. Treat it as a specialty fastener and confirm thread pitch and class with gauges or drawings.",
    ),
    (
        20,
        2.5,
        17.5,
        30,
        "3/4-10",
        "1.5 mm or 2.0 mm",
        "M20 is standard in steel construction and large machines for anchor-style and high-strength joints. Match structural specifications for grade and torque.",
        "Steel structures, machinery bases, medium anchor bolts, and heavy assemblies.",
        "What is an M20 bolt?",
        "An M20 bolt has 20 mm nominal diameter with 2.5 mm coarse pitch in common ISO listings. Large structural bolts may use different pitches per project standards.",
    ),
]


def faq_json(mm, pitch, tap, imp, fine_label):
    q_pitch = f"What is the standard pitch for an M{mm} bolt?"
    if fine_label:
        a_pitch = f"The standard coarse pitch for M{mm} is {pitch} mm. Fine pitch is often {fine_label} mm where specified."
    else:
        a_pitch = f"The common coarse pitch for M{mm} is {pitch} mm. Confirm fine or special pitches on the drawing when replacing fasteners."

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q_pitch, "acceptedAnswer": {"@type": "Answer", "text": a_pitch}},
            {
                "@type": "Question",
                "name": f"What drill size should be used for tapping M{mm} threads?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f"For M{mm} x {pitch} coarse thread, use approximately a {tap} mm tap drill. Use the Tap Drill Calculator for other pitches.",
                },
            },
            {
                "@type": "Question",
                "name": f"What imperial fastener is closest to M{mm}?",
                "acceptedAnswer": {"@type": "Answer", "text": f"{imp} is a practical imperial reference for M{mm}; always verify against your application."},
            },
        ],
    }


def render(row):
    mm, pitch, tap, hexv, imp, fine, intro, uses, aeo_h2, aeo_p = row
    slug = f"m{mm}-bolt-size.html"
    pitch_s = str(pitch)
    tap_s = str(tap)

    fine_row = ""
    faq_fine = None
    if fine is not None:
        if isinstance(fine, float):
            fine_row = f"              <tr><td>Fine pitch</td><td>{fine} mm</td></tr>\n"
            faq_fine = str(fine)
        else:
            fine_row = f"              <tr><td>Fine pitch</td><td>{fine}</td></tr>\n"
            faq_fine = fine

    desc = (
        f"M{mm} bolt dimensions, {pitch_s} mm pitch, {tap_s} mm tap drill, hex head {hexv} mm. "
        f"Reference imperial: {imp}. Specifications and common uses."
    )

    faq = json.dumps(faq_json(mm, pitch_s, tap_s, imp, faq_fine), separators=(",", ":"))

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>M{mm} Bolt Size and Thread Specifications | BoltLab</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="https://boltlab.io/sizes/{slug}">
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="alternate" hreflang="en" href="https://boltlab.io/sizes/{slug}" />
  <link rel="alternate" hreflang="es" href="https://boltlab.io/es/sizes/perno-m{mm}.html" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />

  <script type="application/ld+json">
  {faq}
  </script>
</head>
<body>
  <header class="site-header">
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
        <a href="/sizes/{slug}" class="lang-switch-link lang-switch-link--active" hreflang="en" aria-current="page">EN</a>
        <span class="lang-switch-sep" aria-hidden="true">|</span>
        <a href="/es/sizes/perno-m{mm}.html" class="lang-switch-link" hreflang="es">ES</a>
      </div>
    </div>
  </header>
  <main id="content" class="container">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/sizes/">Bolt Sizes</a> → M{mm}</nav>
      <h1>M{mm} Bolt Size and Thread Specifications</h1>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <h2>{aeo_h2}</h2>
        <p>{aeo_p}</p>
      </div>
      <p class="muted">{intro} Spanish reference: <a href="/es/sizes/perno-m{mm}.html">perno M{mm}</a>.</p>

      <section class="card">
        <h2>Specifications</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Specification</th><th scope="col">Value</th></tr></thead>
            <tbody>
              <tr><td>Nominal diameter</td><td>{mm} mm</td></tr>
              <tr><td>Standard pitch (coarse)</td><td>{pitch_s} mm</td></tr>
{fine_row}              <tr><td>Tap drill size</td><td>{tap_s} mm</td></tr>
              <tr><td>Closest imperial equivalent</td><td>{imp}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Hex head size</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Bolt size</th><th scope="col">Hex head size</th></tr></thead>
            <tbody><tr><td>M{mm}</td><td>{hexv} mm</td></tr></tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Common uses</h2>
        <p>{uses}</p>
      </section>

      <section class="card">
        <h2>Related tools</h2>
        <ul class="meta-list">
          <li><a href="/tools/metric-to-imperial-screw-converter.html">Metric to Imperial Screw Converter</a> — compare M{mm} to common inch threads.</li>
          <li><a href="/tools/tap-drill-calculator.html">Tap Drill Calculator</a> — tap drill size for M{mm} and other metric threads.</li>
          <li><a href="/tools/thread-identifier.html">Thread Identifier Tool</a> — match measured diameter and pitch to a standard.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Related charts</h2>
        <ul class="meta-list">
          <li><a href="/charts/universal-screw-bolt-size-chart.html">Universal Screw &amp; Bolt Size Chart</a> — metric, imperial, pitch, and tap drill in one view.</li>
          <li><a href="/charts/tap-drill-chart.html">Tap Drill Chart</a> — metric tap drill sizes.</li>
        </ul>
      </section>

      <section class="card">
        <h2>FAQ</h2>
        <h3>What is the standard pitch for an M{mm} bolt?</h3>
        <p>The common coarse pitch for M{mm} is {pitch_s} mm{f'. Fine pitch is often {fine} mm where specified.' if isinstance(fine, float) else ('. See drawings for fine or special pitches.' if fine is None else f'. Fine pitch options include {fine} where specified.')}</p>
        <h3>What drill size should be used for tapping M{mm} threads?</h3>
        <p>For M{mm} x {pitch_s} coarse thread, use approximately a {tap_s} mm tap drill. Use our <a href="/tools/tap-drill-calculator.html">Tap Drill Calculator</a> for other pitches.</p>
        <h3>What imperial fastener is closest to M{mm}?</h3>
        <p>{imp} is a practical reference for comparing M{mm} to inch hardware; verify fit for your application.</p>
      </section>

      <aside class="ad-slot ad-slot--inline" aria-label="Advertisement" data-ad-placeholder="true"></aside>
      <section class="card guide-links">
        <h3>Related guide</h3>
        <p><a href="/guides/metric-vs-imperial-fasteners.html">Metric vs Imperial Fasteners</a></p>
      </section>
    </article>
  <div id="related-links" class="related-links" aria-label="Related links"></div>
  </main>
      <footer class="site-footer">
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
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"Organization","name":"Albor Digital LLC","url":"https://albor.digital","email":"contact@albor.digital","sameAs":["https://boltlab.io","https://screwsizechart.com","https://boltgradechart.com"]}}</script>
  <script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebSite","name":"BoltLab","url":"https://boltlab.io","publisher":{{"@type":"Organization","name":"Albor Digital LLC"}}}}</script>
  <script src="/js/link-engine.js" defer></script>
  <script src="/js/context-anchor-engine.js" defer></script>
  <script src="/js/anchor-engine.js" defer></script>

</body>
</html>
"""


def main():
    existing_mm = set()
    for p in OUT.glob("m*-bolt-size.html"):
        part = p.name.replace("m", "").replace("-bolt-size.html", "")
        if part.isdigit():
            existing_mm.add(int(part))

    for row in ROWS:
        mm = row[0]
        if mm in existing_mm:
            print(f"skip m{mm} (exists)")
            continue
        path = OUT / f"m{mm}-bolt-size.html"
        path.write_text(render(row), encoding="utf-8")
        print(f"wrote {path.name}")


if __name__ == "__main__":
    main()
