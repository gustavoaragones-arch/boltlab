#!/usr/bin/env node
const path = require("node:path");
const { projectRoot, readJson, writeJson, writeText } = require("../utilities/path-utils");
const { loadKnowledge } = require("../utilities/relationship-resolver");

function main() {
  const root = projectRoot();
  const knowledge = loadKnowledge(root);
  const entityIds = new Set(knowledge.entities.map((r) => r.id));
  const standardIds = new Set(knowledge.standards.map((r) => r.id));
  const datasetIds = new Set(knowledge.datasets.map((r) => r.id));

  const profilePath = path.join(root, "data", "projections", "tapping", "tapping-profiles.json");
  const tapTypePath = path.join(root, "data", "projections", "tapping", "tap-types.json");
  const profileProjection = readJson(profilePath);
  const tapTypeProjection = readJson(tapTypePath);

  const checks = [];

  // 1. Unique tapping_profile_id / canonical thread references
  const idCheck = { name: "Unique Projection IDs and Canonical Thread References", status: "pass", errors: [], warnings: [] };
  const seenIds = new Set();
  const seenThreads = new Set();
  for (const row of profileProjection.rows) {
    if (seenIds.has(row.tapping_profile_id)) {
      idCheck.errors.push(`Duplicate tapping_profile_id: ${row.tapping_profile_id}`);
    }
    seenIds.add(row.tapping_profile_id);
    const threadKey = `${row.thread.thread_system}:${row.thread.designation}`;
    if (seenThreads.has(threadKey)) {
      idCheck.errors.push(`Duplicate canonical thread reference: ${threadKey}`);
    }
    seenThreads.add(threadKey);
  }
  if (idCheck.errors.length) idCheck.status = "fail";
  checks.push(idCheck);

  // 2. Valid entity/dataset/standard references
  const refCheck = { name: "Valid Entity, Dataset, and Standard References", status: "pass", errors: [], warnings: [] };
  for (const row of profileProjection.rows) {
    if (row.thread.source_entity_id && !entityIds.has(row.thread.source_entity_id)) {
      refCheck.errors.push(`${row.tapping_profile_id}: unknown thread.source_entity_id ${row.thread.source_entity_id}`);
    }
    if (!datasetIds.has(row.thread.source_dataset)) {
      refCheck.errors.push(`${row.tapping_profile_id}: unknown thread.source_dataset ${row.thread.source_dataset}`);
    }
    if (!datasetIds.has(row.tap_drill.provenance.source_dataset)) {
      refCheck.errors.push(`${row.tapping_profile_id}: unknown tap_drill provenance source_dataset ${row.tap_drill.provenance.source_dataset}`);
    }
    for (const tapTypeId of row.tap_types) {
      if (!entityIds.has(tapTypeId)) {
        refCheck.errors.push(`${row.tapping_profile_id}: unknown tap_type reference ${tapTypeId}`);
      }
    }
    for (const std of row.standards) {
      if (!standardIds.has(std.standard_id)) {
        refCheck.errors.push(`${row.tapping_profile_id}: unknown standard reference ${std.standard_id}`);
      }
    }
    if (row.alternative_drill && !standardIds.has(row.alternative_drill.standard_id)) {
      refCheck.errors.push(`${row.tapping_profile_id}: unknown alternative_drill.standard_id ${row.alternative_drill.standard_id}`);
    }
  }
  for (const row of tapTypeProjection.rows) {
    if (!entityIds.has(row.entity_id)) {
      refCheck.errors.push(`tap-types.json: unknown entity_id ${row.entity_id}`);
    }
  }
  if (refCheck.errors.length) refCheck.status = "fail";
  checks.push(refCheck);

  // 3. Provenance completeness
  const provenanceCheck = { name: "Provenance Completeness", status: "pass", errors: [], warnings: [] };
  for (const row of profileProjection.rows) {
    const p = row.tap_drill.provenance;
    if (!p.source_dataset || !p.source_record || !p.source_field) {
      provenanceCheck.errors.push(`${row.tapping_profile_id}: incomplete tap_drill provenance`);
    }
    if (!row.data_quality.provenance_complete) {
      provenanceCheck.errors.push(`${row.tapping_profile_id}: data_quality.provenance_complete is false`);
    }
  }
  if (provenanceCheck.errors.length) provenanceCheck.status = "fail";
  checks.push(provenanceCheck);

  // 4. Verification-state correctness (no invented promotion)
  const stateCheck = { name: "Verification-State Correctness", status: "pass", errors: [], warnings: [] };
  const validStates = new Set(["verified", "source_bound", "pending_verification", "unavailable"]);
  for (const row of profileProjection.rows) {
    if (!validStates.has(row.tap_drill.status)) {
      stateCheck.errors.push(`${row.tapping_profile_id}: invalid tap_drill.status ${row.tap_drill.status}`);
    }
    if (!validStates.has(row.data_quality.record_status)) {
      stateCheck.errors.push(`${row.tapping_profile_id}: invalid data_quality.record_status ${row.data_quality.record_status}`);
    }
    if (row.alternative_drill && !validStates.has(row.alternative_drill.status)) {
      stateCheck.errors.push(`${row.tapping_profile_id}: invalid alternative_drill.status ${row.alternative_drill.status}`);
    }
  }
  if (stateCheck.errors.length) stateCheck.status = "fail";
  checks.push(stateCheck);

  // 5. ISO 2306 alternative structural correctness (never merged with tap_drill)
  const isoCheck = { name: "ISO 2306 Alternative Structural Correctness", status: "pass", errors: [], warnings: [] };
  for (const row of profileProjection.rows) {
    const isUncOrUnf = row.thread.thread_system === "UNC" || row.thread.thread_system === "UNF";
    if (isUncOrUnf && !row.alternative_drill) {
      isoCheck.errors.push(`${row.tapping_profile_id}: UNC/UNF profile missing alternative_drill`);
    }
    if (!isUncOrUnf && row.alternative_drill) {
      isoCheck.errors.push(`${row.tapping_profile_id}: non-UNC/UNF profile unexpectedly has alternative_drill`);
    }
    if (row.alternative_drill) {
      if (row.alternative_drill.unit === row.tap_drill.unit && row.alternative_drill.value === row.tap_drill.value) {
        isoCheck.errors.push(`${row.tapping_profile_id}: alternative_drill appears merged/identical to tap_drill`);
      }
      if (row.alternative_drill.unit !== "mm") {
        isoCheck.errors.push(`${row.tapping_profile_id}: alternative_drill.unit expected mm, got ${row.alternative_drill.unit}`);
      }
    }
  }
  if (isoCheck.errors.length) isoCheck.status = "fail";
  checks.push(isoCheck);

  // 6. No unsupported engagement recommendations / no 75% target anywhere in the file
  const engagementCheck = { name: "No Unsupported Engagement Recommendations", status: "pass", errors: [], warnings: [] };
  const rawText = JSON.stringify(profileProjection);
  if (/target_percent"\s*:\s*(?!null)\d/.test(rawText)) {
    engagementCheck.errors.push("A non-null target_percent value was found -- engagement targets must never be projected.");
  }
  if (/\b75\s*%|\b75 percent\b/i.test(rawText.replace(/https?:\/\/\S+/g, ""))) {
    engagementCheck.errors.push("A literal 75% figure was found in the projection output.");
  }
  for (const row of profileProjection.rows) {
    if (row.engagement.axial.calculation_status !== "not_calculable") {
      engagementCheck.errors.push(`${row.tapping_profile_id}: axial.calculation_status must remain not_calculable`);
    }
    if (row.engagement.radial.target_percent !== null) {
      engagementCheck.errors.push(`${row.tapping_profile_id}: radial.target_percent must remain null`);
    }
  }
  if (engagementCheck.errors.length) engagementCheck.status = "fail";
  checks.push(engagementCheck);

  // 7. No orphan projected tap types / tapping profiles
  const orphanCheck = { name: "No Orphan Projected Tap Types or Tapping Profiles", status: "pass", errors: [], warnings: [] };
  for (const row of profileProjection.rows) {
    if (!row.standards || row.standards.length === 0) {
      orphanCheck.errors.push(`${row.tapping_profile_id}: no standards resolved (orphan)`);
    }
  }
  for (const row of tapTypeProjection.rows) {
    const noteCount =
      row.general_taxonomy.length + row.manufacturing_characteristics.length + row.typical_applications.length + row.manufacturer_specific_recommendations.length;
    if (noteCount === 0) {
      orphanCheck.warnings.push(`tap-types.json: ${row.entity_id} has no application notes`);
    }
  }
  if (orphanCheck.errors.length) orphanCheck.status = "fail";
  checks.push(orphanCheck);

  // 8. Hole-preparation taxonomy not flattened (spot-check: entity taxonomy_axis values still distinct in knowledge layer)
  const taxonomyCheck = { name: "Hole-Preparation Taxonomy Not Flattened", status: "pass", errors: [], warnings: [] };
  const holePrepEntities = knowledge.entities.filter((e) => e.entity_type === "hole_preparation");
  const axisValues = new Set(holePrepEntities.map((e) => e.taxonomy_axis).filter(Boolean));
  if (axisValues.size < 2) {
    taxonomyCheck.errors.push("hole_preparation entities do not preserve multiple distinct taxonomy_axis values -- taxonomy may have been flattened.");
  }
  checks.push(taxonomyCheck);

  // 9. Application-note completeness: every knowledge-layer application_notes classification
  // must have a corresponding projection array, and every individual fact (matched by exact
  // text) must appear exactly once downstream with its classification, status, and source
  // preserved unchanged. Added after a real bug where general_taxonomy facts (including one
  // VERIFIED, primary-sourced fact) were silently dropped because the projection's row shape
  // had no array for that classification -- see audit/t3-tap-type-correction.md.
  const completenessCheck = { name: "Application-Note Completeness (No Silent Drop, Duplication, or Reclassification)", status: "pass", errors: [], warnings: [] };
  const CLASSIFICATION_TO_FIELD = {
    general_taxonomy: "general_taxonomy",
    manufacturing_characteristic: "manufacturing_characteristics",
    typical_application: "typical_applications",
    manufacturer_specific_recommendation: "manufacturer_specific_recommendations"
  };
  const tapTypeEntitiesById = new Map(
    knowledge.entities.filter((e) => e.entity_type === "tap_type").map((e) => [e.id, e])
  );
  for (const row of tapTypeProjection.rows) {
    const entity = tapTypeEntitiesById.get(row.entity_id);
    if (!entity) {
      completenessCheck.errors.push(`${row.entity_id}: no matching tap_type entity found in knowledge layer`);
      continue;
    }
    const sourceNotes = entity.application_notes || [];
    for (const note of sourceNotes) {
      const field = CLASSIFICATION_TO_FIELD[note.classification];
      if (!field) {
        completenessCheck.errors.push(`${row.entity_id}: unknown application_notes classification "${note.classification}" has no projection field -- would be silently dropped`);
        continue;
      }
      const projected = (row[field] || []).filter((n) => n.fact === note.fact);
      if (projected.length === 0) {
        completenessCheck.errors.push(`${row.entity_id}: fact dropped from projection -- "${note.fact.slice(0, 60)}..."`);
      } else if (projected.length > 1) {
        completenessCheck.errors.push(`${row.entity_id}: fact duplicated in projection (${projected.length}x) -- "${note.fact.slice(0, 60)}..."`);
      } else if (projected[0].status !== note.status) {
        completenessCheck.errors.push(`${row.entity_id}: fact status changed in projection (source=${note.status}, projected=${projected[0].status})`);
      } else if (projected[0].source !== note.source) {
        // (T15) The comment above this check has always claimed "source" is verified preserved,
        // but until now nothing actually compared it -- a knowledge-layer edit, a future generator
        // refactor, or a hand-edited projection could substitute a fabricated or stale citation for
        // any fact while every prior check here (and every other validator) still passed, since
        // fact/status/count all stayed correct. This closes that gap.
        completenessCheck.errors.push(
          `${row.entity_id}: fact source changed in projection (source="${note.source}", projected="${projected[0].source}") -- "${note.fact.slice(0, 60)}..."`
        );
      }
    }
    const projectedTotal =
      (row.general_taxonomy || []).length +
      (row.manufacturing_characteristics || []).length +
      (row.typical_applications || []).length +
      (row.manufacturer_specific_recommendations || []).length;
    if (projectedTotal !== sourceNotes.length) {
      completenessCheck.errors.push(`${row.entity_id}: projected fact count (${projectedTotal}) does not match source application_notes count (${sourceNotes.length})`);
    }
  }
  if (completenessCheck.errors.length) completenessCheck.status = "fail";
  checks.push(completenessCheck);

  // 10. (T13) Tap-drill status must be correctly derived from the source dataset's cross-
  // verification signal, not merely from the PRESENCE of a cross_verified object. The schema
  // carries a `match` boolean on every cross_verified entry -- it anticipates a genuine cross-
  // check that could find a mismatch, not just an attempt at one. generate-tapping-projections.js's
  // buildTapDrillBlock() derives status from Boolean(hp.cross_verified) alone and never consults
  // .match. Check 4 above only confirms the OUTPUT value is a member of the valid-state enum,
  // which would still pass even if the underlying derivation were wrong (e.g. a future record with
  // cross_verified present but match: false would still be labeled "verified"). This check closes
  // that gap by independently re-deriving the expected status directly from source and comparing.
  const derivationCheck = { name: "Tap-Drill Status Correctly Derived From Source Cross-Verification", status: "pass", errors: [], warnings: [] };
  const TAPPING_DATASET_IDS = ["metric_tapping", "unc_tapping", "unf_tapping"];
  const sourceRecordById = new Map();
  for (const dsId of TAPPING_DATASET_IDS) {
    const ds = knowledge.datasetById.get(dsId);
    if (!ds) {
      derivationCheck.errors.push(`Source dataset '${dsId}' not found in knowledge layer -- cannot verify tap_drill.status derivation`);
      continue;
    }
    for (const rec of ds.records || []) {
      sourceRecordById.set(rec.tapping_profile_id, rec);
    }
  }
  for (const row of profileProjection.rows) {
    const sourceRecord = sourceRecordById.get(row.tapping_profile_id);
    if (!sourceRecord) {
      derivationCheck.errors.push(`${row.tapping_profile_id}: no matching source dataset record found -- cannot verify tap_drill.status derivation`);
      continue;
    }
    const hp = sourceRecord.hole_preparation;
    const crossVerified = hp ? hp.cross_verified : null;
    const expectedStatus = crossVerified && crossVerified.match !== false ? "verified" : "source_bound";
    if (row.tap_drill.status !== expectedStatus) {
      derivationCheck.errors.push(
        `${row.tapping_profile_id}: tap_drill.status is '${row.tap_drill.status}' but the source dataset's hole_preparation.cross_verified state derives to '${expectedStatus}' -- possible incorrect derivation or stale projection`
      );
    }
  }
  if (derivationCheck.errors.length) derivationCheck.status = "fail";
  checks.push(derivationCheck);

  // 11. (T14) tap_drill.convention and tap_drill.provenance.{source,cross_check} are derived from
  // the SAME crossVerified signal as tap_drill.status (check 10 above) inside buildTapDrillBlock(),
  // but check 10 only ever re-derived and compared `status`. These three sibling fields share the
  // identical incompleteness (presence-only, ignoring .match) and had zero independent coverage.
  // For metric rows, `convention` text and the provenance narrative must agree with the same
  // match-aware source derivation as status. UNC/UNF rows always use the fixed
  // "US customary drill-series" convention regardless of cross-verification (no UNC/UNF record
  // ever carries cross_verified -- confirmed directly against both dataset files) and never carry
  // a cross-check narrative, so no cross-verification semantics are invented for them here.
  const narrativeCheck = {
    name: "Tap-Drill Convention and Cross-Check Narrative Correctly Derived From Source Cross-Verification",
    status: "pass",
    errors: [],
    warnings: []
  };
  for (const row of profileProjection.rows) {
    const sourceRecord = sourceRecordById.get(row.tapping_profile_id);
    if (!sourceRecord) {
      narrativeCheck.errors.push(`${row.tapping_profile_id}: no matching source dataset record found -- cannot verify tap_drill.convention/provenance derivation`);
      continue;
    }
    const hp = sourceRecord.hole_preparation;
    const crossVerified = hp ? hp.cross_verified : null;
    const isMatch = Boolean(crossVerified && crossVerified.match !== false);

    if (row.thread.thread_system === "metric") {
      const expectedConvention = isMatch
        ? "ISO 2306 nominal-minus-pitch (BoltLab primary-source table match)"
        : "ISO 2306 nominal-minus-pitch (not independently cross-checked against the primary table)";
      if (row.tap_drill.convention !== expectedConvention) {
        narrativeCheck.errors.push(
          `${row.tapping_profile_id}: tap_drill.convention is '${row.tap_drill.convention}' but the source cross-verification state derives to '${expectedConvention}'`
        );
      }
    } else if (row.tap_drill.convention !== "US customary drill-series") {
      narrativeCheck.errors.push(
        `${row.tapping_profile_id}: non-metric tap_drill.convention is '${row.tap_drill.convention}', expected the fixed 'US customary drill-series'`
      );
    }

    const expectedSource = isMatch ? crossVerified.source : null;
    if ((row.tap_drill.provenance.source || null) !== (expectedSource || null)) {
      narrativeCheck.errors.push(
        `${row.tapping_profile_id}: tap_drill.provenance.source is '${row.tap_drill.provenance.source}' but the source cross-verification state derives to '${expectedSource}'`
      );
    }

    const expectedCrossCheck = isMatch
      ? `Matches ${crossVerified.table} exactly (verified ${crossVerified.verified_date})`
      : null;
    if ((row.tap_drill.provenance.cross_check || null) !== (expectedCrossCheck || null)) {
      narrativeCheck.errors.push(
        `${row.tapping_profile_id}: tap_drill.provenance.cross_check is '${row.tap_drill.provenance.cross_check}' but the source cross-verification state derives to '${expectedCrossCheck}'`
      );
    }
  }
  if (narrativeCheck.errors.length) narrativeCheck.status = "fail";
  checks.push(narrativeCheck);

  // 12. (T16) profileProjection.rows[].standards[] denormalizes organization/designation/edition/
  // title/verification_state from the resolved standard record at generation time
  // (buildStandardsBlock() in generate-tapping-projections.js). Check 2 above only confirms
  // standard_id resolves to SOME real standard -- it never compares these five denormalized
  // fields back to that record. A stale projection (source standard record edited, projection not
  // regenerated), a hand-edit to tapping-profiles.json, or a future generator refactor pulling the
  // wrong field could substitute a wrong-but-plausible designation/title/edition for a
  // still-validly-referenced standard_id, and every existing check -- including check 2 -- would
  // still pass. This closes that gap by independently re-deriving each field from source and
  // comparing.
  const standardsFidelityCheck = {
    name: "Standards Denormalized Fields Match Authoritative Standard Record",
    status: "pass",
    errors: [],
    warnings: []
  };
  const FIELDS_TO_VERIFY = [
    { projectedKey: "organization", sourceKey: "organization" },
    { projectedKey: "designation", sourceKey: "designation" },
    { projectedKey: "edition", sourceKey: "edition" },
    { projectedKey: "title", sourceKey: "title" },
    { projectedKey: "verification_state", sourceKey: "standard_status" }
  ];
  for (const row of profileProjection.rows) {
    for (const projectedStandard of row.standards || []) {
      const authoritative = knowledge.standardById.get(projectedStandard.standard_id);
      if (!authoritative) {
        // Already reported by check 2 as an unknown reference; do not duplicate the error here.
        continue;
      }
      for (const { projectedKey, sourceKey } of FIELDS_TO_VERIFY) {
        const projectedValue = projectedStandard[projectedKey] ?? null;
        const authoritativeValue = authoritative[sourceKey] ?? null;
        if (projectedValue !== authoritativeValue) {
          standardsFidelityCheck.errors.push(
            `${row.tapping_profile_id} (designation ${row.thread.designation}) standard '${projectedStandard.standard_id}': ${projectedKey} mismatch -- authoritative value is '${authoritativeValue}', projected value is '${projectedValue}'`
          );
        }
      }
    }
  }
  if (standardsFidelityCheck.errors.length) standardsFidelityCheck.status = "fail";
  checks.push(standardsFidelityCheck);

  // 13. (T17) profileProjection.rows[].tap_types[] is derived in buildProfileRows() by resolving
  // the relationship graph -- RELATES_TO edges from the profile's operation entity, filtered to
  // tap_type entities. Check 2 above only confirms each element already sitting in tap_types[] is
  // a real entity id; it never confirms the SET matches what the relationship graph currently
  // establishes for that operation. A future edit to relationships.seed.json (an added or removed
  // RELATES_TO edge), left unregenerated, would silently show the wrong "relevant tap types" on
  // every affected product -- Atlas, Workflow, Evidence, and the CSV all read this same field --
  // while every existing check, including check 2, kept passing. This closes that gap by
  // independently re-deriving the expected membership set from source and comparing it exactly
  // (not merely comparing array length or individual ids).
  const tapTypeMembershipCheck = {
    name: "Tap-Type Relationship Membership Matches Authoritative RELATES_TO Graph",
    status: "pass",
    errors: [],
    warnings: []
  };
  for (const row of profileProjection.rows) {
    const sourceRecord = sourceRecordById.get(row.tapping_profile_id);
    if (!sourceRecord) {
      tapTypeMembershipCheck.errors.push(
        `${row.tapping_profile_id}: no matching source dataset record found -- cannot verify tap_types[] derivation`
      );
      continue;
    }
    const operation = sourceRecord.operation;
    const expectedTapTypes = knowledge.relationships
      .filter((r) => r.predicate === "RELATES_TO" && r.source === operation && tapTypeEntitiesById.has(r.target))
      .map((r) => r.target)
      .sort();
    const actualTapTypes = [...row.tap_types].sort();
    const expectedSet = new Set(expectedTapTypes);
    const actualSet = new Set(actualTapTypes);
    const missing = expectedTapTypes.filter((id) => !actualSet.has(id));
    const unexpected = actualTapTypes.filter((id) => !expectedSet.has(id));
    if (missing.length || unexpected.length) {
      tapTypeMembershipCheck.errors.push(
        `${row.tapping_profile_id} (designation ${row.thread.designation}, operation '${operation}'): tap_types[] membership mismatch -- missing: [${missing.join(", ") || "none"}], unexpected: [${unexpected.join(", ") || "none"}]`
      );
    }
  }
  if (tapTypeMembershipCheck.errors.length) tapTypeMembershipCheck.status = "fail";
  checks.push(tapTypeMembershipCheck);

  // 14. (T18) row.thread.{designation, nominal_diameter, pitch, threads_per_inch, coarse_fine,
  // standard_family} are copied directly from the resolved thread-dataset record in
  // buildThreadBlock() -- metric_threads.seed.json / unc.seed.json / unf.seed.json, matched by
  // designation. No existing check re-derives these values from that source and compares them;
  // check 2 only confirms thread.source_dataset and thread.source_entity_id resolve to something
  // real, never that the copied engineering values themselves still match what that source
  // currently says. A future edit to a thread-dataset record (e.g. a corrected pitch or diameter),
  // left unregenerated, would silently show the wrong engineering values under a still-valid-looking
  // designation on every product that renders this block -- Atlas (HTML + CSV), Workflow (HTML +
  // client-data JS), and Evidence -- while every existing check kept passing. This closes that gap.
  const threadFidelityCheck = {
    name: "Thread Block Engineering Values Match Authoritative Thread Dataset Record",
    status: "pass",
    errors: [],
    warnings: []
  };
  const THREAD_DATASET_ID_BY_SYSTEM = {
    metric: "metric_threads",
    UNC: "unc_threads",
    UNF: "unf_threads"
  };
  for (const row of profileProjection.rows) {
    const threadDatasetId = THREAD_DATASET_ID_BY_SYSTEM[row.thread.thread_system];
    if (!threadDatasetId) {
      threadFidelityCheck.errors.push(
        `${row.tapping_profile_id}: unrecognized thread.thread_system '${row.thread.thread_system}' -- cannot verify thread block derivation`
      );
      continue;
    }
    const threadDataset = knowledge.datasetById.get(threadDatasetId);
    if (!threadDataset) {
      threadFidelityCheck.errors.push(
        `${row.tapping_profile_id}: source dataset '${threadDatasetId}' not found in knowledge layer -- cannot verify thread block derivation`
      );
      continue;
    }
    const base = (threadDataset.records || []).find((r) => r.designation === row.thread.designation);
    if (!base) {
      threadFidelityCheck.errors.push(
        `${row.tapping_profile_id}: no base thread record found for designation '${row.thread.designation}' in ${threadDatasetId} -- cannot verify thread block derivation`
      );
      continue;
    }
    const isMetric = row.thread.thread_system === "metric";
    const expected = {
      designation: base.designation,
      nominal_diameter: isMetric ? base.nominal_diameter_mm : base.nominal_diameter_in,
      pitch: isMetric ? base.pitch_mm : null,
      threads_per_inch: isMetric ? null : base.threads_per_inch,
      coarse_fine: base.thread_series,
      standard_family: isMetric ? base.iso_family : base.standards_family
    };
    for (const field of Object.keys(expected)) {
      const projectedValue = row.thread[field] ?? null;
      const authoritativeValue = expected[field] ?? null;
      if (projectedValue !== authoritativeValue) {
        threadFidelityCheck.errors.push(
          `${row.tapping_profile_id} (thread_system ${row.thread.thread_system}): thread.${field} mismatch -- authoritative value is '${authoritativeValue}', projected value is '${projectedValue}'`
        );
      }
    }
  }
  if (threadFidelityCheck.errors.length) threadFidelityCheck.status = "fail";
  checks.push(threadFidelityCheck);

  // 15. (T19) buildTapDrillBlock() copies hole_preparation.value/.unit directly into
  // tap_drill.value/.unit, and separately copies hole_preparation.source_dataset/.source_record/
  // .source_field into tap_drill.provenance.{source_dataset,source_record,source_field} -- a
  // self-declared pointer identifying exactly which field of which record in which dataset
  // justifies the value. Check 3 above only confirms that pointer is non-empty; no check anywhere
  // (this validator, validate-tapping-domain.js, or validate-tapping-terminology.js's consumer-
  // fidelity comparison against the rendered HTML) ever DEREFERENCES it and confirms it resolves to
  // tap_drill.value. This is a distinct join from check 14's thread-block lookup (profile.thread_id
  // -> designation): here the pointer itself lives on the hole_preparation record and is asserted,
  // not re-derived. A future edit to the cited thread-dataset field (e.g. a corrected tap_drill_mm),
  // left unsynced in the tapping dataset and unregenerated in the projection, would silently show
  // the wrong primary drill-size recommendation under a still-complete-looking provenance citation
  // on every product -- Atlas (HTML + CSV), Workflow (HTML + client-data JS), and Evidence -- while
  // every existing check, including check 3's presence check, kept passing. This closes that gap.
  const tapDrillProvenanceChainCheck = {
    name: "Tap-Drill Value Provenance Chain Resolves To The Authoritative Source Field",
    status: "pass",
    errors: [],
    warnings: []
  };
  const VALID_UNIT_SOURCE_FIELD_PAIRINGS = {
    mm: "tap_drill_mm",
    in: "tap_drill_in"
  };
  for (const row of profileProjection.rows) {
    const prov = row.tap_drill.provenance;
    const chain = `${prov.source_dataset}.${prov.source_record}.${prov.source_field}`;
    const expectedField = VALID_UNIT_SOURCE_FIELD_PAIRINGS[row.tap_drill.unit];
    if (!expectedField || expectedField !== prov.source_field) {
      tapDrillProvenanceChainCheck.errors.push(
        `${row.tapping_profile_id}: tap_drill.unit '${row.tap_drill.unit}' does not match provenance.source_field '${prov.source_field}' -- expected pairing mm/tap_drill_mm or in/tap_drill_in`
      );
    }
    const sourceDataset = knowledge.datasetById.get(prov.source_dataset);
    if (!sourceDataset) {
      tapDrillProvenanceChainCheck.errors.push(
        `${row.tapping_profile_id}: provenance chain '${chain}' -- source dataset '${prov.source_dataset}' not found in knowledge layer`
      );
      continue;
    }
    const sourceRecord = (sourceDataset.records || []).find((r) => r.designation === prov.source_record);
    if (!sourceRecord) {
      tapDrillProvenanceChainCheck.errors.push(
        `${row.tapping_profile_id}: provenance chain '${chain}' -- no record with designation '${prov.source_record}' found in ${prov.source_dataset}`
      );
      continue;
    }
    const authoritativeValue = sourceRecord[prov.source_field];
    if (authoritativeValue === undefined) {
      tapDrillProvenanceChainCheck.errors.push(
        `${row.tapping_profile_id}: provenance chain '${chain}' -- field '${prov.source_field}' does not exist on the cited source record`
      );
      continue;
    }
    if (authoritativeValue !== row.tap_drill.value) {
      tapDrillProvenanceChainCheck.errors.push(
        `${row.tapping_profile_id}: tap_drill.value mismatch -- provenance chain '${chain}' resolves to '${authoritativeValue}', projected tap_drill.value is '${row.tap_drill.value}'`
      );
    }
  }
  if (tapDrillProvenanceChainCheck.errors.length) tapDrillProvenanceChainCheck.status = "fail";
  checks.push(tapDrillProvenanceChainCheck);

  // 16. (T20) buildDataQualityBlock() copies profile.status directly into
  // data_quality.record_status with zero transformation. Check 4 above only confirms the copied
  // value is a member of the valid-state enum -- it never compares it to the source tapping-dataset
  // record's own .status field. record_status is rendered on every tapping product (Atlas card +
  // CSV, Workflow result/comparison + client-data JS, Evidence per-row label) and additionally
  // feeds the Evidence page's aggregate recordVerified/recordSourceBound scoreboard counts
  // (computeCounts() in generate-tapping-evidence.js). A future edit to a tapping-dataset record's
  // status, left unregenerated, would silently show the wrong overall record status -- and the
  // wrong aggregate verification count -- on every product while every existing check, including
  // check 4's enum check, kept passing. This closes that gap.
  const recordStatusFidelityCheck = {
    name: "Data-Quality Record-Status Matches Authoritative Tapping-Dataset Record",
    status: "pass",
    errors: [],
    warnings: []
  };
  for (const row of profileProjection.rows) {
    const sourceRecord = sourceRecordById.get(row.tapping_profile_id);
    if (!sourceRecord) {
      recordStatusFidelityCheck.errors.push(
        `${row.tapping_profile_id}: no matching source dataset record found -- cannot verify data_quality.record_status derivation`
      );
      continue;
    }
    if (sourceRecord.status !== row.data_quality.record_status) {
      recordStatusFidelityCheck.errors.push(
        `${row.tapping_profile_id}: data_quality.record_status is '${row.data_quality.record_status}' but the authoritative tapping-dataset record's status is '${sourceRecord.status}'`
      );
    }
  }
  if (recordStatusFidelityCheck.errors.length) recordStatusFidelityCheck.status = "fail";
  checks.push(recordStatusFidelityCheck);

  const errorCount = checks.reduce((sum, c) => sum + c.errors.length, 0);
  const warningCount = checks.reduce((sum, c) => sum + c.warnings.length, 0);

  const report = {
    generated_at: "2026-08-15T00:00:00.000Z",
    status: errorCount > 0 ? "fail" : "pass",
    errors: errorCount,
    warnings: warningCount,
    counts: {
      tapping_profile_rows: profileProjection.rows.length,
      tap_type_rows: tapTypeProjection.rows.length
    },
    checks
  };

  const outJson = path.join(root, "docs", "architecture", "tapping-projection-validation-report.json");
  const outMd = path.join(root, "docs", "architecture", "tapping-projection-validation-report.md");
  writeJson(outJson, report);

  const lines = [];
  lines.push("# Tapping Projection Validation Report");
  lines.push("");
  lines.push(`- Status: ${report.status}`);
  lines.push(`- Errors: ${report.errors}`);
  lines.push(`- Warnings: ${report.warnings}`);
  lines.push(`- Tapping profile rows: ${report.counts.tapping_profile_rows}`);
  lines.push(`- Tap type rows: ${report.counts.tap_type_rows}`);
  lines.push("");
  lines.push("## Checks");
  lines.push("");
  for (const check of checks) {
    lines.push(`### ${check.name}`);
    lines.push(`- Status: ${check.status}`);
    lines.push(`- Errors: ${check.errors.length}`);
    lines.push(`- Warnings: ${check.warnings.length}`);
    for (const e of check.errors) lines.push(`  - ERROR: ${e}`);
    for (const w of check.warnings) lines.push(`  - WARNING: ${w}`);
    lines.push("");
  }
  writeText(outMd, `${lines.join("\n")}\n`);

  console.log(`Validation report written: ${path.relative(root, outJson)}`);
  console.log(`Validation report written: ${path.relative(root, outMd)}`);
  console.log(`Status: ${report.status} | errors=${report.errors} | warnings=${report.warnings}`);

  if (report.status === "fail") {
    process.exitCode = 1;
  }
}

main();
