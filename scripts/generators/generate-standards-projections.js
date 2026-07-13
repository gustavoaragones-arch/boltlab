#!/usr/bin/env node
const path = require("node:path");
const { projectRoot, readJson, writeJson } = require("../utilities/path-utils");

const TARGETS = {
  iso_68_1: {
    route: "/reference/iso-68-thread-profile",
    title: "ISO 68-1 Thread Profile Explained",
    subtitle: "Basic profile geometry for ISO metric screw threads.",
    meta: "ISO 68-1 explained for engineers: what the basic thread profile defines, how it supports dimensioning standards, and where BoltLab tools fit in workflow.",
    relatedStandards: ["iso_261", "iso_724", "iso_965_1"],
    coverage: [
      "Defines the reference thread profile geometry for ISO metric threads.",
      "Provides baseline shape assumptions used by downstream dimension and tolerance standards.",
      "Supports consistent interpretation of crest, root, and flank geometry."
    ],
    useCases: [
      "Interpreting thread form terminology during design reviews.",
      "Aligning profile assumptions before applying dimensional limits.",
      "Explaining profile fundamentals across design and quality teams."
    ],
    table: {
      title: "ISO 68-1 profile interpretation map",
      columns: ["Profile element", "Engineering interpretation", "Why it matters"],
      rows: [
        ["Flank geometry", "Defines thread form reference", "Sets profile baseline for dimensions and fit"],
        ["Crest/root context", "Clarifies profile terms", "Improves cross-team specification language"],
        ["System role", "Upstream profile standard", "Feeds ISO 724 dimensions and ISO 965 tolerances"]
      ]
    }
  },
  iso_261: {
    route: "/reference/iso-261-metric-thread-series",
    title: "ISO 261 Metric Thread Series",
    subtitle: "Preferred diameter and pitch combinations for metric threads.",
    meta: "ISO 261 explained with practical context for preferred metric diameter and pitch combinations, thread designation planning, and links to ISO 262, 724, and 965.",
    relatedStandards: ["iso_262", "iso_724", "iso_965_1"],
    coverage: [
      "Specifies preferred metric diameter and pitch combinations.",
      "Frames coarse and fine designation planning before tolerance assignment.",
      "Creates a consistent baseline for tooling and part interoperability."
    ],
    useCases: [
      "Selecting standard pitch options in product development.",
      "Normalizing design choices across suppliers and geographies.",
      "Preparing design data before tolerance class selection."
    ],
    table: {
      title: "ISO 261 planning quick table",
      columns: ["Decision point", "ISO 261 role", "Downstream dependency"],
      rows: [
        ["Designation selection", "Preferred diameter and pitch planning", "Feeds ISO 724 dimensional context"],
        ["Series strategy", "Coarse/fine planning baseline", "Feeds ISO 262 selected fine combinations"],
        ["Specification handoff", "Normalizes thread notation", "Feeds ISO 965 tolerance selection"]
      ]
    }
  },
  iso_262: {
    route: "/reference/iso-262-metric-thread-fine-series",
    title: "ISO 262 Metric Fine Thread Series",
    subtitle: "Selected fine-pitch metric thread combinations.",
    meta: "ISO 262 explained for fine metric thread selections, when engineers choose fine pitch, and how it connects to ISO 261 planning and ISO 965 tolerance classes.",
    relatedStandards: ["iso_261", "iso_724", "iso_965_1"],
    coverage: [
      "Defines selected metric fine thread diameter and pitch combinations.",
      "Complements ISO 261 by focusing on fine-pitch series use cases.",
      "Supports controlled selection where finer lead and engagement are needed."
    ],
    useCases: [
      "Choosing fine-pitch variants for constrained assemblies.",
      "Balancing thread engagement behavior with design constraints.",
      "Preparing specification decisions before tolerance checks."
    ],
    table: {
      title: "ISO 262 fine-series selection context",
      columns: ["Fine-series use case", "Why ISO 262 is consulted", "Connected standard"],
      rows: [
        ["Compact assembly interfaces", "Fine pitch option guidance", "ISO 261"],
        ["Adjustment-sensitive designs", "Selected fine combinations", "ISO 724"],
        ["Tolerance-sensitive fit checks", "Fine-series designation context", "ISO 965-1"]
      ]
    }
  },
  iso_724: {
    route: "/reference/iso-724-thread-dimensions",
    title: "ISO 724 Metric Thread Dimensions",
    subtitle: "Basic dimensions framework for ISO metric thread geometry.",
    meta: "ISO 724 explained with focus on metric thread basic dimensions, geometric interpretation, and how designers connect profile definitions to tolerance classes in practice.",
    relatedStandards: ["iso_68_1", "iso_261", "iso_965_1"],
    coverage: [
      "Defines basic dimension relationships for metric thread geometry.",
      "Connects nominal designation planning to geometric dimension references.",
      "Provides dimensional context before class-based tolerance interpretation."
    ],
    useCases: [
      "Checking dimensional assumptions during thread specification.",
      "Coordinating CAD models with drawing-level thread notation.",
      "Reviewing metrology plans against basic geometry expectations."
    ],
    table: {
      title: "ISO 724 dimensional workflow map",
      columns: ["Dimension context", "ISO 724 contribution", "Related concept"],
      rows: [
        ["Basic geometry", "Defines metric dimension framework", "Pitch diameter"],
        ["Designation alignment", "Bridges nominal callout to geometry", "Thread pitch"],
        ["Tolerance readiness", "Supplies pre-tolerance dimension context", "Tolerance zone"]
      ]
    }
  },
  iso_965_1: {
    route: "/reference/iso-thread-tolerances-explained",
    title: "ISO 965 Thread Tolerances Explained",
    subtitle: "Tolerance principles and fit-class interpretation for metric threads.",
    meta: "ISO 965 explained for thread tolerance principles, fit-class interpretation, and relationships to ISO 724 dimensions and practical BoltLab identification workflows.",
    relatedStandards: ["iso_724", "iso_261", "iso_68_1"],
    coverage: [
      "Defines tolerance principles for ISO metric screw threads.",
      "Explains class notation logic for internal and external threads.",
      "Supports fit interpretation and specification governance in production workflows."
    ],
    useCases: [
      "Selecting and interpreting fit classes such as 6H and 6g.",
      "Aligning inspection strategy with tolerance intent.",
      "Reviewing specification risk before release to manufacturing."
    ],
    table: {
      title: "ISO 965 tolerance workflow map",
      columns: ["Tolerance activity", "ISO 965-1 contribution", "Related concept"],
      rows: [
        ["Fit-class interpretation", "Defines class logic", "6H/6g"],
        ["Zone interpretation", "Defines tolerance-zone principles", "Tolerance zone"],
        ["Inspection planning", "Connects tolerance intent to verification", "Pitch diameter"]
      ]
    }
  }
};

