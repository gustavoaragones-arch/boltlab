#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson } = require("../utilities/path-utils");

const KNOWN_ENTITY_IDS = new Set([
  "pitch_diameter",
  "major_diameter",
  "minor_diameter",
  "tolerance_zone",
  "thread_pitch"
]);

const KNOWN_STANDARD_IDS = new Set(["iso_724", "iso_965_1"]);
const KNOWN_DATASET_IDS = new Set(["metric_threads", "unc_threads"]);

function simpleValidateAgainstSchema(schema, record) {
  const errors = [];
  for (const field of schema.required || []) {
    if (!(field in record)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  for (const [key, rules] of Object.entries(schema.properties || {})) {
    if (!(key in record)) {
      continue;
    }
    const value = record[key];
    if (rules.const !== undefined && value !== rules.const) {
      errors.push(`Field ${key} must equal ${rules.const}`);
    }
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`Field ${key} has invalid enum value: ${value}`);
    }
    if (rules.pattern && typeof value === "string" && !new RegExp(rules.pattern).test(value)) {
      errors.push(`Field ${key} does not match pattern ${rules.pattern}`);
    }
    if (typeof rules.minLength === "number" && typeof value === "string" && value.length < rules.minLength) {
      errors.push(`Field ${key} is shorter than minLength ${rules.minLength}`);
    }
    if (typeof rules.maxLength === "number" && typeof value === "string" && value.length > rules.maxLength) {
      errors.push(`Field ${key} is longer than maxLength ${rules.maxLength}`);
    }
  }
  return errors;
}

function routeExists(root, routePath) {
  const absoluteBase = path.join(root, routePath);
  const candidates = [absoluteBase, `${absoluteBase}.html`, path.join(absoluteBase, "index.html")];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFaqSection(faq) {
  return faq
    .map(
      (item) =>
        `        <h3>${escapeHtml(item.question)}</h3>\n` +
        `        <p>${item.answer_html || escapeHtml(item.answer_text)}</p>`
    )
    .join("\n");
}

function renderFaqJsonLd(canonicalUrl, faq) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer_text
      }
    })),
    url: canonicalUrl
  });
}

function validateProjection(root, schema, projection) {
  const errors = simpleValidateAgainstSchema(schema, projection);
  if (projection.entity_id !== "pitch_diameter") {
    errors.push("This generator only supports projection entity_id pitch_diameter.");
  }
  if (!projection.title || projection.title.length > 60) {
    errors.push("Projection title must be present and <= 60 characters.");
  }
  if (!projection.meta_description || projection.meta_description.length < 140 || projection.meta_description.length > 155) {
    errors.push("Projection meta_description must be between 140 and 155 characters.");
  }
  const expectedCanonical = `https://boltlab.io${projection.route_hint}`;
  if (projection.canonical_url !== expectedCanonical) {
    errors.push(`Canonical URL mismatch: expected ${expectedCanonical}.`);
  }
  if (!Array.isArray(projection.faq) || projection.faq.length < 3) {
    errors.push("Projection faq must include at least 3 questions.");
  }
  for (const item of projection.faq || []) {
    if (!KNOWN_ENTITY_IDS.has(item.answer_source?.entity_id)) {
      errors.push(`FAQ ${item.id} references unknown entity id ${item.answer_source?.entity_id}`);
    }
  }
  for (const id of projection.related_entities || []) {
    if (!KNOWN_ENTITY_IDS.has(id)) {
      errors.push(`Unknown related entity id: ${id}`);
    }
  }
  for (const id of projection.related_standards || []) {
    if (!KNOWN_STANDARD_IDS.has(id)) {
      errors.push(`Unknown related standard id: ${id}`);
    }
  }
  for (const id of projection.related_datasets || []) {
    if (!KNOWN_DATASET_IDS.has(id)) {
      errors.push(`Unknown related dataset id: ${id}`);
    }
  }
  for (const link of [
    ...(projection.related_tools || []),
    ...(projection.related_charts || []),
    ...(projection.related_guides || [])
  ]) {
    if (!routeExists(root, link)) {
      errors.push(`Related link does not resolve: ${link}`);
    }
  }
  return errors;
}

