#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson, writeText } = require("../utilities/path-utils");

const CANONICAL_URL = "https://boltlab.io/reference/tapping-atlas";
const ROUTE = "/reference/tapping-atlas";
const TITLE = "Tapping & Threading Atlas";
const META_DESCRIPTION =
  "Explore BoltLab's metric, UNC, and UNF tapping data, including tap-drill values, ISO 2306 alternatives, tap types, standards, verification status, and downloadable data.";
const INTRO_COPY =
  "Explore BoltLab's structured tapping and thread-preparation data for metric, UNC, and UNF threads. Search by thread designation, filter the available records, and review tap-drill recommendations, ISO 2306 alternatives, tap types, standards, and data-quality status.";
const ISO_NOTE =
  "ISO 2306 provides a metric drill recommendation for these inch-thread records. It is shown separately from BoltLab's primary US-customary drill value and does not replace it.";
const ENGAGEMENT_COPY =
  "BoltLab can calculate radial thread engagement from thread geometry and drill diameter, but it does not currently provide a universal target engagement percentage. Axial engagement length calculations remain unavailable because the required material-strength data is not yet part of the dataset.";
const STANDARDS_NOTE =
  "Standards references describe the documented relationship of the data record to the cited standard. They do not imply that every field on the record is directly specified by that standard.";
const CSV_NOTE =
  "This download is generated from BoltLab's Tapping & Threading Atlas projection. Verification status is preserved at the field level.";

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

