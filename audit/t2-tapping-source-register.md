# T2 — Tapping Data Acquisition & Verification — Source Register

Date: 2026-08-15

Full structured data in `audit/t2-tapping-source-register.json`. This is the human-readable summary.

| Source | Org | Tier | Verification Result | Used For |
|---|---|---|---|---|
| ISO 2306:1972 | ISO | 1 | Confirmed current (reviewed 2022) | New `iso_2306` standard record |
| American Machinist formula article | Trade press | 2 | Corroborated, not primary | `derived_candidate` on `metric_tapping` only |
| ISO 2857:1973 (+2 amendments) | ISO | 1 | Confirmed current (reviewed 2022) | New `iso_2857` standard record |
| en-standard.eu ISO 965-1:2026 listing | Reseller | 2 | Confirmed (2013 withdrawn, 2026 current, released 2026-04-14) | Updated existing `iso_965_1` record |
| ASME B1.1-2024 | ASME | 1 | Confirmed (title includes UNJ) | Updated existing `asme_b1_1` record |
| ASME B94.9-2008 (R2023) | ASME/ANSI | 1 | Confirmed current | New `asme_b94_9` standard record |
| Thread engagement formula (multiple secondary sources) | Various | 3 | Formula corroborated; "75% = B94.9 basis" claim NOT independently confirmed | `derived_candidate` on `unc_tapping`/`unf_tapping` only |

## Access notes

`iso.org` direct fetch consistently returned HTTP 403 (blocks scraping) for both `iso_2306` and `iso_2857` lookups. Worked around via WebSearch's aggregated index of ISO's own catalogue metadata (title, status, review year) plus corroborating third-party standards-catalogue listings (standards.iteh.ai, committee.iso.org). No copyrighted standard text was read, fetched, or reproduced anywhere in this phase — only public title/scope/status metadata, consistent with every existing BoltLab standard record's `copyright_note`.

## What was NOT verified

No standard's own published data table (ISO 2306's drill-size table, ISO 2857's tolerance table, ASME B94.9's dimension tables) was obtained or read in this phase. Every new/updated standard record reflects **existence, current status, and topical scope only** — not a table-level cross-check against any BoltLab dataset value. This distinction is stated explicitly on every `derived_candidate` entry and in `docs/architecture/tapping-data-foundation.md` Section 18, so no future phase mistakes "the standard exists and is relevant" for "our values were checked against it."
