import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { LineChart } from "./LineChart";
import { DEFAULT_SERIES_SETTINGS, lineChartDefinition } from "./definition";

it("reads the nearest series on its own axis and clears during brushing or missing observations", () => {
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
  expect(
    screen.getByRole("img", { name: "day: 5; visitors: 2.5" })
  ).toBeInTheDocument();
  fireEvent.pointerMove(chart, { clientX: 200, clientY: 21 });
  expect(
    screen.getByRole("img", { name: "day: 5; cost: 1000" })
  ).toBeInTheDocument();
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  fireEvent.keyDown(chart.querySelector("svg")!, { key: "Escape" });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  fireEvent.pointerMove(chart, { clientX: 200, clientY: 208 });
  fireEvent.pointerDown(chart.querySelector("svg")!, {
    clientX: 200,
    clientY: 208,
    button: 0,
  });
  fireEvent.pointerMove(chart, { clientX: 201, clientY: 208, buttons: 1 });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  fireEvent.pointerUp(document.body, { clientX: 500, clientY: 208 });
  fireEvent.pointerMove(chart, { clientX: 200, clientY: 208 });
  expect(
    screen.getByRole("img", { name: "day: 5; visitors: 2.5" })
  ).toBeInTheDocument();
  fireEvent.pointerMove(chart, { clientX: 256, clientY: 208 });
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
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
