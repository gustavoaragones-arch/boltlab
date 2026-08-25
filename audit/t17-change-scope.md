# T17 — Change Scope

Baseline HEAD: `45653e90b277cccdbf3979ea0e73770fbca59dd7` (T16, committed and pushed)

`origin/main`: `45653e90b277cccdbf3979ea0e73770fbca59dd7` — matches baseline HEAD.

T16 commit: `45653e90b277cccdbf3979ea0e73770fbca59dd7` — "T16: Verify denormalized standard fields in tapping projections" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

No production, data, projection, generator, or validator file was created, modified, or deleted. See the original discovery accounting below.

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t17-residual-integrity.md` | T17 discovery narrative + (after review) implementation record |
| `audit/t17-residual-integrity.json` | T17 structured data, discovery + implementation |
| `audit/t17-change-scope.md` | This file |

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 13, "Tap-Type Relationship Membership Matches Authoritative RELATES_TO Graph" — for every profile, resolves its operation from the source dataset record, independently re-derives the expected `tap_types[]` set from `relationships.seed.json`'s `RELATES_TO` edges, and compares the full sorted set (missing vs. unexpected) against the projection's actual array. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T17 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T17 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/relationships/relationships.seed.json` — temporarily mutated during the mandatory mutation test (removed `rel_cut_tapping_relates_taper_tap`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`1fb66e4a74c8282f285b8451fd01fc0fc1070079ff667fdc211b7919ae3d15fb`).
- `data/entities/entities.seed.json` — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.
- Every `data/datasets/`, `data/standards/` file.

### Timestamp-only regenerated reports reverted (not part of T17's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `Generated:` timestamp line.

## Unexpected files

None. Pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T17 and were left untouched throughout, matching every prior phase's convention.

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

## Git status at end of T17 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t17-change-scope.md
?? audit/t17-residual-integrity.json
?? audit/t17-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `45653e90b277cccdbf3979ea0e73770fbca59dd7`, matching `origin/main`. Nothing committed or pushed.
