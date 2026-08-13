# FAQ Structured Data Governance

## Rule

FAQ equivalence between visible content and `FAQPage` JSON-LD must be determined by **question identity and semantic answer correspondence**, never by array position alone.

```
BAD:  schema[i] compared to visible[i]                (positional)
GOOD: schema(question X) compared to visible(question X)   (identity-matched)
```

Two FAQ lists can legitimately contain the same questions in different orders, and the same question can legitimately be worded slightly differently in each place (e.g. "What is a thread type?" vs. "What is a thread type in one sentence?"). Comparing such lists position-by-position makes two individually correct, self-consistent lists look scrambled, and can lead an automated or manual reviewer to conclude the visible content itself is corrupted when it is not.

## Correct verification method

1. Extract the schema question/answer pairs and the visible question/answer pairs separately.
2. Match pairs **by question text** (exact match, or fuzzy match plus manual confirmation when wording differs), not by index.
3. Once matched, compare each pair's answer text for semantic/textual correspondence.
4. Only flag a page as having a genuine content defect if a *matched* answer does not address its *matched* question — not merely because the two lists are ordered differently.
5. Before concluding a visible answer is misplaced, seek independent corroboration from the same page's other content (AEO block, body sections) and from related pages before treating it as authoritative evidence of corruption.

## Why this rule exists

During D1.6 (FAQ Schema & Answer Integrity, 2026-08-11), `reference/thread-types.html` was flagged and blocked as having a "rotation defect" — visible answers apparently paired with the wrong questions — based on a positional comparison of the schema array against the visible array. D1.6R's deeper, question-matched review found the visible content was already fully correct: schema and visible held the same five questions in a different order (one reworded), and every visible answer correctly addressed its own visible question. The only real defect was the ordinary schema/visible sync gap already handled safely elsewhere in D1.6.

Had the "rotation" finding been acted on directly — reordering or rewriting the visible FAQ to match the flawed positional read — it would have introduced a real defect into content that was never actually broken. D1.6 avoided this by refusing to guess and escalating instead of auto-repairing; D1.6R then closed the loop with the correct verification method. This rule exists so a future FAQ audit or automated validator does not reintroduce the same class of false positive, or worse, act on it.

See `audit/d1-6-faq-integrity.md` and `audit/d1-6r-thread-types-repair.md` for the full incident record.
