# D1.6 — FAQ Schema & Answer Integrity

Date: 2026-08-11
Status: **READY FOR REVIEW — BLOCKED ITEMS DOCUMENTED**

## Scope

Resolve every page where FAQPage JSON-LD and visible FAQ content disagree, so that structured data accurately represents what users actually see. This is a targeted reconciliation phase, not a redesign, not new SEO expansion, not an AEO rewrite, and not an AdSense activation phase. Per governance, the affected-page list was regenerated from the current repository rather than trusting D1.3's original count of 39 — see `audit/d1-6-affected-pages.md` for why the true count is 83, not 39.

## Affected Pages

**83 pages** found by a full, fresh scan of all 224 indexable pages, checking both `<h2>FAQ</h2>` and `<h2>Preguntas frecuentes</h2>` as valid visible-FAQ anchors (D1.3's scan only recognized the English heading, which silently misclassified 29 Spanish pages and left 15 English pages — 6 `reference/thread-engineering/*`, 5 `tools/*`, 4 `charts/*` — outside its scope entirely). Full per-page detail: `audit/d1-6-affected-pages.json` / `.md`.

- **20 pages**: FAQPage schema exists, **zero** visible FAQ content anywhere on the page (same defect class as D1.3's 90-page P0, just missed from that fix's scope).
- **63 pages**: both FAQPage schema and a visible FAQ section exist, but the text differs (39 of these are D1.3's original English finding; 24 are newly-discovered Spanish pages).

## Mismatch Classification

| Category | Meaning | Count |
|---|---|---|
| D | Schema contains questions not visible to users | 20 |
| A | Same question, minor answer wording difference | 44 |
| B | Same question, material answer difference | 5 |
| C | Different question set entirely (independently-authored templates) | 13 |
| C + rotation defect | Different question set **and** visible answers appear shifted relative to their own questions | 1 (`reference/thread-types.html`) |
| E | Visible FAQ contains questions not in schema | 0 |
| F | Both sets valid but duplicated/independently maintained | (root cause of the 13 "C" cases — see Root Causes) |
| G | Generator bug | (root cause of the 20 "D" cases on generator-produced pages — see Root Causes) |

## Root Causes

- **Category D (20 pages), generator-level (`G`):** Traced to `_generate_thread_engineering.py` (the legacy script responsible for all 6 `reference/thread-engineering/*` category pages **and** 4 of the affected chart pages — `metric-thread-chart.html`, `metric-vs-imperial-chart.html`, `unc-thread-chart.html`, `unf-thread-chart.html`). Its `faq_json()` helper builds FAQPage schema independently of the HTML body template, which never renders a visible FAQ section at all for these page types. `tools/*.html` (5 pages) and `es/tools/*.html` (5 pages) are hand-authored (no generator), with the same defect introduced by hand.
- **Category A/B/C text mismatches (63 pages), independently-maintained content (`F`):** Every affected page has two separately-authored Q&A sets — a generic, often auto-generated-looking schema block (e.g. "What is the engineering purpose of X?") and a later, more specific, hand-written visible FAQ section. Nothing in the generator or template keeps these two in sync once the visible content is edited.
- **`reference/thread-types.html` — unique defect:** manual inspection (not caught by two independent automated heuristics — see below) found that the 5 visible answers are **not misaligned in wording, they are misaligned in position**: each visible answer correctly answers a *different* question than the one it's currently placed under (answer 0 belongs under question 1, answer 1 belongs under question 2, etc. — a clean one-position rotation). This is a genuine visible-content defect, not merely a schema/visible sync gap.

## Canonical Content Decisions

Per governance's default rule ("visible user-facing FAQ content is the canonical source"):

- **20 Category-D pages:** no visible content existed to be canonical, so the page's own **existing schema text** was used as the source for the new visible section (verbatim, no invention) — mirroring the precedent already established for D1.3's 90-page fix.
- **62 of the 63 text-mismatch pages:** visible content was confirmed, by direct manual reading (not just automated similarity scoring — see Root Causes below for why automated detection alone was insufficient), to correctly and coherently answer its own question in every sampled and reviewed case. Schema was rewritten to match visible exactly.
- **1 page (`reference/thread-types.html`):** **BLOCKED.** Visible content itself has an internal defect (each answer is paired with the wrong question). Applying the default rule here would have copied a genuinely broken, misleading answer into structured data (e.g., pairing the question "What is a thread type?" with an answer entirely about UNC vs. UNF). Fixing the *visible* page content (re-pairing 5 existing answers to their 5 correct existing questions) is a legitimate, non-inventive correction — the right answer for each question is objectively determinable from its content — but it is a **content edit to a live page**, not a structured-data sync, and is outside what this phase was authorized to do without an explicit editorial decision. Per governance ("if neither version can be established as authoritative... do not guess"), this was left untouched and is reported here in full rather than silently fixed or silently left inconsistent.

## Verification Method Note

Two automated heuristics were tried to detect cases like `reference/thread-types.html` at scale (character-level similarity scoring, and question/answer keyword-overlap scoring). Both produced meaningful false positives and false negatives — the keyword heuristic flagged 10 pages that turned out to be a known-safe generic template (Category C, correctly self-consistent), and neither heuristic flagged `thread-types.html` reliably. The rotation defect was found by direct manual reading of all pages outside the two known-safe templates (26 pages read in full during discovery), followed by an automated content-token cross-check across the full `sizes/`/`es/sizes/` cluster (34 pages) that confirmed zero further instances of this specific defect. This is disclosed because the phase's success criteria require confidence, not merely a clean automated report.

## Generator Changes

**None implemented.** `_generate_thread_engineering.py` is the confirmed shared root cause for 10 of the 20 Category-D pages (6 thread-engineering + 4 charts), but it is a large (900+ line), ad-hoc legacy script that also generates dozens of other unrelated pages. Modifying and re-running it carries materially higher regression risk than a targeted, deterministic, verified HTML patch achieving the identical end state — the same judgment call made for the equivalent legacy `_generate_longtail_sizes.py` situation in D1.3. The generator-level defect is documented here as the recommended target for a future, dedicated generator-hardening pass; it was not modified in this phase.

## Page-Level Changes

**82 files modified**, all via two small, deterministic, reviewed Python scripts (used once, not retained in the repository):

1. **20 files** (Category D): a new `<section class="card"><h2>FAQ</h2>` (or `<h2>Preguntas frecuentes</h2>` for the 5 `es/tools/*` pages) was inserted immediately before each page's `<div class="ad-container">`, containing that page's own pre-existing schema questions and answers verbatim, HTML-escaped consistently with the rest of the site.
2. **62 files** (Category A/B/C, excluding the blocked page): each page's `FAQPage` JSON-LD `mainEntity` array was rewritten to exactly match its own visible `<h3>`/`<p>` FAQ content, word-for-word, including decoding any HTML entities (e.g. `&amp;` → `&`) so the JSON holds literal characters. No other field in the JSON-LD object, and no visible content, was touched.

Full per-page list: `audit/d1-6-affected-pages.md`. `git diff` was reviewed for a sample from each category to confirm every diff is limited to exactly the FAQ section/schema block, with no incidental changes.

## Validation

| Check | Result |
|---|---|
| FAQPage JSON-LD parses (site-wide) | 224/224 pages scanned, 0 parse errors |
| Pages with FAQPage schema | 197 |
| Schema/visible mismatches remaining | 1 (`reference/thread-types.html`, BLOCKED, documented) |
| Duplicate FAQPage blocks on one page | 0 |
| Duplicate questions within one page's schema | 0 |
| Duplicate visible FAQ headings on one page | 0 |
| Hidden FAQ content (`display:none`, `aria-hidden`, off-screen) | 0 found anywhere |
| Duplicate titles (site-wide) | 0 |
| Duplicate meta descriptions (site-wide) | 0 |
| Pages missing from sitemap | 0 |
| `.html` internal hrefs introduced | 0 |
| Broken internal links (full site) | 0 |
| Orphan pages (0 inbound links, excluding homepage) | 0 |
| `validate-knowledge-engine.js` | PASS, 0 errors, 0 warnings |
| `validate-projections.js` | PASS, 0 errors, 0 warnings |
| Unrelated regenerated report diffs | Found and reverted: `docs/architecture/*validation-report*` (timestamp-only, per established precedent) and `audit/d1-3-page-inventory.json` (accidentally overwritten by re-running a D1.3 validation helper script during this phase's own verification pass — reverted, confirmed not part of D1.6's intended scope) |

## Remaining Mismatches

**1**, fully documented: `reference/thread-types.html` — see Canonical Content Decisions above. This is a genuine, previously-undiscovered content defect (not a structured-data technicality) that a future editorial pass should resolve by re-pairing the 5 existing answers to their 5 correct existing questions, then syncing schema to match.

## Blocked Pages

**1**: `reference/thread-types.html`, classified `BLOCKED — EDITORIAL SOURCE REQUIRED` per governance. No other page was blocked — every other affected page had a confidently-determinable canonical source (either "schema, because no visible content existed" or "visible, verified correct by direct reading").

## D1.5 Regression Check

| Check | Result |
|---|---|
| `/tools/` exists and lists all 8 tools | PASS |
| Header "Tools" → `/tools/` (spot-checked across page types) | PASS |
| Homepage "Engineering reference & data" section present | PASS |
| Reference hub retains "Thread engineering" and "Standards & engineering data" as separate sections | PASS |
| Footer "Thread Atlas" link present | PASS |
| Canonical URLs unchanged (spot-checked `/tools/`, `/reference/`) | PASS |
| No URL, sitemap, or navigation changes introduced by D1.6 | PASS |

D1.5's information architecture is fully intact. The only pages D1.5 touched that D1.6 also touched are the 6 `reference/thread-engineering/*` pages (footer/header nav links only in D1.5; FAQ section only in D1.6 — non-overlapping edits, confirmed via diff review) and `charts/*`/`tools/*` (same — footer/header only vs. FAQ-section only).

## Governance Compliance

- No `.aeo-answer-block` content modified anywhere (confirmed via diff review — every change is scoped to FAQ sections/schema only).
- No engineering values, tolerance values, standards requirements, torque values, safety claims, material properties, certification claims, or standards-body affiliation invented or changed anywhere.
- The 4 thin standards pages (DIN/JIS/ANSI/British Standards) were not touched.
- No `.aeo-answer-block`, guide AEO gap, tap-drill hedge, or Atlas metadata inconsistency (the frozen D1.3 P1/P2 deferrals) was reopened.
- AdSense: not activated. CMP: not installed. `ads.txt`: not created or modified. Publisher ID: unchanged.
- No affiliate links added. No ad layout or density change.
- No commit made. No push made.

## Final Status

**D1.6 STATUS: READY FOR REVIEW — BLOCKED ITEMS DOCUMENTED**

82 of 83 affected pages fully reconciled — every FAQPage schema item now corresponds to real visible content, and every represented visible FAQ item now corresponds to schema, using only existing site content (either party's own pre-existing text). 1 page is explicitly blocked with full documented evidence rather than silently fixed or silently left broken, because fixing it correctly requires an editorial content edit beyond this phase's schema-reconciliation authorization.
