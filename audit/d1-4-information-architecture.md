# D1.4 — Information Architecture & Product Hierarchy
## Audit / Design Definition Only — No Production Changes

Date: 2026-08-11
Status: **AUDIT COMPLETE**. This phase made zero changes to HTML, CSS, JS, data, generators, navigation, or any other production file. See the Final Governance Check at the end of this document.

---

## 1. Executive Conclusion

BoltLab's underlying product architecture (Tools, Reference Library, Standards Library, Engineering Data Products) is real, well-built, and — per D1.3 — largely free of content-integrity defects. But the **visible** information architecture does not communicate that architecture to a first-time visitor.

Concretely: a visitor who only sees the header and homepage — which is every visitor, on every device, before they choose to click deeper — has no way to learn that BoltLab has a Standards Library or produces structured Engineering Data Products. Those two families exist, are reachable, and are reasonably well-built once you find them (inside the Reference hub, or via footer text), but nothing in the primary navigation or homepage signals they exist. The current visible hierarchy reads as **"a converter tool with supporting guides and reference pages,"** not **"engineering tools backed by structured reference, standards context, and trustworthy engineering data."**

This is a real, evidence-based finding, not a preference for a "prettier" navigation — see Section 16 for the specific, verified gaps.

---

## 2. Current Information Architecture

**Header (identical on all 223 pages, English):** Tools → Charts → Reference → Sizes → Guides. All five items are present on every page at every viewport width (no hamburger/collapse exists).

**Footer (English pages):** Product group = Tools, Charts, Reference, Standards, Data Methodology, Sizes, Guides. Company group = About, Privacy, Cookie Notice, Terms, Disclaimer, Contact. This is the *only* place Standards and Data Methodology are surfaced sitewide.

**Footer (Spanish pages):** Product group = Herramientas, Gráficos, Tamaños, Guías (no Reference). Company group = Acerca de, Contacto, Privacidad (no Cookie Notice/Terms/Disclaimer). Materially narrower than the English footer.

**Homepage:** Hero ("Universal Screw & Bolt Converter") → Recent updates → Popular sizes → More tools → Guides & references → Fastener reference system. Standards and Data Products do not appear anywhere in this sequence.

---

## 3. Product-Family Visibility Matrix

| Family | Header | Footer | Homepage body | Has a real hub page |
|---|---|---|---|---|
| Tools | Yes | Yes | Yes | **No** — deep-links to 1 tool |
| Reference Library | Yes | Yes | Yes | Yes |
| Standards Library | **No** | Yes | **No** | Yes |
| Engineering Data Products | **No** | Partial (Data Methodology only, not the Atlas) | **No** | **No** |
| Charts | Yes | Yes | No | Yes |
| Sizes | Yes | Yes | Yes | Yes |
| Guides | Yes | Yes | Yes | Yes |

---

## 4. Header Assessment

Current labels/order: Tools, Charts, Reference, Sizes, Guides. Every item destination was verified directly from `index.html` (identical across all pages).

- **Absent major families:** Standards Library, Engineering Data Products — zero header presence.
- **Disproportionate prominence:** none of the 5 items is visually over-weighted relative to the others (equal styling, `.nav-list` flex layout) — the imbalance is about *inclusion*, not sizing.
- **Structural inconsistency found:** "Tools" is the only header item that does not resolve to an index/hub page. `tools/index.html` does not exist anywhere in the repository; the header link goes straight to `metric-to-imperial-screw-converter.html`. Charts, Reference, Sizes, and Guides all resolve to real `index.html` hub pages. This means a user clicking "Tools" cannot see the full list of 8 tools from that click — they land on one tool and have to notice the "More tools" grid further down that specific page.
- **Label clarity:** the 5 present labels are short, generic, user-intent-aligned words (a person searching "bolt torque calculator" or "thread pitch chart" would recognize these). No labeling defect found among the items that *are* present.

## 5. Footer Assessment

The footer (English) is structurally sound and *does* include Standards and Data Methodology — this is the direct result of D1.1's publisher-trust work. However:

- Footer is, by definition, the lowest-prominence position on every page (last thing seen, smallest visual weight, plain text links vs. the header's styled nav).
- The Data Products family has no dedicated footer entry — "Data Methodology" is present, but the Thread Atlas (the actual dataset product) is not linked from the footer at all.
- Spanish footer is materially narrower (Section 15 has full detail) — a Spanish-language user has *no* footer path to Reference, Standards, or Data Methodology at all.

**Conclusion:** the footer is a reasonable secondary/backstop discovery path, correctly scoped for what D1.1 could safely do to English pages, but it cannot substitute for primary navigation or homepage presence as the *first* signal of what BoltLab is.

## 6. Homepage Assessment

Verified via direct `grep` of `index.html`: the strings "standards," "atlas," "data-methodology," and "engineering data" appear **zero times** in the homepage body. The only two occurrences of "Standards" and "Data Methodology" text anywhere in the file are the footer links.

- **What BoltLab appears to be:** a converter/calculator tool (the H1 is literally "Universal Screw & Bolt Converter," with a live converter widget as the very first interactive element).
- **Primary action:** use the converter (hero placement, above everything else).
- **Discoverable product families from the homepage alone:** Tools, Guides, Reference (as a set of visual-identification/anatomy pages). Standards and Data Products are not discoverable without scrolling past the entire homepage into the footer.
- **Does "Recent updates"/"Popular sizes"/"More tools" reinforce or weaken platform positioning?** These three sections reinforce a "content site with lots of size pages and tools" identity — accurate as far as it goes, but they crowd out any signal of the standards-context and structured-data-product layer that D1.1's own Data Methodology page describes as one of BoltLab's four core offerings.

**Not recommending a redesign here** — only documenting that the homepage, as currently sequenced, does not communicate 2 of BoltLab's 4 declared product families.

## 7. Tools Assessment

Tools is well-connected to Reference in body content (verified on `thread-identifier.html` and `tap-drill-calculator.html`: both link to Reference pages, Guides, Charts, Sizes, and sibling Tools). Tools is **not** connected to Standards or Data Products in body content on either sampled page — the only path from a tool page to Standards/Data is the generic, non-contextual sitewide footer link. This means a user who just used the Thread Identifier and wants to know "what standard does this belong to" or "is there a fuller dataset for this" has no on-page prompt toward that answer.

The missing `/tools/` hub (Section 4) compounds this: Tools is BoltLab's primary interactive product, but it's the one family without a page that presents it as a coherent collection.

## 8. Reference Assessment

The Reference hub (`reference/index.html`) is well-organized into three sections: **Core reference** (anatomy, thread types, self-tapping), **Thread engineering** (which actually contains Thread Engineering Reference + Engineering Standards Hub + Unified Thread Atlas + Engineering Data Methodology), and **Visual identification** (head/drive/shape types). The hierarchy *within* Reference is understandable once you're there — each card is clearly labeled and links to a real, substantive page.

The one defect: the middle section's title, "Thread engineering," undersells and mislabels its own contents. Three of its four cards (Standards Hub, Thread Atlas, Data Methodology) are not "thread engineering" topics in the sense the label implies — they are three separate product families that happen to share shelf space with the actual Thread Engineering cluster (the section's first card). A user scanning "Thread engineering" as a section title would not expect to find the Standards Library or a downloadable dataset there.

## 9. Standards Assessment

The Standards Library (`reference/standards/`) is reachable exactly two ways: the Reference hub's "Thread engineering" section, or the sitewide footer. It has no header presence and no homepage presence. Once reached, `iso.html` is a fully-developed page; the other 5 family pages are thin stubs (unchanged finding from D1.3 — not re-audited here, and per D1.3.14, ASME was partially enriched using verified data). Conceptually, Standards sits as a **sub-family of Reference** in the current visible hierarchy, even though the Data Methodology page's own stated product taxonomy treats it as a peer to Reference, not a child of it. This is the core tension this audit surfaces: the *conceptual* model (4 peer families) and the *visible* model (Standards nested inside Reference) disagree.

## 10. Engineering Data Products Assessment

Thread Atlas, Metric Thread Atlas, and Data Methodology are, individually, well-built pages (D1.3 confirmed real dataset metadata: version, verification status, review date, coverage, and a working CSV download on the Metric Thread Atlas). But there is no page that presents them *as a family* — no "Engineering Data Products" index. They are currently visible only as three separate cards inside the Reference hub's mislabeled "Thread engineering" section, plus one footer text link ("Data Methodology," not "Thread Atlas"). Of the four declared product families, this is the least visible: it has no header presence, no homepage presence, and only partial footer presence.

