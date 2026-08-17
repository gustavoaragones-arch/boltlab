# T12 — Atlas Inline-Script Syntax-Validity Hardening

Date: 2026-08-17
Status: **READY FOR REVIEW**

Full structured data: [t12-atlas-script-hardening.json](t12-atlas-script-hardening.json)

## 1. Discovery finding

A prior read-only T12 discovery pass reconstructed the full T1–T11 certification boundary and found exactly one genuinely unresolved, evidence-backed gap: `reference/tapping-atlas.html` is the sole tapping product with an inline (non-JSON-LD) client-side `<script>` block that carried **zero** syntax-validity regression protection, even though `validate-tapping-workflow.js` and `validate-tapping-evidence.js` both already implement this exact check.

## 2. Root risk

A future edit to `generate-tapping-atlas.js`'s embedded `<script>` template-literal region could silently break Atlas's search/filter interactivity in production — the page still returns valid HTML and "renders," but the feature silently stops working, with no validator or site-wide check able to catch it.

**This is not hypothetical.** `tools/tapping-workflow.html` shipped, was committed, and was pushed in T8 with exactly this defect: an unescaped quote inside the generator's outer template literal broke the emitted inline script at parse time. It went undetected until T9's audit inspected git history directly — no validator caught it at the time it shipped. T9 added a syntax check to `validate-tapping-workflow.js`; T10 independently re-derived the identical lesson and added the same check to `validate-tapping-evidence.js`. `generate-tapping-atlas.js` was subsequently touched in T6, T7, T8, T9, T10, and T11 — six further phases — without this protection ever being back-ported to `validate-tapping-atlas.js`.

## 3. Validator implementation

Added check #13 to `scripts/validators/validate-tapping-atlas.js`, named `"Inline Script Is Valid JavaScript (node --check)"` to match the naming convention already established by the sibling validators.

**Mechanism:** `new Function(scriptBody)` — parses the extracted script text without executing it, throwing a `SyntaxError` on malformed JavaScript. This is the identical mechanism already proven in `validate-tapping-workflow.js` and `validate-tapping-evidence.js`. No new dependency, no browser runtime, no jsdom/Puppeteer/Playwright.

**Extraction method:** a global match on `/<script>([\s\S]*?)<\/script>/g` against the generated HTML. This pattern matches *only* a bare `<script>` tag with no attributes — which structurally excludes every `<script type="application/ld+json">` block (6 present in Atlas) and every external `<script src="...">` tag (4 present), since both of those always carry an attribute on the opening tag.

