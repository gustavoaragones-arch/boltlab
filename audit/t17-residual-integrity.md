# T17 — Tapping Domain Residual Integrity Audit (Post-T16 Discovery)

Date: 2026-08-20
Type: **READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t17-residual-integrity.json](t17-residual-integrity.json)

## Repository gate

- `git status --short`: clean except the same 10 pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`logo.ai` files.
- HEAD: `45653e90b277cccdbf3979ea0e73770fbca59dd7`
- `origin/main`: matches HEAD.
- `git log -5`: T16's commit (`T16: Verify denormalized standard fields in tapping projections`) is present at HEAD.
- **T16's check confirmed present and operational** in `scripts/validators/validate-tapping-projections.js` (`"Standards Denormalized Fields Match Authoritative Standard Record"`, unmodified this session).

**Gate PASSES.** Proceeding with discovery.

## Post-T16 certification matrix

| Family | Status | Note |
|---|---|---|
| Thread identity | CERTIFIED | Unchanged |
| Thread `standard_family` | CERTIFIED (low risk) | Direct copy, never an independent claim |
| Thread `source_entity_id` / `source_dataset` | PARTIAL — known oddity, not selected | UNF records reuse the UNC entity id; never rendered — see below |
| Tap-drill value/status/convention/provenance | CERTIFIED | T13/T14, unchanged |
| Alternative drill (value/unit/status) | CERTIFIED | Unchanged |
| Alternative drill `standard_edition` | DEFERRED, reconfirmed | Hardcoded literal, previously named in T16 discovery |
| Engagement | CERTIFIED | Fresh sweep clean |
| **Tap types (relationship resolution)** | **UNRESOLVED** | **Selected T17 target** |
| Overall record status | CERTIFIED | Direct pass-through |
| Standards | CERTIFIED | T16 |
| Tap-type application-note facts | CERTIFIED | T6/T15 |
| `application_notes[].source_tier` | DEFERRED, reconfirmed | Inert |
| Evidence status counts | CERTIFIED | Dynamically re-derived everywhere |
| `data_quality.*` | CERTIFIED (low risk) | Direct copies / redundantly guarded |
| `data_quality_summary` / `related_entities` metadata | DEFERRED, reconfirmed | Inert, unread by any consumer |
| CSV representation | PARTIAL / documented | T11's frozen exception, not reopened |
| Client-data / HTML representation | CERTIFIED | Inherits whatever the projection carries |

## Complete source→projection field inventory

Every field in `tapping-profiles.json` and `tap-types.json` was classified using the brief's 8-category taxonomy (direct copy / derived / denormalized / transformed / conditional / aggregated / fixed constant / hardcoded literal). Full table in the JSON's `source_to_projection_inventory.fields`. Two items are worth calling out beyond what T13–T16 already closed:

- **`thread.source_entity_id`** is a hardcoded literal (`"thread_system_unc"`) applied identically to both the UNC *and* UNF branches in `main()`. The knowledge layer contains only one `thread_system`-type entity (`thread_system_unc`, titled "UNC Thread System") — there is no `thread_system_unf` entity to reference instead. Confirmed via exhaustive grep: this field is **never rendered by any consumer** — not in any product generator, not as a link, not as text. It flows into `js/tapping-workflow-data.js` and the projection's own `related_entities` metadata array, both of which are themselves unread by every tapping product generator. A genuine data-modeling oddity, but it fails the phase brief's explicit "materially user-facing" bar for selection.
- **`tap_types[]`** — the array driving the "relevant tap types" section on every single product — is derived by resolving the relationship graph, and this is the selected finding. See below.

## Projection→consumer inventory

Re-enumerated all 7 known consumers; no new one found. `tap_types[]` is the single most consistently and prominently rendered relationship-derived field across every one of them: Atlas's "Tap types:" line on all 29 cards, Workflow's result section and T9 comparison row, Evidence's tap-type cross-reference, and the CSV's `tap_types` column. Every consumer faithfully displays whatever the projection says — parity between consumers is certified. The risk is entirely upstream, at the relationship-resolution step itself, and would appear identically (and just as silently) everywhere at once if it were ever wrong.

## Silent-drop audit

No newly-discovered field is silently dropped between layers. Reconfirmed the previously-named inert fields (`source_entity_id`, `related_entities`/`related_standards`/`related_datasets`, `data_quality_summary`, `source_tier`) remain inert, with no new evidence changing their non-material status.

## Derivation audit — the finding

`buildProfileRows()` in `generate-tapping-projections.js`:

```js
const operationContext = resolveEntityContext(root, profile.operation);
const tapTypes = operationContext.relatedEntityIds
  .filter((id) => tapTypeEntityIds.has(id))
  .sort();
```

