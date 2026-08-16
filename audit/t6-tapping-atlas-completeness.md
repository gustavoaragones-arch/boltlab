# T6 — Tapping Atlas Completeness & Downstream Projection Repair

Date: 2026-08-15
Status: **READY FOR REVIEW**

## 1. Original T4 Omission

`generate-tapping-atlas.js`'s `renderTapTypeSection()` called its `noteGroup()` rendering helper for only 3 of the tap-type projection's 4 classification fields — `manufacturing_characteristics`, `typical_applications`, `manufacturer_specific_recommendations` — never `general_taxonomy`. T4 was written before T3's tap-type correction existed, and nothing forced its hard-coded 3-call list to be revisited when the projection gained a fourth field.

## 2. Why T3 Was Already Correct

T3's `buildTapTypeProjection()` is the single knowledge→projection mapping point. Once corrected, every consumer of `tap-types.json` written or regenerated *after* the fix — including T5's Tap Type Guide — received the complete data automatically. T4 was the sole exception because its own field-list was hard-coded independently of the projection's shape.

## 3. Exact Projection Field Restored Downstream

`general_taxonomy` — now rendered under its own "General taxonomy" heading, positioned first in each tap-type card (ahead of Manufacturing characteristic), so it cannot be mistaken for a lower-tier classification.

## 4. Exact NASA-Verified Fact Now Rendered

> "Incomplete internal threads are inherently present at the bottom of a tapped blind hole — the physical reason bottoming taps exist as a distinct style." — NASA-STD-5020A §4.7.5 [TFSR 25], status: **Verified**

Confirmed present in `reference/tapping-atlas.html`'s Bottoming Tap card, with "(Verified)" immediately adjacent — the same fact T5 already displayed, now visible on the Atlas too.

## 5. Before/After Atlas Representation

| | Before | After |
|---|---|---|
| Classification headings per tap type | 3 | 4 (General taxonomy added, rendered first) |
| Facts rendered across all 7 tap types | 15 | 16 |
| New pages/URLs | — | 0 |
| Canonical | `https://boltlab.io/reference/tapping-atlas` | unchanged |
| Title/meta description | unchanged | unchanged |

## 6. Before/After CSV Representation

**Unchanged, deliberately.** `downloads/tapping-atlas.csv`'s grain is one row per tapping profile (29 rows); its `tap_types` column lists applicable tap-type IDs, not tap-type-level application facts. Adding `general_taxonomy` text there would mean duplicating the same fact across every profile row referencing `bottoming_tap`, or restructuring the CSV to a different grain — both out of scope for a downstream rendering repair. CSV checksum confirmed byte-identical before and after (`3a391f37...`).

## 7. Verification-State Preservation

Tap-drill counts (9 verified / 20 source-bound) and overall record status (0 verified / 29 source-bound) are untouched — confirmed by re-running `validate-tapping-atlas.js`'s existing count checks, which still pass. The general_taxonomy fact being verified does **not** promote its tap type or any tapping profile to "verified" — these remain three separate, independently-tracked states, exactly as before.

## 8. Provenance Preservation

Every fact's status label renders immediately adjacent to its text; the new validator check confirms this fact-by-fact against the projection, not by loose keyword search.

## 9. Validator Protection Added

`validate-tapping-atlas.js` gained two new checks (now 12 total):

- **"Tap-Type Evidence Completeness"**: for every tap type × every classification the projection actually has facts for, confirms the classification heading exists in that tap type's card, and every individual fact's exact text appears exactly once with its status label adjacent — not merely that the string "general_taxonomy" appears somewhere on the page.
- **"NASA-STD-5020A Verified Bottoming-Tap Fact Present"**: a targeted, named check for this specific fact, so a future change that breaks only this one fact still fails loudly even if the general completeness check has a blind spot.

## 10. T3 Checksum Preservation

Both `data/projections/tapping/tapping-profiles.json` (`f9739e1d...`) and `data/projections/tapping/tap-types.json` (`63867da5...`) confirmed byte-identical before and after this phase — T6 only read them.

## 11. T5 Regression Result

**None.** `reference/tap-type-guide.html` was not regenerated in this phase; its checksum (`4b1d1a0b...`) is confirmed byte-identical to before.

## 12. Deterministic Generation

`generate-tapping-atlas.js` run 3 times: identical HTML checksum across all runs (`603296867f...`), identical CSV checksum matching the pre-T6 baseline exactly (`3a391f37...`, confirming the no-CSV-change decision held).

## 13. Exact Files Modified

`scripts/generators/generate-tapping-atlas.js`, `scripts/validators/validate-tapping-atlas.js`, `reference/tapping-atlas.html`, plus 8 regenerated validator-report files (`validation-report`, `tapping-validation-report`, `projection-validation-report`, `tapping-atlas-validation-report` — each json+md).

## 14. Exact Files Created

`docs/architecture/t6-tapping-atlas-completeness.md`, `audit/t6-tapping-atlas-completeness.md`/`.json`, `audit/t6-change-scope.md`.

## 15. Deferred Items

None remaining specific to this gap — this closes the sole known T3/T4/T5 tapping projection-consumption gap.

## 16. Confirmation: No New Engineering Values Introduced

Confirmed. Every fact rendered was already present in the projection; nothing was calculated, invented, or promoted.

## Validator Results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational warnings, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` | pass | 0 |
| `validate-tapping-atlas.js` (extended, 12 checks) | pass | 0 |

## Final Status

**READY FOR REVIEW.** Nothing committed or pushed. See `audit/t6-change-scope.md` for the full file accounting.
