# T30 — Post-Remediation AdSense Quality Reassessment

Date: 2026-09-11
Type: **FORENSIC REASSESSMENT ONLY** — zero production files created, modified, or deleted.
T26 baseline commit: `911c9cf2f381f4669637b94ef5bee22d3a260634`
T27 commit: `1ce2e735fc22947b22cf88759dc744384ec9dd40`
T28 commit: `7dd2793a399f0f4315db2afd0fe6d1b783c786b0`
T29 commit / T30 HEAD: `c91abddb7d920dab7cda595938e60dd8c0f95a37`

## Primary question

*After T27, T28, and T29, what is the current evidence-based AdSense quality risk profile of BoltLab.io, and what is the single highest-value next action, if any?*

**Answer: the site has materially improved. The one CRITICAL finding is resolved and both HIGH findings are resolved or materially reduced, confirmed with fresh current-state measurement rather than assumption. Everything unresolved is individually MEDIUM or LOW severity and small in scope. No regression was introduced by T27–T29. Recommendation: HOLD — see §16.**

---

## 1. Current URL corpus

| Metric | Count |
|---|---|
| Public HTML pages (filesystem) | **173** |
| Indexable pages | **169** |
| Noindex pages | **4** (`reference/standards/{ansi,din,jis,british-standards}.html`) |
| Redirected/retired URLs | **55** (all with a working, non-chained 301) |
| Sitemap `<loc>` entries | **169** |
| Pages with a canonical tag | **173** (173/173) |
| Duplicate canonical targets | **0** |

**Reconciliation:** 173 filesystem pages − 4 noindexed pages = 169, exactly matching the sitemap count. The only discrepancy between filesystem and sitemap is fully explained by the 4 intentional T27 NOINDEX pages, which are correctly excluded from the sitemap while remaining crawlable (`robots.txt` is unchanged: `User-agent: * / Allow: /`, no crawl restriction). No unexplained discrepancy was found between filesystem, sitemap, canonical declarations, robots directives, noindex directives, or redirects.

**Versus T26 baseline (228 total pages, 228 indexable, 0 noindex, 228 sitemap entries):** total corpus is down 55 pages (−24.1%), all accounted for by T28's consolidation, each with a preserved redirect.

## 2. T26 CRITICAL/HIGH findings, reassessed

| # | Finding | T26 severity | Current classification |
|---|---|---|---|
| 1 | Standards placeholder pages, publicly indexed | CRITICAL | **RESOLVED** |
| 2 | Programmatic size-spoke template duplication | HIGH | **MATERIALLY REDUCED** |
| 3 | Confirmed duplicate-content pairs | HIGH | **PARTIALLY RESOLVED** (1 of 2 pairs) |

**#1 — RESOLVED.** ANSI/DIN/JIS/British Standards now carry `noindex,follow`, are excluded from the sitemap, carry zero ad-slot markup, and their self-admitted "for future BoltLab standards expansion" language is gone, replaced with an honest "BoltLab does not yet maintain source-backed X standard records" statement — confirmed both in the repository and via a live fetch of `https://boltlab.io/reference/standards/ansi`, which matches. ASME grew from 94 to **478 article words**, drawing only on the pre-existing `asme_b1_1`/`asme_b94_9` seed records, and gained `BreadcrumbList`+`WebPage` schema it previously lacked entirely.

**#2 — MATERIALLY REDUCED.** The `clearance-hole`, `thread-pitch`, and `to-inch` families (54 of the originally-cited 72 English pages) no longer exist as standalone URLs — each is folded into its `mN-bolt-size.html` hub, verified zero-remaining on disk, 55/55 redirects confirmed. Of the remaining 18 `tap-drill` pages, **9** (the diameters actually covered by BoltLab's tapping dataset) now carry a genuine Atlas cross-link section; measured similarity between a strengthened and an unstrengthened sibling (M10 vs M11) dropped to **0.917**. The other **9** tap-drill pages are completely unchanged and measured at exactly **1.0** similarity to each other (M9 vs M11) — the original pattern persists at 1/10th its former scale. `es/sizes/perno-N` received the same treatment (similarity M10 vs M11 now 0.818, down from T26's reported 0.92).

**#3 — PARTIALLY RESOLVED.** `sizes/m20-vs-m18.html` no longer exists; its redirect to `m18-vs-m20.html` is confirmed non-chained, and all 17 surviving `vs-*` pages were enumerated and confirmed one-directional (no other reciprocal pair exists in this family). `reference/6g-vs-6h.html` / `6h-vs-6g.html` **both still exist**, both remain in the sitemap, both still self-canonicalize independently (measured similarity 0.86) — this pair was out of scope for T27/T28/T29 and was never addressed.

## 3. T29 target reassessment

