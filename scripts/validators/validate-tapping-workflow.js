#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson, writeJson, writeText } = require("../utilities/path-utils");

function loadEmbeddedData(root) {
  const filePath = path.join(root, "js", "tapping-workflow-data.js");
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(/window\.BoltLabTappingWorkflowData\s*=\s*(\{[\s\S]*\});?\s*$/);
  if (!match) throw new Error("Could not locate window.BoltLabTappingWorkflowData assignment");
  return JSON.parse(match[1]);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function main() {
  const root = projectRoot();
  const profileProjection = readJson(path.join(root, "data", "projections", "tapping", "tapping-profiles.json"));
  const tapTypeProjection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));
  const htmlPath = path.join(root, "tools", "tapping-workflow.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const embedded = loadEmbeddedData(root);

  const checks = [];

  // 1 & 2. Every selectable projection record represented; none silently dropped
  const coverageCheck = { name: "Every Projection Record Represented (No Silent Drop)", status: "pass", errors: [], warnings: [] };
  const projectionIds = profileProjection.rows.map((r) => r.tapping_profile_id).sort();
  const embeddedIds = embedded.profiles.map((p) => p.id).sort();
  if (!deepEqual(projectionIds, embeddedIds)) {
    coverageCheck.errors.push(`Embedded profile ID set does not match projection exactly. Projection: ${projectionIds.length}, embedded: ${embeddedIds.length}`);
  }
  const tapTypeProjectionIds = tapTypeProjection.rows.map((r) => r.entity_id).sort();
  const embeddedTapTypeIds = embedded.tapTypes.map((t) => t.entity_id).sort();
  if (!deepEqual(tapTypeProjectionIds, embeddedTapTypeIds)) {
    coverageCheck.errors.push("Embedded tap-type ID set does not match projection exactly.");
  }
  if (coverageCheck.errors.length) coverageCheck.status = "fail";
  checks.push(coverageCheck);

  // 3, 4, 5, 14, 15. Full fact-level fidelity: designation, tap_drill (value/unit/status/provenance), standards
  const fidelityCheck = { name: "Designation, Tap-Drill, and Standards Fidelity", status: "pass", errors: [], warnings: [] };
  const profileById = new Map(profileProjection.rows.map((r) => [r.tapping_profile_id, r]));
  for (const p of embedded.profiles) {
    const source = profileById.get(p.id);
    if (!source) {
      fidelityCheck.errors.push(`${p.id}: no matching source projection row`);
      continue;
    }
    if (p.thread.designation !== source.thread.designation) {
      fidelityCheck.errors.push(`${p.id}: designation mismatch (embedded "${p.thread.designation}" vs source "${source.thread.designation}")`);
    }
    if (p.tap_drill.value !== source.tap_drill.value || p.tap_drill.unit !== source.tap_drill.unit) {
      fidelityCheck.errors.push(`${p.id}: tap_drill value/unit mismatch`);
    }
    if (p.tap_drill.status !== source.tap_drill.status) {
      fidelityCheck.errors.push(`${p.id}: tap_drill status mismatch (embedded "${p.tap_drill.status}" vs source "${source.tap_drill.status}")`);
    }
    if (!deepEqual(p.tap_drill.provenance, source.tap_drill.provenance)) {
      fidelityCheck.errors.push(`${p.id}: tap_drill provenance does not match source exactly -- possible fabrication or loss`);
    }
    if (!deepEqual(p.standards, source.standards)) {
      fidelityCheck.errors.push(`${p.id}: standards array does not match source projection exactly -- not projection-backed`);
    }
  }
  if (fidelityCheck.errors.length) fidelityCheck.status = "fail";
  checks.push(fidelityCheck);

  // 6 & 7. ISO alternative present only where the source has it, never merged with primary
  const isoCheck = { name: "ISO 2306 Alternative Correctness (Present Only Where Sourced, Never Merged)", status: "pass", errors: [], warnings: [] };
  for (const p of embedded.profiles) {
    const source = profileById.get(p.id);
    const sourceHasAlt = Boolean(source && source.alternative_drill);
    const embeddedHasAlt = Boolean(p.alternative_drill);
    if (sourceHasAlt !== embeddedHasAlt) {
      isoCheck.errors.push(`${p.id}: alternative_drill presence mismatch (source=${sourceHasAlt}, embedded=${embeddedHasAlt})`);
      continue;
    }
    if (embeddedHasAlt) {
      if (!deepEqual(p.alternative_drill, source.alternative_drill)) {
        isoCheck.errors.push(`${p.id}: alternative_drill content does not match source exactly`);
      }
      if (p.alternative_drill.value === p.tap_drill.value && p.alternative_drill.unit === p.tap_drill.unit) {
        isoCheck.errors.push(`${p.id}: alternative_drill appears merged/identical to primary tap_drill`);
      }
    }
    const isMetric = p.thread.thread_system === "metric";
    if (isMetric && embeddedHasAlt) {
      isoCheck.errors.push(`${p.id}: metric record unexpectedly has an alternative_drill`);
    }
    if (!isMetric && !embeddedHasAlt) {
      isoCheck.errors.push(`${p.id}: UNC/UNF record unexpectedly has no alternative_drill`);
    }
  }
  if (isoCheck.errors.length) isoCheck.status = "fail";
  checks.push(isoCheck);

  // 8 & 9. Tap-type classifications remain separate; no general_taxonomy fact lost
  const tapTypeCheck = { name: "Tap-Type Classifications Separate, No general_taxonomy Loss", status: "pass", errors: [], warnings: [] };
  const CLASSIFICATION_FIELDS = ["general_taxonomy", "manufacturing_characteristics", "typical_applications", "manufacturer_specific_recommendations"];
  const tapTypeSourceById = new Map(tapTypeProjection.rows.map((r) => [r.entity_id, r]));
  for (const t of embedded.tapTypes) {
    const source = tapTypeSourceById.get(t.entity_id);
    if (!source) {
      tapTypeCheck.errors.push(`${t.entity_id}: no matching source projection row`);
      continue;
    }
    for (const field of CLASSIFICATION_FIELDS) {
      if (!Array.isArray(t[field])) {
        tapTypeCheck.errors.push(`${t.entity_id}: field "${field}" is not its own array -- classifications may be flattened`);
        continue;
      }
      if (!deepEqual(t[field], source[field])) {
        tapTypeCheck.errors.push(`${t.entity_id}: "${field}" does not match source projection exactly -- possible loss, duplication, or reclassification`);
      }
    }
  }
  if (tapTypeCheck.errors.length) tapTypeCheck.status = "fail";
  checks.push(tapTypeCheck);

  // 10. Verification-label logic present and correctly mapped in the inline script
  const labelLogicCheck = { name: "Verification Label Logic Present and Correctly Mapped", status: "pass", errors: [], warnings: [] };
  const requiredMappings = [
    '"verified") return "Verified"',
    '"source_bound") return "Source-bound"',
    '"pending_verification") return "Pending verification"'
  ];
  for (const mapping of requiredMappings) {
    if (!html.includes(mapping)) {
      labelLogicCheck.errors.push(`Expected verification-label mapping not found in inline script: ${mapping}`);
    }
  }
  if (!html.includes("Unavailable in the current verified dataset.")) {
    labelLogicCheck.errors.push('Fallback "Unavailable in the current verified dataset." string not found');
  }
  if (labelLogicCheck.errors.length) labelLogicCheck.status = "fail";
  checks.push(labelLogicCheck);

  // 11, 12, 13. Engagement fields remain unavailable; no 75%/unsupported target anywhere
  const engagementCheck = { name: "Engagement Fields Remain Unavailable, No Unsupported Target", status: "pass", errors: [], warnings: [] };
  for (const p of embedded.profiles) {
    if (p.engagement.radial.target_percent !== null) {
      engagementCheck.errors.push(`${p.id}: engagement.radial.target_percent is not null`);
    }
    if (p.engagement.axial.calculation_status !== "not_calculable") {
      engagementCheck.errors.push(`${p.id}: engagement.axial.calculation_status is not "not_calculable"`);
    }
  }
  const forbiddenPatterns = [/\b75\s*%|\b75 percent\b/i, /\b70\s*%/i, /\b77\s*%/i, /1\s*[×x]\s*diameter/i, /1\.5\s*[×x]\s*diameter/i, /2\s*[×x]\s*diameter/i];
  const combinedText = html + JSON.stringify(embedded);
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(combinedText)) {
      engagementCheck.errors.push(`Forbidden engagement pattern found: ${pattern}`);
    }
  }
  if (!html.includes("Thread engagement calculation is not currently available in BoltLab's verified dataset.")) {
    engagementCheck.errors.push("Required exact engagement-limitation sentence not found in HTML");
  }
  if (engagementCheck.errors.length) engagementCheck.status = "fail";
  checks.push(engagementCheck);

  // 16 (structural). Required workflow UI elements present
  const structureCheck = { name: "Required Workflow UI Elements Present", status: "pass", errors: [], warnings: [] };
  const requiredIds = ["wf-system", "wf-designation", "wf-step2", "wf-result", "wf-result-body", "wf-tap-types", "wf-hole-prep"];
  for (const id of requiredIds) {
    if (!html.includes(`id="${id}"`)) {
      structureCheck.errors.push(`Required element id="${id}" not found`);
    }
  }
  const hardcodedOptionMatches = html.match(/<option value="(M\d|1\/4-|3\/8-|5\/16-|1\/2-|#\d)/g);
  if (hardcodedOptionMatches) {
    structureCheck.errors.push(`Found ${hardcodedOptionMatches.length} hardcoded designation <option> tag(s) -- designations must be populated client-side from embedded data`);
  }
  if (structureCheck.errors.length) structureCheck.status = "fail";
  checks.push(structureCheck);

  // Exact required wording checks
  const wordingCheck = { name: "Exact Required Wording Present", status: "pass", errors: [], warnings: [] };
  const requiredStrings = [
    "See the Tap-Type Guide for the full evidence-backed comparison.",
    "Thread engagement calculation is not currently available in BoltLab's verified dataset.",
    "Thread engagement depends on factors beyond the tap-drill value, including the required engagement length and engineering design conditions.",
    "Need a quick metric tap-drill calculation? Use the",
    "Browse the full tapping dataset in the"
  ];
  for (const s of requiredStrings) {
    if (!html.includes(s)) wordingCheck.errors.push(`Required exact wording not found: "${s}"`);
  }
  if (wordingCheck.errors.length) wordingCheck.status = "fail";
  checks.push(wordingCheck);

  // Canonical / no .html hrefs / links resolve
  const seoCheck = { name: "Canonical, No .html Hrefs, Links Resolve", status: "pass", errors: [], warnings: [] };
  const canonicalMatch = html.match(/rel="canonical" href="([^"]*)"/);
  if (!canonicalMatch || canonicalMatch[1] !== "https://boltlab.io/tools/tapping-workflow") {
    seoCheck.errors.push(`Unexpected canonical: ${canonicalMatch ? canonicalMatch[1] : "none found"}`);
  }
  const htmlHrefs = [...html.matchAll(/href="([^"]*\.html)"/g)];
  if (htmlHrefs.length) seoCheck.errors.push(`Found ${htmlHrefs.length} .html href(s)`);
  const hrefs = [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]))];
  for (const href of hrefs) {
    const clean = href.split("#")[0];
    if (!clean) continue;
    const p = clean.replace(/^\//, "");
    const candidates = [path.join(root, p), path.join(root, `${p}.html`), path.join(root, p, "index.html")];
    if (!candidates.some((c) => fs.existsSync(c))) {
      seoCheck.errors.push(`Broken internal link: ${href}`);
    }
  }
  if (seoCheck.errors.length) seoCheck.status = "fail";
  checks.push(seoCheck);

  const errorCount = checks.reduce((sum, c) => sum + c.errors.length, 0);
  const warningCount = checks.reduce((sum, c) => sum + c.warnings.length, 0);

  const report = {
    status: errorCount > 0 ? "fail" : "pass",
    errors: errorCount,
    warnings: warningCount,
    counts: {
      profiles: embedded.profiles.length,
      tap_types: embedded.tapTypes.length
    },
    checks
  };

  const outJson = path.join(root, "docs", "architecture", "tapping-workflow-validation-report.json");
  const outMd = path.join(root, "docs", "architecture", "tapping-workflow-validation-report.md");
  writeJson(outJson, report);

  const lines = [];
  lines.push("# Tapping Workflow Validation Report");
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
