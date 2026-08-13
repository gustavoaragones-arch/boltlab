# D1.6 — Affected Pages (regenerated from the current repository)

Date: 2026-08-11

Total affected pages found by a fresh, full-repository scan: **83** (not assumed to be 39 — D1.3's original count only covered the English-language `text_mismatch` pattern with an English-only heading detector; this scan checks all 224 indexable pages, both FAQ heading languages, and both mismatch patterns).

## Why the count differs from D1.3's 39

- D1.3's original scan only recognized `<h2>FAQ</h2>` as a visible-FAQ anchor, so it silently misclassified 29 Spanish pages that actually have a correctly-structured visible FAQ under `<h2>Preguntas frecuentes</h2>`, and it never separately enumerated 15 English pages (6 `reference/thread-engineering/*`, 5 `tools/*`, 4 `charts/*`) that have FAQPage schema with **no visible FAQ heading in either language at all** — the same defect class as the 90-page P0 already fixed in D1.3, just outside that fix's scope.

- Re-scanning with both heading languages recognized found: **20 pages** with schema and zero matching visible content (`D_schema_no_visible`), and **63 pages** where both exist but the text differs (`text_mismatch` — 39 English, as D1.3 found, plus 24 Spanish pages D1.3 never actually checked due to the heading-language bug).

- Total: 20 + 63 = 83.

## Full Affected-Page Table

| Path | Type | Generator | Original mismatch type | Canonical source | Action |
|---|---|---|---|---|---|
| `charts/metric-thread-chart.html` | chart | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `charts/metric-vs-imperial-chart.html` | chart | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `charts/unc-thread-chart.html` | chart | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `charts/unf-thread-chart.html` | chart | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `es/tools/calculadora-broca-roscar.html` | spanish | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `es/tools/identificador-roscas.html` | spanish | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `es/tools/identificador-tornillos.html` | spanish | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `es/tools/metrico-a-pulgadas.html` | spanish | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `es/tools/paso-rosca-a-tpi.html` | spanish | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `reference/thread-engineering/engineering-tables.html` | thread-engineering | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `reference/thread-engineering/fit-classes.html` | thread-engineering | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `reference/thread-engineering/inspection.html` | thread-engineering | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `reference/thread-engineering/thread-geometry.html` | thread-engineering | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `reference/thread-engineering/thread-standards.html` | thread-engineering | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `reference/thread-engineering/thread-tolerances.html` | thread-engineering | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `tools/metric-to-imperial-screw-converter.html` | tool | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `tools/screw-identifier.html` | tool | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `tools/tap-drill-calculator.html` | tool | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `tools/thread-identifier.html` | tool | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `tools/thread-pitch-to-tpi-converter.html` | tool | hand-authored | D | schema (no visible content existed; added visible section matching schema verbatim) | FIXED — added visible FAQ section matching existing schema |
| `es/guides/broca-para-roscar.html` | spanish | hand-authored | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/guides/metrico-vs-imperial.html` | spanish | hand-authored | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/guides/paso-de-rosca.html` | spanish | hand-authored | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-1-4-20.html` | spanish | _generate_longtail_sizes.py (legacy) | B | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-3-8-16.html` | spanish | _generate_longtail_sizes.py (legacy) | B | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-5-16-18.html` | spanish | _generate_longtail_sizes.py (legacy) | B | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m10.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m11.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m12.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m13.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m14.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m15.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m16.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m17.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m18.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m19.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m20.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m3.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m4.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m5.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m6.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m7.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m8.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `es/sizes/perno-m9.html` | spanish | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `guides/bolt-vs-screw-difference.html` | guide | hand-authored | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `guides/metric-vs-imperial-fasteners.html` | guide | hand-authored | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `guides/tap-drill-basics.html` | guide | hand-authored | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/6g-vs-6h.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/6h-vs-6g.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/allowance-vs-tolerance.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/external-thread-tolerances.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/fundamental-deviation.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/internal-thread-tolerances.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/metric-thread-tolerance-chart.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/screw-anatomy.html` | reference | hand-authored / legacy mixed | B | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/screw-drive-types.html` | reference | hand-authored / legacy mixed | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/screw-head-shapes.html` | reference | hand-authored / legacy mixed | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/self-tapping-vs-self-drilling.html` | reference | hand-authored / legacy mixed | B | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/thread-engineering/index.html` | thread-engineering | _generate_thread_engineering.py (legacy; also emits these 4 chart pages) | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/thread-fit-classes-explained.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/thread-tolerances.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/tolerance-zones-explained.html` | reference | hand-authored / legacy mixed | C | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/1-4-20-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/10-screw-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/3-8-16-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/5-16-18-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/6-screw-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/8-screw-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m10-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m11-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m12-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m13-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m14-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m15-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m16-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m17-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m18-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m19-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m20-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m6-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m7-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `sizes/m9-bolt-size.html` | size | _generate_longtail_sizes.py (legacy) | A | visible (default rule applied) | FIXED — FAQPage JSON-LD rewritten to match visible content exactly |
| `reference/thread-types.html` | reference | hand-authored / legacy mixed | C+rotation | BLOCKED — neither confirmed authoritative without editorial decision | BLOCKED — EDITORIAL SOURCE REQUIRED |