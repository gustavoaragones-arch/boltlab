# D1.2.1 — ads.txt Reconciliation & Publisher Identity Audit

## Scope

This is an audit-and-reconciliation-only phase. Objective: determine the true current state of BoltLab's `ads.txt` / publisher-identity across the repository, git history, and production, and make only the minimum change strictly justified by evidence.

Explicitly out of scope (not touched): AdSense activation, CMP installation, D1.3/D1.6, ad layout work, revenue optimization, consent implementation, and any privacy/cookies/terms/disclaimer/about/contact content.

## Repository Findings

- `find` across the entire working tree (`-iname "ads.txt"`, no path restriction) returned **zero results**. No `ads.txt` file exists anywhere in the repository — not at root, not in `public/`, `static/`, generated output, deployment directories, scripts, data, documentation, audit reports, configuration, or `_redirects`/`_headers`.
- `_redirects` and `_headers` contain no `ads`-related rules of any kind.
- No `wrangler.toml` or other deployment config file exists in the repository.
- Only **one** location type contains the string `ads.txt` or the expected publisher ID at all: BoltLab's own prior audit documentation from Phase D1.2, specifically:
  - `audit/d1-2-preflight.md`
  - `audit/d1-2-change-scope.md`
  - `audit/d1-2-privacy-compliance.md`
  - `audit/d1-2-privacy-compliance.json`
