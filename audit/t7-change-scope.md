# T7 — Change Control

Date: 2026-08-16

## Baseline (before T7)

```
HEAD                  →  527037a40ad9e34f6f220dd80cf970c559f44ac1 (T6, approved and pushed)
Working tree           →  clean except the 3 pre-existing untouched D2.0/local-machine files
```

## Baseline Checksums (recorded before any change)

| File | SHA-256 |
|---|---|
| `data/projections/tapping/tapping-profiles.json` | `f9739e1d1f8d214b9eb06e4396c9bd1c44c1765c72e644bd0f40bfb1eddf3060` |
| `data/projections/tapping/tap-types.json` | `63867da5f7f4a9eb5935b418bfc306ec143bf686f0269bb0689c6325ef480305` |
| `reference/tapping-atlas.html` | `603296867f1c6775c9b3a9c2e715b67a01635cae14de5e87b0ae1b23c71a6376` |
| `reference/tap-type-guide.html` | `4b1d1a0b396975341af53811fa36e358458ea6bf4c63a41dea9dea8d61e5f166` |
| `downloads/tapping-atlas.csv` | `3a391f37c5ac32ac1bbaa0e49ed8ac54e2efd840f855d396dc084b1dc51e7551` |

## Files Modified (11)

| File | Change | Reason |
|---|---|---|
| `scripts/generators/generate-tapping-atlas.js` | +1 section: "Explore tap types" | Required cross-link, exact wording |
| `scripts/generators/generate-tap-type-guide.js` | +1 section: "Browse tapping data" + CSV link | Required cross-link + CSV discovery, exact wording |
| `reference/tapping-atlas.html` | Regenerated | Reflects the new section |
| `reference/tap-type-guide.html` | Regenerated | Reflects the new section |
| `tools/tap-drill-calculator.html` | +1 list item | Contextual link to Tapping Atlas (hand-maintained file, no generator) |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Re-ran `validate-knowledge-engine.js`; no knowledge-layer data changed |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Re-ran `validate-tapping-domain.js`, same reason |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated | Re-ran `validate-projections.js`, same reason |

**`downloads/tapping-atlas.csv` was regenerated (same generator run) and confirmed byte-identical to baseline.** **No knowledge-layer file** (`data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`) **was modified.** `data/projections/tapping/tapping-profiles.json` and `data/projections/tapping/tap-types.json` were only read — both confirmed byte-identical to baseline.

## Files Created (3)

| File | Reason |
|---|---|
| `audit/t7-tapping-product-integration.md` | Required phase report |
| `audit/t7-tapping-product-integration.json` | Required structured report |
| `audit/t7-change-scope.md` | This file |

### Pre-existing, not part of T7 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## Explicit Constraints Honored

- No new tapping architecture created — both generators still consume only `data/projections/tapping/*.json`.
- No engineering value, verification state, standard claim, or numeric data introduced or altered.
- No new URL created; no sitemap change (both URLs already present).
- No `.html` internal hrefs; canonical URLs unchanged; extensionless convention preserved.
- No top-level navigation category added; no homepage change.
- CSV schema and 29-row grain unchanged.
- AdSense, `ads.txt`, CMP, privacy/legal pages, unrelated navigation, unrelated tools/guides, and the D2.0 audit files untouched.
- Foreign-generator files (`thread-atlas.html`, `metric-thread-atlas.html`) left untouched rather than risking architecture creep or hand-edit drift — documented as deferred items with reasoning.

## Production Files Modified

**3 with real content change**: `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `tools/tap-drill-calculator.html`. (`downloads/tapping-atlas.csv` was regenerated but is byte-identical, so it carries no functional change.)

## Unexpected Files

**None.**

## Final Git Status

| Category | Count |
|---|---|
| Modified | 11 |
| New (T7) | 3 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files with actual content change | 3 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in this T7 session.
