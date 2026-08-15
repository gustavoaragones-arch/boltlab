# Thread Engagement — Mathematical Model (T2.2)

Date: 2026-08-15

## 1. Two distinct concepts, often conflated

Research for this phase surfaced an important distinction that BoltLab's data must keep separate: "thread engagement" commonly refers to two **different** engineering quantities, and casual sources frequently blur them.

| Concept | What it measures | Governed by |
|---|---|---|
| **Radial (cross-sectional) engagement percentage** | How much of the theoretical full ("sharp-V") thread height is actually cut into the material, as a function of tap-drill diameter | Tap-drill selection (a manufacturing/tooling decision) |
| **Axial engagement length** | How many diameters, pitches, or threads of *length* the mating fastener/thread engage | Fastener length / tapped-hole depth selection (a joint-design decision) |

These answer different questions ("how deep is each thread cut?" vs. "how much thread length is in contact?") and are controlled by different design decisions. A specification that gets one right says nothing about the other.

## 2. Radial engagement percentage — the mathematical model

### 2.1 Theoretical basis: the sharp-V thread and its truncation

Both the Unified (inch) and ISO metric 60° thread forms start from a theoretical "sharp-V" thread of height H:

- **Metric (ISO 68-1 basis):** H = (√3⁄2) × P ≈ 0.8660 × P
- **Inch/Unified:** an equivalent constant of 0.6495/TPI is commonly used in engagement-percentage calculators (TPI = 1/P in inches); this figure was found consistently across secondary machining references but was **not independently cross-checked against ASME B1.1's own text in this phase** (that standard's table content was not obtainable — see `audit/t2-1a-unc-unf-coverage.json`'s note on 403 access failures).

The real (non-ideal) thread form truncates this sharp-V at both ends — crest and root are flattened, not pointed — because a perfectly sharp crest/root is both fragile and unmanufacturable. The commonly-cited truncation is H/8 at the crest and H/4 at the root, leaving an effective engageable thread depth of **5H/8** (≈ 0.541 × P for metric). This means **100% engagement is a theoretical reference point, not a physically achievable state** with standard thread forms — a fact independent of any specific tap-drill recommendation.

### 2.2 The engagement-percentage formula

```
% engagement = (D_major − D_drill) / (1.29904 × P) × 100        [metric, P in mm]
% engagement = ((D_major − D_drill) × TPI / 0.013) × 100         [inch, decimal-inch form]
```

