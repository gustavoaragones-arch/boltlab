#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson } = require("../utilities/path-utils");

const REQUIRED_ROW_FIELDS = [
  "designation",
  "thread_system",
  "pitch_display",
  "tap_drill_display",
  "clearance_hole_display",
  "hex_size_display",
  "detail_reference",
  "related_standards",
  "related_tools"
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function simpleValidateAgainstSchema(schema, record) {
  const errors = [];
  for (const field of schema.required || []) {
    if (!(field in record)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  for (const [key, rules] of Object.entries(schema.properties || {})) {
    if (!(key in record)) continue;
    if (rules.const !== undefined && record[key] !== rules.const) {
      errors.push(`Field ${key} must equal ${rules.const}`);
    }
    if (rules.pattern && typeof record[key] === "string" && !new RegExp(rules.pattern).test(record[key])) {
      errors.push(`Field ${key} does not match pattern ${rules.pattern}`);
    }
  }
  return errors;
}

function validateProjection(projection, schema) {
  const errors = simpleValidateAgainstSchema(schema, projection);
  if (projection.route_hint !== "/reference/thread-atlas") {
    errors.push("Projection route_hint must be /reference/thread-atlas.");
  }
  if (!projection.dataset?.generator_build_version) {
    errors.push("Projection dataset.generator_build_version is required.");
  }
  for (const row of projection.rows || []) {
    for (const field of REQUIRED_ROW_FIELDS) {
      if (!(field in row)) {
        errors.push(`Row ${row.designation || "unknown"} missing ${field}`);
      }
    }
  }
  return errors;
}

function renderCard(row) {
  const standards = (row.related_standards || []).map((id) => id.toUpperCase().replaceAll("_", " ")).join(", ");
  const tools = (row.related_tools || [])
    .map((route) => `<a href="${route}">${route.split("/").pop().replaceAll("-", " ")}</a>`)
    .join(" · ");
  const equivalent = row.equivalent_metric ? `<p><strong>Equivalent metric:</strong> ${escapeHtml(row.equivalent_metric)}</p>` : "";
  return `<article class="card thread-atlas-card" data-q="${escapeHtml(row.designation.toLowerCase())}" data-system="${escapeHtml(row.thread_system)}" data-diameter="${escapeHtml(row.diameter_display)}" data-pitch="${escapeHtml(row.pitch_display)}" data-series="${escapeHtml(row.coarse_fine)}" data-standard-family="${escapeHtml(row.standards_family)}">
  <h3>${escapeHtml(row.designation)}</h3>
  <p class="muted">${escapeHtml(row.thread_system)} · ${escapeHtml(row.diameter_display)} · ${escapeHtml(row.pitch_display)}</p>
  <p><strong>Tap drill:</strong> ${escapeHtml(row.tap_drill_display)}</p>
  <p><strong>Clearance hole:</strong> ${escapeHtml(row.clearance_hole_display)}</p>
  <p><strong>Hex size:</strong> ${escapeHtml(row.hex_size_display)}</p>
  <p><strong>Related standards:</strong> ${escapeHtml(standards)}</p>
  ${equivalent}
  <p><strong>Tools:</strong> ${tools}</p>
  <p><a href="${row.detail_reference}">Open detailed reference</a></p>
</article>`;
}

function renderHtml(projection) {
  const systems = projection.filters.thread_systems || [];
  const diameters = projection.filters.diameters_display || [];
  const pitches = projection.filters.pitch_display || [];
  const coarseFine = projection.filters.coarse_fine || [];
  const families = projection.filters.standards_families || [];
  const cards = (projection.rows || []).map(renderCard).join("\n");

  const schemaJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: projection.title,
    description: projection.summary,
    url: projection.canonical_url,
    version: projection.dataset.version,
    creator: { "@type": "Organization", name: "BoltLab" }
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(projection.title)} | BoltLab</title>
  <meta name="description" content="${escapeHtml(projection.meta_description)}">
  <link rel="canonical" href="${escapeHtml(projection.canonical_url)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(projection.canonical_url)}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <link rel="stylesheet" href="/css/styles.css">
  <script type="application/ld+json">${schemaJsonLd}</script>
</head>
<body>
  <header class="site-header">
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
  </header>
  <main id="content" class="container">
  <div class="layout layout--with-sidebar">
    <article>
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → Thread Atlas</nav>
      <h1>${escapeHtml(projection.title)}</h1>
      <p class="muted">${escapeHtml(projection.summary)}</p>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>Search metric, UNC, and UNF thread designations in one engineering explorer.</p>
        <p>Each result includes pitch, tap drill, clearance holes, hex size, standards context, and tool links.</p>
        <p>Use one search and filter system instead of switching between separate atlases.</p>
      </div>

      <section class="card">
        <h2>Data quality</h2>
        <ul class="meta-list">
          <li>Dataset version: ${escapeHtml(projection.dataset.version)}</li>
          <li>Verification status: ${projection.dataset.verified ? "Verified" : "Unverified"}</li>
          <li>Last reviewed: ${escapeHtml(projection.dataset.last_reviewed)}</li>
          <li>Dataset coverage: ${escapeHtml((projection.dataset.coverage?.systems || []).join(", "))} (${projection.dataset.coverage?.total_rows || 0} rows)</li>
          <li>Generator build version: ${escapeHtml(projection.dataset.generator_build_version)}</li>
        </ul>
      </section>

      <section class="card">
        <h2>Unified search</h2>
        <div class="converter-grid">
          <label>Search designation<input id="atlas-search" class="input-field" type="search" placeholder="M8, 1/4-20, 3/8-16"></label>
          <label>Thread system<select id="atlas-system" class="input-field"><option value="">All</option>${systems.map((v) => `<option value="${v}">${v}</option>`).join("")}</select></label>
          <label>Diameter<select id="atlas-diameter" class="input-field"><option value="">All</option>${diameters.map((v) => `<option value="${v}">${v}</option>`).join("")}</select></label>
          <label>Pitch<select id="atlas-pitch" class="input-field"><option value="">All</option>${pitches.map((v) => `<option value="${v}">${v}</option>`).join("")}</select></label>
          <label>Coarse/Fine<select id="atlas-series" class="input-field"><option value="">All</option>${coarseFine.map((v) => `<option value="${v}">${v}</option>`).join("")}</select></label>
          <label>Standards family<select id="atlas-family" class="input-field"><option value="">All</option>${families.map((v) => `<option value="${v}">${v}</option>`).join("")}</select></label>
        </div>
      </section>

      <section class="card">
        <h2>Results</h2>
        <div id="atlas-results" class="grid tool-grid">
${cards}
        </div>
      </section>
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
  </footer>
  <script>
  (function() {
    const searchEl = document.getElementById("atlas-search");
    const systemEl = document.getElementById("atlas-system");
    const diameterEl = document.getElementById("atlas-diameter");
    const pitchEl = document.getElementById("atlas-pitch");
    const seriesEl = document.getElementById("atlas-series");
    const familyEl = document.getElementById("atlas-family");
    const cards = [...document.querySelectorAll(".thread-atlas-card")];

    function isMatch(card) {
      const q = searchEl.value.trim().toLowerCase();
      if (q && !card.dataset.q.includes(q)) return false;
      if (systemEl.value && card.dataset.system !== systemEl.value) return false;
      if (diameterEl.value && card.dataset.diameter !== diameterEl.value) return false;
      if (pitchEl.value && card.dataset.pitch !== pitchEl.value) return false;
      if (seriesEl.value && card.dataset.series !== seriesEl.value) return false;
      if (familyEl.value && card.dataset.standardFamily !== familyEl.value) return false;
      return true;
    }

    function applyFilters() {
      cards.forEach((card) => {
        card.style.display = isMatch(card) ? "" : "none";
      });
    }

    [searchEl, systemEl, diameterEl, pitchEl, seriesEl, familyEl].forEach((el) => {
      el.addEventListener("input", applyFilters);
      el.addEventListener("change", applyFilters);
    });
  })();
  </script>
  <script src="/js/link-engine.js" defer></script>
  <script src="/js/context-anchor-engine.js" defer></script>
  <script src="/js/anchor-engine.js" defer></script>
  <script src="/js/ads-layout.js" defer></script>
</body>
</html>`;
}

function main() {
  const root = projectRoot();
  const projectionPath = path.join(root, "data", "projections", "atlas", "thread-atlas.json");
  const schemaPath = path.join(root, "data", "projections", "atlas.schema.json");
  const projection = readJson(projectionPath);
  const schema = readJson(schemaPath);
  const errors = validateProjection(projection, schema);
  if (errors.length) {
    console.error("Thread atlas projection validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const outPath = path.join(root, "reference", "thread-atlas.html");
  fs.writeFileSync(outPath, renderHtml(projection));
  console.log("Generated reference/thread-atlas.html");
}

main();
