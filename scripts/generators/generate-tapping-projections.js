#!/usr/bin/env node
const path = require("node:path");
const { projectRoot, readJson, writeJson } = require("../utilities/path-utils");
const { loadKnowledge, resolveEntityContext } = require("../utilities/relationship-resolver");

const GENERATOR_VERSION = "v1.0.0";
const PROJECTION_VERSION = "v0.1.0";
// Fixed build date, not wall-clock time, so output is byte-identical across runs (Section 18/22).
const BUILD_DATE = "2026-08-15";

const RADIAL_ENGAGEMENT_MODEL = {
  calculation_status: "calculable",
  formula: "percent_engagement = (major_diameter - drill_diameter) / (1.29904 * pitch) * 100",
  inputs: ["major_diameter", "drill_diameter", "pitch_or_tpi"],
  target_percent: null,
  model_reference: "docs/architecture/thread-engagement-model.md#2-radial-engagement-percentage--the-mathematical-model"
};

const AXIAL_ENGAGEMENT_MODEL = {
  calculation_status: "not_calculable",
  principle: "Strength-based: engagement length should ensure the fastener fails in tension before internal threads strip (NASA-STD-5020A section 4.7.4).",
  blocking_dependency: "Requires material shear-strength data for the tapped-hole material, which does not yet exist in the BoltLab knowledge layer.",
  model_reference: "docs/architecture/thread-engagement-model.md#3-axial-engagement-length--nasa-std-5020a-findings"
};

function findBaseThreadRecord(threadDataset, threadId) {
  return (threadDataset.records || []).find((r) => r.designation === threadId) || null;
}

function buildThreadBlock(profile, threadDataset, threadSystem, threadSystemEntityId) {
  const base = findBaseThreadRecord(threadDataset, profile.thread_id);
  if (!base) {
    throw new Error(`No base thread record found for ${profile.thread_id} in ${threadDataset.dataset_id}`);
  }
  if (threadSystem === "metric") {
    return {
      designation: base.designation,
      thread_system: "metric",
      nominal_diameter: base.nominal_diameter_mm,
      nominal_diameter_unit: "mm",
      pitch: base.pitch_mm,
      pitch_unit: "mm",
      threads_per_inch: null,
      coarse_fine: base.thread_series,
      standard_family: base.iso_family,
      source_entity_id: threadSystemEntityId,
      source_dataset: profile.thread_source_dataset,
      source_record: base.designation
    };
  }
  return {
    designation: base.designation,
    thread_system: threadSystem,
    nominal_diameter: base.nominal_diameter_in,
    nominal_diameter_unit: "in",
    pitch: null,
    pitch_unit: null,
    threads_per_inch: base.threads_per_inch,
    coarse_fine: base.thread_series,
    standard_family: base.standards_family,
    source_entity_id: threadSystemEntityId,
    source_dataset: profile.thread_source_dataset,
    source_record: base.designation
  };
}

function buildTapDrillBlock(profile, threadSystem) {
  const hp = profile.hole_preparation;
  return {
    value: hp.value,
    unit: hp.unit,
    convention: threadSystem === "metric" ? "ISO 2306 nominal-minus-pitch (BoltLab-verified table match)" : "US customary drill-series",
    status: hp.status,
    provenance: {
      source_dataset: hp.source_dataset,
      source_record: hp.source_record,
      source_field: hp.source_field,
      source: profile.hole_preparation.cross_verified ? profile.hole_preparation.cross_verified.source : null,
      cross_check: profile.hole_preparation.cross_verified
        ? `Matches ${profile.hole_preparation.cross_verified.table} exactly (verified ${profile.hole_preparation.cross_verified.verified_date})`
        : null
    }
  };
}

