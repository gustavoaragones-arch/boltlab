# T4 — Change Control

Date: 2026-08-15

## Baseline (before this T4 session)

```
HEAD                  →  17aab2876b70f5e6655541bb4bb98daa7d67bbed (T3 correction, approved and pushed)
Working tree           →  paused T4 files from the pre-bug-discovery session (css/styles.css modified;
                           reference/tapping-atlas.html, downloads/tapping-atlas.csv,
                           scripts/generators/generate-tapping-atlas.js untracked), plus the
                           pre-existing untouched D2.0/local-machine files
```

## Files Modified (9)

| File | Change | Reason |
|---|---|---|
| `css/styles.css` | +38 lines, additive `.data-status`/`.tapping-provenance` block | Paused work, inspected and kept as-is (already correct) |
| `reference/index.html` | +8 lines, one new card in "Standards & engineering data" | Explicitly authorized navigation integration |
| `sitemap.xml` | +5 lines, one new `<url>` entry | Explicitly authorized sitemap integration |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Re-ran `validate-knowledge-engine.js`; no knowledge-layer data changed, content is a re-confirmation |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Re-ran `validate-tapping-domain.js`, same reason |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated | Re-ran `validate-projections.js`, same reason |

**No knowledge-layer file** (`data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`) **was modified.** No existing tapping projection was regenerated with different content in this T4 session (T3's projection was already corrected and committed in the prior, separately-approved session).

## Files Created (8)

| File | Reason |
|---|---|
| `reference/tapping-atlas.html` | The product page (paused work, completed and regenerated against the corrected projection) |
| `downloads/tapping-atlas.csv` | The CSV data product (paused work, regenerated) |
| `scripts/generators/generate-tapping-atlas.js` | The generator (paused work, 2 bugs found and fixed — see `audit/t4-tapping-atlas.md` §18) |
| `scripts/validators/validate-tapping-atlas.js` | New dedicated validator, 10 checks, all expectations derived from the projection at validation time |
| `docs/architecture/tapping-atlas-product.md` | Required architecture documentation |
| `docs/architecture/tapping-atlas-validation-report.json`/`.md` | Output of the new validator |
| `audit/t4-tapping-atlas.md`/`.json` | Required phase report |
| `audit/t4-change-scope.md` | This file |

### Pre-existing, not part of T4 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## Explicit Constraints Honored

- No T4 file was discarded, reset, or blindly reconstructed — the paused generator/CSS were inspected first, then extended.
- No knowledge-layer value was altered or invented.
- No `source_bound` value was promoted to `verified`.
- No unsupported engagement percentage or axial minimum was introduced.
- No unrelated tool, guide, or existing reference page (other than the explicitly authorized `reference/index.html`) was modified.
- AdSense, `ads.txt`, CMP, privacy/legal pages, and the D2.0 audit files were not touched.
- T4's own validator (`validate-tapping-atlas.js`) mechanically re-derives every expected count from the projection at run time rather than hard-coding the 9/20 split — the exact discipline the T3 incident showed was missing.

## Production Files Modified

**4**: `css/styles.css`, `reference/index.html`, `sitemap.xml` (all modified), `reference/tapping-atlas.html` (new). This is the first phase in this project explicitly authorized to touch production surfaces, per the T4 brief's own Section 37/resume-message framing.

## Unexpected Files

**None.**

## Final Git Status

| Category | Count |
|---|---|
| Modified | 9 |
| New (T4) | 8 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files touched | 4 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in this T4 session.
