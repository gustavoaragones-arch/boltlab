# T18 — Tapping Domain Residual Integrity Audit (Post-T17 Discovery)

Date: 2026-08-25
Type: **READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t18-residual-integrity.json](t18-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except 11 pre-existing untracked files (`.DS_Store`, `.claude/`, `audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md`, `css/.DS_Store`, `images/.DS_Store`, `images/heads/.DS_Store`, `images/logo.ai`, `images/screw-drive-types/.DS_Store`, `images/screw-head-types/.DS_Store`) — none touched.
- HEAD: `859c7aec8da42d58362af60546feb8611aaf3df4`
- `origin/main`: `859c7aec8da42d58362af60546feb8611aaf3df4` — matches HEAD.
- `git log -5`: T17's commit (`T17: Verify tap-type relationship membership in tapping projections`) is present at HEAD, preceded by T16, T15, T14, T13 in order.

**Gate PASSES.** Proceeding with discovery.

## 1–2. Purpose and completed integrity seams — reconfirmation

All five certified checks were re-read directly from `scripts/validators/validate-tapping-projections.js` at HEAD (not assumed from prior audit files):

| Phase | Check name in validator | Present | Unmodified this session |
|---|---|---|---|
| T13 | Check 10, "Tap-Drill Status Correctly Derived From Source Cross-Verification" | Yes | Yes |
| T14 | Check 11, "Tap-Drill Convention and Cross-Check Narrative Correctly Derived From Source Cross-Verification" | Yes | Yes |
| T15 | Check 9's source-fidelity clause, "Application-Note Completeness (No Silent Drop, Duplication, or Reclassification)" | Yes | Yes |
| T16 | Check 12, "Standards Denormalized Fields Match Authoritative Standard Record" | Yes | Yes |
| T17 | Check 13, "Tap-Type Relationship Membership Matches Authoritative RELATES_TO Graph" | Yes | Yes |

13 checks total, `checks.push()` called 13 times, all present and structurally intact. Not reopened.

## 3. Authoritative chain — walked in full

Read directly, not assumed:

- **Knowledge:** `data/entities/entities.seed.json`; `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`; `data/relationships/relationships.seed.json`; standards resolved via `knowledge.standardById` (loaded by `scripts/utilities/relationship-resolver.js`).
- **Generator:** `scripts/generators/generate-tapping-projections.js` (320 lines, read in full).
- **Validator:** `scripts/validators/validate-tapping-projections.js` (466 lines, read in full — 13 checks).
- **Consumers confirmed:** `generate-tapping-atlas.js` (Atlas HTML + CSV), `generate-tap-type-guide.js` (Guide — tap-types.json only, no thread block), `generate-tapping-workflow.js` (Workflow HTML + `js/tapping-workflow-data.js`), `generate-tapping-evidence.js` (Evidence HTML). `tools/tap-drill-calculator.html` confirmed independent — it loads `/js/data.js`, not `tapping-profiles.json`; not a tapping-projection consumer. No additional undiscovered tapping-projection consumer found (grepped for `tapping-profiles.json` and `tap-types.json` repo-wide).
- **Other validators:** `validate-tapping-domain.js`, `validate-tapping-terminology.js`, `validate-projections.js`, `validate-knowledge-engine.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js` — grepped for any thread-field verification (`nominal_diameter`, `threads_per_inch`, `pitch`, `thread_series`, `standards_family`, `iso_family`, `coarse_fine`, `standard_family`). **Zero matches in any of them.**

## 4. Complete projection field inventory

Full table in the JSON (`projection_field_inventory`). Summary by classification:

| Field | Class | Source | Validated today? |
|---|---|---|---|
| `tapping_profile_id` | direct copy | source record `.tapping_profile_id` | Yes (check 1, uniqueness) |
| `thread.designation` | **direct copy** | `base.designation` (thread dataset) | **No** |
| `thread.thread_system` | fixed per branch (loop param, not sourced) | generator config | N/A — not a source value |
| `thread.nominal_diameter` | **direct copy** | `base.nominal_diameter_mm` / `_in` | **No** |
| `thread.nominal_diameter_unit` | fixed constant per branch | generator literal | N/A — deterministic by branch |
| `thread.pitch` | **direct copy** (metric only) | `base.pitch_mm` | **No** |
| `thread.pitch_unit` | fixed constant | generator literal | N/A |
| `thread.threads_per_inch` | **direct copy** (UNC/UNF only) | `base.threads_per_inch` | **No** |
| `thread.coarse_fine` | **direct copy** | `base.thread_series` | **No** |
| `thread.standard_family` | **direct copy** | `base.iso_family` / `base.standards_family` | **No** (also unread by every consumer — inert) |
| `thread.source_entity_id` | hardcoded literal | generator constant | T17 named it, deferred (inert, never rendered) |
| `thread.source_dataset` / `source_record` | direct copy | profile / base | Existence-checked only (check 2) |
| `tap_drill.value` / `.unit` | direct copy | `hp.value` / `.unit` | Existence/enum-checked, value itself not independently re-derived (no transformation to re-derive — literal pass-through, low risk) |
| `tap_drill.status` | derived | `hp.cross_verified` | **Yes — T13** |
| `tap_drill.convention` | derived | `hp.cross_verified` | **Yes — T14** |
| `tap_drill.provenance.{source,cross_check}` | derived | `hp.cross_verified` | **Yes — T14** |
| `alternative_drill.value/unit/status/meaning` | direct copy | `alt.*` | Existence/enum-checked; low risk, plain pass-through |
| `alternative_drill.standard_edition` | **hardcoded literal** `"1972"` | none (fixed) | Deferred since T16, reconfirmed — not a source value to diverge from |
| `engagement.radial` / `.axial` | fixed constant (identical object, every row) | none (fixed) | Check 6 (no invented target/status) |
| `tap_types[]` | relationship-derived | `relationships.seed.json` | **Yes — T17** |
| `standards[].{organization,designation,edition,title,verification_state}` | denormalized | `knowledge.standardById` | **Yes — T16** |
| `data_quality.record_status` | direct copy | `profile.status` | Enum-checked only (check 4); not compared to source `profile.status` |
| `data_quality.provenance_complete` | derived (boolean) | `hp.*` presence | **Yes — check 3** |
| `data_quality.last_reviewed` | direct copy (dataset-level, not per-record) | `tappingDataset.last_reviewed` | Not independently checked; low risk (dataset-level metadata, not an engineering claim) |
| `application_notes[].*` (tap-types.json) | direct copy | `entity.application_notes[]` | **Yes — T6/T15** |
| `evidence_status.*` counts | aggregated | `entity.application_notes[]` | Re-derived dynamically by every consumer's own validator (T17) |
| `related_entities`/`related_standards`/`related_datasets` | aggregated metadata | rows | Deferred, reconfirmed inert (unread by any consumer) |
| `data_quality_summary` | aggregated | rows | Deferred, reconfirmed inert |

## 5–9. Knowledge→projection / conditional / status / numeric / relationship audits

- **A–I checklist (section 5):** Every direct-copy, denormalized, and relationship-derived family was walked. The **thread block** is the one family where the answer to "does the projection retain the source value exactly, independently verified?" is **NO** — it is a straight, unguarded copy exactly analogous to the standards block before T16 and the tap-type array before T17, except the source is the thread dataset (`metric_threads.seed.json` / `unc.seed.json` / `unf.seed.json`) rather than the standards or relationship files.
- **Conditional/negative-path (section 6):** `alternative_drill` null-for-metric / present-for-UNC-UNF is check-5-guarded (both positive and negative). `cross_verified` absent/false is T13/T14-guarded (negative path explicitly tested there). No new conditional gap found; `hp.cross_verified` on UNC/UNF records reconfirmed always absent (grepped both dataset files directly — zero occurrences of `cross_verified` outside `metric_tapping.seed.json`).
- **Status transformations (section 7):** `tap_drill.status` (T13), `data_quality.record_status` → `verificationLabel()` display mapping in Atlas/Workflow/Evidence. The **display mapping itself** (`verificationLabel`) is pure presentation (label lookup, not a data claim) — traced in `generate-tapping-atlas.js`; not a candidate. The **underlying `record_status` value being an unverified direct copy** is a real, distinct finding — see candidates below.
- **Numeric/engineering audit (section 8):** thread diameter, pitch, TPI are exactly the fields named in the brief — this is the strongest section of evidence for the selected target. Re-derivation performed directly (see §"Derivation audit" below): **0 mismatches across all 29 rows × 8 fields (232 comparisons)** confirms current data is correct; the gap is the missing regression guard, matching the T13–T17 pattern exactly.
- **Relationship audit after T17 (section 9):** No other relationship-derived field found. `standards[].standard_id` and `alternative_drill.standard_id` are reference-checked (check 2) and content-checked (T16, for `standards[]`; `alternative_drill`'s other fields are plain copies, not denormalized from a relationship). `related_entities`/`related_standards`/`related_datasets` reconfirmed inert metadata (grepped every consumer — none reads these projection-level aggregate arrays).

## 10–14. Tap-type / standards / alternative-drill / engagement / provenance audits

- **Tap-type facts (10):** 7 `tap_type` entities, 16 total `application_notes` facts reconfirmed via direct read of `entities.seed.json`. `source` is certified (T15); `source_tier` remains unread by any consumer (grepped) — reconfirmed deferred, not reopened, no new evidence.
- **Standards (11):** T16's five fields reconfirmed present and passing. No new standard-related transformation found beyond what's already covered; `buildStandardsBlock` sorts by id — order is deterministic and not itself a correctness claim.
- **Alternative drill (12):** `standard_edition = "1972"` hardcode reconfirmed present, unchanged, no new evidence of a current material user-facing contradiction — RECONFIRMED DEFERRED. Metric records' intentional absence of `alternative_drill` (`null`) reconfirmed correct via check 5's negative-path assertion.
- **Engagement (13):** Repo-wide sweep (products, generators, client-data file) for `75%`, `70%`, `77%`, `75 percent`, `70 percent`, `77 percent` — **zero matches**. `axial.calculation_status` is hardcoded `"not_calculable"` for every row (check 6 enforces this); `radial.target_percent` hardcoded `null` (also check 6). No unsupported minimums found. Radial/axial distinction confirmed honest in prose (`AXIAL_ENGAGEMENT_MODEL.principle` explicitly names the missing material-strength-data dependency).
- **Provenance/evidence (14):** Every user-facing "verified"/"source-bound" claim traced to `tap_drill.status` (T13-derived) or `data_quality.record_status` (direct copy — see candidates). No wording found anywhere that upgrades a `source_bound` record to an unqualified "verified" claim.

## 15–17. Duplicated source-of-truth / consumer fidelity / aggregation audits

- **Duplicated source-of-truth (15):** No generator, HTML, JS, or CSV code found hardcoding an engineering fact that duplicates (rather than reads) the knowledge layer. Tap Drill Calculator reconfirmed as the sole, intentional independent-architecture exception (loads `/js/data.js`, never `tapping-profiles.json`) — RECONFIRMED OUT OF SCOPE, unchanged from prior phases.
- **Consumer fidelity (16):** Atlas, Workflow, Evidence, and the CSV all render `thread.designation/nominal_diameter/nominal_diameter_unit/pitch/pitch_unit/threads_per_inch/coarse_fine` directly (confirmed by grep with line numbers — see JSON). None transforms these values; all are rendered verbatim or through a pure unit-suffix template (`\`${value} mm\``). This is exactly the "projection changes → product goes stale → no validator catches it" pattern the brief names in section 16, applied to a field family with zero current coverage.
- **Aggregation/count (17):** All rendered counts (evidence verified/source-bound counts, tap-drill 9/20, tap-type facts) confirmed dynamically re-derived by each consumer's own validator, not stored/trusted as static projection values. No new aggregation finding.

## 18. Previously deferred findings — recheck

| Finding | Classification |
|---|---|
| Hardcoded tap-type classification arrays (`CLASSIFICATION_TO_FIELD`) | RECONFIRMED OUT OF SCOPE — fixed architecture constant, not a data source |
| Generated-artifact staleness (general) | RECONFIRMED OUT OF SCOPE — covered structurally by the checksum discipline every phase already follows |
| `alternative_drill.standard_edition` hardcode | RECONFIRMED DEFERRED — no new evidence of current material impact |
| `application_notes[].source_tier` | RECONFIRMED DEFERRED — inert, unread by any consumer |
| Protected CSV wording (T11 exception) | RECONFIRMED OUT OF SCOPE — not reopened |
| Tap Drill Calculator independent architecture | RECONFIRMED OUT OF SCOPE — confirmed again this phase via direct script-tag inspection |
| Cross-product discovery-link deferrals | RECONFIRMED OUT OF SCOPE — no new evidence |
| Inert projection aggregates (`data_quality_summary`, `related_entities`/`related_standards`/`related_datasets`) | RECONFIRMED DEFERRED — reconfirmed unread by every consumer this phase |
| UNF `source_entity_id` reuse (`thread_system_unc` on UNF rows) | RECONFIRMED DEFERRED — still never rendered by any consumer; no `thread_system_unf` entity exists to reference instead |
| **`thread.standard_family`** | **NEW THIS PHASE — RECONFIRMED-ADJACENT.** Same direct-copy, zero-validation profile as the rest of the thread block, but individually inert (not present in the CSV header or any consumer template, confirmed by grep). Included in the selected check's scope for completeness (same function, same source lookup) but not, by itself, the basis for selection — the rendered sibling fields (`designation`, `nominal_diameter`, `pitch`, `threads_per_inch`, `coarse_fine`) carry the materiality. |

No finding was reopened without new evidence; none was found here that overturns a prior deferral.

## 19. Negative-case mutation matrix

| Mutation | Authoritative source | Affected projection | Would current validators fail? | User-visible? | Engineering consequence? | Bounded fix? |
|---|---|---|---|---|---|---|
| `hp.cross_verified.match` flipped | tapping dataset | `tap_drill.status/convention/provenance` | Yes (T13/T14) | Yes | — | — |
| `RELATES_TO` edge added/removed | `relationships.seed.json` | `tap_types[]` | Yes (T17) | Yes | — | — |
| Standard record field hand-edited | `data/standards/**` | `standards[].*` | Yes (T16) | Yes | — | — |
| `application_notes[]` source/status/fact changed | `entities.seed.json` | `application_notes[].*` | Yes (T6/T15) | Yes | — | — |
| **`base.pitch_mm` / `nominal_diameter_mm` / `threads_per_inch` / `thread_series` / `designation` changed in the thread dataset, projection left stale** | **thread dataset (`metric_threads.seed.json`/`unc.seed.json`/`unf.seed.json`)** | **`thread.{designation,nominal_diameter,pitch,threads_per_inch,coarse_fine}`** | **No** | **Yes — every product's primary identifying/engineering values** | **Wrong drill/thread guidance shown under a still-valid-looking designation** | **Yes — single validator check, same pattern as checks 10–13** |
| `profile.status` changed in source dataset, projection left stale | tapping dataset | `data_quality.record_status` | Partial — enum-membership only (check 4), not source-match | Yes (displayed as "Overall record status") | Overstated/understated trust label | Yes, but narrower (1 field vs. 8) |
| `alternative_drill.standard_edition` changed | none (hardcoded) | `alternative_drill.standard_edition` | No | Low-visibility (footnote-level) | Low | Deferred, no new evidence of materiality |
| `thread.standard_family` changed in source | thread dataset | `thread.standard_family` | No | No (unread by all consumers) | None (inert) | Not eligible — fails "user-visible" |

## 20. Risk ranking

1. **Thread block engineering-value fidelity** (`designation`, `nominal_diameter[_unit]`, `pitch[_unit]`, `threads_per_inch`, `coarse_fine`, `standard_family`) — highest correctness impact (the core physical identity of every one of 29 records), highest engineering consequence (wrong diameter/pitch/TPI is a direct physical-error risk, not a metadata/labeling risk), broadest current consumer breadth of any uncovered field (Atlas HTML + CSV, Workflow HTML + client-data JS, Evidence HTML — 4 of the domain's products), zero current coverage, proven mutation-testable via the identical technique used in T13–T17, bounded single-validator-file fix.
2. `data_quality.record_status` source-fidelity (direct copy of `profile.status`, only enum-checked) — real but narrower: one field, one consumer-visible instance per profile ("Overall record status" line), and the failure mode (a stale trust label) is less consequential than a stale physical measurement.
3. `thread.standard_family` — fails the user-visible bar (inert); named for completeness, not independently eligible.
4. `alternative_drill.standard_edition` — unchanged from T16/T17 deferral, no new evidence.

Candidate 1 is the only one that clears every condition in section 1's eligibility bar simultaneously and by the widest margin; candidate 2 is real and left named for a future phase but not selected this round, matching the brief's instruction to select exactly one.

## 21. T18 target gate — selected target

**Target name:** Thread Block Engineering-Value Fidelity

**Root cause:** `buildThreadBlock()` in `generate-tapping-projections.js` (lines 30–65) copies `designation`, `nominal_diameter`, `pitch`, `threads_per_inch`, `coarse_fine`, and `standard_family` directly from the resolved thread-dataset record (`findBaseThreadRecord()`, matched by `profile.thread_id === base.designation`) with zero transformation. No check anywhere in the 13-check validator, nor in any other tapping validator, re-derives these values from the source thread dataset and compares them to the projection. Check 2 only confirms `thread.source_dataset` and `thread.source_entity_id` *resolve to something real* — never that the copied engineering values themselves match what that source currently says.

**Authoritative source:** `data/datasets/metric_threads.seed.json`, `data/datasets/unc.seed.json`, `data/datasets/unf.seed.json` — specifically each record's `nominal_diameter_mm`/`nominal_diameter_in`, `pitch_mm`, `threads_per_inch`, `thread_series`, `iso_family`/`standards_family`, `designation`.

**Affected projection fields:** `tapping-profiles.json` → `rows[].thread.{designation, nominal_diameter, nominal_diameter_unit, pitch, pitch_unit, threads_per_inch, coarse_fine, standard_family}` (all 29 rows).

**Affected consumers:** `reference/tapping-atlas.html` (card display + `downloads/tapping-atlas.csv`), `tools/tapping-workflow.html` (results, comparison table, `js/tapping-workflow-data.js`), `reference/tapping-evidence.html` (per-profile detail). Confirmed by direct grep with line numbers (see JSON `consumer_fidelity_audit`).

**Existing coverage:** None. Checks 1–13 confirmed by full read; none re-derives or compares these fields to source.

**Exact missing invariant:** For every profile row, `row.thread.{designation,nominal_diameter,pitch,threads_per_inch,coarse_fine,standard_family}` must equal the corresponding field on the thread-dataset record found by matching `profile.thread_id` to `designation` in the dataset selected by that row's thread system (metric → `metric_threads.seed.json`; UNC → `unc.seed.json`; UNF → `unf.seed.json`), with the same unit-routing `buildThreadBlock()` already applies (`nominal_diameter_mm`→metric / `nominal_diameter_in`→UNC/UNF; `pitch_mm`→metric only; `threads_per_inch`→UNC/UNF only).

**Why T13–T17 do not already cover it:** T13/T14 cover `tap_drill.status`/`convention`/`provenance`, derived from `hp.cross_verified` — a different source object and a different field family. T15 covers `application_notes[].source` on `tap-types.json` — a different projection entirely. T16 covers `standards[]` denormalization from `knowledge.standardById` — a different source and field family. T17 covers `tap_types[]` from the relationship graph — a different source and field family. None of the five reads or compares the thread dataset (`metric_threads.seed.json`/`unc.seed.json`/`unf.seed.json`) at all.

**Direct-inspection confirmation (current data, real files, read-only):** Independently re-derived all 8 fields × 29 rows (232 comparisons) from the real thread datasets and compared to the real projection. **0 mismatches.** Current data is correct; the gap is exclusively the missing regression guard — identical in shape to T13–T17's findings at their own discovery stage.

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, every thread/tapping dataset file (except as a temporary, restored mutation fixture), `entities.seed.json`, `relationships.seed.json`, every standard file, every product/CSV/client-data file, every other validator.

**Validator behavior required:** Add check 14. For each profile row, resolve its thread-system-appropriate dataset (`metric_threads.seed.json` for `thread_system === "metric"`, `unc.seed.json` for `"UNC"`, `unf.seed.json` for `"UNF"` — these are already loaded by the knowledge layer; the validator will need the same three-way dataset selection `buildProfileRows()`'s caller already performs, keyed off `row.thread.thread_system`), find the base record by `designation === row.thread.designation`, then compare `nominal_diameter` (against `nominal_diameter_mm` for metric / `nominal_diameter_in` for UNC/UNF), `pitch` (metric only, against `pitch_mm`; must independently confirm `null` for UNC/UNF), `threads_per_inch` (UNC/UNF only, against `threads_per_inch`; must independently confirm `null` for metric), `coarse_fine` (against `thread_series`), and `standard_family` (against `iso_family` for metric / `standards_family` for UNC/UNF). Fail on any mismatch, naming the profile, field, projected value, and authoritative value.

**Pass criteria:** 0 errors on real data (already confirmed correct by direct inspection above); correct, specific failure on a reproduced thread-dataset mutation; all other 13 checks and every other validator unaffected.

## Mutation-test contract (not implemented)

Temporarily change one field on one real thread-dataset record — e.g. `pitch_mm` on `M10x1.25` in `metric_threads.seed.json` — backed up first, **without regenerating the projection**. Expect **FAIL**, naming the affected profile(s) (every profile whose `thread_id` is `M10x1.25`), the field (`pitch`), the stale projected value, and the new authoritative value. Restore from backup, confirm byte-identical via checksum, confirm the validator returns to **PASS**. Determinism: validator run 3× on restored real data, byte-identical report checksum.

## Repository integrity

HEAD before and after this discovery: `859c7aec8da42d58362af60546feb8611aaf3df4`, matching `origin/main` throughout. Zero tracked files modified — every read this phase (generator, validator, all six thread/tapping dataset files, all four consumer generators, `js/tapping-workflow-data.js`, `entities.seed.json`) was read-only, confirmed via `git status --short` showing no new modifications from the pre-discovery baseline. The same pre-existing untracked files remain untouched. The one Node script run during discovery (`node -e "..."`) only read JSON files and printed to stdout — wrote nothing to disk.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 14, `"Thread Block Engineering Values Match Authoritative Thread Dataset Record"`, added immediately after check 13 (T17). For each of the 29 profiles it: maps `row.thread.thread_system` to the authoritative dataset id (`metric` → `metric_threads`, `UNC` → `unc_threads`, `UNF` → `unf_threads`) via `knowledge.datasetById`; finds the base record by `designation === row.thread.designation`; independently re-derives `designation`, `nominal_diameter` (routed `nominal_diameter_mm`/`_in` by system), `pitch` (metric only, else `null`), `threads_per_inch` (UNC/UNF only, else `null`), `coarse_fine` (`thread_series`), and `standard_family` (`iso_family`/`standards_family` by system); compares each field individually against the projection's actual value; fails with the profile, thread system, field, projected value, and authoritative value on any mismatch.

**Real-data pass.** Ran against the real, untouched projection and thread datasets. **PASS, 0 errors** — all 29 profiles' thread blocks exactly match their authoritative source records (consistent with the 232-comparison direct-inspection re-derivation performed during discovery).

**Mutation test.** Temporarily edited the real `data/datasets/metric_threads.seed.json` (backed up first), changing `pitch_mm` on the `M10x1.25` record from `1.25` to `1.5`, **without regenerating either projection** (confirmed via checksum: `tapping-profiles.json` and `tap-types.json` unchanged before/after the mutation and validator run). Ran the validator. **FAIL, 1 error:**
```
tap_m10x1_25_cut (thread_system metric): thread.pitch mismatch -- authoritative value is '1.5', projected value is '1.25'
```
Correctly scoped to the single profile using the `M10x1.25` thread designation (unlike T17's mutation, which affected all 29 profiles because it targeted a relationship shared by every row — this mutation targets a single thread record, so only the one profile referencing it is affected, exactly as expected). All other 13 checks remained passing, confirming no unintended side effects.

**Restoration.** Restored `data/datasets/metric_threads.seed.json` from the pre-mutation backup, confirmed byte-identical via SHA-256 (`122b73e7f541fb16cd1e8d8d60dae91528a9e56ffe21863bd727dc50f4393c2c`, matching the pre-mutation baseline exactly) and via `git diff --stat` showing zero diff from HEAD. Re-ran the validator. **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged: 5 in `validate-tapping-domain.js`, 1 in `validate-tapping-terminology.js`).

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`e2ab5b98a6154006b3b3ab0952d5434562a3fd22ce6cb30b1bd120a180d487ae`) every run.

**Checksums.** `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, both T3 projections, all 5 product HTML/CSV files, and `js/tapping-workflow-data.js` are all confirmed byte-identical before and after this phase (`git diff --stat` against each, zero output). **The generator was never run.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every `data/datasets/`/`data/standards/` file. The generator was deliberately left untouched — current data is already correct; T18 closes only the missing regression guard.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T19 was not started.

**T18 STATUS: READY FOR REVIEW.** See `audit/t18-change-scope.md` for the file accounting.
