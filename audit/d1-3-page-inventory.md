# D1.3.2 — Complete Indexable URL Inventory

Date: 2026-08-11 (updated post-D1.3.14 fixes)  
Total indexable HTML pages found in repository: **223**  
Source of truth: direct filesystem walk (`find . -name "*.html"`), not the old sitemap. Sitemap cross-checked separately (see below). This file reflects the state **after** the D1.3.14 safe fixes were applied (90-page FAQ patch, ASME enrichment, atlas discovery link) — see `audit/d1-3-change-scope.md` for the exact diff.

Full machine-readable record for every page is in `audit/d1-3-page-inventory.json`. This file summarizes it.

## Page Family Counts

| Family | Count |
|---|---|
| size | 115 |
| spanish | 31 |
| reference | 22 |
| guide | 13 |
| chart | 9 |
| tool | 8 |
| standards | 7 |
| thread-engineering | 7 |
| legal | 6 |
| atlas | 2 |
| homepage | 1 |
| methodology | 1 |
| reference-hub | 1 |
| **Total** | **223** |

## Sitemap Cross-Check

- Pages found on disk: 223
- Pages present in `sitemap.xml`: 223
- `sitemap.xml` `<loc>` count: 223 (matches disk count exactly)

## Technical Health Snapshot (post-fix)

- Duplicate `<title>` values: 0
- Duplicate meta descriptions: 0
- Pages with unparseable JSON-LD: 0
- Pages with zero internal inbound links (excluding homepage): 0 (was 1 before D1.3.14 — `reference/metric-thread-atlas.html` orphan, now fixed)
- Broken internal links site-wide: 0 (verified by full link-resolution scan)

## Classification Summary (D1.3.3), post-fix

| Class | Meaning | Count |
|---|---|---|
| A | STRONG | 85 |
| B | ACCEPTABLE | 126 |
| C | THIN | 4 |
| D | DUPLICATIVE | 0 |
| E | TRANSITIONAL | 0 |
| F | TECHNICAL | 6 |
| G | DATA PRODUCT | 2 |

C dropped from 5 to 4 (`reference/standards/asme.html` moved from C to A after D1.3.14 enrichment). D and E remain 0 — see `audit/d1-3-duplication.md` for cases evaluated and found not to meet that bar. Full rationale in `audit/d1-3-thin-content.md`, `audit/d1-3-duplication.md`, and `audit/d1-3-product-quality.md`.