function buildAlternativeDrillBlock(profile) {
  const alt = profile.iso_2306_alternative_drill;
  if (!alt) {
    return null;
  }
  return {
    value: alt.value,
    unit: alt.unit,
    standard_id: alt.source,
    standard_edition: "1972",
    convention: "ISO 2306 continuous-metric recommendation for inch threads",
    status: alt.status,
    applicability: "Alternative recommendation for tapping this inch thread using a metric drill selected per ISO 2306's own inch-thread tables (Table 3 UNC / Table 4 UNF). Does not replace or average with the US-customary tap_drill value.",
    meaning: alt.meaning,
    provenance: {
      source: "ISO 2306:1972 primary-source table (verified in T2.1 via authorized standards-reseller preview)",
      table: alt.table,
      verified_date: alt.verified_date
    }
  };
}

function buildStandardsBlock(sourceStandardIds, standardById) {
  return sourceStandardIds
    .slice()
    .sort()
    .map((id) => {
      const standard = standardById.get(id);
      if (!standard) {
        throw new Error(`Unknown standard reference: ${id}`);
      }
      return {
        standard_id: standard.id,
        organization: standard.organization,
        designation: standard.designation,
        edition: standard.edition || null,
        title: standard.title || null,
        relevance: `Listed in source_standards of the tapping dataset this profile belongs to.`,
        verification_state: standard.standard_status || null
      };
    });
}

function buildDataQualityBlock(profile, datasetLastReviewed) {
  return {
    record_status: profile.status,
    provenance_complete: Boolean(
      profile.hole_preparation.source_dataset && profile.hole_preparation.source_record && profile.hole_preparation.source_field
    ),
    last_reviewed: datasetLastReviewed || null
  };
}

function buildProfileRows(root, knowledge, config) {
  const { tappingDataset, threadDataset, threadSystem, threadSystemEntityId } = config;
  const tapTypeEntityIds = new Set(
    knowledge.entities.filter((e) => e.entity_type === "tap_type").map((e) => e.id)
  );

  const sortedRecords = (tappingDataset.records || [])
    .slice()
    .sort((a, b) => (a.tapping_profile_id < b.tapping_profile_id ? -1 : 1));

  return sortedRecords.map((profile) => {
    const operationContext = resolveEntityContext(root, profile.operation);
    const tapTypes = operationContext.relatedEntityIds
      .filter((id) => tapTypeEntityIds.has(id))
      .sort();

    return {
      tapping_profile_id: profile.tapping_profile_id,
      thread: buildThreadBlock(profile, threadDataset, threadSystem, threadSystemEntityId),
      tap_drill: buildTapDrillBlock(profile, threadSystem),
      alternative_drill: buildAlternativeDrillBlock(profile),
      engagement: {
        radial: RADIAL_ENGAGEMENT_MODEL,
        axial: AXIAL_ENGAGEMENT_MODEL
      },
      tap_types: tapTypes,
      standards: buildStandardsBlock(tappingDataset.source_standards || [], knowledge.standardById),
      data_quality: buildDataQualityBlock(profile, tappingDataset.last_reviewed)
    };
  });
}

function summarizeDataQuality(rows) {
  const counts = { verified: 0, source_bound: 0, pending_verification: 0, unavailable: 0 };
  for (const row of rows) {
    counts[row.data_quality.record_status] = (counts[row.data_quality.record_status] || 0) + 1;
  }
  const total = rows.length;
  const provenanceComplete = rows.filter((r) => r.data_quality.provenance_complete).length;
  return {
    record_count: total,
    verified_count: counts.verified,
    source_bound_count: counts.source_bound,
    pending_count: counts.pending_verification,
    unavailable_count: counts.unavailable,
    provenance_coverage_percent: total === 0 ? 0 : Math.round((provenanceComplete / total) * 10000) / 100
  };
}

