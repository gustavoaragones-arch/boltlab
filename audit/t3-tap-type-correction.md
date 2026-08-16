# T3 Correction — Missing `general_taxonomy` in Tap-Type Projection

Date: 2026-08-15
Found during: T5 required inspection (before any T5 product work began)
Status: **FIXED**

## Root cause

`data/entities/entities.seed.json`'s tap_type entities carry `application_notes` classified into one of four values (`entity.schema.json`'s enum): `general_taxonomy`, `manufacturing_characteristic`, `typical_application`, `manufacturer_specific_recommendation`.

The T3 tap-type projection (`data/projections/tapping-tap-type.schema.json` + `buildTapTypeProjection()` in `generate-tapping-projections.js`) only ever defined three row arrays — `manufacturing_characteristics`, `typical_applications`, `manufacturer_specific_recommendations` — and the generator's `byClass()` helper was only called for those three classifications. Any fact classified `general_taxonomy` had nowhere to go and was silently dropped from the projection output.

## Exact knowledge-layer fact that was being dropped

`bottoming_tap`'s single `general_taxonomy` application_note:

> "Incomplete internal threads are inherently present at the bottom of a tapped blind hole — the physical reason bottoming taps exist as a distinct style."
> Source: NASA-STD-5020A section 4.7.5 [TFSR 25]. Source tier: 1. Status: **verified**.

This is the single highest-confidence fact in the entire tap-type domain — the only one to reach Tier 1 primary-source verification (established in T2.2). It appeared in no downstream artifact: not `tap-types.json`, not the T4 Atlas page, not the CSV. Only the aggregate `evidence_status.verified_fact_count: 1` hinted at its existence.

## Exact schema change

`data/projections/tapping-tap-type.schema.json`: added a required `general_taxonomy` array field (same `$defs/note` item shape as the other three), and added it to the row's `required` list.

## Exact generator change

`scripts/generators/generate-tapping-projections.js`, `buildTapTypeProjection()`: added `general_taxonomy: byClass("general_taxonomy")` alongside the three existing `byClass()` calls.

## Exact projection change

`data/projections/tapping/tap-types.json` regenerated. `data/projections/tapping/tapping-profiles.json` **not** regenerated with different content — confirmed byte-identical before and after (checksum `f9739e1d1f8d214b9eb06e4396c9bd1c44c1765c72e644bd0f40bfb1eddf3060`, unchanged).

## Before/after record and classification counts

| | Before | After |
|---|---|---|
| Tap-type rows | 7 | 7 (unchanged) |
| Total application-note facts represented in projection | 15 | 16 |
| `general_taxonomy` facts represented | 0 | 1 |
| `manufacturing_characteristic` facts | 7 | 7 (unchanged) |
| `typical_application` facts | 7 | 7 (unchanged) |
| `manufacturer_specific_recommendation` facts | 1 | 1 (unchanged) |
| Verified facts (evidence_status sum) | 1 (counted, but text absent downstream) | 1 (counted **and** text present) |
| Source-bound facts (evidence_status sum) | 15 | 15 (unchanged) |

No existing manufacturing/typical/manufacturer-specific fact was lost, duplicated, or reclassified — confirmed by the new validator check (below), which compares every projected fact back to its exact source text.

## Confirmation: NASA-verified fact now present

Confirmed verbatim in `tap-types.json`'s `bottoming_tap.general_taxonomy[0]`, with `status: "verified"` and its full NASA-STD-5020A source citation intact — see excerpt above.

## Confirmation: no knowledge-layer files changed

Confirmed. `git status` shows zero changes under `data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`. The knowledge-layer record was always correct; only the projection's row shape was incomplete.

## Confirmation: `tapping-profiles.json` byte-identical

Confirmed via SHA-256 before and after regeneration: `f9739e1d1f8d214b9eb06e4396c9bd1c44c1765c72e644bd0f40bfb1eddf3060` in both cases.

## New validator check added (prevents recurrence)

`scripts/validators/validate-tapping-projections.js` gained check #9, "Application-Note Completeness (No Silent Drop, Duplication, or Reclassification)": for every tap-type entity, it walks the knowledge layer's own `application_notes`, maps each to its expected projection field, and confirms the exact fact text appears **exactly once**, with unchanged `status`, in that field — and that the projected fact count matches the source count exactly. This check is driven entirely by the classification-enum-to-field mapping, so if a fifth classification is ever added to the knowledge layer without a corresponding projection field, this check fails loudly instead of silently dropping data again.

Also fixed check #7 ("No Orphan Projected Tap Types...")'s note-count calculation, which previously didn't count `general_taxonomy` toward "has application notes" — a tap type with only a `general_taxonomy` fact and nothing else would have incorrectly warned as orphaned.

## Validator results (all re-run)

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational warnings, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` (dedicated, extended) | pass | 0 |
| `validate-tapping-atlas.js` | pass | 0 (unaffected — see T4 downstream impact below) |

## Determinism

`generate-tapping-projections.js` run 3 times. `tap-types.json` checksum identical across runs (`63867da5f7f4a9eb5935b418bfc306ec143bf686f0269bb0689c6325ef480305`); `tapping-profiles.json` unchanged throughout.

## T4 downstream impact (documented, NOT fixed in this correction)

`scripts/generators/generate-tapping-atlas.js`'s `renderTapTypeSection()` only reads `manufacturing_characteristics`, `typical_applications`, and `manufacturer_specific_recommendations` from the tap-type projection — it does not read `general_taxonomy` either. This means the already-committed, already-pushed T4 product (`reference/tapping-atlas.html`, commit `ea257d8`) still does not display the NASA-verified bottoming-tap fact, even after this correction. `validate-tapping-atlas.js` passed because it doesn't check for this specific field's presence in the HTML.

**This is a real, separate gap**, structurally identical to this one but one layer downstream. Per your explicit instruction, it is documented here rather than silently fixed — T4 was not regenerated or modified as part of this correction.

## Files changed by this correction

| File | Change |
|---|---|
| `data/projections/tapping-tap-type.schema.json` | Added `general_taxonomy` required array field |
| `scripts/generators/generate-tapping-projections.js` | `buildTapTypeProjection()` now populates `general_taxonomy` |
| `scripts/validators/validate-tapping-projections.js` | Fixed orphan-check note count; added completeness check #9 |
| `data/projections/tapping/tap-types.json` | Regenerated with the missing fact restored |
| `docs/architecture/validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `docs/architecture/tapping-projection-validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `audit/t3-tap-type-correction.md` | This file |

No production files touched. T5 was not implemented — no T5 files were created or modified.
