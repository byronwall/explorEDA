import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { AxisSettingsTab } from "../../settings/AxisSettingsTab";
import { barChartDefinition } from "../BarChart/definition";
import { boxPlotDefinition } from "../BoxPlot/definition";
import {
  DEFAULT_TIME_SERIES,
  lineChartDefinition,
} from "../LineChart/definition";
import { scatterPlotDefinition } from "../ScatterPlot/definition";
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
const data = [-3, 0, 1, 10, 100, 1000].map((a, i) => ({ a, b: i + 1 }));
const scatter = () => {
  const defaults = scatterPlotDefinition.createDefaultSettings(layout);
  return { ...defaults, xField: "a", yField: "b" };
};

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

it("warns at the low end of a log axis about rows at or below zero", async () => {
  const chart = scatter();
  const view = render(
    <DataLayerProvider
      data={data}
      charts={[{ ...chart, xAxis: { ...chart.xAxis, scaleType: "log" } }]}
    >
      <Panel />
    </DataLayerProvider>
  );
  const marker = view.container.querySelector(
    '[data-axis-hidden="x:nonpositive"]'
  )!;
  expect(marker).toHaveAccessibleName(
    "2 rows at or below zero are not on the X log scale. Show details"
  );
  fireEvent.focus(marker);
  const details = await screen.findByRole("dialog", {
    name: "Not on the X log scale",
  });
  expect(details).toHaveTextContent("2 rows have X at or below zero");
  expect(screen.queryByRole("button", { name: /Reset/ })).toBeNull();
});

function Tab({ chart }: { chart: ChartSettings }) {
  return (
    <DataLayerProvider data={data} charts={[chart]}>
      <AxisSettingsTab settings={chart} onSettingChange={() => {}} />
    </DataLayerProvider>
  );
}

it("offers Log only where a chart can draw it", () => {
  const { unmount } = render(<Tab chart={scatter()} />);
  expect(screen.getAllByRole("radio", { name: "Log" })).toHaveLength(2);
  unmount();
  render(<Tab chart={barChartDefinition.createDefaultSettings(layout, "a")} />);
  expect(screen.queryByRole("radio", { name: "Log" })).toBeNull();
});

function markersFor(chart: ChartSettings, rows = data) {
  const view = render(
    <DataLayerProvider data={rows} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  return {
    markers: Object.fromEntries(
      [...view.container.querySelectorAll("[data-axis-hidden]")].map((el) => [
        el.getAttribute("data-axis-hidden"),
        el.getAttribute("aria-label"),
      ])
    ),
    scale: view.container
      .querySelector('[data-axis-edit="y"]')
      ?.getAttribute("data-scale-type"),
  };
}

it("draws a box plot on a log axis and counts rows at or below zero", () => {
  const box = boxPlotDefinition.createDefaultSettings(layout, "a");
  expect(
    markersFor({ ...box, yAxis: { ...box.yAxis, scaleType: "log" } })
  ).toEqual({
    scale: "log",
    markers: {
      "y:nonpositive":
        "2 rows at or below zero are not on the Y log scale. Show details",
    },
  });
});

it("draws a numeric line on a log axis and counts points at or below zero", () => {
  const line = lineChartDefinition.createDefaultSettings(layout);
  expect(
    markersFor({
      ...line,
      id: "line",
      xField: "b",
      seriesField: ["a"],
      yAxis: { scaleType: "log" },
    })
  ).toEqual({
    scale: "log",
    markers: {
      "y:nonpositive":
        "2 points at or below zero are not on the Y log scale. Show details",
    },
  });
});

it("draws a time series line on a log axis but keeps areas linear", () => {
  const rows = [0, 5, 50, 500].map((value, i) => ({
    value,
    date: `2024-01-0${i + 1}`,
  }));
  const line = {
    ...lineChartDefinition.createDefaultSettings(layout),
    id: "time",
    xField: "date",
    yAxis: { scaleType: "log" as const },
    time: {
      ...DEFAULT_TIME_SERIES,
      interval: "day" as const,
      aggregation: "sum" as const,
      measureField: "value",
    },
  };
  expect(markersFor(line, rows as never)).toEqual({
    scale: "log",
    markers: {
      "y:nonpositive":
        "1 point at or below zero is not on the Y log scale. Show details",
    },
  });
  expect(
    markersFor(
      { ...line, time: { ...line.time, display: "area" } },
      rows as never
    ).scale
  ).toBe("linear");
});
