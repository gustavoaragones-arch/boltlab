# T14 — Tapping Domain Post-T13 Residual Integrity Audit

Date: 2026-08-17
Type: **READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t14-residual-integrity.json](t14-residual-integrity.json)

## 0. Baseline

HEAD at start: `091887876a483125f6246dd270ce21b432cf7c04` — matches `origin/main` exactly. Working tree clean except the same 10 pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`logo.ai` files present since before T11. No assumption of a clean tree was made; verified directly.

## 1. Post-T13 certification matrix

| Family | Status | Note |
|---|---|---|
| Thread identity | CERTIFIED | Unchanged |
| Tap-drill value | CERTIFIED | Unchanged |
| Tap-drill status | **CERTIFIED** (upgraded by T13) | Now derivation-tested against source |
| Cross-verification (status consequence) | CERTIFIED (via T13) | — |
| **Cross-verification (narrative text: `convention`, `provenance.source`, `provenance.cross_check`)** | **UNRESOLVED** | Same untested derivation signal as the field T13 fixed — see Section 4 |
| ISO 2306 alternative | CERTIFIED | Direct copy, not a derivation |
| Overall record status | CERTIFIED | Direct pass-through |
| Tap types | CERTIFIED | Unchanged |
| General taxonomy | CERTIFIED | Unchanged |
| Manufacturing characteristics | CERTIFIED | Unchanged |
| Typical applications | CERTIFIED | Unchanged |
| Manufacturer-specific recommendations | CERTIFIED | Unchanged |
| Standards | CERTIFIED | `verification_state` sub-field remains deliberately unsurfaced (T10), not a defect |
| Provenance (dataset/record/field) | CERTIFIED | T11, unaffected by this phase's finding |
| Evidence classification labels | CERTIFIED | Unchanged |
| Engagement limitations | CERTIFIED | Unchanged |
| Designation/system mapping | CERTIFIED | Unchanged |
| CSV representation | PARTIAL / documented | Known, intentional, previously-authorized exception — see Section 6 |
| Client-side representation | CERTIFIED | Spot-checked, exact parity confirmed |
| Generated HTML representation | CERTIFIED | Unchanged since T11/T12 |

Only one family changed status this session, and only downward within an already-partially-certified area: the narrative-text siblings of the field T13 just certified.

## 2. Revisiting the two known residual risks

### A. Hardcoded classification lists

Re-checked directly, not assumed: `data/projections/tapping/tap-types.json` rows still contain exactly the 4 known classification fields plus metadata — no 5th field exists. All four consuming validators still hardcode the identical fixed field-name list, unchanged since T13. Nothing has changed: **no current integrity risk, no live silent drop possible today.** A future schema addition would still require simultaneous changes across 4 validator files. **Classification: DEFERRED**, re-confirmed, not addressed this phase.

### B. Generated-artifact staleness

Re-checked directly: still no build manifest, no source-checksum-to-artifact linkage, no CI config anywhere in the repository. T13's own new check is the only place any validator compares a projection against its knowledge-layer source at all, and it covers exactly one field. This remains a **repo-wide**, not tapping-domain-bounded, concern. **Classification: OUT OF SCOPE**, re-confirmed, not addressed this phase.

## 3. Silent-drop audit

Fresh source-to-consumer inventory performed, with particular attention to properties introduced after T4:

- **`profileProjection.data_quality_summary`** — computed by the generator, written into the projection, but confirmed via exhaustive grep to be read by *zero* consumers anywhere. Inert data. Since nothing reads it, a defect in it could never mislead a real user — noted as a data-hygiene observation, not a T14 candidate.
- **`standards[].verification_state`** — populated but unrendered. Not a new finding: T10's own audit already named this an explicit, deliberate deferral ("treated as data-methodology's concern, not this page's"). Classified NOT_APPLICABLE, matching existing intent — not reopened.
- **`data_quality.provenance_complete`** — a derived boolean, reviewed for the same risk class as `tap_drill.status`. Found not independently re-derived by any validator, but the existing check already asserts both the raw fields' presence *and* the boolean's truthiness as separate conditions; since 100% of current records have all three raw fields present, a hypothetical wrong derivation of this specific boolean could only escape detection in a scenario the other assertion already forecloses. Lower severity than the selected finding; not selected.

