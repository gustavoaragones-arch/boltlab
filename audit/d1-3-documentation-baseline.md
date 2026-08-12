# D1.3.1 — Documentation Baseline

Date: 2026-08-11
Scope: `docs/architecture/`, `audit/`, `data/schemas/`, `data/projections/`, `scripts/generators/`, `scripts/validators/`. No files modified in this step.

## Architecture Currently in Force

BoltLab's engineering-content architecture is a three-layer pipeline, documented across three files:

1. **Knowledge Engine** (`docs/architecture/knowledge-engine-architecture.md`, Phase B1.0) — `data/entities/`, `data/standards/`, `data/datasets/`, `data/relationships/` hold the atomic facts (engineering concepts, standard references, measurable values, and the graph connecting them). Delivery artifacts must not own facts directly.
2. **Projection Engine** (`docs/architecture/projection-engine.md`, Phase B1.1) — translates knowledge objects into output-specific, versioned contracts under `data/projections/` (`reference-page.schema.json`, `chart.schema.json`, `tool.schema.json`, `api.schema.json`, `atlas.schema.json`). Traversal/join logic is centralized in `scripts/utilities/relationship-resolver.js` so no generator duplicates it.
3. **Generators** (`docs/architecture/reference-page-generator.md`, Phase B1.2) — consume projections (never raw knowledge objects) and render HTML deterministically, aborting with no partial output on any validation failure. `scripts/generators/generate-reference-page.js` is the reference implementation of this contract; `scripts/generators/` also contains generators for standards pages, chart pages, atlas pages/projections, sitemap, schema, and API data.

Governing rule stated explicitly in `projection-engine.md`: **no feature should bypass Knowledge → Projections → Generators.** This is the binding architectural constraint for D1.3 — any fix touching engineering content must respect this pipeline rather than hand-editing generated HTML output where a generator is the actual source of truth.

Not every page on the site is projection-generated, however. Only a specific, identified subset is:
- `reference/pitch-diameter-explained.html` is the one page explicitly documented (in `reference-page-generator.md`) as generator-produced from a projection (`data/projections/reference/pitch_diameter.reference.json`).
- `data/projections/reference/` contains 8 additional `.reference.json` files (standards_hub, iso_68_1, iso_965_1, iso_724, iso_261, iso_262, iso_family, pitch_diameter) and `data/projections/atlas/` contains 2 atlas projections (thread-atlas, metric-thread-atlas).
- The much larger `reference/`, `sizes/`, `charts/`, `guides/`, `tools/` HTML page counts (hundreds of files) predate the knowledge/projection pipeline and were authored directly or by earlier-generation scripts (`_generate_longtail_sizes.py`, `_generate_thread_engineering.py`, `_consolidate_urls.py` at repo root) rather than the current projection contract. This distinction matters for D1.3.7: if a defect is found in a projection-generated page, the fix belongs in the projection/generator layer; if found in a legacy-generated or hand-authored page, no such regeneration pipeline exists to route the fix through.

## Page Families (as documented + as observed in the repository)

| Family | Directory | Generation source |
|---|---|---|
| Tools | `tools/`, `es/tools/` | Hand-authored (no generator in `scripts/generators/` targets `tools/`) |
| Charts | `charts/` | `generate-chart-pages.js` |
| Guides | `guides/`, `es/guides/` | Hand-authored |
| Sizes | `sizes/`, `es/sizes/` | Root-level `_generate_longtail_sizes.py` (legacy, pre-knowledge-engine) |
| Reference (core) | `reference/*.html` (flat files) | Mixed — most hand-authored/legacy (`_generate_thread_engineering.py`), one (`pitch-diameter-explained.html`) is the documented projection-generator output |
| Reference — Thread Engineering cluster | `reference/thread-engineering/` | `_generate_thread_engineering.py` (legacy generator, predates projection engine) |
| Standards Library | `reference/standards/` | `generate-standards-pages.js` / `generate-standards-projections.js` |
| Thread Atlas | `reference/thread-atlas.html`, `reference/metric-thread-atlas.html` | `generate-atlas-page.js` / `generate-thread-atlas-page.js` from `data/projections/atlas/` |
| Engineering Data Methodology | `reference/data-methodology.html` | Hand-authored (D1.1) |
| Legal/Trust | `about/`, `contact/`, `privacy/`, `cookies/`, `terms/`, `disclaimer/` | Hand-authored (D1.1/D1.2) — **out of scope for modification in D1.3** per governance rule 22 |

