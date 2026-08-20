# T15 — Tapping Domain Post-T14 Residual Integrity Audit

Date: 2026-08-20
Type: **READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t15-residual-integrity.json](t15-residual-integrity.json)

## 1. Baseline repository state

- **HEAD:** `98079466a7ff03e4084061ade1c7d909692c20e5`
- **origin/main:** `98079466a7ff03e4084061ade1c7d909692c20e5` — matches HEAD.
- **T14's commit confirmed on main:** `9807946` — "T14: Verify tap-drill narrative derives from source cross-verification" appears in `git log`.
- **git status:** clean except the same 10 pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`logo.ai` files present since before T11.

T14 closure is confirmed complete. Discovery proceeds.

## 2. Post-T14 certification matrix

| Family | Status | Note |
|---|---|---|
| Thread identity | CERTIFIED | Unchanged |
| Tap-drill value/unit | CERTIFIED | Unchanged |
| Tap-drill status | CERTIFIED | T13 |
| Tap-drill convention | CERTIFIED | T14 |
| Tap-drill provenance.source / cross_check | CERTIFIED | T14 |
| Tap-drill provenance.source_dataset/record/field | CERTIFIED | Direct copy, unaffected |
| Alternative drill (value/unit/status) | CERTIFIED | Unchanged |
| Alternative drill `standard_edition` | intentionally-static literal | Not a T13/T14-class risk |
| Overall record status | CERTIFIED | Direct pass-through |
| `data_quality.provenance_complete` | CERTIFIED (redundant assertion) | Reviewed T14, unchanged |
| `data_quality_summary` | NOT APPLICABLE | Unused by all consumers |
| Engagement fields | CERTIFIED | Unchanged |
| Standards | CERTIFIED | Unchanged |
| `standards[].verification_state` | NOT APPLICABLE | T10's deferral, reconfirmed |
| Tap types (relationship) | CERTIFIED | Unchanged |
| Application-note fact/status | CERTIFIED | Check 9 guards these |
| **Application-note `source`** | **UNRESOLVED** | Check 9's own comment claims coverage it doesn't have — selected target |
| Application-note `source_tier` | NOT APPLICABLE | Present, unrendered, inert |
| `taxonomy_axis` | CERTIFIED | Direct copy |
| Designation/system mapping | CERTIFIED | Unchanged |
| CSV representation | PARTIAL / documented | Known T11 exception, not reopened |
| Client-side representation | CERTIFIED | `source_tier` confirmed carried verbatim, no new divergence |
| Generated HTML representation | CERTIFIED | Unchanged |

## 3. Full source → projection inventory

Re-read `scripts/generators/generate-tapping-projections.js` in full. Every derivation, conditional emission, and transformation was catalogued:

- `tap_drill.status`/`convention`/`provenance.{source,cross_check}` — all four consumers of the `crossVerified` boolean. **Fully closed** by T13 (status) + T14 (the other three).
- Tap-type note **fact/status** — derived via `byClass()` filtering; guarded by check 9.
- Tap-type note **source** — passed through by the same filter (not independently reconstructed field-by-field, unlike `tap_drill`), but **never compared** by check 9 despite its own comment claiming otherwise. **Selected finding.**
- Tap-type `evidence_status` counts — a straightforward count of `application_notes[].status`; guarded by check 9's total-count comparison.
- `coarseFineLabel()` (Atlas/Workflow presentation layer) — reviewed again, still cleared: UNC/UNF coarse/fine is definitional to the series name, not a two-source derivation risk.

No other multi-field or conditional derivation was found in this generator beyond what's listed above.

## 4. Projection → consumer inventory

Re-confirmed the full consumer list by grepping `reference/`, `tools/`, and `js/` for references to `tapping-profiles.json` / `tap-types.json` / `tapping-workflow-data.js`: Atlas, Tap-Type Guide, Workflow, Evidence, the CSV, and the independent (non-projection-backed) Tap Drill Calculator. **No new consumer has appeared since T14.** All known consumers' field-by-field fidelity to the projection remains certified by their respective validators (T7–T14); this audit did not find a reason to distrust that coverage.

