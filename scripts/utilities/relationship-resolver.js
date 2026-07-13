const path = require("node:path");
const { walkFiles, readJson } = require("./path-utils");

function loadKnowledge(root) {
  const entitiesFile = path.join(root, "data", "entities", "entities.seed.json");
  const relationshipsFile = path.join(root, "data", "relationships", "relationships.seed.json");
  const standardsDir = path.join(root, "data", "standards");
  const datasetsDir = path.join(root, "data", "datasets");

  const entities = (readJson(entitiesFile).records || []);
  const relationships = (readJson(relationshipsFile).records || []);
  const standards = walkFiles(standardsDir)
    .filter((file) => file.endsWith(".seed.json"))
    .flatMap((file) => readJson(file).records || []);
  const datasets = walkFiles(datasetsDir)
    .filter((file) => file.endsWith(".seed.json"))
    .map((file) => readJson(file));

  const entityById = new Map(entities.map((record) => [record.id, record]));
  const standardById = new Map(standards.map((record) => [record.id, record]));
  const datasetById = new Map(datasets.map((record) => [record.id, record]));

  return {
    entities,
    standards,
    datasets,
    relationships,
    entityById,
    standardById,
    datasetById
  };
}

function unique(values) {
  return [...new Set(values)];
}

function resolveEntityContext(root, entityId) {
  const knowledge = loadKnowledge(root);
  const entity = knowledge.entityById.get(entityId);
  if (!entity) {
    throw new Error(`Unknown entity id: ${entityId}`);
  }

  const directRelationships = knowledge.relationships.filter(
    (record) => record.source === entityId || record.target === entityId
  );

  const relatedEntityIds = unique([
    ...(entity.related_entities || []),
    ...directRelationships
      .map((record) => (record.source === entityId ? record.target : record.source))
      .filter((id) => knowledge.entityById.has(id))
  ]).filter((id) => id !== entityId);

  const relatedStandardIds = unique([
    ...(entity.related_standards || []),
    ...directRelationships
      .map((record) => (knowledge.standardById.has(record.source) ? record.source : null))
      .filter(Boolean),
    ...directRelationships
      .map((record) => (knowledge.standardById.has(record.target) ? record.target : null))
      .filter(Boolean)
  ]);

  const relatedDatasetIds = unique([
    ...(entity.related_datasets || []),
    ...directRelationships
      .map((record) => (knowledge.datasetById.has(record.source) ? record.source : null))
      .filter(Boolean),
    ...directRelationships
      .map((record) => (knowledge.datasetById.has(record.target) ? record.target : null))
      .filter(Boolean)
  ]);

  return {
    entity,
    relatedEntityIds,
    relatedStandardIds,
    relatedDatasetIds,
    relatedTools: unique(entity.related_tools || []),
    relatedCharts: unique(entity.related_charts || []),
    relatedGuides: unique(entity.related_guides || []),
    relatedPages: unique(entity.related_pages || []),
    relationshipIds: unique(directRelationships.map((record) => record.id))
  };
}

module.exports = {
  loadKnowledge,
  resolveEntityContext
};
