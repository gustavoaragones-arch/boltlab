#!/usr/bin/env node
const path = require("node:path");
const { projectRoot, readJson, writeJson } = require("../utilities/path-utils");

const MM_PER_INCH = 25.4;
const BUILD_VERSION = "thread-atlas-generator@v0.1.0";

function clampMeta(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 140) {
    return `${cleaned} with standards context, tools, and engineering workflow guidance.`;
  }
  if (cleaned.length > 155) {
    return `${cleaned.slice(0, 152).trimEnd()}...`;
  }
  return cleaned;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
}

function metricDetailRoute(diameterMm, availableRoutes) {
  const candidate = `/sizes/m${Math.round(diameterMm)}-bolt-size`;
  return availableRoutes.has(candidate) ? candidate : "/reference/thread-tolerances";
}

function nearestMetricDesignation(metricRows, diameterIn) {
  const targetMm = diameterIn * MM_PER_INCH;
  let best = null;
  for (const row of metricRows) {
    const delta = Math.abs(Number(row.nominal_diameter_mm) - targetMm);
    if (!best || delta < best.delta) {
      best = { designation: row.designation, delta };
    }
  }
  return best ? best.designation : "";
}

function makeMetricRows(metricDataset, availableRoutes) {
  const rows = [];
  for (const row of metricDataset.records || []) {
    rows.push({
      designation: row.designation.split("x")[0],
      thread_system: "Metric",
      diameter_mm: Number(row.nominal_diameter_mm),
      diameter_display: `${row.nominal_diameter_mm} mm`,
      coarse_pitch_mm: Number(row.pitch_mm),
      fine_pitches_mm: row.thread_series === "fine" ? [Number(row.pitch_mm)] : [],
      pitch_display: `${row.pitch_mm} mm`,
      coarse_fine: row.thread_series,
      hex_head_mm: Number(row.hex_head_mm),
      hex_size_display: `${row.hex_head_mm} mm`,
      tap_drill_mm: Number(row.tap_drill_mm),
      tap_drill_display: `${row.tap_drill_mm} mm`,
      clearance_holes_mm: {
        close: Number(row.clearance_hole_close_mm),
        normal: Number(row.clearance_hole_normal_mm),
        loose: Number(row.clearance_hole_loose_mm)
      },
      clearance_hole_display: `${row.clearance_hole_close_mm}/${row.clearance_hole_normal_mm}/${row.clearance_hole_loose_mm} mm`,
      iso_family: row.iso_family || "ISO 261",
      standards_family: "ISO",
      related_standards: ["iso_261", "iso_262", "iso_724", "iso_965_1"],
      related_tools: [
        "/tools/thread-identifier",
        "/tools/thread-pitch-to-tpi-converter",
        "/tools/tap-drill-calculator"
      ],
      detail_reference: metricDetailRoute(Number(row.nominal_diameter_mm), availableRoutes),
      equivalent_metric: row.designation.split("x")[0]
    });
  }
  return rows;
}

function makeUnifiedRows(dataset, systemLabel, chartRoute, metricRows) {
  return (dataset.records || []).map((row) => {
    const diameterIn = Number(row.nominal_diameter_in);
    const diameterMm = round(diameterIn * MM_PER_INCH, 2);
    return {
      designation: row.designation,
      thread_system: systemLabel,
      diameter_mm: diameterMm,
      diameter_display: `${diameterIn} in`,
      coarse_pitch_mm: round(MM_PER_INCH / Number(row.threads_per_inch), 3),
      fine_pitches_mm: [],
      pitch_display: `${row.threads_per_inch} TPI`,
      coarse_fine: systemLabel === "UNC" ? "coarse" : "fine",
      hex_head_mm: round(Number(row.hex_head_in) * MM_PER_INCH, 2),
      hex_size_display: `${row.hex_head_in} in`,
      tap_drill_mm: round(Number(row.tap_drill_in) * MM_PER_INCH, 2),
      tap_drill_display: `${row.tap_drill_in} in`,
      clearance_holes_mm: {
        close: round(Number(row.clearance_hole_close_in) * MM_PER_INCH, 2),
        normal: round(Number(row.clearance_hole_normal_in) * MM_PER_INCH, 2),
        loose: round(Number(row.clearance_hole_loose_in) * MM_PER_INCH, 2)
      },
      clearance_hole_display: `${row.clearance_hole_close_in}/${row.clearance_hole_normal_in}/${row.clearance_hole_loose_in} in`,
      iso_family: row.standards_family || "ASME B1.1",
      standards_family: "ASME",
      related_standards: ["asme_b1_1", "iso_261", "iso_262"],
      related_tools: [
        "/tools/thread-identifier",
        "/tools/thread-pitch-to-tpi-converter",
        "/tools/tap-drill-calculator"
      ],
      detail_reference: chartRoute,
      equivalent_metric: nearestMetricDesignation(metricRows, diameterIn)
    };
  });
}

