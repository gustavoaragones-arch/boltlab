# T1 — Tapping & Threading Data Foundation

Date: 2026-08-14
Status: **KNOWLEDGE FOUNDATION ESTABLISHED — 0 PRODUCTION FILES CHANGED**

## 1. Architecture Changes

Extended, did not replace, the existing Knowledge Engine architecture (`docs/architecture/knowledge-engine-architecture.md`). Pipeline discipline preserved: `KNOWLEDGE → RELATIONSHIPS → PROJECTIONS → GENERATORS → PRODUCTS`, and T1 stops after `RELATIONSHIPS`. No projection, generator, or HTML file was created or modified. Full design rationale in `docs/architecture/tapping-data-foundation.md`.

## 2. Schema Changes

Two backward-compatible, additive extensions — no existing record needed to change to remain valid:

- **`data/schemas/entity.schema.json`**: `entity_type` enum extended with `tap_type`, `hole_preparation`, `tapping_operation` (5 existing values untouched).
- **`data/schemas/dataset.schema.json`**: `verification_method`, `last_reviewed`, `license_notes` changed from `string`-only to `["string","null"]`/nullable-date, so the contract can honestly represent an unpopulated pending state; added an optional (not required) `status` enum (`verified`/`source_bound`/`pending_verification`/`unavailable`) for dataset-level data-quality state beyond the existing boolean `verified` flag. The 3 pre-existing dataset files were not modified and remain valid against the updated schema (the new fields are additive/optional).
- **`data/schemas/relationship.schema.json` and `data/schemas/standard.schema.json`**: **not modified.** Every tapping relationship needed was expressible using the existing 8-predicate vocabulary; documented explicitly in Section 12 of the architecture doc rather than left implicit.

## 3. Entity Changes

14 new records appended to the existing single-file `data/entities/entities.seed.json` (no new file created — entities are not split across files in this architecture, and no existing record was touched):

| Type (new) | Count | IDs |
|---|---|---|
| `tap_type` | 7 | taper_tap, plug_tap, bottoming_tap, spiral_point_tap, spiral_flute_tap, forming_tap, hand_tap |
| `hole_preparation` | 5 | pilot_hole, through_hole, blind_hole, tapped_hole, clearance_hole |
| `tapping_operation` | 2 | cut_tapping, form_tapping |

Every definition is structural/descriptive (what the concept *is*), never an application recommendation, torque/speed/feed value, or standards-specific numeric claim. `tapping_profile` was deliberately **not** made an entity type — see architecture doc Section 3 for why (it is a per-thread application record, not a stable concept, and belongs in the dataset layer instead).

## 4. Dataset Changes

3 new files, 0 existing dataset files modified:

| File | Records | Verified (top-level) | Status (top-level) |
|---|---|---|---|
| `data/datasets/metric_tapping.seed.json` | 14 | `false` | `source_bound` |
| `data/datasets/unc_tapping.seed.json` | 3 | `false` | `source_bound` |
| `data/datasets/unf_tapping.seed.json` | 3 | `false` | `source_bound` |

Every record's `hole_preparation.value` is a direct, provenance-tagged reuse of the corresponding already-verified `tap_drill_mm` / `tap_drill_in` field from the pre-existing `metric_threads` / `unc_threads` / `unf_threads` datasets (`verified: true`, reviewed 2026-07-12) — **no new numeric value was invented, estimated, or sourced externally.** `thread_engagement` and `tapping_parameters` are `null`/`"unavailable"` on all 20 records — no verified source exists for engagement percentages, tapping speeds, feeds, torque, or material-specific recommendations anywhere in the repository, so none were populated.

**Existing datasets (`metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`) were read but not modified.** No existing numerical value was changed anywhere.

## 5. Relationship Changes

15 new records appended to the existing single-file `data/relationships/relationships.seed.json` (0 existing relationship records touched). All 15 use the existing `RELATES_TO` predicate — **no new relationship predicate type was introduced**; every needed connection was expressible with the existing 8-predicate vocabulary (documented decision in the architecture doc, Section 12). Every one of the 14 new entities has at least one relationship — 0 orphans among new entities, confirmed by `validate-knowledge-engine.js`'s Graph Health check.

