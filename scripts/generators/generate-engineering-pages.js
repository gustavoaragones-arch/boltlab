#!/usr/bin/env node
const path = require("node:path");

const generators = {
  reference: require("./generate-reference-pages"),
  charts: require("./generate-chart-pages"),
  schema: require("./generate-schema"),
  api: require("./generate-api-data"),
  sitemap: require("./generate-sitemap"),
  standards_projections: require("./generate-standards-projections"),
  standards_pages: require("./generate-standards-pages"),
  atlas_projections: require("./generate-atlas-projections"),
  atlas_pages: require("./generate-atlas-page"),
  thread_atlas_projection: require("./generate-thread-atlas-projection"),
  thread_atlas_page: require("./generate-thread-atlas-page")
};

function parseTarget(argv) {
  const target = argv[2];
  if (!target || target === "all") {
    return Object.keys(generators);
  }
  if (!generators[target]) {
    throw new Error(`Unknown target "${target}". Valid: ${Object.keys(generators).join(", ")}`);
  }
  return [target];
}

async function main() {
  const targets = parseTarget(process.argv);
  const context = {
    mode: "knowledge-engine",
    root: path.resolve(__dirname, "..", "..")
  };

  for (const target of targets) {
    const run = generators[target];
    // Generator modules are intentionally isolated to prevent duplicated logic.
    await run(context);
  }

  console.log(`Generator scaffold completed for targets: ${targets.join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
