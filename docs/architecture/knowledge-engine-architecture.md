# BoltLab Knowledge Engine Architecture (Phase B1.0)

## Knowledge model

BoltLab uses `knowledge objects` as the atomic source of truth:

1. **Entities** define engineering concepts (`pitch_diameter`, `fit_class_6h`).
2. **Standards** define source references (`iso_965_1`, `asme_b1_1`).
3. **Datasets** define measurable values (`metric_threads`, `unc_threads`).
4. **Relationships** connect concepts and sources into a navigable graph.

Delivery artifacts (pages, charts, calculators, JSON-LD, future API payloads, future AI context) consume this model and must not own facts directly.

## Folder structure

```text
data/
  entities/
  standards/
    iso/
    din/
    ansi/
    asme/
    jis/
    bs/
    other/
  datasets/
  relationships/
  schemas/
scripts/
  generators/
  validators/
  utilities/
docs/
  architecture/
```

## Entity lifecycle

1. **Propose** new immutable entity id in snake_case.
2. **Define** title, summary, definition, and linked standards/datasets.
3. **Connect** entity into graph using relationships.
4. **Validate** references, duplicates, cycles, orphan risk, and asset links.
5. **Promote** from `draft` to `active` once references are stable.
6. **Deprecate** via status when replaced, never by changing immutable id.

## Generator pipeline

Entrypoint: `scripts/generators/generate-engineering-pages.js`

Pipeline contract:

- Load knowledge objects from `data/`.
- Resolve relationship graph and derived joins.
- Build normalized projection for one output type.
- Emit only generated artifacts owned by that generator.
- Avoid duplicating join logic; shared functions live in `scripts/utilities/`.

Planned generator modules:

- `generate-reference-pages.js`
- `generate-chart-pages.js`
- `generate-schema.js`
- `generate-api-data.js`
- `generate-sitemap.js`

## Relationship model

Relationships are directional and typed:

- `source` (id)
- `predicate` (`USES`, `DEFINED_BY`, `RELATES_TO`, etc.)
- `target` (id)
- `strength` (`0..1`)
- `notes`
- `version`, `created`, `updated`

Rules:

- Source and target must be known immutable ids.
- Relationships are standalone records, never embedded as ad hoc prose.
- Circular loops are disallowed for entity-to-entity graph paths.

## Validation process

Validator entrypoint: `scripts/validators/validate-knowledge-engine.js`

Outputs (both required):

- Machine-readable: `docs/architecture/validation-report.json`
- Human-readable: `docs/architecture/validation-report.md`

Implemented checks in B1.0 scaffold:

- Schema field completeness
- Duplicate ids
- Reference integrity (entities, standards, datasets, relationships)
- Circular relationship detection
- Orphan entities
- Missing SVG assets
- Generator module presence

## Versioning policy

All records in entities, standards, datasets, and relationships must include:

- `version` (`vMAJOR.MINOR.PATCH`)
- `created` (`YYYY-MM-DD`)
- `updated` (`YYYY-MM-DD`)

Guidelines:

- Increment **patch** for typo or non-semantic metadata updates.
- Increment **minor** for additive schema-safe fields.
- Increment **major** for schema-breaking or semantics-changing updates.
- Never mutate immutable ids to represent version changes.

## Contribution rules

1. Do not add page-owned engineering facts; add them in `data/` first.
2. Keep one fact in one canonical record only.
3. Always reference immutable ids, never free-text joins.
4. Validate before merge; reports must be updated in the same change.
5. Do not store copyrighted standards text; keep public summaries only.
6. Keep dataset values source-attributed via `source_standards`.
7. Keep generator modules output-specific and composable.
