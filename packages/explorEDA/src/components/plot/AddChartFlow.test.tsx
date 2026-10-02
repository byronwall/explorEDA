import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { barChartDefinition } from "../charts/BarChart/definition";
import { ChartCreationButtons } from "./ChartCreationButtons";
import { ChartDraftProvider, useChartDraft } from "./ChartDraftContext";
import { ChartPlacementLayer } from "./ChartPlacementLayer";

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

function Grid() {
  const charts = useDataLayer((state) => state.charts);
  const liveCount = useDataLayer(
    (state) => Object.keys(state.liveItems).length
  );
  const saveToStructure = useDataLayer((state) => state.saveToStructure);
  const placing = useChartDraft()?.draft?.phase === "placing";
  return (
    <>
      <output aria-label="Charts">
        {charts
          .map((chart) => `${chart.type}@${chart.layout.x},${chart.layout.y}`)
          .join(" ")}
      </output>
      <output aria-label="Live charts">{liveCount}</output>
      <output aria-label="Saved layout">
        {saveToStructure()
          .charts.map((chart) => `${chart.layout.x},${chart.layout.y}`)
          .join(" ")}
      </output>
      {placing && (
        <ChartPlacementLayer
          charts={charts}
          columnCount={12}
          columnWidth={50}
          rowHeight={50}
          padding={0}
        />
      )}
    </>
  );
}

function renderWorkspace() {
  const existing = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "value"
  );
  render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={[existing]}>
      <ChartDraftProvider>
        <ChartCreationButtons />
        <Grid />
      </ChartDraftProvider>
    </DataLayerProvider>
  );
}

it("previews a new chart without adding it until the user cancels", async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole("button", { name: "Add chart" }));
  const dialog = await screen.findByRole("dialog", { name: "Add a chart" });
  // The preview joins the live data while the dialog is open.
  expect(screen.getByLabelText("Live charts")).toHaveTextContent("2");
  fireEvent.click(within(dialog).getByRole("button", { name: "Scatter Plot" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Charts")).toHaveTextContent(/^bar@0,0$/);
  expect(screen.getByLabelText("Live charts")).toHaveTextContent("1");
});

it("places the new chart at the highlighted spot with Enter", async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole("button", { name: "Add chart" }));
  const dialog = await screen.findByRole("dialog", { name: "Add a chart" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Add to grid" }));

  expect(
    await screen.findByRole("dialog", { name: "Place the new Bar Chart" })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Charts")).toHaveTextContent(/^bar@0,0$/);
  fireEvent.keyDown(document.body, { key: "Enter" });

  // The first free spot beside the existing chart.
  expect(screen.getByLabelText("Charts")).toHaveTextContent("bar@0,0 bar@6,0");
  expect(screen.getByLabelText("Live charts")).toHaveTextContent("2");
});

it("returns to the dialog from placement with Escape", async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole("button", { name: "Add chart" }));
  fireEvent.click(
    within(
      await screen.findByRole("dialog", { name: "Add a chart" })
    ).getByRole("button", { name: "Add to grid" })
  );
  await screen.findByRole("dialog", { name: "Place the new Bar Chart" });
  fireEvent.keyDown(document.body, { key: "Escape" });

  expect(
    await screen.findByRole("dialog", { name: "Add a chart" })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("Charts")).toHaveTextContent(/^bar@0,0$/);
});

it("proposes moving a chart out of the way and applies it only on accept", async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole("button", { name: "Add chart" }));
  fireEvent.click(
    within(
      await screen.findByRole("dialog", { name: "Add a chart" })
    ).getByRole("button", { name: "Add to grid" })
  );
  const bar = await screen.findByRole("dialog", {
    name: "Place the new Bar Chart",
  });
  // Move from the free spot onto the existing chart.
  for (let step = 0; step < 6; step++) {
    fireEvent.keyDown(document.body, { key: "ArrowLeft" });
  }
  expect(bar).toHaveTextContent("1 chart moves down to make room.");
  expect(screen.getByText("Moves here")).toBeInTheDocument();
  // The proposal is a preview. The saved layout has not changed.
  expect(screen.getByLabelText("Charts")).toHaveTextContent(/^bar@0,0$/);

  fireEvent.click(within(bar).getByRole("button", { name: "Place chart" }));
  expect(screen.getByLabelText("Charts")).toHaveTextContent("bar@0,4 bar@0,0");
  // The moved chart keeps its new position in a saved layout.
  expect(screen.getByLabelText("Saved layout")).toHaveTextContent("0,4 0,0");
});

it("leaves every chart in place when a proposed move is canceled", async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole("button", { name: "Add chart" }));
  fireEvent.click(
    within(
      await screen.findByRole("dialog", { name: "Add a chart" })
    ).getByRole("button", { name: "Add to grid" })
  );
  const bar = await screen.findByRole("dialog", {
    name: "Place the new Bar Chart",
  });
  for (let step = 0; step < 6; step++) {
    fireEvent.keyDown(document.body, { key: "ArrowLeft" });
  }
  expect(bar).toHaveTextContent("1 chart moves down to make room.");

  fireEvent.keyDown(document.body, { key: "Escape" });
  fireEvent.click(
    within(
      await screen.findByRole("dialog", { name: "Add a chart" })
    ).getByRole("button", { name: "Cancel" })
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Charts")).toHaveTextContent(/^bar@0,0$/);
  expect(screen.getByLabelText("Live charts")).toHaveTextContent("1");
});
