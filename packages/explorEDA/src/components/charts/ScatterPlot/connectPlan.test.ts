import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { planConnections } from "./connectPlan";
import { scatterPlotDefinition, type ScatterPlotSettings } from "./definition";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";

type Row = { miles: datum; gas: datum; year: datum; group?: datum };

function connectFor(
  rows: Row[],
  connect: ScatterPlotSettings["connect"],
  { chartIds }: { chartIds?: number[] } = {}
) {
  const settings: ScatterPlotSettings = {
    ...scatterPlotDefinition.createDefaultSettings({ x: 0, y: 0, w: 4, h: 4 }),
    id: "drive",
    xField: "Miles",
    yField: "Gas",
    connect,
  };
  const ids = rows.map((_, index) => index);
  const column = (key: keyof Row) =>
    Object.fromEntries(rows.map((row, index) => [index, row[key]]));
  const snapshot: ScatterSnapshot = {
    revision: "test",
    allIds: ids,
    chartIds: chartIds ?? ids,
    filteredIds: chartIds ?? ids,
    xData: column("miles"),
    yData: column("gas"),
    colorData: {},
    orderData: column("year"),
    groupData: column("group"),
    xType: "numeric",
    yType: "numeric",
    fieldSettings: {},
  };
  const plan = planScatter(settings, snapshot, 500, 300);
  return { plan, connections: planConnections(settings, snapshot, plan)! };
}

const order = (path: { rows: { sourceId: number }[] }) =>
  path.rows.map((row) => row.sourceId);

describe("scatter connections", () => {
  // Shuffled source rows; 1975 drives fewer miles than 1974.
  const driving: Row[] = [
    { miles: 4000, gas: 1.0, year: 1976 },
    { miles: 3800, gas: 0.9, year: 1974 },
    { miles: 4200, gas: 1.2, year: 1977 },
    { miles: 3600, gas: 0.8, year: 1975 },
  ];

  it("joins points in the order field's order, keeping X reversals", () => {
    const { connections, plan } = connectFor(driving, { orderField: "Year" });
    const [path] = connections.paths;
    expect(order(path!)).toEqual([1, 3, 0, 2]);
    expect(path!.segments.map((s) => [s.from, s.to])).toEqual([
      [1, 3],
      [3, 0],
      [0, 2],
    ]);
    // 1974 → 1975 moves left along Miles.
    const first = path!.segments[0]!;
    expect(first.x2).toBeLessThan(first.x1);
    const byId = new Map(plan.points.map((p) => [p.sourceId, p]));
    expect([first.x1, first.y1]).toEqual([byId.get(1)!.x, byId.get(1)!.y]);
  });

  it("breaks the path at a row with no position instead of jumping it", () => {
    const rows = driving.map((row) =>
      row.year === 1976 ? { ...row, gas: "n/a" } : row
    );
    const [path] = connectFor(rows, { orderField: "Year" }).connections.paths;
    expect(path!.rows.find((row) => row.sourceId === 0)!.state).toBe(
      "unplotted"
    );
    expect(path!.segments.map((s) => [s.from, s.to])).toEqual([[1, 3]]);
    expect(path!.runs).toBe(1);
  });

  it("breaks the path where another chart's filter removes a row", () => {
    const [path] = connectFor(
      driving,
      { orderField: "Year" },
      { chartIds: [0, 1, 2] }
    ).connections.paths;
    expect(path!.rows.find((row) => row.sourceId === 3)!.state).toBe(
      "filtered"
    );
    expect(path!.segments.map((s) => [s.from, s.to])).toEqual([[0, 2]]);
  });

  it("leaves rows without an order value off every path", () => {
    const rows = [...driving, { miles: 5000, gas: 2, year: "" }];
    const { connections } = connectFor(rows, { orderField: "Year" });
    expect(connections.unordered).toEqual([4]);
    expect(order(connections.paths[0]!)).not.toContain(4);
  });

  it("draws one path per group, sorted within each group", () => {
    const rows: Row[] = [
      { miles: 1, gas: 1, year: 2023, group: "Chile" },
      { miles: 1, gas: 2, year: 2000, group: "Austria" },
      { miles: 1, gas: 3, year: 2000, group: "Chile" },
      { miles: 2, gas: 4, year: 2023, group: "Austria" },
    ];
    const { connections } = connectFor(rows, {
      orderField: "Year",
      groupField: "Country",
      labels: "both",
    });
    expect(connections.paths.map((path) => path.label)).toEqual([
      "Austria",
      "Chile",
    ]);
    expect(connections.paths.map(order)).toEqual([
      [1, 3],
      [2, 0],
    ]);
    const [austria] = connections.paths;
    expect(austria!.labels.map((label) => label.anchor).sort()).toEqual([
      "end",
      "start",
    ]);
  });

  it("keeps labels apart and inside the plot", () => {
    const rows: Row[] = Array.from({ length: 6 }, (_, i) => [
      { miles: 0, gas: 10, year: 0, group: `G${i}` },
      { miles: 1, gas: 10, year: 1, group: `G${i}` },
    ]).flat();
    const { connections, plan } = connectFor(rows, {
      orderField: "Year",
      groupField: "Group",
      labels: "end",
    });
    const ys = connections.paths
      .map((path) => path.labels[0]!.y)
      .sort((a, b) => a - b);
    ys.slice(1).forEach((y, i) =>
      expect(y - ys[i]!).toBeGreaterThanOrEqual(12)
    );
    // The X range leaves room for the labels at the right.
    const last = Math.max(...plan.points.map((p) => p.x));
    expect(plan.plotWidth - last).toBeGreaterThan(14);
  });

  it("draws nothing when connections are off", () => {
    const settings = {
      ...scatterPlotDefinition.createDefaultSettings({
        x: 0,
        y: 0,
        w: 4,
        h: 4,
      }),
      xField: "Miles",
      yField: "Gas",
    };
    const snapshot: ScatterSnapshot = {
      revision: "test",
      allIds: [0],
      chartIds: [0],
      filteredIds: [0],
      xData: { 0: 1 },
      yData: { 0: 1 },
      colorData: {},
      fieldSettings: {},
    };
    const plan = planScatter(settings, snapshot, 500, 300);
    expect(planConnections(settings, snapshot, plan)).toBeUndefined();
  });
});
