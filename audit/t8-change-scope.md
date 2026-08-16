# T8 — Change Control

Date: 2026-08-16

## Baseline (before T8)

```
HEAD                  →  351df5b8ec0b699ec9d4df350dcf97611291146c (T7, approved and pushed)
Working tree           →  clean except the 3 pre-existing untouched D2.0/local-machine files
```

## Baseline Checksums (recorded before any change)

| File | SHA-256 |
|---|---|
| `data/projections/tapping/tapping-profiles.json` | `f9739e1d1f8d214b9eb06e4396c9bd1c44c1765c72e644bd0f40bfb1eddf3060` |
| `data/projections/tapping/tap-types.json` | `63867da5f7f4a9eb5935b418bfc306ec143bf686f0269bb0689c6325ef480305` |
| `reference/tapping-atlas.html` | `76c6ca0843ce85ee08843536277161c3c11813b9783fbe5a0a6a9b1e9d1c03ce` |
| `reference/tap-type-guide.html` | `3a37677fc99c65e85e74961154ef23e30935ea4da6fcde4297f7b6434ae2638e` |
| `downloads/tapping-atlas.csv` | `3a391f37c5ac32ac1bbaa0e49ed8ac54e2efd840f855d396dc084b1dc51e7551` |

## Files Created (10)

| File | Reason |
|---|---|
| `scripts/generators/generate-tapping-workflow.js` | The T8 generator |
| `scripts/validators/validate-tapping-workflow.js` | Dedicated validator, 12 checks |
| `tools/tapping-workflow.html` | The product page |
| `js/tapping-workflow-data.js` | Generated client-side data artifact, matching the site's existing `window.BoltLabDrillData` convention |
| `docs/architecture/t8-tapping-workflow.md` | Required architecture documentation |
| `docs/architecture/tapping-workflow-validation-report.json`/`.md` | Output of the new validator |
| `audit/t8-tapping-workflow.md`/`.json` | Required phase report |
| `audit/t8-change-scope.md` | This file |

## Files Modified (13)

| File | Change | Reason |
|---|---|---|
| `scripts/generators/generate-tapping-atlas.js` | +1 list item in "Related tools" | Approved discovery link to the new workflow |
| `scripts/generators/generate-tap-type-guide.js` | +1 list item in "Related references" | Approved discovery link to the new workflow |
| `reference/tapping-atlas.html` | Regenerated | Reflects the new link |
| `reference/tap-type-guide.html` | Regenerated | Reflects the new link |
| `tools/index.html` | +1 tool card | Hand-maintained hub file; new tool is a natural member of the existing tools grid |
| `tools/tap-drill-calculator.html` | +1 list item in "Related guides" | Hand-maintained file (no generator); reciprocal discovery link |
| `sitemap.xml` | +1 `<url>` entry | New canonical URL requires sitemap inclusion |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Re-ran `validate-knowledge-engine.js`; no knowledge-layer data changed |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Re-ran `validate-tapping-domain.js`, same reason |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated | Re-ran `validate-projections.js`, same reason |

**`downloads/tapping-atlas.csv` was regenerated (same generator run as the Atlas) and confirmed byte-identical to baseline.** **No knowledge-layer file** (`data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`) **was modified.** `data/projections/tapping/tapping-profiles.json` and `data/projections/tapping/tap-types.json` were only read — both confirmed byte-identical to baseline.

### Pre-existing, not part of T8 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## Explicit Constraints Honored

- No new tap-drill numbers, standards, tap types, thread sizes, engagement percentages, engagement lengths, material data, cutting-speed/torque/lubrication/tap-life data, or new manufacturer-specific recommendations.
- No new provenance claims — every value traced unmodified to its projection source.
- No new top-level navigation category; the workflow lives under the existing `/tools/` architecture.
- AdSense, `ads.txt`, CMP, privacy/legal pages untouched. No ads placed inside the decision interaction.
- Foreign-generator file (`reference/thread-atlas.html`) left untouched, consistent with T7's precedent.

## Production Files Modified

**6 with real content change**: `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `tools/index.html`, `tools/tap-drill-calculator.html`, `sitemap.xml`, plus the new `tools/tapping-workflow.html`. (`downloads/tapping-atlas.csv` regenerated but byte-identical — no functional change.)

## Unexpected Files

**None.**

## Final Git Status

| Category | Count |
|---|---|
| Modified | 13 |
| New (T8) | 10 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files with actual content change | 6 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in this T8 session.
