/**
 * The forecast example notebook, read from its project folder, takes the
 * five kinds of chart edit as minimal changes to its text.
 */
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { getChartDefinition } from "@/charts/registry";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { readProjectFolder, type FolderNotebook } from "@/lib/project";
import { nodeProjectFiles } from "@/node/projectFiles";
import type { SavedChartSettings } from "@/types/SavedDataTypes";
import { writeBackChart } from "./writeBack";

const exampleDir = path.resolve(__dirname, "../../../examples/forecast");

let notebook: FolderNotebook;

beforeAll(async () => {
  registerAllCharts();
  const folder = await readProjectFolder(nodeProjectFiles(exampleDir));
  expect(folder.problems).toEqual([]);
  notebook = folder.notebooks.find((item) => item.path === "forecast.eda.md")!;
});

/** Lines that differ between two texts, as [line, before, after]. */
function changedLines(before: string, after: string) {
  const a = before.split("\n");
  const b = after.split("\n");
  expect(b.length).toBe(a.length);
  return a.flatMap((line, index) =>
    line === b[index] ? [] : [[index + 1, line, b[index]]]
  );
}

function edit(id: string, change: (chart: SavedChartSettings) => void) {
  const { result, text } = notebook;
  const chart = structuredClone(
    result.settings.charts.find((item) => item.id === id)!
  );
  change(chart);
  return writeBackChart(text, result, chart, { rows: result.rows });
}

describe("forecast notebook", () => {
  it("builds every block from the project's data", () => {
    const { result } = notebook;
    expect(result.complete).toBe(true);
    expect(result.queryId).toBe("demand");
    expect(result.rows).toHaveLength(1417);
    expect(result.blocks.map((block) => block.charts.map((c) => c.id))).toEqual(
      [[], ["demand"], ["delta"], ["event"], ["hours"]]
    );
    const delta = result.rows.map(
      (row) => Number(row["demand.actual"]) - Number(row["demand.forecast"])
    );
    expect(Math.max(...delta)).toBe(10436);
    const event = result.settings.charts.find((chart) => chart.id === "event")!;
    expect(event.xAxis.limits).toEqual({
      min: Date.parse("2021-02-07T07:25:00Z"),
      max: Date.parse("2021-02-16T07:25:00Z"),
    });
  });

  it("changes a field as one token", () => {
    const result = edit("hours", (chart) => {
      (chart as { columns: unknown[] }).columns = [
        { id: "demand.time", field: "demand.time" },
        { id: "delta", field: "delta" },
      ];
    });
    expect(result.kind).toBe("splice");
    expect(changedLines(notebook.text, result.text)).toEqual([
      [
        72,
        'table @hours time,actual,forecast,delta title="Hourly demand and forecast"',
        'table @hours time,delta title="Hourly demand and forecast"',
      ],
    ]);
  });

  it("changes a chart type by rewriting its one declaration", () => {
    const result = edit("hours", (chart) => {
      // A new type starts from that type's settings.
      const { layout } = chart;
      for (const key of Object.keys(chart)) {
        delete (chart as unknown as Record<string, unknown>)[key];
      }
      Object.assign(
        chart,
        getChartDefinition("bar")!.createDefaultSettings(layout),
        { id: "hours", field: "delta", title: "Hourly demand and forecast" }
      );
    });
    expect(result.kind).toBe("rewrite");
    expect(changedLines(notebook.text, result.text)).toEqual([
      [
        72,
        'table @hours time,actual,forecast,delta title="Hourly demand and forecast"',
        'hist @hours delta title="Hourly demand and forecast"',
      ],
    ]);
  });

  it("adds a filter and keeps the block's comment", () => {
    const result = edit("delta", (chart) => {
      chart.localFilters = [
        { type: "range", field: "delta", min: 0, max: undefined },
      ];
    });
    expect(result.kind).toBe("splice");
    const changes = changedLines(notebook.text, result.text);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual([
      38,
      'line @delta x=time y=delta title="Actual minus forecast" {',
      'line @delta x=time y=delta title="Actual minus forecast" where.delta=0.. {',
    ]);
    expect(result.text).toContain(
      "calc delta = actual - forecast   # positive: demand above forecast"
    );
  });

  it("moves the event window's axis limit in place", () => {
    const result = edit("event", (chart) => {
      chart.xAxis = {
        ...chart.xAxis,
        limits: { ...chart.xAxis.limits, min: Date.parse("2021-02-09") },
      };
    });
    expect(result.kind).toBe("splice");
    expect(changedLines(notebook.text, result.text)).toEqual([
      [
        57,
        "  x.min=2021-02-07T07:25:00Z x.max=2021-02-16T07:25:00Z",
        "  x.min=2021-02-09 x.max=2021-02-16T07:25:00Z",
      ],
    ]);
  });

  it("recolors a series in its own line", () => {
    const result = edit("demand", (chart) => {
      const line = chart as unknown as {
        seriesSettings: Record<string, { lineColor?: string }>;
      };
      line.seriesSettings.forecast!.lineColor = "#7a5195";
    });
    expect(result.kind).toBe("splice");
    expect(changedLines(notebook.text, result.text)).toEqual([
      [
        26,
        "  series forecast lineColor=#c77a45",
        "  series forecast lineColor=#7a5195",
      ],
    ]);
  });
});
