import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { ChartSettings } from "@/types/ChartTypes";
import { PlotChartPanel } from "../../PlotChartPanel";
import { scatterPlotDefinition } from "../ScatterPlot/definition";

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
  Element.prototype.scrollIntoView = vi.fn();
});

const rows = [
  { x: 1, y: 2, region: "East", team: "A" },
  { x: 2, y: 3, region: "West", team: "B" },
  { x: 3, y: 1, region: "East", team: "B" },
];

function scatter(
  id: string,
  title: string,
  extra: Partial<ChartSettings> = {}
) {
  return {
    ...scatterPlotDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "x"
    ),
    id,
    title,
    xField: "x",
    yField: "y",
    ...extra,
  } as ChartSettings;
}

function Panel({ id }: { id: string }) {
  const chart = useDataLayer((s) => s.charts.find((item) => item.id === id));
  return (
    <PlotChartPanel
      settings={chart!}
      width={500}
      height={400}
      onDelete={() => {}}
      onDuplicate={() => {}}
    />
  );
}

function Readout() {
  const charts = useDataLayer((s) => s.charts);
  const scales = useDataLayer((s) => s.colorScales);
  return (
    <output aria-label="State">
      {JSON.stringify({
        charts: charts.map((chart) => ({
          id: chart.id,
          colorField: chart.colorField ?? null,
          colorScaleId: chart.colorScaleId ?? null,
          filters: chart.filters,
        })),
        scales: scales.map((scale) => scale.id),
      })}
    </output>
  );
}

const readState = () =>
  JSON.parse(screen.getByRole("status", { name: "State" }).textContent!) as {
    charts: {
      id: string;
      colorField: string | null;
      colorScaleId: string | null;
      filters: unknown[];
    }[];
    scales: string[];
  };

it("opens Color by… from a right-click on the plot and applies the field", async () => {
  const filters = [{ type: "range" as const, field: "x", min: 2 }];
  render(
    <DataLayerProvider
      data={rows}
      charts={[scatter("a", "Points", { filters })]}
    >
      <Panel id="a" />
      <Readout />
    </DataLayerProvider>
  );
  const panel = screen.getByRole("region", { name: "Points" });
  // The scatter's root holds its canvas and SVG. jsdom has no layout, so
  // client coordinates are offsets from the chart's corner.
  const plot = panel.querySelector("canvas")!.parentElement!;

  const menuEvent = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: 200,
    clientY: 150,
  });
  act(() => {
    plot.dispatchEvent(menuEvent);
  });
  expect(menuEvent.defaultPrevented).toBe(true);
  const menu = await screen.findByRole("menu", { name: "Actions for Points" });
  expect(
    within(menu).queryByRole("menuitem", { name: /Trace this point/ })
  ).toBeNull();
  expect(
    within(menu).getByRole("menuitem", { name: /Download image/ })
  ).toBeInTheDocument();
  fireEvent.click(within(menu).getByRole("menuitem", { name: /Color by/ }));

  const picker = await screen.findByRole("dialog", { name: "Color field" });
  fireEvent.click(within(picker).getByRole("option", { name: /region/ }));
  await waitFor(() => expect(readState().charts[0]!.colorField).toBe("region"));
  expect(readState().charts[0]!.filters).toEqual(filters);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

it("leaves Shift-right-click to the browser", () => {
  render(
    <DataLayerProvider data={rows} charts={[scatter("a", "Points")]}>
      <Panel id="a" />
    </DataLayerProvider>
  );
  const panel = screen.getByRole("region", { name: "Points" });
  const plot = panel.querySelector("canvas")!.parentElement!;
  const menuEvent = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: 200,
    clientY: 150,
    shiftKey: true,
  });
  act(() => {
    plot.dispatchEvent(menuEvent);
  });
  expect(menuEvent.defaultPrevented).toBe(false);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

it("changes the X field from the axis menu and resets that axis", async () => {
  const changes: SavedDataStructure[] = [];
  const filters = [{ type: "range" as const, field: "y", min: 2 }];
  render(
    <DataLayerProvider
      data={rows}
      charts={[
        scatter("a", "Points", {
          filters,
          xAxisLabel: "Old title",
          xAxis: { grid: true, limits: { min: 0, max: 10 } },
        }),
      ]}
      onStateChange={(state) => changes.push(state)}
    >
      <Panel id="a" />
    </DataLayerProvider>
  );
  const panel = screen.getByRole("region", { name: "Points" });
  const title = panel.querySelector('.chart-guide[data-plan-id="x:label"]')!;
  fireEvent.contextMenu(title);
  const menu = await screen.findByRole("menu");
  fireEvent.click(
    within(menu).getByRole("menuitem", { name: /Change X field/ })
  );

  const picker = await screen.findByRole("dialog", { name: "X field" });
  expect(within(picker).getByText("This chart · X axis")).toBeInTheDocument();
  expect(within(picker).queryByRole("option", { name: "None" })).toBeNull();
  fireEvent.click(within(picker).getByRole("option", { name: /region/ }));

  await waitFor(() => expect(changes).toHaveLength(1));
  const saved = changes[0]!.charts.find((chart) => chart.id === "a")! as {
    xField: string;
    xAxisLabel: string;
    xAxis: { grid?: boolean; limits?: unknown };
    filters: unknown[];
  };
  expect(saved.xField).toBe("region");
  expect(saved.xAxisLabel).toBe("");
  expect(saved.xAxis.limits).toBeUndefined();
  expect(saved.xAxis.grid).toBe(true);
  expect(saved.filters).toEqual(filters);
});
