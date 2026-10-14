import { beforeAll, describe, expect, it } from "vitest";
import { getChartDefinition } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { SavedChartSettings } from "@/types/SavedDataTypes";
import { compileNotebook } from "./compileNotebook";
import { writeBackChart } from "./writeBack";

const rows = [
  { time: "2021-01-01T00:00:00Z", actual: 5, forecast: 3, region: "North" },
  { time: "2021-01-01T01:00:00Z", actual: 2, forecast: 4, region: "South" },
  { time: "2021-01-01T02:00:00Z", actual: 7, forecast: 6, region: "North" },
];

beforeAll(() => registerAllCharts());

const NOTEBOOK = [
  "# Forecast", // 1
  "", // 2
  "The miss, signed.", // 3
  "", // 4
  "```eda", // 5
  "calc delta = actual - forecast   # signed miss", // 6
  "line @delta x=time y=delta {   # the main chart", // 7
  "  # keep the zero line", // 8
  '  y.title="Miss (MWh)"', // 9
  "  series delta lineColor=#c77a45   # orange", // 10
  '  rule y=0 "On forecast"', // 11
  "}", // 12
  "```", // 13
  "", // 14
  "Compare the two.", // 15
  "", // 16
  "```eda", // 17
  "scatter @fit x=actual y=forecast   # compare", // 18
  "hist actual", // 19
  "```", // 20
  "", // 21
].join("\n");

/** The notebook with some lines replaced, by 1-based line number. */
function withLines(changes: Record<number, string | null>) {
  return NOTEBOOK.split("\n")
    .flatMap((line, index) => {
      const change = changes[index + 1];
      return change === undefined ? [line] : change === null ? [] : [change];
    })
    .join("\n");
}

/** The chart with an axis range, whatever its type. */
function limited(
  chart: SavedChartSettings,
  axis: "xAxis" | "yAxis",
  limits: { min?: number; max?: number }
): SavedChartSettings {
  return { ...chart, [axis]: { ...chart[axis], limits } } as SavedChartSettings;
}

function edit(
  id: string,
  change: (chart: SavedChartSettings) => SavedChartSettings,
  text = NOTEBOOK
) {
  const compiled = compileNotebook(text, { rows });
  const chart = compiled.settings.charts.find((item) => item.id === id)!;
  return writeBackChart(text, compiled, change(structuredClone(chart)), {
    rows,
  });
}

describe("writeBackChart", () => {
  it("changes only the field's token", () => {
    const result = edit("fit", (chart) => ({ ...chart, yField: "delta" }));
    expect(result).toEqual({
      kind: "splice",
      text: withLines({ 18: "scatter @fit x=actual y=delta   # compare" }),
    });
  });

  it("adds a local filter before the line's comment", () => {
    const result = edit("fit", (chart) => ({
      ...chart,
      localFilters: [{ type: "value", field: "region", values: ["North"] }],
    }));
    expect(result).toEqual({
      kind: "splice",
      text: withLines({
        18: "scatter @fit x=actual y=forecast where.region=North   # compare",
      }),
    });
  });

  it("adds an axis limit to the head, before its body", () => {
    const result = edit("delta", (chart) =>
      limited(chart, "yAxis", { min: -5 })
    );
    expect(result).toEqual({
      kind: "splice",
      text: withLines({
        7: "line @delta x=time y=delta y.min=-5 {   # the main chart",
      }),
    });
  });

  it("writes a date axis limit as an ISO date", () => {
    const result = edit("delta", (chart) =>
      limited(chart, "xAxis", { min: Date.parse("2021-01-01T01:00:00Z") })
    );
    expect(result.kind).toBe("splice");
    expect(result.text).toBe(
      withLines({
        7: "line @delta x=time y=delta x.min=2021-01-01T01:00:00Z {   # the main chart",
      })
    );
  });

  it("changes a series color in its own child line", () => {
    const result = edit("delta", (chart) => {
      const line = chart as unknown as {
        seriesSettings: Record<string, { lineColor: string }>;
      };
      line.seriesSettings.delta!.lineColor = "#3479a8";
      return chart;
    });
    expect(result).toEqual({
      kind: "splice",
      text: withLines({ 10: "  series delta lineColor=#3479a8   # orange" }),
    });
  });

  it("removes a cleared setting's line and keeps the comment above it", () => {
    const result = edit("delta", (chart) => ({ ...chart, yAxisLabel: "" }));
    expect(result).toEqual({ kind: "splice", text: withLines({ 9: null }) });
  });

  it("changes a value already written, in place", () => {
    const text = withLines({ 18: "scatter @fit x=actual y=forecast y.min=1" });
    const result = edit(
      "fit",
      (chart) => limited(chart, "yAxis", { min: 2 }),
      text
    );
    expect(result).toEqual({
      kind: "splice",
      text: withLines({ 18: "scatter @fit x=actual y=forecast y.min=2" }),
    });
  });

  it("rewrites only the declaration when the chart type changes", () => {
    const result = edit("actual", (chart) => ({
      ...getChartDefinition("boxplot")!.createDefaultSettings(chart.layout),
      id: chart.id,
      field: "actual",
    }));
    expect(result).toEqual({
      kind: "rewrite",
      text: withLines({ 19: "boxplot actual" }),
    });
  });

  it("keeps the author's name through a rewrite", () => {
    const result = edit("fit", (chart) => ({
      ...getChartDefinition("bar")!.createDefaultSettings(chart.layout),
      id: chart.id,
      field: "actual",
    }));
    expect(result.kind).toBe("rewrite");
    expect(result.text).toBe(withLines({ 18: "hist @fit actual" }));
  });

  it("reports no change for an edit the text already says", () => {
    expect(edit("fit", (chart) => chart)).toEqual({
      kind: "unchanged",
      text: NOTEBOOK,
    });
  });

  it("leaves clicks and brushes out of the text", () => {
    const result = edit("fit", (chart) => ({
      ...chart,
      filters: [{ type: "value", field: "region", values: ["North"] }],
    }));
    expect(result).toEqual({ kind: "unchanged", text: NOTEBOOK });
  });

  it("won't write into a block whose text is broken", () => {
    const text = withLines({ 19: "hist actual {" });
    const result = edit(
      "fit",
      (chart) => ({ ...chart, yField: "delta" }),
      text
    );
    expect(result.kind).toBe("unsupported");
    expect(result.text).toBe(text);
  });
});
