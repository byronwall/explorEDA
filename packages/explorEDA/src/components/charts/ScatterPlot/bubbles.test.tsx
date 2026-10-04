import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { ScatterPlot } from "./ScatterPlot";
import { scatterPlotDefinition, type ScatterPlotSettings } from "./definition";
import {
  brushFilters,
  planScatter,
  scatterPointAt,
  type ScatterSnapshot,
} from "./scatterPlan";

beforeAll(() => {
  registerAllCharts();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterAll(() => vi.restoreAllMocks());
const chart: ScatterPlotSettings = {
  ...scatterPlotDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 5 }),
  id: "bubble",
  title: "Bubble test",
  xField: "x",
  yField: "y",
  sizeField: "Amount",
  maxBubbleRadius: 20,
};
const snapshot: ScatterSnapshot = {
  revision: "1",
  allIds: [0, 1, 2, 3, 4],
  chartIds: [0, 1, 2, 3, 4],
  filteredIds: [0, 1, 2, 3, 4],
  xData: { 0: 1, 1: 1, 2: 2, 3: 3, 4: 4 },
  yData: { 0: 2, 1: 2, 2: 3, 3: 4, 4: 5 },
  colorData: {},
  sizeData: { 0: 10, 1: 40, 2: 0, 3: null, 4: -5 },
  fieldSettings: {},
};
it("maps value to area, keeps the full-source scale, and distinguishes zero and excluded sizes", () => {
  const plan = planScatter(chart, snapshot, 600, 400);
  const small = plan.points.find((point) => point.sourceId === 0)!;
  const large = plan.points.find((point) => point.sourceId === 1)!;
  expect(large.radius ** 2 / small.radius ** 2).toBeCloseTo(4);
  expect(plan.points.find((point) => point.sourceId === 2)).toMatchObject({
    sizeValue: 0,
    radius: 2,
  });
  expect(plan.exclusions).toEqual([
    { sourceId: 3, reason: "invalid-size" },
    { sourceId: 4, reason: "invalid-size" },
  ]);
  expect(scatterPointAt(plan, small.x, small.y)?.sourceId).toBe(0);
  expect(scatterPointAt(plan, large.x + 18, large.y)?.sourceId).toBe(1);
  const filtered = planScatter(
    chart,
    { ...snapshot, chartIds: [0], filteredIds: [0], facetIds: [0] },
    600,
    400
  );
  expect(filtered.size?.max).toBe(40);
  expect(filtered.points[0]!.radius).toBe(small.radius);
  expect(
    brushFilters(plan, [
      [0, 0],
      [plan.plotWidth, plan.plotHeight],
    ])
  ).toContainEqual({ type: "range", field: "Amount", min: 0 });
  for (const point of plan.points) {
    expect(point.x - point.radius).toBeGreaterThanOrEqual(0);
    expect(point.x + point.radius).toBeLessThanOrEqual(plan.plotWidth);
    expect(point.y - point.radius).toBeGreaterThanOrEqual(0);
    expect(point.y + point.radius).toBeLessThanOrEqual(plan.plotHeight);
  }
});
function Workspace() {
  const settings = useDataLayer((s) => s.charts[0]) as ScatterPlotSettings;
  const wrapper = useDataLayer((s) => s.crossfilterWrapper);
  const live = useDataLayer((s) => s.liveItems);
  const save = useDataLayer((s) => s.saveToStructure);
  void live;
  return (
    <>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <button
        onClick={() => {
          const saved = JSON.parse(stringifySavedData(save()));
          expect(validateSavedData(saved)).toBe(true);
          expect(saved.charts[0].sizeField).toBe("Amount");
          expect(saved.charts[0].maxBubbleRadius).toBe(20);
          saved.charts[0].maxBubbleRadius = -1;
          expect(validateSavedData(saved)).toBe(false);
        }}
      >
        Check saved settings
      </button>
      <ChartTraceScope>
        <ScatterPlot settings={settings} width={600} height={400} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects exact source rows by keyboard and pointer, traces sizes, and replaces a point selection with a brush", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  render(
    <DataLayerProvider
      data={[
        { x: 1, y: 2, Amount: 10 },
        { x: 2, y: 3, Amount: 40 },
        { x: 1.5, y: 2.5, Amount: -5 },
      ]}
      charts={[chart]}
    >
      <Workspace />
    </DataLayerProvider>
  );
  const svg = screen.getByRole("group", { name: "Bubble test" });
  fireEvent.focus(svg);
  fireEvent.keyDown(svg, { key: "ArrowRight" });
  fireEvent.keyDown(svg, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("1");
  fireEvent.keyDown(svg, { key: "Enter", altKey: true });
  expect(screen.getByLabelText("Scatter trace")).toHaveTextContent(
    "Radius = 20 × √(40 / 40)"
  );
  fireEvent.click(screen.getByRole("button", { name: "1 excluded sizes" }));
  expect(screen.getByLabelText("Scatter trace")).toHaveTextContent(
    "Amount needs a finite, nonnegative value."
  );
  expect(screen.getByLabelText("Scatter trace")).toHaveTextContent("-5");
  const plan = planScatter(
    chart,
    {
      ...snapshot,
      allIds: [0, 1, 2],
      chartIds: [0, 1, 2],
      filteredIds: [0, 1, 2],
      xData: { 0: 1, 1: 2, 2: 1.5 },
      yData: { 0: 2, 1: 3, 2: 2.5 },
      sizeData: { 0: 10, 1: 40, 2: -5 },
    },
    600,
    400
  );
  const point = plan.points.find((point) => point.sourceId === 0)!;
  const x = plan.margin.left + point.x;
  const y = plan.margin.top + point.y;
  fireEvent.pointerDown(svg, { clientX: x, clientY: y, button: 0 });
  fireEvent.pointerUp(svg, { clientX: x, clientY: y });
  fireEvent.click(svg, { clientX: x, clientY: y });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
  fireEvent.pointerLeave(svg.parentElement!);
  fireEvent.click(screen.getByRole("button", { name: "Inspect bubble" }));
  expect(screen.getByLabelText("Scatter trace")).toHaveTextContent(
    "Radius = 20 × √(10 / 40)"
  );
  const left = plan.margin.left + 1;
  const top = plan.margin.top + 1;
  fireEvent.pointerDown(svg, { clientX: left, clientY: top, button: 0 });
  fireEvent.pointerMove(svg, {
    clientX: left + plan.plotWidth - 2,
    clientY: top + plan.plotHeight - 2,
    buttons: 1,
  });
  fireEvent.pointerUp(svg, {
    clientX: left + plan.plotWidth - 2,
    clientY: top + plan.plotHeight - 2,
  });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0,1");
  fireEvent.click(screen.getByRole("button", { name: "Check saved settings" }));
});
