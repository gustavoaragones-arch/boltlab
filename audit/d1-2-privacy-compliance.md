# D1.2 — Privacy & Consent Compliance Audit

Date: 2026-08-11

## Checklist

| # | Check | Result |
|---|---|---|
| 1 | Privacy page exists | PASS |
| 2 | Cookie notice exists | PASS |
| 3 | Terms exists | PASS |
| 4 | Disclaimer exists | PASS |
| 5 | Contact exists | PASS |
| 6 | Privacy linked from footer | PASS |
| 7 | Cookie Notice linked from footer | PASS |
| 8 | Terms linked from footer | PASS |
| 9 | Disclaimer linked from footer | PASS |
| 10 | Contact linked from footer | PASS |
| 11 | Google disclosure present | PASS |
| 12 | Advertising disclosure present | PASS |
| 13 | Cookie disclosure present | PASS |
| 14 | Personalized advertising disclosure present | PASS |
| 15 | Non-personalized advertising disclosure present | PASS |
| 16 | EEA consent disclosure present | PASS |
| 17 | UK consent disclosure present | PASS |
| 18 | Switzerland consent disclosure present | PASS |
| 19 | No false claim that AdSense is currently active | PASS |
| 20 | No unsupported analytics claim | PASS |
| 21 | No fabricated CMP | PASS |
| 22 | No fabricated publisher credentials | PASS |
| 23 | Canonical valid | PASS |
| 24 | Sitemap valid | PASS |
| 25 | Extensionless URLs | PASS |
| 26 | No broken internal links | PASS |
| 27 | JSON-LD parses | PASS |
| 28 | No duplicate title | PASS |
| 29 | No duplicate meta description | PASS |

All 29 checks pass.

## How Current-State Accuracy Was Verified

Every "does not currently..." statement in the new Privacy Policy and Cookie Notice is backed directly by the `audit/d1-2-preflight.md` technical audit, not by assumption:

- **"BoltLab does not currently display advertising served by Google"** — verified: no `adsbygoogle`, `pagead2.googlesyndication.com`, `ca-pub-` string, or ad-network `<script>` tag exists anywhere in the repository.
- **"BoltLab does not currently have a website analytics service installed"** — verified: no `gtag(`, `googletagmanager.com`, `google-analytics.com`, or any other analytics vendor reference exists anywhere.
- **"BoltLab does not currently have a consent management platform (CMP) installed"** — verified: no CMP vendor script or markup exists anywhere.
- **"BoltLab currently uses browser local storage... to remember whether you dismissed or collapsed an on-page advertisement placeholder"** — verified: `js/ads-layout.js` reads/writes `localStorage` keys `boltLabStickyAdDismissed` and `boltLabStickyAdState` for exactly this purpose, and nothing else.
- **"BoltLab currently loads fonts from Google Fonts"** — verified: `css/styles.css` line 1 imports from `fonts.googleapis.com`.

No claim in either document describes a system, vendor, or configuration that repository inspection did not confirm.

## Advertising & Consent Language

The required conditional sentence appears verbatim in both the Privacy Policy ("Advertising and Google Services") and the Cookie Notice ("Advertising"):

> "When BoltLab displays advertising served by Google or other advertising partners, those providers may use cookies, web beacons, IP addresses, or similar identifiers to deliver, measure, limit frequency, or personalize advertising, subject to applicable settings and consent requirements."

Both documents draw a clear line between BoltLab's current state (no active advertising, no CMP) and the future/activated state (conditional language only), consistent with governance rules 10–13.

## Google Disclosure

Both the Privacy Policy and Cookie Notice link to `https://policies.google.com/technologies/partner-sites` with the exact required visible text: **"How Google uses data when you use our partners' sites or apps."**

## EEA / UK / Switzerland Consent

Both documents explicitly name the European Economic Area, United Kingdom, and Switzerland, and state that BoltLab will use "the applicable Google-supported consent mechanism required for that advertising configuration" once Google advertising is enabled for those regions — without naming or fabricating a specific CMP product.

## ads.txt

**Not created or modified**, per governance. Direct repository inspection found no `ads.txt` file anywhere in this working tree — this contradicts the phase brief's assumption that one already exists with a specific publisher ID. This is reported as an open issue in `audit/d1-2-preflight.md` and `audit/d1-2-change-scope.md` for the operator to reconcile (the live production file, if any, was not accessible from this local working tree).

## Legal Content Safety

No legal guarantees, regulatory certifications, GDPR-compliance certifications, Google/AdSense approval claims, CMP certification claims, fabricated addresses, phone numbers, or corporate registration numbers were introduced. The only jurisdictional fact used beyond what was already public on BoltLab (Canada & USA) is "State of Wyoming," which is sourced directly from the verified Albor Digital LLC Legal Documents package (Terms of Service, Section 2 and Section 14), not invented.

## Result

**READY FOR REVIEW.** See `audit/d1-2-change-scope.md` for the full file-by-file change ledger and the two open issues (ads.txt discrepancy; CMP not yet implemented, correctly deferred).
