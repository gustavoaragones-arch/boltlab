# T2 — Tapping Data Acquisition & Verification

Date: 2026-08-15
Status: **PASS WITH GAPS**

## 1. Standards Verified (independently, not trusting the phase brief)

All four claims the phase brief supplied were independently checked via WebSearch/WebFetch before being acted on, per the explicit instruction to verify rather than trust the prompt:

| Claim | Result |
|---|---|
| ISO 2306:1972 is current, covers drills prior to tapping | **Confirmed** — current, reviewed 2022 |
| ISO 2857:1973 is current, covers ground-tap manufacturing tolerances | **Confirmed** — current, reviewed 2022, 2 amendments |
| ISO 965-1:2013 withdrawn / ISO 965-1:2026 current | **Confirmed** — 2026 (5th edition) released 2026-04-14 |
| ASME B1.1:2024 is current | **Confirmed** — and its scope explicitly includes UNJ (since the 2019 edition), which BoltLab's pre-existing record's title omitted |

Full source-by-source detail, tiers, and access notes in `audit/t2-tapping-source-register.md`.

## 2. Standards Added / Updated

- **Added** `iso_2306`, `iso_2857` (`data/standards/iso/standards.seed.json`) and `asme_b94_9` (`data/standards/asme/standards.seed.json`) — all real, current, publicly-scoped standards not previously present in the knowledge layer, using only non-copyrighted title/scope metadata.
- **Updated** `iso_965_1` (added `edition`/`standard_status`, noted the 2013 withdrawal in `public_summary`) and `asme_b1_1` (title corrected to include UNJ; scope expanded to UN/UNR/UNJ; added `edition`/`standard_status`) — both corrections are evidenced by the Section 1 findings, not assumed. No unrelated field on either record was touched.
- `standard.schema.json` gained two new **optional** fields (`edition`, `standard_status`) to carry this going forward — additive, backward-compatible; the other 6 pre-existing standard records remain valid without them.

## 3. Source Register

