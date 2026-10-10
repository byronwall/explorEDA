import { fireEvent, render, screen } from "@testing-library/react";
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

function renderBlankComposition() {
  const chart = {
    ...compositionDefinition.createDefaultSettings({ x: 0, y: 0, w: 12, h: 7 }),
    title: "Report graphic",
  };
  function Panel() {
    const charts = useDataLayer((state) => state.charts);
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
}

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