## 5. Silent-drop audit

- `application_notes[].source` — **not dropped.** Confirmed present and byte-for-byte correct in the current projection (0 mismatches across all 16 facts, verified directly). The risk is an *unguarded* seam, not a live drop.
- `application_notes[].source_tier` — **not dropped.** Confirmed it survives into the projection and `js/tapping-workflow-data.js` verbatim (grepped directly). **Never rendered by any consumer** — inert, not user-facing, not selected.
- `data_quality_summary` — unchanged from T14's finding, still unused by all consumers, not reopened.

No new *live* silent drop was found.

## 6. Derivation audit

All multi-field/conditional derivations in the generator were re-walked. The primary finding is structurally slightly different from T13/T14's pattern, worth stating precisely: `tap_drill` fields are *reconstructed* field-by-field from a computed signal (`crossVerified`), which is exactly the shape a "wrong signal" bug can hide in. Tap-type notes, by contrast, pass through `Array.prototype.filter()` as whole objects — there's no code path in the generator that could introduce a `fact`/`source` mismatch under normal generation. The risk here is narrower: a **hand-edited projection**, or a **future generator change** that does start reconstructing note objects field-by-field (plausible — this is exactly the kind of refactor that introduces exactly this bug class), would go completely undetected, because the check that's supposed to guard this — and says in its own comment that it does — doesn't actually check `source`.

Every other derivation reviewed (`buildThreadBlock`, `buildAlternativeDrillBlock`, `buildStandardsBlock`, `buildDataQualityBlock.record_status`, `verificationLabel()`'s presentation-layer fallback, `driveConventionLabel`/`csvDriveConventionLabel`) was cleared — either a pure pass-through with no branching risk, or already covered by an existing, independently-tested check.

## 7. Trust-state audit

The selected finding is squarely a trust-state issue: a fabricated or substituted source citation on any of the 16 tap-type facts would render as an ordinary, confident `"source: ..."` line on both Tap-Type Guide and Evidence — visually indistinguishable from a genuine one — while the fact text and verification badge stayed correct. That's a stronger implicit claim than the projection could actually support if it ever drifted. No other label (Verified/Source-bound/Cross-verified/etc.) was found to be capable of a stronger-than-supported claim beyond what's already certified.

The CSV's `primary_drill_convention` wording (T11's documented exception) was reconsidered per this phase's explicit instruction and reconfirmed **not reopened** — no new evidence surfaced this session that changes the original tradeoff.

## 8. Classification/taxonomy audit

| Failure mode | Protected? |
|---|---|
| Omission | Yes — check 9 |
| Duplication | Yes — check 9 |
| Reclassification | Structurally yes — a reclassified fact fails to be found in its expected field and reports as "dropped" (correct failure, imprecise message, not a coverage gap) |
| Altered status | Yes — check 9 |
| **Altered source** | **No — selected finding** |

No new classification-like field has appeared since T14 (confirmed via direct field-key enumeration of `tap-types.json` rows: still exactly the 4 known classification arrays plus metadata). The hardcoded-field-list concern remains **DEFERRED** — no new current-impact evidence, and this phase's own rules explicitly exclude selecting a hypothetical future-only issue.

## 9. Provenance audit

T11's resolved-value protection (projection→consumer) and T14's cross-verification narrative derivation (source→projection, tap-drill family) were not re-litigated — both remain certified. This audit specifically hunted for a *different remaining seam*, as instructed, and found one: `application_notes[].source` (knowledge-layer→projection, tap-type family). Verified current data is correct (0 mismatches across all 16 facts) — this is an absent regression guard, identical in character to what T13 and T14 each looked like immediately before their own fixes.

## 10. Static/client parity audit

No new divergence found. `js/tapping-workflow-data.js` confirmed to carry `application_notes`-derived fields — including `source_tier` — verbatim from the projection, consistent with it being a faithful, already-checked copy. The selected finding sits upstream of every consumer equally (knowledge layer → projection), not a parity gap between consumers — the same structural position T13/T14's findings occupied.

## 11. Negative-case coverage audit

