# T2.1a — UNC/UNF Thread Coverage Expansion

Date: 2026-08-15
Status: **PASS WITH GAPS**

## What this phase did

Added the 9 UNC/UNF sizes T2.1 identified as missing from BoltLab's base-thread datasets — not by copying ISO 2306's metric values into an inch-convention dataset, but by independently acquiring and verifying each size's own base-thread identity first, then attaching a tap-drill recommendation with honest provenance, then separately recording ISO 2306's alternative recommendation as a distinct, clearly-labeled field.

| Dataset | Before | After |
|---|---|---|
| `unc.seed.json` (base thread identity) | 3 | 8 |
| `unf.seed.json` (base thread identity) | 3 | 7 |
| `unc_tapping.seed.json` (tapping profiles) | 3 | 8 |
| `unf_tapping.seed.json` (tapping profiles) | 3 | 7 |

## New base-thread records and their provenance

| Designation | Nominal Ø (in) | TPI | Tap drill (in) | Identity status | Tap-drill status |
|---|---|---|---|---|---|
| #4-40 UNC | 0.112 | 40 | 0.089 | VERIFIED | SOURCE_BOUND |
| #6-32 UNC | 0.138 | 32 | 0.1065 | VERIFIED | SOURCE_BOUND |
| #8-32 UNC | 0.164 | 32 | 0.136 | VERIFIED | SOURCE_BOUND |
| #10-24 UNC | 0.190 | 24 | 0.1495 | VERIFIED | SOURCE_BOUND |
| 1/2-13 UNC | 0.500 | 13 | 0.4219 | VERIFIED | SOURCE_BOUND |
| #6-40 UNF | 0.138 | 40 | 0.113 | VERIFIED | SOURCE_BOUND |
| #8-36 UNF | 0.164 | 36 | 0.136 | VERIFIED | SOURCE_BOUND |
| #10-32 UNF | 0.190 | 32 | 0.159 | VERIFIED | SOURCE_BOUND |
| 1/2-20 UNF | 0.500 | 20 | 0.4531 | VERIFIED | SOURCE_BOUND |

**Identity fields (diameter/TPI) are VERIFIED**, not merely source-bound: for numbered sizes, the nominal major diameter follows a fixed, historical formula (0.060in + gauge-number × 0.013in), confirmed via a tap-manufacturer technical reference (Yamawa Co.) and cross-corroborated against a chart explicitly citing ASME B1.1-2003; TPI is literally part of every designation. This isn't chart-agreement — it's a definitional relationship with an unambiguous formula behind it.

**Tap-drill values are SOURCE_BOUND, not VERIFIED.** No Tier 1 primary standard table was obtainable this time — the ASME B1.1 and B94.9 ANSI preview pages both returned HTTP 403, unlike ISO 2306's preview in T2.1. Instead, every value was pulled from one coherent university-hosted chart (faculty.etsu.edu) and then **cross-checked against the Machinery's Handbook thread-engagement formula already verified in T2** before acceptance.

## A conflict caught by the formula, not by vote-counting

An earlier WebSearch aggregation had returned different UNF tap-drill values (#6-40: 0.1457in, #8-36: 0.1732in, #10-32: 0.2008in, 1/2-20: 0.4844in). Running the engagement formula against these showed they were **inconsistent with a ~75% engagement target by a wide margin** — while the ETSU chart's values landed almost exactly on the formula's predicted diameter for every single size. The ETSU values were used; the aggregated ones were rejected. This is the concrete value of the "cross-check against a verified formula" discipline versus "three commercial charts agree": one bad number from a single search aggregation would have been indistinguishable from a good one by popularity alone, but it failed independently against known engineering math.

## hex_head_in / clearance_hole fields: left UNAVAILABLE

The existing 3 UNC + 3 UNF records also carry `hex_head_in` and three `clearance_hole_*_in` fields (general hex-fastener geometry, not tapping-specific). No verified source for these was obtained for the 9 new sizes in this phase, and hex-head format is atypical for numbered machine-screw sizes in ordinary practice. Rather than populate these from unverified commercial charts, **all four fields are left `null` on all 9 new records**, explicitly marked `unavailable` in each record's new `provenance` block. This is a named gap, not a silent omission.

## The ISO 2306 distinction is now structural, not just prose

Per your governance rule, ISO 2306's metric drill recommendation for inch threads must never replace or be merged with BoltLab's US-customary value. This phase made that structural: **every one of the 15 UNC/UNF tapping_profile records** (the original 6 from T1 plus the 9 new ones) now carries two independent, clearly-labeled fields:

```json
"hole_preparation": {
  "value": 0.201, "unit": "in",
  "...": "US customary drill-series convention (existing BoltLab value)"
},
"iso_2306_alternative_drill": {
  "value": 5.10, "unit": "mm", "source": "iso_2306", "table": "Table 3",
  "meaning": "ISO 2306's own metric drill-diameter recommendation for tapping this inch thread — an additional, legitimate recommendation under a different sizing convention. Not a correction."
}
```

Both values are independently sourced and labeled; neither is treated as authoritative over the other. This makes T2.1's finding — that these two conventions genuinely diverge for the same thread — a permanent, queryable part of the knowledge layer rather than something that only lived in an audit file.

## No Existing Values Altered

**Zero.** No pre-existing `unc.seed.json`/`unf.seed.json`/`unc_tapping.seed.json`/`unf_tapping.seed.json` record's numeric value was changed. No metric record was touched. The 6 pre-existing UNC/UNF tapping_profile records only gained the new `iso_2306_alternative_drill` field — their `hole_preparation` values are byte-for-byte unchanged.

## Validator Results

| Validator | Status | Errors | Warnings |
|---|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 | 0 |
| `validate-tapping-domain.js` | pass | 0 | 5 (informational, unchanged in kind) |

Tapping-domain record count: 20 → 29. Standards count unchanged (9). Fabricated engineering values: 0.

## Production Files Modified

**0.**

## Final Status

**PASS WITH GAPS.** All 9 target UNC/UNF sizes now exist as fully-identified base-thread records with honest, differentiated provenance per field. The remaining gaps (tap-drill values not cross-checked against a Tier 1 primary table; hex-head/clearance-hole fields unavailable) are explicitly named, not hidden, and consistent with the same epistemic honesty standard T2 and T2.1 established. See `audit/t2-1a-change-scope.md` for the full file accounting. Nothing was committed or pushed.
