# Tapping Comparison Mode (T9)

Date: 2026-08-16

## Product objective

Add a 2–4 record side-by-side comparison as an interactive state within the existing `/tools/tapping-workflow` tool — the deferred capability named at the end of T8. No new URL, no new page, no new data source.

## Important: a real bug found and fixed in the process

While extending the same result-rendering code T9 needed to reuse for comparison rows, I found that **T8's inline script (already committed and pushed as `c13e541`) has never actually run in a browser.** One line in `renderResult()` used `\"` inside the generator's outer template literal:

```js
"...<br><span class=\"muted\">" + ...
```

Node's template-literal evaluation resolves `\"` to a literal `"` (the backslash is consumed), so the *emitted* HTML contained an unescaped `"` splitting the JS string early — a genuine syntax error in the browser-side script. Verified directly against the committed file (`git show c13e541:tools/tapping-workflow.html`), not just the working tree, so this is not something introduced by T9.

**Impact:** a syntax error in an inline `<script>` block prevents the entire block from executing — so none of T8's interactivity (system/designation selection, result rendering) has ever worked in a real browser since it shipped. This is an execution failure, not a data-correctness issue: no wrong value was ever shown to a user, because the tool simply never ran.

**Root cause of the miss:** T8's validator (`validate-tapping-workflow.js`) checked for required strings and structural markers via regex, but never actually parsed the inline script as JavaScript. Fixed both the bug (one line, switched to single-quoted JS string, matching the pattern used correctly everywhere else in the file) and the gap (added a `node -- check`-equivalent `new Function()` syntax-validity check to the validator, now check #1 in the report, so this exact class of defect fails loudly going forward).

**Beyond syntax, actually executed:** given the severity of finding a "looked right, never ran" defect, static analysis alone wasn't enough to trust the fix or the new comparison code. A minimal DOM mock (`document.createElement`/`getElementById`/event dispatch, with a `textContent`→`innerHTML`-escaping relationship matching real browser behavior) was built to actually run the extracted inline script end-to-end: select Metric → select a designation → verify the result renders → add to comparison → add a second → compare → verify the table content → clear → verify reset → verify the 4-item cap, duplicate prevention, and individual chip removal → verify a UNC record's ISO 2306 alternative renders correctly in both the single result and the comparison table. All checks passed after the fix.

## Comparison model

Selection state (`compareIds`, max 4, no duplicates) lives entirely client-side in the existing inline script — no new generator output, no new data file beyond the workflow's own `js/tapping-workflow-data.js`, which already carries every field the comparison needs (it was built in T8 to be a complete, lossless copy of each profile's relevant projection fields).

Each comparison column is rendered directly from the **same profile object** used for the single-record result — `p.tap_drill.value`, `p.tap_drill.status`, `p.data_quality.record_status`, `p.alternative_drill`, `p.standards`, `p.tap_types` — with no intermediate transformation, so a value can never silently diverge between the single-result view and the comparison view of the same record.

## Selection rules

- **"Add to comparison"** appends the currently-displayed result's ID if not already present and the array has fewer than 4 entries; otherwise it's a no-op (duplicates and overflow are both silently rejected at the state level, but the *status text* always reflects the true count so nothing is hidden from the user).
- **Individual removal**: each selected chip has its own "✕" button (explicit user action, not silent).
- **"Clear comparison"**: resets the whole selection.
- Status text cycles exactly through the four required states: "Select up to 4 thread sizes to compare." → "N of 4 selected." → "Comparison limit reached." (at 4).

## Verification semantics preserved

Every comparison column shows two separate rows — "Tap-drill verification" and "Overall record status" — reading directly from `tap_drill.status` and `data_quality.record_status` respectively, exactly as the single-result view already does. Never collapsed.

## ISO 2306 alternative handling

A dedicated "ISO 2306 alternative drill" row. For UNC/UNF columns with an alternative, shows the value, unit, and status, plus a note that it's separate and doesn't replace the primary value. For metric columns, shows "Not applicable — ISO 2306 is already the metric convention for this record" rather than a blank cell or a fabricated value — verified directly via the DOM test with a mixed UNC+Metric comparison.

## Tap-type handling

The "Relevant tap types" row lists exactly the `tap_types` array already resolved per profile by the T3 projection (the same relationship the single-result view and the Atlas both use) — no new inference, no "best tap" language.

## Engagement limitation

The comparison's "Thread engagement" row repeats the exact fixed limitation sentence for every column — never a number, never per-record.

## Accessibility

- "Add to comparison" carries `aria-describedby` pointing at the live status text.
- The status paragraph is `role="status" aria-live="polite"`, so screen readers announce count changes.
- Each chip's remove button has an explicit `aria-label` ("Remove M8x1.25 from comparison"), not just an icon.
- Verification status is conveyed in text ("Tap drill: Verified") on top of color, not color alone — the existing T4-era `.data-status` pattern, reused unchanged.
- Buttons are native `<button>` elements (keyboard-operable and focusable by default); a `:disabled` visual style was added since none existed before.
- The comparison table reuses the existing `.chart-table-wrapper` horizontal-scroll pattern already used site-wide for wide data tables.

## Validation

`validate-tapping-workflow.js` gained: a real JavaScript syntax check (`new Function()` on the extracted inline script — the check that would have caught the T8 regression), a comparison-UI structural-presence check, a comparison-logic check (confirms `MAX_COMPARE = 4`, duplicate-prevention logic, and that the comparison reads the same raw profile fields as the single-result view), and a full-coverage check (all 29 records remain individually selectable, no duplicate designation+system combination exists).

## Determinism

`generate-tapping-workflow.js` run 3 times: identical checksums for both `tools/tapping-workflow.html` and `js/tapping-workflow-data.js` across all runs.

## Regression checksums

`data/projections/tapping/tapping-profiles.json`, `data/projections/tapping/tap-types.json`, `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, and `downloads/tapping-atlas.csv` are all byte-identical to their pre-T9 baselines — T9 touched only the workflow generator, its validator, the workflow page, and one small CSS addition.

## Files changed

See `audit/t9-change-scope.md`.

## Deferred opportunities

- Comparison state does not persist across a page reload (no URL/query-string encoding of the selection) — considered, but out of scope; the brief explicitly prohibits new URLs, and a query-string-only persistence mechanism wasn't requested.
- No "highlight differences" visual mode — the raw side-by-side table already answers "how do these differ," and adding automatic difference-highlighting risked implying an engineering judgment ("this one is better") the data doesn't support.
