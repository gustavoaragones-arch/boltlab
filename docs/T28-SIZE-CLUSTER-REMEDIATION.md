# T28 — Programmatic Size Cluster Remediation

Date: 2026-09-11
Type: **IMPLEMENTATION, NOT YET COMMITTED/PUSHED**
Baseline HEAD: `1ce2e735fc22947b22cf88759dc744384ec9dd40` (T27 close)

## Scope

T26 (`audit/adsense-quality/programmatic-content-audit.md`, `indexation-audit.md`) identified the
135-page `/sizes/mN-*` and `/es/sizes/perno-N` programmatic size-spoke cluster as the dominant,
best-evidenced low-value-content problem on `boltlab.io`: four of six sub-families textually
identical (digit-normalized similarity 1.0) across all 18 sizes, plus a confirmed reciprocal
duplicate-content pair (`m18-vs-m20.html`/`m20-vs-m18.html`).

T28 addresses exactly this finding: strengthen, differentiate, and (where genuinely duplicative)
consolidate the cluster — not expand it, not add filler, not rewrite tapping architecture, and not
implement the future "Fastener Load & Strength" initiative. Nothing else was in scope.

## Pre-implementation size-cluster map

Every family in the cluster was read in full (representative sample: M10) and cross-compared with
its siblings before any change was made:

| Family | Pages | Unique info beyond `mN-bolt-size.html`'s own spec table | Distinct-intent? |
|---|---|---|---|
| `mN-tap-drill.html` | 18 | A "Shop workflow" paragraph; otherwise restates the hub's own tap-drill/pitch row | Marginal — genuinely distinct only where a real verification source could be cited |
| `mN-clearance-hole.html` | 18 | Exactly one datum (clearance diameter) not already on the hub | No — foldable |
| `mN-thread-pitch.html` | 18 | Zero — restates the hub's own pitch row | No |
| `mN-to-inch.html` | 18 | Zero — restates the hub's own "Closest imperial equivalent" row | No |
| `mN-bolt-size.html` | 18 | Full spec table, hex table, common uses, comparisons, FAQ | Yes — the genuine hub |
| `mN-vs-mB.html` | 18 (17 distinct comparisons) | Genuine side-by-side comparison | Yes, except the M18/M20 reciprocal duplicate |
| `es/sizes/perno-mN.html` | 18 | Genuine, non-machine-garbled Spanish content, same structure as EN hub | Yes — but shares clearance-hole's data gap |
| Legacy imperial (`1-4-20`, `3-8-16`, `5-16-18`) + screw-size (`6`,`8`,`10`) + `index.html` | 7 (+1 `es/sizes/index.html`, +3 ES legacy) | Independently authored, not machine-generated from `SPECS` | Yes — genuinely distinct family, out of scope |

This is why the treatment differs by sub-family rather than applying one blanket fix to "the size
cluster" (per the brief's requirement to analyze bolt-size, tap-drill, clearance-hole, pitch,
conversion, and vs-comparison separately).

## Source-of-truth determined before editing

`sizes/mN-bolt-size.html` and `es/sizes/perno-mN.html` are **hand-authored** files, patched in
place by idempotent marker-guarded functions in `_generate_longtail_sizes.py`
(`patch_hubs()` already ran once, pre-T28). `sizes/mN-{tap-drill,clearance-hole,thread-pitch,
vs-mB,to-inch}.html` are **generated** by that same script's `write_all()` loop. This determined
that: (a) hub/perno changes had to be new idempotent patch functions in the same file, following
the `patch_hubs()` precedent, not hand-edits; (b) retiring a generated family meant removing its
write block from `write_all()` **and** deleting the already-generated files on disk, not just one
or the other.

## Critical discovery: `write_all()`'s shared template is stale (confirmed by dry run, not just inspection)

