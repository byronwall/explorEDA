import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { LineChart } from "./LineChart";
import {
  DEFAULT_TIME_SERIES,
  lineChartDefinition,
  type LineChartSettings,
} from "./definition";
import {
  planTimeSeries,
  timeAreaAt,
  type TimeSeriesSnapshot,
} from "./timeSeriesPlan";

beforeAll(registerAllCharts);
const chart: LineChartSettings = {
  ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 5 }),
  id: "area",
  xField: "Date",
  time: {
    ...DEFAULT_TIME_SERIES,
    display: "stacked-area",
    aggregation: "sum",
    measureField: "Amount",
    splitField: "Channel",
  },
};
const snapshot: TimeSeriesSnapshot = {
  revision: "1",
  allIds: [0, 1, 2, 3, 4, 5, 6],
  liveIds: [0, 1, 2, 3, 4, 5, 6],
  dates: {
    0: "2024-01-01",
    1: "2024-01-01",
    2: "2024-02-01",
    3: "2024-02-01",
    4: "2024-03-01",
    5: "2024-03-01",
    6: "2024-04-01",
  },
  measures: { 0: 10, 1: 30, 2: 20, 3: 40, 4: null, 5: 30, 6: 5 },
  groups: {
    0: "Web",
    1: "Store",
    2: "Web",
    3: "Store",
    4: "Web",
    5: "Store",
    6: "Web",
  },
  rawDates: {},
  rawInputs: {},
  exclusionReasons: {},
};
const plan = (settings = chart, data = snapshot) =>
  planTimeSeries(
    settings,
    data,
    650,
    350,
    (field) => field,
    (_, value) => String(value)
  );
it("uses exact stacked bounds, breaks incomplete periods, and keeps ordinary signed areas on zero", () => {
  const stacked = plan();
  expect(stacked.series[0]!.points[0]!.band).toEqual({
    lower: 0,
    upper: 10,
    complete: true,
  });
  expect(stacked.series[1]!.points[0]!.band).toEqual({
    lower: 10,
    upper: 40,
    complete: true,
  });
  expect(stacked.yScale.domain()).toEqual([0, 60]);
  const jan = stacked.series[0]!.points[0]!;
  const feb = stacked.series[0]!.points[1]!;
  const hit = timeAreaAt(
    stacked,
    jan.x + (feb.x - jan.x) * 0.25,
    stacked.yScale(25)
  );
  expect(hit?.seriesLabel).toBe("Store");
  expect(hit?.start).toBe(jan.start);
  expect(stacked.incompletePeriods).toBe(2);
  expect(
    stacked.series.every((series) => !series.points[2]!.band!.complete)
  ).toBe(true);
  expect(
    stacked.series.every(
      (series) => series.areaPath && !series.areaPath.includes("NaN")
    )
  ).toBe(true);
  const zero = plan({
    ...chart,
    time: { ...chart.time!, missingPeriods: "zero" },
  });
  expect(zero.incompletePeriods).toBe(1);
  expect(zero.series[1]!.points[3]!.band).toEqual({
    lower: 5,
    upper: 5,
    complete: true,
  });
  const signed = { ...snapshot, measures: { ...snapshot.measures, 0: -10 } };
  expect(plan(chart, signed).notice).toContain("nonnegative");
  const area = plan(
    {
      ...chart,
      time: { ...chart.time!, display: "area" },
      yAxis: { scaleType: "symlog" },
    },
    signed
  );
  expect(area.notice).toBeUndefined();
  expect(area.series[0]!.points[0]!.band).toEqual({
    lower: 0,
    upper: -10,
    complete: true,
  });
  expect(area.yScaleType).toBe("linear");
  expect(area.yScale.domain()[0]).toBe(-10);
});
function Workspace() {
  const settings = useDataLayer((s) => s.charts[0]) as LineChartSettings;
  const wrapper = useDataLayer((s) => s.crossfilterWrapper);
  const live = useDataLayer((s) => s.liveItems);
  const getSaved = useDataLayer((s) => s.saveToStructure);
  void live;
  return (
    <>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <button
        onClick={() => {
          const saved = JSON.parse(stringifySavedData(getSaved()));
          expect(validateSavedData(saved)).toBe(true);
          expect(saved.charts[0].time.display).toBe("stacked-area");
          saved.charts[0].time.display = "mystery";
          expect(validateSavedData(saved)).toBe(false);
          saved.charts[0].time.display = "stacked-area";
          saved.charts[0].time.aggregation = "average";
          expect(validateSavedData(saved)).toBe(false);
        }}
      >
        Check saved settings
      </button>
      <ChartTraceScope>
        <LineChart settings={settings} width={650} height={350} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects one period-series pair and traces the records that establish its stacked baseline", () => {
  render(
    <DataLayerProvider
      data={[
        { Date: "2024-01-01", Amount: 10, Channel: "Web" },
        { Date: "2024-01-01", Amount: 30, Channel: "Store" },
        { Date: "2024-02-01", Amount: 20, Channel: "Web" },
        { Date: "2024-02-01", Amount: 40, Channel: "Store" },
      ]}
      charts={[chart]}
    >
      <Workspace />
    </DataLayerProvider>
  );
  const store = screen.getByRole("button", {
    name: "Store · 2024-01-01 – 2024-01-31: 30",
  });
  fireEvent.keyDown(store, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("1");
  fireEvent.keyDown(store, { key: "Enter", altKey: true });
  const trace = screen.getByLabelText("Time series trace");
  expect(trace).toHaveTextContent("10 to 40");
  expect(within(trace).getByRole("table")).toHaveTextContent(
    '1"2024-01-01"30Yes'
  );
  fireEvent.click(within(trace).getByText("Series in this stack"));
  fireEvent.click(
    within(trace).getByRole("button", { name: "Inspect Web for this period" })
  );
  expect(
    within(screen.getByLabelText("Time series trace")).getByRole("table")
  ).toHaveTextContent('0"2024-01-01"10Yes');
  fireEvent.click(screen.getByRole("button", { name: "Check saved settings" }));
});
