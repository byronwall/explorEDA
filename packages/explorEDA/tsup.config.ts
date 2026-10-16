import { defineConfig } from "tsup";
import { entries } from "./entries.json";
import { version } from "./package.json";

export default defineConfig([
  {
    // entries.json is shared with scripts/build-types.mjs. The worker is a
    // script, not an API, so it is left out of the typed entries.
    entry: {
      ...entries,
      "analysis-worker": "src/lib/analysis/analysisWorker.ts",
    },
    splitting: true,
    sourcemap: true,
    clean: true,
    format: ["esm", "cjs"],
    // scripts/build-types.mjs writes the declarations.
    dts: false,
    outDir: "dist",
    external: ["react"],
    treeshake: true,
  },
  {
    // The `exploreda` command: a small local file server for the app,
    // which is built separately into dist/app. No chart code runs here.
    entry: { exploreda: "src/cli/exploreda.ts" },
    outDir: "dist/cli",
    format: ["esm"],
    platform: "node",
    target: "node20",
    noExternal: [/.*/],
    // Database drivers such as pg are CommonJS; their require() calls for
    // Node's own modules need a real require in this ES module.
    banner: {
      js: "#!/usr/bin/env node\nimport { createRequire as __bannerRequire } from 'node:module'; const require = __bannerRequire(import.meta.url);",
    },
    define: { __EXPLOREDA_VERSION__: JSON.stringify(version) },
    // Database drivers load on first use from their own chunks.
    splitting: true,
    // DuckDB's native library is installed by the projects that use it.
    external: ["@duckdb/node-api"],
    minify: false,
    sourcemap: false,
    dts: false,
    clean: false,
  },
  {
    // A self-contained checker for agents and scripts. It bundles the chart
    // definitions so every chart starts from the app's own defaults.
    entry: { "exploreda-dsl": "src/cli/exploredaDsl.ts" },
    outDir: "dist/cli",
    format: ["esm"],
    platform: "node",
    target: "node20",
    noExternal: [/.*/],
    loader: { ".css": "empty" },
    banner: {
      js: "#!/usr/bin/env node\nimport { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
    splitting: false,
    minify: true,
    sourcemap: false,
    dts: false,
    clean: false,
  },
]);
