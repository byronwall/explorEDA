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

it("draws one line per split value on a numeric x, each in x order", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  registerAllCharts();
  const settings = {
    ...lineChartDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "line-split",
    xField: "year",
    seriesField: ["invest"],
    colorField: "firm",
  };
  const { container } = render(
    <DataLayerProvider
      data={[
        { year: 1936, firm: "GM", invest: 40 },
        { year: 1935, firm: "IBM", invest: 2 },
        { year: 1935, firm: "GM", invest: 30 },
        { year: 1937, firm: "IBM", invest: 6 },
        { year: 1936, firm: "IBM", invest: 4 },
        { year: 1937, firm: "GM", invest: 50 },
      ]}
      charts={[settings]}
    >
      <LineChart settings={settings} width={400} height={300} />
    </DataLayerProvider>
  );
  const paths = [...container.querySelectorAll("path[fill='none']")].filter(
    (path) => path.getAttribute("d")?.startsWith("M")
  );
  expect(paths).toHaveLength(2);
  // Each firm's path runs left to right through its three years.
  for (const path of paths) {
    const xs = path
      .getAttribute("d")!
      .slice(1)
      .split("L")
      .map((point) => Number(point.split(",")[0]));
    expect(xs).toHaveLength(3);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  }
  // The split names each line by its value; no field legend repeats it.
  expect(
    container.querySelector("[aria-label='Chart series']")
  ).not.toBeInTheDocument();
  fireEvent.pointerMove(container.firstElementChild!, {
    clientX: 220,
    clientY: 150,
  });
  // Each firm reads at the hovered year, named by its value.
  expect(screen.getByRole("status")).toHaveTextContent("year1,936GM40IBM4");
});
