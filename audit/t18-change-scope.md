# T18 — Change Scope

Baseline HEAD: `859c7aec8da42d58362af60546feb8611aaf3df4` (T17, committed and pushed)

`origin/main`: `859c7aec8da42d58362af60546feb8611aaf3df4` — matches baseline HEAD.

T17 commit: `859c7aec8da42d58362af60546feb8611aaf3df4` — "T17: Verify tap-type relationship membership in tapping projections" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t18-residual-integrity.md` | T18 discovery narrative |
| `audit/t18-residual-integrity.json` | T18 structured data |
| `audit/t18-change-scope.md` | This file |

### Files read (not modified)

- `scripts/validators/validate-tapping-projections.js` (full, 466 lines)
- `scripts/generators/generate-tapping-projections.js` (full, 320 lines)
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`
- `data/entities/entities.seed.json`
- `scripts/generators/generate-tapping-atlas.js`, `generate-tap-type-guide.js`, `generate-tapping-workflow.js`, `generate-tapping-evidence.js`
- `js/tapping-workflow-data.js` (excerpt), `tools/tap-drill-calculator.html` (script-tag section)
- `scripts/validators/validate-tapping-domain.js`, `validate-tapping-terminology.js`, `validate-projections.js`, `validate-knowledge-engine.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js` (grepped for thread-field coverage)
- `audit/t17-residual-integrity.md`, `audit/t17-change-scope.md` (for baseline/format reference)

### Ad-hoc verification run

One read-only `node -e "..."` invocation re-derived `thread.{designation,nominal_diameter,nominal_diameter_unit,pitch,pitch_unit,threads_per_inch,coarse_fine,standard_family}` for all 29 profile rows directly from the real thread dataset files and compared to the real projection. It only called `fs.readFileSync` and `console.log` — no file was written. Result: 0 mismatches across 232 comparisons.

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 14, "Thread Block Engineering Values Match Authoritative Thread Dataset Record" — for every profile row, resolves the thread-system-appropriate dataset (`metric_threads`/`unc_threads`/`unf_threads` via `knowledge.datasetById`), finds the base record by `designation === row.thread.designation`, independently re-derives `designation`/`nominal_diameter`/`pitch`/`threads_per_inch`/`coarse_fine`/`standard_family` with the same metric/inch unit-routing `buildThreadBlock()` uses, and compares each field individually against the projection's actual value. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T18 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T18 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/datasets/metric_threads.seed.json` — temporarily mutated during the mandatory mutation test (`pitch_mm` on `M10x1.25` changed from `1.25` to `1.5`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`122b73e7f541fb16cd1e8d8d60dae91528a9e56ffe21863bd727dc50f4393c2c`) and via `git diff --stat` showing zero diff from HEAD.
- `data/datasets/unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every `data/standards/` file — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `tools/tap-drill-calculator.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.

### Timestamp-only regenerated reports reverted (not part of T18's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `generated_at`/`Generated:` timestamp line.

## Unexpected files

None. The same pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T18 and were left untouched throughout.

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

## Git status at end of T18 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t18-change-scope.md
?? audit/t18-residual-integrity.json
?? audit/t18-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `859c7aec8da42d58362af60546feb8611aaf3df4`, matching `origin/main`. Nothing committed or pushed. T19 not started.
