# T2.1 — Change Control

Date: 2026-08-15

## Baseline (before T2.1)

```
git status --short  →  clean except 3 pre-existing untracked D2.0 audit files
HEAD                  →  8c6dd16 "T2: Tapping Data Acquisition & Verification (PASS WITH GAPS)"
```

## Files Modified (7) — all EXPECTED

| File | Change | Reason |
|---|---|---|
| `data/datasets/metric_tapping.seed.json` | 9 records' `hole_preparation` gained `cross_verified`; `source_standards` gained `iso_2306`; `verification_method`/`last_reviewed`/`updated` updated | Primary-source (ISO 2306 Table 1) exact-match confirmation for the 9 target coarse-pitch sizes |
| `data/datasets/unc_tapping.seed.json` | `verification_method`/`last_reviewed`/`updated` updated (no record values changed) | Documents the different-standard conflict found against ISO 2306 Table 3 |
| `data/datasets/unf_tapping.seed.json` | Same as above | Documents the conflict found against ISO 2306 Table 4 |
| `docs/architecture/validation-report.json`/`.md` | Regenerated | Result of running `validate-knowledge-engine.js` after this phase's changes |
| `docs/architecture/tapping-validation-report.json`/`.md` | Regenerated | Result of running `validate-tapping-domain.js` after this phase's changes |

**No existing numeric value in any dataset was changed.** `unc.seed.json`, `unf.seed.json`, and `metric_threads.seed.json` (the base thread datasets) were read but not modified — confirmed correct/unchanged for metric, confirmed to differ-by-convention (not corrected) for UNC/UNF.

## Files Created (2) — T2.1's own required audit deliverables

| File | Reason |
|---|---|
| `audit/t2-1-tap-drill-numeric-verification.json` | Structured classification of all 24 target sizes (VERIFIED/SOURCE_BOUND/CONTEXTUAL/PENDING/UNAVAILABLE) |
| `audit/t2-1-tap-drill-numeric-verification.md` | Narrative report |
| `audit/t2-1-change-scope.md` | This file |

(3 files total; table above lists 2 plus this one.)

### Pre-existing, not part of T2.1 (3)

`audit/d2-0-adsense-readiness.json`, `audit/d2-0-adsense-readiness.md`, `audit/d2-0-change-scope.md` — untouched, as in T1 and T2.

## Explicit Scope Boundary Not Crossed

`data/datasets/unc.seed.json` and `data/datasets/unf.seed.json` were **not** modified to add the 9 target sizes (#4-40, #6-32, #8-32, #10-24, 1/2-13 UNC; #6-40, #8-36, #10-32, 1/2-20 UNF) that ISO 2306 now provides values for but that have no existing BoltLab base-thread record. This would extend a pre-existing, previously-verified, non-tapping-domain dataset — flagged as a decision point in `audit/t2-1-tap-drill-numeric-verification.md` rather than executed unilaterally.

## Production Files Modified

**0.** Verified via `git status --short | grep -E '\.(html|css|xml|txt)$'` → empty.

## Unexpected Files

**None.**

## Final Git Status (T2.1 only, cumulative with T2's now-committed state)

| Category | Count |
|---|---|
| Modified | 7 |
| New (T2.1) | 3 |
| New (pre-existing, untouched) | 3 (D2.0) |
| Production files touched | 0 |
| Staged | 0 |
| Committed | 0 |
| Pushed | 0 |
