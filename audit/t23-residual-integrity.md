# T23 — Tapping Domain Residual Integrity Audit (Post-T22 Discovery)

Date: 2026-08-27
Type: **STRICT READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t23-residual-integrity.json](t23-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except the same 11 pre-existing untracked files (`.DS_Store`, `.claude/`, D2-phase audit files, `images/logo.ai`, etc.) — none touched.
- HEAD: `33136db03bed0f98982fc74c715ab0a4ab00778f`
- `origin/main`: matches HEAD.
- `git log -20`: T22's commit present at HEAD; T21, T20... down through T3 all present in order.

**Gate PASSES.** Proceeding with discovery.

## 2. Certify the closed seams

Read `scripts/validators/validate-tapping-projections.js` in full (702 lines, 18 checks) and ran it against real, untouched data.

`node scripts/validators/validate-tapping-projections.js` → **PASS, 0 errors, 0 warnings**. Report checksum (`6716899a66914958fe1971dd17c3c03f32c5e575a38f226deffa081cf514f0ec` for the JSON) matched the checksum recorded at the end of T22's implementation exactly, both before and after this run — confirming zero drift and that the run produced no rewrite requiring restoration.

| Phase | Check index | Present | Result |
|---|---|---|---|
| T13 | 10 | Yes | pass |
| T14 | 11 | Yes | pass |
| T15 | 9 (source clause) | Yes | pass |
| T16 | 12 | Yes | pass |
| T17 | 13 | Yes | pass |
| T18 | 14 | Yes | pass |
| T19 | 15 | Yes | pass |
| T20 | 16 | Yes | pass |
| T21 | 17 | Yes | pass |
| T22 | 18 | Yes | pass |

All 10 named seams certified present, unmodified, and passing. Total check count: **18**.

## 3–4. Projection inventory / fresh generator assignment audit — the finding

Re-read `generate-tapping-projections.js` in full and re-walked **every** assignment in both `buildProfileRows`/`buildTapTypeProjection`, not relying on prior audit notes. After ten rounds of closures the `tapping-profiles.json` row is now almost entirely class A/D/E — no new F field was found there. `tap-types.json`, however, still had two genuinely uncovered aggregate/direct-copy fields:

**`evidence_status.{verified_fact_count, source_bound_fact_count}`** (per tap-type row) — computed in `buildTapTypeProjection()`:
```js
const verifiedCount = notes.filter((n) => n.status === "verified").length;
const sourceBoundCount = notes.filter((n) => n.status === "source_bound").length;
```
where `notes = entity.application_notes || []`. This is a **separate derivation** from the four classification arrays (`general_taxonomy` etc., built via `byClass(cls)` filtering the same `notes` by *classification*, not *status*). Check 9 (T6/T15) verifies every individual fact inside those four arrays against `entity.application_notes` — source, status, classification, and total count — but **never reads or re-derives `evidence_status` at all.** It is a parallel computation over the same source array that Check 9 does not touch.

**`title`, `.definition`, `.taxonomy_axis`** (per tap-type row) — direct copies of `entity.title`/`.definition`/`.taxonomy_axis`, zero transformation, never compared to source by any check.

Full A–F table in the JSON.

## 5. T22-adjacent value fidelity — reconfirmation

Re-verified `tap_drill.{value,unit}` and all seven `alternative_drill.*` fields remain protected by check 18 (T22), unmodified, passing. Not reopened.

## 6. Identity/join audit

No new join found. `evidence_status` is not a join — it is a pure re-aggregation of the same `entity.application_notes` array already resolved via `tapTypeEntitiesById`/`byId` lookups elsewhere (T17's relationship resolution, check 9's fact-by-fact comparison). `title`/`.definition` are likewise plain field reads off the already-resolved `entity` object, no additional lookup involved. This finding is a **derivation-fidelity** gap (a separate computation over an already-correctly-resolved source), not an identity/join defect.

## 7. Transformation audit — precisely where this sits

`buildTapTypeProjection()`'s per-entity `map()` callback performs two *separate* transformations over the same `notes` array: (a) `byClass(cls)` — a classification-keyed filter, source-verified fact-by-fact by check 9; (b) the verified/source-bound counts — a status-keyed filter, **never independently re-derived and compared**. Both walk the identical source array; only one is guarded.

## 8. Composite consistency audit

Tested: could `evidence_status`'s total (`verified_fact_count + source_bound_fact_count`) diverge from the classification arrays' total (already checked equal to `sourceNotes.length` by check 9) while still passing every existing check? **Yes** — check 9's total-count comparison (`projectedTotal !== sourceNotes.length`) only constrains the classification-array total; it says nothing about how that total splits between `verified_fact_count` and `source_bound_fact_count`. A mutation that keeps the grand total correct but swaps the split (e.g. reports `0 verified / 16 source_bound` when the true split is `1 verified / 15 source_bound`) would pass every existing check, including check 9. Confirmed as a real, surviving composite-consistency gap — not closed by any current invariant.

## 9. Unit/dimensional audit

Not applicable to this finding (no numeric engineering unit involved). Reconfirmed no new dimensional defect elsewhere; all T18/T19/T22-guarded unit routing remains correct.

## 10–11. Tap-drill / ISO-alternative semantic audits

Re-audited both objects end-to-end. No new gap found — checks 10, 11, 15, 17, 18 collectively now guard every field with an authoritative in-repo source. `alternative_drill.standard_edition` reconfirmed deferred, no new evidence.

## 12. Tap-type audit — the finding, precisely stated

Walking the brief's checklist for the 7 tap types and 16 facts: **fact association, classification, source, and status are all individually source-verified (check 9). The *aggregate count of facts by status*, as separately re-derived and stored in `evidence_status`, is not.** This is a distinct invariant from fact-level fidelity — analogous to how T20 distinguished the aggregate `data_quality.record_status` from the per-field `tap_drill.status`, and how T13/T14 distinguished derived narrative fields from the plain copies T22 later closed.

**Direct-inspection confirmation (current data, real files, read-only):** independently re-derived `evidence_status.verified_fact_count`/`source_bound_fact_count` for all 7 tap types directly from `entities.seed.json`'s `application_notes` and compared to the real projection. **0 mismatches across 14 comparisons (7 tap types × 2 fields).**

`source_tier` reconfirmed deferred, not reopened (no new evidence of a false-claim mechanism).

## 13. Standards audit

No new finding. Standards association, denormalized fields, and ordering all remain correctly guarded or structurally non-defective, unchanged from T16/T20/T21/T22's cumulative findings.

## 14. Data-quality/trust-state audit

`data_quality.provenance_complete` reconfirmed adequately covered indirectly (T21's truth-table analysis, unchanged, no new surviving mutation found). `data_quality.last_reviewed` reconfirmed genuinely uncovered (named in T22, not selected) — still real, still lower-priority than a per-fact evidence-strength aggregate that literally renders as "N verified / M source-bound" text.

## 15. Provenance/citation audit

No new provenance mechanism found beyond what T19/T21/T22 close. `evidence_status` is not a citation/pointer mechanism — it is an aggregate derived value, correctly classified under the tap-type/composite-consistency findings above rather than provenance.

## 16. Evidence-claim audit — materiality

`evidence_status.verified_fact_count`/`source_bound_fact_count` **are** literal, syntactically-valid evidence-strength claims: `generate-tap-type-guide.js:59` renders `"${count} verified / ${count} source-bound"` per tap type, plus page-wide summary totals (`generate-tap-type-guide.js:138-139`); `generate-tapping-evidence.js:45-46` sums them into the Evidence page's `tapTypeVerified`/`tapTypeSourceBound` scoreboard. A source edit to `entity.application_notes[].status` on any fact, left unregenerated, would leave a stale-but-plausible verification count on display — silently overstating or understating how much of the tap-type knowledge is independently verified. This is exactly the class of claim section 16 flags: syntactically valid, semantically capable of drifting from the source.

## 17. Consumer-fidelity audit

Traced all three consumers of `evidence_status`: `reference/tap-type-guide.html` (per-row text + page summary), `reference/tapping-evidence.html` (aggregate scoreboard), and (transitively, via `validate-tapping-terminology.js`'s own internal "expected" recomputation, not a rendered page) the terminology cross-check. **All three treat the projection's `evidence_status` values as ground truth and only verify the HTML matches the projection** — none verifies the projection matches `entities.seed.json`. This is the systemic version of the pattern named in section 4: three independent downstream validators inherit the same blind spot because none of them re-derives from the true source.

## 18–19. Numeric-claim and aggregation audits

This is the aggregation-audit finding: a count (not a raw engineering number) capable of becoming materially misleading while every existing validator — including three separate consumer-fidelity validators — remains green. No other count was found in the same uncovered state; `29 profiles`, `7 tap types`, `9/20 tap-drill split`, `data_quality` counts are all either directly source-verified now (T13–T22) or dynamically re-derived at each consumer's own validation time from already-certified fields.

## 20. Generated-artifact staleness

**RECONFIRMED OUT OF SCOPE** — unchanged.

## 21. Previously deferred findings — recheck

| Finding | Classification |
|---|---|
| Hardcoded tap-type classification arrays | RECONFIRMED OUT OF SCOPE |
| Generated-artifact staleness (general) | RECONFIRMED OUT OF SCOPE |
| `alternative_drill.standard_edition` hardcode | RECONFIRMED DEFERRED |
| `application_notes[].source_tier` | RECONFIRMED DEFERRED |
| Protected CSV wording (T11 exception) | RECONFIRMED OUT OF SCOPE |
| Tap Drill Calculator independent architecture | RECONFIRMED OUT OF SCOPE |
| Cross-product discovery-link deferrals | RECONFIRMED OUT OF SCOPE |
| Inert projection aggregates (`data_quality_summary`, `related_entities`/`related_standards`/`related_datasets`, `source_dataset_versions`) | RECONFIRMED DEFERRED — `source_dataset_versions` newly confirmed unread by any consumer or validator this phase |
| UNF `source_entity_id` reuse | RECONFIRMED DEFERRED |
| `data_quality.provenance_complete` | RECONFIRMED DEFERRED — no surviving mutation found |
| `data_quality.last_reviewed` | RECONFIRMED DEFERRED — real, uncovered, lower priority than this phase's selected target |
| `tap-types.json rows[].title/.definition/.taxonomy_axis` fidelity | **NEW THIS PHASE — considered, not selected.** Real, uncovered, 0/21 mismatches, rendered prominently, but a structural-identity gap rather than an evidence-strength/trust-claim gap; ranked below the selected target. |
| **`evidence_status.{verified_fact_count, source_bound_fact_count}` fidelity** | **REOPENED — NEW EVIDENCE.** Not named in any prior T13–T22 audit. Confirmed zero current mismatches (14 comparisons); confirmed check 9 (T6/T15) never reads `evidence_status`; confirmed three separate downstream validators (`validate-tap-type-guide.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) all treat it as ground truth without checking it against source. Selected as the T23 target. |

## 22. Negative-case matrix

| Candidate | Authoritative source | Current validator | User-visible | Material | Mutation-testable | Bounded | Eligible |
|---|---|---|---|---|---|---|---|
| **`evidence_status.{verified_fact_count,source_bound_fact_count}` vs recount of `entity.application_notes` by status** | `entities.seed.json` `application_notes[].status` | **NO** — checked nowhere in `validate-tapping-projections.js`; three other validators treat it as ground truth | **YES** — literal "N verified / M source-bound" text on Guide, plus Evidence-page scoreboard | **YES** — a core evidence-strength/trust claim | **YES** | **YES** | **YES — SELECTED** |
| `tap-types.json rows[].title/.definition/.taxonomy_axis` vs `entity.title/.definition/.taxonomy_axis` | `entities.seed.json` | NO | YES | Real, but structural-identity rather than trust-claim | YES | YES | NO — real, but lower priority, not selected |
| `data_quality.last_reviewed` vs dataset `last_reviewed` | tapping dataset (dataset-level) | NO | YES | Low — shared metadata | YES | YES | NO — carried over from T22, still lower priority |
| `source_dataset_versions.*` | dataset `.version` fields | NO | NO — unread by any consumer/validator | — | — | — | NO — inert |

## 23. Risk ranking

1. **`evidence_status.{verified_fact_count, source_bound_fact_count}` source-fidelity** — the only candidate this phase found that is (a) a literal evidence-strength claim rendered as visible text, (b) fed into an aggregate scoreboard, and (c) silently inherited as "ground truth" by three separate downstream consumer-fidelity validators, none of which checks it against the true source.
2. `title`/`.definition`/`.taxonomy_axis` fidelity — real, uncovered, structural rather than trust-claim, not selected.
3. `data_quality.last_reviewed` — carried over from T22, still lower priority.
4. All other surveyed areas — already closed by T13–T22 or structurally non-defective.

## 24. T23 target gate — selected target

**Target name:** Tap-Type Evidence-Status Aggregate Fidelity

**Root cause:** `buildTapTypeProjection()` computes `evidence_status.verified_fact_count`/`.source_bound_fact_count` as a status-keyed filter over `entity.application_notes`, entirely separate from the classification-keyed filter (`byClass()`) that produces the four arrays check 9 verifies. No check anywhere re-derives this aggregate from source and compares it. Three downstream validators (`validate-tap-type-guide.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) each treat the projection's `evidence_status` as authoritative and only check that rendered HTML/summary text matches it — none checks it against `entities.seed.json`.

**Authoritative source:** `data/entities/entities.seed.json` — each `tap_type` entity's `application_notes[].status`.

**Affected projection field:** `tap-types.json rows[].evidence_status.{verified_fact_count, source_bound_fact_count}` (all 7 tap types).

**Affected consumers:** `reference/tap-type-guide.html` (per-row "N verified / M source-bound" text and page-wide summary totals), `reference/tapping-evidence.html` (aggregate `tapTypeVerified`/`tapTypeSourceBound` scoreboard).

**Existing coverage:** None in `validate-tapping-projections.js`. Three other validators verify HTML-matches-projection only, not projection-matches-source.

**Exact missing invariant:** For every tap-type row, `evidence_status.verified_fact_count` must equal `entity.application_notes.filter(n => n.status === "verified").length`, and likewise `.source_bound_fact_count` for `"source_bound"`, where `entity` is the authoritative `entities.seed.json` record for that `entity_id`.

**Why T13–T22 do not already cover it:** Check 9 (T6/T15) verifies fact-level source/status/classification fidelity inside the four classification arrays and their combined total — never `evidence_status`. T13/T14/T19–T22 all address `tapping-profiles.json`'s `tap_drill`/`data_quality` fields, a different projection file entirely. No prior phase named `tap-types.json`'s `evidence_status` object.

**Direct-inspection confirmation:** 14 comparisons (7 tap types × 2 fields) re-derived from the real `entities.seed.json` and compared to the real projection. **0 mismatches.**

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, `entities.seed.json` (except as a temporary, restored mutation fixture), every dataset/relationship/standards file, every product/CSV/client-data file, every other validator.

**Validator behavior required:** Add check 19. For each `tap-types.json` row, look up the authoritative `tap_type` entity via `tapTypeEntitiesById` (already built for check 9), recompute `entity.application_notes.filter(n => n.status === "verified").length` and the `"source_bound"` equivalent, compare to `row.evidence_status.verified_fact_count`/`.source_bound_fact_count`. Fail on any mismatch, naming the entity id, the field, the projected value, and the authoritative recount.

**Pass criteria:** 0 errors on real data (confirmed by direct inspection above); correct, specific failure on a reproduced source-status mutation; all other 18 checks and every other validator unaffected.

## Mutation-test contract — CORRECTED after implementation-phase evidence

**Originally proposed (this section, as first written):** temporarily change one `application_notes[].status` on a real `tap_type` entity in `entities.seed.json`, backed up first, without regenerating either projection, and expect the pre-T23 18-check validator to PASS against it (proving the gap).

**This proved wrong when actually run.** During implementation, that exact mutation (`bottoming_tap`'s one `verified` general_taxonomy fact flipped to `source_bound`) was tested against the real, unmodified pre-T23 18-check validator. It did **not** PASS — it correctly **FAILED, 1 error**, caught by the pre-existing check 9 (T6/T15). Check 9 independently compares each fact's `status` *inside the classification arrays* (`general_taxonomy` etc.) against the source `application_notes[].status`; because `evidence_status`'s counts and the classification arrays' per-fact `status` fields are both derived from the same source notes at generation time, a source-side status edit left unregenerated shows up as a classification-array mismatch too, and check 9 already catches that.

**What this means, precisely:** the *source-status* mutation does not isolate check 19 — it is not evidence that check 19 is uniquely necessary, since an existing check already happens to catch that particular mutation class via a different mechanism. It does **not**, however, mean the underlying finding was wrong: no check anywhere reads `evidence_status` and compares it to anything, source or otherwise — confirmed by direct code read of all 18 pre-T23 checks. The finding is that `evidence_status` (a value-level projection field) is never independently verified against a source recount; check 9 only ever protects the *classification arrays*, a structurally different field.

**Revised, isolating mutation-test contract (as implemented):** mutate `data/projections/tapping/tap-types.json` **directly** — change one tap type's `evidence_status` value (e.g. `bottoming_tap.evidence_status.verified_fact_count`) to an incorrect but plausible number, leaving `entities.seed.json` and the classification arrays untouched. This simulates the actual failure mode check 19 exists to guard against: `evidence_status` diverging from a correct source recount, however that divergence arises (a generator bug in that specific computation, or direct corruption of the projection artifact) rather than a source-data edit specifically. Before the fix, with the pre-T23 18-check validator, this must PASS (no existing check reads `evidence_status`, so the mutation is invisible). After restoring check 19, it must FAIL, naming the tap type, the field, the stale projected count, and the authoritative recount. This is a materially different demonstration than the T13–T22 pattern (source-data mutation) precisely because the seam being closed here sits one layer downstream of where every prior T-phase's seam sat — see the implementation record below for the actual run.

## Repository integrity

HEAD before and after this discovery: `33136db03bed0f98982fc74c715ab0a4ab00778f`, matching `origin/main` throughout. Zero tracked files modified — every read this phase was read-only. The one validator run produced a byte-identical report (confirmed via checksum before/after, matching T22's final determinism checksum exactly) — no restoration was needed. All read-only Node scripts run during discovery only called `fs.readFileSync`/`JSON.parse`/`console.log` — wrote nothing to disk.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 19, `"Tap-Type Evidence-Status Counts Match Authoritative Application-Note Statuses"`, added immediately after check 18 (T22). For each of the 7 `tap-types.json` rows it: reuses the existing `tapTypeEntitiesById` map (already built for check 9); independently recounts `entity.application_notes` by `status` (`"verified"` and `"source_bound"`); compares to `row.evidence_status.verified_fact_count`/`.source_bound_fact_count`; fails with the entity id, field, projected value, and authoritative recount on any mismatch.

**Baseline pass.** Ran against the real, untouched projection. **PASS, 0 errors** — consistent with the 14-comparison direct-inspection re-derivation performed during discovery.

**First mutation attempt — source-status edit (superseded).** Temporarily edited the real `data/entities/entities.seed.json` (backed up first), changing `bottoming_tap`'s one `verified` `general_taxonomy` fact to `source_bound`, without regenerating either projection. With check 19 stashed (pre-T23, 18-check validator): **FAIL, 1 error**, caught by the pre-existing check 9 (classification-array per-fact status mismatch) — not the expected PASS. Restored `entities.seed.json` from backup, confirmed byte-identical via SHA-256 (`0de67516d3e539425d7aa18a4bc4ba3499556d6259441a1f9c00b8e92fbc66b2`) and `git diff --stat` (zero diff). This result, and its correction to the mutation-test contract above, was reported to the reviewer before proceeding.

**Revised mutation — direct `evidence_status` edit (approved and executed).** Temporarily edited the real `data/projections/tapping/tap-types.json` (backed up first), changing `bottoming_tap.evidence_status.verified_fact_count` from `1` to `2` (the classification arrays and `entities.seed.json` left untouched). With check 19 stashed (pre-T23, 18-check validator): **PASS, 0 errors** — cleanly demonstrating that no existing check reads `evidence_status` at all. Restored check 19 via `git stash pop`, ran again against the same still-mutated projection: **FAIL, 1 error:**
```
bottoming_tap: evidence_status.verified_fact_count is 2 but an independent recount of application_notes with status "verified" is 1
```
Restored `data/projections/tapping/tap-types.json` from backup, confirmed byte-identical via SHA-256 (`63867da5f7f4a9eb5935b418bfc306ec143bf686f0269bb0689c6325ef480305`) and `git diff --stat` (zero diff from HEAD, both mutated files together).

**Real-data re-check.** Ran the validator on the fully restored, real data: **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged: 5 in `validate-tapping-domain.js`, 1 in `validate-tapping-terminology.js`) — including the three consumer validators (`validate-tap-type-guide.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) that read `evidence_status`.

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`92c7fc5010cce2ac3a5e4efdcb4e3d21579c334e4d333081ffbd035bc4fc59eb`) every run.

**Checksums.** `data/entities/entities.seed.json`, `data/projections/tapping/tap-types.json`, `data/projections/tapping/tapping-profiles.json`, every dataset file, every product HTML/CSV file, and `js/tapping-workflow-data.js` are all confirmed byte-identical before and after this phase (`git diff --stat` against each, zero output). **The generator was never run; the projection was never regenerated.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified (permanently):** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, every other dataset/relationship/standards file, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator. `entities.seed.json` and `tap-types.json` were each temporarily mutated once as explicitly-authorized test fixtures and restored byte-for-byte in both cases. The title/definition/taxonomy_axis finding was not addressed; no deferred finding was reopened.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T24 was not started.

**T23 STATUS: READY FOR REVIEW.** See `audit/t23-change-scope.md` for the file accounting.
