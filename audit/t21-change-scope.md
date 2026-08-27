# T21 — Change Scope

Baseline HEAD: `f71f92085ca56cfc061967b203248e6bd855c770` (T20, committed and pushed)

`origin/main`: `f71f92085ca56cfc061967b203248e6bd855c770` — matches baseline HEAD.

T20 commit: `f71f92085ca56cfc061967b203248e6bd855c770` — "T20: Verify data-quality record status against authoritative tapping dataset" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t21-residual-integrity.md` | T21 discovery narrative |
| `audit/t21-residual-integrity.json` | T21 structured data |
| `audit/t21-change-scope.md` | This file |

### Files read (not modified)

- `scripts/validators/validate-tapping-projections.js` (full, 582 lines, 16 checks)
- `scripts/generators/generate-tapping-projections.js` (full, 320 lines)
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`
- `scripts/generators/generate-tapping-atlas.js`, `generate-tap-type-guide.js`, `generate-tapping-workflow.js`, `generate-tapping-evidence.js`
- `js/tapping-workflow-data.js` (excerpt)

### Ad-hoc verification runs (read-only)

- One validator run (`node scripts/validators/validate-tapping-projections.js`) to certify all 16 existing checks pass on real data. Regenerated `docs/architecture/tapping-projection-validation-report.{json,md}` with byte-identical content (fixed `generated_at` constant, unchanged underlying data) — confirmed via `git status --short` showing no diff after the run.
- Grep-based tracing of every provenance/citation field reference across the validator and all four consumer generators (no data written).
- One read-only `node -e "..."` invocation: re-derivation of `tap_drill.provenance.{source_dataset,source_record,source_field}` for all 29 rows directly from the three real tapping-dataset source files, compared to the real projection. Only called `fs.readFileSync`/`JSON.parse`/`console.log` — no file was written. Result: 0 mismatches across 87 comparisons (29 rows × 3 fields).

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 17, "Tap-Drill Provenance Citation Matches Authoritative Tapping-Dataset Record" — for every profile row, reuses the existing `sourceRecordById` map (built for checks 10/11/13/16), compares `sourceRecord.hole_preparation.source_dataset`/`.source_record`/`.source_field` individually against `row.tap_drill.provenance.source_dataset`/`.source_record`/`.source_field`. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T21 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T21 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/datasets/metric_tapping.seed.json` — temporarily mutated twice during the mandatory proof sequence (`hole_preparation.source_record` for `tap_m3x0_5_cut` changed from `"M3x0.5"` to `"M4x0.7"`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`) and via `git diff --stat` showing zero diff from HEAD.
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every `data/standards/` file — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `tools/tap-drill-calculator.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.

### Extra proof step: pre-T21 baseline against the mutation

Per the review's explicit requirement to demonstrate the existing 16 checks stay green before check 17 exists, the check-17 addition was temporarily set aside via `git stash push -- scripts/validators/validate-tapping-projections.js` (restoring the exact pre-T21, 16-check file), run against the mutated `metric_tapping.seed.json`, confirmed **PASS, 0 errors** (proving the gap), then restored via `git stash pop` before re-running with check 17 present.

### Timestamp-only regenerated reports reverted (not part of T21's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `generated_at`/`Generated:` timestamp line.

## Unexpected files

None. The same pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T21 and were left untouched throughout.

## Whether production files were modified

**NO.**

## Whether knowledge files were modified

**NO** (temporarily mutated as an explicitly-authorized test fixture, then restored byte-for-byte).

## Whether projection files were modified

**NO.**

## Whether generator files were modified

**NO.**

## Whether validator files were modified

**YES** — `scripts/validators/validate-tapping-projections.js` only, exactly as authorized.

## Whether anything was committed

**NO** — awaiting explicit approval per instruction.

## Whether anything was pushed

**NO.**

## Git status at end of T21 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t21-change-scope.md
?? audit/t21-residual-integrity.json
?? audit/t21-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `f71f92085ca56cfc061967b203248e6bd855c770`, matching `origin/main`. Nothing committed or pushed. T22 not started.
