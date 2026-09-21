import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { barChartDefinition } from "../charts/BarChart/definition";
import { PlotChartPanel } from "../PlotChartPanel";

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

it("previews filtered rows without adding a chart and clears the chart filter from its header", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
    filters: [{ type: "range" as const, field: "value", min: 2 }],
  };
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <>
        <output aria-label="Chart count">{charts.length}</output>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[{ value: 1 }, { value: 2 }, { value: 3 }]}
      charts={[chart]}
    >
      <Panel />
    </DataLayerProvider>
  );
  expect(
    screen.getByRole("button", { name: "Clear filters for Values" })
  ).toBeInTheDocument();
  fireEvent.keyDown(
    screen.getByRole("button", { name: "More actions for Values" }),
    { key: "ArrowDown" }
  );
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "View data for Values" })
  );
  const preview = await screen.findByRole("dialog", {
    name: "Data for Values",
  });
  expect(
    within(preview)
      .getAllByRole("cell")
      .map((cell) => cell.textContent)
  ).toEqual(["2", "3"]);
  expect(screen.getByLabelText("Chart count")).toHaveTextContent("1");
  fireEvent.keyDown(preview, { key: "Escape" });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Data for Values" })
    ).not.toBeInTheDocument()
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Clear filters for Values" })
  );
  expect(
    screen.queryByRole("button", { name: "Clear filters for Values" })
  ).not.toBeInTheDocument();
});

it("applies a chart type change together and can reset the edit session", async () => {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
  };
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    const updateChart = useDataLayer((s) => s.updateChart);
    return (
      <>
        <output aria-label="Chart type">{charts[0]!.type}</output>
        <button
          onClick={() =>
            updateChart(chart.id, {
              filters: [{ type: "range", field: "value", min: 2 }],
            })
          }
        >
          Filter externally
        </button>
        <PlotChartPanel
          settings={charts[0]!}
          width={500}
          height={400}
          onDelete={() => {}}
          onDuplicate={() => {}}
        />
      </>
    );
  }
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Configure Values" }));
  fireEvent.click(screen.getByRole("combobox", { name: "Chart type" }));
  fireEvent.click(await screen.findByRole("option", { name: "Row Chart" }));
  expect(
    screen.getByLabelText("Chart type", { selector: "output" })
  ).toHaveTextContent("row");
  fireEvent.click(screen.getByRole("button", { name: "Reset changes" }));
  expect(
    screen.getByLabelText("Chart type", { selector: "output" })
  ).toHaveTextContent("bar");
  fireEvent.mouseDown(screen.getByRole("tab", { name: "Labels" }), {
    button: 0,
    ctrlKey: false,
  });
  fireEvent.change(screen.getByLabelText("Chart title"), {
    target: { value: "Edited" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Filter externally" }));
  fireEvent.click(screen.getByRole("button", { name: "Reset changes" }));
  expect(screen.getByLabelText("Chart title")).toHaveValue("Values");
  expect(
    screen.getByRole("button", { name: "Clear filters for Values" })
  ).toBeInTheDocument();
});
