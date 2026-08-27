# T22 — Tapping Domain Residual Integrity Audit (Post-T21 Discovery)

Date: 2026-08-26
Type: **STRICT READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t22-residual-integrity.json](t22-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except the same 11 pre-existing untracked files (`.DS_Store`, `.claude/`, D2-phase audit files, `images/logo.ai`, etc.) — none touched.
- HEAD: `0cee9439a893ec7f4f3aee8fd9d065413647e33b`
- `origin/main`: matches HEAD.
- `git log -15`: T21's commit (`T21: Verify tap-drill provenance citation against authoritative source`) present at HEAD; T20, T19... down through T7 all present in order.

**Gate PASSES.** Proceeding with discovery.

## 2. Certify the closed seams

Read `scripts/validators/validate-tapping-projections.js` in full (620 lines, 17 checks) and ran it against real, untouched data.

| Phase | Check name | Present | Result |
|---|---|---|---|
| T13 | Check 10 | Yes | pass |
| T14 | Check 11 | Yes | pass |
| T15 | Check 9's source-fidelity clause | Yes | pass |
| T16 | Check 12 | Yes | pass |
| T17 | Check 13 | Yes | pass |
| T18 | Check 14 | Yes | pass |
| T19 | Check 15 | Yes | pass |
| T20 | Check 16 | Yes | pass |
| T21 | Check 17 | Yes | pass |

`node scripts/validators/validate-tapping-projections.js` → **PASS, 0 errors, 0 warnings**, 17 checks total. None reopened or modified. `git status --short` after the run shows no diff.

## 3–4. Projection inventory / source-to-projection audit — the finding

Re-walked every literal assignment in `generate-tapping-projections.js`, cross-referencing against all 17 checks field-by-field. After nine rounds of closures, the remaining surface is genuinely narrow, but two adjacent gaps in `buildTapDrillBlock()`/`buildAlternativeDrillBlock()` were found still open:

**`tap_drill.value` / `tap_drill.unit`** — plain copies of `hole_preparation.value`/`.unit`. T19 (check 15) compares `tap_drill.value` to a value *dereferenced through the projected citation* against the **thread dataset**; it never reads `sourceRecordById.get(...).hole_preparation.value` at all. T21 (check 17) compares only the **citation fields** (`source_dataset`/`source_record`/`source_field`), never `.value`/`.unit`. **No check anywhere compares `tap_drill.value`/`.unit` directly to the tapping dataset's own `hole_preparation.value`/`.unit`.**

**`alternative_drill.value`, `.unit`, `.standard_id` (from `alt.source`), `.status`, `.meaning`, `.provenance.table`, `.provenance.verified_date`** — all plain copies of `profile.iso_2306_alternative_drill.*`. Existing checks only confirm `standard_id` resolves to *some* real standard (check 2), `status` is a valid enum member (check 4), and the block is structurally non-identical to `tap_drill` (check 5). **No check compares any of these seven fields to the source `iso_2306_alternative_drill` object.**

Both are the exact same defect class: a field copied verbatim from a sibling sub-object on the *same* source record, with zero comparison back to that sibling — the class T13/T14 closed for `tap_drill`'s *derived* fields, T19 closed for `tap_drill.value`'s *cross-dataset dereference*, and T21 closed for the *citation pointer itself*, but never for these two blocks' own **plain values**.

Full A–F classification table in the JSON. No other field crosses into F this phase.

## 5. Identity/join audit

No new join found. `buildAlternativeDrillBlock(profile)` takes `profile.iso_2306_alternative_drill` directly off the already-resolved `profile` object passed into `buildProfileRows()` — there is no additional lookup or key resolution involved (unlike `buildThreadBlock`'s designation-based lookup or `buildTapDrillBlock`'s citation-chain dereference). The finding here is pure copy-fidelity, not a join defect.

## 6. Transformation audit — precisely where this sits

`buildTapDrillBlock()` and `buildAlternativeDrillBlock()` each mix three transformation modes in one function: (a) derived fields (status/convention/provenance.source/cross_check — T13/T14-closed), (b) a citation object copied verbatim (T21-closed), and (c) the primary value/unit (and, for `alternative_drill`, five more fields) copied verbatim with **no independent comparison at all**. (c) is the residual gap.

## 7. Composite consistency audit

Re-examined every pairing in the brief's list. `alternative_drill.unit` is asserted `"mm"` for all 15 UNC/UNF records structurally by check 5 (a fixed-value assertion, not a source comparison) — reconfirmed this is a real check but does not substitute for comparing `alt.unit` to the source. No new composite defect found beyond the direct-copy gap itself; `tap_drill.value`/`unit` vs. `thread.thread_system` remains fully guarded transitively via T18 + T19 + the unit/source-field pairing in check 15 (reconfirmed, unchanged since T20/T21).

## 8. Unit/dimensional audit

Metric rows uniformly `mm`, UNC/UNF rows uniformly `in`, ISO-alternative rows uniformly `mm` (structurally enforced) — all reconfirmed via direct read. No dimensional defect; the finding is about value/unit **fidelity to source**, not about any incorrect unit or numeric error in the current, correct data.

## 9–10. Tap-drill semantic / ISO alternative audits — the finding, precisely stated

For `tap_drill.value`/`.unit`, walking the "could a stale-but-plausible projection survive" test: mutate `hole_preparation.value` (or `.unit`) directly in a tapping-dataset file, leave the citation fields (`source_dataset`/`source_record`/`source_field`) and the thread dataset untouched, do not regenerate the projection.
- Check 15 (T19) dereferences the **unchanged** projected citation against the **unchanged** thread dataset → gets the same authoritative value as before → compares to `tap_drill.value` (also unchanged, stale) → **matches → PASS**.
- Check 17 (T21) compares the **unchanged** citation fields on both sides → **matches → PASS**.
- **No check reads `hp.value`/`hp.unit` and compares it to `tap_drill.value`/`.unit`.** The mutation is completely invisible.

For `alternative_drill.*`, the identical pattern applies but is even more exposed — there is no dereference-based check at all protecting these seven fields, only the weaker existence/enum/structural checks named above.

**Direct-inspection confirmation (current data, real files, read-only):**
- `tap_drill.value`/`.unit`: independently re-derived for all 29 rows directly from the three real tapping-dataset source files and compared to the real projection. **0 mismatches across 58 comparisons (29 rows × 2 fields).**
- `alternative_drill.{value,unit,standard_id,status,meaning,provenance.table,provenance.verified_date}`: independently re-derived for all 15 UNC/UNF rows with an alternative-drill block and compared to the real projection. **0 mismatches across 105 comparisons (15 rows × 7 fields).**

Current data is correct in both cases; the gap is exclusively the missing regression guard — identical in shape to every prior T13–T21 finding at its own discovery stage.

## 11–13. Tap-type / standards / data-quality audits

- **Tap-type:** reconfirmed no new defect; entity-id keying remains collision-free, `source_tier` remains deferred with no new evidence.
- **Standards:** reconfirmed `standards[].relevance` is a fixed constant string (not a source value, class D), not a candidate. No new standards defect.
- **Data-quality:** re-examined `data_quality.last_reviewed` — a direct copy of `tappingDataset.last_reviewed` (dataset-level, not per-record), rendered in the Atlas provenance dropdown ("Last reviewed: 2026-08-15") when present. Confirmed genuinely uncovered (no check compares it to source) and confirmed 0 mismatches on real data (29/29). **Considered as a secondary candidate but not selected** — it is dataset-level metadata (one date shared by up to 14 records within a dataset), not a per-record engineering claim, and is a materially smaller, less consequential gap than the tap-drill/alternative-drill value fidelity finding.

## 14. Provenance/citation audit

No remaining unguarded citation mechanism found. `tap_drill.provenance.{source,cross_check}` (T14), `.{source_dataset,source_record,source_field}` (T21), and the value's cross-dataset resolution (T19) are all closed. `alternative_drill.provenance.{table,verified_date}` are **not** citation *pointers* (they don't resolve anything) — they are themselves plain copied *data fields* (the ISO table name and a verification date), correctly grouped with this phase's direct-copy-fidelity finding rather than treated as a fourth provenance-chain mechanism.

