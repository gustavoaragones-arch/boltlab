# T2.1 — Tap-Drill Numeric Verification

Date: 2026-08-15
Status: **PASS WITH GAPS**

## The breakthrough: a genuine primary source

Direct fetches to `iso.org` are blocked (HTTP 403). T2 worked around this with WebSearch aggregation for standards-*existence* claims. For T2.1, a further attempt succeeded: an **authorized standards-reseller preview** (standards.iteh.ai's public sample PDF for ISO 2306:1972, the same kind of pre-purchase preview any reseller publishes) turned out to contain the **complete 8-page standard**, including all six drill-size tables. This is genuine Tier 1 primary-source content, obtained legitimately (no paywall bypass, no scraping of iso.org itself) — not a third-party chart, not a secondary characterization.

## Method

Every value in BoltLab's existing datasets for the 24-size target seed set was compared **directly against ISO 2306:1972's own published table**, not against any commercial tap-drill chart. Per governance, agreement across multiple commercial charts was never treated as sufficient grounds for promotion — only this direct table comparison was used to justify a `VERIFIED` classification.

## Metric results: 9/9 VERIFIED

| Size | BoltLab value | ISO 2306 Table 1 value | Result |
|---|---|---|---|
| M3×0.5 | 2.5 mm | 2.50 mm | Exact match |
| M4×0.7 | 3.3 mm | 3.30 mm | Exact match |
| M5×0.8 | 4.2 mm | 4.20 mm | Exact match |
| M6×1 | 5.0 mm | 5.00 mm | Exact match |
| M8×1.25 | 6.8 mm | 6.80 mm | Exact match |
| M10×1.5 | 8.5 mm | 8.50 mm | Exact match |
| M12×1.75 | 10.2 mm | 10.20 mm | Exact match |
| M16×2.0 | 14.0 mm | 14.00 mm | Exact match |
| M20×2.5 | 17.5 mm | 17.50 mm | Exact match |

All 9 target metric sizes match ISO 2306's own table exactly. Each corresponding `hole_preparation` block in `data/datasets/metric_tapping.seed.json` now carries a `cross_verified` object recording the table, the confirmed value, and the verification date. `iso_2306` was added to the dataset's `source_standards`. **No existing value was changed** — this promotes the *provenance strength* of already-correct values, it does not correct anything.

## UNC/UNF results: a real different-standard conflict, not an error

ISO 2306 also publishes drill-size tables for UNC/UNF (Tables 3 & 4) — but expressed as **metric drill diameters recommended for tapping inch threads**, a different convention from BoltLab's existing **inch-decimal, US-customary-drill-series** values. Comparing the 3 existing UNC and 3 existing UNF records:

| Size | BoltLab (in → mm equiv.) | ISO 2306 (mm) | Divergence |
|---|---|---|---|
| 1/4-20 UNC | 0.201″ → 5.105 mm | 5.10 mm | −0.005 mm (rounding-level) |
| 5/16-18 UNC | 0.257″ → 6.528 mm | 6.60 mm | +0.072 mm |
| 3/8-16 UNC | 0.3125″ → 7.938 mm | 8.00 mm | +0.063 mm |
| 1/4-28 UNF | 0.213″ → 5.410 mm | 5.50 mm | +0.090 mm |
| 5/16-24 UNF | 0.272″ → 6.909 mm | 6.90 mm | −0.009 mm (rounding-level) |
| 3/8-24 UNF | 0.332″ → 8.433 mm | 8.50 mm | +0.067 mm |

Two sizes agree at rounding-level; four diverge by 0.06–0.09 mm — a small but real, non-coincidental gap consistent with genuinely different sizing conventions (US customary drill-series selection vs. ISO's continuous metric approximation). Per governance, **this was classified as a `different_standard` conflict and left unresolved by design** — no value was changed, averaged, or picked as "more correct." All 6 records remain `SOURCE_BOUND`, now with the conflict explicitly documented in each dataset's `verification_method` field and in `audit/t2-1-tap-drill-numeric-verification.json`.

## What remains UNAVAILABLE: 9 sizes with no BoltLab record at all

The target seed set names 5 UNC sizes (#4-40, #6-32, #8-32, #10-24, 1/2-13) and 4 UNF sizes (#6-40, #8-36, #10-32, 1/2-20) that **do not exist anywhere in BoltLab's current `unc.seed.json`/`unf.seed.json`** (those datasets only ever had 3 records each). ISO 2306's own values for all 9 were extracted from the primary source and are logged in `audit/t2-1-tap-drill-numeric-verification.json` for future use — but they were **not** written into any BoltLab dataset in this phase. Doing so would mean adding new records to `unc.seed.json`/`unf.seed.json`, which are pre-existing, previously-verified, non-tapping-domain datasets outside T2.1's scope; that is a decision point being surfaced explicitly rather than executed unilaterally.

## Value-meaning distinctions (the point the phase brief emphasized most)

- BoltLab's metric `tap_drill_mm` values are now confirmed to be ISO 2306's own **basic/theoretical recommended drill diameter** (nominal − pitch, mapped to the ISO/R 235 stocked drill series) — not a percentage-of-engagement value, not a manufacturer recommendation.
- BoltLab's existing UNC/UNF `tap_drill_in` values remain of **unconfirmed origin** — T1 described them only as "public engineering reference synthesis." T2.1 did not identify their exact source convention; it only confirmed they are *not* ISO 2306's values.
- ISO 2306's UNC/UNF values are a **distinct, legitimate alternative recommendation** (metric drills for inch threads), not a correction to BoltLab's existing data.

## Summary Counts

| Classification | Count |
|---|---|
| VERIFIED | 9 (all metric) |
| SOURCE_BOUND | 6 (all UNC/UNF, conflict-documented) |
| CONTEXTUAL | 0 |
| PENDING | 0 |
| UNAVAILABLE | 9 (UNC/UNF sizes with no BoltLab record) |

**No value was promoted to verified merely because commercial charts agreed.** Every VERIFIED classification traces to a direct, one-to-one primary-source table match.

## Validator Results

Both `validate-knowledge-engine.js` and `validate-tapping-domain.js` pass, 0 errors, after these changes.

## Production Files Modified

**0.**

## Final Status

**PASS WITH GAPS.** A genuine primary source was obtained and used to verify 9 values and classify 6 conflicts honestly — real progress beyond T2. The gap (9 target sizes with no underlying BoltLab thread record) is a scope boundary, not a hidden shortfall, and is surfaced for an explicit decision rather than silently worked around. Nothing was committed or pushed — see `audit/t2-1-change-scope.md`.
