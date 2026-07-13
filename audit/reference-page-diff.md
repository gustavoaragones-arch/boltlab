# Reference Page Diff Audit

## Scope

- Source page: `reference/pitch-diameter-explained.html`
- Producer: `scripts/generators/generate-reference-page.js`
- Input projection: `data/projections/reference/pitch_diameter.reference.json`

## Diff Summary

- Total changed blocks: 1
- Changed area: `FAQPage` JSON-LD block in `<head>`

## Classification

- **Expected**
  - FAQ JSON-LD is now projection-derived from `projection.faq`.
  - This aligns machine-readable FAQ content with the projection contract.
- **Formatting only**
  - None.
- **Structural**
  - None. DOM section order, layout wrappers, navigation, ad containers, script includes, and footer structure remain unchanged.
- **Functional**
  - No front-end runtime behavior changes.
  - No link behavior changes.
  - No template/layout behavior changes.
  - SEO structured-data content changed by design (FAQ values now deterministic from projection input).

## Determinism Check

- Generation run 1 checksum: `1c0880543f7deffdaf9a53ee26dae8496fbc0d30`
- Generation run 2 checksum: `1c0880543f7deffdaf9a53ee26dae8496fbc0d30`
- Result: identical output for identical input.

## Conclusion

The projection consumer pipeline is functioning as intended for the first production consumer.  
Differences are limited to the expected projection-driven FAQ JSON-LD update, with no functional or structural regression.
