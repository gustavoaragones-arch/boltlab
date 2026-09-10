# T27 Status Report

Generated: 2026-09-10 (implementation session, not yet committed)

## Baseline

- Baseline HEAD at start of T27: `911c9cf2f381f4669637b94ef5bee22d3a260634`
- HEAD at report time: `911c9cf2f381f4669637b94ef5bee22d3a260634` (unchanged — nothing committed)
- `origin/main`: `911c9cf2f381f4669637b94ef5bee22d3a260634` (matches HEAD)
- Working tree at start: clean except pre-existing untracked files carried since before T13

## Files modified (10)

```
reference/data-methodology.html
reference/standards/ansi.html
reference/standards/asme.html
reference/standards/british-standards.html
reference/standards/din.html
reference/standards/index.html
reference/standards/jis.html
scripts/build_sitemap.py
scripts/generators/generate-standards-pages.js
scripts/generators/generate-standards-projections.js
sitemap.xml
```

## Files created (5)

```
data/projections/reference/asme_standards.reference.json
docs/T27-STANDARDS-REMEDIATION.md
reports/t27-status.md
scripts/validate-t27.js
scripts/test-t27.js
```

Plus `audit/adsense-quality/` (T26's own deliverables, from the immediately prior phase in this session — not part of T27's change set).

## Treatment per page

| Page | Treatment | Evidence |
|---|---|---|
| `reference/standards/ansi.html` | NOINDEX | `data/standards/ansi/standards.seed.json`: `records: []` |
| `reference/standards/din.html` | NOINDEX | `data/standards/din/standards.seed.json`: `records: []` |
| `reference/standards/jis.html` | NOINDEX | `data/standards/jis/standards.seed.json`: `records: []` |
| `reference/standards/british-standards.html` | NOINDEX | `data/standards/bs/standards.seed.json`: `records: []` |
| `reference/standards/asme.html` | STRENGTHEN | `data/standards/asme/standards.seed.json`: 2 real records (`asme_b1_1`, `asme_b94_9`), each already connected to real BoltLab entities/relationships |

## Validator result

```
$ node scripts/validate-t27.js
...
16/16 checks passed.
T27 VALIDATOR: ALL CHECKS PASSED
```

All 18 mandatory test items from the T27 brief are covered (some combined into single check functions where they share one assertion, e.g. items 12/13 on redirects, items 6/7 on ASME fabrication):

1. All five target URLs accounted for — PASS
2. No placeholder standards page remains indexable — PASS
3. No unintended standards page created — PASS
4. ISO page remains unchanged — PASS (12 files confirmed byte-identical to git HEAD)
5. Existing standards data remains unchanged — PASS (7 seed files confirmed byte-identical)
6/7. ASME content uses only existing source-backed data, no fabricated claims — PASS
8. Retired URLs have correct treatment (NOINDEX) — PASS
9. Sitemap excludes retired/noindex URLs — PASS (224 URLs, verified set)
10. Navigation contains no retired placeholder destinations — PASS
11. Canonicals are correct — PASS
12/13. No redirect loops/chains (no redirects were introduced) — PASS
14. No broken internal links from the standards hub — PASS
15. No duplicate standards URLs — PASS
16. No unrelated production families changed — PASS
17. AdSense remains inactive — PASS
18. `git diff --check` is clean — PASS

## Test suite result

```
$ node scripts/test-t27.js
...
8/8 tests passed.
T27 TEST SUITE: ALL TESTS PASSED
```

Covers: schema conformance of the new ASME projection, fact-by-fact traceability of every ASME page claim to its seed record, verification that the noindexed pages cannot trigger the live client-side ad-injection script (h2-count eligibility check against the actual `js/ads-layout.js` logic), correctness of the sitemap's `is_noindex()` helper against all five target pages, sitemap well-formedness and exact URL count, a guard against ever silently fabricating ANSI/DIN/JIS/BS seed records to "solve" this problem, absence of duplicate sitemap URLs, and confirmation that `data-methodology.html`'s links were updated correctly.

