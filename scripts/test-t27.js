#!/usr/bin/env node
/**
 * T27 — Standards Stub Remediation & Indexation Cleanup: scenario test suite.
 *
 * Distinct from scripts/validate-t27.js (final-state invariant checks): this suite exercises
 * specific scenarios -- schema conformance, the live ad-injection script's actual eligibility
 * logic, meta-description length constraints, and the sitemap noindex-detection helper -- with
 * concrete inputs and expected outputs. Deterministic, read-only, no repository mutation.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const readJson = (p) => JSON.parse(read(p));

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

test("asme_standards.reference.json satisfies reference-page.schema.json required fields", () => {
  const schema = readJson("data/projections/reference-page.schema.json");
  const proj = readJson("data/projections/reference/asme_standards.reference.json");
  for (const field of schema.required) {
    assert(field in proj, `missing required field: ${field}`);
  }
  assert(proj.projection_type === "reference_page", "projection_type must be the const 'reference_page'");
  assert(/^[a-z0-9_]+$/.test(proj.id), "id must match schema pattern");
  assert(/^[a-z0-9_]+$/.test(proj.entity_id), "entity_id must match schema pattern");
  assert(/^https:\/\/boltlab\.io\//.test(proj.canonical_url), "canonical_url must match schema pattern");
  assert(proj.meta_description.length >= 120 && proj.meta_description.length <= 170,
    `meta_description length ${proj.meta_description.length} out of schema range [120,170]`);
  assert(["draft", "active", "deprecated"].includes(proj.status), "status must be a valid enum value");
  assert(/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(proj.version), "version must match schema pattern");
  for (const item of proj.faq) {
    assert(["entity_definition", "entity_summary", "relationship_context"].includes(item.answer_source.type),
      `faq item ${item.id} has invalid answer_source.type`);
  }
  assert(proj.schema.types.every((t) => ["Article", "FAQPage", "BreadcrumbList", "WebPage"].includes(t)),
    "schema.types must only use already-established schema type names (no invented schema types)");
});

test("every ASME page fact traces to a real field in data/standards/asme/standards.seed.json", () => {
  const seed = readJson("data/standards/asme/standards.seed.json");
  const b11 = seed.records.find((r) => r.id === "asme_b1_1");
  const b949 = seed.records.find((r) => r.id === "asme_b94_9");
  const proj = readJson("data/projections/reference/asme_standards.reference.json");
  assert(proj.coverage_points[0].includes(b11.scope), "coverage_points[0] must contain b11.scope verbatim");
  assert(proj.coverage_points[1].includes(b949.scope), "coverage_points[1] must contain b949.scope verbatim");
  assert(proj.table.rows[0].includes(b11.edition), "table row for B1.1 must cite its real edition");
  assert(proj.table.rows[1].includes(b949.edition), "table row for B94.9 must cite its real edition");
  const relatedFromSeed = new Set([...(b11.related_entities || []), ...(b949.related_entities || [])]);
  for (const e of proj.related_entities) {
    assert(relatedFromSeed.has(e), `related_entities contains ${e}, not present in either seed record's related_entities`);
  }
});

test("noindexed family pages cannot trigger js/ads-layout.js's live secondary-ad injection", () => {
  // Reproduces the eligibility check in js/ads-layout.js's shouldInjectSecondaryAd()-equivalent
  // logic: path must be under /reference/ or /guides/ (true here) AND the article must contain
  // >= 2 <h2> elements. If a noindexed stub page had 2+ h2s, the live client script (which T27 is
  // forbidden from modifying) could dynamically inject a new ad slot into it at runtime even
  // though the static HTML has none -- this test guards that this cannot currently happen.
  const adsLayout = read("js/ads-layout.js");
  assert(/h2s\.length < 2/.test(adsLayout), "js/ads-layout.js's injection eligibility logic changed shape -- re-verify this test's assumption");
  for (const f of ["ansi", "din", "jis", "british-standards"]) {
    const html = read(`reference/standards/${f}.html`);
    const h2Count = (html.match(/<h2/g) || []).length;
    assert(h2Count < 2, `reference/standards/${f}.html has ${h2Count} <h2> elements -- live ad-injection could trigger`);
  }
});

test("build_sitemap.py's is_noindex() correctly classifies all five target pages", () => {
  const out = execSync(
    `python3 -c "
import sys
sys.path.insert(0, 'scripts')
from build_sitemap import is_noindex
from pathlib import Path
results = {}
for f in ['reference/standards/din.html','reference/standards/ansi.html','reference/standards/jis.html','reference/standards/british-standards.html','reference/standards/asme.html','reference/standards/iso.html']:
    results[f] = is_noindex(Path(f))
import json
print(json.dumps(results))
"`,
    { cwd: ROOT, encoding: "utf8" }
  );
  const results = JSON.parse(out);
  for (const f of ["reference/standards/din.html", "reference/standards/ansi.html", "reference/standards/jis.html", "reference/standards/british-standards.html"]) {
    assert(results[f] === true, `${f} should be classified noindex=true`);
  }
  for (const f of ["reference/standards/asme.html", "reference/standards/iso.html"]) {
    assert(results[f] === false, `${f} should be classified noindex=false`);
  }
});

test("sitemap.xml is well-formed XML and contains exactly 224 URLs", () => {
  execSync("python3 -c \"import xml.etree.ElementTree as ET; ET.parse('sitemap.xml')\"", { cwd: ROOT });
  const sitemap = read("sitemap.xml");
  const count = (sitemap.match(/<loc>/g) || []).length;
  assert(count === 224, `expected 224 <loc> entries, found ${count}`);
});

test("no seed file under data/standards/{ansi,din,jis,bs} was populated to manufacture content", () => {
  // Guards against a future edit silently "solving" the placeholder problem by inventing records
  // instead of sourcing them -- these must stay empty until someone supplies real, cited data.
  for (const org of ["ansi", "din", "jis", "bs"]) {
    const seed = readJson(`data/standards/${org}/standards.seed.json`);
    assert(Array.isArray(seed.records) && seed.records.length === 0,
      `data/standards/${org}/standards.seed.json now has ${seed.records.length} record(s) -- if this is intentional (real sourced data was added), the corresponding page should move from NOINDEX to STRENGTHEN and this test should be updated, not silently left failing`);
  }
});

test("git tree has no reciprocal/duplicate standards URL introduced by this phase", () => {
  const sitemap = read("sitemap.xml");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const seen = new Set();
  for (const loc of locs) {
    assert(!seen.has(loc), `duplicate <loc> in sitemap.xml: ${loc}`);
    seen.add(loc);
  }
});

test("reference/data-methodology.html no longer links to the four noindexed pages", () => {
  const html = read("reference/data-methodology.html");
  for (const f of ["ansi", "din", "jis", "british-standards"]) {
    assert(!html.includes(`href="/reference/standards/${f}"`), `data-methodology.html still links to ${f}`);
  }
  assert(html.includes('href="/reference/standards/asme"'), "data-methodology.html should still link to the strengthened ASME page");
});

let failed = 0;
console.log("T27 TEST SUITE");
console.log("==============");
for (const t of tests) {
  try {
    t.fn();
    console.log(`[PASS] ${t.name}`);
  } catch (e) {
    failed++;
    console.log(`[FAIL] ${t.name} -- ${e.message}`);
  }
}
console.log("");
console.log(`${tests.length - failed}/${tests.length} tests passed.`);
if (failed) {
  process.exitCode = 1;
} else {
  console.log("T27 TEST SUITE: ALL TESTS PASSED");
}
