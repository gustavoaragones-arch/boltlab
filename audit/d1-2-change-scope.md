# D1.2.9 — Change Control / Change Scope Report

Date: 2026-08-11

Total files created: 7 (including this report)
Total files modified: 190

## Files Created (EXPECTED)

| File | Classification | Reason |
|---|---|---|
| `cookies/index.html` | EXPECTED | New Cookie Notice page, 11 required sections. |
| `terms/index.html` | EXPECTED | New Terms of Service page, required by footer + compliance audit checks #3. |
| `disclaimer/index.html` | EXPECTED | New Disclaimer page, required by footer + compliance audit check #4. |
| `audit/d1-2-preflight.md` | EXPECTED | Technical preflight audit, required before any modification. |
| `audit/d1-2-privacy-compliance.json` | EXPECTED | D1.2 compliance audit (29 checks), machine-readable. |
| `audit/d1-2-privacy-compliance.md` | EXPECTED | D1.2 compliance audit (29 checks), human-readable. |
| `audit/d1-2-change-scope.md` | EXPECTED | This report. |

## Files Modified — Full Rewrite (EXPECTED)

| File | Classification | Reason |
|---|---|---|
| `privacy/index.html` | EXPECTED | Rewritten with all 17 required sections (Who Operates BoltLab through Contact), replacing the outdated 'no cookies, no backend processing' language with an accurate, current-state description plus conditional future-advertising language. Footer also updated. |

## Files Modified — Non-HTML (EXPECTED)

| File | Classification | Reason |
|---|---|---|
| `sitemap.xml` | EXPECTED | Added `/cookies/`, `/terms/`, `/disclaimer/` entries and refreshed `/privacy/`'s lastmod date; no other entries altered. |

## Files Modified — Footer Navigation Only (188 files, EXPECTED)

All files below received the identical, mechanical D1.2 footer change: `footer-nav-right` reordered from (About, Contact, Privacy) to (About, Privacy, Cookie Notice, Terms, Disclaimer, Contact) — three new links added, Contact moved to the end to match the exact order specified in the phase brief. `footer-nav-center` (Tools/Charts/Reference/Standards/Data Methodology/Sizes/Guides) was not touched in this phase. No other content in these files was changed. Verified programmatically — every diff in this group shows the identical 4-added/1-removed line shape.

<details><summary>Expand full list (188 files)</summary>

