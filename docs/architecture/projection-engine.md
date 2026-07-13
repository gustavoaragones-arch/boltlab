# BoltLab Projection Engine (Phase B1.1)

## Why projections exist

The Knowledge Engine stores engineering truth.  
The Projection Engine translates that truth into output-specific contracts.

This separation prevents:

- page generators from interpreting raw entities directly
- output formats from owning engineering facts
- duplicated transformation logic across pages, charts, tools, and API payloads

Canonical pipeline:

1. Knowledge objects
2. Relationship resolver
3. Projection generator
4. Projection validation
5. Output generator

## Projection lifecycle

1. Add or update entity/relationship in `data/`.
2. Run `generate-projections.js` to build normalized projections.
3. Run `validate-projections.js` to enforce contract and integrity.
4. Consume projections in output generators (reference pages, charts, tools, API).
5. Regenerate outputs without re-encoding engineering facts in templates.

## Projection contracts

Projection schemas are defined in `data/projections/`:

- `reference-page.schema.json`
- `chart.schema.json`
- `tool.schema.json`
- `api.schema.json`

Each schema enforces:

- immutable projection id
- projection type contract
- reference-first links to entities, standards, datasets
- versioning (`version`, `created`, `updated`)

## Relationship resolver role

`scripts/utilities/relationship-resolver.js` centralizes traversal and join logic:

- resolve related entities
- resolve standards and datasets
- resolve route references (tools/charts/guides/pages)
- resolve relationship ids used by FAQ/source context

No generator should duplicate relationship traversal logic.

## Seed implementation (B1.1)

Generated projection:

- `data/projections/reference/pitch_diameter.reference.json`

This projection is normalized and reference-first:

- consumes `pitch_diameter` knowledge object
- references related ids (entities/standards/datasets)
- carries presentation contract fields (`title`, `route_hint`, `faq`, `schema`)
- does not duplicate engineering definitions as page-owned content

No production HTML is generated in this phase.

## Future API support

With projections in place, API endpoints can be generated from identical contracts used by UI generators.  
This enables:

- stable cross-surface payloads (web, mobile, AI, API)
- controlled deprecations via projection versioning
- reusable queryable structures for downstream integrations

## Governance rule after B1.1

No feature should bypass:

**Knowledge -> Projections -> Generators**

This keeps BoltLab scalable, deterministic, and free from page-level fact drift.
