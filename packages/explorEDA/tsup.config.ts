import { defineConfig } from "tsup";

const entry = {
  ExplorEda: "src/components/ExplorEda.tsx",
  core: "src/charts/registry.ts",
  calculations: "src/lib/calculations/parser/semantics.ts",
  analysis: "src/analysis.ts",
  "charts/bar": "src/components/charts/BarChart/definition.ts",
  "charts/box-plot": "src/components/charts/BoxPlot/definition.ts",
  "charts/calendar": "src/components/charts/Calendar/definition.ts",
  "charts/color-legend": "src/components/charts/ColorLegend/definition.ts",
  "charts/data-table": "src/components/charts/DataTable/definition.ts",
  "charts/heatmap": "src/components/charts/Heatmap/definition.ts",
  "charts/ecdf": "src/components/charts/Ecdf/definition.ts",
  "charts/line": "src/components/charts/LineChart/definition.ts",
  "charts/markdown": "src/components/charts/Markdown/definition.ts",
  "charts/map": "src/components/charts/Map/definition.ts",
  "charts/metric-card": "src/components/charts/MetricCard/definition.ts",
  "charts/parallel-coordinates":
    "src/components/charts/ParallelCoordinates/definition.ts",
  "charts/pivot-table": "src/components/charts/PivotTable/definition.ts",
  "charts/row": "src/components/charts/RowChart/definition.ts",
  "charts/sankey": "src/components/charts/Sankey/definition.ts",
  "charts/scatter": "src/components/charts/ScatterPlot/definition.ts",
  "charts/summary-table": "src/components/charts/SummaryTable/definition.ts",
  "charts/three-d-scatter": "src/components/charts/ThreeDScatter/definition.ts",
};

export default defineConfig([
  {
    entry: {
      ...entry,
      "analysis-worker": "src/lib/analysis/analysisWorker.ts",
    },
    splitting: true,
    sourcemap: true,
    clean: true,
    format: ["esm", "cjs"],
    // The worker is a script, not an API, so it has no types.
    dts: { entry },
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