All 29 tapping profiles use `operation: "cut_tapping"`. The `cut_tapping` entity's **own `related_entities` array is empty** — the entire relationship comes from five separate `RELATES_TO` records in `data/relationships/relationships.seed.json`:

```
cut_tapping -- RELATES_TO --> taper_tap
cut_tapping -- RELATES_TO --> plug_tap
cut_tapping -- RELATES_TO --> bottoming_tap
cut_tapping -- RELATES_TO --> spiral_point_tap
cut_tapping -- RELATES_TO --> spiral_flute_tap
```

All 29 profiles therefore correctly resolve to this identical 5-element set (`hand_tap` and `forming_tap` are correctly excluded — they're not connected to `cut_tapping`). **Confirmed correct by direct inspection.**

`validate-tapping-projections.js` check 2 only confirms `entityIds.has(tapTypeId)` for each element already sitting in `row.tap_types` — pure existence. **No check independently re-derives the expected set from `relationships.seed.json` and compares it to the projection's actual array.** This is exactly the pattern the phase brief named: *"relationship resolution that proves existence but not correct relationship membership."*

**Concretely:** if a future edit to `relationships.seed.json` ever added or removed a `RELATES_TO` edge touching `cut_tapping` (or any operation entity) without the projection being regenerated to match, every product would silently show the wrong "relevant tap types" for all affected profiles — and every existing validator, including the one that already inspects this exact array, would keep passing.

## Relationship-resolution audit

This *is* the primary finding — see above. No other relationship-derived field in the tapping domain was found with a comparable gap; `alternative_drill.standard_id` and `standards[].standard_id` are both reference-checked (T16 also covers the standards' *content*, not just existence), and the tap-type application-note classification arrays are content-verified fact-by-fact (T6/T15).

## Aggregation/count audit

All rendered counts (9/20 tap-drill, 0/29 record, 1/15 tap-type facts) are dynamically re-derived from the projection at validation time in every consumer's own validator — reconfirmed, unchanged, no new finding. `profileProjection.data_quality_summary` is itself an aggregate but is never consumed by anything (Section on candidates), so a defect in its own internal correctness could never mislead a real user.

## Hardcoded/fixed-value audit

Full sweep of `generate-tapping-projections.js`'s string/object literals found nothing new beyond the already-deferred `standard_edition = "1972"` and the newly-named-but-non-material `source_entity_id` reuse. The alternative-drill block's explanatory prose (`convention`/`applicability`/`meaning`) is static text describing the ISO 2306 alternative-drill *concept* in general, not a per-record varying factual claim — low risk, not selected.

## Negative-case coverage matrix

| Mutation | Existing validator would catch it? | Which |
|---|---|---|
| `hp.cross_verified.match` flipped | Yes | T13/T14 |
| `application_notes[]` source/status/fact changed | Yes | T6/T15 |
| `standards[]` field hand-edited to diverge from source | Yes | T16 |
| **A `RELATES_TO` edge between `cut_tapping` and a tap type added/removed, projection left stale** | **No** | **SELECTED TARGET** |
| `thread.source_entity_id` changed to an arbitrary valid id | Partially (existence only) — but never rendered, so no user-facing consequence | — |
| `alternative_drill.standard_edition` changed | No | low risk, deferred |
| `engagement.axial.calculation_status` flipped | Yes | check 6 |

## Deferred-finding recheck

Hardcoded classification lists, repo-wide artifact staleness, `standard_edition` hardcode, `source_tier`, protected CSV wording, Tap Drill Calculator's independent architecture, and cross-product discovery-link deferrals — all **RECONFIRMED**, no new evidence presented for any of them.

## Candidate findings

1. **Tap-type relationship-membership verification** — selected.
2. `thread.source_entity_id` UNC/UNF reuse — real, but never rendered; fails the "materially user-facing" bar; noted, not selected.

## Risk ranking

Tap-type relationship-membership ranks first and is the only candidate that clears the phase brief's bar: current live rendering on every product for every one of 29 records, total silent-failure potential (existence check would still pass for any wrong-but-valid tap type id), proven mutation-testability identical to T13–T16's technique, and a bounded single-file fix reusing knowledge already loaded by the validator (`knowledge.relationships`, `knowledge.entities`).

## Selected T17 target

**Title:** Tap-Type Relationship-Membership Verification

**Objective:** Add a check that independently re-derives the expected `tap_types[]` set for every profile directly from `relationships.seed.json`'s `RELATES_TO` edges for that profile's operation, and compares it to the projection's actual array.

**Root risk:** `buildProfileRows()` resolves `tap_types[]` by walking the relationship graph; the existing check only confirms each resulting id is a real entity, never that the set matches what the graph currently establishes. A future relationship-graph edit combined with a stale projection would silently show the wrong "relevant tap types" everywhere, undetected.

**Not already covered by T13/T14/T15/T16:** those four phases closed `tap_drill.status`, `tap_drill.convention`/`provenance.{source,cross_check}`, `application_notes[].source`, and `standards[]` denormalization respectively — four distinct, already-named field families. Relationship-derived membership is untouched by any of them.

## Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** the generator, both projections, `relationships.seed.json` (except as a temporary, restored mutation fixture), `entities.seed.json`, every product/CSV/client-data file, every other validator, every other knowledge-layer file.

**Validator behavior required:** For each profile row, determine its operation id (requires a `tapping_profile_id`-keyed lookup back to the source dataset record, following the same pattern as checks 10/11, since `profile.operation` is not itself carried into the projection row). Collect every `RELATES_TO` record where `source` equals that operation id and `target` is a `tap_type` entity; sort; compare to the row's sorted `tap_types`. Fail on any set difference.

**Pass criteria:** 0 errors on real data (already confirmed correct by direct inspection); correct failure on a reproduced relationship-graph mutation; all other validators and every other checksum unaffected.

## Mutation-test contract (not implemented)

Temporarily remove one `RELATES_TO` record (e.g. `rel_cut_tapping_relates_taper_tap`) from `data/relationships/relationships.seed.json`, backed up first, **without regenerating the projection**. Expect **FAIL**, identifying the affected profiles (all 29, since all share `operation: "cut_tapping"`) and the specific missing tap type. Restore from backup, confirm byte-identical checksum, confirm the validator returns to **PASS**. Determinism: validator run 3× on restored real data, byte-identical report.

## Exact allowed/forbidden file scope

See "Implementation contract" above.

## Repository integrity

HEAD before and after this discovery: `45653e90b277cccdbf3979ea0e73770fbca59dd7`, matching `origin/main` throughout. Zero tracked files modified. The same 10 pre-existing untracked files remain untouched. All production, data, projection, generator, and validator files confirmed byte-identical — this phase read files only.

## Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 13, `"Tap-Type Relationship Membership Matches Authoritative RELATES_TO Graph"`, added immediately after check 12 (T16). For each of the 29 profiles it: resolves the profile's authoritative `operation` from its source dataset record (via `sourceRecordById`, the same lookup pattern checks 10–11 already use); collects every `RELATES_TO` relationship whose `source` is that operation and whose `target` is a `tap_type` entity (via `tapTypeEntitiesById`); sorts the expected id set; sorts the projection's actual `tap_types[]`; computes the full symmetric difference (missing vs. unexpected), not merely a length or per-id existence check; fails with the profile, designation, operation, and both difference lists on any mismatch.

**Real-data pass.** Ran against the real, untouched projection and relationship graph. **PASS, 0 errors** — all 29 profiles' `tap_types[]` exactly match what `relationships.seed.json` currently establishes for `cut_tapping`.

**Mutation test.** Temporarily edited the real `data/relationships/relationships.seed.json` (backed up first), removing the `rel_cut_tapping_relates_taper_tap` record entirely (41 records → 40), **without regenerating either projection** (confirmed both `tapping-profiles.json` and `tap-types.json` unregenerated via checksum). Ran the validator. **FAIL, 29 errors** — one per profile (all 29 share `operation: "cut_tapping"`), each correctly identifying the mismatch, e.g.:
```
tap_m10x1_25_cut (designation M10x1.25, operation 'cut_tapping'): tap_types[] membership
mismatch -- missing: [none], unexpected: [taper_tap]
```
`taper_tap` correctly appears as **unexpected** rather than missing: the relationship edge that justified it was removed, so the graph no longer establishes it, but the (stale, unregenerated) projection still carries it — exactly the "stale projection vs. authoritative source" contradiction the check exists to catch. Confirmed all 29 errors independently, and all 29 correctly named `taper_tap` as the sole discrepancy.

**Restoration.** Restored `data/relationships/relationships.seed.json` from the pre-mutation backup, confirmed byte-identical via SHA-256 (`1fb66e4a74c8282f285b8451fd01fc0fc1070079ff667fdc211b7919ae3d15fb`, matching the pre-mutation baseline exactly). Re-ran the validator. **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged).

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`050655901b89d5b48d825d282b1f3b2381d706d9780b600d99a85ba6c28459b7`) every run.

**Checksums.** `data/relationships/relationships.seed.json`, `data/entities/entities.seed.json`, both T3 projections, all 4 product HTML files, `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`, and `scripts/generators/generate-tapping-projections.js` are all confirmed byte-identical before and after this phase. **The generator was never run.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json`, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every `data/datasets/`/`data/standards/` file. The generator was deliberately left untouched — current data is already correct; T17 closes only the missing regression guard.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T18 was not started.

**T17 STATUS: READY FOR REVIEW.** See `audit/t17-change-scope.md` for the file accounting.
