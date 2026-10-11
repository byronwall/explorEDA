import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { BarChart } from "./BarChart/BarChart";
import {
  barChartDefinition,
  type BarChartSettings,
} from "./BarChart/definition";
import { LineChart } from "./LineChart/LineChart";
import {
  DEFAULT_TIME_SERIES,
  lineChartDefinition,
  type LineChartSettings,
} from "./LineChart/definition";
import { rowChartDefinition } from "./RowChart/definition";

beforeAll(() => {
  registerAllCharts();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const layout = { x: 0, y: 0, w: 6, h: 4 };
const rows = [
  { Region: "West", Channel: "Web", Amount: 10, Date: "2024-01-01" },
  { Region: "West", Channel: "Web", Amount: 30, Date: "2024-01-02" },
  { Region: "West", Channel: "Store", Amount: 100, Date: "2024-01-03" },
  { Region: "East", Channel: "Web", Amount: 20, Date: "2024-01-01" },
  { Region: "East", Channel: "Store", Amount: 40, Date: "2024-01-02" },
];

function setup(target: ChartSettings, aggregation: "sum" | "average" = "sum") {
  const saved: SavedDataStructure = {
    charts: [
      target,
      {
        ...rowChartDefinition.createDefaultSettings(layout, "Channel"),
        id: "channels",
      },
    ],
    aggregates: [
      {
        id: "sales",
        name: "Sales",
        groupField: "Region",
        measureField: "Amount",
        aggregation,
      },
    ],
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
  function Workspace() {
    const settings = useDataLayer((s) => s.charts[0]!);
    const update = useDataLayer((s) => s.updateChart);
    const Chart = settings.type === "line" ? LineChart : BarChart;
    return (
      <>
        {["Web", "Store"].map((channel) => (
          <button
            key={channel}
            onClick={() =>
              update("channels", {
                filters: [
                  { type: "value", field: "Channel", values: [channel] },
                ],
              })
            }
          >
            {channel} only
          </button>
        ))}
        <Chart settings={settings as never} width={600} height={360} />
      </>
    );
  }
  const view = render(
    <DataLayerProvider savedData={saved} data={rows}>
      <Workspace />
    </DataLayerProvider>
  );
  const top = () =>
    Number(
      view.container
        .querySelector('[data-axis-edit="y"]')!
        .getAttribute("data-domain")!
        .split(",")[1]
    );
  const filter = (channel: string) =>
    fireEvent.click(screen.getByRole("button", { name: `${channel} only` }));
  return { top, filter };
}

const bars: BarChartSettings = {
  ...barChartDefinition.createDefaultSettings(layout, "Amount"),
  id: "bars",
  aggregateId: "sales",
};

it("keeps an aggregate bar chart's value axis while another chart filters", () => {
  const { top, filter } = setup(bars);
  const before = top();
  // West sums to 140 over every row.
  expect(before).toBeGreaterThanOrEqual(140);
  filter("Web");
  expect(top()).toBe(before);
});

it("grows the axis to fit a filtered average past the all-row domain", () => {
  const { top, filter } = setup(bars, "average");
  const before = top();
  // West averages 46.7 over every row, but 100 over store orders alone.
  expect(before).toBeLessThan(100);
  filter("Store");
  expect(top()).toBeGreaterThanOrEqual(100);
  filter("Web");
  expect(top()).toBe(before);
});

it("keeps a series bar chart's value axis while another chart filters", () => {
  const { top, filter } = setup({ ...bars, seriesField: "Channel" });
  const before = top();
  expect(before).toBeGreaterThanOrEqual(100);
  filter("Web");
  expect(top()).toBe(before);
});

it("keeps a time series value axis while another chart filters", () => {
  const line: LineChartSettings = {
    ...lineChartDefinition.createDefaultSettings(layout),
    id: "time",
    xField: "Date",
    time: {
      ...DEFAULT_TIME_SERIES,
      interval: "day",
      aggregation: "sum",
      measureField: "Amount",
    },
  };
  const { top, filter } = setup(line);
  const before = top();
  expect(before).toBeGreaterThanOrEqual(100);
  filter("Web");
  expect(top()).toBe(before);
});
