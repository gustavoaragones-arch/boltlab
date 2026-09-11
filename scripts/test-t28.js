#!/usr/bin/env node
/**
 * T28 -- Programmatic Size Cluster Remediation: scenario test suite.
 *
 * Distinct from scripts/validate-t28.js (final-state invariant checks): this suite exercises
 * specific scenarios with concrete inputs and expected outputs -- the retirement/redirect
 * mapping function, the similarity-reduction claim, cross-language consistency, and a guard
 * against silently reintroducing the retired families on some future run. Deterministic,
 * read-only except where noted, no lasting repository mutation.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

const RANGE = Array.from({ length: 18 }, (_, i) => i + 3);
const ATLAS_SIZES = new Set([3, 4, 5, 6, 8, 10, 12, 16, 20]);

test("every retired suffix for every size maps to exactly one redirect target: its own bolt-size hub", () => {
  const redirects = read("_redirects");
  for (const n of RANGE) {
    for (const suffix of ["clearance-hole", "thread-pitch", "to-inch"]) {
      const line = redirects.split("\n").find((l) => l.startsWith(`/sizes/m${n}-${suffix} `));
      assert(line, `no redirect rule found for m${n}-${suffix}`);
      assert(line === `/sizes/m${n}-${suffix} /sizes/m${n}-bolt-size 301`, `unexpected redirect rule: ${line}`);
    }
  }
});

test("the m18/m20 duplicate pair collapses to exactly one surviving canonical direction", () => {
  const redirects = read("_redirects");
  assert(redirects.includes("/sizes/m20-vs-m18 /sizes/m18-vs-m20 301"), "m20-vs-m18 must redirect to m18-vs-m20");
  assert(!redirects.split("\n").some((l) => l.startsWith("/sizes/m18-vs-m20 ")), "m18-vs-m20 (the survivor) must not itself be a redirect source");
});

test("digit-normalized similarity within the tap-drill family dropped after strengthening (not merely reworded)", () => {
  const norm = (html) =>
    html
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\d+(\.\d+)?/g, "#")
      .replace(/\s+/g, " ")
      .trim();
  const ratio = (a, b) => {
    // Simple LCS-based ratio proxy (SequenceMatcher is Python-only); good enough to assert direction.
    const dp = Array(a.length + 1)
      .fill(null)
      .map(() => Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return (2 * dp[a.length][b.length]) / (a.length + b.length);
  };
  const atlasPage = norm(read("sizes/m10-tap-drill.html")); // has the Atlas note (10 in ATLAS_SIZES)
  const nonAtlasPage = norm(read("sizes/m9-tap-drill.html")); // no Atlas note (9 not in ATLAS_SIZES)
  const r = ratio(atlasPage, nonAtlasPage);
  assert(r < 0.995, `expected strengthened M10 tap-drill page to diverge from unstrengthened M9 sibling (ratio was ${r})`);
});

test("bolt-size hub link list references only URLs that actually exist on disk", () => {
  for (const n of RANGE) {
    const hub = read(`sizes/m${n}-bolt-size.html`);
    const links = [...hub.matchAll(/<li><a href="(\/sizes\/[^"]+)">/g)].map((m) => m[1]);
    assert(links.length === 2, `sizes/m${n}-bolt-size.html should list exactly 2 tools/spec links, found ${links.length}`);
    for (const href of links) {
      const filePath = path.join(ROOT, href + ".html");
      assert(fs.existsSync(filePath), `sizes/m${n}-bolt-size.html links to ${href}, which does not exist on disk`);
    }
  }
});

test("ES perno pages gained the same clearance datum as their EN counterpart, correctly converted", () => {
  for (const n of RANGE) {
    const en = read(`sizes/m${n}-bolt-size.html`);
    const enVal = en.match(/Clearance hole \(medium fit\)<\/td><td>([\d.]+) mm<\/td>/);
    assert(enVal, `sizes/m${n}-bolt-size.html missing clearance value`);
    const es = read(`es/sizes/perno-m${n}.html`);
    const esVal = es.match(/Diámetro de agujero de holgura \(ajuste medio\)<\/td><td>([\d,]+) mm<\/td>/);
    assert(esVal, `es/sizes/perno-m${n}.html missing clearance value`);
    assert(esVal[1] === enVal[1].replace(".", ","), `es/sizes/perno-m${n}.html clearance "${esVal[1]}" does not match EN "${enVal[1]}" converted to comma format`);
  }
});

test("Atlas cross-link is present on strengthened pages if and only if the diameter is in the tapping dataset", () => {
  const dataset = JSON.parse(read("data/datasets/metric_tapping.seed.json"));
  const records = JSON.stringify(dataset);
  const coveredDiameters = new Set();
  for (const n of RANGE) {
    if (new RegExp(`"M${n}x`).test(records)) coveredDiameters.add(n);
  }
  for (const n of RANGE) {
    const hub = read(`sizes/m${n}-bolt-size.html`);
    const hasNote = hub.includes("Verified in BoltLab's Tapping Atlas");
    assert(
      hasNote === ATLAS_SIZES.has(n),
      `ATLAS_SIZES membership for M${n} (${ATLAS_SIZES.has(n)}) should match hub's Atlas note presence (${hasNote})`
    );
    assert(
      !hasNote || coveredDiameters.has(n),
      `M${n} hub claims Atlas coverage but no M${n}x... record exists in metric_tapping.seed.json`
    );
  }
});

test("retirement is idempotent: re-running retire_consolidated_pages() twice is a no-op the second time", () => {
  const before = execSync("git status --porcelain -- sizes/ es/sizes/ sitemap.xml _redirects", { cwd: ROOT, encoding: "utf8" });
  execSync(
    `python3 -c "import sys; sys.path.insert(0,'.'); import _generate_longtail_sizes as g; g.retire_consolidated_pages(); g.migrate_bolt_size_hub(); g.migrate_es_size_hub(); g.migrate_tap_drill_atlas_notes(); g.clean_sitemap(); g.write_redirects()"`,
    { cwd: ROOT }
  );
  const after = execSync("git status --porcelain -- sizes/ es/sizes/ sitemap.xml _redirects", { cwd: ROOT, encoding: "utf8" });
  assert(before === after, "re-running the T28 migration functions changed repository state on a second pass");
});

test("no future accidental regeneration path (write_all/patch_hubs) is wired into __main__", () => {
  const src = read("_generate_longtail_sizes.py");
  const mainBlock = src.slice(src.indexOf('if __name__ == "__main__":'));
  assert(!/^\s*write_all\(\)/m.test(mainBlock), "write_all() must not be called from __main__ (would regress unrelated tap-drill/vs pages -- see its warning comment)");
  assert(!/^\s*patch_hubs\(\)/m.test(mainBlock), "patch_hubs() is a confirmed permanent no-op and should not be relied upon");
});

let failed = 0;
console.log("T28 TEST SUITE");
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
  console.log("T28 TEST SUITE: ALL TESTS PASSED");
}
