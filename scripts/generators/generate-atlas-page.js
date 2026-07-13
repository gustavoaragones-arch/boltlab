#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson } = require("../utilities/path-utils");

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
    const value = record[key];
    if (rules.const !== undefined && value !== rules.const) {
      errors.push(`Field ${key} must equal ${rules.const}`);
    }
    if (rules.pattern && typeof value === "string" && !new RegExp(rules.pattern).test(value)) {
      errors.push(`Field ${key} does not match pattern ${rules.pattern}`);
    }
  }
  return errors;
}

function projectionToCsvRows(rows) {
  const header = [
    "designation",
    "diameter_mm",
    "coarse_pitch_mm",
    "fine_pitches_mm",
    "hex_head_mm",
    "tap_drill_mm",
    "clearance_close_mm",
    "clearance_normal_mm",
    "clearance_loose_mm",
    "iso_family"
  ];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push([
      row.designation,
      row.diameter_mm,
      row.coarse_pitch_mm,
      row.fine_pitches_mm.join("|"),
      row.hex_head_mm,
      row.tap_drill_mm,
      row.clearance_holes_mm.close,
      row.clearance_holes_mm.normal,
      row.clearance_holes_mm.loose,
      row.iso_family
    ].join(","));
  }
  return `${lines.join("\n")}\n`;
}

function renderRows(rows) {
  return rows
    .map((row) => `<tr data-designation="${row.designation}" data-diameter="${row.diameter_mm}" data-coarse="${row.coarse_pitch_mm}" data-fine="${row.fine_pitches_mm.join("|")}" data-iso="${row.iso_family}">
  <td>${escapeHtml(row.designation)}</td>
  <td>${row.diameter_mm}</td>
  <td>${row.coarse_pitch_mm}</td>
  <td>${escapeHtml(row.fine_pitches_mm.join(", ") || "-")}</td>
  <td>${row.hex_head_mm}</td>
  <td>${row.tap_drill_mm}</td>
  <td>${row.clearance_holes_mm.close} / ${row.clearance_holes_mm.normal} / ${row.clearance_holes_mm.loose}</td>
  <td>${escapeHtml(row.iso_family)}</td>
</tr>`).join("\n");
}