7 sources logged with organization, document number, edition, URL, tier, claims supported, and verification result — see `audit/t2-tapping-source-register.json`/`.md`. 4 sources are Tier 1 (ISO/ASME direct), 2 are Tier 2 (reseller/distributor catalogue pages used only where iso.org's own pages returned HTTP 403), 1 is Tier 3 (secondary machining references for a general formula, explicitly not elevated to verified).

## 4. Value Counts

- **Verified**: 0 newly-verified tapping_profile records (unchanged from T1's 0 — this phase did not attempt a per-size cross-check against a primary table).
- **Source-bound**: 20 (unchanged from T1 — every existing record's `hole_preparation.value` remains sourced by direct reference to BoltLab's own pre-existing verified thread datasets).
- **Pending verification**: 0.
- **Unavailable**: 0 records at the top level; `thread_engagement`/`tapping_parameters` field-blocks remain unavailable on all 20 records, unchanged.

No existing dataset record was altered. No new tapping_profile record was added.

## 5. Tap-Type Findings

T1's 7 `tap_type` definitions were checked against ASME B94.9's own named style list (straight fluted, spiral fluted, spiral point with/without straight flutes, thread-forming). `spiral_flute_tap`, `spiral_point_tap`, and `forming_tap` match directly and are now related to `asme_b94_9`. `taper_tap`, `plug_tap`, `bottoming_tap`, and `hand_tap` (chamfer-length/manual-operation classifications) were **not** related to this standard — the source material reviewed did not explicitly name these styles, and no relationship was assumed without evidence. No entity definition text changed; the check confirmed T1's descriptions rather than requiring correction.

## 6. Thread-Engagement Findings

The general engagement formula (`% = (Dmajor − Ddrill) / (1.29904 × pitch) × 100`, commonly attributed to Machinery's Handbook) was confirmed across multiple independent secondary sources and recorded as a `derived_candidate` on `unc_tapping`/`unf_tapping`. **No `target_engagement_percent` value was written into any record.** The commonly-cited "75% for standard UNC/UNF charts" figure appears only as unconfirmed descriptive text inside the derived_candidate — its attribution to ASME B94.9 specifically was not independently confirmed against that standard's own table, so it was not asserted as verified or written into structured data.

## 7. Hole-Preparation Findings

Resolved T1's first flagged caution. Added an optional `taxonomy_axis` field (`entity.schema.json`) and tagged the 5 existing `hole_preparation` entities: `pilot_hole` → `preparation_stage`; `through_hole`/`blind_hole` → `hole_geometry`; `tapped_hole`/`clearance_hole` → `hole_function`. This makes explicit — without altering any entity definition, relationship, or dataset record — that these are not one flat mutually-exclusive taxonomy but points along orthogonal axes, addressing the exact risk T1's caution named.

## 8. Source Conflicts

**0 found.** No two independently-checked sources disagreed on any claim in this phase. The "is 75% engagement specifically the ASME B94.9 basis" question was treated as an unconfirmed attribution (not written into structured data as fact), not a conflict requiring resolution between competing sources.

## 9. Provenance Coverage

100% of new/changed claims (5 standards changes, 3 derived_candidates) carry a traceable source in `audit/t2-tapping-source-register.json`. No anonymous or unattributed value was introduced.

## 10. Relationship Predicate Evaluation

`RELATES_TO` sufficiency was re-evaluated against T2's actual acquired data. All 3 new standard↔entity connections use the pre-existing `related_entities` array mechanism already present on every standard record (the same mechanism `iso_965_1`/`asme_b1_1` used before T2) — **0 new relationship records were needed**, so `relationships.seed.json` was not touched in this phase. Whether the existing 41 `RELATES_TO` edges eventually need finer semantics remains an open question for a future phase with different data.

## 11. Validator Results

| Validator | Status | Errors | Warnings |
|---|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 | 0 |
| `validate-tapping-domain.js` | pass | 0 | 5 (informational, unchanged in kind from T1) |

Counts after T2: 24 entities (unchanged), **9 standards (was 6)**, 6 datasets (unchanged), 41 relationships (unchanged).

## 12. Files Created

5 audit files (this document, source register ×2, change-scope doc). See `audit/t2-tapping-change-scope.md` for the complete accounting.

## 13. Files Modified

14 files, all under `data/` or `docs/architecture/` — see `audit/t2-tapping-change-scope.md` for the full list and reasons.

## 14. Production Files Modified

**0.** Confirmed via `git status --short | grep -E '\.(html|css|xml|txt)$'` → empty.

## 15. Unexpected Files

**None** beyond the pre-existing untracked D2.0 audit files and local machine artifacts (`.DS_Store`, `images/logo.ai`, `.claude/`), all of which predate this phase and were not touched.

## 16. What Remains Open (honest gap accounting)

- No standard's own published data table was obtained or cross-checked against any BoltLab numeric value — every acquisition in this phase is at the standard-existence/scope/status level, not the table-value level.
- Tap-drill values for the target seed set (M3–M20, UNC/UNF sizes) were not independently re-verified against a Tier 1 source; the 20 existing records remain exactly as verified as they were after T1 (sourced by reference to BoltLab's own pre-existing data, not by this phase's new standards).
- `taper_tap`, `plug_tap`, `bottoming_tap`, `hand_tap` were not connected to a specific standard in this phase.
- The `RELATES_TO` predicate-sufficiency question is deferred again, as T2's own data didn't force a resolution.

## Final Status

**PASS WITH GAPS.** Everything acquired in this phase is independently verified and honestly scoped; nothing was fabricated, guessed, or silently upgraded to "verified." The gaps above are named, not hidden, and are candidates for a future dedicated acquisition phase. Nothing was committed or pushed — see `audit/t2-tapping-change-scope.md`.
