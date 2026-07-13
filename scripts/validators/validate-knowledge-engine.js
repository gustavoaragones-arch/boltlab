#!/usr/bin/env node
const path = require("node:path");
const fs = require("node:fs");
const {
  projectRoot,
  walkFiles,
  readJson,
  writeJson,
  writeText
} = require("../utilities/path-utils");

const root = projectRoot();
const dataRoot = path.join(root, "data");
const docsRoot = path.join(root, "docs", "architecture");

function loadEntityRecords() {
  const file = path.join(dataRoot, "entities", "entities.seed.json");
  return readJson(file).records || [];
}

function loadStandardsRecords() {
  const standardsDir = path.join(dataRoot, "standards");
  const files = walkFiles(standardsDir).filter((file) => file.endsWith(".seed.json"));
  return files.flatMap((file) => (readJson(file).records || []));
}

function loadDatasetRecords() {
  const datasetDir = path.join(dataRoot, "datasets");
  const files = walkFiles(datasetDir).filter((file) => file.endsWith(".seed.json"));
  return files.map((file) => readJson(file));
}

function loadRelationshipRecords() {
  const file = path.join(dataRoot, "relationships", "relationships.seed.json");
  return readJson(file).records || [];
}

function checkRequiredFields(record, fields) {
  return fields.filter((field) => !(field in record));
}

function buildIdIndex(records) {
  const seen = new Set();
  const duplicates = new Set();
  for (const record of records) {
    if (seen.has(record.id)) {
      duplicates.add(record.id);
    }
    seen.add(record.id);
  }
  return {
    ids: seen,
    duplicates: [...duplicates]
  };
}

