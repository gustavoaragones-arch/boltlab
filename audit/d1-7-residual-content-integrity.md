# D1.7 — Residual Content Integrity Audit

Date: 2026-08-11
Status: **AUDIT COMPLETE — NO REPAIR IMPLEMENTED**

## 1. Executive Summary

Of the six residual findings D1.3 deferred, one is now fully resolved (the 39 Pattern-B FAQ cases, closed by D1.6/D1.6R and reconfirmed here under the stricter question-identity method), and five remain accurate, unchanged, and correctly deferred. No new production defect was discovered. No former P1 item is a genuine blocker. Two items (the Guides/AEO gap and the Atlas metadata inconsistency) are now characterized with more precision than D1.3 had available, which sharpens — but does not change — their priority. Nothing was modified; this is a pure audit.

## 2. D1.7 Scope

Read-only re-audit of six specific D1.3-deferred findings, using the D1.6/D1.6R question-identity-matching governance rule (`docs/architecture/faq-structured-data-governance.md`) wherever FAQ comparison was involved. No production HTML, JSON-LD, CSS, JS, data, generator, sitemap, navigation, legal, AdSense, or CMP file was touched.

## 3. D1.6/D1.6R Boundary

D1.6 and D1.6R are treated as closed and authoritative. This phase did not reopen, reinterpret, or re-litigate any of the 82+1 pages D1.6/D1.6R already fixed — it only reconfirmed their current state as a baseline fact (Section 4) before moving to genuinely untouched findings (Sections 5–9).

## 4. Pattern-B FAQ Reassessment

**Baseline re-derived independently** from `audit/d1-6-affected-pages.json`: the original 39 Pattern-B pages are 20 `sizes/*-bolt-size.html`, 15 `reference/*.html`, 1 `reference/thread-engineering/index.html`, and 3 `guides/*.html` — matching D1.3's original 39 exactly.

**Re-audited using strict question-identity matching** (schema questions matched to visible questions by text, not array position, per governance): extracted both FAQ sets fresh from the live files, built a question→answer dictionary for each side, and compared by key rather than by index.

**Result: 39/39 = MATCHES (Classification A).** Every page's schema question set equals its visible question set exactly, and every matched answer pair is textually identical. No `SCHEMA DIFFERENCE BUT VALID`, no `VISIBLE CONTENT SHOULD BE CANONICAL`, no `EDITORIAL SOURCE REQUIRED`, and no other defect was found on any of the 39 pages. This confirms D1.6's fix was correct and complete for the full original 39-page finding, not merely for a subset, and confirms it holds up under the stricter identity-based method (not just the positional method that originally over-flagged `reference/thread-types.html`).

Full per-page detail: `audit/d1-7-residual-content-integrity.json`.

## 5. Four Standards Pages Reassessment

`reference/standards/{din,jis,ansi,british-standards}.html` — inspected the underlying knowledge layer (`data/standards/{din,jis,ansi,bs}/standards.seed.json`) and searched `data/entities/`, `data/datasets/`, `data/relationships/` for any DIN/JIS/ANSI/British-Standards content added since D1.3.

**Result: unchanged.** All four seed files still contain `"records": []` — zero verified knowledge-layer records exist for any of these four families. No mention of any of these standards families exists anywhere else in the knowledge layer. The four pages themselves are byte-for-byte unchanged from D1.3 (33–34 words, 2 ad slots each, single link back to the Standards hub). No factual defect exists (nothing false is claimed); the pages are legitimately thin because no source material exists to enrich them honestly. **The deferral remains fully justified — enrichment would require new external research/data acquisition, which is out of scope for an audit phase and was correctly not attempted.**

## 6. Future-Revisions Sentence Reassessment

Searched for both wordings of the sentence ("Detailed tolerance tables will be added..." / "Detailed tolerance and class tables will be added...").

**Result: 15/15 pages, unchanged from D1.3** (11 `reference/*` pages using the first wording, 4 `charts/*` pages using the second). Spot-checked two of the reference pages' actual `<table>` elements: they are "Quick Reference" (field/value) and "Key Table" (qualitative attribute/interpretation) tables, not the detailed numeric tolerance/class tables the sentence refers to — so the sentence remains **factually accurate**, not stale. It is **contextually appropriate** on every page that has it (each page genuinely lacks a loaded numeric tolerance table). It does **not** create a materially misleading impression of uniqueness on its own — the surrounding page content differs page to page; only this one disclaimer sentence repeats. **Recommendation unchanged: legitimate, should remain, no rewrite justified without new verified tolerance data to differentiate it.**

## 7. Guides/AEO Reassessment

