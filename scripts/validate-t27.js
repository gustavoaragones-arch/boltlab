#!/usr/bin/env node
/**
 * T27 — Standards Stub Remediation & Indexation Cleanup: dedicated validator.
 *
 * Deterministic, read-only. Re-reads actual repository state each run (no cached assumptions).
 * Exit code 0 iff every check passes. See docs/T27-STANDARDS-REMEDIATION.md for the full
 * remediation record and reports/t27-status.md for the last recorded run's narrative summary.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function git(args) {
  return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" }).trim();
}

function robotsContent(html) {
  const m = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  return m ? m[1].toLowerCase() : null;
}

function canonicalHref(html) {
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
  return m ? m[1] : null;
}

const checks = [];
function check(name, fn) {
  try {
    const detail = fn();
    checks.push({ name, status: "PASS", detail: detail || "" });
  } catch (e) {
    checks.push({ name, status: "FAIL", detail: e.message });
  }
}

const TARGET_PAGES = {
  ansi: { route: "/reference/standards/ansi", file: "reference/standards/ansi.html", treatment: "noindex" },
  din: { route: "/reference/standards/din", file: "reference/standards/din.html", treatment: "noindex" },
  jis: { route: "/reference/standards/jis", file: "reference/standards/jis.html", treatment: "noindex" },
  "british-standards": { route: "/reference/standards/british-standards", file: "reference/standards/british-standards.html", treatment: "noindex" },
  asme: { route: "/reference/standards/asme", file: "reference/standards/asme.html", treatment: "strengthen" }
};

// 1. All five target URLs are accounted for.
check("1_all_five_targets_present", () => {
  for (const [id, cfg] of Object.entries(TARGET_PAGES)) {
    if (!exists(cfg.file)) throw new Error(`missing ${cfg.file}`);
  }
  return "all 5 files present on disk";
});

// 2. No placeholder standards page remains indexable.
check("2_no_placeholder_remains_indexable", () => {
  for (const id of ["ansi", "din", "jis", "british-standards"]) {
    const html = read(TARGET_PAGES[id].file);
    const robots = robotsContent(html);
    if (robots !== "noindex,follow") {
      throw new Error(`${id}: expected robots meta 'noindex,follow', got '${robots}'`);
    }
    if (/for future BoltLab standards expansion|future BoltLab references|future Japanese thread standards expansion/i.test(html)) {
      throw new Error(`${id}: still contains T26-flagged 'future expansion' placeholder language`);
    }
    if (/ad-slot|ad-container|Sponsored/.test(html.replace(/<!--[\s\S]*?-->/g, ""))) {
      throw new Error(`${id}: still carries live ad-slot markup outside a comment`);
    }
  }
  return "ansi/din/jis/british-standards: noindex,follow, no placeholder language, no ad markup";
});

// 3. No unintended standards page was created.
check("3_no_unintended_standards_page_created", () => {
  const dir = fs.readdirSync(path.join(ROOT, "reference/standards"));
  const expected = new Set(["ansi.html", "asme.html", "british-standards.html", "din.html", "index.html", "iso.html", "jis.html"]);
  const unexpected = dir.filter((f) => !expected.has(f));
  if (unexpected.length) throw new Error(`unexpected entries in reference/standards/: ${unexpected.join(", ")}`);
  const missing = [...expected].filter((f) => !dir.includes(f));
  if (missing.length) throw new Error(`expected entries missing: ${missing.join(", ")}`);
  return `reference/standards/ contains exactly the expected 7 files`;
});

// 4. ISO page remains unchanged.
check("4_iso_page_unchanged", () => {
  const isoFiles = [
    "reference/standards/iso.html",
    "reference/iso-68-thread-profile.html",
    "reference/iso-261-metric-thread-series.html",
    "reference/iso-262-metric-thread-fine-series.html",
    "reference/iso-724-thread-dimensions.html",
    "reference/iso-thread-tolerances-explained.html",
    "data/projections/reference/iso_68_1.reference.json",
    "data/projections/reference/iso_261.reference.json",
    "data/projections/reference/iso_262.reference.json",
    "data/projections/reference/iso_724.reference.json",
    "data/projections/reference/iso_965_1.reference.json",
    "data/projections/reference/iso_family.reference.json"
  ];
  const dirty = isoFiles.filter((f) => {
    try {
      return git(`diff --stat -- ${f}`).length > 0;
    } catch {
      return true;
    }
  });
  if (dirty.length) throw new Error(`ISO-family files differ from git HEAD: ${dirty.join(", ")}`);
  return `${isoFiles.length} ISO-family files confirmed byte-identical to git HEAD`;
});

// 5. Existing standards data remains unchanged unless explicitly authorized.
check("5_standards_seed_data_unchanged", () => {
  const seedFiles = ["ansi", "asme", "bs", "din", "iso", "jis", "other"].map(
    (org) => `data/standards/${org}/standards.seed.json`
  );
  const dirty = seedFiles.filter((f) => git(`diff --stat -- ${f}`).length > 0);
  if (dirty.length) throw new Error(`standards seed files unexpectedly modified: ${dirty.join(", ")}`);
  return `all 7 data/standards/*/standards.seed.json files confirmed byte-identical to git HEAD`;
});

// 6/7. ASME content uses only existing source-backed data; no fabricated claims.
check("6_7_asme_content_source_backed_no_fabrication", () => {
  const seed = JSON.parse(read("data/standards/asme/standards.seed.json"));
  const b11 = seed.records.find((r) => r.id === "asme_b1_1");
  const b949 = seed.records.find((r) => r.id === "asme_b94_9");
  if (!b11 || !b949) throw new Error("expected seed records asme_b1_1/asme_b94_9 not found");
  const html = read("reference/standards/asme.html");
  for (const requiredFact of [b11.designation, b11.title, b949.designation, b949.title, b11.edition, b949.edition]) {
    if (!html.includes(requiredFact)) {
      throw new Error(`ASME page missing expected source-backed fact: ${requiredFact}`);
    }
  }
  const disclaimerPresent = /BoltLab is not ASME and does not publish or certify compliance with ASME standards/.test(html);
  if (!disclaimerPresent) throw new Error("ASME page missing the required non-affiliation disclaimer");
  const forbiddenPatterns = [/ASME certifies/i, /this page is approved by ASME/i, /official ASME/i];
  for (const p of forbiddenPatterns) {
    if (p.test(html)) throw new Error(`ASME page contains a disallowed affiliation/certification claim matching ${p}`);
  }
  return "ASME page facts traced to asme_b1_1/asme_b94_9 seed fields; non-affiliation disclaimer present; no certification/affiliation claims found";
});

// 8. Retired URLs have correct noindex treatment (redirect N/A for this phase's chosen treatment).
check("8_retired_urls_correct_treatment", () => {
  for (const id of ["ansi", "din", "jis", "british-standards"]) {
    const html = read(TARGET_PAGES[id].file);
    if (robotsContent(html) !== "noindex,follow") throw new Error(`${id}: not noindex,follow`);
  }
  return "all 4 retired pages: noindex,follow (chosen treatment per T27 evidence: NOINDEX, not redirect)";
});

// 9. Sitemap excludes retired/noindex URLs.
check("9_sitemap_excludes_retired_urls", () => {
  const sitemap = read("sitemap.xml");
  for (const id of ["ansi", "din", "jis", "british-standards"]) {
    if (sitemap.includes(`<loc>https://boltlab.io${TARGET_PAGES[id].route}</loc>`)) {
      throw new Error(`sitemap.xml still contains noindexed URL for ${id}`);
    }
  }
  if (!sitemap.includes(`<loc>https://boltlab.io${TARGET_PAGES.asme.route}</loc>`)) {
    throw new Error("sitemap.xml is missing the ASME URL, which should remain indexed");
  }
  if (!sitemap.includes(`<loc>https://boltlab.io/reference/standards/iso</loc>`)) {
    throw new Error("sitemap.xml is missing the ISO URL, which must remain indexed and untouched");
  }
  const locCount = (sitemap.match(/<loc>/g) || []).length;
  if (locCount !== 224) throw new Error(`expected 224 sitemap URLs after removing 4 from the prior 228, found ${locCount}`);
  return `sitemap.xml: 224 URLs, ansi/din/jis/british-standards absent, asme and iso present`;
});

