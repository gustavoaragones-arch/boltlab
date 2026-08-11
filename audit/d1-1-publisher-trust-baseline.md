# D1.1.1 — Publisher Trust & Editorial Identity Baseline Audit

Date: 2026-08-10
Scope: `/`, `/about`, `/contact`, `/reference/`, `/guides/`, `/tools/`, `/privacy`

## Current State

- **Publisher identity**: `about/index.html` and `contact/index.html` both name the operator explicitly — "Albor Digital LLC, an independent digital product studio registered in the United States" — with a mailing contact (`contact@albor.digital`) and jurisdiction ("Canada & USA"). Every page footer repeats "© BoltLab — A product of Albor Digital LLC" and every page carries an `Organization` JSON-LD block (`name`, `url`, `email`, `sameAs`) plus a `WebSite` JSON-LD block naming the publisher. This is consistent across all 219 HTML files sampled (English and Spanish).
- **About page**: Explains who operates BoltLab and the studio's general philosophy ("fast, reliable tools"), but does not explain BoltLab's structure as a set of product families (Tools, Reference Library, Standards Library, Engineering Data Products), nor point to any methodology/data-sourcing explanation, because no such page exists yet.
- **Contact discoverability**: `/contact` exists, is linked from the primary footer (`footer-nav-right`) on every page, and duplicates the same contact details as About. Discoverable site-wide.
- **Footer trust navigation**: Every page footer has two nav blocks — `footer-nav-center` ("Product": Tools, Charts, Sizes, Guides) and `footer-nav-right` ("Company": About, Contact, Privacy). The footer does **not** currently link to `/reference/` or `/reference/standards/`, and (by definition, since it doesn't exist yet) not to a data methodology page.
- **Reference hub** (`/reference/index.html`): Well organized into "Core reference," "Thread engineering," and "Visual identification" card groups, linking to the Thread Engineering Reference cluster, the Standards hub, and the Thread Atlas. No entry currently exists for data/publisher methodology.
- **Standards pages** (`/reference/standards/*`): Six standards-family pages exist and are real: ISO, ASME, DIN, ANSI, JIS, British Standards (`iso.html`, `asme.html`, `din.html`, `ansi.html`, `jis.html`, `british-standards.html`). These are the only standards families represented in the repository — no others should be referenced.
- **Credential/affiliation language**: No page reviewed claims professional engineering licensure, certification, official standards-body status, laboratory accreditation, or institutional affiliation. Standards pages present ISO/ASME/DIN/ANSI/JIS/British Standards as reference context, not as publications BoltLab issues. No corrective wording is required for existing pages, but the new methodology page must preserve this boundary explicitly.
- **Data quality framing**: Some generated pages (e.g. `reference/thread-engineering/index.html`) already reference "verified-data placeholders" informally in meta descriptions, but there is no single canonical page explaining how BoltLab classifies verified vs. derived vs. reference vs. approximate data. This is the gap D1.1.2 fills.

## Strengths

- Publisher identity (Albor Digital LLC) is already stated accurately and consistently sitewide, in visible text and in JSON-LD, on About, Contact, Privacy, and every content page footer.
- Contact information is real, consistent, and easy to find (footer link on every page, dedicated `/contact` page).
- No fabricated credentials, certifications, or standards-body affiliations were found anywhere in the sampled pages — the baseline is clean, so D1.1 only needs to *add* transparency, not correct misleading claims.
- Standards family pages already exist for exactly the six families named in the phase brief, so the methodology page can link to real pages without inventing new standards coverage.
- Site-wide footer markup is byte-identical across 188 English pages (and identically structured, translated, across 31 Spanish pages), which makes a consistent, low-risk mechanical footer update possible.

## Weaknesses

- No page explains BoltLab's data methodology, sourcing, or classification system — this is the primary trust gap ahead of AdSense submission.
- Footer does not surface `/reference/`, `/reference/standards/`, or any methodology page, so a first-time visitor cannot navigate from any page directly to standards/methodology context without going through the header "Reference" link and then hunting.
- About page does not describe the four product families (Tools, Reference Library, Standards Library, Engineering Data Products) or how they relate, so a first-time visitor cannot form a clear mental model of what BoltLab is beyond "engineering utility website."
- About page has no link to a data methodology explanation (none exists yet).
- Reference hub has no entry point for methodology/publisher-trust content alongside its existing reference/standards/atlas entries.

## Exact Files Requiring Modification

- `about/index.html` — strengthen positioning (product families, methodology link), per D1.1.3.
- `reference/index.html` — add a labeled entry for Engineering Data Methodology, per D1.1.5.
- `sitemap.xml` — add `https://boltlab.io/reference/data-methodology`, per D1.1.7.
- All 188 non-Spanish HTML pages sharing the identical `footer-nav-center` block — add Reference, Standards, and Data Methodology links, per D1.1.4. (Full list generated programmatically; see `audit/d1-1-change-scope.md` for the final enumeration after the change is applied.)

## Exact Files Intentionally Left Unchanged

- `contact/index.html` — contact information is already accurate, discoverable, and consistent; no methodology-related change is in scope for this file per the phase brief (Contact is only linked *from* the new page, not edited itself).
- `privacy/index.html` — explicitly out of scope per governance rule 7 (no Privacy Policy changes this phase).
- `index.html` (homepage) — publisher identity is already present via footer copyright line and Organization/WebSite JSON-LD; only its footer nav block is touched, as part of the site-wide footer update, not as a standalone content change.
- `js/ads-layout.js` — explicitly out of scope per governance rule 8.
- All AEO/schema engine files, knowledge/projection data files (`data/`), and generator scripts (`scripts/generators/*.js`) — explicitly out of scope per governance rules 5, 9, and 10 (existing architecture and datasets are frozen).
- The 31 Spanish (`es/`) pages' footers — left unchanged because the new Data Methodology page is English-only; linking an `es/` footer to an English-only page would be inconsistent with the site's existing hreflang/localization conventions, and no Spanish methodology page is in scope for D1.1.
- `reference/standards/*.html` (the six standards family pages) and `reference/thread-engineering/*.html` — content and data already accurate for their scope; the methodology page links to them rather than editing them, per governance rule 5 (no changes to knowledge/projection architecture).
