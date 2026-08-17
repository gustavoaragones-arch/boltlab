# Tapping Product Consistency & Trust Hardening (T11)

Date: 2026-08-16

## What this phase is

T11 is a hardening pass, not a new product. By T10 the tapping domain had five consumers of the same T3 projection layer (Atlas, Tap-Type Guide, Workflow, Workflow's T9 comparison mode, Evidence), each generated independently since T4. Independent generation is architecturally correct (each product owns its own rendering), but it also means terminology can drift between consumers describing the exact same underlying fact — which is precisely what happened between T4/T8 and T10. T11's job was to find and close that drift without touching the projection layer, the knowledge layer, or adding any new product surface.

Full findings: [audit/t11-tapping-consistency.md](../../audit/t11-tapping-consistency.md) and [audit/t11-tapping-consistency.json](../../audit/t11-tapping-consistency.json).

## The known issue, and why it's genuinely two different questions

The brief that opened this phase named one specific regression: "ISO 2306 metric convention" (T4/T8 wording) vs. "Metric drill convention" (T10's corrected wording). Tracing it down turned up two distinct problems wearing the same clothes:

1. **A display-wording problem.** `driveConventionLabel()` in the Atlas generator and `conventionLabel()` in the Workflow generator unconditionally labeled every metric primary tap-drill value "ISO 2306 metric convention," regardless of whether that specific record had been independently cross-verified against the ISO 2306 primary-source table. Checking `data/projections/tapping/tapping-profiles.json` directly: only 9 of 14 metric records carry `tap_drill.provenance.cross_check` evidence; the other 5 are source-bound. T10's Evidence page already avoided this by unconditionally using "Metric drill convention" — the safer, uniformly-true label — for every metric record's *display*, regardless of per-record verification depth. T11 propagated that same safer label into Atlas and Workflow.

2. **A protected-artifact problem.** The same `driveConventionLabel()` function also fed `downloads/tapping-atlas.csv`'s `primary_drill_convention` column. The T11 regression rule explicitly forbids altering that CSV. Fixing the display wording in place would have silently changed the CSV as a side effect. The resolution: split the function into a display-only version (new wording) and a CSV-only version (`csvDriveConventionLabel`, byte-for-byte the original text), so the CSV's column intentionally still reads "ISO 2306 metric convention" — a documented, deliberate exception, not a leftover bug. The new terminology validator emits an informational warning on every run so this exception stays visible rather than silently drifting further.

## Two more drifts the terminology-matrix audit surfaced (not named in the original brief, found by the Section 3 audit)

- **"Overall profile status" vs. "Overall record status."** Same field (`data_quality.record_status`), three different renderings: Atlas and Workflow's single-record view said "profile status," while Evidence (T10) and — notably — Workflow's *own* T9 comparison table both said "record status." That's not just cross-product drift, it's an inconsistency *within a single page*. Standardized on "record status," matching both the T10 baseline and the field's own name in the data model.

- **Singular vs. plural classification headings.** Section 8 of the brief freezes the four tap-type classification labels in plural form (except "General taxonomy," which has no natural plural). Atlas, Tap-Type Guide, and Workflow all rendered "Manufacturing characteristic," "Typical application," and "Manufacturer-specific recommendation" as *singular* section headings over a list of multiple facts; Evidence (T10) already used the plural heading form the brief specifies. Evidence's separate, narrower "evidence kind: Manufacturing characteristic" *per-fact* inline annotation is grammatically singular by design (it describes the kind of *one* fact) and was correctly left alone — only the three generators' *section headings* were pluralized.

## Architecture: what actually changed

```
data/projections/tapping/tapping-profiles.json + tap-types.json   (T3, byte-identical, unchanged)
        ↓
generate-tapping-atlas.js       -- label wording + CSV/display split (changed)
generate-tap-type-guide.js      -- classification heading plurality (changed)
generate-tapping-workflow.js    -- label wording + comparison cell wording (changed)
generate-tapping-evidence.js    -- unchanged (T10's baseline; re-run and confirmed byte-identical)
        ↓
reference/tapping-atlas.html    (regenerated, changed)
reference/tap-type-guide.html   (regenerated, changed)
tools/tapping-workflow.html     (regenerated, changed)
js/tapping-workflow-data.js     (regenerated, byte-identical — the fixes live in the HTML template, not the data payload)
downloads/tapping-atlas.csv     (regenerated, byte-identical — protected artifact, deliberately excluded from the wording fix)
reference/tapping-evidence.html (regenerated, byte-identical)
```

## New validator

`scripts/validators/validate-tapping-terminology.js` is new for T11 — none of the existing per-product validators checked cross-product terminology consistency, only structural/count correctness against the projection. It implements the nine checks required by Section 19 of the brief (unsupported ISO 2306 claims, verified/source-bound swaps, missing classification labels, unsupported engagement claims, merged ISO-alternative/primary-drill concepts, fabricated provenance fallbacks, unbacked standards). It was verified to actually catch regressions — not just pass vacuously — by temporarily reintroducing the old wording and the old singular heading and confirming both trip a failure before reverting.

`scripts/validators/validate-tapping-atlas.js` (existing, T4) needed one update: two of its checks hard-coded the exact strings "Overall profile status" and the singular classification labels as their expected values. Both were updated to the newly-corrected wording.

## What was deliberately left unchanged

Two reviewed differences were judged to be legitimate product-context variation rather than terminology drift, and left as-is:

- Atlas's longer, radial/axial-specific engagement explanation vs. Workflow/Evidence/Comparison's shorter frozen sentence — both are independently accurate to the projection's `engagement.radial`/`engagement.axial` fields; conforming one to the other would either delete accurate detail or add scope beyond a terminology fix.
- Atlas's single flat "Data provenance" list (with "Cross-check" as one more line item) vs. Evidence's two-section "Provenance"/"Cross-verification" split — both keep the concepts distinctly labeled; the brief permits products to vary in how much cross-verification structure they expose.

Full reasoning for both in [audit/t11-tapping-consistency.md](../../audit/t11-tapping-consistency.md), Section 6.

## Verification

All nine tapping validators (eight existing + the new terminology validator) pass with 0 errors. Site-wide regression checks (JSON-LD parsing, duplicate titles/descriptions, broken links, orphans, canonical, sitemap, `.html` hrefs, FAQ identity) are clean across all 228 site HTML files. The three affected generators were each run three times with byte-identical output; the untouched Evidence generator was re-run and confirmed to still produce byte-identical output. `data/projections/tapping/*.json`, `downloads/tapping-atlas.csv`, and `js/tapping-workflow-data.js` are all confirmed byte-identical to their pre-T11 checksums.

## Correction: the new validator's own check #8 had a bug

Shortly after the pass above, a review of the new `validate-tapping-terminology.js` validator found that its own check #8 ("no fabricated provenance fallback") didn't do what it claimed. The condition was `!isTemplateCode && !approvedFallbacks.includes(value) && value === ""` — note the trailing `value === ""`. Only an *empty* rendered value could ever fail; a non-empty fabricated string like `"fabricated-source"` sailed through untouched. Writing a validator that name-checks a requirement without actually encoding it is worse than not writing it, since it creates false confidence.

The fix replaces pattern-matching for emptiness with genuine value resolution and comparison. Atlas and Tap-Type Guide resolve provenance statically into their HTML, so their rendered values are matched to the corresponding projection row/note and compared directly. Workflow and Evidence resolve provenance client-side from `js/tapping-workflow-data.js` at runtime — their static HTML contains JS property-access expressions, not resolved values, so pattern-matching those as "text" would either produce false positives (flagging legitimate code) or false negatives (accepting anything that looks like code). Instead, the data file those expressions will resolve against is parsed directly and compared field-by-field to the projection, which validates the actual values those products will show without needing to execute a browser. Evidence's specific fallback expressions are additionally checked to confirm the fallback literal itself hasn't been swapped for something invented.

Eight regression tests (mandatory per the correction brief) were run via controlled temporary mutation of a working copy — fabricated non-empty values in three different places (static HTML, the underlying data file, and a template's fallback literal) all correctly failed; an empty value where a real one exists correctly failed; an approved fallback used where the projection genuinely has no value correctly passed; the same slot with a non-approved fallback correctly failed; the restored, unmutated files correctly passed and were confirmed byte-identical to their pre-mutation checksums; and a benign JS comment resembling provenance text, inserted into a page that renders no resolved provenance at all, correctly did not trigger a false positive. Full detail and exact test methods in [audit/t11-tapping-consistency.md](../../audit/t11-tapping-consistency.md) Section 0.

The corrected check passed cleanly against the real, unmutated products on first run — no genuine provenance defect exists in any product or in the projection data. Only the validator itself needed fixing.
