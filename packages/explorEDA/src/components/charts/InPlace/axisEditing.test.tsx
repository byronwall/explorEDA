import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { barChartDefinition } from "../BarChart/definition";
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

function setup() {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title: "Values",
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
      data={[1, 2, 3, 4, 5, 6, 7, 8].map((value) => ({ value }))}
      charts={[chart]}
      onStateChange={onStateChange}
    >
      <Panel />
    </DataLayerProvider>
  );
  const saved = () =>
    onStateChange.mock.calls.map(([state]) => state.charts[0]!);
  const strip = (axis: "x" | "y") =>
    view.container.querySelector(`[data-axis-edit="${axis}"]`)!;
  return { onStateChange, saved, strip, view };
}

it("edits a numeric axis range beside the axis as one change", async () => {
  const { saved, strip } = setup();
  expect(strip("x").getAttribute("data-domain")).toMatch(/^[\d.-]+,[\d.-]+$/);

  fireEvent.doubleClick(strip("x"));
  const editor = await screen.findByRole("dialog", {
    name: "Horizontal axis range",
  });
  expect(editor).toBeInTheDocument();
  fireEvent.change(screen.getByRole("textbox", { name: "X minimum" }), {
    target: { value: "3" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "X maximum" }), {
    target: { value: "6" },
  });
  // The axis redraws at once; the host hears nothing until the editor closes.
  expect(strip("x").getAttribute("data-domain")).toBe("3,6");
  expect(saved()).toEqual([]);

  fireEvent.keyDown(screen.getByRole("textbox", { name: "X maximum" }), {
    key: "Enter",
  });
  expect(
    screen.queryByRole("dialog", { name: "Horizontal axis range" })
  ).not.toBeInTheDocument();
  expect(saved().map((chart) => chart.xAxis.limits)).toEqual([
    { min: 3, max: 6 },
  ]);
});

it("edits an axis title in place and inherits again when cleared", () => {
  const { saved, view } = setup();
  const title = view.container.querySelector(
    '.chart-guide[data-plan-id="x:label"]'
  )!;
  fireEvent.doubleClick(title);
  const input = screen.getByRole("textbox", { name: "Horizontal axis title" });
  expect(input).toHaveValue("value");
  fireEvent.change(input, { target: { value: "Value (units)" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(saved().at(-1)?.xAxisLabel).toBe("Value (units)");

  fireEvent.keyDown(title, { key: "Enter" });
  fireEvent.change(
    screen.getByRole("textbox", { name: "Horizontal axis title" }),
    { target: { value: "" } }
  );
  fireEvent.blur(
    screen.getByRole("textbox", { name: "Horizontal axis title" })
  );
  expect(saved().at(-1)?.xAxisLabel).toBe("");
});

it("offers range and title actions in the axis context menu", async () => {
  const { saved, strip } = setup();
  fireEvent.contextMenu(strip("y"));
  fireEvent.click(await screen.findByRole("menuitem", { name: /Set Y range/ }));
  fireEvent.change(await screen.findByRole("textbox", { name: "Y maximum" }), {
    target: { value: "10" },
  });
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Y maximum" }), {
    key: "Enter",
  });
  expect(saved().at(-1)?.yAxis.limits).toEqual({ max: 10 });

  fireEvent.contextMenu(strip("y"));
  fireEvent.click(
    await screen.findByRole("menuitem", { name: /Fit Y to the data/ })
  );
  expect(saved().at(-1)?.yAxis.limits).toBeUndefined();
});
