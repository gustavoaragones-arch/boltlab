# D1.6 — Change Control

Date: 2026-08-11

## Files Created (5) — all EXPECTED

| File | Reason |
|---|---|
| `audit/d1-6-affected-pages.json` | Step 1 deliverable — full regenerated affected-page inventory |
| `audit/d1-6-affected-pages.md` | Step 1 deliverable — human-readable version |
| `audit/d1-6-faq-integrity.md` | Step 14 required deliverable |
| `audit/d1-6-faq-integrity.json` | Step 14 required deliverable |
| `audit/d1-6-change-scope.md` | This file — Step 15 required deliverable |

## Files Modified (82) — all EXPECTED

Every modified file is one of the 83 pages identified in `audit/d1-6-affected-pages.md`, minus the 1 blocked page (`reference/thread-types.html`, correctly left untouched).

### Category D fix — 20 files (visible FAQ section added, matching existing schema)

`charts/metric-thread-chart.html`, `charts/metric-vs-imperial-chart.html`, `charts/unc-thread-chart.html`, `charts/unf-thread-chart.html`, `es/tools/calculadora-broca-roscar.html`, `es/tools/identificador-roscas.html`, `es/tools/identificador-tornillos.html`, `es/tools/metrico-a-pulgadas.html`, `es/tools/paso-rosca-a-tpi.html`, `reference/thread-engineering/engineering-tables.html`, `reference/thread-engineering/fit-classes.html`, `reference/thread-engineering/inspection.html`, `reference/thread-engineering/thread-geometry.html`, `reference/thread-engineering/thread-standards.html`, `reference/thread-engineering/thread-tolerances.html`, `tools/metric-to-imperial-screw-converter.html`, `tools/screw-identifier.html`, `tools/tap-drill-calculator.html`, `tools/thread-identifier.html`, `tools/thread-pitch-to-tpi-converter.html`.

### Category text-mismatch fix — 62 files (FAQPage JSON-LD rewritten to match visible content)

`es/guides/broca-para-roscar.html`, `es/guides/metrico-vs-imperial.html`, `es/guides/paso-de-rosca.html`, `es/sizes/perno-1-4-20.html`, `es/sizes/perno-3-8-16.html`, `es/sizes/perno-5-16-18.html`, `es/sizes/perno-m3.html` through `es/sizes/perno-m20.html` (18 pages), `guides/bolt-vs-screw-difference.html`, `guides/metric-vs-imperial-fasteners.html`, `guides/tap-drill-basics.html`, `reference/6g-vs-6h.html`, `reference/6h-vs-6g.html`, `reference/allowance-vs-tolerance.html`, `reference/external-thread-tolerances.html`, `reference/fundamental-deviation.html`, `reference/internal-thread-tolerances.html`, `reference/metric-thread-tolerance-chart.html`, `reference/screw-anatomy.html`, `reference/screw-drive-types.html`, `reference/screw-head-shapes.html`, `reference/self-tapping-vs-self-drilling.html`, `reference/thread-engineering/index.html`, `reference/thread-fit-classes-explained.html`, `reference/thread-tolerances.html`, `reference/tolerance-zones-explained.html`, `sizes/1-4-20-bolt-size.html`, `sizes/10-screw-size.html`, `sizes/3-8-16-bolt-size.html`, `sizes/5-16-18-bolt-size.html`, `sizes/6-screw-size.html`, `sizes/8-screw-size.html`, `sizes/m6-bolt-size.html` through `sizes/m20-bolt-size.html` (excluding m8, present separately — 20 pages total in the `mN-bolt-size` cluster).

Full authoritative per-file list with before/after FAQ content: `audit/d1-6-affected-pages.json`.

## Files Intentionally Untouched

- **`reference/thread-types.html`** — the 1 BLOCKED page. Deliberately left unmodified; see `audit/d1-6-faq-integrity.md` for the full reasoning.
- **`reference/standards/{din,jis,ansi,british-standards}.html`** — frozen D1.3 P1-4 deferral, out of scope for D1.6, confirmed untouched (`git status` shows no diff on any of these 4 files).
- **All `.aeo-answer-block` elements site-wide** — frozen per D1.6 Step 7, confirmed untouched by diff review (every change in every modified file is scoped to the FAQ section or FAQPage JSON-LD block only).
- **`tools/index.html`, `index.html`, `reference/index.html`** (D1.5's IA changes) — not modified by D1.6; D1.5's regression check (in `audit/d1-6-faq-integrity.md`) confirms all D1.5 architecture is intact.
- **`ads.txt`, any CMP file, any AdSense script** — do not exist and were not created.

## Unexpected Changes Found and Reverted During This Phase

Two categories of unrelated drift were produced as side effects of running validation tooling during D1.6's own verification steps, caught by `git status` review, and reverted before finalizing:

1. `docs/architecture/validation-report.{json,md}` and `docs/architecture/projection-validation-report.{json,md}` — regenerated with fresh timestamps by running `validate-knowledge-engine.js` and `validate-projections.js` for their pass/fail signal. Reverted via `git checkout --`, per the precedent established in every prior phase (D1.1–D1.5).
2. `audit/d1-3-page-inventory.json` — accidentally overwritten by re-running a D1.3-era Python helper script (`build_inventory.py`) during D1.6's own orphan/duplicate-title verification pass, which updated word counts and `has_faq_visible` flags for the pages D1.6 had just fixed. This is out of scope for D1.6 (it's a D1.3 deliverable) and was reverted via `git checkout --` before finalizing this phase.

No other unexpected file was found. `git status` was re-checked after both reverts to confirm the working tree contains exactly the 82 modified pages and 5 new `audit/d1-6-*` files.

## Final Working-Tree State

82 modified files + 5 new files = 87 total changes. `git status --short` confirmed clean of anything else (excluding pre-existing, session-independent local artifacts: `.DS_Store` files, `images/logo.ai`, and `.claude/` tooling config, none of which are part of any D1 phase deliverable).
