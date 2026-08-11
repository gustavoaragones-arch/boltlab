# D1.2.1 — Publisher Identity Reconciliation Decision

## Question Being Answered

Is `google.com, pub-3974004697476579, DIRECT, f08c47fec0942fa0` the authoritative, verified publisher entry for BoltLab, such that it should be written to a root-level `ads.txt`?

## Evidence Considered

1. **Repository (current working tree):** No `ads.txt` file exists anywhere. Confirmed by an unrestricted repository-wide filename search.
2. **Repository (full git history):** `ads.txt` has never existed as a tracked file at any commit, ever. It was never introduced, and therefore cannot have been "removed."
3. **Repository (string search):** The exact publisher ID and pixel/relationship ID strings appear only inside two audit markdown files from the D1.2 phase (`d1-2-preflight.md`, `d1-2-change-scope.md`), both of which explicitly state the entry could **not** be confirmed anywhere and log it as an open reconciliation issue for this phase.
4. **Production (`https://boltlab.io/ads.txt`):** Returns HTTP 200 with `content-type: text/html`, but the body is the site homepage — Cloudflare Pages' fallback response for a path with no matching static asset. No publisher ID is present in this response.
5. **Production (`https://www.boltlab.io/ads.txt`):** The `www` hostname does not resolve at all; it is not a configured production surface.
6. **No independent corroborating source** (e.g., an AdSense account dashboard screenshot, a prior verified production deployment log, or explicit operator confirmation) was available to this phase to establish that `pub-3974004697476579` is BoltLab's real Google-issued Publisher ID.

## Decision

**Do not create `ads.txt`.**

The only "source" for this publisher ID is a claim embedded in a prior phase brief. That claim was already flagged as unconfirmed by the D1.2 audit, and this phase's independent, broader investigation (repository, full git history, and live production) found **zero corroborating evidence** anywhere. Per this phase's explicit governance — "Do not invent a publisher ID. Do not create an ads.txt entry merely because one was expected historically." — writing this value into `ads.txt` now would mean publishing an unverified identity claim, which is exactly what governance prohibits.

This is not a judgment that the ID is wrong. It may well be BoltLab's correct AdSense Publisher ID. It simply has never been verified by any artifact this audit has access to. That verification must come from the operator (e.g., directly from the Google AdSense account under Sites → boltlab.io, or from Publisher ID settings), not be inferred or assumed by the codebase.

## What Would Unblock This

Any one of the following would allow `ads.txt` to be created in a follow-up phase with the exact required line:

- Operator confirms, from their own Google AdSense account, that `pub-3974004697476579` is the Publisher ID associated with `boltlab.io`.
- Operator supplies a screenshot or export from AdSense's "Sites" → "ads.txt" tab showing the exact expected line for this property.
- Operator points to an independent, verifiable historical source (e.g., a prior production deployment, screenshot, or DNS/CDN log) confirming this ID was live for `boltlab.io` at some point.

Once one of these is supplied, the required reconciliation rule can be executed exactly as specified: create root-level `ads.txt` containing precisely `google.com, pub-3974004697476579, DIRECT, f08c47fec0942fa0`, with no comments, no additional lines, and no other changes.

## Status

**BLOCKED — PUBLISHER ID REQUIRES CONFIRMATION.** No file was created. The repository and production both remain in their pre-audit state (no `ads.txt`).
