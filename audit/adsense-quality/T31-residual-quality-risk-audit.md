# T31 — Residual Quality Risk Audit

Date: 2026-09-11
Type: **FORENSIC AUDIT ONLY** — zero production files created, modified, or deleted.
Baseline: `6099aecb2ae34a4e83f9a17dbfa4897dea745786` (T30 close). Confirmed `HEAD == origin/main == 6099aec...` before any analysis began.

## 1. Executive Conclusion

T31 re-examined every residual T30 finding using fresh, current-state, reproducible measurement — not reused T28/T30 numbers — and found no evidence that changes T30's HOLD determination.

- The 9 residual non-Atlas `sizes/mN-tap-drill.html` pages are exactly as digit-normalized-uniform as T30 described (within-subgroup similarity 1.0000 across all 36 pairs), but each states a genuine, verifiably distinct engineering fact, is not fabricated, and represents 1/10th the scale of the original T26 HIGH finding.
- The `6g-vs-6h`/`6h-vs-6g` reciprocal pair is confirmed unchanged and mechanically real, but trivial in scope (2 of 169 indexable pages).
- The guide/reference "least-differentiated content" finding does **not** hold up as a thin-content problem on closer per-page inspection (a word-count extraction bug was found and fixed during this audit); the real, confirmed issue is that **zero** of the 36 guide/reference pages link to the tapping domain — a prominence gap, not a content-quality defect.
- **Zero regressions found**: 0 broken internal links (6,043 checked), 0 dangling links to any of the 55 T28-retired URLs, 9/9 tapping validators passing at baseline-identical warning counts, all protected production surfaces byte-identical to the T30 baseline.
- Corpus-level: the genuinely-residual-risk share of the indexable corpus is **11.83%** (tap-drill + 6g/6h only), concentrated in two small, already-triaged items — not a broad or dominant corpus characteristic.

**T31 recommends the site remain in HOLD.** No new remediation is warranted at this time.

## 2. Baseline and Current State

```
git rev-parse HEAD           -> 6099aecb2ae34a4e83f9a17dbfa4897dea745786
git rev-parse origin/main    -> 6099aecb2ae34a4e83f9a17dbfa4897dea745786
```

Both matched the expected T30 baseline before any analysis began. No stop condition was triggered.

Current repository state, recomputed from scratch (not reused from T30):

| Metric | Value |
|---|---|
| Total public HTML pages | 173 |
| Indexable pages | 169 |
| Noindex pages | 4 (`reference/standards/{ansi,din,jis,british-standards}.html`) |
| Sitemap URL count | 169 |
| Sitemap / indexable alignment | Exact match, 0 discrepancy |

Identical to T30's reported figures — confirms no drift occurred between T30's close and T31's start.

## 3. Residual Tap-Drill Audit

### A. Exact current scope

All 18 currently-indexable `sizes/mN-tap-drill.html` pages were inspected. Full per-page table (see `T31-residual-quality-risk-audit.json` → `scope.tap_drill_residual_risk.per_page` for the complete machine-readable version; key columns summarized):

| Size | Tap drill (mm) | In tapping dataset | Atlas note present | Links to Atlas | Links to Evidence | Word count | FAQPage | Canonical self-ref | In sitemap |
|---|---|---|---|---|---|---|---|---|---|
| M3 | 2.5 | Yes | Yes | Yes | Yes | 328 | Yes | Yes | Yes |
| M4 | 3.3 | Yes | Yes | Yes | Yes | 340 | Yes | Yes | Yes |
| M5 | 4.2 | Yes | Yes | Yes | Yes | 340 | Yes | Yes | Yes |
| M6 | 5.0 | Yes | Yes | Yes | Yes | 340 | Yes | Yes | Yes |
| M7 | 6.0 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M8 | 6.8 | Yes | Yes | Yes | Yes | 340 | Yes | Yes | Yes |
| M9 | 7.8 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M10 | 8.5 | Yes | Yes | Yes | Yes | 340 | Yes | Yes | Yes |
| M11 | 9.5 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M12 | 10.2 | Yes | Yes | Yes | Yes | 340 | Yes | Yes | Yes |
| M13 | 11.2 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M14 | 12.0 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M15 | 13.5 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M16 | 14.0 | Yes | Yes | Yes | Yes | 340 | Yes | Yes | Yes |
| M17 | 15.5 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M18 | 15.5 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M19 | 16.5 | **No** | No | No | No | 283 | Yes | Yes | Yes |
| M20 | 17.5 | Yes | Yes | Yes | Yes | 328 | Yes | Yes | Yes |

