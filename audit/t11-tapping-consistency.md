# T11 — Tapping Product Consistency & Trust Hardening

Baseline commit: `cdbdbb9d2951281300bf469edf9f59dc870365a8` (T10: Add tapping evidence & provenance explorer)

Full structured data: [t11-tapping-consistency.json](t11-tapping-consistency.json)

## 0. T11 Correction — validator check #8 fix

A validator-quality defect was found after the original T11 pass and is corrected here. The original findings below (Sections 1–13) are unchanged from the original pass; this section documents the correction on top of them.

**Root cause.** `scripts/validators/validate-tapping-terminology.js` check #8 ("No fabricated provenance fallback") was meant to enforce that unavailable provenance fields use only an approved fallback string. Its actual condition was `!isTemplateCode && !approvedFallbacks.includes(value) && value === ""` — because of the trailing `value === ""`, the check could only ever fail on an **empty** rendered value. An arbitrary non-empty fabricated string (e.g. `"fabricated-source"`) trivially satisfied `value === ""` as false, so it passed silently regardless of the other conditions. The check did not enforce what its name and comment claimed.

**Correction.** Check #8 was rewritten to resolve every provenance value each product actually exposes and compare it against the authoritative projection data, distinguishing three legitimate cases and failing everything else:

- **A. A resolved value that exactly matches the projection-backed source data.** Atlas statically resolves "Source dataset," "Source record," "Source field," and (where present) "Cross-check" directly into its HTML — each card's provenance block is matched to its `tapping-profiles.json` row by designation and compared field-by-field. Tap-Type Guide statically resolves each fact's `source: ...` — matched to its `tap-types.json` note by fact text and compared.
- **B. An explicitly approved fallback string, used only when the projection genuinely has no value for that field.** Enforced by the same comparison logic: if the projection value is falsy, the rendered value must be one of the three approved strings, or it fails.
- **C. Client-side/template code that is not itself a resolved value.** Workflow and Evidence render provenance in the browser from `js/tapping-workflow-data.js`, not as resolved text in their static HTML — their static markup instead carries JS property-access expressions (`prov.source_dataset`, etc.), which are not resolved values and are never pattern-matched as if they were. Instead, the data file itself — the thing those expressions will actually resolve against at runtime — is parsed and compared directly against `tapping-profiles.json` / `tap-types.json`, without needing to execute a browser. Evidence's specific fallback expressions (`prov.source_dataset || "..."`, etc.) are additionally checked to confirm the fallback literal itself is still one of the three approved strings and the expression hasn't been replaced with a hardcoded value.

**Regression tests (mandatory, all performed via controlled temporary mutation of a working copy, then reverted):**

| Test | Method | Result |
|---|---|---|
| A — fabricated non-empty provenance | Atlas HTML: `Source dataset: metric_threads` → `Source dataset: fabricated-source` | **FAIL** (correctly caught) |
| A (variant) — fabricated value in the data file products render from | `js/tapping-workflow-data.js`: `source_dataset` → `"fabricated-source"` | **FAIL** (correctly caught) |
| A (variant) — fabricated fallback literal in a template expression | Evidence HTML: `prov.source_dataset \|\| "Provenance not available..."` → `\|\| "fabricated-source"` | **FAIL** (correctly caught) |
| B — empty provenance where a real value exists | Atlas HTML: `Source record: M10x1.25` → `Source record: ` | **FAIL** (correctly caught) |
| C — approved fallback where the projection genuinely has no value | Inserted `Cross-check: Provenance not available in the current projection.` on a record whose `cross_check` is null | **PASS** (correctly accepted) |
| C (contrast) — non-approved fallback in the same genuinely-absent case | Same insertion point, `Cross-check: fabricated-source` | **FAIL** (correctly caught) |
| D — valid projection-backed provenance (restored) | Reverted all mutations | **PASS**, file confirmed byte-identical to the pre-mutation checksum |
| E — template/client-side expression must not falsely fail | Inserted a benign JS comment mentioning "Source dataset: prov.source_dataset" into Workflow (which renders no resolved provenance text at all) | **PASS**, confirming the check doesn't blindly pattern-match "Source X:" text across arbitrary product code |

