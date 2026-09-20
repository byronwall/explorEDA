import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "../../charts/registerAllCharts";
import { dataTableDefinition } from "../../components/charts/DataTable/definition";
import { lineChartDefinition } from "../../components/charts/LineChart/definition";
import { scatterPlotDefinition } from "../../components/charts/ScatterPlot/definition";
import {
  getChartAxisLabel,
  getChartFields,
  getChartSummary,
  getChartTitle,
} from "../../components/charts/chartAccessibility";

describe("chart accessibility summary", () => {
  beforeAll(() => registerAllCharts());

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

  it("derives generated titles from the current field and keeps overrides", () => {
    const settings = lineChartDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    settings.seriesField = ["small"];

    expect(
      getChartTitle(settings, (field) =>
        field === "small" ? "Small label" : field
      )
    ).toBe("Line Chart · Small label");

    settings.seriesField = ["large"];
    expect(
      getChartTitle(settings, (field) =>
        field === "large" ? "Large label" : field
      )
    ).toBe("Line Chart · Large label");
    expect(
      getChartSummary(settings, (field) =>
        field === "large" ? "Large label" : field
      )
    ).toContain("Large label");
    expect(getChartAxisLabel("large", "", () => "Large label")).toBe(
      "Large label"
    );
    expect(getChartAxisLabel("__ID", "", () => "Changed label")).toBe(
      "Row sequence"
    );
    expect(getChartAxisLabel("large", "Custom axis", () => "Large label")).toBe(
      "Custom axis"
    );

    settings.title = "My chart";
    expect(getChartTitle(settings, () => "Changed label")).toBe("My chart");
  });
});
