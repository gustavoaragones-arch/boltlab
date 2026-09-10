# T27 — Standards Stub Remediation & Indexation Cleanup

Date: 2026-09-10
Type: **IMPLEMENTATION, NOT YET COMMITTED/PUSHED**
Baseline HEAD: `911c9cf2f381f4669637b94ef5bee22d3a260634`

## Scope

T26 (`audit/adsense-quality/`) identified five indexed, ad-slotted standards-family pages as the single clearest critical low-value-content defect on `boltlab.io`:

```
reference/standards/ansi.html
reference/standards/din.html
reference/standards/jis.html
reference/standards/british-standards.html
reference/standards/asme.html
```

T27 addresses exactly this finding. Nothing else.

## Forensic findings that determined the treatment

Before changing anything, `data/standards/{ansi,asme,din,jis,bs}/standards.seed.json` were read in full:

| Organization | Seed records | Finding |
|---|---|---|
| ANSI | `records: []` | Zero source-backed content exists |
| DIN | `records: []` | Zero source-backed content exists |
| JIS | `records: []` | Zero source-backed content exists |
| British Standards (bs) | `records: []` | Zero source-backed content exists |
| **ASME** | **`asme_b1_1`, `asme_b94_9`** | **Two genuine, substantive, cited records already exist** |

`asme_b1_1` (Unified Inch Screw Threads) is already bidirectionally connected to the knowledge graph — the `thread_system_unc` entity lists `asme_b1_1` in its own `related_standards`, and two relationship records (`rel_unc_defined_by_asme_b1_1`, `rel_allowance_defined_by_asme_b1_1`) already exist in `data/relationships/relationships.seed.json`. `asme_b94_9` (tap tool nomenclature) lists `spiral_flute_tap`, `spiral_point_tap`, and `forming_tap` — three real tap-type entities already documented in the tapping domain — as `related_entities`.

This single finding determined the entire remediation: **ASME could be genuinely strengthened from data that already exists; ANSI/DIN/JIS/British Standards could not, without fabrication.**

