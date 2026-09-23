import { expect, it } from "vitest";
import { CalculationManager } from "../../lib/calculations/CalculationState";
import { parseExpression } from "../../lib/calculations/parser/semantics";
import { scatterPlotDefinition } from "../../components/charts/ScatterPlot/definition";
import { planScatter } from "../../components/charts/ScatterPlot/scatterPlan";
import { resolveScatterTrace } from "../../components/charts/ScatterPlot/scatterTrace";

it("resolves source, calculation, guide, and legend inputs from one scatter plan", () => {
  const raw = [
    { price: "10", cost: "4", group: "A" },
    { price: "20", cost: "bad", group: "B" },
  ];
  const prepared = [
    { __ID: 0, price: 10, cost: 4, group: "A" },
    { __ID: 1, price: 20, cost: undefined, group: "B" },
  ];
  const manager = new CalculationManager(prepared, [
    { resultColumnName: "net", expression: parseExpression("price - cost") },
  ]);
  const net = manager.executeCalculation(manager.getCalculations()[0]!);
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  settings.id = "trace";
  settings.xField = "price";
  settings.yField = "net";
  settings.colorField = "group";
  settings.colorScaleId = "colors";
  settings.pointSize = 4;
  settings.pointOpacity = 1;
  const snapshot = {
    revision: "r1",
    allIds: [0, 1],
    chartIds: [0, 1],
    filteredIds: [0],
    xData: { 0: 10, 1: 20 },
    yData: Object.fromEntries(net),
    colorData: { 0: "A", 1: "B" },
    fieldSettings: {
      price: { type: "numeric" as const },
      cost: { type: "numeric" as const },
    },
    colorScale: {
      id: "colors",
      name: "group",
      type: "categorical" as const,
      palette: ["#123456", "#654321"],
      mapping: new Map([
        ["A", "#123456"],
        ["B", "#654321"],
      ]),
    },
  };
  const plan = planScatter(settings, snapshot, 400, 300);
  expect(plan.pointStyle).toMatchObject({
    radius: { value: 4, source: "chart-setting" },
    opacity: { value: 1, source: "chart-setting" },
  });
  const resolve = (kind: "point" | "guide" | "legend" | "title", id: string) =>
    resolveScatterTrace(
      { kind, id, plan },
      plan,
      snapshot,
      settings,
      raw,
      prepared,
      [],
      manager
    );
  const point = resolve("point", plan.points[0]!.id);
  expect(point).toMatchObject({
    kind: "point",
    sourceId: 0,
    x: { raw: "10", prepared: 10, conversion: { type: "numeric" } },
    y: { prepared: 6, calculation: { value: 6 } },
    color: { prepared: "A", mapped: "#123456", rendered: "#123456" },
    hover: { xText: "10", yText: "6", colorText: "A" },
  });
  if (point?.kind !== "point") throw new Error("Point trace missing");
  expect(point.y.sources.map((source) => source.field)).toEqual([
    "price",
    "cost",
  ]);
  expect(plan.exclusions).toContainEqual({ sourceId: 1, reason: "invalid-y" });
  expect(resolve("guide", "x:label")).toMatchObject({
    kind: "guide",
    population: 2,
    field: "price",
    sourceBounds: [10, 20],
  });
  expect(plan.guidePolicy.x.kept).toEqual(
    plan.axes
      .filter((item) => item.id.startsWith("x:tick:"))
      .map((item) => Number(item.id.split(":").at(-1)))
  );
  expect(resolve("guide", "x:label")).toMatchObject({
    refs: ["scale:x", "field-format:x", "axis-label:x"],
    policy: { x: { minLabelGap: 8, maxLabelChars: 20 } },
  });
  expect(resolve("legend", plan.legend!.items[0]!.id)).toMatchObject({
    kind: "legend",
    item: { label: "A", count: 1 },
    rowIds: [0],
  });
  expect(resolve("title", "title")).toMatchObject({
    kind: "title",
    text: plan.title,
    source: "chart-setting",
  });
  const badgePlan = planScatter(
    settings,
    { ...snapshot, calculatedFields: ["net"], pixelRatio: 2 },
    400,
    300
  );
  expect(badgePlan.calculatedBadges).toMatchObject([
    { id: "calculation:y", field: "net", rotation: -90 },
  ]);
  expect(badgePlan.pixelRatio).toBe(2);

  settings.filters = [{ type: "range", field: "price", min: 15, max: 25 }];
  const dimmedPlan = planScatter(settings, snapshot, 400, 300);
  expect(
    resolveScatterTrace(
      { kind: "point", id: dimmedPlan.points[0]!.id, plan: dimmedPlan },
      dimmedPlan,
      snapshot,
      settings,
      raw,
      prepared,
      [],
      manager
    )
  ).toMatchObject({
    kind: "point",
    color: {
      prepared: "A",
      mapped: "#123456",
      rendered: "rgb(156 163 175)",
    },
    opacity: 0.15,
    passesOwnFilter: false,
  });
  settings.filters = [];

  settings.filters = [
    { type: "range", field: "price", min: 10, max: 20 },
    { type: "range", field: "net", min: 0, max: 10 },
  ];
  const brushedPlan = planScatter(settings, snapshot, 400, 300);
  expect(
    resolveScatterTrace(
      { kind: "overlay", id: "brush", plan: brushedPlan },
      brushedPlan,
      snapshot,
      settings,
      raw,
      prepared,
      [],
      manager
    )
  ).toMatchObject({ kind: "overlay", id: "brush", filters: settings.filters });
  settings.filters = [];

  settings.facet = {
    enabled: true,
    type: "grid",
    rowVariable: "group",
    columnVariable: "net",
  };
  const facetSnapshot = {
    ...snapshot,
    facetIds: [0],
    facetRowData: { 0: "A", 1: "B" },
    facetColumnData: Object.fromEntries(net),
  };
  const facetPlan = planScatter(settings, facetSnapshot, 400, 300);
  expect(
    resolveScatterTrace(
      { kind: "point", id: facetPlan.points[0]!.id, plan: facetPlan },
      facetPlan,
      facetSnapshot,
      settings,
      raw,
      prepared,
      [],
      manager
    )
  ).toMatchObject({
    kind: "point",
    facet: {
      type: "grid",
      row: { field: "group", prepared: "A" },
      column: { field: "net", prepared: 6, calculation: { value: 6 } },
      sourceRows: 1,
      chartRows: 1,
    },
  });
});
