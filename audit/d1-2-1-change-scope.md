# D1.2.1 — Change Scope & Governance Confirmation

## Files Created

| File | Reason |
|---|---|
| `audit/d1-2-1-ads-txt-audit.md` | Required deliverable: full narrative audit of repository, production, publisher-ID references, and git history. |
| `audit/d1-2-1-ads-txt-audit.json` | Required deliverable: machine-readable version of the same audit findings. |
| `audit/d1-2-1-publisher-reconciliation.md` | Required deliverable: explicit reconciliation decision and rationale for not creating `ads.txt`. |
| `audit/d1-2-1-change-scope.md` (this file) | Required deliverable: change-control ledger and governance confirmation. |

## Files Modified

**None.** No site content, configuration, code, or data file was modified.

## Files Deleted

**None.**

## Files Intentionally Untouched

- `ads.txt` — not created. See `audit/d1-2-1-publisher-reconciliation.md` for the full rationale (publisher ID could not be independently verified anywhere in repository, git history, or production; governance prohibits inventing or assuming an unverified ID).
- `js/ads-layout.js` and all other `js/**` files — inspected read-only during the repository search; no AdSense scripts, ad units, or CMP scripts exist and none were added.
- `privacy/index.html`, `cookies/index.html`, `terms/index.html`, `disclaimer/index.html`, `about/index.html`, `contact/index.html` — not opened for editing; this phase's governance explicitly prohibits modifying D1.2 legal/publisher-trust content, and no ads.txt-related change to these pages was warranted since no `ads.txt` was created.
- `_redirects`, `_headers` — inspected (read-only) for any ads.txt-related rule; none exists and none was added.
- `data/**`, `scripts/generators/**` — out of scope per standing project governance (knowledge/projection architecture frozen); not touched.
- `sitemap.xml` — not touched; `ads.txt` is not a sitemap-eligible resource and no page was created or changed.

## Validator-Regenerated Files (Reverted)

Running the two required validators regenerated timestamp/count fields in four pre-existing tracked reports:

- `docs/architecture/validation-report.json`
- `docs/architecture/validation-report.md`
- `docs/architecture/projection-validation-report.json`
- `docs/architecture/projection-validation-report.md`

Both validators reported **PASS with 0 errors, 0 warnings** both before and after these regenerations — the only diffs were a newer `generated_at` timestamp and, in the projection report, an updated projection count (9 → 10, reflecting projections added by unrelated prior work already committed to `main`, not by this phase). Per this phase's explicit instruction ("Do not allow unrelated validator-generated changes into the working tree. If validators modify unrelated reports, revert those unrelated changes."), all four diffs were reverted with `git checkout --` immediately after confirming pass status. The working tree contains none of these diffs.

## Governance Confirmations

- **No AdSense activation occurred.** No `adsbygoogle` script, ad slot, ad unit, or Google ad script tag was added anywhere in the repository.
- **No CMP was installed.** No consent-management vendor script, banner markup, or consent SDK was added.
- **No D1.2 legal content was changed.** `privacy/index.html`, `cookies/index.html`, `terms/index.html`, `disclaimer/index.html`, `about/index.html`, and `contact/index.html` were not opened for editing and contain no diffs.
- **No unrelated SEO, UI, architecture, data, generator, or navigation work occurred.** The only new files in the working tree are the four audit deliverables listed above, all under `audit/`.
- **No `ads.txt` file was created, modified, or deleted.** The repository's `ads.txt` state is identical before and after this phase: it does not exist.
- **No commit or push was made.** The working tree is left for review with the four new audit files staged/unstaged as untracked additions.

## Verdict

All changes in this phase are confined to net-new audit documentation. No production behavior, no site content, no legal disclosures, no advertising configuration, and no architecture were touched. The repository remains exactly as capable (or incapable) of serving a valid `ads.txt` as it was before this audit — the only change is that the discrepancy first flagged in D1.2 has now been independently re-verified, expanded with production and git-history evidence, and formally logged as a blocked, confirmation-pending item rather than an open question.