function renderAtlasHtml(projection) {
  const datasetJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: projection.title,
    description: projection.summary,
    url: projection.canonical_url,
    version: projection.dataset.version,
    creator: { "@type": "Organization", name: "BoltLab" },
    license: "https://boltlab.io/privacy",
    distribution: {
      "@type": "DataDownload",
      contentUrl: "https://boltlab.io/downloads/metric-thread-atlas.csv",
      encodingFormat: "text/csv"
    }
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
  <script type="application/ld+json">${datasetJsonLd}</script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/">BoltLab</a>
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
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → Metric Thread Atlas</nav>
      <h1>${escapeHtml(projection.title)}</h1>
      <p class="muted">${escapeHtml(projection.summary)}</p>

      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>Metric thread designations use nominal diameter and pitch notation such as M8x1.25.</p>
        <p>This atlas consolidates coarse and fine pitch context, hex sizes, tap drill guidance, and clearance-hole references.</p>
        <p>Use filters and search below for instant lookup, then continue with related standards and tools.</p>
      </div>

      <section class="card">
        <h2>Data quality</h2>
        <ul class="meta-list">
          <li>Dataset version: ${escapeHtml(projection.dataset.version)}</li>
          <li>Verified: ${projection.dataset.verified ? "Yes" : "No"}</li>
          <li>Last reviewed: ${escapeHtml(projection.dataset.last_reviewed)}</li>
          <li>Verification method: ${escapeHtml(projection.dataset.verification_method)}</li>
          <li>Related standards: ISO 261, ISO 262, ISO 724, ISO 965-1</li>
        </ul>
      </section>

      <section class="card">
        <h2>Search and filters</h2>
        <div class="converter-grid">
          <label>Search designation<input id="atlas-search" class="input-field" type="search" placeholder="e.g. M10"></label>
          <label>Diameter<select id="atlas-diameter" class="input-field"><option value="">All</option>${projection.filters.diameters_mm.map((d) => `<option value="${d}">${d} mm</option>`).join("")}</select></label>
          <label>Series<select id="atlas-series" class="input-field"><option value="">All</option><option value="coarse">Coarse</option><option value="fine">Fine available</option></select></label>
          <label>Pitch<select id="atlas-pitch" class="input-field"><option value="">All</option>${projection.filters.pitches_mm.map((p) => `<option value="${p}">${p} mm</option>`).join("")}</select></label>
          <label>ISO family<select id="atlas-iso" class="input-field"><option value="">All</option>${projection.filters.iso_families.map((i) => `<option value="${i}">${i}</option>`).join("")}</select></label>
        </div>
      </section>

      <section class="card">
        <h2>Metric thread table</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th>Designation</th><th>Diameter (mm)</th><th>Coarse pitch</th><th>Fine pitches</th><th>Hex (mm)</th><th>Tap drill (mm)</th><th>Clearance holes C/N/L (mm)</th><th>ISO family</th></tr></thead>
            <tbody id="atlas-body">
${renderRows(projection.rows)}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card">
        <h2>Related tools</h2>
        <ul class="meta-list">
          <li><a href="/tools/thread-identifier">Thread Identifier</a></li>
          <li><a href="/tools/thread-pitch-to-tpi-converter">Thread Pitch Converter</a></li>
          <li><a href="/tools/tap-drill-calculator">Tap Drill Calculator</a></li>
          <li><a href="/charts/metric-thread-chart">Metric Thread Chart</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Related standards</h2>
        <ul class="meta-list">
          <li><a href="/reference/iso-261-metric-thread-series">ISO 261</a></li>
          <li><a href="/reference/iso-262-metric-thread-fine-series">ISO 262</a></li>
          <li><a href="/reference/iso-724-thread-dimensions">ISO 724</a></li>
          <li><a href="/reference/iso-thread-tolerances-explained">ISO 965-1</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Download</h2>
        <p><a href="/downloads/metric-thread-atlas.csv" download>Download metric thread atlas CSV</a></p>
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
    const diameterEl = document.getElementById("atlas-diameter");
    const seriesEl = document.getElementById("atlas-series");
    const pitchEl = document.getElementById("atlas-pitch");
    const isoEl = document.getElementById("atlas-iso");
    const rows = [...document.querySelectorAll("#atlas-body tr")];

    function matchRow(row) {
      const text = row.dataset.designation.toLowerCase();
      const search = searchEl.value.trim().toLowerCase();
      const diameter = diameterEl.value;
      const series = seriesEl.value;
      const pitch = pitchEl.value;
      const iso = isoEl.value;

      if (search && !text.includes(search)) return false;
      if (diameter && row.dataset.diameter !== diameter) return false;
      if (iso && row.dataset.iso !== iso) return false;
      if (pitch) {
        const coarse = row.dataset.coarse;
        const fine = row.dataset.fine.split("|").filter(Boolean);
        if (coarse !== pitch && !fine.includes(pitch)) return false;
      }
      if (series === "coarse" && !row.dataset.coarse) return false;
      if (series === "fine" && !row.dataset.fine) return false;
      return true;
    }

    function apply() {
      rows.forEach((row) => {
        row.style.display = matchRow(row) ? "" : "none";
      });
    }

    [searchEl, diameterEl, seriesEl, pitchEl, isoEl].forEach((el) => {
      el.addEventListener("input", apply);
      el.addEventListener("change", apply);
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
  const projectionPath = path.join(root, "data", "projections", "atlas", "metric-thread-atlas.json");
  const schemaPath = path.join(root, "data", "projections", "atlas.schema.json");
  const projection = readJson(projectionPath);
  const schema = readJson(schemaPath);
  const errors = simpleValidateAgainstSchema(schema, projection);

  if (errors.length) {
    console.error("Atlas projection validation failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  const htmlPath = path.join(root, "reference", "metric-thread-atlas.html");
  const csvPath = path.join(root, "downloads", "metric-thread-atlas.csv");
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });

  fs.writeFileSync(htmlPath, renderAtlasHtml(projection));
  fs.writeFileSync(csvPath, projectionToCsvRows(projection.rows));
  console.log("Generated reference/metric-thread-atlas.html");
  console.log("Generated downloads/metric-thread-atlas.csv");
}

main();
