# D1.6R — Thread Types FAQ Content Repair

Date: 2026-08-11
Status: **READY FOR REVIEW — BLOCKER RESOLVED**

## Original Defect

D1.6 reported that `reference/thread-types.html`'s five visible FAQ answers were "each paired with the wrong question — a clean one-position rotation," and blocked the page rather than risk copying a corrupted pairing into structured data.

## Evidence Review

Re-reading the live page in full (not the cached scan output) and testing each visible answer against its own visible question — rather than against the schema's differently-ordered question at the same array index, which is what produced D1.6's original finding — found:

**The visible FAQ content is not corrupted.** Every one of the 5 visible answers correctly and directly answers its own visible question. What D1.6 actually detected was that the FAQPage schema and the visible FAQ contain the **same five underlying questions in a different order** (schema's first question, "What is a thread type?", corresponds to visible's *last* question, reworded as "What is a thread type in one sentence?"; the other four are in the same relative order in both). Comparing schema and visible pair-by-pair using raw array position (`schema[i]` vs. `visible[i]`) — the method D1.6's original analysis used — makes two independently-ordered-but-individually-correct lists look like a scrambled single list. That is the same "Category C — different question set" pattern D1.6 already safely resolved on 13 other pages; it is not the distinct, more serious defect ("answers detached from their own questions") that D1.6's report described.

Independent corroborating evidence was sought and found, per Step 1's instruction not to infer the pairing solely from answer order:

1. **`guides/thread-types-explained.html`** (cross-linked directly from `thread-types.html`'s own "Identify yours" section) contains its own FAQ with the same two questions and substantively identical answers: "UNC is Unified National Coarse (fewer threads per inch, larger pitch). UNF is Unified National Fine (more threads per inch, smaller pitch). Same diameter, different pitch." and "Metric coarse is the default pitch... Fine is used where strength in thin material or fine adjustment is needed." This independently confirms visible pairs 1 and 2 are correct as currently paired.
2. **The page's own AEO direct-answer block** (`<div class="aeo-direct-answer">`, frozen/untouched by this phase, read only as evidence): "A thread type is the specification family for the helical ridge... It is defined by diameter, pitch (or TPI), and form, not by head shape or drive." This is a near-verbatim match for visible pair 5's answer, confirming it is correctly paired with "What is a thread type in one sentence?"
3. **The page's own body sections** ("Applications": "measure major diameter and pitch, then map to a standard row in the size chart"; the reference cards' "Default: coarse tables per diameter; fine for special fits") corroborate visible pairs 2 and 3.
4. **The schema's own version of the UNC/UNF and thread-vs-drive questions**, checked against the schema's own answers (not cross-checked against visible), are *also* individually correct — confirming both the schema list and the visible list are each internally coherent, just ordered differently and (for one question) worded differently.

No question required guessing or unsupported content; no engineering fact needed inventing. All five pairs were confirmed by evidence already present in the repository.

## Correct Question-Answer Pairs

| # | Question (as shown to users) | Answer (as shown to users) | Evidence | Confidence | Correction needed? |
|---|---|---|---|---|---|
| 1 | What is the difference between UNC and UNF? | Same inch diameter series; UNF has more threads per inch (finer) than UNC. | `guides/thread-types-explained.html` FAQ (independent, matching) | High | No — already correct |
| 2 | When should I use metric coarse vs fine? | Use coarse unless the drawing or mating part specifies fine pitch. | `guides/thread-types-explained.html` FAQ; page's own "Default: coarse... fine for special fits" ref-card | High | No — already correct |
| 3 | How do I identify my thread type? | Measure major Ø and pitch/TPI, then use the Thread Identifier or charts. | Page's own AEO block + "Applications" section + cross-linked Thread Identifier tool | High | No — already correct |
| 4 | What is the difference between thread type and screw drive? | Thread type is the helical engagement along the shank; drive type is only the head interface. | Schema's own (differently-worded but substantively identical) answer to the same question | High | No — already correct |
| 5 | What is a thread type in one sentence? | The named standard family (metric, unified, pipe, etc.) that defines diameter, pitch/TPI, and form for the helical thread. | Near-verbatim match to the page's own AEO direct-answer block | High | No — already correct |

## Repair Applied

**None required to the visible FAQ.** All five existing visible question→answer pairings were confirmed correct by repository evidence. Per Step 3's instruction to change only what the defect actually requires and not perform a stylistic rewrite, the visible FAQ section (`<h2>FAQ</h2>` through its five `<h3>`/`<p>` pairs) was left byte-for-byte untouched.

## FAQ Schema Reconciliation

The FAQPage JSON-LD (previously the schema's own, differently-ordered five questions) was rewritten to exactly match the verified-correct visible FAQ: same 5 questions, same wording, same order, same answers, decoded HTML entities. This is the same mechanical "visible is canonical" sync already applied to the other 62 D1.6 pages — appropriate here because the visible content is now confirmed correct, not merely assumed correct.

`git diff reference/thread-types.html` confirms the change is scoped to exactly one `<script type="application/ld+json">` block; no other line in the file changed.

## D1.6 Full Regression

Re-ran the complete D1.6 FAQ scan (both `<h2>FAQ</h2>` and `<h2>Preguntas frecuentes</h2>` heading detection, semantic pair-by-pair comparison, not just count equality) across all 224 indexable pages:

- Total pages scanned: 224
- Total FAQPage-schema pages: 197
- JSON-LD parse errors: 0
- Remaining schema/visible mismatches: **0**
- D1.6 blocker count: **0** (down from 1)

## D1.5 Regression

| Check | Result |
|---|---|
| `/tools/` exists, lists 8 tools | PASS |
| Header "Tools" → `/tools/` (spot-checked on `index.html` and `reference/thread-types.html`) | PASS |
| Homepage "Engineering reference & data" section present | PASS |
| Reference hub retains "Thread engineering" / "Standards & engineering data" split | PASS |
| Footer "Thread Atlas" link present | PASS |
| `reference/thread-types.html` title, meta description, canonical unchanged | PASS |

## Validation Results

| Check | Result |
|---|---|
| Duplicate titles (site-wide) | 0 |
| Duplicate meta descriptions (site-wide) | 0 |
| Pages missing from sitemap | 0 |
| Orphan pages | 0 |
| Duplicate FAQPage blocks per page | 0 |
| Duplicate questions within one page's schema | 0 |
| Hidden FAQ content (`display:none`, off-screen) | 0 |
| `validate-knowledge-engine.js` | PASS, 0 errors, 0 warnings |
| `validate-projections.js` | PASS, 0 errors, 0 warnings |
| Unrelated regenerated report diffs | Found and reverted (`docs/architecture/*validation-report*` timestamps; `audit/d1-3-page-inventory.json`, same known side effect of re-running the D1.3 inventory helper for verification, as documented in D1.6) |

## Change Scope

Exactly **1** production file modified: `reference/thread-types.html` (FAQPage JSON-LD only). Full classification in `audit/d1-6r-change-scope.md`.

## Final Status

**D1.6R STATUS: READY FOR REVIEW — BLOCKER RESOLVED**

The page is not, and was never, content-corrupted. D1.6's blocking was the correct, cautious call given the evidence available at the time (a positional schema-vs-visible comparison that looked like a rotation). This phase's deeper, question-matched, evidence-corroborated review found the visible content was already accurate, and the only real defect was the same schema/visible ordering mismatch already handled safely across the rest of D1.6. The fix applied is the standard D1.6 mechanical sync, now applied with full confidence rather than withheld out of caution. D1.6's total blocker count is now zero.