12 individual guide content pages (`guides/index.html`, the 13th "guide"-classified page, is a hub and is correctly excluded from this question — hubs sitewide do not carry AEO blocks, consistent with `reference/index.html`, `sizes/index.html`, `charts/index.html`).

**Result: 12/12 still lack the `.aeo-answer-block`/`.aeo-direct-answer` structural convention, unchanged from D1.3.** However, closer inspection this phase adds a material nuance D1.3 did not record: **every one of the 12 pages already has a substantive, direct-answer-shaped lede paragraph** (`<p class="muted">` immediately after the H1) that is functionally equivalent in content and purpose to the site's AEO block — it is simply not wrapped in the AEO CSS/structural convention. Sampled 3 of 12 directly (`what-is-tpi.html`, `bolt-vs-screw-difference.html`, `tap-drill-basics.html`): all three ledes already answer their page's core question in 1–2 sentences. This means the absence is **primarily a structural/markup-convention gap, not an absence of substantive answer content** — a meaningfully lower-effort task than D1.3's "requires genuinely authored content" framing implied for at least some of these pages, though a few (like `bolt-vs-screw-difference.html`, whose lede is more discursive) would still benefit from light editorial tightening rather than a pure mechanical wrap. **No AEO block was created.** This remains an editorial-judgment task, now with better-scoped effort estimation, not a mechanical fix suitable for an audit phase.

## 8. Tap-Drill Verification Hedge Reassessment

`tools/tap-drill-calculator.html` — searched for hedge/verification language.

**Result: unchanged from D1.3.** The page uses soft approximation language ("A common metric approximation is major diameter minus thread pitch... gives about 5.0 mm tap drill") but still lacks the explicit "confirm against your tap manufacturer's chart/sheet" instruction that the `sizes/*-tap-drill.html` cluster pages consistently carry. This is a real, low-priority, single-sentence gap — unchanged in scope and severity from D1.3. Not modified.

## 9. Thread Atlas Metadata Reassessment

