# D1.3.11 — AEO Quality Audit

Date: 2026-08-11
Scope note: this audit does **not** propose redesigning the AEO system. It audits the existing `aeo-answer-block` convention and existing FAQPage structured data for accuracy, relevance, and — the headline finding below — whether structured data actually matches what is shown to users.

## Headline Finding: FAQPage Structured Data Not Matching Visible Content

This is the single most important finding in the entire D1.3 audit. Google's structured-data guidelines are explicit that FAQPage markup must reflect content that is actually visible to the user on the page; marking up content that isn't shown is treated as a spam/policy violation, not merely a style issue.

Two distinct sub-patterns were found, verified by reparsing every page's FAQPage JSON-LD with `json.loads` (not naive text-matching) and comparing it against the actual rendered `<h2>FAQ</h2>` section on the same page.

### Pattern A — FAQPage schema present, but no visible FAQ section exists anywhere on the page

**90 pages**, entirely within `sizes/`: all 18 `-clearance-hole`, all 18 `-tap-drill`, all 18 `-thread-pitch`, all 18 `-to-inch`, and all 18 `-vs-m*` comparison pages.

Verified example — `sizes/m6-clearance-hole.html`:
- Schema: `{"name":"What clearance hole for M6?","acceptedAnswer":{"text":"A common medium clearance is near 6.6 mm for M6 bolts; confirm with your drawing tolerance block."}}`
- This exact question and answer text **does not appear anywhere in the page's visible `<main>` content** — confirmed by searching the rendered text for both the question stem and the first 30 characters of the answer. Neither is present.
- Every one of the 90 pages carries exactly **one** FAQ question in its schema, and every one of the 90 pages has exactly **one** `<div class="ad-container">` immediately following the page's last visible `<section>`.

Root cause traced to `_generate_longtail_sizes.py` (the legacy generator for this cluster): its `faq_page(name, text)` helper builds the FAQPage JSON-LD from strings (`a1`, `a2`, `a3` in the generator source) that are constructed independently of, and never inserted into, the page's visible `body` HTML template. This is a generator defect present since the cluster was first generated, not a one-off content mistake.

### Pattern B — FAQPage schema present, visible FAQ section exists, but the text differs

**39 pages**: 20 in `sizes/` (the `-bolt-size` pages, which do have a `<h2>FAQ</h2>` section but with page-specific, hand-styled Q&A that differs from a separately-templated schema block), 16 in `reference/` (e.g., `6g-vs-6h.html`, `allowance-vs-tolerance.html`, `external-thread-tolerances.html`, `thread-tolerances.html`, and others sharing the "Thread Engineering Reference" generic FAQ template), and 3 in `guides/`.

Verified example — `reference/6g-vs-6h.html`:
- Schema Q1: *"What is the engineering purpose of 6g vs 6h?"* → *"6g vs 6h helps engineers specify, inspect, and communicate thread fit behavior across design, manufacturing, and quality teams."*
- Visible Q1: *"What does this page help me decide?"* → *"It supports thread specification, fit interpretation, and inspection planning for engineering workflows."*

These are two different, independently-authored FAQ sets on the same page — the schema uses a generic auto-generated template (`"What is the engineering purpose of {topic}?"`), while the visible section uses a more specific, later-written template (`"What does this page help me decide?"`). This indicates the visible FAQ was revised at some point without regenerating the matching schema.

### Pages Where Schema Correctly Matches Visible Content

**24 pages** (checked the same way) have schema and visible FAQ in exact agreement, including `reference/data-methodology.html`, `reference/standards/iso.html`, and `reference/thread-engineering/index.html` — confirming the site's more recently authored pages (D1.1-era and the Standards/Thread-Engineering hub pages) already do this correctly. This establishes the correct pattern to match, not a hypothetical one.

## AEO Answer Block Quality (existing `.aeo-answer-block` convention)

Presence by page type (from inventory scan):

| Type | Has AEO block | Notes |
|---|---|---|
| tool | 8/8 | Complete |
| thread-engineering | 7/7 | Complete |
| size | 108/115 | The 7 without are the `-bolt-size` pages, which use a different, bespoke intro paragraph style instead — not a gap, a different (equally direct) convention |
| reference | 16/22 | The 6 without are legal/hub-adjacent pages already covered elsewhere |
| spanish | 30/31 | Consistent with English |
| standards | 2/7 | The 5 without are the thin stub pages (`audit/d1-3-thin-content.md`) — expected, not a separate defect |
| chart | 4/9 | See below |
| guide | 0/13 | See below |
| legal, homepage, reference-hub, methodology | 0 | Expected — these page types use a different, appropriate intro convention (a `<p class="muted">` lede), not the AEO block |

Spot-checked the AEO blocks that do exist for factual accuracy, relevance, and non-contradiction: no factual errors or contradictory claims were found across the sampled reference, standards, thread-engineering, and size pages. First sentences consistently state a direct answer (e.g., "ISO thread standards are most effective when used as a sequence: profile (ISO 68-1)...").

### Gap identified, not auto-fixed: `guides/` (0/13 have an AEO block)

All 13 guide pages (`guides/what-is-tpi.html`, `guides/bolt-vs-screw-difference.html`, etc.) are direct-answer educational content — the same kind of content that gets an AEO block everywhere else on the site — but none of them use the convention; they open with a plain paragraph instead. This is a real, evidenced gap against the site's own established convention. Per governance ("do not automatically add AEO blocks to every page"), **this was not fixed in D1.3** — writing 13 new direct-answer paragraphs is content authorship, not a mechanical fix, and is logged as a P2/P1 recommendation for a future content phase rather than implemented here.

### Chart pages (4/9 lack an AEO block)

`charts/index.html`, `charts/bolt-grade-chart.html`, `charts/screw-size-chart.html`, `charts/tap-drill-chart.html` lack one; `charts/universal-screw-bolt-size-chart.html` (586 words, the flagship chart/tool page) also lacks one despite its length. These are primarily tabular/interactive pages where the "answer" is the table itself rather than a summary paragraph — a defensible design choice, not clearly a defect. Logged as an observation, not a finding requiring action.

## Fix Scoped for This Phase

Given the size and clarity of Pattern A (90 pages, systematic, zero-ambiguity defect, fully deterministic remedy using each page's own already-existing schema text), this is the flagship fix implemented under D1.3.14 — see `audit/d1-3-fix-priority.md` for the classification and `audit/d1-3-change-scope.md` for the exact change made. Pattern B (39 pages, more varied templates, would require deciding *which* of two already-authored Q&A sets is authoritative per page) is logged as a P1 finding for a follow-up phase rather than fixed here, to keep this phase's change to a single, deterministic, low-risk pattern.

## Summary

| Finding | Pages affected | Action |
|---|---|---|
| FAQ schema with zero matching visible content (Pattern A) | 90 | **Fixed** in D1.3.14 |
| FAQ schema present but text differs from visible FAQ (Pattern B) | 39 | Logged as P1, deferred |
| FAQ schema correctly matches visible content | 24 | No action (reference baseline) |
| Guides missing AEO block vs. site convention | 13 | Logged as P2, deferred (requires new authored content) |
| Charts missing AEO block | 4–5 | Logged as observation, not a finding |
