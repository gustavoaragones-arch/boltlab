# Fastener Load & Strength — Phase 3: Property-Class Source Reconciliation & Public-Implementation Readiness

Date: 2026-09-13
Type: **RECONCILIATION PHASE** — not the public calculator implementation. Not committed, not pushed, not deployed.
Baseline: `befd4ee6a720ff9bd443b3d903e2289c363c5afe` (Phase 1 + Phase 2 close).

---

## 1. Executive Summary

Phase 2 flagged a real, evidenced numerical discrepancy between `guides/bolt-strength-grades.html`'s pre-existing, unsourced ISO property-class figures and the newly-sourced, cross-verified `fastener_property_classes` dataset. This phase traced every claim in the guide against the dataset, classified each discrepancy against the Phase 2 evidence hierarchy, and reconciled the guide's four verified ISO metric-class figures (8.8 × 2 diameter ranges, 10.9, 12.9) to state the dataset's actual cross-verified minimums, while disclosing 8.8's diameter-range split for the first time. The guide's SAE section, its qualitative FAQ claims, and its torque-related content required no change (no numeric conflict exists in those areas). `js/torque-data.js` and `tools/bolt-torque-calculator.html` remain byte-for-byte untouched. No dataset, schema, entity, or protected-surface file was modified. One narrowly-scoped supporting update was made to the Phase 2 validator itself (splitting one now-obsolete "guide unchanged" assertion into two precise, forward-looking checks), documented in full below.

**Phase 3 recommendation: PASS** — reconciliation is complete, source-consistent, and the specific readiness gates this phase was scoped to evaluate are satisfied. Several gates remain explicitly deferred to the public-implementation phase itself (Section 11), consistent with Phase 1's own scope boundary, and are not blockers to *this* phase's own completion.

---

## 2. Baseline

```
git rev-parse HEAD        -> befd4ee6a720ff9bd443b3d903e2289c363c5afe
git rev-parse origin/main -> befd4ee6a720ff9bd443b3d903e2289c363c5afe
```

HEAD equaled origin/main before any work began. No tracked production modifications existed at baseline (the only untracked item — `audit/fastener-recovery-extraction/`, from an unrelated, separately-authorized research audit — was left untouched throughout this phase).

---

## 3. Existing Guide Claims

Read in full from `guides/bolt-strength-grades.html` as it stood at baseline:

| Location | Claim |
|---|---|
| Explanatory sentence (Metric property classes section) | "The two-number class (e.g. 8.8, 10.9) indicates tensile strength and yield ratio. First number × 100 ≈ minimum tensile strength in MPa; the second number relates to yield strength ratio." |
| Table row | 8.8 → 800 MPa ("Tensile (min. approx.)"), no diameter range shown |
| Table row | 10.9 → 1000 MPa, no diameter range shown |
| Table row | 12.9 → 1200 MPa, no diameter range shown |
| FAQ + matching head `<script type="application/ld+json">` (FAQPage) | "12.9 is the highest common metric property class (alloy, ~1200 MPa tensile)." |
| FAQ | "Grade 8 has higher tensile and yield strength than Grade 5" (qualitative, no numbers) |
| FAQ | "Higher-strength bolts can be tightened to higher torque for the same size... Use our Bolt Torque Calculator" (qualitative, defers to the separate torque tool) |
| SAE table | Grade 2 / 5 / 8 rows give only head-marking descriptions ("None or minimal," "3 radial lines," "6 radial lines") and a "Use" category — **no numeric tensile/proof/yield value stated anywhere for any SAE grade** |
| Title tag | "Bolt Strength Grades (Metric 8.8, SAE 5 & 8)" — does not mention 10.9/12.9 despite the table including them |
| Meta description | "...Compare tables in this guide, then check torque and." — truncated mid-sentence |

The guide contains **no explicit source citation** for any of its numeric figures anywhere in its markup or visible text.

---

## 4. Phase 2 Dataset Claims

Read in full from `data/datasets/fastener_property_classes.seed.json` (16 records) as it stood at baseline:

