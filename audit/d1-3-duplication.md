# D1.3.6 — Duplication Audit (includes D1.3.7 Programmatic Page Quality findings)

Date: 2026-08-11

## Duplicate Titles / Meta Descriptions

Programmatic check across all 223 indexable pages (`audit/d1-3-page-inventory.json`): **0 duplicate `<title>` values, 0 duplicate meta descriptions.** Every page has a unique title and description. This confirms the site-wide health already certified in prior phases (D1.1, D1.2, and the standalone `audit/thread-engineering-summary.md`).

## Duplicate/Repeated Paragraphs

- The "Detailed tolerance tables will be added as verified engineering reference data in future revisions." sentence repeats verbatim across 15 pages — see `audit/d1-3-placeholder-audit.md` for full classification. Not misleading, but genuinely generic/templated; logged as P2, deferred (no verified content exists to differentiate it without inventing facts).
- The **AEO answer block** boilerplate ("Use related standards and concepts to connect profile geometry, designation planning, dimensions, and tolerance interpretation." / "Use BoltLab tools and charts for workflow interpretation while final release values come from approved standards documents.") repeats verbatim across all `generate-standards-pages.js`-produced ISO pages (`iso.html` and the 5 `iso_*.reference.json`-driven leaf pages). This is a shared template sentence in a generator-produced cluster serving a consistent methodological disclaimer across a genuinely coherent standards family — analogous, low-risk, and not flagged as a defect (the *specific* first sentence of each AEO block, which carries the actual answer, is unique per page).

## Repeated FAQ Answers / Duplicate Search Intent in FAQ Schema

A more serious duplication pattern was found in FAQPage JSON-LD **question text** (not answer content, but the templated *questions themselves*, which is what search engines and users actually see as the "intent" of the FAQ). The exact question stems "What is the engineering purpose of {topic}?", "Can I use this page to replace standards documents?", "Where are the exact tolerance values?", "How do I continue from this topic?", "Is this content suitable for manufacturing use?" are reused as a template across dozens of `reference/` and `charts/` pages, with only the `{topic}` token substituted. This is templated, low-differentiation FAQ content at the schema level — a real quality concern, but not on its own a "duplicate content" penalty risk since each page's `{topic}` substitution and canonical URL are unique. It is more precisely an **AEO quality** issue (generic, low-specificity Q&A) and is analyzed fully in `audit/d1-3-aeo-quality.md`, which is where the associated fix (D1.3.14) is scoped and justified.

## `/sizes/` Cluster (D1.3.7 — Programmatic Page Quality)

Evaluated every generated size-page family for distinct query intent, per governance instruction to judge by intent, not by shared template:

| Suffix | Count | Distinct intent | Word count range | Verdict |
|---|---|---|---|---|
| `-bolt-size` | 18 | Primary size-lookup hub for that diameter | 406–573 | Distinct, healthy |
| `-clearance-hole` | 18 | Clearance drilling for that diameter | 251–263 | Distinct, healthy |
| `-tap-drill` | 18 | Tap drill sizing for that diameter | 251–263 | Distinct, healthy |
| `-thread-pitch` | 18 | Pitch lookup for that diameter | 250–262 | Distinct, healthy |
| `-to-inch` | 18 | Metric→inch conversion for that diameter | 243–261 | Distinct, healthy |
| `-vs-m*` (comparison pairs) | 18 | Head-to-head comparison between two adjacent sizes | 269–281 | Distinct, healthy |
| `-screw-size` / odd-imperial sizes | ~7 | Screw/imperial-specific lookups | — | Distinct, healthy |

Each suffix answers a genuinely different query ("M6 bolt size" vs. "M6 clearance hole" vs. "M6 tap drill" are different searches with different intents and different correct answers), each page carries real, non-trivial data (a table plus explanatory prose plus cross-links), and each is internally linked from its sibling pages. **No pages in this cluster were classified D (Duplicative).**

### Reciprocal comparison pairs (`mX-vs-mY` and `mY-vs-mX`)

One pattern was investigated specifically because it looks superficially duplicative: both `sizes/m18-vs-m20.html` and `sizes/m20-vs-m18.html` exist.

- `m18-vs-m20.html`: title "M18 vs M20 Bolt Size," linked from `sizes/m18-bolt-size.html`, meta description "M18 uses 18mm major diameter; M20 uses 20mm with stronger shank and larger hex."
- `m20-vs-m18.html`: title "M20 vs M18 Bolt Size," linked from `sizes/m20-bolt-size.html`, meta description "M20 uses 20mm major diameter; M18 uses 18mm with stronger shank and larger hex."

Distinct canonicals, distinct titles, distinct meta descriptions, and each is the natural "continue reading" link from a different parent page (a user on the M18 page wants the M18-framed comparison; a user on the M20 page wants the M20-framed comparison). This is a legitimate, intentional reciprocal-pair pattern, not accidental duplication — **verdict: KEEP, not D.**

### `reference/thread-atlas.html` vs. `reference/metric-thread-atlas.html`

Both are real `Dataset`-schema pages with distinct scope: `thread-atlas.html` ("Unified Thread Atlas") covers Metric + UNC + UNF (1,151 words, the site's flagship C1.1 deliverable); `metric-thread-atlas.html` ("Metric Thread Atlas") is metric-only with its own CSV download (357 words, verified working at `downloads/metric-thread-atlas.csv`). These are not duplicates of each other — the metric-only page is narrower in scope but not redundant — **however `metric-thread-atlas.html` has zero internal inbound links from anywhere on the site** (confirmed via link-graph scan), meaning it is a real dataset with a real download that no on-site navigation path leads to. This is a **discovery/orphan problem, not a duplication problem**, and is fully addressed in `audit/d1-3-discovery.md` and the corresponding fix in `audit/d1-3-fix-priority.md`.

## Standards Family Generator (D1.3.7)

`scripts/generators/generate-standards-pages.js` uses two different render paths for the same conceptual page type ("standard family page"): a real data-driven `renderProjectionPage()` for ISO, and a bare hardcoded `renderFamilyPage()` for ASME/DIN/JIS/ANSI/British Standards that never reads `data/standards/`. This is the root cause of the D1.3.4 thin-content finding for those 5 pages, not a duplication issue on its own — full detail in `audit/d1-3-thin-content.md`.

## Conclusion

- **0 pages classified D — DUPLICATIVE.**
- The site's large programmatic clusters (`sizes/`, `reference/standards/`, `reference/thread-engineering/`) are intent-differentiated and were not flagged for consolidation or removal.
- The genuine issues found in this audit are template-genericness (P2, deferred — no safe fix without new data) and a generator defect (P1, fixed for ASME only — see `audit/d1-3-fix-priority.md`), not duplicate content in the SEO-penalty sense.
