# T15 — Change Scope

Baseline HEAD: `98079466a7ff03e4084061ade1c7d909692c20e5` (T14, committed and pushed)

HEAD matches `origin/main`: **yes**, confirmed at the start of this discovery and unchanged throughout implementation.

## Discovery phase (read-only)

No production, data, projection, generator, or validator file was created, modified, or deleted. See the original discovery accounting below.

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t15-residual-integrity.md` | T15 discovery narrative + (after review) implementation record |
| `audit/t15-residual-integrity.json` | T15 structured data, discovery + implementation |
| `audit/t15-change-scope.md` | This file |

## Implementation phase (authorized after review)

### Files modified (1)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Extended check 9 ("Application-Note Completeness") with an `else if (projected[0].source !== note.source)` branch after the existing status comparison — verifies what the check's own comment already claimed: that each tap-type application note's `source` field is preserved unchanged between `entities.seed.json` and `tap-types.json`. |

`docs/architecture/tapping-projection-validation-report.json`/`.md` were regenerated during testing but ended up byte-identical to what was already committed in T14 (T14's committed report already reflected a full pass with the same check list/order/results; T15's new branch produces the same pass output on real, unmutated data). Nothing to stage for these files.

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — untouched; this closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/entities/entities.seed.json` — temporarily mutated during the mandatory mutation test (Test 2), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`0de67516d3e539425d7aa18a4bc4ba3499556d6259441a1f9c00b8e92fbc66b2`).
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.
- Every other `data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/` file.

### Timestamp-only regenerated reports reverted (not part of T15's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `Generated:` timestamp line.

## Unexpected files

None. Pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T15 and were left untouched throughout, matching every prior phase's convention.

## Whether any production/data/projection/generator/validator file changed

Only `scripts/validators/validate-tapping-projections.js` (intentional). All data, projection, generator, and product files are confirmed byte-identical before and after.

## Whether anything was committed

**No.**

## Whether anything was pushed

**No.**

## Git status at end of T15 implementation

```
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t15-change-scope.md
?? audit/t15-residual-integrity.json
?? audit/t15-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `98079466a7ff03e4084061ade1c7d909692c20e5`, matching `origin/main`. Nothing committed or pushed.