Both forms were verified in T2 as internally consistent and are widely and independently reproduced (Machinery's Handbook is the most commonly cited origin). **This formula is pure geometry — it computes what percentage a *given* drill diameter will produce. It does not, by itself, recommend any particular target percentage.** It is recorded as a `derived_candidate` (T2, extended below), never as a verified target value.

### 2.3 Is 75% a value BoltLab can assert as a standard or recommendation?

**No — not as a single universal figure, and not as a BoltLab-verified requirement.** Findings from this phase:

- Multiple secondary/tertiary machining sources independently describe ~70–77% as a common general-purpose *convention*, with varying and sometimes inconsistent justifications across sources (cited figures for the resulting strength/torque/tool-life tradeoff varied by source and were not consistent with each other in exact numbers).
- **No Tier 1 primary standard text was obtained in this phase that mandates 75% as a required value.** ASME B94.9 (the standard most plausibly containing an authoritative figure, since commercial charts often attribute "75% tables" to it) could not be accessed — its ANSI preview page returned HTTP 403, unlike ISO 2306's preview which succeeded in T2.1.
- **NASA-STD-5020A** (a genuine, freely-available primary source, full text obtained and read in this phase — see Section 3) does **not** use a fixed engagement-percentage target at all for thread stripping avoidance. Instead it specifies a **strength-based design principle**: engagement should be selected so the fastener fails in tension before the internal threads strip, calculated from material shear strengths and thread shear area (NASA-STD-5020A §4.7.4, Eq. 12–13) — a more rigorous, material-specific approach than any fixed percentage.
- A "75 percent" figure does appear in NASA-STD-5020A (page 62 of the PDF) — but it refers to **bolt preload as a percentage of ultimate tensile strength**, an entirely unrelated concept to thread-engagement percentage. This was checked explicitly to avoid a false-positive conflation; **it does not corroborate the tap-drill "75%" convention** and must not be cited as if it does.

**Conclusion: BoltLab can safely present the engagement-percentage *formula* (as a calculation tool, given a drill diameter) and can safely state that ~70–77% is a widely-repeated general-purpose convention in commercial/trade literature — but cannot assert 75% (or any single percentage) as a BoltLab-verified engineering requirement or as "the" correct target.** Any future BoltLab-facing content must present it as a convention with cited variability, not a standard.

## 3. Axial engagement length — NASA-STD-5020A findings

Full text of NASA-STD-5020A ("NASA Fastener Standards," public release, freely available at nasa.gov) was obtained and read directly (not a secondary characterization). Relevant findings, with section citations:

- **§4.7.4 [TFSR 23], "Fastener Length Selection for Thread Engagement":** for fasteners used with a nut/nut-plate/insert, engagement length should extend "at least twice the thread pitch, p" past the outboard end, to fully clear incomplete runout threads. For fasteners threaded directly into a tapped part (not a nut/insert), the standard specifies: *"thread engagement... should be selected to ensure the minimum number of engaged complete threads such that the fastener would fail in tension before threads would strip."* This is a **strength-based principle, not a fixed multiplier** — the actual required length depends on the relative shear strengths of the bolt and the tapped-hole material.
- **§4.7.5 [TFSR 25]:** "Fasteners threaded into blind holes shall be selected to prevent contacting the bottom of the hole or interfering with incomplete internal threads... Where blind holes are tapped, incomplete internal threads are present at the bottom of the hole." This is a **direct primary-source confirmation** of the physical reality underlying why bottoming taps exist as a distinct tool category (Section 4 below) — NASA does not discuss tap types, but confirms the underlying geometric fact.
- **Eq. 12–13:** the allowable ultimate shear load for a fastener, when threads are in the shear plane, is `P = Fsu × Am`, where Fsu is the material's allowable ultimate shear strength and Am is the thread shear area (a function of engagement length, pitch diameter, and thread form) — consistent with a strength-based, not percentage-based, engagement design approach.
- Secondary characterizations found elsewhere (not independently re-derived from NASA's own text in this phase) cite a **"three-thread rule"** (at least 3 full threads should protrude past the nut after tightening) attributed to NASA-STD-5020, MIL-STD-1312-9, and Boeing BAC5009 — this specific phrase/rule was **not found verbatim** in the pages of NASA-STD-5020A read in this phase and is recorded here as an externally-corroborated but not internally-confirmed claim.

**Conclusion: axial engagement length has an authoritative, freely-accessible primary source (NASA-STD-5020A), and its governing principle is explicitly strength-based rather than a fixed rule of thumb.** This is a stronger foundation than the radial-percentage side of the model, where no Tier 1 source with a specific target was obtained.

## 4. What BoltLab can safely calculate today

| Capability | Status |
|---|---|
| Compute radial engagement % for a given (major diameter, drill diameter, pitch/TPI) | **Safe** — pure geometry, formula independently verified |
| State the theoretical maximum (100%) and its truncated/practical ceiling (~54% of pitch, 5H/8 of thread height) | **Safe** — geometric fact, independently derivable for both metric and inch forms |
| Recommend a specific target engagement percentage (e.g., "use 75%") | **Not safe** as a BoltLab-verified requirement — no Tier 1 source obtained; may be presented only as a labeled, sourced convention with explicit variability |
| Compute a minimum axial engagement length from material shear strengths | **Conceptually safe** (NASA-STD-5020A gives the governing equations) but **not yet implemented** — BoltLab does not currently hold shear-strength data for tapped-hole materials, so this calculation is not yet possible from existing knowledge-layer data |
| State a fixed axial engagement length (e.g., "1× diameter") as a universal rule | **Not safe** — NASA's own approach is explicitly strength-based, not a fixed multiplier; secondary sources' "1.5–2× diameter for aluminum" figures are convention-level, not independently re-derived from NASA's primary text in this phase |

No `target_engagement_percent` field was populated on any tapping_profile record. No new numeric value was written as "verified" for engagement percentage or engagement length.