function routeExists(projectPath) {
  if (!projectPath.startsWith("/")) {
    return false;
  }
  const absoluteBase = path.join(root, projectPath);
  const candidates = [
    absoluteBase,
    `${absoluteBase}.html`,
    path.join(absoluteBase, "index.html")
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function detectCycles(relationships, nodeIds) {
  const graph = new Map();
  for (const id of nodeIds) {
    graph.set(id, []);
  }
  for (const rel of relationships) {
    if (graph.has(rel.source) && graph.has(rel.target)) {
      graph.get(rel.source).push(rel.target);
    }
  }

  const visited = new Set();
  const stack = new Set();
  const cycles = [];

  function dfs(node, trail) {
    if (stack.has(node)) {
      const start = trail.indexOf(node);
      cycles.push(trail.slice(start).concat(node));
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);
    stack.add(node);
    for (const next of graph.get(node) || []) {
      dfs(next, trail.concat(next));
    }
    stack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node, [node]);
  }

  return cycles;
}

function toMarkdown(report) {
  const lines = [];
  lines.push("# Knowledge Engine Validation Report");
  lines.push("");
  lines.push(`- Generated: ${report.generated_at}`);
  lines.push(`- Status: ${report.summary.status}`);
  lines.push(`- Errors: ${report.summary.errors}`);
  lines.push(`- Warnings: ${report.summary.warnings}`);
  lines.push("");
  lines.push("## Checks");
  lines.push("");
  for (const check of report.checks) {
    lines.push(`### ${check.name}`);
    lines.push(`- Status: ${check.status}`);
    lines.push(`- Errors: ${check.errors.length}`);
    lines.push(`- Warnings: ${check.warnings.length}`);
    if (check.errors.length) {
      lines.push("- Error details:");
      for (const error of check.errors) {
        lines.push(`  - ${error}`);
      }
    }
    if (check.warnings.length) {
      lines.push("- Warning details:");
      for (const warning of check.warnings) {
        lines.push(`  - ${warning}`);
      }
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function buildReport() {
  const entities = loadEntityRecords();
  const standards = loadStandardsRecords();
  const datasets = loadDatasetRecords();
  const relationships = loadRelationshipRecords();

  const checks = [];

  const entityRequired = [
    "id",
    "title",
    "entity_type",
    "definition",
    "related_standards",
    "related_datasets",
    "version",
    "created",
    "updated"
  ];
  const standardRequired = [
    "id",
    "organization",
    "designation",
    "title",
    "public_summary",
    "version",
    "created",
    "updated"
  ];
  const datasetRequired = [
    "dataset_id",
    "id",
    "schema_version",
    "verified",
    "verification_method",
    "primary_sources",
    "last_reviewed",
    "license_notes",
    "source_standards",
    "version",
    "created",
    "updated",
    "records"
  ];
  const relationshipRequired = [
    "id",
    "source",
    "predicate",
    "target",
    "strength",
    "version",
    "created",
    "updated"
  ];

  const requiredCheck = {
    name: "Schema Field Completeness",
    status: "pass",
    errors: [],
    warnings: []
  };

  for (const entity of entities) {
    const missing = checkRequiredFields(entity, entityRequired);
    if (missing.length) {
      requiredCheck.errors.push(`Entity ${entity.id} missing fields: ${missing.join(", ")}`);
    }
  }
  for (const standard of standards) {
    const missing = checkRequiredFields(standard, standardRequired);
    if (missing.length) {
      requiredCheck.errors.push(`Standard ${standard.id} missing fields: ${missing.join(", ")}`);
    }
  }
  for (const dataset of datasets) {
    const missing = checkRequiredFields(dataset, datasetRequired);
    if (missing.length) {
      requiredCheck.errors.push(`Dataset ${dataset.id} missing fields: ${missing.join(", ")}`);
    }
  }
  for (const relationship of relationships) {
    const missing = checkRequiredFields(relationship, relationshipRequired);
    if (missing.length) {
      requiredCheck.errors.push(`Relationship ${relationship.id} missing fields: ${missing.join(", ")}`);
    }
  }
  if (requiredCheck.errors.length) {
    requiredCheck.status = "fail";
  }
  checks.push(requiredCheck);

  const identityCheck = {
    name: "Duplicate ID Detection",
    status: "pass",
    errors: [],
    warnings: []
  };
  const entityIndex = buildIdIndex(entities);
  const standardIndex = buildIdIndex(standards);
  const datasetIndex = buildIdIndex(datasets);
  const relationshipIndex = buildIdIndex(relationships);
  for (const [label, dupes] of [
    ["entity", entityIndex.duplicates],
    ["standard", standardIndex.duplicates],
    ["dataset", datasetIndex.duplicates],
    ["relationship", relationshipIndex.duplicates]
  ]) {
    if (dupes.length) {
      identityCheck.errors.push(`Duplicate ${label} ids: ${dupes.join(", ")}`);
    }
  }
  if (identityCheck.errors.length) {
    identityCheck.status = "fail";
  }
  checks.push(identityCheck);

  const knownIds = new Set([
    ...entityIndex.ids,
    ...standardIndex.ids,
    ...datasetIndex.ids
  ]);

  const referenceCheck = {
    name: "Reference Integrity",
    status: "pass",
    errors: [],
    warnings: []
  };

  for (const entity of entities) {
    for (const ref of entity.related_entities || []) {
      if (!entityIndex.ids.has(ref)) {
        referenceCheck.errors.push(`Entity ${entity.id} references unknown entity ${ref}`);
      }
    }
    for (const ref of entity.related_standards || []) {
      if (!standardIndex.ids.has(ref)) {
        referenceCheck.errors.push(`Entity ${entity.id} references unknown standard ${ref}`);
      }
    }
    for (const ref of entity.related_datasets || []) {
      if (!datasetIndex.ids.has(ref)) {
        referenceCheck.errors.push(`Entity ${entity.id} references unknown dataset ${ref}`);
      }
    }
    for (const page of entity.related_pages || []) {
      if (!routeExists(page)) {
        referenceCheck.warnings.push(`Entity ${entity.id} references missing page route ${page}`);
      }
    }
  }

  for (const standard of standards) {
    for (const ref of standard.related_entities || []) {
      if (!entityIndex.ids.has(ref)) {
        referenceCheck.errors.push(`Standard ${standard.id} references unknown entity ${ref}`);
      }
    }
    for (const ref of standard.related_datasets || []) {
      if (!datasetIndex.ids.has(ref)) {
        referenceCheck.errors.push(`Standard ${standard.id} references unknown dataset ${ref}`);
      }
    }
  }

  for (const dataset of datasets) {
    for (const ref of dataset.source_standards || []) {
      if (!standardIndex.ids.has(ref)) {
        referenceCheck.errors.push(`Dataset ${dataset.id} references unknown standard ${ref}`);
      }
    }
  }

  for (const rel of relationships) {
    if (!knownIds.has(rel.source)) {
      referenceCheck.errors.push(`Relationship ${rel.id} has unknown source ${rel.source}`);
    }
    if (!knownIds.has(rel.target)) {
      referenceCheck.errors.push(`Relationship ${rel.id} has unknown target ${rel.target}`);
    }
  }

  if (referenceCheck.errors.length) {
    referenceCheck.status = "fail";
  }
  checks.push(referenceCheck);

  const graphCheck = {
    name: "Graph Health",
    status: "pass",
    errors: [],
    warnings: []
  };
  const entityNodeIds = [...entityIndex.ids];
  const graphRelationships = relationships.filter(
    (rel) => entityIndex.ids.has(rel.source) && entityIndex.ids.has(rel.target)
  );
  const cycles = detectCycles(graphRelationships, entityNodeIds);
  if (cycles.length) {
    graphCheck.errors.push(`Circular entity relationships found: ${cycles.map((c) => c.join(" -> ")).join(" | ")}`);
  }
  const activeNodes = new Set();
  for (const rel of relationships) {
    activeNodes.add(rel.source);
    activeNodes.add(rel.target);
  }
  const orphans = entityNodeIds.filter((id) => !activeNodes.has(id));
  if (orphans.length) {
    graphCheck.warnings.push(`Orphan entities: ${orphans.join(", ")}`);
  }
  if (graphCheck.errors.length) {
    graphCheck.status = "fail";
  }
  checks.push(graphCheck);

  const assetCheck = {
    name: "Asset and Generator Consistency",
    status: "pass",
    errors: [],
    warnings: []
  };
  for (const entity of entities) {
    if (entity.svg_asset) {
      const svgPath = path.join(root, entity.svg_asset);
      if (!fs.existsSync(svgPath)) {
        assetCheck.warnings.push(`Entity ${entity.id} svg_asset not found: ${entity.svg_asset}`);
      }
    }
  }
  const requiredGenerators = [
    "generate-engineering-pages.js",
    "generate-reference-pages.js",
    "generate-chart-pages.js",
    "generate-schema.js",
    "generate-api-data.js",
    "generate-sitemap.js"
  ];
  for (const file of requiredGenerators) {
    const filePath = path.join(root, "scripts", "generators", file);
    if (!fs.existsSync(filePath)) {
      assetCheck.errors.push(`Missing generator module: scripts/generators/${file}`);
    }
  }
  if (assetCheck.errors.length) {
    assetCheck.status = "fail";
  }
  checks.push(assetCheck);

  const errors = checks.reduce((sum, check) => sum + check.errors.length, 0);
  const warnings = checks.reduce((sum, check) => sum + check.warnings.length, 0);

  return {
    generated_at: new Date().toISOString(),
    summary: {
      status: errors > 0 ? "fail" : "pass",
      errors,
      warnings,
      counts: {
        entities: entities.length,
        standards: standards.length,
        datasets: datasets.length,
        relationships: relationships.length
      }
    },
    checks
  };
}

function main() {
  const report = buildReport();
  const jsonPath = path.join(docsRoot, "validation-report.json");
  const markdownPath = path.join(docsRoot, "validation-report.md");
  writeJson(jsonPath, report);
  writeText(markdownPath, toMarkdown(report));
  console.log(`Validation report written: ${path.relative(root, jsonPath)}`);
  console.log(`Validation report written: ${path.relative(root, markdownPath)}`);
  if (report.summary.status === "fail") {
    process.exitCode = 1;
  }
}

main();
