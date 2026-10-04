import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { formatFieldValue } from "@/lib/fieldSettings";
import { rowChartDefinition } from "../RowChart/definition";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { MetricCard } from "./MetricCard";
import { metricCardDefinition, type MetricCardSettings } from "./definition";
import { planMetricCard } from "./metricCardPlan";

beforeAll(registerAllCharts);
const layout = { x: 0, y: 0, w: 4, h: 2 };
const metric: MetricCardSettings = {
  ...metricCardDefinition.createDefaultSettings(layout),
  id: "metric",
  aggregation: "sum",
  measureField: "Revenue",
};

function Workspace() {
  const settings = useDataLayer(
    (state) => state.charts[0]
  ) as MetricCardSettings;
  const updateChart = useDataLayer((state) => state.updateChart);
  const updateFieldSettings = useDataLayer(
    (state) => state.updateFieldSettings
  );
  return (
    <>
      <button
        onClick={() =>
          updateChart("channels", {
            filters: [{ type: "value", field: "Channel", values: ["Web"] }],
          })
        }
      >
        Web orders
      </button>
      <button
        onClick={() =>
          updateChart("channels", {
            filters: [{ type: "value", field: "Channel", values: ["Missing"] }],
          })
        }
      >
        No orders
      </button>
      <button onClick={() => updateChart("metric", { aggregation: "average" })}>
        Average
      </button>
      <button onClick={() => updateChart("metric", { aggregation: "count" })}>
        Count
      </button>
      <button
        onClick={() =>
          updateFieldSettings("Revenue", {
            type: "numeric",
            format: "currency",
            precision: 2,
          })
        }
      >
        Format revenue
      </button>
      <ChartTraceScope>
        <MetricCard settings={settings} width={350} height={130} />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}

it("updates from linked filters and field conversion, and inspects the same contributors", () => {
  render(
    <DataLayerProvider
      data={[
        { Channel: "Web", Revenue: "10" },
        { Channel: "Web", Revenue: "20" },
        { Channel: "Web", Revenue: "bad" },
        { Channel: "Store", Revenue: "5" },
      ]}
      charts={[
        metric,
        {
          ...rowChartDefinition.createDefaultSettings(layout, "Channel"),
          id: "channels",
        },
      ]}
    >
      <Workspace />
    </DataLayerProvider>
  );

  fireEvent.click(screen.getByText("Format revenue"));
  expect(
    within(screen.getByLabelText("Sum of Revenue")).getByText("$35.00")
  ).toBeInTheDocument();
  fireEvent.click(screen.getByText("Web orders"));
  const card = screen.getByLabelText("Sum of Revenue");
  expect(within(card).getByText("$30.00")).toBeInTheDocument();
  expect(card).toHaveTextContent("1 excluded");
  expect(card).toHaveTextContent("86% of the $35.00 total · 3 of 4 rows");
  fireEvent.click(within(card).getByText("$30.00"));
  expect(card).toHaveTextContent("3 of 4 rows");
  fireEvent.click(screen.getByRole("button", { name: "Inspect records" }));
  const trace = screen.getByLabelText("Metric card trace");
  const rows = within(trace).getByRole("table");
  expect(within(rows).getAllByRole("row")).toHaveLength(4);
  expect(rows).toHaveTextContent('"10"');
  expect(rows).toHaveTextContent('"bad"');
  expect(rows).toHaveTextContent("Conversion failed");

  fireEvent.click(screen.getByText("Average", { exact: true }));
  expect(screen.queryByLabelText("Metric card trace")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Average of Revenue")).toHaveTextContent(
    "$15.00+$3.33 vs $11.67 for all rows · 3 of 4 rows"
  );
  fireEvent.click(screen.getByText("Count", { exact: true }));
  expect(screen.getByLabelText("Row count")).toHaveTextContent(
    "75% of all 4 rows"
  );
  fireEvent.click(screen.getByText("No orders"));
  expect(screen.getByLabelText("Row count")).toHaveTextContent("No rows");
});

it("distinguishes no rows, no valid measure, and a valid zero", () => {
  const plan = (
    liveIds: number[],
    measureData: Record<number, number | null>
  ) =>
    planMetricCard(
      metric,
      {
        revision: "test",
        liveIds,
        measureData,
      },
      (field) => field,
      formatFieldValue
    );
  expect(plan([], {})).toMatchObject({ state: "empty", valueText: "No rows" });
  expect(plan([0], { 0: null })).toMatchObject({
    state: "invalid",
    valueText: "No valid values",
    excludedCount: 1,
  });
  expect(plan([0, 1], { 0: -10, 1: 10 })).toMatchObject({
    state: "value",
    value: 0,
    valueText: "0",
    includedCount: 2,
  });
});

it("compares a filtered card with the same metric over every row", () => {
  const plan = (aggregation: MetricCardSettings["aggregation"]) =>
    planMetricCard(
      { ...metric, aggregation },
      {
        revision: "test",
        liveIds: [0, 1],
        allIds: [0, 1, 2, 3],
        measureData: { 0: 10, 1: 30, 2: 20, 3: 40 },
      },
      (field) => field,
      formatFieldValue
    );
  expect(plan("count").comparison).toMatchObject({
    kind: "share",
    share: 0.5,
    baselineText: "4",
  });
  expect(plan("sum")).toMatchObject({
    totalRows: 4,
    comparison: { kind: "share", share: 0.4, baselineText: "100" },
  });
  expect(plan("average").comparison).toMatchObject({
    kind: "delta",
    delta: -5,
    deltaText: "−5",
    baselineText: "25",
  });
  // A card over every row has nothing to compare against.
  expect(
    planMetricCard(
      metric,
      {
        revision: "test",
        liveIds: [0, 1],
        allIds: [0, 1],
        measureData: { 0: 10, 1: 30 },
      },
      (field) => field,
      formatFieldValue
    ).comparison
  ).toBeUndefined();
});
