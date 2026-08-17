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
  const overallStatusCount = (html.match(/Overall record status: (Verified|Source-bound)/g) || []).length;
  if (tapDrillLabelCount !== expected.total) distinctionCheck.errors.push(`"Tap drill: ..." label appears ${tapDrillLabelCount} times, expected ${expected.total}`);
  if (overallStatusCount !== expected.total) distinctionCheck.errors.push(`"Overall record status: ..." label appears ${overallStatusCount} times, expected ${expected.total}`);
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

  // 11. Tap-type evidence completeness: every classification the tap-type projection actually
  // carries (general_taxonomy, manufacturing_characteristics, typical_applications,
  // manufacturer_specific_recommendations) must be represented in the Atlas HTML for every tap
  // type that has facts in that classification -- fact-by-fact, not just "the word appears
  // somewhere." Added after a real bug where general_taxonomy (including the one VERIFIED,
  // NASA-STD-5020A-sourced fact) was silently dropped by the Atlas generator even after the T3
  // projection itself was corrected -- see audit/t6-tapping-atlas-completeness.md.
  const tapTypeCompletenessCheck = { name: "Tap-Type Evidence Completeness (All 4 Classifications Rendered)", status: "pass", errors: [], warnings: [] };
  const CLASSIFICATION_FIELDS = ["general_taxonomy", "manufacturing_characteristics", "typical_applications", "manufacturer_specific_recommendations"];
  const CLASSIFICATION_LABELS = {
    general_taxonomy: "General taxonomy",
    manufacturing_characteristics: "Manufacturing characteristics",
    typical_applications: "Typical applications",
    manufacturer_specific_recommendations: "Manufacturer-specific recommendations"
  };
  let tapTypeFactsChecked = 0;
  for (const row of tapTypeProjection.rows) {
    // Locate this tap type's card by its title heading, to scope the fact search and catch reclassification/duplication.
    const cardMatch = html.match(new RegExp(`<h3>${row.title.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}</h3>[\\s\\S]*?</article>`));
    const cardHtml = cardMatch ? cardMatch[0] : "";
    if (!cardMatch) {
      tapTypeCompletenessCheck.errors.push(`${row.entity_id}: no card found in Atlas HTML for tap type "${row.title}"`);
      continue;
    }
    for (const field of CLASSIFICATION_FIELDS) {
      const notes = row[field] || [];
      if (notes.length === 0) continue;
      const label = CLASSIFICATION_LABELS[field];
      if (!cardHtml.includes(`>${label}<`)) {
        tapTypeCompletenessCheck.errors.push(`${row.entity_id}: has ${notes.length} "${field}" fact(s) in the projection but no "${label}" heading found in its Atlas card -- classification silently dropped`);
        continue;
      }
      for (const note of notes) {
        tapTypeFactsChecked += 1;
        const escapedFact = note.fact.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const occurrences = cardHtml.split(escapedFact).length - 1;
        if (occurrences === 0) {
          tapTypeCompletenessCheck.errors.push(`${row.entity_id}: fact dropped from Atlas HTML -- "${note.fact.slice(0, 60)}..."`);
        } else if (occurrences > 1) {
          tapTypeCompletenessCheck.errors.push(`${row.entity_id}: fact duplicated in Atlas HTML (${occurrences}x) -- "${note.fact.slice(0, 60)}..."`);
        } else {
          const expectedStatusWord = note.status === "verified" ? "Verified" : note.status === "source_bound" ? "Source-bound" : note.status;
          if (!cardHtml.includes(`${escapedFact} <span class="muted">(${expectedStatusWord})`)) {
            tapTypeCompletenessCheck.errors.push(`${row.entity_id}: fact status not preserved/adjacent in Atlas HTML for -- "${note.fact.slice(0, 60)}..." (expected status label "${expectedStatusWord}")`);
          }
        }
      }
    }
  }
  if (tapTypeFactsChecked === 0) {
    tapTypeCompletenessCheck.errors.push("No tap-type facts were checked at all -- projection may be empty or check logic broken.");
  }
  if (tapTypeCompletenessCheck.errors.length) tapTypeCompletenessCheck.status = "fail";
  checks.push(tapTypeCompletenessCheck);

  // 12. The specific NASA-STD-5020A verified bottoming-tap fact must be present and marked verified
  const nasaFactCheck = { name: "NASA-STD-5020A Verified Bottoming-Tap Fact Present", status: "pass", errors: [], warnings: [] };
  const bottomingRow = tapTypeProjection.rows.find((r) => r.entity_id === "bottoming_tap");
  const nasaFact = bottomingRow ? bottomingRow.general_taxonomy.find((n) => n.status === "verified") : null;
  if (!nasaFact) {
    nasaFactCheck.errors.push("Expected VERIFIED general_taxonomy fact on bottoming_tap not found in projection -- has the knowledge layer regressed?");
  } else {
    const escapedFact = nasaFact.fact.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (!html.includes(escapedFact)) {
      nasaFactCheck.errors.push("NASA-STD-5020A verified bottoming-tap fact is present in the projection but absent from the Atlas HTML.");
    }
    if (!html.includes(`${escapedFact} <span class="muted">(Verified)`)) {
      nasaFactCheck.errors.push("NASA-STD-5020A fact is present but not rendered with a Verified status label immediately adjacent.");
    }
  }
  if (nasaFactCheck.errors.length) nasaFactCheck.status = "fail";
  checks.push(nasaFactCheck);

  // 13. (T12) Inline application script must actually be syntactically valid JavaScript. Atlas is
  //     the one tapping product whose generator embeds a client-side <script> IIFE (the
  //     search/filter logic) inside an outer JS template literal in generate-tapping-atlas.js --
  //     the exact architectural shape that caused a real, silently-shipped syntax error in T8's
  //     Workflow page (an unescaped quote broke the whole inline script at parse time; it went
  //     undetected until T9's audit inspected git history directly). validate-tapping-workflow.js
  //     and validate-tapping-evidence.js already carry this exact check; Atlas never did. Uses the
  //     same `new Function(...)` mechanism as those two -- parses without executing, no new
  //     dependency, no browser runtime.
  const syntaxCheck = { name: "Inline Script Is Valid JavaScript (node --check)", status: "pass", errors: [], warnings: [] };
  // Match only a bare `<script>` tag (no attributes) -- this structurally excludes every
  // `<script type="application/ld+json">` block and every external `<script src="...">` tag,
  // both of which always carry an attribute and therefore can never match this pattern.
  const inlineScriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (inlineScriptMatches.length === 0) {
    syntaxCheck.errors.push("No inline (non-JSON-LD, non-external) <script> block found -- expected exactly 1 (the Atlas search/filter IIFE)");
  } else if (inlineScriptMatches.length > 1) {
    syntaxCheck.errors.push(`Found ${inlineScriptMatches.length} candidate inline <script> blocks, expected exactly 1 -- extraction is ambiguous, refusing to guess which one is the application script`);
  } else {
    const scriptBody = inlineScriptMatches[0][1];
    // Defensive redundancy: a JSON-LD payload should never reach here (it always carries
    // type="application/ld+json" and therefore can't match the bare-tag regex above), but guard
    // explicitly anyway in case that invariant is ever broken by an unrelated future change.
    if (scriptBody.trim().startsWith("{")) {
      syntaxCheck.errors.push("Extracted script body looks like a JSON payload (starts with '{'), not the application IIFE -- extraction may have matched the wrong block");
    } else {
      try {
        // eslint-disable-next-line no-new-func
        new Function(scriptBody);
      } catch (e) {
        syntaxCheck.errors.push(`Inline script has a JavaScript syntax error: ${e.message}`);
      }
    }
  }
  if (syntaxCheck.errors.length) syntaxCheck.status = "fail";
  checks.push(syntaxCheck);

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