function clampMeta(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length < 140) {
    return `${cleaned} for standards-based engineering workflow decisions.`;
  }
  if (cleaned.length > 155) {
    return `${cleaned.slice(0, 152).trimEnd()}...`;
  }
  return cleaned;
}

function buildFaq(title, standardId) {
  return [
    {
      id: `${standardId}_faq_scope`,
      question: `What does ${title} primarily define?`,
      answer_text: `${title} provides engineering guidance for one part of thread specification workflow and is used alongside related ISO standards rather than in isolation.`,
      answer_html: `${title} provides engineering guidance for one part of thread specification workflow and is used alongside related ISO standards rather than in isolation.`,
      answer_source: { type: "relationship_context", entity_id: "thread_pitch" }
    },
    {
      id: `${standardId}_faq_usage`,
      question: "When do engineers typically use this standard?",
      answer_text: "Engineers use it when selecting, validating, or reviewing thread specifications and coordinating drawings, metrology, and production decisions.",
      answer_html: "Engineers use it when selecting, validating, or reviewing thread specifications and coordinating drawings, metrology, and production decisions.",
      answer_source: { type: "entity_summary", entity_id: "thread_pitch" }
    },
    {
      id: `${standardId}_faq_tools`,
      question: "How does BoltLab help interpret this standard?",
      answer_text: "BoltLab tools and charts accelerate identification, comparison, and tolerance-context checks while final release values still come from approved standards documents.",
      answer_html: "BoltLab tools and charts accelerate identification, comparison, and tolerance-context checks while final release values still come from approved standards documents.",
      answer_source: { type: "relationship_context", entity_id: "pitch_diameter" }
    },
    {
      id: `${standardId}_faq_copyright`,
      question: "Does this page reproduce copyrighted standards tables?",
      answer_text: "No. BoltLab provides public-summary explanations, engineering context, and workflow guidance without reproducing protected standards text.",
      answer_html: "No. BoltLab provides public-summary explanations, engineering context, and workflow guidance without reproducing protected standards text.",
      answer_source: { type: "relationship_context", entity_id: "iso_965" }
    },
    {
      id: `${standardId}_faq_next`,
      question: "Which related standard should I review next?",
      answer_text: "Use the Related Standards section to move through profile, designation, dimensions, and tolerance standards in a coherent sequence.",
      answer_html: "Use the Related Standards section to move through profile, designation, dimensions, and tolerance standards in a coherent sequence.",
      answer_source: { type: "relationship_context", entity_id: "iso_965" }
    }
  ];
}