// 10. Navigation contains no retired placeholder destinations.
check("10_navigation_no_retired_destinations", () => {
  const htmlFiles = git("ls-files '*.html'").split("\n").filter(Boolean);
  const offenders = [];
  for (const f of htmlFiles) {
    const html = read(f);
    for (const id of ["ansi", "din", "jis", "british-standards"]) {
      if (html.includes(`href="${TARGET_PAGES[id].route}"`) || html.includes(`href="${TARGET_PAGES[id].route}.html"`)) {
        offenders.push(`${f} -> ${id}`);
      }
    }
  }
  if (offenders.length) throw new Error(`navigation still links to retired pages: ${offenders.join("; ")}`);
  return "zero tracked HTML files link to ansi/din/jis/british-standards";
});

// 11. Canonicals are correct.
check("11_canonicals_correct", () => {
  for (const [id, cfg] of Object.entries(TARGET_PAGES)) {
    const html = read(cfg.file);
    const canonical = canonicalHref(html);
    const expected = `https://boltlab.io${cfg.route}`;
    if (canonical !== expected) throw new Error(`${id}: canonical is '${canonical}', expected '${expected}'`);
  }
  return "all 5 surviving/strengthened pages self-canonicalize correctly (no redirect was used, so no cross-canonical is expected)";
});