Compared the "Data quality" section on both `reference/thread-atlas.html` and `reference/metric-thread-atlas.html` in full (not just the JSON-LD `Dataset` block, which D1.3's note focused on).

**Result: the inconsistency is real and slightly more specific than "cosmetic."** The two pages expose **different metadata field sets entirely**, not just different wording of the same fields:

| Field | thread-atlas.html | metric-thread-atlas.html |
|---|---|---|
| Dataset version | Yes (v0.1.0) | Yes (v0.1.0) |
| Verification status | Yes ("Verification status: Verified") | Yes, differently labeled ("Verified: Yes") |
| Last reviewed | Yes | Yes |
| Coverage / row count | Yes ("Metric, UNC, UNF (20 rows)") | **No** |
| Generator build version | Yes | **No** |
| Verification method | **No** | Yes |
| Related standards | **No** | Yes |

Also, in JSON-LD `Dataset` schema (not just the visible section): `thread-atlas.html` has no `license` or `distribution` field, while `metric-thread-atlas.html` has both. This is **accurate**, not a defect — `thread-atlas.html` does not itself offer a CSV download (it only cross-links to the Metric Thread Atlas's download), so a `distribution` field would be false if added; its absence is correct.

**Factual accuracy:** no false or contradictory value was found on either page — every displayed field, where present, appears internally consistent. **User interpretation impact:** a user comparing dataset trustworthiness between the two pages sees inconsistent signal sets (e.g., no row count for the page that actually has a downloadable file, which is the one place a row count would be most concretely useful). **Discoverability:** not affected — this is a metadata-completeness issue, not a linking/routing issue. **Assessment: this is a genuine, low-severity editorial-consistency defect, not merely cosmetic, and not a factual-accuracy defect.** A future fix would not require new research — `downloads/metric-thread-atlas.csv` already exists and its row count is directly countable from the file, so a "coverage/row count" field could in principle be added to `metric-thread-atlas.html` without inventing anything — but that determination and any resulting edit is explicitly out of scope for this audit-only phase and was not performed.

## 10. Site-Wide Regression Results

| Check | Result |
|---|---|
| Total pages | 224 |
| FAQPage-bearing pages | 197 |
| Duplicate titles | 0 |
| Duplicate meta descriptions | 0 |
| Pages missing from sitemap | 0 |
| Orphan pages | 0 |
| Broken internal links | 0 |
| JSON-LD parse errors | 0 |
| Duplicate FAQPage blocks per page | 0 |
| Duplicate questions within one page's schema | 0 |
| Hidden FAQ content | 0 |
| `validate-knowledge-engine.js` | PASS, 0 errors, 0 warnings |
| `validate-projections.js` | PASS, 0 errors, 0 warnings |
| D1.5 architecture (`/tools/` hub, header, homepage section, Reference hub split, footer Thread Atlas link) | Confirmed intact |
| Unrelated generated-report diffs | Found (validator timestamps; `audit/d1-3-page-inventory.json`) and reverted — not treated as production defects, per governance |

## 11. Findings by Priority

| Finding | Prior classification | Current classification | Change from D1.3? |
|---|---|---|---|
| 39 Pattern-B FAQ pages | P1-3 (deferred) | **Resolved** — 39/39 MATCHES | Closed by D1.6/D1.6R; reconfirmed here |
| 4 thin Standards pages (DIN/JIS/ANSI/BS) | P1-4 (deferred) | P1-4, deferral reconfirmed | Unchanged — still zero underlying data |
| 15 future-revisions pages | P2-1 (deferred) | P2-1, deferral reconfirmed, confirmed still factually accurate | Unchanged |
| 12 Guides missing AEO blocks | P2-2 (deferred) | P2-2, deferral reconfirmed, effort now better-scoped (structural gap, not full content gap) | Refined, not changed |
| Tap-drill calculator hedge | P2-3 (deferred) | P2-3, deferral reconfirmed | Unchanged |
| Atlas metadata inconsistency | P2-4 ("cosmetic") | **P1-adjacent editorial-consistency gap** (upgraded from purely cosmetic — genuine field-set inconsistency, though still low severity and non-fabrication-risk) | Sharpened — see Section 9 |

**No former P1 item is a genuine blocker.** No new P0 was discovered anywhere in this audit.

## 12. Recommended Subsequent Phase(s)

None of these require urgent action before AdSense submission on their own merits (no factual defects, no structured-data policy violations remain anywhere on the site). If a future phase is authorized:

1. **Lowest-risk, highest-clarity target:** harmonize the Thread Atlas metadata field sets (Section 9) — every value needed already exists in the repository (the CSV row count is directly countable; no new research required).
2. **Requires editorial judgment, not research:** wrap or lightly rewrite the 12 guides' existing lede paragraphs into the site's AEO convention (Section 7) — most of the raw content already exists.
3. **Trivial, single-line:** add the manufacturer-verification hedge to `tools/tap-drill-calculator.html` (Section 8).
4. **Requires new data acquisition (out of scope for a content-integrity phase):** author verified `data/standards/{din,jis,ansi,bs}/standards.seed.json` records before the 4 thin Standards pages can be honestly enriched (Section 5).
5. **No action recommended:** the 15 future-revisions sentence (Section 6) — legitimate as-is; revisit only alongside real new tolerance data.

## 13. Explicit Non-Changes

Zero production files were modified: 0 HTML changes, 0 JSON-LD changes, 0 CSS changes, 0 JS changes, 0 data changes, 0 sitemap changes, 0 navigation changes, 0 legal-page changes, 0 AdSense changes, 0 CMP changes, 0 `ads.txt` changes. The working tree's 83 modified + 9 untracked files are identical, file-for-file, to the D1.6/D1.6R baseline recorded in Step 1 (Section 3 of `audit/d1-7-change-scope.md`).

## 14. Unexpected Files / Reversions

Two categories of validator/tooling side effects were produced and reverted during this phase's own read-only verification steps (same recurring pattern as every prior phase since D1.1):

1. `docs/architecture/validation-report.{json,md}` and `docs/architecture/projection-validation-report.{json,md}` — regenerated timestamps from running the two validators for their pass/fail signal. Reverted via `git checkout --`.
2. `audit/d1-3-page-inventory.json` — overwritten by re-running the D1.3 inventory helper script for the duplicate-title/orphan/JSON-LD checks. Reverted via `git checkout --`.

No other unexpected file was produced. No unrelated source file changed.

## 15. Final Status

**D1.7 STATUS: AUDIT COMPLETE.** 3 files created, 0 production files modified. 1 of 6 residual findings is now resolved (already closed by D1.6/D1.6R, reconfirmed here); 5 remain accurately deferred, with 2 (Guides/AEO effort-sizing, Atlas metadata severity) reported with more precision than before. No blocker. No repair implemented, none required by this phase's charter.

## 16. Governance Compliance

- FAQ correspondence was evaluated by question identity/content, not array position, throughout (per `docs/architecture/faq-structured-data-governance.md`).
- No engineering facts, standards values, or dimensional data were invented, derived, or guessed anywhere in this audit.
- No Standards page was enriched.
- No AEO block was created.
- No editorial rewrite was performed anywhere.
- D1.6/D1.6R's certified FAQ repairs were not reopened, reinterpreted, or altered.
- AdSense: not activated. CMP: not installed. `ads.txt`: not created or modified.
- No commit made. No push made.
