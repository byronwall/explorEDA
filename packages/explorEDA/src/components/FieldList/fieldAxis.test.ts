import { describe, expect, it } from "vitest";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { boxPlotDefinition } from "@/components/charts/BoxPlot/definition";
import { lineChartDefinition } from "@/components/charts/LineChart/definition";
import { rowChartDefinition } from "@/components/charts/RowChart/definition";
import { scatterPlotDefinition } from "@/components/charts/ScatterPlot/definition";
import { summaryTableDefinition } from "@/components/charts/SummaryTable/definition";
import type { ChartSettings } from "@/types/ChartTypes";
import {
  axisRefusal,
  axisTargets,
  axisUpdate,
  hasFiniteNumber,
  type FieldFacts,
} from "./fieldAxis";
import { edgeScrollSpeed } from "./FieldDragContext";

const layout = { x: 0, y: 0, w: 6, h: 4 };
const facts = (
  field: string,
  dataType: FieldFacts["dataType"],
  hasNumbers = dataType === "numeric"
): FieldFacts => ({ field, label: field, dataType, hasNumbers });

const scatter = {
  ...scatterPlotDefinition.createDefaultSettings(layout, "margin"),
  xField: "revenue",
  yField: "margin",
  xAxisLabel: "Revenue ($)",
  yAxisLabel: "Margin ($)",
  filters: [{ type: "range", field: "revenue", min: 1, max: 5 }],
} as ChartSettings;
const bar = barChartDefinition.createDefaultSettings(layout, "units");
const row = rowChartDefinition.createDefaultSettings(layout, "region");
const box = boxPlotDefinition.createDefaultSettings(layout, "revenue");
const line = {
  ...lineChartDefinition.createDefaultSettings(layout),
  xField: "date",
  seriesField: ["revenue"],
} as ChartSettings;
const summary = summaryTableDefinition.createDefaultSettings(layout);

describe("axisTargets", () => {
  it("lists only the axes a field can replace", () => {
    const targets = axisTargets([scatter, bar, row, box, line, summary]);
    expect(
      targets.map((target) => `${target.chart.type}:${target.axis}`)
    ).toEqual([
      "scatter:x",
      "scatter:y",
      "bar:x",
      "row:y",
      "boxplot:y",
      "line:x",
      "line:y",
    ]);
    expect(targets[0]!.current).toBe("revenue");
  });

  it("leaves grouped bars and multi-series lines out", () => {
    const grouped = { ...bar, aggregateId: "agg" } as ChartSettings;
    const lines = { ...line, seriesField: ["a", "b"] } as ChartSettings;
    expect(axisTargets([grouped, lines]).map((target) => target.axis)).toEqual([
      "x",
    ]);
  });
});

describe("axisRefusal", () => {
  const [scatterX] = axisTargets([scatter]);
  const [rowY] = axisTargets([row]);
  const [barX] = axisTargets([bar]);
  const [, lineY] = axisTargets([line]);
  const [lineX] = axisTargets([line]);

  it("accepts numbers on numeric axes", () => {
    expect(axisRefusal(scatterX!, facts("units", "numeric"))).toBeUndefined();
  });

  it("refuses text, dates, and fields without finite numbers", () => {
    expect(axisRefusal(scatterX!, facts("region", "categorical"))).toBe(
      "This axis needs numbers, and region is text"
    );
    expect(axisRefusal(lineY!, facts("date", "datetime"))).toBe(
      "This axis needs numbers, and date is a date"
    );
    expect(axisRefusal(scatterX!, facts("blank", "numeric", false))).toBe(
      "blank has no finite numbers"
    );
  });

  it("lets a line's x axis take dates", () => {
    expect(axisRefusal(lineX!, facts("month", "datetime"))).toBeUndefined();
  });

  it("keeps numbers off row charts and lets bars take any field", () => {
    expect(axisRefusal(rowY!, facts("units", "numeric"))).toMatch(
      /Use a bar chart/
    );
    expect(axisRefusal(barX!, facts("region", "categorical"))).toBeUndefined();
  });

  it("refuses the field already on the axis", () => {
    expect(axisRefusal(scatterX!, facts("revenue", "numeric"))).toBe(
      "Already on this axis"
    );
  });
});

describe("axisUpdate", () => {
  it("changes only the chosen axis field and its label", () => {
    const [x, y] = axisTargets([scatter]);
    expect(axisUpdate(x!, "units")).toEqual({
      xField: "units",
      xAxisLabel: "",
    });
    expect(axisUpdate(y!, "units")).toEqual({
      yField: "units",
      yAxisLabel: "",
    });
  });

  it("maps each chart type to its own setting", () => {
    const [lineX, lineY] = axisTargets([line]);
    expect(axisUpdate(lineY!, "cost")).toEqual({
      seriesField: ["cost"],
      yAxisLabel: "",
    });
    expect(axisUpdate(lineX!, "month")).toEqual({
      xField: "month",
      xAxisLabel: "",
    });
    const [barX] = axisTargets([bar]);
    expect(axisUpdate(barX!, "cost")).toEqual({
      field: "cost",
      xAxisLabel: "",
    });
    const [rowY] = axisTargets([row]);
    expect(axisUpdate(rowY!, "channel")).toEqual({
      field: "channel",
      yAxisLabel: "",
    });
  });
});

describe("hasFiniteNumber", () => {
  it("follows the shared numeric rule", () => {
    expect(hasFiniteNumber({ 0: "", 1: " ", 2: true, 3: "Infinity" })).toBe(
      false
    );
    expect(hasFiniteNumber({ 0: null, 1: "4.5" })).toBe(true);
  });
});

describe("edgeScrollSpeed", () => {
  it("scrolls near the edges and faster closer to them", () => {
    expect(edgeScrollSpeed(400, 100, 800)).toBe(0);
    expect(edgeScrollSpeed(790, 100, 800)).toBeGreaterThan(0);
    expect(edgeScrollSpeed(799, 100, 800)).toBeGreaterThan(
      edgeScrollSpeed(760, 100, 800)
    );
    expect(edgeScrollSpeed(110, 100, 800)).toBeLessThan(0);
    // Above the sticky controls still scrolls up, at full speed.
    expect(edgeScrollSpeed(20, 100, 800)).toBe(-20);
  });
});