function escapeCsv(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// -- Validation (schema-required-field check against the T3 projection schemas, same pattern as generate-thread-atlas-page.js) --
function simpleValidateAgainstSchema(schema, record) {
  const errors = [];
  for (const field of schema.required || []) {
    if (!(field in record)) errors.push(`Missing required field: ${field}`);
  }
  return errors;
}

function validateProjections(profileProjection, tapTypeProjection, profileSchema, tapTypeSchema) {
  const errors = [
    ...simpleValidateAgainstSchema(profileSchema, profileProjection),
    ...simpleValidateAgainstSchema(tapTypeSchema, tapTypeProjection)
  ];
  if (profileProjection.projection_type !== "tapping_profile_projection") {
    errors.push("profileProjection.projection_type mismatch");
  }
  if (tapTypeProjection.projection_type !== "tapping_tap_type_projection") {
    errors.push("tapTypeProjection.projection_type mismatch");
  }
  for (const row of profileProjection.rows || []) {
    for (const field of ["tapping_profile_id", "thread", "tap_drill", "engagement", "tap_types", "standards", "data_quality"]) {
      if (!(field in row)) errors.push(`Row ${row.tapping_profile_id || "unknown"} missing ${field}`);
    }
  }
  return errors;
}

// -- Presentation-layer derivations (not new engineering data: UNC/UNF coarse-fine is definitional to the series name itself) --
function coarseFineLabel(row) {
  if (row.thread.thread_system === "metric") {
    return row.thread.coarse_fine === "fine" ? "fine" : "coarse";
  }
  return row.thread.thread_system === "UNF" ? "fine" : "coarse";
}

function pitchTpiDisplay(row) {
  if (row.thread.thread_system === "metric") {
    return `${row.thread.pitch} mm`;
  }
  return `${row.thread.threads_per_inch} TPI`;
}

function diameterDisplay(row) {
  return row.thread.thread_system === "metric" ? `${row.thread.nominal_diameter} mm` : `${row.thread.nominal_diameter} in`;
}

function verificationLabel(status) {
  if (status === "verified") return "Verified";
  if (status === "source_bound") return "Source-bound";
  if (status === "pending_verification") return "Pending verification";
  return "Unavailable";
}

function driveConventionLabel(row) {
  return row.thread.thread_system === "metric" ? "ISO 2306 metric convention" : "US customary drill convention";
}

function searchKey(designation) {
  return designation
    .toLowerCase()
    .replace(/[×x]/g, "x")
    .replace(/\s+/g, "");
}

function renderTapTypeTags(tapTypeIds, tapTypeById) {
  return tapTypeIds
    .map((id) => escapeHtml(tapTypeById.get(id)?.title || id))
    .join(", ");
}

function renderStandardsTags(standards) {
  return standards.map((s) => escapeHtml(s.designation)).join(", ");
}

function renderProvenance(row) {
  const p = row.tap_drill.provenance;
  const lines = [
    `<li>Source dataset: ${escapeHtml(p.source_dataset || "Source information unavailable")}</li>`,
    `<li>Source record: ${escapeHtml(p.source_record || "Source information unavailable")}</li>`,
    `<li>Source field: ${escapeHtml(p.source_field || "Source information unavailable")}</li>`,
    `<li>Verification status: ${escapeHtml(verificationLabel(row.tap_drill.status))}</li>`
  ];
  if (p.cross_check) {
    lines.push(`<li>Cross-check: ${escapeHtml(p.cross_check)}</li>`);
  }
  if (row.data_quality.last_reviewed) {
    lines.push(`<li>Last reviewed: ${escapeHtml(row.data_quality.last_reviewed)}</li>`);
  }
  return lines.join("\n      ");
}

function renderCard(row, tapTypeById) {
  const designation = row.thread.designation;
  const system = row.thread.thread_system === "metric" ? "Metric" : row.thread.thread_system;
  const cf = coarseFineLabel(row);
  const verification = row.tap_drill.status;
  const hasAlt = Boolean(row.alternative_drill);

  const altBlock = hasAlt
    ? `
      <p><strong>ISO 2306 alternative:</strong> ${row.alternative_drill.value} ${escapeHtml(row.alternative_drill.unit)} · ${escapeHtml(verificationLabel(row.alternative_drill.status))}</p>
      <p class="muted tapping-iso-note">${escapeHtml(ISO_NOTE)}</p>`
    : "";

  return `<article class="card tapping-atlas-card" data-q="${escapeHtml(searchKey(designation))} ${escapeHtml(system.toLowerCase())}" data-system="${escapeHtml(system)}" data-class="${escapeHtml(cf)}" data-verification="${escapeHtml(verification)}" data-iso-alt="${hasAlt ? "yes" : "no"}" data-tap-types="${escapeHtml(row.tap_types.join(" "))}">
  <h3>${escapeHtml(designation)}</h3>
  <p class="muted">${escapeHtml(system)} · ${escapeHtml(diameterDisplay(row))} · ${escapeHtml(pitchTpiDisplay(row))} · ${escapeHtml(cf)}</p>
  <p><span class="data-status data-status--${escapeHtml(verification)}">Tap drill: ${escapeHtml(verificationLabel(verification))}</span></p>
  <p class="muted">Overall profile status: ${escapeHtml(verificationLabel(row.data_quality.record_status))} (engagement and process-parameter data are not yet available for any profile)</p>
  <p><strong>Primary tap drill:</strong> ${row.tap_drill.value} ${escapeHtml(row.tap_drill.unit)}<br><span class="muted">${escapeHtml(driveConventionLabel(row))}</span></p>${altBlock}
  <p><strong>Tap types:</strong> ${renderTapTypeTags(row.tap_types, tapTypeById) || "None resolved"}</p>
  <p><strong>Standards:</strong> ${renderStandardsTags(row.standards) || "None resolved"}</p>
  <details class="tapping-provenance">
    <summary>Data provenance</summary>
    <ul class="meta-list">
      ${renderProvenance(row)}
    </ul>
  </details>
</article>`;
}

function renderTapTypeSection(tapTypeProjection) {
  const cards = tapTypeProjection.rows
    .slice()
    .sort((a, b) => TAP_TYPE_ORDER.indexOf(a.entity_id) - TAP_TYPE_ORDER.indexOf(b.entity_id))
    .map((row) => {
      const noteGroup = (notes, label) => {
        if (!notes.length) return "";
        const items = notes
          .map((n) => `<li>${escapeHtml(n.fact)} <span class="muted">(${escapeHtml(verificationLabel(n.status))})</span></li>`)
          .join("\n          ");
        return `
        <p class="label-caps">${escapeHtml(label)}</p>
        <ul class="meta-list">
          ${items}
        </ul>`;
      };
      return `<article class="card">
  <h3>${escapeHtml(row.title)}</h3>
  <p class="muted">${escapeHtml(row.definition)}</p>${noteGroup(row.manufacturing_characteristics, "Manufacturing characteristic")}${noteGroup(row.typical_applications, "Typical application")}${noteGroup(row.manufacturer_specific_recommendations, "Manufacturer-specific recommendation")}
</article>`;
    })
    .join("\n");
  return cards;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function buildFilterOptions(rows) {
  return {
    systems: uniqueSorted(rows.map((r) => (r.thread.thread_system === "metric" ? "Metric" : r.thread.thread_system))),
    classes: uniqueSorted(rows.map(coarseFineLabel))
  };
}

function renderFaq() {
  const faq = [
    {
      q: "What is the BoltLab Tapping & Threading Atlas?",
      a: "It is BoltLab's structured engineering data product for tapping and thread-preparation information across metric, UNC, and UNF threads, built from BoltLab's verified knowledge layer and projection pipeline rather than written as a general guide."
    },
    {
      q: "What tap-drill information does BoltLab provide?",
      a: "Each record shows a primary tap-drill value in its own convention (ISO 2306 for metric, US-customary drill series for UNC/UNF), a verification status, and where applicable a separately labeled ISO 2306 alternative drill value for UNC/UNF threads."
    },
    {
      q: "Why are some tap-drill values source-bound?",
      a: "Source-bound means a credible source supports the value, but it has not been independently cross-checked against a primary standard table in this phase. BoltLab labels these explicitly rather than presenting every value as equally certain."
    },
    {
      q: "What is the ISO 2306 alternative drill value?",
      a: "For UNC and UNF threads, ISO 2306 provides its own metric drill-diameter recommendation using a different sizing convention than BoltLab's primary US-customary value. It is shown as a separate, independently verified field and does not replace or average with the primary value."
    },
    {
      q: "Does BoltLab provide a universal thread-engagement percentage?",
      a: "No. BoltLab can calculate radial thread engagement from thread geometry and a chosen drill diameter, but it does not assert a universal target engagement percentage, and axial engagement length remains not calculable because the required material-strength data is not yet part of the dataset."
    },
    {
      q: "Can I download the tapping data?",
      a: "Yes. The same projection data shown on this page is available as a CSV download, with verification status preserved at the field level."
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
  const html = faq
    .map((item) => `<h3>${escapeHtml(item.q)}</h3>\n        <p>${escapeHtml(item.a)}</p>`)
    .join("\n        ");
  return { html, jsonLd: faqJsonLd };
}

function renderHtml(profileProjection, tapTypeProjection) {
  const rows = profileProjection.rows;
  const tapTypeById = new Map(tapTypeProjection.rows.map((r) => [r.entity_id, r]));
  const tapDrillVerified = rows.filter((r) => r.tap_drill.status === "verified").length;
  const tapDrillSourceBound = rows.filter((r) => r.tap_drill.status === "source_bound").length;
  const altCount = rows.filter((r) => r.alternative_drill).length;
  const lastReviewed = rows.map((r) => r.data_quality.last_reviewed).filter(Boolean).sort().pop() || "unavailable";
  const sourceOrgs = uniqueSorted(rows.flatMap((r) => r.standards.map((s) => s.organization)));
  const filters = buildFilterOptions(rows);

  const cards = rows.map((row) => renderCard(row, tapTypeById)).join("\n");
  const tapTypeCards = renderTapTypeSection(tapTypeProjection);
  const faq = renderFaq();

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: TITLE,
    description: META_DESCRIPTION,
    url: CANONICAL_URL,
    creator: { "@type": "Organization", name: "BoltLab" },
    license: "https://boltlab.io/privacy",
    variableMeasured: ["tap drill diameter", "thread designation", "verification status"],
    distribution: {
      "@type": "DataDownload",
      contentUrl: "https://boltlab.io/downloads/tapping-atlas.csv",
      encodingFormat: "text/csv"
    }
  };
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
  <script type="application/ld+json">${JSON.stringify(datasetJsonLd)}</script>
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
          <li>Dataset: Tapping &amp; Threading</li>
          <li>Projection: T3 Tapping Projection</li>
          <li>Thread systems: Metric, UNC, UNF</li>
          <li>Records: ${rows.length} tapping profiles</li>
          <li>Tap types: ${tapTypeProjection.rows.length}</li>
          <li>Tap-drill values: ${tapDrillVerified} verified / ${tapDrillSourceBound} source-bound</li>
          <li>ISO 2306 alternatives: ${altCount} verified</li>
          <li>Axial engagement: Not currently calculable</li>
          <li>Last reviewed: ${escapeHtml(lastReviewed)}</li>
          <li>Verification: Mixed — see record-level status</li>
          <li>Sources: ${escapeHtml(sourceOrgs.join(", "))}</li>
        </ul>
        <p><a href="/reference/data-methodology">How BoltLab classifies and verifies engineering data</a></p>
      </section>

      <section class="card">
        <h2>Search and filters</h2>
        <div class="converter-grid">
          <label for="tapping-search">Search designation</label>
          <input id="tapping-search" class="input-field" type="search" placeholder="M8, M8x1.25, 1/4-20, 3/8-16 UNC">
          <label for="tapping-system">Thread system</label>
          <select id="tapping-system" class="input-field"><option value="">All</option>${filters.systems.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("")}</select>
          <label for="tapping-class">Thread class</label>
          <select id="tapping-class" class="input-field"><option value="">All</option>${filters.classes.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v.charAt(0).toUpperCase() + v.slice(1))}</option>`).join("")}</select>
          <label for="tapping-verification">Verification status</label>
          <select id="tapping-verification" class="input-field"><option value="">All</option><option value="verified">Verified tap drill</option><option value="source_bound">Source-bound tap drill</option></select>
          <label for="tapping-iso">ISO 2306 alternative</label>
          <select id="tapping-iso" class="input-field"><option value="">All</option><option value="yes">Available</option><option value="no">Not applicable</option></select>
          <label for="tapping-taptype">Tap type</label>
          <select id="tapping-taptype" class="input-field"><option value="">All</option><option value="taper_tap">Taper</option><option value="plug_tap">Plug</option><option value="bottoming_tap">Bottoming</option><option value="spiral_point_tap">Spiral point</option><option value="spiral_flute_tap">Spiral flute</option><option value="forming_tap">Forming</option><option value="hand_tap">Hand</option></select>
        </div>
      </section>

      <section class="card">
        <h2>Results</h2>
        <p id="tapping-results-summary" class="muted" role="status">Showing ${rows.length} of ${rows.length} tapping profiles.</p>
        <div id="tapping-results" class="grid tool-grid">
${cards}
        </div>
      </section>

      <section class="card">
        <h2>Tap types</h2>
        <p class="muted">Structural, sourced application knowledge for the seven tap types in BoltLab's tapping domain. Facts are labeled by evidence kind — general taxonomy, manufacturing characteristic, typical application, or manufacturer-specific recommendation — and by verification status.</p>
        <div class="grid tool-grid">
${tapTypeCards}
        </div>
      </section>

      <section class="card">
        <h2>Standards</h2>
        <p class="muted">${escapeHtml(STANDARDS_NOTE)}</p>
        <ul class="meta-list">
          <li><a href="/reference/iso-thread-tolerances-explained">ISO 965-1</a></li>
          <li><a href="/reference/iso-261-metric-thread-series">ISO 261</a></li>
          <li><a href="/reference/iso-262-metric-thread-fine-series">ISO 262</a></li>
          <li><a href="/reference/iso-724-thread-dimensions">ISO 724</a></li>
          <li>ISO 2306 — Drills for use prior to tapping screw threads</li>
          <li>ASME B1.1 — Unified Inch Screw Threads (UN, UNR, and UNJ Thread Forms)</li>
        </ul>
      </section>

      <section class="card">
        <h2>Thread engagement</h2>
        <p>${escapeHtml(ENGAGEMENT_COPY)}</p>
      </section>

      <section class="card">
        <h2>Data interpretation</h2>
        <ul class="meta-list">
          <li><strong>Primary tap drill</strong> — the profile's main value, in its own labeled convention (ISO 2306 for metric, US customary for UNC/UNF).</li>
          <li><strong>ISO 2306 alternative</strong> — shown only for UNC/UNF, always a separate value, never a replacement for the primary drill.</li>
          <li><strong>Verified</strong> (tap drill) — independently cross-checked against the cited primary source.</li>
          <li><strong>Source-bound</strong> (tap drill) — bound to a verified BoltLab source record, but not yet independently cross-checked against the primary standard.</li>
          <li><strong>Field-level vs. overall status</strong> — a profile's tap-drill value can be individually verified while the profile as a whole remains source-bound, because thread-engagement and tapping-process-parameter data are not yet available for any of the 29 profiles. The two states are shown separately on every card and are not the same claim.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Download</h2>
        <p>${escapeHtml(CSV_NOTE)}</p>
        <p><a href="/downloads/tapping-atlas.csv" download>Download tapping atlas CSV</a></p>
      </section>

      <section class="card">
        <h2>Related tools</h2>
        <ul class="meta-list">
          <li><a href="/tools/tap-drill-calculator">Tap Drill Calculator</a></li>
          <li><a href="/tools/thread-identifier">Thread Identifier</a></li>
          <li><a href="/tools/thread-pitch-to-tpi-converter">Thread Pitch Converter</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>Related engineering references</h2>
        <ul class="meta-list">
          <li><a href="/reference/thread-atlas">Unified Thread Atlas</a></li>
          <li><a href="/reference/metric-thread-atlas">Metric Thread Atlas</a></li>
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
        <a href="/reference/thread-atlas">Thread Atlas</a>
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
  <script>
  (function() {
    const searchEl = document.getElementById("tapping-search");
    const systemEl = document.getElementById("tapping-system");
    const classEl = document.getElementById("tapping-class");
    const verificationEl = document.getElementById("tapping-verification");
    const isoEl = document.getElementById("tapping-iso");
    const tapTypeEl = document.getElementById("tapping-taptype");
    const summaryEl = document.getElementById("tapping-results-summary");
    const cards = [...document.querySelectorAll(".tapping-atlas-card")];
    const total = cards.length;

    function normalize(str) {
      return str.toLowerCase().replace(/[×x]/g, "x").replace(/\\s+/g, "");
    }

    function isMatch(card) {
      const q = normalize(searchEl.value.trim());
      if (q && !normalize(card.dataset.q).includes(q)) return false;
      if (systemEl.value && card.dataset.system !== systemEl.value) return false;
      if (classEl.value && card.dataset.class !== classEl.value) return false;
      if (verificationEl.value && card.dataset.verification !== verificationEl.value) return false;
      if (isoEl.value && card.dataset.isoAlt !== isoEl.value) return false;
      if (tapTypeEl.value) {
        const types = card.dataset.tapTypes.split(" ").filter(Boolean);
        if (!types.includes(tapTypeEl.value)) return false;
      }
      return true;
    }

    function applyFilters() {
      let shown = 0;
      cards.forEach((card) => {
        const match = isMatch(card);
        card.style.display = match ? "" : "none";
        if (match) shown += 1;
      });
      summaryEl.textContent = "Showing " + shown + " of " + total + " tapping profiles.";
    }

    [searchEl, systemEl, classEl, verificationEl, isoEl, tapTypeEl].forEach((el) => {
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

function renderCsv(profileProjection) {
  const header = [
    "designation",
    "thread_system",
    "nominal_diameter",
    "nominal_diameter_unit",
    "pitch",
    "pitch_unit",
    "tpi",
    "coarse_fine",
    "primary_tap_drill",
    "primary_tap_drill_unit",
    "primary_drill_convention",
    "primary_tap_drill_status",
    "iso_2306_alternative_drill",
    "iso_2306_alternative_unit",
    "iso_2306_alternative_status",
    "standards",
    "tap_types",
    "record_status"
  ];

  const lines = [header.join(",")];
  for (const row of profileProjection.rows) {
    const cells = [
      row.thread.designation,
      row.thread.thread_system,
      row.thread.nominal_diameter,
      row.thread.nominal_diameter_unit,
      row.thread.pitch ?? "",
      row.thread.pitch_unit ?? "",
      row.thread.threads_per_inch ?? "",
      coarseFineLabel(row),
      row.tap_drill.value,
      row.tap_drill.unit,
      driveConventionLabel(row),
      row.tap_drill.status,
      row.alternative_drill ? row.alternative_drill.value : "",
      row.alternative_drill ? row.alternative_drill.unit : "",
      row.alternative_drill ? row.alternative_drill.status : "",
      row.standards.map((s) => s.designation).join("; "),
      row.tap_types.join("; "),
      row.data_quality.record_status
    ];
    lines.push(cells.map(escapeCsv).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const root = projectRoot();
  const profileProjection = readJson(path.join(root, "data", "projections", "tapping", "tapping-profiles.json"));
  const tapTypeProjection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));
  const profileSchema = readJson(path.join(root, "data", "projections", "tapping-profile.schema.json"));
  const tapTypeSchema = readJson(path.join(root, "data", "projections", "tapping-tap-type.schema.json"));

  const errors = validateProjections(profileProjection, tapTypeProjection, profileSchema, tapTypeSchema);
  if (errors.length) {
    console.error("Tapping atlas projection validation failed:");
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  const html = renderHtml(profileProjection, tapTypeProjection);
  const csv = renderCsv(profileProjection);

  writeText(path.join(root, "reference", "tapping-atlas.html"), html);
  console.log("Generated reference/tapping-atlas.html");
  writeText(path.join(root, "downloads", "tapping-atlas.csv"), csv);
  console.log("Generated downloads/tapping-atlas.csv");
}

main();
