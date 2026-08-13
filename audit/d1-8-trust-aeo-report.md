# D1.8 — Trust-Signal & AEO Consistency Polish

Date: 2026-08-11
Status: **READY FOR REVIEW — TRUST/AEO POLISH COMPLETE**

## Scope

Implement the three D1.7-identified, low-risk, evidence-supported improvements: Thread Atlas metadata harmonization, the tap-drill verification hedge, and 12 guide AEO blocks derived from existing content. Items 1 (four thin Standards pages) and 2 (15 future-revisions pages) were explicitly out of scope and not touched.

## Part 1 — Thread Atlas Metadata Harmonization

Both pages were read in full before any change (`reference/thread-atlas.html`, `reference/metric-thread-atlas.html`).

**Finding: only `metric-thread-atlas.html` required a change.** `thread-atlas.html` already had all four core trust-signal fields (Dataset version, Verification status, Last reviewed, Dataset coverage/row count) — its "20 rows" claim was independently re-verified by counting the actual `.thread-atlas-card` elements on the page (`grep -c` → 20, exact match). No change was needed or made to `thread-atlas.html`.

`metric-thread-atlas.html` was missing the coverage/row-count field entirely and used a differently-worded verification-status label. Two changes made:

1. **Row count added, verified from the actual CSV, not estimated:** `tail -n +2 downloads/metric-thread-atlas.csv | wc -l` → 9, cross-checked against `grep -c '<tr data-designation=' reference/metric-thread-atlas.html` → 9 (independent agreement from two sources: the source CSV and the page's own rendered table). Added: `<li>Dataset coverage: Metric (9 rows)</li>`.
2. **Label harmonized, not the fact:** `Verified: Yes` → `Verification status: Verified`, matching `thread-atlas.html`'s exact wording for the same underlying fact (no value changed, only the label text, for genuine cross-page consistency).

Retained unchanged (already accurate, product-specific, explicitly authorized to keep): `Verification method`, `Related standards`, the `license` and `distribution` JSON-LD fields. No `distribution` field was added to `thread-atlas.html` — it does not itself provide a CSV, so that would have been a false claim; its absence remains correct.

## Part 2 — Tap Drill Verification Hedge

Added exactly the required sentence, verbatim, once, to `tools/tap-drill-calculator.html`'s "Calculation method" section (immediately after the existing approximation explanation, before the existing cross-link paragraph):

> "Always confirm the final tap-drill size against your tap manufacturer's chart or technical data."

Verified: `grep -c` for the exact sentence → 1. No FAQ content touched (the existing FAQ section, added by D1.6, is unchanged — confirmed by diff). No calculation logic, formula, or script touched.

## Part 3 — Guide AEO Consistency (12 pages)

Every guide was read in full before editing. Each page's existing `<p class="muted">` lede was treated as the canonical content source and converted into the site's `.aeo-answer-block` structure (the dominant sitewide convention — confirmed by checking 138 existing instances, 112 of which use this exact "no inner heading, 2–3 `<p>` tags" pattern, vs. 26 using a "Quick answer" inner `<h2>` variant). The lede paragraph was replaced by the AEO block; no content was duplicated, and each page still opens with H1 → direct-answer block, matching the placement convention already used on tool/size pages.

| # | Page | Original lede | AEO text (as published) | Reason for any wording change |
|---|---|---|---|---|
| 1 | `bolt-head-markings.html` | "How to read strength and grade markings on bolt heads. Metric property classes and SAE grade symbols help you choose the right fastener for the load." | "Bolt head markings show the metric property class or SAE grade stamped into the head. Metric property classes and SAE grade symbols help you choose the right fastener for the load." | Sentence 1 reworded from "how-to" framing into a direct-answer statement (identical fact). Sentence 2 verbatim. |
| 2 | `bolt-strength-grades.html` | "Metric property classes and SAE grades define bolt strength. Choosing the right grade ensures the joint can carry the load without failure or unnecessary cost." | Same, verbatim. | Already direct; wrapped only. |
| 3 | `bolt-vs-screw-difference.html` | "In everyday language 'bolt' and 'screw' are used loosely. In engineering, the distinction affects how the joint is designed and loaded. For recognizing head shape and drive type on the bench, see the visual reference (e.g. screw head types)." | "Bolts typically pass through unthreaded holes and use a nut; screws often engage a pre-tapped hole or form their own thread. Load direction and head design also differ." | Original lede was discursive and did not directly answer the H1. Replaced with the page's own existing, D1.6-verified FAQ answer to "What is the difference between a bolt and a screw?" — already-verified on-page content, not invented. |
| 4 | `fastener-materials-guide.html` | "Choosing the right material—carbon steel, stainless, aluminum, or coated—affects strength, corrosion resistance, and weight. Compare options below." | "Choosing the right fastener material—carbon steel, stainless, aluminum, or coated—affects strength, corrosion resistance, and weight. Compare the options below." | Sentence 1 near-verbatim (added "fastener" for clarity). Sentence 2 kept minimal/verbatim. |
| 5 | `how-to-measure-thread-pitch.html` | "Accurate pitch measurement is the key to identifying unknown bolts and choosing the right tap or die. Use calipers and a pitch gauge, then verify with our tools." | Same, verbatim. | Already direct; wrapped only. |
| 6 | `metric-thread-tolerances.html` | "ISO metric threads use tolerance classes to control fit between bolt and nut. Common classes are 6g (external) and 6H (internal) for general use." | Same, verbatim. | Already direct; wrapped only. |
| 7 | `metric-vs-imperial-fasteners.html` | "A practical guide to metric and imperial bolt and screw systems for mechanics, engineers, machinists, and DIY builders. See the complete screw size chart." | "Metric fasteners use millimeters for diameter and thread pitch (e.g. M8 x 1.25); imperial fasteners use inch-based diameters and threads per inch (e.g. 5/16-18 UNC). They are not interchangeable without conversion." | Original lede was a "guide about X" framing, not a direct answer. Replaced with the page's own existing, D1.6-verified FAQ answer to "What is the difference between metric and imperial fasteners?" |
| 8 | `tap-drill-basics.html` | "Choosing the right drill size before tapping ensures strong threads and avoids broken taps or stripped holes. Use our chart and calculator for quick reference." | Same, verbatim. | Already direct; wrapped only. |
| 9 | `thread-pitch-explained.html` | "Thread pitch is the distance between adjacent thread crests. Metric threads use pitch in millimeters; imperial threads are often specified in threads per inch (TPI)." | Same, verbatim. | Already direct; wrapped only. |
| 10 | `thread-types-explained.html` | "UNC, UNF, and metric coarse and fine threads: what they are and when to use each for fasteners." | "Thread types include UNC, UNF, and metric coarse and fine families. Each family suits different fasteners—compare them below to choose the right type." | Original was a topic-label sentence, not a direct answer. Minimally restructured into declarative form using only the same words/facts already present. |
| 11 | `what-is-tpi.html` | "TPI is the imperial way to specify thread pitch: the number of thread crests in one inch. It is the inverse of pitch in inches." | Same, verbatim. | Already direct; wrapped only. |
| 12 | `why-stainless-bolts-gall.html` | "Stainless fasteners can seize or 'gall' when threads cold-weld under friction. Learn what causes it and how to prevent it." | "Stainless fasteners can seize or 'gall' when threads cold-weld under friction. Galling is adhesive wear: similar metals under load transfer material and bond at the thread contact." | Sentence 1 verbatim. Replaced the weak navigational filler ("Learn what causes it...") with the page's own existing, more substantive explanatory sentence from its "What is galling?" section — already on-page, not invented. |

No new engineering fact, value, or claim was introduced anywhere in Part 3. Every word used already existed on the same page (either in the original lede or elsewhere in the page's own already-verified content).

`guides/index.html` (the hub) was not modified — confirmed 0 `aeo-answer-block` occurrences before and after.

## Site-Wide Validation

| Check | Result |
|---|---|
| Total pages | 224 |
| Duplicate titles | 0 |
| Duplicate meta descriptions | 0 |
| Pages missing from sitemap | 0 |
| Orphan pages | 0 |
| Broken internal links | 0 |
| JSON-LD parse errors | 0 |
| Canonical URLs on all 14 modified files | Unchanged, extensionless, verified individually |
| `validate-knowledge-engine.js` | PASS, 0 errors, 0 warnings |
| `validate-projections.js` | PASS, 0 errors, 0 warnings |

### AEO-specific verification
- Exactly 12 guide content pages now contain exactly one `.aeo-answer-block` each (verified via per-file count).
- `guides/index.html` unchanged (0 AEO blocks, as intended — it is a hub).
- No guide has a duplicate AEO block.
- No guide has an empty `<p></p>` inside its AEO block (verified via regex scan — 0 found).
- H1, `<title>`, and meta description unchanged on all 12 guides (verified via `git diff` filtered to those specific lines — no output).

### Atlas-specific verification
- Core trust signals now present and consistently labeled on both pages.
- Metric Atlas row count (9) independently verified from both the source CSV and the page's own rendered table.
- `thread-atlas.html` still has no `distribution` field — correct, since it doesn't provide its own CSV.
- No unsupported verification-method value was added to `thread-atlas.html` (none was added at all, per the explicit instruction to leave it absent).

### Tap-drill-specific verification
- Exact verification sentence present exactly once.
- Calculation logic, formula text, and FAQ content unchanged (confirmed via diff).

## D1.6 Regression

Re-ran the full identity-matched FAQ audit across all 224 pages: 197 FAQPage-bearing pages, **0 mismatches**, 0 duplicate FAQPage blocks, 0 duplicate questions within any page, 0 hidden FAQ content, 0 JSON-LD parse errors. No D1.6/D1.6R-fixed page was altered by D1.8 (the only overlap — `tap-drill-calculator.html` and 3 guides that D1.6 had already touched for FAQ reasons — received only new, non-overlapping edits in D1.8: the tap-drill hedge is outside the FAQ section, and the 3 guides' AEO edits are in the lede, not the FAQ section; confirmed via diff that no FAQ-section line changed in any of these 4 files).

## D1.5 Regression

| Check | Result |
|---|---|
| `/tools/` exists, lists 8 tools | PASS |
| Header "Tools" → `/tools/` | PASS |
| Homepage "Engineering reference & data" section present | PASS |
| Reference hub retains "Thread engineering" / "Standards & engineering data" split | PASS |
| Footer "Thread Atlas" link present | PASS |
| No navigation regressions | PASS |

## Unexpected Files

Two validator/tooling side effects were produced and reverted during this phase's own verification steps (same recurring, documented pattern since D1.1): `docs/architecture/{validation-report,projection-validation-report}.{json,md}` (timestamp regeneration) and `audit/d1-3-page-inventory.json` (overwritten by re-running the D1.3 inventory helper for duplicate-title/orphan checks). Both reverted via `git checkout --`. No other unexpected file was found.

## Final Status

**D1.8 STATUS: READY FOR REVIEW — TRUST/AEO POLISH COMPLETE.** All three authorized items implemented using only existing repository evidence; zero engineering facts, standards values, or verification claims invented anywhere. `reference/thread-atlas.html` was inspected but required no change (already fully compliant on the core trust-signal set) — the overall 14-file production-modification target is still met because no other file needed additional changes; this deviation from the assumed 2-Atlas-file breakdown is documented transparently rather than forcing a cosmetic edit to hit an assumed split.
