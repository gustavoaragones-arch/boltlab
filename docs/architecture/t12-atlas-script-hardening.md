# T12 — Atlas Inline-Script Syntax-Validity Hardening

## Background

Every tapping product that embeds client-side interactivity does it the same architectural way: `generate-*.js` builds the entire HTML page — including a `<script>...</script>` block containing plain browser JavaScript — as one large outer JS template literal (a backtick string) in the generator's own Node.js source. The embedded script is just text from the outer template literal's point of view; Node has no idea it's JavaScript, and nothing checks that the text it emits is syntactically valid JavaScript once written to disk.

This is exactly what went wrong in T8: `tools/tapping-workflow.html` shipped — was committed and pushed — with an inline script broken by an escaping mistake in the generator's outer template literal. The generator's own source was perfectly valid Node.js; the *text it wrote* was not valid browser JavaScript. Nothing failed at build time. The page still rendered as valid HTML. The bug was invisible until T9 inspected git history directly and found it by hand.

T9's fix was narrow and correct: add a check to `validate-tapping-workflow.js` that extracts the inline script and parses it with `new Function(...)`, which throws a `SyntaxError` on malformed code without ever executing it. T10 independently rediscovered the same risk while building `reference/tapping-evidence.html` and added the identical check to `validate-tapping-evidence.js`.

## The gap T12 closes

`reference/tapping-atlas.html` has exactly the same architecture — its generator (`generate-tapping-atlas.js`) embeds a client-side IIFE (the search/filter logic) inside the same outer-template-literal pattern — and it never received this protection. `generate-tapping-atlas.js` is also the single most-frequently-touched tapping generator: it was modified again in T6, T7, T8, T9, T10, and T11, each time without the syntax check being back-ported. This T12 discovery was made by directly diffing the check lists of all four product validators against which products actually carry an inline script, rather than by finding a live bug — there is no live bug today (confirmed: the current script parses cleanly). The gap is the missing regression protection itself.

## What was added

One check, `"Inline Script Is Valid JavaScript (node --check)"`, appended to `scripts/validators/validate-tapping-atlas.js` as check #13. It:

1. Extracts every bare `<script>...</script>` block (no attributes) from the generated HTML via `/<script>([\s\S]*?)<\/script>/g`. This pattern structurally cannot match a `<script type="application/ld+json">` block or an external `<script src="...">` tag, since both always carry an attribute on the opening tag — so JSON-LD and external scripts are excluded by construction, not by a fragile exclusion list.
2. Requires exactly one match. Zero matches or more than one both fail loudly rather than silently passing or guessing which block is the real application script.
3. As defensive redundancy, also rejects an extracted body that looks like a JSON payload (starts with `{`) even though that branch is currently unreachable given the extraction pattern — a guard against a future change to that invariant going unnoticed.
4. Parses the extracted body with `new Function(scriptBody)`. This is the identical mechanism the sibling validators already use: it's a parse-only operation (the function is created but never called), so nothing in the extracted script actually executes — no DOM access, no `document`/`window` reference errors, just syntax validation.

No new dependency was introduced. No headless browser, jsdom, Puppeteer, or Playwright was required or added — the phase brief explicitly ruled these out, and the existing `new Function(...)` pattern already fully satisfies "parse without executing."

## Proof the check catches the actual failure class

A validator that merely exists is not evidence; a validator proven against the specific failure mode it claims to catch is. The historical T8 bug shape was reproduced directly: a template-region edit to `normalize()`'s regex-replace chain that removes one closing quote, which is syntactically valid as a change to the generator's own Node.js source (the outer template literal still parses fine) but breaks the *emitted* client-side script. Regenerating Atlas and running the new check produced a clean failure — `"Inline script has a JavaScript syntax error: missing ) after argument list"` — then reverting and regenerating produced a clean pass with the output confirmed byte-identical to the pre-mutation baseline. See `audit/t12-atlas-script-hardening.md` for the full test matrix.

## Scope discipline

This was a validator-only phase. `generate-tapping-atlas.js` needed no permanent change — Atlas's current script is already valid — so only the validator was extended. `reference/tapping-atlas.html`, the T3 projections, the CSV, and every other tapping product file are confirmed byte-identical before and after. All 9 tapping validators and the site-wide QA battery (JSON-LD, links, titles, descriptions, canonical, sitemap, FAQ identity) remain at 0 errors.
