#!/usr/bin/env node
const path = require("node:path");
const { projectRoot, readJson, writeText } = require("../utilities/path-utils");

const CANONICAL_URL = "https://boltlab.io/reference/tap-type-guide";
const TITLE = "Tap Type Guide";
const META_DESCRIPTION =
  "Compare BoltLab's seven tap types by chamfer length, chip evacuation, and hole suitability, with each fact labeled by evidence classification and verification status.";
const INTRO_COPY =
  "BoltLab's tap-type data classifies every fact about taper, plug, bottoming, spiral-point, spiral-flute, forming, and hand taps by evidence kind -- general taxonomy, manufacturing characteristic, typical application, or manufacturer-specific recommendation -- and by verification status, so you can see not just what each tap type is, but how well-established each claim actually is.";

const TAP_TYPE_ORDER = [
  "taper_tap",
  "plug_tap",
  "bottoming_tap",
  "spiral_point_tap",
  "spiral_flute_tap",
  "forming_tap",
  "hand_tap"
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function verificationLabel(status) {
  if (status === "verified") return "Verified";
  if (status === "source_bound") return "Source-bound";
  if (status === "pending_verification") return "Pending verification";
  return "Unavailable";
}

function firstFactOrDash(notes) {
  return notes.length ? escapeHtml(notes[0].fact) : "—";
}

function sortedRows(projection) {
  return projection.rows
    .slice()
    .sort((a, b) => TAP_TYPE_ORDER.indexOf(a.entity_id) - TAP_TYPE_ORDER.indexOf(b.entity_id));
}

function renderComparisonTable(rows) {
  const trs = rows
    .map((r) => {
      const chamfer = r.manufacturing_characteristics.find((n) => /chamfer/i.test(n.fact));
      const chip = [...r.manufacturing_characteristics, ...r.typical_applications].find((n) => /chip/i.test(n.fact));
      const hole = r.typical_applications.find((n) => /(blind|through)[- ]hole/i.test(n.fact));
      return `<tr>
  <td>${escapeHtml(r.title)}</td>
  <td>${chamfer ? escapeHtml(chamfer.fact) : "—"}</td>
  <td>${chip ? escapeHtml(chip.fact) : "—"}</td>
  <td>${hole ? escapeHtml(hole.fact) : "—"}</td>
  <td>${r.evidence_status.verified_fact_count} verified / ${r.evidence_status.source_bound_fact_count} source-bound</td>
</tr>`;
    })
    .join("\n");
  return trs;
}

function renderNoteList(notes) {
  if (!notes.length) return "<li>None recorded</li>";
  return notes
    .map(
      (n) =>
        `<li>${escapeHtml(n.fact)} <span class="muted">— <span class="data-status data-status--${escapeHtml(n.status)}">${escapeHtml(verificationLabel(n.status))}</span>, source: ${escapeHtml(n.source)}</span></li>`
    )
    .join("\n          ");
}

function renderTapTypeSection(row) {
  const groups = [
    ["General taxonomy", row.general_taxonomy],
    ["Manufacturing characteristic", row.manufacturing_characteristics],
    ["Typical application", row.typical_applications],
    ["Manufacturer-specific recommendation", row.manufacturer_specific_recommendations]
  ];
  const groupHtml = groups
    .map(([label, notes]) => {
      if (!notes.length) return "";
      return `
        <p class="label-caps">${escapeHtml(label)}</p>
        <ul class="meta-list">
          ${renderNoteList(notes)}
        </ul>`;
    })
    .join("");

  return `<section class="card" id="${escapeHtml(row.entity_id.replace(/_/g, "-"))}">
  <h2>${escapeHtml(row.title)}</h2>
  <p class="muted">${escapeHtml(row.definition)}</p>${groupHtml}
</section>`;
}

function renderFaq() {
  const faq = [
    {
      q: "What is the BoltLab Tap Type Guide?",
      a: "A structured comparison of BoltLab's seven tap types -- taper, plug, bottoming, spiral-point, spiral-flute, forming, and hand -- built from the same verified knowledge layer as the Tapping & Threading Atlas, with every fact labeled by evidence kind and verification status."
    },
    {
      q: "How are tap types classified in this guide?",
      a: "Each fact is tagged as general taxonomy (a settled, definitional fact), a manufacturing characteristic (a physical or structural trait), a typical application (a widely-corroborated but not universally guaranteed use case), or a manufacturer-specific recommendation (a vendor's own guidance, not a general industry fact)."
    },
    {
      q: "Which tap type is verified against a primary standard?",
      a: "Bottoming taps carry the one fact in this guide verified against a Tier 1 primary source: NASA-STD-5020A confirms that incomplete internal threads are present at the bottom of a tapped blind hole, which is the physical reason bottoming taps exist as a distinct style. Every other fact in this guide is source-bound rather than independently verified against a primary standard."
    },
    {
      q: "Can BoltLab tell me which tap type to use for my job?",
      a: "This guide compares documented characteristics -- chamfer length, chip-evacuation direction, and blind/through-hole suitability -- so you can match them to your own job requirements. It does not issue a universal recommendation, since the underlying facts are typical-application observations rather than guaranteed rules for every material and application."
    },
    {
      q: "Where does this data come from?",
      a: "Each fact traces to either a Tier 1 primary standard (NASA-STD-5020A, for the one verified fact) or cross-corroborated machining and manufacturer technical references (source-bound). See the BoltLab Data Methodology page for the full verification-tier system."
    }
  ];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a }
    }))
  };
  const html = faq.map((item) => `<h3>${escapeHtml(item.q)}</h3>\n        <p>${escapeHtml(item.a)}</p>`).join("\n        ");
  return { html, jsonLd: faqJsonLd };
}

