import { render } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { validateSavedData } from "@/utils/saveDataUtils";
import { compileDocument } from "./compile";
import { formatDslDiagnostics } from "./describe";

// Six orders. Web: rows 1, 2, 5. Store: rows 3, 4. Wholesale: row 6.
// Profit (Revenue - Cost): 40, -10, 25, 5, 60, 0.
const rows = [
  { Revenue: 100, Cost: 60, Channel: "Web", Category: "Home" },
  { Revenue: 50, Cost: 60, Channel: "Web", Category: "Toys" },
  { Revenue: 75, Cost: 50, Channel: "Store", Category: "Home" },
  { Revenue: 20, Cost: 15, Channel: "Store", Category: "Toys" },
  { Revenue: 160, Cost: 100, Channel: "Web", Category: "Home" },
  { Revenue: 0, Cost: 0, Channel: "Wholesale", Category: "Toys" },
];
const now = () => new Date("2026-10-05T00:00:00Z");
const compile = (text: string) => compileDocument(text, { rows, now });

/** Row IDs each chart draws once the saved settings load into the app. */
function livePopulations(settings: ReturnType<typeof compile>["settings"]) {
  const result: Record<string, number[]> = {};
  function Probe() {
    const live = useDataLayer((state) => state.liveItems);
    for (const [id, item] of Object.entries(live)) {
      result[id] = item.items
        .filter((row) => row.value > 0)
        .map((row) => row.key);
    }
    return null;
  }
  render(
    <DataLayerProvider data={rows} savedData={settings}>
      <Probe />
    </DataLayerProvider>
  );
  return result;
}

beforeAll(() => registerAllCharts());

