# T5 — Tapping & Threading Data Product Expansion: Tap Type Guide

Date: 2026-08-15
Status: **READY FOR REVIEW**

## Selected Capability and Why

**B (Tap-type explorer)**, with **C (a comparison-based decision aid)** folded into the same page rather than built separately.

| Rejected | Reason |
|---|---|
| A. 29 individual profile pages | The phase brief explicitly warns against one page per dataset row; many of the 20 source-bound records lack unique factual substance to clear a real content threshold, and every field is already exposed on the existing Atlas with per-record provenance disclosure |
| D. Expanded CSV | No legitimate new field exists without new data-acquisition research (out of scope); hex-head/clearance-hole fields were deliberately left `unavailable` in T2.1a |
| E. Standards-linked reference | Already reasonably served — every Atlas card lists its resolved standards; incremental value here would be mostly presentational |

Selected because it: (1) is the first product to actually surface the just-restored `general_taxonomy` classification, turning the T3 correction into real user-visible value; (2) has genuinely differentiated content across all 7 entries, unlike a 29-row profile-page approach; (3) requires zero new data invention — built 100% from already-verified/sourced T2.2 facts; (4) is architecturally minimal — one new generator consuming an existing, already-correct projection, no new schema.

## Product URL

`https://boltlab.io/reference/tap-type-guide`

## Files Created (4)

| File | Role |
|---|---|
| `scripts/generators/generate-tap-type-guide.js` | Deterministic generator, reads only `tap-types.json` |
| `scripts/validators/validate-tap-type-guide.js` | Dedicated validator, 9 checks, all expectations derived from the projection at validation time |
| `reference/tap-type-guide.html` | The product page |
| `docs/architecture/t5-tap-type-guide.md` | Architecture documentation |

Plus validator output (`docs/architecture/tap-type-guide-validation-report.json`/`.md`) and this audit pair.

## Files Modified (2)

| File | Change |
|---|---|
| `reference/index.html` | +1 card in "Standards & engineering data" |
| `sitemap.xml` | +1 `<url>` entry |

## Existing T4/T3 Files Reused, Not Modified

`data/projections/tapping/tap-types.json` (read-only consumption), `css/styles.css`'s `.data-status` badge classes (reused as-is, no changes).

## Data-Source Chain

```
data/projections/tapping/tap-types.json  (T3, corrected, commit 5989de0)
        ↓
scripts/generators/generate-tap-type-guide.js  (reads ONLY this file)
        ↓
reference/tap-type-guide.html
```

## Record and Verification-State Counts

| Metric | Value |
|---|---|
| Tap types | 7 |
| Total facts displayed | 16 |
| Verified | 1 |
| Source-bound | 15 |

All mechanically re-derived from the projection by `validate-tap-type-guide.js`, not hardcoded.

## Provenance Coverage

100%. Every fact on the page carries its source string and status badge; the one verified fact carries its full NASA-STD-5020A section citation, matching the projection exactly.

## Standards Coverage

Not a primary focus of this page (standards are already covered on the Atlas); the guide links to the Atlas and Data Methodology rather than duplicating standards listings.

## Tap-Type Coverage

All 7, each with a dedicated section and anchor. This is the **first product surface where `general_taxonomy` actually renders** — the NASA-verified bottoming-tap fact is visible in a live page for the first time since it was restored in the projection.

## Engagement Limitations Preserved

The page does not discuss thread engagement at all (out of scope for a tap-type reference). The dedicated validator defensively greps for 70%/75%/77% patterns regardless and found none.

## User Workflow/Value Delivered

A genuine comparison table (chamfer/manufacturing trait, chip evacuation, hole suitability, evidence tally) lets a user compare tap types side by side using already-verified facts, plus full per-type detail below. An explicit "Choosing between tap types" section states plainly that the guide does not issue a universal recommendation.

## UX / Information Hierarchy

Direct-answer intro → data quality panel → comparison table → decision-framing note → 7 full tap-type sections (in a fixed logical order: taper, plug, bottoming, spiral-point, spiral-flute, forming, hand) → related references → FAQ.

## SEO/Canonical/Structured-Data Changes

Unique title (`Tap Type Guide | BoltLab`) and meta description, extensionless canonical, `WebPage`/`BreadcrumbList`/`FAQPage` JSON-LD, FAQ identity-matched exactly (5/5, mechanically verified). No `Dataset` JSON-LD — no separate downloadable file is offered on this page.

## Download/Data-Product Changes

None. No new CSV — the existing `downloads/tapping-atlas.csv` remains the single downloadable tapping data product, consistent with the phase's instruction not to expand the dataset with new fields.

## Validator Results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational warnings, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` | pass | 0 |
| `validate-tapping-atlas.js` | pass | 0 (confirms **no T4 regression**) |
| `validate-tap-type-guide.js` (new, 9 checks) | pass | 0 |

## Determinism

3 runs, identical SHA-256: `4b1d1a0b396975341af53811fa36e358458ea6bf4c63a41dea9dea8d61e5f166`.

## Broken-Link/Orphan Results

0 broken internal links. Page is linked from `reference/index.html` and the sitemap — not orphaned.

## T4 Regression Result

**None.** `reference/tapping-atlas.html`, `downloads/tapping-atlas.csv`, and `data/projections/tapping/tapping-profiles.json` are untouched (confirmed via `git status`); `validate-tapping-atlas.js` still passes.

## Knowledge-Layer Changes

**None.**

## Unexpected Files

**None.**

## Deferred Gaps

T4's Atlas still does not display the `general_taxonomy` classification — a known, separately documented gap (`audit/t3-tap-type-correction.md`), intentionally not repaired in this phase per your explicit instruction.

## Confirmation: No Unsupported Engineering Values Introduced

Confirmed — every fact on the page is a verbatim, unmodified quote from the projection, with its original source and status.

## Confirmation: No Unrelated Architecture Created

Confirmed — one generator, one validator, one page, consuming the existing projection directly; no parallel data system, no new schema, no duplicate entity or standards records.

## Confirmation: Nothing Committed or Pushed

Confirmed. See `audit/t5-change-scope.md` for the full file accounting.
