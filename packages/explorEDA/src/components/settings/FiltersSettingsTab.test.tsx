import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { rowChartDefinition } from "@/components/charts/RowChart/definition";
import { scatterPlotDefinition } from "@/components/charts/ScatterPlot/definition";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import type { ChartSettings } from "@/types/ChartTypes";
import { chartFilterFields, FiltersSettingsTab } from "./FiltersSettingsTab";

const layout = { x: 0, y: 0, w: 6, h: 4 };
const data = [
  { region: "North", revenue: 10, units: 1 },
  { region: "North", revenue: 20, units: 2 },
  { region: "South", revenue: 30, units: 3 },
];
const scatter = {
  ...scatterPlotDefinition.createDefaultSettings(layout, "revenue"),
  xField: "revenue",
  yField: "units",
} as ChartSettings;
const row = rowChartDefinition.createDefaultSettings(
  layout,
  "region"
) as ChartSettings;

const renderTab = (settings: ChartSettings) => {
  const onSettingChange = vi.fn();
  render(
    <DataLayerProvider data={data} charts={[settings]}>
      <FiltersSettingsTab
        settings={settings}
        onSettingChange={onSettingChange}
      />
    </DataLayerProvider>
  );
  return onSettingChange;
};

beforeAll(() => {
  registerAllCharts();
});

describe("chartFilterFields", () => {
  it("lists the fields a chart selects, then other filtered fields", () => {
    expect(chartFilterFields(scatter)).toEqual([
      { field: "revenue" },
      { field: "units" },
    ]);
    expect(
      chartFilterFields({
        ...scatter,
        filters: [
          { type: "range", field: "units", min: 2 },
          { type: "value", field: "region", values: ["North"] },
        ],
      } as ChartSettings)
    ).toEqual([{ field: "revenue" }, { field: "units" }, { field: "region" }]);
  });

  it("marks category charts as filtering by value", () => {
    expect(chartFilterFields(row)).toEqual([
      { field: "region", valuesOnly: true },
    ]);
  });
});

describe("FiltersSettingsTab", () => {
  it("edits a scatter plot's ranges and keeps the other field's filter", () => {
    const onSettingChange = renderTab({
      ...scatter,
      filters: [{ type: "range", field: "units", min: 2 }],
    } as ChartSettings);

    const revenue = screen.getByRole("group", { name: "revenue" });
    fireEvent.change(within(revenue).getByLabelText("Minimum revenue"), {
      target: { value: "15" },
    });
    expect(onSettingChange).toHaveBeenLastCalledWith("filters", [
      { type: "range", field: "units", min: 2 },
      { type: "range", field: "revenue", min: 15 },
    ]);

    const units = screen.getByRole("group", { name: "units" });
    expect(within(units).getByLabelText("Minimum units")).toHaveValue(2);
    fireEvent.click(
      within(units).getByRole("button", { name: "Clear filter for units" })
    );
    expect(onSettingChange).toHaveBeenLastCalledWith("filters", []);
    // A field without a filter offers nothing to clear.
    expect(within(revenue).queryByRole("button")).toBeNull();
  });

  it("lists a row chart's categories to check", () => {
    const onSettingChange = renderTab(row);

    fireEvent.click(screen.getByRole("checkbox", { name: "South" }));
    expect(onSettingChange).toHaveBeenLastCalledWith("filters", [
      { type: "value", field: "region", values: ["South"] },
    ]);
  });

  it("edits chart rows apart from the filters the chart sets", () => {
    const onSettingChange = renderTab({
      ...row,
      localFilters: [{ type: "value", field: "region", values: ["North"] }],
    } as ChartSettings);

    const section = screen.getByRole("region", { name: "Chart rows" });
    const region = within(section).getByRole("group", { name: "region" });
    fireEvent.click(within(region).getByRole("checkbox", { name: "South" }));
    expect(onSettingChange).toHaveBeenLastCalledWith("localFilters", [
      { type: "value", field: "region", values: ["North", "South"] },
    ]);

    fireEvent.click(within(region).getByRole("button", { name: /Clear/ }));
    expect(onSettingChange).toHaveBeenLastCalledWith(
      "localFilters",
      undefined
    );
  });
});

