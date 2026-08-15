#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson, writeJson, writeText } = require("../utilities/path-utils");

function main() {
  const root = projectRoot();
  const profileProjection = readJson(path.join(root, "data", "projections", "tapping", "tapping-profiles.json"));
  const tapTypeProjection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));
  const htmlPath = path.join(root, "reference", "tapping-atlas.html");
  const csvPath = path.join(root, "downloads", "tapping-atlas.csv");
  const html = fs.readFileSync(htmlPath, "utf8");
  const csvText = fs.readFileSync(csvPath, "utf8");

  const checks = [];

  // Derive expected values from the projection itself -- never hard-coded.
  const rows = profileProjection.rows;
  const expected = {
    total: rows.length,
    metric: rows.filter((r) => r.thread.thread_system === "metric").length,
    unc: rows.filter((r) => r.thread.thread_system === "UNC").length,
    unf: rows.filter((r) => r.thread.thread_system === "UNF").length,
    tapDrillVerified: rows.filter((r) => r.tap_drill.status === "verified").length,
    tapDrillSourceBound: rows.filter((r) => r.tap_drill.status === "source_bound").length,
    recordStatusVerified: rows.filter((r) => r.data_quality.record_status === "verified").length,
    recordStatusSourceBound: rows.filter((r) => r.data_quality.record_status === "source_bound").length,
    isoAltCount: rows.filter((r) => r.alternative_drill).length,
    isoAltOnlyUncUnf: rows.every((r) => Boolean(r.alternative_drill) === (r.thread.thread_system !== "metric")),
    tapTypeCount: tapTypeProjection.rows.length,
    designations: [...rows].map((r) => r.thread.designation).sort()
  };

  // 1. Data Quality panel counts match projection-derived expectations
  const panelCheck = { name: "Data Quality Panel Matches Projection", status: "pass", errors: [], warnings: [] };
  const panelMatch = html.match(/Records: (\d+) tapping profiles/);
  const tapTypesMatch = html.match(/Tap types: (\d+)/);
  const tapDrillMatch = html.match(/Tap-drill values: (\d+) verified \/ (\d+) source-bound/);
  const isoAltMatch = html.match(/ISO 2306 alternatives: (\d+) verified/);
  if (!panelMatch || Number(panelMatch[1]) !== expected.total) {
    panelCheck.errors.push(`Records count in panel does not match projection (${expected.total})`);
  }
  if (!tapTypesMatch || Number(tapTypesMatch[1]) !== expected.tapTypeCount) {
    panelCheck.errors.push(`Tap types count in panel does not match projection (${expected.tapTypeCount})`);
  }
  if (!tapDrillMatch || Number(tapDrillMatch[1]) !== expected.tapDrillVerified || Number(tapDrillMatch[2]) !== expected.tapDrillSourceBound) {
    panelCheck.errors.push(`Tap-drill verified/source-bound counts in panel do not match projection (${expected.tapDrillVerified}/${expected.tapDrillSourceBound})`);
  }
  if (!isoAltMatch || Number(isoAltMatch[1]) !== expected.isoAltCount) {
    panelCheck.errors.push(`ISO 2306 alternatives count in panel does not match projection (${expected.isoAltCount})`);
  }
  if (panelCheck.errors.length) panelCheck.status = "fail";
  checks.push(panelCheck);

  // 2. Card-level counts match projection
  const cardCheck = { name: "Card-Level Verification States Match Projection", status: "pass", errors: [], warnings: [] };
  const cardVerified = (html.match(/data-verification="verified"/g) || []).length;
  const cardSourceBound = (html.match(/data-verification="source_bound"/g) || []).length;
  const cardIsoYes = (html.match(/data-iso-alt="yes"/g) || []).length;
  const cardIsoNo = (html.match(/data-iso-alt="no"/g) || []).length;
  if (cardVerified !== expected.tapDrillVerified) cardCheck.errors.push(`Card data-verification="verified" count ${cardVerified} != ${expected.tapDrillVerified}`);
  if (cardSourceBound !== expected.tapDrillSourceBound) cardCheck.errors.push(`Card data-verification="source_bound" count ${cardSourceBound} != ${expected.tapDrillSourceBound}`);
  if (cardIsoYes !== expected.isoAltCount) cardCheck.errors.push(`Card data-iso-alt="yes" count ${cardIsoYes} != ${expected.isoAltCount}`);
  if (cardIsoNo !== expected.total - expected.isoAltCount) cardCheck.errors.push(`Card data-iso-alt="no" count ${cardIsoNo} != ${expected.total - expected.isoAltCount}`);
  if (!expected.isoAltOnlyUncUnf) cardCheck.errors.push("ISO alternative present on a non-UNC/UNF row, or missing on a UNC/UNF row, in the source projection itself.");
  if (cardCheck.errors.length) cardCheck.status = "fail";
  checks.push(cardCheck);

  // 3. Field-level vs record-level status kept visually distinct (both phrases present on every card)
  const distinctionCheck = { name: "Field-Level vs Record-Level Status Distinction Present", status: "pass", errors: [], warnings: [] };
  const tapDrillLabelCount = (html.match(/Tap drill: (Verified|Source-bound)/g) || []).length;
  const overallStatusCount = (html.match(/Overall profile status: (Verified|Source-bound)/g) || []).length;
  if (tapDrillLabelCount !== expected.total) distinctionCheck.errors.push(`"Tap drill: ..." label appears ${tapDrillLabelCount} times, expected ${expected.total}`);
  if (overallStatusCount !== expected.total) distinctionCheck.errors.push(`"Overall profile status: ..." label appears ${overallStatusCount} times, expected ${expected.total}`);
  if (distinctionCheck.errors.length) distinctionCheck.status = "fail";
  checks.push(distinctionCheck);

  // 4. No unsupported engagement recommendation anywhere in the generated product
  const engagementCheck = { name: "No Unsupported Engagement Recommendation", status: "pass", errors: [], warnings: [] };
  const forbiddenPatterns = [/\b75\s*%|\b75 percent\b/i, /\b70\s*%/i, /\b77\s*%/i, /1\s*[×x]\s*diameter/i, /1\.5\s*[×x]\s*diameter/i, /2\s*[×x]\s*diameter/i];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(html) || pattern.test(csvText)) {
      engagementCheck.errors.push(`Forbidden engagement pattern found: ${pattern}`);
    }
  }
  if (engagementCheck.errors.length) engagementCheck.status = "fail";
  checks.push(engagementCheck);

  // 5. CSV row count and designations match projection exactly
  const csvCheck = { name: "CSV Matches Projection", status: "pass", errors: [], warnings: [] };
  const csvLines = csvText.trim().split("\n");
  const csvHeader = csvLines[0].split(",");
  const csvRows = csvLines.slice(1);
  if (csvRows.length !== expected.total) {
    csvCheck.errors.push(`CSV row count ${csvRows.length} != projection row count ${expected.total}`);
  }
  const csvDesignations = csvRows.map((line) => line.split(",")[0]).sort();
  if (JSON.stringify(csvDesignations) !== JSON.stringify(expected.designations)) {
    csvCheck.errors.push("CSV designations do not match projection designations exactly.");
  }
  const requiredCsvColumns = [
    "designation", "thread_system", "nominal_diameter", "nominal_diameter_unit", "pitch", "pitch_unit", "tpi",
    "coarse_fine", "primary_tap_drill", "primary_tap_drill_unit", "primary_drill_convention", "primary_tap_drill_status",
    "iso_2306_alternative_drill", "iso_2306_alternative_unit", "iso_2306_alternative_status", "standards", "tap_types", "record_status"
  ];
  for (const col of requiredCsvColumns) {
    if (!csvHeader.includes(col)) csvCheck.errors.push(`CSV missing required column: ${col}`);
  }
  if (csvCheck.errors.length) csvCheck.status = "fail";
  checks.push(csvCheck);

  // 6. HTML card designations match projection exactly (mechanical cross-surface consistency)
  const htmlCheck = { name: "HTML Cards Match Projection", status: "pass", errors: [], warnings: [] };
  const cardBlocks = html.match(/<article class="card tapping-atlas-card"[\s\S]*?<\/article>/g) || [];
  if (cardBlocks.length !== expected.total) {
    htmlCheck.errors.push(`HTML card count ${cardBlocks.length} != projection row count ${expected.total}`);
  }
  const htmlDesignations = cardBlocks
    .map((c) => {
      const m = c.match(/<h3>(.*?)<\/h3>/);
      return m ? m[1].replace(/&amp;/g, "&") : null;
    })
    .filter(Boolean)
    .sort();
  if (JSON.stringify(htmlDesignations) !== JSON.stringify(expected.designations)) {
    htmlCheck.errors.push("HTML card designations do not match projection designations exactly.");
  }
  if (htmlCheck.errors.length) htmlCheck.status = "fail";
  checks.push(htmlCheck);

  // 7. FAQ identity match (JSON-LD FAQPage vs visible FAQ text, exact by question)
  const faqCheck = { name: "FAQ Identity Match (JSON-LD vs Visible)", status: "pass", errors: [], warnings: [] };
  const jsonLdBlocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
  const faqJsonLd = jsonLdBlocks.find((b) => b["@type"] === "FAQPage");
  if (!faqJsonLd) {
    faqCheck.errors.push("No FAQPage JSON-LD found.");
  } else {
    const faqSectionMatch = html.match(/<section class="card" id="faq">([\s\S]*?)<\/section>/);
    const faqSection = faqSectionMatch ? faqSectionMatch[1] : "";
    const visiblePairs = [...faqSection.matchAll(/<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/gs)].map((m) => [
      m[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'"),
      m[2].replace(/&amp;/g, "&").replace(/&#39;/g, "'")
    ]);
    const jsonPairs = faqJsonLd.mainEntity.map((item) => [item.name, item.acceptedAnswer.text]);
    if (visiblePairs.length !== jsonPairs.length) {
      faqCheck.errors.push(`Visible FAQ has ${visiblePairs.length} entries, JSON-LD has ${jsonPairs.length}`);
    } else {
      for (let i = 0; i < jsonPairs.length; i += 1) {
        if (jsonPairs[i][0] !== visiblePairs[i][0]) faqCheck.errors.push(`FAQ question ${i} identity mismatch`);
        if (jsonPairs[i][1] !== visiblePairs[i][1]) faqCheck.errors.push(`FAQ answer ${i} text mismatch`);
      }
    }
  }
  if (faqCheck.errors.length) faqCheck.status = "fail";
  checks.push(faqCheck);

  // 8. JSON-LD parses and required types present
  const jsonLdCheck = { name: "JSON-LD Parses and Required Types Present", status: "pass", errors: [], warnings: [] };
  const requiredTypes = ["Dataset", "WebPage", "BreadcrumbList"];
  const presentTypes = jsonLdBlocks.map((b) => b["@type"]);
  for (const t of requiredTypes) {
    if (!presentTypes.includes(t)) jsonLdCheck.errors.push(`Missing required JSON-LD type: ${t}`);
  }
  if (jsonLdCheck.errors.length) jsonLdCheck.status = "fail";
  checks.push(jsonLdCheck);

  // 9. No .html hrefs
  const noHtmlHrefCheck = { name: "No .html Internal Hrefs", status: "pass", errors: [], warnings: [] };
  const htmlHrefs = [...html.matchAll(/href="([^"]*\.html)"/g)];
  if (htmlHrefs.length) {
    noHtmlHrefCheck.errors.push(`Found ${htmlHrefs.length} .html href(s)`);
  }
  if (noHtmlHrefCheck.errors.length) noHtmlHrefCheck.status = "fail";
  checks.push(noHtmlHrefCheck);

  // 10. Internal links resolve
  const linkCheck = { name: "Internal Links Resolve", status: "pass", errors: [], warnings: [] };
  const hrefs = [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]))];
  for (const href of hrefs) {
    const p = href.replace(/^\//, "");
    const candidates = [path.join(root, p), path.join(root, `${p}.html`), path.join(root, p, "index.html")];
    if (!candidates.some((c) => fs.existsSync(c))) {
      linkCheck.errors.push(`Broken internal link: ${href}`);
    }
  }
  if (linkCheck.errors.length) linkCheck.status = "fail";
  checks.push(linkCheck);

  const errorCount = checks.reduce((sum, c) => sum + c.errors.length, 0);
  const warningCount = checks.reduce((sum, c) => sum + c.warnings.length, 0);

  const report = {
    status: errorCount > 0 ? "fail" : "pass",
    errors: errorCount,
    warnings: warningCount,
    expected_from_projection: expected,
    checks
  };

  const outJson = path.join(root, "docs", "architecture", "tapping-atlas-validation-report.json");
  const outMd = path.join(root, "docs", "architecture", "tapping-atlas-validation-report.md");
  writeJson(outJson, report);

  const lines = [];
  lines.push("# Tapping Atlas Validation Report");
  lines.push("");
  lines.push(`- Status: ${report.status}`);
  lines.push(`- Errors: ${report.errors}`);
  lines.push(`- Warnings: ${report.warnings}`);
  lines.push("");
  lines.push("## Expected Values (derived from the T3 projection, not hard-coded)");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(expected, null, 2));
  lines.push("```");
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