- `about/index.html`
- `charts/bolt-grade-chart.html`
- `charts/index.html`
- `charts/metric-thread-chart.html`
- `charts/metric-vs-imperial-chart.html`
- `charts/screw-size-chart.html`
- `charts/tap-drill-chart.html`
- `charts/unc-thread-chart.html`
- `charts/unf-thread-chart.html`
- `charts/universal-screw-bolt-size-chart.html`
- `contact/index.html`
- `guides/bolt-head-markings.html`
- `guides/bolt-strength-grades.html`
- `guides/bolt-vs-screw-difference.html`
- `guides/fastener-materials-guide.html`
- `guides/how-to-measure-thread-pitch.html`
- `guides/index.html`
- `guides/metric-thread-tolerances.html`
- `guides/metric-vs-imperial-fasteners.html`
- `guides/tap-drill-basics.html`
- `guides/thread-pitch-explained.html`
- `guides/thread-types-explained.html`
- `guides/what-is-tpi.html`
- `guides/why-stainless-bolts-gall.html`
- `index.html`
- `reference/6g-vs-6h.html`
- `reference/6h-vs-6g.html`
- `reference/allowance-vs-tolerance.html`
- `reference/data-methodology.html`
- `reference/external-thread-tolerances.html`
- `reference/fundamental-deviation.html`
- `reference/index.html`
- `reference/internal-thread-tolerances.html`
- `reference/iso-261-metric-thread-series.html`
- `reference/iso-262-metric-thread-fine-series.html`
- `reference/iso-68-thread-profile.html`
- `reference/iso-724-thread-dimensions.html`
- `reference/iso-thread-tolerances-explained.html`
- `reference/metric-thread-atlas.html`
- `reference/metric-thread-tolerance-chart.html`
- `reference/pitch-diameter-explained.html`
- `reference/screw-anatomy.html`
- `reference/screw-drive-types.html`
- `reference/screw-head-shapes.html`
- `reference/screw-head-types.html`
- `reference/self-tapping-vs-self-drilling.html`
- `reference/standards/ansi.html`
- `reference/standards/asme.html`
- `reference/standards/british-standards.html`
- `reference/standards/din.html`
- `reference/standards/index.html`
- `reference/standards/iso.html`
- `reference/standards/jis.html`
- `reference/thread-atlas.html`
- `reference/thread-engineering/engineering-tables.html`
- `reference/thread-engineering/fit-classes.html`
- `reference/thread-engineering/index.html`
- `reference/thread-engineering/inspection.html`
- `reference/thread-engineering/thread-geometry.html`
- `reference/thread-engineering/thread-standards.html`
- `reference/thread-engineering/thread-tolerances.html`
- `reference/thread-fit-classes-explained.html`
- `reference/thread-tolerances.html`
- `reference/thread-types.html`
- `reference/tolerance-zones-explained.html`
- `sizes/1-4-20-bolt-size.html`
- `sizes/10-screw-size.html`
- `sizes/3-8-16-bolt-size.html`
- `sizes/5-16-18-bolt-size.html`
- `sizes/6-screw-size.html`
- `sizes/8-screw-size.html`
- `sizes/index.html`
- `sizes/m10-bolt-size.html`
- `sizes/m10-clearance-hole.html`
- `sizes/m10-tap-drill.html`
- `sizes/m10-thread-pitch.html`
- `sizes/m10-to-inch.html`
- `sizes/m10-vs-m12.html`
- `sizes/m11-bolt-size.html`
- `sizes/m11-clearance-hole.html`
- `sizes/m11-tap-drill.html`
- `sizes/m11-thread-pitch.html`
- `sizes/m11-to-inch.html`
- `sizes/m11-vs-m12.html`
- `sizes/m12-bolt-size.html`
- `sizes/m12-clearance-hole.html`
- `sizes/m12-tap-drill.html`
- `sizes/m12-thread-pitch.html`
- `sizes/m12-to-inch.html`
- `sizes/m12-vs-m14.html`
- `sizes/m13-bolt-size.html`
- `sizes/m13-clearance-hole.html`
- `sizes/m13-tap-drill.html`
- `sizes/m13-thread-pitch.html`
- `sizes/m13-to-inch.html`
- `sizes/m13-vs-m14.html`
- `sizes/m14-bolt-size.html`
- `sizes/m14-clearance-hole.html`
- `sizes/m14-tap-drill.html`
- `sizes/m14-thread-pitch.html`
- `sizes/m14-to-inch.html`
- `sizes/m14-vs-m16.html`
- `sizes/m15-bolt-size.html`
- `sizes/m15-clearance-hole.html`
- `sizes/m15-tap-drill.html`
- `sizes/m15-thread-pitch.html`
- `sizes/m15-to-inch.html`
- `sizes/m15-vs-m16.html`
- `sizes/m16-bolt-size.html`
- `sizes/m16-clearance-hole.html`
- `sizes/m16-tap-drill.html`
- `sizes/m16-thread-pitch.html`
- `sizes/m16-to-inch.html`
- `sizes/m16-vs-m18.html`
- `sizes/m17-bolt-size.html`
- `sizes/m17-clearance-hole.html`
- `sizes/m17-tap-drill.html`
- `sizes/m17-thread-pitch.html`
- `sizes/m17-to-inch.html`
- `sizes/m17-vs-m18.html`
- `sizes/m18-bolt-size.html`
- `sizes/m18-clearance-hole.html`
- `sizes/m18-tap-drill.html`
- `sizes/m18-thread-pitch.html`
- `sizes/m18-to-inch.html`
- `sizes/m18-vs-m20.html`
- `sizes/m19-bolt-size.html`
- `sizes/m19-clearance-hole.html`
- `sizes/m19-tap-drill.html`
- `sizes/m19-thread-pitch.html`
- `sizes/m19-to-inch.html`
- `sizes/m19-vs-m20.html`
- `sizes/m20-bolt-size.html`
- `sizes/m20-clearance-hole.html`
- `sizes/m20-tap-drill.html`
- `sizes/m20-thread-pitch.html`
- `sizes/m20-to-inch.html`
- `sizes/m20-vs-m18.html`
- `sizes/m3-bolt-size.html`
- `sizes/m3-clearance-hole.html`
- `sizes/m3-tap-drill.html`
- `sizes/m3-thread-pitch.html`
- `sizes/m3-to-inch.html`
- `sizes/m3-vs-m4.html`
- `sizes/m4-bolt-size.html`
- `sizes/m4-clearance-hole.html`
- `sizes/m4-tap-drill.html`
- `sizes/m4-thread-pitch.html`
- `sizes/m4-to-inch.html`
- `sizes/m4-vs-m5.html`
- `sizes/m5-bolt-size.html`
- `sizes/m5-clearance-hole.html`
- `sizes/m5-tap-drill.html`
- `sizes/m5-thread-pitch.html`
- `sizes/m5-to-inch.html`
- `sizes/m5-vs-m6.html`
- `sizes/m6-bolt-size.html`
- `sizes/m6-clearance-hole.html`
- `sizes/m6-tap-drill.html`
- `sizes/m6-thread-pitch.html`
- `sizes/m6-to-inch.html`
- `sizes/m6-vs-m8.html`
- `sizes/m7-bolt-size.html`
- `sizes/m7-clearance-hole.html`
- `sizes/m7-tap-drill.html`
- `sizes/m7-thread-pitch.html`
- `sizes/m7-to-inch.html`
- `sizes/m7-vs-m8.html`
- `sizes/m8-bolt-size.html`
- `sizes/m8-clearance-hole.html`
- `sizes/m8-tap-drill.html`
- `sizes/m8-thread-pitch.html`
- `sizes/m8-to-inch.html`
- `sizes/m8-vs-m10.html`
- `sizes/m9-bolt-size.html`
- `sizes/m9-clearance-hole.html`
- `sizes/m9-tap-drill.html`
- `sizes/m9-thread-pitch.html`
- `sizes/m9-to-inch.html`
- `sizes/m9-vs-m10.html`
- `tools/bolt-torque-calculator.html`
- `tools/drill-bit-converter.html`
- `tools/fastener-weight-calculator.html`
- `tools/metric-to-imperial-screw-converter.html`
- `tools/screw-identifier.html`
- `tools/tap-drill-calculator.html`
- `tools/thread-identifier.html`
- `tools/thread-pitch-to-tpi-converter.html`

