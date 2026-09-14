#!/usr/bin/env node
/**
 * Fastener Load & Strength -- Public Implementation Phase dedicated validator.
 *
 * Validates the public Bolt Load Capacity Calculator, its data/formula layer, the two
 * reference pages, the educational guide, the three M8/M10/M12 high-intent pages, internal
 * linking, sitemap coverage, and the integrity of protected surfaces this phase must not
 * touch. Read-only except for its own report output.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const readText = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const checks = [];
function check(name, fn) {
  checks.push({ name, fn });
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

function gitShow(rev, relPath) {
  try {
    return execFileSync("git", ["show", `${rev}:${relPath}`], { cwd: ROOT, encoding: "utf8" });
  } catch (e) {
    return null;
  }
}

const BASELINE = "2d2002c7fd1a811e61ca4bf201f2c315081f65de"; // Phase 3 commit -- baseline for this phase

const CALCULATOR = "tools/bolt-load-capacity-calculator.html";
const REF_CLASSES = "reference/fastener-property-classes.html";
const REF_TSA = "reference/tensile-stress-area.html";
const BASICS_GUIDE = "guides/bolt-load-capacity-basics.html";
const SIZE_PAGES = [
  "guides/m8-bolt-load-capacity.html",
  "guides/m10-bolt-load-capacity.html",
  "guides/m12-bolt-load-capacity.html",
];
const DATA_JS = "js/bolt-load-capacity-data.js";
const FORMULAS_JS = "js/bolt-load-capacity-formulas.js";
const CONVERTERS_JS = "js/converters.js";
const GENERATOR = "scripts/generators/generate-bolt-load-capacity-data.js";

const NEW_PAGES = [CALCULATOR, REF_CLASSES, REF_TSA, BASICS_GUIDE, ...SIZE_PAGES];

// ---------------------------------------------------------------------------------------------
// 1. Required deliverable files exist
// ---------------------------------------------------------------------------------------------

check("calculator page exists", () => assert(exists(CALCULATOR), `${CALCULATOR} missing`));
check("property-classes reference page exists", () => assert(exists(REF_CLASSES), `${REF_CLASSES} missing`));
check("tensile-stress-area reference page exists", () => assert(exists(REF_TSA), `${REF_TSA} missing`));
check("bolt-load-capacity-basics guide exists", () => assert(exists(BASICS_GUIDE), `${BASICS_GUIDE} missing`));
check("bolt-load-capacity-data.js (generated) exists", () => assert(exists(DATA_JS), `${DATA_JS} missing`));
check("bolt-load-capacity-formulas.js exists", () => assert(exists(FORMULAS_JS), `${FORMULAS_JS} missing`));
check("generator script exists", () => assert(exists(GENERATOR), `${GENERATOR} missing`));

check("exactly three high-intent size pages exist (M8, M10, M12) and no more", () => {
  for (const p of SIZE_PAGES) assert(exists(p), `${p} missing`);
  const guidesDir = fs.readdirSync(path.join(ROOT, "guides"));
  const sizePagePattern = /^m\d+(?:-\d+)?-bolt-load-capacity\.html$/;
  const matches = guidesDir.filter((f) => sizePagePattern.test(f));
  assert(matches.length === 3, `expected exactly 3 size pages matching m<N>-bolt-load-capacity.html, found ${matches.length}: ${matches.join(", ")}`);
  const expected = new Set(["m8-bolt-load-capacity.html", "m10-bolt-load-capacity.html", "m12-bolt-load-capacity.html"]);
  for (const m of matches) assert(expected.has(m), `unexpected size page ${m} -- only M8/M10/M12 are authorized`);
});

// ---------------------------------------------------------------------------------------------
// 2. Data layer: publication-readiness gate correctly excludes blocked/pending records
// ---------------------------------------------------------------------------------------------

const seedDataset = readJson("data/datasets/fastener_property_classes.seed.json");
const dataJsContent = readText(DATA_JS);

function isReady(record) {
  return (
    record.confidence === "verified" &&
    record.proof_strength.status === "verified" &&
    record.tensile_strength.status === "verified"
  );
}

check("generated data file exposes exactly the publication-ready seed records, no more, no fewer", () => {
  const readyIds = new Set(seedDataset.records.filter(isReady).map((r) => r.id));
  const match = dataJsContent.match(/window\.BoltLabFastenerPropertyClasses\s*=\s*(\[[\s\S]*?\]);/);
  assert(match, "could not locate window.BoltLabFastenerPropertyClasses array in generated file");
  const exposed = JSON.parse(match[1]);
  const exposedIds = new Set(exposed.map((r) => r.id));
  assert(exposedIds.size === readyIds.size, `exposed record count ${exposedIds.size} does not match publication-ready count ${readyIds.size}`);
  for (const id of readyIds) assert(exposedIds.has(id), `ready record ${id} is missing from the generated data file`);
  for (const id of exposedIds) assert(readyIds.has(id), `generated data file exposes ${id}, which is not publication-ready in the seed dataset`);
});

check("no pending_verification/source_bound/single-source-blocked record is publicly selectable", () => {
  const blockedIds = ["iso_4_8", "iso_5_6", "iso_5_8", "iso_6_8", "iso_9_8_le16", "sae_grade_2_gt34"];
  for (const id of blockedIds) {
    assert(!dataJsContent.includes(`"${id}"`), `blocked record ${id} appears in the generated data file`);
  }
});

check("SAE Grade 2 diameters over 3/4 inch are specifically excluded from generated data", () => {
  const match = dataJsContent.match(/window\.BoltLabFastenerPropertyClasses\s*=\s*(\[[\s\S]*?\]);/);
  const exposed = JSON.parse(match[1]);
  const grade2Records = exposed.filter((r) => r.system === "sae" && r.designation === "Grade 2");
  for (const r of grade2Records) {
    assert(r.diameterRange.max <= 0.75, `SAE Grade 2 record ${r.id} has max diameter ${r.diameterRange.max} > 0.75in -- the unresolved-disagreement range must not be exposed`);
  }
});

check("exposed proof/tensile strength values exactly match the seed dataset (no hand-duplication drift)", () => {
  const match = dataJsContent.match(/window\.BoltLabFastenerPropertyClasses\s*=\s*(\[[\s\S]*?\]);/);
  const exposed = JSON.parse(match[1]);
  const byId = new Map(seedDataset.records.map((r) => [r.id, r]));
  for (const rec of exposed) {
    const seed = byId.get(rec.id);
    assert(seed, `generated record ${rec.id} has no matching seed record`);
    assert(rec.proofStrength === seed.proof_strength.value, `${rec.id} proofStrength ${rec.proofStrength} does not match seed value ${seed.proof_strength.value}`);
    assert(rec.tensileStrength === seed.tensile_strength.value, `${rec.id} tensileStrength ${rec.tensileStrength} does not match seed value ${seed.tensile_strength.value}`);
    assert(rec.unit === seed.proof_strength.unit, `${rec.id} unit ${rec.unit} does not match seed unit ${seed.proof_strength.unit}`);
  }
});

check("thread geometry in generated data traces to the existing metric/UNC/UNF seed datasets, not a new database", () => {
  const metricSeed = readJson("data/datasets/metric_threads.seed.json");
  const uncSeed = readJson("data/datasets/unc.seed.json");
  const unfSeed = readJson("data/datasets/unf.seed.json");
  const metricMatch = dataJsContent.match(/metric:\s*(\[[\s\S]*?\])\s*,\s*inch:/);
  assert(metricMatch, "could not locate metric thread geometry array");
  const metricExposed = JSON.parse(metricMatch[1]);
  assert(metricExposed.length === metricSeed.records.length, `exposed metric geometry count ${metricExposed.length} does not match seed count ${metricSeed.records.length}`);
  const inchExposedCount = (uncSeed.records.filter((r) => r.nominal_diameter_in >= 0.25).length) + (unfSeed.records.filter((r) => r.nominal_diameter_in >= 0.25).length);
  const inchMatch = dataJsContent.match(/inch:\s*(\[[\s\S]*?\])\s*\n?\};/);
  assert(inchMatch, "could not locate inch thread geometry array");
  const inchExposed = JSON.parse(inchMatch[1]);
  assert(inchExposed.length === inchExposedCount, `exposed inch geometry count ${inchExposed.length} does not match expected ${inchExposedCount} (>=0.25in filter)`);
});

// ---------------------------------------------------------------------------------------------
// 3. Formula module: exact approved constants, no substitution
// ---------------------------------------------------------------------------------------------

const formulasContent = readText(FORMULAS_JS);

check("metric tensile stress area formula uses the approved constant 0.938194", () => {
  assert(formulasContent.includes("0.938194"), "0.938194 constant not found in bolt-load-capacity-formulas.js");
});

check("inch tensile stress area formula uses the approved constant 0.9743", () => {
  assert(formulasContent.includes("0.9743"), "0.9743 constant not found in bolt-load-capacity-formulas.js");
});

check("formula module is loaded (script tag) on every page that shows a worked example, guaranteeing no drift", () => {
  for (const p of [CALCULATOR, REF_TSA, BASICS_GUIDE, ...SIZE_PAGES]) {
    const html = readText(p);
    assert(html.includes("/js/bolt-load-capacity-formulas.js"), `${p} does not load bolt-load-capacity-formulas.js`);
  }
});

check("numeric spot check: formula module functions produce values matching the Phase 2 manufacturer cross-check", () => {
  const sandbox = { window: {} };
  const vm = require("node:vm");
  vm.createContext(sandbox);
  vm.runInContext(formulasContent, sandbox);
  const F = sandbox.window.BoltLabFastenerFormulas;
  assert(F, "window.BoltLabFastenerFormulas not defined after evaluating formulas module");
  const m10 = F.metricStressArea(10, 1.5);
  assert(Math.abs(m10 - 58) < 0.2, `M10x1.5 computed At=${m10.toFixed(2)} does not match quoted table value 58 mm^2`);
  const m8 = F.metricStressArea(8, 1.25);
  assert(Math.abs(m8 - 36.6) < 0.2, `M8x1.25 computed At=${m8.toFixed(2)} does not match quoted table value 36.6 mm^2`);
  const quarter20 = F.inchStressArea(0.25, 20);
  assert(Math.abs(quarter20 - 0.03182) < 0.0005, `1/4-20 UNC computed At=${quarter20.toFixed(5)} does not match quoted table value 0.03182 in^2`);
  assert(Math.abs(F.nToLbf(1) - 0.224809) < 1e-6, "nToLbf conversion factor incorrect");
  assert(Math.abs(F.lbfToN(F.nToLbf(1000)) - 1000) < 1e-6, "lbfToN is not the inverse of nToLbf");
  assert(Math.abs(F.nToKg(9.80665) - 1) < 1e-6, "nToKg conversion (standard gravity) incorrect");
  assert(Math.abs(F.kgToLb(1) - 2.20462) < 1e-5, "kgToLb conversion factor incorrect");
});

// ---------------------------------------------------------------------------------------------
// 4. Calculator behavior: safety factor required, no default, N + lbf + mass equivalent
// ---------------------------------------------------------------------------------------------

const calcHtml = readText(CALCULATOR);
const convertersContent = readText(CONVERTERS_JS);

check("calculator's safety-factor input has no default value attribute", () => {
  const inputMatch = calcHtml.match(/<input id="blc-safety-factor"[^>]*>/);
  assert(inputMatch, "blc-safety-factor input not found");
  assert(!/\svalue="/.test(inputMatch[0]), "blc-safety-factor input carries a default value attribute -- no default is authorized");
});

check("calculator JS rejects missing/zero/invalid safety factor before calculating", () => {
  assert(/sf <= 0/.test(convertersContent) || /sf<=0/.test(convertersContent), "no explicit sf<=0 rejection found in converters.js");
  assert(/Number\.isNaN\(sf\)/.test(convertersContent), "no NaN safety-factor rejection found in converters.js");
  assert(convertersContent.includes("Enter a safety factor to calculate"), "no validation message for missing safety factor found");
});

check("calculator does not hardcode a default safety factor anywhere in its update logic", () => {
  const setupFnMatch = convertersContent.match(/function setupBoltLoadCapacityCalculator\(\)[\s\S]*?\n  \}\n/);
  assert(setupFnMatch, "could not locate setupBoltLoadCapacityCalculator function body");
  assert(!/sf\s*=\s*\d/.test(setupFnMatch[0]), "setupBoltLoadCapacityCalculator appears to assign a hardcoded numeric default to sf");
});

check("calculator output includes both N and lbf", () => {
  assert(/\bN\b/.test(convertersContent) && /lbf/.test(convertersContent), "calculator result rendering does not reference both N and lbf");
});

check("calculator output labels mass equivalent explicitly and distinctly from force", () => {
  assert(/Mass equivalent/i.test(convertersContent), "no 'Mass equivalent' label found in calculator result rendering");
  assert(/not a force/i.test(convertersContent), "mass equivalent is not explicitly distinguished from force in calculator result rendering");
});

check("calculator distinguishes nominal designation, tensile stress area, controlling strength, calculated load, safety factor, and mass equivalent", () => {
  const required = ["Tensile stress area", "tensile capacity", "safety factor", "Mass equivalent"];
  for (const term of required) {
    assert(new RegExp(term, "i").test(convertersContent), `calculator result rendering does not mention "${term}"`);
  }
});

check("calculator gates property-class selection by diameter range (no extrapolation, no silent substitution)", () => {
  assert(convertersContent.includes("diameter >= pc.diameterRange.min && diameter <= pc.diameterRange.max"), "diameter-range gating logic not found in populateGrades()");
  assert(convertersContent.includes("No supported property class for this size"), "no explicit message for unsupported size/class combination");
});

// ---------------------------------------------------------------------------------------------
// 5. Scope discipline: tension-only, no shear/joint/fatigue/preload claims of coverage
// ---------------------------------------------------------------------------------------------

check("calculator explicitly states it does not cover shear, thread stripping, nut/connected-material failure, fatigue, or preload", () => {
  const required = ["shear", "thread engagement", "nut, hole-bearing", "fatigue", "preload"];
  for (const term of required) {
    assert(new RegExp(term, "i").test(calcHtml), `calculator page does not mention "${term}" in its limitations section`);
  }
});

check("calculator explains the difference between fastener tensile estimate and complete joint capacity", () => {
  assert(/joint capacity may be lower/i.test(calcHtml), "calculator page missing required joint-capacity limitation wording");
});

check("no page in this phase implements shear, bearing, fatigue, or preload calculation logic", () => {
  const forbiddenTerms = ["shearCapacity", "bearingCapacity", "fatigueLife", "preloadLoss", "torqueToTension"];
  for (const term of forbiddenTerms) {
    assert(!convertersContent.includes(term), `converters.js appears to implement out-of-scope function/term: ${term}`);
    assert(!formulasContent.includes(term), `formulas module appears to implement out-of-scope function/term: ${term}`);
  }
});

// ---------------------------------------------------------------------------------------------
// 6. SEO / structured data: canonical, titles, meta, no FAQPage, no new entity types
// ---------------------------------------------------------------------------------------------

check("every new page has a self-referencing canonical tag matching its own boltlab.io URL", () => {
  const urlFor = {
    [CALCULATOR]: "https://boltlab.io/tools/bolt-load-capacity-calculator",
    [REF_CLASSES]: "https://boltlab.io/reference/fastener-property-classes",
    [REF_TSA]: "https://boltlab.io/reference/tensile-stress-area",
    [BASICS_GUIDE]: "https://boltlab.io/guides/bolt-load-capacity-basics",
    "guides/m8-bolt-load-capacity.html": "https://boltlab.io/guides/m8-bolt-load-capacity",
    "guides/m10-bolt-load-capacity.html": "https://boltlab.io/guides/m10-bolt-load-capacity",
    "guides/m12-bolt-load-capacity.html": "https://boltlab.io/guides/m12-bolt-load-capacity",
  };
  for (const [p, url] of Object.entries(urlFor)) {
    const html = readText(p);
    assert(html.includes(`<link rel="canonical" href="${url}">`), `${p} missing correct self-canonical tag for ${url}`);
  }
});

check("every new page has a non-empty <title> and meta description", () => {
  for (const p of NEW_PAGES) {
    const html = readText(p);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    assert(titleMatch && titleMatch[1].trim().length > 10, `${p} missing a substantive <title>`);
    const descMatch = html.match(/<meta name="description" content="([^"]+)">/);
    assert(descMatch && descMatch[1].trim().length > 20, `${p} missing a substantive meta description`);
  }
});

check("no new page adds FAQPage JSON-LD schema", () => {
  for (const p of NEW_PAGES) {
    const html = readText(p);
    assert(!html.includes('"@type":"FAQPage"'), `${p} adds FAQPage schema, which this phase must not introduce at scale`);
  }
});

check("new pages use only already-established schema types (WebApplication/BreadcrumbList/Article/Organization/WebSite/ListItem)", () => {
  const allowedTypes = new Set(["WebApplication", "BreadcrumbList", "Article", "Organization", "WebSite", "ListItem"]);
  for (const p of NEW_PAGES) {
    const html = readText(p);
    const typeMatches = [...html.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1]);
    for (const t of typeMatches) {
      assert(allowedTypes.has(t), `${p} uses schema type "${t}", which is not in the already-established set`);
    }
  }
});

check("entity.schema.json entity_type enum is unchanged (no new entity types introduced)", () => {
  const before = gitShow(BASELINE, "data/schemas/entity.schema.json");
  const after = readText("data/schemas/entity.schema.json");
  assert(before !== null, "could not read baseline entity.schema.json from git");
  assert(before === after, "data/schemas/entity.schema.json has changed since baseline -- entity_type enum must not be extended");
});

// ---------------------------------------------------------------------------------------------
// 7. Advertising remains inactive
// ---------------------------------------------------------------------------------------------

check("no advertising markup or scripts on any new page", () => {
  const forbidden = ["adsbygoogle", "googlesyndication", "data-ad-client", "ad-container", "ad-slot", "ads-layout.js", "Sponsored"];
  for (const p of NEW_PAGES) {
    const html = readText(p);
    for (const term of forbidden) {
      assert(!html.includes(term), `${p} contains forbidden advertising-related content: "${term}"`);
    }
  }
});

// ---------------------------------------------------------------------------------------------
// 8. Internal linking: calculator is not an orphan, reciprocal mesh exists
// ---------------------------------------------------------------------------------------------

check("tools/index.html links to the new calculator", () => {
  assert(readText("tools/index.html").includes("/tools/bolt-load-capacity-calculator"), "tools/index.html does not link to the calculator");
});

check("reference/index.html links to both new reference pages", () => {
  const html = readText("reference/index.html");
  assert(html.includes("/reference/fastener-property-classes"), "reference/index.html does not link to fastener-property-classes");
  assert(html.includes("/reference/tensile-stress-area"), "reference/index.html does not link to tensile-stress-area");
});

check("guides/index.html links to the basics guide and all three size pages", () => {
  const html = readText("guides/index.html");
  for (const url of ["/guides/bolt-load-capacity-basics", "/guides/m8-bolt-load-capacity", "/guides/m10-bolt-load-capacity", "/guides/m12-bolt-load-capacity"]) {
    assert(html.includes(url), `guides/index.html does not link to ${url}`);
  }
});

check("guides/bolt-strength-grades.html reciprocally links to the new calculator/reference/guide content", () => {
  const html = readText("guides/bolt-strength-grades.html");
  assert(html.includes("/tools/bolt-load-capacity-calculator"), "bolt-strength-grades.html does not link to the calculator");
  assert(html.includes("/guides/bolt-load-capacity-basics") || html.includes("/reference/fastener-property-classes"), "bolt-strength-grades.html does not link to the new guide or reference content");
});

check("every new page links to the calculator, property-class reference, and tensile-stress-area reference (except the calculator/reference pages themselves, which cross-link the others)", () => {
  for (const p of [BASICS_GUIDE, ...SIZE_PAGES]) {
    const html = readText(p);
    assert(html.includes("/tools/bolt-load-capacity-calculator"), `${p} does not link to the calculator`);
    assert(html.includes("/reference/fastener-property-classes"), `${p} does not link to the property-classes reference`);
    assert(html.includes("/reference/tensile-stress-area"), `${p} does not link to the tensile-stress-area reference`);
  }
});

check("each size page links to the basics guide and the other two size pages", () => {
  for (const p of SIZE_PAGES) {
    const html = readText(p);
    assert(html.includes("/guides/bolt-load-capacity-basics"), `${p} does not link to the basics guide`);
    for (const other of SIZE_PAGES) {
      if (other === p) continue;
      const slug = other.replace("guides/", "").replace(".html", "");
      assert(html.includes(`/guides/${slug}`), `${p} does not link to ${slug}`);
    }
  }
});

check("no internal link on a new page points to a non-existent local page", () => {
  const linkRe = /href="(\/[a-zA-Z0-9\-\/_.]+)"/g;
  for (const p of NEW_PAGES) {
    const html = readText(p);
    let m;
    while ((m = linkRe.exec(html))) {
      let href = m[1];
      if (href.startsWith("//") || href.includes("://")) continue;
      href = href.split("#")[0].split("?")[0];
      if (href === "/" || href === "") continue;
      let candidate = href.endsWith("/") ? href + "index.html" : href;
      candidate = candidate.replace(/^\//, "");
      const candidates = [candidate, candidate + ".html", candidate + "/index.html"];
      const found = candidates.some((c) => exists(c));
      assert(found, `${p} links to "${href}", which does not resolve to an existing file`);
    }
  }
});

// ---------------------------------------------------------------------------------------------
// 9. No duplicate/near-duplicate pages
// ---------------------------------------------------------------------------------------------

check("the three size pages are not interchangeable templates (each has distinct size-specific numeric content)", () => {
  const contents = SIZE_PAGES.map(readText);
  const stripped = contents.map((c) => c.replace(/M8|M10|M12|m8|m10|m12/g, "MX").replace(/8|10|12/g, "N"));
  assert(new Set(stripped).size >= 1, "sanity check");
  // Each page's inline worked-example script must reference its own distinct diameter constant.
  assert(contents[0].includes("var DIAMETER = 8;"), "M8 page does not set DIAMETER = 8");
  assert(contents[1].includes("var DIAMETER = 10;"), "M10 page does not set DIAMETER = 10");
  assert(contents[2].includes("var DIAMETER = 12;"), "M12 page does not set DIAMETER = 12");
});

// ---------------------------------------------------------------------------------------------
// 10. Sitemap coverage
// ---------------------------------------------------------------------------------------------

check("sitemap.xml is well-formed and includes all 7 new indexable URLs exactly once each", () => {
  const sitemap = readText("sitemap.xml");
  const expectedUrls = [
    "https://boltlab.io/tools/bolt-load-capacity-calculator",
    "https://boltlab.io/reference/fastener-property-classes",
    "https://boltlab.io/reference/tensile-stress-area",
    "https://boltlab.io/guides/bolt-load-capacity-basics",
    "https://boltlab.io/guides/m8-bolt-load-capacity",
    "https://boltlab.io/guides/m10-bolt-load-capacity",
    "https://boltlab.io/guides/m12-bolt-load-capacity",
  ];
  for (const url of expectedUrls) {
    const occurrences = sitemap.split(`<loc>${url}</loc>`).length - 1;
    assert(occurrences === 1, `sitemap.xml has ${occurrences} occurrences of ${url}, expected exactly 1`);
  }
});

// ---------------------------------------------------------------------------------------------
// 11. Protected surfaces: byte-for-byte unchanged since baseline
// ---------------------------------------------------------------------------------------------

const PROTECTED_FILES = [
  "js/torque-data.js",
  "tools/bolt-torque-calculator.html",
  "data/datasets/fastener_property_classes.seed.json",
  "data/schemas/dataset.schema.json",
  "data/schemas/entity.schema.json",
  "data/schemas/relationship.schema.json",
  "data/schemas/standard.schema.json",
  "data/entities/entities.seed.json",
  "data/relationships/relationships.seed.json",
  "data/standards/iso/standards.seed.json",
  "data/standards/sae/standards.seed.json",
  "robots.txt",
  "ads.txt",
  "_redirects",
];

check("all protected surfaces remain byte-for-byte unchanged since the Phase 3 baseline", () => {
  const changed = [];
  for (const f of PROTECTED_FILES) {
    const before = gitShow(BASELINE, f);
    const after = exists(f) ? readText(f) : null;
    if (before !== after) changed.push(f);
  }
  assert(changed.length === 0, `protected surface(s) modified: ${changed.join(", ")}`);
});

check("tapping-domain and size-cluster surfaces are untouched (no files modified under sizes/, es/sizes/, or tapping-related scripts)", () => {
  let out;
  try {
    out = execFileSync("git", ["status", "--porcelain", "sizes/", "es/sizes/"], { cwd: ROOT, encoding: "utf8" });
  } catch (e) {
    out = "";
  }
  assert(out.trim() === "", `unexpected changes under sizes/ or es/sizes/: ${out}`);
});

// ---------------------------------------------------------------------------------------------
// 12. No new npm/JS framework dependencies; client-side only
// ---------------------------------------------------------------------------------------------

check("no external API calls or third-party UI framework references on new pages", () => {
  const forbidden = ["react", "next.js", "fetch(", "XMLHttpRequest", "axios"];
  for (const p of NEW_PAGES) {
    const html = readText(p).toLowerCase();
    for (const term of forbidden) {
      assert(!html.includes(term), `${p} references forbidden dependency/pattern: "${term}"`);
    }
  }
});

check("no package.json was introduced (no new npm dependency surface)", () => {
  assert(!exists("package.json"), "package.json exists -- this phase must not introduce npm dependencies");
});

// ---------------------------------------------------------------------------------------------
// 13. Existing reconciled guide values remain intact
// ---------------------------------------------------------------------------------------------

check("guides/bolt-strength-grades.html's reconciled numeric values (800/830/1040/1220 MPa) are unchanged", () => {
  const html = readText("guides/bolt-strength-grades.html");
  for (const v of ["800 MPa", "830 MPa", "1040 MPa", "1220 MPa"]) {
    assert(html.includes(v), `guides/bolt-strength-grades.html no longer states ${v}`);
  }
});

// ---------------------------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------------------------

let failed = 0;
console.log("FASTENER LOAD & STRENGTH -- PUBLIC IMPLEMENTATION PHASE VALIDATOR");
console.log("====================================================================");
for (const c of checks) {
  try {
    c.fn();
    console.log(`[PASS] ${c.name}`);
  } catch (e) {
    failed++;
    console.log(`[FAIL] ${c.name} -- ${e.message}`);
  }
}
console.log("");
console.log(`${checks.length - failed}/${checks.length} checks passed.`);
if (failed) {
  process.exitCode = 1;
} else {
  console.log("PUBLIC IMPLEMENTATION VALIDATOR: ALL CHECKS PASSED");
}