function main() {
  const root = projectRoot();
  const standardsPath = path.join(root, "data", "standards", "iso", "standards.seed.json");
  const metricDatasetPath = path.join(root, "data", "datasets", "metric_threads.seed.json");
  const standards = readJson(standardsPath).records || [];
  const metricDataset = readJson(metricDatasetPath);
  const standardMap = new Map(standards.map((record) => [record.id, record]));
  const today = "2026-07-12";

  for (const [id, config] of Object.entries(TARGETS)) {
    const standard = standardMap.get(id);
    if (!standard) {
      throw new Error(`Missing ISO standard record: ${id}`);
    }
    const projection = {
      id: `reference_${id}`,
      projection_type: "reference_page",
      entity_id: "iso_965",
      standard_id: id,
      route_hint: config.route,
      canonical_url: `https://boltlab.io${config.route}`,
      title: config.title,
      hero_subtitle: config.subtitle,
      meta_description: clampMeta(config.meta),
      quick_reference: {
        primary_entity_id: "iso_965",
        related_entity_ids: standard.related_entities || [],
        standard_ids: [id, ...config.relatedStandards],
        dataset_ids: standard.related_datasets || []
      },
      engineering_summary: {
        source_entity_id: "iso_965",
        strategy: "entity.engineering_summary"
      },
      overview: standard.public_summary,
      coverage_points: config.coverage,
      use_cases: config.useCases,
      table: config.table,
      faq: buildFaq(config.title, id),
      related_entities: standard.related_entities || [],
      related_standards: [id, ...config.relatedStandards],
      related_standard_ids: config.relatedStandards,
      related_datasets: standard.related_datasets || [],
      related_tools: [
        "/tools/thread-identifier",
        "/tools/thread-pitch-to-tpi-converter",
        "/tools/tap-drill-calculator"
      ],
      related_charts: [
        "/charts/metric-thread-chart",
        "/charts/metric-vs-imperial-chart"
      ],
      related_guides: [
        "/guides/metric-thread-tolerances",
        "/guides/thread-types-explained"
      ],
      schema: {
        source_entity_id: "iso_965",
        types: ["Article", "FAQPage", "BreadcrumbList", "WebPage"]
      },
      status: "active",
      version: "v0.1.0",
      created: today,
      updated: today
    };

    const outPath = path.join(root, "data", "projections", "reference", `${id}.reference.json`);
    writeJson(outPath, projection);
    console.log(`Projection generated: data/projections/reference/${id}.reference.json`);
  }

  const metricRows = metricDataset.records || [];
  const coarseRows = metricRows
    .filter((row) => row.thread_series === "coarse")
    .map((row) => [row.designation, `${row.nominal_diameter_mm}`, `${row.pitch_mm}`]);
  const fineRows = metricRows
    .filter((row) => row.thread_series === "fine")
    .map((row) => [row.designation, `${row.nominal_diameter_mm}`, `${row.pitch_mm}`]);

  const hubProjection = {
    id: "reference_standards_hub",
    projection_type: "reference_page",
    entity_id: "iso_965",
    route_hint: "/reference/standards/",
    canonical_url: "https://boltlab.io/reference/standards/",
    title: "Engineering Standards Hub",
    hero_subtitle: "How ISO, ASME, DIN, ANSI, JIS, and British standards families connect.",
    meta_description: clampMeta("Engineering standards hub connecting ISO, ASME, DIN, ANSI, JIS, and British fastener standards with practical workflow guidance and generated relationship tables."),
    quick_reference: {
      primary_entity_id: "iso_965",
      related_entity_ids: ["thread_pitch", "pitch_diameter", "tolerance_zone"],
      standard_ids: Object.keys(TARGETS),
      dataset_ids: ["metric_threads", "unc_threads"]
    },
    engineering_summary: {
      source_entity_id: "iso_965",
      strategy: "entity.engineering_summary"
    },
    overview: "The standards hub explains how standards families connect across profile geometry, designation planning, dimensions, and tolerance interpretation instead of acting as a flat directory.",
    coverage_points: [
      "ISO standards define metric profile, designation, dimensions, and tolerance context.",
      "ASME and ANSI standards define unified inch systems and fit conventions.",
      "DIN, JIS, and British standards are linked for cross-market specification alignment."
    ],
    use_cases: [
      "Find which standard answers a specific engineering question.",
      "Move from concept pages into standards-grounded workflow decisions.",
      "Compare standards families before global sourcing or cross-region design release."
    ],
    table: {
      title: "Metric coarse pitch table (generated from verified dataset)",
      columns: ["Designation", "Nominal diameter (mm)", "Pitch (mm)"],
      rows: coarseRows
    },
    related_reference_routes: [
      "/reference/iso-68-thread-profile",
      "/reference/iso-261-metric-thread-series",
      "/reference/iso-262-metric-thread-fine-series",
      "/reference/iso-724-thread-dimensions",
      "/reference/iso-thread-tolerances-explained"
    ],
    faq: [
      {
        id: "standards_hub_scope",
        question: "How is this standards hub different from a list of links?",
        answer_text: "It maps standards families to engineering workflow decisions and shows how standards connect to tools, charts, and concept pages.",
        answer_html: "It maps standards families to engineering workflow decisions and shows how standards connect to tools, charts, and concept pages.",
        answer_source: { type: "relationship_context", entity_id: "iso_965" }
      },
      {
        id: "standards_hub_iso_question",
        question: "Which ISO standard defines metric thread profiles?",
        answer_text: "ISO 68-1 covers the basic profile while ISO 724 and ISO 965-1 provide dimensional and tolerance context.",
        answer_html: "ISO 68-1 covers the basic profile while ISO 724 and ISO 965-1 provide dimensional and tolerance context.",
        answer_source: { type: "relationship_context", entity_id: "pitch_diameter" }
      },
      {
        id: "standards_hub_tolerance_question",
        question: "Which standard covers thread tolerances?",
        answer_text: "ISO 965-1 is the primary ISO tolerance framework for metric threads.",
        answer_html: "ISO 965-1 is the primary ISO tolerance framework for metric threads.",
        answer_source: { type: "relationship_context", entity_id: "tolerance_zone" }
      },
      {
        id: "standards_hub_relation_question",
        question: "How does ISO 724 relate to ISO 965?",
        answer_text: "ISO 724 establishes basic dimension context that ISO 965-1 builds on for tolerance interpretation.",
        answer_html: "ISO 724 establishes basic dimension context that ISO 965-1 builds on for tolerance interpretation.",
        answer_source: { type: "relationship_context", entity_id: "pitch_diameter" }
      },
      {
        id: "standards_hub_tools_question",
        question: "Which BoltLab tools use this standards context?",
        answer_text: "Thread Identifier, Thread Pitch Converter, and Tap Drill Calculator all depend on standards-grounded interpretation workflows.",
        answer_html: "Thread Identifier, Thread Pitch Converter, and Tap Drill Calculator all depend on standards-grounded interpretation workflows.",
        answer_source: { type: "relationship_context", entity_id: "thread_pitch" }
      }
    ],
    related_entities: ["thread_pitch", "pitch_diameter", "tolerance_zone"],
    related_standards: Object.keys(TARGETS),
    related_standard_ids: Object.keys(TARGETS),
    related_datasets: ["metric_threads", "unc_threads"],
    related_tools: [
      "/tools/thread-identifier",
      "/tools/thread-pitch-to-tpi-converter",
      "/tools/tap-drill-calculator"
    ],
    related_charts: [
      "/charts/metric-thread-chart",
      "/charts/unc-thread-chart",
      "/charts/metric-vs-imperial-chart"
    ],
    related_guides: ["/guides/metric-thread-tolerances"],
    schema: {
      source_entity_id: "iso_965",
      types: ["Article", "FAQPage", "BreadcrumbList", "WebPage"]
    },
    status: "active",
    version: "v0.1.0",
    created: today,
    updated: today
  };
  const hubPath = path.join(root, "data", "projections", "reference", "standards_hub.reference.json");
  writeJson(hubPath, hubProjection);
  console.log("Projection generated: data/projections/reference/standards_hub.reference.json");

  const fineTableProjection = {
    id: "reference_standards_iso_family",
    projection_type: "reference_page",
    entity_id: "iso_965",
    route_hint: "/reference/standards/iso",
    canonical_url: "https://boltlab.io/reference/standards/iso",
    title: "ISO Standards for Threads",
    hero_subtitle: "ISO standards sequence from profile to tolerance interpretation.",
    meta_description: clampMeta("ISO standards family overview connecting ISO 68-1, 261, 262, 724, and 965 with generated fine-pitch table context for engineering specification workflows."),
    quick_reference: {
      primary_entity_id: "iso_965",
      related_entity_ids: ["thread_pitch", "pitch_diameter", "tolerance_zone"],
      standard_ids: Object.keys(TARGETS),
      dataset_ids: ["metric_threads"]
    },
    engineering_summary: {
      source_entity_id: "iso_965",
      strategy: "entity.engineering_summary"
    },
    overview: "ISO thread standards are most effective when used as a sequence: profile (ISO 68-1), designation (ISO 261 and ISO 262), dimensions (ISO 724), then tolerances (ISO 965-1).",
    coverage_points: [
      "Profiles and terminology are anchored in ISO 68-1.",
      "Designation planning is covered by ISO 261 and ISO 262.",
      "Dimensional interpretation and tolerance behavior use ISO 724 and ISO 965-1."
    ],
    use_cases: [
      "Training new engineers on standards sequencing.",
      "Aligning design-release checklists for thread callouts.",
      "Connecting standards references to practical tool workflows."
    ],
    table: {
      title: "Metric fine pitch table (generated from verified dataset)",
      columns: ["Designation", "Nominal diameter (mm)", "Pitch (mm)"],
      rows: fineRows
    },
    related_reference_routes: hubProjection.related_reference_routes,
    faq: hubProjection.faq,
    related_entities: hubProjection.related_entities,
    related_standards: hubProjection.related_standards,
    related_standard_ids: hubProjection.related_standard_ids,
    related_datasets: ["metric_threads"],
    related_tools: hubProjection.related_tools,
    related_charts: hubProjection.related_charts,
    related_guides: hubProjection.related_guides,
    schema: hubProjection.schema,
    status: "active",
    version: "v0.1.0",
    created: today,
    updated: today
  };
  const isoFamilyPath = path.join(root, "data", "projections", "reference", "iso_family.reference.json");
  writeJson(isoFamilyPath, fineTableProjection);
  console.log("Projection generated: data/projections/reference/iso_family.reference.json");
}

main();