| Record | Designation | Diameter range | Proof (MPa) | Tensile min. (MPa) | Yield (MPa) | Confidence |
|---|---|---|---|---|---|---|
| `iso_4_6` | 4.6 | M5–M39 | 225 | 400 | unavailable | verified |
| `iso_8_8_le16` | 8.8 | M5–M16 | 580 | 800 | 640 | verified |
| `iso_8_8_gt16` | 8.8 | M18–M39 | 600 | 830 | 660 | verified |
| `iso_10_9` | 10.9 | M5–M39 | 830 | 1040 | 940 | verified |
| `iso_12_9` | 12.9 | M1.6–M39 | 970 | 1220 | 1100 | verified |
| `iso_4_8`, `iso_5_6`, `iso_5_8`, `iso_6_8` | various | not confirmed | various | various | unavailable | source_bound (single-source, not cross-verified) |
| `iso_9_8_le16` | 9.8 | d ≤ 16mm only | 650 | 900 | 720 | source_bound, incomplete |
| `sae_grade_1`, `sae_grade_2_le34`, `sae_grade_2_gt34`, `sae_grade_5_le1`, `sae_grade_5_gt1`, `sae_grade_8` | SAE 1/2/5/8 | various | 33,000–120,000 psi | 60,000–150,000 psi | mostly verified, one field pending_verification | verified (proof/tensile) |

Every ISO record's `proof_strength`/`tensile_strength`/`yield_strength` field carries a `provenance` object naming two independently-operated cross-checked sources (Fastenal Engineering Data Sheet and Nordic Fastening Group) for the four `verified` records, per Phase 2's own documented sourcing work. Re-confirmed unchanged by re-reading the file in this phase (not assumed from memory).

---

## 5. Claim-by-Claim Reconciliation

| # | Guide claim | Dataset value | Discrepancy | Classification |
|---|---|---|---|---|
| 1 | "First number × 100 ≈ minimum tensile strength" (general rule) | N/A — describes the ISO *designation* convention, not a measured value | The rule conflates the *nominal* value used to construct the class name with the *actual specified minimum*, which is measurably higher for 10.9 (+40 MPa) and 12.9 (+20 MPa), and diameter-dependent for 8.8. | **RESOLVED — dataset clearly controls.** Root cause of items 2–5 below; reworded to state the designation basis accurately and flag that actual minimums (shown in the table) can run higher and vary by diameter. |
| 2 | 8.8 → 800 MPa, no diameter range | 800 MPa for M5–M16; 830 MPa for M18–M39 | Guide's single value is exactly correct for the smaller range but silently omits the larger range's higher, distinct minimum. | **RESOLVED — dataset clearly controls.** Guide now shows both diameter-specific rows. |
| 3 | 10.9 → 1000 MPa | 1040 MPa (M5–M39, uniform) | Guide understates the actual specified minimum by 40 MPa (~4%). | **RESOLVED — dataset clearly controls.** |
| 4 | 12.9 → 1200 MPa (table) | 1220 MPa (M1.6–M39, uniform) | Guide understates by 20 MPa (~1.6%). | **RESOLVED — dataset clearly controls.** |
| 5 | 12.9 → "~1200 MPa tensile" (FAQ + JSON-LD) | 1220 MPa | Same discrepancy as #4, restated; the "~" hedge does not resolve a page that would otherwise show two different numbers (1200 in the FAQ, 1220 in the corrected table) for the same class. | **RESOLVED — dataset clearly controls**, updated for internal page consistency, not because the original hedge was independently unsafe. |
| 6 | SAE Grade 2/5/8 rows — head-marking descriptions only, no numeric values | Dataset has numeric proof/tensile/yield values for all three grades | No numeric claim exists in the guide to conflict with. | **NOT MATERIAL.** No change made — adding numeric SAE values would expand the guide's scope beyond the authorized reconciliation task (Section 6, out of scope per this phase's explicit boundary). |
| 7 | "Grade 8 has higher tensile and yield strength than Grade 5" (qualitative) | Grade 8 (150,000/130,000 psi) exceeds both Grade 5 ranges (120,000/92,000 and 105,000/81,000 psi) in every case | The qualitative claim is confirmed true by the dataset. | **NOT MATERIAL — different presentation of the same engineering fact.** No change needed. |
| 8 | "Higher-strength bolts can be tightened to higher torque... use our Bolt Torque Calculator" | N/A — torque data lives in the separate, unsourced `js/torque-data.js` system (Phase 2 Treatment A) | No property-class numeric claim; correctly defers to a separate tool/dataset. | **NOT MATERIAL.** No change; explicitly protected from this phase's scope (Section 7 below). |
| 9 | Title tag omits 10.9/12.9; meta description is truncated | N/A | Pre-existing copy-quality defects, unrelated to the property-class numeric conflict this phase was scoped to resolve. | **NOT MATERIAL to this phase's mandate.** Not fixed — see Section 12 (Unresolved Issues); fixing either would be scope expansion/style improvement, explicitly excluded by Section 6 of the brief. |
| 10 | 4.6, 4.8, 5.6, 5.8, 6.8, 9.8 — not mentioned anywhere in the guide | Present in the dataset (4.6 verified; the rest source_bound/incomplete) | No guide claim exists for these classes, so no conflict. | **NOT MATERIAL.** No change; the guide was never scoped to cover every ISO class, and adding new classes would be scope expansion. |

