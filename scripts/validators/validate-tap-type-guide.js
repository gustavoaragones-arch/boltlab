#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, readJson, writeJson, writeText } = require("../utilities/path-utils");

function main() {
  const root = projectRoot();
  const projection = readJson(path.join(root, "data", "projections", "tapping", "tap-types.json"));
  const htmlPath = path.join(root, "reference", "tap-type-guide.html");
  const html = fs.readFileSync(htmlPath, "utf8");

  const checks = [];

  const expected = {
    tapTypeCount: projection.rows.length,
    totalFacts: projection.rows.reduce(
      (sum, r) => sum + r.general_taxonomy.length + r.manufacturing_characteristics.length + r.typical_applications.length + r.manufacturer_specific_recommendations.length,
      0
    ),
    verifiedFacts: projection.rows.reduce((sum, r) => sum + r.evidence_status.verified_fact_count, 0),
    sourceBoundFacts: projection.rows.reduce((sum, r) => sum + r.evidence_status.source_bound_fact_count, 0),
    entityIds: projection.rows.map((r) => r.entity_id).sort()
  };

  // 1. Every tap type has its own section, and general_taxonomy facts are present where the projection has them
  const sectionCheck = { name: "Every Tap Type Represented, Including general_taxonomy", status: "pass", errors: [], warnings: [] };
  for (const row of projection.rows) {
    const anchor = row.entity_id.replace(/_/g, "-");
    if (!html.includes(`id="${anchor}"`)) {
      sectionCheck.errors.push(`No section found for ${row.entity_id} (expected id="${anchor}")`);
    }
    for (const note of row.general_taxonomy) {
      if (!html.includes(note.fact.replace(/&/g, "&amp;"))) {
        sectionCheck.errors.push(`${row.entity_id}: general_taxonomy fact not found in generated HTML -- "${note.fact.slice(0, 60)}..."`);
      }
    }
  }
  if (sectionCheck.errors.length) sectionCheck.status = "fail";
  checks.push(sectionCheck);

  // 2. Fact and verification counts match the projection exactly
  const countCheck = { name: "Verified/Source-Bound Counts Match Projection", status: "pass", errors: [], warnings: [] };
  const verifiedBadgeCount = (html.match(/data-status--verified/g) || []).length;
  const sourceBoundBadgeCount = (html.match(/data-status--source_bound/g) || []).length;
  if (verifiedBadgeCount !== expected.verifiedFacts) {
    countCheck.errors.push(`Verified badge count ${verifiedBadgeCount} != projection verified fact count ${expected.verifiedFacts}`);
  }
  if (sourceBoundBadgeCount !== expected.sourceBoundFacts) {
    countCheck.errors.push(`Source-bound badge count ${sourceBoundBadgeCount} != projection source-bound fact count ${expected.sourceBoundFacts}`);
  }
  if (countCheck.errors.length) countCheck.status = "fail";
  checks.push(countCheck);

  // 3. No unsupported engagement recommendation (this page shouldn't discuss engagement at all, but check defensively)
  const engagementCheck = { name: "No Unsupported Engagement Recommendation", status: "pass", errors: [], warnings: [] };
  const forbiddenPatterns = [/\b75\s*%|\b75 percent\b/i, /\b70\s*%/i, /\b77\s*%/i];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(html)) engagementCheck.errors.push(`Forbidden pattern found: ${pattern}`);
  }
  if (engagementCheck.errors.length) engagementCheck.status = "fail";
  checks.push(engagementCheck);

  // 4. No universal recommendation language ("best for", "should always")
  const claimCheck = { name: "No Overclaiming Language", status: "pass", errors: [], warnings: [] };
  const forbiddenPhrases = [/\bbest for\b/i, /\bshould always\b/i, /\bindustry[- ]standard\b/i, /\bISO[- ]approved\b/i];
  for (const phrase of forbiddenPhrases) {
    if (phrase.test(html)) claimCheck.errors.push(`Overclaiming phrase found: ${phrase}`);
  }
  if (claimCheck.errors.length) claimCheck.status = "fail";
  checks.push(claimCheck);

  // 5. FAQ identity match
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

  // 6. JSON-LD parses, required types present
  const jsonLdCheck = { name: "JSON-LD Parses and Required Types Present", status: "pass", errors: [], warnings: [] };
  const requiredTypes = ["WebPage", "BreadcrumbList", "FAQPage"];
  const presentTypes = jsonLdBlocks.map((b) => b["@type"]);
  for (const t of requiredTypes) {
    if (!presentTypes.includes(t)) jsonLdCheck.errors.push(`Missing required JSON-LD type: ${t}`);
  }
  if (jsonLdCheck.errors.length) jsonLdCheck.status = "fail";
  checks.push(jsonLdCheck);

  // 7. No .html hrefs
  const noHtmlHrefCheck = { name: "No .html Internal Hrefs", status: "pass", errors: [], warnings: [] };
  const htmlHrefs = [...html.matchAll(/href="([^"]*\.html)"/g)];
  if (htmlHrefs.length) noHtmlHrefCheck.errors.push(`Found ${htmlHrefs.length} .html href(s)`);
  if (noHtmlHrefCheck.errors.length) noHtmlHrefCheck.status = "fail";
  checks.push(noHtmlHrefCheck);

  // 8. Internal links resolve
  const linkCheck = { name: "Internal Links Resolve", status: "pass", errors: [], warnings: [] };
  const hrefs = [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]))];
  for (const href of hrefs) {
    const cleanHref = href.split("#")[0];
    if (!cleanHref) continue;
    const p = cleanHref.replace(/^\//, "");
    const candidates = [path.join(root, p), path.join(root, `${p}.html`), path.join(root, p, "index.html")];
    if (!candidates.some((c) => fs.existsSync(c))) {
      linkCheck.errors.push(`Broken internal link: ${href}`);
    }
  }
  if (linkCheck.errors.length) linkCheck.status = "fail";
  checks.push(linkCheck);

  // 9. Canonical is extensionless
  const canonicalCheck = { name: "Canonical Extensionless", status: "pass", errors: [], warnings: [] };
  const canonicalMatch = html.match(/rel="canonical" href="([^"]*)"/);
  if (!canonicalMatch || canonicalMatch[1].endsWith(".html") || canonicalMatch[1] !== "https://boltlab.io/reference/tap-type-guide") {
    canonicalCheck.errors.push(`Unexpected canonical: ${canonicalMatch ? canonicalMatch[1] : "none found"}`);
  }
  if (canonicalCheck.errors.length) canonicalCheck.status = "fail";
  checks.push(canonicalCheck);

  const errorCount = checks.reduce((sum, c) => sum + c.errors.length, 0);
  const warningCount = checks.reduce((sum, c) => sum + c.warnings.length, 0);

  const report = {
    status: errorCount > 0 ? "fail" : "pass",
    errors: errorCount,
    warnings: warningCount,
    expected_from_projection: expected,
    checks
  };

  const outJson = path.join(root, "docs", "architecture", "tap-type-guide-validation-report.json");
  const outMd = path.join(root, "docs", "architecture", "tap-type-guide-validation-report.md");
  writeJson(outJson, report);

  const lines = [];
  lines.push("# Tap Type Guide Validation Report");
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