</details>

## Files Intentionally Left Unchanged

| File / Path | Reason |
|---|---|
| `about/index.html` | Governance rule explicitly says do not rewrite `/about`; only add a legal link if a clear omission exists. Since the footer (now present on every page including About) already links Privacy/Cookie Notice/Terms/Disclaimer/Contact, no inline addition was needed. Only its footer received the standard mechanical update. |
| `contact/index.html` | Governance rule explicitly says do not rewrite `/contact`; only verify the destination works. Verified: page exists, is linked from every footer, and contact details are unchanged. Only its footer received the standard mechanical update. |
| `ads.txt` | Does not exist in this repository. Per governance ('Do not modify ads.txt... Only audit it and report its current state'), it was not created. See Open Issues below and `audit/d1-2-preflight.md`. |
| `js/ads-layout.js` and all other `js/**` files | No AdSense activation, ad units, Google ad scripts, or CMP scripts were added, per governance rules 7, 8, 12, 13. `js/ads-layout.js` was inspected (read-only) to verify its localStorage usage for the Privacy Policy/Cookie Notice, but not modified. |
| `data/**`, `scripts/generators/**` | Out of scope per standing governance (knowledge/projection architecture frozen). Not touched. |
| `es/**/*.html` (31 files) | Not updated. Consistent with the D1.1 precedent: the new legal pages are English-only, so extending untranslated footers to link to them would be inconsistent with the site's hreflang/localization conventions. |
| `docs/architecture/validation-report.{json,md}`, `docs/architecture/projection-validation-report.{json,md}` | Regenerated as a side effect of running the existing validators for this phase's validation step (timestamp-only changes plus the pre-existing 9-vs-10 projection count drift already documented in D1.1, unrelated to D1.2). Reverted via `git checkout` immediately after use. |
| `.DS_Store` and other pre-existing untracked OS artifact files | Present before this session began; not created or touched by this work. |

## Governance Exceptions / Notable Decisions

- **ads.txt discrepancy.** The phase brief asserted `ads.txt` already contains `google.com, pub-3974004697476579, DIRECT, f08c47fec0942fa0`. Direct repository inspection found no `ads.txt` file anywhere in this working tree. This is reported factually rather than assumed — no file was created. This needs operator reconciliation (the file may exist only in the live production deployment, outside this local working tree) before AdSense activation in a future phase.
- **Footer reordering.** The phase brief's footer section lists the order Privacy, Cookie Notice, Terms, Disclaimer, Contact. About was kept (not listed for removal, and D1.1 established it as required trust navigation), placed first, with the rest following the brief's exact order. This is a minimal, mechanical, fully-uniform change across all 188 footer-only files.
- **Wyoming registration detail.** The Terms of Service references 'State of Wyoming, United States' as Albor Digital LLC's registration jurisdiction. This is sourced directly from `Albor_Digital_Legal_Documents.pdf` (Terms of Service, Sections 2 and 14) supplied as the legal baseline, not invented.
- **Responsible AI Policy source not located.** Only `Albor_Digital_Legal_Documents.pdf` was found locally; `Albor_Digital_Responsible_AI_Policy.pdf` was not found. Not a blocker: BoltLab has no AI-assisted features (confirmed by the preflight audit), so no AI-related disclosure was required for this phase.

## Unresolved / Open Issues

1. **ads.txt does not exist in the repository.** See above. Not created this phase; needs operator reconciliation before AdSense activation.
2. **No CMP is installed.** Correct for the current pre-activation state per governance (do not install a CMP without a verified account/configuration), but a real CMP or Google-supported consent mechanism will need to be implemented and verified in a future phase before Google advertising is enabled for EEA/UK/Switzerland visitors, consistent with the consent language written into the Privacy Policy and Cookie Notice in this phase.

## Verdict

All modified/created files are **EXPECTED**. No unrelated files were changed, no AdSense code was added, no ad slots were added, ads.txt was not touched, and the Privacy/Cookie Notice/Terms/Disclaimer disclosures accurately reflect BoltLab's verified current technical state plus governance-compliant conditional language for future Google advertising.
