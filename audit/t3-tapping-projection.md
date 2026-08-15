# T3 — Tapping Projection Layer

Date: 2026-08-15
Status: **PASS**

## 1. Projection Files Created

| File | Role |
|---|---|
| `data/projections/tapping-profile.schema.json` | Schema for `tapping_profile_projection` |
| `data/projections/tapping-tap-type.schema.json` | Schema for `tapping_tap_type_projection` |
| `data/projections/tapping/tapping-profiles.json` | 29 rows — the unified metric/UNC/UNF tapping projection |
| `data/projections/tapping/tap-types.json` | 7 rows — the tap-type reference projection |

Two files, both new sibling projection types alongside the existing `reference_page`/`chart`/`tool`/`api`/`atlas_page` types — no parallel architecture was created. Full design rationale: `docs/architecture/tapping-projection-engine.md`.

## 2. Projection Schema

Modeled structurally on the existing `atlas.schema.json` pattern (dataset metadata + rows), sized for the tapping domain's richer per-value provenance/status needs. Every row nests `thread` / `tap_drill` / `alternative_drill` / `engagement` / `tap_types` / `standards` / `data_quality` exactly as specified.

## 3. Record Counts

| System | Rows |
|---|---|
| Metric | 14 |
| UNC | 8 |
| UNF | 7 |
| **Total tapping profiles** | **29** |
| Tap types | 7 |

## 4. Tap-Drill Fields

Every row's `tap_drill` block preserves its source status exactly:

- **9 rows (all metric, the M3–M20 coarse-pitch target set)**: `status: "verified"`, with a `cross_check` note citing the exact ISO 2306 table match from T2.1.
- **20 rows (5 metric fine-pitch + 8 UNC + 7 UNF)**: `status: "source_bound"`.

**Important nuance, preserved not hidden:** each row's top-level `data_quality.record_status` remains `"source_bound"` on **all 29 rows**, including the 9 with a verified `tap_drill`. This is not a T3 regression — it is the correct, unchanged T1 convention: a tapping_profile's overall record status reflects the *complete* product (hole prep + engagement + process parameters), and `thread_engagement`/`tapping_parameters` remain unavailable knowledge-layer-wide. The projection surfaces both levels honestly rather than collapsing them into one number.

## 5. ISO 2306 Alternative Drill Fields

- **15 of 29 rows** (every UNC/UNF row) carry a populated `alternative_drill` object.
- **14 of 29 rows** (every metric row) have `alternative_drill: null` — correct, since metric's own `tap_drill` convention already *is* ISO 2306's convention; there is no second value to represent.
- `alternative_drill.status` is `"verified"` on all 15 (direct primary-source table transcription from T2.1).
- The dedicated validator mechanically confirms: every UNC/UNF row has one, every metric row doesn't, and no `alternative_drill` is ever value-identical to its sibling `tap_drill`.

## 6. Engagement Representation

Identical shape on all 29 rows, by design — no per-thread engagement value exists anywhere in the knowledge layer to differentiate them:

- `radial.calculation_status: "calculable"`; `radial.target_percent: null` on every row, always.
- `axial.calculation_status: "not_calculable"` on every row, schema-enforced as a `const`.
- The dedicated validator greps the **entire serialized output** for a non-null `target_percent` or the literal string "75%"/"75 percent" and fails the build on either. Confirmed clean.

## 7. Tap-Type Representation

All 7 tap types projected with their T2.2 classification preserved intact — `manufacturing_characteristics`, `typical_applications`, and `manufacturer_specific_recommendations` as three separate arrays, never flattened into one description string. `evidence_status` totals: **1 verified fact, 15 source-bound facts**, matching T2.2 exactly.

## 8. Standards Representation

6 unique standards resolved across the projection: `asme_b1_1`, `iso_2306`, `iso_261`, `iso_262`, `iso_724`, `iso_965_1`. Every resolution traces to a tapping dataset's own `source_standards` array — none was inferred from naming similarity.

## 9. Provenance Coverage

**100%** — every one of the 29 rows' `tap_drill.provenance` carries `source_dataset`/`source_record`/`source_field`, and `data_quality.provenance_complete` is `true` on all 29.

## 10. Validator Results

| Validator | Status | Errors | Warnings |
|---|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 | 0 |
| `validate-tapping-domain.js` | pass | 0 | 5 (informational, unchanged) |
| `validate-projections.js` (generic, extended) | pass | 0 | 0 |
| `validate-tapping-projections.js` (new, dedicated) | pass | 0 | 0 |

The dedicated validator runs 8 checks: unique IDs/canonical thread refs, valid entity/dataset/standard references, provenance completeness, verification-state correctness, ISO 2306 structural correctness, no unsupported engagement recommendations (including a literal 75%/target_percent grep across the whole file), no orphan projections, and hole-preparation taxonomy non-flattening.

## 11. Determinism

Generator run 3 times against an identical knowledge-layer state. SHA-256 checksums identical across all 3 runs for both output files:

```
tapping-profiles.json: 5397c97ca4c02bf8c5e1aefa5cdd098ee6cabaf8ddfaba19569fd154101f0bf9
tap-types.json:        4a93bb5f33049013a40a0f9aa6e1ab32fc5b793c8997691b6c2a8992a73e9187
```

Achieved via a fixed `BUILD_DATE` constant (no `new Date()`), sorted iteration order for every array built from an unordered source, and no external state dependency.

## 12. Production-File Safety

**0.** `git status --short | grep -E '\.(html|css|xml|txt)$'` → empty. No sitemap, navigation, existing tool, ads, or legal file was touched.

## Final Status

**PASS.** All 15 quality-gate criteria from the phase brief are met: schema validates, all references resolve to real knowledge records, tap-drill status preserved exactly, ISO 2306 alternatives structurally separate, provenance fully traceable, tap-type evidence preserved, hole-preparation taxonomy not re-flattened, radial engagement represented as capability only, axial remains not_calculable, no 75% target anywhere, standards resolve correctly, no orphans, zero production files touched, generator is deterministic (3/3 identical runs), and all four validators pass. See `audit/t3-change-scope.md` for the full file accounting. Nothing was committed or pushed.
