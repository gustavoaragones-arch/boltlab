# T21 — Tapping Domain Residual Integrity Audit (Post-T20 Discovery)

Date: 2026-08-26
Type: **STRICT READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t21-residual-integrity.json](t21-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except the same 11 pre-existing untracked files (`.DS_Store`, `.claude/`, D2-phase audit files, `images/logo.ai`, etc.) — none touched.
- HEAD: `f71f92085ca56cfc061967b203248e6bd855c770`
- `origin/main`: matches HEAD.
- `git log -12`: T20's commit (`T20: Verify data-quality record status against authoritative tapping dataset`) present at HEAD; T19, T18, T17... down through T9 all present in order.

**Gate PASSES.** Proceeding with discovery.

## 2. Certify the closed seams

Read `scripts/validators/validate-tapping-projections.js` in full (582 lines, 16 checks) and ran it against real, untouched data.

| Phase | Check name | Present | Result |
|---|---|---|---|
| T13 | Check 10, "Tap-Drill Status Correctly Derived From Source Cross-Verification" | Yes | pass |
| T14 | Check 11, "Tap-Drill Convention and Cross-Check Narrative Correctly Derived From Source Cross-Verification" | Yes | pass |
| T15 | Check 9's source-fidelity clause | Yes | pass |
| T16 | Check 12, "Standards Denormalized Fields Match Authoritative Standard Record" | Yes | pass |
| T17 | Check 13, "Tap-Type Relationship Membership Matches Authoritative RELATES_TO Graph" | Yes | pass |
| T18 | Check 14, "Thread Block Engineering Values Match Authoritative Thread Dataset Record" | Yes | pass |
| T19 | Check 15, "Tap-Drill Value Provenance Chain Resolves To The Authoritative Source Field" | Yes | pass |
| T20 | Check 16, "Data-Quality Record-Status Matches Authoritative Tapping-Dataset Record" | Yes | pass |

`node scripts/validators/validate-tapping-projections.js` → **PASS, 0 errors, 0 warnings**, 16 checks total (`checks.push()` called 16 times). None reopened or modified. `git status --short` after the run shows no diff (fixed `generated_at` constant, unchanged data).

## 3–4. Projection inventory / source-to-projection seam audit

Full table in the JSON. Walked every assignment in `generate-tapping-projections.js` again, specifically hunting for values that are copied-without-comparison, per section 4's checklist. One family crosses into **F — genuinely uncovered**:

| Field | Class | Why |
|---|---|---|
| `tap_drill.provenance.{source_dataset, source_record, source_field}` | **F — genuinely uncovered** | Direct copies of `hp.source_dataset`/`hp.source_record`/`hp.source_field` (`buildTapDrillBlock()`). Check 2 confirms `provenance.source_dataset` is *a* valid dataset id (existence only). Check 3 confirms the three fields are non-empty. **Check 15 (T19) dereferences these fields to prove `tap_drill.value` resolves correctly through them — but never compares the fields themselves back to the current tapping-dataset record's own `hole_preparation.source_dataset/source_record/source_field`.** These three strings are independently rendered as "Source dataset:" / "Source record:" / "Source field:" citation lines on both the Atlas provenance dropdown (`generate-tapping-atlas.js:138-140`) and the Evidence page (`generate-tapping-evidence.js:329-331`), and are embedded (145 occurrences) in `js/tapping-workflow-data.js`. |

Everything else re-surveyed this phase (thread block, tap_drill.value/status/convention, standards, tap_types, application_notes, record_status, alternative_drill structural rules, engagement constants) remains correctly classified A/B/D/E per T13–T20's existing closures — no new gap found in those families.

## 5. Identity/join/record-selection audit

Re-walked every lookup in `generate-tapping-projections.js` (`findBaseThreadRecord`, the three-way tapping/thread dataset pairing in `main()`, `resolveEntityContext`, `buildStandardsBlock`'s `standardById.get()`). No new join was found beyond what T17/T18/T19 already closed. Reconfirmed (not re-litigated) T20's finding that no cross-system designation collision exists (29 designations, 0 collisions) and that `thread_system` → dataset-id routing is 100% consistent in current data.

## 6. Transformation audit — where the finding comes from

Re-catalogued every transformation in the generator per section 6's list (unit handling, status derivation, array construction, provenance construction, conditional object creation). `buildTapDrillBlock()`'s **provenance construction** is a five-field object combining two different derivation modes in one literal: two fields (`source`, `cross_check`) are *derived* from `hp.cross_verified` (T14-closed); three fields (`source_dataset`, `source_record`, `source_field`) are *plain copies* of sibling `hp.*` fields with no transformation at all. T14 closed the derived half. **The copied half was never independently checked against its own source** — T19's check 15 uses these copied fields as an *input* (to dereference the thread dataset) rather than as an *output* to be verified against `hp.*`. This is the exact "value copied without comparison, immediately adjacent to an already-closed derived sibling" pattern section 6 asks to hunt for.

## 7–9. Composite consistency / unit-dimensional / tap-drill semantic audits

- **Composite consistency:** Re-examined every pairing in section 7's list. All were already resolved by T13–T20 or found non-defective in T20's discovery (record status vs. tap-drill status is intentionally independent; standard vs. profile association is dataset-level by design, confirmed again — no per-record override exists to be silently ignored). No new composite defect found.
- **Unit/dimensional semantics:** Reconfirmed metric rows uniformly `mm`, UNC/UNF rows uniformly `in` (direct read of all three tapping datasets); T19's unit/source-field pairing check (`mm`↔`tap_drill_mm`, `in`↔`tap_drill_in`) remains the binding constraint on `tap_drill.unit` vs. `tap_drill.provenance.source_field`. No dimensional defect found — the T21 finding is about the *citation strings'* fidelity to source, not about any unit or numeric-value error.
- **Tap-drill/thread relationships explicitly claimed by the repo:** The one relationship the repo actually asserts and does not yet guard is precisely the finding above — "the provenance pointer must correspond to what the source record currently declares." No other repo-asserted relationship (e.g., ISO-alternative-remains-an-alternative, metric/UNC/UNF applicability) was found unguarded; all are covered by check 5 (T-prior) or are not computable from any second in-repo dataset (the ISO 2306 alternative value itself, as established in T20's discovery, has no re-derivable in-repo source).

## 10–12. Tap-type / standards / data-quality audits

- **Tap-type:** Reconfirmed entity-id keying is 1:1 and collision-free (Map-based construction); no mechanism exists for a fact to attach to the wrong tap-type entity without an id collision in `entities.seed.json`, which the knowledge-engine layer's own uniqueness guarantees. `source_tier` and the hardcoded classification arrays reconfirmed with no new failure mechanism — not reopened.
- **Standards:** Reconfirmed dataset-level `source_standards` remains the sole association mechanism (no per-record override field exists in any of the three tapping datasets, re-grepped this phase). Not a defect.
- **Data-quality:** `data_quality.provenance_complete` re-examined per section 12's explicit instruction. Its formula (`Boolean(hp.source_dataset && hp.source_record && hp.source_field)`) is a boolean derivation over the same three fields as this phase's finding. Traced its validator coverage (check 3) exhaustively: all four truth-table combinations of {fields-present, provenance_complete-value} are shown to produce a check-3 failure whenever they diverge (see JSON `record_status_audit` — carried over from T20 — for the truth table). **`provenance_complete` itself remains adequately, if indirectly, covered; it is not reselected.** `last_reviewed` remains dataset-level, low-materiality, not selected.

## 13. Provenance chain audit — the finding, precisely stated

Enumerated every explicit provenance/citation pointer in the projection: `thread.source_entity_id`/`source_dataset`/`source_record` (deferred/inert per T17/T18 — reconfirmed unrendered this phase), `tap_drill.provenance.*` (this finding), `alternative_drill.provenance.*` (citation metadata only, `source`/`table`/`verified_date`, not a resolvable in-repo pointer — see T20's ISO-alternative discussion, unchanged), `standards[].standard_id` (existence + T16 content fidelity, closed).

For `tap_drill.provenance.{source_dataset,source_record,source_field}` specifically, walking section 13's five questions:

1. **Does it resolve?** Yes (check 15 confirms this).
2. **Does it resolve to the correct record?** Yes, as currently projected (check 15 confirms this, using the projection's own copy of the pointer).
3. **Does it resolve to the displayed value?** Yes (check 15's actual comparison).
4. **Do current validators prove all of the above against the live, current source?** **No.** Check 15 never touches `sourceRecordById.get(row.tapping_profile_id).hole_preparation.{source_dataset,source_record,source_field}` — the actual, current, authoritative citation declared in the tapping dataset. It proves internal projection consistency, not projection-vs-source freshness.
5. **Can a source mutation expose a stale pointer undetected?** **Yes, demonstrably.** If `hp.source_dataset` (or `source_record`, or `source_field`) is edited in a tapping-dataset file without regenerating the projection, `row.tap_drill.provenance.*` stays stale (still citing the old dataset/record/field). Check 15 re-derives from the *stale, projected* pointer — since neither the pointer's target value nor `row.tap_drill.value` changed, check 15 **still reports PASS**, because it never looks at what the source *currently* says the pointer should be. Checks 2 and 3 also do not catch this (existence and non-emptiness only). **No check in the 16-check suite would fail.**

**Direct-inspection confirmation (current data, real files, read-only):** independently re-derived `tap_drill.provenance.{source_dataset,source_record,source_field}` for all 29 rows directly from the three real tapping-dataset source files and compared to the real projection. **0 mismatches across 87 comparisons (29 rows × 3 fields).** Current data is correct; the gap is exclusively the missing regression guard — identical in shape to every prior T13–T20 finding at its own discovery stage.

## 14. Evidence/citation semantics

These three fields are exactly the kind of citation the brief in section 14 is concerned with: "Source dataset: metric_threads / Source record: M3x0.5 / Source field: tap_drill_mm" is presented to users as the literal, checkable trail they could use to independently verify a drill-size recommendation. A stale citation here would not just be cosmetically wrong — it would point an auditing user at the wrong dataset, wrong record, or wrong field name while the page continues to look fully verifiable. This is materially trust-relevant, not a formatting nuance.

## 15. Consumer fidelity

- `reference/tapping-atlas.html` — `renderProvenance(row)` renders all three fields verbatim inside each card's provenance `<ul>` (lines 135-150).
- `reference/tapping-evidence.html` — renders all three fields verbatim per profile (lines 325-332), with a "Provenance not available in the current projection." fallback for empty values (never triggered currently, since check 3 already guarantees non-emptiness).
- `tools/tapping-workflow.html` — does **not** render these three fields directly in its own UI (grepped `generate-tapping-workflow.js`: no match), but `js/tapping-workflow-data.js` (which the Workflow page loads) embeds the full profile objects and therefore carries all three fields (145 occurrences across 29 rows × 5 provenance-shaped fields, including `thread.source_dataset`/`source_record`) even though Workflow's own rendering code never surfaces them as visible text.
- `downloads/tapping-atlas.csv` — does not include a provenance-citation column (confirmed via the CSV header list, unchanged since T18's audit).
- No transformation, filtering, or reordering was found in any consumer beyond direct verbatim rendering — no new consumer-level semantic error exists independent of the source-fidelity gap itself.

## 16–17. Numeric/engineering-claim and aggregation audits

No new numeric value or aggregate count was found uncovered. The finding here is a **citation-fidelity**, not a numeric-value, gap — `tap_drill.value` itself remains fully guarded by T19. No count in the domain depends on `tap_drill.provenance.{source_dataset,source_record,source_field}`.

## 18. Generated-artifact staleness

**RECONFIRMED OUT OF SCOPE** — no new tapping-specific bounded solution beyond continuing the per-field regression-guard pattern (which this phase's finding is itself an instance of). Not broadened into build-system architecture.

## 19. Previously deferred findings — recheck

| Finding | Classification |
|---|---|
| Hardcoded tap-type classification arrays | RECONFIRMED OUT OF SCOPE |
| Generated-artifact staleness (general) | RECONFIRMED OUT OF SCOPE |
| `alternative_drill.standard_edition` hardcode | RECONFIRMED DEFERRED |
| `application_notes[].source_tier` | RECONFIRMED DEFERRED |
| Protected CSV wording (T11 exception) | RECONFIRMED OUT OF SCOPE |
| Tap Drill Calculator independent architecture | RECONFIRMED OUT OF SCOPE |
| Cross-product discovery-link deferrals | RECONFIRMED OUT OF SCOPE |
| Inert projection aggregates (`data_quality_summary`, `related_entities`/`related_standards`/`related_datasets`) | RECONFIRMED DEFERRED |
| UNF `source_entity_id` reuse | RECONFIRMED DEFERRED |
| `data_quality.provenance_complete` | RECONFIRMED DEFERRED — re-examined per this phase's explicit instruction; adequately, if indirectly, covered by check 3's truth-table behavior; no new evidence of a live gap |
| **`tap_drill.provenance.{source_dataset,source_record,source_field}` fidelity** | **REOPENED — NEW EVIDENCE.** Not named in any prior T13–T20 audit. Confirmed zero current mismatches; confirmed check 15 (T19) does not and cannot catch a source-side citation mutation because it never consults the current tapping-dataset record. Selected as the T21 target. |

No other finding was reopened without new evidence.

## 20. Negative-case matrix

| Candidate | Authoritative source | Current validator | User-visible | Material | Mutation-testable | Bounded | Eligible |
|---|---|---|---|---|---|---|---|
| **`tap_drill.provenance.{source_dataset,source_record,source_field}` vs `hp.{source_dataset,source_record,source_field}`** | tapping dataset `hole_preparation.*` | **NO** — check 15 dereferences the stale projected pointer itself, never the live source | **YES** — Atlas + Evidence citation lines, embedded in client JS | **YES** — misleads an auditing user to the wrong dataset/record/field | **YES** | **YES** | **YES — SELECTED** |
| `data_quality.provenance_complete` boolean re-derivation | `tap_drill.provenance.*` | Indirect (all 4 truth-table divergences already produce a check-3 failure) | Low (boolean, not itself displayed as text) | Low | Marginal | Yes | NO — already adequately covered |
| Any composite-consistency pairing (§7 list) | various | Already guarded or structurally non-defective | — | — | — | — | NO — no live defect found |
| Standards association "wrong for profile" | tapping dataset | N/A | — | — | Only one association exists | — | NO — not a real defect |

## 21. Risk ranking

1. **`tap_drill.provenance.{source_dataset,source_record,source_field}` fidelity** — the only candidate this phase found with zero coverage, a concretely demonstrated blind spot in an adjacent already-closed check (T19), direct rendering as a user-facing evidentiary trail on two product surfaces, and a clean, bounded, single-check fix.
2. `data_quality.provenance_complete` — real field, but adequately covered indirectly; not selected.
3. All other surveyed areas — investigated and found either already closed by T13–T20, structurally non-exploitable with current data/schema, or lacking a re-derivable in-repo authoritative source.

## 22. T21 target gate — selected target

**Target name:** Tap-Drill Provenance Citation Fidelity

**Root cause:** `buildTapDrillBlock()` copies `hp.source_dataset`, `hp.source_record`, `hp.source_field` verbatim into `tap_drill.provenance.{source_dataset,source_record,source_field}` with zero transformation. Check 15 (T19) uses these copied fields as a *lookup key* to prove `tap_drill.value` is internally consistent with whatever the projection's own pointer says — but never compares the pointer itself back to the tapping dataset's current, authoritative `hole_preparation.{source_dataset,source_record,source_field}`. A source-side edit to any of these three citation fields, left unregenerated, leaves the projection citing a stale dataset/record/field while every one of the 16 existing checks — including T19's own dereference check — continues to pass.

**Authoritative source:** `data/datasets/metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json` — each record's `hole_preparation.source_dataset`/`source_record`/`source_field`, keyed by `tapping_profile_id`.

**Affected projection field:** `tapping-profiles.json rows[].tap_drill.provenance.{source_dataset,source_record,source_field}` (all 29 rows, 87 field instances).

**Affected consumers:** `reference/tapping-atlas.html` (provenance dropdown, all three fields), `reference/tapping-evidence.html` (per-profile provenance detail, all three fields); embedded (not separately rendered) in `js/tapping-workflow-data.js`.

**Existing coverage:** None beyond existence (check 2, `source_dataset` only) and non-emptiness (check 3, all three).

**Exact missing invariant:** For every profile row, `row.tap_drill.provenance.source_dataset` must equal `sourceRecord.hole_preparation.source_dataset`; likewise for `source_record` and `source_field`, where `sourceRecord` is the authoritative tapping-dataset record for that `tapping_profile_id`.

**Why T13–T20 do not already cover it:** T13/T14 derive `status`/`convention`/`provenance.{source,cross_check}` from `hp.cross_verified` — the *other two* fields of the same `provenance` object, not these three. T15–T18, T20 cover entirely different field families. T19 is the closest relative but proves internal projection consistency (pointer → dereferenced value), not source-vs-projection citation freshness — a distinct invariant, demonstrated concretely in §13 above with a mutation T19's own check cannot catch.

**Direct-inspection confirmation:** All 29 rows × 3 fields re-derived from the real source datasets and compared to the real projection. **0 mismatches (87/87).**

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, every dataset/entity/relationship/standards file (except as a temporary, restored mutation fixture), every product/CSV/client-data file, every other validator.

**Validator behavior required:** Add check 17. For each profile row, look up the source tapping-dataset record by `tapping_profile_id` (reuse the existing `sourceRecordById` map already built for checks 10/11/13/16), compare `sourceRecord.hole_preparation.source_dataset`, `.source_record`, `.source_field` individually against `row.tap_drill.provenance.source_dataset`, `.source_record`, `.source_field`. Fail on any mismatch, naming the profile, the field, the projected value, and the authoritative value.

**Pass criteria:** 0 errors on real data (confirmed by direct inspection above); correct, specific failure on a reproduced source-citation mutation; all other 16 checks and every other validator unaffected.

## Mutation-test contract (not implemented)

Temporarily change `hole_preparation.source_field` on one real tapping-dataset record (e.g. `tap_m3x0_5_cut` in `metric_tapping.seed.json`, from `"tap_drill_mm"` to a different but still-plausible string, or change `source_record` to a different valid thread designation), backed up first, **without regenerating the projection**. Expect: **before the fix**, the full 16-check suite still reports PASS (demonstrating the gap); **after the fix**, check 17 reports **FAIL**, naming that profile, the mismatched field, the stale projected value, and the new authoritative value. Restore from backup, confirm byte-identical via checksum, confirm the validator returns to PASS. Determinism: validator run 3× on restored real data, byte-identical report checksum.

## Repository integrity

HEAD before and after this discovery: `f71f92085ca56cfc061967b203248e6bd855c770`, matching `origin/main` throughout. Zero tracked files modified — every read this phase (validator, both projections, all tapping/thread dataset files, all four consumer generators, `js/tapping-workflow-data.js`) was read-only. The one validator run regenerated `docs/architecture/tapping-projection-validation-report.{json,md}` with byte-identical content (fixed `generated_at` constant, unchanged data) — confirmed via `git status --short` showing no diff. All read-only Node scripts run during discovery only called `fs.readFileSync`/`JSON.parse`/`console.log` — wrote nothing to disk.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 17, `"Tap-Drill Provenance Citation Matches Authoritative Tapping-Dataset Record"`, added immediately after check 16 (T20). For each of the 29 profiles it: reuses the existing `sourceRecordById` map (already built for checks 10/11/13/16); compares `sourceRecord.hole_preparation.source_dataset`, `.source_record`, `.source_field` individually against `row.tap_drill.provenance.source_dataset`, `.source_record`, `.source_field`; fails with the profile id, field name, projected value, and authoritative value on any mismatch.

**Baseline pass.** Ran against the real, untouched projection and tapping datasets. **PASS, 0 errors** — all 29 profiles' `tap_drill.provenance.{source_dataset,source_record,source_field}` exactly match their authoritative source records (consistent with the 87-comparison direct-inspection re-derivation performed during discovery).

**Pre-fix demonstration (required by the review).** Temporarily edited the real `data/datasets/metric_tapping.seed.json` (backed up first), changing `tap_m3x0_5_cut.hole_preparation.source_record` from `"M3x0.5"` to `"M4x0.7"` (another valid designation in the same dataset — a realistic "wrong citation" mutation), **without regenerating either projection**. The check-17 addition was then temporarily set aside via `git stash push -- scripts/validators/validate-tapping-projections.js`, restoring the exact pre-T21, 16-check validator. Ran it against the mutated data: **PASS, 0 errors** — confirming, with the real file and the real pre-T21 validator, that the existing 16 checks do not detect this mutation (check 15/T19 dereferences the unchanged, still-stale-but-internally-consistent projected pointer; checks 2/3 only prove existence/non-emptiness).

**Mutation failure with check 17 present.** Restored check 17 via `git stash pop`. Ran the validator again against the same still-mutated data. **FAIL, 1 error:**
```
tap_m3x0_5_cut: tap_drill.provenance.source_record is 'M3x0.5' but the authoritative tapping-dataset record's hole_preparation.source_record is 'M4x0.7'
```
Correctly scoped to exactly the one mutated profile; all other 16 checks remained passing, confirming no unintended side effects.

**Restoration.** Restored `data/datasets/metric_tapping.seed.json` from the pre-mutation backup, confirmed byte-identical via SHA-256 (`d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`, matching the pre-mutation baseline exactly) and via `git diff --stat` showing zero diff from HEAD. Re-ran the validator. **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged: 5 in `validate-tapping-domain.js`, 1 in `validate-tapping-terminology.js`).

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`928df0b8fa0a3809c4a55f5122dd12aa9575ead8f5da5ef25433b09ba89f7f70`) every run.

**Checksums.** `data/datasets/metric_tapping.seed.json`, `metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, both T3 projections, all product HTML/CSV files, and `js/tapping-workflow-data.js` are all confirmed byte-identical before and after this phase (`git diff --stat` against each, zero output). **The generator was never run.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every other `data/datasets/`/`data/standards/` file. The generator was deliberately left untouched — current data is already correct; T21 closes only the missing regression guard.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T22 was not started.

**T21 STATUS: READY FOR REVIEW.** See `audit/t21-change-scope.md` for the file accounting.
