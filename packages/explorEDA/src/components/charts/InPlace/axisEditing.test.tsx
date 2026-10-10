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

it("drags an axis as one change and puts it back on Escape", () => {
  window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  const { saved, strip, onStateChange } = setup();
  const band = strip("x");
  const [low, high] = band.getAttribute("data-domain")!.split(",").map(Number);
  const width = Number(band.getAttribute("data-range")!.split(",")[1]);
  const hit = band.querySelector(".eda-axis-strip")!;
  const middle = width / 2;

  // Pan: drag the middle of the band a quarter of its width to the right.
  fireEvent.pointerDown(hit, { button: 0, pointerId: 1, clientX: middle });
  for (const step of [10, 40, width / 4])
    fireEvent.pointerMove(hit, { pointerId: 1, clientX: middle + step });
  expect(saved()).toEqual([]);
  fireEvent.pointerUp(hit, { pointerId: 1, clientX: middle + width / 4 });
  const limits = saved().at(-1)!.xAxis.limits!;
  expect(onStateChange).toHaveBeenCalledTimes(1);
  // The view moved left by a quarter of its span.
  const shift = (high! - low!) / 4;
  expect(limits.min).toBeCloseTo(low! - shift, 1);
  expect(limits.max).toBeCloseTo(high! - shift, 1);

  // A drag cancelled with Escape reports nothing and restores the range.
  const before = strip("x").getAttribute("data-domain");
  fireEvent.pointerDown(hit, { button: 0, pointerId: 2, clientX: middle });
  fireEvent.pointerMove(hit, { pointerId: 2, clientX: middle - 60 });
  expect(strip("x").getAttribute("data-domain")).not.toBe(before);
  fireEvent.keyDown(window, { key: "Escape" });
  fireEvent.pointerUp(hit, { pointerId: 2, clientX: middle - 60 });
  expect(strip("x").getAttribute("data-domain")).toBe(before);
  expect(onStateChange).toHaveBeenCalledTimes(1);
});

it("never drags on a press that does not move", () => {
  window.PointerEvent ??= MouseEvent as typeof PointerEvent;
  const { onStateChange, strip } = setup();
  const hit = strip("x").querySelector(".eda-axis-strip")!;
  fireEvent.pointerDown(hit, { button: 0, pointerId: 1, clientX: 200 });
  fireEvent.pointerMove(hit, { pointerId: 1, clientX: 201 });
  fireEvent.pointerUp(hit, { pointerId: 1, clientX: 201 });
  expect(onStateChange).not.toHaveBeenCalled();
});
