import { describe, expect, it } from "vitest";
import { dataTableDefinition } from "../../components/charts/DataTable/definition";
import { lineChartDefinition } from "../../components/charts/LineChart/definition";
import { scatterPlotDefinition } from "../../components/charts/ScatterPlot/definition";
import {
  getChartFields,
  getChartSummary,
} from "../../components/charts/chartAccessibility";

describe("chart accessibility summary", () => {
  it("uses one field summary path for SVG, canvas, and table charts", () => {
    const layout = { x: 0, y: 0, w: 4, h: 4 };
    const svgSettings = lineChartDefinition.createDefaultSettings(layout);
    svgSettings.xField = "date";
    svgSettings.seriesField = ["sales"];

    const canvasSettings = scatterPlotDefinition.createDefaultSettings(layout);
    canvasSettings.xField = "height";
    canvasSettings.yField = "weight";

    const tableSettings = dataTableDefinition.createDefaultSettings(layout);
    tableSettings.columns = [
      { id: "name", field: "name" },
      { id: "score", field: "score" },
    ];

    for (const [settings, fields] of [
      [svgSettings, ["date", "sales"]],
      [canvasSettings, ["height", "weight"]],
      [tableSettings, ["name", "score"]],
    ] as const) {
      expect(getChartFields(settings)).toEqual(fields);
      expect(getChartSummary(settings)).toContain(fields.join(", "));
    }
  });
});
