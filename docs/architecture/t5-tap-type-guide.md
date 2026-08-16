# Tap Type Guide (T5)

Date: 2026-08-15

## Pipeline position

```
KNOWLEDGE (T1/T2.x) → RELATIONSHIPS → T3 TAP-TYPE PROJECTION (corrected) → T5 TAP TYPE GUIDE
```

`scripts/generators/generate-tap-type-guide.js` reads **only** `data/projections/tapping/tap-types.json` — the corrected projection (commit `5989de0`, which restored the `general_taxonomy` classification). It does not read `data/entities/`, `data/datasets/`, `data/standards/`, or any file T4 owns.

## Why this capability, not the alternatives

Five candidate directions were evaluated (per the T5 brief's own framework):

| Option | Verdict | Reasoning |
|---|---|---|
| A. Individual tapping-profile pages (29 pages) | Rejected | The brief explicitly warns against one page per row merely because the dataset has 29 rows; many of the 20 source-bound records lack enough unique factual substance to clear a real content threshold, and every field is already exposed on the Atlas with per-record provenance disclosure |
| **B. Tap-type explorer** | **Selected** | 7 tap types, each genuinely differentiated (chamfer length, chip direction, hole suitability, ductility limits), now including the freshly-restored `general_taxonomy` fact — strong, defensible unique content per entry |
| C. Controlled decision workflow | **Folded into B** | Rather than a separate page, the "Compare tap types" table and "Choosing between tap types" section deliver this value inside the same page, using facts already present in B's data — no separate architecture needed |
| D. Expanded downloadable dataset | Rejected | No legitimate new field exists without new research (out of scope for T5; hex-head/clearance-hole fields were deliberately left `unavailable` in T2.1a) |
| E. Standards-linked tapping reference | Rejected | Already reasonably served by T3/T4 (every Atlas card lists its resolved standards); incremental value here would be mostly presentational |

## What's new versus what T4 already showed

T4's Atlas already has a "Tap types" section with the same 7 entities — but it only reads 3 of the 4 classification arrays (missing `general_taxonomy`, per the known deferred T4 gap) and presents them as a flat grid without a comparison view. T5's Tap Type Guide is a **distinct, complementary page**, not a duplicate:

- It is the **first product to consume the corrected `general_taxonomy` field** — the NASA-STD-5020A verified fact appears in a live product for the first time.
- It adds a **comparison table** (chamfer/manufacturing trait, chip evacuation, hole suitability, evidence tally) built by directly quoting facts already in the projection — no new categorization scheme, no new claims.
- It gives each tap type a full standalone section with an anchor (`#taper-tap`, `#bottoming-tap`, etc.) for direct linking.

## Comparison table: presentation, not new classification

The "Compare tap types" table's four content columns are populated by simple keyword matching against **already-projected fact text** (e.g., a manufacturing-characteristic fact containing "chamfer" fills the chamfer column). This is a display-layer convenience, not a new fact — every cell's content is a verbatim quote of a fact that already exists elsewhere on the same page with its full source and status. Where no matching fact exists for a tap type, the cell shows "—", never a fabricated value.

## Evidence classification preserved

Every tap-type section shows all four groups exactly as the projection carries them — General taxonomy, Manufacturing characteristic, Typical application, Manufacturer-specific recommendation — each fact individually tagged with its verification badge (reusing T4's `.data-status` CSS) and its source string. Nothing is flattened into a generic "features" list.

## No unsupported recommendation

The "Choosing between tap types" section explicitly states the guide does not issue a universal recommendation — it directs the user to match documented characteristics to their own job. The dedicated validator greps for overclaiming language ("best for," "should always," "industry-standard," "ISO-approved") and forbidden engagement percentages, failing the build if any appear.

## Determinism

The generator has no `new Date()` and no unordered iteration. Run 3 times against the corrected projection in this phase; all three runs produced an identical SHA-256 checksum (`4b1d1a0b...`).

## T4 regression check

`reference/tapping-atlas.html`, `downloads/tapping-atlas.csv`, and `data/projections/tapping/tapping-profiles.json` were not touched in this phase. `validate-tapping-atlas.js` was re-run and still passes with 0 errors, confirming no regression.

## Deferred (not fixed here, by design)

The T4 Atlas's own `general_taxonomy` gap (documented in `audit/t3-tap-type-correction.md`) remains unfixed — T5 was explicitly instructed not to bundle that repair into this phase. This guide's route (`/reference/tap-type-guide`) is a new, separate page; the Atlas's tap-type section is untouched.
