import { expect, it } from "vitest";
import { scatterPlotDefinition } from "../../components/charts/ScatterPlot/definition";
import { planScatterPoints } from "../../components/charts/ScatterPlot/planScatterPoints";

it("plans stable source-linked glyphs and dims a chart's own filtered rows", () => {
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  settings.id = "scatter";
  settings.xField = "x";
  settings.yField = "y";
  settings.filters = [{ type: "range", field: "x", min: 2, max: 4 }];
  const input = {
    settings,
    style: {
      radius: { value: 3, source: "scatter-default" as const },
      opacity: { value: 0.7, source: "scatter-default" as const },
      dimmedOpacity: { value: 0.15, source: "own-filter-rule" as const },
    },
    ids: [10, 11, 12],
    xData: { 10: 1, 11: 3, 12: null },
    yData: { 10: 2, 11: 4, 12: 6 },
    colorData: { 10: "a", 11: "b", 12: "c" },
    xScale: (value: number) => value * 10,
    yScale: (value: number) => value * 5,
    getColor: () => "blue",
  };

  const points = planScatterPoints(input);
  expect(points).toEqual(planScatterPoints(input));
  expect(points).toHaveLength(2);
  expect(points[0]).toMatchObject({
    id: "scatter:point:10",
    sourceId: 10,
    x: 10,
    y: 10,
    mappedColor: "blue",
    color: "rgb(156 163 175)",
    opacity: 0.15,
    passesOwnFilter: false,
  });
  expect(points[1]).toMatchObject({
    id: "scatter:point:11",
    sourceId: 11,
    x: 30,
    y: 20,
    mappedColor: "blue",
    color: "blue",
    passesOwnFilter: true,
  });
});
