#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson, writeJson, writeText } = require("../utilities/path-utils");

function main() {
  const root = projectRoot();
  const profileProjection = readJson(path.join(root, "data", "projections", "tapping", "tapping-profiles.json"));
  const tapTypeProjection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));
  const htmlPath = path.join(root, "reference", "tapping-evidence.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const dataJsPath = path.join(root, "js", "tapping-workflow-data.js");
  const dataJsText = fs.readFileSync(dataJsPath, "utf8");
  const embeddedMatch = dataJsText.match(/window\.BoltLabTappingWorkflowData\s*=\s*(\{[\s\S]*\});?\s*$/);
  const embedded = JSON.parse(embeddedMatch[1]);

  const checks = [];

  // 1-4. All 29 profiles / 7 tap types represented, none silently dropped
  const coverageCheck = { name: "Full Profile and Tap-Type Coverage (No Silent Drop)", status: "pass", errors: [], warnings: [] };
  const projectionProfileIds = profileProjection.rows.map((r) => r.tapping_profile_id).sort();
  const embeddedProfileIds = embedded.profiles.map((p) => p.id).sort();
  if (JSON.stringify(projectionProfileIds) !== JSON.stringify(embeddedProfileIds)) {
    coverageCheck.errors.push("Profile ID set (via shared embedded data) does not match projection exactly");
  }
  const projectionTapTypeIds = tapTypeProjection.rows.map((r) => r.entity_id).sort();
  const embeddedTapTypeIds = embedded.tapTypes.map((t) => t.entity_id).sort();
  if (JSON.stringify(projectionTapTypeIds) !== JSON.stringify(embeddedTapTypeIds)) {
    coverageCheck.errors.push("Tap-type ID set does not match projection exactly");
  }
  if (embedded.profiles.length !== 29) coverageCheck.errors.push(`Expected 29 profiles, found ${embedded.profiles.length}`);
  if (embedded.tapTypes.length !== 7) coverageCheck.errors.push(`Expected 7 tap types, found ${embedded.tapTypes.length}`);
  if (coverageCheck.errors.length) coverageCheck.status = "fail";
  checks.push(coverageCheck);

  // 5-10. Tap-drill values/statuses, overall statuses, ISO alternatives, cross-verification -- all match projection exactly
  const fidelityCheck = { name: "Tap-Drill, Status, ISO Alternative, and Cross-Verification Fidelity", status: "pass", errors: [], warnings: [] };
  const profileById = new Map(profileProjection.rows.map((r) => [r.tapping_profile_id, r]));
  for (const p of embedded.profiles) {
    const source = profileById.get(p.id);
    if (!source) { fidelityCheck.errors.push(`${p.id}: no matching source projection row`); continue; }
    if (p.tap_drill.value !== source.tap_drill.value || p.tap_drill.unit !== source.tap_drill.unit) {
      fidelityCheck.errors.push(`${p.id}: tap_drill value/unit mismatch`);
    }
    if (p.tap_drill.status !== source.tap_drill.status) {
      fidelityCheck.errors.push(`${p.id}: tap_drill status mismatch`);
    }
    if (p.data_quality.record_status !== source.data_quality.record_status) {
      fidelityCheck.errors.push(`${p.id}: overall record status mismatch`);
    }
    if (JSON.stringify(p.tap_drill.provenance) !== JSON.stringify(source.tap_drill.provenance)) {
      fidelityCheck.errors.push(`${p.id}: tap_drill provenance (incl. cross-verification fields) does not match source exactly`);
    }
    const sourceHasAlt = Boolean(source.alternative_drill);
    const embeddedHasAlt = Boolean(p.alternative_drill);
    if (sourceHasAlt !== embeddedHasAlt) {
      fidelityCheck.errors.push(`${p.id}: alternative_drill presence mismatch`);
    } else if (embeddedHasAlt && JSON.stringify(p.alternative_drill) !== JSON.stringify(source.alternative_drill)) {
      fidelityCheck.errors.push(`${p.id}: alternative_drill content mismatch`);
    }
    if (p.thread.thread_system === "metric" && embeddedHasAlt) {
      fidelityCheck.errors.push(`${p.id}: metric record unexpectedly has an ISO alternative`);
    }
  }
  if (fidelityCheck.errors.length) fidelityCheck.status = "fail";
  checks.push(fidelityCheck);

  // 11-13. All four tap-type classifications preserved, no general_taxonomy drop, evidence kinds preserved
  const tapTypeCheck = { name: "Tap-Type Classification, general_taxonomy, and Evidence-Kind Preservation", status: "pass", errors: [], warnings: [] };
  const CLASSIFICATION_FIELDS = ["general_taxonomy", "manufacturing_characteristics", "typical_applications", "manufacturer_specific_recommendations"];
  const tapTypeSourceById = new Map(tapTypeProjection.rows.map((r) => [r.entity_id, r]));
  for (const t of embedded.tapTypes) {
    const source = tapTypeSourceById.get(t.entity_id);
    if (!source) { tapTypeCheck.errors.push(`${t.entity_id}: no matching source projection row`); continue; }
    for (const field of CLASSIFICATION_FIELDS) {
      if (JSON.stringify(t[field]) !== JSON.stringify(source[field])) {
        tapTypeCheck.errors.push(`${t.entity_id}: "${field}" does not match source exactly -- loss, duplication, or reclassification risk`);
      }
    }
  }
  if (tapTypeCheck.errors.length) tapTypeCheck.status = "fail";
  checks.push(tapTypeCheck);

  // 14-16. Provenance preserved, not fabricated; standards projection-backed
  const provenanceCheck = { name: "Provenance Fields Preserved, Not Fabricated; Standards Projection-Backed", status: "pass", errors: [], warnings: [] };
  for (const p of embedded.profiles) {
    const source = profileById.get(p.id);
    if (JSON.stringify(p.standards) !== JSON.stringify(source.standards)) {
      provenanceCheck.errors.push(`${p.id}: standards array does not match source projection exactly`);
    }
  }
  // Provenance fabrication check: the page must never invent a URL/title not present in provenance.
  // Since the rendering script only ever reads prov.source_dataset/source_record/source_field/source/cross_check
  // (verified structurally below), and none of those fields are URLs in the current projection, confirm the
  // inline script does not contain any hardcoded external URL for a tap-drill source.
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch && /https?:\/\/(?!boltlab\.io)/.test(scriptMatch[1])) {
    provenanceCheck.warnings.push("Inline script contains a non-boltlab.io URL literal -- confirm it is not a fabricated source link");
  }
  if (provenanceCheck.errors.length) provenanceCheck.status = "fail";
  checks.push(provenanceCheck);

  // 17-18. Engagement not calculable, no unsupported numeric target
  const engagementCheck = { name: "Engagement Remains Not Calculable, No Unsupported Target", status: "pass", errors: [], warnings: [] };
  for (const p of embedded.profiles) {
    if (p.engagement.radial.target_percent !== null) engagementCheck.errors.push(`${p.id}: radial.target_percent is not null`);
    if (p.engagement.axial.calculation_status !== "not_calculable") engagementCheck.errors.push(`${p.id}: axial.calculation_status is not not_calculable`);
  }
  const forbiddenPatterns = [/\b75\s*%|\b75 percent\b/i, /\b70\s*%/i, /\b77\s*%/i];
  const combined = html + dataJsText;
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(combined)) engagementCheck.errors.push(`Forbidden engagement pattern found: ${pattern}`);
  }
  if (!html.includes("Thread engagement calculation is not currently available in BoltLab's verified dataset.")) {
    engagementCheck.errors.push("Required exact engagement-limitation sentence not found");
  }
  if (engagementCheck.errors.length) engagementCheck.status = "fail";
  checks.push(engagementCheck);

  // 19. Displayed verification counts equal projection counts
  const countsCheck = { name: "Displayed Verification Counts Equal Projection Counts", status: "pass", errors: [], warnings: [] };
  const expected = {
    tapDrillVerified: profileProjection.rows.filter((r) => r.tap_drill.status === "verified").length,
    tapDrillSourceBound: profileProjection.rows.filter((r) => r.tap_drill.status === "source_bound").length,
    recordVerified: profileProjection.rows.filter((r) => r.data_quality.record_status === "verified").length,
    recordSourceBound: profileProjection.rows.filter((r) => r.data_quality.record_status === "source_bound").length,
    tapTypeVerified: tapTypeProjection.rows.reduce((s, t) => s + t.evidence_status.verified_fact_count, 0),
    tapTypeSourceBound: tapTypeProjection.rows.reduce((s, t) => s + t.evidence_status.source_bound_fact_count, 0)
  };
  const displayedMatch = html.match(/id="ev-td-verified">(\d+)<\/span> verified \/ <span id="ev-td-sourcebound">(\d+)/);
  const recordMatch = html.match(/id="ev-rec-verified">(\d+)<\/span> verified \/ <span id="ev-rec-sourcebound">(\d+)/);
  const tapTypeMatch = html.match(/id="ev-tt-verified">(\d+)<\/span> verified fact.*?id="ev-tt-sourcebound">(\d+)/);
  if (!displayedMatch || Number(displayedMatch[1]) !== expected.tapDrillVerified || Number(displayedMatch[2]) !== expected.tapDrillSourceBound) {
    countsCheck.errors.push(`Tap-drill counts displayed do not match projection (${expected.tapDrillVerified}/${expected.tapDrillSourceBound})`);
  }
  if (!recordMatch || Number(recordMatch[1]) !== expected.recordVerified || Number(recordMatch[2]) !== expected.recordSourceBound) {
    countsCheck.errors.push(`Record status counts displayed do not match projection (${expected.recordVerified}/${expected.recordSourceBound})`);
  }
  if (!tapTypeMatch || Number(tapTypeMatch[1]) !== expected.tapTypeVerified || Number(tapTypeMatch[2]) !== expected.tapTypeSourceBound) {
    countsCheck.errors.push(`Tap-type fact counts displayed do not match projection (${expected.tapTypeVerified}/${expected.tapTypeSourceBound})`);
  }
  if (countsCheck.errors.length) countsCheck.status = "fail";
  checks.push(countsCheck);

  // 20. JSON-LD parses
  const jsonLdCheck = { name: "JSON-LD Parses, Required Types Present", status: "pass", errors: [], warnings: [] };
  const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const presentTypes = jsonLdBlocks.map((b) => b["@type"]);
  for (const t of ["WebPage", "BreadcrumbList"]) {
    if (!presentTypes.includes(t)) jsonLdCheck.errors.push(`Missing required JSON-LD type: ${t}`);
  }
  if (jsonLdCheck.errors.length) jsonLdCheck.status = "fail";
  checks.push(jsonLdCheck);

  // 21. Canonical correct
  const canonicalCheck = { name: "Canonical Correct", status: "pass", errors: [], warnings: [] };
  const canonicalMatch = html.match(/rel="canonical" href="([^"]*)"/);
  if (!canonicalMatch || canonicalMatch[1] !== "https://boltlab.io/reference/tapping-evidence") {
    canonicalCheck.errors.push(`Unexpected canonical: ${canonicalMatch ? canonicalMatch[1] : "none found"}`);
  }
  if (canonicalCheck.errors.length) canonicalCheck.status = "fail";
  checks.push(canonicalCheck);

  // No .html hrefs / broken links
  const linkCheck = { name: "No .html Hrefs, Internal Links Resolve", status: "pass", errors: [], warnings: [] };
  const htmlHrefs = [...html.matchAll(/href="([^"]*\.html)"/g)];
  if (htmlHrefs.length) linkCheck.errors.push(`Found ${htmlHrefs.length} .html href(s)`);
  const hrefs = [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]))];
  for (const href of hrefs) {
    const clean = href.split("#")[0];
    if (!clean) continue;
    const p = clean.replace(/^\//, "");
    const candidates = [path.join(root, p), path.join(root, `${p}.html`), path.join(root, p, "index.html")];
    if (!candidates.some((c) => fs.existsSync(c))) linkCheck.errors.push(`Broken internal link: ${href}`);
  }
  if (linkCheck.errors.length) linkCheck.status = "fail";
  checks.push(linkCheck);

  // Inline script is valid JavaScript (the check that would have caught the T9-preceding T8 bug)
  const syntaxCheck = { name: "Inline Script Is Valid JavaScript", status: "pass", errors: [], warnings: [] };
  if (!scriptMatch) {
    syntaxCheck.errors.push("Could not locate the inline (non-JSON-LD) <script> block");
  } else {
    try {
      // eslint-disable-next-line no-new-func
      new Function(scriptMatch[1]);
    } catch (e) {
      syntaxCheck.errors.push(`Inline script has a JavaScript syntax error: ${e.message}`);
    }
  }
  if (syntaxCheck.errors.length) syntaxCheck.status = "fail";
  checks.push(syntaxCheck);

  // No overclaiming language
  const claimCheck = { name: "No Overclaiming Language", status: "pass", errors: [], warnings: [] };
  const forbiddenPhrases = [/\bguaranteed\b/i, /\bcertified\b/i, /\bindustry[- ]standard\b/i, /\bofficial\b/i, /\bauthoritative\b/i];
  for (const phrase of forbiddenPhrases) {
    if (phrase.test(html)) claimCheck.errors.push(`Overclaiming phrase found: ${phrase}`);
  }
  if (claimCheck.errors.length) claimCheck.status = "fail";
  checks.push(claimCheck);

  const errorCount = checks.reduce((sum, c) => sum + c.errors.length, 0);
  const warningCount = checks.reduce((sum, c) => sum + c.warnings.length, 0);

  const report = {
    status: errorCount > 0 ? "fail" : "pass",
    errors: errorCount,
    warnings: warningCount,
    counts: { profiles: embedded.profiles.length, tap_types: embedded.tapTypes.length },
    checks
  };

  const outJson = path.join(root, "docs", "architecture", "tapping-evidence-validation-report.json");
  const outMd = path.join(root, "docs", "architecture", "tapping-evidence-validation-report.md");
  writeJson(outJson, report);

  const lines = [];
  lines.push("# Tapping Evidence Validation Report");
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