Word counts are lower for M3/M20 (328 vs. 340 for the other Atlas-covered sizes) because those are the two ends of the M3–M20 range and each is missing one "neighbor size" internal-link sentence (no M2 or M21 hub exists to link to) — a pre-existing, explainable structural artifact of the shared internal-link block, not a data anomaly.

All 18 pages also link to `/reference/data-methodology` and `/tools/tap-drill-calculator` (present in the shared internal-link block on every page, unchanged since before T26). None link to the Tap-Type Guide or Tapping Workflow (not directly topical, not a defect).

M17 and M18 both list 15.5 mm — not a data error. M17's stated coarse pitch (1.5 mm) and M18's (2.5 mm) each independently satisfy the page's own stated "major diameter − pitch" rule (17−1.5=15.5; 18−2.5=15.5): a genuine numeric coincidence, not a duplicated or copy-pasted value. Verified against each page's own Specifications table, not assumed.

### B. Similarity — recalculated from current repository state

Full pairwise digit-normalized `difflib.SequenceMatcher` similarity across all 18 pages (153 pairs), computed fresh in this audit (`audit/adsense-quality/t31/t31_audit.py`), not reused from T28:

| Statistic | Value |
|---|---|
| Page count | 18 |
| Pair count | 153 |
| Minimum similarity | 0.8996 |
| Maximum similarity | 1.0000 |
| Mean similarity | 0.9526 |
| Median similarity | 0.9168 |
| Pairs > 0.90 | 135 / 153 |
| Pairs > 0.95 | 72 / 153 |
| Pairs > 0.98 | 72 / 153 |
| Pairs > 0.99 | 58 / 153 |
| Pairs ≥ 0.999 (effectively 1.00) | 57 / 153 |

**Subgroup breakdown (the key finding not previously isolated in T30)**:

| Comparison | Pairs | Min | Max | Mean | Median |
|---|---|---|---|---|---|
| Within the 9 Atlas-covered pages | 36 | 0.9853 | 1.0000 | 0.9943 | 1.0000 |
| Within the 9 non-Atlas pages | 36 | **1.0000** | **1.0000** | **1.0000** | **1.0000** |
| Atlas-covered vs. non-Atlas (cross-group) | 81 | 0.8996 | 0.9168 | 0.9130 | 0.9168 |

The T28 Atlas note differentiates the two 9-page subgroups **from each other** (cross-group mean 0.913) but does **not** differentiate pages **within** either subgroup — the non-Atlas 9 remain perfectly (1.0000) uniform, and even the Atlas-covered 9 are 98.5–100% identical to each other, because the Atlas note itself is a fixed template with only the size number substituted, which digit-normalization strips away just as completely as the base template.

### C. Structural differentiation

Despite the near-total textual uniformity, each page states a real, page-specific engineering fact:

