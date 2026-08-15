# T4 — Tapping Atlas / Data Product

Date: 2026-08-15
Status: **READY FOR REVIEW**

Built against the corrected T3 projection, commit `17aab2876b70f5e6655541bb4bb98daa7d67bbed`. Every count below was re-derived mechanically by `scripts/validators/validate-tapping-atlas.js` directly from the generated artifacts — not copied from narrative or memory, per your explicit instruction after the T3 incident.

## 1. Product URL

`https://boltlab.io/reference/tapping-atlas` (no trailing slash — see Deferred Findings §16 for a discrepancy worth your confirmation).

## 2–3. Files Created / Incorporated From Paused State

| File | Status |
|---|---|
| `scripts/generators/generate-tapping-atlas.js` | Paused work, resumed — 2 bugs found and fixed (see §18) |
| `reference/tapping-atlas.html` | Paused work, regenerated against corrected projection |
| `downloads/tapping-atlas.csv` | Paused work, regenerated against corrected projection |
| `css/styles.css` (badge CSS addition) | Paused work, inspected, kept as-is (correct, no changes needed) |
| `scripts/validators/validate-tapping-atlas.js` | New this session |
| `docs/architecture/tapping-atlas-product.md` | New this session |
| `docs/architecture/tapping-atlas-validation-report.json`/`.md` | New this session (validator output) |
| `audit/t4-tapping-atlas.md`/`.json` | New this session |
| `audit/t4-change-scope.md` | New this session |

## 4. Data Source Chain

```
data/projections/tapping/tapping-profiles.json  (T3, corrected, commit 17aab28)
data/projections/tapping/tap-types.json         (T3, unaffected by the correction)
        ↓
scripts/generators/generate-tapping-atlas.js    (reads ONLY the two files above)
        ↓
reference/tapping-atlas.html  +  downloads/tapping-atlas.csv
```

No raw dataset (`metric_threads.seed.json`, `unc.seed.json`, etc.) or entity/standard file is read by the T4 generator at any point.

## 5–7. Record, Verification, and ISO-Alternative Counts

| Metric | Value | Source |
|---|---|---|
| Total tapping profiles | 29 | Projection row count |
| Metric | 14 | |
| UNC | 8 | |
| UNF | 7 | |
| Tap types | 7 | |
| Tap-drill verified | 9 | `tap_drill.status === "verified"` |
| Tap-drill source-bound | 20 | `tap_drill.status === "source_bound"` |
| Overall record status verified | 0 | `data_quality.record_status` |
| Overall record status source-bound | 29 | |
| ISO 2306 alternatives | 15 | Present only on UNC/UNF rows, confirmed `null` on all 14 metric rows |

## 8. Engagement Representation

No numeric engagement value — target percentage or axial length — appears anywhere in the generated HTML or CSV. The dedicated validator greps the full output for `75%`, `75 percent`, `70%`, `77%`, `1×/1.5×/2× diameter` and found zero matches. The "Thread engagement" section uses one fixed, non-per-record sentence describing capability, not a recommendation.

## 9. Tap-Type Representation

All 7 tap types rendered with T2.2's classification preserved as three separate lists (manufacturing characteristics / typical applications / manufacturer-specific recommendations), each fact individually labeled verified or source-bound. Nothing flattened into a single description.

## 10. CSV Validation

`downloads/tapping-atlas.csv`: 29 rows, designations match the projection exactly and match the HTML card designations exactly (mechanically diffed, not eyeballed). All 18 required columns present, including explicit `primary_tap_drill_status` and `iso_2306_alternative_status` columns — no silent omission of verification state.

## 11. Generator Determinism

Both generators (T3's `generate-tapping-projections.js` and T4's `generate-tapping-atlas.js`) were run 3 times each against the corrected state. All runs produced identical SHA-256 checksums:

```
reference/tapping-atlas.html: ec9c4d005c0c2b64cc2e143149b09b6ad4f55637c03e7769034e590ffc226ca1
downloads/tapping-atlas.csv:  3a391f37c5ac32ac1bbaa0e49ed8ac54e2efd840f855d396dc084b1dc51e7551
```

## 12. JSON-LD Validation

6 blocks (`Dataset`, `WebPage`, `BreadcrumbList`, `FAQPage`, `Organization`, `WebSite`), all parse successfully. FAQPage matches the visible FAQ section exactly by question identity and answer text — 6/6, verified mechanically, not by inspection (the exact lesson from D1.6R's FAQ governance rule, applied here from the start).

## 13. All Validator Results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational warnings, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` (T3 dedicated) | pass | 0 |
| `validate-tapping-atlas.js` (T4 dedicated, new) | pass | 0 (10 checks) |

## 14. Broken-Link / Orphan Results

0 broken internal links (24 unique hrefs, all resolved against the filesystem). 0 `.html` hrefs. Page is not orphaned — linked from `reference/index.html`'s "Standards & engineering data" section and from the sitemap.

## 15. SEO / Canonical Results

Title and meta description are unique site-wide (grepped, no duplicates found). Canonical is extensionless. See §16 for the trailing-slash discrepancy.

## 16. Deferred Findings

1. **Canonical trailing slash.** The original T4 brief said `https://boltlab.io/reference/tapping-atlas` (no trailing slash) and explicitly warned against introducing a `/tapping-atlas/` directory form. A later instruction in this same phase said "Canonical must be: `https://boltlab.io/reference/tapping-atlas/`" (with a trailing slash). These conflict. I built the page matching the no-trailing-slash form, consistent with (a) every existing atlas/reference page's own convention, (b) the file being `reference/tapping-atlas.html` rather than a directory, and (c) the original brief's own explicit rule. Flagging rather than silently resolving — let me know if the trailing-slash form was actually intended.
2. **`reference/thread-atlas.html` and `reference/metric-thread-atlas.html` do not yet cross-link to the new Tapping Atlas.** The original T4 brief authorized modifying `reference/index.html` and, optionally, `reference/thread-engineering/engineering-tables.html`; it did not explicitly authorize touching the two existing atlas pages, so I left them untouched rather than assume. Worth a follow-up if you want tighter cross-linking.
3. **Hex-head/clearance-hole CSV columns.** Not included in the CSV per the original brief's explicit column list (which didn't request them) — consistent with T2.1a's decision to leave those fields `unavailable` in the knowledge layer.

## 17. Complete Change-Scope Accounting

See `audit/t4-change-scope.md`.

## 18. Bugs Found and Fixed During This T4 Resume

1. **Data Quality panel miscount (pre-dated, but surfaced here first).** Initially read `data_quality_summary` (record-level, 0/29) for the "Tap-drill values" line instead of computing `tap_drill.status` counts directly — this is what led to discovering the underlying T3 bug in the first place.
2. **Card-level badge ambiguity.** The original card design showed a bare "Verified"/"Source-bound" pill that could be misread as whole-record status. Revised to two explicit lines — "Tap drill: <status>" and "Overall profile status: <status>" — per your explicit field-vs-record distinction requirement. Mechanically enforced by the new validator's "Field-Level vs Record-Level Status Distinction Present" check.

## 19. Confirmation: No Knowledge-Layer Data Altered

Confirmed. `git status` shows zero changes under `data/entities/`, `data/standards/`, `data/datasets/`, or `data/relationships/` in this T4 session.

## 20. Confirmation: Nothing Committed or Pushed

Confirmed. All work remains in the working tree, uncommitted.
