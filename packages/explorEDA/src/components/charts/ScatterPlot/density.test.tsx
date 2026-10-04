import { fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { applyFilter } from "@/hooks/applyFilter";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { ScatterPlot } from "./ScatterPlot";
import { scatterPlotDefinition, type ScatterPlotSettings } from "./definition";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";
import { densityBinFilters, densityColor, planDensity } from "./densityPlan";

beforeAll(() => {
  registerAllCharts();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterAll(() => vi.restoreAllMocks());
const settings: ScatterPlotSettings = {
  ...scatterPlotDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 5 }),
  id: "density",
  title: "Density test",
  xField: "x",
  yField: "y",
  display: "density",
  density: { xBins: 3, yBins: 3 },
};
const rows = [
  { x: 0, y: 0 },
  { x: 3, y: 3 },
  { x: 3, y: 3 },
  { x: 7, y: 7 },
  { x: 10, y: 10 },
  { x: null, y: 5 },
  { x: 5, y: null },
  { x: "bad", y: 7 },
  { x: 3, y: 3 },
];
const ids = rows.map((_, i) => i);
const snapshot: ScatterSnapshot = {
  revision: "1",
  allIds: ids,
  chartIds: ids,
  filteredIds: ids,
  xData: Object.fromEntries(rows.map((row, id) => [id, row.x])),
  yData: Object.fromEntries(rows.map((row, id) => [id, row.y])),
  xType: "numeric",
  yType: "numeric",
  colorData: {},
  fieldSettings: {},
};
it("assigns every valid pair once, excludes shared upper boundaries, and keeps domains across resizing, filtering, and facets", () => {
  const plan = planDensity(settings, snapshot, 600, 400);
  const middle = plan.cells.find((cell) => cell.sourceIds.includes(1))!;
  expect(middle.xBounds).toEqual([3, 7]);
  expect(middle.yBounds).toEqual([3, 7]);
  expect(middle.sourceIds).toEqual([1, 2, 8]);
  expect(plan.cells.reduce((sum, cell) => sum + cell.rowIds.length, 0)).toBe(6);
  expect(plan.omittedIds).toEqual([5, 6, 7]);
  expect(plan.scatter.xScale.domain).toEqual(
    planScatter(settings, snapshot, 600, 400).xScale.domain
  );
  expect(
    planDensity(settings, snapshot, 390, 300).cells.map(
      (cell) => cell.sourceIds
    )
  ).toEqual(plan.cells.map((cell) => cell.sourceIds));
  const filters = densityBinFilters(settings, middle);
  expect(
    ids.filter((id) => filters.every((filter) => applyFilter(id, filter)))
  ).toEqual([1, 2, 8]);
  expect(densityBinFilters({ ...settings, filters }, middle)).toEqual([]);
  const facet = planDensity(
    settings,
    {
      ...snapshot,
      facetIds: [1, 2, 3, 5],
      chartIds: [1, 3, 5],
      filteredIds: [1],
    },
    600,
    400
  );
  expect(facet.max).toBe(3);
  expect(facet.cells.find((cell) => cell.id === middle.id)).toMatchObject({
    sourceIds: [1, 2],
    rowIds: [1],
    matching: 1,
  });
  expect(facet.omittedIds).toEqual([5]);
  const capped = planDensity(
    { ...settings, density: { ...settings.density, colorMax: 2 } },
    snapshot,
    600,
    400
  );
  expect(capped.cells.find((cell) => cell.id === middle.id)?.fill).toBe(
    densityColor(1)
  );
  const signed = planDensity(
    {
      ...settings,
      xAxis: { scaleType: "symlog" },
      yAxis: { scaleType: "symlog" },
    },
    { ...snapshot, xData: { ...snapshot.xData, 0: -10 } },
    600,
    400
  );
  expect(signed.cells.reduce((sum, cell) => sum + cell.rowIds.length, 0)).toBe(
    6
  );
  expect(signed.cells.every((cell) => cell.width > 0 && cell.height > 0)).toBe(
    true
  );
});
function Workspace() {
  const chart = useDataLayer((state) => state.charts[0]) as ScatterPlotSettings;
  const wrapper = useDataLayer((state) => state.crossfilterWrapper);
  const live = useDataLayer((state) => state.liveItems);
  const save = useDataLayer((state) => state.saveToStructure);
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
          expect(saved.charts[0]).toMatchObject({
            display: "density",
            density: { xBins: 3, yBins: 3 },
          });
          saved.charts[0].density.xBins = 0;
          expect(validateSavedData(saved)).toBe(false);
        }}
      >
        Check saved density
      </button>
      <ChartTraceScope>
        <ScatterPlot settings={chart} width={600} height={400} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects exact bin rows by pointer and keyboard, traces omitted inputs, and saves the density settings", () => {
  render(
    <DataLayerProvider
      data={rows}
      savedData={{
        charts: [settings],
        calculations: [],
        colorScales: [],
        gridSettings: {
          columnCount: 12,
          rowHeight: 76,
          containerPadding: 0,
          showBackgroundMarkers: false,
        },
        metadata: {
          name: "Density test",
          version: 1,
          createdAt: "2026-10-03",
          modifiedAt: "2026-10-03",
        },
        fieldSettings: { x: { type: "numeric" }, y: { type: "numeric" } },
      }}
    >
      <Workspace />
    </DataLayerProvider>
  );
  const bin = screen.getByRole("button", {
    name: "x: 3 to 7; y: 3 to 7; 3 rows",
  });
  fireEvent.click(bin);
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("1,2,8");
  fireEvent.click(bin, { altKey: true });
  expect(screen.getByLabelText("Density trace")).toHaveTextContent(
    "3 ≤ value < 7"
  );
  expect(screen.getByLabelText("Density trace")).toHaveTextContent("3 rows");
  fireEvent.click(screen.getByRole("button", { name: "1" }));
  expect(screen.getByLabelText("Density row trace")).toHaveTextContent(
    "This coordinate pair adds one to the bin count"
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Inspect this bin's 3 counted rows" })
  );
  fireEvent.focus(bin);
  fireEvent.keyDown(bin, { key: "ArrowRight" });
  fireEvent.keyDown(document.activeElement!, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe(ids.join(","));
  fireEvent.click(screen.getByRole("button", { name: "3 omitted rows" }));
  expect(screen.getByLabelText("Density trace")).toHaveTextContent(
    "bad → undefined"
  );
  fireEvent.click(screen.getByRole("button", { name: "7" }));
  expect(screen.getByLabelText("Scatter trace")).toHaveTextContent(
    "x has no finite value"
  );
  fireEvent.click(screen.getByRole("button", { name: "Check saved density" }));
});