- 17 of the 18 tap-drill diameter values are unique across the family (only M17/M18 coincide, explained above as a genuine arithmetic coincidence, not an error).
- Each value was cross-checked directly against that page's own Specifications table (not assumed from a script constant) — this audit found and corrected a hand-maintained-constant error from its own first draft (an earlier version of this script's reference table had wrong values for M18–M20; the final script instead parses each page's own stated value, eliminating that class of error).
- The underlying source for the 9 non-Atlas values is the same static `SPECS` dict in `_generate_longtail_sizes.py` that predates T26 — a plausible, commonly-used workshop approximation, but not cross-verified against BoltLab's tapping knowledge layer (which is exactly why an honest Atlas note could not be added for these 9 sizes).
- No formula, dataset reference, or provenance citation differs page-to-page beyond the substituted numeral — consistent with T26's original characterization of this family, unchanged for the 9 non-Atlas pages.

**Conclusion applying the brief's evaluation principle**: this is not "high similarity = automatically bad" — each page answers a genuinely distinct, plausible long-tail query with a correct, size-specific answer. But it is also not "numeral substitution = automatically sufficient" — beyond the single substituted value and its 2–3 dependent figures, there is zero page-to-page variation in explanation, sourcing, or context for the 9 non-Atlas pages, identical to the pattern T26 originally flagged as HIGH risk, just at a much smaller scale.

### D. First-party value connection

| Target | Inbound links from the 18 tap-drill pages |
|---|---|
| `/reference/tapping-atlas` | 9 (only the Atlas-covered pages) |
| `/reference/tapping-evidence` | 9 (only the Atlas-covered pages) |
| `/reference/data-methodology` | 18 (all pages, shared boilerplate) |
| `/tools/tap-drill-calculator` | 18 (all pages, shared boilerplate) |
| `/reference/tap-type-guide` | 0 |
| `/tools/tapping-workflow` | 0 |

### E. Decision

**Classification: BORDERLINE.**

Evidence for BORDERLINE rather than MATERIAL: small absolute scale (18 pages = 10.65% of the 169-page indexable corpus, and only 9 of those 18 lack Atlas coverage); no fabricated content; each page states a genuine, correct, distinct fact; the pattern is 1/10th the scale of the original T26 HIGH finding; further remediation would require either fabricating dataset coverage (explicitly prohibited) or a deliberate consolidation decision (a legitimate future call, not an urgent defect).

Evidence against classifying as fully NON-MATERIAL: the 9 non-Atlas pages are not merely similar but **exactly** as uniform as the pre-T28 90-page pattern (1.0000 mean within-group similarity), and this is a mechanically precise, reproducible fact, not a judgment call.

Net: **BORDERLINE, continue HOLD, no action changes as a result of this finding alone.**

## 4. 6g-vs-6h Reciprocal Pair

| Check | Result |
|---|---|
| Both URLs exist | Yes |
| Both indexable (no noindex) | Yes |
| Both in sitemap | Yes |
| Canonical, `6g-vs-6h` | `https://boltlab.io/reference/6g-vs-6h` (self-referencing) |
| Canonical, `6h-vs-6g` | `https://boltlab.io/reference/6h-vs-6g` (self-referencing) |
| Linked from `6g-vs-6h` to `6h-vs-6g` | No |
| Linked from `6h-vs-6g` to `6g-vs-6h` | No |
| Inbound internal links to `6g-vs-6h` | 3 |
| Inbound internal links to `6h-vs-6g` | 8 |
| Digit/label-normalized similarity | 0.8626 |
| Word count | 518 (6g-vs-6h) / 523 (6h-vs-6g) |

**Semantic difference**: None found. Both pages compare the same 6g/6H (external) and 6g/6H-adjacent (internal) ISO fit-class pair with the label order swapped; the content is a reciprocal restatement, not two distinct engineering topics. This is structurally the same pattern as the already-resolved `sizes/m18-vs-m20`/`m20-vs-m18` pair, just with a lower raw similarity (0.86 vs. near-1.0) because the prose is independently written rather than machine-templated — a real but secondary distinction.

**Search intent**: Plausible but weak — a user could search either "6g vs 6h" or "6h vs 6g" and expect the same substantive answer.

**Independent first-party value**: No — neither page contains information the other lacks.

