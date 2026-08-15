# Tapping & Threading Data Foundation (Phase T1)

## 1. Purpose

This document establishes the knowledge/data foundation for a new BoltLab engineering domain: **Tapping & Threading**. It extends the existing Knowledge Engine architecture (`docs/architecture/knowledge-engine-architecture.md`) rather than creating a parallel one. T1 stops at the **KNOWLEDGE** layer of the pipeline:

```
KNOWLEDGE → RELATIONSHIPS → PROJECTIONS → GENERATORS → PRODUCTS
   ^^^^^^^^^^^^^^^^^^^^^^
   T1 scope ends here
```

No projection, generator, or production page was created or modified in this phase.

## 2. Scope

T1 establishes: entity taxonomy for tap types, hole preparations, and tapping operations; a tapping-profile dataset architecture; a provenance model; formal data-quality states; validation rules; and this documentation. T1 explicitly does **not** populate unsupported engineering values (thread engagement targets, tapping speeds, feeds, torque, or material-specific recommendations) — those fields exist in the data model but are `null` with an explicit `"unavailable"` status everywhere in this repository, because no verified source for them currently exists in BoltLab's knowledge layer.

## 3. Entity Model

Extended `data/schemas/entity.schema.json`'s `entity_type` enum with three new values, added in a backward-compatible way (additive enum values only; no existing entity records were touched):

- `tap_type` — a controlled taxonomy of tap styles.
- `hole_preparation` — a controlled taxonomy of hole states/roles.
- `tapping_operation` — a controlled taxonomy of tapping process categories.

**Decision: `tapping_profile` was deliberately NOT added as an entity type.** A tapping profile is a per-thread *application record* (thread + operation + resulting values), not a stable, reusable *concept* like the existing entity types (`thread_geometry`, `fit_class`, `thread_system`, `tolerance_concept`, `standard_concept`) or the three new ones above. Representing one tapping-profile entity per thread designation would mean hundreds of near-duplicate "concept" records and would not fit `entity.schema.json`'s shape (no `thread_id`, `operation`, or `status` fields exist there, and adding them would break the schema's "stable named concept" semantics). Tapping profiles are instead represented as **dataset records** — see Section 8.

14 new entity records were added to the existing `data/entities/entities.seed.json` (single file, per the existing architecture — entities are not split across multiple files):

| Type | Count | IDs |
|---|---|---|
| `tap_type` | 7 | `taper_tap`, `plug_tap`, `bottoming_tap`, `spiral_point_tap`, `spiral_flute_tap`, `forming_tap`, `hand_tap` |
| `hole_preparation` | 5 | `pilot_hole`, `through_hole`, `blind_hole`, `tapped_hole`, `clearance_hole` |
| `tapping_operation` | 2 | `cut_tapping`, `form_tapping` |