function renderHtml(projection) {
  const pageTitle = `${projection.title} | Thread Engineering`;
  const faqJsonLd = renderFaqJsonLd(projection.canonical_url, projection.faq);
  const faqSection = renderFaqSection(projection.faq);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(projection.meta_description)}">
  <link rel="canonical" href="${escapeHtml(projection.canonical_url)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(projection.canonical_url)}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <link rel="stylesheet" href="/css/styles.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${escapeHtml(pageTitle)}","description":"${escapeHtml(projection.meta_description)}","url":"${escapeHtml(projection.canonical_url)}","author":{"@type":"Organization","name":"BoltLab"}}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"BoltLab","item":"https://boltlab.io/"},{"@type":"ListItem","position":2,"name":"Reference","item":"https://boltlab.io/reference/"},{"@type":"ListItem","position":3,"name":"Thread Engineering","item":"https://boltlab.io/reference/thread-engineering/"},{"@type":"ListItem","position":4,"name":"${escapeHtml(projection.title)}","item":"${escapeHtml(projection.canonical_url)}"}]}</script>
  <script type="application/ld+json">${faqJsonLd}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"${escapeHtml(pageTitle)}","url":"${escapeHtml(projection.canonical_url)}","description":"${escapeHtml(projection.meta_description)}"}</script>
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
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → <a href="/reference/thread-engineering/">Thread Engineering</a> → ${escapeHtml(projection.title)}</nav>
      <h1>${escapeHtml(projection.title)}</h1>
      <p class="muted">Pitch diameter is the controlling functional diameter for fit and load transfer in most threaded joints.</p>
      <section class="card">
        <h2>Quick Reference</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Field</th><th scope="col">Value</th></tr></thead>
            <tbody>
              <tr><th scope="row">Thread Type</th><td>Functional geometry</td></tr>
              <tr><th scope="row">Standard</th><td>Thread form measurement framework</td></tr>
              <tr><th scope="row">Tolerance</th><td>Primary fit-controlling diameter</td></tr>
              <tr><th scope="row">Typical Use</th><td>Go/no-go and metrology interpretation</td></tr>
              <tr><th scope="row">Internal / External</th><td>Both</td></tr>
              <tr><th scope="row">Common Pair</th><td>Evaluated with major/minor diameters</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>Pitch Diameter Explained is a thread engineering reference topic that defines how threaded parts are specified and verified.</p>
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
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Engineering attribute</th><th scope="col">Reference interpretation</th></tr></thead>
            <tbody>
              <tr><td>Controlling attribute</td><td>Thread class and geometric relationship determine fit behavior.</td></tr>
              <tr><td>Measurement priority</td><td>Use class notation and functional diameter checks before release.</td></tr>
              <tr><td>Inspection alignment</td><td>Match gauge and metrology plan to class and application risk.</td></tr>
              <tr><td>Data policy</td><td>Use only verified standards values for numeric limits.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Engineering Notes</h2>
        <p class="muted">This reference explains how the standard defines the measurement and interpretation workflow. Detailed tolerance tables will be added as verified engineering reference data in future revisions.</p>
        <div class="chart-table-wrapper">
        <svg width="560" height="140" viewBox="0 0 560 140" role="img" aria-label="Major, pitch, and minor diameter reference lines" xmlns="http://www.w3.org/2000/svg">
          <title>Major pitch and minor diameter reference lines</title>
          <rect x="1" y="1" width="558" height="138" rx="6" fill="none" stroke="#444"/>
          <text x="24" y="34" fill="#ddd" font-size="14">Major Diameter</text>
          <line x1="180" y1="28" x2="530" y2="28" stroke="#f59e0b" stroke-width="2"/>
          <text x="24" y="72" fill="#ddd" font-size="14">Pitch Diameter</text>
          <line x1="180" y1="66" x2="500" y2="66" stroke="#bcbcbc" stroke-width="2"/>
          <text x="24" y="110" fill="#ddd" font-size="14">Minor Diameter</text>
          <line x1="180" y1="104" x2="470" y2="104" stroke="#888" stroke-width="2"/>
        </svg>
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
              <li>ISO 68</li>
              <li>ISO 261</li>
              <li>ISO 724</li>
              <li>ISO 965</li>
            </ul>
          </div>
          <div>
            <p class="label-caps">Engineering Reference — Related Concepts</p>
            <ul class="meta-list">
              <li><a href="/reference/pitch-diameter-explained">Pitch Diameter</a></li>
              <li><a href="/reference/thread-tolerances">Major Diameter</a></li>
              <li><a href="/reference/thread-tolerances">Minor Diameter</a></li>
              <li><a href="/reference/allowance-vs-tolerance">Allowance</a></li>
              <li><a href="/reference/tolerance-zones-explained">Tolerance Zone</a></li>
              <li><a href="/reference/thread-fit-classes-explained">Fit Class</a></li>
            </ul>
          </div>
        </div>
      </section>
      <section class="card">
        <h2>Related references</h2>
        <ul class="meta-list">
          <li><a href="/reference/thread-tolerances">What are Thread Tolerances?</a></li>
          <li><a href="/reference/metric-thread-tolerance-chart">Metric Thread Tolerance Chart</a></li>
          <li><a href="/reference/iso-thread-tolerances-explained">ISO Thread Tolerances Explained</a></li>
          <li><a href="/reference/internal-thread-tolerances">Internal Thread Tolerances</a></li>
          <li><a href="/reference/external-thread-tolerances">External Thread Tolerances</a></li>
          <li><a href="/reference/thread-fit-classes-explained">Thread Fit Classes Explained</a></li>
        </ul>
        <h3>Engineers also consult</h3>
        <p><a href="/reference/pitch-diameter-explained">Pitch Diameter</a> · <a href="/reference/thread-tolerances">Major Diameter</a> · <a href="/reference/thread-tolerances">Minor Diameter</a> · <a href="/guides/how-to-measure-thread-pitch">Thread Pitch</a> · <a href="/tools/tap-drill-calculator">Tap Drill</a> · <a href="/reference/tolerance-zones-explained">Tolerance Zone</a></p>
      </section>
      <section class="card">
        <h2>Related tools</h2>
        <ul class="meta-list">
          <li><a href="/tools/thread-identifier">Thread Identifier</a></li>
          <li><a href="/tools/thread-pitch-to-tpi-converter">Thread Pitch Converter</a></li>
          <li><a href="/tools/tap-drill-calculator">Tap Drill Calculator</a></li>
          <li><a href="/charts/universal-screw-bolt-size-chart">Universal Size Chart</a></li>
        </ul>
        <h3>Related charts</h3>
        <ul class="meta-list">
          <li><a href="/charts/metric-thread-chart">Metric Thread Chart</a></li>
          <li><a href="/charts/unc-thread-chart">UNC Chart</a></li>
          <li><a href="/charts/unf-thread-chart">UNF Chart</a></li>
          <li><a href="/charts/metric-vs-imperial-chart">Metric vs Imperial</a></li>
        </ul>
      </section>
      <section class="card">
        <h2>FAQ</h2>
${faqSection}
      </section>
      <section class="card guide-links">
        <h3>Guide connection</h3>
        <p><a href="/guides/metric-thread-tolerances">Metric Thread Tolerances</a> links conceptual thread engineering topics to common workshop and drawing-review workflows.</p>
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
</html>
`;
}

function main() {
  const root = projectRoot();
  const projectionPath = path.join(
    root,
    "data",
    "projections",
    "reference",
    "pitch_diameter.reference.json"
  );
  const schemaPath = path.join(root, "data", "projections", "reference-page.schema.json");
  const outputPath = path.join(root, "reference", "pitch-diameter-explained.html");

  const projection = readJson(projectionPath);
  const schema = readJson(schemaPath);
  const errors = validateProjection(root, schema, projection);

  if (errors.length) {
    console.error("Reference projection validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const html = renderHtml(projection);
  fs.writeFileSync(outputPath, html);
  console.log(`Generated ${path.relative(root, outputPath)} from projection ${path.relative(root, projectionPath)}`);
}

main();
