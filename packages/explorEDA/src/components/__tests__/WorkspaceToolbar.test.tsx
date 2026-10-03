import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { PlotManager } from "@/components/PlotManager";
import { CalculationEditorProvider } from "@/components/calculations/CalculationEditor";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { barChartDefinition } from "@/components/charts/BarChart/definition";

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
  it("peeks at the rows with R and closes without opening hover help", async () => {
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
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.pointerMove(toggle, { pointerType: "mouse" });
    await waitFor(() =>
      expect(screen.getByRole("tooltip")).toHaveTextContent("Rows: peek")
    );
  });

  it("closes the rows peek on a click outside the controls", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
  });

  it("keeps the narrow rows open beside the charts until closed", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    const rows = screen.getByRole("region", { name: "Rows" });
    // Expanded, the drawer covers the toolbar and carries the only scope.
    expect(screen.getAllByRole("status")).toHaveLength(1);

    fireEvent.click(
      within(rows).getByRole("button", { name: "Narrow the rows" })
    );
    expect(rows).toHaveAttribute("data-narrow");
    // The toolbar is back in view, with its own row count and filters.
    expect(screen.getAllByRole("status")).toHaveLength(2);

    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();

    fireEvent.click(
      within(rows).getByRole("button", { name: "Expand the rows" })
    );
    expect(rows).not.toHaveAttribute("data-narrow");
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
  });

  it("scopes the open rows to chart filters and keeps Rows filters separate", () => {
    const chart = {
      ...barChartDefinition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 4 },
        "revenue"
      ),
      title: "Revenue",
      filters: [{ type: "range" as const, field: "revenue", min: 15 }],
    };
    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <CalculationEditorProvider>
          <PlotManager />
        </CalculationEditorProvider>
      </DataLayerProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    const rows = screen.getByRole("region", { name: "Rows" });
    // The drawer covers the toolbar, so it carries the scope itself.
    expect(within(rows).getByRole("status")).toHaveTextContent(
      "Showing 1 of 2 rows"
    );
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(within(rows).getByText("South")).toBeInTheDocument();
    expect(within(rows).queryByText("North")).toBeNull();
    expect(
      within(rows).getByRole("button", {
        name: /^Remove .* from Revenue$/,
      })
    ).toBeInTheDocument();
  });

  it("opens workspace settings in one panel with a tab per toolbar button", () => {
    renderWorkspace();
    const calculations = screen.getByRole("button", { name: "Calculations" });
    fireEvent.click(calculations);

    const panel = screen.getByRole("complementary", {
      name: "Workspace settings",
    });
    expect(calculations).toHaveAttribute("aria-pressed", "true");
    expect(
      within(panel).getByRole("tab", { name: "Calculations" })
    ).toHaveAttribute("aria-selected", "true");
    expect(panel).toHaveTextContent("Calculated fields");
    expect(screen.getByText("No charts yet")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    expect(within(panel).getByRole("tab", { name: "Grid" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(within(panel).getByLabelText("Columns")).toBeVisible();
    expect(screen.getAllByRole("complementary")).toHaveLength(1);

    fireEvent.keyDown(within(panel).getByLabelText("Columns"), {
      key: "Escape",
    });
    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.getByRole("button", { name: "Grid" })).toHaveFocus();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("keeps unsaved edits in one settings tab while another is shown", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    const panel = screen.getByRole("complementary", {
      name: "Workspace settings",
    });
    fireEvent.mouseDown(within(panel).getByRole("tab", { name: "Colors" }), {
      button: 0,
      ctrlKey: false,
    });
    const search = within(panel).getByRole("textbox", {
      name: "Search color scales",
    });
    fireEvent.change(search, { target: { value: "reg" } });
    fireEvent.mouseDown(
      within(panel).getByRole("tab", { name: "Calculations" }),
      { button: 0, ctrlKey: false }
    );
    fireEvent.mouseDown(within(panel).getByRole("tab", { name: "Colors" }), {
      button: 0,
      ctrlKey: false,
    });
    expect(
      within(panel).getByRole("textbox", { name: "Search color scales" })
    ).toHaveValue("reg");
  });

  it("shows Rows or workspace settings on the right edge, never both", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Colors" }));
    expect(screen.getByRole("complementary")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Colors" }));
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
  });
});
