import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
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

function setup(limits: { min?: number; max?: number }) {
  const defaults = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 6,
    h: 4,
  });
  const chart = {
    ...defaults,
    xField: "a",
    yField: "b",
    xAxis: { ...defaults.xAxis, limits },
  };
  const onStateChange = vi.fn<(state: SavedDataStructure) => void>();
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
    <DataLayerProvider
      data={[1, 2, 3, 4, 5, 6, 7, 8].map((a) => ({ a, b: a * 2 }))}
      charts={[chart]}
      onStateChange={onStateChange}
    >
      <Panel />
    </DataLayerProvider>
  );
  const saved = () =>
    onStateChange.mock.calls.map(([state]) => state.charts[0]!);
  const marker = (key: string) =>
    view.container.querySelector(`[data-axis-hidden="${key}"]`);
  return { saved, marker };
}

it("marks the axis end a bound hides rows past", () => {
  const { marker } = setup({ min: 2.5, max: 6 });
  expect(marker("x:high")).toHaveAccessibleName(
    "2 rows above the X maximum. Show details"
  );
  expect(marker("x:low")).toHaveAccessibleName(
    "2 rows below the X minimum. Show details"
  );
  expect(marker("y:high")).toBeNull();
});

it("draws no marker when the bound hides nothing", () => {
  const { marker } = setup({ max: 50 });
  expect(marker("x:high")).toBeNull();
});

it("opens the count on focus and resets only that bound", async () => {
  const { marker, saved } = setup({ min: 2.5, max: 6 });
  fireEvent.focus(marker("x:high")!);
  const details = await screen.findByRole("dialog", {
    name: "Hidden past the X maximum",
  });
  expect(details).toHaveTextContent("2 rows above 6 are off the chart");

  fireEvent.click(screen.getByRole("button", { name: /Reset maximum/ }));
  expect(saved().map((chart) => chart.xAxis.limits)).toEqual([{ min: 2.5 }]);
  expect(marker("x:high")).toBeNull();
  expect(marker("x:low")).not.toBeNull();
  expect(
    screen.queryByRole("dialog", { name: "Hidden past the X maximum" })
  ).not.toBeInTheDocument();
});

it("opens on hover", async () => {
  window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  const { marker } = setup({ max: 6 });
  fireEvent.pointerOver(marker("x:high")!);
  expect(
    await screen.findByRole("dialog", { name: "Hidden past the X maximum" })
  ).toBeInTheDocument();
});