function main() {
  const root = projectRoot();
  const metricDataset = readJson(path.join(root, "data", "datasets", "metric_threads.seed.json"));
  const uncDataset = readJson(path.join(root, "data", "datasets", "unc.seed.json"));
  const unfDataset = readJson(path.join(root, "data", "datasets", "unf.seed.json"));
  const availableSizeRoutes = new Set(
    Array.from({ length: 18 }, (_, idx) => `/sizes/m${idx + 3}-bolt-size`)
  );

  const metricRows = makeMetricRows(metricDataset, availableSizeRoutes);
  const uncRows = makeUnifiedRows(uncDataset, "UNC", "/charts/unc-thread-chart", metricDataset.records || []);
  const unfRows = makeUnifiedRows(unfDataset, "UNF", "/charts/unf-thread-chart", metricDataset.records || []);
  const rows = [...metricRows, ...uncRows, ...unfRows];

  const projection = {
    id: "thread_atlas",
    projection_type: "atlas_page",
    route_hint: "/reference/thread-atlas",
    canonical_url: "https://boltlab.io/reference/thread-atlas",
    title: "Unified Thread Atlas",
    meta_description: clampMeta("Unified thread atlas covering Metric, UNC, and UNF with instant search, filters, tap drill and clearance guidance, standards links, and workflow-ready reference cards."),
    summary: "Flagship engineering explorer for thread designations across Metric, UNC, and UNF systems.",
    dataset: {
      dataset_id: "thread_atlas_unified",
      version: "v0.1.0",
      verified: metricDataset.verified && uncDataset.verified && unfDataset.verified,
      verification_method: "Composed from verified metric, UNC, and UNF datasets through deterministic projection build.",
      primary_sources: uniqueSorted([
        ...(metricDataset.primary_sources || []),
        ...(uncDataset.primary_sources || []),
        ...(unfDataset.primary_sources || [])
      ]),
      last_reviewed: "2026-07-12",
      license_notes: "Projection uses interpreted engineering dataset values and does not reproduce copyrighted standards tables.",
      coverage: {
        systems: ["Metric", "UNC", "UNF"],
        total_rows: rows.length,
        metric_rows: metricRows.length,
        unc_rows: uncRows.length,
        unf_rows: unfRows.length
      },
      generator_build_version: BUILD_VERSION
    },
    filters: {
      diameters_mm: uniqueSorted(rows.map((row) => row.diameter_mm)),
      series: ["coarse", "fine"],
      pitches_mm: uniqueSorted(rows.map((row) => row.coarse_pitch_mm)),
      iso_families: ["ISO 261", "ISO 262", "ISO 724", "ISO 965-1", "ASME B1.1"],
      thread_systems: ["Metric", "UNC", "UNF"],
      diameters_display: uniqueSorted(rows.map((row) => row.diameter_display)),
      pitch_display: uniqueSorted(rows.map((row) => row.pitch_display)),
      coarse_fine: ["coarse", "fine"],
      standards_families: ["ISO", "ASME"]
    },
    rows: rows.sort((a, b) => a.designation.localeCompare(b.designation, "en")),
    related_standards: ["iso_261", "iso_262", "iso_724", "iso_965_1", "asme_b1_1"],
    related_tools: [
      "/tools/thread-identifier",
      "/tools/thread-pitch-to-tpi-converter",
      "/tools/tap-drill-calculator",
      "/charts/metric-thread-chart",
      "/charts/unc-thread-chart",
      "/charts/unf-thread-chart"
    ],
    version: "v0.1.0",
    created: "2026-07-12",
    updated: "2026-07-12"
  };

  const outPath = path.join(root, "data", "projections", "atlas", "thread-atlas.json");
  writeJson(outPath, projection);
  console.log("Projection generated: data/projections/atlas/thread-atlas.json");
}

main();
