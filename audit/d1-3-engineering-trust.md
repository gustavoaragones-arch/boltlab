# D1.3.10 — Engineering Trust Audit

Date: 2026-08-11
Method: repository-wide case-insensitive scan for authority/claim-adjacent language ("standard," "required," "recommended," "equivalent," "compatible," "rated," "safe," "maximum," "minimum," "tolerance," "strength," "torque," "clearance," "tap drill"), followed by manual review of how each hit is framed, plus a targeted scan for overclaiming/certification language.

## Overclaiming / False-Authority Scan

Searched for: "certified by," "officially approved/endorsed/licensed," "guarantee(d) accuracy/safety/compliance," "always safe," "100% accurate/safe," "meets all," "fully compliant," "approved by ISO/ASME/ANSI/DIN/JIS."

**Result: zero matches anywhere in indexable HTML.** No page claims certification, official standards-body endorsement, or guaranteed accuracy/safety. This confirms and extends the D1.1 finding (no fabricated credentials) to the full site under D1.3's broader keyword set.

## Authoritative-Sounding Claims: Source and Framing Check

Spot-checked every page type that uses engineering-authority language for whether it (a) identifies its source/context, (b) distinguishes calculated/typical values from standards-sourced values, and (c) avoids implying certification or official standards authority:

| Page/cluster | Claim type | Source identified? | Calculated vs. standard distinguished? | Overstates authority? |
|---|---|---|---|---|
| `tools/bolt-torque-calculator.html` | Torque values from size/grade/friction inputs | Yes — meta description states "clamp load from size, strength, and friction **assumptions shown in the tool**"; body says "Use outputs as **starting values**, then **validate against factory tables** for critical joints" | Yes — explicitly labeled as assumption-based, not a standard | No |
| `sizes/*-tap-drill.html`, `sizes/*-clearance-hole.html` | Single numeric tap-drill/clearance values | Partially — values are presented as "common/typical" without a named source standard inline, but each page instructs the reader to "confirm with your drawing tolerance block" / "verify against ISO 273 or your assembly drawing tolerance class" | Partially — hedged as typical/common, not asserted as the standard's mandatory value | No — consistently hedged, never stated as an absolute requirement |
| `reference/standards/iso.html` and the ISO leaf pages | Standards structure/sequencing claims (e.g., "ISO 965-1 is the primary ISO tolerance framework") | Yes — every claim is tied to a named ISO designation | Yes — page explicitly states "final release values come from approved standards documents" | No — the Standards References boundary language from D1.1's Data Methodology ("BoltLab is not the standards organization...") is consistent with this page |
| `guides/bolt-strength-grades.html`, `guides/bolt-head-markings.html` | Strength-grade interpretation | Yes — grade markings (8.8, 10.9, Grade 5/8) are named, standard nomenclature | Yes — described as "indicates," not as a certification | No |
| `reference/thread-engineering/*` category pages | General workflow guidance | N/A (no numeric claims on these pages — they are navigation hubs, see `audit/d1-3-thin-content.md`) | N/A | No |

## Data Methodology Cross-Reference

D1.1 established a four-tier data classification (verified source / derived-calculated / reference-context / approximate-non-authoritative) on `/reference/data-methodology`. This audit checked whether editorial pages actually apply that framework in practice, not just declare it in the abstract:

- Size-cluster pages (tap-drill, clearance-hole) consistently use hedge language ("typical," "common," "confirm against...") that is functionally consistent with the "approximate or non-authoritative values" tier, even though they don't explicitly cite the methodology page inline. This is acceptable — the methodology page itself states its role is to explain the *system*, not that every leaf page must hyperlink to it.
- No page was found asserting a specific numeric engineering value as an unqualified standards requirement without a hedge, source reference, or "confirm/verify" instruction.

## Numeric Value Spot-Check

Per governance rule 7 ("do not modify engineering numerical values unless an actual factual error is discovered and independently supported by existing verified project sources"), this audit **did not attempt to independently re-derive or re-verify BoltLab's own numeric tables** (tap drill sizes, clearance hole diameters, pitch values) against external standards — that is outside D1.3's scope and would require new source material this phase does not have. No factual numeric error was identified or reported by any other part of this audit (thin-content, duplication, or AEO findings are all structural/presentational, not numeric-accuracy issues). **No numeric values were changed in this phase.**

## Summary

| Check | Result |
|---|---|
| Overstated equivalence/compatibility claims | None found |
| Implied certification | None found |
| Implied official standards-body authority | None found |
| Unsourced authoritative numeric claims | None found — all numeric engineering values are consistently hedged or tied to a named standard |
| Numeric factual errors independently confirmed | None found; no numeric values modified |

**No P0 or P1 engineering-trust issues were found.** The site's existing hedging conventions (from D1.1's methodology framework) are being applied consistently in practice, not just declared on one page.
