# T23 — Change Scope

Baseline HEAD: `33136db03bed0f98982fc74c715ab0a4ab00778f` (T22, committed and pushed)

`origin/main`: `33136db03bed0f98982fc74c715ab0a4ab00778f` — matches baseline HEAD.

T22 commit: `33136db03bed0f98982fc74c715ab0a4ab00778f` — "T22: Verify tap-drill and ISO-alternative values against source" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t23-residual-integrity.md` | T23 discovery narrative |
| `audit/t23-residual-integrity.json` | T23 structured data |
| `audit/t23-change-scope.md` | This file |

### Files read (not modified)

- `scripts/validators/validate-tapping-projections.js` (full, 702 lines, 18 checks)
- `scripts/generators/generate-tapping-projections.js` (full, 320 lines)
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `data/entities/entities.seed.json`
- `scripts/validators/validate-tap-type-guide.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`, `validate-tapping-atlas.js`
- `scripts/generators/generate-tap-type-guide.js`, `generate-tapping-evidence.js`, `generate-tapping-atlas.js`

### Ad-hoc verification runs (read-only)

- One validator run (`node scripts/validators/validate-tapping-projections.js`) to certify all 18 existing checks pass on real data. The report checksum before and after the run was identical (`6716899a66914958fe1971dd17c3c03f32c5e575a38f226deffa081cf514f0ec`, matching the checksum recorded at the end of T22's implementation) — no restoration was needed since the run produced no rewrite.
- Grep-based tracing of `evidence_status`, `title`, `.definition`, `.taxonomy_axis`, and `source_dataset_versions` references across the validator suite and consumer generators (no data written).
- Two read-only `node -e "..."` invocations: (1) re-derivation of `evidence_status.verified_fact_count`/`.source_bound_fact_count` for all 7 tap types directly from `entities.seed.json`'s `application_notes`, compared to the real projection — 0 mismatches across 14 comparisons; (2) re-derivation of `title`/`.definition`/`.taxonomy_axis` for all 7 tap types, compared to the real projection (considered as a secondary candidate, not selected) — 0 mismatches across 21 comparisons. Both only called `fs.readFileSync`/`JSON.parse`/`console.log` — no file was written.

## Selected finding (not implemented)

**Tap-Type Evidence-Status Aggregate Fidelity** — `tap-types.json rows[].evidence_status.{verified_fact_count, source_bound_fact_count}` are computed as a separate status-keyed filter over `entity.application_notes` in the generator, never independently re-derived and compared to source by any check. Three downstream consumer validators (`validate-tap-type-guide.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) all treat these values as ground truth. Rendered as literal "N verified / M source-bound" text on the Tap-Type Guide and as an aggregate scoreboard on the Evidence page. See `audit/t23-residual-integrity.md` for the full contract.

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 19, "Tap-Type Evidence-Status Counts Match Authoritative Application-Note Statuses" — for every tap-type row, reuses the existing `tapTypeEntitiesById` map (built for check 9), independently recounts `application_notes` by status, compares to `row.evidence_status.verified_fact_count`/`.source_bound_fact_count`. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T23 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Mutation-test methodology correction (mid-implementation)

The originally proposed mutation (edit one `application_notes[].status` in `entities.seed.json`, unregenerated) was run first, as approved. Contrary to the discovery document's prediction, the pre-T23 18-check validator **correctly FAILED** on it — caught by pre-existing check 9's classification-array per-fact status comparison, not by anything reading `evidence_status`. This was reported to the reviewer, who confirmed the underlying finding remains valid (check 9 protects a structurally different field, the classification arrays, not `evidence_status` itself) and approved a revised, isolating mutation: a direct edit to `data/projections/tapping/tap-types.json`'s `evidence_status.verified_fact_count` field itself, leaving `entities.seed.json` and the classification arrays untouched. That revised mutation correctly PASSED under the pre-T23 validator and correctly FAILED once check 19 was restored. Both `t23-residual-integrity.md` and `.json` were updated to record this correction accurately rather than presenting the originally predicted (and disproven) result as if it had occurred.

### Files explicitly NOT modified (permanently)

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T23 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase. `tap-types.json` was temporarily mutated once as the revised, approved mutation-test fixture (`bottoming_tap.evidence_status.verified_fact_count` changed from `1` to `2`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`63867da5f7f4a9eb5935b418bfc306ec143bf686f0269bb0689c6325ef480305`) and via `git diff --stat` showing zero diff from HEAD.
- `data/entities/entities.seed.json` — temporarily mutated once as the original (superseded) mutation-test fixture (`bottoming_tap`'s one `verified` fact changed to `source_bound`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`0de67516d3e539425d7aa18a4bc4ba3499556d6259441a1f9c00b8e92fbc66b2`) and via `git diff --stat` showing zero diff from HEAD.
- `data/relationships/relationships.seed.json`, every dataset file, every `data/standards/` file — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `tools/tap-drill-calculator.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.

### Timestamp-only regenerated reports reverted (not part of T23's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `generated_at`/`Generated:` timestamp line.

## Unexpected files

None. The same pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T23 and were left untouched throughout.

## Whether production files were modified

**NO.**

## Whether knowledge files were modified

**NO** (temporarily mutated once as an explicitly-authorized, later-superseded test fixture, then restored byte-for-byte).

## Whether projection files were modified

**NO** (temporarily mutated once as the approved test fixture, then restored byte-for-byte).

## Whether generator files were modified

**NO.**

## Whether validator files were modified

**YES** — `scripts/validators/validate-tapping-projections.js` only, exactly as authorized.

## Whether anything was committed

**NO** — awaiting explicit approval per instruction.

## Whether anything was pushed

**NO.**

## Git status at end of T23 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t23-change-scope.md
?? audit/t23-residual-integrity.json
?? audit/t23-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `33136db03bed0f98982fc74c715ab0a4ab00778f`, matching `origin/main`. Nothing committed or pushed. T24 not started.
