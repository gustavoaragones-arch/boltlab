# D1.8 — Change Control

Date: 2026-08-11

## Files Created (3) — all EXPECTED

| File | Reason |
|---|---|
| `audit/d1-8-trust-aeo-report.md` | Step 7 required deliverable |
| `audit/d1-8-trust-aeo-report.json` | Step 7 required deliverable |
| `audit/d1-8-change-scope.md` | This file — Step 7 required deliverable |

No other new file was created.

## Files Modified (14) — all EXPECTED

| File | Change | Category |
|---|---|---|
| `reference/metric-thread-atlas.html` | Added "Dataset coverage: Metric (9 rows)"; relabeled "Verified: Yes" → "Verification status: Verified" | Part 1 |
| `tools/tap-drill-calculator.html` | Added the exact required verification-hedge sentence, once | Part 2 |
| `guides/bolt-head-markings.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/bolt-strength-grades.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/bolt-vs-screw-difference.html` | Lede converted to `.aeo-answer-block` (sourced from page's own FAQ) | Part 3 |
| `guides/fastener-materials-guide.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/how-to-measure-thread-pitch.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/metric-thread-tolerances.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/metric-vs-imperial-fasteners.html` | Lede converted to `.aeo-answer-block` (sourced from page's own FAQ) | Part 3 |
| `guides/tap-drill-basics.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/thread-pitch-explained.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/thread-types-explained.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/what-is-tpi.html` | Lede converted to `.aeo-answer-block` | Part 3 |
| `guides/why-stainless-bolts-gall.html` | Lede converted to `.aeo-answer-block` | Part 3 |

Note on baseline overlap: 4 of these 14 files (`tools/tap-drill-calculator.html`, `guides/bolt-vs-screw-difference.html`, `guides/metric-vs-imperial-fasteners.html`, `guides/tap-drill-basics.html`) were already modified by D1.6 for unrelated FAQ reasons before D1.8 began. D1.8's edits to these 4 files are additive and non-overlapping with D1.6's changes (confirmed via diff — no FAQ-section line was touched in any of the 4). The working tree's total modified-file count therefore increased from 83 to 93 (83 + 10 genuinely new files), while D1.8's own scope remains exactly 14 files as required.

## Files Intentionally Untouched

- **`reference/thread-atlas.html`** — inspected in full; already had all 4 core trust-signal fields, verified accurate (20-row claim independently re-confirmed). No change made or needed. See `audit/d1-8-trust-aeo-report.md` Part 1 for full reasoning.
- **`guides/index.html`** — the guides hub; confirmed 0 AEO blocks before and after, per explicit instruction.
- **`reference/standards/{din,jis,ansi,british-standards}.html`** — explicitly out of scope (D1.7 item 1), not touched.
- **All 15 "future revisions" pages** — explicitly out of scope (D1.7 item 2), not touched.
- **All other D1.6/D1.6R/D1.5-touched files not listed above** — not reopened.
- **`ads.txt`, any CMP file, any AdSense script** — do not exist, not created.
- **Sitemap, robots.txt, `_redirects`, `_headers`, canonical URLs, hreflang tags, header/footer navigation** — not modified anywhere.

## Unexpected Changes Found and Reverted

Same two categories of validator/tooling side effects as every prior phase since D1.1, produced by this phase's own read-only verification steps:

1. `docs/architecture/validation-report.{json,md}` and `docs/architecture/projection-validation-report.{json,md}` — regenerated timestamps. Reverted via `git checkout --`.
2. `audit/d1-3-page-inventory.json` — overwritten by re-running the D1.3 inventory helper script for duplicate-title/orphan verification. Reverted via `git checkout --`.

No other unexpected file was found.

## Final Git Status Summary

| Metric | Before D1.8 | After D1.8 |
|---|---|---|
| Branch | main | main |
| Commit | e44240d | e44240d (unchanged) |
| Modified production files | 83 | 93 |
| Production files changed by D1.8 specifically | — | 14 (matches expected count exactly) |
| New/untracked audit+doc files (excluding local artifacts) | 12 | 15 (12 + 3 new D1.8 files) |
| Committed | No | No |
| Pushed | No | No |
