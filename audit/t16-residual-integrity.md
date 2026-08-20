# T16 — Tapping Domain Residual Integrity Audit (Post-T15 Discovery)

Date: 2026-08-20
Type: **READ-ONLY DISCOVERY**
Status: **READY FOR REVIEW**

Full structured data: [t16-residual-integrity.json](t16-residual-integrity.json)

## 0. Repository gate

- `git status --short`: clean except the same 10 pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`logo.ai` files.
- HEAD: `23088142300a4d136401d49cf1d8877ee5ca1a76`
- `origin/main`: `23088142300a4d136401d49cf1d8877ee5ca1a76` — matches HEAD.
- `git log -5`: T15's commit (`T15: Verify tap-type fact sources in projection`) is present at HEAD.

**Gate PASSES.** T15 is committed and pushed. Proceeding with discovery.

## 1. Post-T15 certification matrix

| Family | Status | Note |
|---|---|---|
| Thread identity | CERTIFIED | Unchanged |
| Tap-drill value | CERTIFIED | Unchanged |
| Tap-drill status | CERTIFIED | T13 |
| Tap-drill convention | CERTIFIED | T14 |
| Tap-drill provenance | CERTIFIED | T11/T14 |
| Cross-verification | CERTIFIED | T13/T14 jointly cover every consequence |
| Overall record status | CERTIFIED | Direct pass-through |
| Alternative drill (value/unit/status) | CERTIFIED | Structural check unchanged |
| Alternative drill (`standard_edition` hardcode) | DEFERRED | Real but narrower than the selected finding — see Section 8 |
| Tap types | CERTIFIED | Unchanged |
| General taxonomy | CERTIFIED | T6 + T15 |
| Manufacturing characteristics | CERTIFIED | T6 + T15 |
| Typical applications | CERTIFIED | T6 + T15 |
| Manufacturer-specific recommendations | CERTIFIED | T6 + T15 |
| `application_notes[].source_tier` | DEFERRED | Present, unused by any consumer, unguarded but inert — see Section 4 |
| **Standards (`standard_id` reference)** | CERTIFIED | Existence checked (check 2) |
| **Standards (denormalized fields: organization/designation/edition/title/verification_state)** | **UNRESOLVED** | **Selected T16 target — see Section 4** |
| Source provenance (tap-drill) | CERTIFIED | T11/T14 |
| Evidence status counts | CERTIFIED | Dynamically derived everywhere |
| Engagement limitation | CERTIFIED | Fresh sweep clean |
| Designation/system mapping | CERTIFIED | Unchanged |
| CSV representation | PARTIAL / documented | T11's frozen exception, not reopened |
| Client-data representation | CERTIFIED | Inherits the standards gap from the projection, not a new consumer-side seam |
| HTML representation | CERTIFIED | Unchanged |

## 2. Full source→projection inventory

Every field in `tapping-profiles.json` and `tap-types.json` was classified copied/derived/transformed/aggregated/conditional. Full table in the JSON's `knowledge_projection_audit.fields_reviewed`. Two new observations beyond what T13–T15 already closed:

