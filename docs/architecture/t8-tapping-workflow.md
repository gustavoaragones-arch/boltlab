# Tapping Workflow (T8)

Date: 2026-08-16

## Product objective

`/tools/tapping-workflow` gives a user a guided, three-step decision path — select thread system, select designation, get a compact result covering tap-drill data, ISO 2306 alternative, relevant tap types, and standards — instead of requiring them to search the full Atlas table or read the Tap-Type Guide end to end. It is a **third consumer** of the T3 projection layer, alongside T4 (full data explorer) and T5 (tap-type reference), not a replacement for either.

## Data sources and projection chain

```
data/projections/tapping/tapping-profiles.json   (T3, unchanged)
data/projections/tapping/tap-types.json          (T3, unchanged)
        ↓
scripts/generators/generate-tapping-workflow.js  (reads ONLY these two files)
        ↓
js/tapping-workflow-data.js   (generated data artifact, window.BoltLabTappingWorkflowData)
tools/tapping-workflow.html   (generated page, client-side interaction only)
```

No raw `data/entities/`, `data/datasets/`, or `data/relationships/` file is read by the generator. `js/tapping-workflow-data.js` is itself a **build artifact** — generated fresh from the projection every run, not a second authored data source — following the same `window.BoltLabDrillData`-style convention already used by `js/drill-data.js` and `js/thread-data.js` elsewhere on the site.

## User workflow

**Step 1 — Select thread system.** A `<select>` populated at page-load time from the embedded data (Metric / UNC / UNF — whichever systems the projection actually contains; nothing hardcoded).

**Step 2 — Select thread designation.** Appears once a system is chosen; its options are built client-side by filtering the embedded profile list to the selected system, sorted alphabetically. No designation string is written into the static HTML template.

**Result.** On selecting a designation, a result card renders: thread identity, primary tap-drill value with its own verification badge, the ISO 2306 alternative (only if the record has one), relevant tap types (as full application-note cards, matching classifications), and resolved standards.

**Hole preparation.** A fixed, honest paragraph (not per-record, since the projection carries no per-thread hole-geometry/function data): the primary tap-drill value represents the pilot-hole diameter, and hole geometry/function are separate, non-per-thread concepts in BoltLab's knowledge layer today.

**Thread engagement.** A fixed section stating the exact required limitation sentence, with no per-record calculation.

## Verification semantics preserved

Every result explicitly separates two states, exactly as the projection carries them:

- **Tap drill: Verified / Source-bound** — the specific field's status.
- **Overall profile status: Source-bound** (always, for all 29) — because engagement/process-parameter data remain unavailable dataset-wide. The client script never derives one from the other; both come directly from `tap_drill.status` and `data_quality.record_status` respectively.

## ISO 2306 alternative handling

Rendered only when `alternative_drill` is non-null on the source record (true for the 15 UNC/UNF profiles, never for the 14 metric ones). Labeled exactly "ISO 2306 alternative drill," accompanied by the exact required explanatory sentence, and never combined with the primary value in the same display line.

## Tap-type handling

Each relevant tap type renders as its own card with all four classifications (`general_taxonomy`, `manufacturing_characteristics`, `typical_applications`, `manufacturer_specific_recommendations`) as separate labeled lists — the same rendering pattern established in T4/T5/T6, reused here rather than reinvented. Where a tap type has no facts in a given classification, that section is simply omitted — nothing is manufactured to fill it.

## Engagement limitation

No numeric engagement value appears anywhere. The dedicated validator greps the entire generated HTML and embedded data file for 70%/75%/77% and diameter-multiplier patterns and fails the build if any appear, and separately confirms every embedded profile's `engagement.radial.target_percent` is `null` and `engagement.axial.calculation_status` is `"not_calculable"`.

## Provenance

Every tap-drill value's `provenance` object (source dataset, record, field, and cross-check note where present) is carried into the embedded data unmodified from the projection; the validator confirms byte-for-byte fidelity per record, not just presence.

## Validation

`scripts/validators/validate-tapping-workflow.js` runs 12 checks: full record/tap-type coverage (no silent drop), fact-level fidelity for designation/tap-drill/standards, ISO-alternative correctness (present only where sourced, never merged), tap-type classification separation with no `general_taxonomy` loss, verification-label logic presence, engagement-field unavailability plus forbidden-pattern scanning, required UI element presence, no hardcoded designation `<option>` tags, exact required wording presence, and canonical/`.html`-href/broken-link checks.

## Determinism

The generator emits two files (`js/tapping-workflow-data.js`, `tools/tapping-workflow.html`) with a fixed build date and no unordered iteration. Run 3 times in this phase: identical SHA-256 checksums for both files across all runs.

## Regression results

`data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`, and `downloads/tapping-atlas.csv` are all byte-identical to their pre-T8 baselines. `reference/tapping-atlas.html` and `reference/tap-type-guide.html` changed **only** because this phase added one explicitly-justified discovery link to each (a new "Tapping Workflow" list item in each page's existing related-links section) — documented separately in `audit/t8-change-scope.md`, not a redesign of either product.

## Files changed

See `audit/t8-change-scope.md` for the complete accounting.

## Deferred opportunities

- A link from `reference/thread-atlas.html` to the workflow was considered but not added — that file is generator-produced by a pipeline outside the tapping domain (same reasoning as T7's deferral of the reverse-direction link).
- The workflow currently only supports one designation at a time; a compare-two-designations mode was considered out of scope for this phase (no data gap, purely a UX expansion for a future phase if wanted).
