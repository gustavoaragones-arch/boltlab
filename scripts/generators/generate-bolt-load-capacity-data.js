#!/usr/bin/env node
/**
 * Fastener Load & Strength -- Public Implementation Phase.
 *
 * Generates js/bolt-load-capacity-data.js (client-side calculator data) from the approved,
 * source-controlled seed datasets:
 *
 *   data/datasets/fastener_property_classes.seed.json  (property-class strength records)
 *   data/datasets/metric_threads.seed.json              (metric thread geometry)
 *   data/datasets/unc.seed.json / unf.seed.json          (inch thread geometry)
 *
 * This script exists so the calculator NEVER hand-duplicates property-class strength values --
 * every number in the generated file traces directly back to a seed record and its own
 * status/provenance. Do not hand-edit js/bolt-load-capacity-data.js; re-run this generator.
 *
 * Property-class publication gate (Phase 2/3/4 boundary, preserved exactly):
 *   A record is exposed to the calculator only if confidence === "verified" AND
 *   proof_strength.status === "verified" AND tensile_strength.status === "verified".
 *   This automatically excludes every record Phase 2 classified as source_bound/blocked
 *   (iso_4_8, iso_5_6, iso_5_8, iso_6_8, iso_9_8_le16) AND the SAE Grade 2 >3/4in record
 *   (sae_grade_2_gt34), which Phase 4 explicitly names for exclusion due to its unresolved
 *   yield-strength source disagreement -- its confidence is "source_bound", so this single
 *   filter rule correctly excludes it without a special case.
 *
 * Diameter-range parsing: each ready record's applicable_diameter_range is a human-readable
 * string in the seed data (e.g. "M5 - M16", "1/4 in - 3/4 in"). This generator maps each ready
 * record's own id to an explicit, individually-verified {min, max} pair (traceable line-by-line
 * against the seed record's own string) rather than regex-parsing the free-text field, to avoid
 * silently mis-parsing a range.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const propertyClasses = readJson("data/datasets/fastener_property_classes.seed.json");
const metricThreads = readJson("data/datasets/metric_threads.seed.json");
const uncThreads = readJson("data/datasets/unc.seed.json");
const unfThreads = readJson("data/datasets/unf.seed.json");

// Explicit, individually-verified diameter-range bounds per ready record id. Each line was
// checked directly against that record's own `applicable_diameter_range` string at generation
// time (see comments). Units: mm for iso_metric records, inches for sae records.
const DIAMETER_RANGE_BY_ID = {
  iso_4_6: { min: 5, max: 39 }, // "M5 - M39"
  iso_8_8_le16: { min: 5, max: 16 }, // "M5 - M16"
  iso_8_8_gt16: { min: 18, max: 39 }, // "M18 - M39"
  iso_10_9: { min: 5, max: 39 }, // "M5 - M39"
  iso_12_9: { min: 1.6, max: 39 }, // "M1.6 - M39"
  sae_grade_1: { min: 0.25, max: 1.5 }, // "1/4 in - 1-1/2 in"
  sae_grade_2_le34: { min: 0.25, max: 0.75 }, // "1/4 in - 3/4 in"
  sae_grade_5_le1: { min: 0.25, max: 1.0 }, // "1/4 in - 1 in"
  sae_grade_5_gt1: { min: 1.0, max: 1.5 }, // "over 1 in - 1-1/2 in" (exclusive lower bound; no
  // currently-available thread-geometry size reaches this range -- included for data
  // completeness, not expected to ever be selectable given today's size list)
  sae_grade_8: { min: 0.25, max: 1.5 }, // "1/4 in - 1-1/2 in"
};

function isReady(record) {
  return (
    record.confidence === "verified" &&
    record.proof_strength.status === "verified" &&
    record.tensile_strength.status === "verified"
  );
}

const readyRecords = propertyClasses.records.filter(isReady);

// Sanity check at generation time: every ready record must have an explicit diameter range
// mapped above. If the dataset ever adds a new "verified" record without updating this map,
// fail loudly rather than silently emitting a record with no usable range.
for (const r of readyRecords) {
  if (!DIAMETER_RANGE_BY_ID[r.id]) {
    throw new Error(
      `generate-bolt-load-capacity-data.js: ready record '${r.id}' has no entry in DIAMETER_RANGE_BY_ID -- add one before regenerating.`
    );
  }
}

const propertyClassOutput = readyRecords.map((r) => ({
  id: r.id,
  system: r.system,
  designation: r.designation,
  diameterRange: DIAMETER_RANGE_BY_ID[r.id],
  proofStrength: r.proof_strength.value,
  tensileStrength: r.tensile_strength.value,
  unit: r.proof_strength.unit,
  sourceStandardId: r.source_standard_id,
}));

// Thread geometry, reused directly from the existing verified datasets -- not a new database.
// Metric: include every record (all share the same dataset-level verification tier).
const metricGeometry = metricThreads.records.map((r) => ({
  designation: r.designation,
  diameterMm: r.nominal_diameter_mm,
  pitchMm: r.pitch_mm,
  series: r.thread_series,
}));

// Inch: only designations at or above 1/4in are included -- every SAE grade in the ready set
// begins at 1/4in, so smaller (numbered-screw) designations would never match any ready
// property class. This is a UI-usefulness filter on which sizes to OFFER, not a modification
// of the underlying unc.seed.json/unf.seed.json data (untouched, unfiltered on disk).
function inchGeometryFrom(dataset, series) {
  return dataset.records
    .filter((r) => r.nominal_diameter_in >= 0.25)
    .map((r) => ({
      designation: r.designation,
      diameterIn: r.nominal_diameter_in,
      threadsPerInch: r.threads_per_inch,
      series,
    }));
}

const inchGeometry = [
  ...inchGeometryFrom(uncThreads, "UNC"),
  ...inchGeometryFrom(unfThreads, "UNF"),
];

const generatedAt = new Date().toISOString();

const output = `/* GENERATED FILE -- DO NOT EDIT BY HAND.
 * Generated by scripts/generators/generate-bolt-load-capacity-data.js from:
 *   data/datasets/fastener_property_classes.seed.json (filtered to publication-ready records)
 *   data/datasets/metric_threads.seed.json
 *   data/datasets/unc.seed.json
 *   data/datasets/unf.seed.json
 * Re-run the generator to regenerate this file after any source dataset change.
 * Generated: ${generatedAt}
 */
window.BoltLabFastenerPropertyClasses = ${JSON.stringify(propertyClassOutput, null, 2)};

window.BoltLabThreadGeometry = {
  metric: ${JSON.stringify(metricGeometry, null, 2)},
  inch: ${JSON.stringify(inchGeometry, null, 2)}
};
`;

fs.writeFileSync(path.join(ROOT, "js/bolt-load-capacity-data.js"), output, "utf8");
console.log(
  `Wrote js/bolt-load-capacity-data.js: ${propertyClassOutput.length} publication-ready property-class records, ${metricGeometry.length} metric sizes, ${inchGeometry.length} inch sizes.`
);
