import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "./compile";
import { compileViews, exportViews } from "./views";

const rows = [
  { Revenue: 100, Cost: 60, Channel: "Web", Units: 3 },
  { Revenue: 50, Cost: 20, Channel: "Store", Units: 1 },
  { Revenue: 75, Cost: 30, Channel: "Web", Units: 2 },
];

const TEXT = `dashboard name="Sales"
calc profit=Revenue-Cost
field profit format=currency

view Overview
metric sum=Revenue
scatter x=Revenue y=profit color=Channel

view "By channel"
grid rowHeight=80
row Channel where.Units=2..
calc margin=profit/Revenue
hist margin`;

beforeAll(() => registerAllCharts());

describe("compileViews", () => {
  it("builds each view with the shared definitions", () => {
    const result = compileViews(TEXT, { rows });
    expect(result.diagnostics).toEqual([]);
    expect(result.name).toBe("Sales");
    expect(result.views.map((view) => view.name)).toEqual([
      "Overview",
      "By channel",
    ]);
    const [overview, byChannel] = result.views;
    expect(overview!.settings.charts.map((chart) => chart.type)).toEqual([
      "metric-card",
      "scatter",
    ]);
    expect(byChannel!.settings.charts.map((chart) => chart.type)).toEqual([
      "row",
      "bar",
    ]);
    // A calc inside a view is still shared; the grid is not.
    for (const view of result.views) {
      expect(
        view.settings.calculations.map((calc) => calc.resultColumnName)
      ).toEqual(["profit", "margin"]);
      expect(view.settings.fieldSettings?.profit?.format).toBe("currency");
    }
    expect(overview!.settings.gridSettings.rowHeight).toBe(100);
    expect(byChannel!.settings.gridSettings.rowHeight).toBe(80);
    expect(byChannel!.line).toBe(9);
  });

  it("reports a shared problem once", () => {
    const result = compileViews(
      `calc broken=Revenue+Nope\nview A\nmetric count\nview B\nmetric count`,
      { rows }
    );
    expect(result.views).toHaveLength(2);
    expect(result.diagnostics.filter((item) => item.line === 1)).toHaveLength(
      1
    );
  });

  it("reads text without view lines as one view", () => {
    const result = compileViews(`dashboard name=Solo\nmetric count`, { rows });
    expect(result.views.map((view) => view.name)).toEqual(["Solo"]);
  });

  it("warns when one-view compiling skips later views", () => {
    const result = compileDocument(TEXT, { rows });
    expect(result.settings.metadata.name).toBe("Overview");
    expect(result.settings.charts).toHaveLength(2);
    expect(result.diagnostics).toMatchObject([
      { line: 9, effect: "chart-skipped" },
    ]);
  });
});

describe("exportViews", () => {
  it("writes every view as one text that rebuilds them all", () => {
    const start = compileViews(TEXT, { rows });
    const edited = start.views.map((view) => structuredClone(view));
    edited[1]!.settings.charts[0]!.title = "Rows by channel";

    const { text, omitted } = exportViews(edited, { rows, name: "Sales" });
    expect(omitted).toEqual([]);
    // Shared definitions appear once, above the first view.
    expect(text.match(/^calc profit=/gm)).toHaveLength(1);
    expect(text.indexOf("calc margin")).toBeLessThan(
      text.indexOf("view Overview")
    );
    expect(text).toContain('view "By channel"');

    const rebuilt = compileViews(text, { rows });
    expect(rebuilt.diagnostics).toEqual([]);
    expect(rebuilt.name).toBe("Sales");
    const strip = (settings: (typeof edited)[number]["settings"]) => ({
      ...settings,
      metadata: { ...settings.metadata, createdAt: "", modifiedAt: "" },
      charts: settings.charts.map((chart) => ({ ...chart, id: "" })),
    });
    expect(rebuilt.views.map((view) => strip(view.settings))).toEqual(
      edited.map((view) => strip(view.settings))
    );
  });

  it("names views whose shared definitions differ", () => {
    const { views } = compileViews(TEXT, { rows });
    views[1]!.settings.calculations = [];
    const { omitted } = exportViews(views, { rows });
    expect(omitted).toEqual([
      expect.stringMatching(/^By channel: its own fields/),
    ]);
  });
});