function buildTapTypeProjection(root, knowledge) {
  const tapTypeEntities = knowledge.entities
    .filter((e) => e.entity_type === "tap_type")
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : 1));

  const rows = tapTypeEntities.map((entity) => {
    const notes = entity.application_notes || [];
    const byClass = (cls) => notes.filter((n) => n.classification === cls);
    const verifiedCount = notes.filter((n) => n.status === "verified").length;
    const sourceBoundCount = notes.filter((n) => n.status === "source_bound").length;
    return {
      entity_id: entity.id,
      title: entity.title,
      taxonomy_axis: entity.taxonomy_axis || null,
      definition: entity.definition,
      manufacturing_characteristics: byClass("manufacturing_characteristic"),
      typical_applications: byClass("typical_application"),
      manufacturer_specific_recommendations: byClass("manufacturer_specific_recommendation"),
      evidence_status: {
        verified_fact_count: verifiedCount,
        source_bound_fact_count: sourceBoundCount
      }
    };
  });

  return {
    id: "tapping_tap_types",
    projection_type: "tapping_tap_type_projection",
    route_hint: "/reference/tapping/tap-types",
    generator_version: GENERATOR_VERSION,
    source_dataset_versions: {
      entities: "v0.1.0"
    },
    related_entities: rows.map((r) => r.entity_id).sort(),
    related_standards: [],
    related_datasets: [],
    rows,
    version: PROJECTION_VERSION,
    created: BUILD_DATE,
    updated: BUILD_DATE
  };
}

function main() {
  const root = projectRoot();
  const knowledge = loadKnowledge(root);

  const metricThreads = knowledge.datasetById.get("metric_threads");
  const metricTapping = knowledge.datasetById.get("metric_tapping");
  const uncThreads = knowledge.datasetById.get("unc_threads");
  const uncTapping = knowledge.datasetById.get("unc_tapping");
  const unfThreads = knowledge.datasetById.get("unf_threads");
  const unfTapping = knowledge.datasetById.get("unf_tapping");

  const rows = [
    ...buildProfileRows(root, knowledge, {
      tappingDataset: metricTapping,
      threadDataset: metricThreads,
      threadSystem: "metric",
      threadSystemEntityId: null
    }),
    ...buildProfileRows(root, knowledge, {
      tappingDataset: uncTapping,
      threadDataset: uncThreads,
      threadSystem: "UNC",
      threadSystemEntityId: "thread_system_unc"
    }),
    ...buildProfileRows(root, knowledge, {
      tappingDataset: unfTapping,
      threadDataset: unfThreads,
      threadSystem: "UNF",
      threadSystemEntityId: "thread_system_unc"
    })
  ];

  const relatedEntities = [...new Set(
    rows.flatMap((r) => [r.thread.source_entity_id, ...r.tap_types].filter(Boolean))
  )].sort();
  const relatedStandards = [...new Set(
    rows.flatMap((r) => r.standards.map((s) => s.standard_id))
  )].sort();
  const relatedDatasets = [...new Set(
    rows.flatMap((r) => [r.thread.source_dataset, r.tap_drill.provenance.source_dataset])
  )].sort();

  const profileProjection = {
    id: "tapping_profiles_unified",
    projection_type: "tapping_profile_projection",
    route_hint: "/reference/tapping/explorer",
    generator_version: GENERATOR_VERSION,
    source_dataset_versions: {
      metric_threads: metricThreads.version,
      metric_tapping: metricTapping.version,
      unc_threads: uncThreads.version,
      unc_tapping: uncTapping.version,
      unf_threads: unfThreads.version,
      unf_tapping: unfTapping.version
    },
    related_entities: relatedEntities,
    related_standards: relatedStandards,
    related_datasets: relatedDatasets,
    data_quality_summary: summarizeDataQuality(rows),
    rows,
    version: PROJECTION_VERSION,
    created: BUILD_DATE,
    updated: BUILD_DATE
  };

  const tapTypeProjection = buildTapTypeProjection(root, knowledge);

  const profilePath = path.join(root, "data", "projections", "tapping", "tapping-profiles.json");
  const tapTypePath = path.join(root, "data", "projections", "tapping", "tap-types.json");

  writeJson(profilePath, profileProjection);
  console.log(`Projection generated: data/projections/tapping/tapping-profiles.json (${rows.length} rows)`);
  writeJson(tapTypePath, tapTypeProjection);
  console.log(`Projection generated: data/projections/tapping/tap-types.json (${tapTypeProjection.rows.length} rows)`);
}

main();