describe("compileDocument", () => {
  it("builds unnamed charts from app defaults", () => {
    const result = compile(`scatter x=Revenue y=Cost color=Category
hist Revenue bins=24
row Channel
table Revenue,Cost,Channel`);

    expect(result.complete).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(validateSavedData(result.settings)).toBe(true);
    const [scatter, hist, row, table] = result.settings.charts;
    expect(scatter).toMatchObject({
      type: "scatter",
      xField: "Revenue",
      yField: "Cost",
      colorField: "Category",
    });
    expect(result.settings.colorScales).toHaveLength(1);
    expect(hist).toMatchObject({ type: "bar", field: "Revenue", binCount: 24 });
    expect(row).toMatchObject({
      type: "row",
      field: "Channel",
      minRowHeight: 30,
    });
    expect(table).toMatchObject({
      type: "data-table",
      columns: [{ field: "Revenue" }, { field: "Cost" }, { field: "Channel" }],
    });
    // Nothing overlaps: the table goes below the first three charts.
    expect(table!.layout).toEqual({ x: 0, y: 8, w: 12, h: 5 });
  });

  it("gives each chart its own population from aliases, calcs, and filters", () => {
    const result = compile(`source orders=salesRows
revenue:num=Revenue label="Revenue ($)"
cost:num=Cost
channel:cat=Channel

calc profit=revenue-cost
calc rate=revenue==0 ? null : profit/revenue
+ label="Margin" format=percent precision=1

scatter @web x=revenue y=profit where.channel=Web
+ title="Web orders" at=0,0,6,5 x.scale=symlog margin.left=64
scatter @store x=revenue y=profit where.channel=Store at=6,0,6,5
metric @gains sum=profit where.profit=0..
table revenue,cost,profit,rate`);

    expect(result.diagnostics).toEqual([]);
    expect(result.settings.calculations).toEqual([
      { resultColumnName: "profit", expression: "Revenue-Cost" },
      {
        resultColumnName: "rate",
        expression: "Revenue==0 ? null : profit/Revenue",
      },
    ]);
    expect(result.settings.fieldSettings).toEqual({
      Revenue: { label: "Revenue ($)" },
      rate: { label: "Margin", format: "percent", precision: 1 },
    });
    const web = result.settings.charts.find((chart) => chart.id === "web")!;
    expect(web).toMatchObject({
      title: "Web orders",
      layout: { x: 0, y: 0, w: 6, h: 5 },
      xAxis: { scaleType: "symlog" },
      margin: { left: 64 },
      filters: [],
    });

    const live = livePopulations(result.settings);
    expect(live.web).toEqual([0, 1, 4]);
    expect(live.store).toEqual([2, 3]);
    // Nonnegative profit: every row except row 2 (-10).
    expect(live.gains).toEqual([0, 2, 3, 4, 5]);
    const table = result.settings.charts.find(
      (chart) => chart.type === "data-table"
    )!;
    expect(live[table.id]).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("keeps usable charts and explains the one it skipped", () => {
    const result = compile(`hist Revenue bins=24
scatter x=Revenue y=MissingMargin
metric sum=Revenue`);

    expect(result.complete).toBe(false);
    expect(result.settings.charts.map((chart) => chart.type)).toEqual([
      "bar",
      "metric-card",
    ]);
    expect(result.skippedCharts).toEqual([
      { line: 2, subject: "scatter (line 2)", type: "scatter" },
    ]);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        severity: "error",
        effect: "chart-skipped",
        line: 2,
        column: 19,
        message:
          "MissingMargin is not a field, alias, or calculation, so scatter (line 2) was skipped.",
      }),
    ]);
  });

  it("skips a chart rather than drop a broken filter", () => {
    const result = compile(`row Channel where.Chanel=Web
row Channel where.Revenue=abc..`);
    expect(result.settings.charts).toEqual([]);
    expect(result.diagnostics.map((item) => item.suggestion)).toEqual([
      "Did you mean Channel?",
      "Write a range as 0..10, 5.., or ..100.",
    ]);
  });

  it("reports formula failures, loops, and what depends on them", () => {
    const result = compile(`calc ratio=Cost/Revenue
calc a=b+1
calc b=a+1
calc c=a*2
metric avg=ratio
metric sum=c`);

    expect(
      result.settings.calculations.map((calc) => calc.resultColumnName)
    ).toEqual(["ratio"]);
    expect(result.settings.charts).toHaveLength(1);
    const messages = result.diagnostics.map((item) => item.message);
    expect(messages).toContain(
      "calc ratio failed on 1 of 6 rows. Those rows show it as missing."
    );
    expect(
      result.diagnostics.find((item) => item.effect === "rows-missing")!
        .suggestion
    ).toBe("row 6: Division by zero");
    expect(messages).toContain(
      "calc a is part of a loop (a → b → a), so it was skipped."
    );
    expect(messages).toContain(
      "calc c uses calc a, which was skipped, so it was skipped too."
    );
    expect(messages).toContain(
      "calc c was skipped, so metric (line 6) was skipped."
    );
  });

  it("keeps quoted commas, missing values, and alias text inside strings", () => {
    const result = compile(`channel=Channel
calc label=if channel == "channel" then "a,b" else channel
row Channel where.Channel="Web,Store",null`);
    expect(result.settings.calculations[0]!.expression).toBe(
      'if Channel == "channel" then "a,b" else Channel'
    );
    expect(result.settings.charts[0]!.localFilters).toEqual([
      { type: "value", field: "Channel", values: ["Web,Store", null] },
    ]);
    expect(result.diagnostics[0]!.message).toBe(
      "Web,Store never occurs in Channel, so it matches no rows in row (line 3)."
    );
  });

  it("checks field contracts without converting them", () => {
    const result = compile(`channel:num=Channel
rev:num=Revenu`);
    expect(
      result.diagnostics.map((item) => [item.message, item.suggestion])
    ).toEqual([
      [
        "Channel reads as a category, not a number.",
        "To convert it, add as=num. To accept it, write channel:cat=Channel.",
      ],
      [
        "Revenu is not a field in the source rows, so rev is unavailable.",
        "Did you mean Revenue?",
      ],
    ]);
    expect(result.settings.fieldSettings).toEqual({});
  });

  it("says when nothing can be built", () => {
    const result = compile(`scater x=Revenue y=Cost
hist Revnue`);
    expect(result.settings.charts).toEqual([]);
    expect(formatDslDiagnostics(result, "a.eda")).toBe(`a.eda:1:1: error: scater does not start a declaration, so this line was skipped.
  fix: Did you mean scatter?
a.eda:2:6: error: Revnue is not a field, alias, or calculation, so hist (line 2) was skipped.
  fix: Did you mean Revenue?
failed: no chart can be built; fix the errors above`);
  });
});
