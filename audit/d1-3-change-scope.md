# D1.3.16 — Change Control / Change Scope Report

Date: 2026-08-11

## Files Created (12) — EXPECTED

All required D1.3 audit deliverables:

| File | Reason |
|---|---|
| `audit/d1-3-documentation-baseline.md` | D1.3.1 |
| `audit/d1-3-page-inventory.json` | D1.3.2 |
| `audit/d1-3-page-inventory.md` | D1.3.2 |
| `audit/d1-3-thin-content.md` | D1.3.4 |
| `audit/d1-3-placeholder-audit.md` | D1.3.5 |
| `audit/d1-3-duplication.md` | D1.3.6 + D1.3.7 |
| `audit/d1-3-product-quality.md` | D1.3.8 |
| `audit/d1-3-discovery.md` | D1.3.9 |
| `audit/d1-3-engineering-trust.md` | D1.3.10 |
| `audit/d1-3-aeo-quality.md` | D1.3.11 |
| `audit/d1-3-monetization-safety.md` | D1.3.12 |
| `audit/d1-3-fix-priority.md` | D1.3.13 |

(`audit/d1-3-change-scope.md`, `audit/d1-3-final.json`, `audit/d1-3-final.md` are also created by this same step — listed separately as they close out D1.3.16 itself.)

## Files Modified (92) — EXPECTED

| Group | Count | Reason |
|---|---|---|
| `reference/standards/asme.html` | 1 | P1-1 fix — surfaced already-verified `asme_b1_1` knowledge record (scope, summary, related concepts/datasets) that the generator was never rendering; added matching Article/BreadcrumbList/WebPage schema. No invented content — see `audit/d1-3-thin-content.md`. |
| `reference/thread-atlas.html` | 1 | P1-2 fix — added one "Related datasets" section linking to the previously-orphaned `reference/metric-thread-atlas.html`. See `audit/d1-3-discovery.md`. |
| `sizes/*-clearance-hole.html`, `*-tap-drill.html`, `*-thread-pitch.html`, `*-to-inch.html`, `*-vs-m*.html` | 90 | P0-1 fix — deterministic script added a visible `<h2>FAQ</h2>` section (using each page's own pre-existing FAQPage schema question/answer text, byte-verified per-file) immediately before the ad container, matching the pattern already used correctly on `-bolt-size` pages. See `audit/d1-3-aeo-quality.md`. Every diff in this group is additive-only: confirmed by script that the anchor (`<div class="ad-container">`) occurred exactly once per file before the change, and no other line was touched. |

Total: 1 + 1 + 90 = 92 files modified, matching `git status` exactly.

## Files Intentionally Left Unchanged

- **4 remaining thin standards pages** (`reference/standards/{din,jis,ansi,british-standards}.html`) — no underlying verified knowledge record exists for any of them (`data/standards/{din,jis,ansi,bs}/standards.seed.json` all have empty `records: []`); enriching them would require inventing standards content, which governance explicitly forbids. Logged as P1-4, deferred.
- **39 Pattern-B pages** (FAQ schema present, visible FAQ present, but text differs — 20 `sizes/*-bolt-size`, 16 `reference/*`, 3 `guides/*`) — deliberately not touched. Each has two independently-authored, non-trivial Q&A sets; picking a winner per page is an editorial judgment call for a dedicated follow-up phase, not a mechanical fix. Logged as P1-3, deferred.
- **`_generate_longtail_sizes.py`** (the legacy generator responsible for the P0-1 defect) — not modified. The generator's `faq_page()` helper is the root cause, but modifying and re-running an 877-line ad hoc script against the full `sizes/` cluster carries materially higher regression risk than the targeted, verified, deterministic HTML patch that was applied instead. This tradeoff is explicitly documented in `audit/d1-3-aeo-quality.md`. Flagged for a future maintenance pass to fix at the source so newly-generated pages don't reintroduce the defect.
- **`scripts/generators/generate-standards-pages.js`** — not modified, for the same reason: the ASME fix was applied as a direct, verified, single-page HTML patch rather than building and wiring a new generator code path, to keep the change minimal and low-risk. The generator's `renderFamilyPage()` function still bypasses the knowledge layer for DIN/JIS/ANSI/British Standards, which is accurate (those have no data to surface) but would also under-serve ASME if the page were ever regenerated from the generator again — flagged as a known follow-up item.
- **13 `guides/*.html` pages** (missing AEO block) — deferred, requires new authored content (P2-2).
- **`tools/tap-drill-calculator.html`** (missing verification hedge) — deferred as an unbundled, low-priority single-line fix (P2-3), to keep this phase's change set limited to the highest-evidence findings.
- **15 pages with the repeated "future revisions" sentence** — deliberately not touched; legitimate, non-misleading, and differentiating them would require new content this audit has no verified data for (P2-1).
- **`data/`, `data/schemas/`, `data/projections/` (except reading, not writing)** — untouched. No changes to the knowledge/projection architecture were made, per governance rule 6/3.
- **`privacy/`, `cookies/`, `terms/`, `disclaimer/`, `about/`, `contact/`** — untouched, per governance rule 22.
- **`ads.txt`** — still does not exist; not created, per governance rules 19/20/D1.2.1 precedent.
- **`es/` (Spanish pages)** — untouched; no concrete technical defect was found in any Spanish page during this audit (they were included in the inventory and checked for duplicate titles/descriptions/broken links — all clean), so governance rule 23's exception condition was never triggered.
- **`docs/architecture/validation-report.{json,md}`, `docs/architecture/projection-validation-report.{json,md}`** — regenerated by running the validators (D1.3.15), then reverted with `git checkout --` immediately after confirming PASS status, per the established D1.1/D1.2/D1.2.1 precedent. The only diff was a fresh timestamp and a pre-existing (not D1.3-caused) `projections: 9→10` staleness first noted in D1.1's audit — not touched further, as it is unrelated to this phase's scope.

## Unexpected / Out-of-Scope Files Found in Working Tree

- `.claude/settings.json`, `.claude/settings.local.json` — pre-existing local tooling/harness configuration, not site content, not created or modified by this session's D1.3 work (timestamps predate or are incidental to this phase). Not part of any D1.3 deliverable; explicitly excluded from anything staged for review.
- `.DS_Store` (root, `css/`, `images/`, `images/heads/`, `images/screw-drive-types/`, `images/screw-head-types/`) and `images/logo.ai` — pre-existing untracked OS/asset artifacts present since before this session began (per the original `git status` at session start). Not touched.

No unexpected site-content file was modified. `git status` shows exactly 92 modified HTML files and 12 (soon 15, including this report and the two final-report files) newly created audit files — nothing else.