Also discovered during the forensic check: `reference/standards/index.html` (the hub) and both `scripts/generators/generate-standards-pages.js` / `generate-standards-projections.js` already exist as a maintained pipeline — these five pages were never hand-authored HTML; they are generated output. This meant the fix belonged in the generator, not in the HTML files directly (per the brief's explicit instruction not to hand-edit generated artifacts).

## Treatment selected

| Page | Treatment | Why |
|---|---|---|
| ANSI | **NOINDEX** (`noindex,follow`) | No source-backed records exist; cannot responsibly be made substantive now |
| DIN | **NOINDEX** | Same |
| JIS | **NOINDEX** | Same |
| British Standards | **NOINDEX** | Same |
| ASME | **STRENGTHEN** | Two real, cited standard records exist and are already connected to BoltLab's own UNC/UNF and tap-type data |

**Why NOINDEX rather than REDIRECT/REMOVE for the other four:** the pages themselves already state (in their own placeholder text) that they represent standards families BoltLab intends to document "in the future" — this is explicitly the case NOINDEX exists for: content that is not ready to be evaluated as a finished page, but that the site does not want to permanently discard the URL for. A redirect would collapse four distinct, real, future-eligible URLs into one page and require unwinding the redirect the day real DIN/ANSI/JIS/British Standards data is added; NOINDEX is fully and instantly reversible by restoring `index,follow` and reintroducing the URL to the sitemap the day that data exists (at which point, per the generator's own code comment, the correct move is to migrate the page to the `buildAsmeProjection()`-style pipeline the way ASME did here, not to simply flip the meta tag on the current bare template).

## What changed, file by file

### `data/standards/asme/standards.seed.json` — **NOT MODIFIED**
Confirmed byte-identical to HEAD throughout. Already contained everything needed.

### `data/standards/{ansi,din,jis,bs}/standards.seed.json` — **NOT MODIFIED**
Confirmed byte-identical to HEAD. No records were fabricated to "solve" the placeholder problem.

### `scripts/generators/generate-standards-projections.js` — MODIFIED
Added `buildAsmeProjection()`, which reads the two real ASME seed records and writes `data/projections/reference/asme_standards.reference.json`. Every `coverage_points`/`use_cases`/table entry is a direct restatement of the seed record's own `scope`/`public_summary`/`edition`/`standard_status` fields — nothing is invented. The FAQ includes an explicit non-affiliation disclaimer ("BoltLab is not ASME and does not publish or certify compliance with ASME standards").

### `scripts/generators/generate-standards-pages.js` — MODIFIED
- Extended the projection-file regex so `asme_standards.reference.json` renders through the same rich `renderProjectionPage()` template already used for ISO — no new template was invented.
- Removed ASME from the bare-bones `familyPages` list (it now has a real page).
- Rewrote the remaining four `familyPages` entries' `description` text to remove the T26-flagged "for future BoltLab standards expansion" language, replacing it with a neutral, honest statement of current scope ("BoltLab does not yet maintain source-backed X standard records").
- `renderFamilyPage()` now emits `noindex,follow` by default (previously `index,follow`) and no longer emits any `ad-container`/`ad-slot` markup — a noindexed, not-yet-substantive page must not be presented as a normal monetizable content page.
- `createHubExtras()`'s "Standards families" list now links only to ISO and ASME (the two pages with real content); a plain-text note explains that DIN/ANSI/JIS/British Standards are tracked but not yet source-backed, rather than silently dropping all mention of them.
- Added three `ENTITY_LINKS` entries (`spiral_flute_tap`, `spiral_point_tap`, `forming_tap`) pointing to their real, already-existing anchors on `reference/tap-type-guide.html`, so the new ASME page's "Related Concepts" section links to real destinations instead of falling back to unlinked plain text.
- Added a narrowly-scoped trailing-whitespace strip (`.replace(/[ \t]+$/gm, "")`) applied only to the ASME/hub/family-page outputs, to satisfy `git diff --check` — deliberately **not** applied to the shared ISO code path, so a future run of this generator does not incidentally touch the already-correct, byte-identical ISO pages (see "Latent defects discovered" below).
- **Fixed an unrelated pre-existing bug as an unavoidable dependency**: the header/footer HTML embedded in this generator's templates had drifted out of sync with the site's actual current global nav/footer (missing the Standards/Data Methodology/Thread Atlas links and several legal-page footer links). Since every page T27 needed to (re)generate goes through this same shared template, leaving it unfixed would have shipped new/updated pages with objectively worse navigation than the rest of the site. Fixed by copying the exact nav/footer HTML from the current, correct, already-committed `reference/standards/index.html`. This fix is what allowed the ISO pages to regenerate **byte-identical to HEAD** once the seed-data-drift issue (below) was also isolated — proof the fix was correct and complete, not a partial patch.

### `scripts/build_sitemap.py` — MODIFIED
Added `is_noindex()`, which reads a file's `<meta name="robots">` tag and returns true if it contains `noindex`. `collect_urls()`'s `add()` now skips any such file. This is the sitemap "policy layer" fix required so future regenerations never re-include a noindexed page, rather than a one-time hand-edit that the next real sitemap build would silently undo.

### `sitemap.xml` — MODIFIED (surgically, not via full regeneration — see "Latent defects discovered")
Removed exactly the four `<url>` blocks for `reference/standards/{ansi,din,jis,british-standards}`. 228 → 224 URLs. Every other URL, lastmod, and priority value is byte-identical to HEAD.

### `reference/data-methodology.html` — MODIFIED
This hand-authored page's "Standards families referenced on BoltLab" list linked to all six family pages. The four now-noindexed pages are no longer linked (converted to plain-text list items noting "no source-backed page yet"); ISO and ASME remain linked.

### Generated output (produced by running the generators above, not hand-edited)
`data/projections/reference/asme_standards.reference.json` (new), `reference/standards/asme.html`, `reference/standards/{din,ansi,jis,british-standards}.html`, `reference/standards/index.html`.

### Confirmed untouched
Every ISO-family file (`reference/standards/iso.html`, the four individual ISO concept pages, and their six `data/projections/reference/iso_*.reference.json` files), all `data/standards/*/standards.seed.json` files, entities, relationships, tapping datasets/projections/products, every calculator, every CSV, `robots.txt`, `_headers`, `_redirects`, `js/ads-layout.js`, and every other validator/generator.

## Latent defects discovered (not fixed under T27 — out of scope, documented for separate attention)

1. **`build_sitemap.py` currently emits `.html`-suffixed URLs for ~220 pages that do not have `.html` in their real canonical URL.** Running the script end-to-end (as a sanity check) reproduced this for every non-ISO/non-target page in the sitemap. The currently-committed `sitemap.xml` does **not** exhibit this — meaning the checked-in file was not produced by the current version of this script (either it was hand-corrected at some point, or the script regressed after the last real sitemap build). This is a **repository-wide, pre-existing bug entirely unrelated to standards remediation**, and fixing it would touch ~220 unrelated URLs — explicitly out of T27's scope ("do not modify unrelated production families"). T27 did **not** run this script to produce the committed `sitemap.xml` change; the 4-URL removal was applied as a direct, verified, minimal text edit instead. **Recommend a dedicated future phase to fix `to_loc()`'s extension handling and then do a full, reviewed sitemap regeneration.**
2. **The ISO-page generator pipeline was already stale relative to its own source data** before T27: `data/standards/iso/standards.seed.json`'s `iso_965_1` record's `public_summary` had been updated (noting the ISO 965-1:2013→2026 edition transition) and `data/datasets/metric_threads.seed.json` had grown (more coarse/fine-pitch records) since the committed ISO pages were last generated, but the generator was never re-run. This surfaced only because T27 needed to run the shared pipeline; it is unrelated to standards-family remediation and was **not fixed** — the affected ISO artifacts were reverted to their exact committed state so T27 would not silently absorb an unrelated content update. **Recommend a separate, reviewed phase to decide whether/when to refresh the ISO pages' generated output from current source data.**
3. The generator's embedded nav/footer template was stale (see above) — this **was** fixed, because it was a direct, unavoidable dependency of correctly generating the pages T27 is authorized to touch. It was not extended to any page T27 was not already regenerating.

## Governance

Nothing in this phase was committed or pushed. `git status`/`git diff --stat` at the end of implementation show exactly the file set described above, plus the pre-existing untracked files this repository has carried since before T13. See `reports/t27-status.md` for the full validator/test/regression run record.
