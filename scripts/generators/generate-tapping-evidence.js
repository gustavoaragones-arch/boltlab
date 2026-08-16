#!/usr/bin/env node
const path = require("node:path");
const { projectRoot, readJson, writeText } = require("../utilities/path-utils");

const CANONICAL_URL = "https://boltlab.io/reference/tapping-evidence";
const TITLE = "Tapping Evidence & Provenance";
const META_DESCRIPTION =
  "Trace BoltLab tapping data to its documented sources, verification status, and evidence classification.";
const EVIDENCE_SUMMARY_COPY =
  "Each BoltLab tapping value is assigned a verification state based on the evidence available for that specific field. Verified values have undergone the project's independent verification process; source-bound values remain traceable to documented sources without being promoted to the same verification tier.";
const ENGAGEMENT_LIMITATION =
  "Thread engagement calculation is not currently available in BoltLab's verified dataset.";

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// -- Validate the projections this page depends on (it does not read them at runtime -- the
// browser reuses js/tapping-workflow-data.js, already generated from these same projections). --
function validateProjection(profileProjection, tapTypeProjection) {
  const errors = [];
  if (profileProjection.projection_type !== "tapping_profile_projection") errors.push("profileProjection.projection_type mismatch");
  if (tapTypeProjection.projection_type !== "tapping_tap_type_projection") errors.push("tapTypeProjection.projection_type mismatch");
  if (!Array.isArray(profileProjection.rows) || profileProjection.rows.length === 0) errors.push("profileProjection.rows missing or empty");
  if (!Array.isArray(tapTypeProjection.rows) || tapTypeProjection.rows.length !== 7) {
    errors.push(`Expected 7 tap-type rows, found ${(tapTypeProjection.rows || []).length}`);
  }
  return errors;
}

function computeCounts(profileProjection, tapTypeProjection) {
  const rows = profileProjection.rows;
  const tapDrillVerified = rows.filter((r) => r.tap_drill.status === "verified").length;
  const tapDrillSourceBound = rows.filter((r) => r.tap_drill.status === "source_bound").length;
  const recordVerified = rows.filter((r) => r.data_quality.record_status === "verified").length;
  const recordSourceBound = rows.filter((r) => r.data_quality.record_status === "source_bound").length;
  let tapTypeVerified = 0;
  let tapTypeSourceBound = 0;
  for (const t of tapTypeProjection.rows) {
    tapTypeVerified += t.evidence_status.verified_fact_count;
    tapTypeSourceBound += t.evidence_status.source_bound_fact_count;
  }
  return {
    total: rows.length,
    tapDrillVerified,
    tapDrillSourceBound,
    recordVerified,
    recordSourceBound,
    tapTypeCount: tapTypeProjection.rows.length,
    tapTypeVerified,
    tapTypeSourceBound
  };
}

