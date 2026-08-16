# T9 — Tapping Comparison & Selection Mode

Date: 2026-08-16
Status: **READY FOR REVIEW**

## Important disclosure before anything else

While implementing T9, I found that **T8's already-committed, already-pushed inline script has never actually executed in a browser.** One line in `renderResult()` used `\"` inside the generator's outer template literal; Node resolves that to a literal `"` when writing the file, leaving an unescaped quote that breaks the emitted JavaScript at parse time. Verified directly against the committed file (`git show c13e541:tools/tapping-workflow.html`) — this is not something T9 introduced. A syntax error in an inline `<script>` block prevents the whole block from running, so none of T8's interactivity has worked in production since it shipped. No wrong data was ever shown (the tool simply never ran), but this is a real, severe regression in already-shipped, already-approved work.

**Fixed**: one line, switched to the single-quote convention already used correctly everywhere else in the file. **Verified working**: not just re-checked for syntax, but actually executed end-to-end via a hand-built DOM mock (see §10). **Gap closed**: the validator now includes a real JavaScript syntax check, which would have caught this the first time.

## 1. Comparison Capability

An interactive state added to the existing `/tools/tapping-workflow` page — no new URL, no new page, no new data source. Users can add up to 4 records to a comparison tray and view them side by side in a table.

## 2. Maximum Selection Count

**4.** Enforced in the client logic (`MAX_COMPARE = 4`) and confirmed by the runtime test: a 5th add attempt is silently rejected at the state level while the status text still accurately reads "Comparison limit reached."

## 3. Projection Coverage

All 29 records remain individually selectable through the existing Step 1/Step 2 selectors — the comparison feature adds an "Add to comparison" action next to the existing single-record result, it doesn't replace or restrict that flow. No duplicate designation+system combination exists among the 29.

## 4. Verification Preservation

Every comparison column shows two distinct rows: "Tap-drill verification" (9 verified / 20 source-bound across the dataset) and "Overall record status" (0 verified / 29 source-bound) — read directly from `tap_drill.status` and `data_quality.record_status`, exactly matching the single-result view. Never collapsed into one badge.

## 5. ISO Alternative Handling

A dedicated "ISO 2306 alternative drill" comparison row. Metric columns show "Not applicable — ISO 2306 is already the metric convention for this record"; UNC/UNF columns show the value, unit, verification status, and a non-replacement note. Verified directly via the runtime test using a mixed UNC+Metric comparison — both renderings confirmed correct in the same table.

## 6. Tap-Type Preservation

The "Relevant tap types" comparison row lists exactly the `tap_types` array the T3 projection already resolved for that profile — the same relationship shown in the single-result view and the Atlas. No inference, no "best tap for this comparison" language.

## 7. Engagement Handling

Every column's "Thread engagement" row repeats the fixed limitation sentence. Zero numeric engagement values anywhere in the generated output — checked by the validator's forbidden-pattern grep across the full HTML and embedded data.

## 8. Standards Handling

Each column's "Relevant standards" row reads directly from that record's own `standards` array; no standard is inferred from thread-system similarity.

## 9. Accessibility

- "Add to comparison" has `aria-describedby` pointing at the live status region.
- Status text is `role="status" aria-live="polite"` — screen readers announce selection-count changes.
- Each removable chip has an explicit `aria-label` (e.g., "Remove M8x1.25 from comparison"), not an icon-only control.
- Verification status is conveyed in text, not color alone (reusing the existing `.data-status` pattern).
- All controls are native `<button>` elements — keyboard-focusable and operable by default; a `:disabled` visual style was added since none existed on the site before.
- The comparison table reuses the site's existing `.chart-table-wrapper` horizontal-scroll pattern for mobile.

## 10. Validator Results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` | pass | 0 |
| `validate-tapping-atlas.js` | pass | 0 |
| `validate-tap-type-guide.js` | pass | 0 |
| `validate-tapping-workflow.js` (extended, 16 checks) | pass | 0 |

**Beyond the validator**, given the severity of what was found, I built a minimal DOM mock and actually *executed* the extracted inline script end to end: system selection → designation selection → result render → add to comparison (twice) → compare → verify table content → clear → verify reset → 4-item cap → duplicate-add rejection → individual chip removal → mixed UNC/Metric ISO-alternative rendering. All scenarios passed. This is not part of the checked-in validator (no headless-browser tooling is available in this environment), but the DOM-mock test file is retained in the scratchpad for reference.

## 11. Site-Wide QA

0 broken internal links, 0 `.html` hrefs, JSON-LD parses (4 blocks, unchanged types), canonical unchanged (`https://boltlab.io/tools/tapping-workflow`), sitemap unaffected (no new URL).

## 12. Determinism

3 runs: identical checksums for both `tools/tapping-workflow.html` (`6d32d3a5...`) and `js/tapping-workflow-data.js` (unchanged from T8, `d0907160...`, since the comparison feature needed no new embedded fields).

## 13. Regression Checksums

| File | Result |
|---|---|
| `tapping-profiles.json` | Byte-identical |
| `tap-types.json` | Byte-identical |
| `js/tapping-workflow-data.js` | Byte-identical (T9 needed no new embedded fields) |
| `reference/tapping-atlas.html` | Byte-identical |
| `reference/tap-type-guide.html` | Byte-identical |
| `downloads/tapping-atlas.csv` | Byte-identical |
| `tools/tapping-workflow.html` | Changed — comparison feature + the syntax-error fix |

## 14. Exact Files Created (4)

`docs/architecture/t9-tapping-comparison.md`, `audit/t9-tapping-comparison.md`/`.json`, `audit/t9-change-scope.md`.

## 15. Exact Files Modified (12)

`scripts/generators/generate-tapping-workflow.js`, `scripts/validators/validate-tapping-workflow.js`, `tools/tapping-workflow.html`, `css/styles.css`, plus 8 regenerated validator-report files.

## 16. Unexpected Files

None.

## 17. Deferred Findings

- Comparison selection doesn't persist across page reload (no URL/query-string encoding) — new-URL creation is explicitly prohibited by this phase, and persistence wasn't requested.
- No automatic difference-highlighting — avoided deliberately, to not imply an engineering judgment ("this one is better") the data doesn't support.

## 18. Git Status

12 modified, 4 new (T9), 3 pre-existing untouched (D2.0).

## 19. Confirmation: Nothing Committed or Pushed

Confirmed. See `audit/t9-change-scope.md` for the complete file accounting.