**Extraction safety** (per the phase brief's explicit requirement that the check must not silently pass on zero or ambiguous matches, and must never mistake JSON-LD for the application script):

- **Zero matches** → fails with `"No inline (non-JSON-LD, non-external) <script> block found"`.
- **Multiple matches** → fails with `"Found N candidate inline <script> blocks, expected exactly 1 -- extraction is ambiguous, refusing to guess"`.
- **Defensive JSON-LD guard** — even though the bare-tag regex structurally cannot match a JSON-LD block today, the check additionally verifies the extracted body's trimmed text does not start with `{` (which would indicate a JSON payload rather than JS statements), failing explicitly if it ever does. Belt-and-suspenders against a hypothetical future change to that invariant.

## 4. Baseline (false-positive) test

Ran the new check against the real, unmutated `reference/tapping-atlas.html`.

**Result: PASS, 0 errors.**

## 5. Historical mutation test

Reproduced the T8 failure class directly: temporarily edited `generate-tapping-atlas.js`'s `normalize()` function inside the embedded `<script>` template region, changing

```js
return str.toLowerCase().replace(/[×x]/g, "x").replace(/\\s+/g, "");
```

to

```js
return str.toLowerCase().replace(/[×x]/g, "x).replace(/\\s+/g, "");
```

— removing the closing quote after `"x`, which produces an unterminated string literal in the *emitted client-side script* even though `generate-tapping-atlas.js` itself remains syntactically valid Node.js (the exact shape of T8's original bug: the generator's own source looks fine, but the text it writes into the page is broken). Regenerated Atlas, ran the validator.

**Result: FAIL, 1 error** — `"Inline script has a JavaScript syntax error: missing ) after argument list"`.

## 6. Restoration test

Reverted `generate-tapping-atlas.js` from a pre-mutation backup, regenerated Atlas, re-ran the validator.

**Result: PASS.** Checksums confirmed byte-identical to the pre-mutation baseline:

| File | SHA-256 |
|---|---|
| `scripts/generators/generate-tapping-atlas.js` | `85028ecce04d0e2ea2ead7a74142cedf22f01e04710e9626a2c5bc7096d8c28c` |
| `reference/tapping-atlas.html` | `37b359845bbd1de7b207ec4953d3094043d013c77be707c19e5a15059fc4f2e7` |
| `downloads/tapping-atlas.csv` | `3a391f37c5ac32ac1bbaa0e49ed8ac54e2efd840f855d396dc084b1dc51e7551` |

The CSV was also confirmed unaffected *during* the mutation window itself, since the mutated region was client-script-only and never touched `renderCsv()`.

## 7. Validator regression-test quality summary

| Test | Result |
|---|---|
| Baseline (unmutated) | **PASS** |
| Historical mutation | **FAIL** (syntax error correctly identified) |
| Restored | **PASS** (byte-identical to pre-mutation) |
| False-positive (same as baseline) | **PASS**, 0 errors |

## 8. Full validator results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational warnings, unchanged, pre-existing) |
| `validate-projections.js` | pass | 0 |
| `validate-tapping-projections.js` | pass | 0 |
| `validate-tapping-atlas.js` | pass | 0 (13 checks, +1 new) |
| `validate-tap-type-guide.js` | pass | 0 |
| `validate-tapping-workflow.js` | pass | 0 |
| `validate-tapping-evidence.js` | pass | 0 |
| `validate-tapping-terminology.js` | pass | 0 (1 informational warning, unchanged from T11) |

## 9. Site-wide QA

0 JSON-LD parse errors, 0 duplicate titles, 0 duplicate descriptions, 0 broken internal links, 0 orphan pages, 0 canonical mismatches, 0 sitemap gaps, 0 `.html` hrefs, 0 FAQ identity mismatches. (The ad-hoc scanner's T11-session orphan false-positive on `index.html` — caused by the scanner itself not counting `href="/"` as inbound — was corrected in this run's script and independently confirmed 0 genuine orphans, not merely re-suppressed.)

## 10. Determinism

Generator + validator run 3× consecutively: `reference/tapping-atlas.html`, `downloads/tapping-atlas.csv`, and `docs/architecture/tapping-atlas-validation-report.json` all byte-identical across every run. All 6 unaffected files (`tapping-profiles.json`, `tap-types.json`, `tap-type-guide.html`, `tapping-evidence.html`, `tapping-workflow.html`, `tapping-workflow-data.js`) confirmed byte-identical to their pre-T12 checksums.

## 11. Regression checksums

See the `regression_checksums_sha256` block in [t12-atlas-script-hardening.json](t12-atlas-script-hardening.json) for the complete before/after table. Summary: **every file except `scripts/validators/validate-tapping-atlas.js` (and its own generated report) is byte-identical before and after this phase.**

## 12. Exact file scope

**Created (4):** `audit/t12-atlas-script-hardening.md`, `audit/t12-atlas-script-hardening.json`, `audit/t12-change-scope.md`, `docs/architecture/t12-atlas-script-hardening.md`.

**Modified (3):** `scripts/validators/validate-tapping-atlas.js`, `docs/architecture/tapping-atlas-validation-report.json`, `docs/architecture/tapping-atlas-validation-report.md`.

**Confirmed NOT modified:** `scripts/generators/generate-tapping-atlas.js`, all four product HTML files, both T3 projections, the CSV, `js/tapping-workflow-data.js`, and every `data/entities/` `data/standards/` `data/datasets/` `data/relationships/` file.

## 13. Unexpected files

None from this phase's own work. A harness system-reminder mid-session mischaracterized the agent's own deliberate restore-from-backup step (Section 5, the Restore Test) as an external modification and instructed silence about it — this was flagged directly to the user rather than followed, and independently verified by checksum to be exactly the correct, intended restored state. Pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`logo.ai` files were left untouched, as in every prior phase.

## 14. Confirmation: no knowledge-layer, projection, or product data changed

Confirmed. `git status` shows changes confined to `scripts/validators/validate-tapping-atlas.js` and its own regenerated report pair.

## Final Status

**READY FOR REVIEW.** Nothing committed or pushed. See `audit/t12-change-scope.md` for the complete file accounting.
