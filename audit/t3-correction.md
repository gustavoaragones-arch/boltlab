# T3 Correction — `tap_drill.status` Derivation Bug

Date: 2026-08-15
Found during: T4 preparation (Data Quality panel build)
Status: **FIXED**

## What was wrong

The already-committed and pushed T3 projection (`3d2d956`) reported `tap_drill.status: "verified"` on **all 29 rows**, not the intended and previously-documented 9 verified / 20 source-bound split.

## Root cause

`scripts/generators/generate-tapping-projections.js`'s `buildTapDrillBlock()` set `status: hp.status`, copying `hole_preparation.status` directly from the knowledge layer. That field is `"verified"` on **every** hole_preparation record across all 29 tapping profiles — it reflects T1's original "verified by reference to the source thread dataset" convention, which is equally true for all 29 records and therefore cannot distinguish the 9 records T2.1 independently cross-checked against ISO 2306's primary table from the other 20 that were never cross-checked against any primary standard.

The correct signal already existed in the knowledge layer — a `cross_verified` sub-object, present only on the 9 target metric records (see `data/datasets/metric_tapping.seed.json`) — but the T3 generator never read it for this field.

## Why this wasn't caught before commit

T3's own dedicated validator (`validate-tapping-projections.js`) only checks that `tap_drill.status` is one of the four valid enum values, not that it's the *correct* one — schema-shape validation, not semantic correctness. The T3 audit report's narrative text (`audit/t3-tapping-projection.json`/`.md`) was written to describe the *intended* design and was never mechanically cross-checked against the actual generated file's field values before being reported. Both the report author (me) and the reviewer (you) trusted the narrative without independently re-deriving the counts from the artifact itself.

## The fix

`buildTapDrillBlock()` now derives `status` from `Boolean(hp.cross_verified)`:
- `true` → `"verified"` (9 metric records: M3, M4, M5, M6, M8×1.25, M10×1.5, M12×1.75, M16×2.0, M20×2.5)
- `false`/absent → `"source_bound"` (5 metric fine-pitch records + all 8 UNC + all 7 UNF = 20)

The `convention` label was also corrected: for the 5 non-cross-verified metric records it no longer claims "BoltLab-verified table match" (it now reads "not independently cross-checked against the primary table").

No knowledge-layer data (`data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`) was touched. Only the T3 generator's derivation logic and its regenerated output (`data/projections/tapping/tapping-profiles.json`) changed. `tap-types.json` is unaffected (unchanged checksum).

## What was NOT affected

- `data_quality.record_status` (0 verified / 29 source-bound at the whole-record level) — correct before and after; unrelated field, unrelated bug.
- `alternative_drill` (ISO 2306) fields — correct before and after; unaffected by this bug.
- `thread`, `engagement`, `tap_types`, `standards` blocks — unaffected.
- `data/projections/tapping/tap-types.json` — unaffected, checksum unchanged (`4a93bb5f...`).

## Verification after fix

```
tap_drill.status counts: {'source_bound': 20, 'verified': 9}
metric verified (9):      M3x0.5, M4x0.7, M5x0.8, M6x1, M8x1.25, M10x1.5, M12x1.75, M16x2.0, M20x2.5
metric source_bound (5):  M8x1.0, M10x1.25, M12x1.25, M16x1.5, M20x2.0
```

Matches the target coarse-pitch seed set exactly (the 9 sizes T2.1 cross-checked) vs. the 5 non-target fine-pitch metric sizes plus all 15 UNC/UNF.

## Re-run results

| Check | Result |
|---|---|
| `validate-knowledge-engine.js` | pass, 0 errors |
| `validate-tapping-domain.js` | pass, 0 errors, 5 warnings (unchanged) |
| `validate-projections.js` (generic) | pass, 0 errors |
| `validate-tapping-projections.js` (dedicated) | pass, 0 errors |
| Determinism | 3 runs, identical SHA-256: `f9739e1d1f8d214b9eb06e4396c9bd1c44c1765c72e644bd0f40bfb1eddf3060` (tapping-profiles.json), `4a93bb5f33049013a40a0f9aa6e1ab32fc5b793c8997691b6c2a8992a73e9187` (tap-types.json, unchanged) |

## Files changed by this correction

| File | Change |
|---|---|
| `scripts/generators/generate-tapping-projections.js` | Fixed `buildTapDrillBlock()` status/convention derivation |
| `data/projections/tapping/tapping-profiles.json` | Regenerated with corrected `tap_drill.status`/`convention` values |
| `audit/t3-tapping-projection.json` | Checksum updated, correction noted |
| `docs/architecture/validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `docs/architecture/tapping-projection-validation-report.json`/`.md` | Regenerated (re-ran validator) |
| `audit/t3-correction.md` | This file |

No production files touched. T4 work (in progress when this bug was found) was paused and is untouched by this correction — it resumes only after this fix is reviewed and approved separately.
