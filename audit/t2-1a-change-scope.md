# T2.1a — Change Control

Date: 2026-08-15

## Baseline (before T2.1a)

```
HEAD                  →  8c6dd16 "T2: Tapping Data Acquisition & Verification (PASS WITH GAPS)"
Working tree           →  T2.1's changes were still uncommitted when T2.1a began (T2 was committed;
                           T2.1 and now T2.1a are staged together in the working tree, not yet committed)
```

## Files Modified (9) — cumulative T2.1 + T2.1a, all EXPECTED

| File | T2.1 change | T2.1a change |
|---|---|---|
| `data/datasets/metric_tapping.seed.json` | 9 records gained `cross_verified`; `source_standards` +iso_2306 | none (T2.1a did not touch metric records) |
| `data/datasets/unc.seed.json` | none | +5 new base-thread records with `provenance` blocks |
| `data/datasets/unf.seed.json` | none | +4 new base-thread records with `provenance` blocks |
| `data/datasets/unc_tapping.seed.json` | `verification_method` updated (conflict documented in prose) | +5 new tapping_profile records; all 8 records gained `iso_2306_alternative_drill` |
| `data/datasets/unf_tapping.seed.json` | `verification_method` updated (conflict documented in prose) | +4 new tapping_profile records; all 7 records gained `iso_2306_alternative_drill` |
| `docs/architecture/validation-report.json`/`.md` | regenerated (T2.1) | regenerated again (T2.1a) — legitimate, reflects this phase's own changes |
| `docs/architecture/tapping-validation-report.json`/`.md` | regenerated (T2.1) | regenerated again (T2.1a) — record count 20 → 29 |

**No existing numeric value was altered in T2.1a.** The 6 pre-existing UNC/UNF tapping_profile records kept their exact `hole_preparation` values; they only gained the new `iso_2306_alternative_drill` sibling field. `metric_threads.seed.json`, `metric_tapping.seed.json`'s records, and all metric entities/relationships/standards were untouched by T2.1a.

## Files Created (3) — T2.1a's own required audit deliverables

| File | Reason |
|---|---|
| `audit/t2-1a-unc-unf-coverage.json` | Structured report: every new record, every field's provenance/tier/status, rejected-value log, before/after counts |
| `audit/t2-1a-unc-unf-coverage.md` | Narrative report |
| `audit/t2-1a-change-scope.md` | This file |

(T2.1's own 3 audit files — `audit/t2-1-tap-drill-numeric-verification.json`/`.md`, `audit/t2-1-change-scope.md` — were created in the prior phase and remain untouched by T2.1a.)

### Pre-existing, not part of T2.1a (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in every prior phase.

## Scope Discipline Confirmed

- No new relationship predicate was introduced.
- No projection, generator, HTML, sitemap, or navigation file was created or modified.
- No entity or standard record was created or modified in T2.1a (all work was in `data/datasets/`).
- `unc.seed.json`/`unf.seed.json`'s pre-existing 3+3 records were read but not altered.
- ISO 2306 values were never written into `hole_preparation` or used to replace a US-customary value anywhere.

## Production Files Modified

**0.** Verified via `git status --short | grep -E '\.(html|css|xml|txt)$'` → empty.

## Unexpected Files

**None.**

## Final Git Status (cumulative, T2.1 + T2.1a, still uncommitted)

| Category | Count |
|---|---|
| Modified | 9 |
| New (T2.1) | 3 |
| New (T2.1a) | 3 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files touched | 0 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |

Nothing was committed, pushed, reset, cleaned, or stashed in T2.1a.
