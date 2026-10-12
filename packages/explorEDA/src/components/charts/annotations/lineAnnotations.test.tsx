import { render } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { parseDateText } from "@/lib/valueParsing";
import { LineChart } from "../LineChart/LineChart";
import {
  DEFAULT_SERIES_SETTINGS,
  DEFAULT_TIME_SERIES,
  lineChartDefinition,
  type LineChartSettings,
} from "../LineChart/definition";

beforeAll(() => {
  registerAllCharts();
  window.PointerEvent = MouseEvent as typeof PointerEvent;
});

const rows = [
  { week: 1, sales: 10, cost: 100, lo: 8, hi: 12 },
  { week: 2, sales: 14, cost: 300, lo: 11, hi: 17 },
  { week: 3, sales: 30, cost: 200, lo: 24, hi: 36 },
  { week: 4, sales: 18, cost: 250, lo: 15, hi: 21 },
];

it("draws a callout on a series, a band, and a supplied interval on a line chart", () => {
  const settings: LineChartSettings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    xField: "week",
    seriesField: ["sales", "cost"],
    showLegend: false,
    seriesSettings: {
      sales: DEFAULT_SERIES_SETTINGS,
      cost: { ...DEFAULT_SERIES_SETTINGS, useRightAxis: true },
    },
    annotations: [
      {
        id: "peak",
        type: "callout",
        text: "Peak cost",
        attach: {
          kind: "record",
          keyFields: ["week"],
          key: [2],
          yField: "cost",
        },
        offset: { dx: 10, dy: -10 },
      },
      {
        id: "normal",
        type: "band",
        axis: "y",
        from: 12,
        to: 20,
        label: "Normal",
      },
      {
        id: "range",
        type: "interval",
        lowerField: "lo",
        upperField: "hi",
        meaning: "Supplied range",
      },
    ],
  };
  const { container } = render(
    <DataLayerProvider data={rows} charts={[settings]}>
      <LineChart settings={settings} width={500} height={300} />
    </DataLayerProvider>
  );
  const ring = container.querySelector('[data-annotation-id="peak"] circle')!;
  // Week 2's cost is the highest right-axis value, so it sits at the top.
  const costs = [
    ...container.querySelectorAll('[data-annotation-id="peak"] circle'),
  ];
  expect(costs).toHaveLength(1);
  expect(Number(ring.getAttribute("cy"))).toBeLessThan(5);
  expect(
    container.querySelector('rect[data-annotation-id="normal"]')
  ).not.toBeNull();
  const ribbon = container.querySelector('path[data-annotation-id="range"]')!;
  expect(ribbon.getAttribute("d")!.split("L")).toHaveLength(8);
  expect(container.textContent).toContain("Supplied range");
});

it("marks an event date on a time series", () => {
  const data = [
    { Date: "2024-01-01", Amount: 5 },
    { Date: "2024-02-01", Amount: 7 },
    { Date: "2024-03-01", Amount: 6 },
  ];
  const settings: LineChartSettings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    xField: "Date",
    time: {
      ...DEFAULT_TIME_SERIES,
      aggregation: "sum",
      measureField: "Amount",
    },
    annotations: [
      {
        id: "launch",
        type: "reference-line",
        axis: "x",
        value: parseDateText("2024-02-01"),
        label: "Launch",
      },
    ],
  };
  const { container } = render(
    <DataLayerProvider data={data} charts={[settings]}>
      <LineChart settings={settings} width={500} height={300} />
    </DataLayerProvider>
  );
  const rule = container.querySelector('line[data-annotation-id="launch"]');
  expect(rule).not.toBeNull();
  expect(container.textContent).toContain("Launch");
});
