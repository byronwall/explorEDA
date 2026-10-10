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
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { useEffect } from "react";
import type { CategoricalColorScale } from "@/types/ColorScaleTypes";
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

/** Adds enough color scales for the Colors tab to offer a search. */
function SeedColorScales({ count }: { count: number }) {
  const addColorScale = useDataLayer((state) => state.addColorScale);
  useEffect(() => {
    for (let index = 0; index < count; index += 1) {
      addColorScale({
        name: `Region ${index}`,
        type: "categorical",
        palette: ["#2a78d6"],
        mapping: new Map([["North", "#2a78d6"]]),
      } as Omit<CategoricalColorScale, "id">);
    }
  }, [addColorScale, count]);
  return null;
}

function RowsSettingsSnapshot() {
  const globalSearch = useDataLayer((state) => state.rowsSettings.globalSearch);
  return <output data-testid="saved-rows-search">{globalSearch}</output>;
}

function renderWorkspace({ colorScales = 0, readOnly = false } = {}) {
  return render(
    <DataLayerProvider data={data} charts={[]}>
      <SeedColorScales count={colorScales} />
      {readOnly && <RowsSettingsSnapshot />}
      <CalculationEditorProvider>
        <PlotManager readOnly={readOnly} />
      </CalculationEditorProvider>
    </DataLayerProvider>
  );
}

describe("workspace toolbar", () => {
  it("leads the toolbar line with host content and keeps the scope in a status bar", () => {
    const { container } = render(
      <DataLayerProvider data={data} charts={[]}>
        <CalculationEditorProvider>
          <PlotManager
            readOnly
            toolbarStart={<div role="tablist" aria-label="Views" />}
            toolbarEnd={<button type="button">Export</button>}
          />
        </CalculationEditorProvider>
      </DataLayerProvider>
    );
    const toolbar = container.querySelector(
      ".eda-workspace-toolbar"
    ) as HTMLElement;
    const tabs = within(toolbar).getByRole("tablist", { name: "Views" });
    const add = within(toolbar).getByRole("button", { name: /Add chart/ });
    const exportButton = within(toolbar).getByRole("button", {
      name: "Export",
    });
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(tabs, add)).toBe(true);
    expect(follows(add, exportButton)).toBe(true);
    // Host content stays usable while the workspace is read-only.
    expect(tabs.closest("[inert]")).toBeNull();
    expect(exportButton.closest("[inert]")).toBeNull();

    // The row count and filters sit in the status bar, not the toolbar.
    expect(within(toolbar).queryByRole("status")).toBeNull();
    const status = container.querySelector(
      ".eda-workspace-status"
    ) as HTMLElement;
    expect(within(status).getByRole("status")).toHaveTextContent(
      "Showing 2 of 2 rows"
    );
    expect(follows(screen.getByRole("main"), status)).toBe(true);
  });

  it("keeps Rows reachable in read-only previews and keeps its edits local", async () => {
    renderWorkspace({ readOnly: true });
    const rowsToggle = screen.getByRole("button", { name: "Rows" });
    expect(rowsToggle.closest("[inert]")).toBeNull();
    expect(screen.getByRole("button", { name: "Fields" })).toBeDisabled();

    fireEvent.keyDown(document.body, { key: "r" });
    const keyboardRows = screen.getByRole("region", { name: "Rows" });
    fireEvent.keyDown(keyboardRows, { key: "Escape" });

    fireEvent.click(rowsToggle);
    expect(screen.getByRole("region", { name: "Rows" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Search rows" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Search table" }), {
      target: { value: "North" },
    });

    expect(screen.getByTestId("saved-rows-search")).toBeEmptyDOMElement();
    expect(
      screen.getByRole("button", { name: "Search rows: North" })
    ).toBeInTheDocument();
    expect(screen.getByText("1 row")).toBeInTheDocument();
  });

  it("opens the schema diagram of the workspace's table, in place of Rows", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    const toggle = screen.getByRole("button", { name: "Schema diagram" });
    fireEvent.click(toggle);

    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
    const drawer = screen.getByRole("region", { name: "Schema diagram" });
    expect(drawer).toHaveFocus();
    expect(drawer).toHaveTextContent("1 table · 2 fields");
    const table = within(drawer).getByRole("region", { name: "Data, 2 rows" });
    expect(within(table).getByLabelText("region, Text")).toBeInTheDocument();
    expect(within(table).getByLabelText("revenue, Number")).toBeInTheDocument();

    fireEvent.keyDown(drawer, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Schema diagram" })).toBeNull();
    expect(toggle).toHaveFocus();
  });

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

  it("closes workspace settings and narrow rows with Escape after a click on the charts", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Colors" }));
    expect(
      screen.getByRole("complementary", { name: "Workspace settings" })
    ).toBeInTheDocument();
    // Focus has left the nonmodal panel, as after a click on a chart.
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByRole("complementary")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    const rows = screen.getByRole("region", { name: "Rows" });
    fireEvent.click(
      within(rows).getByRole("button", { name: "Narrow the rows" })
    );
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(screen.queryByRole("region", { name: "Rows" })).toBeNull();
  });

  it("keeps unsaved edits in one settings tab while another is shown", () => {
    renderWorkspace({ colorScales: 6 });
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