No new *live* silent drop was found.

## 4. Derivation audit — the finding

Reviewed every derived field beyond what T13 already covered. One clear result:

`generate-tapping-projections.js`'s `buildTapDrillBlock()` computes a single boolean once —

```js
const crossVerified = Boolean(hp.cross_verified);
```

— and reuses it for **four** separate output values:

1. `tap_drill.status` — **now derivation-tested by T13.**
2. `tap_drill.convention` (metric rows: `"...BoltLab primary-source table match"` vs. `"...not independently cross-checked..."`) — **untested.**
3. `tap_drill.provenance.source` (`hp.cross_verified.source` or `null`) — **untested.**
4. `tap_drill.provenance.cross_check` (`"Matches ${table} exactly (verified ${date})"` or `null`) — **untested.**

T13's check re-derives and compares only field 1. Fields 2–4 share the *exact same* incompleteness T13 fixed for field 1 — the underlying `crossVerified` boolean still only checks *presence* of `hp.cross_verified`, never its `.match` sub-field — but nothing anywhere compares them back to source. Confirmed by exhaustive grep: zero validators reference `.convention`, and `cross_verified` appears only inside T13's own status-only check.

**Concretely:** if a future record ever had `cross_verified` present with `match: false` (a real, schema-anticipated, not-yet-occurred scenario — the same premise T13's own mutation test used), T13's check would correctly flag `tap_drill.status` as wrong. But `tap_drill.convention` would still say *"BoltLab primary-source table match,"* and `provenance.cross_check` would still say *"Matches [table] exactly"* — both flatly false — with the status label right next to them correctly reading `"Source-bound"`. That internal contradiction on the same card would be worse than a silent failure: it would visibly disagree with itself, and nothing would have caught it before it shipped.

**Current live data is correct.** All 9 currently-verified metric records have `cross_verified.match: true`, so today's `convention`/`provenance.source`/`provenance.cross_check` text is accurate. This is, precisely like T13's finding, an absent regression guard rather than a live defect.

Two other candidates were reviewed and cleared: `data_quality.provenance_complete` (see Section 3) and the UNC/UNF `coarseFineLabel` presentation derivation, which is definitionally correct (UNC and UNF series names themselves encode coarse/fine — not a genuine multi-source risk, and the generator's own comment says so explicitly).

## 5. Trust-state audit

No verification-state label is upgraded, downgraded, or transformed by any consumer beyond what's already certified. One item is worth naming explicitly, though it is not new: `downloads/tapping-atlas.csv`'s `primary_drill_convention` column reads `"ISO 2306 metric convention"` for all 14 metric rows, including the 5 without individual cross-verification — the identical overclaim pattern T11 corrected in every HTML surface, deliberately *not* applied to the CSV. This was not rediscovered by this audit; it was explicitly identified, reasoned through, and intentionally frozen by T11 under that phase's own explicit external constraint ("the CSV is a protected artifact and must not be altered"), fully documented in `audit/t11-tapping-consistency.md`. Selecting it as a T14 target would mean proposing to override a previous phase's deliberate, human-authorized constraint — a materially different kind of decision than adding a new validator check, and not something to reopen without new evidence that the original tradeoff was wrong. No such evidence exists. Named here for visibility; not selected.

## 6. Duplicated-data audit

No unsafe duplicated source of truth found. `js/tapping-workflow-data.js` is a generated build artifact (self-labeled as such in its own header) feeding two consumers (Workflow, Evidence) — a legitimate static copy, mechanically re-derivable and checked field-by-field against the projection, not an unsafe duplication. `tools/tap-drill-calculator.html` independently implements its own workshop-formula calculation and never claims to be T3-projection-backed — a pre-existing, explicitly out-of-scope design, not a duplicated-truth risk.

## 7. Cross-product consistency audit

Spot-checked `M8x1.0` (a source-bound metric record, chosen for having no cross-verification data to compare) across the projection, `downloads/tapping-atlas.csv`, and `js/tapping-workflow-data.js`:

```
projection tap_drill: {value: 7, unit: "mm", status: "source_bound", provenance: {..., source: null, cross_check: null}}
CSV row:              M8x1.0,...,7,mm,ISO 2306 metric convention,source_bound,...
client data:          {value: 7, unit: "mm", status: "source_bound", provenance: {..., source: null, cross_check: null}}
```

Fully consistent — value, status, and provenance agree everywhere; the CSV's convention column correctly shows the known, documented frozen-exception text. No divergence found. The broader 29-record, 4-product consistency guarantee continues to rest primarily on the automated validator suite (T7–T13) rather than exhaustive manual spot-checking, consistent with how every prior phase has relied on its dedicated validators for this guarantee.

## 8. Risk ranking

1. **`tap_drill.convention`/`provenance.{source,cross_check}` derivation untested** — live-scoped sibling of a field just fixed, identical failure shape, zero coverage, small bounded fix reusing T13's own proven technique. **Selected.**
2. Hardcoded classification lists — deferred, unchanged, no current impact.
3. No build-staleness detection — out of scope, repo-wide, unchanged.
4. CSV convention-column overclaim — live but intentionally, previously authorized; not reopened absent new evidence.

## 9. Selected T14 target

**Title:** Tap-Drill Convention and Cross-Check Narrative Source Derivation Verification

**Objective:** Extend `validate-tapping-projections.js`'s T13 check (or add a closely-related sibling check in the same file) to independently re-derive and verify `tap_drill.convention` (metric rows) and `tap_drill.provenance.{source,cross_check}` against the source dataset's `hole_preparation.cross_verified`, using the identical match-aware rule T13 established, closing the two fields left uncovered when T13 scoped its fix to `status` alone.

**Root risk:** One `crossVerified` boolean feeds four output fields; only one is derivation-tested.

**Source of truth:** The same three dataset seed files, same `hole_preparation.cross_verified` object, this time reading `.source`/`.table`/`.verified_date` as well as `.match`.

**Affected consumers:** `tapping-profiles.json`'s `tap_drill.convention`/`provenance.source`/`provenance.cross_check`; indirectly every product that renders the convention label or cross-verification narrative.

**Current coverage:** None for these three fields specifically.

**Exact gap:** No validator compares these three values against a correct, match-aware re-derivation from source.

**Validator behavior required:** Per profile, using the same match-aware determination as T13, compute expected `convention` (metric only — non-metric is a fixed string, not at risk), expected `provenance.source`, and expected `provenance.cross_check`; fail on any mismatch.

**Mutation test required:** Reuse T13's exact technique — flip a real, backed-up dataset record's `cross_verified.match` to `false` without regenerating the projection, confirm the new check(s) fail with the right identified mismatch, restore, confirm byte-identical checksum and pass.

**False-positive test required:** Real, untouched data must pass, 0 errors.

**Regression tests:** All 9 existing validators keep passing; all checksums outside the validator itself stay byte-identical.

**Determinism:** 3 consecutive runs, identical report checksum.

**Allowed files:** `scripts/validators/validate-tapping-projections.js`, its own regenerated report, T14 audit documentation.

**Forbidden files:** the generator, both projections, all three dataset seed files (except as a temporary, restored mutation fixture), every product file, the CSV, the client data file, every other validator, every knowledge-layer file.

**Pass criteria:** 0 errors on real data; correct failure on the reproduced mismatch; everything else unaffected.

No architecture document was created — this finding extends an existing validator pattern rather than establishing a new architectural rule.

## 10. Repository integrity

HEAD before and after this discovery: `091887876a483125f6246dd270ce21b432cf7c04`, matching `origin/main` throughout. Zero tracked files modified. The same 10 pre-existing untracked files remain untouched. All production, data, and projection files confirmed byte-identical — this phase read files only.

## 11. Confirmation (discovery phase)

Nothing was implemented during discovery. No validator was written or modified. No product, generator, projection, or knowledge-layer file was touched during discovery.

## 12. Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator behavior implemented:** Check 11, `"Tap-Drill Convention and Cross-Check Narrative Correctly Derived From Source Cross-Verification"`, added immediately after T13's check 10. For each of the 29 profiles, using the same match-aware `isMatch` determination as check 10, it verifies:
- **Metric rows:** `tap_drill.convention` equals the correct match-aware text (`"...BoltLab primary-source table match"` vs `"...not independently cross-checked..."`).
- **Non-metric rows:** `tap_drill.convention` equals the fixed `"US customary drill-series"` (no cross-verification semantics invented — confirmed no UNC/UNF record ever carries `cross_verified`, so this branch never varies).
- **All rows:** `tap_drill.provenance.source` equals `crossVerified.source` when matched, else `null`; `tap_drill.provenance.cross_check` equals the correct `"Matches {table} exactly (verified {date})"` narrative when matched, else `null`.

**Test A — Real-data pass.** Ran against the real, untouched projection and datasets. **PASS, 0 errors** — all 29 records agree on all three fields.

**Test B — Mutation test.** Temporarily edited the real `data/datasets/metric_tapping.seed.json` (backed up first), flipping `tap_m3x0_5_cut`'s `hole_preparation.cross_verified.match` from `true` to `false`, **without regenerating the projection**. Ran the validator. **FAIL, 4 errors** — both check 10 and check 11 correctly detected the single mutation's full downstream contradiction, even though the projection file itself never changed:
```
[check 10] tap_m3x0_5_cut: tap_drill.status is 'verified' but the source dataset's
hole_preparation.cross_verified state derives to 'source_bound' -- possible incorrect
derivation or stale projection

[check 11] tap_m3x0_5_cut: tap_drill.convention is 'ISO 2306 nominal-minus-pitch (BoltLab
primary-source table match)' but the source cross-verification state derives to 'ISO 2306
nominal-minus-pitch (not independently cross-checked against the primary table)'
[check 11] tap_m3x0_5_cut: tap_drill.provenance.source is 'iso_2306' but the source
cross-verification state derives to 'null'
[check 11] tap_m3x0_5_cut: tap_drill.provenance.cross_check is 'Matches Table 1 (coarse
pitch series) exactly (verified 2026-08-15)' but the source cross-verification state
derives to 'null'
```
This demonstrates the exact required property: the validator catches the internal contradiction (a record that would have shown "Source-bound" status right next to convention/provenance text still claiming an exact primary-source match) purely from the source/projection disagreement, with the projection artifact itself never touched.

**Test C — Restoration pass.** Restored `metric_tapping.seed.json` from the pre-mutation backup (confirmed byte-identical via SHA-256: `d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`, matching the pre-mutation baseline exactly). Re-ran the validator. **PASS, 0 errors** on both checks.

**Test D — Regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged).

**Test E — Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`77753937748cb06ec1c2cb230ff6fb77c9866820b0f7c8dc89cec3962c061d73`) every run.

**Checksums.** `data/projections/tapping/tapping-profiles.json`, `tap-types.json`, all three dataset seed files, all 4 product HTML files, `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`, and `scripts/generators/generate-tapping-projections.js` are all confirmed byte-identical before and after this phase. **No generator was ever run during this phase.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, all three dataset seed files, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every `data/entities/`/`data/standards/`/`data/relationships/` file. The generator was deliberately left untouched — T13 already established current output is correct; T14 closes the remaining missing regression guard without rewriting working projection logic.

Nothing was committed or pushed. T15 was not started.

## Final Status

**T14 STATUS: READY FOR REVIEW.** See `audit/t14-change-scope.md` for the file accounting.
