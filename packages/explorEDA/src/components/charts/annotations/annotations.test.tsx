import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { validateSavedData } from "@/utils/saveDataUtils";
import { scatterPlotDefinition } from "../ScatterPlot/definition";
import { PlotChartPanel } from "../../PlotChartPanel";
import type { ChartAnnotation } from "@/lib/annotations/types";

beforeAll(() => {
  registerAllCharts();
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const rows = [
  { sample_id: "E-15", x: 1, y: 10 },
  { sample_id: "E-16", x: 2, y: 30 },
  { sample_id: "E-17", x: 3, y: 90 },
  { sample_id: "E-18", x: 4, y: 20 },
];

const annotations: ChartAnnotation[] = [
  {
    id: "note",
    type: "callout",
    text: "Hot run",
    attach: { kind: "record", keyFields: ["sample_id"], key: ["E-17"] },
    offset: { dx: 20, dy: -20 },
  },
  {
    id: "target",
    type: "reference-line",
    axis: "y",
    value: 50,
    label: "Limit",
  },
];

function setup(data: typeof rows) {
  const chart = {
    ...scatterPlotDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    xField: "x",
    yField: "y",
    annotations,
  };
  const onStateChange = vi.fn<(state: SavedDataStructure) => void>();
  function Panel() {
    const charts = useDataLayer((s) => s.charts);
    return (
      <PlotChartPanel
        settings={charts[0]!}
        width={500}
        height={400}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    );
  }
  const view = render(
    <DataLayerProvider
      data={data}
      charts={[chart]}
      onStateChange={onStateChange}
    >
      <Panel />
    </DataLayerProvider>
  );
  return { ...view, onStateChange };
}

const label = () => screen.getByRole("button", { name: /^Callout: Hot run/ });
const ring = (container: HTMLElement) =>
  container.querySelector('[data-annotation-id="note"] circle')!;

it("draws the callout at the keyed record wherever its row sits", () => {
  const first = setup(rows);
  const before = [
    ring(first.container).getAttribute("cx"),
    ring(first.container).getAttribute("cy"),
  ];
  expect(
    first.container.querySelector('line[data-annotation-id="target"]')
  ).not.toBeNull();
  first.unmount();
  const reordered = setup([...rows].reverse());
  expect([
    ring(reordered.container).getAttribute("cx"),
    ring(reordered.container).getAttribute("cy"),
  ]).toEqual(before);
});

it("moves the label as one change and leaves the record attachment alone", () => {
  const { onStateChange } = setup(rows);
  const handle = label();
  fireEvent.pointerDown(handle, { clientX: 100, clientY: 100, button: 0 });
  fireEvent.pointerMove(handle, { clientX: 110, clientY: 105, buttons: 1 });
  fireEvent.pointerMove(handle, { clientX: 130, clientY: 120, buttons: 1 });
  expect(onStateChange).not.toHaveBeenCalled();
  fireEvent.pointerUp(handle, { clientX: 130, clientY: 120 });
  expect(onStateChange).toHaveBeenCalledOnce();
  const saved = onStateChange.mock.calls[0]![0];
  const note = saved.charts[0]!.annotations![0]!;
  expect(note).toMatchObject({
    offset: { dx: 50, dy: 0 },
    attach: { kind: "record", key: ["E-17"] },
  });
  // Brushing did not start under the label.
  expect(saved.charts[0]!.filters).toEqual([]);
  expect(validateSavedData(saved)).toBe(true);
});

it("puts the label back on Escape without reporting a change", () => {
  const { onStateChange, container } = setup(rows);
  const handle = label();
  const text = () =>
    container.querySelector('[data-annotation-handle="note"] text')!;
  const start = text().getAttribute("x");
  fireEvent.pointerDown(handle, { clientX: 100, clientY: 100, button: 0 });
  fireEvent.pointerMove(handle, { clientX: 140, clientY: 100, buttons: 1 });
  expect(text().getAttribute("x")).not.toBe(start);
  fireEvent.keyDown(handle, { key: "Escape" });
  expect(text().getAttribute("x")).toBe(start);
  expect(onStateChange).not.toHaveBeenCalled();
});

it("nudges the label from the keyboard", () => {
  const { onStateChange } = setup(rows);
  const handle = label();
  fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
  fireEvent.keyUp(handle, { key: "ArrowRight" });
  expect(onStateChange).toHaveBeenCalledOnce();
  expect(
    onStateChange.mock.calls[0]![0].charts[0]!.annotations![0]
  ).toMatchObject({ offset: { dx: 30, dy: -20 } });
});

it("draws nothing for a missing record", () => {
  const { container } = setup(rows.filter((row) => row.sample_id !== "E-17"));
  expect(container.querySelector('[data-annotation-id="note"]')).toBeNull();
});

it("adds a callout on the largest value and a target from the Notes tab", async () => {
  const { ChartSettingsContent } = await import("../../ChartSettingsContent");
  const chart = {
    ...scatterPlotDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    xField: "x",
    yField: "y",
  };
  const onStateChange = vi.fn<(state: SavedDataStructure) => void>();
  function Settings() {
    const charts = useDataLayer((s) => s.charts);
    return <ChartSettingsContent settings={charts[0]!} />;
  }
  render(
    <DataLayerProvider
      data={rows}
      charts={[chart]}
      onStateChange={onStateChange}
    >
      <Settings />
    </DataLayerProvider>
  );
  const notes = screen.getByRole("tab", { name: "Notes" });
  fireEvent.mouseDown(notes);
  fireEvent.click(notes);
  fireEvent.click(await screen.findByRole("button", { name: "Add callout" }));
  fireEvent.click(screen.getByRole("button", { name: "Add reference line" }));
  const saved = onStateChange.mock.calls.at(-1)![0].charts[0]!.annotations!;
  expect(saved).toHaveLength(2);
  expect(saved[0]).toMatchObject({
    type: "callout",
    text: "E-17",
    attach: { kind: "record", keyFields: ["sample_id"], key: ["E-17"] },
  });
  expect(saved[1]).toMatchObject({ type: "reference-line", axis: "y" });
  expect(
    screen.getByRole("list", { name: "Annotations" }).children
  ).toHaveLength(2);
});
