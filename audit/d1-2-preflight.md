# D1.2 — Technical Preflight Audit

Date: 2026-08-11
Method: Direct repository inspection (`grep`/`find` across all `.html`, `.js`, `.css`, `.txt`, `.xml` files). No claims below are inferred — each is tied to a specific search performed against the actual working tree.

## Required Status Fields

| Field | Status | Evidence |
|---|---|---|
| AdSense active | **NO** | No `adsbygoogle`, `pagead2.googlesyndication.com`, `google_ad_client`, or `ca-pub-` string found anywhere in `.html`/`.js` site-wide. |
| AdSense script present | **NO** | No `<script>` tag referencing `googlesyndication.com`, `pagead2.googlesyndication.com`, or `doubleclick.net` found anywhere. |
| Ad units present | **NO** | `.ad-slot` / `.ad-container` elements exist as empty placeholder markup (`data-ad-placeholder="true"`) driven by `js/ads-layout.js`, but no ad-network script ever populates them. These are layout reservations, not live ad units. |
| Analytics present | **NO** | No `gtag(`, `googletagmanager.com`, `google-analytics.com`, `analytics.js`, `UA-*`, `G-*`, `GTM-*`, or any third-party analytics vendor (Plausible, Fathom, Umami, Hotjar, Clarity, Mixpanel, Segment) found anywhere. |
| Cookies/localStorage used | **YES (localStorage only; no cookies)** | `js/ads-layout.js` reads/writes two `localStorage` keys — `boltLabStickyAdDismissed` and `boltLabStickyAdState` — to remember whether a visitor dismissed or collapsed the mobile sticky ad-placeholder shell. No `document.cookie` usage exists anywhere in the codebase. |
| Consent mechanism present | **NO** | No consent-management code, consent banner markup, or consent-related script found. |
| CMP present | **NO** | No reference to any CMP vendor (OneTrust, Cookiebot, Didomi, Usercentrics, Quantcast, or any IAB TCF integration) found anywhere. |
| ads.txt present | **NO — see note below** | `find . -iname "ads*.txt"` returns nothing; `ads.txt` does not exist at the repository root or anywhere in the tree. |
| Privacy page present | **YES** | `privacy/index.html` exists, canonical `https://boltlab.io/privacy`, listed in `sitemap.xml`. Content predates this phase and requires rewrite (see below). |
| Cookie page present | **NO** | No `/cookies` directory or page exists anywhere in the repository. |
| Legal footer links present | **PARTIAL** | Footer (`footer-nav-right`) currently exposes About, Contact, Privacy only. Cookie Notice, Terms, and Disclaimer are not yet linked because those pages do not yet exist. |

## Important Note: ads.txt Discrepancy

The phase brief states ads.txt "has already been independently established as: `google.com, pub-3974004697476579, DIRECT, f08c47fec0942fa0`." **Direct repository inspection does not confirm this.** No `ads.txt` file exists anywhere in this working tree, and no `pub-3974004697476579` string appears in any site file. This may mean the file exists only in the live production deployment (outside this local working tree) and was never committed to the repository, or it may not exist yet at all.

Per governance rule ("Do not modify ads.txt... Only audit it and report its current state"), **no `ads.txt` file was created or modified.** This discrepancy is flagged as an open item for the operator to reconcile — see `audit/d1-2-change-scope.md`.

## Additional Findings From Audit

- **Third-party dependency confirmed: Google Fonts.** `css/styles.css` line 1 loads `https://fonts.googleapis.com/css2?family=Inter...&family=IBM+Plex+Mono...` via `@import`. This is a real, currently active third-party network request (browsers fetch font files from `fonts.googleapis.com`/`fonts.gstatic.com`), and is disclosed accordingly in the rewritten Privacy Policy and new Cookie Notice.
- **No accounts, no server-side calculator processing.** Confirmed no login/account system, and all converter/calculator logic (`js/converters.js`, `js/screw-identifier.js`, etc.) runs client-side in the browser — consistent with the existing About page's description of BoltLab as a static tool site.
- **First-party fetch calls only.** `js/link-engine.js`, `js/anchor-engine.js`, and `js/context-anchor-engine.js` call `fetch()` against same-origin relative paths (`/data/link-map.json`, etc.) — these are BoltLab's own internal knowledge-engine data files, not third-party calls.
- **No existing Terms or Disclaimer pages.** Neither `/terms` nor `/disclaimer` exist anywhere in the repository.
- **robots.txt** is minimal and permissive (`Allow: /`, sitemap reference) — no blockers for the new legal pages.
- **Sitemap/canonical convention for directory-index pages** (about, contact, privacy, and by extension the new cookies/terms/disclaimer pages): canonical tag omits the trailing slash (`https://boltlab.io/privacy`) while the sitemap entry includes one (`https://boltlab.io/privacy/`). This is a pre-existing site-wide convention for every directory-index page (not something introduced by this phase) and is preserved as-is for the new pages for consistency.
- **Responsible AI Policy source document was not located** in the local environment (only `Albor_Digital_Legal_Documents.pdf` was found in `~/Downloads`). Since BoltLab has no AI-assisted features (confirmed by the audit above), this is not a blocker — no AI-related disclosures were needed for D1.2's scope.

## Conclusion

BoltLab's current technical footprint is: a static, account-free, first-party JavaScript tool site with no cookies, no analytics, no advertising network activity, one real third-party dependency (Google Fonts), and one localStorage-based UI-preference feature (sticky ad-placeholder dismiss state). AdSense is confirmed **not active** by direct code inspection. This preflight is the factual basis for the privacy/cookie/terms/disclaimer rewrite that follows.
