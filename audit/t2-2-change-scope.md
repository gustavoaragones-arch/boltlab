# T2.2 — Change Control

Date: 2026-08-15

## Baseline (before T2.2)

```
HEAD                  →  6c71573 "T2.1 + T2.1a: Tap-Drill Numeric Verification & UNC/UNF Coverage Expansion"
Working tree           →  clean except 3 pre-existing untracked D2.0 audit files
```

## Files Modified (9) — all EXPECTED

| File | Change | Reason |
|---|---|---|
| `data/schemas/entity.schema.json` | Additive: optional `application_notes` array field | Support classified, sourced tap-type facts |
| `data/entities/entities.seed.json` | 7 `tap_type` records gained `application_notes`; version bumped v0.1.0→v0.2.0; `updated` date bumped | Part 2 — tap-type application knowledge |
| `data/datasets/metric_tapping.seed.json` | `verification_method` gained a pointer to the new thread-engagement-model.md doc | No record value changed |
| `data/datasets/unc_tapping.seed.json` | Same as above | No record value changed |
| `data/datasets/unf_tapping.seed.json` | Same as above | No record value changed |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Result of running `validate-knowledge-engine.js` after this phase's changes |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Result of running `validate-tapping-domain.js` after this phase's changes |

**No existing entity definition, dataset record value, standard, or relationship was altered.** No `thread_engagement` field on any of the 29 tapping_profile records was populated.

## Files Created (4) — all EXPECTED

| File | Reason |
|---|---|
| `docs/architecture/thread-engagement-model.md` | Full mathematical model: radial % vs. axial length, formulas, NASA-STD-5020A findings, explicit 75% verdict |
| `audit/t2-2-thread-engagement-tap-types.json` | Structured phase report |
| `audit/t2-2-thread-engagement-tap-types.md` | Narrative phase report |
| `audit/t2-2-change-scope.md` | This file |

### Pre-existing, not part of T2.2 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## Scope Discipline Confirmed

- No new relationship predicate was introduced; no relationship record was added or changed.
- No projection, generator, HTML, sitemap, or navigation file was created or modified.
- No standard record was created or modified.
- No dataset numeric value (tap-drill, ISO 2306 alternative, cross-verification) from T2/T2.1/T2.1a was altered.
- `unc.seed.json`/`unf.seed.json`/`metric_threads.seed.json` were not touched.

## Production Files Modified

**0.** Verified via `git status --short | grep -E '\.(html|css|xml|txt)$'` → empty.

## Unexpected Files

**None.**

## Final Git Status

| Category | Count |
|---|---|
| Modified | 9 |
| New (T2.2) | 4 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files touched | 0 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in T2.2.
