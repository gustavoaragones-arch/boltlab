# Fastener Load & Strength — Phase 2: Sourcing & Dataset Construction

Date: 2026-09-12
Type: **SOURCING + DATASET CONSTRUCTION** — no public calculator or content page created. Not committed, not pushed, not deployed.
Baseline: `825a9522cacdcb8ff9d078f86d78550a60315d2a` (Phase 1 close, T31 commit).

---

## 1. Source Inventory

| Source | Class | Organization type |
|---|---|---|
| ISO 898-1 | A — Primary standard | International standards body (not directly read; paywalled) |
| SAE J429 | A — Primary standard | Industry standards body (not directly read; paywalled) |
| NASA RP-1228 (Barrett, 1990) | B — Authoritative/near-primary secondary | US government research lab |
| Shigley's *Mechanical Engineering Design* | B — Authoritative/near-primary secondary | Recognized engineering textbook |
| Fastenal Engineering Data Sheet, Rev 3-6-09 | Manufacturer engineering data (treated as B-equivalent per Phase 1's source-priority instruction; explicitly not conflated with a Category A direct read) | Fastener distributor/manufacturer |
| Southwest Bolt, SAE J429 Technical Specifications (2020) | Manufacturer engineering data (B-equivalent) | Fastener distributor |
| Boltport Fasteners LLP, SAE J429 page | Manufacturer engineering data (B-equivalent) | Fastener manufacturer |
| Nordic Fastening Group, EN ISO 898-1:2013 technical page | C — Secondary compiler (industry association) | European fastener trade association |
| RoyMech.co.uk | C — Secondary compiler | Independent engineering reference site |
| EngineersEdge.com | C — Secondary compiler | Independent engineering reference site |
| Brighton Best International PDS (2025) | C — Secondary compiler (manufacturer) | Fastener distributor |
| General web search aggregation | D — Tertiary | Not used as numeric authority (per governing rule) |
| `guides/bolt-strength-grades.html`, `js/torque-data.js` (internal) | Internal, unsourced | Explicitly excluded as sourcing basis |

---

## 2. Source-Access Results

Every attempt was made via legitimate, publicly-accessible HTTP requests to freely-published pages/documents. No paywall or access control was bypassed. Where the official standard itself was paywalled (ISO 898-1, SAE J429), no attempt was made to obtain it through unauthorized means — legitimate manufacturer/industry-association secondary sources were used instead, exactly per the brief's Category B/C guidance.

| # | Target | Class | Result |
|---|---|---|---|
| 1 | `cdn.standards.iteh.ai` ISO 898-1:2013 sample PDF | A (preview only) | Fetched (15-page official preview). Confirmed authentic but is a proprietary/purchasable document; correctly not used to extract copyrighted tables, consistent with BoltLab's own existing standards-citation practice (see `data/standards/*/standards.seed.json`: "No copyrighted standards text is reproduced"). |
| 2 | `crafter.fastenal.com` Mechanical Properties PDF | Manufacturer engineering data | WebFetch's own text conversion failed (corrupted stream); **directly parsed with PyMuPDF (`fitz`) using position-aware block extraction** — full property-class table (4.6, 8.8 ×2 ranges, 10.9, 12.9) and metric tensile-stress-area table obtained and verbatim-quoted. |
| 3 | `nfgab.com` EN ISO 898-1:2013 technical page | C — secondary compiler | Fetched successfully, full property-class table (4.6 through 12.9, including 4.8/5.6/5.8/6.8/9.8) directly quoted. |
| 4 | `southwestbolt.com` SAE J429 PDF | Manufacturer engineering data | Same corruption/direct-parse pattern as #2 — PyMuPDF extraction succeeded, full Grade 1/2/5/8 table obtained. |
| 5 | `boltport.com` SAE J429 page | Manufacturer engineering data | Fetched successfully, full Grade 1/2/5/8 table obtained for independent cross-check. |
| 6 | `brightonbest.com` PDS PDF | C — secondary compiler (manufacturer) | PyMuPDF extraction succeeded; yielded designation-system methodology and nominal-value corroboration for 8.8/10.9, but not a full by-diameter-range minimum-value table. |
| 7 | `engineersedge.com` thread tensile stress area page | C — secondary compiler | Fetched successfully; direct quote of the metric formula `At = 0.7854(D − 0.938194·P)²`. |
| 8 | `engineersedge.com` ANSI inch thread stress area page | C — secondary compiler | Fetched successfully; direct quote of sample UNC stress-area table values, citing ASME/ANSI B1.1. |
| 9 | `roymech.co.uk` thread calculations page | C — secondary compiler | Fetched successfully; direct quote of pitch-diameter formula and external-thread shear-area approximation, citing ISO 898 Part 1. |
| 10 | NASA RP-1228 direct PDF | B | Fetched (5.1MB); automated text extraction corrupted. PyMuPDF was not applied to this specific file in Phase 2 (Phase 1 had already obtained equivalent content via a readable secondary transcription — see #11). |
| 11 | `engineeringlibrary.org` NASA fastener design criteria transcription | Secondary transcription of B | Fetched successfully (carried over from Phase 1); Table I (material UTS ranges) directly quoted. |
| 12 | `portlandbolt.com`, `engineeringtoolbox.com` (×2), `boltdepot.com`, `stsindustrial.com` | Various | HTTP 403 on every attempt — these sites block automated fetching. Not used. |
| 13 | Shigley's Ch. 8 PDF (`eis.hu.edu.jo`) | B | Fetched; automated text extraction corrupted; PyMuPDF was available but this file was not re-attempted in Phase 2 since the needed tables were already independently obtained and cross-verified via #2–#5 above. |
| 14 | General web search for SAE grade values | D | Returned inconsistent numbers across snippets in Phase 1; **not used**. Phase 2 obtained the same values from two independently-read, directly-quoted manufacturer sources instead (#4, #5), which agreed exactly. |
| 15 | ASME B18.3.1 scope search | Mixed | Multiple manufacturer/distributor pages fetched via search summary; sufficient to establish B18.3.1's scope is dimensional (socket products), not mechanical-property (general bolts) — see Section 9. |

**Key methodological finding of this phase**: WebFetch's built-in PDF-to-text conversion failed on every PDF attempted (both in Phase 1 and initially in Phase 2), producing either an explicit refusal or a corrupted-text response. This phase discovered that the `PyMuPDF` (`fitz`) Python library is available in the execution environment and can parse these same downloaded PDFs directly with full fidelity, including position-aware block extraction to correctly reconstruct tables that a naive linear text dump scrambles. This resolved the tooling gap Phase 1 flagged (Phase 1 had reported `poppler-utils`/`pdftoppm` as unavailable; `PyMuPDF` provides an equivalent capability without requiring that system package).

---

## 3. Primary-Source Verification Status

**Neither ISO 898-1 nor SAE J429 was directly read in this phase.** Both remain proprietary, purchasable documents; the free preview obtained for ISO 898-1 (source #1 above) confirmed authenticity but is explicitly not a source for copyrighted numeric tables, consistent with BoltLab's own established citation discipline.

**What was achieved instead, per the brief's explicit Category B/C guidance**: every numeric value below was obtained from at least one manufacturer engineering data sheet or industry-association technical page that itself cites the governing standard, and every ISO 898-1 class actually needed for the Phase 1 minimum gate (8.8, 10.9, 12.9) plus a bonus class (4.6), and every SAE J429 grade needed (5, 8) plus two bonus grades (1, 2), was **independently cross-verified against a second, separately-operated organization's data sheet, with full numeric agreement.**

This is explicitly **not** equivalent to a direct primary-standard read, and is documented as such per the brief's instruction not to describe a directly-read Shigley/NASA/manufacturer table as equivalent to directly reading ISO 898-1 or SAE J429 itself.

---

## 4. Exact Numeric Tables Obtained

### ISO 898-1 (metric), MPa

| Class | Diameter range | Proof strength | Min. tensile strength | Min. yield/Rp0.2 | Status |
|---|---|---|---|---|---|
| 4.6 | M5 – M39 | 225 | 400 | not stated by either source | **verified** (2-source) |
| 8.8 | M5 – M16 | 580 | 800 | 640 | **verified** (2-source) |
| 8.8 | M18 – M39 | 600 | 830 | 660 | **verified** (2-source) |
| 10.9 | M5 – M39 | 830 | 1040 | 940 | **verified** (2-source) |
| 12.9 | M1.6 – M39 | 970 | 1220 | 1100 | **verified** (2-source) |
| 4.8 | not confirmed | 310 | 420 | not stated | source_bound (1 source) |
| 5.6 | not confirmed | 280 | 500 | not stated | source_bound (1 source) |
| 5.8 | not confirmed | 380 | 520 | not stated | source_bound (1 source) |
| 6.8 | not confirmed | 440 | 600 | not stated | source_bound (1 source) |
| 9.8 | d ≤ 16mm only | 650 | 900 | 720 | source_bound (1 source) **and incomplete** — d > 16mm range not obtained |

### SAE J429 (inch), psi

| Grade | Diameter range | Proof load | Min. tensile strength | Min. yield strength | Status |
|---|---|---|---|---|---|
| 1 | 1/4 – 1-1/2 in | 33,000 | 60,000 | 36,000 | **verified** (2-source) |
| 2 | 1/4 – 3/4 in | 55,000 | 74,000 | 57,000 | **verified** (2-source) |
| 2 | over 3/4 – 1-1/2 in | 33,000 | 60,000 | 36,000 | proof/tensile **verified** (2-source); yield **pending_verification** — see Section 15 conflict note |
| 5 | 1/4 – 1 in | 85,000 | 120,000 | 92,000 | **verified** (2-source) |
| 5 | over 1 – 1-1/2 in | 74,000 | 105,000 | 81,000 | **verified** (2-source) |
| 8 | 1/4 – 1-1/2 in | 120,000 | 150,000 | 130,000 | **verified** (2-source) |

---

## 5. Diameter-Range Dependencies

Confirmed structurally (not flattened) per Objective 4:

- **ISO 8.8 is diameter-dependent**: two distinct ranges (M5–M16 and M18–M39) with different proof/tensile/yield values. Confirmed by both independent sources.
- **ISO 4.6, 10.9, 12.9 are NOT diameter-dependent** within the ranges checked — both sources gave one uniform value across the full M5–M39 (or M1.6–M39) range.
- **ISO 9.8 dependency status**: confirmed diameter-dependent by the single source that mentioned it (explicit "d ≤ 16mm" qualifier), but the d > 16mm range was not captured — **incomplete, not flattened, not fabricated**.
- **SAE Grade 2 is diameter-dependent**: 1/4–3/4in vs. over-3/4–1-1/2in, with the larger range dropping to exactly Grade 1's values — confirmed as a real, expected SAE J429 pattern (not a data anomaly) via an internal-consistency check (the "over 3/4in" row's three values are identical to Grade 1's three values in both independent sources).
- **SAE Grade 5 is diameter-dependent**: 1/4–1in vs. over-1–1-1/2in, two genuinely distinct value sets.
- **SAE Grade 1 and Grade 8 are NOT diameter-dependent** within the single stated range (1/4–1-1/2in) for both.

No class or grade was implemented as a single flat "one number" value where the underlying sources indicated a range dependency.

---

## 6. Metric Tensile-Stress-Area Formula Verification

**Formula obtained**: `At = 0.7854 × (D − 0.938194 × P)²`, where D = basic major diameter (mm), P = pitch (mm), At in mm².

- Directly quoted from EngineersEdge.com, which cites ISO threaded fasteners generally.
- An algebraically-equivalent two-step form was independently obtained from the Fastenal data sheet: `At = 0.7854 × [(d3 + d2)/2]²`, where d2 = pitch diameter, d3 = minor diameter (0.7854 = π/4 in both forms).
- RoyMech.co.uk, citing ISO 898 Part 1 explicitly, independently confirmed the underlying pitch-diameter formula (`dp = D − 0.64952·P`) used to derive the two-step form.
- **Numerically cross-validated** against Fastenal's own directly-quoted stress-area table using BoltLab's actual existing thread data: M8×1.25 → computed 36.60 mm² vs. table value 36.6 mm²; M10×1.5 → computed 57.99 mm² vs. table value 58 mm² (both within 0.2 mm² tolerance, i.e. essentially exact).
- **Status: formula is well-established, converges across three independent secondary sources, and is numerically self-consistent against a directly-quoted primary-adjacent table. This is the strongest-evidenced single fact in this entire dataset.** It has not been implemented in any calculator (Phase 2 explicitly does not build the calculator).

---

## 7. Inch (UNC/UNF) Tensile-Stress-Area Formula Verification

**Formula obtained**: `At = 0.7854 × (D − 0.9743/n)²`, where D = basic major diameter (in), n = threads per inch, At in in².

- Correct governing standard identified as **ASME B1.1** — the same standard already present in BoltLab's data model as `asme_b1_1` (added in T27). **No new standard record was needed for this formula.**
- Directly quoted table values obtained from EngineersEdge's ANSI inch thread stress area page, citing "ASME / ANSI B1.1": 1/4-20 UNC = 0.0318 in², 5/16-18 UNC = 0.0524 in², 3/8-16 UNC = 0.0775 in², 1/2-13 UNC = 0.1419 in².
- **Numerically cross-validated**: computed 1/4-20 (D=0.25, n=20) = 0.031822 in² vs. quoted 0.0318 in² (exact match to 4 decimal places); computed 3/8-16 (D=0.375, n=16) = 0.077527 in² vs. quoted 0.0775 in² (exact match).
- Per the brief's explicit instruction, **the metric formula was not assumed to translate algebraically without verification** — the inch formula's distinct constant (0.9743, vs. the metric formula's 0.9382) and its own independent sourcing (ASME B1.1 vs. ISO 898-1) were separately confirmed.
- These designations (1/4-20 UNC, 5/16-18 UNC, 3/8-16 UNC) already exist in BoltLab's own `data/datasets/unc.seed.json`, confirming direct compatibility with existing data.
- **Status: formula obtained, correctly sourced to the standard already in BoltLab's data model, numerically cross-validated. Not implemented in any calculator.**

---

## 8. Safety-Factor Decision

**Decision: No default safety factor. User must supply the factor appropriate to the application.**

Investigation performed:
- Searched for Shigley's-cited and Sandia National Laboratories ("Guideline for Bolted Joint Design and Analysis," SAND2008-0371) treatment of bolted-joint safety factors.
- Found: Shigley's own guidance (per search-result summary of the textbook's institutional context) is that for connections where danger to human life is involved, engineers should refer to the *governing application code* (AISC steel construction manual, AREMA railway specifications, ASME boiler code, etc.) — **not a single textbook-wide number**.
- Found: what search results labeled "0.75 Fp / 0.9 Fp" is a **preload ratio** (fraction of proof load used for bolt pretensioning), a distinct engineering concept from an external-tension-load safety factor — correctly not conflated with the calculator's design-load safety factor.
- Directly checked MechaniCalc's bolted-joint-analysis reference page: **confirms no recommended or typical factor-of-safety value or range is stated there either.**
- **Conclusion**: no single, broadly-applicable, authoritatively-sourced default exists for a generic (application-unaware) calculator. This is a genuine, defensible negative finding, not a sourcing failure — the engineering literature itself treats this as application-specific, not universal.
- This matches Phase 1's own tentative recommendation and is now confirmed by direct investigation rather than assumed.

---

## 9. SAE vs. ASME Scope Decision

**Decision: SAE J429 is sufficient for v1. ASME B18.3.1 is NOT required.**

Evidence: ASME B18.3(.1) governs **socket head cap screws, shoulder screws, set screws, and hex keys** — a dimensional/geometric product-form standard (head/socket/drive geometry), not a general mechanical-property standard for bolts/screws/studs. Even for the one product family it does cover (socket head cap screws), the governing *mechanical-property* specification is a separate standard (ASTM A574), not B18.3.1 itself. SAE J429 covers exactly BoltLab's intended v1 scope (general inch bolts, screws, studs — hex head and similar standard forms). The two standards are not redundant; they simply do not overlap for v1's purposes. No standard record for ASME B18.3.1 was created.

---

## 10. Existing-Content Reconciliation Decision

Three existing files were inspected, **not modified**:

| File | Treatment | Rationale |
|---|---|---|
| `guides/bolt-strength-grades.html` | **B — Re-source/reconcile in a later dedicated content phase** | A real, evidenced numerical discrepancy now exists (see Section 15): the guide states the *nominal/designation-implied* values (800/1000/1200 MPa for 8.8/10.9/12.9 — i.e., simply the class number × 100), while the newly-sourced, cross-verified dataset gives the actual ISO-specified *minimum* values (800/830, 1040, 1220 MPa respectively) — the two are close but not identical, and the guide does not disclose 8.8's diameter-range split at all. This is exactly the kind of conflict the brief requires documenting precisely rather than silently reconciling. Production content changes require a separate, explicit authorization; not made here. |
| `js/torque-data.js` | **A — Retain unchanged as legacy/reference-context content for now** | Contains pre-computed torque (Nm) values, a derived quantity from preload/proof-load via a torque coefficient (T = K·D·F) that was not recomputed or cross-checked in this phase. No direct numeric conflict was established against the newly-sourced proof-strength dataset (a conflict check would require the file's own undisclosed torque-coefficient assumption, which is not stated in the file and was not independently derived here). Flagged for a future dedicated check, not urgent for Phase 2. |
| `tools/bolt-torque-calculator.html` | **A — Retain unchanged**, same reasoning as its data file | UI layer only; no independent numeric claim beyond what `js/torque-data.js` supplies. |

**No production file was modified to implement or investigate this decision.** The dedicated Phase 2 validator (`scripts/validators/validate-fastener-strength.js`) includes an explicit check confirming both `guides/bolt-strength-grades.html` and `js/torque-data.js` still contain their original, pre-existing content markers, as a safeguard against this phase having silently altered them.

---

## 11. Entity-Graph Findings

**Existing relevant entities found** (no duplicates created): `pitch_diameter`, `major_diameter`, `minor_diameter`, `thread_pitch` — all `entity_type: thread_geometry`. The new `tensile_stress_area` entity (created this phase) relates to all four via `DERIVED_FROM` relationships to `pitch_diameter` and `minor_diameter` specifically (the two dimensions the tensile-stress-area formula is actually built from).

**New entity created**: `tensile_stress_area` (`entity_type: thread_geometry` — fits an existing, already-defined enum value with no schema change). Status `draft` (matching the established convention for entities not yet backing a live page, e.g. `form_tapping`). Related to the new `iso_898_1` and `sae_j429` standard records and the new `fastener_property_classes` dataset, plus existing `metric_threads`/`unc_threads`/`unf_threads` datasets.

**Entities explicitly NOT created — genuine schema incompatibility discovered, per the brief's stop-and-report instruction**: `fastener_property_class`, `proof_strength`, and `ultimate_tensile_strength` cannot be represented, because `data/schemas/entity.schema.json`'s `entity_type` field is a closed enum with exactly 8 values (`thread_geometry`, `fit_class`, `thread_system`, `tolerance_concept`, `standard_concept`, `tap_type`, `hole_preparation`, `tapping_operation`), **none of which fit a mechanical-material-property concept**. Forcing one of these entities into an ill-fitting existing category (e.g. `standard_concept`) would misrepresent it; silently adding new enum values would be exactly the kind of unauthorized schema change the brief forbids ("Do not redesign the global schema silently"). **This is reported, not resolved.** A reasonable path forward (for Director decision, not assumed here) would be an additive, backward-compatible enum extension (e.g. adding `mechanical_property` and `mechanical_property_class`) — the project's own `dataset.schema.json` and `standard.schema.json` already show precedent for this kind of additive, non-breaking evolution (their `status`/`edition`/`standard_status` fields are explicitly documented as "Optional, additive field (v0.2.0+)").

**Entities explicitly NOT created — no product/tool precedent exists**: `bolt_load_capacity_calculator`, `design_load`, `safety_factor`. Inspection of the full 24 pre-existing entities found **zero** existing tool-page entities (no entity represents `tap-drill-calculator`, `thread-identifier`, `bolt-torque-calculator`, or any other existing tool) and **zero** generic calculation-concept entities (no `torque` or `clamp_load` entity exists despite `tools/bolt-torque-calculator.html` already being a live product). Creating entities for the new calculator or for generic input/output concepts would break from established practice and risk being exactly the "entity created merely for SEO vocabulary" pattern the brief explicitly warns against (Objective 12). **Correctly not created.**

**New relationships created**: 4, all attached to `tensile_stress_area` (`DERIVED_FROM` → `pitch_diameter`, `DERIVED_FROM` → `minor_diameter`, `DEFINED_BY` → `iso_898_1`, `DEFINED_BY` → `asme_b1_1`), all schema-valid, no dangling references.

---

## 12. Dataset Schema/Design

`data/datasets/fastener_property_classes.seed.json` was created, conforming to the existing `data/schemas/dataset.schema.json` **without any schema modification**. 16 records (10 ISO metric classes/ranges, 6 SAE grades/ranges). Each record carries per-field (`proof_strength`, `tensile_strength`, `yield_strength`) `{value, unit, status}` objects plus a `provenance` object naming both cross-checked sources (or explicitly `source_b: null` where only one source was found), a `diameter_dependent` flag, and a `confidence` summary field. This is more granular than the dataset-level-only metadata some older BoltLab datasets carry, and mirrors the field-level provenance pattern already established in `data/datasets/unc.seed.json`'s T2.1a-added records.

A new `data/standards/sae/` directory was created (previously absent — existing directories were `ansi/asme/bs/din/iso/jis/other`), containing `sae_j429`, following the exact structural pattern of every other per-organization standards file. **This is a consistent extension of an already-anticipated pattern (the existing `other/` catch-all and six named-organization directories already establish that arbitrary organization directories are the design), not a structural/architectural change.**

`iso_898_1` was added to the existing `data/standards/iso/standards.seed.json` (no new file needed).

---

## 13. Records Ready for Publication

("Ready" = `confidence: verified`, both `proof_strength` and `tensile_strength` fields carry `status: verified`, cross-checked against two independent sources with full agreement.)

- **ISO metric**: 4.6 (M5–M39); 8.8 (M5–M16); 8.8 (M18–M39); 10.9 (M5–M39); 12.9 (M1.6–M39) — **5 records, exactly matching + exceeding Phase 1's minimum gate (8.8/10.9/12.9)**.
- **SAE**: Grade 1 (1/4–1½in); Grade 2 (1/4–¾in); Grade 5 (1/4–1in); Grade 5 (over 1–1½in); Grade 8 (1/4–1½in) — **5 records**, exceeding Phase 1's minimum gate (Grade 5/8). Grade 2's over-¾in range is proof/tensile-verified but yield-pending (see Section 15) — since the Phase 1 calculator design uses proof strength as the primary capacity basis and tensile strength as secondary reference (not yield), **this range is usable for the v1 calculator's actual planned calculations** even with yield unresolved.

**Total: 10 of 16 records are fully verified and usable for the planned v1 calculator's actual required fields (proof + tensile strength).**

---

## 14. Records Blocked

| Record(s) | Reason blocked |
|---|---|
| ISO 4.8, 5.6, 5.8, 6.8 | Single-sourced only (Nordic Fastening Group); no second independent source obtained in this phase. `confidence: source_bound`. |
| ISO 9.8 (d≤16mm) | Single-sourced AND diameter-incomplete (d>16mm range not obtained at all). `confidence: source_bound`, flagged incomplete. |
| SAE Grade 2, over-¾in range — `yield_strength` field only | Second source's own AI-generated summary produced an internally-inconsistent value (57,000 psi "for both ranges," contradicted by the same range's own proof/tensile values dropping to Grade-1 levels). Not silently resolved — see Section 15. `proof_strength`/`tensile_strength` for this same record ARE ready (see Section 13); only `yield_strength` is blocked. |

**None of these blocked items are exposed with a "verified" or fully-trusted status; all carry the correct `source_bound`/`pending_verification` marking per the dataset schema's existing vocabulary.**

---

## 15. Cross-Verification Results

| Record group | Source A | Source B | Agreement | Resolution |
|---|---|---|---|---|
| ISO 4.6, 8.8 (×2 ranges), 10.9, 12.9 | Fastenal Engineering Data Sheet | Nordic Fastening Group technical page | **Full agreement, every value** | Marked verified |
| ISO 4.8, 5.6, 5.8, 6.8, 9.8 | Nordic Fastening Group only | — (no second source found) | N/A | Marked source_bound, not blocked from the dataset but excluded from v1 UI recommendation |
| SAE Grade 1, 2 (¼–¾in), 5 (×2 ranges), 8 | Southwest Bolt data sheet | Boltport Fasteners LLP page | **Full agreement, every value** | Marked verified |
| SAE Grade 2, over-¾in: proof_strength, tensile_strength | Southwest Bolt | Boltport | **Full agreement** | Marked verified |
| SAE Grade 2, over-¾in: yield_strength | Southwest Bolt (36,000 psi, positionally consistent with this range mirroring Grade 1 exactly) | Boltport (page's own summary stated "57,000 psi, both ranges" — internally inconsistent with the range's own proof/tensile drop) | **Disagreement** | **Not silently resolved.** Left at `pending_verification`. Internal-consistency reasoning (this range's proof/tensile exactly equal Grade 1's own values, a documented real SAE pattern) gives high confidence Southwest Bolt's 36,000 psi is correct and Boltport's page-summary is an extraction artifact, but this phase does not upgrade the status without an actual third-source confirmation — recorded as a judgment call for a human reviewer, not decided unilaterally. |
| Metric tensile-stress-area formula | EngineersEdge (formula) | Fastenal (table) + RoyMech (related formula) | **Full agreement** (formula reproduces table to within 0.2 mm² across 2 spot-checked sizes) | Formula confirmed, not implemented anywhere |
| Inch tensile-stress-area formula | Search-aggregated formula citing ASME B1.1 | EngineersEdge (table, citing ASME/ANSI B1.1) | **Full agreement** (formula reproduces table exactly to 4 decimal places across 2 spot-checked sizes) | Formula confirmed, not implemented anywhere |

---

## 16. Conflicts / Unresolved Questions

1. **SAE Grade 2 (over-¾in) yield strength** — genuine source disagreement, left `pending_verification`, not resolved (Section 15). Does not block the record's usable fields (proof/tensile).
2. **`guides/bolt-strength-grades.html` vs. the new dataset** — the guide's round "designation-implied" numbers (800/1000/1200 MPa) differ from the ISO-specified actual minimums now sourced (800 or 830 / 1040 / 1220 MPa) — a real, documented discrepancy, reconciliation explicitly deferred to a future content phase (Section 10).
3. **ISO 898-1 edition currency** — secondary sources cite "2013"; this phase did not independently confirm whether a newer edition has since superseded it (mirroring the same honest-uncertainty language already used for `iso_965_1` in this same file, which underwent a confirmed 2013→2026 edition change). Flagged in the new `iso_898_1` record's `public_summary`.
4. **Entity-graph `entity_type` enum gap** — `fastener_property_class`, `proof_strength`, `ultimate_tensile_strength` cannot be created without an additive schema change; reported per Section 11, not resolved unilaterally.
5. **`js/torque-data.js` numeric relationship to the new dataset** — not established either way (no conflict found, but also not positively reconciled); would require deriving/assuming a torque coefficient not stated in that file.
6. **ISO 9.8's d>16mm range** — genuinely missing, not merely uncertain; would need a further sourcing pass.

---

## 17. Phase 3 Prerequisites

Phase 3 (still not the public calculator — the brief's Phase 1 numbering implied further gating before actual publication) should not proceed to **public content/calculator implementation** until:

1. A Director decision on the `entity_type` enum extension (Section 11) — either authorize an additive extension, or confirm the fastener-strength concepts will remain entity-less (dataset/standard-only) permanently.
2. A Director decision on `guides/bolt-strength-grades.html`'s reconciliation (Section 10/16.2) — reword to cite actual minimums with diameter-range disclosure, or explicitly leave as distinct "rule of thumb" content with a clarifying note.
3. Optional (not blocking v1 per Phase 1's own scope): a second independent source for ISO 4.8/5.6/5.8/6.8/9.8, and the missing ISO 9.8 d>16mm range, if any of those classes are ever wanted in the UI.
4. Optional (not blocking v1): a third-source tie-breaker for the one disputed SAE Grade 2 yield-strength cell.
5. The actual calculator page, JavaScript, and content pages (Objective 13's forbidden list) — explicitly not started, and their own future-phase brief should re-confirm the exact `verified`/`source_bound` eligible set at that time in case this dataset is further updated first.

---

## 18. Source Citation Quality (per production-ready record)

Representative examples (full set in the dataset file's own `provenance` objects):

```
Record: ISO 8.8, M5-M16
Source: Fastenal Engineering Data Sheet
Standard: ISO 898-1
Edition/year: not stated on the data sheet itself (sheet dated "Rev 3-6-09")
Table: "Mechanical Properties Per ISO 898-1 (Externally Threaded Fasteners)"
Section: n/a (single-page reference sheet)
Page: 1 of 2
Claim: Proof strength 580 MPa, min. tensile strength 800 MPa (116,000 psi), min. yield 640 MPa
Applicable range: M5 - M16
Cross-check: Nordic Fastening Group, "Mechanical properties, screws and studs EN ISO 898-1:2013" -- full agreement

Record: SAE Grade 8
Source: Southwest Bolt, "SAE J429 Technical Specifications"
Standard: SAE J429
Edition/year: 2020 (per document filename/citation)
Table: "J429 Mechanical Properties"
Section: n/a
Page: 1 of 2
Claim: Proof load 120,000 psi, min. yield 130,000 psi, min. tensile 150,000 psi
Applicable range: 1/4 in - 1-1/2 in
Cross-check: Boltport Fasteners LLP SAE J429 page -- full agreement
```

Where the exact page/table/section could not be established (e.g. the Nordic Fastening Group web page has no page numbers), this is stated explicitly in the dataset's `provenance.source_a.name` field rather than an invented page number.

---

## Explicit Non-Actions

This phase did **not**:

- create or publish `tools/bolt-load-capacity-calculator.html` or any calculator JavaScript;
- create `reference/fastener-property-classes.html`, `reference/tensile-stress-area.html`, `guides/bolt-load-capacity-basics.html`, or any M8/M10/M12 high-intent page;
- modify `guides/bolt-strength-grades.html`, `js/torque-data.js`, or `tools/bolt-torque-calculator.html` (explicitly verified unchanged by the new dedicated validator);
- modify any existing tapping dataset, generator, or validator;
- modify `data/schemas/*.schema.json` (the one genuine incompatibility found — the entity_type enum — was reported, not silently patched);
- create an ASME B18.3.1 standard record (determined unnecessary);
- create `fastener_property_class`, `proof_strength`, `ultimate_tensile_strength`, `bolt_load_capacity_calculator`, `design_load`, or `safety_factor` entities;
- implement a default safety factor anywhere;
- add advertising, FAQPage schema, or any other new JSON-LD;
- commit, push, or deploy anything.

---

**PHASE 2 STATUS: PASS.**

Sourcing gates for the Phase 1 minimum gate (ISO 8.8/10.9/12.9, SAE Grade 5/8) are met and exceeded (also obtained ISO 4.6, SAE Grade 1/2). A schema-valid dataset, two schema-valid standard records, one new schema-valid entity, and four schema-valid relationships were constructed. A dedicated validator (18/18 checks passing) confirms structural integrity, source-standard resolution, unit consistency, no-fabrication guarantees, and non-modification of protected/existing content. Full 9-validator regression suite re-confirmed passing at baseline warning counts. `git diff --check` clean. No public content was created.

DO NOT COMMIT. DO NOT PUSH. DO NOT DEPLOY. PHASE 3 MUST NOT BEGIN AUTOMATICALLY.
