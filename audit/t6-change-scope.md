# T6 — Change Control

Date: 2026-08-15

## Baseline (before T6)

```
HEAD                  →  6970fe93149884ff5e23259ea2a30e7880b98421 (T5 Tap Type Guide, approved and pushed)
Working tree           →  clean except the 3 pre-existing untouched D2.0/local-machine files
```

## Baseline Checksums (recorded before any change, per phase brief §8)

| File | SHA-256 |
|---|---|
| `reference/tapping-atlas.html` | `ec9c4d005c0c2b64cc2e143149b09b6ad4f55637c03e7769034e590ffc226ca1` |
| `downloads/tapping-atlas.csv` | `3a391f37c5ac32ac1bbaa0e49ed8ac54e2efd840f855d396dc084b1dc51e7551` |
| `data/projections/tapping/tapping-profiles.json` | `f9739e1d1f8d214b9eb06e4396c9bd1c44c1765c72e644bd0f40bfb1eddf3060` |
| `data/projections/tapping/tap-types.json` | `63867da5f7f4a9eb5935b418bfc306ec143bf686f0269bb0689c6325ef480305` |
| `reference/tap-type-guide.html` | `4b1d1a0b396975341af53811fa36e358458ea6bf4c63a41dea9dea8d61e5f166` |

## Files Modified (11)

| File | Change | Reason |
|---|---|---|
| `scripts/generators/generate-tapping-atlas.js` | +1 `noteGroup()` call for `general_taxonomy` | The fix |
| `scripts/validators/validate-tapping-atlas.js` | +2 checks (12 total) | Prevent recurrence, fact-level not keyword-level |
| `reference/tapping-atlas.html` | Regenerated | Now includes General taxonomy heading/facts |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Re-ran `validate-knowledge-engine.js` |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Re-ran `validate-tapping-domain.js` |
| `docs/architecture/projection-validation-report.json`/`.md` | Regenerated | Re-ran `validate-projections.js` |
| `docs/architecture/tapping-atlas-validation-report.json`/`.md` | Regenerated | Re-ran the extended `validate-tapping-atlas.js` |

**`downloads/tapping-atlas.csv` was regenerated (same generator run) and is confirmed byte-identical to baseline** — the CSV decision (no change) is not merely a stated intent but a mechanically verified outcome.

**No knowledge-layer file** (`data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/`) **was modified.** `data/projections/tapping/tapping-profiles.json` and `data/projections/tapping/tap-types.json` were only read — both confirmed byte-identical to baseline. `reference/tap-type-guide.html` was not regenerated and is confirmed byte-identical to baseline.

## Files Created (4)

| File | Reason |
|---|---|
| `docs/architecture/t6-tapping-atlas-completeness.md` | Required architecture documentation |
| `audit/t6-tapping-atlas-completeness.md`/`.json` | Required phase report |
| `audit/t6-change-scope.md` | This file |

### Pre-existing, not part of T6 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## Explicit Constraints Honored

- No knowledge expansion: no new standards, tap types, numeric tap-drill values, thread-engagement targets, axial calculations, 75% recommendations, or material data.
- No verification states changed; no provenance modified.
- No new URL created; canonical, title, and meta description unchanged.
- No sitemap change (the URL was already present from T4).
- No unrelated tool, guide, size page, standards page, legal page, navigation, homepage, or D2.0 file touched.
- AdSense, `ads.txt`, and CMP untouched.
- T5's Tap Type Guide was not regenerated or modified.

## Production Files Modified

**1**: `reference/tapping-atlas.html`. `downloads/tapping-atlas.csv` was regenerated but is byte-identical to baseline, so it carries no functional change.

## Unexpected Files

**None.**

## Final Git Status

| Category | Count |
|---|---|
| Modified | 11 |
| New (T6) | 4 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files with actual content change | 1 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in this T6 session.
