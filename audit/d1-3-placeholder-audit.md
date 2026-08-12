# D1.3.5 — Placeholder / Transitional Language Audit

Date: 2026-08-11
Method: case-insensitive regex scan of every indexable HTML file for: "coming soon," "available soon," "more data will be added," "data pending," "verified data pending," "placeholder" (as prose, excluding the `data-ad-placeholder` HTML attribute which is a technical CSS/JS hook, not user-facing copy), "under construction," "future revision," "incomplete," "work in progress," "not yet available," "TBD," "TODO," plus a manual semantic pass over the results.

## Findings

### 1. "Detailed tolerance tables will be added as verified engineering reference data in future revisions."

Found **verbatim, 15 times**, across:

- `charts/unc-thread-chart.html`, `charts/metric-thread-chart.html`, `charts/metric-vs-imperial-chart.html`, `charts/unf-thread-chart.html`
- `reference/thread-tolerances.html`, `reference/pitch-diameter-explained.html`, `reference/metric-thread-tolerance-chart.html`, `reference/tolerance-zones-explained.html`, `reference/internal-thread-tolerances.html`, `reference/6g-vs-6h.html`, `reference/6h-vs-6g.html`, `reference/allowance-vs-tolerance.html`, `reference/external-thread-tolerances.html`, `reference/fundamental-deviation.html`, `reference/thread-fit-classes-explained.html`

**Classification: legitimate methodology statement.** This sentence does not claim data exists that doesn't — it accurately discloses that the page's numeric tolerance tables are not yet loaded from a verified source, which is consistent with (and predates, but does not contradict) the D1.1 Data Methodology page's classification system ("approximate or non-authoritative values are identified as such and are not presented as direct requirements of an engineering standard"). Per governance ("do not remove legitimate statements merely because they contain 'future'"), **this was not removed or altered.**

However, it is also a genuine **duplication/genericness** finding: the identical sentence appears verbatim on 15 topically distinct pages, which is documented in `audit/d1-3-duplication.md` and `audit/d1-3-aeo-quality.md` as a template-genericness issue, separate from the placeholder-language question. Writing 15 page-specific replacements would require new engineering content this audit does not have verified data to support (governance: do not add paragraphs merely to increase word count, do not invent engineering values) — so this is logged as a **P2, deferred** item, not fixed in this phase.

### 2. Standards family stub pages ("Current references in this family" → single link)

`reference/standards/{asme,din,jis,ansi,british-standards}.html` do not contain any of the scanned placeholder phrases literally, but their content is functionally a stand-in state (a single sentence + one link, no explanation). This is **not classified as placeholder language** (no phrase promises future content that doesn't exist, and nothing here is misleading) — it is a thin-content finding, already fully covered in `audit/d1-3-thin-content.md`, not duplicated here.

### 3. No other matches

The scan found zero occurrences of "coming soon," "available soon," "under construction," "work in progress," "not yet available," "TBD," or "TODO" anywhere in indexable HTML. (The Privacy Policy's forward-looking advertising language — e.g., "BoltLab does not currently display advertising... When BoltLab displays advertising served by Google..." — was excluded from this scan per governance rule 22, "do not modify D1.2 legal pages"; it was already reviewed and approved as legitimate conditional/future-feature language during D1.2 and is out of scope for D1.3.)

## Summary

| Category | Count | Action |
|---|---|---|
| Legitimate methodology statement | 15 (1 unique sentence) | KEEP — accurate and non-misleading; genericness logged separately as P2 |
| Legitimate future-feature statement | 0 (D1.2 privacy language out of scope) | N/A |
| Actual placeholder | 0 | N/A |
| Actual unfinished public-facing content | 0 | N/A |

No actual unfinished or misleading placeholder content was found anywhere on the indexable site. No fixes required from this specific audit.
