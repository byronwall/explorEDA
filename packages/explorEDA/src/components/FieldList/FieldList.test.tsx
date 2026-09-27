import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { rowChartDefinition } from "@/components/charts/RowChart/definition";
import { scatterPlotDefinition } from "@/components/charts/ScatterPlot/definition";
import { PlotManager } from "@/components/PlotManager";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { matchesField } from "./FieldList";

const layout = { x: 0, y: 0, w: 6, h: 4 };
const data = [
  { region: "North", revenue: 10, units: 1 },
  { region: "North", revenue: 20, units: 2 },
  { region: "South", revenue: 30, units: 3 },
  { region: "West", revenue: 40, units: 4 },
];

let saved: () => string = () => "";
function SavedLayout() {
  const saveToStructure = useDataLayer((state) => state.saveToStructure);
  saved = () => JSON.stringify(saveToStructure().charts);
  return null;
}

function renderWorkspace(charts: ChartSettings[]) {
  return render(
    <DataLayerProvider data={data} charts={charts}>
      <PlotManager />
      <SavedLayout />
    </DataLayerProvider>
  );
}

const openList = () => {
  fireEvent.click(screen.getByRole("button", { name: "Fields" }));
  return screen.getByRole("complementary", { name: "Fields" });
};

beforeAll(() => {
  registerAllCharts();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView = vi.fn();
});

describe("matchesField", () => {
  it("matches the display label or the source name", () => {
    expect(matchesField("net", "net_sales", "Sales after discount")).toBe(true);
    expect(matchesField("after", "net_sales", "Sales after discount")).toBe(
      true
    );
    expect(matchesField("cost", "net_sales", "Sales after discount")).toBe(
      false
    );
    expect(matchesField("  ", "net_sales", "Net sales")).toBe(true);
  });
});

describe("FieldList", () => {
  it("opens, searches, and closes without changing the saved layout", () => {
    const scatter = {
      ...scatterPlotDefinition.createDefaultSettings(layout, "revenue"),
      xField: "units",
      yField: "revenue",
    } as ChartSettings;
    renderWorkspace([scatter]);
    const before = saved();

    const list = openList();
    expect(screen.getByRole("button", { name: "Fields" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    const rows = within(list).getByRole("list", { name: "Fields" });
    expect(within(rows).getAllByRole("listitem")).toHaveLength(3);

    const search = within(list).getByRole("searchbox", {
      name: "Search fields",
    });
    expect(search).toHaveFocus();
    fireEvent.change(search, { target: { value: "rev" } });
    expect(within(rows).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByText("1 of 3")).toBeInTheDocument();

    // The first Escape clears the search; the second closes the list.
    fireEvent.keyDown(search, { key: "Escape" });
    expect(search).toHaveValue("");
    fireEvent.keyDown(search, { key: "Escape" });
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fields" })).toHaveFocus();

    expect(saved()).toBe(before);
  });

  it("toggles with the F key but not while typing", () => {
    renderWorkspace([]);
    fireEvent.keyDown(document.body, { key: "f" });
    const search = screen.getByRole("searchbox", { name: "Search fields" });
    fireEvent.keyDown(search, { key: "f" });
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "F" });
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("describes the rows that pass chart filters", () => {
    const row = {
      ...rowChartDefinition.createDefaultSettings(layout, "region"),
      filters: [{ type: "value", field: "region", values: ["North"] }],
    } as ChartSettings;
    renderWorkspace([row]);
    const list = openList();

    expect(
      within(list).getByText("Values describe 2 of 4 rows after chart filters")
    ).toBeInTheDocument();
    const revenue = within(list).getByRole("button", { name: /^revenue/ });
    expect(revenue).toHaveTextContent("10–20");
    const region = within(list).getByRole("button", { name: /^region/ });
    expect(region).toHaveTextContent("1 distinct");
  });

  it("lists the charts that use an expanded field", () => {
    const scatter = {
      ...scatterPlotDefinition.createDefaultSettings(layout, "revenue"),
      title: "Revenue by units",
      xField: "units",
      yField: "revenue",
    } as ChartSettings;
    const row = {
      ...rowChartDefinition.createDefaultSettings(layout, "region"),
      title: "Orders by region",
    } as ChartSettings;
    renderWorkspace([scatter, row]);
    const list = openList();

    const revenue = within(list).getByRole("button", { name: /^revenue/ });
    fireEvent.click(revenue);
    expect(revenue).toHaveAttribute("aria-expanded", "true");
    expect(
      within(list).getByRole("button", { name: "Revenue by units" })
    ).toBeInTheDocument();
    expect(
      within(list).queryByRole("button", { name: "Orders by region" })
    ).not.toBeInTheDocument();

    // One row opens at a time.
    fireEvent.click(within(list).getByRole("button", { name: /^region/ }));
    expect(revenue).toHaveAttribute("aria-expanded", "false");
    expect(
      within(list).getByRole("button", { name: "Orders by region" })
    ).toBeInTheDocument();
  });

  it("adds a chart and keeps the list open", async () => {
    renderWorkspace([]);
    const list = openList();
    const before = JSON.parse(saved()) as unknown[];
    const trigger = within(list).getByRole("button", {
      name: "Add a chart of revenue",
    });
    fireEvent.keyDown(trigger, { key: "Enter" });
    const item = await screen.findByRole("menuitem", { name: "Bar chart" });
    await act(async () => {
      fireEvent.click(item);
    });
    expect(JSON.parse(saved())).toHaveLength(before.length + 1);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });
});
