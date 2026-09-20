import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    ExplorEda: "src/components/ExplorEda.tsx",
    core: "src/charts/registry.ts",
    calculations: "src/lib/calculations/parser/semantics.ts",
    "charts/bar": "src/components/charts/BarChart/definition.ts",
    "charts/box-plot": "src/components/charts/BoxPlot/definition.ts",
    "charts/color-legend": "src/components/charts/ColorLegend/definition.ts",
    "charts/data-table": "src/components/charts/DataTable/definition.ts",
    "charts/line": "src/components/charts/LineChart/definition.ts",
    "charts/markdown": "src/components/charts/Markdown/definition.ts",
    "charts/pivot-table": "src/components/charts/PivotTable/definition.ts",
    "charts/row": "src/components/charts/RowChart/definition.ts",
    "charts/scatter": "src/components/charts/ScatterPlot/definition.ts",
    "charts/summary-table": "src/components/charts/SummaryTable/definition.ts",
    "charts/three-d-scatter":
      "src/components/charts/ThreeDScatter/definition.ts",
  },
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  external: ["react"],
  treeshake: true,
});
