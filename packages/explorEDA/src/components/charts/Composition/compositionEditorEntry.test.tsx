import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { PlotChartPanel } from "../../PlotChartPanel";
import { compositionDefinition } from "./definition";

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

// Set by the rendered panel, so a test can edit the chart like a host would.
const edit: { updateChart?: (id: string, partial: object) => void } = {};

function renderBlankComposition() {
  const chart = {
    ...compositionDefinition.createDefaultSettings({ x: 0, y: 0, w: 12, h: 7 }),
    title: "Report graphic",
  };
  function Panel() {
    const charts = useDataLayer((state) => state.charts);
    edit.updateChart = useDataLayer((state) => state.updateChart);
    return (
      <PlotChartPanel
        settings={charts[0]!}
        width={800}
        height={500}
        onDelete={() => {}}
        onDuplicate={() => {}}
      />
    );
  }
  render(
    <DataLayerProvider data={[{ group: "A" }, { group: "B" }]} charts={[chart]}>
      <Panel />
    </DataLayerProvider>
  );
  return chart;
}

it("draws a blank composition's first element without a hook-order error", () => {
  // React only warns when a later render calls an extra hook.
  const errors = vi.spyOn(console, "error").mockImplementation(() => {});
  const chart = renderBlankComposition();
  expect(
    screen.getByRole("button", { name: "Open editor" })
  ).toBeInTheDocument();
  act(() =>
    edit.updateChart!(chart.id, {
      composition: {
        ...chart.composition,
        elements: [
          {
            id: "title",
            name: "Title",
            kind: "text",
            role: "title",
            text: "Orders by region",
            x: 0,
            y: 0,
            width: 400,
            fontSize: 20,
            fontWeight: 600,
            color: "currentColor",
          },
        ],
      },
    })
  );
  expect(screen.getByText("Orders by region")).toBeInTheDocument();
  const hookWarnings = errors.mock.calls.filter((call) =>
    String(call[0]).includes("order of Hooks")
  );
  errors.mockRestore();
  expect(hookWarnings).toEqual([]);
});

it("opens the editor from a blank composition's empty state", async () => {
  renderBlankComposition();
  fireEvent.click(screen.getByRole("button", { name: "Open editor" }));
  expect(
    await screen.findByRole("button", {
      name: "Close details for Report graphic",
    })
  ).toBeInTheDocument();
  // The details view is the editor, so it offers no second way into itself.
  expect(
    screen.queryByRole("button", { name: "Full editor" })
  ).not.toBeInTheDocument();
});

it("moves from the settings popover to the full editor", async () => {
  renderBlankComposition();
  fireEvent.click(
    screen.getByRole("button", { name: "Configure Report graphic" })
  );
  fireEvent.click(await screen.findByRole("button", { name: "Full editor" }));
  expect(
    await screen.findByRole("button", {
      name: "Close details for Report graphic",
    })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("dialog", { name: "Settings for Report graphic" })
  ).not.toBeInTheDocument();
});