## 6. Standards Integration

- Reused 5 already-existing, already-verified standard records as `source_standards` on the new datasets: `iso_261`, `iso_262`, `iso_724`, `iso_965_1` (metric), `asme_b1_1` (unified) — directly evidenced, since these are the same standards backing the source thread datasets the tapping data derives from.
- **ISO 2306 and ISO 2857 (the standards most specific to tapping engineering) were inspected for and confirmed absent from the knowledge layer.** They were **not created.** No `public_summary`/`scope` source material for them exists in this repository, and governance explicitly prohibits creating a standard record "merely because it appears relevant." Documented as an open, named gap for a future dedicated standards data-acquisition phase.
- No entity was related to any standard via `DEFINED_BY` (which would overclaim that a standard specifically defines a tapping concept) — no such relationship currently exists.

## 7. Provenance Model

Every populated numeric value traces via `source_dataset` + `source_record` + `source_field` back to a real, pre-existing, independently-verified BoltLab record. Mechanically enforced by the new validator's "Verified Values Require Provenance" and "No Anonymous Numeric Values" checks (both pass, 0 errors). No "industry standard," "commonly recommended," or unattributed value exists anywhere in the new data.

## 8. Data-Quality States

Formal 4-state vocabulary (`verified`/`source_bound`/`pending_verification`/`unavailable`) applied consistently at both the dataset level and the per-field-block level within every record. Full definitions and the explicit "null does not mean zero" policy statement are in `docs/architecture/tapping-data-foundation.md`, Section 10.

## 9. Verified Record Count

**20 of 20 tapping-profile records carry exactly one verified field-block each** (`hole_preparation`, sourced by reference — see Section 4). **0 records are fully "verified" as a complete tapping engineering product** (top-level record `status` is `source_bound` on all 20, because `thread_engagement` and `tapping_parameters` remain unavailable on every record).

## 10. Pending Record Count

**0** — no field anywhere is marked `pending_verification`. (Fields without a verified source are marked `unavailable`, not `pending_verification`, since `pending_verification` implies an intended field actively being sourced; these are simply not yet started.)

## 11. Unavailable Record Count

**40 field-blocks** (`thread_engagement` × 20 records + `tapping_parameters` × 20 records) are marked `unavailable`, all fields within them `null`.

## 12. Validation Results

| Validator | Status | Errors | Warnings |
|---|---|---|---|
| `validate-knowledge-engine.js` (existing, unmodified) | **pass** | 0 | 0 |
| `validate-tapping-domain.js` (new, dedicated — mirrors the existing `validate-projections.js` pattern of a specialized validator alongside the core one) | **pass** | 0 | 5 (all informational: record/relationship counts, delegation notice) |

Knowledge-engine counts after T1: 24 entities (was 10), 6 standards (unchanged), 6 datasets (was 3), 41 relationships (was 26).

**Empty-state requirement independently proven, not merely asserted:** a synthetic dataset (`_t1_empty_test`, `records: []`, `verification_method`/`last_reviewed`/`license_notes` all `null`) was created, validated (pass, 0 errors), then deleted. Full detail in `audit/t1-tapping-change-scope.md`.

## 13. Production Files Changed

**0.** No HTML file, CSS file, JS production file (other than the new validator script under `scripts/validators/`), `sitemap.xml`, navigation, Thread Atlas page, Tap Drill Calculator UI, or legal page was created, modified, or deleted. Confirmed via `git status` — zero `.html` files appear in the diff.

## Fabricated Engineering Values

**0**, mechanically confirmed by the new validator's "No Anonymous Numeric Values" check and by construction (every populated value is a direct, cited reuse of a pre-existing verified BoltLab record; no value was estimated, calculated, or sourced from outside the repository).

## Final Status

T1 stops here. No projection, generator, HTML, Tapping hub, or Tap Drill Atlas was created. Nothing was committed or pushed — see `audit/t1-tapping-change-scope.md` for the full working-tree accounting.
