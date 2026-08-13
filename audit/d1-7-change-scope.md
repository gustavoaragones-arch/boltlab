# D1.7 — Change Control

Date: 2026-08-11

## Files Created (3) — all EXPECTED

| File | Reason |
|---|---|
| `audit/d1-7-residual-content-integrity.md` | Step 9 required deliverable |
| `audit/d1-7-residual-content-integrity.json` | Step 9 required deliverable |
| `audit/d1-7-change-scope.md` | This file — Step 9 required deliverable |

No other new file was created.

## Files Modified — 0

**Zero production files were modified.** D1.7 is a pure audit phase; every finding in `audit/d1-7-residual-content-integrity.md` was investigated read-only.

## Files Intentionally Untouched (carried forward from D1.6/D1.6R baseline)

The working tree entering D1.7 already contained 83 modified files and 9 untracked files from the certified-complete D1.6/D1.6R phases. None of these were touched, reopened, or altered by D1.7:

- The 83 files D1.6/D1.6R modified (FAQ sections/schema across `charts/`, `es/`, `guides/`, `reference/`, `sizes/`, `tools/`).
- `audit/d1-6-affected-pages.json`, `audit/d1-6-affected-pages.md`, `audit/d1-6-change-scope.md`, `audit/d1-6-faq-integrity.json`, `audit/d1-6-faq-integrity.md`, `audit/d1-6r-change-scope.md`, `audit/d1-6r-thread-types-repair.json`, `audit/d1-6r-thread-types-repair.md`.
- `docs/architecture/faq-structured-data-governance.md`.

Also confirmed untouched, per this phase's own audit findings:
- `reference/standards/{din,jis,ansi,british-standards}.html` (Section 5 of the markdown report).
- All 12 `guides/*.html` content pages (Section 7 — inspected only, no AEO block added).
- `tools/tap-drill-calculator.html` (Section 8 — inspected only, no hedge added).
- `reference/thread-atlas.html`, `reference/metric-thread-atlas.html` (Section 9 — inspected only, no metadata harmonized).
- `data/standards/{din,jis,ansi,bs}/standards.seed.json` (inspected only, confirmed still empty).
- `ads.txt`, any CMP file, any AdSense script — do not exist, not created.

## Unexpected Changes Found and Reverted

Same two categories of validator/tooling side effects as every prior phase since D1.1, produced by this phase's own read-only regression checks (Step 8):

1. `docs/architecture/validation-report.{json,md}` and `docs/architecture/projection-validation-report.{json,md}` — regenerated timestamps from running `validate-knowledge-engine.js` / `validate-projections.js`. Reverted via `git checkout --`.
2. `audit/d1-3-page-inventory.json` — overwritten by re-running the D1.3 inventory helper script for duplicate-title/orphan/JSON-LD verification. Reverted via `git checkout --`.

No other unexpected file was found. `git status` was re-checked after both reverts and confirmed to exactly match the pre-D1.7 baseline plus only the 3 new D1.7 files.

## Final Git Status Summary

| Metric | Before D1.7 | After D1.7 |
|---|---|---|
| Branch | main | main |
| Commit | e44240d | e44240d (unchanged) |
| Modified production files | 83 | 83 |
| New/untracked files (excluding local artifacts) | 9 | 12 (9 + 3 new D1.7 files) |
| Production files changed by this phase | — | **0** |
| Committed | No | No |
| Pushed | No | No |