| Page | T26 words | Current article words | Classification |
|---|---|---|---|
| `charts/tap-drill-chart.html` | 48 | **279** | ADEQUATE |
| `charts/screw-size-chart.html` | 51 | **245** | ADEQUATE |
| `tools/fastener-weight-calculator.html` | 139 | **430** | STRONG |
| `tools/drill-bit-converter.html` | 141 | **441** | STRONG |

All four now fall within or above the 250–540 word range T26 identified for "stronger sibling" tools (tap-drill-calculator 351, thread-identifier 358, tapping-workflow 382, screw-identifier 542). Content was verified to be genuinely page-specific: cross-similarity between the two chart additions is **0.026**; between the two tool additions, **0.018** — effectively zero overlap, ruling out templated duplication. Both tool sections were written only after reading the actual `js/weight-data.js`/`js/drill-data.js`/`js/converters.js` implementation and accurately describe real behavior, including a previously-undocumented honest disclosure (the drill-bit converter's nearest-match rounding for non-cataloged inputs). No `FAQPage` schema was added to any of the four. Chart table values and calculator/converter formulas are byte-identical to the T26 baseline (`git diff --stat` across the full range returns nothing for `js/`).

## 4. Current size cluster

| Family | Pages | Notes |
|---|---|---|
| `sizes/mN-bolt-size` | 18 | STRENGTHEN — all 18 now include the folded-in clearance row; 9 also carry an Atlas link |
| `sizes/mN-tap-drill` | 18 | 9 STRENGTHENED (Atlas-linked), 9 unchanged from T26 |
| `sizes/mN-vs-mM` | 17 | Unchanged content; the one duplicate (m20-vs-m18) removed |
| Legacy imperial/screw-size | 6 | Unchanged, genuinely distinct family, correctly untouched |
| `sizes/index.html` | 1 | Unchanged |
| `es/sizes/perno-N` | 18 | STRENGTHEN — same clearance fold-in, 9 Atlas-linked |
| ES legacy + index | 4 | Unchanged |
| **Total size cluster** | **82** | Down from 135 at T26; identical to T28's own reported after-state (T29 did not touch this cluster) |

Consolidation content-loss check: every value present on the 55 retired pages was independently re-verified (re-running `scripts/validate-t28.js`'s data-integrity check) to be preserved verbatim on its surviving hub page. No new low-value outlier page was found among the 82 survivors. Zero duplicate pairs remain within the size cluster itself.

## 5. First-party value prominence

The Tapping Atlas now has **33 inbound internal links**, of which **28 are new** since T26 (18 from `sizes/`, 9 from `es/sizes/`, 1 from `charts/tap-drill-chart.html`) — T26's "not cross-linked at the per-size level" finding is measurably narrower now, though honestly bounded: only the 9 diameters the tapping dataset actually covers link to it, so roughly half the size cluster still has no path to it (correct behavior, not a defect — linking further would be a false coverage claim). `reference/data-methodology` and `reference/thread-atlas` remain footer-level links on ~140 of 173 pages, unchanged, still not in-context. The homepage is unchanged since before T26 (last touched in a pre-T26 commit); the Tapping Atlas is still presented as one card among several rather than a flagship differentiator — this was out of scope for all three completed phases and remains an open, low-severity prominence gap.

## 6. Guide/reference quality

13 guides and ~25 reference-concept pages remain **unchanged** since T26 — confirmed via `git log`, no commit since before T26 touches any guide or reference-concept file (the only reference-directory edits were T27's `data-methodology.html` link-list update and `reference/standards/index.html`'s regeneration, neither a concept page). Word counts sampled (280, 344, 98, 518) are consistent with T26's reported range. Severity: MEDIUM, weak, exactly as T26 characterized — a normal, expected content type, the least differentiated rather than defective. Not material at the corpus level; not escalated by the corpus shrinking elsewhere.

## 7. FAQ schema

`FAQPage` usage dropped from 199/228 (87.3%) to **145/173 (83.8%)** — a proportional decrease of 3.5 points, fully explained by the 55 retired pages (54 of which carried the schema). **Zero new FAQPage blocks were added** by any of T27/T28/T29 (confirmed: ASME's FAQ draws from real seed-record content, not a template; T29 was explicitly instructed not to add any and none were found). The surviving 59 `sizes/*.html` pages still carry the same single-fact, per-page-templated FAQ pattern T26 flagged. Classification: MATERIALLY REDUCED in volume, STILL a weak/secondary MEDIUM signal in pattern — unchanged in kind from T26's own assessment that this "resolves automatically" as consolidation proceeds, and it has, proportionally to how far consolidation has gone.

## 8. Structured-data consistency

`sizes/*.html` still carries zero `BreadcrumbList`/`WebPage` schema (0 of 60) — unchanged, correctly out of scope for all three phases. `reference/standards/asme.html` moved from **zero** JSON-LD at T26 to a full `BreadcrumbList`+`WebPage`+`FAQPage` set matching the tapping domain's schema tier — a genuine, isolated improvement. The 4 noindexed standards stubs still carry no JSON-LD, consistent with their minimal, de-promoted status. No misleading or duplicate schema was found anywhere; every schema block checked matches its page's visible content.

## 9. Trust / E-E-A-T

Publisher identity, `Organization` JSON-LD, and the core methodology page content are unchanged (already-satisfied requirements, untouched). Visible last-reviewed/last-updated language is present on 9 of 173 pages (5.2%, up slightly in proportion from 9/228 at T26) — the set changed: ASME newly carries a genuine, source-derived "last reviewed 2026-08-15" date pulled from the real seed record, not fabricated. The standards-stub trust inconsistency T26 flagged (self-admittedly incomplete pages sitting in the sitemap as normal content) is resolved. The "no path from weak content to methodology" gap is **partially** narrowed (28 size-cluster pages + 1 chart now link to the Atlas) but not closed (none link directly to `reference/data-methodology.html` itself — outside every phase's authorized scope). No fabricated credentials, authors, or reviewers were introduced anywhere, confirmed across all three phases' content.

## 10. Content freshness

| | T26 | T30 |
|---|---|---|
| % of sitemap URLs unmoved 5+ months | 70% (159/228) | **~75% (127/169)** |

The `2026-04-15` cohort dropped from 90 to 35 URLs (the 55 T28-retired URLs' exact removal from the sitemap). In absolute terms 32 fewer URLs are stale. As a *proportion* of a smaller corpus, the stale share rose slightly — the retired pages were themselves part of the stale cohort, so removing them shrank the denominator faster than the numerator. Separately: **none of the 45 STRENGTHEN-treated pages had their sitemap `lastmod` bumped** despite real content changes in T27–T29 — the sitemap's freshness metadata now understates how recently exactly those pages were substantively improved. This is a real, minor, honest observation, not evidence of a mass-staleness problem, and no mass date-change is recommended. The remaining stale cohort is a mix of genuinely-stable reference content (not a problem) and the still-unstrengthened 9 tap-drill pages plus legacy/vs-comparison pages (the same "one-shot, never revisited" pattern T26 flagged, at smaller scale).

## 11. Live vs. repository

Live inspection **was available** and was used for 3 representative samples covering the three completed phases:

- `https://boltlab.io/tools/drill-bit-converter` — **match**, T29 content live verbatim.
- `https://boltlab.io/reference/standards/ansi` — **match**, T27's honest reworded copy is live, no "future expansion" language, noindex-consistent presentation.
- `https://boltlab.io/sizes/m10-bolt-size` — **match**, T28's clearance row, Atlas note, and trimmed 2-link list are all live.

Homepage, legal pages, other Spanish pages, and the tapping reference products were not independently re-fetched live in this phase (none was touched by T27–T29, and T26 already established general deployment currency for the untouched majority of the site — this is disclosed explicitly, not claimed as exhaustive). No stale deployment, missing content, incorrect canonical, redirect anomaly, or visible ad artifact was found in the samples checked.

## 12. Advertising state

`ads.txt` and `robots.txt` are byte-identical to their pre-T26 commit. Zero active ad-network script (`adsbygoogle`, `googlesyndication`, `data-ad-client`) exists anywhere in HTML or production JS — the only 2 string matches found are inside `scripts/validate-t27.js` and `scripts/validate-t28.js`, which check *for the absence* of activation. The "Sponsored" label count dropped from 181 to **122**, entirely explained by T27's and T28's page removals/de-monetization of noindexed stubs. Ad-slot scaffolding remains present but inert everywhere, unchanged in kind. **PASS, unchanged from T26** — no advertising-state regression or improvement of substance across any phase.

## 13. Regression check

Zero broken internal links found across the entire 173-page corpus (every `href` resolved). Zero duplicate canonical targets. 4 "orphaned" pages found (the noindexed standards stubs) — this is **expected, not a regression**: T27 intentionally removed their normal navigation links as part of correctly de-promoting noindexed content, while keeping them directly reachable and unblocked by `robots.txt`. One reciprocal duplicate pair remains (`6g-vs-6h`/`6h-vs-6g`) — **pre-existing, not a regression**, out of scope for every completed phase. `git diff --stat` across the full `911c9cf..HEAD` range confirms **zero changes** to any tapping dataset, entity, relationship, standard, generator, validator, `js/` file, `ads.txt`, or `robots.txt`. `scripts/validate-t28.js` now reports 19/22 instead of 22/22 — **not a regression**: the 3 newly-failing checks assert on uncommitted git working-tree state that is naturally no longer true now that T28 has been committed; the actual repository invariants those checks exist to protect were independently re-verified here and found correct. No accidental new thin page, no stale reference to a retired T28 URL, no accidental schema duplication, and no content lost during consolidation was found.

## 14. Corpus-level quality assessment

The proportion of substantive, genuinely differentiated pages has increased: the 55 lowest-value pages are gone, and 27 more (18 bolt-size + 9 tap-drill) plus 4 tool/chart pages were meaningfully strengthened. The programmatic-page share of the total corpus dropped from 59.2% to **47.4%**. First-party engineering content remains a small absolute page count (~2.5% of the corpus) but is now measurably better cross-linked into the content that most needed it. All 14 interactive tools now have substantive pre-interaction content (up from 12 of 14). Indexation discipline improved substantially: `noindex` is now used correctly and narrowly, the sitemap is internally consistent with it, every retirement has a redirect, and no orphan/duplicate-canonical/contradiction exists anywhere. Duplicate-content burden is halved (2 pairs → 1). Trust/provenance signals improved modestly and without fabrication.

**Conclusion:** BoltLab's corpus has moved from *"a mostly coherent utility/reference site whose largest single content family — 59% of all pages — was a low-effort, digit-substituted template cluster, capped by five self-admittedly incomplete indexed pages"* to *"a coherent engineering utility/reference site whose largest content family has been reduced by 41% in page count, partially reconnected to its genuinely strong first-party data asset, and whose single most legible defect is fully resolved."* A residual, much smaller-scale version of the original pattern remains (9 of 18 tap-drill pages still literally identical to each other; the site's homepage still doesn't foreground its strongest asset), but neither residual item is comparable in severity or volume to what T26 found. This is no longer a "collection of utilities" problem in the sense T26's evidence described.

## 15. Before/after scorecard

See `T30-post-remediation-reassessment.json`'s `before_after_scorecard` array for the full 14-row table with per-metric confidence ratings. Headline rows:

| Metric | T26 | T30 | Change |
|---|---|---|---|
| Total public pages | 228 | 173 | −55 (−24.1%) |
| Indexable pages | 228 | 169 | −59 |
| Size-cluster pages | 135 | 82 | −53 (−39.3%) |
| Standards placeholder pages (indexed) | 5 | 0 | −5 |
| Thin chart/tool targets | 4 | 0 | −4 |
| Confirmed duplicate pairs | 2 | 1 | −1 |
| FAQPage schema exposure | 199/228 (87.3%) | 145/173 (83.8%) | −54 pages |
| Freshness skew (5+ months stale) | 70% | ~75% | +5pp proportion, −32 absolute |
| Advertising-state concerns | 0 active | 0 active | No change |

Two rows in the JSON are marked "Not directly comparable — methodology differs" (1.0-similarity page count; Atlas inbound-link count) because T26 did not report those specific figures in a form this phase could reproduce exactly — reported instead as the closest honest current-state equivalent, not manufactured to match.

## 16. Remediation decision

**Current risk ranking:** CRITICAL — none. HIGH — none. MEDIUM — 3 (residual 9 tap-drill pages; `6g-vs-6h` duplicate pair; guides/reference differentiation, unchanged). LOW — 3 (homepage/IA prominence; stale sitemap `lastmod` on strengthened pages; sparse last-reviewed dates). PASS — 5 (accessibility, data export, crawler visibility, advertising inactivity, deployment currency).

Full evidence, affected pages, and per-item "implementation warranted?" judgment for each ranked item are in the JSON's `current_risk_ranking` array.

**NEXT ACTION: HOLD**

The one CRITICAL finding is resolved and both HIGH findings are resolved or materially reduced, verified with fresh, quantitative evidence. Every remaining item is individually MEDIUM or LOW, small in scope, and either requires an editorial/IA judgment call better made deliberately (the 9 remaining tap-drill pages; homepage prominence) or is real but trivial relative to the overhead of another formal phase (the 2-URL `6g-vs-6h` duplicate; sitemap `lastmod` accuracy). No regression was introduced by T27, T28, or T29. Three consecutive implementation phases just concluded; the evidence does not show a remaining structural or volume-level problem comparable to what justified them — further immediate implementation would have diminishing returns relative to its process cost.

Per governance: this conclusion does **not** imply the site is ready for or should be submitted for another AdSense review — that determination is outside this phase's purpose and is not addressed here.

## Future initiatives

The Fastener Load & Strength / Bolt & Screw Load Capacity initiative remains **HELD** — do not begin until the AdSense remediation sequence is sufficiently resolved. This assessment's conclusions were not influenced by that initiative's existence.

## Scope discipline confirmation

No validator, generator, projection, product, dataset, entity, relationship, standard, template, sitemap, robots.txt, ads.txt, redirect, or client-data file was modified during this reassessment. No existing T26 audit file was modified. Nothing was committed or pushed. See the final report delivered in conversation for the `git status`/`git diff --stat` confirmation.
