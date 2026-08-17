# T13 — Tapping Domain Residual Integrity Audit

Date: 2026-08-17
Type: **DISCOVERY + AUTHORIZED IMPLEMENTATION**
Status: **READY FOR REVIEW**

Full structured data: [t13-residual-integrity.json](t13-residual-integrity.json)

Sections 1–13 below are the original, unmodified read-only discovery findings. Section 14 documents the subsequently authorized implementation.

## 0. Baseline

HEAD at start: `ca9e59924afa4a2dcd39aade3a3ebc85512a3a51` — matches `origin/main` exactly. Working tree clean except the same 10 pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`logo.ai` files present since before T11. No assumption of a clean tree was made; verified directly.

## 1. Data flow (reconstructed from actual code, not filenames)

```
data/datasets/{metric,unc,unf}_tapping.seed.json  ─┐
data/entities/entities.seed.json                   ├─→ generate-tapping-projections.js ─→ tapping-profiles.json (29 rows)
data/standards/*                                    │                                  └─→ tap-types.json (7 rows)
                                                     ┘
        ┌──────────────────┬──────────────────┬──────────────────┐
        ▼                  ▼                  ▼                  ▼
generate-tapping-   generate-tap-type-  generate-tapping-  generate-tapping-
    atlas.js            guide.js           workflow.js        evidence.js
        │                  │                  │                  │
        ▼                  ▼                  ▼                  ▼
tapping-atlas.html   tap-type-guide.html  tapping-workflow.html  tapping-evidence.html
        │                                 + js/tapping-workflow-data.js (shared)
        ▼                                        ▲
downloads/tapping-atlas.csv           reference/tapping-evidence.html reads this same file
```

Per-consumer detail (source, generator, static vs. client, validator, whether source-to-output fidelity is checked) is in the JSON's `data_flow_reconstruction.consumers` array. The one finding worth stating up front: **every seam from the projection outward is checked by at least one validator that compares consumer output to the projection.** The one seam that is *not* checked by anything is the first one — knowledge-layer dataset → projection.

## 2. Certification matrix

| Family | Status | Note |
|---|---|---|
| A. Thread identity | CERTIFIED | Checked field-by-field everywhere |
| B. Tap-drill value | CERTIFIED | Value/unit fidelity checked in all consumers + CSV |
| C. Tap-drill verification status | **PARTIAL** | Projection→consumer parity certified; source→projection derivation untested (selected target) |
| D. ISO 2306 alternative | CERTIFIED | Structural separation enforced (T3/T11) |
| E. Cross-verification metadata | **PARTIAL** | Same root cause as C — the narrative text is built from the same unverified boolean |
| F. Overall record status | CERTIFIED | Direct pass-through, not a multi-field derivation |
| G. Tap types (relationship) | CERTIFIED | Resolved via relationship graph, reference-checked |
| H. Manufacturing characteristics | CERTIFIED | Fact-by-fact completeness (T6 pattern) |
| I. Typical applications | CERTIFIED | Same pattern |
| J. Manufacturer-specific recommendations | CERTIFIED | Same pattern |
| K. General taxonomy | CERTIFIED | Named check for the specific NASA fact |
| L. Standards | CERTIFIED | Projection-backing enforced (T11 check 9) |
| M. Provenance | CERTIFIED | T11, 8 regression tests |
| N. Engagement limitations | CERTIFIED | Forbidden-pattern grep + const enforcement everywhere |
| O. Verification labels (wording) | CERTIFIED | T11 terminology validator |
| P. Evidence classifications (labels) | CERTIFIED | T11 fixed plural drift, label-presence checked |
| Q. Designation/system mapping | CERTIFIED | Exact set-equality checks |
| R. Record counts | CERTIFIED | Every count derived from the projection at validation time, never hardcoded |
| S. CSV representation | PARTIAL / INTENTIONALLY ABSENT | Profile-grain: certified. Tap-type-grain facts: intentionally absent (T6, different grain) |
| T. Client-side workflow representation | CERTIFIED | Field-by-field parity checked against the projection |

