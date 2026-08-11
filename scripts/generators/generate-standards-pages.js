#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson, walkFiles } = require("../utilities/path-utils");

const STANDARD_LABELS = {
  iso_68_1: "ISO 68-1",
  iso_261: "ISO 261",
  iso_262: "ISO 262",
  iso_724: "ISO 724",
  iso_965_1: "ISO 965-1"
};

const ENTITY_LINKS = {
  thread_pitch: { label: "Thread Pitch", href: "/reference/thread-tolerances" },
  pitch_diameter: { label: "Pitch Diameter", href: "/reference/pitch-diameter-explained" },
  tolerance_zone: { label: "Tolerance Zone", href: "/reference/tolerance-zones-explained" },
  major_diameter: { label: "Major Diameter", href: "/reference/thread-tolerances" },
  minor_diameter: { label: "Minor Diameter", href: "/reference/thread-tolerances" },
  fit_class_6h: { label: "Fit Class 6H", href: "/reference/6h-vs-6g" },
  fit_class_6g: { label: "Fit Class 6g", href: "/reference/6g-vs-6h" },
  allowance: { label: "Allowance", href: "/reference/allowance-vs-tolerance" },
  thread_system_unc: { label: "UNC Thread System", href: "/reference/thread-types" },
  iso_965: { label: "ISO 965 Concept", href: "/reference/iso-thread-tolerances-explained" }
};

const ROUTE_LABELS = {
  "/tools/thread-identifier": "Thread Identifier",
  "/tools/thread-pitch-to-tpi-converter": "Thread Pitch Converter",
  "/tools/tap-drill-calculator": "Tap Drill Calculator",
  "/charts/metric-thread-chart": "Metric Thread Chart",
  "/charts/unc-thread-chart": "UNC Thread Chart",
  "/charts/metric-vs-imperial-chart": "Metric vs Imperial Chart",
  "/guides/metric-thread-tolerances": "Metric Thread Tolerances Guide",
  "/guides/thread-types-explained": "Thread Types Explained Guide"
};

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
    if (!(key in record)) {
      continue;
    }
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

