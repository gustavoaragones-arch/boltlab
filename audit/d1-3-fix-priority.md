# D1.3.13 — Fix Priority Classification

Date: 2026-08-11
Source audits: `d1-3-thin-content.md`, `d1-3-placeholder-audit.md`, `d1-3-duplication.md`, `d1-3-discovery.md`, `d1-3-engineering-trust.md`, `d1-3-aeo-quality.md`, `d1-3-product-quality.md`, `d1-3-monetization-safety.md`.

## P0 — Blocker Before AdSense

| # | Finding | Pages | Evidence | Disposition |
|---|---|---|---|---|
| P0-1 | FAQPage structured data with **zero matching visible content** (Pattern A) | 90 (`sizes/*-clearance-hole`, `*-tap-drill`, `*-thread-pitch`, `*-to-inch`, `*-vs-m*`) | `d1-3-aeo-quality.md` | **FIX IMPLEMENTED** — deterministic script adds the page's own existing schema Q&A as a real visible FAQ section, matching the pattern already used correctly on `-bolt-size` pages |

This is the only P0 finding. It qualifies as a blocker (not merely high-priority) because it is a direct violation of Google's structured-data guidelines at meaningful scale (90 pages, ~40% of the `sizes/` cluster), not a subjective content-quality judgment — mismatched/invisible structured data carries real manual-action and rich-result-removal risk independent of whether AdSense specifically is active.

## P1 — High Priority

| # | Finding | Pages | Evidence | Disposition |
|---|---|---|---|---|
| P1-1 | `reference/standards/asme.html` thin (33 words, 2 ad slots) despite real verified data existing in `data/standards/asme/standards.seed.json` that the generator never surfaces | 1 | `d1-3-thin-content.md`, `d1-3-monetization-safety.md` | **FIX IMPLEMENTED** — page rebuilt using the existing `renderProjectionPage()` pipeline and a new projection built entirely from the already-verified `asme_b1_1` knowledge record; no new facts invented |
| P1-2 | `reference/metric-thread-atlas.html` is a genuine orphan — real Dataset page with a working CSV download, zero internal inbound links | 1 | `d1-3-discovery.md` | **FIX IMPLEMENTED** — one discovery link added from `reference/thread-atlas.html` |
| P1-3 | FAQPage schema present, visible FAQ present, but **text differs** between them (Pattern B) | 39 (20 `sizes/*-bolt-size`, 16 `reference/*`, 3 `guides/*`) | `d1-3-aeo-quality.md` | **DEFERRED** — each page has two independently-authored, non-trivial Q&A sets; deciding which is authoritative per page is an editorial judgment call, not a mechanical fix, and doing it for 39 pages in one pass risks exactly the kind of low-care batch edit this phase is designed to avoid. Recommend a dedicated follow-up pass. |
| P1-4 | `reference/standards/{din,jis,ansi,british-standards}.html` remain thin — no underlying verified data exists to enrich them | 4 | `d1-3-thin-content.md`, `d1-3-monetization-safety.md` | **DEFERRED** — per governance, do not invent standards content. Requires a real data-acquisition task (author `data/standards/{din,jis,ansi,bs}/standards.seed.json` records) before these can be honestly enriched. Recommend either that data work, or reducing these 4 pages' ad-slot count as an interim mitigation, before AdSense submission. |

## P2 — Optional

| # | Finding | Pages | Evidence | Disposition |
|---|---|---|---|---|
| P2-1 | "Detailed tolerance tables will be added as verified engineering reference data in future revisions." repeated verbatim on 15 pages | 15 | `d1-3-placeholder-audit.md`, `d1-3-duplication.md` | Deferred — legitimate, non-misleading statement; differentiating it requires new page-specific content this phase has no verified data for |
| P2-2 | `guides/` cluster (13 pages) lacks the site's AEO answer-block convention that reference/size/tool/thread-engineering pages all use | 13 | `d1-3-aeo-quality.md` | Deferred — requires authoring 13 new direct-answer paragraphs; content-authorship task, not a mechanical fix |
| P2-3 | `tools/tap-drill-calculator.html` lacks the same "confirm against your tap manufacturer sheet" hedge that all size-cluster tap-drill pages carry | 1 | `d1-3-product-quality.md` | Deferred — low risk, but bundling it in with the two implemented fixes was judged unnecessary scope creep for this phase; flagged for the next content-touch pass |
| P2-4 | Atlas metadata fields (verification status, verification method, generator build, row count) are not fully consistent between `thread-atlas.html` and `metric-thread-atlas.html` | 2 | `d1-3-product-quality.md` | Deferred — cosmetic consistency, not a defect in either page individually |

## NO ACTION — Acceptable

- `sizes/` cluster template reuse across `-bolt-size`/`-clearance-hole`/`-tap-drill`/`-thread-pitch`/`-to-inch`/`-vs-m*` — each suffix serves a distinct, real search intent (`d1-3-duplication.md`).
- Reciprocal `m18-vs-m20.html` / `m20-vs-m18.html` pair — distinct canonicals, distinct framing, each linked from its natural parent page (`d1-3-duplication.md`).
- `reference/thread-engineering/*` category pages and 2 short chart pages with real data tables — legitimately short, not thin (`d1-3-thin-content.md`).
- Engineering-trust language sitewide — no overclaiming, no fabricated certification/affiliation found (`d1-3-engineering-trust.md`).
- Hub-and-spoke single-inbound-link pattern across ~90 `sizes/`/`thread-engineering` pages — verified as intentional, working architecture, not orphaning (`d1-3-discovery.md`).
- ads.txt, AdSense activation, CMP — explicitly out of scope for D1.3 per governance; status unchanged from D1.2.1 (still not present, still not created).

## Fix Set Implemented in D1.3.14

Exactly 3 changes, all meeting every D1.3.14 safety criterion (evidence-supported, low regression risk, no architecture change, no new/invented data, no new SEO page cluster, no AdSense/CMP/privacy touch):

1. **90-page deterministic patch** — add a visible `<section class="card"><h2>FAQ</h2>...</section>` immediately before `<div class="ad-container">` on every Pattern-A page, using that page's own existing FAQPage schema question/answer text verbatim.
2. **`reference/standards/asme.html` regeneration** — new projection file `data/projections/reference/asme_b1_1.reference.json` built from the existing `asme_b1_1` knowledge record, rendered through the generator's existing ISO-family pipeline (`renderProjectionPage`), replacing the bare stub.
3. **One discovery link** — `reference/thread-atlas.html` gets a new line pointing to `/reference/metric-thread-atlas` as a metric-only dataset with CSV download.

All other findings are documented and explicitly deferred with a stated reason, per governance ("do not implement P0/P1 fixes automatically" beyond what is clearly evidence-supported and safe).
