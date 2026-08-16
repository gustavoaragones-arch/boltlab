# Tapping Atlas Completeness (T6)

Date: 2026-08-15

## The gap, in one sentence

T3's tap-type projection correction (commit `5989de0`) restored `general_taxonomy` to `data/projections/tapping/tap-types.json`; T5's Tap Type Guide consumed it correctly from the moment it was written; T4's Atlas generator was written *before* that correction existed and was never updated to read the new field — so the same fact that both the projection and T5 already had was invisible on the Atlas page.

## Why T3 was already correct

T3's fix (`buildTapTypeProjection()` in `generate-tapping-projections.js`) operates at the knowledge→projection boundary and is the single point where all four `application_notes` classifications get mapped into projection fields. Once that mapping was corrected, every *future* consumer of `tap-types.json` — including T5, written after the fix — received the complete data automatically. T4 was the one exception, because its `renderTapTypeSection()` function had its own three-call list (`noteGroup(row.manufacturing_characteristics, ...)`, etc.) hard-coded before the fourth field existed, and nothing forced it to be revisited when the projection grew a new field.

## The fix

One line added to `scripts/generators/generate-tapping-atlas.js`'s `renderTapTypeSection()`:

```diff
- <p class="muted">${escapeHtml(row.definition)}</p>${noteGroup(row.manufacturing_characteristics, "Manufacturing characteristic")}...
+ <p class="muted">${escapeHtml(row.definition)}</p>${noteGroup(row.general_taxonomy, "General taxonomy")}${noteGroup(row.manufacturing_characteristics, "Manufacturing characteristic")}...
```

`general_taxonomy` renders **first**, under its own "General taxonomy" heading — not merged into or after "Manufacturer-specific recommendation," so the NASA-verified fact cannot be visually mistaken for a vendor claim.

## CSV: no change, and why

`downloads/tapping-atlas.csv` is a per-tapping-profile table (29 rows; grain = one thread designation per row). Its `tap_types` column lists which tap-type *IDs* apply to a profile (e.g. `bottoming_tap; plug_tap; ...`) — it does not, and structurally cannot without a grain change, carry tap-type-level application facts like chamfer length or the NASA finding. Forcing `general_taxonomy` text into that column would either duplicate the same fact across many rows (every coarse metric/UNC/UNF row references `bottoming_tap`) or require restructuring the CSV to a different grain entirely — both out of scope for a downstream consumption repair. The CSV was regenerated (same generator run) and its checksum is confirmed unchanged.

## Validator hardening

`validate-tapping-atlas.js` gained two checks specifically shaped to prevent this exact recurrence:

- **"Tap-Type Evidence Completeness"**: for every tap type and every one of the four classifications, if the projection has facts in that classification, the check confirms the classification's heading exists in that tap type's Atlas card, and that every individual fact's exact text appears exactly once (not zero, not duplicated) with its status label immediately adjacent. This is a fact-by-fact check against the projection, not a substring search for the word "general_taxonomy."
- **"NASA-STD-5020A Verified Bottoming-Tap Fact Present"**: a targeted check for this specific fact and its Verified label, so a future refactor that accidentally breaks just this one fact (without breaking the general completeness check) still fails loudly.

## What did not change

Tap-drill verification counts (9 verified / 20 source-bound), overall record status (0 verified / 29 source-bound), the ISO 2306 alternative model, search/filter behavior, the data-quality panel's per-thread numbers, canonical URL, title, meta description, and sitemap entry are all untouched — this was a downstream rendering repair, not a data or product redesign.