function renderHtml(projection) {
  const rows = sortedRows(projection);
  const totalVerified = rows.reduce((sum, r) => sum + r.evidence_status.verified_fact_count, 0);
  const totalSourceBound = rows.reduce((sum, r) => sum + r.evidence_status.source_bound_fact_count, 0);
  const faq = renderFaq();

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${TITLE} | BoltLab`,
    url: CANONICAL_URL,
    description: META_DESCRIPTION
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BoltLab", item: "https://boltlab.io/" },
      { "@type": "ListItem", position: 2, name: "Reference", item: "https://boltlab.io/reference/" },
      { "@type": "ListItem", position: 3, name: TITLE, item: CANONICAL_URL }
    ]
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(TITLE)} | BoltLab</title>
  <meta name="description" content="${escapeHtml(META_DESCRIPTION)}">
  <link rel="canonical" href="${CANONICAL_URL}">
  <link rel="alternate" hreflang="en" href="${CANONICAL_URL}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <link rel="stylesheet" href="/css/styles.css">
  <script type="application/ld+json">${JSON.stringify(webPageJsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(faq.jsonLd)}</script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/"><img class="brand-logo" src="/images/boltlab-logo.svg" alt="">BoltLab</a>
      <nav aria-label="Primary">
        <ul class="nav-list">
          <li><a href="/tools/">Tools</a></li>
          <li><a href="/charts/">Charts</a></li>
          <li><a href="/reference/">Reference</a></li>
          <li><a href="/sizes/">Sizes</a></li>
          <li><a href="/guides/">Guides</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main id="content" class="container">
  <div class="layout layout--with-sidebar">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → ${escapeHtml(TITLE)}</nav>
      <h1>${escapeHtml(TITLE)}</h1>

      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>${escapeHtml(INTRO_COPY)}</p>
      </div>

      <section class="card" id="data-quality">
        <h2>Data quality</h2>
        <ul class="meta-list">
          <li>Dataset: Tapping &amp; Threading tap types</li>
          <li>Projection: T3 Tapping Tap-Type Projection</li>
          <li>Tap types: ${rows.length}</li>
          <li>Facts: ${totalVerified} verified / ${totalSourceBound} source-bound</li>
          <li>Verification: Mixed — see per-fact status below</li>
        </ul>
        <p><a href="/reference/data-methodology">How BoltLab classifies and verifies engineering data</a></p>
      </section>

      <section class="card">
        <h2>Compare tap types</h2>
        <p class="muted">Each column reflects a directly-quoted fact from the classified evidence below, not a new claim. Where a cell shows "—", no fact in that category was recorded for this tap type.</p>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th>Tap type</th><th>Chamfer / manufacturing trait</th><th>Chip evacuation</th><th>Hole suitability</th><th>Evidence</th></tr></thead>
            <tbody>
${renderComparisonTable(rows)}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Choosing between tap types</h2>
        <p>This comparison summarizes documented characteristics; it does not issue a universal recommendation. Match the chip-evacuation direction and hole suitability to your own job, and treat "typical application" facts as widely-corroborated observations rather than guarantees for every material or application.</p>
      </section>

${rows.map(renderTapTypeSection).join("\n\n")}

      <section class="card">
        <h2>Related references</h2>
        <ul class="meta-list">
          <li><a href="/reference/tapping-atlas">Tapping &amp; Threading Atlas</a></li>
          <li><a href="/tools/tap-drill-calculator">Tap Drill Calculator</a></li>
          <li><a href="/reference/data-methodology">Engineering Data Methodology</a></li>
        </ul>
      </section>

      <section class="card" id="faq">
        <h2>FAQ</h2>
        ${faq.html}
      </section>

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
  <footer class="site-footer">
    <div class="container footer-main">
      <div class="footer-brand">
        <a class="footer-logo" href="/">BoltLab</a>
        <p class="footer-tagline">Precision fastener tools for real-world use.</p>
      </div>
      <nav class="footer-nav footer-nav-center" aria-label="Product">
        <a href="/tools/">Tools</a>
        <a href="/charts/">Charts</a>
        <a href="/reference/">Reference</a>
        <a href="/reference/standards/">Standards</a>
        <a href="/reference/data-methodology">Data Methodology</a>
        <a href="/reference/tapping-atlas">Tapping Atlas</a>
        <a href="/sizes/">Sizes</a>
        <a href="/guides/">Guides</a>
      </nav>
      <nav class="footer-nav footer-nav-right" aria-label="Company">
        <a href="/about">About</a>
        <a href="/privacy">Privacy</a>
        <a href="/cookies">Cookie Notice</a>
        <a href="/terms">Terms</a>
        <a href="/disclaimer">Disclaimer</a>
        <a href="/contact">Contact</a>
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
  <script src="/js/ads-layout.js" defer></script>
</body>
</html>`;
}

function validateProjection(projection, schema) {
  const errors = [];
  for (const field of schema.required || []) {
    if (!(field in projection)) errors.push(`Missing required field: ${field}`);
  }
  if (projection.projection_type !== "tapping_tap_type_projection") {
    errors.push("projection_type mismatch");
  }
  const rowSchema = (schema.properties && schema.properties.rows && schema.properties.rows.items) || {};
  for (const row of projection.rows || []) {
    for (const field of rowSchema.required || []) {
      if (!(field in row)) errors.push(`Row ${row.entity_id || "unknown"} missing ${field}`);
    }
  }
  if ((projection.rows || []).length !== 7) {
    errors.push(`Expected 7 tap-type rows, found ${(projection.rows || []).length}`);
  }
  return errors;
}

function main() {
  const root = projectRoot();
  const projection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));
  const schema = readJson(path.join(root, "data", "projections", "tapping-tap-type.schema.json"));

  const errors = validateProjection(projection, schema);
  if (errors.length) {
    console.error("Tap type guide projection validation failed:");
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  const html = renderHtml(projection);
  writeText(path.join(root, "reference", "tap-type-guide.html"), html);
  console.log("Generated reference/tap-type-guide.html");
}

main();
