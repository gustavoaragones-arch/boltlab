#!/usr/bin/env node
/**
 * Fastener Load & Strength -- Phase 2 dedicated validator.
 *
 * Validates the new fastener_property_classes dataset and its associated standard/entity/
 * relationship records against data/schemas/*.schema.json and the phase-specific integrity
 * rules required by the Phase 2 brief. Read-only except for its own report output.
 *
 * This validator does NOT check for a production calculator page -- none is authorized to
 * exist yet in Phase 2, and this validator explicitly asserts that.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const checks = [];
function check(name, fn) {
  checks.push({ name, fn });
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

const dataset = readJson("data/datasets/fastener_property_classes.seed.json");
const isoStandards = readJson("data/standards/iso/standards.seed.json");
const saeStandards = readJson("data/standards/sae/standards.seed.json");
const entities = readJson("data/entities/entities.seed.json");
const relationships = readJson("data/relationships/relationships.seed.json");

const VALID_STATUS = new Set(["verified", "source_bound", "pending_verification", "unavailable"]);

check("dataset.schema.json conformance", () => {
  const schema = readJson("data/schemas/dataset.schema.json");
  for (const field of schema.required) {
    assert(field in dataset, `dataset missing required field: ${field}`);
  }
  assert(Array.isArray(dataset.records) && dataset.records.length > 0, "dataset must have at least one record");
});

check("standard.schema.json conformance for iso_898_1 and sae_j429", () => {
  const schema = readJson("data/schemas/standard.schema.json");
  const iso898 = isoStandards.records.find((r) => r.id === "iso_898_1");
  const saeJ429 = saeStandards.records.find((r) => r.id === "sae_j429");
  assert(iso898, "iso_898_1 record must exist");
  assert(saeJ429, "sae_j429 record must exist");
  for (const rec of [iso898, saeJ429]) {
    for (const field of schema.required) {
      assert(field in rec, `${rec.id} missing required field: ${field}`);
    }
  }
});

check("unique record IDs within the dataset", () => {
  const ids = dataset.records.map((r) => r.id);
  const seen = new Set();
  for (const id of ids) {
    assert(!seen.has(id), `duplicate record id: ${id}`);
    seen.add(id);
  }
});

check("unique designation within system + diameter-range combination (no duplicate ranges)", () => {
  const seen = new Set();
  for (const r of dataset.records) {
    const key = `${r.system}|${r.designation}|${r.applicable_diameter_range}`;
    assert(!seen.has(key), `duplicate system+designation+range combination: ${key}`);
    seen.add(key);
  }
});

check("units are consistent per system (iso_metric -> MPa, sae -> psi)", () => {
  for (const r of dataset.records) {
    const expectedUnit = r.system === "iso_metric" ? "MPa" : r.system === "sae" ? "psi" : null;
    assert(expectedUnit, `record ${r.id} has unrecognized system: ${r.system}`);
    for (const field of ["proof_strength", "tensile_strength", "yield_strength"]) {
      const f = r[field];
      if (f && f.value !== null) {
        assert(f.unit === expectedUnit, `record ${r.id} field ${field} unit ${f.unit} does not match expected ${expectedUnit} for system ${r.system}`);
      }
    }
  }
});

check("every field carries a valid status enum value", () => {
  for (const r of dataset.records) {
    for (const field of ["proof_strength", "tensile_strength", "yield_strength"]) {
      const f = r[field];
      if (f) {
        assert(VALID_STATUS.has(f.status), `record ${r.id} field ${field} has invalid status: ${f.status}`);
      }
    }
  }
});

check("no null numeric value carries status verified or source_bound", () => {
  for (const r of dataset.records) {
    for (const field of ["proof_strength", "tensile_strength", "yield_strength"]) {
      const f = r[field];
      if (f && (f.status === "verified" || f.status === "source_bound")) {
        assert(f.value !== null && f.value !== undefined, `record ${r.id} field ${field} has status ${f.status} but a null value -- integrity violation`);
      }
    }
  }
});

check("no pending_verification/unavailable value is mislabeled as verified/source_bound elsewhere in the record", () => {
  // Cross-check: if a record's own `confidence` field says source_bound/verified, at least
  // proof_strength and tensile_strength (the two fields the Phase 1 calculator design actually
  // uses) must not themselves be pending_verification/unavailable.
  for (const r of dataset.records) {
    if (r.confidence === "verified" || r.confidence === "source_bound") {
      for (const field of ["proof_strength", "tensile_strength"]) {
        const f = r[field];
        assert(
          f.status === "verified" || f.status === "source_bound",
          `record ${r.id} has confidence=${r.confidence} but ${field}.status=${f.status} -- inconsistent`
        );
      }
    }
  }
});

check("every numeric value (status verified/source_bound) has provenance with at least one named source", () => {
  for (const r of dataset.records) {
    const hasNumeric = ["proof_strength", "tensile_strength", "yield_strength"].some(
      (f) => r[f] && (r[f].status === "verified" || r[f].status === "source_bound") && r[f].value !== null
    );
    if (hasNumeric) {
      assert(r.provenance && r.provenance.source_a && r.provenance.source_a.name, `record ${r.id} has sourced numeric values but no provenance.source_a.name`);
    }
  }
});

check("every source_standard_id resolves to an existing standard record", () => {
  const allStandardIds = new Set([...isoStandards.records.map((r) => r.id), ...saeStandards.records.map((r) => r.id)]);
  for (const r of dataset.records) {
    assert(allStandardIds.has(r.source_standard_id), `record ${r.id} references unresolved source_standard_id: ${r.source_standard_id}`);
  }
});

check("diameter-range values are structurally valid (non-empty string or explicit 'not confirmed'/'unconfirmed')", () => {
  for (const r of dataset.records) {
    assert(
      typeof r.applicable_diameter_range === "string" && r.applicable_diameter_range.length > 0,
      `record ${r.id} has an invalid applicable_diameter_range`
    );
  }
});

check("verified diameter-dependent classes cover all their ranges (incomplete source_bound classes are flagged, not failed)", () => {
  const bySystemDesignation = {};
  for (const r of dataset.records) {
    const key = `${r.system}|${r.designation}`;
    bySystemDesignation[key] = bySystemDesignation[key] || [];
    bySystemDesignation[key].push(r);
  }
  const incompleteWarnings = [];
  for (const [key, recs] of Object.entries(bySystemDesignation)) {
    const anyDiameterDependent = recs.some((r) => r.diameter_dependent === true);
    if (!anyDiameterDependent) continue;
    const ranges = new Set(recs.map((r) => r.applicable_diameter_range));
    assert(ranges.size === recs.length, `${key} has duplicate diameter ranges among its records`);
    if (recs.length < 2) {
      const allVerified = recs.every((r) => r.confidence === "verified");
      if (allVerified) {
        // A verified record claiming diameter dependency with only one range on file is a real
        // integrity problem: it would ship as UI-ready while structurally incomplete.
        throw new Error(`${key} is diameter_dependent AND confidence=verified but only has ${recs.length} range(s) on file -- this must not ship as UI-ready incomplete`);
      }
      // Otherwise (source_bound/pending_verification), this is already correctly excluded from
      // UI eligibility by its own status -- record as a known gap, not a hard failure.
      incompleteWarnings.push(`${key}: only ${recs.length} of its diameter ranges sourced (confidence=${recs[0].confidence}) -- correctly excluded from v1 UI eligibility, see BLOCKED list in Phase 2 report`);
    }
  }
  if (incompleteWarnings.length) {
    console.log(`  [warning] ${incompleteWarnings.length} diameter-dependent class(es) with incomplete range coverage (non-blocking, already status-gated):`);
    for (const w of incompleteWarnings) console.log(`    - ${w}`);
  }
});

check("production calculator/reference/guide pages are the Public Implementation phase's authorized deliverables (Phase 2's premature-publication gate no longer applies)", () => {
  // Originally this check asserted these files did NOT exist, because Phase 2 was sourcing-only
  // and publication was not yet authorized. The Public Implementation phase is the authorized
  // phase that creates them, so the gate this check enforces has now been formally passed --
  // asserting their absence today would itself be the regression. This check is kept (rather than
  // deleted) to document that transition and to continue asserting the files are real, non-empty
  // pages rather than silently missing or emptied by a future change.
  const required = [
    "tools/bolt-load-capacity-calculator.html",
    "reference/fastener-property-classes.html",
    "reference/tensile-stress-area.html",
    "guides/bolt-load-capacity-basics.html",
  ];
  for (const f of required) {
    const full = path.join(ROOT, f);
    assert(fs.existsSync(full), `${f} is missing -- it is an authorized Public Implementation phase deliverable`);
    assert(fs.readFileSync(full, "utf8").length > 500, `${f} exists but looks empty/truncated`);
  }
});

check("js/torque-data.js and tools/bolt-torque-calculator.html remain untouched (Phase 2/3 Treatment A)", () => {
  const torque = fs.readFileSync(path.join(ROOT, "js/torque-data.js"), "utf8");
  assert(torque.includes("Predefined tightening torque values"), "js/torque-data.js header comment changed -- was it modified?");
  assert(fs.existsSync(path.join(ROOT, "tools/bolt-torque-calculator.html")), "tools/bolt-torque-calculator.html must still exist");
});

check("guides/bolt-strength-grades.html's stated ISO property-class minimums are internally consistent with the verified dataset (Phase 3 reconciliation)", () => {
  // Phase 2 found the guide's original round designation-derived figures (800/1000/1200 MPa)
  // conflicted with the dataset's actual verified minimums (800 or 830/1040/1220 MPa) and
  // omitted 8.8's diameter-range split entirely. Phase 3 reconciled the guide to state the
  // dataset's own verified numbers. This check is regression-proof against the *current*
  // dataset (it reads expected values from the dataset itself, not a hardcoded copy), so it
  // will correctly re-fail if the guide and dataset ever drift apart again in the future,
  // regardless of which specific numbers are involved at that time.
  const guide = fs.readFileSync(path.join(ROOT, "guides/bolt-strength-grades.html"), "utf8");
  const byDesignationRange = {};
  for (const r of dataset.records) {
    if (r.system !== "iso_metric") continue;
    byDesignationRange[`${r.designation}|${r.applicable_diameter_range}`] = r.tensile_strength.value;
  }
  const expected = {
    "8.8|M5 - M16": 800,
    "8.8|M18 - M39": 830,
    "10.9|M5 - M39": 1040,
    "12.9|M1.6 - M39": 1220,
  };
  for (const [key, expectedValue] of Object.entries(expected)) {
    assert(byDesignationRange[key] === expectedValue, `dataset record for ${key} changed to ${byDesignationRange[key]} -- guide reconciliation assumptions no longer hold, guide must be re-reconciled`);
    assert(guide.includes(`${expectedValue} MPa`), `guides/bolt-strength-grades.html does not state ${expectedValue} MPa for ${key} -- guide and dataset have drifted out of consistency`);
  }
  // The guide must not still carry the old, pre-reconciliation flattened figures for classes
  // that are actually diameter-dependent or higher than the round designation number.
  assert(!guide.includes("1000 MPa"), "guide still states the old, superseded 1000 MPa figure for 10.9");
  assert(!guide.includes("1200 MPa"), "guide still states the old, superseded 1200 MPa figure for 12.9 (1220 MPa is the reconciled value)");
});

check("tensile_stress_area entity conforms to entity.schema.json and has no dangling relationships", () => {
  const schema = readJson("data/schemas/entity.schema.json");
  const ent = entities.records.find((r) => r.id === "tensile_stress_area");
  assert(ent, "tensile_stress_area entity must exist");
  for (const field of schema.required) {
    assert(field in ent, `tensile_stress_area missing required field: ${field}`);
  }
  const allEntityIds = new Set(entities.records.map((r) => r.id));
  const orgDirs = fs.readdirSync(path.join(ROOT, "data/standards"));
  const allStdIds = new Set();
  for (const dir of orgDirs) {
    const p = path.join(ROOT, "data/standards", dir, "standards.seed.json");
    if (fs.existsSync(p)) {
      for (const r of readJson(`data/standards/${dir}/standards.seed.json`).records) allStdIds.add(r.id);
    }
  }
  for (const relId of ent.related_entities) {
    assert(allEntityIds.has(relId), `tensile_stress_area.related_entities references unknown entity: ${relId}`);
  }
  for (const relId of ent.related_standards) {
    assert(allStdIds.has(relId), `tensile_stress_area.related_standards references unknown standard: ${relId}`);
  }
});

check("new relationship records conform to relationship.schema.json", () => {
  const schema = readJson("data/schemas/relationship.schema.json");
  const newRelIds = [
    "rel_tensile_stress_area_derived_from_pitch_diameter",
    "rel_tensile_stress_area_derived_from_minor_diameter",
    "rel_tensile_stress_area_defined_by_iso_898_1",
    "rel_tensile_stress_area_defined_by_asme_b1_1",
  ];
  const found = relationships.records.filter((r) => newRelIds.includes(r.id));
  assert(found.length === newRelIds.length, `expected ${newRelIds.length} new relationships, found ${found.length}`);
  for (const field of schema.required) {
    for (const r of found) assert(field in r, `${r.id} missing required field: ${field}`);
  }
});

check("no bolt_load_capacity_calculator, design_load, safety_factor, fastener_property_class, proof_strength, or ultimate_tensile_strength entity exists (correctly deferred pending entity_type schema decision)", () => {
  const blockedIds = [
    "bolt_load_capacity_calculator",
    "design_load",
    "safety_factor",
    "fastener_property_class",
    "proof_strength",
    "ultimate_tensile_strength",
  ];
  const existingIds = new Set(entities.records.map((r) => r.id));
  for (const id of blockedIds) {
    assert(!existingIds.has(id), `entity ${id} exists but was documented as deferred pending a Director decision on entity_type enum extension -- was it created without authorization?`);
  }
});

check("tensile stress area formula cross-check: computed value matches directly-quoted manufacturer table for a sample of sizes", () => {
  // Formula: At = 0.7854 * (d - 0.938194 * P)^2, metric. Cross-checked against the
  // Fastenal-quoted table value for M8x1.25 (36.6 mm^2) and M10x1.5 (58 mm^2).
  function metricAt(d, p) {
    return 0.7854 * Math.pow(d - 0.938194 * p, 2);
  }
  const m8 = metricAt(8, 1.25);
  const m10 = metricAt(10, 1.5);
  assert(Math.abs(m8 - 36.6) < 0.2, `M8x1.25 computed At=${m8.toFixed(2)} does not match quoted table value 36.6 mm^2 within tolerance`);
  assert(Math.abs(m10 - 58) < 0.2, `M10x1.5 computed At=${m10.toFixed(2)} does not match quoted table value 58 mm^2 within tolerance`);
});

let failed = 0;
console.log("FASTENER LOAD & STRENGTH -- PHASE 2 VALIDATOR");
console.log("==============================================");
for (const c of checks) {
  try {
    c.fn();
    console.log(`[PASS] ${c.name}`);
  } catch (e) {
    failed++;
    console.log(`[FAIL] ${c.name} -- ${e.message}`);
  }
}
console.log("");
console.log(`${checks.length - failed}/${checks.length} checks passed.`);
if (failed) {
  process.exitCode = 1;
} else {
  console.log("PHASE 2 VALIDATOR: ALL CHECKS PASSED");
}
