import { act, fireEvent, render, screen } from "@testing-library/react";
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

function setup(title = "Values") {
  const chart = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "value"
    ),
    title,
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
  render(
    <DataLayerProvider
      data={[{ value: 1 }, { value: 2 }]}
      charts={[chart]}
      onStateChange={onStateChange}
    >
      <Panel />
    </DataLayerProvider>
  );
  const savedTitles = () =>
    onStateChange.mock.calls.map(([state]) => state.charts[0]?.title);
  return { onStateChange, savedTitles };
}

const heading = () => screen.getByRole("heading", { level: 3 });
const editor = () => screen.getByRole("textbox", { name: "Chart title" });

it("edits the title in place and reports one change when it ends", () => {
  const { savedTitles } = setup();
  // The second press of a double-click opens the editor, as in the grid.
  fireEvent.mouseDown(heading(), { detail: 2 });
  expect(editor()).toHaveValue("Values");
  for (const text of ["V", "Va", "Val"]) {
    fireEvent.change(editor(), { target: { value: text } });
  }
  // The chart shows each keystroke.
  expect(screen.getByRole("region", { name: "Val" })).toBeInTheDocument();
  expect(savedTitles()).toEqual([]);
  fireEvent.keyDown(editor(), { key: "Enter" });
  expect(heading()).toHaveTextContent("Val");
  expect(savedTitles()).toEqual(["Val"]);
});

it("puts the old title back on Escape without reporting a change", () => {
  const { onStateChange } = setup();
  act(() => heading().focus());
  fireEvent.keyDown(heading(), { key: "Enter" });
  fireEvent.change(editor(), { target: { value: "Something else" } });
  fireEvent.keyDown(editor(), { key: "Escape" });
  expect(heading()).toHaveTextContent("Values");
  expect(onStateChange).not.toHaveBeenCalled();
});

it("follows the field again when the title is cleared", () => {
  const { savedTitles } = setup();
  fireEvent.keyDown(heading(), { key: "F2" });
  expect(editor()).toHaveAttribute("placeholder", "Distribution of value");
  fireEvent.change(editor(), { target: { value: "" } });
  fireEvent.blur(editor());
  expect(heading()).toHaveTextContent("Distribution of value");
  expect(savedTitles()).toEqual([""]);
});

it("offers the edit and a reset from the title's context menu", async () => {
  const { savedTitles } = setup();
  fireEvent.contextMenu(heading());
  fireEvent.click(await screen.findByRole("menuitem", { name: /Reset to/ }));
  expect(heading()).toHaveTextContent("Distribution of value");
  expect(savedTitles()).toEqual([""]);

  fireEvent.contextMenu(heading());
  fireEvent.click(await screen.findByRole("menuitem", { name: /Edit title/ }));
  expect(editor()).toHaveValue("Distribution of value");
});

it("leaves Alt-click on the title to tracing", () => {
  setup();
  fireEvent.mouseDown(heading(), { detail: 2, altKey: true });
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});
