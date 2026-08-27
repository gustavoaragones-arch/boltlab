# T20 — Change Scope

Baseline HEAD: `0059490aa78f5044f4371decc7fada92625ea662` (T19, committed and pushed)

`origin/main`: `0059490aa78f5044f4371decc7fada92625ea662` — matches baseline HEAD.

T19 commit: `0059490aa78f5044f4371decc7fada92625ea662` — "T19: Verify tap-drill value provenance chain against authoritative source" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t20-residual-integrity.md` | T20 discovery narrative |
| `audit/t20-residual-integrity.json` | T20 structured data |
| `audit/t20-change-scope.md` | This file |

### Files read (not modified)

- `scripts/validators/validate-tapping-projections.js` (full, 546 lines, 15 checks)
- `scripts/generators/generate-tapping-projections.js` (full, 320 lines)
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`
- `scripts/generators/generate-tapping-atlas.js`, `generate-tap-type-guide.js`, `generate-tapping-workflow.js`, `generate-tapping-evidence.js`
- `js/tapping-workflow-data.js` (excerpt)

### Ad-hoc verification runs (read-only)

- One validator run (`node scripts/validators/validate-tapping-projections.js`) to certify all 15 existing checks pass on real data. Regenerated `docs/architecture/tapping-projection-validation-report.{json,md}` with byte-identical content (fixed `generated_at` constant, unchanged underlying data) — confirmed via `git status --short` showing no diff after the run.
- Three read-only `node -e "..."` invocations: (1) designation-collision check across all three thread datasets, (2) `thread_system` → `tap_drill.provenance.source_dataset` consistency check against the real projection, (3) re-derivation of `data_quality.record_status` for all 29 rows directly from the three real tapping-dataset source files, compared to the real projection. All three only called `fs.readFileSync`/`JSON.parse`/`console.log` — no file was written. Result of (3): 0 mismatches across 29 rows.

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 16, "Data-Quality Record-Status Matches Authoritative Tapping-Dataset Record" — for every profile row, reuses the existing `sourceRecordById` map (built for checks 10/11/13), resolves the authoritative tapping-dataset record by `tapping_profile_id`, and compares `sourceRecord.status` against `row.data_quality.record_status`. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T20 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T20 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/datasets/metric_tapping.seed.json` — temporarily mutated during the mandatory mutation test (`tap_m3x0_5_cut.status` changed from `"source_bound"` to `"verified"`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`) and via `git diff --stat` showing zero diff from HEAD.
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every `data/standards/` file — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `tools/tap-drill-calculator.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.

### Timestamp-only regenerated reports reverted (not part of T20's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `generated_at`/`Generated:` timestamp line.

## Unexpected files

None. The same pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T20 and were left untouched throughout.

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

## Git status at end of T20 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t20-change-scope.md
?? audit/t20-residual-integrity.json
?? audit/t20-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `0059490aa78f5044f4371decc7fada92625ea662`, matching `origin/main`. Nothing committed or pushed. T21 not started.