- **`alternative_drill.standard_edition`** is a hardcoded literal `"1972"` in the generator, not resolved from the standards registry. Currently correct (matches ISO 2306's real edition), unguarded, but touches only one field on 15 rows — narrower than the selected finding.
- **`standards[]`** (all 5 denormalized fields, on every profile) is a `.map()`-transformed denormalization of the resolved standard record, entirely unguarded against source drift. This is the selected target — see Section 4.

## 3. Projection→consumer inventory

Re-enumerated all 7 known tapping consumers and searched for any additional one (grepped generators for projection references, checked both hub pages). **No new consumer found.** Every consumer's field-by-field reading of the projection is unchanged and remains certified; each one simply and faithfully displays whatever `standards[]` says, so the risk found in Section 4 is a projection-level defect, not a consumer-specific one — it would appear identically (and just as silently) in every product at once.

## 4. Silent-drop / derivation audit — the finding

`generate-tapping-projections.js`'s `buildStandardsBlock()`:

```js
function buildStandardsBlock(sourceStandardIds, standardById) {
  return sourceStandardIds.slice().sort().map((id) => {
    const standard = standardById.get(id);
    return {
      standard_id: standard.id,
      organization: standard.organization,
      designation: standard.designation,
      edition: standard.edition || null,
      title: standard.title || null,
      relevance: "...",
      verification_state: standard.standard_status || null
    };
  });
}
```

`validate-tapping-projections.js` check 2 ("Valid Entity, Dataset, and Standard References") confirms `standardIds.has(std.standard_id)` — that the ID resolves to *some* real standard record. **It never compares `organization`/`designation`/`edition`/`title`/`verification_state` against that record's actual values.** `validate-tapping-terminology.js` check 9 ("No standards displayed without projection backing") only confirms rendered HTML designations exist *within the projection's own* `standards[]` array — a projection→consumer check, circular with respect to the knowledge layer, not a knowledge→projection check.

**Live-data cross-check performed (read-only):** all 6 unique standards referenced across the 29 tapping profiles (`ISO 2306`, `ISO 261`, `ISO 262`, `ISO 724`, `ISO 965-1`, and by extension any others) were compared field-by-field against their real records across all 7 `data/standards/**/*.json` files. **0 mismatches.** Current data is correct — this mirrors exactly the pattern T13/T14/T15 each found and fixed: *the guard is what's missing, not the data.*

**Why this matters:** `designation` (e.g. "ISO 2306") is the single most prominent, load-bearing, user-facing identifier for a standard — shown on every Atlas card, in the Workflow result view, in Evidence's standards block, and as a CSV column. A future hand-edit to `tapping-profiles.json`, a generator refactor that reads the wrong field, or data corruption during a merge could substitute a wrong-but-plausible designation, title, or edition for a still-validly-referenced `standard_id` — and every existing validator, including the one that checks this exact array, would keep passing, because none of them look past the ID.

## 5. Tap-type fact audit (fresh, exhaustive)

All 16 facts traced entity → projection → all 4 rendering products. No drop, duplication, reclassification, status mutation, or source mutation found — all now guarded (T6 baseline + T15 extension). Reclassification is additionally guarded indirectly: a fact placed in the wrong output array would fail the per-classification-array lookup as a "dropped" fact. One unguarded-but-inert field found: `source_tier` (Section 4 of the JSON, family M2) — present on every note, propagated verbatim into the projection and client data, but never rendered by any consumer (the one "Tier 1" claim in the Tap-Type Guide FAQ is hardcoded prose about a specific named fact, not driven by this field). Currently 100% correlated with `status`, not enforced to stay that way, but since nothing reads it, a drift could never mislead a real user — same category as T14's already-reviewed `data_quality_summary` finding. Not selected.

## 6. Standards audit

Covered fully in Section 4 — this *is* the selected finding. No previously-known standard-coverage gap (ISO 2857 acquisition history, etc.) was reopened; no new contradiction with that history was found.

## 7. Alternative-drill audit

UNC/UNF presence and metric absence remain structurally certified, unchanged. One new, narrower observation: `standard_edition` is a hardcoded `"1972"` literal rather than a registry-resolved value (Section 2). Reviewed, not selected — the standards[] finding is broader (5 fields × 6 standards × 29 rows vs. 1 field × 15 rows) and a cleaner single bounded target.

## 8. Engagement audit

Fresh forbidden-pattern sweep (percentages, "Confirmed"/"Validated"/"Official", "exact match") across all 4 products, the CSV, and the client-data file: **0 matches.** Radial/axial distinction preserved. No new finding.

## 9. Provenance / evidence audit

T11, T14, and T15 have each closed a distinct provenance seam (resolved-value fidelity; tap-drill narrative derivation; application-note source derivation). This session's finding (standards denormalization) is provenance-adjacent — standard identity *is* a form of provenance for what backs a record — but is a genuinely different field family none of the three prior phases touched.

## 10. Static/client parity audit

`standards[]` is embedded verbatim into `js/tapping-workflow-data.js` and rendered consistently across Atlas/Workflow/Evidence/CSV — parity between consumers is certified; the finding is entirely upstream, at the knowledge→projection seam, and would manifest identically (and just as silently) everywhere at once rather than as a divergence between surfaces.

## 11. Negative-case coverage matrix

| Mutation | Existing validator would catch it? | Which |
|---|---|---|
| `hp.cross_verified.match` flipped | Yes | T13/T14 |
| `application_notes[].source` changed | Yes | T15 |
| `application_notes[].status` changed | Yes | T6 baseline |
| `application_notes[].fact` changed/dropped | Yes | T6 baseline |
| `application_notes[].source_tier` changed | **No** | inert, not material |
| **`standards[].designation`/`organization`/`title`/`edition`/`verification_state` hand-edited while `standard_id` stays valid** | **No** | **SELECTED TARGET** |
| `alternative_drill.standard_edition` changed | No | narrower, not selected |
| UNC/UNF record's `alternative_drill` removed | Yes | check 5 |
| `engagement.axial.calculation_status` flipped | Yes | check 6 |
| `tap_types[]` pointing to a nonexistent entity | Yes | check 2 |
| `thread.designation` changed | Yes | check 1 + every product's designation-set comparison |

## 12. Existing decisions re-confirmed

- Hardcoded tap-type classification field lists — **RECONFIRMED DEFERRED**, no new evidence.
- Repo-wide build/artifact staleness — **RECONFIRMED OUT OF SCOPE**.
- Protected CSV convention wording (T11) — **RECONFIRMED DEFERRED**, not reopened.
- Tap Drill Calculator's independent architecture — **RECONFIRMED INTENTIONALLY ABSENT** as a risk (makes no projection-backed claims).
- Thread-atlas reverse discovery links — **RECONFIRMED DEFERRED**.

## 13. Candidate findings

1. **Standards denormalization fidelity** — selected.
2. `alternative_drill.standard_edition` hardcode — real, narrower, not selected (keeps T16 to one bounded target).
3. `application_notes[].source_tier` unused — inert, not material.

## 14. Risk ranking

Standards denormalization fidelity ranks first on every axis the brief specifies: current live rendering (not hypothetical), high trust severity (designation is the primary user-facing standard identifier), total silent-failure potential (ID-existence check would still pass), proven mutation-testability (identical technique to T13–T15), and a bounded single-file fix. The other two candidates are real but smaller in scope or impact and were set aside to keep the target singular, per the brief's own governance.

## 15. Selected T16 target

**Title:** Standards Denormalized Field Fidelity Verification

**Objective:** Add a check to `validate-tapping-projections.js` that independently re-derives the expected `organization`/`designation`/`edition`/`title`/`verification_state` for every projected standard reference directly from its knowledge-layer record and compares it to the projection's actual values.

**Root risk:** `buildStandardsBlock()` denormalizes 5 fields once at generation time; nothing re-verifies them afterward. A hand-edit, a generator refactor, or data corruption could substitute a wrong-but-plausible value for a still-validly-referenced `standard_id`, and every existing validator — including the one that already inspects this array — would keep passing.

**Not already covered by T13/T14/T15:** those three phases closed `tap_drill.status`, `tap_drill.convention`/`provenance.{source,cross_check}`, and `application_notes[].source` respectively — three distinct, already-named field families. Standards identity is untouched by any of them.

## 16. Implementation contract (not implemented)

**Allowed files:** `scripts/validators/validate-tapping-projections.js` only.

**Forbidden files:** `generate-tapping-projections.js`, both projections, every `data/standards/**/*.json` file (except as a temporary, restored mutation fixture), every product file, the CSV, the client-data file, every other validator, every other knowledge-layer file.

**Validator behavior required:** For every profile row's `standards[]` entry, resolve `knowledge.standardById.get(standard_id)` and compare `organization`/`designation`/`edition`/`title`/`verification_state` (mapped to `standard_status`) field-by-field; fail on any mismatch.

**Pass criteria:** 0 errors on real data (already confirmed 0 mismatches by this discovery); correct failure on a reproduced mismatch; all other validators and every other checksum unaffected.

## 17. Mutation-test contract (not implemented)

Temporarily edit one real standard record (e.g. `iso_2306`'s `designation` or `edition`) in `data/standards/iso/standards.seed.json`, backed up first, **without regenerating the projection**. Expect **FAIL**, identifying the specific `standard_id` and mismatched field. Restore from backup, confirm byte-identical checksum, confirm the validator returns to **PASS**. Determinism: validator run 3× on restored real data, byte-identical report.

## 18. Exact allowed/forbidden files

See Section 16.

## 19. Repository integrity

HEAD before and after this discovery: `23088142300a4d136401d49cf1d8877ee5ca1a76`, matching `origin/main` throughout. Zero tracked files modified. The same 10 pre-existing untracked files remain untouched. All production, data, projection, generator, and validator files confirmed byte-identical — this phase read files only.

## 20. Final discovery status (discovery phase)

Nothing was implemented during discovery. No validator, generator, product, projection, or knowledge-layer file was touched during discovery.

## 21. Implementation (authorized after review)

The discovery above was reviewed and the selected target authorized exactly as proposed, scoped to `scripts/validators/validate-tapping-projections.js` only.

**Validator check implemented:** Check 12, `"Standards Denormalized Fields Match Authoritative Standard Record"`, added immediately after check 11. For every profile row's `standards[]` entry, it resolves `knowledge.standardById.get(standard_id)` and compares `organization`/`designation`/`edition`/`title`/`verification_state` (mapped to the source's `standard_status`) field-by-field, failing on any mismatch with an error naming the profile, designation, standard ID, field, authoritative value, and projected value.

**Real-data pass.** Ran against the real, untouched projection and standards data. **PASS, 0 errors** — all 6 referenced standards agree on all 5 fields across all 29 rows.

**Mutation test.** Temporarily edited the real `data/standards/iso/standards.seed.json` (backed up first), changing `iso_2306`'s `designation` from `"ISO 2306"` to `"ISO 2306-MUTATED-T16"`, **without regenerating the projection**. Ran the validator. **FAIL, 29 errors** — one per tapping profile that lists `iso_2306` among its standards (all three tapping datasets share `iso_2306` in their `source_standards`, so it appears on every one of the 29 rows). Each error correctly identified the profile, designation, standard ID, the specific field (`designation`), and both values, e.g.:
```
tap_m3x0_5_cut (designation M3x0.5) standard 'iso_2306': designation mismatch --
authoritative value is 'ISO 2306-MUTATED-T16', projected value is 'ISO 2306'
```

**Restoration.** Restored `data/standards/iso/standards.seed.json` from the pre-mutation backup, confirmed byte-identical via SHA-256 (`bb92058ec5bf6f99f60e759eeefbaecf55df80b359ce5101d6f712bf510c830e`, matching the pre-mutation baseline exactly). Re-ran the validator. **PASS, 0 errors.**

**All-validator regression.** All 9 tapping validators (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) pass, 0 errors (pre-existing informational warnings unchanged).

**Determinism.** Validator run 3× consecutively on the restored, real data: identical SHA-256 report checksum (`1cd6e2532ce91382580bf67805412dba5edb7b9c64d8f01cdb8d4eebf2797ae9`) every run.

**Checksums.** `data/standards/iso/standards.seed.json`, `data/standards/asme/standards.seed.json`, both T3 projections, all 4 product HTML files, `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`, and `scripts/generators/generate-tapping-projections.js` are all confirmed byte-identical before and after this phase. **No generator was ever run during this phase.**

**Files modified:** `scripts/validators/validate-tapping-projections.js`, plus its own regenerated `docs/architecture/tapping-projection-validation-report.json`/`.md`. Three unrelated timestamp-only report diffs (`validation-report`, `projection-validation-report`, `tapping-validation-report`) produced incidentally by running the full validator suite were reverted via `git checkout --`.

**Files NOT modified:** `scripts/generators/generate-tapping-projections.js`, both T3 projections, all `data/standards/**/*.json` files, every product HTML file, the CSV, `js/tapping-workflow-data.js`, every other validator, every `data/entities/`/`data/datasets/`/`data/relationships/` file. The generator was deliberately left untouched — it already produces correct output; T16 closes only the missing regression guard.

Nothing was committed or pushed (per explicit instruction, awaiting separate approval before commit). T17 was not started.

**T16 STATUS: READY FOR REVIEW.** See `audit/t16-change-scope.md` for the file accounting.
