# T2.2 — Thread Engagement & Tap-Type Verification

Date: 2026-08-15
Status: **PASS WITH GAPS**

## Part 1: Thread Engagement

### Two concepts that must not be conflated

Research surfaced a distinction that matters more than any single number: "thread engagement" means two different things depending on context — **radial (cross-sectional) engagement percentage** (how deep each thread is cut, driven by tap-drill selection) and **axial engagement length** (how much thread length is in contact, driven by fastener/hole-depth selection). Full model, formulas, and reasoning: `docs/architecture/thread-engagement-model.md`.

### Radial percentage: the formula is solid, the "75%" target is not

The engagement-percentage formula (`% = (D_major − D_drill) / (1.29904 × P) × 100`) was already verified in T2 as internally consistent and widely reproduced. It is pure geometry — it tells you what percentage a *given* drill produces, and asserts nothing about what percentage you *should* target.

**Direct answer to your question — should 75% ever appear as a recommendation?** Not as a BoltLab-verified standard. No Tier 1 source was obtainable this phase (ASME B94.9's ANSI preview returned HTTP 403, unlike ISO 2306's in T2.1). Secondary sources cite 70–77% consistently as a *convention*, but with mutually inconsistent stated justifications (different sources give different numbers for the strength/torque/tool-life tradeoff). If BoltLab ever surfaces 75% to a user, it must be labeled as a widely-repeated industry convention with variability, never as a verified requirement.

**A conflation caught and rejected:** while reading NASA-STD-5020A cover to cover, a "75 percent" reference did turn up (page 62) — but it's about **bolt preload as a percentage of ultimate tensile strength**, a completely different engineering quantity from thread-engagement percentage. It was checked explicitly and excluded. This is worth flagging because it's exactly the kind of false-positive corroboration that would have been easy to wave through if I'd only pattern-matched on the string "75 percent" instead of reading the surrounding context.

### Axial length: a genuine primary source, and it's not a fixed number either

NASA-STD-5020A ("NASA Fastener Standards") is freely published — I fetched the full 114-page PDF directly from nasa.gov and extracted its actual text (not a secondary summary). Key findings, both with section citations:

- **§4.7.4 [TFSR 23]:** engagement length for a fastener threaded directly into a part should be selected so the fastener **fails in tension before the threads strip** — a strength-based design principle, not a fixed diameter-multiple or percentage. NASA gives the shear-load equations (`P = Fsu × Am`) rather than a number to plug in.
- **§4.7.5 [TFSR 25]:** confirms directly — *"Where blind holes are tapped, incomplete internal threads are present at the bottom of the hole."* This is a Tier 1 primary-source confirmation of the exact physical reality that makes bottoming taps necessary as a distinct tool category (see Part 2).
- The commonly-cited "three-thread rule" (attributed elsewhere to NASA-STD-5020/MIL-STD-1312-9/BAC5009) was **not found verbatim** on the pages read here — it's recorded as externally-corroborated, not internally-confirmed by this phase's own reading.

### What BoltLab can safely calculate today

| Capability | Verdict |
|---|---|
| Radial engagement % from a chosen drill diameter | Safe — pure geometry |
| Theoretical/truncated engagement ceiling | Safe — geometric fact |
| A recommended target engagement % | Not safe to assert as verified |
| A minimum axial engagement length | Formula known (NASA), but BoltLab has no shear-strength material data yet to apply it |

**Zero `thread_engagement` field blocks were populated on any of the 29 tapping_profile records.** The model is documented independently in `docs/architecture/thread-engagement-model.md`; each tapping dataset's `verification_method` now points to it.

## Part 2: Tap-Type Application Knowledge

Added a new optional `application_notes` field (`entity.schema.json`, additive) and populated 16 classified, sourced facts across all 7 `tap_type` entities — each tagged `general_taxonomy` / `manufacturing_characteristic` / `typical_application` / `manufacturer_specific_recommendation`, per your A/B/C/D framework from the original T2 brief.

| Entity | Facts added | Highlights |
|---|---|---|
| `taper_tap` | 2 | ~7–10 thread chamfer; can't finish threads within ~7–10 pitches of a blind-hole bottom |
| `plug_tap` | 2 | ~3–5 thread chamfer; general-purpose, starts in unthreaded holes |
| `bottoming_tap` | 3 | ~1–2 thread chamfer; **one fact promoted to VERIFIED** — see below |
| `spiral_point_tap` | 2 | Pushes chips forward; through-holes only, blind-hole use risks tap breakage |
| `spiral_flute_tap` | 2 | Pulls chips backward; suited to blind holes |
| `forming_tap` | 4 | Ductility requirement (~8% elongation, ~Rc30 max — classified D, manufacturer-sourced); unsuitable for brittle materials; larger pre-tap hole; chip-evacuation is not the limiting factor for this tap type (ductility is) |
| `hand_tap` | 1 | Manual operation; typically supplied as a taper/plug/bottoming set |

**One fact reached VERIFIED status** — bottoming_tap's "incomplete internal threads are inherently present at the bottom of a tapped blind hole" is sourced directly to NASA-STD-5020A §4.7.5, a Tier 1 primary source, not to chart agreement. Every other fact is `source_bound` (Tier 3, cross-corroborated across multiple independent machining/manufacturer references, but not checked against a primary standard).

**No existing entity definition was altered.** T1's original definitions were already confirmed accurate in T2 against ASME B94.9's named tap styles; this phase only *adds* structured, classified, sourced application knowledge alongside them.

## No value promoted on chart agreement alone

Every `source_bound` classification above stayed source_bound specifically because it rested on multiple independent Tier 3 sources, not a primary standard — consistent with the rule holding even when convergence across sources was strong.

## Validator Results

| Validator | Status | Errors | Warnings |
|---|---|---|---|
| `validate-knowledge-engine.js` | pass | 0 | 0 |
| `validate-tapping-domain.js` | pass | 0 | 5 (informational, unchanged in kind) |

## Production Files Modified

**0.**

## Final Status

**PASS WITH GAPS.** The thread-engagement model is now fully documented with an honest verdict on 75% (a labeled convention, not a standard) and a genuine primary source (NASA-STD-5020A) for the axial-length side of the picture. Tap-type application knowledge gained 16 classified, sourced facts, one of which reached primary-source VERIFIED status. The remaining gap — BoltLab still cannot calculate a minimum axial engagement length because it lacks material shear-strength data — is named, not hidden. See `audit/t2-2-change-scope.md`. Nothing was committed or pushed.