**Scenario:** a tap-type application note's `source` field changes (knowledge-layer edit, or a hand-edited/buggy-generator projection) while `fact` and `status` stay identical.

**Would any current validator catch it? No.** `validate-tapping-projections.js` check 9 is the *only* validator that opens both `entities.seed.json` and `tap-types.json` together. Its own comment (line 173) states it verifies fact, classification, status, *and source* are "preserved unchanged" — but the actual comparison logic never reads `.source` on either side. Every other validator either never touches `application_notes` at all, or (T11's check 8) only compares the *projection* against *rendered HTML* — a different seam entirely, never the knowledge layer against the projection.

Other scenarios considered and found already-covered or not applicable: `cross_verified.match` flips (closed by T13/T14, not re-tested here), fact reclassification (structurally caught), invalid/typo'd status strings (caught upstream by check 4's enum validation before reaching any presentation fallback), and a standard's designation changing while its ID stays the same (a direct reference-resolution concern, not a derivation risk, and out of this phase's scope).

## 12. Existing decisions re-confirmed

| Item | Classification | Reason |
|---|---|---|
| Hardcoded tap-type classification field lists | DEFERRED | No current impact; unchanged since T13/T14 |
| No automated build-staleness detection | OUT OF SCOPE | Repo-wide, not tapping-bounded |
| CSV `primary_drill_convention` wording | Deliberately protected | No new evidence this session; not reopened |
| `standards[].verification_state` unrendered | INTENTIONALLY ABSENT | T10's explicit deferral, reconfirmed |

## 13. Candidate findings

1. **Application-note `source` never verified between knowledge layer and projection** — selected.
2. Hardcoded classification lists — not selected (deferred, unchanged).
3. Build staleness — not selected (out of scope, unchanged).
4. CSV convention wording — not selected (previously protected, not reopened).
5. `source_tier` unrendered — not selected (inert, no user-visible failure mode possible).

## 14. Risk ranking

1. **Application-note source verification gap** — live, present-tense, rendered citation field, zero coverage despite the guarding check's own comment claiming otherwise, extremely bounded fix. **Selected.**
2–5. All other candidates ranked below the selection bar per the reasons in Section 13.

## 15. Selected T15 target

**Title:** Tap-Type Application-Note Source Preservation Verification

**Objective:** Extend `validate-tapping-projections.js`'s existing check 9 to verify what its own comment already claims — that each application note's `source` field is preserved unchanged between the knowledge-layer entity and the tap-type projection.

**Root risk:** Check 9 verifies fact-presence, duplication, and status, but never compares `source`. A knowledge-layer edit, a future generator refactor, or a hand-edited projection could substitute a fabricated or stale citation for any of the 16 tap-type facts while every current validator — including this one — continues to pass.

**Source of truth:** `data/entities/entities.seed.json` — each tap_type entity's `application_notes[].source`.

**Affected consumer:** `data/projections/tapping/tap-types.json`; indirectly `reference/tap-type-guide.html` and `reference/tapping-evidence.html`, both of which render this field as a citation.

**Current coverage:** fact/status/count only.

**Exact gap:** no comparison of `projected[0].source` against `note.source`.

## 16. Exact implementation contract

Inside check 9's existing per-note loop, immediately after the existing status comparison, add:
```js
else if (projected[0].source !== note.source) {
  errors.push(`${entity_id}: fact source changed in projection (source="${note.source}", projected="${projected[0].source}") -- "${fact excerpt}"`);
}
```

## 17. Exact mutation-test contract

1. **Real-data pass:** run against the real, untouched knowledge layer and projection — must pass, 0 errors (current data already agrees on source for all 16 facts).
2. **Mutation failure:** temporarily edit one real application note's `source` field in `data/entities/entities.seed.json` (backed up first), without regenerating the projection; run the validator; confirm the extended check fails, correctly identifying the mutated entity/fact.
3. **Restoration pass:** restore from backup, confirm byte-identical checksum, confirm pass.
4. **Regression:** all 9 existing tapping validators continue to pass; every checksum outside the validator itself (both projections, all 3 dataset files, `entities.seed.json`, all 4 product HTML files, the CSV, the client data file) remains byte-identical.
5. **Determinism:** validator run 3× on restored real data; identical report checksum every run.

