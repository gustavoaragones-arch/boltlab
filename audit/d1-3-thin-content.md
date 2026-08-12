# D1.3.4 — Thin Content Audit

Date: 2026-08-11
Method: derived from `audit/d1-3-page-inventory.json`, then manually verified by reading each candidate page's actual HTML (word count alone was never used as the sole criterion, per governance).

## Pages Classified C — THIN

Exactly **5** pages met the THIN bar after manual verification. All 5 belong to the same cluster and share the same root cause.

| Page | Words | Ad slots | Reason |
|---|---|---|---|
| `reference/standards/asme.html` | 33 | 2 | insufficient explanation; insufficient unique information |
| `reference/standards/din.html` | 33 | 2 | insufficient explanation; insufficient unique information |
| `reference/standards/jis.html` | 33 | 2 | insufficient explanation; insufficient unique information |
| `reference/standards/ansi.html` | 34 | 2 | insufficient explanation; insufficient unique information |
| `reference/standards/british-standards.html` | 33 | 2 | insufficient explanation; insufficient unique information |

### Why these are genuinely thin (not just short)

Each page consists of an H1, one sentence of description, and a single bulleted link back to `/reference/standards/`. There is no explanation of what the standard covers, no related concepts, no related tools/charts, no data table, no FAQ, and **no structured data at all** (no Article/BreadcrumbList/FAQPage/WebPage JSON-LD — every other reference/standards page in the site carries at least an `Article` + `BreadcrumbList`). This is a materially different (and weaker) template than the rest of the Standards Library, not a legitimately concise hub page.

By contrast, `reference/standards/iso.html` (447 words) — covering the same "standard family" concept — has a full AEO block, two generated data tables, five cross-link sections, and a 5-question FAQ with matching visible content. The disparity is the clearest evidence that these 5 pages are an unfinished/stub state of the same template, not an intentionally lightweight design.

### Root cause (traced to source)

`scripts/generators/generate-standards-pages.js` renders the ISO family from real projection files (`data/projections/reference/iso_*.reference.json`) via `renderProjectionPage()`, but renders ASME/DIN/JIS/ANSI/British Standards via a completely separate, hardcoded `renderFamilyPage()` function that never reads any knowledge/projection data at all — it just prints a static one-sentence description and a single link, for every family, regardless of what data exists.

Checking the underlying knowledge layer directly:

| Family | `data/standards/<family>/standards.seed.json` records |
|---|---|
| ASME | **1 record** (`asme_b1_1` — ASME B1.1, Unified Inch Screw Threads, with `scope`, `public_summary`, `related_entities`, `related_datasets` all populated) — **verified data that exists but is never surfaced** |
| DIN | 0 records |
| JIS | 0 records |
| ANSI | 0 records |
| British Standards (bs) | 0 records |

This means ASME's thinness is a **generator defect** (real, already-verified data exists and simply isn't being rendered — reason code: "broken data projection"), while DIN/JIS/ANSI/British Standards are thin because **no underlying knowledge record has been authored yet** (reason code: "insufficient unique information," with no shortcut fix available without inventing content).

## Recommended Actions

| Page | Action | Rationale |
|---|---|---|
| `reference/standards/asme.html` | **IMPROVE** | Verified data already exists (`asme_b1_1`); safe to surface using the existing projection/render pipeline without inventing anything. Implemented in D1.3.14 — see `audit/d1-3-fix-priority.md`. |
| `reference/standards/din.html` | **KEEP** (content expansion deferred) | No verified knowledge record exists. Per governance, do not invent standards content. Recommend a future data-acquisition task to author a real `data/standards/din/standards.seed.json` record before this page can honestly be enriched. |
| `reference/standards/jis.html` | **KEEP** (content expansion deferred) | Same as DIN. |
| `reference/standards/ansi.html` | **KEEP** (content expansion deferred) | Same as DIN. |
| `reference/standards/british-standards.html` | **KEEP** (content expansion deferred) | Same as DIN. |

No page in this audit was recommended for CONSOLIDATE, NOINDEX, REMOVE, or REDIRECT — each of the 5 stub pages still serves a real, distinct standards-family identity and is legitimately linked from the Standards Library hub; the defect is thinness, not redundancy or invalidity.

## Pages Considered but NOT Classified Thin

- **`reference/thread-engineering/{inspection,thread-geometry,engineering-tables,fit-classes,thread-standards,thread-tolerances}.html`** (83–91 words each): these are explicitly self-described "category index" hub pages that group 3–5 links to substantive child reference pages plus related tools, each with a real (if brief) AEO block. Per governance ("do not automatically treat short pages as thin"), these are legitimate lightweight navigation hubs, not stubs — classified B, not C.
- **`charts/tap-drill-chart.html`** (48 words) and **`charts/screw-size-chart.html`** (51 words): both contain a real, useful multi-row data table as their primary content. Word count undercounts a table's value; classified B per the governance example ("a data atlas can be STRONG even if much of its content is dynamically rendered" — the same logic applies to a compact chart table).
- **`contact/index.html`** (20 words): a legal/technical page (F), correctly out of scope for editorial word-count standards per governance.
- **The 90 `sizes/` pages with FAQ-schema-but-no-visible-FAQ** (see `audit/d1-3-aeo-quality.md`): these are NOT thin — median word count in that group is ~255–280 words with real tables, explanations, and cross-links. Their defect is a structured-data/visible-content mismatch, not insufficient content, so they were not classified C here.
