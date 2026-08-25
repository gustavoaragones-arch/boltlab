# T19 — Tapping Domain Residual Integrity Audit (Post-T18 Discovery)

Date: 2026-08-25
Type: **READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t19-residual-integrity.json](t19-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except 11 pre-existing untracked files (`.DS_Store`, `.claude/`, `audit/d2-0-*`, `css/.DS_Store`, `images/.DS_Store`, `images/heads/.DS_Store`, `images/logo.ai`, `images/screw-drive-types/.DS_Store`, `images/screw-head-types/.DS_Store`) — none touched.
- HEAD: `3c27e422ec99d49988d618f9d95e8199bc9e2367`
- `origin/main`: matches HEAD.
- `git log -8`: T18's commit (`T18: Verify thread block engineering values against authoritative datasets`) is present at HEAD, preceded by T17, T16, T15, T14, T13, T12, T11 in order.

**Gate PASSES.** Proceeding with discovery.

## 1–2. Purpose and closed-seam certification

Ran `node scripts/validators/validate-tapping-projections.js` directly against real, untouched data: **PASS, 0 errors, 0 warnings, 14 checks**. Confirmed by direct read of the validator file that all six named guards are present, structurally intact, and unmodified this session:

| Phase | Check name | Index | Present | Passing |
|---|---|---|---|---|
| T13 | Tap-Drill Status Correctly Derived From Source Cross-Verification | 10 | Yes | Yes |
| T14 | Tap-Drill Convention and Cross-Check Narrative Correctly Derived From Source Cross-Verification | 11 | Yes | Yes |
| T15 | Application-Note Completeness (source-fidelity clause) | 9 | Yes | Yes |
| T16 | Standards Denormalized Fields Match Authoritative Standard Record | 12 | Yes | Yes |
| T17 | Tap-Type Relationship Membership Matches Authoritative RELATES_TO Graph | 13 | Yes | Yes |
| T18 | Thread Block Engineering Values Match Authoritative Thread Dataset Record | 14 | Yes | Yes |

None reopened; none modified.

## 3. Complete projection inventory

Re-read `generate-tapping-projections.js` (320 lines) and `validate-tapping-projections.js` (unchanged since T18, now 14 checks) in full. Full per-field table is in the JSON (`projection_field_inventory`) — it supersedes T18's table only by adding the fields newly scrutinized this phase; no field previously classified changed classification.

## 4–6. Next trust seam / identity-join audit — the finding

Walked every join/lookup in `generate-tapping-projections.js`:

| Join | Key | Uniqueness confirmed | Existing check proves identity (not just existence)? |
|---|---|---|---|
| `findBaseThreadRecord`: `profile.thread_id` → thread dataset `designation` | `designation` | Yes — 0 duplicate designations in `metric_threads.seed.json` (14), `unc.seed.json` (8), `unf.seed.json` (7), confirmed by direct scan | **Yes — T18** |
| `operation` → `relationships.seed.json` `RELATES_TO` edges | entity id | N/A (relationship records, not a designation key) | **Yes — T17** |
| `standardById.get(id)` for `standards[]`/`alternative_drill.standard_id` | standard id | Enforced by `entityById`/`standardById` map construction (last-write-wins is moot — no duplicate standard ids found) | Existence — T2 (check 2); content — **T16** |
| `tap_types[]` entity existence | entity id | N/A | Existence — check 2 |
| **`hole_preparation.source_dataset` / `.source_record` / `.source_field`** — a self-declared provenance pointer inside every tapping-dataset record, meant to identify exactly which field of which record in which dataset justifies `hole_preparation.value` | `source_dataset` (dataset id) + `source_record` (designation) + `source_field` (field name) | Yes — same designation-uniqueness scan above (this join lands in the identical thread datasets) | **NO — existence/presence only** |

The last row is the finding. `hole_preparation.source_dataset`/`source_record`/`source_field` are carried straight into the projection as `tap_drill.provenance.{source_dataset,source_record,source_field}` (`buildTapDrillBlock()`), and `tap_drill.value`/`.unit` are copied from `hole_preparation.value`/`.unit` on the exact same record. **Nothing anywhere in the repository ever dereferences that pointer and confirms `tap_drill.value` actually equals the value sitting at `source_dataset.records[source_record].[source_field]`.**

Confirmed by exhaustive check:
- `validate-tapping-projections.js` check 3 (provenance completeness): presence only (`!p.source_dataset || !p.source_record || !p.source_field`).
- `validate-tapping-domain.js` checks 4/5/8/9/10 (`holePrepCheck`, `datasetRefCheck`, `provenanceCheck`, `unitsCheck`, `anonCheck`): validate the *type* is a known `hole_preparation` entity type, the *dataset id* exists in the knowledge layer, provenance fields are non-empty when `status === "verified"`, `unit` is present when `value` is present, and the source isn't fully anonymous — **never dereferences `source_record`/`source_field` to fetch an actual value.**
- `validate-tapping-terminology.js` check 8 (`checkProvenanceValue` calls at lines 237–241): compares the **rendered Atlas HTML text** for "Source dataset"/"Source record"/"Source field" against the **projection's own provenance strings** — a consumer-fidelity check (product matches projection), not a source-fidelity check (projection matches the dereferenced knowledge value). Grepped repo-wide for `source_field` across every validator — these are the only four files that reference it, and none performs the dereference.
- T13/T14 (checks 10/11) independently re-derive `status`/`convention`/`provenance.{source,cross_check}` from `hole_preparation.cross_verified` — a *different* sibling object on the same record, never touching `.value` itself.
- T18 (check 14) independently re-derives the **thread block** from the thread dataset via a **different join** (`profile.thread_id` → `designation`) — a structurally separate lookup from `hole_preparation`'s own self-declared provenance pointer, even though both joins happen to land in the same thread dataset files for most records.

**Concretely:** `tap_drill.value` (rendered as "Primary tap drill: X mm/in" — the single most prominent number on every Atlas card, Workflow result, and Evidence detail, plus the CSV's `primary_tap_drill` column) carries an explicit, structured claim about exactly where it came from (`source_dataset`/`source_record`/`source_field`), and that claim is displayed verbatim to users as the record's "Data provenance." If `hole_preparation.value` were ever hand-edited to diverge from the field it claims to cite — or if the *cited* thread-dataset field were corrected and this tapping-dataset record's `value` were never re-synced — every current check, including the provenance-completeness and provenance-consumer-fidelity checks, would keep passing, because they only confirm the pointer *exists* and is *rendered consistently*, never that it *resolves to the value being displayed next to it*.

## 5. Multi-source/composite field audit — confirmation this is the right kind of finding

This is exactly the composite-field risk the brief points at: `tap_drill.value`'s correctness depends on **two** source values agreeing — the `hole_preparation.value` literal on the tapping-dataset record, and the field it names on a **separate** thread-dataset record. T18 closed the analogous risk for the thread block (`thread.*` fields, joined via `profile.thread_id` → `designation`); this is the same risk shape applied to the tap-drill value, joined via `hole_preparation`'s own declared pointer — a distinct join, a distinct field, previously untouched.

**Direct-inspection confirmation (current data, real files, read-only):** wrote a read-only re-derivation across all 29 tapping-dataset records (`metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`): for each, resolved `hole_preparation.source_dataset` → the named thread dataset, found the record by `source_record === designation`, read `[source_field]`, and compared to `hole_preparation.value`. **0 mismatches across 29 records.** Also confirmed `unit`/`source_field` pairing is consistent repo-wide: only two combinations exist (`{"unit":"mm","field":"tap_drill_mm"}`, `{"unit":"in","field":"tap_drill_in"}`), matching the two thread-system branches exactly. Current data is correct; the gap is exclusively the missing regression guard — identical in shape to T13–T18 at their own discovery stage.

## 7–13. Remaining audit sections

- **Unit/semantic fidelity (7):** `nominal_diameter_unit`/`pitch_unit`/`tap_drill.unit`/`alternative_drill.unit` are all fixed-per-branch or direct-copy and were walked for a "correct number, wrong meaning" case. The one place a number's *meaning* is asserted independently of the number itself — the provenance pointer naming which field justifies `tap_drill.value` — is exactly the finding above. No other unit/semantic mismatch found; check 5 already guards `alternative_drill.unit === "mm"` and non-collision with `tap_drill`.
- **Conditional presence/absence (8):** Re-walked `alternative_drill` (guarded, check 5), `cross_verified` (guarded, T13/T14, confirmed absent on 20/29 and present on 9/29 via direct count), `standards[]` (never empty, check 7). No new conditional gap.
- **Status/claim-strength (9):** `data_quality.record_status` (direct copy of `profile.status`) remains enum-checked only (check 4), not source-compared — reconfirmed as a real, named, but *not selected* candidate (see Candidates). Currently all 29 records carry `status: "source_bound"` (confirmed by direct count) — zero current variance, unlike the provenance-chain finding, which has an active, dereferenceable, currently-correct-but-unverified cross-dataset claim on every single record. No wording found anywhere that upgrades `source_bound` to an unqualified "verified" claim.
- **Tap-drill/alternative-drill semantic (10):** The primary/alternative separation itself remains robustly guarded (check 5: no value/unit collision, unit must be `mm`). The *new* finding is upstream of that separation — it concerns whether the primary value itself is trustworthy on its own declared terms, not whether it's confused with the alternative.
- **Tap-type fact semantic (11):** No new defect. 16 facts, 7 entities, reconfirmed via direct count. Classification/source fidelity remain T6/T15-certified; no evidence of misassignment to the wrong tap type found.
- **Standards semantic (12):** `standards[]` is resolved from `tappingDataset.source_standards` — a dataset-level (not profile-level) list, so every profile within one tapping dataset shares an identical standards set by design (e.g. all 9 `metric_tapping` profiles cite `iso_261`/`iso_724`/`iso_965_1`). This is an intentional architectural scoping decision, not a per-profile "wrong standard" defect — there is no profile-level standard selection logic to get wrong. Not a candidate.
- **Relationship semantic (13):** No relationship-derived field found beyond `tap_types[]` (T17-certified). `RELATES_TO` is used for exactly one semantic purpose in this domain (operation → tap type); no stronger meaning is silently assumed anywhere.

## 14–15. Consumer fidelity / numeric engineering claim audit

`tap_drill.value`/`.unit` confirmed rendered verbatim (no transformation) as "Primary tap drill: {value} {unit}" on `generate-tapping-atlas.js` (card + CSV columns `primary_tap_drill`/`primary_tap_drill_unit`), `generate-tapping-workflow.js` (result section, comparison table, client-data JS), and `generate-tapping-evidence.js` (detail view) — the widest possible consumer footprint alongside the thread block. `generate-tap-type-guide.js` does not render it (Guide only consumes `tap-types.json`). No consumer transforms, filters, or relabels the value; all are pure pass-through, so the entire risk sits upstream at the provenance-chain level identified above.

## 16. Negative-case matrix

See JSON `negative_case_matrix` for the full table. Headline row: mutating the thread-dataset field a tapping record's `hole_preparation` cites (e.g. `metric_threads.seed.json`'s `tap_drill_mm` for `M3x0.5`), without touching the tapping dataset or regenerating the projection, produces **no failure in any of the current 14 checks** — `tap_drill.value` would silently continue showing the stale, now-incorrect number under a provenance label that still looks complete and self-consistent.

## 17. Deferred-finding recheck

| Finding | Classification |
|---|---|
| Hardcoded tap-type classification arrays | RECONFIRMED OUT OF SCOPE |
| Generated-artifact staleness (general) | RECONFIRMED OUT OF SCOPE |
| `alternative_drill.standard_edition` hardcode | RECONFIRMED DEFERRED — no new evidence |
| `application_notes[].source_tier` | RECONFIRMED DEFERRED — inert |
| Protected CSV wording (T11 exception) | RECONFIRMED OUT OF SCOPE |
| Tap Drill Calculator independent architecture | RECONFIRMED OUT OF SCOPE |
| Cross-product discovery-link deferrals | RECONFIRMED OUT OF SCOPE |
| Inert projection aggregates (`data_quality_summary`, `related_*`) | RECONFIRMED DEFERRED |
| UNF `source_entity_id` reuse | RECONFIRMED DEFERRED |
| `thread.standard_family` (named T18) | RECONFIRMED DEFERRED — remains inert, included only inside T18's already-implemented check |
| `data_quality.record_status` source-fidelity (named T18 candidate 2) | RECONFIRMED DEFERRED — real, but narrower than this phase's selected finding; zero current status variance (all 29 records `source_bound`); left named for a future phase |

No finding reopened without new evidence.

## 18. Candidate findings and risk ranking

1. **`tap_drill.value`/`.unit` provenance-chain fidelity** (selected) — highest engineering consequence (the headline drill-size number on every product), currently active cross-dataset dependency on every one of 29 records (not just a hypothetical future divergence, unlike `record_status`), zero coverage anywhere in the repo (projection *or* domain validator), proven mutation-testable via the same restore-and-checksum technique as T13–T18, bounded single-file fix.
2. `data_quality.record_status` source-fidelity — real, deferred again: single field, single unvarying current value, lower engineering consequence than a stale drill-size number.
3. Unit/source_field pairing consistency as a standalone check — folded into candidate 1's implementation scope rather than proposed separately (there is no scenario where it fails independently of the value dereference, since both live on the same `hole_preparation` object).

Candidate 1 clears every condition in the T19 gate by the widest margin.

## 19. T19 target gate — selected target

**Target name:** Tap-Drill Value Provenance-Chain Fidelity

**Root cause:** `buildTapDrillBlock()` copies `hole_preparation.value`/`.unit` directly into `tap_drill.value`/`.unit`, and separately copies `hole_preparation.source_dataset`/`.source_record`/`.source_field` into `tap_drill.provenance.{source_dataset,source_record,source_field}` — but nothing in the generator, nor any of the 14 projection checks, nor any of the domain/consumer-fidelity validators, ever dereferences that pointer (`knowledge.datasetById.get(source_dataset).records.find(r => r.designation === source_record)[source_field]`) and confirms it equals `tap_drill.value`.

**Authoritative source:** the thread dataset named by each record's own `hole_preparation.source_dataset` (`data/datasets/metric_threads.seed.json`, `unc.seed.json`, or `unf.seed.json`), specifically the field named by `hole_preparation.source_field` (`tap_drill_mm` or `tap_drill_in`) on the record named by `hole_preparation.source_record`.

**Affected projection field:** `tapping-profiles.json` → `rows[].tap_drill.{value,unit}`, cross-checked against `rows[].tap_drill.provenance.{source_dataset,source_record,source_field}` (all already present in the projection; no new field needs to be added).

**Affected consumers:** `reference/tapping-atlas.html` + `downloads/tapping-atlas.csv`, `tools/tapping-workflow.html` + `js/tapping-workflow-data.js`, `reference/tapping-evidence.html` — confirmed by direct grep with line numbers.

**Existing coverage:** none, anywhere in the repository — confirmed by full read of `validate-tapping-projections.js` and `validate-tapping-domain.js`, and a repo-wide grep for `source_field` (four files total, none dereferencing it).

**Exact missing invariant:** for every profile row, `row.tap_drill.value` must equal `knowledge.datasetById.get(row.tap_drill.provenance.source_dataset).records.find(r => r.designation === row.tap_drill.provenance.source_record)[row.tap_drill.provenance.source_field]`.

**Why T13–T18 do not already cover it:** T13/T14 re-derive `status`/`convention`/`provenance.{source,cross_check}` from `hole_preparation.cross_verified` — a sibling object, never `.value` itself. T15 covers `application_notes[].source` on the tap-type projection. T16 covers `standards[]` denormalization. T17 covers `tap_types[]` relationship membership. T18 covers the **thread block**, joined via `profile.thread_id → designation` — a structurally different join from `hole_preparation`'s own self-declared `source_dataset/source_record/source_field` pointer, even though both currently resolve into the same thread-dataset files.

**Direct-inspection confirmation (current data, real files, read-only):** dereferenced the provenance chain for all 29 records against the real thread datasets. **0 mismatches.** Current data is correct; the gap is exclusively the missing regression guard.

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, every thread/tapping dataset file (except as a temporary, restored mutation fixture), `entities.seed.json`, `relationships.seed.json`, every standard file, every product/CSV/client-data file, every other validator.

**Validator behavior required:** Add check 15. For each profile row, resolve `knowledge.datasetById.get(row.tap_drill.provenance.source_dataset)`; find the base record by `designation === row.tap_drill.provenance.source_record`; read `[row.tap_drill.provenance.source_field]`; compare to `row.tap_drill.value`. Fail on any mismatch, naming the profile, the provenance chain (`source_dataset.source_record.source_field`), the projected value, and the authoritative dereferenced value. Also assert the two known-good `(unit, source_field)` pairings (`mm`↔`tap_drill_mm`, `in`↔`tap_drill_in`) hold for every row, failing on any other combination.

**Pass criteria:** 0 errors on real data (confirmed by direct inspection above); correct, specific failure on a reproduced thread-dataset mutation; all other 14 checks and every other validator unaffected.

## Mutation-test contract (not implemented)

Temporarily change one field on one real thread-dataset record cited by an existing `hole_preparation` provenance pointer — e.g. `tap_drill_mm` on `M3x0.5` in `metric_threads.seed.json` (currently `2.5`, cited by `tap_m3x0_5_cut`'s `hole_preparation.source_field`) — backed up first, **without touching the tapping dataset or regenerating the projection**. Expect **FAIL**, naming `tap_m3x0_5_cut`, the provenance chain (`metric_threads.M3x0.5.tap_drill_mm`), the stale projected value (`2.5`), and the new authoritative value. Restore from backup, confirm byte-identical via checksum, confirm the validator returns to **PASS**. Determinism: validator run 3× on restored real data, byte-identical report checksum.

## Repository integrity

HEAD before and after this discovery: `3c27e422ec99d49988d618f9d95e8199bc9e2367`, matching `origin/main` throughout. Zero tracked files modified — every read this phase (validator, generator, all six tapping/thread dataset files, `validate-tapping-domain.js`, `validate-tapping-terminology.js`, repo-wide grep) was read-only. Two ad-hoc `node -e` invocations only called `fs.readFileSync`/`console.log` — nothing was written to disk. `git status --short` after this phase shows the identical pre-existing untracked-file set and zero new tracked modifications.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 15, `"Tap-Drill Value Provenance Chain Resolves To The Authoritative Source Field"`, added immediately after check 14 (T18). For each of the 29 profiles it: reads `tap_drill.provenance.{source_dataset,source_record,source_field}`; resolves `source_dataset` via `knowledge.datasetById`; finds the record by `designation === source_record`; reads `[source_field]`; compares to `tap_drill.value`; and separately asserts the `(unit, source_field)` pairing is one of the two known-good combinations (`mm`↔`tap_drill_mm`, `in`↔`tap_drill_in`). Fails with the profile, the full provenance chain string, the projected value, and the authoritative dereferenced value on any mismatch.

**Real-data pass.** Ran against the real, untouched projection and thread datasets. **PASS, 0 errors** — all 29 profiles' `tap_drill.value` exactly matches what its own provenance chain resolves to.

**Mutation test.** Temporarily edited the real `data/datasets/metric_threads.seed.json` (backed up first), changing `tap_drill_mm` on the `M3x0.5` record from `2.5` to `2.6` — the exact field `tap_m3x0_5_cut`'s `hole_preparation.source_field` cites — **without touching the tapping dataset or regenerating either projection** (confirmed via checksum: `metric_tapping.seed.json`, `tapping-profiles.json`, and `tap-types.json` all unchanged before and after). Ran the validator. **FAIL, 1 error:**
```
tap_m3x0_5_cut: tap_drill.value mismatch -- provenance chain 'metric_threads.M3x0.5.tap_drill_mm'
resolves to '2.6', projected tap_drill.value is '2.5'
```
Correctly scoped to the single profile whose provenance cites that exact record/field — no other profile's chain resolves through `M3x0.5`. All other 14 checks remained passing, confirming no unintended side effects.

**Restoration.** Restored `data/datasets/metric_threads.seed.json` from the pre-mutation backup, confirmed byte-identical via SHA-256 (`122b73e7f541fb16cd1e8d8d60dae91528a9e56ffe21863bd727dc50f4393c2c`, matching the pre-mutation baseline exactly) and via `git diff --stat` showing zero diff from HEAD. Re-ran the validator. **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged: 5 in `validate-tapping-domain.js`, 1 in `validate-tapping-terminology.js`).

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`3a8ccfd0ed59e208eeb836dda5e2ab5a128c8ecf647679ec250ca8c8b3ac22b1`) every run.

**Checksums.** `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, both T3 projections, all 5 product HTML/CSV files, and `js/tapping-workflow-data.js` are all confirmed byte-identical before and after this phase (`git diff --stat` against each, zero output). **The generator was never run.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every `data/datasets/`/`data/standards/` file. The generator was deliberately left untouched — current data is already correct; T19 closes only the missing regression guard. No additional finding discovered during implementation was fixed or broadened beyond the authorized target.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T20 was not started.

**T19 STATUS: READY FOR REVIEW.** See `audit/t19-change-scope.md` for the file accounting.