## 18. Exact allowed/forbidden files

**Allowed:** `scripts/validators/validate-tapping-projections.js`, its own regenerated report pair, T15 audit documentation.

**Forbidden:** `data/entities/entities.seed.json` (except as a temporary, restored mutation fixture), `scripts/generators/generate-tapping-projections.js`, both projections, every product HTML file, the CSV, the client data file, every other validator, every other knowledge-layer file.

## 19. Repository integrity

HEAD before and after this discovery: `98079466a7ff03e4084061ade1c7d909692c20e5`, matching `origin/main` throughout. Zero tracked files modified. The same 10 pre-existing untracked files remain untouched. All production, data, projection, generator, and validator files confirmed byte-identical — this phase read files only.

## 20. Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator was written or modified. No product, generator, projection, or knowledge-layer file was touched during discovery.

## 21. Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator change implemented:** Inside check 9's existing per-note loop, immediately after the existing status comparison, added:
```js
} else if (projected[0].source !== note.source) {
  completenessCheck.errors.push(
    `${row.entity_id}: fact source changed in projection (source="${note.source}", projected="${projected[0].source}") -- "${note.fact.slice(0, 60)}..."`
  );
}
```

**Test 1 — Baseline.** Ran against the real, untouched knowledge layer and projection. **PASS, 0 errors** — all 16 facts agree on source; all other checks unaffected.

**Test 2 — Mutation test.** Temporarily edited the real `data/entities/entities.seed.json` (backed up first), changing `taper_tap`'s first application note's `source` from *"Cross-corroborated across multiple machining reference sources (Travers Tool, MisolTap, Rapmaf, AIMS Industrial)"* to `"fabricated-source-t15-mutation-test"`, **without regenerating `tap-types.json`** (confirmed unregenerated via checksum). Ran the validator. **FAIL, 1 error**:
```
taper_tap: fact source changed in projection (source="fabricated-source-t15-mutation-test",
projected="Cross-corroborated across multiple machining reference sources (Travers Tool,
MisolTap, Rapmaf, AIMS Industrial)") -- "Chamfer length is approximately 7-10 threads/
pitches, the lo..."
```
The validator failed specifically and only because the projected citation no longer matched the source record — exactly the required failure mode.

**Test 3 — Restoration.** Restored `entities.seed.json` from the pre-mutation backup, confirmed byte-identical via SHA-256 (`0de67516d3e539425d7aa18a4bc4ba3499556d6259441a1f9c00b8e92fbc66b2`, matching the pre-mutation baseline exactly). Re-ran the validator. **PASS, 0 errors.**

**Test 4 — False-positive protection.** Same as Test 1 — real, unmodified data passes with zero errors.

**Test 5 — Regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged).

**Test 6 — Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`77753937748cb06ec1c2cb230ff6fb77c9866820b0f7c8dc89cec3962c061d73`) every run — the same checksum as T14's own determinism run, since the report's full-pass shape and content are unchanged by this addition on real data (the new comparison branch never triggers).

**Checksums.** `data/entities/entities.seed.json`, both T3 projections, all 4 product HTML files, `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`, and `scripts/generators/generate-tapping-projections.js` are all confirmed byte-identical before and after this phase. `docs/architecture/tapping-projection-validation-report.json`/`.md` are also byte-identical to what was already committed in T14 — since T14's committed report already reflected a full pass with the identical check list/order/results, and T15's new comparison branch produces the same pass output on real, unmutated data. **No generator was ever run during this phase.**

**Files modified:** `scripts/validators/validate-tapping-projections.js` only.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, `data/entities/entities.seed.json` (temporarily mutated as an explicitly-authorized test fixture, then restored and confirmed byte-identical), every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every other knowledge-layer file. The projection generator was deliberately left untouched — this closes only the missing regression guard, exactly as directed.

Nothing was committed or pushed. T16 was not started.

**T15 STATUS: READY FOR REVIEW.** See `audit/t15-change-scope.md` for the file accounting.
