import { render } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { barChartDefinition } from "../BarChart/definition";
import { boxPlotDefinition } from "../BoxPlot/definition";
import {
  DEFAULT_TIME_SERIES,
  lineChartDefinition,
} from "../LineChart/definition";
import { rowChartDefinition } from "../RowChart/definition";
import { PlotChartPanel } from "../../PlotChartPanel";

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

/** Eight rows: values 1–8, two categories, one date per row. */
const data = [1, 2, 3, 4, 5, 6, 7, 8].map((value) => ({
  value,
  group: value <= 6 ? "many" : "few",
  date: `2024-01-0${value}`,
}));

function markers(chart: ChartSettings) {
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <PlotChartPanel
        settings={charts[0]!}
        width={600}
        height={420}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    );
  }
  const view = render(
    <DataLayerProvider data={data} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  return Object.fromEntries(
    [...view.container.querySelectorAll("[data-axis-hidden]")].map((el) => [
      el.getAttribute("data-axis-hidden"),
      el.getAttribute("aria-label"),
    ])
  );
}

it("counts bars a count bar chart cuts off", () => {
  const bar = barChartDefinition.createDefaultSettings(layout, "group");
  expect(
    markers({ ...bar, yAxis: { ...bar.yAxis, limits: { max: 4 } } })
  ).toEqual({ "y:high": "1 bar above the Y maximum. Show details" });
});

it("counts rows a histogram bound leaves out", () => {
  const bar = barChartDefinition.createDefaultSettings(layout, "value");
  expect(
    markers({ ...bar, xAxis: { ...bar.xAxis, limits: { min: 2.5, max: 7 } } })
  ).toEqual({
    "x:low": "2 rows below the X minimum. Show details",
    "x:high": "1 row above the X maximum. Show details",
  });
});

it("counts bars a row chart cuts off", () => {
  const row = rowChartDefinition.createDefaultSettings(layout, "group");
  expect(
    markers({ ...row, xAxis: { ...row.xAxis, limits: { max: 3 } } })
  ).toEqual({ "x:high": "1 bar above the X maximum. Show details" });
});

it("counts box plot rows past a bound", () => {
  const box = boxPlotDefinition.createDefaultSettings(layout, "value");
  expect(
    markers({ ...box, yAxis: { ...box.yAxis, limits: { min: 3 } } })
  ).toEqual({ "y:low": "2 rows below the Y minimum. Show details" });
});

it("counts line points past a bound on both axes", () => {
  const line = lineChartDefinition.createDefaultSettings(layout);
  expect(
    markers({
      ...line,
      id: "line",
      xField: "value",
      seriesField: ["value"],
      xAxis: { limits: { max: 6 } },
      yAxis: { limits: { min: 2 } },
    })
  ).toEqual({
    "x:high": "2 rows above the X maximum. Show details",
    "y:low": "1 point below the Y minimum. Show details",
  });
});

it("counts time-series periods past a bound", () => {
  const line = lineChartDefinition.createDefaultSettings(layout);
  expect(
    markers({
      ...line,
      id: "time",
      xField: "date",
      time: {
        ...DEFAULT_TIME_SERIES,
        interval: "day",
        aggregation: "sum",
        measureField: "value",
      },
      yAxis: { limits: { max: 5 } },
    })
  ).toEqual({ "y:high": "3 points above the Y maximum. Show details" });
});

it("draws no marker without a bound", () => {
  expect(
    markers(barChartDefinition.createDefaultSettings(layout, "group"))
  ).toEqual({});
});
