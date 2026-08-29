# T24 — Change Scope

Baseline HEAD: `688d91f31d271a2041dbcf8880026cffc9a9af4b` (T23, committed and pushed)

`origin/main`: `688d91f31d271a2041dbcf8880026cffc9a9af4b` — matches baseline HEAD.

T23 commit: `688d91f31d271a2041dbcf8880026cffc9a9af4b` — "T23: Verify tap-type evidence-status counts against authoritative source" — confirmed present in `git log` at HEAD.

## Discovery phase (read-only)

### Files created during discovery (3)

| File | Reason |
|---|---|
| `audit/t24-residual-integrity.md` | T24 discovery narrative |
| `audit/t24-residual-integrity.json` | T24 structured data |
| `audit/t24-change-scope.md` | This file |

### Files read (not modified)

- `scripts/validators/validate-tapping-projections.js` (full, 19 checks)
- `scripts/generators/generate-tapping-projections.js` (full, 320 lines)
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`
- `data/entities/entities.seed.json`
- `scripts/generators/generate-tap-type-guide.js`, `generate-tapping-atlas.js`, `generate-tapping-workflow.js`
- `js/tapping-workflow-data.js` (grep only)

### Ad-hoc verification runs (read-only)

- One validator run (`node scripts/validators/validate-tapping-projections.js`) to certify all 19 existing checks pass on real data. Report checksums (JSON and MD) before and after the run were identical to the checksums recorded at the end of T23's implementation — no restoration was needed since the run produced no rewrite.
- Grep-based tracing of `.title`/`.definition`/`taxonomy_axis` references across the full validator and consumer generators (no data written).
- Two read-only `node -e "..."` invocations: (1) fresh re-derivation of `title`/`.definition` for all 7 tap types directly from `entities.seed.json`, compared to the real projection — 0 mismatches across 14 comparisons; (2) confirmation that `taxonomy_axis` is `null` for all 7 tap-type entities. Both only called `fs.readFileSync`/`JSON.parse`/`console.log` — no file was written.

## Selected finding (not implemented)

**Tap-Type Title and Definition Source-Fidelity** — `tap-types.json rows[].title` and `.definition` are copied directly from `entities.seed.json`'s tap-type entities with zero independent verification against that source anywhere in the validator suite — the last genuinely uncovered field family in either tapping projection file. Rendered as the primary heading and definition text on the Tap-Type Guide and Atlas pages, and as tap-type labels on the Workflow page via the client-data JS. See `audit/t24-residual-integrity.md` for the full contract.

## Implementation phase (authorized after review)

### Files modified (3)

| File | Change |
|---|---|
| `scripts/validators/validate-tapping-projections.js` | Added check 20, "Tap-Type Title and Definition Match Authoritative Entity Record" — for every tap-type row, reuses the existing `tapTypeEntitiesById` map (built for check 9), compares `entity.title`/`.definition` against `row.title`/`.definition`. |
| `docs/architecture/tapping-projection-validation-report.json` | Regenerated validator output reflecting the new check (legitimate T24 output) |
| `docs/architecture/tapping-projection-validation-report.md` | Same, markdown form |

### Mutation-test methodology

Per T24's discovery document, this risk was pre-evaluated before proposing the contract (learning from T23's experience where a source mutation was unexpectedly caught by an unrelated existing check): `title`/`.definition` are read by zero existing checks under any circumstance, confirmed by a complete absence of `.title`/`.definition` references in `validate-tapping-projections.js`. The source-side mutation therefore behaved exactly as predicted — no correction to the audit record was needed this time.

### Files explicitly NOT modified

- `scripts/generators/generate-tapping-projections.js` — deliberately left untouched; current output is already correct, and T24 closes only the missing regression guard.
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no generator was ever run during this phase.
- `data/entities/entities.seed.json` — temporarily mutated during the mandatory mutation test (`bottoming_tap.definition` had a `[T24-MUTATION-TEST-MARKER]` suffix appended), then restored from a pre-mutation backup and confirmed byte-identical via SHA-256 (`0de67516d3e539425d7aa18a4bc4ba3499556d6259441a1f9c00b8e92fbc66b2`) and via `git diff --stat` showing zero diff from HEAD.
- `data/relationships/relationships.seed.json`, every dataset file, every `data/standards/` file — untouched throughout.
- Every product HTML file (`reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `tools/tap-drill-calculator.html`), `downloads/tapping-atlas.csv`, `js/tapping-workflow-data.js`.
- Every other validator (`validate-knowledge-engine.js`, `validate-tapping-domain.js`, `validate-projections.js`, `validate-tapping-atlas.js`, `validate-tap-type-guide.js`, `validate-tapping-workflow.js`, `validate-tapping-evidence.js`, `validate-tapping-terminology.js`) — run to confirm continued pass, not modified. `validate-tapping-atlas.js` and `validate-tap-type-guide.js` both read `title` for their own HTML-matching checks; both confirmed unaffected.

### Timestamp-only regenerated reports reverted (not part of T24's real diff)

`docs/architecture/validation-report.json/.md`, `docs/architecture/projection-validation-report.json/.md`, `docs/architecture/tapping-validation-report.json/.md` were regenerated incidentally while running the full validator suite and reverted via `git checkout --` after confirming their only diff was the `generated_at`/`Generated:` timestamp line.

## Unexpected files

None. The same pre-existing untracked D2-phase/`.DS_Store`/`.claude`/`images/logo.ai` files predate T24 and were left untouched throughout.

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

## Git status at end of T24 implementation

```
 M docs/architecture/tapping-projection-validation-report.json
 M docs/architecture/tapping-projection-validation-report.md
 M scripts/validators/validate-tapping-projections.js
?? .DS_Store
?? .claude/
?? audit/d2-0-adsense-readiness.json
?? audit/d2-0-adsense-readiness.md
?? audit/d2-0-change-scope.md
?? audit/t24-change-scope.md
?? audit/t24-residual-integrity.json
?? audit/t24-residual-integrity.md
?? css/.DS_Store
?? images/.DS_Store
?? images/heads/.DS_Store
?? images/logo.ai
?? images/screw-drive-types/.DS_Store
?? images/screw-head-types/.DS_Store
```

HEAD unchanged throughout: `688d91f31d271a2041dbcf8880026cffc9a9af4b`, matching `origin/main`. Nothing committed or pushed. T25 not started.
