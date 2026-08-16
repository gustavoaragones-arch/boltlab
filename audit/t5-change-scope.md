# T5 — Change Control

Date: 2026-08-15

## Baseline (before T5)

```
HEAD                  →  5989de027d48ffff7d38a9db51eba3a3923b3fa5 (T3 tap-type correction, approved and pushed)
Working tree           →  clean except the 3 pre-existing untouched D2.0/local-machine files
```

## Files Modified (8)

| File | Change | Reason |
|---|---|---|
| `reference/index.html` | +8 lines, one new card in "Standards & engineering data" | Explicitly authorized navigation integration |
| `sitemap.xml` | +4 lines, one new `<url>` entry | Explicitly authorized sitemap integration |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Re-ran `validate-knowledge-engine.js`; no knowledge-layer data changed |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Re-ran `validate-tapping-domain.js`, same reason |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated | Re-ran `validate-projections.js`, same reason |

**No knowledge-layer file** (`data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`) **was modified.** `data/projections/tapping/tapping-profiles.json` and `data/projections/tapping/tap-types.json` were **not** regenerated with different content in this T5 session — both were only read.

## Files Created (7)

| File | Reason |
|---|---|
| `scripts/generators/generate-tap-type-guide.js` | The T5 generator |
| `scripts/validators/validate-tap-type-guide.js` | Dedicated validator, 9 checks |
| `reference/tap-type-guide.html` | The product page |
| `docs/architecture/t5-tap-type-guide.md` | Required architecture documentation |
| `docs/architecture/tap-type-guide-validation-report.json`/`.md` | Output of the new validator |
| `audit/t5-tap-type-guide.md`/`.json` | Required phase report |
| `audit/t5-change-scope.md` | This file |

### Pre-existing, not part of T5 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## T4 Files Confirmed Untouched

`reference/tapping-atlas.html`, `downloads/tapping-atlas.csv`, `scripts/generators/generate-tapping-atlas.js`, `scripts/validators/validate-tapping-atlas.js`, `css/styles.css` — all absent from `git status`. `validate-tapping-atlas.js` re-run and still passes, confirming no regression.

## T3 Projection Files Confirmed Untouched

`data/projections/tapping/tapping-profiles.json` and `data/projections/tapping/tap-types.json` — both absent from `git status`. The corrected `tap-types.json` (commit `5989de0`) was consumed read-only.

## Explicit Constraints Honored

- No knowledge-layer value was altered or invented.
- No `source_bound` fact was promoted to `verified`.
- No unsupported engagement percentage or axial minimum was introduced (page doesn't discuss engagement).
- No new numeric tapping value was added to the dataset.
- No standard record was created or modified.
- AdSense, `ads.txt`, CMP, privacy/legal pages, and the D2.0 audit files were not touched.
- T4's known `general_taxonomy` display gap was not silently repaired.
- No parallel projection architecture was created — the new page consumes the existing, already-corrected `tap-types.json` directly.

## Production Files Modified

**3**: `reference/index.html` (modified), `sitemap.xml` (modified), `reference/tap-type-guide.html` (new).

## Unexpected Files

**None.**

## Final Git Status

| Category | Count |
|---|---|
| Modified | 8 |
| New (T5) | 7 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files touched | 3 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in this T5 session.
