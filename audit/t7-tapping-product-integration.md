# T7 — Tapping Product Integration & Discovery

Date: 2026-08-16
Status: **READY FOR REVIEW**

## Baseline Discovery Inventory (before any change)

| Question | Finding |
|---|---|
| A. Where can a first-time user discover the Tapping Atlas? | Only `reference/index.html`'s hub card |
| B. Where can a first-time user discover the Tap Type Guide? | Only `reference/index.html`'s hub card |
| C1. Does Atlas → Guide exist? | **No.** 0 references to `tap-type-guide` anywhere in `tapping-atlas.html` |
| C2. Does Guide → Atlas exist? | **Partially.** A bare `<li>` in a generic "Related references" list — not a contextual callout |
| D. Reverse links from adjacent engineering pages | **0** from `thread-atlas.html`, `metric-thread-atlas.html`, `thread-engineering/index.html`, `tap-drill-calculator.html`, or the homepage |
| E. Can a user discover the CSV without knowing the URL? | Only from within the Atlas itself; not mentioned on the Tap Type Guide |
| F. IA consistency | Both products already used the established hub-card convention correctly; the actual gap was contextual cross-linking between the two sibling products and from one clearly-relevant tool |

## Identified Discovery Weaknesses (classified)

| Weakness | Severity | Fixed? |
|---|---|---|
| No Atlas → Guide link | **High** — breaks the core two-product user journey the phase brief describes | Fixed |
| Guide → Atlas link existed but wasn't contextual | Medium | Fixed |
| CSV not mentioned on the Guide | Medium | Fixed |
| No link from Tap Drill Calculator (a directly relevant tool) to the Atlas | Medium | Fixed |
| No reverse links from `thread-atlas.html`/`metric-thread-atlas.html` | Low | Deferred (see below) |
| No links from `thread-engineering/index.html` | Low | Deferred — not a natural taxonomic fit |
| No links from 3 adjacent guides | Low | Deferred — no strong non-redundant justification found |

## Exact Changes Made

### 1. Tapping Atlas → Tap Type Guide (required, exact wording)

Added to `scripts/generators/generate-tapping-atlas.js`, rendered right after the existing tap-types grid:

```html
<section class="card">
  <h2>Explore tap types</h2>
  <p>Learn how taper, plug, bottoming, spiral-flute, spiral-point, forming, and other tap types differ in geometry, application, and evidence.</p>
  <p><a href="/reference/tap-type-guide">Tap Type Guide</a></p>
</section>
```

### 2. Tap Type Guide → Tapping Atlas + CSV (required, exact wording)

Added to `scripts/generators/generate-tap-type-guide.js`, as its own dedicated block (not merged into the generic "Related references" list, which remains untouched below it):

```html
<section class="card">
  <h2>Browse tapping data</h2>
  <p>Compare verified and source-bound tap-drill data across metric, UNC, and UNF thread sizes in the Tapping Atlas.</p>
  <p><a href="/reference/tapping-atlas">Tapping &amp; Threading Atlas</a></p>
  <p><a href="/downloads/tapping-atlas.csv" download>Download the tapping dataset (CSV)</a></p>
</section>
```

### 3. Tap Drill Calculator → Tapping Atlas (contextual, hand-edited)

`tools/tap-drill-calculator.html` is hand-maintained (confirmed no generator writes to it), so it was edited directly rather than risking generator drift. One line added to its existing "Related guides" list:

```html
<li><a href="/reference/tapping-atlas">Tapping &amp; Threading Atlas</a> — verified and source-bound tap-drill data by thread designation</li>
```

Justified directly by the brief's own example ("tap drill → tapping data") — a user calculating a tap drill size is a natural audience for BoltLab's verified/source-bound reference data on the same topic.

## Reason for Every Change

Each change closes a specific, evidence-based gap identified in the discovery audit above — none were added mechanically or to increase link count. No link was added where the audit didn't demonstrate a real, answerable user question.

## Deferred Items (with reasoning)

1. **`thread-atlas.html` / `metric-thread-atlas.html` reverse links** — both are generator-produced by pipelines outside the tapping domain (`generate-thread-atlas-page.js`, `generate-atlas-page.js`, each with its own projection). Modifying them properly means touching foreign architecture; hand-editing their HTML output directly would silently drift away on the next regeneration. Both risks are explicitly out of scope ("do not create a second tapping architecture," "do not touch unrelated architecture"). The existing one-way links (Atlas → Thread Atlas, Atlas → Metric Thread Atlas) plus the shared reference hub already provide *a* discovery path, just not a reverse one.
2. **`thread-engineering/index.html`** — that hub's taxonomy (tolerances, fit classes, geometry, inspection) doesn't have a natural home for tapping; forcing a link in would be exactly the "mechanical" link-adding the brief warns against.
3. **Three adjacent guides** (`thread-types-explained`, `thread-pitch-explained`, `metric-thread-tolerances`) — no sufficiently distinct, non-redundant user question found to justify a link beyond what the Atlas/Guide already provide outbound.

## Regression Results

| Check | Result |
|---|---|
| `data/projections/tapping/tapping-profiles.json` | Byte-identical (`f9739e1d...`) |
| `data/projections/tapping/tap-types.json` | Byte-identical (`63867da5...`) |
| `downloads/tapping-atlas.csv` | Byte-identical (`3a391f37...`) — 29-row grain untouched |
| NASA-verified bottoming-tap fact | Still visible on the Atlas |
| Tap-drill verification counts | Unchanged: 9 verified / 20 source-bound |
| Overall record status | Unchanged: 0 verified / 29 source-bound |
| T5 Tap Type Guide | Content changed as *required* by this phase's own Section 7 (new cross-link block); all validator checks and FAQ identity still pass — functionally intact, not byte-identical, because byte-identity was never possible while also satisfying the required cross-link |

## Validator Results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational warnings, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` | pass | 0 |
| `validate-tapping-atlas.js` | pass | 0 |
| `validate-tap-type-guide.js` | pass | 0 |

## Site-Wide Checks

| Check | Result |
|---|---|
| Broken internal links (across all 4 touched files) | 0 |
| `.html` internal hrefs | 0 |
| Duplicate titles | 0 |
| Duplicate meta descriptions | 0 |
| JSON-LD parse errors | 0 (11 blocks total across both pages) |
| FAQ identity mismatches | 0 |
| Sitemap entries for both tapping URLs | 1 each (no duplication, no gap) |

## Final Page/Link Counts

- Tapping Atlas now links to Tap Type Guide (new).
- Tap Type Guide now links to Tapping Atlas via a contextual block (upgraded from a bare list item) and to the CSV download (new).
- Tap Drill Calculator now links to Tapping Atlas (new).
- No new pages created. No new URLs created. No sitemap change needed.

## Confirmation: No New Engineering Values Introduced

Confirmed — every change in this phase is a link, a heading, or fixed-wording body text specified by the phase brief itself. No fact, number, verification state, or standards claim was added or altered.

## Final Status

**READY FOR REVIEW.** See `audit/t7-change-scope.md` for the complete file accounting. Nothing committed or pushed.