function routeExists(root, routePath) {
  const absoluteBase = path.join(root, routePath);
  const candidates = [absoluteBase, `${absoluteBase}.html`, path.join(absoluteBase, "index.html")];
  return candidates.some((candidate) => fs.existsSync(candidate));
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

function renderTable(table) {
  if (!table || !Array.isArray(table.columns) || !Array.isArray(table.rows)) {
    return "";
  }
  const head = table.columns.map((col) => `<th scope="col">${escapeHtml(col)}</th>`).join("");
  const body = table.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("\n");
  return `
      <section class="card">
        <h2>${escapeHtml(table.title)}</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr>${head}</tr></thead>
            <tbody>
${body}
            </tbody>
          </table>
        </div>
      </section>`;
}

function renderListCard(title, items, formatter) {
  if (!items || !items.length) {
    return "";
  }
  const rendered = items.map((item) => `<li>${formatter(item)}</li>`).join("\n");
  return `
      <section class="card">
        <h2>${escapeHtml(title)}</h2>
        <ul class="meta-list">
${rendered}
        </ul>
      </section>`;
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

function renderProjectionPage(projection, extras = "") {
  const title = `${projection.title} | Engineering Standards`;
  const faqJsonLd = renderFaqJsonLd(projection.canonical_url, projection.faq || []);
  const faqSection = renderFaqSection(projection.faq || []);
  const breadcrumbLabel = projection.route_hint === "/reference/standards/"
    ? "Engineering Standards Hub"
    : projection.title;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(projection.meta_description)}">
  <link rel="canonical" href="${escapeHtml(projection.canonical_url)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(projection.canonical_url)}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <link rel="stylesheet" href="/css/styles.css">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"${escapeHtml(title)}","description":"${escapeHtml(projection.meta_description)}","url":"${escapeHtml(projection.canonical_url)}","author":{"@type":"Organization","name":"BoltLab"}}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"BoltLab","item":"https://boltlab.io/"},{"@type":"ListItem","position":2,"name":"Reference","item":"https://boltlab.io/reference/"},{"@type":"ListItem","position":3,"name":"Standards","item":"https://boltlab.io/reference/standards/"},{"@type":"ListItem","position":4,"name":"${escapeHtml(breadcrumbLabel)}","item":"${escapeHtml(projection.canonical_url)}"}]}</script>
  <script type="application/ld+json">${faqJsonLd}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"${escapeHtml(title)}","url":"${escapeHtml(projection.canonical_url)}","description":"${escapeHtml(projection.meta_description)}"}</script>
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
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → <a href="/reference/standards/">Standards</a> → ${escapeHtml(breadcrumbLabel)}</nav>
      <h1>${escapeHtml(projection.title)}</h1>
      <p class="muted">${escapeHtml(projection.hero_subtitle || projection.overview || "Engineering standards context for fastener workflows.")}</p>
      <div class="aeo-answer-block" aria-label="Direct answer">
        <p>${escapeHtml(projection.overview || "This standards reference summarizes scope, context, and engineering workflow relevance.")}</p>
        <p>Use related standards and concepts to connect profile geometry, designation planning, dimensions, and tolerance interpretation.</p>
        <p>Use BoltLab tools and charts for workflow interpretation while final release values come from approved standards documents.</p>
      </div>
${renderListCard("What This Standard Covers", projection.coverage_points || [], (item) => escapeHtml(item))}
${renderListCard("When Engineers Use It", projection.use_cases || [], (item) => escapeHtml(item))}
${renderTable(projection.table)}
${extras}
${renderListCard("Related Standards", projection.related_standards || [], (item) => escapeHtml(STANDARD_LABELS[item] || item.replaceAll("_", " ").toUpperCase()))}
${renderListCard("Related Concepts", projection.related_entities || [], (item) => {
    const concept = ENTITY_LINKS[item];
    if (!concept) return escapeHtml(item.replaceAll("_", " "));
    return `<a href="${concept.href}">${escapeHtml(concept.label)}</a>`;
  })}
      <section class="card">
        <h2>Related tools and charts</h2>
        <ul class="meta-list">
          ${(projection.related_tools || []).map((route) => `<li><a href="${route}">${ROUTE_LABELS[route] || route.split("/").pop().replaceAll("-", " ")}</a></li>`).join("\n")}
          ${(projection.related_charts || []).map((route) => `<li><a href="${route}">${ROUTE_LABELS[route] || route.split("/").pop().replaceAll("-", " ")}</a></li>`).join("\n")}
        </ul>
      </section>
      ${renderListCard("Related References", projection.related_reference_routes || [], (route) => `<a href="${route}">${route.split("/").pop().replaceAll("-", " ")}</a>`)}
      <section class="card">
        <h2>FAQ</h2>
${faqSection}
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

function projectionOutputPath(root, routeHint) {
  if (routeHint.endsWith("/")) {
    return path.join(root, routeHint, "index.html");
  }
  return path.join(root, `${routeHint}.html`);
}

function createHubExtras(isoProjections) {
  const matrixRows = isoProjections.map((projection) => [
    projection.standard_id.replaceAll("_", " ").toUpperCase(),
    projection.hero_subtitle || "Standard context",
    projection.route_hint
  ]);
  const designationRows = isoProjections.map((projection) => [
    projection.standard_id.toUpperCase(),
    projection.route_hint.split("/").pop(),
    "Reference"
  ]);

  return `
      <section class="card">
        <h2>Standards families</h2>
        <ul class="meta-list">
          <li><a href="/reference/standards/iso">ISO standards</a></li>
          <li><a href="/reference/standards/asme">ASME standards</a></li>
          <li><a href="/reference/standards/din">DIN standards</a></li>
          <li><a href="/reference/standards/ansi">ANSI standards</a></li>
          <li><a href="/reference/standards/jis">JIS standards</a></li>
          <li><a href="/reference/standards/british-standards">British standards</a></li>
        </ul>
      </section>
      <section class="card">
        <h2>Standard relationships matrix</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Standard</th><th scope="col">Primary role</th><th scope="col">Reference route</th></tr></thead>
            <tbody>
              ${matrixRows.map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td><a href="${row[2]}">${escapeHtml(row[2])}</a></td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2>Thread designation lookup</h2>
        <div class="chart-table-wrapper">
          <table>
            <thead><tr><th scope="col">Standard code</th><th scope="col">Slug</th><th scope="col">Output type</th></tr></thead>
            <tbody>
              ${designationRows.map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>`;
}

function renderFamilyPage(title, canonical, description, links) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="index,follow">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(canonical)}" />
  <link rel="alternate" hreflang="x-default" href="https://boltlab.io/" />
  <link rel="stylesheet" href="/css/styles.css">
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
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">BoltLab</a> → <a href="/reference/">Reference</a> → <a href="/reference/standards/">Standards</a> → ${escapeHtml(title)}</nav>
      <h1>${escapeHtml(title)}</h1>
      <p class="muted">${escapeHtml(description)}</p>
      <section class="card">
        <h2>Current references in this family</h2>
        <ul class="meta-list">
          ${links.map((link) => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join("")}
        </ul>
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
  <script src="/js/link-engine.js" defer></script>
  <script src="/js/context-anchor-engine.js" defer></script>
  <script src="/js/anchor-engine.js" defer></script>
  <script src="/js/ads-layout.js" defer></script>
</body>
</html>`;
}

function main() {
  const root = projectRoot();
  const schemaPath = path.join(root, "data", "projections", "reference-page.schema.json");
  const schema = readJson(schemaPath);
  const projectionDir = path.join(root, "data", "projections", "reference");
  const files = walkFiles(projectionDir).filter((file) =>
    /iso_.*\.reference\.json$|standards_hub\.reference\.json$|iso_family\.reference\.json$/.test(path.basename(file))
  );
  const projections = files.map((file) => readJson(file));
  const plannedRoutes = new Set(projections.map((projection) => projection.route_hint));

  for (const projection of projections) {
    const errors = simpleValidateAgainstSchema(schema, projection);
    if (!projection.meta_description || projection.meta_description.length < 140 || projection.meta_description.length > 155) {
      errors.push(`Invalid meta description length for ${projection.id}`);
    }
    for (const route of [
      ...(projection.related_tools || []),
      ...(projection.related_charts || []),
      ...(projection.related_guides || []),
      ...(projection.related_reference_routes || [])
    ]) {
      if (!routeExists(root, route) && !plannedRoutes.has(route)) {
        errors.push(`Unresolved route in ${projection.id}: ${route}`);
      }
    }
    if (errors.length) {
      throw new Error(`Projection validation failed for ${projection.id}\n- ${errors.join("\n- ")}`);
    }
  }

  const isoProjections = projections.filter((projection) => projection.standard_id);
  for (const projection of projections) {
    const extras = projection.id === "reference_standards_hub"
      ? createHubExtras(isoProjections)
      : "";
    const html = renderProjectionPage(projection, extras);
    const outPath = projectionOutputPath(root, projection.route_hint);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`Generated ${path.relative(root, outPath)} from ${projection.id}`);
  }

  const familyPages = [
    {
      route: "/reference/standards/asme.html",
      title: "ASME Thread Standards",
      description: "ASME thread standards context for unified inch systems and fit interpretation workflows.",
      links: [{ href: "/reference/standards/", label: "Engineering Standards Hub" }]
    },
    {
      route: "/reference/standards/din.html",
      title: "DIN Fastener Standards",
      description: "DIN standards family overview for future BoltLab standards expansion and cross-reference workflows.",
      links: [{ href: "/reference/standards/", label: "Engineering Standards Hub" }]
    },
    {
      route: "/reference/standards/ansi.html",
      title: "ANSI Standards Context",
      description: "ANSI standards family overview with crosswalk context to ASME and ISO engineering workflows.",
      links: [{ href: "/reference/standards/", label: "Engineering Standards Hub" }]
    },
    {
      route: "/reference/standards/jis.html",
      title: "JIS Thread Standards",
      description: "JIS standards family overview for future Japanese thread standards expansion in BoltLab.",
      links: [{ href: "/reference/standards/", label: "Engineering Standards Hub" }]
    },
    {
      route: "/reference/standards/british-standards.html",
      title: "British Thread Standards",
      description: "British standards family overview including BSP ecosystem context for future BoltLab references.",
      links: [{ href: "/reference/standards/", label: "Engineering Standards Hub" }]
    }
  ];

  for (const page of familyPages) {
    const html = renderFamilyPage(page.title, `https://boltlab.io${page.route.replace(/\.html$/, "")}`, page.description, page.links);
    const outPath = path.join(root, page.route);
    fs.writeFileSync(outPath, html);
    console.log(`Generated ${path.relative(root, outPath)}`);
  }
}

main();