- In every one of those files, the string appears **only** as prose reporting that no `ads.txt` file was found and that the phase brief's assumption of an existing entry could not be confirmed. None of these are configuration files, none are served to users or crawlers, and none activate anything.
- No `adsbygoogle`, `AdSense` script tag, `ca-pub-` string, or any Google ad script reference exists anywhere in the repository (confirmed via repository-wide search; consistent with the D1.2 privacy audit's prior finding).
- Only one `ads.txt` file exists in total: **none**. There is no possibility of duplicate/conflicting `ads.txt` files because zero exist.

## Production Findings

- `GET https://boltlab.io/ads.txt` → **HTTP 200**, `content-type: text/html; charset=utf-8`, served by Cloudflare (`server: cloudflare`, `cf-cache-status: MISS`).
- The response body is **not an `ads.txt` file**. It is the site's homepage HTML (`<title>Universal Screw & Bolt Converter | BoltLab</title>` and full homepage markup/content).
- This indicates Cloudflare Pages is serving the SPA/static-not-found fallback (`index.html`) for the `/ads.txt` path because no static `ads.txt` asset exists in the deployed build — consistent with the repository finding.
- The response contains **no publisher ID of any kind** (no `pub-`, no `google.com,`, no ad-network line). From a crawler's perspective this is functionally equivalent to "no valid ads.txt," despite the misleading `200` status.
- `https://www.boltlab.io/ads.txt` — the `www` hostname **does not resolve** (DNS resolution failure, curl exit code 6 "Could not resolve host"). The `www` subdomain is not configured for this property; it is not a valid production surface to check.
- No redirect chain was observed; `boltlab.io/ads.txt` resolves directly to a 200 (fallback HTML), not a redirect.

## Publisher-ID References

| Occurrence | File | Classification |
|---|---|---|
| `pub-3974004697476579` / `f08c47fec0942fa0` / `google.com, pub-` | `audit/d1-2-preflight.md` | Audit evidence (discussion of an unconfirmed assumption from the D1.2 phase brief) |
| `pub-3974004697476579` / `f08c47fec0942fa0` | `audit/d1-2-change-scope.md` | Audit evidence (same, logged as open issue) |
| "AdSense" / "ads.txt" (no ID) | `audit/d1-2-privacy-compliance.md`, `audit/d1-2-privacy-compliance.json` | Audit evidence / documentation (confirms no AdSense script or pub ID found; open issue log) |

No occurrence anywhere in the repository is: active production configuration, inactive/future configuration, or a stale reference to a once-real value. All occurrences are audit evidence produced by the prior D1.2 phase while documenting that the expected entry could **not** be verified. No file contains an active `adsbygoogle` tag, a `ca-pub-` string, or any live AdSense reference.

## Git History

- `git log --all --full-history -- ads.txt` returns **zero commits**. `ads.txt` has never existed as a tracked file at any point in this repository's history — it was never introduced and therefore never removed.
- `git log --all -S"3974004697476579"`, `-S"f08c47fec0942fa0"`, and `-S"google.com, pub-"` each return exactly **one** commit: `b169de4` ("D1.2: Privacy & Consent Compliance"). This is the commit that *introduced the audit documentation discussing the discrepancy* (`audit/d1-2-preflight.md`, `audit/d1-2-change-scope.md`) — it did not add an `ads.txt` file or any active configuration containing these strings.
- Commit `441e052` ("Phase A1–A3: Thread Engineering Reference System") — inspected via `git show --stat`. Contains no reference to `ads.txt` or any publisher ID; unrelated (thread engineering reference pages, SVG head diagrams).
- Commit `1ff1493` ("D1.1: Publisher Trust & Editorial Identity") — inspected via `git show --stat`. Contains no reference to `ads.txt` or any publisher ID; unrelated (footer/publisher-trust navigation changes).
- Commit `b169de4` ("D1.2: Privacy & Consent Compliance") — the only commit touching these strings, and only within audit markdown/JSON reporting the discrepancy, not as a live artifact.

**Conclusion: `ads.txt` has never existed in this repository at any commit.** The expected publisher entry has never been verified as present anywhere in git history, the current working tree, or the live production endpoint. It exists only as a claim in a prior phase brief, which the repository's own D1.2 audit had already flagged as unconfirmed.

## Reconciliation Classification

**F. NOT_FOUND** — No credible publisher entry exists anywhere (repository, git history, or production). The expected entry was asserted by a phase brief but has never been independently substantiated by any artifact — not a file, not a commit, not a live response.

## Evidence

1. `find /Users/gus/Documents/APPS/boltlab -iname "ads.txt"` → no results (repository-wide, unrestricted).
2. `git log --all --full-history --oneline -- ads.txt` → empty (file never tracked).
3. `git log --all -S"3974004697476579" --oneline` → `b169de4` only (audit-doc introduction, not a live file).
4. `curl -D - https://boltlab.io/ads.txt` → `HTTP/2 200`, `content-type: text/html`, body = homepage HTML, no publisher ID present.
5. `curl https://www.boltlab.io/ads.txt` → DNS resolution failure; hostname not configured.
6. Repository-wide grep for `pub-[0-9]{10,}`, `f08c47fec0942fa0`, `adsbygoogle`, `AdSense` → matches confined to 4 audit files from D1.2, all discussing the unconfirmed discrepancy, none active configuration.

## Decision

Per governance ("Do not invent a publisher ID. Do not create an ads.txt entry merely because one was expected historically."), **no `ads.txt` file was created.** The evidence does not establish that `pub-3974004697476579` is BoltLab's verified, authoritative AdSense Publisher ID — it has never appeared in a live production response, a committed file, or any verifiable source; it exists solely as an assumption repeated across two audit phases without independent confirmation (e.g., a screenshot of the AdSense account dashboard, a prior verified deployment, or an operator-supplied confirmation).

Creating `ads.txt` with an unverified publisher ID would risk publishing an incorrect or fabricated identity claim to Google and to any future ad-serving verification process. This phase therefore stops short of writing the file and reports the blocker for operator confirmation.

## Changes Made

**None.** No file was created, modified, or deleted in site content, configuration, or code as a result of this audit. Only new audit-report files were added under `audit/` (see `audit/d1-2-1-change-scope.md` for the full ledger). Validator-regenerated timestamp/count-only diffs in `docs/architecture/validation-report.{md,json}` and `docs/architecture/projection-validation-report.{md,json}` were reverted with `git checkout --` to keep the working tree scoped to this phase only.

## Validation

- `node scripts/validators/validate-knowledge-engine.js` → **PASS**, 0 errors, 0 warnings (report regenerated with a newer timestamp only; reverted per governance to avoid unrelated changes).
- `node scripts/validators/validate-projections.js` → **PASS**, 0 errors, 0 warnings (report regenerated with a newer timestamp and updated projection count only; reverted per governance to avoid unrelated changes).
- `ads.txt` syntax validation: not applicable — no file exists to validate.
- Publisher-ID consistency validation: no publisher ID exists in the repository or production to compare against; no conflict detected because no candidate values exist anywhere.
- `git diff` inspection: confirmed no unintended changes remain in the working tree after reverting validator-timestamp diffs.
- Duplicate `ads.txt` detection: 0 files found; no duplicates possible.

## Production Deployment Status

Not applicable — no repository change was made, so no deployment is required or claimed. The live endpoint `https://boltlab.io/ads.txt` continues to serve the homepage HTML fallback (HTTP 200, no publisher ID) exactly as observed prior to this audit.

## Governance Notes

- AdSense was **not** activated. No ad script, ad unit, or `adsbygoogle` reference was added anywhere.
- No CMP was installed.
- No privacy, cookies, terms, disclaimer, about, or contact content was modified.
- No unrelated SEO, UI, architecture, data, generator, or navigation change was made.
- The only files touched by this phase are the four audit deliverables listed in `audit/d1-2-1-change-scope.md`.