**No discrepancy required a "REQUIRES SOURCE REVIEW" or "UNSAFE TO PUBLISH" classification.** Every numeric discrepancy found had a clear, already-completed Phase 2 evidence trail (two independently cross-verified sources) that unambiguously determined the correct value; none involved a genuine unresolved conflict between sources needing further review before the guide could be safely corrected.

---

## 6. Source Authority Analysis

Per the Phase 2 evidence hierarchy (Section 2/7 of the Phase 2 report), reused without modification here:

- **Neither ISO 898-1 nor SAE J429 was directly read** in Phase 2 or in this phase — both remain proprietary/paywalled. This phase does not claim otherwise anywhere in the guide's new wording (the guide states plain engineering facts, e.g. "1220 MPa," without asserting "per ISO 898-1, verbatim" or implying BoltLab read the standard itself — consistent with the existing sitewide standards-citation discipline of not overclaiming direct access).
- The dataset's four `verified` ISO records rest on **two independently-operated manufacturer/industry-association sources** (Fastenal Engineering Data Sheet, Rev 3-6-09; Nordic Fastening Group's EN ISO 898-1:2013 technical page) with **full numeric agreement** on every value used in this reconciliation — this is the strongest evidentiary basis available in the current dataset and is treated as controlling over the guide's unsourced, uncited figures.
- The guide's original figures had **no traceable source at all** (confirmed by inspection — no citation, footnote, or reference anywhere in the file). An unsourced figure cannot outrank a cross-verified one; this determined every "dataset clearly controls" classification in Section 5.
- Provenance was preserved accurately: the dataset's own records (and the `iso_898_1` standard record's `public_summary`) already state plainly that the standard was not directly read and that the 2013 edition citation is secondary-source-derived, not independently reconfirmed. This phase did not alter or strengthen that disclosed uncertainty when reconciling the guide — the guide's new wording states the *values* precisely without implying a stronger primary-source basis than the dataset itself claims.

---

## 7. Guide Treatment Decision

**Treatment: B — RECONCILE.**

