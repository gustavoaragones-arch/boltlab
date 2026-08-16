# T8 — Tapping Workflow Decision Aid

Date: 2026-08-16
Status: **READY FOR REVIEW**

## 1. Product URL

`https://boltlab.io/tools/tapping-workflow`

## 2. User Workflow

**Step 1** — select thread system (Metric/UNC/UNF, populated from the projection, not hardcoded). **Step 2** — select thread designation (options built client-side by filtering to the chosen system, sorted alphabetically — none written into the static HTML). **Result** — thread identity, primary tap-drill value with its own verification badge, ISO 2306 alternative where applicable, relevant tap types as full classified cards, resolved standards. Plus fixed sections for hole preparation (honest, non-per-record) and thread engagement (honest limitation statement, no calculation).

## 3. Data-Source Chain

```
data/projections/tapping/tapping-profiles.json + tap-types.json  (T3, unchanged)
        ↓
scripts/generators/generate-tapping-workflow.js  (reads ONLY these two files)
        ↓
js/tapping-workflow-data.js  (generated build artifact)
tools/tapping-workflow.html  (generated page)
```

No raw entity/dataset/relationship file is read by the generator.

## 4. Record Coverage

29 tapping profiles, 7 tap types — all represented in the embedded data, mechanically confirmed against the projection with zero silent drops.

## 5. Verification-State Preservation

Tap-drill: 9 verified / 20 source-bound. Overall record status: 0 verified / 29 source-bound. The result card shows both distinctly on every result — "Tap drill: [status]" and "Overall profile status: [status]" — never collapsed into one claim.

## 6. ISO Alternative Handling

Rendered only for the 15 UNC/UNF records that actually have `alternative_drill` in the projection; absent (not merged, not defaulted) on all 14 metric records. Labeled exactly "ISO 2306 alternative drill" with the required exact explanatory sentence.

## 7. Tap-Type Classification Preservation

All four classifications (`general_taxonomy`, `manufacturing_characteristics`, `typical_applications`, `manufacturer_specific_recommendations`) rendered as separate lists per relevant tap type — the same pattern established in T4/T5/T6. The NASA-verified `general_taxonomy` fact survives into this third consumer intact.

## 8. Engagement Limitation Handling

Zero numeric engagement values anywhere in the generated HTML or embedded data — mechanically confirmed by grep for 70%/75%/77%/diameter-multiplier patterns (0 found) and by checking every embedded profile's `engagement.radial.target_percent` is `null` and `engagement.axial.calculation_status` is `"not_calculable"`. The exact required limitation sentence is present.

## 9. Standards Handling

Displayed only when present on the selected record's own `standards` array (validated fact-for-fact against the projection); no new standards relationship was created.

## 10. Provenance

Every tap-drill's `provenance` object is carried unmodified into the embedded data and validated field-by-field against the source projection, not just checked for presence.

## 11. Validator Results

| Validator | Status | Errors |
|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 |
| `validate-tapping-domain.js` | pass | 0 (5 informational, unchanged) |
| `validate-projections.js` (generic) | pass | 0 |
| `validate-tapping-projections.js` | pass | 0 |
| `validate-tapping-atlas.js` | pass | 0 |
| `validate-tap-type-guide.js` | pass | 0 |
| `validate-tapping-workflow.js` (new, 12 checks) | pass | 0 |

## 12. Site-Wide QA

0 broken internal links, 0 orphaned pages (linked from 4 places: Atlas, Guide, Tools hub, Tap Drill Calculator), 0 duplicate titles, 0 duplicate meta descriptions (one false-positive on a hub-card teaser sentence was checked directly against actual `<meta>` tags and confirmed not a real duplicate), 0 JSON-LD parse errors (4 blocks: WebPage, BreadcrumbList, Organization, WebSite — no FAQPage, correctly, since no genuine FAQ content was added), 0 `.html` hrefs, sitemap entries correct for all three tapping URLs.

## 13. Determinism

3 runs: identical SHA-256 for both generated files (`9f2f1022...` HTML, `d0907160...` data.js).

## 14. Regression Checksums

| File | Result |
|---|---|
| `tapping-profiles.json` | Byte-identical (`f9739e1d...`) |
| `tap-types.json` | Byte-identical (`63867da5...`) |
| `downloads/tapping-atlas.csv` | Byte-identical (`3a391f37...`) |
| `reference/tapping-atlas.html` | Changed — one approved discovery link added |
| `reference/tap-type-guide.html` | Changed — one approved discovery link added |

## 15. Exact Files Created (10)

`scripts/generators/generate-tapping-workflow.js`, `scripts/validators/validate-tapping-workflow.js`, `tools/tapping-workflow.html`, `js/tapping-workflow-data.js`, `docs/architecture/t8-tapping-workflow.md`, `docs/architecture/tapping-workflow-validation-report.json`/`.md`, `audit/t8-tapping-workflow.md`/`.json`, `audit/t8-change-scope.md`.

## 16. Exact Files Modified (13)

`scripts/generators/generate-tapping-atlas.js`, `scripts/generators/generate-tap-type-guide.js`, `reference/tapping-atlas.html`, `reference/tap-type-guide.html`, `tools/index.html`, `tools/tap-drill-calculator.html`, `sitemap.xml`, plus 6 regenerated validator-report files.

## 17. Unexpected Files

None.

## 18. Deferred Findings

- A reverse link from `reference/thread-atlas.html` was considered but not added — that file is generator-produced by a pipeline outside the tapping domain, same reasoning documented in T7.
- A multi-designation compare mode was considered but is a UX expansion, not a data gap — deferred as out of scope for this phase.

## 19. Confirmation: No New Engineering Values Introduced

Confirmed. Every value shown is copied unmodified from the T3 projection.

## 20. Confirmation: Nothing Committed or Pushed

Confirmed. See `audit/t8-change-scope.md` for the complete file accounting.
