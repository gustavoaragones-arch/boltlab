# Fastener Load & Strength — Phase 1: Content & Engineering Architecture / Source Specification

Date: 2026-09-11
Type: **AUDIT / DESIGN ONLY** — zero production files created, modified, or deleted. Not committed, not pushed, not deployed.
Baseline: `825a9522cacdcb8ff9d078f86d78550a60315d2a` (T31 close). This initiative is explicitly separate from the T26–T31 AdSense-quality sequence, which remains CLOSED / HOLD.

---

## 1. Executive Summary

BoltLab currently has **no dataset, calculator, or reference content covering fastener strength or load capacity**. The closest existing material is a hand-authored, uncited `guides/bolt-strength-grades.html` page (general tensile-strength figures for ISO property classes and SAE grades, no source citation, no proof-load or tensile-stress-area data) and a static, uncited per-size/per-grade torque lookup table (`js/torque-data.js`) behind `tools/bolt-torque-calculator.html`. Neither is suitable as a source for a new, defensible Bolt Load Capacity Calculator — both would need to be superseded or explicitly left as-is (separate, lower-rigor legacy content) rather than treated as authoritative inputs.

This audit investigated real, identifiable authoritative sources for the required engineering content (ISO 898-1, ASME B18.3.1 / SAE J429, NASA RP-1228, Shigley's *Mechanical Engineering Design*) and attempted live verification of the specific formulas and numeric tables needed. Result:

- **The tensile-stress-area formula and the general tension/shear stress framework are well-established, converge across every source checked, and can proceed to Phase 2 with a defined final-verification step.**
- **Per-grade proof-load and minimum-tensile-strength numeric values (the actual numbers a load calculator would multiply) could NOT be cleanly verified from a primary source in this session** — every attempt to fetch a primary or single authoritative secondary source returned either an HTTP 403, a corrupted/unreadable PDF text stream, or a paywall. A general web search surfaced numbers from multiple secondary aggregator sites that were **not mutually consistent** (e.g. three different "Grade 8" figures from three different snippets). Per the brief's explicit instruction, these values are marked **UNSOURCED / NOT READY** rather than filled in from search-engine-summarized snippets. This is the single most important finding of this phase and the primary Phase 2 prerequisite.
- BoltLab's existing dataset/schema architecture (`data/schemas/{dataset,entity,standard}.schema.json`, the `verified / source_bound / pending_verification / unavailable` status vocabulary already defined in `dataset.schema.json`, and the four-tier data-classification framework published at `reference/data-methodology.html`) is directly reusable for this initiative with no structural changes required.
- A **bounded, honest first release** is achievable: one calculator (tensile capacity only, explicitly not a full joint-capacity tool), a small property-class reference dataset once sourced, and 3–5 carefully chosen high-intent explanatory pages — not a large programmatic cluster. This audit explicitly recommends **against** a broad "How much weight can an MN bolt hold" page-per-size-per-grade cluster, for the same reasons T26 flagged the `/sizes/` cluster.

**This phase does not authorize Phase 2 implementation.** The primary blocker to Phase 2 is the unsourced numeric property-class table, documented in detail in Section 8.

---

## 2. Existing Repository Capability Audit

Inspected, not modified:

| Area | Finding |
|---|---|
| `data/datasets/*.seed.json` | `metric_threads.seed.json`, `metric_tapping.seed.json`, `unc*.seed.json`, `unf*.seed.json` — thread geometry (diameter, pitch) and tap-drill data only. **No tensile/proof-load/property-class field exists anywhere in `data/`** (confirmed by a repo-wide case-insensitive search for `tensile`, `proof load`, `property class`, `strength grade`, `yield strength` — zero hits outside one incidental match in `data/link-map.json` unrelated to strength data). |
| `data/entities/entities.seed.json`, `data/relationships/relationships.seed.json` | Entity/relationship graph covers thread systems, tap types, standards — no fastener-material or property-class entities exist. |
| `data/standards/{iso,asme,ansi,din,bs,jis,other}/standards.seed.json` | Per-organization standard records exist (e.g. `asme_b1_1`, `asme_b94_9` — both about thread form/tap nomenclature, not fastener mechanical properties). No ISO 898-1, ASME B18.3.1, or SAE J429 record exists yet. |
| `data/schemas/{dataset,entity,standard,relationship}.schema.json` | Directly reusable, no changes needed. `dataset.schema.json` already defines the exact status vocabulary this initiative needs: `verified \| source_bound \| pending_verification \| unavailable`. |
| `data/projections/*.schema.json` (`tapping-profile`, `tapping-tap-type`, `reference-page`, `tool`, `chart`, `atlas`, `api`) | Established generator-output schema pattern; a new `fastener-strength-profile.schema.json` (or similar) would follow the same pattern, not replace any existing one. |
| `tools/bolt-torque-calculator.html` + `js/torque-data.js` | Static per-size/per-grade Nm lookup table, **no cited source**, **no formula shown**, dry/oiled variants only. Confirmed via direct file read: the table is a flat JS object, not derived from a documented preload/proof-load calculation. This is a pre-existing, lower-rigor pattern that predates the tapping-domain's verified/source-bound discipline; it should not be treated as a source for the new calculator, and should not be extended to imply new authority it doesn't have. |
| `tools/fastener-weight-calculator.html` + `js/weight-data.js` | Static per-size/per-material grams-per-mm lookup table (reviewed in depth during T29). Same "convenience table, no formula, no citation" pattern. Useful as a UI/UX precedent (form layout, `aeo-answer-block`, result rendering), not as a data-sourcing precedent. |
| `guides/bolt-strength-grades.html` | Hand-authored, no citation, states ISO classes 8.8/10.9/12.9 with round-number MPa figures ("800 MPa", "1000 MPa", "1200 MPa") and SAE Grade 2/5/8 with marking descriptions only (no numeric values at all for SAE grades). Confirmed via direct file read. **Not suitable as a data source** for a calculator — it is exactly the kind of unsourced generic content the new initiative must not perpetuate. |
| `reference/data-methodology.html` | Publishes BoltLab's four-tier data classification (Verified source data / Derived-calculated data / Reference-context data / Approximate-non-authoritative values) and the standing disclaimer language ("does not mean BoltLab is the standards organization..."). Directly reusable, unmodified. |
| `disclaimer/index.html` | Existing safety/liability disclaimer already states "nothing... constitutes professional engineering... advice" and "should not be relied upon as a substitute for advice from a qualified engineer." Directly reusable; the new calculator's limitations section should link here rather than duplicate this language. |
| `scripts/generators/generate-tapping-*.js`, `scripts/validators/validate-tapping-*.js` | Established generator→projection→page pipeline and a 20-check validator precedent (T13–T25). The new capability should follow this exact pattern (seed dataset → schema-validated projection → generated page → dedicated validator) rather than a one-shot hand-authored page or a `_generate_longtail_sizes.py`-style throwaway script (the T26/T28 audit trail is explicit that the latter pattern is what caused the size-cluster problem). |
| `scripts/build_sitemap.py` | Existing sitemap builder with a documented pre-existing `.html`-suffix bug (found in T27, never fixed, out of scope for every phase since). New pages must account for this known issue rather than assume a clean sitemap run. |
| `js/link-engine.js`, `js/context-anchor-engine.js`, `js/anchor-engine.js` | Sitewide internal-linking/anchor infrastructure, loaded on every page. Reusable without modification. |
| `js/ads-layout.js`, `ads.txt`, `robots.txt` | Confirmed inactive advertising infrastructure (0 active ad scripts sitewide, per T30/T31). Not to be touched; the new pages should follow the same "ad-container markup present but no ad-network script" convention already used sitewide, or omit it entirely — a decision for Phase 2, not this audit. |
| Internal-link/SEO conventions (`<link rel="canonical">`, `hreflang`, `aeo-answer-block`, breadcrumb, footer nav) | Fully established, consistent sitewide pattern (verified across T27–T31 work). Reusable as-is. |
| `es/` (Spanish) architecture | Established parallel-page pattern (`es/sizes/perno-mN.html` etc.) with `hreflang` cross-links. Reusable if/when the new capability is localized — **not recommended for a first release** (see Section 16). |

**Conclusion**: every piece of *architecture* (schemas, generator pattern, validator pattern, disclaimer language, data-classification framework, internal-linking infrastructure) needed for this initiative already exists and is reusable without modification. The one genuine gap is the actual *engineering property-class dataset* — which does not exist anywhere in the repository and must be sourced from scratch, carefully, per Section 8.

---

## 3. Reusable Systems Inventory

| System | Reuse plan |
|---|---|
| `data/schemas/dataset.schema.json` | New `data/datasets/fastener_property_classes.seed.json` (name TBD in Phase 2) conforms to this schema as-is. No schema change needed. |
| `data/schemas/standard.schema.json` | New standard records (`iso_898_1`, `sae_j429` or `asme_b18_3_1`) conform as-is, following the exact shape of the existing `asme_b1_1` record. |
| `data/schemas/entity.schema.json` | New entities (`fastener_property_class`, `tensile_stress_area`, `proof_load`, `bolt_load_capacity_calculator` as a tool entity, etc.) conform as-is. |
| `data/projections/*.schema.json` pattern + `scripts/generators/generate-tapping-*.js` pattern | Template for a new `generate-fastener-strength-projection.js` / `generate-fastener-load-calculator.js` pair. No existing generator is modified. |
| `scripts/validators/validate-tapping-projections.js` pattern (20-check precedent) | Template for a new `validate-fastener-strength.js`. No existing validator is modified. |
| `reference/data-methodology.html`'s 4-tier classification | The new dataset's `status` field maps directly: formula/geometry = "derived or calculated data"; property-class numbers once sourced = "verified source data" (if independently cross-verified) or explicitly labeled "approximate/non-authoritative" if only single-sourced. |
| `disclaimer/index.html` | Linked from every new page's limitations section; not duplicated. |
| Existing `<aeo-answer-block>` / "Quick answer" pattern (confirmed across `tools/tap-drill-calculator.html`, strengthened in T29 on `tools/fastener-weight-calculator.html`) | Reused verbatim as the required pre-interaction content pattern for the new calculator page. |
| `js/link-engine.js`, `js/context-anchor-engine.js`, `js/anchor-engine.js` | Loaded as-is on new pages; no change. |
| Established internal-link/footer/nav/canonical/hreflang template | Reused as-is for new page shells. |
| `js/converters.js`'s `round()` helper and static-lookup-table UI pattern (form → result div → `aria-live="polite"`) | Reusable UI/interaction pattern for the new calculator's client-side script, **but the underlying calculation must be formula-driven from sourced constants, not a flat convenience table**, unlike the torque/weight calculators — this is a deliberate, documented departure from the two nearest precedents, justified by the higher engineering stakes of a load-capacity claim. |

No existing system requires modification to support this initiative. No conflict was found between this initiative and any protected T26–T31 surface.

---

## 4. Engineering Scope

### In scope for a defensible first release

| Subject | Treatment |
|---|---|
| Tensile loading | Core calculation: tensile stress = axial load ÷ tensile stress area; capacity = proof strength × tensile stress area (with an explicit safety-factor step, not baked silently into a single "safe load" number). |
| Tensile stress area | Core calculation: standard geometric formula from nominal diameter and pitch (Section 8). |
| Nominal diameter vs. tensile-stress-area diameter | **Must be explained**, not just computed — this is a common source of user error (T26/T30 precedent: BoltLab's own voice is "transparent about limitations"). |
| Proof strength | Core input, per property class/grade — **numeric values pending sourcing (Section 8)**. |
| Ultimate tensile strength | Core input, per property class/grade — **numeric values pending sourcing (Section 8)**; used for reference/comparison, not as the primary capacity basis (proof strength governs static design capacity per standard practice). |
| Fastener property class / grade | Core input — scope limited to ISO metric property classes (4.6, 4.8, 5.8, 8.8, 9.8, 10.9, 12.9) and SAE J429 grades (2, 5, 8) for v1, matching BoltLab's existing size/grade vocabulary (`js/torque-data.js` already uses exactly this set, which is a useful continuity signal even though that file's values aren't reused). |
| Design load / safety factor | Core output: user-selectable or default safety factor, shown explicitly as a divisor, never hidden inside a single opaque "safe load" figure. |
| Allowable/design capacity | Core output: `capacity ÷ safety factor`, labeled explicitly as fastener-only capacity. |
| Force-unit conversion | Core output: N ⇄ lbf, with kN/kip convenience presentation. |
| Equivalent kg/lb presentation | **Included only as a clearly-labeled "equivalent mass under standard gravity" convenience figure, never as a force value** (see explicit instruction in Section 5/Output design — this is a real risk area flagged in the brief and must be handled correctly). |
| Fastener capacity vs. joint capacity | **Must be a first-class, prominent distinction**, not a footnote — the calculator computes fastener tensile (and optionally shear) capacity only; it explicitly does not compute joint capacity. |

### Deferred to later expansion (not in first release)

| Subject | Why deferred |
|---|---|
| Shear loading | Requires a second sourced value (shear strength, often approximated as a fraction of tensile strength per various references, but that ratio itself needs sourcing, not assumption) and a second UI mode. Recommend v1 ship tension-only with shear explicitly flagged "coming once sourced," rather than ship an under-sourced shear figure to hit a broader v1 scope. |
| Thread engagement limitations | Real and important, but requires connected-material and thread-strip-strength data (a third sourced quantity: internal-thread shear strength in the tapped/nut material) — a distinct, larger sourcing task. |
| Connected-material limitations | Requires a materials-strength dataset BoltLab does not have (parallel to the tapping-domain's own honest "engagement calculation is not currently available" precedent — the correct posture is to say so, not to approximate). |
| Bearing, tear-out, pull-through, prying, eccentricity | All are joint-level (not fastener-level) failure modes requiring plate/material geometry and strength inputs outside a single-fastener calculator's natural scope. Recommend a **separate future "Joint Capacity" initiative** if ever pursued, explicitly not conflated with this one. |
| Preload (as an input, e.g. torque-to-preload) | BoltLab already has `tools/bolt-torque-calculator.html`; a future integration point exists but should not block v1, and that existing tool's own unsourced data should be addressed as a separate, explicit decision (see Section 17). |
| Fatigue / cyclic loading | Requires S-N curve or endurance-limit data per material/grade — a substantially larger, separate sourcing project (typically MIL-HDBK-5 / aerospace-grade sourcing, per the NASA RP-1228 excerpt found during this audit's research, Section 8). |
| Corrosion/environment, installation quality, material condition, manufacturing tolerances | Correctly belong in a **limitations/disclaimer narrative**, not as calculator inputs — no dataset exists or is proposed for these; they are qualitative risk factors to disclose, matching the tapping domain's own precedent of stating a limitation explicitly rather than approximating around it. |

This scoping decision (tension-only, two grade systems, explicit non-coverage of every joint-level mode) is the single most important engineering-scope decision in this document and directly implements the brief's instruction not to assume every subject belongs in v1.

---

## 5. Proposed Calculator Architecture

**Name (working):** Bolt Load Capacity Calculator (tensile capacity) — name to be finalized in Phase 2; must not overclaim "joint" or "safe load" in its title.

### Inputs

| Input | Required? | Type | Units | Default | Validation / range | Source requirement |
|---|---|---|---|---|---|---|
| Nominal diameter (thread designation, e.g. M8, M10, 1/4"-20) | Required | Select | mm or inch, matching existing `metric_threads.seed.json` / UNC/UNF designation conventions | None (user selects) | Limited to designations for which both thread geometry AND a sourced property-class value exist — **not the full existing thread-geometry list**, since diameter/pitch alone is insufficient without a sourced strength value | Reuses `data/datasets/metric_threads.seed.json` / `unc.seed.json` / `unf.seed.json` diameter+pitch fields (already "verified-summary-only" — see Section 8 caveat) |
| Thread series (coarse/fine) | Required if the designation has both | Select | — | Coarse | Must match an existing pitch record | Same as above |
| Property class / grade | Required | Select | — | None (user selects) | Limited strictly to grades with a sourced proof-strength value (Section 8) | New `fastener_property_classes` dataset |
| Applied load | Required | Number | User-selectable N or lbf | None | > 0; reasonable upper bound (e.g. reject absurd inputs like 10^9 N) to avoid nonsensical output | N/A (user input, not sourced data) |
| Safety factor | Optional | Number | dimensionless | A clearly-labeled default (e.g. "no factor applied, capacity ÷ 1" or a commonly-cited general-purpose value) **only if a specific default value can itself be sourced**; otherwise ship with no default and require explicit user entry | User-adjustable range, e.g. 1–10 | If a default is shown, it must itself carry a citation (e.g. a named general engineering practice reference) — do not silently pick "4" or "5" without a source, per the brief's explicit anti-fabrication instruction |
| Load type | Required | Select | — | Tension | v1 offers Tension only (see Section 4); Shear disabled/greyed with a "not yet available — pending source verification" note rather than removed from the UI silently, so users understand it's a deliberate gap, not an oversight |

### Calculations

| Calculation | Formula | Variables | Units | Assumptions | Source | Rounding |
|---|---|---|---|---|---|---|
| Tensile stress area (metric) | `At = (π/4) × (d − 0.9382·P)²` | d = nominal (major) diameter, P = pitch | mm → mm² | Standard ISO metric thread geometry; formula converges across every source checked in this audit (Section 8) but requires final primary-source page/section citation before use | ISO 898-1 (via convergent secondary confirmation — RoyMech, EngineersEdge, GetZenQuery, Calculatorian; **primary-standard direct quote still pending**, see Section 8 Source Verification Log) | 3 significant figures for area (mm²) |
| Tensile stress area (UNC/UNF) | Standard external-thread stress-area formula using threads-per-inch (an inch-unit analog of the metric formula) | d = nominal diameter, n = threads per inch | in → in² | Same convergence caveat as above | Same sourcing status as above | 4 significant figures (in²) |
| Fastener tensile capacity (proof-based) | `F_proof = Sp × At` | Sp = proof strength (per grade), At = tensile stress area | MPa·mm² → N (or ksi·in² → lbf) | Static, room-temperature, axially-loaded, new/undamaged fastener, ambient environment — **all stated explicitly as limitations**, not silently assumed | Sp: **UNSOURCED / NOT READY — see Section 8** | 3 significant figures |
| Allowable/design capacity | `F_allow = F_proof ÷ SF` | SF = user-supplied safety factor | Same as above | Divides by a user-supplied, cited-or-explicit factor only — never an undisclosed built-in margin | N/A (arithmetic on already-sourced or user inputs) | 3 significant figures |
| Force-unit conversion | `F(lbf) = F(N) × 0.224809` / inverse | — | N ⇄ lbf | Exact SI conversion constant, not a claim needing an engineering-standard citation | NIST SI conversion definition (exact, non-controversial) | 3 significant figures |
| Equivalent mass presentation | `m(kg) = F(N) ÷ 9.80665` | Standard gravity | N → kg | **Must be labeled "equivalent mass under standard gravity — not a load rating," directly adjacent to the number**, per the brief's explicit warning against presenting kg as a force unit | Standard gravity is an exact defined constant (9.80665 m/s²), not an engineering-standard citation | 3 significant figures |

**Ultimate tensile strength** is proposed as a **secondary, clearly-labeled reference figure only** (not the basis of the primary capacity output), consistent with standard mechanical-design practice (proof strength governs static design capacity; ultimate strength is shown for context and margin-to-failure illustration) — itself equally UNSOURCED/NOT READY pending Section 8.

### Outputs

| Output | Shown by default? | Notes |
|---|---|---|
| Tensile stress area (mm² or in²) | Yes | Intermediate, always shown for transparency (matches BoltLab's "show the work" pattern already used in `tools/tap-drill-calculator.html`'s "Calculation method" section) |
| Fastener tensile capacity at proof strength (N and/or lbf) | Yes | Primary output |
| Allowable/design capacity (after safety factor) | Yes, once a safety factor is entered | Explicitly separate from the proof-based figure above, never merged into one ambiguous number |
| Ultimate-strength-based capacity (reference only) | Yes, visually secondary | Labeled "reference only — not the governing design value" |
| Equivalent mass (kg/lb) | Yes, visually secondary, clearly labeled | Never presented as a force |
| Governing result | **Not applicable in v1** (tension-only; no shear to compare against) — reserved language/UI slot for when shear ships |
| Warnings/limitations | Yes, always visible, not collapsed behind a click | See Section 12 |

**Explicit compliance with the brief's two IMPORTANT instructions**:
1. Mass-equivalent values are never presented as a force unit — always paired with "equivalent mass under standard gravity," in the output design above.
2. The calculator will not imply it determines the capacity of an entire bolted joint — every page and the tool's own UI copy states it computes **fastener capacity only**, not joint capacity (Section 12 makes this a first-class, non-negotiable limitation category).

---

## 6. Proposed Data Architecture

### New dataset: `fastener_property_classes` (working id)

| Field | Type | Units | Source | Status |
|---|---|---|---|---|
| `system` | enum: `iso_metric` \| `sae` | — | Classification only | derived |
| `designation` | string (e.g. "8.8", "Grade 5") | — | ISO 898-1 / SAE J429 | derived (naming only) |
| `applicable_diameter_range_mm` or `_in` | string/range | mm or in | ISO 898-1 / SAE J429 (property values can vary by diameter range within a single nominal grade — **must be captured, not flattened**, per this audit's research finding that some grades have diameter-dependent values) | **pending_verification** |
| `proof_strength` | number | MPa or ksi | ISO 898-1 / SAE J429 | **pending_verification — see Section 8** |
| `ultimate_tensile_strength` | number | MPa or ksi | ISO 898-1 / SAE J429 | **pending_verification — see Section 8** |
| `yield_strength` (optional, if distinctly published) | number | MPa or ksi | ISO 898-1 / SAE J429 | **pending_verification** |
| `material_note` | string | — | Descriptive only (e.g. "medium carbon steel, quenched and tempered") | reference-context |
| `source_standard_id` | string (FK to a new standards record) | — | Links to `iso_898_1` / `sae_j429` standard record | N/A |
| `confidence` | enum matching `dataset.schema.json`'s `status` vocabulary | — | — | Set per-record, not dataset-wide, since different grades may reach different verification maturity independently |

This dataset conforms to `data/schemas/dataset.schema.json` as-is (top-level `verified`, `verification_method`, `primary_sources`, `source_standards`, `last_reviewed`, `license_notes`, `units`, `precision` fields all map directly).

### New standard records (conforming to `data/schemas/standard.schema.json`, following the exact `asme_b1_1` precedent shape)

| id | organization | designation | Status |
|---|---|---|---|
| `iso_898_1` | ISO | ISO 898-1 | To be created once `public_summary`/`scope` text can be written from a directly-read source (not from this audit's search-summarized snippets) |
| `sae_j429` | SAE | SAE J429 | Same |
| `asme_b18_3_1` (if scope requires an ASME cross-reference for inch fastener mechanical properties, distinct from the existing thread-form-only `asme_b1_1`) | ASME | ASME B18.3.1 | To be evaluated in Phase 2 — may be redundant with SAE J429 depending on exact scope overlap |

### New entities (conforming to `data/schemas/entity.schema.json`)

`fastener_property_class`, `tensile_stress_area`, `proof_strength`, `ultimate_tensile_strength`, `design_load`, `safety_factor`, `bolt_load_capacity_calculator` (as a tool entity, mirroring how existing tools are represented in the entity graph, if they are — **to be confirmed in Phase 2**; this audit did not find existing tool entities in `entities.seed.json` and flags this as an open question, not an assumption).

**No existing dataset is duplicated.** Thread geometry (diameter, pitch) is reused from `metric_threads.seed.json`/`unc.seed.json`/`unf.seed.json` by reference, not copied.

---

## 7. Source Requirements

Per-source evaluation, in priority order:

| Source | Type | Applicable to | Status after this audit's investigation |
|---|---|---|---|
| **ISO 898-1** (Mechanical properties of fasteners — Part 1: Bolts, screws and studs) | Primary international standard | Metric property classes, proof/tensile/yield values, tensile-stress-area formula | Identified as the correct primary source; **direct text not obtained** in this session (paywalled/not freely hosted; Wikipedia's own article on it confirms it "defines the mechanical properties" but does not reproduce the tables) |
| **SAE J429** (Mechanical and Material Requirements for Externally Threaded Fasteners) | Primary industry standard | SAE grades 2/5/8 proof/tensile values | Identified as correct primary source; **direct text not obtained** (paywalled) |
| **ASME B18.3.1** | Primary standard, possible alternative/supplement to SAE J429 for inch fasteners | Same domain as SAE J429 | Identified as a candidate; not yet fetched or compared against SAE J429 for scope overlap — Phase 2 task |
| **NASA RP-1228, "Fastener Design Manual" (Barrett, 1990)** | Authoritative secondary/derivative government engineering reference, already precedented in this repo's citation style (NASA-STD-5020A is already cited elsewhere in BoltLab's tapping domain per prior project history) | Material ultimate-tensile-strength ranges by material class (Table I, partially retrieved — see Section 8), shear/tensile area formulas, torque-preload relationships | **Partially retrieved**: confirmed real content structure (Table I materials/UTS-ksi table; Appendix B "ultimate shear and tensile strengths of various threaded fasteners," not yet retrieved) via a readable secondary transcription (engineeringlibrary.org); the direct NASA PDF itself was unreadable via automated text extraction in this session |
| **Shigley's Mechanical Engineering Design** (McGraw-Hill; widely used mechanical-engineering-curriculum textbook, explicitly named in the T31-era project context as a recognized engineering reference) | Recognized secondary engineering reference/textbook | Tables 8-2 (tensile stress area), 8-9 (SAE grades), 8-11 (metric property classes) — exactly the tables this calculator needs | **Located** (a directly-hosted PDF at a `.edu` domain, `eis.hu.edu.jo`) but **not readable via automated extraction** in this session (corrupted text stream) |
| **RoyMech.co.uk** (long-established, widely-used free public mechanical-engineering reference site) | Secondary compiler, explicitly citing ISO 898-1 | Tensile/shear thread-area formulas | **Partially retrieved with direct quotation**: confirmed pitch-diameter formula `dp = D − 0.64952·P` and external-thread shear-area approximation `Ass = 0.5·π·dp·Le`, both directly quoted from the live page in this session; the tensile-stress-area formula itself was shown only as an image on that page and could not be OCR'd |
| **EngineersEdge.com** | Secondary compiler | Thread tensile-area formula (referenced in search results, not yet directly fetched/quoted) | Identified, not yet directly verified |
| **General web search aggregation** (multiple fastener-retailer and calculator-tool sites) | Low-reliability secondary/tertiary | Numeric grade values | **Explicitly rejected as a sourcing basis** — three different snippets for related figures were mutually inconsistent (see Section 8 Source Verification Log); this is documented as a finding, not used as data |
| `guides/bolt-strength-grades.html` (existing BoltLab content) | Internal, unsourced | ISO class round-number MPa figures | **Explicitly rejected as a sourcing basis** — no citation exists for these numbers; reusing them would launder unsourced content into a new, higher-stakes calculator |
| `js/torque-data.js` (existing BoltLab content) | Internal, unsourced | Per-size/grade torque-to-preload figures | **Explicitly rejected as a sourcing basis** for the same reason |

**Governing sourcing rule for Phase 2**: no numeric property-class value proceeds into the dataset until it is confirmed against **at least one directly-read primary or near-primary source** (a properly extracted ISO 898-1, SAE J429, or a cleanly-readable copy of Shigley's/NASA RP-1228 — not a search-engine summary), and ideally cross-verified against a second independent source, mirroring the tapping domain's own "cross_verified" precedent in `data/datasets/metric_tapping.seed.json`.

---

## 8. Formula/Source Matrix

| # | Claim | Type | Source (best identified) | Universal or conditional? | Scope limitations | Calculator-input-ready? |
|---|---|---|---|---|---|---|
| 1 | Tensile stress area formula, metric: `At = (π/4)(d − 0.9382P)²` | Formula | ISO 898-1 (via convergent secondary confirmation — search-engine synthesis citing ISO 898-1, plus RoyMech's page explicitly naming ISO 898 for its adjacent pitch-diameter formula) | Universal for ISO metric threads within the standard's scope | Applies to external (male) threads of standard ISO metric form only | **Formula: yes, pending one final direct-primary-source quote confirmation in Phase 2. Not yet copied into any production code.** |
| 2 | Pitch diameter formula: `dp = D − 0.64952·P` | Formula | RoyMech.co.uk, directly quoted in this session, citing ISO 898 | Universal for ISO metric threads | Same as above | Yes, directly quoted — usable as a supporting/derived value once implemented |
| 3 | External-thread shear area (approximate): `Ass = 0.5·π·dp·Le` | Formula | RoyMech.co.uk, directly quoted in this session | Conditional — explicitly labeled "approximate method" on the source page itself | Requires thread engagement length `Le` as an input (a joint-level variable — reinforces the Section 4 decision to defer shear/engagement to a later release) | Formula usable once shear scope is reopened; not needed for v1 tension-only scope |
| 4 | Force conversion N ⇄ lbf: `1 N = 0.224809 lbf` | Exact defined conversion | NIST/SI definition | Universal, non-controversial | None | Yes, ready now — not an engineering-standard claim, a unit-definition fact |
| 5 | Mass-equivalent: `m = F / 9.80665` | Exact defined conversion | Standard gravity, SI definition | Universal | Must always be labeled as mass-under-standard-gravity, never as a force | Yes, ready now, with the labeling requirement in Section 5 |
| 6 | Proof strength values by ISO property class (4.6 through 12.9) | Numeric table | ISO 898-1 | Conditional (varies by diameter range for some classes, per general engineering knowledge referenced in secondary discussion, not yet confirmed against primary text in this session) | Unconfirmed diameter-range dependency | **UNSOURCED / NOT READY** |
| 7 | Ultimate tensile strength values by ISO property class | Numeric table | ISO 898-1 | Same caveats as #6 | Same | **UNSOURCED / NOT READY** |
| 8 | Proof strength / minimum tensile strength by SAE J429 grade (2, 5, 8) | Numeric table | SAE J429 | Conditional — SAE grades are explicitly diameter-range-dependent (multiple secondary snippets agreed this much, even while disagreeing on exact numbers), so a flattened single-value-per-grade table would be **wrong**, not just imprecise | Must capture per-diameter-range values, not one number per grade | **UNSOURCED / NOT READY** |
| 9 | Material-class ultimate tensile strength ranges (carbon steel, alloy steel, various stainless grades, titanium) | Numeric table | NASA RP-1228 Table I | Directly quoted (via engineeringlibrary.org transcription) in this session | Broad material-class ranges ("up to X ksi"), not grade-specific proof/tensile pairs — useful as general context/comparison content, **not** as the calculator's primary grade-lookup table | Contextual/reference use only, not calculator-input-ready as the primary source |
| 10 | A "commonly used" default safety factor for bolted-joint tension | Numeric convention | Not sourced in this session | Conditional / commonly debated in engineering practice literature | Highly application-dependent (aerospace vs. general machinery vs. structural have different conventional factors) | **UNSOURCED / NOT READY — recommend shipping v1 with NO default, user must enter one explicitly, per the brief's anti-fabrication instruction** |

### Source Verification Log (what was actually attempted in this session)

1. `portlandbolt.com/technical/bolt-grades/` → HTTP 403.
2. `en.wikipedia.org/wiki/ISO_metric_screw_thread` → fetched, no relevant formula/table present.
3. `en.wikipedia.org/wiki/ISO_898` → fetched, confirms standard's scope in prose only, no numeric tables reproduced on the overview page.
4. `engineeringtoolbox.com/metric-bolts-property-classes-d_1211.html` → HTTP 403.
5. `boltdepot.com/.../Bolt-Grade-Chart.aspx` → HTTP 403.
6. NASA RP-1228 direct PDF (`ntrs.nasa.gov/api/citations/19900009424/downloads/19900009424.pdf`, correct URL found via search after an initial wrong-URL 404) → fetched (5.1MB), automated text extraction returned corrupted/unreadable content; local page-image rendering unavailable in this environment (`pdftoppm`/poppler-utils not installed — **not installed during this audit**, consistent with the "do not modify environment/production" discipline; flagged as a Phase 2 tooling prerequisite instead).
7. `engineeringlibrary.org/reference/fastener-design-criteria-nasa` (a readable HTML transcription of parts of the same NASA manual) → fetched successfully twice; yielded a directly-quotable Table I (material UTS ranges) and confirmed the existence-but-absence-from-this-excerpt of Appendix B (shear/tensile strength by fastener type) and a separate "Fastener Torque" chapter.
8. Shigley's *Mechanical Engineering Design*, Chapter 8 PDF at `eis.hu.edu.jo` (found via web search) → fetched, automated text extraction corrupted/unreadable.
9. `studocu.com` Shigley's summary page → fetched, paywalled preview only, no table content.
10. General web search for SAE Grade 2/5/8 proof/tensile values → returned **mutually inconsistent** numbers across snippets (e.g., one snippet's "Grade 8 ≈ ASTM A490, proof 120 ksi / tensile 150 ksi" versus the same result set's separately-implied "Grade 8 → 150 ksi" tag with no proof value) — explicitly **not used** as a data source, exactly per the brief's "do not silently resolve conflicting values" instruction.
11. `engineeringtoolbox.com/metric-threads-d_777.html` (tensile-stress-area formula, second attempt via a different EngineeringToolbox page) → HTTP 403.
12. Targeted search for the tensile-stress-area formula text → returned a consistent `As = (π/4)(d − 0.9382P)²` formula across multiple aggregator summaries citing ISO 898-1, giving reasonable (not primary-source-direct) confidence in the formula specifically, as distinct from the numeric grade tables.
13. `roymech.co.uk/Useful_Tables/Screws/Thread_Calcs.html` → fetched successfully; yielded direct quotations of the pitch-diameter and external-thread shear-area formulas (items #2 and #3 above), citing ISO 898 Part 1.

**This log is included in full because the brief requires the audit to distinguish "formula/value confidently sourced" from "requires Phase 2 verification" with evidence, not assertion.** Every numeric grade value in this document is marked UNSOURCED / NOT READY as a direct consequence of the above.

---

## 9. Content Architecture

```
tools/bolt-load-capacity-calculator.html          [A — Calculator, v1]
reference/fastener-property-classes.html          [B — Core reference, new]
reference/tensile-stress-area.html                [B — Core reference, new; OR fold into the calculator page as a section — see Section 10]
guides/bolt-load-capacity-basics.html             [D — Educational, new]
guides/bolt-strength-grades.html                  [EXISTING — see Section 17, do not silently supersede]
(high-intent pages)                               [C — see Section 10, count TBD, likely 3-5 for v1]
```

Proposed hierarchy rationale: mirrors the existing `tools/` + `reference/` + `guides/` three-way split already used sitewide (e.g. Tap Drill Calculator + Tapping Atlas + Tap Drill Basics guide), rather than inventing a new top-level content type.

---

## 10. High-Intent Page Evaluation

Candidates evaluated: "How Much Weight Can an M6/M8/M10/M12/M16/M20 Bolt Hold?" (one per existing BoltLab size, mirroring the `sizes/` cluster's own M3–M20 range) and equivalent SAE-inch-size pages.

Applying the anti-thin-content test from Section 11 to a **full per-size-per-grade cluster** (would be ~18 metric sizes × up to 7 property classes × 2 load types = **250+ potential pages**): **explicitly rejected**. This is precisely the pattern T26 found HIGH-risk in the existing `/sizes/` cluster and that T28 spent an entire remediation phase partially undoing. Building a new, larger version of the same anti-pattern for a "safety-adjacent" subject (load capacity) would be a materially worse repeat of that mistake, not a new capability.

**Recommended v1 scope**: 3 high-intent pages only, for the sizes with the clearest, highest, most defensible search intent AND full source coverage once Section 8's gap is closed — **M8, M10, M12** (the three sizes already given the most first-party attention elsewhere in BoltLab: they anchor the existing bolt-torque-calculator's default range, the tapping Atlas's covered-diameter set, and general hardware-store search volume). Each page must independently satisfy:

| Test | M8/M10/M12 pages |
|---|---|
| Unique user intent | Yes — "how much weight can an M8 bolt hold" is a real, distinct, high-volume query pattern, genuinely different from "what is an M8 tap drill" |
| Unique engineering question | Partially — the underlying formula is the same for every size; the question is only "unique" in its specific numeric answer, which is the exact anti-thin-content risk the brief warns about |
| Unique data required | Only the size-specific tensile stress area and the (once-sourced) grade table — same underlying dataset as every other size |
| Unique calculation or interpretation | **This is the deciding factor**: a page is justified only if it also explains genuinely size-specific context (e.g., typical use cases at that size, common failure anecdote categories, or a worked example at 2-3 representative grades) beyond a single number — not just a restated formula with a different diameter plugged in |
| Unique explanatory value | Must be authored, not templated — each of the 3 pages should read like a genuinely different article, not a mail-merge, unlike the pre-T28 `sizes/mN-tap-drill.html` pattern |
| Source requirements | Blocked on Section 8 |
| Internal-linking role | Links to the calculator (for other sizes/grades) and to the property-class reference page; the calculator links back to whichever of the 3 pages matches the user's most recent selection |
| Independent indexing justification | Only defensible at 3 pages with real per-page authored content; **not** defensible at 18+ pages of templated content |

**Recommendation: do not build the other 15 metric sizes or any inch-size equivalents as standalone pages in v1.** If demand is later demonstrated (e.g., via search console data BoltLab does not yet have access to describe in this audit), expand deliberately, one evidenced size at a time — never as a batch script.

---

## 11. Programmatic-Content Anti-Thin-Content Assessment

Applying the brief's required per-family test to every candidate page family:

| Family | Unique intent | Unique data | Unique interpretation | Verdict |
|---|---|---|---|---|
| Full per-size-per-grade "how much weight" cluster (250+ pages) | Weak (intent differs only by substituted numeral) | No (same formula, same dataset, only inputs change) | No (would require either heavy authored effort ×250, defeating the "programmatic" premise, or templated filler, repeating the exact T26 pattern) | **REJECTED — do not build** |
| 3 curated high-intent pages (M8/M10/M12) | Yes, if genuinely authored per page | Partially (shared formula, size-specific inputs) | Yes, **if and only if** each page adds real size-specific explanatory content beyond the number | **CONDITIONALLY APPROVED**, contingent on Section 8 sourcing and genuine per-page authorship discipline in Phase 2 |
| Single calculator page (all sizes/grades via form inputs) | Yes — one tool serving the general capability | Yes — the whole dataset, appropriately | Yes — this is the natural, non-thin home for the general capability | **APPROVED** |
| Single property-class reference page (table format, all grades) | Yes | Yes | Yes | **APPROVED** |
| Single tensile-stress-area reference/explainer | Yes, if genuinely distinct from the calculator's own inline explanation | Yes | Yes, if it goes beyond restating the calculator | **CONDITIONALLY APPROVED** — evaluate in Phase 2 whether this deserves its own URL or should be a section of the calculator/property-class page (avoid manufacturing a fourth page that could be one paragraph on an existing page) |
| Educational guide ("Bolt Load Capacity Basics") | Yes | N/A (explanatory, not data-driven) | Yes, if genuinely written, not a rehash of the calculator's inline copy | **APPROVED**, with the same discipline requirement |

This assessment directly implements the brief's instruction: "This initiative must NOT become a large set of pages that differ only by diameter, grade, or a single numeric result." The 250+ page cluster option is explicitly rejected here, in Phase 1, before any generator or template is built — the correct point to make this decision, per the T26/T28 lesson already learned once in this project.

---

## 12. Safety/Limitations Architecture

| Limitation category | First release (must be shown) | Later reference content only | Rationale |
|---|---|---|---|
| Fastener capacity vs. joint capacity | **Yes — first-class, prominent** | — | The single most important limitation; the brief explicitly requires this not be implied away |
| Thread engagement | Yes — stated as "not modeled, assumed adequate; verify separately" | Full engagement calculation, deferred (Section 4) | Matches tapping domain's own "not currently available" honesty precedent |
| Connected-material strength | Yes — stated as "not modeled; the calculator computes bolt strength only" | Full joint-material dataset, deferred | Same pattern |
| Preload | Yes — brief mention, links to existing (unsourced, flagged) torque calculator with its own caveat | Full preload-integration, deferred | Avoids implying integration that doesn't exist |
| Bearing, tear-out, pull-through, prying, eccentricity | Yes — named explicitly as "not covered by this calculator" in a single limitations list | Full per-mode explainer content, deferred to a possible future Joint Capacity initiative | Naming them (without calculating them) sets correct user expectations at low cost |
| Combined loading (tension + shear together) | Yes — stated as out of scope for v1 (tension-only) | Combined-loading interaction formula, deferred with shear itself | — |
| Fatigue/cyclic loading | Yes — brief mention that static capacity ≠ fatigue life | Full S-N-curve-based content, deferred (large sourcing project) | — |
| Corrosion/environment | Yes — brief qualitative mention | — | Qualitative only, no dataset implied |
| Installation quality, material condition, manufacturing tolerances | Yes — brief qualitative mention, links to `disclaimer/index.html` | — | Reuses existing disclaimer rather than inventing new liability language |

All limitations link to the existing `reference/data-methodology.html` and `disclaimer/index.html` rather than duplicating their language, consistent with Section 3's reuse plan.

---

## 13. SEO/AEO Architecture

**Entity structure (conceptual only — not implemented this phase):**

- `bolt_load_capacity_calculator` (tool entity) → related to → `fastener_property_class`, `tensile_stress_area`, `proof_strength`, `design_load`, `safety_factor`
- `fastener_property_class` → related to → `iso_898_1` / `sae_j429` (standard entities), `tensile_stress_area`
- `tensile_stress_area` → related to → existing thread-geometry entities (nominal diameter, pitch) already in `entities.seed.json` if such entities exist (**to be confirmed in Phase 2** — this audit found thread-geometry data in datasets but did not confirm corresponding entity-graph nodes exist for "nominal diameter" as a standalone entity)
- `tension_capacity` / `shear_capacity` (the latter deferred) → related to → `bolt_load_capacity_calculator`

**Content minimums for each high-intent page** (to avoid the "number-generation page" failure mode named explicitly in the brief): a genuine "Quick answer" block (matching the established pattern), a worked example at 2–3 property classes, an explanation of what tensile stress area means at that specific size, an explicit fastener-vs-joint limitation statement, and links to the calculator, the property-class reference, and at least one genuinely related existing BoltLab page (e.g. the corresponding `sizes/mN-bolt-size.html` hub, once that page's own content is confirmed non-conflicting).

**No schema (JSON-LD) is proposed for implementation in this phase**, per the brief's explicit instruction. **No FAQPage schema is proposed** for the new pages, also per instruction — this is consistent with the T26 finding that templated FAQ-schema-at-scale was itself a weak risk factor; the new initiative should not reintroduce that pattern from day one.

---

## 14. Internal-Link Architecture

Proposed (not implemented):

- Calculator ↔ property-class reference page (bidirectional)
- Calculator ↔ each of the 3 high-intent pages (bidirectional, size-specific)
- High-intent pages ↔ corresponding existing `sizes/mN-bolt-size.html` hub (one-directional from the new page initially; adding a reverse link from the existing, protected `sizes/` pages is **out of scope for this phase** and would require a separate, explicitly authorized change to those files)
- Calculator/reference pages → `reference/data-methodology.html` and `disclaimer/index.html` (limitations)
- Calculator/reference pages → existing `tools/bolt-torque-calculator.html` (adjacent capability, with the caveat from Section 17 about that tool's own unsourced data)
- New guide page → calculator and property-class reference

This mirrors the existing tapping-domain cross-link mesh pattern (Atlas ↔ Guide ↔ Evidence ↔ Workflow ↔ Calculator) rather than inventing a new linking philosophy.

---

## 15. Validation/QA Requirements

Following the `validate-tapping-projections.js` 20-check precedent, a new `validate-fastener-strength.js` should cover, at minimum:

| Check category | Example PASS/FAIL criterion |
|---|---|
| Formula unit-consistency | FAIL if `At` formula is applied with mismatched mm/in inputs without conversion |
| Known-value regression | PASS only if a specific, hand-verified (against the eventual primary source) example calculation (e.g., a specific M10 8.8 bolt's tensile capacity) matches the calculator's output to the stated rounding precision, every run |
| Boundary cases | FAIL if the calculator produces a non-error result for load ≤ 0, safety factor ≤ 0, or an unrecognized designation/grade pair |
| Invalid-input handling | FAIL if any input combination produces `NaN`, `Infinity`, or a silently-wrong unit label in the output |
| Property-class/grade mapping | FAIL if any grade in the UI dropdown lacks a corresponding sourced dataset record (i.e., the UI must never offer a selection with no backing data) |
| Source/provenance check | FAIL if any dataset record has a numeric value with `status: pending_verification` or `unavailable` exposed in a live calculation without a visible on-page caveat |
| Dimensional consistency | FAIL if mixing metric and inch inputs in one calculation without explicit, correct conversion |
| Schema check | FAIL if the new dataset does not validate against `data/schemas/dataset.schema.json` |
| Canonical check | FAIL if any new page lacks a self-referencing canonical, consistent with sitewide convention |
| Sitemap check | FAIL if a new page is omitted from the sitemap while indexable, or included while intentionally noindexed (mirroring the T27/T28 `is_noindex()` precedent in `scripts/build_sitemap.py`) |
| Internal-link check | FAIL if any proposed internal link (Section 14) resolves to a non-existent page |
| Deterministic-build check | FAIL if regenerating the projection/pages twice produces any difference beyond an explicitly-allowed timestamp field (mirroring the T28 three-consecutive-run precedent) |
| Regression against protected surfaces | FAIL if any existing tapping/standards/size-cluster file changes as a side effect of building this new capability |

**PASS gate for Phase 2 authorization to proceed to Phase 3 (actual publication)**: every numeric value in the shipped dataset must carry `status: verified` or `status: source_bound` (not `pending_verification` or `unavailable`) for every grade actually exposed in the live calculator's UI. A grade with an unresolved sourcing gap must be excluded from the UI, not shipped with a caveat — matching the brief's "If an engineering value cannot be confidently sourced, mark it as UNSOURCED/NOT READY rather than filling the gap" instruction applied at the product-decision level, not just the documentation level.

---

## 16. Deferred Functionality

- Shear loading and combined tension+shear (Section 4)
- Thread engagement / connected-material / bearing / tear-out / pull-through / prying / eccentricity / fatigue (Section 4)
- Full joint-capacity calculator (explicitly a separate potential future initiative, not this one)
- Preload/torque integration beyond a simple cross-link
- Spanish (`es/`) localization of any new page
- Any size/grade beyond the initially-sourced set
- Any page family beyond the 3 curated high-intent pages
- Schema/JSON-LD implementation (explicitly deferred per this phase's own instructions, to be designed in a later phase once content is stable)

---

## 17. Risks and Unresolved Questions

1. **Primary numeric sourcing gap (Section 8) is the dominant risk.** Until resolved, no calculator can honestly ship. This is not a "nice to have" fix — it is the load-bearing (no pun intended) requirement of the entire initiative.
2. **SAE grade values are diameter-range-dependent**, not flat per-grade constants — several secondary sources agreed on this structural fact even while disagreeing on exact numbers. The dataset schema (Section 6) already accounts for this, but Phase 2 must confirm the exact breakpoints from a primary source.
3. **Existing unsourced content conflict**: `guides/bolt-strength-grades.html` and `js/torque-data.js` already publish numbers on this exact subject with no citation. Shipping a rigorously-sourced calculator alongside an unsourced guide on the same topic creates an internal credibility inconsistency BoltLab has not resolved. **This is not a decision this audit makes unilaterally** — it is flagged here as a Director-level question: should `guides/bolt-strength-grades.html` be independently re-sourced/reconciled as a follow-on action once the new dataset exists, left alone as clearly-separated general content, or something else? No production file was touched to investigate or resolve this during this audit.
4. **PDF/primary-document tooling gap**: this environment lacks `poppler-utils` (`pdftoppm`), which blocked direct visual/OCR reading of two located primary-adjacent PDFs (NASA RP-1228, Shigley's Ch. 8). Phase 2 should either install this tooling (a reasonable, low-risk environment change, distinct from a "production file" change) or obtain the source material in an already-text-extractable form (e.g., purchasing/accessing the actual ISO 898-1 / SAE J429 standard documents directly, which is the more correct sourcing path regardless of PDF tooling).
5. **Entity-graph coverage unconfirmed**: this audit did not exhaustively confirm whether `data/entities/entities.seed.json` already contains entities for concepts like "nominal diameter" that the new fastener entities would need to relate to. Flagged, not resolved.
6. **Ad/monetization posture for new pages**: not decided in this phase (explicitly out of scope — "do not add advertising"), but Phase 2 will need an explicit decision (matching sitewide convention of inert ad-container markup, or omitting it entirely for this safety-adjacent content) rather than defaulting silently.
7. **ASME B18.3.1 vs. SAE J429 scope overlap** is unresolved (Section 7) — Phase 2 must determine whether both are needed or one supersedes the other for BoltLab's purposes.

---

## 18. Exact Phase 2 Implementation Prerequisites

Phase 2 (still design/sourcing, not production implementation) may not begin production work until:

1. At least one of ISO 898-1 or SAE J429 has been **directly read** (not search-summarized) — via purchased/accessed standard text, a cleanly-extracted copy of Shigley's Ch. 8, a cleanly-extracted copy of NASA RP-1228 Appendix B, or equivalent — and the exact proof-strength and minimum-tensile-strength values for at least the ISO classes 8.8/10.9/12.9 and SAE grades 5/8 have been transcribed with a verifiable citation (document name, edition/year, table/page number).
2. The diameter-range dependency for SAE grades has been confirmed and its exact breakpoints captured.
3. A decision has been made and documented on the `guides/bolt-strength-grades.html` / `js/torque-data.js` reconciliation question (Risk #3), even if the decision is explicitly "leave as separate, lower-rigor legacy content for now."
4. The `data/entities/entities.seed.json` question (Risk #5) has been checked.
5. A specific default-safety-factor decision has been made: either a sourced default value with citation, or confirmed "no default, user must enter one."
6. The new dataset file, standard records, and entity records have been drafted (not yet committed) and pass `data/schemas/*.schema.json` validation.
7. A decision on the ASME B18.3.1 question (Risk #7) has been made.

Only once all seven are satisfied should a Phase 2 "Sourcing & Dataset Construction" implementation phase (still not the public calculator itself) be authorized by the Director.

---

## 19. Explicit Items NOT Approved for Implementation

- The full per-size-per-grade "how much weight can an MN bolt hold" programmatic page cluster (Section 10/11) — explicitly rejected, not merely deferred.
- Any shear-loading calculation or output.
- Any joint-level failure-mode calculation (bearing, tear-out, pull-through, prying, eccentricity, thread stripping, fatigue).
- Any numeric property-class value not yet confirmed per Section 8/18.
- A default safety factor without a citable source.
- FAQPage or any other new JSON-LD schema.
- Any modification to `guides/bolt-strength-grades.html`, `js/torque-data.js`, `tools/bolt-torque-calculator.html`, or any other existing production file.
- Any modification to `sitemap.xml`, `robots.txt`, `ads.txt`, canonical/hreflang logic, or navigation.
- Spanish localization of any new content.
- Any commit, push, or deployment of this phase's work.

---

## Governance

Nothing in this phase was committed or pushed. `git status`/`git diff --stat` show exactly two new files under `audit/fastener-load-strength/`, plus the same pre-existing untracked files this repository has carried since before T13. No production HTML, JavaScript, CSS, dataset, generator, validator, schema, sitemap, robots.txt, ads.txt, canonical/hreflang logic, navigation, or legal page was created, modified, or deleted.
