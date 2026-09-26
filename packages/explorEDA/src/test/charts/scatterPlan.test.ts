import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "../../charts/registerAllCharts";
import { scatterPlotDefinition } from "../../components/charts/ScatterPlot/definition";
import {
  brushFilters,
  planScatter,
  planScatterOverlay,
} from "../../components/charts/ScatterPlot/scatterPlan";
import { CrossfilterWrapper } from "../../hooks/CrossfilterWrapper";

beforeAll(() => registerAllCharts());

it("plans scatter points, guides, and brush from distinct row populations", () => {
  const rows = [
    { __ID: 0, x: 1, y: 5 },
    { __ID: 1, x: 2, y: 6 },
    { __ID: 2, x: 3, y: 7 },
    { __ID: 3, x: 4, y: 8 },
  ];
  const chart = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  chart.id = "scatter";
  chart.xField = "x";
  chart.yField = "y";
  chart.xAxis.grid = true;
  chart.yAxis.grid = true;
  chart.filters = [{ type: "range", field: "x", min: 2, max: 3 }];
  const other = {
    ...chart,
    id: "other",
    filters: [{ type: "range" as const, field: "y", max: 7 }],
  };
  const crossfilter = new CrossfilterWrapper(rows, (row) => row.__ID);
  crossfilter.setFieldGetter((field) =>
    Object.fromEntries(rows.map((row) => [row.__ID, row[field as "x" | "y"]]))
  );
  crossfilter.addChart(chart);
  crossfilter.addChart(other);
  const group = crossfilter.getAllData()[chart.id]!;
  const chartIds = group.items
    .filter((item) => item.value > 0)
    .map((item) => item.key);
  expect(chartIds).toEqual([0, 1, 2]);
  expect(crossfilter.getFilteredRowIds()).toEqual([1, 2]);

  const snapshot = {
    revision: "r1",
    allIds: rows.map((row) => row.__ID),
    chartIds,
    filteredIds: crossfilter.getFilteredRowIds(),
    xData: Object.fromEntries(rows.map((row) => [row.__ID, row.x])),
    yData: Object.fromEntries(rows.map((row) => [row.__ID, row.y])),
    colorData: {},
    fieldSettings: {},
  };
  const plan = planScatter(chart, snapshot, 300, 220);
  expect(plan).toEqual(planScatter(chart, snapshot, 300, 220));
  expect(plan.points.map((point) => point.sourceId)).toEqual([0, 1, 2]);
  expect(plan.points[0]).toMatchObject({
    passesOwnFilter: false,
    opacity: 0.15,
  });
  expect(plan.pointStyle).toEqual({
    radius: { value: 3, source: "scatter-default" },
    opacity: { value: 0.7, source: "scatter-default" },
    dimmedOpacity: { value: 0.15, source: "own-filter-rule" },
  });
  expect(plan.populations).toEqual({ all: 4, chart: 3, filtered: 2, facet: 3 });
  expect(plan.axes.x.gridGuides.length).toBeGreaterThan(0);
  expect(plan.axes.x.guides.some((item) => item.id === "x:label")).toBe(true);
  expect(plan.axes.y.guides.some((item) => item.role === "rule")).toBe(false);
  expect(plan.axes.x.domainSource).toMatchObject({
    population: "all source rows",
    rows: 4,
  });
  expect(plan.rowSets.filtered).toEqual([1, 2]);
  expect(plan.points[0]?.passesAllFilters).toBe(false);
  expect(plan.brushExtent).toBeNull();

  const sparse = planScatter(
    { ...chart, xGridLines: 2, yGridLines: 2 },
    snapshot,
    200,
    220
  );
  const dense = planScatter(
    { ...chart, xGridLines: 12, yGridLines: 12 },
    snapshot,
    200,
    220
  );
  expect(dense.axes.x.ticks.requested).toBe(12);
  expect(dense.axes.x.ticks.candidates.length).toBeGreaterThan(
    sparse.axes.x.ticks.candidates.length
  );
  expect(dense.axes.x.ticks.omitted.length).toBeGreaterThan(0);
  expect(dense.axes.x.gridGuides.length).toBeGreaterThan(
    sparse.axes.x.gridGuides.length
  );

  const facet = planScatter(chart, { ...snapshot, facetIds: [2, 3] }, 300, 220);
  expect(facet.points.map((point) => point.sourceId)).toEqual([2]);
  expect(facet.populations.facet).toBe(1);
  const missing = planScatter(
    chart,
    { ...snapshot, xData: { ...snapshot.xData, 1: null } },
    300,
    220
  );
  expect(missing.exclusions).toContainEqual({
    sourceId: 1,
    reason: "invalid-x",
  });
  const extent = [
    [20, 30],
    [100, 130],
  ] as [[number, number], [number, number]];
  const filter = brushFilters(plan, extent);
  expect(filter.x[0]).toBeLessThan(filter.x[1]);
  expect(filter.y[0]).toBeLessThan(filter.y[1]);
  const overlay = planScatterOverlay(plan, extent, plan.points[1]!.id);
  expect(overlay.brush).toHaveLength(5);
  expect(overlay.readout).toHaveLength(8);
  expect(overlay.readoutLabel).toContain("Source row 1");
  expect(
    overlay.readout.find((item) => item.id === "readout:x-text")
  ).toMatchObject({
    text: "2",
  });
});

it("applies legend category filters globally and dims other scatter points", () => {
  const rows = [
    { __ID: 0, x: 1, y: 1, channel: "Online" },
    { __ID: 1, x: 2, y: 2, channel: "Store" },
    { __ID: 2, x: 3, y: 3, channel: "Store" },
  ];
  const chart = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  chart.xField = "x";
  chart.yField = "y";
  chart.colorField = "channel";
  chart.filters = [{ type: "value", field: "channel", values: ["Store"] }];
  const crossfilter = new CrossfilterWrapper(rows, (row) => row.__ID);
  crossfilter.setFieldGetter((field) =>
    Object.fromEntries(
      rows.map((row) => [row.__ID, row[field as "x" | "y" | "channel"]])
    )
  );
  crossfilter.addChart(chart);
  expect(crossfilter.getFilteredRowIds()).toEqual([1, 2]);
  const chartIds = crossfilter.getAllData()[chart.id]!.items
    .filter((item) => item.value > 0)
    .map((item) => item.key);
  expect(chartIds).toEqual([0, 1, 2]);

  const plan = planScatter(
    chart,
    {
      revision: "legend-filter",
      allIds: rows.map((row) => row.__ID),
      chartIds,
      filteredIds: crossfilter.getFilteredRowIds(),
      xData: Object.fromEntries(rows.map((row) => [row.__ID, row.x])),
      yData: Object.fromEntries(rows.map((row) => [row.__ID, row.y])),
      colorData: Object.fromEntries(rows.map((row) => [row.__ID, row.channel])),
      fieldSettings: {},
    },
    300,
    220
  );
  expect(plan.points).toMatchObject([
    { sourceId: 0, passesOwnFilter: false, opacity: 0.15 },
    { sourceId: 1, passesOwnFilter: true, opacity: 0.7 },
    { sourceId: 2, passesOwnFilter: true, opacity: 0.7 },
  ]);
  expect(plan.points[0]!.color).toBe("rgb(156 163 175)");
});
