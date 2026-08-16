# Tapping Evidence & Provenance (T10)

Date: 2026-08-16

## Product objective

`/reference/tapping-evidence` answers one question: *why* does BoltLab classify a given tapping value or tap-type fact as verified or source-bound? Every prior tapping product (Atlas, Guide, Workflow) already *shows* verification badges; none of them fully surfaces the underlying provenance chain — source dataset/record/field, cross-verification evidence, and per-fact source citations — as its primary focus. T10 fills that gap without becoming a bibliography, a research article, or a second Atlas.

## Data source and a genuinely reused architecture

```
data/projections/tapping/tapping-profiles.json + tap-types.json   (T3, unchanged)
        ↓
scripts/generators/generate-tapping-workflow.js  (T8, unchanged logic)
        ↓
js/tapping-workflow-data.js   (already carries every provenance field T10 needs)
        ↓
scripts/generators/generate-tapping-evidence.js  (new; validates the projections exist and
                                                    are well-formed, computes display counts,
                                                    emits the page)
        ↓
reference/tapping-evidence.html   (client-side script reuses the SAME embedded data file)
```

`js/tapping-workflow-data.js` was inspected before writing any new code and found to already carry everything T10 needs per profile — `tap_drill.provenance` (source_dataset/source_record/source_field/source/cross_check) and per-fact `source`/`source_tier` on every tap-type note. Rather than generate a second, nearly-identical data artifact, `reference/tapping-evidence.html` loads the exact same `<script src="/js/tapping-workflow-data.js">` T8 already produces. This is the literal reading of the brief's own instruction ("If an existing generated data-artifact convention is appropriate, follow it rather than creating a parallel architecture") — not just a similar pattern, but the same file, the same data, generated once.

`generate-tapping-evidence.js` itself reads the two projection files directly only to (a) confirm they're well-formed before generating anything, and (b) compute the dynamic data-quality counts baked into the page's static HTML shell — it does not duplicate the profiles/tap-types arrays anywhere.

## A disclosure carried forward from T9

Given T9 found a real, previously-shipped syntax error that silently broke an entire inline `<script>` block, this new generator's inline script was checked with the same rigor before being trusted: `node --check` on the extracted script, and a full DOM-mock execution exercising every interaction path (filter by system/status, mode switch between tap-drill and tap-type evidence, select a verified metric record and confirm the Cross-verification section renders, select a source-bound UNC record and confirm the ISO alternative section renders with the exact required label, select `bottoming_tap` and confirm the NASA-STD-5020A fact renders under "General taxonomy" with a Verified badge and full citation). All scenarios passed. Four instances of the exact `\"`-inside-outer-template-literal pattern that caused the T8 bug were found in this new file during a routine grep before shipping (not because they were broken this time — verified they weren't — but to eliminate the fragile pattern entirely) and converted to the safe single-quote convention used everywhere else in the codebase.

## Provenance model

Exposed exactly as the projection carries it, field for field: `source_dataset`, `source_record`, `source_field` under "Provenance"; `source` (the cited standard/document) and `cross_check` (the comparison result) under a separately-labeled "Cross-verification" section, with an explicit note that this is *the source used to independently cross-verify*, not necessarily the same as the source of the original value. Where a field is absent, the page shows "Provenance not available in the current projection." — never a guess, never an inferred title or URL. No `source_dataset`/`source_record`/`source_field` combination in the current data includes a URL, so no external-source link is rendered anywhere; the validator specifically checks that the inline script contains no hardcoded external URL that could be mistaken for a fabricated source link.

## Verification semantics

Two-level distinction preserved exactly, using the projection's own two states: "Tap drill: Verified/Source-bound" and "Overall record status: Verified/Source-bound" as separate lines on every evidence card, read from `tap_drill.status` and `data_quality.record_status` respectively — never collapsed, never inferred from one another.

## Tap-drill evidence

