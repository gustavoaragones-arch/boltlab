# T20 — Tapping Domain Residual Integrity Audit (Post-T19 Discovery)

Date: 2026-08-26
Type: **READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t20-residual-integrity.json](t20-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except the same 11 pre-existing untracked files (`.DS_Store`, `.claude/`, D2-phase audit files, `images/logo.ai`, etc.) — none touched.
- HEAD: `0059490aa78f5044f4371decc7fada92625ea662`
- `origin/main`: matches HEAD.
- `git log -8`: T19's commit (`T19: Verify tap-drill value provenance chain against authoritative source`) is present at HEAD, preceded by T18, T17, T16, T15, T14, T13, T12 in order.

**Gate PASSES.** Proceeding with discovery.

## 2. Certify the closed seams

Read `scripts/validators/validate-tapping-projections.js` in full (546 lines, 15 checks) and ran it against real, untouched data.

| Phase | Check name | Present | Result |
|---|---|---|---|
| T13 | Check 10, "Tap-Drill Status Correctly Derived From Source Cross-Verification" | Yes | pass |
| T14 | Check 11, "Tap-Drill Convention and Cross-Check Narrative Correctly Derived From Source Cross-Verification" | Yes | pass |
| T15 | Check 9's source-fidelity clause, "Application-Note Completeness..." | Yes | pass |
| T16 | Check 12, "Standards Denormalized Fields Match Authoritative Standard Record" | Yes | pass |
| T17 | Check 13, "Tap-Type Relationship Membership Matches Authoritative RELATES_TO Graph" | Yes | pass |
| T18 | Check 14, "Thread Block Engineering Values Match Authoritative Thread Dataset Record" | Yes | pass |
| T19 | Check 15, "Tap-Drill Value Provenance Chain Resolves To The Authoritative Source Field" | Yes | pass |

`node scripts/validators/validate-tapping-projections.js` → **PASS, 0 errors, 0 warnings**, 15 checks total (`checks.push()` called 15 times). None reopened or modified.

## 3–4. Projection field inventory / source-to-projection audit

Full table in the JSON (`projection_field_inventory`). Everything T13–T19 did not already close was re-classified using the brief's A–F taxonomy. Only one field crosses into **F. genuinely uncovered**:

| Field | Class | Why not A–E |
|---|---|---|
| `data_quality.record_status` | **F — genuinely uncovered** | Direct copy of `profile.status`. Check 4 only confirms enum membership (`verified`/`source_bound`/`pending_verification`/`unavailable`) — never that the value equals the source record's own `.status`. Rendered on every product and feeds an aggregate Evidence-page count (see §13 below). |
| `thread.source_dataset` / `thread.source_record` | E — inert | Direct copies of `profile.thread_source_dataset` / `base.designation`. Grepped every consumer generator: never rendered (only `tap_drill.provenance.*`, T19-closed, is rendered as a citation). Existence-checked only (check 2). Fails the user-visible bar. |
| `data_quality.provenance_complete` | A — independently source-verified (indirectly) | Check 3 verifies both the boolean's truthiness and the underlying `tap_drill.provenance` fields' non-emptiness. Not a strict re-derivation-and-compare of the boolean formula itself, but any incompleteness is still caught via the sibling condition — low residual risk, not selected. |
| `tap_type_id` (source dataset field) | E — inert | Never read by the generator (grepped `generate-tapping-projections.js` — zero references); `null` on all 29 source records. Not a candidate. |
| `iso_2306_alternative_drill.value/unit/status/meaning` | D — intentionally fixed / no re-derivable source | Flat object with no `source_dataset`/`source_record`/`source_field` triple (unlike `hole_preparation`) — the value is asserted by human verification (`verified_date`, `table`) with no other in-repo dataset to re-derive it from. Not mutation-testable the way T19's chain was. |
| `alternative_drill.standard_edition` | D — intentionally fixed (hardcoded `"1972"`) | Unchanged deferral since T16. |

## 5–7. Identity/join, composite consistency, thread-system routing audits

Performed real, read-only re-derivations against the live data (not assumptions):

- **Designation collision check across all three thread datasets** (`metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`): 29 total designations, **zero collisions** — every designation string is globally unique across all three systems (metric uses `M#x#`, UNC/UNF use `#-## UNC`/`#-## UNF`). A cross-system "wrong record resolves successfully" scenario is not currently reachable through any existing join key.
- **`thread_system` → `tap_drill.provenance.source_dataset` consistency**: re-derived directly from the real projection — every `metric` row's provenance cites `metric_threads`, every `UNC` row cites `unc_threads`, every `UNF` row cites `unf_threads` (14/8/7, matching row counts exactly). No cross-system provenance citation exists in current data.
- **`hole_preparation.unit` per dataset**: `metric_tapping.seed.json` → uniformly `mm`; `unc_tapping.seed.json`/`unf_tapping.seed.json` → uniformly `in`. Combined with T19's unit/source-field pairing check (mm↔`tap_drill_mm`, in↔`tap_drill_in`), a wrong-system unit substitution is already unreachable without simultaneously breaking T19's check.
- **Standards association** (section 11's "profile carries a valid standard whose association is nevertheless wrong"): confirmed `buildStandardsBlock()` is fed by `tappingDataset.source_standards` — a **dataset-level**, not per-profile, array. Grepped every record in all three tapping datasets for a per-record standards field: none exists (`tapping_profile_id`, `thread_id`, `thread_source_dataset`, `operation`, `tap_type_id`, `hole_preparation`, `thread_engagement`, `tapping_parameters`, `status`, `notes`, and UNC/UNF's `iso_2306_alternative_drill` — no `standards`/`source_standards` per-record field). There is no more-specific source being silently ignored; the dataset-level association is the only association that exists. Not a defect.

No identity/join, composite-consistency, or routing defect was found with a demonstrable current mutation path.

## 8–9. Tap-drill semantic / ISO alternative audit

- Re-read `buildTapDrillBlock()`/`buildAlternativeDrillBlock()` in full. Check 5 (ISO structural correctness) already proves both positive (UNC/UNF → present) and negative (metric → absent) presence, plus non-identity with the primary `tap_drill` value (unit and value compared together) — the exact "consumer could treat alternative as primary" risk is structurally foreclosed at the projection level (they are always different values/objects), and every consumer (`generate-tapping-atlas.js` line ~161, `generate-tapping-workflow.js`, `generate-tapping-evidence.js`) renders `alternative_drill` under an explicit "ISO 2306 alternative:" label plus the fixed `ISO_NOTE` explanatory text — never merged into the primary drill display.
- `iso_2306_alternative_drill` has no cross-dataset provenance chain analogous to `hole_preparation`'s (`source_dataset`/`source_record`/`source_field`) — it carries `source: "iso_2306"` (a standard id, existence-checked by check 2) plus `table`/`verified_date` as citation metadata only. There is no second in-repo dataset containing the actual ISO 2306 table values to re-derive `alt.value` from, so a T19-style dereference check is not buildable here — this mirrors why `alternative_drill.standard_edition`'s hardcode remains deferred (no computable authoritative source in-repo). No new evidence changes this.

## 10–11. Tap-type / standards semantic audit

- Confirmed `buildTapTypeProjection()` maps `tapTypeEntities` 1:1 by `entity_id`, and check 9 re-fetches the entity by that same `entity_id` — a fact cannot be evaluated against the wrong tap type without an entity-id collision in `entities.seed.json`, which the knowledge-engine layer's own id-uniqueness guarantees (entities are keyed in a `Map`). No new defect found; `source_tier` remains unrendered by every consumer (reconfirmed via grep) and is not selected, per the brief's explicit instruction not to reopen it absent a concrete false-claim mechanism.
- Standards: see §5–7 above — dataset-level association confirmed to be the sole and correct association mechanism, no per-record override being ignored.

## 12. Data-quality / record-status audit — the finding

**Authoritative source:** `profile.status` on each of the 29 tapping-dataset source records (`metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`) — a top-level field, distinct from `hole_preparation.status` (always `"verified"`, a known non-discriminating constant per T13's code comment) and from `hole_preparation.cross_verified.match` (T13/T14's source).

**Transformation:** none — `buildDataQualityBlock()` sets `record_status: profile.status`, a straight 1:1 copy.

**Current value:** all 29 source records currently carry `status: "source_bound"` (verified via direct read of all three tapping-dataset files) — confirmed intentional, not a bug: the profile-level status reflects that `thread_engagement`/`tapping_parameters` remain `"unavailable"` domain-wide regardless of the 9 records with `tap_drill.status === "verified"` (T13). This is architecturally correct as-is (no composite inconsistency between `tap_drill.status` and `record_status` — they measure different things by design, and every "Overall record status" rendering is paired with the explicit qualifier "(engagement and process-parameter data are not yet available for any profile)").

**User-visible consumers (broader than any prior T13–T19 target):**
- `reference/tapping-atlas.html` — per-card "Overall record status:" label (`generate-tapping-atlas.js:169`) and the CSV's `record_status` column (`generate-tapping-atlas.js:584,607`).
- `tools/tapping-workflow.html` — result section and comparison-table row (`generate-tapping-workflow.js:359,452`), and `js/tapping-workflow-data.js` (29 embedded occurrences, one per profile).
- `reference/tapping-evidence.html` — per-profile "Overall record status:" label (`generate-tapping-evidence.js:374`) **and** the page's aggregate scoreboard counts: `recordVerified`/`recordSourceBound` in `computeCounts()` (`generate-tapping-evidence.js:40-41`) are dynamically summed directly from `r.data_quality.record_status` across all 29 rows — the single most prominent trust claim on the domain's dedicated evidence page.

**Current validator coverage:** Check 4 (`Verification-State Correctness`) confirms `row.data_quality.record_status` is a member of the valid-state enum — existence/enum membership only. **No check anywhere compares it to the source `profile.status`.**

**Direct-inspection confirmation (current data, real files, read-only):** independently re-derived `data_quality.record_status` for all 29 rows directly from the three real tapping-dataset files and compared to the real projection. **0 mismatches.** Current data is correct; the gap is exclusively the missing regression guard — identical in shape to every prior T13–T19 finding at its own discovery stage.

**Why this is a genuinely stronger candidate than the alternatives surveyed above:** it is the only field this phase found that is (a) a true source-to-projection field with zero validator coverage, (b) rendered by every one of the domain's 5 consumer surfaces (Atlas HTML+CSV, Workflow HTML+client JS, Evidence HTML), and (c) additionally feeds an aggregate, cross-record trust count on the Evidence page — a strictly broader footprint than T18's thread block (not consumed by the Guide) or T19's tap-drill value (per-row only, no aggregate).

## 13. Provenance/evidence claim audit

Traced `computeCounts()` in `generate-tapping-evidence.js`: `recordVerified`/`recordSourceBound` are dynamically re-derived from the live projection at generation time (internally self-consistent with whatever the projection currently says), but that re-derivation is only as trustworthy as `data_quality.record_status` itself — exactly the gap named in §12. No other evidence claim was found to be capable of overstating the authoritative data; `tapDrillVerified`/`tapDrillSourceBound` and `tapTypeVerified`/`tapTypeSourceBound` counts are re-derived from fields already certified by T13 and T6/T15 respectively.

## 14–16. Consumer fidelity / numeric-claim / aggregation audits

- No semantic transformation was found in any consumer beyond what's already accounted for (label lookups via `verificationLabel()` are pure, injective presentation mappings — confirmed by reading the function in full).
- Every numeric engineering claim traced to source in this phase (thread values, tap-drill value, standards fields, tap-type facts) resolves to an already-certified T13–T19 chain, except `record_status` (not numeric, but a claim-strength/verification-state field, which is what §12 selects).
- Aggregation audit: the Evidence page's record-status counts are the one aggregate found to depend on the uncovered field; every other rendered count (9/20 tap-drill, 16 tap-type facts, 7 tap types, 29 profiles) was reconfirmed dynamically derived from already-certified fields.

## 17. Generated-artifact staleness

Reconfirmed as a repository-wide, out-of-scope concern — no tapping-specific bounded solution exists beyond the per-field regression guards T13–T19 (and now T20) already provide. Not broadened.

## 18. Previously deferred findings — recheck

| Finding | Classification |
|---|---|
| Hardcoded tap-type classification arrays | RECONFIRMED OUT OF SCOPE |
| Generated-artifact staleness (general) | RECONFIRMED OUT OF SCOPE |
| `alternative_drill.standard_edition` hardcode | RECONFIRMED DEFERRED — no re-derivable in-repo source, confirmed again this phase |
| `application_notes[].source_tier` | RECONFIRMED DEFERRED — inert, reconfirmed unread by any consumer |
| Protected CSV wording (T11 exception) | RECONFIRMED OUT OF SCOPE |
| Tap Drill Calculator independent architecture | RECONFIRMED OUT OF SCOPE |
| Cross-product discovery-link deferrals | RECONFIRMED OUT OF SCOPE |
| Inert projection aggregates (`data_quality_summary`, `related_entities`/`related_standards`/`related_datasets`) | RECONFIRMED DEFERRED |
| UNF `source_entity_id` reuse | RECONFIRMED DEFERRED |
| **`data_quality.record_status` fidelity** | **REOPENED — NEW EVIDENCE.** Named as candidate 2 (not selected) in T18, explicitly flagged for re-examination by this phase's brief. New evidence this phase: (a) confirmed zero current mismatches via direct re-derivation, (b) traced its consumption into the Evidence page's aggregate scoreboard count (`computeCounts()`), a materially broader and more consequential footprint than previously documented. Selected as the T20 target. |

No other finding was reopened without new evidence.

## 19. Negative-case matrix

| Candidate | Authoritative source | Current validator | User-visible | Material | Mutation-testable | Bounded | Eligible |
|---|---|---|---|---|---|---|---|
| **`data_quality.record_status` vs `profile.status`** | tapping dataset `.status` | **NO** (enum only) | **YES** — 5 consumer surfaces + aggregate count | **YES** | **YES** | **YES** | **YES — SELECTED** |
| `thread.source_dataset`/`source_record` metadata | tapping dataset | NO | NO (unread) | — | — | — | NO — fails user-visible |
| Cross-system provenance/designation mix-up | thread datasets | Indirectly guarded (T18/T19 + no real collision) | — | — | Not currently reachable | — | NO — no live exploit path |
| `iso_2306_alternative_drill.value` vs external ISO table | none in-repo | N/A | YES (low) | Low | NO — no re-derivable source | — | NO — fails authoritative-source-in-repo |
| Standards dataset-level association "wrong for profile" | tapping dataset | N/A | — | — | NO — only one association exists | — | NO — not a real defect |
| `data_quality.provenance_complete` boolean re-derivation | `tap_drill.provenance.*` | Indirect (via sibling check) | YES (low) | Low | Marginal | Yes | NO — weaker than record_status, already substantially covered |

## 20. Risk ranking

1. **`data_quality.record_status` source-fidelity** — only candidate with zero coverage, full 5-surface consumer breadth, and a live aggregate-count dependency. Clears every gate.
2. `data_quality.provenance_complete` boolean re-derivation — real but low-materiality residual gap, substantially (if indirectly) already covered by check 3's sibling condition; not selected.
3. All other surveyed areas (identity/join, routing, composite consistency, ISO alternative, standards association, tap-type semantics) — investigated and found either already effectively guarded by the T13–T19 chain, structurally non-exploitable given current data (no designation collisions, no per-record standards override), or lacking an in-repo re-derivable authoritative source.

## 21. T20 target gate — selected target

**Target name:** Data-Quality Record-Status Source-Fidelity

**Root cause:** `buildDataQualityBlock()` (generate-tapping-projections.js, `record_status: profile.status`) copies the tapping dataset's top-level `.status` field with zero transformation and zero independent verification anywhere in the 15-check validator suite. Check 4 only confirms the copied value is a member of the valid-state enum — never that it equals the source record's actual `.status`.

**Authoritative source:** `data/datasets/metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json` — each record's top-level `.status` field, keyed by `tapping_profile_id`.

**Affected projection field:** `tapping-profiles.json rows[].data_quality.record_status` (all 29 rows).

**Affected consumers:** `reference/tapping-atlas.html` (per-card label + CSV column), `tools/tapping-workflow.html` (result section + comparison table + `js/tapping-workflow-data.js`), `reference/tapping-evidence.html` (per-profile label **and** the page's aggregate `recordVerified`/`recordSourceBound` scoreboard counts).

**Existing coverage:** None beyond enum-membership (check 4).

**Exact missing invariant:** For every profile row, `row.data_quality.record_status` must equal the corresponding source tapping-dataset record's `.status` field.

**Why T13–T19 do not already cover it:** T13/T14 derive `tap_drill.status`/`convention`/`provenance` from `hp.cross_verified` (a different object). T15 covers `application_notes[].source`. T16 covers `standards[]` denormalization. T17 covers `tap_types[]` relationship membership. T18 covers the thread block's engineering values. T19 covers `tap_drill.value`'s provenance-chain dereference. None reads or compares the tapping dataset's top-level `.status` field.

**Direct-inspection confirmation:** All 29 rows re-derived from the real source datasets and compared to the real projection. **0 mismatches.**

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, every dataset/entity/relationship/standards file (except as a temporary, restored mutation fixture), every product/CSV/client-data file, every other validator.

**Validator behavior required:** Add check 16. For each profile row, look up the source tapping-dataset record by `tapping_profile_id` (reuse the existing `sourceRecordById` map already built for checks 10/11/13), compare `sourceRecord.status` to `row.data_quality.record_status`. Fail on mismatch, naming the profile, projected value, and authoritative value.

**Pass criteria:** 0 errors on real data (confirmed by direct inspection above); correct, specific failure on a reproduced source-status mutation; all other 15 checks and every other validator unaffected.

## Mutation-test contract (not implemented)

Temporarily change `.status` on one real tapping-dataset record (e.g. `tap_m3x0_5_cut` in `metric_tapping.seed.json`, from `"source_bound"` to `"verified"`), backed up first, **without regenerating the projection**. Expect **FAIL**, naming that profile, the stale projected value (`source_bound`), and the new authoritative value (`verified`). Restore from backup, confirm byte-identical via checksum, confirm the validator returns to **PASS**. Determinism: validator run 3× on restored real data, byte-identical report checksum.

## Repository integrity

HEAD before and after this discovery: `0059490aa78f5044f4371decc7fada92625ea662`, matching `origin/main` throughout. Zero tracked files modified — every read this phase (validator, both projections, all six thread/tapping dataset files, all four consumer generators, `js/tapping-workflow-data.js`) was read-only. The one validator run (`node scripts/validators/validate-tapping-projections.js`) regenerated `docs/architecture/tapping-projection-validation-report.{json,md}` with byte-identical content (fixed `generated_at` constant, unchanged data) — confirmed via `git status --short` showing no diff. The three Node re-derivation scripts run during discovery only called `fs.readFileSync`/`JSON.parse`/`console.log` — wrote nothing to disk.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 16, `"Data-Quality Record-Status Matches Authoritative Tapping-Dataset Record"`, added immediately after check 15 (T19). For each of the 29 profiles it: reuses the existing `sourceRecordById` map (already built for checks 10/11/13); compares `sourceRecord.status` against `row.data_quality.record_status`; fails with the profile id, projected value, and authoritative value on any mismatch.

**Real-data pass.** Ran against the real, untouched projection and tapping datasets. **PASS, 0 errors** — all 29 profiles' `data_quality.record_status` exactly match their authoritative source records (consistent with the 29-row direct-inspection re-derivation performed during discovery).

**Mutation test.** Temporarily edited the real `data/datasets/metric_tapping.seed.json` (backed up first), changing `tap_m3x0_5_cut.status` from `"source_bound"` to `"verified"`, **without regenerating either projection** (confirmed via checksum: both projection files unchanged before/after the mutation and validator run). Ran the validator. **FAIL, 1 error:**
```
tap_m3x0_5_cut: data_quality.record_status is 'source_bound' but the authoritative tapping-dataset record's status is 'verified'
```
Correctly scoped to exactly the one mutated profile; all other 15 checks remained passing, confirming no unintended side effects.

**Restoration.** Restored `data/datasets/metric_tapping.seed.json` from the pre-mutation backup, confirmed byte-identical via SHA-256 (`d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`, matching the pre-mutation baseline exactly) and via `git diff --stat` showing zero diff from HEAD. Re-ran the validator. **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged: 5 in `validate-tapping-domain.js`, 1 in `validate-tapping-terminology.js`).

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`b073be71c6d942d04de57daa1999da19929fb3348b85d9e0597c948bd0611171`) every run.

**Checksums.** `data/datasets/metric_tapping.seed.json`, `metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, both T3 projections, all product HTML/CSV files, and `js/tapping-workflow-data.js` are all confirmed byte-identical before and after this phase (`git diff --stat` against each, zero output). **The generator was never run.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every `data/datasets/`/`data/standards/` file. The generator was deliberately left untouched — current data is already correct; T20 closes only the missing regression guard. `data_quality.provenance_complete` was not broadened into, per the governance instruction.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T21 was not started.

**T20 STATUS: READY FOR REVIEW.** See `audit/t20-change-scope.md` for the file accounting.
