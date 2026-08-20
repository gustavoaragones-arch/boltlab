# T14 — Change Scope

Baseline: `091887876a483125f6246dd270ce21b432cf7c04` (T13, committed and pushed)

## Discovery phase (read-only)

No production, data, projection, or validator file was created, modified, or deleted. See the original discovery accounting below.

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t14-residual-integrity.md` | T14 discovery narrative + (after review) implementation record |
| `audit/t14-residual-integrity.json` | T14 structured data, discovery + implementation |
| `audit/t14-change-scope.md` | This file |

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 11, "Tap-Drill Convention and Cross-Check Narrative Correctly Derived From Source Cross-Verification" — extends T13's check 10 pattern to the two sibling fields (`tap_drill.convention`, `tap_drill.provenance.source`, `tap_drill.provenance.cross_check`) derived from the same `crossVerified` signal but left out of check 10's scope. Metric rows are checked against the match-aware source derivation; non-metric rows are checked against the fixed `"US customary drill-series"` convention with no cross-verification semantics invented. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T14 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; T13 already established current output is correct, and T14 closes the remaining missing regression guard rather than rewriting working projection logic.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/datasets/metric_tapping.seed.json` — temporarily mutated during the mandatory mutation test, then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`d98712267bd52f49bad35cbf1436c230f2eec1921334515e72d959dc94b6a7df`).
- `data/datasets/unc_tapping.seed.json`, `data/datasets/unf_tapping.seed.json` — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.
- Every `data/entities/`, `data/standards/`, `data/relationships/` file.

### Timestamp-only regenerated reports reverted (not part of T14's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `Generated:` timestamp line.

## Unexpected files

None. Pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T14 and were left untouched throughout, matching every prior phase's convention.

## Git status at end of T14

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t14-change-scope.md
?? audit/t14-residual-integrity.json
?? audit/t14-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `091887876a483125f6246dd270ce21b432cf7c04`, matching `origin/main`. Nothing committed or pushed.
