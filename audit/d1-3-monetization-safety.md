# D1.3.12 — Monetization Safety Audit

Date: 2026-08-11
Note: AdSense is not active (confirmed independently in D1.2 and D1.2.1 — no `adsbygoogle` script, no `ca-pub-` string, no `ads.txt` anywhere in the repository). This is therefore an audit of the *ad-slot placeholder layout* for future readiness, not a review of live ad behavior.

## Ad Placeholder Dominance Check

Programmatic scan of `ad_slot_count` across all 223 indexable pages (from `audit/d1-3-page-inventory.json`):

- **Maximum ad slots on any single page: 2** (one inline `.ad-slot--inline`, one `.ad-slot--sidebar`), site-wide, with no exceptions. No page carries more than 2 placeholder slots.
- Legal/trust pages (`about`, `contact`, `privacy`, `cookies`, `terms`, `disclaimer`) and the homepage carry **0** ad slots — appropriate, and unchanged from D1.1/D1.2.
- Tool pages carry exactly **1** ad slot each (lower than the reference/size/guide default of 2) — appropriate given tools are the primary interactive product and should not be ad-heavy.

**The one real finding:** the 5 thin standards stub pages (`reference/standards/{asme,din,jis,ansi,british-standards}.html`, see `audit/d1-3-thin-content.md`) each carry the site's maximum 2 ad slots against only 33–34 words of actual content — the lowest content-to-ad ratio anywhere on the site. This is not a problem of absolute ad count (2 is the sitewide ceiling, used consistently elsewhere against much more substantial content), but of relative dominance on these 5 specific pages. This is the same finding already documented in `audit/d1-3-thin-content.md`; it is not a separate defect, but it is the direct reason those 5 pages are also flagged here as an AdSense-readiness risk (Google's guidelines specifically discourage "pages created primarily to display ads" and low-value pages carrying ad placeholders disproportionate to content).

Resolution: fixing the underlying thinness (D1.3.14, ASME only — real verified data now exists on the page) directly resolves the ad-dominance concern for that one page by substantially increasing genuine content. DIN/JIS/ANSI/British Standards remain flagged and deferred (no data available to enrich them without fabrication) — see the fix-priority classification for the explicit recommendation to either enrich with real data before AdSense submission, or reduce their ad-slot count to 0–1 as an interim mitigation in a future phase.

## Ads Disguised as Navigation

Checked ad container markup site-wide: every `.ad-container` is visually and structurally separated from `.site-header` / `nav.nav-list` / `.footer-nav` — ad slots are never placed inside a `<nav>` element, never styled with nav-link classes, and are always immediately preceded by a `.ad-label` element reading **"Sponsored"** (English) or **"Patrocinado"** (Spanish, on `es/` pages) with `aria-label="Advertisement"` on the slot itself. No instance of an ad container mimicking navigation, a button, or an internal link was found.

## Ad Container Separation

`.ad-container` and `.sidebar-ad` are distinct, consistently-styled block elements (verified across all page types: reference, size, guide, chart, standards, tool, thread-engineering) — always positioned after the main content sections and clearly labeled, never interleaved mid-sentence or mid-table.

## Tool Functionality Primacy

On all 8 tool pages, the interactive calculator/identifier form is the first substantive element in `<main>`, appearing before any ad container. No tool page places an ad slot above or interrupting the tool's input/output flow.

## Pages That Exist Primarily to Display Ads

Checked every C-classified (thin) page for this specifically: the 5 standards stub pages have real (if minimal) navigational value — each correctly identifies a real standards family and links back to the hub — so none were found to exist "primarily" for ad display; their defect is thinness/generator-incompleteness (D1.3.4), not an ads-first design. No page anywhere on the site was found to exist primarily to display advertising.

## Affiliate Links / Deceptive Click Language

- Repository-wide scan for affiliate markers ("affiliate," Amazon affiliate tag patterns, "partner link," "sponsored link" as anchor text): **zero matches.** BoltLab has no affiliate links anywhere.
- No deceptive click-bait language ("click here to win," fake download buttons, disguised ad CTAs) was found on any page.

## Summary

| Check | Result |
|---|---|
| Max ad slots per page | 2 (consistent site-wide ceiling) |
| Ads disguised as navigation | None found |
| Ad containers clearly separated/labeled | Yes, consistently |
| Tool functionality precedes ads | Yes, on all 8 tools |
| Pages existing primarily to display ads | None found |
| Affiliate links | None found |
| Deceptive click language | None found |
| Ad-to-content ratio concern | 5 pages (standards stubs) — 1 resolved via content fix (ASME), 4 deferred pending new data |

**No P0 monetization-safety blockers.** The one real finding (ad-dominant thin standards pages) is a subset of the D1.3.4 thin-content finding, not a distinct structural monetization problem, and is partially resolved by the same fix.