Every new entity uses `"status": "draft"` (the existing entity schema's own status enum already supports `draft`/`active`/`deprecated`; no schema change was needed here). Every definition is a general, structural, non-numeric description of what the concept *is* (e.g., "a tap with a gradually tapered chamfer... engaging several threads before reaching full thread form") — never a usage recommendation, torque value, speed value, or claim tied to a specific standard. This matches the existing Data Methodology's "Reference/context data" tier: explanatory/organizational information, not verified numeric source data.

No existing entity record was modified.

## 4. Tapping Profile Model

A tapping profile is represented as a record inside a tapping dataset's `records` array (see Section 8), not as a standalone entity or relationship. Conceptually:

```
THREAD (existing dataset record, e.g. metric_threads "M6x1")
    ↓
TAPPING PROFILE (new record: operation, tap_type_id, hole_preparation, thread_engagement, tapping_parameters)
```

Every tapping profile record carries a `tapping_profile_id`, a `thread_id` + `thread_source_dataset` reference back to the existing verified thread dataset it applies to, an `operation` (currently always `"cut_tapping"`, since only cut-tapping data exists), an optional `tap_type_id` (currently `null` on every record — no verified source ties a *specific* tap type to a *specific* thread size yet), and three structured sub-objects: `hole_preparation`, `thread_engagement`, `tapping_parameters` — each independently carrying its own `status`.

## 5. Tap Taxonomy

A controlled vocabulary only (7 entities, Section 3) — not a recommendation engine. No tap type entity carries an application recommendation ("use X for Y"); each definition describes only the tap's physical/structural characteristics.

## 6. Hole Preparation Model

A controlled vocabulary of 5 entities (Section 3) that explicitly separates "hole state" from "thread property." Per governance, **tap-drill size is never treated as an intrinsic property of a canonical thread entity** — it is represented as an application/data value on a tapping-profile record's `hole_preparation.value` field, sourced from an existing verified thread dataset with full provenance (see Section 8). The conceptual chain is:

```
THREAD → TAPPING PROFILE → HOLE PREPARATION → TAP DRILL VALUE (sourced, not intrinsic)
```

## 7. Thread Engagement Model

Every tapping profile record has a `thread_engagement` object with fields `target_engagement_percent`, `engagement_length`, `engagement_basis`, `calculation_method`, `source`, and `status`. **On every record in this repository, all value fields are `null` and `status` is `"unavailable"`.** No default engagement percentage (50%, 60%, 75%, or any other value) was inserted anywhere. No engineering recommendation was inferred.

## 8. Dataset Architecture

Three new dataset files, structurally consistent with the existing `dataset.schema.json` contract and the existing dataset family pattern (`metric_threads`, `unc_threads`, `unf_threads`):

- `data/datasets/metric_tapping.seed.json` — 14 records
- `data/datasets/unc_tapping.seed.json` — 3 records
- `data/datasets/unf_tapping.seed.json` — 3 records

**Record provenance — this is the central design decision of T1.** Each tapping-profile record's `hole_preparation.value` was populated by direct reference to the corresponding, already-verified BoltLab thread dataset (`metric_threads`, `unc_threads`, `unf_threads` — all pre-existing, `verified: true`, reviewed 2026-07-12). No new external source, website, or calculation was introduced. Every populated value carries `source_dataset`, `source_record`, and `source_field`, e.g.:

```json
{
  "tapping_profile_id": "tap_m3x0_5_cut",
  "thread_id": "M3x0.5",
  "thread_source_dataset": "metric_threads",
  "operation": "cut_tapping",
  "tap_type_id": null,
  "hole_preparation": {
    "type": "pilot_hole", "value": 2.5, "unit": "mm", "status": "verified",
    "source_dataset": "metric_threads", "source_record": "M3x0.5", "source_field": "tap_drill_mm"
  },
  "thread_engagement": { "...": "all null, status: unavailable" },
  "tapping_parameters": { "...": "all null, status: unavailable" },
  "status": "source_bound"
}
```

Every dataset's top-level `verified` flag is `false` and `status` is `"source_bound"` — accurately reflecting that the *hole-preparation* fields are traceable/verified by reference, but the dataset as a whole is not yet a complete, independently-verified tapping engineering product (thread engagement and process parameters remain unavailable). This is a deliberately conservative characterization, consistent with Section 14's data-quality policy.

## 9. Provenance Model

Extends, does not replace, the existing dataset-level provenance fields (`verification_method`, `primary_sources`, `last_reviewed`, `license_notes`, `source_standards`). At the *record* level, every value-bearing sub-object (`hole_preparation`, `thread_engagement`, `tapping_parameters`) carries its own `status` and, when populated, explicit `source_dataset` / `source_record` / `source_field` pointers. The chain required by governance —

```
SOURCE → CLAIM/VALUE → DATASET RECORD → (future) PROJECTION → (future) USER-FACING PRODUCT
```

— is fully traceable today for every populated `hole_preparation` value: a user (or future generator) can follow `source_dataset` + `source_record` + `source_field` straight back to the exact pre-existing verified record that produced it. No anonymous numeric value, "industry standard" citation, "commonly recommended" citation, or search-result-derived value exists anywhere in the new datasets — this is mechanically checked (see Section 12, "No Anonymous Numeric Values").

## 10. Data-Quality States

Formal vocabulary, used consistently across every new dataset and record's `status` field:

| State | Meaning |
|---|---|
| `verified` | Authoritative source identified, value verified, safe for user-facing engineering data products. |
| `source_bound` | Source identified, data exists, normalization/verification still required — not yet safe to present as fully BoltLab-verified data. |
| `pending_verification` | Field/value exists conceptually but no authoritative source has been established — must not appear as authoritative user-facing data. |
| `unavailable` | No value is currently available — must not be inferred. |

**NULL DOES NOT MEAN ZERO. UNKNOWN DOES NOT MEAN STANDARD VALUE. ABSENT DATA MUST NOT BE FILLED BY GUESSING.** Every `null` field in every tapping dataset in this repository reflects a genuine absence of verified data, not an implicit zero or default.

**Unverified engineering values must not be presented as authoritative BoltLab data.** **An empty dataset is an intentional valid state when authoritative engineering data has not yet been verified** — proven directly in this phase (a synthetic empty-records, all-null-metadata test dataset was created, validated with `validate-knowledge-engine.js` (0 errors), then removed).

## 11. Standards Relationships

Inspected existing standards records (`data/standards/*/standards.seed.json`) before adding anything. Findings:

- **ISO 261, ISO 262, ISO 724, ISO 965-1** (metric) and **ASME B1.1** (unified) already exist and were reused as `source_standards` on the new tapping datasets — these are the same standards already backing the source thread datasets the tapping data derives from, so this reuse is directly evidenced, not assumed.
- **ISO 2306 (tap and reamed hole tolerances) and ISO 2857 (tapping screw threads) do not exist in the knowledge layer** and were **not created**. These are the standards most specifically relevant to tapping engineering (tap-drill tolerancing, thread-forming screw geometry), but BoltLab has no verified `public_summary`/`scope` source material for them. Per governance ("do not create a standard record merely because a standard appears relevant... do not fabricate standards coverage"), this is documented as an open gap for a future, dedicated standards data-acquisition phase — not filled with placeholder or assumed content.
- No new tapping entity was related to any standard via `DEFINED_BY` (which would claim the standard specifically defines that tapping concept — not currently supportable). No standards relationship was fabricated.

## 12. Relationship Types

**No new relationship predicate type was introduced.** All 15 new relationship records use `RELATES_TO`, an existing predicate already in `relationship.schema.json`'s enum. Every candidate tapping relationship (thread↔tapping-profile association, tapping-profile↔tap-type, tapping-profile↔hole-preparation, dataset↔source, standard↔concept) was checked against the existing 8-predicate vocabulary (`USES`, `DEFINED_BY`, `PART_OF`, `MEASURED_WITH`, `COMPARED_WITH`, `RELATES_TO`, `DERIVED_FROM`, `SUPPORTED_BY`) and found expressible without extension. This is a deliberate outcome of following governance's explicit instruction not to introduce redundant relationship types.

15 new relationship records were added to the existing `data/relationships/relationships.seed.json` (single file, per existing architecture), connecting: `cut_tapping` to 5 cutting-style tap types; `form_tapping` to `forming_tap`; `hand_tap` to its 3 common chamfer styles; `pilot_hole` to `tapped_hole`/`through_hole`/`blind_hole`; `clearance_hole` to `tapped_hole`; `spiral_point_tap` to `through_hole`; `spiral_flute_tap` to `blind_hole`. Every new entity has at least one relationship (0 orphans among the 14 new entities, confirmed by `validate-knowledge-engine.js`'s Graph Health check).

## 13. Validation Rules

A dedicated validator, `scripts/validators/validate-tapping-domain.js`, was created alongside (not merged into) the existing `validate-knowledge-engine.js` — mirroring the repository's existing pattern of specialized validators (`validate-projections.js` already coexists the same way). It implements all 15 required checks: unique `tapping_profile_id`; valid thread references (and, by construction, orphan detection — a tapping record whose `thread_id` doesn't exist in its named source dataset fails this same check); valid `tap_type_id` references; valid `hole_preparation.type` references; valid dataset references; valid relationship predicate types for tapping-domain edges; valid provenance status values; verified values require full provenance; pending/unavailable values cannot carry a populated value; units required wherever a numeric value is populated; no anonymous numeric values (checked against a banned-phrase list: "industry standard," "commonly recommended," etc.); no duplicate tapping dataset IDs; empty datasets pass validation (proven, not merely asserted); and a delegated cross-reference to the core knowledge-engine validator for the generic (non-tapping) record set.

Result: **pass, 0 errors, 5 informational warnings** (record counts and a delegation notice — none indicate a defect).

## 14. Empty-State Policy

An empty `records: []` array is a fully valid, intentional dataset state. It is preferable to any fabricated, estimated, or externally-copied engineering value. This was directly demonstrated (Section 10) rather than assumed.

## 15. Verified-State Policy

A record's `hole_preparation` (or any future field) may only carry `"status": "verified"` if it also carries `source_dataset`, `source_record`, and `source_field` pointing to a real, existing, independently-verified BoltLab record, and a non-null `value` + `unit`. The dedicated validator enforces this mechanically (`Verified Values Require Provenance` check) — a record cannot claim `verified` status without carrying its receipts.

## 16. Prohibited Assumptions

Explicitly not done anywhere in this phase, and mechanically checked where feasible:
- No synthetic or estimated tap-drill, engagement, speed, feed, or torque value was introduced.
- No value was copied from a generic website or "common knowledge."
- No value was mathematically derived (e.g., no "75% thread engagement" formula was applied) — T1 does not authorize a derivation methodology; that is explicitly deferred to a future phase.
- No default engagement percentage was inserted.
- No tap type was assigned to a specific thread as a recommendation.
- No new standard (ISO 2306, ISO 2857) was fabricated to make the domain look more complete than it verifiably is.

## 17. Future Projection Path

T1 stops at the knowledge layer. A future phase (not authorized here) would: (a) optionally acquire and verify ISO 2306/ISO 2857 standard records and thread-engagement source data; (b) build `data/projections/tapping/*.reference.json` or `*.dataset.json` projections consuming this knowledge, following the existing `projection-engine.md` contract (reference-first, versioned, no page-owned facts); (c) build a dedicated generator consuming those projections; (d) only then generate any HTML (a Tapping hub, a Tap Drill Atlas, or an update to the existing Tap Drill Calculator UI) — none of which T1 performed.
