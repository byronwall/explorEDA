import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { LineChart } from "./LineChart";
import { DEFAULT_SERIES_SETTINGS, lineChartDefinition } from "./definition";

it("reads every series at the hovered x and clears during brushing or missing observations", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  registerAllCharts();
  const settings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "line-readout",
    xField: "day",
    seriesField: ["visitors", "cost"],
    showLegend: false,
    seriesSettings: {
      visitors: {
        ...DEFAULT_SERIES_SETTINGS,
        lineColor: "#3479a8",
        showPoints: true,
      },
      cost: {
        ...DEFAULT_SERIES_SETTINGS,
        lineColor: "#c67842",
        useRightAxis: true,
      },
    },
  };
  const data = [
    { day: 0, visitors: 0, cost: 100 },
    { day: 5, visitors: 2.5, cost: 1000 },
    { day: 7, visitors: null, cost: null },
    { day: 10, visitors: 10, cost: 200 },
  ];
  const { container } = render(
    <DataLayerProvider data={data} charts={[settings]}>
      <LineChart settings={settings} width={400} height={300} />
    </DataLayerProvider>
  );
  const chart = container.firstElementChild!;
  fireEvent.pointerMove(chart, { clientX: 200, clientY: 208 });
  // Both series read at the hovered x, top of the plot first.
  expect(screen.getByRole("status")).toHaveTextContent(
    "day5cost1,000visitors2.5"
  );
  fireEvent.pointerMove(chart, { clientX: 200, clientY: 21 });
  expect(screen.getByRole("status")).toHaveTextContent("day5");
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.keyDown(chart.querySelector("svg")!, { key: "Escape" });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  fireEvent.pointerMove(chart, { clientX: 200, clientY: 208 });
  fireEvent.pointerDown(chart.querySelector("svg")!, {
    clientX: 200,
    clientY: 208,
    button: 0,
  });
  fireEvent.pointerMove(chart, { clientX: 201, clientY: 208, buttons: 1 });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  fireEvent.pointerUp(document.body, { clientX: 500, clientY: 208 });
  fireEvent.pointerMove(chart, { clientX: 200, clientY: 208 });
  expect(screen.getByRole("status")).toHaveTextContent("visitors2.5");
  fireEvent.pointerMove(chart, { clientX: 256, clientY: 208 });
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("sorts X values while retaining a missing-value line gap", () => {
  const settings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "line-ordering",
    xField: "x",
    seriesField: ["y"],
    showLegend: false,
  };
  const { container } = render(
    <DataLayerProvider
      data={[
        { x: 3, y: 30 },
        { x: 1, y: 10 },
        { x: 2, y: null },
        { x: 0, y: 0 },
      ]}
      charts={[settings]}
    >
      <LineChart settings={settings} width={400} height={300} />
    </DataLayerProvider>
  );

  const path = container.querySelector("path");
  expect(path?.getAttribute("d")?.match(/M/g)).toHaveLength(2);
});

it("plots ISO dates on the x axis with calendar ticks", () => {
  registerAllCharts();
  const settings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "line-dates",
    xField: "time",
    seriesField: ["demand"],
    showLegend: false,
  };
  const { container } = render(
    <DataLayerProvider
      data={[
        { time: "2021-02-07T00:00:00Z", demand: 40 },
        { time: "2021-02-09T00:00:00Z", demand: 55 },
        { time: "2021-02-08T00:00:00Z", demand: 50 },
      ]}
      charts={[settings]}
    >
      <LineChart settings={settings} width={400} height={300} />
    </DataLayerProvider>
  );
  const path = container.querySelector("path.eda-series-line, path[d^='M']");
  expect(path?.getAttribute("d")).toMatch(/^M[\d.]+,[\d.]+L[\d.]+,[\d.]+L/);
  expect(container.textContent).toMatch(/Feb 07/);
  expect(container.textContent).not.toMatch(/1,612/);
});
