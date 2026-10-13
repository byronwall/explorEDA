import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { getChartDefinition } from "@/charts/registry";
import { compileDocument } from "./compile";
import { exportDocument } from "./export";
import { normalizeChart } from "./normalize";
import { chartSettingReference, wordForPath } from "./schema";
import type { SavedChartSettings } from "@/types/SavedDataTypes";

beforeAll(() => registerAllCharts());

const rows = [
  { Region: "West", Revenue: 10, Units: 2 },
  { Region: "East", Revenue: 20, Units: 3 },
];

describe("setting words", () => {
  it("names each saved path with one word", () => {
    expect(wordForPath("row", "xAxisLabel")).toBe("x.title");
    expect(wordForPath("bar", "binCount")).toBe("bins");
    expect(wordForPath("row", "binCount")).toBeUndefined();
  });

  it("lists a chart type's words, then keys without one", () => {
    const lines = chartSettingReference("bar");
    expect(lines[0]).toMatch(/^x\.title= /);
    expect(lines.some((line) => line.startsWith("bins="))).toBe(true);
    expect(lines.some((line) => line.startsWith("binCount"))).toBe(false);
    expect(lines.some((line) => line.startsWith("xAxisLabel"))).toBe(false);
    expect(lines).toContain("categoryOrder=");
  });

  it("writes words, never the paths they stand for", () => {
    const { settings } = compileDocument(
      "hist Revenue @h x.title=Sales x.grid=true y.ticks=6 bins=12",
      { rows }
    );
    const chart = settings.charts[0]!;
    expect(chart).toMatchObject({
      xAxisLabel: "Sales",
      xGridLines: 5,
      yGridLines: 6,
      binCount: 12,
      xAxis: { grid: true },
    });
    const { text } = exportDocument(settings, { rows });
    expect(text).toContain("x.title=Sales");
    expect(text).toContain("x.grid=true");
    expect(text).toContain("y.ticks=6");
    expect(text).toContain("bins=12");
    expect(text).not.toMatch(/xAxisLabel|binCount|GridLines|unset|\{\}=/);
  });
});

describe("normalized charts", () => {
  it("reads a partial axis as the type's default", () => {
    const base = getChartDefinition("row").createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "Region"
    ) as SavedChartSettings;
    const partial = { ...base, xAxis: { grid: true } } as SavedChartSettings;
    expect(normalizeChart(partial)).toEqual(base);
    const { text } = exportDocument(
      {
        charts: [{ ...partial, id: "r" }],
        calculations: [],
        gridSettings: {
          columnCount: 12,
          rowHeight: 100,
          containerPadding: 10,
          showBackgroundMarkers: true,
        },
        metadata: { name: "D", version: 1, createdAt: "", modifiedAt: "" },
        colorScales: [],
      },
      { rows }
    );
    expect(text).not.toMatch(/xAxis|unset/);
  });
});