## Validation Systems

Two validators exist and both are still functional:
- `scripts/validators/validate-knowledge-engine.js` → writes `docs/architecture/validation-report.{json,md}`. Checks schema completeness, duplicate ids, reference integrity, circular relationships, orphan entities, missing SVG assets, generator module presence.
- `scripts/validators/validate-projections.js` → writes `docs/architecture/projection-validation-report.{json,md}`. Checks projection schema/contract integrity.

Both validators **regenerate their report files with a fresh timestamp on every run**, and in prior phases (D1.1, D1.2, D1.2.1) this produced a diff purely from timestamp/count drift unrelated to the phase's actual work — each time, the pattern was to run the validator for its pass/fail signal, then `git checkout --` the regenerated report files to keep the working tree scoped. D1.3 follows the same precedent (see D1.3.15).

There is no dedicated HTML/link/sitemap linter script in the repository (`scripts/validators/` contains only the two above). D1.3's link/sitemap/duplicate-title/canonical/hreflang/orphan checks are therefore implemented as ad hoc analysis scripts against the full page inventory (D1.3.2), not against a pre-existing lint tool.

## URL Rules (observed, confirmed against `_redirects`, `_headers`, and live page canonicals)

- Extensionless URLs: canonical tags omit `.html` for every page (`https://boltlab.io/reference/thread-tolerances`, not `...html`).
- `_redirects` 301-normalizes any `:name.html/` variant back to the extensionless form for `sizes/`, `tools/`, `guides/`, `charts/`, `reference/`, and their `es/` equivalents.
- Directory-index pages (`about/index.html`, `contact/index.html`, `privacy/index.html`, `reference/index.html`, `charts/index.html`, `sizes/index.html`, `guides/index.html`, `reference/standards/index.html`, `reference/thread-engineering/index.html`) use canonical **without** trailing slash but are listed in `sitemap.xml` **with** a trailing slash — a pre-existing, consistent, site-wide convention (confirmed in D1.1/D1.2 audits), not a defect.
- Every page carries `Organization` + `WebSite` JSON-LD; most content pages additionally carry `Article`, `BreadcrumbList`, `FAQPage`, and `WebPage` JSON-LD (leaf reference/tool/chart pages). Legal/trust pages (about/contact/privacy/cookies/terms/disclaimer) intentionally carry only `Organization` + `WebSite` — a simpler, established convention for that page family.

## Content-Quality Rules (existing, from prior phases)

- D1.1 established: no fabricated credentials, no standards-body affiliation claims, explicit "this is not the standards organization" disclaimer language on the Standards Library and Data Methodology pages.
- D1.2 established: no AdSense-active claims, conditional language for future advertising, accurate current-state technical disclosures (verified via direct code inspection, not assumption).
- The Thread Engineering cluster's own generator-era audit (`audit/thread-engineering-summary.md`, 23 pages) already certified 0 crawl errors, 0 orphans, 0 broken links, 0 duplicate titles/descriptions, 0 canonical inconsistencies for that specific cluster — a useful known-good baseline to compare D1.3's full-site findings against.

## Known Technical Exceptions (carried forward, not to be "fixed" by D1.3 unless newly evidenced)

- `privacy/index.html` footer previously lagged the rest of the site until D1.2 brought it into parity — now resolved, no outstanding exception.
- Canonical-vs-sitemap trailing-slash mismatch for directory-index pages (see above) — pre-existing, consistent, not a defect.
- `ads.txt` does not exist anywhere (repo, git history, or a verified production state) — confirmed independently by D1.2.1. Explicitly out of scope for D1.3 (governance rules 19, and the phase's own "Do NOT create ads.txt").
- Two distinct `reference/thread-atlas.html` and `reference/metric-thread-atlas.html` pages exist covering overlapping "unified thread atlas" ground — flagged here for D1.3.6 (Duplication Audit) to evaluate on the merits rather than assumed to be a problem.