function renderHtml(counts) {
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
        <p>Trace BoltLab tapping data to its documented sources, verification status, and evidence classification.</p>
      </div>

      <section class="card" id="evidence-summary">
        <h2>How BoltLab classifies tapping evidence</h2>
        <p>${escapeHtml(EVIDENCE_SUMMARY_COPY)}</p>
        <p><a href="/reference/data-methodology">Full BoltLab data methodology</a></p>
      </section>

      <section class="card" id="data-quality">
        <h2>Data quality</h2>
        <ul class="meta-list">
          <li>Tap-drill: <span id="ev-td-verified">${counts.tapDrillVerified}</span> verified / <span id="ev-td-sourcebound">${counts.tapDrillSourceBound}</span> source-bound</li>
          <li>Overall records: <span id="ev-rec-verified">${counts.recordVerified}</span> verified / <span id="ev-rec-sourcebound">${counts.recordSourceBound}</span> source-bound</li>
          <li>Tap types: <span id="ev-tt-verified">${counts.tapTypeVerified}</span> verified fact${counts.tapTypeVerified === 1 ? "" : "s"} / <span id="ev-tt-sourcebound">${counts.tapTypeSourceBound}</span> source-bound fact${counts.tapTypeSourceBound === 1 ? "" : "s"}</li>
        </ul>
      </section>

      <section class="card">
        <h2>Filters</h2>
        <div class="converter-grid">
          <label for="ev-mode">Evidence type</label>
          <select id="ev-mode" class="input-field">
            <option value="all">All</option>
            <option value="tap-drill">Tap-drill</option>
            <option value="tap-type">Tap type</option>
          </select>
          <label for="ev-system">Thread system</label>
          <select id="ev-system" class="input-field">
            <option value="">All</option>
          </select>
          <label for="ev-status">Evidence status</label>
          <select id="ev-status" class="input-field">
            <option value="">All</option>
            <option value="verified">Verified</option>
            <option value="source_bound">Source-bound</option>
          </select>
        </div>
      </section>

      <section class="card" id="ev-tap-drill-section">
        <h2>Tap-drill evidence</h2>
        <div class="converter-grid">
          <label for="ev-designation">Thread designation</label>
          <select id="ev-designation" class="input-field">
            <option value="">Choose a designation…</option>
          </select>
        </div>
        <div id="ev-profile-card" hidden aria-live="polite"></div>
      </section>

      <section class="card" id="ev-tap-type-section">
        <h2>Tap-type evidence</h2>
        <div class="converter-grid">
          <label for="ev-taptype">Tap type</label>
          <select id="ev-taptype" class="input-field">
            <option value="">Choose a tap type…</option>
          </select>
        </div>
        <div id="ev-taptype-card" hidden aria-live="polite"></div>
      </section>

      <section class="card">
        <h2>Thread engagement evidence</h2>
        <p>${escapeHtml(ENGAGEMENT_LIMITATION)}</p>
      </section>

      <section class="card">
        <h2>Continue exploring</h2>
        <ul class="meta-list">
          <li>Browse the complete tapping dataset in the <a href="/reference/tapping-atlas">Tapping &amp; Threading Atlas</a>.</li>
          <li>Compare tap types in the <a href="/reference/tap-type-guide">Tap-Type Guide</a>.</li>
          <li>Work through a tapping decision in the <a href="/tools/tapping-workflow">Tapping Workflow</a>.</li>
          <li>Use the <a href="/tools/tap-drill-calculator">Tap Drill Calculator</a> for a quick metric calculation.</li>
        </ul>
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
  <script src="/js/tapping-workflow-data.js" defer></script>
  <script>
  (function () {
    function esc(s) {
      var d = document.createElement("div");
      d.textContent = s;
      return d.innerHTML;
    }
    function verificationLabel(status) {
      if (status === "verified") return "Verified";
      if (status === "source_bound") return "Source-bound";
      if (status === "pending_verification") return "Pending verification";
      return "Provenance not available in the current projection.";
    }
    function classificationLabel(c) {
      if (c === "general_taxonomy") return "General taxonomy";
      if (c === "manufacturing_characteristic") return "Manufacturing characteristic";
      if (c === "typical_application") return "Typical application";
      if (c === "manufacturer_specific_recommendation") return "Manufacturer-specific recommendation";
      return c;
    }
    function conventionLabel(p) {
      return p.thread.thread_system === "metric" ? "Metric drill convention" : "US customary drill convention";
    }
    function pitchDisplay(p) {
      return p.thread.thread_system === "metric" ? p.thread.pitch + " mm" : p.thread.threads_per_inch + " TPI";
    }

    function init() {
      var data = window.BoltLabTappingWorkflowData;
      if (!data) return;

      var modeEl = document.getElementById("ev-mode");
      var systemEl = document.getElementById("ev-system");
      var statusEl = document.getElementById("ev-status");
      var designationEl = document.getElementById("ev-designation");
      var taptypeEl = document.getElementById("ev-taptype");
      var profileSection = document.getElementById("ev-tap-drill-section");
      var taptypeSection = document.getElementById("ev-tap-type-section");
      var profileCard = document.getElementById("ev-profile-card");
      var taptypeCard = document.getElementById("ev-taptype-card");

      var systems = [];
      data.profiles.forEach(function (p) {
        var sys = p.thread.thread_system === "metric" ? "Metric" : p.thread.thread_system;
        if (systems.indexOf(sys) === -1) systems.push(sys);
      });
      systems.sort().forEach(function (sys) {
        var opt = document.createElement("option");
        opt.value = sys;
        opt.textContent = sys;
        systemEl.appendChild(opt);
      });

      data.tapTypes.forEach(function (t) {
        var opt = document.createElement("option");
        opt.value = t.entity_id;
        opt.textContent = t.title;
        taptypeEl.appendChild(opt);
      });

      function applyMode() {
        var mode = modeEl.value;
        profileSection.hidden = mode === "tap-type";
        taptypeSection.hidden = mode === "tap-drill";
      }

      function matchesFilters(p) {
        var sys = p.thread.thread_system === "metric" ? "Metric" : p.thread.thread_system;
        if (systemEl.value && sys !== systemEl.value) return false;
        if (statusEl.value && p.tap_drill.status !== statusEl.value) return false;
        return true;
      }

      function refreshDesignationOptions() {
        var current = designationEl.value;
        designationEl.innerHTML = '<option value="">Choose a designation…</option>';
        data.profiles
          .filter(matchesFilters)
          .slice()
          .sort(function (a, b) { return a.thread.designation.localeCompare(b.thread.designation); })
          .forEach(function (p) {
            var opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.thread.designation + " (" + p.thread.thread_system + ")";
            designationEl.appendChild(opt);
          });
        if (current && data.profiles.some(function (p) { return p.id === current && matchesFilters(p); })) {
          designationEl.value = current;
        } else {
          profileCard.hidden = true;
        }
      }

      function provenanceBlock(p) {
        var prov = p.tap_drill.provenance;
        var lines = [];
        lines.push("<li>Source dataset: " + esc(prov.source_dataset || "Provenance not available in the current projection.") + "</li>");
        lines.push("<li>Source record: " + esc(prov.source_record || "Provenance not available in the current projection.") + "</li>");
        lines.push("<li>Source field: " + esc(prov.source_field || "Provenance not available in the current projection.") + "</li>");
        return '<p class="label-caps">Provenance</p><ul class="meta-list">' + lines.join("") + "</ul>";
      }

      function crossVerificationBlock(p) {
        var prov = p.tap_drill.provenance;
        if (!prov.cross_check && !prov.source) return "";
        var lines = [];
        if (prov.source) lines.push("<li>Cited source/standard: " + esc(prov.source) + "</li>");
        if (prov.cross_check) lines.push("<li>Comparison result: " + esc(prov.cross_check) + "</li>");
        return '<p class="label-caps">Cross-verification</p><ul class="meta-list">' + lines.join("") + "</ul>" +
          '<p class="muted">This is the source used for independent cross-verification, which may differ from the source of the original value above.</p>';
      }

      function alternativeBlock(p) {
        if (!p.alternative_drill) return "";
        return '<p class="label-caps">Alternative</p>' +
          "<p><strong>ISO 2306 alternative drill:</strong> " + p.alternative_drill.value + " " + esc(p.alternative_drill.unit) +
          ' <span class="data-status data-status--' + esc(p.alternative_drill.status) + '">' + esc(verificationLabel(p.alternative_drill.status)) + "</span></p>" +
          '<p class="muted">Kept separate from the primary tap-drill value; not a replacement, not averaged.</p>';
      }

      function standardsBlock(p) {
        if (!p.standards.length) return "";
        var items = p.standards.map(function (s) { return "<li>" + esc(s.designation) + " — " + esc(s.title || s.designation) + "</li>"; }).join("");
        return '<p class="label-caps">Standards</p><ul class="meta-list">' + items + "</ul>";
      }

      function limitationsBlock(p) {
        var items = [];
        if (p.engagement.radial.target_percent === null) {
          items.push("<li>" + esc(ENGAGEMENT_LIMITATION_JS) + "</li>");
        }
        if (!items.length) return "";
        return '<p class="label-caps">Limitations</p><ul class="meta-list">' + items.join("") + "</ul>";
      }
      var ENGAGEMENT_LIMITATION_JS = ${JSON.stringify(ENGAGEMENT_LIMITATION)};

      function renderProfileCard(p) {
        var html =
          "<h3>" + esc(p.thread.designation) + "</h3>" +
          '<p class="muted">' + esc(p.thread.thread_system === "metric" ? "Metric" : p.thread.thread_system) + " · " + esc(pitchDisplay(p)) + "</p>" +
          '<p><span class="data-status data-status--' + esc(p.tap_drill.status) + '">Tap drill: ' + esc(verificationLabel(p.tap_drill.status)) + "</span></p>" +
          '<p class="muted">Overall record status: ' + esc(verificationLabel(p.data_quality.record_status)) + "</p>" +
          "<p><strong>Primary tap drill:</strong> " + p.tap_drill.value + " " + esc(p.tap_drill.unit) + " (" + esc(conventionLabel(p)) + ")</p>" +
          provenanceBlock(p) +
          crossVerificationBlock(p) +
          alternativeBlock(p) +
          standardsBlock(p) +
          limitationsBlock(p);
        profileCard.innerHTML = html;
        profileCard.hidden = false;
      }

      function renderTapTypeCard(t) {
        function group(label, notes) {
          if (!notes.length) return "";
          var items = notes.map(function (n) {
            return "<li>" + esc(n.fact) + ' <span class="data-status data-status--' + esc(n.status) + '">' + esc(verificationLabel(n.status)) + "</span>" +
              ' <span class="muted">— evidence kind: ' + esc(classificationLabel(n.classification)) + "; source: " + esc(n.source || "Provenance not available in the current projection.") + "</span></li>";
          }).join("");
          return '<p class="label-caps">' + esc(label) + '</p><ul class="meta-list">' + items + "</ul>";
        }
        var html =
          "<h3>" + esc(t.title) + "</h3>" +
          '<p class="muted">' + esc(t.definition) + "</p>" +
          group("General taxonomy", t.general_taxonomy) +
          group("Manufacturing characteristics", t.manufacturing_characteristics) +
          group("Typical applications", t.typical_applications) +
          group("Manufacturer-specific recommendations", t.manufacturer_specific_recommendations);
        taptypeCard.innerHTML = html;
        taptypeCard.hidden = false;
      }

      modeEl.addEventListener("change", applyMode);
      systemEl.addEventListener("change", refreshDesignationOptions);
      statusEl.addEventListener("change", refreshDesignationOptions);
      designationEl.addEventListener("change", function () {
        if (!designationEl.value) { profileCard.hidden = true; return; }
        var p = data.profiles.filter(function (x) { return x.id === designationEl.value; })[0];
        if (p) renderProfileCard(p);
      });
      taptypeEl.addEventListener("change", function () {
        if (!taptypeEl.value) { taptypeCard.hidden = true; return; }
        var t = data.tapTypes.filter(function (x) { return x.entity_id === taptypeEl.value; })[0];
        if (t) renderTapTypeCard(t);
      });

      applyMode();
      refreshDesignationOptions();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
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
  const profileProjection = readJson(path.join(root, "data", "projections", "tapping", "tapping-profiles.json"));
  const tapTypeProjection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));

  const errors = validateProjection(profileProjection, tapTypeProjection);
  if (errors.length) {
    console.error("Tapping evidence projection validation failed:");
    for (const e of errors) console.error(`- ${e}`);
    process.exit(1);
  }

  const counts = computeCounts(profileProjection, tapTypeProjection);
  writeText(path.join(root, "reference", "tapping-evidence.html"), renderHtml(counts));
  console.log(`Generated reference/tapping-evidence.html (${counts.total} profiles, ${counts.tapTypeCount} tap types)`);
}

main();
