# Reference Page Generator (B1.2)

## Purpose

`scripts/generators/generate-reference-page.js` is the first production consumer in the pipeline:

**Knowledge -> Relationship Resolver -> Projection -> Reference Page Generator -> HTML**

It proves the rule that production generators consume projection contracts, not raw knowledge objects.

## Input

- Projection: `data/projections/reference/pitch_diameter.reference.json`
- Projection schema: `data/projections/reference-page.schema.json`

The generator does not read entities, standards, datasets, or relationships directly.

## Output

- HTML: `reference/pitch-diameter-explained.html`

## Pipeline behavior

1. Load projection schema.
2. Load pitch diameter projection.
3. Validate schema fields and projection constraints.
4. Validate route/canonical/link and FAQ contract.
5. Render page using the existing BoltLab reference layout contract.
6. Abort on validation failure; write no partial output.

## Validation coverage

Before writing HTML, generator enforces:

- projection schema required fields
- projection type and entity id contract
- canonical URL equals `https://boltlab.io` + `route_hint`
- title presence and length guard
- meta description length guard (140-155)
- FAQ presence and source entity references
- related entities/standards/datasets against known ids for this consumer
- related tools/charts/guides route resolution

If any check fails, generation exits with non-zero status and does not write HTML.

## Deterministic guarantees

The generator is deterministic:

- identical projection input produces identical HTML bytes
- output ordering is fixed
- no random values or time-based mutation in render path

Verified with repeated runs using checksums in `audit/reference-page-diff.md`.

## Future expansion

This script is the reference implementation for migration strategy:

1. Add projection for next page.
2. Add page-specific consumer or shared projection consumer mode.
3. Preserve layout contract.
4. Keep validation-first abort behavior.
5. Track parity with `audit/*-diff.md`.

As migrations continue, every production page generator should remain projection-only and avoid raw knowledge reads.