## Three-build determinism result

Ran `generate-standards-projections.js` + `generate-standards-pages.js` three consecutive times, capturing the ASME page, all four stub pages, the hub page, and the ASME projection JSON after each run.

```
build1 vs build2: no differences
build2 vs build3: no differences
```

**Zero unexplained differences of any kind** — not just timestamp-only, fully byte-identical across all three runs for every file in the authorized change set. (The ISO-family outputs were reverted to HEAD after each generator run in this determinism check, per their required "unchanged" status — see the main remediation doc for why running the shared pipeline touches them at all.)

## Full regression suite result

All 9 existing project validators run against the post-T27 repository state:

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

No new errors or warnings attributable to T27. The 5 and 1 pre-existing warnings are identical in count and content to every prior T-phase's baseline (T13–T25). Six `docs/architecture/*-report.{json,md}` files were regenerated as an incidental side effect of running these validators; each diff was confirmed to be a `generated_at` timestamp only and reverted via `git checkout --`, consistent with the convention established across T13–T25.

## Live-behavior check

Pre-deployment baseline (nothing has been pushed, so production is unchanged):

```
https://boltlab.io/reference/standards/ansi              -> 200 (current live, pre-T27 content)
https://boltlab.io/reference/standards/din               -> 200 (current live, pre-T27 content)
https://boltlab.io/reference/standards/jis               -> 200 (current live, pre-T27 content)
https://boltlab.io/reference/standards/british-standards -> 200 (current live, pre-T27 content)
https://boltlab.io/reference/standards/asme              -> 200 (current live, pre-T27 content)
```

True post-deployment live verification (confirming `noindex,follow` is actually served, and the strengthened ASME content is live) is not possible until the changes are committed, pushed, and deployed — which requires Director approval and is explicitly out of scope for this phase. Full local/repository-state verification of the new HTML output was performed instead (see validator/test results above), which is the equivalent check available in this static-site environment.

## Known limitations

- The four NOINDEX pages remain reachable by direct URL and are still linked from within `reference/standards/index.html`'s own generator (`familyPages`) output at their own canonical URL — they are not deleted, only deprioritized from indexing, per the treatment selected.
- `_headers`/`robots.txt` were deliberately left untouched; crawlability is preserved (the pages can still be fetched and their `noindex` directive read) exactly as the brief requires.

## Latent defects discovered (documented, not fixed under T27)

1. `scripts/build_sitemap.py`'s `to_loc()` currently produces `.html`-suffixed URLs for the ~220 pages outside this phase's scope, which does not match those pages' own canonical tags or the currently-committed `sitemap.xml`. This is pre-existing and unrelated to standards remediation; a full run of this script was avoided for that reason, and the sitemap change in this phase was applied as a minimal, verified, direct edit instead. Recommend a dedicated future phase.
2. The ISO reference pages' generated output was already stale relative to current `data/standards/iso/standards.seed.json` and `data/datasets/metric_threads.seed.json` content, independent of T27. The affected artifacts were reverted to their exact committed state rather than absorbed into this phase's diff. Recommend a separate, reviewed phase to decide on refreshing them.

## T27 readiness gate

- [x] All five target pages accounted for with an evidence-based treatment
- [x] No fabricated standards content anywhere
- [x] ISO page and all standards seed data confirmed byte-identical to HEAD
- [x] Sitemap correctly excludes the four noindexed URLs, correctly retains ASME/ISO
- [x] Navigation contains no reference to the retired placeholder URLs as normal content
- [x] Dedicated T27 validator: 16/16 checks pass
- [x] Dedicated T27 test suite: 8/8 tests pass
- [x] Three-build determinism: zero unexplained differences
- [x] Full 9-validator regression suite: pass, no new errors/warnings
- [x] AdSense confirmed inactive throughout
- [x] `git diff --check`: clean
- [x] Nothing committed
- [x] Nothing pushed
- [x] T28 not started

**T27 STATUS: READY FOR DIRECTOR REVIEW.**