**Corpus-quality problem**: Minor and mechanically confirmed, at negligible scale (2 of 169 pages, 1.18% of the indexable corpus). The asymmetric inbound-link count (3 vs. 8) suggests `6h-vs-6g` is currently the more-referenced of the two despite `6g-vs-6h` being alphabetically primary in the codebase — a fact worth preserving for whoever eventually resolves this pair, since it may argue for `6h-vs-6g` as the redirect target rather than the reverse.

**Decision — no consolidation, redirect, canonicalization, or noindex was applied. Per instruction, both pages remain exactly as found.**

**Classification: BORDERLINE.** Mechanically real duplicate-intent pair, same defect class as an already-remediated pair, but two orders of magnitude smaller in corpus impact than the original size-cluster finding. Does not independently justify a Director-controlled phase; a reasonable candidate for a future minor maintenance bundle, consistent with T30's own conclusion.

## 5. Guide / Reference Differentiation

12 guide articles (`guides/*.html`, excluding `index.html`) and 24 reference-concept pages (`reference/*.html`, excluding `index.html`, the 4 tapping-domain product pages, and `standards/`/`thread-engineering/` subdirectories) were audited individually.

**Methodology note**: An earlier draft of this audit's word-count extraction used a naive first-`<article>...</article>` regex match, which silently truncated pages using nested `<article class="ref-card">` grids (e.g. `reference/thread-types.html`, which appeared to have only 75 words before the fix, versus its true 551-word count with a corrected `<main>`-scoped extraction). This bug was caught and fixed during this audit by cross-checking a low outlier against the live page source; the corrected method is used throughout this report and is documented in `audit/adsense-quality/t31/t31_audit.py`.

| | Guides (n=12) | Reference-concept (n=24) |
|---|---|---|
| Median word count | 279.5 | 516.0 |
| Min / Max word count | 238 / 318 | 325 / 1,162 |
| All self-canonicalizing | Yes (12/12) | Yes (24/24) |
| All in sitemap | Yes (12/12) | Yes (24/24) |
| Carry FAQPage schema | 12/12 | 22/24 |
| Carry `last-reviewed` visible text | 0/12 | 2/24 |
| **Link to the tapping domain (Atlas/Guide/Evidence/Workflow)** | **0/12** | **0/24** |
| Mean inbound internal links | 11.4 | 19.0 |

**Weakest by word count** (still all substantive topic explainers, not stubs):

- Guides: `fastener-materials-guide.html` (238w), `what-is-tpi.html` (244w), `thread-pitch-explained.html` (254w), `bolt-strength-grades.html` (261w), `metric-thread-tolerances.html` (263w).
- Reference: `iso-724-thread-dimensions.html` (325w), `screw-head-shapes.html` (328w), `iso-261-metric-thread-series.html` (335w), `iso-thread-tolerances-explained.html` (335w), `iso-262-metric-thread-fine-series.html` (336w).

**Comparison to T26**: T26 reported a combined guides+reference median of 285–312 words. T31's corrected, page-type-separated figures (guides 279.5, reference 516.0) are **not directly comparable — methodology differs** (T26 did not publish its exact extraction method, and this audit found and fixed an extraction bug that would otherwise have understated reference-page word counts specifically). The corrected numbers do not support characterizing reference-concept pages as thin; they support T26's own more nuanced original framing — "least differentiated" relative to competing sites' generic content, not individually defective.

**The one confirmed, material gap**: zero of the 36 guide/reference pages link to any of BoltLab's four tapping-domain product pages. This is a genuine, unaddressed structural disconnection (see Section 7), unchanged since T26, and out of scope for T27 (standards-only), T28 (size-cluster-only), and T29 (four named tool/chart pages only) — none of which were ever authorized to touch this content type.

