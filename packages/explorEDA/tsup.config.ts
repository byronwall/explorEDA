import { defineConfig } from "tsup";
import { entries } from "./entries.json";

export default defineConfig([
  {
    // entries.json is shared with scripts/build-types.mjs.
    entry: entries,
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
