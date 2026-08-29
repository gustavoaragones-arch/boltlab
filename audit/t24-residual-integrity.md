# T24 — Tapping Domain Residual Integrity Audit (Post-T23 Discovery)

Date: 2026-08-28
Type: **STRICT READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t24-residual-integrity.json](t24-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except the same 11 pre-existing untracked files (`.DS_Store`, `.claude/`, D2-phase audit files, `images/logo.ai`, etc.) — none touched.
- HEAD: `688d91f31d271a2041dbcf8880026cffc9a9af4b`
- `origin/main`: matches HEAD.
- `git log -25`: T23's commit present at HEAD; T22, T21... down through T2.1 all present in order.

**Gate PASSES.** Proceeding with discovery.

## 2. Certify the closed seams

Read `scripts/validators/validate-tapping-projections.js` in full and ran it against real, untouched data.

`node scripts/validators/validate-tapping-projections.js` → **PASS, 0 errors, 0 warnings**. Report checksum (`92c7fc5010cce2ac3a5e4efdcb4e3d21579c334e4d333081ffbd035bc4fc59eb` JSON / `6338c531f80598622cc5273bd1166e31305d8676993c5dada803eee4e954a533` md) matched the checksums recorded at the end of T23's implementation exactly, before and after this run — no rewrite occurred, no restoration needed.

All 11 named seams (T13–T23, checks 9–19) reconfirmed present, unmodified, and passing. **Total check count: 19.**

## 3–4. Fresh projection field inventory / generator assignment audit

Re-read `generate-tapping-projections.js` in full and re-classified every field in both projection files A–F from scratch (not reusing prior audit tables as ground truth, per this phase's explicit instruction). After eleven rounds of closures, `tapping-profiles.json`'s row is now **entirely** class A/D/E — no F field remains there; every direct-copy, derived, or aggregate field with an authoritative source and a user-facing rendering is now independently checked. `tap-types.json` has exactly one remaining F family:

**`tap-types.json rows[].title`, `.definition`** — direct copies of `entity.title`/`entity.definition`, zero transformation, never compared to source by any of the 19 checks (confirmed by grep: zero matches for `.title`/`.definition` anywhere in `validate-tapping-projections.js`).

`taxonomy_axis` — also a direct copy (`entity.taxonomy_axis || null`), but **reconfirmed always `null`** across all 7 tap-type entities (fresh check this phase) and **never rendered by any consumer** (grepped all four generators — only the generator's own assignment references it). Correctly classified E (inert), not a candidate.

Full A–F table in the JSON.

## 5. Post-T23 aggregate audit

Re-audited every aggregate field after T23's closure of `evidence_status`:
- `evidence_status.{verified_fact_count,source_bound_fact_count}` — T23-closed, reconfirmed present and passing.
- `data_quality_summary.*` (profile-level) — reconfirmed inert, unread by any consumer (unchanged since T17).
- `related_entities`/`related_standards`/`related_datasets` (both projections) — reconfirmed inert.
- `source_dataset_versions.*` — reconfirmed inert (unchanged since T23's finding).
- No new aggregate found; no aggregate's stale state can currently survive all checks except the already-named, lower-priority `data_quality.last_reviewed`.

## 6. Profile identity / source-record audit

Traced the full identity chain: `tapping_profile_id` (check 1, uniqueness) → `thread_id` → `findBaseThreadRecord()` designation match (T18-verified against the correct, system-routed thread dataset) → `hole_preparation.*` (T19/T21/T22-verified) → `iso_2306_alternative_drill.*` (T22-verified) → `operation` (T17-verified via relationship membership) → `status` (T20-verified).

Tested the specific corruption the brief names: *a projection row containing a valid-but-wrong source record identity, with all copied fields remaining internally coherent.* Given the confirmed global uniqueness of all 29 thread designations (T20, re-verified unchanged) and the fixed, correct dataset-to-thread-system pairing in `main()` (unchanged since T18), a "wrong-but-plausible" source record cannot currently resolve — `findBaseThreadRecord()` either finds the exact correct record (by exact designation string match) or none at all (which throws at generation time, not a silent corruption). No surviving mutation found.

One residual naming observation: `tapping_profile_id` strings (e.g. `"tap_m3x0_5_cut"`) are manually authored in the source JSON and not derived from `thread_id`; nothing enforces the ID's embedded designation text matches its own record's `thread_id`. This is real but classified out of scope — the ID is an internal key/anchor, not a rendered engineering claim, and every actual engineering value (`thread.designation`, `tap_drill.*`, etc.) is independently source-verified regardless of what the ID string says. Fails gate criterion 10 (not merely cosmetic/naming).

## 7. Dataset routing audit

Re-verified (fresh, not reused) the metric/UNC/UNF pairing in `main()`, the zero-collision designation set across all three thread datasets, and unit routing (`mm` for metric, `in` for UNC/UNF) — all unchanged and correct. No routing defect found; this area has now been independently reconfirmed in T18, T19, T20, T21, and this phase, with identical results each time.

## 8. Composite/cross-field integrity audit

Re-tested every pairing in the brief's list against the current, unchanged generator and the now-19-check validator. Every pairing already investigated in T20–T23 remains closed or non-defective (record status vs. tap-drill status: intentionally independent, confirmed again; standard vs. profile: dataset-level, sole association, confirmed again; ISO alternative vs. thread system: structurally enforced by check 5). No new composite defect found. Nothing in the generator changed since T22, so no new cross-field interaction was introduced.

## 9. Engineering semantics audit

Inventoried every user-facing engineering statement per the brief's list. All numeric/status statements (tap drill, ISO alternative, diameter, pitch, TPI, coarse/fine, standard family, tap type, application-note facts, verification status, cross-verification wording, engagement limitation) are now source-backed and independently validated by checks 9–19. **`title`/`.definition`** are the only remaining user-facing engineering *identity/description* statements without that backing — a tap type's own name and definition, rendered as the primary heading and lead paragraph on both the Guide and Atlas pages, and as the tap-type label text on the Workflow page (via `js/tapping-workflow-data.js`, confirmed present there too — 114 occurrences of `title`/`definition` keys).

## 10. Status/trust semantics audit

Re-traced every status-bearing field. `tap_drill.status` (T13), `data_quality.record_status` (T20), `application_notes[].status` (T15, per-fact), `evidence_status` counts (T23), `alternative_drill.status` (T22), and `standards[].verification_state` (T16) are all now independently checked. No status relationship was found where a claim can become stronger or weaker than the authoritative evidence while all 19 checks remain green. Not reopening T13/T20/T23.

## 11. Provenance/evidence chain audit

Re-audited every citation/provenance object. `tap_drill.provenance.{source,cross_check}` (T14), `.{source_dataset,source_record,source_field}` (T21), and the dereferenced value itself (T19) are closed. `alternative_drill`'s citation-shaped fields (`table`, `verified_date`) are T22-closed as direct copies (no cross-dataset pointer exists for them, as established in T20's discovery — the ISO 2306 alternative has no re-derivable in-repo table). No new provenance mechanism found; not reopening T19/T21.

## 12. Standards semantic audit

Re-examined standard association, applicability, and ordering. Confirmed again (fresh grep this phase) that no per-profile standards field exists anywhere in the three tapping datasets — `tappingDataset.source_standards` remains the sole, dataset-level association mechanism, with no more-specific authoritative association to compare against. No standards finding qualifies.

## 13. Tap-type semantic audit

Re-examined identity, operation association, fact association, classification, ordering, status, and source-tier interpretation. Entity-id keying remains collision-free (Map-based). `source_tier` and the hardcoded classification-to-field map remain deferred, no new evidence. The one remaining tap-type-level gap is `title`/`.definition` fidelity — see §3–4/§9 above.

## 14. Consumer-fidelity audit

Traced all 8 consumer surfaces. No new semantic transformation found in any of them beyond what T13–T23 already account for. `title`/`.definition` are rendered verbatim (no transformation) on Atlas, Guide, and Workflow — confirmed by direct grep with line numbers (see JSON).

## 15. Numeric-claim audit

No new numeric gap. `title`/`.definition` are text, not numeric claims — correctly classified under engineering-semantics/tap-type findings rather than here. Every numeric claim inventoried (diameter, pitch, TPI, tap drill, ISO alternative, units, standards, verification/evidence counts) is now source-verified.

## 16. Negative-case matrix

See JSON. `title`/`.definition` is the only candidate that clears every eligibility condition (current validators = NO, user-visible = YES, material = YES, authoritative basis = YES, mutation-testable = YES, bounded fix = YES). `data_quality.last_reviewed` remains real but is not re-selected here (see §17) — carried forward unchanged as a lower-priority, dataset-level metadata gap, materially smaller than a tap type's own name/definition text.

## 17. Previously deferred findings — recheck

| Finding | Classification |
|---|---|
| Hardcoded tap-type classification arrays | RECONFIRMED OUT OF SCOPE |
| Generated-artifact staleness (general) | RECONFIRMED OUT OF SCOPE |
| `alternative_drill.standard_edition` hardcode | RECONFIRMED DEFERRED |
| `application_notes[].source_tier` | RECONFIRMED DEFERRED |
| Protected CSV wording (T11 exception) | RECONFIRMED OUT OF SCOPE |
| Tap Drill Calculator independent architecture | RECONFIRMED OUT OF SCOPE |
| Cross-product discovery-link deferrals | RECONFIRMED OUT OF SCOPE |
| Inert projection aggregates (`data_quality_summary`, `related_entities`/`related_standards`/`related_datasets`, `source_dataset_versions`) | RECONFIRMED DEFERRED |
| UNF `source_entity_id` reuse | RECONFIRMED DEFERRED |
| `data_quality.provenance_complete` | RECONFIRMED DEFERRED |
| `data_quality.last_reviewed` | RECONFIRMED DEFERRED — real, uncovered, still lower priority (dataset-level shared metadata vs. a tap type's own identity content) |
| `taxonomy_axis` | RECONFIRMED INTENTIONALLY ABSENT — always `null` in source, never rendered; genuinely inert, not merely unused-but-real |
| `tapping_profile_id` naming consistency with `thread_id` | **NEW THIS PHASE — considered, not selected.** Real but out of scope: internal identifier, not a rendered engineering claim; every actual value it might mis-describe is independently verified regardless. |
| **`tap-types.json rows[].title/.definition` fidelity** | **REOPENED — NEW EVIDENCE.** Named as a secondary, not-selected candidate in T23 (ranked below `evidence_status`, which is now closed). Reconfirmed this phase as the sole remaining genuinely-uncovered, materially user-facing field family in the entire tapping projection layer. Selected as the T24 target. |

## 18. No-target possibility — explicitly considered

Seriously weighed concluding **NO MATERIAL RESIDUAL TARGET** this phase, per the brief's explicit instruction not to invent work. The field surface is now extremely thin: `tapping-profiles.json` has zero remaining F fields; `tap-types.json` has exactly one (`title`/`.definition`), already identified and provisionally deferred twice (T22, T23) specifically because a higher-priority candidate existed each time. With `evidence_status` now closed, `title`/`.definition` is no longer competing against a stronger candidate — it stands on its own merits, and it clears every T24 gate criterion on direct re-examination (materially user-facing prose content, rendered on 3 product surfaces, zero coverage, clean bounded fix, mutation-testable). Concluded this is a legitimate target, not an invented one — it was flagged as real in two prior phases and has simply never been the top priority until now.

## 19. Risk ranking

1. **`tap-types.json title`/`.definition` source-fidelity** — the only candidate clearing every gate criterion; broadest remaining consumer surface (Atlas, Guide, Workflow) for any uncovered field.
2. `data_quality.last_reviewed` — real, uncovered, but dataset-level shared metadata, lower materiality than per-entity identity content.
3. All other surveyed areas — closed by T13–T23 or structurally non-defective.

## 20. T24 target gate — selected target

**Target name:** Tap-Type Title and Definition Source-Fidelity

**Root cause:** `buildTapTypeProjection()` copies `entity.title`/`entity.definition` verbatim with zero transformation and zero independent comparison to source anywhere in the 19-check validator suite.

**Authoritative source:** `data/entities/entities.seed.json` — each `tap_type` entity's `title`/`definition` fields.

**Affected projection field:** `tap-types.json rows[].title`, `rows[].definition` (all 7 tap types).

**Affected consumers:** `reference/tap-type-guide.html` (table cell + `<h2>` section heading + definition paragraph), `reference/tapping-atlas.html` (`<h3>` card heading + definition paragraph), `tools/tapping-workflow.html` via `js/tapping-workflow-data.js` (tap-type label lookups).

**Existing coverage:** None. `validate-tapping-atlas.js`'s use of `row.title` only confirms the HTML contains a matching card — consumer fidelity, not source fidelity.

**Exact missing invariant:** For every tap-type row, `row.title` must equal the authoritative entity's `title`, and `row.definition` must equal its `definition`.

**Why T13–T23 do not already cover it:** No prior phase named `tap-types.json`'s `title`/`.definition` fields. T6/T15/T17/T23 all address `application_notes`/`tap_types[]`/`evidence_status` — different field families on the same or a sibling projection, never the tap type's own identity/description text.

**Direct-inspection confirmation:** 14 comparisons (7 tap types × 2 fields) re-derived from the real `entities.seed.json` and compared to the real projection. **0 mismatches.**

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, `entities.seed.json` (except as a temporary, restored mutation fixture), every dataset/relationship/standards file, every product/CSV/client-data file, every other validator.

**Validator behavior required:** Add check 20. For each `tap-types.json` row, look up the entity via `tapTypeEntitiesById` (already built for check 9), compare `entity.title` to `row.title` and `entity.definition` to `row.definition`. Fail on any mismatch, naming the entity id, the field, the projected value, and the authoritative value.

**Pass criteria:** 0 errors on real data (confirmed by direct inspection above); correct, specific failure on a reproduced source mutation; all other 19 checks and every other validator unaffected.

## Mutation-test contract (not implemented)

Given T23's finding that a source-side edit to a fact's `status` was unexpectedly caught by an *existing* check (check 9) rather than proving the new check's unique value, the same risk is evaluated here before proposing a contract: `title`/`.definition` are **not** read by check 9 or any other existing check under any circumstance (confirmed by the complete absence of `.title`/`.definition` references in `validate-tapping-projections.js`), so a source-side mutation should cleanly isolate this seam without the T23 complication. Contract: temporarily change one real `entity.title` or `entity.definition` in `entities.seed.json` (e.g. append a distinguishing phrase to `bottoming_tap`'s `definition`), backed up first, without regenerating the projection. With the pre-T24, 19-check validator (temporarily stashed), expect **PASS, 0 errors** — confirming no existing check reads these fields. Restore the new check: expect **FAIL**, naming the entity, field, stale projected value, and new authoritative value. Restore `entities.seed.json`, confirm byte-identical via checksum, confirm PASS. Determinism: validator run 3× on restored data, byte-identical report checksum. Run the full 9-validator tapping suite, including `validate-tapping-atlas.js` and `validate-tap-type-guide.js` (both of which read `title` for their own HTML-matching checks) to confirm no regression.

## Repository integrity

HEAD before and after this discovery: `688d91f31d271a2041dbcf8880026cffc9a9af4b`, matching `origin/main` throughout. Zero tracked files modified — every read this phase was read-only. The one validator run produced a byte-identical report (confirmed via checksum before/after, matching T23's final determinism checksum exactly) — no restoration was needed. All read-only Node scripts run during discovery only called `fs.readFileSync`/`JSON.parse`/`console.log` — wrote nothing to disk.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 20, `"Tap-Type Title and Definition Match Authoritative Entity Record"`, added immediately after check 19 (T23). For each of the 7 tap-type rows it: reuses the existing `tapTypeEntitiesById` map (already built for check 9); compares `entity.title` to `row.title` and `entity.definition` to `row.definition`; fails with the entity id, field, projected value, and authoritative value on any mismatch.

**Baseline pass.** Ran against the real, untouched projection. **PASS, 0 errors** — consistent with the 14-comparison direct-inspection re-derivation performed during discovery.

**Mutation test.** Temporarily edited the real `data/entities/entities.seed.json` (backed up first), appending `" [T24-MUTATION-TEST-MARKER]"` to `bottoming_tap`'s `definition`, **without regenerating either projection**. Set check 20 aside via `git stash push -- scripts/validators/validate-tapping-projections.js`, restoring the exact pre-T24, 19-check validator. Ran it: **PASS, 0 errors** — confirming, exactly as predicted in the discovery document, that no existing check reads `title`/`.definition` under any circumstance (unlike T23's first attempt, this prediction held on the first try). Restored check 20 via `git stash pop`, ran again against the same still-mutated data: **FAIL, 1 error:**
```
bottoming_tap: row.definition is 'A tap with a short chamfer, ...bottom of a blind hole.' but the authoritative entity's definition is 'A tap with a short chamfer, ...bottom of a blind hole. [T24-MUTATION-TEST-MARKER]'
```
Restored `entities.seed.json` from backup, confirmed byte-identical via SHA-256 (`0de67516d3e539425d7aa18a4bc4ba3499556d6259441a1f9c00b8e92fbc66b2`) and `git diff --stat` (zero diff from HEAD).

**Real-data re-check.** Ran the validator on the fully restored, real data: **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged: 5 in `validate-tapping-domain.js`, 1 in `validate-tapping-terminology.js`) — including `validate-tapping-atlas.js` and `validate-tap-type-guide.js`, both of which read `title` for their own HTML-matching checks.

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`fa1ac020a4265c2ef39a076e03b2229a0993f2515094f94d3bb9b73e202a5c78`) every run.

**Checksums.** `data/entities/entities.seed.json`, both T3 projections, every dataset file, every product HTML/CSV file, and `js/tapping-workflow-data.js` are all confirmed byte-identical before and after this phase (`git diff --stat` against each, zero output). **The generator was never run; neither projection was ever regenerated.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified (permanently):** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, every other dataset/relationship/standards file, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator. `data_quality.last_reviewed` was not addressed; no deferred finding was reopened.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T25 was not started.

**T24 STATUS: READY FOR REVIEW.** See `audit/t24-change-scope.md` for the file accounting.