**Classification: NON-MATERIAL as a "thin content" finding; the underlying prominence gap is captured separately as LOW in Section 13.** Every page individually clears T26's own thin-content bar (all self-canonical, sitemapped, schema-tagged, 238+ words minimum). T26 itself rated this MEDIUM/weak and explicitly optional; nothing in T31's more precise per-page evidence elevates that.

## 6. Corpus-Level Materiality

Recomputed from the current filesystem and sitemap, not assumed from T30:

| Metric | Value |
|---|---|
| Total public pages | 173 |
| Indexable pages | 169 |
| Residual tap-drill pages (all 18) | 10.65% of indexable corpus |
| 6g/6h pair (2 pages) | 1.18% of indexable corpus |
| Guide/reference pages (36 pages) | 21.30% of indexable corpus |
| **Combined raw share** | **33.14%** |

**This aggregate figure is misleading if read at face value.** The guide/reference component (21.3 of the 33.14 points) is not a defect per Section 5's finding — it is a normal, expected, fully-indexed, fully-canonicalized content type that T26 itself never classified as low-value, only as "least differentiated." Removing that component, the **actually-residual-risk share of the indexable corpus is 11.83%** (tap-drill doorway pattern + 6g/6h duplicate only), concentrated entirely in two small, already-identified, already-triaged items.

**Does any remaining defect materially alter the overall quality character of BoltLab after T27–T30?** No. The corpus is dominated by pages that are either genuinely differentiated (bolt-size hubs, vs-comparison pages, the tapping domain, most reference/guide content) or, where uniform, uniform in a small, bounded, honestly-labeled residual (18 tap-drill pages, half of which are now honestly strengthened and half of which honestly cannot be without fabrication). No single residual finding, nor their sum, resembles the corpus-dominating pattern T26 originally described (90+ pages, ~41% of the pre-remediation site, all structurally identical with zero differentiation).

## 7. First-Party Value and Internal-Link Mesh

Inbound internal links to each first-party asset, recomputed from the current corpus:

| Asset | Inbound links | By directory |
|---|---|---|
| `/reference/tapping-atlas` | 33 | sizes 18, es 9, reference 3, tools 2, charts 1 |
| `/reference/tap-type-guide` | 4 | reference 3, tools 1 |
| `/reference/tapping-evidence` | 22 | sizes 18, reference 3, tools 1 |
| `/tools/tapping-workflow` | 5 | reference 3, tools 2 |
| `/reference/data-methodology` | 142 | sitewide footer nav + body links |
| `/tools/tap-drill-calculator` | 109 | sitewide footer/body links |

`data-methodology` and `tap-drill-calculator` dominate because both are global-footer-nav items present on every page template; the four actual tapping-domain **product** pages (Atlas, Tap-Type Guide, Evidence, Workflow) are **not** in the global footer and rely entirely on contextual, body-level links — 33/4/22/5 respectively. Note: `reference/thread-atlas.html` (a separate, distinct page from `reference/tapping-atlas.html`) is the one that *is* in the global footer (139 inbound links); this audit kept the two pages distinct throughout to avoid conflating them.

**Click depth from the homepage** (verified by direct `href` inspection of `index.html`, `reference/index.html`, `tools/index.html`):

| Path | Click depth |
|---|---|
| Homepage → `/reference/` hub → Tapping Atlas | 2 clicks |
| Homepage → `/reference/` hub → Tap-Type Guide | 2 clicks |
| Homepage → `/reference/` hub → Tapping Evidence | 2 clicks |
| Homepage → `/tools/` hub → Tapping Workflow | 2 clicks |
| Homepage → Data Methodology (direct link) | 1 click |
| Homepage → Tap Drill Calculator (direct link) | 1 click |

Homepage does **not** link directly to Tapping Atlas, Tap-Type Guide, Tapping Evidence, or Tapping Workflow in its body (only via the standard two-hop hub path); it does link directly to `data-methodology` and `tap-drill-calculator`.