All temporary mutations were reverted; every affected file (`reference/tapping-atlas.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `js/tapping-workflow-data.js`) was confirmed byte-identical to its post-original-T11 checksum after reverting.

**Product/projection integrity.** The corrected check ran clean against the real, unmutated products on first execution (0 errors). **No genuine provenance defect was found in any product or in `data/projections/tapping/*.json`** — nothing beyond the validator itself required correction.

## 1. Scope

Terminology/consumer-consistency pass across the tapping product chain:

- `/reference/tapping-atlas` (T4)
- `/reference/tap-type-guide` (T5)
- `/tools/tapping-workflow` (T8), including its T9 comparison mode
- `/reference/tapping-evidence` (T10)
- `/tools/tap-drill-calculator` (overlap only)
- `/downloads/tapping-atlas.csv` (protected artifact — see Section 5)

No new pages, no new data, no knowledge-layer or T3 projection changes. All corrections were either (a) generator fixes that were regenerated into their HTML output, or (b) a validator update to match corrected wording.

## 2. Known ISO wording issue (Section 2 of the brief)

**Found:** Yes, in both places named in the brief.

| Location | Context | Status |
|---|---|---|
| `generate-tapping-atlas.js:104` (`driveConventionLabel`) | HTML card display, every metric record | Corrected |
| `generate-tapping-atlas.js:215` | FAQ answer prose ("...in its own convention (ISO 2306 for metric...)") | Corrected |
| `generate-tapping-atlas.js:416` | Data-interpretation prose | Corrected |
| `generate-tapping-atlas.js:589` (`renderCsv`) | CSV `primary_drill_convention` column | **Intentionally left unchanged** (protected artifact, see Section 5) |
| `generate-tapping-workflow.js:334` (`conventionLabel`) | Client-side result display | Corrected |
| `generate-tapping-workflow.js:394` (`isoAlternativeCell`) | T9 comparison table, metric-record "Not applicable" cell | Corrected |

**Root cause:** only 9 of the 14 metric tapping profiles have projection-backed ISO 2306 cross-verification (`tap_drill.provenance.cross_check` present, confirmed directly against `data/projections/tapping/tapping-profiles.json`); the other 5 are source-bound. Labeling *every* metric record's primary tap-drill convention as "ISO 2306 metric convention" overclaimed verification status for those 5. The safer, uniformly-accurate "Metric drill convention" (T10's own established wording) is now used everywhere in UI/HTML text.

**Corrected:** Yes, in the Atlas and Workflow generators, then regenerated into `reference/tapping-atlas.html` and `tools/tapping-workflow.html`.

## 3. Terminology matrix

Full row-by-row detail (old wording, new wording, per-product breakdown) is in [t11-tapping-consistency.json](t11-tapping-consistency.json) under `terminology_matrix`. Summary:

| # | Category | Drift found? | Correction |
|---|---|---|---|
| A | Verified | No | — |
| B | Source-bound | No | — |
| C | Overall record status | **Yes** | Atlas + Workflow said "Overall profile status"; Evidence and Workflow's own comparison table said "Overall record status" (an intra-page inconsistency in Workflow itself). Standardized to "Overall record status" everywhere. |
| D | Tap-drill verification status | No | — |
| E | ISO 2306 alternative drill | No | Already correctly scoped to Concept B everywhere. |
| F | Primary tap-drill value | No | Label itself consistent; see G for its convention sub-label. |
| G | Metric drill convention | **Yes** | The known issue — see Section 2. |
| H | General taxonomy | No | No plural form applies. |
| I | Manufacturing characteristic | **Yes** | Atlas, Tap-Type Guide, and Workflow rendered this as a singular section heading; Evidence (T10) already used the plural form the brief's Section 8 freezes ("Manufacturing characteristics"). Standardized to plural everywhere. |
| J | Typical application | **Yes** | Same pattern as I — standardized to "Typical applications". |
| K | Manufacturer-specific recommendation | **Yes** | Same pattern as I — standardized to "Manufacturer-specific recommendations". |
| L | Thread engagement limitation | No (reviewed) | See Section 6, "intentionally unchanged." |
| M | Provenance | No | "Source dataset/record/field" identical in Atlas and Evidence (the only two products that expose it). |
| N | Cross-verification | No (reviewed) | See Section 6. |
| O | Standards | No | Every standard shown on an Atlas record is present in the record's own projection data (validator-checked). |

## 4. Verification, provenance, tap-type, engagement, and standards terminology (Sections 4–10 of the brief)

- **Verification terminology:** "Verified" / "Source-bound" used consistently; no instance of "Confirmed," "Validated," "Accurate," or unsupported "Official" anywhere in the five products (checked by direct grep and by the new validator).
- **Field-level vs. record-level:** confirmed distinct everywhere; no product implies the 29 overall records are verified. Authoritative counts reconfirmed directly from the projection: tap-drill 9 verified / 20 source-bound; overall records 0 verified / 29 source-bound; tap-type facts 1 verified / 15 source-bound.
- **ISO 2306 Concept A vs. Concept B:** never merged. No instance of "the correct value," "the preferred value," "the replacement value," or "the converted value" describing the ISO alternative.
- **Cross-verification vs. provenance:** kept distinct in both products that expose it (Atlas, Evidence); see Section 6 for the one reviewed structural difference left as-is.
- **Provenance terminology:** `source_dataset`/`source_record`/`source_field` semantics unchanged; user-facing "Source dataset/record/field" wording unchanged; no "Primary source" or "Official source" introduced.
- **Tap-type classifications:** all four classifications present and correctly labeled everywhere they have facts (validator-checked fact-by-fact); the NASA-STD-5020A bottoming-tap fact is untouched, still labeled Verified.
- **Engagement language:** no instance of 75%/70%/77%, "minimum/recommended engagement percentage," or "minimum engagement length" anywhere in any of the five products.
- **Standards language:** no blanket claims ("ISO 2306 governs all tapping," etc.); every standard shown on an Atlas record traced back to that record's own projection data.

## 5. CSV protected-artifact exception

`downloads/tapping-atlas.csv` is listed in the brief's regression rule as a file T11 must not alter. Its `primary_drill_convention` column literally contains the "ISO 2306 metric convention" text targeted by the known-issue fix, which created a direct conflict: the Atlas generator's `driveConventionLabel` function fed both the HTML card display and the CSV column.

**Resolution:** split the function in two — `driveConventionLabel` (now returns "Metric drill convention," used only for the HTML card) and a new `csvDriveConventionLabel` (reproduces the original text exactly, used only in `renderCsv`). The CSV was regenerated and confirmed **byte-identical** to its pre-T11 checksum. This is a deliberate, documented exception, not an oversight — the new terminology validator (Section 7) emits an informational warning noting it on every run so it stays visible.

## 6. Intentionally unchanged

1. **Engagement-language phrasing difference (Atlas vs. Workflow/Evidence/Comparison).** Workflow, Comparison, and Evidence use the Section 9 frozen sentence verbatim: *"Thread engagement calculation is not currently available in BoltLab's verified dataset."* Atlas instead uses a longer, established (T4/T7) explanation of the radial/axial split, which is accurate to the projection's `engagement.radial.calculation_status = "calculable"` / `engagement.axial.calculation_status = "not_calculable"` fields. Both are individually correct; forcing identical wording would either delete accurate nuance from Atlas or expand Workflow/Evidence's scope — neither is a terminology correction, so left as-is.
2. **Atlas's flat provenance list vs. Evidence's two-section Provenance/Cross-verification split.** Both keep original-source and cross-check evidence distinctly labeled; Section 6 explicitly permits a product not to expose the same structural depth as another, and Section 6 forbids adding new claims solely for parity.
3. **CSV `primary_drill_convention` wording** — see Section 5.

## 7. New terminology-consistency validator

`scripts/validators/validate-tapping-terminology.js` was created (no existing validator covered this). It checks, at minimum, all nine categories required by Section 19:

1. "ISO 2306 metric convention" in a UI context without record-specific ISO 2306 backing
2. / 3. "verified"/"source-bound" swapped relative to the projection, and forbidden verification synonyms (Confirmed/Validated/Accurate/Official)
4. Missing tap-type classification labels (exact plural form required for the heading, per Section 8)
5. / 6. Unsupported engagement percentages or lengths
7. ISO alternative merged with the primary tap-drill value
8. Fabricated provenance fallback
9. Standards displayed without projection backing

It was verified to actually catch regressions (not just pass vacuously) by temporarily reintroducing the old "ISO 2306 metric convention" wording and the old singular classification heading, confirming both trigger a failure, then reverting.

## 8. Validator results

| Validator | Status |
|---|---|
| validate-knowledge-engine | pass |
| validate-tapping-domain | pass (0 errors, 5 pre-existing warnings unrelated to T11) |
| validate-projections | pass |
| validate-tapping-projections | pass |
| validate-tapping-atlas | pass (0 errors — updated to expect "Overall record status" and plural classification headings) |
| validate-tap-type-guide | pass |
| validate-tapping-workflow | pass |
| validate-tapping-evidence | pass |
| **validate-tapping-terminology (new; check #8 corrected — see Section 0)** | pass (0 errors, 1 informational warning re: the CSV exception) |

## 9. Site-wide QA

| Check | Result |
|---|---|
| JSON-LD parse errors (site-wide, 228 HTML files) | 0 |
| Duplicate `<title>` | 0 |
| Duplicate meta descriptions | 0 |
| Broken internal links | 0 |
| Orphan pages | 0 |
| Canonical mismatches | 0 |
| Sitemap coverage gaps | 0 |
| `.html` internal hrefs | 0 |
| FAQ identity (JSON-LD vs. visible) on the 4 touched tapping pages | 0 mismatches |

A naive whole-site FAQ scan (assuming every page wraps its FAQ in `<section id="faq">`) flagged 195 unrelated, pre-existing pages (sizes/, charts/, screw-identifier, etc.) that use a different FAQ markup convention without that wrapper. These predate T11, were not touched by T11, and were already covered by the D1-phase FAQ audit (`audit/d1-6-faq-integrity.md`). None of the 4 T11-touched pages are among them — each was independently confirmed via its own per-product validator's exact-match FAQ check.

## 10. Determinism

`generate-tapping-atlas.js`, `generate-tapping-workflow.js`, and `generate-tap-type-guide.js` were each run three times; output was byte-identical across all three runs for every file they produce (`reference/tapping-atlas.html`, `downloads/tapping-atlas.csv`, `tools/tapping-workflow.html`, `js/tapping-workflow-data.js`, `reference/tap-type-guide.html`). `generate-tapping-evidence.js` (untouched) was also re-run and confirmed to produce a byte-identical `reference/tapping-evidence.html`.

Three validator runs (`validate-knowledge-engine`, `validate-projections`, `validate-tapping-domain`) produced only a `Generated: <timestamp>` diff in their reports with no content change — these were reverted per the Section 20 rule, since they are unrelated to T11 and not part of its intentional audit output.

## 11. Regression checksums

| File | Before | After | Changed? |
|---|---|---|---|
| `data/projections/tapping/tapping-profiles.json` | `f9739e1d...` | `f9739e1d...` | No |
| `data/projections/tapping/tap-types.json` | `63867da5...` | `63867da5...` | No |
| `reference/tapping-atlas.html` | `d2558bb4...` | `37b35984...` | **Yes** (approved) |
| `reference/tap-type-guide.html` | `5cf7b05a...` | `08a0a55a...` | **Yes** (approved) |
| `reference/tapping-evidence.html` | `24af8fd7...` | `24af8fd7...` | No |
| `tools/tapping-workflow.html` | `36320075...` | `477ba7a3...` | **Yes** (approved) |
| `js/tapping-workflow-data.js` | `d0907160...` | `d0907160...` | No |
| `downloads/tapping-atlas.csv` | `3a391f37...` | `3a391f37...` | No (protected artifact confirmed frozen) |

Full checksums in [t11-tapping-consistency.json](t11-tapping-consistency.json).

## 12. Product-by-product notes

- **Atlas:** verification labels, ISO alternative wording, standards wording, provenance wording all reviewed and confirmed consistent. Convention label, record-status label, and classification headings corrected as described above.
- **Tap-Type Guide:** classification headings corrected (plurality). NASA-STD-5020A fact, verification terminology, evidence-kind terminology, manufacturer-specific wording all reviewed and unchanged (already correct).
- **Workflow:** convention label, record-status label, classification headings, and the T9 comparison metric-branch cell text corrected. Engagement limitation, standards, and remaining tap-type labels reviewed and unchanged.
- **Comparison (inside Workflow):** ISO alternative cell text corrected (metric branch only); verified/source-bound distinction, unavailable states, and engagement wording reviewed and unchanged.
- **Evidence:** used as the T10 baseline for preferred terminology; not modified.
- **Tap Drill Calculator:** reviewed for overlapping terminology only, per the brief. It is a standalone, non-projection-backed calculator that makes no verification, ISO-2306, or engagement-percentage claims — no overlap found, no changes made, not redesigned.

## 13. Stop condition

**T11 CORRECTION STATUS: READY FOR REVIEW**

Nothing was committed or pushed. T12 was not started.
