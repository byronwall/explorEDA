import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  calculateGroupedAggregate,
  type AggregateInputRow,
} from "@/lib/aggregates";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { BarChart } from "./BarChart";
import { barChartDefinition, type BarChartSettings } from "./definition";
import { planSeriesBars } from "./seriesBarPlan";
import { rowChartDefinition } from "../RowChart/definition";

beforeAll(registerAllCharts);
const chart: BarChartSettings = {
  ...barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 8, h: 5 },
    "Amount"
  ),
  id: "stack",
  aggregateId: "totals",
  seriesField: "Channel",
  seriesLayout: "percent",
};
const spec = {
  id: "totals",
  name: "Totals",
  groupField: "Region",
  measureField: "Amount",
  aggregation: "sum" as const,
};
const saved: SavedDataStructure = {
  charts: [
    chart,
    {
      ...rowChartDefinition.createDefaultSettings(
        { x: 8, y: 0, w: 4, h: 5 },
        "Channel"
      ),
      id: "channels",
    },
  ],
  aggregates: [spec],
  calculations: [],
  colorScales: [],
  fieldSettings: { Amount: { type: "numeric" } },
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: { name: "test", version: 1, createdAt: "", modifiedAt: "" },
};
function plan(
  data: AggregateInputRow[],
  layout: BarChartSettings["seriesLayout"]
) {
  const values = [...new Set(data.map((row) => row.Channel))];
  return planSeriesBars({
    settings: { ...chart, seriesLayout: layout },
    revision: "1",
    width: 600,
    height: 300,
    getColor: () => "blue",
    getLabel: (field) => field,
    format: (_field, value) => String(value),
    summaries: values.map((value) => ({
      value,
      result: calculateGroupedAggregate(
        data.filter((row) => row.Channel === value),
        spec
      ),
    })),
  });
}
it("stacks signed sums from zero and proves each share's numerator and category denominator", () => {
  const signed = plan(
    [
      { __ID: 0, Region: "A", Channel: "Web", Amount: 12 },
      { __ID: 1, Region: "A", Channel: "Store", Amount: -5 },
      { __ID: 2, Region: "A", Channel: "Other", Amount: 8 },
    ],
    "stacked"
  );
  expect(signed.bars.map((bar) => [bar.stack?.start, bar.stack?.end])).toEqual([
    [0, 12],
    [0, -5],
    [12, 20],
  ]);
  expect(signed.bars.map((bar) => bar.stack?.total)).toEqual([15, 15, 15]);
  expect(new Set(signed.bars.map((bar) => bar.x)).size).toBe(1);
  expect(signed.domain.domain[0]).toBeLessThan(-5);
  expect(signed.domain.domain[1]).toBeGreaterThan(20);
  const positive = [
    { __ID: 0, Region: "A", Channel: "Web", Amount: 10 },
    { __ID: 1, Region: "A", Channel: "Store", Amount: 30 },
    { __ID: 2, Region: "Zero", Channel: "Web", Amount: 0 },
    { __ID: 3, Region: "Zero", Channel: "Store", Amount: 0 },
  ];
  const percent = plan(positive, "percent");
  expect(
    percent.bars
      .slice(0, 2)
      .map((bar) => [bar.stack?.start, bar.stack?.end, bar.valueText])
  ).toEqual([
    [0, 25, "25.0%"],
    [25, 100, "75.0%"],
  ]);
  expect(
    percent.bars[0]!.stack?.parts.flatMap((part) =>
      part.row.contributors.map((row) => row.sourceId)
    )
  ).toEqual([0, 1]);
  expect(percent.bars[2]!.valueText).toBe("No share (zero total)");
  expect(percent.bars[2]!.x).not.toBe(percent.bars[3]!.x);
  expect(percent.bars[2]!.y + percent.bars[2]!.height).toBeLessThanOrEqual(
    percent.bars[2]!.baseline
  );
  expect(
    percent.bars.every(
      (bar) => Number.isFinite(bar.y) && Number.isFinite(bar.height)
    )
  ).toBe(true);
  expect(percent.domain.domain).toEqual([0, 100]);
  expect(
    plan([{ __ID: 0, Region: "A", Channel: "Web", Amount: -1 }], "percent")
      .notice
  ).toContain("nonnegative");
  for (const seriesLayout of ["grouped", "stacked", "percent"] as const) {
    const restored = JSON.parse(
      stringifySavedData({ ...saved, charts: [{ ...chart, seriesLayout }] })
    );
    expect(validateSavedData(restored)).toBe(true);
    expect(restored.charts[0].seriesLayout).toBe(seriesLayout);
  }
  expect(
    validateSavedData({
      ...saved,
      charts: [{ ...chart, seriesLayout: "mystery" }],
    })
  ).toBe(false);
  expect(
    validateSavedData({
      ...saved,
      aggregates: [{ ...spec, aggregation: "average" }],
    })
  ).toBe(false);
});
function Workspace() {
  const settings = useDataLayer((s) => s.charts[0]) as BarChartSettings;
  const update = useDataLayer((s) => s.updateChart);
  const wrapper = useDataLayer((s) => s.crossfilterWrapper);
  const live = useDataLayer((s) => s.liveItems);
  void live;
  return (
    <>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <button
        onClick={() =>
          update("channels", {
            filters: [{ type: "value", field: "Channel", values: ["Web"] }],
          })
        }
      >
        Web only
      </button>
      <ChartTraceScope>
        <BarChart settings={settings} width={600} height={340} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects source rows for one segment and recalculates its denominator after another chart filters", () => {
  render(
    <DataLayerProvider
      savedData={saved}
      data={[
        { Region: "A", Channel: "Web", Amount: "10" },
        { Region: "A", Channel: "Store", Amount: "30" },
        { Region: "A", Channel: "Web", Amount: "bad" },
        { Region: "B", Channel: "Web", Amount: "20" },
        { Region: "B", Channel: "Store", Amount: "20" },
      ]}
    >
      <Workspace />
    </DataLayerProvider>
  );
  const bar = screen.getByRole("button", { name: "A · Web: 25.0%" });
  fireEvent.click(bar);
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0,2");
  fireEvent.keyDown(bar, { key: "Enter", altKey: true });
  const trace = screen.getByLabelText("Bar trace");
  expect(trace).toHaveTextContent("10 ÷ 40 × 100 = 25.0%");
  expect(trace).toHaveTextContent("1 of 2 · 1 excluded");
  expect(
    within(trace).getByText("Category total records · 3 rows")
  ).toBeInTheDocument();
  fireEvent.click(within(trace).getByText("Category total records · 3 rows"));
  fireEvent.click(within(trace).getByText("Store · 30 · 1 row"));
  expect(within(trace).getAllByRole("table").at(-1)).toHaveTextContent("1");
  fireEvent.click(bar);
  fireEvent.click(screen.getByRole("button", { name: "Web only" }));
  const filtered = screen.getByRole("button", { name: "A · Web: 100.0%" });
  fireEvent.keyDown(filtered, { key: "Enter", altKey: true });
  expect(screen.getByLabelText("Bar trace")).toHaveTextContent(
    "10 ÷ 10 × 100 = 100.0%"
  );
});
