# D1.3.8 — User Value Audit (Product Families)

Date: 2026-08-11

## Tools (8 pages, all classified A — STRONG)

Checked each of the 8 tool pages for: what it calculates/identifies, what the result means, how to use the result, limitations, and next workflow step.

| Tool | Explains result meaning | States limitations/verification | Links to next workflow step |
|---|---|---|---|
| `bolt-torque-calculator.html` | Yes | Yes ("verify critical joints with manufacturer data," "use a calibrated torque wrench") | Yes (links to size pages) |
| `fastener-weight-calculator.html` | Yes | Yes | Yes |
| `screw-identifier.html` | Yes | Yes | Yes (links to Thread Identifier) |
| `thread-identifier.html` | Yes | Yes | Yes |
| `drill-bit-converter.html` | Yes | No explicit hedge (exact unit conversion — mathematically deterministic, arguably doesn't need one) | Yes |
| `metric-to-imperial-screw-converter.html` | Yes | No explicit hedge (exact unit conversion) | Yes |
| `tap-drill-calculator.html` | Yes | No explicit hedge | Yes |
| `thread-pitch-to-tpi-converter.html` | Yes | No explicit hedge (exact unit conversion) | Yes |

4 of 8 tools lack explicit verification/limitation language. Three of those four (drill-bit, metric-to-imperial, thread-pitch-to-TPI) are pure unit-conversion math with no engineering judgment involved — a hedge is arguably unnecessary since there is no "typical vs. exact" ambiguity to flag. `tap-drill-calculator.html` is the one borderline case: it recommends a specific drill size for tapping, which is the same category of recommendation that every `sizes/*-tap-drill.html` page already hedges ("confirm against your tap manufacturer sheet"), but the calculator tool itself does not carry that same hedge. **Logged as a P2 recommendation** (one-sentence addition, single page, very low risk) — not implemented in this phase to keep D1.3's fix set limited to the audit's highest-evidence findings; see `audit/d1-3-fix-priority.md`.

## Reference Library (22 flat `reference/*.html` pages + the Thread Engineering cluster)

Checked for: clear answer above the fold, useful explanation, structured sections, related references, relevant tools, relevant charts/data.

- All 22 reference leaf pages open with an `<h1>` + `<p class="muted">` direct statement, and 16/22 additionally have a full `.aeo-answer-block`. All have a "Related References," "Related tools," and/or "Related charts" section. This cluster is healthy — see `audit/d1-3-aeo-quality.md` for the one real defect found in this family (FAQ schema/visible-text mismatch on 16 of these pages, Pattern B, deferred).
- The Thread Engineering cluster (`reference/thread-engineering/`) is a well-formed hub-and-6-category structure; category pages are intentionally short navigation layers (see `audit/d1-3-thin-content.md`), not underdeveloped content pages.

## Standards Library (`reference/standards/`, 7 pages)

Checked for: standard identity, scope/context, related standards, relationship to BoltLab data, no false official-affiliation claims.

- `reference/standards/index.html` (hub) and `reference/standards/iso.html` fully satisfy all four checks, including an explicit non-affiliation statement consistent with D1.1: *"final release values come from approved standards documents."*
- The 5 family stub pages (ASME/DIN/JIS/ANSI/British Standards) satisfy "no false affiliation claims" (they make no claims at all) but fail "standard identity" and "scope/context" — this is the same finding already fully documented in `audit/d1-3-thin-content.md` and is not repeated in detail here. One (ASME) is fixed in D1.3.14; the other four are deferred pending new verified data.

## Engineering Data Products (Thread Atlas cluster, 2 pages)

Checked against the exact D1.1 Data Methodology promise: dataset identity, version, verification status, review date, source/provenance, coverage, row count, clear explanation, download functionality.

| Field | `reference/thread-atlas.html` (Unified Thread Atlas) | `reference/metric-thread-atlas.html` |
|---|---|---|
| Dataset identity | Yes — `Dataset` JSON-LD + visible "Unified Thread Atlas" | Yes — `Dataset` JSON-LD + visible "Metric Thread Atlas" |
| Version | Yes — "Dataset version: v0.1.0" (visible + schema) | Yes — "Dataset version: v0.1.0" (visible + schema) |
| Verification status | Yes — "Verification status: Verified" | Not shown visibly (schema has no verification field either) |
| Verification method | Not shown | Yes — "Verification method: Public engineering reference synthesis reviewed for BoltLab atlas use." |
| Last reviewed date | Yes — 2026-07-12 | Yes — 2026-07-12 |
| Coverage / row count | Yes — "Metric, UNC, UNF (20 rows)" | Not shown as a row count, but scope is stated (metric-only) |
| Generator build info | Yes — "thread-atlas-generator@v0.1.0" | Not shown |
| Download functionality | N/A (interactive explorer, not advertised as downloadable) | Yes — CSV download verified to exist and be non-empty at `/downloads/metric-thread-atlas.csv`, matches `DataDownload` schema `contentUrl` |
| Discoverable entry point | Yes | **No** — zero internal inbound links (see `audit/d1-3-discovery.md`, fixed in D1.3.14) |

Both pages substantively deliver on the Data Methodology promise; each is missing 1–2 individual metadata fields the other has (verification status vs. verification method, generator build info, row count) rather than either being systematically incomplete. This is a minor **P2 consistency observation** (harmonize which metadata fields appear on both atlas pages) — not fixed in this phase, since it requires deciding what to display rather than fixing a clear defect, and the more consequential problem (total undiscoverability of the metric-only page) is the one addressed.

## Summary

| Product family | Pages | Systemic defects found | Fixed in D1.3.14 |
|---|---|---|---|
| Tools | 8 | 1 minor (tap-drill-calculator hedge) | No — P2, deferred |
| Reference Library | 22 + 7 hub | FAQ schema/visible mismatch (Pattern B, 16 pages) | No — P1, deferred |
| Standards Library | 7 | 5 thin stub pages (1 generator-fixable) | Yes — ASME only |
| Engineering Data Products | 2 | 1 orphan page, minor metadata inconsistency | Yes — discovery link; metadata harmonization deferred (P2) |
