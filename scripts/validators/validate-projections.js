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
const { loadKnowledge } = require("../utilities/relationship-resolver");

function listProjectionFiles(root) {
  const projectionRoot = path.join(root, "data", "projections");
  return walkFiles(projectionRoot).filter((file) => {
    const base = path.basename(file);
    return file.endsWith(".json") && !base.endsWith(".schema.json");
  });
}

function loadProjectionSchemas(root) {
  const base = path.join(root, "data", "projections");
  return {
    reference_page: readJson(path.join(base, "reference-page.schema.json")),
    chart: readJson(path.join(base, "chart.schema.json")),
    tool: readJson(path.join(base, "tool.schema.json")),
    api: readJson(path.join(base, "api.schema.json")),
    atlas_page: readJson(path.join(base, "atlas.schema.json")),
    tapping_profile_projection: readJson(path.join(base, "tapping-profile.schema.json")),
    tapping_tap_type_projection: readJson(path.join(base, "tapping-tap-type.schema.json"))
  };
}

function simpleValidateAgainstSchema(schema, record) {
  const errors = [];
  const required = schema.required || [];
  for (const field of required) {
    if (!(field in record)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  if (schema.properties) {
    for (const [key, rules] of Object.entries(schema.properties)) {
      if (!(key in record)) {
        continue;
      }
      if (rules.const !== undefined && record[key] !== rules.const) {
        errors.push(`Field ${key} must be ${rules.const}`);
      }
      if (rules.enum && !rules.enum.includes(record[key])) {
        errors.push(`Field ${key} has invalid enum value: ${record[key]}`);
      }
      if (rules.pattern && typeof record[key] === "string") {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(record[key])) {
          errors.push(`Field ${key} does not match pattern ${rules.pattern}`);
        }
      }
    }
  }
  return errors;
}

function routeExists(root, routePath) {
  if (!routePath || typeof routePath !== "string") {
    return false;
  }
  const absoluteBase = path.join(root, routePath);
  const candidates = [
    absoluteBase,
    `${absoluteBase}.html`,
    path.join(absoluteBase, "index.html")
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function toMarkdown(report) {
  const lines = [];
  lines.push("# Projection Validation Report");
  lines.push("");
  lines.push(`- Generated: ${report.generated_at}`);
  lines.push(`- Status: ${report.summary.status}`);
  lines.push(`- Errors: ${report.summary.errors}`);
  lines.push(`- Warnings: ${report.summary.warnings}`);
  lines.push(`- Projection count: ${report.summary.counts.projections}`);
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

function main() {
  const root = projectRoot();
  const knowledge = loadKnowledge(root);
  const schemaByType = loadProjectionSchemas(root);
  const projectionFiles = listProjectionFiles(root);
  const projections = projectionFiles.map((file) => ({
    file,
    record: readJson(file)
  }));

  const checks = [];

  const schemaCheck = { name: "Invalid Schemas", status: "pass", errors: [], warnings: [] };
  for (const projection of projections) {
    const projectionType = projection.record.projection_type;
    const schema = schemaByType[projectionType];
    if (!schema) {
      schemaCheck.errors.push(`Unknown projection_type "${projectionType}" in ${projection.file}`);
      continue;
    }
    const errors = simpleValidateAgainstSchema(schema, projection.record);
    schemaCheck.errors.push(...errors.map((msg) => `${projection.file}: ${msg}`));
  }
  if (schemaCheck.errors.length) {
    schemaCheck.status = "fail";
  }
  checks.push(schemaCheck);

  const duplicateCheck = { name: "Duplicate Projections", status: "pass", errors: [], warnings: [] };
  const idSet = new Set();
  const keySet = new Set();
  for (const projection of projections) {
    const id = projection.record.id;
    const key = `${projection.record.projection_type}:${projection.record.route_hint || projection.record.endpoint_hint || "none"}`;
    if (idSet.has(id)) {
      duplicateCheck.errors.push(`Duplicate projection id: ${id}`);
    }
    if (keySet.has(key)) {
      duplicateCheck.errors.push(`Duplicate projection key: ${key}`);
    }
    idSet.add(id);
    keySet.add(key);
  }
  if (duplicateCheck.errors.length) {
    duplicateCheck.status = "fail";
  }
  checks.push(duplicateCheck);

  const referenceCheck = { name: "Unknown Entities and Missing References", status: "pass", errors: [], warnings: [] };
  const entityIds = new Set(knowledge.entities.map((record) => record.id));
  const standardIds = new Set(knowledge.standards.map((record) => record.id));
  const datasetIds = new Set(knowledge.datasets.map((record) => record.id));

  for (const projection of projections) {
    const record = projection.record;
    const entityRefs = [
      record.entity_id,
      ...(record.rows || []).map((item) => item.entity_id).filter(Boolean),
      ...(record.related_entities || []),
      ...(record.quick_reference?.related_entity_ids || []),
      ...(record.faq || []).map((item) => item.answer_source?.entity_id).filter(Boolean)
    ].filter(Boolean);
    for (const ref of entityRefs) {
      if (!entityIds.has(ref)) {
        referenceCheck.errors.push(`${projection.file}: unknown entity reference ${ref}`);
      }
    }

    for (const ref of record.related_standards || []) {
      if (!standardIds.has(ref)) {
        referenceCheck.errors.push(`${projection.file}: unknown standard reference ${ref}`);
      }
    }
    for (const ref of record.related_datasets || []) {
      if (!datasetIds.has(ref)) {
        referenceCheck.errors.push(`${projection.file}: unknown dataset reference ${ref}`);
      }
    }

    for (const route of [...(record.related_tools || []), ...(record.related_charts || []), ...(record.related_guides || [])]) {
      if (!routeExists(root, route)) {
        referenceCheck.errors.push(`${projection.file}: missing route reference ${route}`);
      }
    }
  }
  if (referenceCheck.errors.length) {
    referenceCheck.status = "fail";
  }
  checks.push(referenceCheck);

  const orphanCheck = { name: "Orphan Projections", status: "pass", errors: [], warnings: [] };
  for (const projection of projections) {
    const record = projection.record;
    const hasConnections = Boolean(
      (record.related_entities && record.related_entities.length) ||
      (record.related_standards && record.related_standards.length) ||
      (record.related_datasets && record.related_datasets.length) ||
      (record.related_tools && record.related_tools.length) ||
      (record.related_charts && record.related_charts.length) ||
      (record.related_guides && record.related_guides.length)
    );
    if (!hasConnections) {
      orphanCheck.errors.push(`${projection.file}: projection has no connected references`);
    }
  }
  if (orphanCheck.errors.length) {
    orphanCheck.status = "fail";
  }
  checks.push(orphanCheck);

  const errorCount = checks.reduce((sum, check) => sum + check.errors.length, 0);
  const warningCount = checks.reduce((sum, check) => sum + check.warnings.length, 0);

  const report = {
    generated_at: new Date().toISOString(),
    summary: {
      status: errorCount > 0 ? "fail" : "pass",
      errors: errorCount,
      warnings: warningCount,
      counts: {
        projections: projections.length
      }
    },
    checks
  };

  const outJson = path.join(root, "docs", "architecture", "projection-validation-report.json");
  const outMd = path.join(root, "docs", "architecture", "projection-validation-report.md");
  writeJson(outJson, report);
  writeText(outMd, toMarkdown(report));
  console.log(`Validation report written: ${path.relative(root, outJson)}`);
  console.log(`Validation report written: ${path.relative(root, outMd)}`);

  if (report.summary.status === "fail") {
    process.exitCode = 1;
  }
}

main();
