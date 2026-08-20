# T16 — Change Scope

Baseline HEAD: `23088142300a4d136401d49cf1d8877ee5ca1a76` (T15, committed and pushed)

`origin/main`: `23088142300a4d136401d49cf1d8877ee5ca1a76` — matches baseline HEAD.

T15 commit: `23088142300a4d136401d49cf1d8877ee5ca1a76` — "T15: Verify tap-type fact sources in projection" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

No production, data, projection, generator, or validator file was created, modified, or deleted. See the original discovery accounting below.

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t16-residual-integrity.md` | T16 discovery narrative + (after review) implementation record |
| `audit/t16-residual-integrity.json` | T16 structured data, discovery + implementation |
| `audit/t16-change-scope.md` | This file |

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 12, "Standards Denormalized Fields Match Authoritative Standard Record" — for every profile's `standards[]` entry, resolves the authoritative record via `knowledge.standardById` and compares `organization`/`designation`/`edition`/`title`/`verification_state` field-by-field, failing on mismatch with the specific profile/standard/field/values identified. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T16 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; it already produces correct output, and T16 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/standards/iso/standards.seed.json` — temporarily mutated during the mandatory mutation test (`iso_2306`'s `designation`), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`bb92058ec5bf6f99f60e759eeefbaecf55df80b359ce5101d6f712bf510c830e`).
- Every other `data/standards/**/*.json` file (asme, ansi, other, jis, din, bs) — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified.
- Every `data/entities/`, `data/datasets/`, `data/relationships/` file.

### Timestamp-only regenerated reports reverted (not part of T16's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `Generated:` timestamp line.

## Unexpected files

None. Pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T16 and were left untouched throughout, matching every prior phase's convention.

## Whether production files were modified

**NO** (only the validator, which is not a production/product file).

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

## Git status at end of T16 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t16-change-scope.md
?? audit/t16-residual-integrity.json
?? audit/t16-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `23088142300a4d136401d49cf1d8877ee5ca1a76`, matching `origin/main`. Nothing committed or pushed.
