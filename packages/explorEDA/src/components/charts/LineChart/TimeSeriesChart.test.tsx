import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { useState } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { rowChartDefinition } from "../RowChart/definition";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import {
  AnalysisChartContextProvider,
  queryChartFilterRevision,
} from "@/components/AnalysisChartContext";
import { LineChart } from "./LineChart";
import {
  DEFAULT_TIME_SERIES,
  lineChartDefinition,
  type LineChartSettings,
} from "./definition";
import { planTimeSeries, type TimeSeriesSnapshot } from "./timeSeriesPlan";

beforeAll(registerAllCharts);
const chart: LineChartSettings = {
  ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 8, h: 5 }),
  id: "time",
  filters: [{ type: "value", field: "Channel", values: [] }],
  xField: "Date",
  time: {
    ...DEFAULT_TIME_SERIES,
    aggregation: "sum",
    measureField: "Amount",
    splitField: "Channel",
  },
};
function Workspace() {
  const [facet, setFacet] = useState(false);
  const settings = useDataLayer((s) => s.charts[0]) as LineChartSettings;
  const update = useDataLayer((s) => s.updateChart);
  const data = useDataLayer((s) => s.liveItems);
  const wrapper = useDataLayer((s) => s.crossfilterWrapper);
  void data;
  return (
    <>
      <button
        onClick={() =>
          update("channels", {
            filters: [{ type: "value", field: "Channel", values: ["Web"] }],
          })
        }
      >
        Web only
      </button>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <button onClick={() => setFacet(true)}>North facet</button>
      <ChartTraceScope>
        <LineChart
          settings={
            facet
              ? {
                  ...settings,
                  facet: {
                    enabled: true,
                    type: "wrap",
                    rowVariable: "Region",
                    columnCount: 2,
                  },
                }
              : settings
          }
          facetIds={facet ? [0, 4] : undefined}
          width={650}
          height={340}
        />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects exact period and series IDs, traces inputs, and follows another chart", () => {
  const onOpenQueryFlow = vi.fn();
  const chartFilterScopes = [
    {
      chartId: "time",
      label: "Time series",
      filters: [{ type: "value" as const, field: "Channel", values: [] }],
    },
    { chartId: "channels", label: "Channels", filters: [] },
  ];
  render(
    <AnalysisChartContextProvider
      value={{
        query: { id: "query", label: "Orders", glyph: "O" },
        queryRevision: "query-r1",
        frame: { id: "frame", label: "Orders", glyph: "O" },
        availableCount: 5,
        resultRowsById: {},
        chartFilterScopes,
        onOpenQueryFlow,
      }}
    >
      <DataLayerProvider
        data={[
          { Date: "2024-01-01", Amount: 10, Channel: "Web", Region: "North" },
          {
            Date: "2024-01-31T23:59:59.999Z",
            Amount: 20,
            Channel: "Web",
            Region: "South",
          },
          { Date: "2024-01-05", Amount: 90, Channel: "Store", Region: "South" },
          { Date: "2024-02-01", Amount: 30, Channel: "Web", Region: "South" },
          { Date: "bad", Amount: 15, Channel: "Web", Region: "North" },
        ]}
        charts={[
          chart,
          {
            ...rowChartDefinition.createDefaultSettings({
              x: 8,
              y: 0,
              w: 4,
              h: 5,
            }),
            id: "channels",
            field: "Channel",
          },
        ]}
      >
        <Workspace />
      </DataLayerProvider>
    </AnalysisChartContextProvider>
  );
  const january = screen.getByRole("button", {
    name: "Web · 2024-01-01 – 2024-01-31: 30",
  });
  fireEvent.keyDown(january, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs")).toHaveTextContent("0,1");
  fireEvent.keyDown(january, { key: "Enter", altKey: true });
  expect(
    within(screen.getByLabelText("Time series trace")).getAllByText(
      '"2024-01-31T23:59:59.999Z"'
    )
  ).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Open query flow" }));
  expect(onOpenQueryFlow).toHaveBeenCalledWith(
    undefined,
    expect.objectContaining({
      chartId: "time",
      filterRevision: queryChartFilterRevision("time", chartFilterScopes),
    })
  );
  const handoff = onOpenQueryFlow.mock.calls[0]?.[1];
  expect(handoff?.trace.kind).toBe("time-bucket");
  if (handoff?.trace.kind === "time-bucket")
    expect(handoff.trace.fields).toContain("Amount");
  fireEvent.keyDown(january, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs")).toHaveTextContent("0,1,2,3,4");
  fireEvent.click(screen.getByRole("button", { name: "Web only" }));
  expect(
    screen.queryByRole("button", { name: /Store ·/ })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "1 unreadable dates" }));
  expect(screen.getByLabelText("Time series trace")).toHaveTextContent('"bad"');
  fireEvent.click(screen.getByRole("button", { name: "North facet" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Web · 2024-01-01 – 2024-01-31: 10" })
  );
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
});

it("separates zero, missing periods, and invalid measures without averaging daily averages", () => {
  const snapshot: TimeSeriesSnapshot = {
    revision: "1",
    allIds: [0, 1, 2],
    liveIds: [0, 1, 2],
    dates: { 0: "2024-01-01", 1: "2024-03-01", 2: "2024-04-01" },
    measures: { 0: 0, 1: null, 2: 10 },
    groups: {},
    rawDates: {},
    rawInputs: {},
    exclusionReasons: {},
  };
  const settings = {
    ...chart,
    time: {
      ...chart.time!,
      splitField: undefined,
      missingPeriods: "zero" as const,
    },
  };
  const plan = planTimeSeries(
    settings,
    snapshot,
    650,
    350,
    (field) => field,
    (_, value) => String(value)
  );
  expect(plan.points.map(({ state, value }) => [state, value])).toEqual([
    ["value", 0],
    ["empty", 0],
    ["invalid", undefined],
    ["value", 10],
  ]);
  const average = planTimeSeries(
    { ...settings, time: { ...settings.time, aggregation: "average" } },
    snapshot,
    650,
    350,
    (field) => field,
    (_, value) => String(value)
  );
  expect(average.points[1]?.value).toBeUndefined();
});
