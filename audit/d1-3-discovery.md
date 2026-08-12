# D1.3.9 — Dead-End / Orphan Audit

Date: 2026-08-11
Method: built a full internal link graph (every `href="/..."` from every indexable page, resolved against canonical URLs) from `audit/d1-3-page-inventory.json`, then checked every page's inbound link count and traced the source of low-inbound-count pages to determine if they represent real architecture (hub → spoke) or genuine discovery failures.

## True Orphans (zero internal inbound links)

**1 page:** `reference/metric-thread-atlas.html`

- Real, working `Dataset`-schema page (357 words) with a live CSV download at `/downloads/metric-thread-atlas.csv` (verified to exist and be non-empty).
- It is listed in `sitemap.xml`, so search engines can still discover and crawl it — this is not an indexation problem — but **no page anywhere on the site links to it**. A visitor cannot reach it through any navigation path, including the Reference hub, the Standards hub, or the Unified Thread Atlas (`reference/thread-atlas.html`), which is the page's closest topical neighbor and the one place a user would naturally expect to find a link to a metric-only variant.
- This is a genuine dead-end/discovery failure for a real, working data product — not a duplication or thin-content problem (see `audit/d1-3-duplication.md` for why it's not being treated as a duplicate of the Unified Thread Atlas).
- **Recommended and implemented fix (D1.3.14):** add one discovery link from `reference/thread-atlas.html` (the Unified Thread Atlas) pointing to the Metric Thread Atlas as a "metric-only dataset with CSV download" cross-reference. This is a single-line, single-page, zero-regression-risk addition that directly resolves the only true orphan found in the entire site.

## Pages With Exactly One Inbound Link (checked individually, not automatically flagged)

A large number of `sizes/*` spoke pages (clearance-hole, tap-drill, thread-pitch, to-inch, vs-comparison variants) and the 6 `reference/thread-engineering/*` category pages each have exactly one inbound link. In every case checked, this is a **deliberate, working hub-and-spoke pattern**, not a discovery failure:

- `sizes/m6-clearance-hole.html`, `sizes/m6-tap-drill.html`, `sizes/m6-vs-m8.html`, etc. are each linked once — from their local hub `sizes/m6-bolt-size.html` — which is itself linked from `sizes/index.html`. This gives every spoke page a real, working 2-hop discovery path from the Sizes hub.
- `reference/thread-engineering/{inspection,thread-geometry,engineering-tables,fit-classes,thread-standards,thread-tolerances}.html` are each linked once, from `reference/thread-engineering/index.html`, and each in turn links onward to 3–5 real content pages plus related tools. This is a normal hub→category→content structure, not a dead end.
- `charts/bolt-grade-chart.html` is linked once, from `charts/index.html` — same healthy pattern.

**Verdict: none of these are orphans.** Single-inbound-link is not itself a defect when the single link is a working, appropriate parent-hub relationship. Per governance ("do not blindly increase link density... only add links when they improve a genuine user workflow"), no additional links were added to any of these pages.

## Hub Completeness Check

- `sizes/index.html` links to 25 of the 24 primary `mN-bolt-size.html` / odd-imperial `screw-size.html` hub pages (one link resolves to an anchor/variant of an existing page) — effectively complete coverage. Every primary size hub is reachable from the Sizes index, and every spoke page is reachable from its primary hub. **No missing child links found.**
- `reference/standards/index.html` links to all 6 standards family pages (ISO + the 5 thin stub pages), so the thin-content problem documented in `audit/d1-3-thin-content.md` is a content-quality issue, not a discoverability issue — those pages are all correctly linked from their hub.
- `reference/thread-engineering/index.html` links to all 6 of its category pages plus 12 "featured references," "most read," and "recently updated" cross-links.

## Tools ↔ References ↔ Data Connectivity

Spot-checked whether major tools connect to relevant reference/data content and vice versa:

- `tools/thread-identifier.html`, `tools/tap-drill-calculator.html`, and `tools/thread-pitch-to-tpi-converter.html` are all cross-linked from `reference/thread-engineering/index.html`, `reference/standards/iso.html`, and the Unified Thread Atlas — this loop is healthy in both directions.
- `reference/metric-thread-atlas.html` (before the fix) was the one dataset with **no** inbound path from tools or references, consistent with the orphan finding above — the fix (linking it from the Unified Thread Atlas) also resolves this specific tools↔data-product connectivity gap, since the Unified Thread Atlas is already tool-linked.

## Summary

| Finding | Count | Action |
|---|---|---|
| True orphans (0 inbound links) | 1 (`reference/metric-thread-atlas.html`) | Fixed — 1 discovery link added from `reference/thread-atlas.html` |
| Hub/spoke pages with exactly 1 legitimate inbound link | ~90 (sizes spokes + thread-engineering categories + 1 chart) | No action — verified as intentional, working architecture |
| Hubs missing child links | 0 | No action |
| Datasets with no discoverable entry point (post-fix) | 0 | Resolved |
