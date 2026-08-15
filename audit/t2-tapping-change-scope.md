# T2 — Change Control

Date: 2026-08-15

## Baseline (before T2)

```
git status --short  →  only T1's committed-but-baseline state, plus 3 pre-existing untracked
                        D2.0 audit files (unchanged since D2.0)
HEAD                  →  424a03d "D1.6-D1.7: FAQ Integrity and Residual Content Certification"
T1                    →  committed and pushed (per user's prior "Commit T1 → push → begin T2" approval)
```

## Files Modified (14) — all EXPECTED

| File | Change | Reason |
|---|---|---|
| `data/standards/iso/standards.seed.json` | Updated `iso_965_1`; added `iso_2306`, `iso_2857` | Section 4/5 — standards verification & expansion |
| `data/standards/asme/standards.seed.json` | Updated `asme_b1_1`; added `asme_b94_9` | Section 4/5 — standards verification & expansion |
| `data/schemas/standard.schema.json` | Additive: optional `edition`, `standard_status` fields | Support edition tracking without overloading existing fields |
| `data/schemas/dataset.schema.json` | Additive: optional `derived_candidates` array field | Section 19 — store derived formulas separately from verified records |
| `data/schemas/entity.schema.json` | Additive: optional `taxonomy_axis` field | T1 caution #1 — hole-preparation orthogonal axes |
| `data/entities/entities.seed.json` | 5 existing `hole_preparation` records gained `taxonomy_axis`; `updated` date bumped | Same as above |
| `data/datasets/metric_tapping.seed.json` | Added `derived_candidates` (1 entry, ISO 2306 formula); `updated` date bumped | Section 6/19 |
| `data/datasets/unc_tapping.seed.json` | Added `derived_candidates` (1 entry, engagement formula); `updated` date bumped | Section 8/19 |
| `data/datasets/unf_tapping.seed.json` | Added `derived_candidates` (1 entry, engagement formula); `updated` date bumped | Section 8/19 |
| `docs/architecture/tapping-data-foundation.md` | Added Section 18 (T2 addendum) | Document what changed and why, without rewriting T1's own record |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Legitimate result of running `validate-knowledge-engine.js`; reflects real new standards count (9, was 6) caused by this phase's own changes — kept, not reverted |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Legitimate result of running `validate-tapping-domain.js` against this phase's own changes — kept, not reverted |

**No existing entity, relationship, or tapping_profile dataset record was deleted or had its numeric value changed.** `iso_965_1` and `asme_b1_1` are the only pre-existing standard records whose fields changed, and both changes are evidenced corrections (Section 5 of the phase brief), not silent rewrites of unrelated standards — the other 4 pre-existing standard records (`iso_68_1`, `iso_261`, `iso_262`, `iso_724`) were read but not touched.

## Files Created (5) — all EXPECTED (T2's own required audit deliverables)

| File | Reason |
|---|---|
| `audit/t2-tapping-source-register.json` | Section 20 — full research/provenance log |
| `audit/t2-tapping-source-register.md` | Human-readable summary of the above |
| `audit/t2-tapping-data-verification.json` | Phase report, structured |
| `audit/t2-tapping-data-verification.md` | Phase report, narrative |
| `audit/t2-tapping-change-scope.md` | This file |

### Pre-existing, not part of T2 (3)

| File | Origin |
|---|---|
| `audit/d2-0-adsense-readiness.json` | D2.0 (prior phase), untouched |
| `audit/d2-0-adsense-readiness.md` | D2.0 (prior phase), untouched |
| `audit/d2-0-change-scope.md` | D2.0 (prior phase), untouched |

Per the phase brief's explicit instruction ("Do not modify the three pre-existing D2.0 audit files unless T2 genuinely requires it") — T2 did not require it, so they remain untouched.

## Files NOT Created (explicit stop condition honored)

No `data/projections/tapping/*`, no generator, no HTML page (Tapping hub, Tap Drill Atlas, Tap Drill Calculator update), no sitemap/nav change. T2 stopped at the knowledge layer, exactly as scoped.

## Production Files Modified

**0.** Verified via `git status --short | grep -E '\.(html|css|xml|txt)$'` → empty.

## Unexpected Files

**None.** Every file in `git status` at the end of this phase is accounted for above, either as an expected T2 change, a T2 audit deliverable, or an untouched pre-existing D2.0/local-machine file (`.DS_Store`, `images/logo.ai`, `.claude/` — none of these were created or modified by T2).

## Change Control Actions Taken

`git status --short` and `git diff --stat` were run before and after this phase's edits (see `audit/t2-tapping-data-verification.md` Section 14 and above). **Nothing was staged, committed, pushed, reset, cleaned, or stashed.** No unrelated working-tree file was overwritten.

## Final Git Status

| Category | Count |
|---|---|
| Modified | 14 |
| New (T2) | 5 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production (`.html`/`.css`/`.xml`) files touched | 0 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

`git diff --stat` confirms every modified file is under `data/` or `docs/architecture/` — no file outside the knowledge-engine layer was touched.