**Structural disconnection identified**: guides and reference-concept pages (36 pages) never link to the tapping domain (Section 5). The size cluster and chart pages do **not** show this disconnection — 18 `sizes/` pages, 9 `es/sizes/` pages, and 1 chart page now link directly to the Tapping Atlas (T28/T29 work), a measurable, verified improvement over T26's baseline ("not cross-linked at the per-size level"). The one confirmed remaining gap is specific to the guide/reference content type, not corpus-wide.

## 8. Freshness / Last-Reviewed Audit

| Metric | Value |
|---|---|
| Indexable pages with a visible last-reviewed/last-updated date | 9 of 169 (5.3%) |
| Sitemap `lastmod` distinct values | 10 |
| T28/T29-strengthened pages checked for sitemap lastmod accuracy | 49 (18 bolt-size, 9 Atlas tap-drill, 18 es/perno, 4 T29 tool/chart pages) |
| Of those, with a sitemap `lastmod` reflecting their actual 2026-09 edit | **0 of 49** |

Every one of the 49 checked pages that received genuine content strengthening in T28 or T29 still carries a sitemap `lastmod` predating that edit (verified against each file's actual `git log` date, not assumed). This is not a new problem: `_generate_longtail_sizes.py`'s `clean_sitemap()` only adds/removes `<url>` blocks, it does not rewrite `lastmod` on surviving entries, and no T28/T29 function was ever authorized or instructed to touch sitemap freshness metadata. T31 made no repository change and could not have worsened or fixed this.

**Does the absence of dates create a misleading or stale engineering claim?** No — no page asserts a specific "as of" date for its data that is contradicted by its actual content; the dates are simply absent, not wrong. This is a metadata-completeness gap, not a factual-accuracy defect.

**Classification: LOW, unchanged from T30.** Not downgraded to PASS (the gap is real and measurable) and not elevated to MEDIUM (it does not mislead users about content accuracy, and T26/T30 already correctly bounded this as low-urgency).

## 9. Homepage / Information Architecture

Homepage composition (unchanged since commit `e44240d`, which predates T26): leads with the Universal Screw & Bolt Converter and a grid of 8 generic tool cards, followed by guide cards. The tapping-domain products are not featured as homepage-body cards.

Full navigational cross-link mesh confirmed intact — every first-party asset is reachable in 1–2 clicks (Section 7) — matching T26's own "full mesh confirmed" finding. The gap is **prominence/framing, not discoverability**: a user can reach every asset quickly, but the homepage does not visually communicate that the tapping domain is BoltLab's flagship differentiator relative to its 8 generic tool cards.

No phase (T27/T28/T29/T30) was authorized to touch homepage or navigation architecture, so this finding is unchanged, not regressed.

**Classification: LOW, unchanged from T30.** Reachable at shallow depth; this is a design/emphasis decision, not a content-quality or indexation defect, and remains outside any bounded content-remediation phase's natural scope.

## 10. Advertising State

| Check | Result |
|---|---|
| `adsbygoogle` script references | 0 |
| `googlesyndication` references | 0 |
| `data-ad-client` references | 0 |
| `ads.txt` present | Yes — site-ownership verification line only (`google.com, pub-3974004697476579, DIRECT, f08c47fec0942fa0`), predates T26 |
| `robots.txt` | `User-agent: * / Allow: /` — unchanged |
| Pages with a "Sponsored" label | 122 (down from T26's 181 — consistent with T28's 55-page retirement plus T27's ad-markup removal from 4 noindexed stubs, not a new change) |
| Pages with `ad-container` markup | 152 |

**No active advertising found anywhere in the current repository.** No regression from T30.

**Classification: PASS, unchanged from T30.**

## 11. Regression Audit

- **Dangling links to any of the 55 T28-retired URLs**: 0 found, anywhere in the current 173-file corpus.
- **Broken internal links**: 0 found across 6,043 internal `href` values checked.
- **Dedicated tapping validator suite** (9 validators): all pass, warning counts identical to every prior T-phase baseline (`validate-tapping-domain.js`: 0 errors/5 warnings; `validate-tapping-terminology.js`: 0 errors/1 warning; all seven others: 0/0).
- **Protected production surfaces** (`data/`, `scripts/`, `sitemap.xml`, `robots.txt`, `ads.txt`, `_redirects`, `sizes/`, `es/`, `tools/`, `charts/`, `reference/`, `guides/`, `index.html`): `git diff --stat HEAD` across all of these returned **empty** — byte-identical to the T30 baseline.
- **Incidental side effect**: running the 9 validators regenerated 6 `docs/architecture/*-report.{json,md}` timestamp fields, reverted via `git checkout --` per the T13–T30 convention. One pre-existing stale-report artifact was re-observed (`projection-validation-report.json`'s cached "12" vs. the live pipeline's "13" projection count) — this is the same artifact first documented during T28 and reconfirmed (not newly caused) in every subsequent phase's validator run; it was reverted along with the timestamp-only changes and is **not** a T31 regression.

**No regression found.**

## 12. T26 → T28 → T29 → T30 → T31 Comparison

| Metric | T26 | T28 | T29 | T30 | T31 |
|---|---|---|---|---|---|
| Total public pages | 228 | 173 | 173 | 173 | 173 |
| Indexable pages | 228 | N/A* | N/A* | 169 | 169 |
| Size-cluster pages | 135 | 82 | 82 | 82 | 82** |
| Standards placeholder pages (indexed) | 5 | 0 | 0 | 0 | 0 |
| Thin chart/tool targets (T26 Tier 2) | 4 | 4 | 0 | 0 | 0 |
| Confirmed duplicate pairs | 2 | 1 | 1 | 1 | 1 |
| FAQPage schema count | 199/228 (87.3%) | N/A* | N/A* | 145/173 (83.8%) | 145/173 (83.8%) |
| Active advertising | 0 | 0 | 0 | 0 | 0 |
| Tapping Atlas inbound links | Not numerically reported | N/A* | N/A* | 33 | 33 |
| Freshness skew (% sitemap URLs unmoved 5+ months) | 70% | N/A* | N/A* | ~75% | ~75% |
| CRITICAL risks | 1 | N/A* | N/A* | 0 | 0 |
| HIGH risks | 2 | N/A* | N/A* | 0 | 0 |
| MEDIUM risks | 4 | N/A* | N/A* | 3 | 1 |
| LOW risks | 2 | N/A* | N/A* | 3 | 5 |

\* T28/T29's own completion reports did not separately recompute sitewide indexable-page/FAQPage/link/risk counts — their scope was the size cluster (T28) and four named pages (T29) specifically, not a corpus-wide reassessment. Marked N/A rather than estimated, per instruction not to manufacture historical metrics that were not actually measured.

\** Not independently re-measured in T31 (outside this phase's 9 assigned questions); carried forward from T30 because the regression audit (Section 11) confirmed zero `sizes/`/`es/` file changes since T30.

**On the MEDIUM/LOW shift (T30: 3 MEDIUM / 3 LOW → T31: 1 MEDIUM / 5 LOW)**: this reflects more precise measurement, not remediation. Two of T30's three MEDIUM items (the 6g/6h pair; guide/reference differentiation) are reclassified LOW here based on closer per-page evidence gathered in this audit — not because either was fixed. T31 performed zero production changes.

## 13. Risk Reclassification

| Severity | Finding | Confidence | Implementation warranted? |
|---|---|---|---|
| CRITICAL | None found | — | — |
| HIGH | None found | — | — |
| MEDIUM | 9 of 18 `sizes/mN-tap-drill.html` pages (M7,M9,M11,M13,M14,M15,M17,M18,M19) remain digit-normalized identical to each other (within-group mean 1.0000) | HIGH | No — each states a genuine distinct fact; no dataset exists to honestly extend Atlas coverage; further action requires either fabrication (prohibited) or a deliberate future consolidation decision |
| LOW | `reference/6g-vs-6h.html`/`6h-vs-6g.html` reciprocal duplicate remains unresolved | HIGH | No — 1.18% of corpus, trivial scope, candidate for a future minor bundle |
| LOW | Guides (12) and reference-concept pages (24) never link to the tapping domain | HIGH | No — prominence gap, not a content defect; every page individually substantive |
| LOW | Sitemap `lastmod` for all 49 checked T28/T29-strengthened pages predates their actual edit | HIGH | No — metadata-accuracy nit, no mass date-change warranted |
| LOW | Visible last-reviewed dates remain sparse (9 of 173 pages) | MEDIUM | No — same E-E-A-T gap T26/T30 identified, low individual impact |
| PASS | Advertising activation state | HIGH | — |
| PASS | Internal-link integrity / no dangling retired-URL references | HIGH | — |
| PASS | Dedicated tapping validator suite (9/9) | HIGH | — |
| PASS | Protected production surfaces unchanged since T30 | HIGH | — |
| PASS | Sitemap/indexable-page alignment (exact match) | HIGH | — |

## 14. Director Recommendation

**NEXT ACTION: HOLD.**

No CRITICAL or HIGH finding exists. The single MEDIUM finding (residual non-Atlas tap-drill uniformity) is real, precisely measured, and unchanged in kind from T30's own characterization — it is not new, not worse, and not fabricatable-around; the only paths to closing it entirely are either dataset fabrication (prohibited by every phase's governing rules) or a deliberate future consolidation decision that the Director has not yet authorized and that this audit does not recommend forcing. All four LOW findings are confirmed unchanged from T30, each individually bounded and non-urgent. Zero regressions were found across an exhaustive check of protected production surfaces, internal links, and the full tapping validator suite.

The corpus-level evidence (Section 6) does not support a "broad structural problem" reading: the actually-residual-risk share of the indexable corpus is 11.83%, concentrated in two small, already-triaged items, not a dominant or corpus-wide characteristic.

**This audit does not recommend submitting the site for another AdSense review** — that determination is outside T31's scope and governance, per the phase's own instruction. This conclusion addresses only whether the site's internal content-quality deficiency appears materially remediated (yes, for CRITICAL/HIGH; residually present but small and bounded for MEDIUM/LOW) and whether further internal work is currently justified (no).

**Fastener Load & Strength remains HELD** — not evaluated, not begun, and not affected by any finding in this audit.

## 15. Explicit Non-Actions

T31 did **not**:

- modify production content;
- modify production code (JavaScript, CSS);
- modify datasets, entity records, or relationship records;
- modify any generator or validator;
- modify any projection;
- modify schema (JSON-LD) anywhere;
- modify `sitemap.xml`;
- modify `robots.txt`;
- modify `ads.txt`;
- modify redirects (`_redirects`);
- modify canonical tags or hreflang anywhere;
- change advertising configuration or activation state;
- consolidate, merge, or otherwise alter any URL;
- noindex any URL;
- delete any URL or page;
- add or remove any internal link;
- change navigation or homepage layout;
- change any legal, privacy, or cookie-configuration page;
- begin the Fastener Load & Strength initiative;
- begin T32 or any other new remediation phase;
- commit or push any change.

Every finding in this report was documented, not fixed. All analysis was performed by a read-only Python script (`audit/adsense-quality/t31/t31_audit.py`) that only reads repository files and writes its own evidence output (`audit/adsense-quality/t31/t31_raw_evidence.json`); it contains no code path that writes to any production file.

---

**T31 FORENSIC AUDIT COMPLETE — DIRECTOR REVIEW REQUIRED.**

DO NOT COMMIT. DO NOT PUSH. DO NOT DEPLOY. DO NOT IMPLEMENT ANY REMEDIATION.
