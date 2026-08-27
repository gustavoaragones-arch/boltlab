# T22 — Change Scope

Baseline HEAD: `0cee9439a893ec7f4f3aee8fd9d065413647e33b` (T21, committed and pushed)

`origin/main`: `0cee9439a893ec7f4f3aee8fd9d065413647e33b` — matches baseline HEAD.

T21 commit: `0cee9439a893ec7f4f3aee8fd9d065413647e33b` — "T21: Verify tap-drill provenance citation against authoritative source" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t22-residual-integrity.md` | T22 discovery narrative |
| `audit/t22-residual-integrity.json` | T22 structured data |
| `audit/t22-change-scope.md` | This file |

### Files read (not modified)

- `scripts/validators/validate-tapping-projections.js` (full, 620 lines, 17 checks)
- `scripts/generators/generate-tapping-projections.js` (full, 320 lines)
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`
- `scripts/generators/generate-tapping-atlas.js`, `generate-tap-type-guide.js`, `generate-tapping-workflow.js`, `generate-tapping-evidence.js`

### Ad-hoc verification runs (read-only)

- One validator run (`node scripts/validators/validate-tapping-projections.js`) to certify all 17 existing checks pass on real data. Regenerated `docs/architecture/tapping-projection-validation-report.{json,md}` with byte-identical content (fixed `generated_at` constant, unchanged underlying data) — confirmed via `git status --short` showing no diff after the run.
- Grep-based tracing of `tap_drill.value`/`.unit` and `alternative_drill.*` references across the validator and all four consumer generators (no data written).
- Two read-only `node -e "..."` invocations: (1) re-derivation of `tap_drill.value`/`.unit` for all 29 rows directly from the three real tapping-dataset source files, compared to the real projection — 0 mismatches across 58 comparisons; (2) re-derivation of `alternative_drill.{value,unit,standard_id,status,meaning,provenance.table,provenance.verified_date}` for all 15 UNC/UNF rows, compared to the real projection — 0 mismatches across 105 comparisons. Both only called `fs.readFileSync`/`JSON.parse`/`console.log` — no file was written.
- One additional read-only re-derivation of `data_quality.last_reviewed` against each dataset's own `last_reviewed` field (considered as a secondary candidate, not selected) — 0 mismatches across 29 rows.

## Selected finding (not implemented)

**Tap-Drill and ISO-Alternative Direct Value Fidelity** — `tapping-profiles.json rows[].tap_drill.{value,unit}` and `rows[].alternative_drill.{value,unit,standard_id,status,meaning,provenance.table,provenance.verified_date}` are copied directly from the source tapping-dataset records' `hole_preparation.{value,unit}` and `iso_2306_alternative_drill.*` respectively, with zero independent verification against that source anywhere in the validator suite — the last unguarded direct-copy seam in the tap-drill domain after T13/T14/T19/T21 closed everything adjacent to it. See `audit/t22-residual-integrity.md` for the full contract.

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 18, "Tap-Drill and ISO-Alternative Direct Value Fields Match Authoritative Tapping-Dataset Record" — for every profile row, reuses the existing `sourceRecordById` map (built for checks 10/11/13/16/17), compares `sourceRecord.hole_preparation.value`/`.unit` against `row.tap_drill.value`/`.unit`, and (when `sourceRecord.iso_2306_alternative_drill` exists) compares its seven fields against the corresponding `row.alternative_drill` fields. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T22 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T22 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/datasets/metric_tapping.seed.json` — temporarily mutated during the first proof step (`hole_preparation.value` for `tap_m3x0_5_cut` changed from `2.5` to `2.6`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`) and via `git diff --stat` showing zero diff from HEAD.
- `data/datasets/unc_tapping.seed.json` — temporarily mutated during the second proof step (`iso_2306_alternative_drill.value` for `tap_1_4_20_unc_cut` changed from `5.1` to `5.2`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`c67ebdbbbf02466de915df73cb8eb75b881f0e58c587a189cfbddcca53e0bb7e`) and via `git diff --stat` showing zero diff from HEAD.
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every `data/standards/` file — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `tools/tap-drill-calculator.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.

### Extra proof step: pre-T22 baseline against both mutations

Per the review's explicit requirement to independently demonstrate the existing 17 checks stay green before check 18 exists, the check-18 addition was temporarily set aside via `git stash push -- scripts/validators/validate-tapping-projections.js` (restoring the exact pre-T22, 17-check file), run against each mutation in turn, confirmed **PASS, 0 errors** each time (proving the gap for both the primary and ISO-alternative halves), then restored via `git stash pop` before re-running with check 18 present.

### Timestamp-only regenerated reports reverted (not part of T22's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `generated_at`/`Generated:` timestamp line.

## Unexpected files

None. The same pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T22 and were left untouched throughout.

## Whether production files were modified

**NO.**

## Whether knowledge files were modified

**NO** (temporarily mutated twice as explicitly-authorized test fixtures, then restored byte-for-byte each time).

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

## Git status at end of T22 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t22-change-scope.md
?? audit/t22-residual-integrity.json
?? audit/t22-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `0cee9439a893ec7f4f3aee8fd9d065413647e33b`, matching `origin/main`. Nothing committed or pushed. T23 not started.
