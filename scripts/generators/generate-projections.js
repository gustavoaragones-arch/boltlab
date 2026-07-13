#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { projectRoot, writeJson } = require("../utilities/path-utils");
const { resolveEntityContext } = require("../utilities/relationship-resolver");

function buildReferenceProjection(context, entityId) {
  const resolved = resolveEntityContext(context.root, entityId);
  const today = context.today;

  return {
    id: `reference_${entityId}`,
    projection_type: "reference_page",
    entity_id: entityId,
    route_hint: "/reference/pitch-diameter-explained",
    title: "Pitch Diameter Explained",
    quick_reference: {
      primary_entity_id: entityId,
      related_entity_ids: resolved.relatedEntityIds,
      standard_ids: resolved.relatedStandardIds,
      dataset_ids: resolved.relatedDatasetIds
    },
    engineering_summary: {
      source_entity_id: entityId,
      strategy: "entity.engineering_summary"
    },
    faq: [
      {
        id: "faq_pitch_diameter_definition",
        question: "What is pitch diameter in practical thread fit work?",
        answer_source: {
          type: "entity_definition",
          entity_id: entityId
        }
      },
      {
        id: "faq_pitch_diameter_related_standards",
        question: "Which standards context is used for pitch diameter references?",
        answer_source: {
          type: "relationship_context",
          entity_id: entityId,
          relationship_ids: resolved.relationshipIds
        }
      }
    ],
    related_entities: resolved.relatedEntityIds,
    related_standards: resolved.relatedStandardIds,
    related_datasets: resolved.relatedDatasetIds,
    related_tools: resolved.relatedTools,
    related_charts: resolved.relatedCharts,
    related_guides: resolved.relatedGuides,
    schema: {
      source_entity_id: entityId,
      types: ["Article", "FAQPage", "BreadcrumbList"]
    },
    status: "active",
    version: "v0.1.0",
    created: today,
    updated: today
  };
}

function main() {
  const root = projectRoot();
  const context = {
    root,
    today: "2026-07-12"
  };

  const referenceProjection = buildReferenceProjection(context, "pitch_diameter");
  const outputPath = path.join(
    root,
    "data",
    "projections",
    "reference",
    "pitch_diameter.reference.json"
  );
  writeJson(outputPath, referenceProjection);

  const projectionDirectories = ["charts", "tools", "api"];
  for (const directory of projectionDirectories) {
    fs.mkdirSync(path.join(root, "data", "projections", directory), { recursive: true });
  }

  console.log("Projection generated: data/projections/reference/pitch_diameter.reference.json");
}

main();
