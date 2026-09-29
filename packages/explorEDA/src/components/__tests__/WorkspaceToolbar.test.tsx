import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { PlotManager } from "@/components/PlotManager";
import { CalculationEditorProvider } from "@/components/calculations/CalculationEditor";
import { DataLayerProvider } from "@/providers/DataLayerProvider";

const data = [
  { region: "North", revenue: 10 },
  { region: "South", revenue: 20 },
];

beforeAll(() => {
  registerAllCharts();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView = vi.fn();
});

function renderWorkspace() {
  return render(
    <DataLayerProvider data={data} charts={[]}>
      <CalculationEditorProvider>
        <PlotManager />
      </CalculationEditorProvider>
    </DataLayerProvider>
  );
}

describe("workspace toolbar", () => {
  it("peeks at the rows with R and closes with Escape", () => {
    renderWorkspace();
    const toggle = screen.getByRole("button", { name: "Rows" });
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();

    fireEvent.keyDown(document.body, { key: "r" });
    const peek = screen.getByRole("region", { name: "Rows" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(peek).toHaveFocus();

    fireEvent.keyDown(peek, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
    expect(toggle).toHaveFocus();
  });

  it("closes the rows peek on a click outside the controls", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
  });

  it("opens calculations in a dialog over the charts", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Calculations" }));

    const dialog = screen.getByRole("dialog", { name: "Calculations" });
    expect(dialog).toHaveTextContent("Calculated fields");
    expect(screen.getByText("No charts yet")).toBeInTheDocument();
  });
});