Only **C** and **E** are genuinely open, and they share one root cause.

## 3. Silent-drop audit

No current live silent drop was found. One structural, forward-looking risk: all four tap-type-consuming validators (`validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`) hardcode the identical fixed list of the 4 known classification field names rather than enumerating whatever the projection row actually contains. Confirmed by direct grep of all four files. Today's `tap-types.json` rows contain exactly those 4 fields plus metadata — nothing is silently dropped right now. But if the schema is ever extended with a 5th classification (plausible: `general_taxonomy` itself was added this way, via the T3 correction), no validator would notice a consumer failing to render it. This is real but lower-priority than the selected target — see Risk Ranking.

## 4. Status-derivation audit

Reviewed every derived-status field in the pipeline:

| Field | Source field | Derived? | Rule correct? | Validator tests it? |
|---|---|---|---|---|
| `tap_drill.status` | `hole_preparation.cross_verified` | Yes | **Incomplete** — checks presence only, ignores `.match` | **No** |
| `data_quality.record_status` | `profile.status` | No (direct copy) | n/a | n/a |
| `alternative_drill.status` | source record's own field | No (direct copy) | n/a | n/a |
| tap-type `evidence_status` counts | `application_notes[].status` | Yes (count) | Correct — counts an already-authoritative field | Yes (`validate-tapping-projections.js` check 9) |

**The finding:** `generate-tapping-projections.js`'s `buildTapDrillBlock()` computes `status: Boolean(hp.cross_verified) ? "verified" : "source_bound"`. The source schema carries a `match` boolean on every `cross_verified` object (confirmed present and `true` on all 9 current cross-checked records) — meaning the schema anticipates a cross-check that could find a *mismatch*, not just an attempt. The derivation rule never looks at `.match`; it only asks whether the cross-check object exists at all. If a future data-acquisition phase ever recorded a genuine mismatch (`cross_verified` present, `match: false`), today's rule would still label that record `"verified"`.

