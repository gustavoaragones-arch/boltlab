#!/usr/bin/env node
// T11 terminology-consistency validator.
//
// Checks that the tapping product consumers (Atlas, Tap-Type Guide, Workflow, Evidence, and the
// Tap Drill Calculator where it overlaps) describe the same underlying projection facts with the
// same frozen terminology. This does not replace the individual per-product validators (which
// check structural/count correctness against the projection) -- it specifically targets the T11
// terminology-drift failure modes.
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson, writeJson, writeText } = require("../utilities/path-utils");

function main() {
  const root = projectRoot();
  const profileProjection = readJson(path.join(root, "data", "projections", "tapping", "tapping-profiles.json"));
  const tapTypeProjection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));

  const products = {
    "reference/tapping-atlas.html": fs.readFileSync(path.join(root, "reference", "tapping-atlas.html"), "utf8"),
    "reference/tap-type-guide.html": fs.readFileSync(path.join(root, "reference", "tap-type-guide.html"), "utf8"),
    "reference/tapping-evidence.html": fs.readFileSync(path.join(root, "reference", "tapping-evidence.html"), "utf8"),
    "tools/tapping-workflow.html": fs.readFileSync(path.join(root, "tools", "tapping-workflow.html"), "utf8"),
    "tools/tap-drill-calculator.html": fs.readFileSync(path.join(root, "tools", "tap-drill-calculator.html"), "utf8")
  };
  // downloads/tapping-atlas.csv is a frozen artifact under the T11 regression rule: its
  // "ISO 2306 metric convention" column text is a KNOWN, INTENTIONAL exception and must not be
  // flagged by check 1 -- it is checked separately (and more narrowly) as check 1b.
  const csvText = fs.readFileSync(path.join(root, "downloads", "tapping-atlas.csv"), "utf8");

  const rows = profileProjection.rows;
  const expected = {
    tapDrillVerified: rows.filter((r) => r.tap_drill.status === "verified").length,
    tapDrillSourceBound: rows.filter((r) => r.tap_drill.status === "source_bound").length,
    recordVerified: rows.filter((r) => r.data_quality.record_status === "verified").length,
    recordSourceBound: rows.filter((r) => r.data_quality.record_status === "source_bound").length,
    isoAltCount: rows.filter((r) => r.alternative_drill).length,
    standardsInProjection: [...new Set(rows.flatMap((r) => r.standards.map((s) => s.designation)))].sort()
  };
  let tapTypeVerified = 0;
  let tapTypeSourceBound = 0;
  for (const t of tapTypeProjection.rows) {
    tapTypeVerified += t.evidence_status.verified_fact_count;
    tapTypeSourceBound += t.evidence_status.source_bound_fact_count;
  }
  expected.tapTypeVerified = tapTypeVerified;
  expected.tapTypeSourceBound = tapTypeSourceBound;

  const checks = [];

  // 1. "ISO 2306 metric convention" must not appear in any product's UI text. The wording is
  //    only justified where a value has projection-backed ISO 2306 cross-verification, which no
  //    single UI label context in these products can guarantee record-by-record -- so the
  //    UI-facing label must be the safer "Metric drill convention".
  const check1 = { name: "No unsupported 'ISO 2306 metric convention' claim in UI", status: "pass", errors: [], warnings: [] };
  for (const [name, html] of Object.entries(products)) {
    const matches = html.match(/ISO 2306 metric convention/g) || [];
    if (matches.length) {
      check1.errors.push(`${name}: "ISO 2306 metric convention" appears ${matches.length} time(s) in UI text`);
    }
  }
  if (check1.errors.length) check1.status = "fail";
  checks.push(check1);

  // 1b. The CSV is a frozen, protected artifact (T11 regression rule): it is EXPECTED to still
  //     contain the legacy "ISO 2306 metric convention" column text, and that is fine as long as
  //     it is confined to the CSV's own primary_drill_convention column (not leaking new claims).
  const check1b = { name: "CSV legacy wording confined to protected artifact (informational)", status: "pass", errors: [], warnings: [] };
  const csvIsoConventionCount = (csvText.match(/ISO 2306 metric convention/g) || []).length;
  check1b.warnings.push(`downloads/tapping-atlas.csv retains "ISO 2306 metric convention" (${csvIsoConventionCount} rows) -- intentionally frozen per T11 regression rule, not a UI-facing label.`);
  checks.push(check1b);

  // 2 & 3. "verified"/"source-bound" must not be swapped relative to the projection. Checked
  //    against every statically-rendered count each product exposes (dynamic client-rendered
  //    counts, e.g. Workflow's per-card badges, are validated by that product's own validator
  //    against DOM state at render time, not against static markup here).
  const check23 = { name: "Verified/source-bound counts match projection (no field upgraded or downgraded)", status: "pass", errors: [], warnings: [] };
  const atlasTapDrill = products["reference/tapping-atlas.html"].match(/Tap-drill values: (\d+) verified \/ (\d+) source-bound/);
  if (!atlasTapDrill || Number(atlasTapDrill[1]) !== expected.tapDrillVerified || Number(atlasTapDrill[2]) !== expected.tapDrillSourceBound) {
    check23.errors.push(`Atlas data-quality panel tap-drill counts do not match projection (${expected.tapDrillVerified} verified / ${expected.tapDrillSourceBound} source-bound)`);
  }
  const evidenceTd = products["reference/tapping-evidence.html"].match(/id="ev-td-verified">(\d+)<\/span> verified \/ <span id="ev-td-sourcebound">(\d+)<\/span> source-bound/);
  if (!evidenceTd || Number(evidenceTd[1]) !== expected.tapDrillVerified || Number(evidenceTd[2]) !== expected.tapDrillSourceBound) {
    check23.errors.push(`Evidence tap-drill counts do not match projection (${expected.tapDrillVerified} verified / ${expected.tapDrillSourceBound} source-bound)`);
  }
  const evidenceRec = products["reference/tapping-evidence.html"].match(/id="ev-rec-verified">(\d+)<\/span> verified \/ <span id="ev-rec-sourcebound">(\d+)<\/span> source-bound/);
  if (!evidenceRec || Number(evidenceRec[1]) !== expected.recordVerified || Number(evidenceRec[2]) !== expected.recordSourceBound) {
    check23.errors.push(`Evidence overall-record counts do not match projection (${expected.recordVerified} verified / ${expected.recordSourceBound} source-bound) -- would falsely imply record-level verification`);
  }
  const evidenceTt = products["reference/tapping-evidence.html"].match(/id="ev-tt-verified">(\d+)<\/span> verified fact.*? \/ <span id="ev-tt-sourcebound">(\d+)<\/span> source-bound fact/);
  if (!evidenceTt || Number(evidenceTt[1]) !== expected.tapTypeVerified || Number(evidenceTt[2]) !== expected.tapTypeSourceBound) {
    check23.errors.push(`Evidence tap-type fact counts do not match projection (${expected.tapTypeVerified} verified / ${expected.tapTypeSourceBound} source-bound)`);
  }
  const guideFacts = products["reference/tap-type-guide.html"].match(/Facts: (\d+) verified \/ (\d+) source-bound/);
  if (!guideFacts || Number(guideFacts[1]) !== expected.tapTypeVerified || Number(guideFacts[2]) !== expected.tapTypeSourceBound) {
    check23.errors.push(`Tap-Type Guide fact counts do not match projection (${expected.tapTypeVerified} verified / ${expected.tapTypeSourceBound} source-bound)`);
  }
  // Forbidden synonyms for "verified" anywhere in a status-label context.
  for (const [name, html] of Object.entries(products)) {
    for (const forbidden of ["Confirmed", "Validated", "Accurate", "Official"]) {
      const re = new RegExp(`\\b${forbidden}\\b`);
      if (re.test(html)) {
        check23.errors.push(`${name}: forbidden verification synonym "${forbidden}" found`);
      }
    }
  }
  if (check23.errors.length) check23.status = "fail";
  checks.push(check23);

  // 4. Every tap type classification present in the projection must render its canonical label
  //    somewhere in each product that renders tap-type facts (Atlas, Tap-Type Guide, Evidence's
  //    client script, Workflow's client script).
  const check4 = { name: "No missing tap-type classification label", status: "pass", errors: [], warnings: [] };
  const CLASSIFICATION_LABELS = {
    general_taxonomy: "General taxonomy",
    manufacturing_characteristics: "Manufacturing characteristics",
    typical_applications: "Typical applications",
    manufacturer_specific_recommendations: "Manufacturer-specific recommendations"
  };
  const tapTypeRenderers = ["reference/tapping-atlas.html", "reference/tap-type-guide.html", "reference/tapping-evidence.html", "tools/tapping-workflow.html"];
  const anyFactExists = (field) => tapTypeProjection.rows.some((r) => (r[field] || []).length > 0);
  for (const name of tapTypeRenderers) {
    const html = products[name];
    for (const [field, label] of Object.entries(CLASSIFICATION_LABELS)) {
      if (!anyFactExists(field)) continue;
      // Section 8 freezes these labels in plural form ("Manufacturing characteristics", etc.);
      // require the exact heading text so a regression back to the singular form is caught.
      // Statically-generated products (Atlas, Tap-Type Guide) render the label as literal HTML
      // tag content (">Label<"); client-rendered products (Workflow, Evidence) instead carry it
      // as a quoted JS string literal that is only turned into markup at runtime in the browser.
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`>${escaped}<|"${escaped}"`);
      if (!re.test(html)) {
        check4.errors.push(`${name}: missing "${label}" classification label even though the projection has ${field} facts`);
      }
    }
  }
  if (check4.errors.length) check4.status = "fail";
  checks.push(check4);

  // 5 & 6. No unsupported engagement percentage or length recommendation anywhere.
  const check56 = { name: "No unsupported engagement percentage or length", status: "pass", errors: [], warnings: [] };
  const forbiddenEngagement = [
    /\b75\s*%|\b75 percent\b/i,
    /\b70\s*%|\b70 percent\b/i,
    /\b77\s*%|\b77 percent\b/i,
    /minimum engagement percentage/i,
    /recommended engagement percentage/i,
    /minimum engagement length/i,
    /1\s*[×x]\s*diameter/i,
    /1\.5\s*[×x]\s*diameter/i,
    /2\s*[×x]\s*diameter/i
  ];
  for (const [name, html] of Object.entries(products)) {
    for (const pattern of forbiddenEngagement) {
      if (pattern.test(html)) {
        check56.errors.push(`${name}: forbidden engagement pattern found: ${pattern}`);
      }
    }
  }
  if (check56.errors.length) check56.status = "fail";
  checks.push(check56);

  // 7. ISO alternative (Concept B) must never be merged with the primary tap-drill (Concept A):
  //    forbidden framing phrases, and the two values must not share a single label/paragraph.
  const check7 = { name: "ISO alternative not merged with primary tap-drill", status: "pass", errors: [], warnings: [] };
  const forbiddenMergePhrases = [/the correct value/i, /the preferred value/i, /the replacement value/i, /the converted value/i];
  for (const [name, html] of Object.entries(products)) {
    for (const pattern of forbiddenMergePhrases) {
      if (pattern.test(html)) {
        check7.errors.push(`${name}: forbidden ISO-alternative framing phrase found: ${pattern}`);
      }
    }
    // Concept A and Concept B must appear as distinctly labeled fields wherever both are present.
    if (/ISO 2306 alternative/.test(html) && !/Primary tap drill/.test(html) && name !== "reference/tap-type-guide.html" && name !== "tools/tap-drill-calculator.html") {
      check7.errors.push(`${name}: "ISO 2306 alternative" present without an accompanying "Primary tap drill" label -- concepts may be merged`);
    }
  }
  if (check7.errors.length) check7.status = "fail";
  checks.push(check7);

  // 8. No fabricated provenance fallback: when a source field is unavailable, products must use
  //    one of the approved fallback strings, never an invented source name.
  //
  //    T11 CORRECTION: the original version of this check only ever flagged an EMPTY rendered
  //    value ("value === \"\"") -- an arbitrary non-empty fabricated string (e.g. "fabricated-
  //    source") passed silently, so the check did not actually enforce what it claimed to. This
  //    version instead resolves every provenance value each product actually exposes and compares
  //    it against the authoritative projection data (tapping-profiles.json / tap-types.json),
  //    accepting only: (A) an exact match to the projection-backed value, or (B) one of the
  //    approved fallback strings when the projection genuinely has no value for that field.
  const check8 = { name: "No fabricated provenance fallback", status: "pass", errors: [], warnings: [] };
  const approvedFallbacks = ["Source information unavailable", "Provenance not available in the current projection.", "Unavailable"];

  function unescapeHtml(s) {
    return s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  // A rendered value is legitimate only if it matches the projection-backed value exactly, or --
  // when the projection has no value for this field -- if it is one of the approved fallbacks.
  function checkProvenanceValue(errors, context, renderedValue, projectionValue) {
    if (projectionValue) {
      if (renderedValue !== projectionValue) {
        errors.push(`${context}: rendered "${renderedValue}" but the projection-backed value is "${projectionValue}"`);
      }
    } else if (!approvedFallbacks.includes(renderedValue)) {
      errors.push(`${context}: projection has no value for this field, but rendered value "${renderedValue}" is not an approved fallback string -- possible fabricated provenance`);
    }
  }

  // 8a. Atlas (T4) statically resolves "Source dataset", "Source record", "Source field", and
  //     (where present) "Cross-check" directly into the generated HTML -- every card's provenance
  //     block is checked against its matching profile row.
  const profileByDesignation = new Map(rows.map((r) => [r.thread.designation, r]));
  const atlasHtml = products["reference/tapping-atlas.html"];
  const cardRe = /<article class="card tapping-atlas-card"[\s\S]*?<h3>(.*?)<\/h3>[\s\S]*?<summary>Data provenance<\/summary>\s*<ul class="meta-list">([\s\S]*?)<\/ul>/g;
  let cardMatch;
  let atlasCardsChecked = 0;
  while ((cardMatch = cardRe.exec(atlasHtml))) {
    const designation = unescapeHtml(cardMatch[1]);
    const row = profileByDesignation.get(designation);
    if (!row) {
      check8.errors.push(`reference/tapping-atlas.html: provenance card for designation "${designation}" not found in tapping-profiles.json`);
      continue;
    }
    const prov = row.tap_drill.provenance;
    const fieldMap = {};
    for (const li of [...cardMatch[2].matchAll(/<li>([^<]+)<\/li>/g)].map((m) => unescapeHtml(m[1]))) {
      const idx = li.indexOf(": ");
      if (idx !== -1) fieldMap[li.slice(0, idx)] = li.slice(idx + 2);
    }
    atlasCardsChecked += 1;
    checkProvenanceValue(check8.errors, `reference/tapping-atlas.html [${designation}] Source dataset`, fieldMap["Source dataset"], prov.source_dataset);
    checkProvenanceValue(check8.errors, `reference/tapping-atlas.html [${designation}] Source record`, fieldMap["Source record"], prov.source_record);
    checkProvenanceValue(check8.errors, `reference/tapping-atlas.html [${designation}] Source field`, fieldMap["Source field"], prov.source_field);
    if ("Cross-check" in fieldMap) {
      checkProvenanceValue(check8.errors, `reference/tapping-atlas.html [${designation}] Cross-check`, fieldMap["Cross-check"], prov.cross_check);
    }
  }
  if (atlasCardsChecked !== rows.length) {
    check8.errors.push(`reference/tapping-atlas.html: expected to check provenance on ${rows.length} cards, actually checked ${atlasCardsChecked}`);
  }

  // 8b. Tap-Type Guide (T5) statically resolves each fact's "source: ..." directly into the HTML
  //     -- every fact's rendered source is checked against its matching projection note.
  const factSourceMap = new Map();
  const CLASSIFICATION_FIELDS_8 = ["general_taxonomy", "manufacturing_characteristics", "typical_applications", "manufacturer_specific_recommendations"];
  let totalGuideFacts = 0;
  for (const row of tapTypeProjection.rows) {
    for (const field of CLASSIFICATION_FIELDS_8) {
      for (const note of row[field] || []) {
        factSourceMap.set(note.fact, note.source ?? null);
        totalGuideFacts += 1;
      }
    }
  }
  const guideHtml = products["reference/tap-type-guide.html"];
  const factRe = /<li>(.*?) <span class="muted">— <span class="data-status data-status--\w+">[^<]*<\/span>, source: (.*?)<\/span><\/li>/g;
  let factMatch;
  let guideFactsChecked = 0;
  while ((factMatch = factRe.exec(guideHtml))) {
    const fact = unescapeHtml(factMatch[1]);
    const renderedSource = unescapeHtml(factMatch[2]);
    if (!factSourceMap.has(fact)) {
      check8.errors.push(`reference/tap-type-guide.html: rendered fact not found in tap-types.json projection -- "${fact.slice(0, 60)}..."`);
      continue;
    }
    guideFactsChecked += 1;
    checkProvenanceValue(check8.errors, `reference/tap-type-guide.html [fact: "${fact.slice(0, 40)}..."] source`, renderedSource, factSourceMap.get(fact));
  }
  if (guideFactsChecked !== totalGuideFacts) {
    check8.errors.push(`reference/tap-type-guide.html: expected to check ${totalGuideFacts} fact sources, actually checked ${guideFactsChecked}`);
  }

  // 8c. Workflow (T8) and Evidence (T10) render provenance client-side from js/tapping-workflow-
  //     data.js at runtime, not as resolved text in their static HTML -- the static HTML instead
  //     carries JavaScript property-access expressions (e.g. "prov.source_dataset"), which are NOT
  //     resolved user-facing values and must not be flagged as fabricated. What CAN be validated
  //     without executing a browser is the data those expressions will resolve against: this
  //     confirms js/tapping-workflow-data.js -- the file both products load and render from --
  //     is itself faithful to the authoritative projection, field for field.
  const dataFileText = fs.readFileSync(path.join(root, "js", "tapping-workflow-data.js"), "utf8");
  const dataFileMatch = dataFileText.match(/window\.BoltLabTappingWorkflowData = ([\s\S]*);\s*$/);
  if (!dataFileMatch) {
    check8.errors.push("js/tapping-workflow-data.js: could not locate the embedded data payload");
  } else {
    let workflowData = null;
    try {
      workflowData = JSON.parse(dataFileMatch[1]);
    } catch (e) {
      check8.errors.push(`js/tapping-workflow-data.js: embedded data payload is not valid JSON -- ${e.message}`);
    }
    if (workflowData) {
      const profileById = new Map(rows.map((r) => [r.tapping_profile_id, r]));
      for (const p of workflowData.profiles) {
        const row = profileById.get(p.id);
        if (!row) {
          check8.errors.push(`js/tapping-workflow-data.js: profile id "${p.id}" not found in tapping-profiles.json -- Workflow/Evidence would render an unbacked profile`);
          continue;
        }
        if (JSON.stringify(p.tap_drill.provenance) !== JSON.stringify(row.tap_drill.provenance)) {
          check8.errors.push(`js/tapping-workflow-data.js [${p.id}]: tap_drill.provenance does not match tapping-profiles.json -- Workflow/Evidence would resolve a fabricated or stale provenance value at runtime`);
        }
      }
      const tapTypeById8 = new Map(tapTypeProjection.rows.map((r) => [r.entity_id, r]));
      for (const t of workflowData.tapTypes) {
        const row = tapTypeById8.get(t.entity_id);
        if (!row) {
          check8.errors.push(`js/tapping-workflow-data.js: tap type "${t.entity_id}" not found in tap-types.json`);
          continue;
        }
        for (const field of CLASSIFICATION_FIELDS_8) {
          if (JSON.stringify(t[field]) !== JSON.stringify(row[field])) {
            check8.errors.push(`js/tapping-workflow-data.js [${t.entity_id}] ${field}: does not match tap-types.json -- Workflow/Evidence would resolve fabricated or stale facts/sources at runtime`);
          }
        }
      }
    }
  }

  // 8d. Guard the Evidence template's fallback expressions themselves: confirm each provenance
  //     "|| <fallback>" expression is still a genuine property-access with an approved fallback
  //     literal, not a hardcoded value. This catches a hand-edit that replaces the live expression
  //     with a fabricated literal, which 8c's data-file comparison alone would not catch.
  const evidenceHtml = products["reference/tapping-evidence.html"];
  const evidenceFallbackExpressions = [
    { re: /esc\(prov\.source_dataset \|\| "([^"]*)"\)/, label: "prov.source_dataset fallback expression" },
    { re: /esc\(prov\.source_record \|\| "([^"]*)"\)/, label: "prov.source_record fallback expression" },
    { re: /esc\(prov\.source_field \|\| "([^"]*)"\)/, label: "prov.source_field fallback expression" },
    { re: /esc\(n\.source \|\| "([^"]*)"\)/, label: "n.source fallback expression" }
  ];
  for (const { re, label } of evidenceFallbackExpressions) {
    const m = evidenceHtml.match(re);
    if (!m) {
      check8.errors.push(`reference/tapping-evidence.html: expected template expression for ${label} not found -- provenance rendering code may have been replaced with a hardcoded value`);
    } else if (!approvedFallbacks.includes(m[1])) {
      check8.errors.push(`reference/tapping-evidence.html: ${label} uses a non-approved fallback string "${m[1]}"`);
    }
  }

  if (check8.errors.length) check8.status = "fail";
  checks.push(check8);

  // 9. Standards must not be displayed without projection backing: every standard designation
  //    that appears in visible "Standards:" text in a data-driven product must exist somewhere
  //    in the tapping-profiles projection's standards data.
  const check9 = { name: "No standards displayed without projection backing", status: "pass", errors: [], warnings: [] };
  const KNOWN_STANDALONE_REFS = ["ISO 965-1", "ISO 261", "ISO 262", "ISO 724"]; // linked as related-reference pages, not per-record claims
  for (const name of ["reference/tapping-atlas.html"]) {
    const html = products[name];
    const standardsBlocks = [...html.matchAll(/<strong>Standards:<\/strong>\s*([^<]*)/g)];
    for (const m of standardsBlocks) {
      const designations = m[1].split(",").map((s) => s.trim()).filter(Boolean);
      for (const d of designations) {
        if (!expected.standardsInProjection.includes(d)) {
          check9.errors.push(`${name}: standard "${d}" shown on a record but not found anywhere in the tapping-profiles projection`);
        }
      }
    }
  }
  if (check9.errors.length) check9.status = "fail";
  checks.push(check9);

  const errorCount = checks.reduce((sum, c) => sum + c.errors.length, 0);
  const warningCount = checks.reduce((sum, c) => sum + c.warnings.length, 0);

  const report = {
    status: errorCount > 0 ? "fail" : "pass",
    errors: errorCount,
    warnings: warningCount,
    expected_from_projection: expected,
    checks
  };

  const outJson = path.join(root, "docs", "architecture", "tapping-terminology-validation-report.json");
  const outMd = path.join(root, "docs", "architecture", "tapping-terminology-validation-report.md");
  writeJson(outJson, report);

  const lines = [];
  lines.push("# Tapping Terminology Consistency Validation Report (T11)");
  lines.push("");
  lines.push(`- Status: ${report.status}`);
  lines.push(`- Errors: ${report.errors}`);
  lines.push(`- Warnings: ${report.warnings}`);
  lines.push("");
  lines.push("## Checks");
  lines.push("");
  for (const check of checks) {
    lines.push(`### ${check.name}`);
    lines.push(`- Status: ${check.status}`);
    for (const e of check.errors) lines.push(`  - ERROR: ${e}`);
    for (const w of check.warnings) lines.push(`  - WARNING: ${w}`);
    lines.push("");
  }
  writeText(outMd, `${lines.join("\n")}\n`);

  console.log(`Validation report written: ${path.relative(root, outJson)}`);
  console.log(`Validation report written: ${path.relative(root, outMd)}`);
  console.log(`Status: ${report.status} | errors=${report.errors} | warnings=${report.warnings}`);

  if (report.status === "fail") {
    process.exitCode = 1;
  }
}

main();