## 11. Charts / Sizes / Guides Assessment

- **Sizes** (115 pages): a large, distinct-intent programmatic cluster, already confirmed healthy by D1.3 (0 duplicative pages, each suffix serves a genuinely different search intent). Its top-level nav placement is well-supported by both scale and quality.
- **Guides** (13 pages): editorial how-to content with real standalone value (confirmed in D1.3's product-quality audit). Top-level placement is reasonable.
- **Charts** (9 pages): the weakest claim among the three. Chart pages largely re-present data that Reference and Sizes already cover in a different format (e.g., `charts/metric-thread-chart.html` overlaps with the same designations covered in `reference/standards/iso.html`'s generated tables and the Sizes cluster). This doesn't make Charts *wrong* to have top-level status, but its claim to peer status alongside Tools/Reference is weaker than Sizes' or Guides'.

None of the three is recommended for demotion in this audit — that determination requires the kind of deliberate, evidence-weighed decision this phase is explicitly not authorized to make unilaterally. It is flagged as a P2 (Charts specifically) for D1.5 to weigh, not a directive.

## 12. Related-Content Assessment

Per D1.3's discovery and duplication audits (not re-run here, cited as evidence), "Related tools," "Related charts," "Related references," and "Related standards" blocks are consistently present on well-developed pages, with reasonable link density and no over-emphasis of any single family. Spot-checking in this phase confirmed the same pattern holds for Tools→Reference connectivity. These blocks meaningfully compensate for weak primary-navigation discovery *once a user is already on a content page* — they do not help a first-time visitor who has only seen the header and homepage.

## 13. User Journey Assessment

- **Tool → calculation → reference → standards → data:** partially supported. Tool→Reference is solid. Reference→Standards→Data is solid *within* the Reference hub. The weak link is Tool→Standards/Data directly — there is no contextual bridge, only the generic footer.
- **Reference → tool → standards → data (reverse):** supported — Reference pages consistently link back to Tools and forward to Standards/Data.
- **Standards → reference → data → tool:** supported on `iso.html`; not supported on the 4 thin stub pages (unchanged D1.3 finding — those pages have only one outbound link, back to the Standards hub).

## 14. Mobile Assessment

No hamburger menu, no nav-collapse JavaScript, and no header-specific `@media` rule exists anywhere in `css/styles.css`. The header nav uses `flex-wrap`, so all 5 items remain visible at every viewport width, simply wrapping onto additional lines on narrow screens. **Conclusion: mobile does not introduce a separate or worse problem** — it inherits the header's Standards/Data Products absence identically from desktop, with no additional hiding.

## 15. English/Spanish Parity

Header structure is identical between English and Spanish (5 items, same order, Spanish labels are direct translations, "Referencia" correctly points to the — English-only — `/reference/` hub). The footer is where parity breaks down: the Spanish footer's Product group has only 4 items (Herramientas, Gráficos, Tamaños, Guías — no Reference at all) versus the English footer's 7, and the Company group has only 3 items versus the English footer's 6 (no Cookie Notice/Terms/Disclaimer). This is a known, previously-documented, intentional scoping decision from D1.1/D1.2 (those pages and their footer links are English-only by design), not a new discovery — but it means a Spanish-language visitor's *footer-based* path to Reference/Standards/Data is currently non-existent, even though their header-based path to Reference works normally.

## 16. Findings by Priority

### P1 — Product hierarchy materially misrepresents BoltLab's strategic architecture

1. **IA-P1-1:** Header navigation has zero representation of Standards Library or Engineering Data Products.
2. **IA-P1-2:** Homepage body content never mentions or links Standards or Data Products (0 occurrences across 6 sections); hero framing is single-tool, not platform.
3. **IA-P1-3:** No `/tools/` hub exists — "Tools" is the only header item that doesn't resolve to an index page.
4. **IA-P1-4:** Reference hub's "Thread engineering" section mislabels 3 of its 4 cards, which are actually Standards/Data Products/Methodology, not thread-engineering content.

### P2 — Minor hierarchy or labeling improvement

5. **IA-P2-1:** Footer has a "Data Methodology" link but no direct "Thread Atlas" link.
6. **IA-P2-2:** Charts' top-level nav claim is weaker than its siblings' (content overlap with Reference/Sizes).
7. **IA-P2-3:** Spanish footer omits Reference/Standards/Data Methodology and all legal links present on the English footer.

### NO ACTION — Current hierarchy is appropriate

8. **IA-NOACTION-1:** Sizes and Guides top-level placement, given confirmed scale and distinct intent (D1.3).
9. **IA-NOACTION-2:** Related-content blocks function well and need no change.
10. **IA-NOACTION-3:** Mobile navigation — no separate defect beyond what the header already has.

No P0 findings. Every family is technically *reachable* (via footer or the Reference hub) even where it is poorly signaled — the bar for "user cannot reach a major product family" was not met, so nothing here was classified P0.

## 17. Recommended Future Hierarchy (evaluate, do not implement)

**Special review answer:** Evidence points to **C + D combined**, not A, B, or E:

- **Reject A** (current nav is correct as-is) — the complete absence of 2 of 4 declared families from both the header and the homepage is a real, evidenced gap.
- **Reject B** (demote Sizes/Guides/Charts to subcategories) — not evidenced; Sizes and Guides have proven distinct value at scale (D1.3). Charts has a weaker claim (flagged P2) but demotion isn't independently justified by this audit.
- **Adopt C** (Standards/Data should receive stronger primary discovery) — directly supported by IA-P1-1, IA-P1-2, IA-P1-4.
- **Adopt D** (the four-family model should remain conceptual, not force a literal 1:1 navigation rebuild) — the current five-item header serves real, distinct, high-volume content (Sizes, Guides) that the literal four-family model doesn't have room for; forcing a literal replacement would itself misrepresent the site's actual content mix.
- **Reject E** (an entirely different hierarchy is objectively better) — not evidenced; no finding suggests the existing five-item skeleton is fundamentally wrong, only incomplete.

**Four candidate directions for D1.5 to evaluate** (not a mandate, not implemented):

1. **Minimal** — add a 6th header item for Standards and/or Data Products.
2. **Consolidation** — keep 5 header items, but make "Reference" visibly communicate that Standards/Data live inside it (relabel, or a hover/dropdown revealing the sub-families).
3. **Homepage-only** — leave the header untouched, add a Standards/Data Products section or card row to the homepage body.
4. **Reference hub relabel** — split or rename the "Thread engineering" section so it no longer mislabels the Standards/Data/Methodology cards it contains.

These are not mutually exclusive, and this audit does not rank them — that evaluation belongs to whichever phase is authorized to make and implement the decision.

## 18. Explicit List of Changes NOT Authorized in D1.4

No HTML, CSS, JS, data, generator, projection, schema, sitemap, robots.txt, `_redirects`, `_headers`, legal/trust page, AdSense configuration, `ads.txt`, or CMP/consent file was modified. No URL was changed. No page was created. No navigation was reordered, relabeled, added to, or removed from. No copy was "improved." No recommendation from Section 17 was implemented. This document and its JSON counterpart are the only two files this phase produced.

## 19. Recommended Implementation Sequence for the Subsequent Phase

If and when a future phase is authorized to act on these findings, the evidence in this audit supports this rough sequencing (for that phase to confirm, not a commitment made here):

1. Resolve **IA-P1-3** first (lowest risk, highest clarity gain): decide whether to build a real `/tools/` hub page, since every other candidate fix assumes a working hub-page pattern.
2. Resolve **IA-P1-4** (Reference hub relabel/restructure) — low risk, no URL changes required, directly fixes a mislabeling defect.
3. Evaluate and choose one of the four **IA-P1-1 / IA-P1-2** candidate directions (Section 17) — the header/homepage decision, which is the highest-impact and highest-visibility change, and should be made deliberately with stakeholder sign-off given it affects every page on the site.
4. Address **IA-P2-1** (Thread Atlas footer link) as a low-risk follow-on once the Data Products family has a clearer home in the hierarchy.
5. Revisit **IA-P2-2** (Charts) and **IA-P2-3** (Spanish parity) as lower-priority, separately-scoped follow-ups — Spanish parity in particular should probably wait until a decision is made about whether to translate Reference/Standards/Data content at all, which is a much bigger scope question than navigation.

---

## Final Governance Check

```
git status --short   → only audit/d1-4-information-architecture.md and
                        audit/d1-4-information-architecture.json created;
                        no other file touched
git diff --stat       → no production file diffs
No scripts run that write to the working tree.
No commit made. No push made.
```
