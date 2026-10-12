import { defineConfig } from "tsup";
import { entries } from "./entries.json";

const RELEASE_DATE =
  process.env.EXPLOREDA_RELEASE_DATE ?? new Date().toISOString().slice(0, 10);

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
    // Licenses cover versions released on or before their update date.
    define: { __EXPLOREDA_RELEASE_DATE__: JSON.stringify(RELEASE_DATE) },
  },
  {
    // `exploreda license check` for CI. Bundled like the DSL checker.
    entry: { exploreda: "src/cli/exploreda.ts" },
    outDir: "dist/cli",
    format: ["esm"],
    platform: "node",
    target: "node20",
    noExternal: [/.*/],
    banner: { js: "#!/usr/bin/env node" },
    define: { __EXPLOREDA_RELEASE_DATE__: JSON.stringify(RELEASE_DATE) },
    splitting: false,
    minify: true,
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
