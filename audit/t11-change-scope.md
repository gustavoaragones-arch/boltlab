# T11 — Change Scope

Baseline: `cdbdbb9d2951281300bf469edf9f59dc870365a8`

## T11 Correction (validator check #8 fix)

A follow-up pass fixed a validator-quality defect: `scripts/validators/validate-tapping-terminology.js` check #8 only ever flagged an *empty* provenance value (`value === ""`), so a non-empty fabricated value passed silently. The check was rewritten to resolve every provenance value each product exposes and compare it against `data/projections/tapping/tapping-profiles.json` / `tap-types.json`. See `audit/t11-tapping-consistency.md` Section 0 for the full root cause, correction, and mandatory regression tests (all passed). Only `scripts/validators/validate-tapping-terminology.js` was modified for this correction; no product, generator, or projection file changed. Four files (`reference/tapping-atlas.html`, `reference/tapping-evidence.html`, `tools/tapping-workflow.html`, `js/tapping-workflow-data.js`) were used as disposable, temporarily-mutated test fixtures to prove the corrected check actually catches the failure modes it claims to — every mutation was reverted and each file reconfirmed byte-identical to its post-original-T11 checksum.

## Files created

- `scripts/validators/validate-tapping-terminology.js` — new T11 terminology-consistency validator (Section 19 requirement; no existing validator covered this)
- `docs/architecture/tapping-terminology-validation-report.json` / `.md` — its report output
- `audit/t11-tapping-consistency.md` / `.json` — main T11 audit deliverable
- `audit/t11-change-scope.md` — this file
- `docs/architecture/t11-tapping-consistency.md` — architecture-doc deliverable

## Files modified

| File | Reason |
|---|---|
| `scripts/generators/generate-tapping-atlas.js` | Known-issue ISO wording fix (display-only), record-status label fix, classification-heading plurality fix; added CSV-only frozen label function |
| `scripts/generators/generate-tapping-workflow.js` | Known-issue ISO wording fix, record-status label fix, classification-heading plurality fix, T9 comparison metric-branch cell wording |
| `scripts/generators/generate-tap-type-guide.js` | Classification-heading plurality fix |
| `scripts/validators/validate-tapping-atlas.js` | Updated hard-coded expected strings to match the approved "Overall record status" and plural classification-heading corrections |
| `reference/tapping-atlas.html` | Regenerated from the corrected generator |
| `reference/tap-type-guide.html` | Regenerated from the corrected generator |
| `tools/tapping-workflow.html` | Regenerated from the corrected generator |

## Files explicitly NOT modified

- `data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/` — no knowledge-layer changes
- `data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json` — no T3 projection changes (confirmed byte-identical)
- `downloads/tapping-atlas.csv` — protected artifact; confirmed byte-identical despite the underlying generator's label function changing, via a deliberate function split (see `audit/t11-tapping-consistency.md` Section 5)
- `js/tapping-workflow-data.js` — confirmed byte-identical (the plurality/wording fixes live in the static HTML template, not in the build-artifact data file)
- `reference/tapping-evidence.html` and `scripts/generators/generate-tapping-evidence.js` — T10's baseline, already correct; not touched; confirmed byte-identical after a fresh regeneration
- `tools/tap-drill-calculator.html` — reviewed for overlapping terminology only, per Section 12F; no overlap found, no redesign performed
- `sitemap.xml` — no new pages, no architecture change
- `ads.txt`, CMP, privacy, cookies, AdSense configuration — untouched

## No new products, no SEO expansion, no monetization changes

Confirmed: no new URLs, no new programmatic pages, no FAQPage additions, no canonical-architecture changes, no ad configuration changes.

## Unexpected files present at session start (unrelated to T11, left untouched)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md`, `.DS_Store`, `css/.DS_Store`, `images/.DS_Store`, `images/heads/.DS_Store`, `images/logo.ai`, `images/screw-drive-types/.DS_Store`, `images/screw-head-types/.DS_Store`, `.claude/` — these were present as untracked files before T11 began (from a prior D2 phase / local environment) and are outside T11's scope.

## Git state at stop

No commits made. No pushes made. Working tree contains only the modifications and new files listed above plus the pre-existing unrelated untracked files listed above.
