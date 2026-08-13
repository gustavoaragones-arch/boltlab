# D1.6R — Change Control

Date: 2026-08-11

## Files Created (3) — all EXPECTED

| File | Reason |
|---|---|
| `audit/d1-6r-thread-types-repair.md` | Step 10 required deliverable |
| `audit/d1-6r-thread-types-repair.json` | Step 10 required deliverable |
| `audit/d1-6r-change-scope.md` | This file — Step 9 required deliverable |

## Files Modified (1) — EXPECTED

| File | Change |
|---|---|
| `reference/thread-types.html` | FAQPage JSON-LD `mainEntity` rewritten to match the verified-correct visible FAQ (5 questions, 5 answers, reordered/re-synced). No other line changed — confirmed via `git diff`. |

This is the only file this phase was authorized to touch (per the D1.6R scope freeze), and the only file it did touch.

## Files Intentionally Untouched

- **The other 82 D1.6-modified pages** — already correctly resolved by D1.6; not reopened.
- **`reference/thread-types.html`'s visible FAQ HTML, title, meta description, canonical, navigation, AEO block, and all body content other than the one JSON-LD script tag** — confirmed untouched by `git diff` review.
- **`reference/standards/{din,jis,ansi,british-standards}.html`**, **all `.aeo-answer-block` elements site-wide**, **`tools/index.html`, `index.html`, `reference/index.html`** (D1.5 architecture) — none modified.
- **`ads.txt`, any CMP file, any AdSense script** — do not exist, not created.

## Unexpected Changes Found and Reverted

Same two categories of validator/tooling side effects as D1.6, produced again by re-running the same tools for this phase's own verification steps, caught and reverted before finalizing:

1. `docs/architecture/validation-report.{json,md}` and `docs/architecture/projection-validation-report.{json,md}` — regenerated timestamps from re-running `validate-knowledge-engine.js` / `validate-projections.js`. Reverted via `git checkout --`.
2. `audit/d1-3-page-inventory.json` — overwritten again by re-running the D1.3 inventory helper script for the Step 7 full-site regression check. Reverted via `git checkout --`.

No other unexpected file was found. `git status` was re-checked after both reverts.

## Final Working-Tree State

83 modified files (82 from D1.6, now including `reference/thread-types.html`) + 8 new `audit/d1-6*` files (5 from D1.6, 3 from D1.6R) = 91 total changes. Confirmed clean of anything else (excluding pre-existing, session-independent local artifacts: `.DS_Store` files, `images/logo.ai`, `.claude/` tooling config).