This is exactly the failure shape T3's own historical correction addressed one layer up the pipeline (a projection field being derived from the wrong signal). It has never been fixed here because it has never been *tested* here: `validate-tapping-projections.js` check 4 ("Verification-State Correctness") only confirms `tap_drill.status` is one of the four valid enum values — it never opens the source dataset. `validate-tapping-domain.js` only checks the dataset's own `hole_preparation.status` field, which is `"verified"` on all 29 records by design (T1's convention) and therefore cannot distinguish the 9 cross-checked records from the other 20 — it never reads `cross_verified` either.

**Current data is correct.** Direct inspection of all three dataset seed files confirms: all 9 records marked `verified` have `cross_verified` present with `match: true`; all 20 marked `source_bound` have `cross_verified` absent. The "9 verified / 20 source-bound" claim shown on every product today is factually accurate. The risk is entirely the *absence of a regression guard* — nothing would catch it if this ever changed, silently, in either the generator logic or a future data-acquisition phase's dataset edit.

## 5. Provenance-derivation audit

No new fabrication or unapproved-fallback risk beyond what T11 already hardened. One related observation: `tap_drill.provenance.cross_check`'s narrative text (`"Matches ${table} exactly (verified ${date})"`) is built from the same unverified `crossVerified` boolean as the status field above — if that boolean is ever wrong, this sentence would also incorrectly claim an exact match. This isn't a separate risk; it's the same root cause, folded into the same selected target rather than treated as a second finding.

## 6. Static/client parity audit

No material divergence in value, status, provenance, classification, applicability, standard identity, or evidence tier was found between Atlas (static), Tap-Type Guide (static), and Workflow/Evidence (client-side, sharing `js/tapping-workflow-data.js`). `validate-tapping-workflow.js` explicitly checks `tap_drill.status` equality between the embedded data file and the projection; T11 extended this to full provenance objects. Since every consumer reads the *same* two projection files with no independent re-derivation of its own, and every consumer's fidelity to the projection is checked, this class of risk is certified across the board. Families C/E's risk isn't a parity gap between consumers — it originates one step upstream of all of them and would appear identically everywhere at once.

## 7. Generator/artifact staleness audit

No automated staleness-detection mechanism exists anywhere in the repository — no build manifest, no source-checksum-to-artifact linkage, no CI config. Every phase from T1 through T12 has relied on manually running each generator and manually comparing SHA-256 checksums, which has held up with zero recorded drift incidents across 12 phases, but it is a process discipline, not a mechanically enforced invariant. This mirrors a finding from the T12-discovery session (no persisted site-wide QA validator either). It is real but explicitly out of scope for a bounded T13 target per the phase brief's own framing ("this is an audit, not a request to redesign the build system") — fixing it would mean build-system-level changes, not a single validator addition.

## 8. CSV audit

Re-evaluated, did not reopen, the T4/T6/T11 grain decision. No profile-grain field currently shown in HTML is absent or materially altered in the CSV. Tap-type-grain facts (general taxonomy, manufacturing characteristics, etc.) remain absent from the CSV by the documented T6 decision — classified **INTENTIONALLY ABSENT**, not unresolved. The CSV's frozen `"ISO 2306 metric convention"` wording remains the documented T11 regression-rule exception. No CSV finding rises to the level of a T13 candidate.

## 9. Closed decisions — none reopened

75% engagement convention, axial engagement calculation, ISO 2306 alternative semantics, hole-preparation taxonomy axes, `RELATES_TO` predicate decision, thin Standards pages, CSV tap-type-grain limitation, T4 foreign-generator reverse-link deferrals, T9 reload-persistence deferral, T9 automatic difference-highlighting deferral — none of these were touched; no new evidence contradicts any of them.

## 10. Risk ranking

1. **`tap_drill.status` derivation is untested against its source** — live, present-tense, unverified trust claim underlying every "verified"/"source-bound" label sitewide. Total silent-failure potential (schema-valid output, all consumers agree with each other since they all copy the same field). **Selected.**
2. Hardcoded tap-type classification field lists across 4 validators — real, but conditional on a future schema change that hasn't happened; larger implementation footprint (4 files, not 1). Not selected.
3. No build-staleness detection — real, but repo-wide/systemic and explicitly out of scope for a bounded validator addition. Not selected.

## 11. Selected T13 target

**Title:** Tap-Drill Status Source-to-Projection Derivation Verification

**Objective:** Add one check to `validate-tapping-projections.js` that independently re-derives the expected `tap_drill.status` for every one of the 29 profiles directly from its source dataset record's `hole_preparation.cross_verified` (using the complete, correct rule — present **and** `match !== false`) and fails if it disagrees with the projection's actual `tap_drill.status`.

**Root risk:** `generate-tapping-projections.js`'s `buildTapDrillBlock()` derives status from presence of `cross_verified` alone, never consulting `.match`. No validator anywhere reads both the source dataset and the projection together to check this.

**Source of truth:** `data/datasets/metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json` — each record's `hole_preparation.cross_verified` (and `.match` where present).

**Affected consumers:** `data/projections/tapping/tapping-profiles.json` directly; every downstream product indirectly (all trust this one field equally).

**Existing coverage:** Enum-membership only (`validate-tapping-projections.js` check 4); source-dataset-internal-only (`validate-tapping-domain.js`).

**Coverage gap:** Nothing cross-references source `cross_verified.match` against projection `tap_drill.status`.

**Validator behavior required:** For each `tapping_profile_id`, locate its source record across the three dataset files, compute `expectedStatus = (hp.cross_verified && hp.cross_verified.match !== false) ? "verified" : "source_bound"`, and fail if it doesn't match the projection row's actual `tap_drill.status`.

**Mutation test required:** In a disposable copy of one dataset file, set an existing verified record's `cross_verified.match` to `false` (or remove `cross_verified` entirely) without touching the real projection; run the new check against the now-inconsistent pair; confirm it fails. Restore, confirm pass.

**False-positive test required:** Run against the real, untouched data; must pass, 0 errors — current data already satisfies the correct rule.

**Pass criteria:** 0 errors on real data; correct failure on the reproduced mismatch; all 9 existing validators keep passing; every checksum stays byte-identical (validator-only change — no generator or product edit is needed, since current data is already correct under the proper rule).

**Bounded file scope:** `scripts/validators/validate-tapping-projections.js` only.

## 12. Repository integrity

HEAD before and after this discovery: `ca9e59924afa4a2dcd39aade3a3ebc85512a3a51`, matching `origin/main` throughout. Zero tracked files modified during discovery. The same 10 pre-existing D2-phase/local-machine untracked files remain untouched. All production, data, and projection files are confirmed byte-identical before and after — this phase read files only.

## 13. Confirmation (discovery phase)

Nothing was implemented during discovery. No validator was written or modified. No product, generator, projection, or knowledge-layer file was touched during discovery.

## 14. Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator behavior implemented:** Check 10, `"Tap-Drill Status Correctly Derived From Source Cross-Verification"`, added to `scripts/validators/validate-tapping-projections.js`. For each of the 29 `tapping_profile_id` values, it locates the matching source record across `metric_tapping`/`unc_tapping`/`unf_tapping` (via `knowledge.datasetById`, already loaded by the file), computes `expectedStatus = (hp.cross_verified && hp.cross_verified.match !== false) ? "verified" : "source_bound"`, and fails if that disagrees with the projection row's actual `tap_drill.status`.

**Test 1 — Real-data pass.** Ran the new check against the real, untouched projection and datasets. **PASS, 0 errors** — all 29 records agree.

**Test 2 — Mutation failure.** Temporarily edited the real `data/datasets/metric_tapping.seed.json` (backed up first), flipping `tap_m3x0_5_cut`'s `hole_preparation.cross_verified.match` from `true` to `false`, **without regenerating the projection**. Ran the validator. **FAIL, 1 error**:
```
tap_m3x0_5_cut: tap_drill.status is 'verified' but the source dataset's hole_preparation.cross_verified
state derives to 'source_bound' -- possible incorrect derivation or stale projection
```

**Test 3 — Restoration pass.** Restored `metric_tapping.seed.json` from the pre-mutation backup (confirmed byte-identical via SHA-256: `d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`, matching the pre-mutation baseline exactly). Re-ran the validator. **PASS, 0 errors.**

**All existing tapping validators:** all 9 (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (the pre-existing 5 informational `validate-tapping-domain` warnings and 1 informational `validate-tapping-terminology` warning are unchanged).

**Checksums.** `data/projections/tapping/tapping-profiles.json`, `tap-types.json`, all three dataset seed files, all 4 product HTML files, `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`, and `scripts/generators/generate-tapping-projections.js` are all confirmed byte-identical before and after this phase — direct diff of the full pre/post checksum lists shows zero differences except the intentionally-modified validator itself. **No generator was ever run during this phase** — the mutation test deliberately worked against the existing, unregenerated projection to prove the check catches source/projection drift, exactly as specified.

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`2bc233c7ca2a77f940c3a48a5187049eaeeb84b21f9dfbd7a4bb513c16e28b61`) every run.

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, all three dataset seed files, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every `data/entities/`/`data/standards/`/`data/relationships/` file. The generator was deliberately left untouched, per the explicit governance constraint: the audit already established current output is correct, so T13 closes the missing regression guard without opportunistically rewriting working projection logic.

Nothing was committed or pushed. T14 was not started.

## Final Status

**T13 STATUS: READY FOR REVIEW.** See `audit/t13-change-scope.md` for the file accounting.
