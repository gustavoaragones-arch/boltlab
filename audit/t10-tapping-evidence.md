# T10 — Tapping Evidence & Provenance Explorer

Date: 2026-08-16
Status: **READY FOR REVIEW**

## 1. Product URL

`https://boltlab.io/reference/tapping-evidence`

## 2. Evidence Capabilities

Two inspection modes — "Tap-drill evidence" and "Tap-type evidence" — selectable via an "Evidence type" filter, plus "Thread system" and "Evidence status" filters that narrow the designation list. Selecting a record shows a structured card; selecting a tap type shows its four classified fact groups.

## 3. Profile Coverage

All 29 tapping profiles individually selectable; none silently dropped (mechanically confirmed against the projection).

## 4. Tap-Type Coverage

All 7 tap types individually selectable; none silently dropped.

## 5. Verification-State Preservation

Every evidence card shows "Tap drill: Verified/Source-bound" and "Overall record status: Verified/Source-bound" as two distinct lines. Displayed summary counts (9/20 tap-drill, 0/29 overall, 1/15 tap-type facts) are computed dynamically from the projection at generation time and mechanically checked to match it exactly — never hardcoded.

## 6. Provenance Preservation

`source_dataset`/`source_record`/`source_field` shown exactly as the projection carries them. Where absent: "Provenance not available in the current projection." — never a guess. No field renamed in a way that changes its meaning.

## 7. Cross-Verification Handling

Shown only when the projection actually has `cross_check`/`source` data (the 9 metric records cross-checked against ISO 2306); omitted entirely for the other 20. Explicitly labeled as distinct from the source of the original value, per the brief's own distinction.

## 8. ISO Alternative Handling

Dedicated section, present only on UNC/UNF records that have `alternative_drill` in the projection, absent on all metric records — verified via a runtime DOM test selecting an actual UNC record and confirming the section renders with the exact "ISO 2306 alternative drill" label.

## 9. Tap-Type Classification Preservation

All four classifications rendered as separate groups, never flattened. The NASA-STD-5020A bottoming-tap fact is visible under "General taxonomy" with a Verified badge and its full citation — confirmed by actually selecting `bottoming_tap` in a DOM-mock test and inspecting the rendered output, not just checking that the text exists somewhere in the file.

## 10. Standards Handling

Resolved per record directly from the projection's own `standards` array; nothing shown merely because it's generally tapping-related.

## 11. Engagement Handling

One fixed section, exact required sentence, zero numeric values anywhere — checked by the validator's forbidden-pattern grep across the HTML and the shared embedded data file.

## 12. Accessibility

Native `<select>`/`<label>` controls, `aria-live="polite"` on both evidence-card containers, logical heading hierarchy, verification conveyed in text alongside color (never color alone).

## 13. Validator Results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` | pass | 0 |
| `validate-tapping-atlas.js` | pass | 0 |
| `validate-tap-type-guide.js` | pass | 0 |
| `validate-tapping-workflow.js` | pass | 0 |
| `validate-tapping-evidence.js` (new, 13 checks) | pass | 0 |

## 14. Site-Wide QA

0 broken internal links, 0 orphaned pages (linked from 4 places), 0 duplicate titles, 0 duplicate meta descriptions, 0 JSON-LD parse errors (across 4 pages), 0 `.html` hrefs, sitemap correct (each tapping URL appears exactly once).

## 15. Determinism

3 runs: identical SHA-256 (`e03b6d00...`) for `reference/tapping-evidence.html`.

## 16. Regression Checksums

| File | Result |
|---|---|
| `tapping-profiles.json` | Byte-identical |
| `tap-types.json` | Byte-identical |
| `downloads/tapping-atlas.csv` | Byte-identical |
| `js/tapping-workflow-data.js` | Byte-identical (T10 needed no new embedded fields — the file already carried everything) |
| `reference/tapping-atlas.html` | Changed — one approved discovery link |
| `reference/tap-type-guide.html` | Changed — one approved discovery link |
| `tools/tapping-workflow.html` | Changed — one approved discovery link |

T9's comparison functionality was re-verified working end-to-end (DOM-mock execution) after T8's page was regenerated for the new link.

## A disclosure carried forward from T9's lesson

Before trusting this new generator's inline script, I grepped for the exact `\"`-inside-outer-template-literal pattern that caused T8's real, previously-shipped syntax bug (found and fixed in T9). Four instances turned up in this new file. Verified via `node --check` that none of them were actually broken this time — the double-backslash form I'd used happened to resolve correctly — but converted all four to the same safe single-quote convention used everywhere else in the codebase anyway, rather than rely on correct-but-fragile escaping. The full script was then executed end-to-end via a DOM mock (filter changes, mode switching, selecting both a cross-verified metric record and a UNC record with an ISO alternative, selecting `bottoming_tap` and confirming the NASA fact renders correctly) — genuinely run, not just syntax-checked.

## 17. Exact Files Created (9)

`scripts/generators/generate-tapping-evidence.js`, `scripts/validators/validate-tapping-evidence.js`, `reference/tapping-evidence.html`, `docs/architecture/t10-tapping-evidence.md`, its validation-report pair, `audit/t10-tapping-evidence.md`/`.json`, `audit/t10-change-scope.md`.

## 18. Exact Files Modified (14)

3 generators (one discovery link each), `reference/index.html` (new hub card), 3 regenerated pages, `sitemap.xml`, plus 6 regenerated validator-report files.

## 19. Unexpected Files

None.

## 20. Deferred Findings

- No explicit negative-case explainer for why a specific metric fine-pitch size isn't among the 9 cross-verified — implicitly answered by the absent Cross-verification section on its card.
- Standards' `verification_state` field is available in the projection but not surfaced here — treated as `data-methodology`'s concern, not this page's.

## 21. Git Status

14 modified, 9 new (T10), 3 pre-existing untouched (D2.0).

## 22. Confirmation: Nothing Committed or Pushed

Confirmed. See `audit/t10-change-scope.md` for the complete file accounting.
