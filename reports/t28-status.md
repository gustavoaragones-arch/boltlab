# T28 Status Report

Generated: 2026-09-11 (implementation session, not yet committed)

## Baseline

- Baseline HEAD at start of T28: `1ce2e735fc22947b22cf88759dc744384ec9dd40`
- HEAD at report time: `1ce2e735fc22947b22cf88759dc744384ec9dd40` (unchanged — nothing committed)
- `origin/main`: matches HEAD
- Working tree at start: clean except pre-existing untracked files carried since before T13

## Files modified (4)

```
_generate_longtail_sizes.py
_redirects
sitemap.xml
```
Plus 18 `sizes/mN-bolt-size.html`, 9 `sizes/mN-tap-drill.html` (N in {3,4,5,6,8,10,12,16,20}), and
18 `es/sizes/perno-mN.html`.

## Files deleted (55)

```
sizes/m{3..20}-clearance-hole.html   (18)
sizes/m{3..20}-thread-pitch.html     (18)
sizes/m{3..20}-to-inch.html          (18)
sizes/m20-vs-m18.html                (1)
```

## Files created (4)

```
docs/T28-SIZE-CLUSTER-REMEDIATION.md
reports/t28-status.md
scripts/validate-t28.js
scripts/test-t28.js
```

## Treatment counts

| Treatment | Count |
|---|---|
| KEEP | 37 |
| STRENGTHEN | 45 |
| CONSOLIDATE | 55 |
| NOINDEX | 0 |
| REMOVE | 0 |
| **Total** | **137** |

## Validator result

```
$ node scripts/validate-t28.js
...
22/22 checks passed.
T28 VALIDATOR: ALL CHECKS PASSED
```

All required check categories from the T28 brief are covered: every affected URL has an explicit
treatment; no KEEP/STRENGTHEN page was accidentally noindexed; T28 introduced zero NOINDEX pages;
no duplicate indexable URLs remain for the m18/m20 comparison intent; canonicals are correct and
self-referencing; no redirect chains; no broken internal links to any retired URL anywhere in the
repository; no fabricated engineering data (every folded-in value verified against the exact
pre-T28 source page via git history); tapping datasets/projections/validators/products untouched;
Spanish pages correctly localized (comma decimals); no new FAQPage schema; no AdSense activation;
no unrelated production family changed; generator output deterministic across repeated runs; every
retained/strengthened page carries a real, verifiable unique-content marker; Tapping Atlas links
only appear for diameters the dataset actually covers; sitemap is well-formed, excludes all
retired URLs, and has no duplicate entries; `git diff --check` is clean; dedicated tapping
validators report unchanged baseline pass/warning counts; `robots.txt` untouched; pre-existing
Specification-table values are byte-unchanged; every filesystem deletion has a corresponding
intentional redirect.

## Test suite result

```
$ node scripts/test-t28.js
...
8/8 tests passed.
T28 TEST SUITE: ALL TESTS PASSED
```

Covers: exact redirect-target correctness for all 54 consolidated-family redirects; the m18/m20
duplicate resolving to exactly one surviving direction with no chain; a concrete similarity
divergence between a strengthened (M10) and unstrengthened (M9) tap-drill page; every hub link
list pointing only at files that actually exist on disk; EN→ES clearance-value conversion
correctness for all 18 sizes; Atlas cross-link presence matching real tapping-dataset coverage
(not just the hardcoded constant); idempotency of a second run of all five migration functions;
and a guard against `write_all()`/`patch_hubs()` ever being wired back into `__main__` without
someone consciously re-deciding the stale-template issue documented in the remediation doc.

## Three-build determinism result

Ran `python3 _generate_longtail_sizes.py` three consecutive times.

```
run1 -> run2: git status --porcelain identical (103 tracked changes, same files)
run2 -> run3: git status --porcelain identical (103 tracked changes, same files)
```

**Zero unexplained differences** — every migration function is marker-guarded/idempotent, so
repeated runs are true no-ops after the first.

## Full regression suite result

All 9 existing project validators run against the post-T28 repository state:

```
validate-knowledge-engine.js      pass
validate-projections.js           pass
validate-tapping-domain.js        pass, 0 errors, 5 warnings (pre-existing, unchanged)
validate-tapping-projections.js   pass, 0 errors, 0 warnings
validate-tapping-atlas.js         pass, 0 errors, 0 warnings
validate-tap-type-guide.js        pass, 0 errors, 0 warnings
validate-tapping-workflow.js      pass, 0 errors, 0 warnings
validate-tapping-evidence.js      pass, 0 errors, 0 warnings
validate-tapping-terminology.js   pass, 0 errors, 1 warning (pre-existing, unchanged)
```

No new errors or warnings attributable to T28. Warning counts identical to every prior T-phase's
baseline (T13–T27). Six `docs/architecture/*-report.{json,md}` files were regenerated as an
incidental timestamp-only side effect of running these validators; reverted via `git checkout --`,
consistent with the T13–T27 convention.

## Similarity re-analysis (before/after, same digit-normalized method as T26)

| Family | Pages before | Pages after | Similarity before | Similarity after |
|---|---|---|---|---|
| tap-drill | 18 | 18 | 0.998 | 0.949 |
| clearance-hole | 18 | 0 (retired) | 0.998 | n/a |
| thread-pitch | 18 | 0 (retired) | 0.998 | n/a |
| to-inch | 18 | 0 (retired) | 0.990 | n/a |
| bolt-size | 18 | 18 | 0.606 | 0.572 |
| vs-comparison | 18 | 17 (1 retired) | 0.998 | 0.999 |
| es-perno | 18 | 18 | 0.872 | 0.805 |

Total size-cluster pages: **137 → 82**. Indexable pages: **137 → 82** (no NOINDEX used; retired
URLs are gone with a working 301, not left crawlable-but-deprioritized). Duplicate content pairs
in scope (`/sizes/`): **1 → 0**.

## Live-behavior check

Pre-deployment baseline (nothing has been pushed, so production is unchanged):

```
https://boltlab.io/sizes/m10-clearance-hole -> 200 (current live, pre-T28 content)
https://boltlab.io/sizes/m10-bolt-size      -> 200 (current live, pre-T28 content)
```

True post-deployment verification (confirming the 301s actually fire and the strengthened content
is live) is not possible until committed, pushed, and deployed — out of scope for this phase, same
as every prior phase. Full local/repository-state verification was performed instead (see
validator/test results above).

## Known limitations / deferred findings

1. `write_all()`'s shared template (`page_shell2`/`HEADER`/`FOOTER`/`internal_block`) is stale
   relative to the actual committed tap-drill/vs-comparison page output (confirmed by a dry run
   against a scratch copy, not just inspection) — see `docs/T28-SIZE-CLUSTER-REMEDIATION.md` for
   the full finding. Not fixed under T28 (would touch 35 unrelated pages); recommend a dedicated
   future phase.
2. A second reciprocal-duplicate pair, `reference/6g-vs-6h.html`/`6h-vs-6g.html`, exists outside
   the `/sizes/` cluster and outside T28's authorized scope. Documented, not touched.
3. `patch_sitemap()` and `HUB_BLOCK_TMPL`/`patch_hubs()` are now confirmed-permanent no-ops
   against current repository state. Left in place (not deleted) per the brief's instruction.

## T28 readiness gate

- [x] All 137 baseline size-cluster URLs accounted for with an evidence-based treatment
- [x] No fabricated engineering content anywhere (verified programmatically against git history)
- [x] Existing tapping datasets/projections/validators/products confirmed byte-identical to HEAD
- [x] Sitemap correctly excludes all 55 retired URLs, correctly retains everything else
- [x] No broken internal links anywhere in the repository
- [x] No redirect chains; all 55 redirects point directly at their final destination
- [x] Dedicated T28 validator: 22/22 checks pass
- [x] Dedicated T28 test suite: 8/8 tests pass
- [x] Three-build determinism: zero unexplained differences
- [x] Full 9-validator regression suite: pass, no new errors/warnings
- [x] AdSense confirmed inactive throughout; `robots.txt`/`ads.txt` untouched
- [x] `git diff --check`: clean
- [x] Nothing committed
- [x] Nothing pushed
- [x] T29 not started

**T28 STATUS: READY FOR DIRECTOR REVIEW.**
