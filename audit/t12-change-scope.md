# T12 — Change Scope

Baseline: `babd369c96aed1c8082c5188f838ec56f41cf325` (T11, committed and pushed)

## Files created (4)

| File | Reason |
|---|---|
| `audit/t12-atlas-script-hardening.md` | T12 audit narrative |
| `audit/t12-atlas-script-hardening.json` | T12 structured audit data |
| `audit/t12-change-scope.md` | This file |
| `docs/architecture/t12-atlas-script-hardening.md` | Architecture-level documentation of the hardening |

## Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-atlas.js` | Added check #13, "Inline Script Is Valid JavaScript (node --check)" — extracts Atlas's bare `<script>` block via `/<script>([\s\S]*?)<\/script>/g` (structurally excludes JSON-LD and external-`src` script tags), parses it with `new Function(...)`, fails on `SyntaxError` or on zero/multiple/ambiguous matches. Identical mechanism to the pre-existing checks in `validate-tapping-workflow.js` and `validate-tapping-evidence.js`. |
| `docs/architecture/tapping-atlas-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T12 output, not a stray artifact) |
| `docs/architecture/tapping-atlas-validation-report.md` | Same, markdown form |

## Files explicitly NOT modified

- `scripts/generators/generate-tapping-atlas.js` — no product-behavior change was needed; this is a validator-only addition. (Temporarily mutated during the mandatory mutation test, then restored from backup and confirmed byte-identical to the pre-mutation checksum — see Section 5/6 of `audit/t12-atlas-script-hardening.md`.)
- `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`
- Every `data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/` file
- `sitemap.xml`
- `package.json` / any dependency manifest — no new dependency was added

## Timestamp-only regenerated reports reverted (not part of T12's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite (Section 7 of the phase brief) and reverted via `git checkout --` after confirming their only diff was the `Generated:` timestamp line — consistent with the phase brief's "do not retain timestamp-only generated report differences" instruction.

## Unexpected files

None from this phase's own work. See `audit/t12-atlas-script-hardening.md` Section 13 for the one flagged (and independently verified benign) harness system-reminder mid-session. Pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T12 and were left untouched, matching every prior phase's convention.

## Git status at end of T12

```
 M docs/architecture/tapping-atlas-validation-report.json
 M docs/architecture/tapping-atlas-validation-report.md
 M scripts/validators/validate-tapping-atlas.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

(Plus the 4 new `audit/t12-*` / `docs/architecture/t12-*` files themselves, once added, will also appear as untracked until staged.)

Nothing committed or pushed.
