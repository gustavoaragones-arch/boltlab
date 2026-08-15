# Tapping Projection Engine (T3)

Date: 2026-08-15

## Why this projection exists

The tapping knowledge layer (T1/T2/T2.1/T2.1a/T2.2) is spread across 6 dataset files, 24 entities, 9 standards, and 41 relationships, each with its own provenance and status conventions. No product — an Atlas, an API, a calculator — should have to re-derive "what tap drill does M8×1.25 use, and how confident are we" by re-walking that graph itself. The projection does that walk once, deterministically, and exposes a stable, query-ready read model:

```
KNOWLEDGE (entities, standards, datasets, relationships)
    ↓
RELATIONSHIPS (relationship-resolver.js)
    ↓
TAPPING PROJECTIONS (this phase)
    ↓
future generators/products (not built in this phase)
```

## What the projection may denormalize, and what remains source of truth

The projection **denormalizes** — it copies a thread's nominal diameter, a tap-drill value, a standard's designation, etc. directly onto each row, rather than making a consumer chase five files to assemble one record. It does **not** invent, correct, or reinterpret any value. Every denormalized field carries a `provenance` (or `source_dataset`/`source_record`/`source_field`) pointer back to the exact knowledge-layer record it came from.

**Source of truth remains:** `data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`. If a future phase needs a value corrected, it is corrected there, and the projection is regenerated — never edited by hand.

## Two projection files, one route hint each

- `data/projections/tapping/tapping-profiles.json` (`projection_type: tapping_profile_projection`) — one row per tapping_profile record (29 total: 14 metric + 8 UNC + 7 UNF), covering the unified metric/UNC/UNF domain in a single file rather than three separate ones, per your instruction that the projection support one future unified tapping explorer.
- `data/projections/tapping/tap-types.json` (`projection_type: tapping_tap_type_projection`) — one row per `tap_type` entity (7 total), preserving the classified `application_notes` from T2.2.

Both are new sibling projection types alongside the existing `reference_page` / `chart` / `tool` / `api` / `atlas_page` types — not a parallel architecture. `scripts/validators/validate-projections.js` was extended (2-line addition to its schema registry) to recognize them, exactly as it already recognizes the other five.

## Verification-state preservation

Every `tap_drill.status`, `alternative_drill.status`, and `data_quality.record_status` field is copied **verbatim** from its source knowledge-layer record. The projection never promotes `source_bound` to `verified`, and never downgrades `verified` because a second source exists (this is exactly the situation with the 6 UNC/UNF sizes where an ISO 2306 alternative exists — the customary drill stays at its own status, unaffected). `docs/architecture/tapping-projection-validation-report.md`'s "Verification-State Correctness" check confirms this mechanically, not just by convention.

## US customary drill vs. ISO 2306 alternative — kept structurally separate

Per your standing governance rule, these are never merged:

- `tap_drill` — the profile's primary value (metric: ISO-2306-table-matched and VERIFIED; UNC/UNF: US-customary, `source_bound`).
- `alternative_drill` — **present only for UNC/UNF rows**, `null` for metric (since metric's own convention already *is* the ISO 2306 value — there is no second convention to represent). It carries its own `value`, `unit` (always `mm`), `standard_id`, `status`, and an explicit `meaning` string warning against merging.

The dedicated validator's "ISO 2306 Alternative Structural Correctness" check mechanically confirms every UNC/UNF row has one, every metric row doesn't, and that no `alternative_drill` is ever value-identical to its sibling `tap_drill` (which would indicate an accidental merge).

## Engagement model: capability, not recommendation

Every row's `engagement` block is **identical in shape and content** across all 29 rows — it represents the *model*, not a per-thread calculation, because no per-thread engagement value has been calculated or verified anywhere in the knowledge layer:

- `radial.calculation_status: "calculable"`, `radial.target_percent: null` (always) — the formula is real and usable by a future consumer, but BoltLab asserts no target.
- `axial.calculation_status: "not_calculable"` (always, by schema `const`) — blocked on missing material shear-strength data, per `thread-engagement-model.md`.

The dedicated validator greps the entire serialized projection for a non-null `target_percent` and for the literal string "75%" / "75 percent" (outside of URLs) and fails the build if either appears — this is a mechanical guardrail against exactly the mistake this whole T2.x sequence was designed to prevent, not just a documented intention.

## Tap-type evidence classification preserved

`tap-types.json` keeps T2.2's four-way classification (`general_taxonomy` / `manufacturing_characteristic` / `typical_application` / `manufacturer_specific_recommendation`) and per-fact `status` (`verified` / `source_bound`) intact, split into three arrays per tap type rather than flattened into one description string. `evidence_status` on each row gives a quick verified-vs-source-bound count (1 verified fact total across all 7 types, matching T2.2 exactly).

## Hole-preparation taxonomy: not re-flattened

The projection does not introduce a `hole_type` field anywhere. It doesn't project the 5 `hole_preparation` entities as rows at all in this phase (no tapping_profile record references more than one hole_preparation type — every profile's `hole_preparation.type` is `"pilot_hole"`), so there was nothing to flatten. The dedicated validator still spot-checks that the underlying knowledge-layer entities retain ≥2 distinct `taxonomy_axis` values, guarding against a future regression.

## Standards resolution

Each row's `standards` array is built directly from its source tapping dataset's `source_standards` list (not inferred from naming similarity), resolved against the actual standard records for `organization`/`designation`/`edition`/`title`/`verification_state`. Metric rows resolve to 5 standards (`iso_261`, `iso_262`, `iso_724`, `iso_965_1`, `iso_2306`); UNC/UNF rows resolve to 2 (`asme_b1_1`, `iso_2306`).

## Determinism

The generator (`scripts/generators/generate-tapping-projections.js`) uses a fixed `BUILD_DATE` constant (not `new Date()`), sorts every array it builds (dataset records by ID, related-entity/standard/dataset unions), and performs no I/O beyond reading the knowledge layer and writing the two output files. Run three times against an identical knowledge-layer state in this phase; all three runs produced byte-identical SHA-256 checksums for both output files (see `audit/t3-tapping-projection.json`).

## Future consumers

This projection is designed to answer "show me everything known about M8×1.25 tapping" in one read, suitable for a future Atlas page, API endpoint, CSV export, or calculator — without requiring another knowledge-layer rewrite. None of those consumers exist yet; this phase stops at the projection.