Selecting a designation (optionally filtered by thread system and/or evidence status, all populated dynamically — nothing hardcoded) shows: designation, thread system, primary tap-drill value and status, full provenance, cross-verification (only if `cross_check`/`source` is present — omitted entirely for source-bound records with no cross-verification, per the "do not show empty sections" instruction), ISO 2306 alternative (only for UNC/UNF records that have one), standards (only projection-backed, resolved per record), and limitations (only the engagement note, since that's the one universally-unavailable field).

## Cross-verification

For the 9 metric records independently cross-checked against ISO 2306, the existing `cross_check` note (e.g., "Matches Table 1 exactly...") and `source` (`"iso_2306"`) are shown verbatim — nothing recreated, no table number invented. The remaining 20 source-bound records simply have no Cross-verification section, since neither field is populated on them.

## ISO 2306 alternative

A dedicated section, present only when `alternative_drill` exists on the record (verified via the DOM test against a UNC record). Labeled exactly "ISO 2306 alternative drill," explicitly noted as separate from and not a replacement for the primary value. Absent entirely on metric records — confirmed structurally by the shared validator's fidelity check inherited from T9's pattern.

## Tap-type evidence

All four classifications rendered as separate groups — never flattened — each fact showing its text, verification badge, "evidence kind" (the human-readable classification label), and source. The NASA-STD-5020A bottoming-tap fact renders under "General taxonomy" with a Verified badge and its full section citation, unchanged from the projection — confirmed by the DOM test, not just asserted.

## Standards

Resolved per record directly from the projection's own `standards` array; no standard is shown merely because it's generally tapping-related.

## Engagement limitation

A single fixed section using the exact required sentence. No numeric value anywhere in the generated output — checked by the validator's forbidden-pattern grep across both the HTML and the shared embedded data file.

## Accessibility

Native `<select>`/`<label>` pairs for every filter, `aria-live="polite"` on both evidence-card containers so screen readers announce content changes on selection, logical heading hierarchy (h1 → h2 section headings → h3 card titles), verification conveyed in text alongside the existing `.data-status` color treatment (never color alone), and the same `.chart-table-wrapper`-free simple card layout that's already proven mobile-usable elsewhere on the site (no new responsive-table complexity needed since this page uses definition-list-style card sections, not wide tables).

## Validation

`scripts/validators/validate-tapping-evidence.js` runs the required 22-point check set: full profile/tap-type coverage with no silent drops, fact-level fidelity for tap-drill value/status/provenance/cross-verification/ISO-alternative, all four tap-type classifications preserved with no `general_taxonomy` loss, provenance-fabrication guard, engagement unavailability, displayed-counts-equal-projection-counts, JSON-LD validity, canonical correctness, no `.html` hrefs, a real JavaScript syntax check, and an overclaiming-language guard (`guaranteed`/`certified`/`industry-standard`/`official`/`authoritative`).

## Determinism

`generate-tapping-evidence.js` run 3 times: identical SHA-256 for `reference/tapping-evidence.html` across all runs.

## Regression checksums

`data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`, and `downloads/tapping-atlas.csv` are byte-identical to their pre-T10 baselines. `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, and `tools/tapping-workflow.html` changed only for one approved discovery link each (added via their own generators, never hand-edited); `js/tapping-workflow-data.js` is byte-identical (T10 needed no new embedded fields). T9's comparison functionality was re-verified working end-to-end after T8's page was regenerated.

## Files changed

See `audit/t10-change-scope.md`.

## Deferred opportunities

- No dedicated "why is metric M8×1.0 not in the verified 9" negative-case explainer was added beyond the general evidence summary — the per-record card already answers this implicitly (its cross-verification section is simply absent), and an explicit negative-case UI felt like it would overstate the product's scope beyond "trace evidence for a selected record."
- Standards' `verification_state` field (e.g., "current") is available in the projection but not surfaced on this page's standards list — considered low-value for this specific product's purpose (evidence for tapping *values*, not standards-currency tracking, which is arguably `data-methodology`'s job) and left out to avoid scope creep.