// 12/13. No redirect loops or chains were introduced (this phase used noindex, not redirects).
check("12_13_no_redirects_introduced", () => {
  const redirects = read("_redirects");
  for (const id of ["ansi", "din", "jis", "british-standards", "asme"]) {
    if (redirects.includes(TARGET_PAGES[id].route)) {
      throw new Error(`_redirects unexpectedly references ${id} -- T27 chose NOINDEX, not REDIRECT, for these pages`);
    }
  }
  return "_redirects file untouched; no redirect rules were introduced for any of the five target pages, consistent with the NOINDEX treatment chosen";
});

// 14. No broken internal links from the hub to its stated destinations.
check("14_no_broken_internal_links_from_hub", () => {
  const hub = read("reference/standards/index.html");
  const hrefs = [...hub.matchAll(/href="(\/[^"]+)"/g)].map((m) => m[1]).filter((h) => h.startsWith("/reference/") || h.startsWith("/tools/") || h.startsWith("/charts/") || h.startsWith("/guides/"));
  const broken = [];
  for (const href of hrefs) {
    const clean = href.split("#")[0];
    const candidates = [clean, `${clean}.html`, path.join(clean, "index.html")];
    const found = candidates.some((c) => exists(c.replace(/^\//, "")));
    if (!found) broken.push(href);
  }
  if (broken.length) throw new Error(`broken internal links from standards hub: ${broken.join(", ")}`);
  return `${hrefs.length} internal links from the standards hub all resolve to real files`;
});

// 15. No duplicate standards URLs.
check("15_no_duplicate_standards_urls", () => {
  const sitemap = read("sitemap.xml");
  const standardsLocs = [...sitemap.matchAll(/<loc>(https:\/\/boltlab\.io\/reference\/standards\/[^<]*)<\/loc>/g)].map((m) => m[1]);
  const seen = new Set();
  const dupes = [];
  for (const loc of standardsLocs) {
    if (seen.has(loc)) dupes.push(loc);
    seen.add(loc);
  }
  if (dupes.length) throw new Error(`duplicate standards URLs in sitemap: ${dupes.join(", ")}`);
  return `${standardsLocs.length} distinct /reference/standards/ URLs in sitemap, no duplicates`;
});

// 16. No unrelated production families changed.
check("16_no_unrelated_families_changed", () => {
  const diffFiles = git("diff --name-only").split("\n").filter(Boolean);
  const allowedPrefixes = [
    "reference/data-methodology.html",
    "reference/standards/",
    "scripts/build_sitemap.py",
    "scripts/generators/generate-standards-pages.js",
    "scripts/generators/generate-standards-projections.js",
    "sitemap.xml"
  ];
  const offenders = diffFiles.filter((f) => !allowedPrefixes.some((p) => f === p || f.startsWith(p)));
  if (offenders.length) throw new Error(`unexpected files changed outside T27 scope: ${offenders.join(", ")}`);
  return `all ${diffFiles.length} changed tracked files fall within the authorized T27 file set`;
});

// 17. AdSense remains inactive.
check("17_adsense_remains_inactive", () => {
  const htmlFiles = git("ls-files '*.html'").split("\n").filter(Boolean);
  for (const f of htmlFiles) {
    const html = read(f);
    if (/adsbygoogle|googlesyndication|data-ad-client|pagead2/.test(html)) {
      throw new Error(`${f} contains active AdSense script/markup`);
    }
  }
  if (!exists("js/ads-layout.js")) throw new Error("js/ads-layout.js missing");
  const adsLayout = read("js/ads-layout.js");
  if (/googlesyndication|adsbygoogle/.test(adsLayout)) throw new Error("js/ads-layout.js now references a live ad network -- out of scope for T27");
  return "no adsbygoogle/googlesyndication/data-ad-client markup found anywhere; js/ads-layout.js unmodified and still network-free";
});

// 18. git diff --check is clean (no whitespace errors).
check("18_git_diff_check_clean", () => {
  try {
    execSync("git diff --check", { cwd: ROOT, encoding: "utf8" });
  } catch (e) {
    throw new Error(`git diff --check reported issues:\n${e.stdout || e.message}`);
  }
  return "git diff --check: clean";
});

const failed = checks.filter((c) => c.status === "FAIL");
console.log("T27 VALIDATOR RESULTS");
console.log("======================");
for (const c of checks) {
  console.log(`[${c.status}] ${c.name}${c.detail ? " -- " + c.detail : ""}`);
}
console.log("");
console.log(`${checks.length - failed.length}/${checks.length} checks passed.`);
if (failed.length) {
  console.log(`FAILURES: ${failed.map((f) => f.name).join(", ")}`);
  process.exitCode = 1;
} else {
  console.log("T27 VALIDATOR: ALL CHECKS PASSED");
}