## 15. Evidence-claim audit

The Atlas/Workflow/Evidence "ISO 2306 alternative: 5.1 mm · Verified" line is a real, syntactically-valid-looking evidence claim that could silently misstate the actual alternative-drill recommendation or its verification status if `alt.value`/`.status` were edited in the source without regeneration — materially trust-relevant, not a formatting concern.

## 16. Consumer fidelity audit

- `reference/tapping-atlas.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html` all render `alternative_drill.value`/`.unit`/`.status` verbatim (grepped with line numbers, see JSON). `downloads/tapping-atlas.csv` includes `iso_2306_alternative_drill`/`iso_2306_alternative_unit`/`iso_2306_alternative_status` columns (unchanged since T18's audit).
- `alternative_drill.standard_id`, `.meaning`, `.provenance.table`, `.provenance.verified_date` are **not** rendered by any consumer (grepped all four generators — zero matches beyond the generator's own assignment) — present in the projection and `js/tapping-workflow-data.js` only. Included in the selected check's scope for completeness (matching T18's precedent with `thread.standard_family`), not as the primary materiality basis.
- `tap_drill.value`/`.unit` are rendered everywhere tap_drill is rendered — Atlas, Workflow, Evidence, CSV, client-data JS (already established across T13–T21's audits).

## 17–18. Numeric/engineering-claim and aggregation audits

No new numeric gap beyond the direct-copy finding itself. No aggregate count depends on `tap_drill.value`/`.unit` or any `alternative_drill.*` field.

## 19. Generated-artifact staleness

**RECONFIRMED OUT OF SCOPE** — unchanged from every prior phase.

## 20. Previously deferred findings — recheck

| Finding | Classification |
|---|---|
| Hardcoded tap-type classification arrays | RECONFIRMED OUT OF SCOPE |
| Generated-artifact staleness (general) | RECONFIRMED OUT OF SCOPE |
| `alternative_drill.standard_edition` hardcode | RECONFIRMED DEFERRED |
| `application_notes[].source_tier` | RECONFIRMED DEFERRED |
| Protected CSV wording (T11 exception) | RECONFIRMED OUT OF SCOPE |
| Tap Drill Calculator independent architecture | RECONFIRMED OUT OF SCOPE |
| Cross-product discovery-link deferrals | RECONFIRMED OUT OF SCOPE |
| Inert projection aggregates | RECONFIRMED DEFERRED |
| UNF `source_entity_id` reuse | RECONFIRMED DEFERRED |
| `data_quality.provenance_complete` | RECONFIRMED DEFERRED |
| `data_quality.last_reviewed` fidelity | **NEW THIS PHASE — considered, not selected.** Real, uncovered, 0 current mismatches, but dataset-level metadata with materially lower engineering significance than the selected target. |
| **`tap_drill.{value,unit}` and `alternative_drill.{value,unit,standard_id,status,meaning,provenance.table,provenance.verified_date}` direct source-fidelity** | **REOPENED — NEW EVIDENCE.** Not named in any prior T13–T21 audit. Confirmed zero current mismatches (58 + 105 = 163 comparisons); confirmed neither T19 nor T21 (nor any other check) reads the source `hole_preparation.value`/`.unit` or `iso_2306_alternative_drill.*` fields at all. Selected as the T22 target. |

No other finding was reopened without new evidence.

## 21. Negative-case matrix

| Candidate | Authoritative source | Current validator | User-visible | Material | Mutation-testable | Bounded | Eligible |
|---|---|---|---|---|---|---|---|
| **`tap_drill.value`/`.unit` vs `hp.value`/`.unit`** | tapping dataset `hole_preparation.*` | **NO** | **YES** — the primary drill recommendation, rendered everywhere | **YES** — highest-traffic engineering value in the domain | **YES** | **YES** | **YES — SELECTED (part 1)** |
| **`alternative_drill.*` vs `iso_2306_alternative_drill.*`** | tapping dataset `iso_2306_alternative_drill.*` | **NO** | **YES** for value/unit/status; NO for the other 4 (inert) | **YES** | **YES** | **YES** | **YES — SELECTED (part 2, same check)** |
| `data_quality.last_reviewed` vs dataset `last_reviewed` | tapping dataset (dataset-level) | NO | YES (Atlas provenance dropdown) | Low — shared metadata, not per-record engineering value | YES | YES | NO — real but lower-priority, not selected |
| Standards `.relevance` fixed string | none (hardcoded) | N/A | Low | Low | N/A | — | NO — class D, not a source value |

## 22. Risk ranking

1. **Tap-drill and ISO-alternative direct value fidelity** — the only remaining candidate touching the domain's primary engineering recommendation (`tap_drill.value`), with zero coverage, demonstrated invisibility to both adjacent already-closed checks (T19, T21), full consumer breadth, and a bounded single-check fix.
2. `data_quality.last_reviewed` fidelity — real, uncovered, but a shared metadata date rather than a per-record engineering claim; not selected.
3. All other surveyed areas — already closed by T13–T21 or structurally non-defective.

## 23. T22 target gate — selected target

**Target name:** Tap-Drill and ISO-Alternative Direct Value Fidelity

**Root cause:** `buildTapDrillBlock()` copies `hp.value`/`hp.unit` verbatim; `buildAlternativeDrillBlock()` copies `alt.value`/`alt.unit`/`alt.source`(→`standard_id`)/`alt.status`/`alt.meaning`/`alt.table`(→`provenance.table`)/`alt.verified_date`(→`provenance.verified_date`) verbatim. None of these nine fields is ever compared to its source. T19 proves `tap_drill.value` resolves correctly *through the citation, against the thread dataset* — a different comparison, against a different dataset, using the projected (not source) citation. T21 proves the citation itself matches the source's citation fields — again, not the value fields. Neither check, nor any other, reads `sourceRecordById.get(...).hole_preparation.value`/`.unit` or `.iso_2306_alternative_drill.*` at all.

**Authoritative source:** `data/datasets/metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json` — each record's `hole_preparation.{value,unit}` and (UNC/UNF only) `iso_2306_alternative_drill.{value,unit,source,status,meaning,table,verified_date}`.

**Affected projection fields:** `tapping-profiles.json rows[].tap_drill.{value,unit}` (all 29 rows) and `rows[].alternative_drill.{value,unit,standard_id,status,meaning,provenance.table,provenance.verified_date}` (15 UNC/UNF rows).

**Affected consumers:** `reference/tapping-atlas.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html` (value/unit/status rendered on all three), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`. `standard_id`/`meaning`/`provenance.{table,verified_date}` are present in the projection and client-data JS but not separately rendered by any product — included for completeness, matching T18's precedent.

**Existing coverage:** None for any of the nine fields, beyond `alternative_drill.standard_id`'s generic existence check and `.status`'s enum check (neither a source comparison).

**Exact missing invariant:** For every profile row, `row.tap_drill.value` must equal `sourceRecord.hole_preparation.value` (likewise `.unit`). For every row with a source `iso_2306_alternative_drill` object, `row.alternative_drill.value/.unit/.standard_id/.status/.meaning/.provenance.table/.provenance.verified_date` must equal `sourceRecord.iso_2306_alternative_drill.value/.unit/.source/.status/.meaning/.table/.verified_date` respectively.

**Why T13–T21 do not already cover it:** T13/T14 derive the *other* tap_drill fields from `hp.cross_verified`. T19 compares `tap_drill.value` to a *dereferenced thread-dataset value*, not to `hp.value` itself. T21 compares only the *citation pointer fields*, not `hp.value`/`.unit`. No prior phase named or touched `alternative_drill`'s direct-copy fields at all.

**Direct-inspection confirmation:** 58 + 105 = 163 comparisons re-derived from the real source datasets and compared to the real projection. **0 mismatches.**

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, every dataset/entity/relationship/standards file (except as a temporary, restored mutation fixture), every product/CSV/client-data file, every other validator.

**Validator behavior required:** Add check 18. For each profile row, look up the source tapping-dataset record via `sourceRecordById` (reused from checks 10/11/13/16/17), compare `sourceRecord.hole_preparation.value`/`.unit` to `row.tap_drill.value`/`.unit`. If `sourceRecord.iso_2306_alternative_drill` exists, compare its seven fields (`value`, `unit`, `source`, `status`, `meaning`, `table`, `verified_date`) to `row.alternative_drill.value`/`.unit`/`.standard_id`/`.status`/`.meaning`/`.provenance.table`/`.provenance.verified_date` respectively. Fail on any mismatch, naming the profile, the field, the projected value, and the authoritative value.

**Pass criteria:** 0 errors on real data (confirmed by direct inspection above); correct, specific failure on a reproduced source mutation for both the tap_drill and alternative_drill halves; all other 17 checks and every other validator unaffected.

## Mutation-test contract (not implemented)

Temporarily change `hole_preparation.value` on one real tapping-dataset record (e.g. `tap_m3x0_5_cut` in `metric_tapping.seed.json`), backed up first, **without touching the citation fields, the thread dataset, or the projection**. Demonstrate — with the pre-T22, 17-check validator (temporarily set aside via `git stash`) — that all 17 existing checks still report PASS against the mutated data. Restore check 18, re-run: expect **FAIL**, naming that profile, `tap_drill.value`, the stale projected value, and the new authoritative value. Separately, repeat the same pattern on one UNC/UNF record's `iso_2306_alternative_drill.value` to prove the second half of the check. Restore both files from backup, confirm byte-identical via checksum, confirm the validator returns to PASS. Determinism: validator run 3× on restored real data, byte-identical report checksum.

## Repository integrity

HEAD before and after this discovery: `0cee9439a893ec7f4f3aee8fd9d065413647e33b`, matching `origin/main` throughout. Zero tracked files modified — every read this phase was read-only. The one validator run regenerated `docs/architecture/tapping-projection-validation-report.{json,md}` with byte-identical content (fixed `generated_at` constant, unchanged data) — confirmed via `git status --short` showing no diff. All read-only Node scripts run during discovery only called `fs.readFileSync`/`JSON.parse`/`console.log` — wrote nothing to disk.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 18, `"Tap-Drill and ISO-Alternative Direct Value Fields Match Authoritative Tapping-Dataset Record"`, added immediately after check 17 (T21). For each of the 29 profiles it: reuses the existing `sourceRecordById` map (already built for checks 10/11/13/16/17); compares `sourceRecord.hole_preparation.value`/`.unit` against `row.tap_drill.value`/`.unit`; when `sourceRecord.iso_2306_alternative_drill` exists, compares its `value`/`unit`/`source`/`status`/`meaning`/`table`/`verified_date` against `row.alternative_drill.value`/`.unit`/`.standard_id`/`.status`/`.meaning`/`.provenance.table`/`.provenance.verified_date` respectively (plus presence/absence symmetry checks); fails with the profile id, field name, projected value, and authoritative value on any mismatch.

**Baseline pass.** Ran against the real, untouched projection and tapping datasets. **PASS, 0 errors** — consistent with the 163-comparison direct-inspection re-derivation performed during discovery.

**Mutation 1 — primary tap-drill value.** Temporarily edited the real `data/datasets/metric_tapping.seed.json` (backed up first), changing `tap_m3x0_5_cut.hole_preparation.value` from `2.5` to `2.6` (citation fields and thread dataset untouched), **without regenerating either projection**. Set check 18 aside via `git stash push -- scripts/validators/validate-tapping-projections.js`, restoring the exact pre-T22, 17-check validator. Ran it: **PASS, 0 errors** — confirming, with the real file and the real pre-T22 validator, that all 17 existing checks are blind to this mutation. Restored check 18 via `git stash pop`, ran again against the same still-mutated data: **FAIL, 1 error:**
```
tap_m3x0_5_cut: tap_drill.value is '2.5' but the authoritative tapping-dataset record's hole_preparation.value is '2.6'
```
Restored `metric_tapping.seed.json` from backup, confirmed byte-identical via SHA-256 (`d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`) and `git diff --stat` (zero diff from HEAD).

**Mutation 2 — ISO-alternative value.** Temporarily edited the real `data/datasets/unc_tapping.seed.json` (backed up first), changing `tap_1_4_20_unc_cut.iso_2306_alternative_drill.value` from `5.1` to `5.2`, **without regenerating either projection**. Repeated the identical stash/run/restore sequence: with check 18 stashed (pre-T22, 17-check validator), **PASS, 0 errors** against the mutated data — confirming the second half of the gap. With check 18 restored, ran again: **FAIL, 1 error:**
```
tap_1_4_20_unc_cut: alternative_drill.value is '5.1' but the authoritative tapping-dataset record's iso_2306_alternative_drill.value is '5.2'
```
Restored `unc_tapping.seed.json` from backup, confirmed byte-identical via SHA-256 (`c67ebdbbbf02466de915df73cb8eb75b881f0e58c587a189cfbddcca53e0bb7e`) and `git diff --stat` (zero diff from HEAD, both mutated files together).

**Real-data re-check.** Ran the validator on the fully restored, real data: **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged: 5 in `validate-tapping-domain.js`, 1 in `validate-tapping-terminology.js`).

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`6716899a66914958fe1971dd17c3c03f32c5e575a38f226deffa081cf514f0ec`) every run.

**Checksums.** `data/datasets/metric_tapping.seed.json`, `unc_tapping.seed.json`, `metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, both T3 projections, all product HTML/CSV files, and `js/tapping-workflow-data.js` are all confirmed byte-identical before and after this phase (`git diff --stat` against each, zero output). **The generator was never run.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every other `data/datasets/`/`data/standards/` file. The generator was deliberately left untouched — current data is already correct; T22 closes only the missing regression guard. `data_quality.last_reviewed` was not selected, per the governance instruction; no deferred finding was reopened.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T23 was not started.

**T22 STATUS: READY FOR REVIEW.** See `audit/t22-change-scope.md` for the file accounting.
