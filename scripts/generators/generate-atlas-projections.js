#!/usr/bin/env node
const path = require("node:path");
const { projectRoot, readJson, writeJson } = require("../utilities/path-utils");

function clampMeta(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 140) {
    return `${cleaned} for practical engineering lookup and standards-context workflow support.`;
  }
  if (cleaned.length > 155) {
    return `${cleaned.slice(0, 152).trimEnd()}...`;
  }
  return cleaned;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
}

function main() {
  const root = projectRoot();
  const datasetPath = path.join(root, "data", "datasets", "metric_threads.seed.json");
  const dataset = readJson(datasetPath);
  const records = dataset.records || [];

  const grouped = new Map();
  for (const row of records) {
    const key = Number(row.nominal_diameter_mm);
    if (!grouped.has(key)) {
      grouped.set(key, {
        designation: `M${key}`,
        diameter_mm: key,
        coarse_pitch_mm: null,
        fine_pitches_mm: [],
        hex_head_mm: Number(row.hex_head_mm),
        tap_drill_mm: Number(row.tap_drill_mm),
        clearance_holes_mm: {
          close: Number(row.clearance_hole_close_mm),
          normal: Number(row.clearance_hole_normal_mm),
          loose: Number(row.clearance_hole_loose_mm)
        },
        iso_family: "ISO 261 / ISO 262"
      });
    }

    const current = grouped.get(key);
    if (row.thread_series === "coarse") {
      current.coarse_pitch_mm = Number(row.pitch_mm);
    } else if (row.thread_series === "fine") {
      current.fine_pitches_mm.push(Number(row.pitch_mm));
    }
  }

  const rows = [...grouped.values()]
    .map((row) => ({
      ...row,
      fine_pitches_mm: uniqueSorted(row.fine_pitches_mm)
    }))
    .sort((a, b) => a.diameter_mm - b.diameter_mm);

  const projection = {
    id: "metric_thread_atlas",
    projection_type: "atlas_page",
    route_hint: "/reference/metric-thread-atlas",
    canonical_url: "https://boltlab.io/reference/metric-thread-atlas",
    title: "Metric Thread Atlas",
    meta_description: clampMeta("Comprehensive metric thread atlas with designation, coarse and fine pitches, hex sizes, tap drill guidance, clearance holes, standards links, and tool context."),
    summary: "The Metric Thread Atlas is a searchable static engineering dataset for metric thread designations and workflow decisions.",
    dataset: {
      dataset_id: dataset.dataset_id,
      version: dataset.version,
      verified: dataset.verified,
      verification_method: dataset.verification_method,
      primary_sources: dataset.primary_sources,
      last_reviewed: dataset.last_reviewed,
      license_notes: dataset.license_notes
    },
    filters: {
      diameters_mm: uniqueSorted(rows.map((row) => row.diameter_mm)),
      series: ["coarse", "fine"],
      pitches_mm: uniqueSorted(records.map((row) => Number(row.pitch_mm))),
      iso_families: ["ISO 261", "ISO 262", "ISO 724", "ISO 965-1"]
    },
    rows,
    related_standards: ["iso_261", "iso_262", "iso_724", "iso_965_1"],
    related_tools: [
      "/tools/thread-identifier",
      "/tools/thread-pitch-to-tpi-converter",
      "/tools/tap-drill-calculator",
      "/charts/metric-thread-chart"
    ],
    version: "v0.1.0",
    created: "2026-07-12",
    updated: "2026-07-12"
  };

  const outPath = path.join(root, "data", "projections", "atlas", "metric-thread-atlas.json");
  writeJson(outPath, projection);
  console.log("Projection generated: data/projections/atlas/metric-thread-atlas.json");
}

main();
