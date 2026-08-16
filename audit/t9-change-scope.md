# T9 — Change Control

Date: 2026-08-16

## Baseline (before T9)

```
HEAD                  →  c13e541b30254e1cb634bd1d473122641f650f51 (T8, approved and pushed)
Working tree           →  clean except the 3 pre-existing untouched D2.0/local-machine files
```

## Baseline Checksums (recorded before any change)

| File | SHA-256 |
|---|---|
| `data/projections/tapping/tapping-profiles.json` | `f9739e1d1f8d214b9eb06e4396c9bd1c44c1765c72e644bd0f40bfb1eddf3060` |
| `data/projections/tapping/tap-types.json` | `63867da5f7f4a9eb5935b418bfc306ec143bf686f0269bb0689c6325ef480305` |
| `tools/tapping-workflow.html` | `9f2f1022d9a26aa8cbf989263f45029ad85c6138397c0c7ace921dece7c51a86` |
| `js/tapping-workflow-data.js` | `d0907160b00b868e08b0da95347e1d736809697243849327a9b8dcda91ba3421` |
| `reference/tapping-atlas.html` | `17200beaad0c8ebb7482d89e90e4c2fed2520deabe986571bb46654a793bb583` |
| `reference/tap-type-guide.html` | `10da2fc26dfef18703bf443c175f18831242e68c739aa96379b372c7310aff3b` |
| `downloads/tapping-atlas.csv` | `3a391f37c5ac32ac1bbaa0e49ed8ac54e2efd840f855d396dc084b1dc51e7551` |

## A note on scope: a real T8 bug was fixed here, not just T9 features added

`scripts/generators/generate-tapping-workflow.js`'s change includes one line that fixes a genuine, already-shipped syntax error (see `audit/t9-tapping-comparison.md` for full detail) in addition to the new comparison feature. Both changes are in the same file because both touch the same `renderResult()`-adjacent code; they are documented separately in the phase report so the fix isn't obscured by the new feature.

## Files Modified (12)

| File | Change | Reason |
|---|---|---|
| `scripts/generators/generate-tapping-workflow.js` | Comparison UI + logic added; 1-line syntax-error fix in `renderResult()` | T9 feature + T8 regression fix |
| `scripts/validators/validate-tapping-workflow.js` | +4 checks: real JS syntax validity, comparison structure, comparison logic, full-coverage | Required by phase brief; syntax check specifically closes the gap that let the T8 bug ship |
| `tools/tapping-workflow.html` | Regenerated | Reflects both the fix and the new feature |
| `css/styles.css` | +minimal component CSS (`.wf-compare-actions`, `.wf-compare-remove`, `:disabled` style) | Comparison UI requires a remove-chip control and disabled-button feedback; neither existed before |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Re-ran `validate-knowledge-engine.js`; no knowledge-layer data changed |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Re-ran `validate-tapping-domain.js`, same reason |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated | Re-ran `validate-projections.js`, same reason |
| `docs/architecture/tapping-workflow-validation-report.json`/`.md` | Regenerated | Re-ran the extended `validate-tapping-workflow.js` |

**No knowledge-layer file** (`data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`) **was modified.** `data/projections/tapping/tapping-profiles.json` and `data/projections/tapping/tap-types.json` were only read — both confirmed byte-identical to baseline. `js/tapping-workflow-data.js` needed no new embedded fields for the comparison feature (it already carried everything, from T8) and is confirmed byte-identical. `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, and `downloads/tapping-atlas.csv` were not touched at all in this phase and are confirmed byte-identical.

## Files Created (4)

| File | Reason |
|---|---|
| `docs/architecture/t9-tapping-comparison.md` | Required architecture documentation |
| `audit/t9-tapping-comparison.md`/`.json` | Required phase report |
| `audit/t9-change-scope.md` | This file |

### Pre-existing, not part of T9 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## Explicit Constraints Honored

- No new URL, page, CSV, or projection created.
- No new knowledge, standards, tap types, tap-drill values, or engagement data introduced.
- No verification state transformed — every comparison cell reads directly from the same profile fields the single-result view already uses.
- AdSense, `ads.txt`, CMP, privacy/legal pages untouched. No ads inside the comparison interaction.
- No new top-level navigation item; no footer changes.
- `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, and `downloads/tapping-atlas.csv` were not modified (no regression was discovered in them that would have justified an exception).

## Production Files Modified

**1 with real content change**: `tools/tapping-workflow.html`. (`css/styles.css` also has a real, small, component-scoped addition.)

## Unexpected Files

**None.**

## Final Git Status

| Category | Count |
|---|---|
| Modified | 12 |
| New (T9) | 4 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files with actual content change | 2 (`tools/tapping-workflow.html`, `css/styles.css`) |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in this T9 session.