Before trusting `write_all()` to regenerate anything, a full dry run was performed against a
scratch copy of the repository (not the real working tree). It revealed that `page_shell2()` /
`HEADER` / `FOOTER` / `internal_block()` — the shared template every generated page goes through —
is **stale relative to the already-committed, correct output**:

- Missing Standards / Data Methodology / Thread Atlas nav+footer links, missing Cookie Notice /
  Terms / Disclaimer footer links (present in every real committed `mN-tap-drill.html`/`mN-vs-mB.html`).
- `.html`-suffixed canonical/hreflang/lang-switch/internal-block URLs, where the site's real
  convention (confirmed on every committed page) is extensionless.
- No visible `<h2>FAQ</h2>` body section — this template only emits FAQ as head JSON-LD, but the
  real committed pages have both.

This is the same class of defect T27 found and fixed in `generate-standards-pages.js` (a
generator's embedded template drifting from the site's actual current state) — but here, fixing it
would require regenerating and re-verifying all 18 tap-drill pages and all 17 remaining
vs-comparison pages, none of which T28 otherwise needs to touch. That is out of this phase's
authorized scope ("do not modify unrelated production families"), so **`write_all()` and
`patch_hubs()` are deliberately not called**. Every T28 change is instead a targeted,
marker-guarded, idempotent text patch to the already-correct committed files — the same technique
`patch_hubs()`/`patch_sitemap()` already established, just applied with new marker strings for the
new changes. This is documented as a **deferred latent defect** below, not fixed under T28.

## Treatment selected, per family