- **A (Keep unchanged)** was rejected: the guide's claims were not technically compatible with the dataset (Section 5, items 1–5).
- **C (Restructure)** was rejected: the existing educational presentation (a short explanatory paragraph plus a simple table plus an FAQ) is not fundamentally incompatible with the new data model — it only needed corrected numbers and one added column (diameter range) to accurately represent the four verified records. No section was reordered, removed, or reauthored beyond the specific affected claims.
- **B (Reconcile)** was applied: exactly the affected claims were modified (explanatory sentence, the three ISO table rows plus one new row for 8.8's second diameter range, and the matching FAQ/JSON-LD pair). The SAE section, the "Grade 8 vs Grade 5" and "torque" FAQ items, all links, all styling, the title, and the meta description were left untouched.

No prose was rewritten for style. No new topic, section, or scope was added. The table gained one column (diameter range) and one row (8.8's second range) — the minimum structural change needed to accurately represent a real, sourced fact (the diameter split) that the guide had previously omitted entirely.

---

## 8. Torque Content Compatibility

`js/torque-data.js` and `tools/bolt-torque-calculator.html` were inspected and confirmed **byte-for-byte unchanged** from baseline (`git diff --stat HEAD` against both paths returns empty). No contradiction between the reconciled guide and the torque tool was found: the guide's torque-related sentence makes only a qualitative claim ("higher-strength bolts can be tightened to higher torque") and defers numeric torque values entirely to the separate calculator, which this phase did not touch. Per Section 7 of the brief, since no genuine contradiction was discovered, this phase did not broaden scope to address `js/torque-data.js`'s own separately-documented (Phase 2) lack of citation — that remains its own, distinct, not-yet-authorized future reconciliation question.

---

## 9. Entity-Schema Decision

**Preserved exactly as established in Phase 2.** The global `entity_type` enum was not extended. No `fastener_property_class`, `proof_strength`, or `ultimate_tensile_strength` entity was created. The existing `tensile_stress_area` entity (added in Phase 2) was not modified. `data/entities/entities.seed.json` and `data/relationships/relationships.seed.json` show zero diff against baseline (confirmed via `git diff --stat HEAD`).

---

## 10. Dataset Integrity

`node scripts/validators/validate-fastener-strength.js` was run **before** any edit in this phase and confirmed 18/18 passing against the untouched Phase 2 dataset — establishing that no genuine Phase 2 defect existed that would have required a dataset change. **No dataset change was made in this phase.** `data/datasets/fastener_property_classes.seed.json` shows zero diff against baseline.

One **narrowly-scoped, evidence-required update was made to the validator script itself** (`scripts/validators/validate-fastener-strength.js`), not the dataset:

- The prior check asserted the guide **must still contain** its original, incorrect figures ("800 MPa," "1000 MPa," "1200 MPa") as a Phase-2-era safeguard against the guide being silently altered *during Phase 2*, when no guide modification was authorized.
- Phase 3 is explicitly authorized to modify the guide once reconciliation is proven necessary (which it was, Section 5). Leaving the old assertion in place would cause the validator to **incorrectly fail** against this phase's own authorized, evidence-backed change.
- The check was split into two: (a) an unchanged assertion that `js/torque-data.js`/`tools/bolt-torque-calculator.html` remain untouched (still passing, confirming Section 8), and (b) a new, **forward-looking, regression-proof** check that reads the dataset's own current values at run time and confirms the guide states exactly those numbers — meaning this check will correctly catch any *future* drift between the guide and the dataset, in either direction, rather than being hardcoded to one snapshot of "correct" numbers.
- This produces **19/19 passing** (18 original checks minus 1 replaced, plus 2 new ones) rather than the originally-specified "18/18" — reported transparently rather than forcing an artificial 18-count.

---

## 11. Public-Implementation Readiness Gates

| # | Gate | Status | Basis |
|---|---|---|---|
| 1 | Metric tensile-stress-area formula is source-supported | **PASS** | Established in Phase 2 (Section 6 of that report): formula cross-validated against a directly-quoted manufacturer table to within 0.2 mm² across two spot-checked sizes. Unchanged this phase; re-confirmed via the dedicated validator's formula cross-check, which still passes. |
| 2 | Inch tensile-stress-area formula is source-supported at the documented evidence level | **PASS** | Established in Phase 2 (Section 7): sourced to ASME B1.1 (already in BoltLab's data model), cross-validated exactly against a directly-quoted table. Unchanged this phase. |
| 3 | Verified ISO property-class records are internally coherent | **PASS** | All 5 `verified` ISO records (4.6, 8.8×2, 10.9, 12.9) confirmed schema-valid, cross-sourced, and now also consistent with the reconciled guide (this phase's own new check). |
| 4 | Verified SAE records are internally coherent | **PASS** | All 5 fully-`verified` SAE records (Grade 1, 2 ≤¾in, 5×2, 8) plus the proof/tensile-verified Grade 2 >¾in record confirmed schema-valid and cross-sourced; unchanged this phase. |
| 5 | Blocked/insufficient records remain excluded from public calculation | **PASS** | No calculator exists yet (nothing to expose them in); the dataset's own status fields (`source_bound`/`pending_verification`) correctly continue to gate the 6 blocked ISO classes and the 1 disputed SAE field, per Phase 2's design, unchanged. |
| 6 | No unsupported default safety factor exists | **PASS** | No default safety factor exists anywhere in the repository; Phase 2's "no default" decision was not revisited or weakened. |
| 7 | User-supplied safety factor remains required | **NOT APPLICABLE (yet)** | No calculator exists to enforce this; the *requirement* is preserved as documented policy (Phase 1 Section 5, Phase 2 Section 8) for the future implementation phase to honor, not something this phase can itself "pass" in a running system. |
| 8 | N/lbf conversion is mathematically straightforward, no unsupported assumptions | **PASS** | Established in Phase 1 (Section 5): exact SI conversion constant, not an engineering-standard claim. Unchanged. |
| 9 | Mass-equivalent output can be clearly distinguished from force | **NOT APPLICABLE (yet)** | This is a UI/output-design requirement for the future calculator itself; Phase 1's explicit labeling requirement remains documented and unweakened, but there is no output to inspect yet. |
| 10 | The guide does not contradict the calculator dataset | **PASS** | The specific purpose of this phase; confirmed resolved in Section 5 and by the new dedicated validator check. |
| 11 | No calculator claim depends on unsourced property-class records | **NOT APPLICABLE (yet)** | No calculator claims exist yet; the *dataset's own* status-gating mechanism (gate #5) is what will enforce this once a calculator is built. |
| 12 | Safety limitations identified in Phase 1 remain preserved | **PASS** | No Phase 1 limitation was removed, weakened, or reinterpreted; this phase touched no safety-boundary documentation. |
| 13 | Shear/joint failure modes remain deferred | **PASS** | Untouched; no shear or joint-capacity content, calculation, or claim was introduced anywhere. |
| 14 | Engagement, connected-material, bearing, tear-out, pull-through, prying, eccentricity, fatigue, and preload integration remain deferred | **PASS** | None of these topics were touched or introduced. |
| 15 | No full per-size/per-grade programmatic cluster is required for the first release | **PASS** | This phase created no page of any kind, programmatic or otherwise; Phase 1's rejection of that pattern stands unmodified. |

**Summary: 10 PASS, 3 NOT APPLICABLE (genuinely deferred to the calculator-build phase itself, not failures), 0 FAIL, 0 BLOCKED.**

---

## 12. Unresolved Issues

1. `guides/bolt-strength-grades.html`'s title tag ("Metric 8.8, SAE 5 & 8") does not mention 10.9/12.9, and its meta description is truncated mid-sentence ("...then check torque and."). Both are pre-existing defects, independent of the property-class numeric conflict this phase was scoped to resolve. **Not fixed** — explicitly out of this phase's authorized scope (Section 6: "do not improve its prose merely for style," "do not expand its scope"). Flagged for a future, separately-authorized copy-quality pass.
2. The guide still states no numeric SAE values (Section 5, item 6) — not a conflict, but a coverage gap relative to the dataset's SAE records. Not filled, per the same scope discipline.
3. `js/torque-data.js`'s own lack of citation (Phase 2 Treatment A) remains unresolved and was not reopened, since no direct contradiction with the newly-reconciled guide was found (Section 8).
4. The dataset's 6 blocked/incomplete ISO records (4.8, 5.6, 5.8, 6.8, 9.8) and the one disputed SAE yield-strength cell remain exactly as Phase 2 left them — this phase found no new evidence bearing on them and did not attempt to resolve them (out of scope; would require new sourcing work, not reconciliation).

None of these are classified as blocking Phase 3's own PASS determination (Section 17); they are carried forward as known, already-disclosed limitations.

---

## 13. Required Next Phase

**Public Implementation Phase** (the calculator itself): `tools/bolt-load-capacity-calculator.html`, its JavaScript, `reference/fastener-property-classes.html`, `reference/tensile-stress-area.html`, `guides/bolt-load-capacity-basics.html`. This phase's readiness-gate findings (Section 11) indicate the sourcing/reconciliation prerequisites for that phase are satisfied; the three "Not Applicable" gates (#7, #9, #11) are exactly the output-design and enforcement work that phase itself must implement, not evidence gaps blocking it from starting.

---

## 14. Non-Actions

This phase did **not**:

- create the calculator, its JavaScript, or any public reference/guide page;
- create JSON-LD/schema for any new product;
- extend the entity_type enum or create any new entity type;
- modify tapping-domain or size-cluster architecture;
- create any programmatic page or page family;
- begin affiliate/product content;
- make any unrelated SEO change;
- modify `js/torque-data.js` or `tools/bolt-torque-calculator.html`;
- modify `data/datasets/fastener_property_classes.seed.json`, any `data/schemas/*.schema.json` file, `data/entities/entities.seed.json`, or `data/relationships/relationships.seed.json`;
- modify any tapping dataset, generator, or validator;
- modify sitemap, robots.txt, ads.txt, canonical/hreflang logic, navigation, legal pages, or advertising infrastructure;
- modify any Phase 1 or Phase 2 audit artifact;
- upgrade any dependency or perform unrelated cleanup;
- commit or push anything.

---

## 15. Changed Files

| File | Change |
|---|---|
| `guides/bolt-strength-grades.html` | Reconciled: explanatory sentence reworded; ISO table gained a diameter-range column and a fourth row (8.8's second range); 8.8/10.9/12.9 values corrected to the dataset's verified minimums (800/830/1040/1220 MPa); FAQ body text and its matching JSON-LD `acceptedAnswer` updated identically for 12.9. No other section touched. |
| `scripts/validators/validate-fastener-strength.js` | One check split into two: an unchanged torque-file-protection assertion, and a new dataset-driven, regression-proof guide/dataset-consistency check. Net check count 18 → 19. |

No other file was created, modified, or deleted.

---

## 16. Validation Results

```
$ node scripts/validators/validate-fastener-strength.js
19/19 checks passed.
PHASE 2 VALIDATOR: ALL CHECKS PASSED
```

(Ran once before any edit, confirming 18/18 against the untouched baseline; ran again after reconciliation, confirming 19/19 — the count changed only because one check was split into two, not because any check was removed or weakened.)

Full 9-validator regression suite, run after reconciliation:

```
validate-knowledge-engine.js      pass, 0 errors, 0 warnings, counts unchanged (25 entities, 11 standards, 7 datasets, 45 relationships)
validate-projections.js           pass, 0 errors, 0 warnings, 13 projections (unchanged)
validate-tapping-domain.js        pass, 0 errors, 5 warnings (baseline-identical)
validate-tapping-projections.js   pass, 0 errors, 0 warnings
validate-tapping-atlas.js         pass, 0 errors, 0 warnings
validate-tap-type-guide.js        pass, 0 errors, 0 warnings
validate-tapping-workflow.js      pass, 0 errors, 0 warnings
validate-tapping-evidence.js      pass, 0 errors, 0 warnings
validate-tapping-terminology.js   pass, 0 errors, 1 warning (baseline-identical)
```

Six `docs/architecture/*-report.{json,md}` files were regenerated as an incidental timestamp-only side effect of running these validators; reverted via `git checkout --`, per the established T13–Phase-2 convention.

```
$ git diff --check
(clean, exit 0)

$ git diff --stat
 guides/bolt-strength-grades.html                 | 15 +++++-----
 scripts/validators/validate-fastener-strength.js | 38 ++++++++++++++++++++----
 2 files changed, 40 insertions(+), 13 deletions(-)

$ git status --short
 M guides/bolt-strength-grades.html
 M scripts/validators/validate-fastener-strength.js
(plus the same pre-existing untracked files carried since before T13, and the separately-authorized, untouched audit/fastener-recovery-extraction/ directory)
```

Explicit protected-surface confirmation (`git diff --stat HEAD` against each): `data/`, `js/torque-data.js`, `tools/bolt-torque-calculator.html`, `sizes/`, `es/`, `sitemap.xml`, `robots.txt`, `ads.txt`, `_redirects`, `index.html`, `scripts/generators/` — all return empty (zero changes).

---

## 17. Final Phase 3 Recommendation

**PASS — reconciliation complete and public implementation may be planned.**

Every discrepancy identified in Phase 2 between `guides/bolt-strength-grades.html` and `data/datasets/fastener_property_classes.seed.json` has been traced, classified, and resolved using the already-established Phase 2 evidence hierarchy, without fabricating any new source claim or overstating the dataset's own documented evidence limitations. The guide and the dataset now state the same engineering facts. No protected surface, dataset, schema, or entity/relationship file was modified. The dedicated validator was extended (not weakened) to make this consistency regression-proof going forward. Of the 15 public-implementation readiness gates evaluated, 10 PASS outright and 3 are correctly NOT APPLICABLE pending the calculator's own construction (not evidence failures); 0 FAIL or remain BLOCKED.

**Next authorized action**: a Director decision to open the Public Implementation Phase (calculator + supporting reference/guide pages), scoped exactly as bounded in Phase 1 (Sections 5, 10, 11, 19) and re-confirmed unblocked by this phase.

---

## 18. Sources

This phase relied entirely on already-established Phase 1/Phase 2 sourcing; no new external source was consulted. Referenced in full:

1. `audit/fastener-load-strength/PHASE-1-ARCHITECTURE.md` / `.json`
2. `audit/fastener-load-strength/PHASE-2-SOURCING-DATASET.md` / `.json`
3. `data/datasets/fastener_property_classes.seed.json`
4. `data/standards/iso/standards.seed.json` (`iso_898_1` record)
5. `data/standards/sae/standards.seed.json` (`sae_j429` record)
6. `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json`
7. `guides/bolt-strength-grades.html` (as it stood at baseline, and as reconciled)
8. `scripts/validators/validate-fastener-strength.js`

---

**PHASE 3 STATUS: PASS.**

DO NOT begin the Public Implementation Phase automatically. DO NOT commit. DO NOT push. WAIT FOR DIRECTOR REVIEW.
