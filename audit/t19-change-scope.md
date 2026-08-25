# T19 — Change Scope

Baseline HEAD: `3c27e422ec99d49988d618f9d95e8199bc9e2367` (T18, committed and pushed)

`origin/main`: `3c27e422ec99d49988d618f9d95e8199bc9e2367` — matches baseline HEAD.

T18 commit: `3c27e422ec99d49988d618f9d95e8199bc9e2367` — "T18: Verify thread block engineering values against authoritative datasets" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t19-residual-integrity.md` | T19 discovery narrative |
| `audit/t19-residual-integrity.json` | T19 structured data |
| `audit/t19-change-scope.md` | This file |

### Files read (not modified)

- `scripts/validators/validate-tapping-projections.js` (full, 14 checks)
- `scripts/generators/generate-tapping-projections.js` (full)
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `data/datasets/metric_threads.seed.json`, `unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`
- `scripts/validators/validate-tapping-domain.js` (full read of provenance-related checks)
- `scripts/validators/validate-tapping-terminology.js` (excerpt — check 8 provenance-consumer-fidelity logic)
- `scripts/generators/generate-tapping-atlas.js`, `generate-tapping-workflow.js`, `generate-tapping-evidence.js`, `generate-tap-type-guide.js` (grepped for `tap_drill.value`/`.unit` usage)
- Repo-wide grep for `source_field` across `scripts/validators/*.js`
- `audit/t18-residual-integrity.md`, `audit/t18-change-scope.md` (for baseline/format reference)

### Ad-hoc verification runs (read-only)

Two `node -e "..."` invocations: one re-derived `hole_preparation.value` for all 29 tapping-dataset records against the thread-dataset field named by each record's own `source_dataset`/`source_record`/`source_field` pointer, confirming 0 mismatches and consistent `(unit, source_field)` pairing; one scanned all three thread-dataset files for duplicate `designation` keys (0 found). Both only called `fs.readFileSync`/`console.log` — no file was written.

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 15, "Tap-Drill Value Provenance Chain Resolves To The Authoritative Source Field" — for every profile row, dereferences `tap_drill.provenance.{source_dataset,source_record,source_field}` via `knowledge.datasetById` and a designation match, compares the resolved value to `tap_drill.value`, and asserts the `(unit, source_field)` pairing is one of the two valid combinations (`mm`↔`tap_drill_mm`, `in`↔`tap_drill_in`). |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T19 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T19 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/datasets/metric_threads.seed.json` — temporarily mutated during the mandatory mutation test (`tap_drill_mm` on `M3x0.5` changed from `2.5` to `2.6`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`122b73e7f541fb16cd1e8d8d60dae91528a9e56ffe21863bd727dc50f4393c2c`) and via `git diff --stat` showing zero diff from HEAD.
- `data/datasets/unc.seed.json`, `unf.seed.json`, `metric_tapping.seed.json`, `unc_tapping.seed.json`, `unf_tapping.seed.json`, `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`, every `data/standards/` file — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `tools/tap-drill-calculator.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.

### Timestamp-only regenerated reports reverted (not part of T19's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `generated_at`/`Generated:` timestamp line.

## Unexpected files

None. The same pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T19 and were left untouched throughout.

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

## Git status at end of T19 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t19-change-scope.md
?? audit/t19-residual-integrity.json
?? audit/t19-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `3c27e422ec99d49988d618f9d95e8199bc9e2367`, matching `origin/main`. Nothing committed or pushed. T20 not started.