| Family | Treatment | Why |
|---|---|---|
| `mN-clearance-hole.html` (18) | **CONSOLIDATE** | Zero unique info beyond one datum, which is folded into the hub's spec table; page deleted, 301 to `mN-bolt-size` |
| `mN-thread-pitch.html` (18) | **CONSOLIDATE** | Zero unique info; page deleted, 301 to `mN-bolt-size` |
| `mN-to-inch.html` (18) | **CONSOLIDATE** | Zero unique info; page deleted, 301 to `mN-bolt-size` |
| `m20-vs-m18.html` (1) | **CONSOLIDATE** | Confirmed reciprocal duplicate of `m18-vs-m20.html`; deleted, 301 to the canonical (lower-diameter-first, matching every other pair) |
| `mN-vs-mB.html`, all other 17 | **KEEP** | Genuine, non-duplicated comparative content; untouched |
| `mN-tap-drill.html` (9 of 18: diameters BoltLab's tapping knowledge layer covers) | **STRENGTHEN** | Added an honest, source-grounded cross-link to the Tapping Atlas / Tapping Evidence pages |
| `mN-tap-drill.html` (remaining 9) | **KEEP** | No real per-record verification data exists for these diameters; adding an Atlas claim would be fabricated, so left as-is |
| `mN-bolt-size.html` (18) | **STRENGTHEN** | Folded in the clearance-hole datum; trimmed the "specifications and tools" link list from 5 items (3 of which now 404) to 2 real ones; added the Atlas cross-link where honest |
| `es/sizes/perno-mN.html` (18) | **STRENGTHEN** | Same clearance-fold-in and Atlas cross-link, localized (comma decimals, `hreflang="en"` on the Atlas link since no Spanish Atlas page exists) |
| Legacy imperial/screw-size (6) + `sizes/index.html` + `es/sizes/index.html` + ES legacy (3) | **KEEP** | Independently-authored, already-differentiated family; out of scope |

**Total accounted: 55 CONSOLIDATE + 45 STRENGTHEN + 37 KEEP = 137**, matching the pre-implementation
page count exactly. No page was treated as NOINDEX or REMOVE-without-successor — every retired URL
has a live, non-chained 301 to the page that now holds its information.

## Why CONSOLIDATE (delete + redirect) rather than NOINDEX for clearance/pitch/to-inch

Unlike T27's standards stubs (NOINDEX, because the content genuinely didn't exist yet and might
later), these three families' content **already exists**, verbatim, on the surviving `mN-bolt-size`
hub. Leaving a noindexed, empty-of-purpose duplicate page around serves no one; a 301 to the page
that now actually contains the answer is the correct, fully reversible (redirects can always be
removed) treatment per governing principle 7 ("where several URLs answer essentially the same
question, consolidate rather than manufacturing differences").

## What changed, file by file

### `_generate_longtail_sizes.py` — MODIFIED
- Added `ATLAS_SIZES`, `CONSOLIDATED_SUFFIXES`, `VS_DUPLICATE_REDIRECT_ONLY` constants, each
  documented with the T26 evidence that justifies them.
- Removed the `# clearance` and `# pitch`/`# inch` write blocks from `write_all()` (dead code for a
  hypothetical future full regen is avoided — the blocks are gone, not merely disabled).
- Modified the `# vs` block to skip writing `m20-vs-m18.html`.
- Added a detailed warning comment on `write_all()` documenting the stale-template discovery above,
  and removed `write_all()`/`patch_hubs()` from `__main__` (kept as functions, not deleted, per the
  brief's instruction not to delete a generator merely because it looks stale/unused).
- Added `retire_consolidated_pages()` — deletes the 55 on-disk retired files, idempotent.
- Added `migrate_bolt_size_hub()` — folds in the clearance row, trims the link list (and correctly
  repoints M20's own vs-comparison link to the surviving `m18-vs-m20` rather than the deleted
  `m20-vs-m18` — a bug caught by the internal-link check during implementation and fixed before this
  report was written), adds the Atlas note where honest. Idempotent via marker strings.
- Added `migrate_tap_drill_atlas_notes()` — targeted patch adding the Atlas note to the 9 covered
  tap-drill pages, without going through the stale `write_all()` pipeline.
- Added `migrate_es_size_hub()` — the Spanish-side equivalent of the hub migration.
- Added `clean_sitemap()` — authoritative removal of the 55 retired `<url>` blocks (distinct from
  the legacy `patch_sitemap()`, which is append-only and already a confirmed no-op against the
  current, extensionless-URL sitemap format — left in place, documented, not deleted).
- Added `write_redirects()` — appends the 55 required 301 rules to `_redirects`, idempotent via a
  marker comment.
- Extended `validate()` with 10+ new T28-specific invariants (retired files gone, clearance row
  present, Atlas note presence matches `ATLAS_SIZES` exactly, no dangling links to retired URLs,
  sitemap excludes retired slugs, `_redirects` contains all 55 rules).
- Updated `__main__` to run only the safe, targeted functions in the correct order.

### Generated/patched output (via the functions above, not hand-edited)
`sizes/m{3..20}-bolt-size.html` (18, STRENGTHEN), `sizes/m{3,4,5,6,8,10,12,16,20}-tap-drill.html`
(9, STRENGTHEN), `es/sizes/perno-m{3..20}.html` (18, STRENGTHEN), `sitemap.xml` (55 entries
removed), `_redirects` (55 entries added).

### Deleted (55)
`sizes/m{3..20}-clearance-hole.html`, `sizes/m{3..20}-thread-pitch.html`,
`sizes/m{3..20}-to-inch.html`, `sizes/m20-vs-m18.html`.

### Confirmed untouched
`sizes/m{3..20}-tap-drill.html` for the 9 diameters not in `ATLAS_SIZES`, all 17 remaining
`mN-vs-mB.html` comparison pages, `sizes/index.html`, `es/sizes/index.html`, all legacy
imperial/screw-size pages and their ES equivalents, `data/link-map.json`, every tapping
dataset/projection/product/validator, `robots.txt`, `ads.txt`, `js/ads-layout.js`, and every other
production family.

## Before/after quality metrics

Digit-normalized `difflib.SequenceMatcher` average sibling-pair similarity (same method as T26):

| Family | Before | After |
|---|---|---|
| `tap-drill` | 0.998 | 0.949 (9/18 pages now genuinely differentiated) |
| `clearance-hole` | 0.998 | retired (0 pages) |
| `thread-pitch` | 0.998 | retired (0 pages) |
| `to-inch` | 0.990 | retired (0 pages) |
| `bolt-size` | 0.606 | 0.572 (already the most differentiated family; further strengthened) |
| `vs-comparison` | 0.998 | 0.999 (n=17, duplicate removed) |
| `es-perno` | 0.872 | 0.805 |

Page counts: **137 → 82** (55 retired, each with a working 301). Indexable pages: **137 → 82** (no
NOINDEX was used in this phase; retired URLs are simply gone with a redirect, not left as
crawlable-but-deprioritized stubs). Duplicate content pairs in the `/sizes/` cluster: **1 → 0**
(`m18-vs-m20`/`m20-vs-m18`).

## Validation and regression results

- `node scripts/validate-t28.js`: **22/22 checks passed**.
- `node scripts/test-t28.js`: **8/8 tests passed**.
- Three consecutive runs of `python3 _generate_longtail_sizes.py`: identical 103-file change set
  each time — **zero unexplained differences**.
- `git diff --check`: clean.
- Full 9-validator regression suite: all pass, same baseline warning counts as every prior T-phase
  (`validate-tapping-domain.js`: 0 errors/5 warnings; `validate-tapping-terminology.js`: 0
  errors/1 warning; all others 0/0). No new errors or warnings attributable to T28. Six
  `docs/architecture/*-report.{json,md}` timestamp-only diffs were reverted per the T13–T27
  convention.
- Internal-link scan (`grep -rlE 'href="/(es/)?sizes/m[0-9]+-(clearance-hole|thread-pitch|to-inch)"'`
  and the `m20-vs-m18` equivalent) across the entire repository: zero matches.

## Governing-principle compliance

No engineering value was invented — every added datum (clearance diameter) was read verbatim from
the page it replaces before that page was deleted (`scripts/validate-t28.js` check 8 verifies this
programmatically against git history). No tapping dataset, projection, validator, or product file
was touched. No AdSense code, ad slot, or consent script was added. `robots.txt` was not modified.
No new FAQPage schema was introduced. Spanish content was strengthened only with data already
verified on the English hub, localized (comma decimals), never freshly machine-translated as a new
technical claim.

## Deferred findings (not fixed under T28 — out of scope, documented for a future phase)

1. **`write_all()`'s shared template (`page_shell2()`/`HEADER`/`FOOTER`/`internal_block()`) is
   stale** relative to the actual committed `mN-tap-drill.html`/`mN-vs-mB.html` output (stale
   nav/footer, `.html`-suffixed URLs, missing visible FAQ section). Confirmed by a dry run, not
   just inspection. Recommend a dedicated future phase, mirroring T27's ISO-page-staleness finding:
   fix the shared template, then do a full, reviewed regeneration of all 35 affected pages.
2. **A second reciprocal-duplicate pair exists outside the `/sizes/` cluster**:
   `reference/6g-vs-6h.html` / `reference/6h-vs-6g.html` (noted in T26's audit as evidence the
   `vs_partner()`-style pairing bug is systemic, not a one-off). Outside T28's authorized scope
   (governing principle 17: do not modify unrelated product families) — left untouched.
3. **`patch_sitemap()` and `HUB_BLOCK_TMPL`/`patch_hubs()` are now confirmed-permanent no-ops**
   against the current repository state (their marker strings can never match again). Left in
   place rather than deleted, per the brief's explicit instruction not to delete a generator merely
   because it looks stale.

## Governance

Nothing in this phase was committed or pushed. `git status`/`git diff --stat` show exactly the file
set described above, plus the pre-existing untracked files this repository has carried since
before T13. See `reports/t28-status.md` for the full readiness gate.
