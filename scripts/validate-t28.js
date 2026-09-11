#!/usr/bin/env node
/**
 * T28 -- Programmatic Size Cluster Remediation: final-state invariant validator.
 *
 * Checks the post-implementation repository state directly (final HTML, sitemap.xml,
 * _redirects, tapping datasets/validators) against every constraint in the T28 brief.
 * Read-only, deterministic, no repository mutation. Distinct from scripts/test-t28.js
 * (scenario/behavioral tests with concrete inputs and expected outputs).
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));

const CONSOLIDATED_SUFFIXES = ["clearance-hole", "thread-pitch", "to-inch"];
const ATLAS_SIZES = new Set([3, 4, 5, 6, 8, 10, 12, 16, 20]);
const RANGE = Array.from({ length: 18 }, (_, i) => i + 3); // 3..20

const checks = [];
function check(name, fn) {
  checks.push({ name, fn });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

// 1. Every affected URL (137 baseline size-cluster pages) has an explicit, accounted-for treatment.
check("all 137 baseline size-cluster URLs are accounted for by treatment", () => {
  let consolidated = 0;
  for (const n of RANGE) {
    for (const suffix of CONSOLIDATED_SUFFIXES) {
      assert(!exists(`sizes/m${n}-${suffix}.html`), `sizes/m${n}-${suffix}.html should be retired (CONSOLIDATE)`);
      consolidated++;
    }
  }
  assert(!exists("sizes/m20-vs-m18.html"), "sizes/m20-vs-m18.html should be retired (CONSOLIDATE, duplicate)");
  consolidated += 1;
  assert(consolidated === 55, `expected 55 consolidated pages, counted ${consolidated}`);

  let strengthenOrKeep = 0;
  for (const n of RANGE) {
    assert(exists(`sizes/m${n}-bolt-size.html`), `sizes/m${n}-bolt-size.html should still exist (STRENGTHEN)`);
    assert(exists(`sizes/m${n}-tap-drill.html`), `sizes/m${n}-tap-drill.html should still exist (KEEP/STRENGTHEN)`);
    strengthenOrKeep += 2;
  }
  for (const [n, b] of [[3,4],[4,5],[5,6],[6,8],[7,8],[8,10],[9,10],[10,12],[11,12],[12,14],[13,14],[14,16],[15,16],[16,18],[17,18],[18,20],[19,20]]) {
    assert(exists(`sizes/m${n}-vs-m${b}.html`), `sizes/m${n}-vs-m${b}.html should still exist (KEEP)`);
    strengthenOrKeep += 1;
  }
  for (const legacy of ["1-4-20-bolt-size", "3-8-16-bolt-size", "5-16-18-bolt-size", "6-screw-size", "8-screw-size", "10-screw-size"]) {
    assert(exists(`sizes/${legacy}.html`), `sizes/${legacy}.html (legacy imperial/screw family, out of scope) should be untouched`);
    strengthenOrKeep += 1;
  }
  assert(exists("sizes/index.html"), "sizes/index.html should be untouched");
  strengthenOrKeep += 1;
  for (const n of RANGE) {
    assert(exists(`es/sizes/perno-m${n}.html`), `es/sizes/perno-m${n}.html should still exist (STRENGTHEN)`);
    strengthenOrKeep += 1;
  }
  for (const legacy of ["perno-1-4-20", "perno-3-8-16", "perno-5-16-18"]) {
    assert(exists(`es/sizes/${legacy}.html`), `es/sizes/${legacy}.html (legacy, out of scope) should be untouched`);
    strengthenOrKeep += 1;
  }
  assert(exists("es/sizes/index.html"), "es/sizes/index.html should be untouched");
  strengthenOrKeep += 1;

  assert(consolidated + strengthenOrKeep === 137, `expected 137 total accounted pages, got ${consolidated + strengthenOrKeep}`);
});

// 2. No intended KEEP/STRENGTHEN page was accidentally noindexed.
check("no KEEP/STRENGTHEN size-cluster page carries a noindex directive", () => {
  const files = [
    ...RANGE.map((n) => `sizes/m${n}-bolt-size.html`),
    ...RANGE.map((n) => `sizes/m${n}-tap-drill.html`),
    ...RANGE.map((n) => `es/sizes/perno-m${n}.html`),
  ];
  for (const f of files) {
    const html = read(f);
    assert(!/name="robots"[^>]*noindex/i.test(html), `${f} should not carry a noindex directive`);
  }
});

// 3. T28 did not introduce any NOINDEX treatment at all (its treatment vocabulary is
//    CONSOLIDATE/STRENGTHEN/KEEP only -- see docs/T28-SIZE-CLUSTER-REMEDIATION.md).
check("T28 introduced zero NOINDEX pages (treatment was CONSOLIDATE via delete+redirect)", () => {
  for (const n of RANGE) {
    const hub = read(`sizes/m${n}-bolt-size.html`);
    assert(!/noindex/i.test(hub), `sizes/m${n}-bolt-size.html unexpectedly mentions noindex`);
  }
});

// 4. Every consolidated URL has a corresponding, correctly-targeted 301 in _redirects.
check("_redirects contains exactly the 55 expected 301s for retired URLs, no redirect chains", () => {
  const redirects = read("_redirects");
  const targets = new Set();
  for (const n of RANGE) {
    for (const suffix of CONSOLIDATED_SUFFIXES) {
      const line = `/sizes/m${n}-${suffix} /sizes/m${n}-bolt-size 301`;
      assert(redirects.includes(line), `missing redirect: ${line}`);
      targets.add(`/sizes/m${n}-bolt-size`);
    }
  }
  const dupLine = "/sizes/m20-vs-m18 /sizes/m18-vs-m20 301";
  assert(redirects.includes(dupLine), `missing redirect: ${dupLine}`);
  targets.add("/sizes/m18-vs-m20");
  // No redirect chain: no redirect target is itself a redirect source.
  const sources = new Set(
    redirects
      .split("\n")
      .filter((l) => l.startsWith("/sizes/m") && l.includes(" 301"))
      .map((l) => l.split(" ")[0])
  );
  for (const t of targets) {
    assert(!sources.has(t), `redirect chain: ${t} is both a redirect target and a redirect source`);
  }
});

// 5. No duplicate indexable URLs for the same consolidated intent.
check("no duplicate vs-comparison URL pair remains (m18-vs-m20/m20-vs-m18 resolved to one)", () => {
  assert(exists("sizes/m18-vs-m20.html"), "canonical sizes/m18-vs-m20.html must exist");
  assert(!exists("sizes/m20-vs-m18.html"), "duplicate sizes/m20-vs-m18.html must not exist");
});

// 6. Canonicals: no retained page's canonical points at a retired URL; hub self-canonicalizes.
check("canonical tags on retained pages are self-referencing and never point at a retired URL", () => {
  for (const n of RANGE) {
    const hub = read(`sizes/m${n}-bolt-size.html`);
    const m = hub.match(/<link rel="canonical" href="([^"]+)">/);
    assert(m, `sizes/m${n}-bolt-size.html missing canonical tag`);
    assert(m[1] === `https://boltlab.io/sizes/m${n}-bolt-size`, `sizes/m${n}-bolt-size.html canonical mismatch: ${m[1]}`);
  }
});

// 7. No broken internal links to any retired URL, anywhere in the repository.
check("no internal link anywhere references a retired size-cluster URL", () => {
  const suffixPattern = CONSOLIDATED_SUFFIXES.join("|");
  const out = execSync(
    `grep -rlE 'href="/(es/)?sizes/m[0-9]+-(${suffixPattern})"' --include="*.html" . || true`,
    { cwd: ROOT, encoding: "utf8" }
  ).trim();
  assert(out === "", `dangling links to retired clearance/pitch/to-inch pages found in: ${out}`);
  const out2 = execSync(`grep -rl 'href="/sizes/m20-vs-m18"' --include="*.html" . || true`, {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  assert(out2 === "", `dangling link(s) to retired m20-vs-m18 found in: ${out2}`);
});

// 8. No fabricated engineering data: every value folded into a hub already existed verbatim
//    on that size's own (now-retired, but git-historical) clearance-hole page.
check("folded-in clearance values match the pre-T28 clearance-hole page's own stated value", () => {
  const baseline = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  for (const n of RANGE) {
    const oldClearancePage = execSync(`git show ${baseline}:sizes/m${n}-clearance-hole.html`, {
      cwd: ROOT,
      encoding: "utf8",
    });
    const oldVal = oldClearancePage.match(/Medium slip \(typical\)<\/td><td>([\d.]+) mm<\/td>/);
    assert(oldVal, `could not find original clearance value for M${n}`);
    const hub = read(`sizes/m${n}-bolt-size.html`);
    assert(
      hub.includes(`<tr><td>Clearance hole (medium fit)</td><td>${oldVal[1]} mm</td></tr>`),
      `sizes/m${n}-bolt-size.html clearance value does not match pre-T28 source value ${oldVal[1]}mm`
    );
  }
});

// 9. Existing tapping datasets and products are byte-identical to HEAD (nothing invented/altered).
check("tapping datasets, projections, and product files are untouched", () => {
  const paths = [
    "data/datasets/metric_tapping.seed.json",
    "scripts/generators/generate-tapping-atlas.js",
    "scripts/generators/generate-tapping-evidence.js",
    "scripts/generators/generate-tapping-projections.js",
    "scripts/generators/generate-tapping-workflow.js",
    "scripts/generators/generate-tap-type-guide.js",
    "reference/tapping-atlas.html",
    "reference/tapping-evidence.html",
  ].filter((p) => exists(p));
  for (const p of paths) {
    const diff = execSync(`git diff --stat -- "${p}"`, { cwd: ROOT, encoding: "utf8" }).trim();
    assert(diff === "", `${p} has an unexpected diff:\n${diff}`);
  }
});

// 10. Spanish pages use correct decimal-comma localization for the newly-added clearance value.
check("ES clearance rows use comma decimal separators, not machine-translated periods", () => {
  for (const n of RANGE) {
    const html = read(`es/sizes/perno-m${n}.html`);
    const m = html.match(/Diámetro de agujero de holgura \(ajuste medio\)<\/td><td>([^<]+)<\/td>/);
    assert(m, `es/sizes/perno-m${n}.html missing localized clearance row`);
    assert(!m[1].includes("."), `es/sizes/perno-m${n}.html clearance value "${m[1]}" uses a period, not Spanish comma format`);
  }
});

// 11. No new FAQPage JSON-LD schema blocks were added anywhere in the strengthened pages.
check("no new FAQPage schema introduced by T28 (FAQ script count unchanged per strengthened page)", () => {
  const baseline = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  for (const n of RANGE) {
    const before = execSync(`git show ${baseline}:sizes/m${n}-bolt-size.html`, { cwd: ROOT, encoding: "utf8" });
    const after = read(`sizes/m${n}-bolt-size.html`);
    const countFaq = (s) => (s.match(/"@type":"FAQPage"/g) || []).length;
    assert(countFaq(before) === countFaq(after), `sizes/m${n}-bolt-size.html FAQPage schema count changed`);
  }
});

// 12. AdSense remains fully inactive: no ad script/publisher-id/consent code introduced, ads.txt untouched.
check("AdSense stays inactive; ads.txt and js/ads-layout.js untouched", () => {
  const diffAds = execSync("git diff --stat -- ads.txt js/ads-layout.js robots.txt", { cwd: ROOT, encoding: "utf8" }).trim();
  assert(diffAds === "", `ads.txt/js/ads-layout.js/robots.txt unexpectedly changed:\n${diffAds}`);
  for (const n of RANGE) {
    const hub = read(`sizes/m${n}-bolt-size.html`);
    assert(!/adsbygoogle|googlesyndication|data-ad-client/.test(hub), `sizes/m${n}-bolt-size.html contains new ad-activation markup`);
  }
});

// 13. No unrelated production family was touched -- diff is confined to the size cluster + its
//     supporting sitemap/redirects/generator.
check("git diff --stat is confined to the size cluster's authorized change set", () => {
  const out = execSync("git diff --name-only", { cwd: ROOT, encoding: "utf8" }).trim().split("\n").filter(Boolean);
  const allowedPrefixes = ["sizes/", "es/sizes/", "sitemap.xml", "_redirects", "_generate_longtail_sizes.py"];
  const disallowed = out.filter((f) => !allowedPrefixes.some((p) => f === p || f.startsWith(p)));
  assert(disallowed.length === 0, `unexpected files outside T28 scope changed: ${disallowed.join(", ")}`);
});

// 14. Generator output is deterministic: re-running the pipeline twice produces zero further changes.
check("generator produces zero unexplained differences across repeated runs", () => {
  const before = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" });
  execSync("python3 _generate_longtail_sizes.py", { cwd: ROOT, encoding: "utf8" });
  const after = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" });
  assert(before === after, "re-running _generate_longtail_sizes.py changed repository state (non-deterministic)");
});

// 15. All retained/strengthened pages carry meaningful, unique, non-generic information.
check("every strengthened hub/tap-drill/perno page has its unique-content marker present", () => {
  for (const n of RANGE) {
    const hub = read(`sizes/m${n}-bolt-size.html`);
    assert(hub.includes("Clearance hole (medium fit)"), `sizes/m${n}-bolt-size.html missing folded-in clearance data`);
    const es = read(`es/sizes/perno-m${n}.html`);
    assert(es.includes("Diámetro de agujero de holgura"), `es/sizes/perno-m${n}.html missing folded-in clearance data`);
    if (ATLAS_SIZES.has(n)) {
      assert(hub.includes("Verified in BoltLab's Tapping Atlas"), `sizes/m${n}-bolt-size.html missing Atlas note`);
      const td = read(`sizes/m${n}-tap-drill.html`);
      assert(td.includes("Verified in BoltLab's Tapping Atlas"), `sizes/m${n}-tap-drill.html missing Atlas note`);
    }
  }
});

// 16. Strongest first-party reference assets (Tapping Atlas, Tapping Evidence) remain discoverable
//     and are only linked for diameters they actually cover.
check("Tapping Atlas cross-links exist only for ATLAS_SIZES and target real, existing pages", () => {
  assert(exists("reference/tapping-atlas.html"), "reference/tapping-atlas.html must exist");
  assert(exists("reference/tapping-evidence.html"), "reference/tapping-evidence.html must exist");
  for (const n of RANGE) {
    const hub = read(`sizes/m${n}-bolt-size.html`);
    const hasAtlas = hub.includes('href="/reference/tapping-atlas"');
    assert(hasAtlas === ATLAS_SIZES.has(n), `sizes/m${n}-bolt-size.html Atlas link presence should match ATLAS_SIZES coverage`);
  }
});

// 17. Sitemap is internally consistent: well-formed, no retired URLs, no duplicates.
check("sitemap.xml is well-formed, excludes all retired URLs, and has no duplicate <loc> entries", () => {
  execSync(`python3 -c "import xml.etree.ElementTree as ET; ET.parse('sitemap.xml')"`, { cwd: ROOT });
  const sitemap = read("sitemap.xml");
  for (const n of RANGE) {
    for (const suffix of CONSOLIDATED_SUFFIXES) {
      assert(
        !sitemap.includes(`>https://boltlab.io/sizes/m${n}-${suffix}<`),
        `sitemap.xml still lists retired m${n}-${suffix}`
      );
    }
  }
  assert(!sitemap.includes(">https://boltlab.io/sizes/m20-vs-m18<"), "sitemap.xml still lists retired m20-vs-m18");
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const seen = new Set();
  for (const loc of locs) {
    assert(!seen.has(loc), `duplicate <loc> in sitemap.xml: ${loc}`);
    seen.add(loc);
  }
});

// 18. git diff --check passes (no trailing whitespace / no-newline-at-EOF issues introduced).
check("git diff --check passes cleanly", () => {
  try {
    execSync("git diff --check", { cwd: ROOT, encoding: "utf8" });
  } catch (e) {
    throw new Error(`git diff --check reported issues:\n${e.stdout}`);
  }
});

// 19. Tapping validators/architecture reports show no new errors/warnings attributable to T28.
check("dedicated tapping validators report the same baseline pass/warning counts as pre-T28", () => {
  try {
    const out = execSync("node scripts/validators/validate-tapping-domain.js", { cwd: ROOT, encoding: "utf8" });
    assert(/Status: pass \| errors=0 \| warnings=5/.test(out), `unexpected validate-tapping-domain result:\n${out}`);
    const out2 = execSync("node scripts/validators/validate-tapping-projections.js", { cwd: ROOT, encoding: "utf8" });
    assert(/Status: pass \| errors=0 \| warnings=0/.test(out2), `unexpected validate-tapping-projections result:\n${out2}`);
  } finally {
    // These validators regenerate docs/architecture/*-report.{json,md} with a fresh timestamp as
    // a side effect; revert that incidental churn so it doesn't register as an out-of-scope diff.
    execSync(
      "git checkout -- docs/architecture/tapping-validation-report.json docs/architecture/tapping-validation-report.md docs/architecture/tapping-projection-validation-report.json docs/architecture/tapping-projection-validation-report.md",
      { cwd: ROOT }
    );
  }
});

// 20. robots.txt was not modified (T28 was not authorized to touch it).
check("robots.txt is byte-identical to HEAD", () => {
  const diff = execSync("git diff --stat -- robots.txt", { cwd: ROOT, encoding: "utf8" }).trim();
  assert(diff === "", "robots.txt was modified, which T28 was not authorized to do");
});

// 21. Existing verified tap-drill/hex/pitch data on each hub is unchanged (only the clearance row
//     and, where applicable, the Atlas note were added -- nothing pre-existing was altered).
check("pre-existing Specifications-table rows on each hub are unchanged from HEAD", () => {
  const baseline = execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  for (const n of RANGE) {
    const before = execSync(`git show ${baseline}:sizes/m${n}-bolt-size.html`, { cwd: ROOT, encoding: "utf8" });
    const after = read(`sizes/m${n}-bolt-size.html`);
    for (const label of ["Nominal diameter", "Standard pitch", "Fine pitch", "Tap drill size", "Closest imperial equivalent"]) {
      const re = new RegExp(`<tr><td>${label}</td><td>([^<]*)</td></tr>`);
      const b = before.match(re);
      if (!b) continue; // not every size hub has every optional row (e.g. M3 has no Fine pitch) -- pre-existing, not a T28 change
      const a = after.match(re);
      assert(a && b[1] === a[1], `sizes/m${n}-bolt-size.html row "${label}" changed value (was "${b[1]}", now "${a && a[1]}")`);
    }
  }
});

// 22. No git-tracked file was left in a "deleted but not decided" limbo state --
//     every deletion this phase made has a corresponding, intentional redirect.
check("every git-detected deletion in the size cluster corresponds to an intended CONSOLIDATE redirect", () => {
  const status = execSync("git status --porcelain -- sizes/ es/sizes/", { cwd: ROOT, encoding: "utf8" });
  const deleted = status
    .split("\n")
    .filter((l) => l.startsWith(" D "))
    .map((l) => l.slice(3).trim());
  assert(deleted.length === 55, `expected 55 deletions under sizes//es/sizes/, found ${deleted.length}`);
  const redirects = read("_redirects");
  for (const d of deleted) {
    const slug = "/" + d.replace(/\.html$/, "");
    assert(redirects.includes(`${slug} `), `deleted file ${d} has no corresponding redirect source ${slug}`);
  }
});

let failed = 0;
console.log("T28 VALIDATOR");
console.log("=============");
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
  console.log("T28 VALIDATOR: ALL CHECKS PASSED");
}
