import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableContextMenu, cellFilter } from "../DataTableContextMenu";
import { dataTableDefinition, type DataTableSettings } from "../definition";

const state = {
  getFieldLabel: (field: string) => field,
  formatFieldValue: (_field: string, value: unknown) => String(value),
  fieldProfiles: [
    { name: "region", dataType: "categorical" },
    { name: "units", dataType: "numeric" },
  ],
  getColumnNames: () => ["__ID", "region", "units", "price"],
};

vi.mock("@/providers/DataLayerProvider", () => ({
  useDataLayer: (selector: (value: typeof state) => unknown) => selector(state),
}));

const settings: DataTableSettings = {
  ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
  columns: [
    { id: "region", field: "region" },
    { id: "units", field: "units", width: 90 },
  ],
  filters: [{ type: "range", field: "units", max: 9 }],
};
const row = { __ID: 1, region: "North", units: 4 };

const openMenu = (target: { columnId: string; row?: typeof row }) => {
  const onSettingsChange = vi.fn();
  const onOpenFilter = vi.fn();
  render(
    <DataTableContextMenu
      target={{ x: 10, y: 10, ...target }}
      onClose={vi.fn()}
      settings={settings}
      onSettingsChange={onSettingsChange}
      onOpenFilter={onOpenFilter}
    />
  );
  return { onSettingsChange, onOpenFilter };
};
const choose = (name: string | RegExp) =>
  fireEvent.click(screen.getByRole("menuitem", { name }));

describe("cellFilter", () => {
  it("builds the filter that keeps one cell's value", () => {
    expect(cellFilter("units", 4, "numeric")).toEqual({
      type: "range",
      field: "units",
      min: 4,
      max: 4,
    });
    expect(cellFilter("day", "2024-01-02", "datetime")).toEqual({
      type: "date-range",
      field: "day",
      min: "2024-01-02",
      max: "2024-01-02",
    });
    expect(cellFilter("region", "North", "categorical")).toEqual({
      type: "value",
      field: "region",
      values: ["North"],
    });
    expect(cellFilter("region", null, "categorical")).toEqual({
      type: "value",
      field: "region",
      values: [null],
    });
  });
});

describe("DataTableContextMenu", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("offers a header its column's sort, position, and visibility", () => {
    const { onSettingsChange, onOpenFilter } = openMenu({ columnId: "units" });

    expect(screen.getByRole("menu", { name: "Column units" })).toBeVisible();
    expect(
      screen.getByRole("menuitem", { name: "Move right" })
    ).toHaveAttribute("aria-disabled", "true");
    choose("Filter…");
    expect(onOpenFilter).toHaveBeenCalledWith("units");
  });

  it("moves, resets, and reveals columns from a header", () => {
    const first = openMenu({ columnId: "units" });
    choose("Move left");
    expect(first.onSettingsChange).toHaveBeenCalledWith({
      columns: [settings.columns[1], settings.columns[0]],
    });
  });

  it("shows hidden columns in source order after the visible ones", () => {
    const { onSettingsChange } = openMenu({ columnId: "region" });
    choose("Show 1 hidden column");
    expect(onSettingsChange).toHaveBeenCalledWith({
      columns: [...settings.columns, { id: "price", field: "price" }],
    });
  });

  it("filters from a cell and keeps the other bound of a range", () => {
    const { onSettingsChange } = openMenu({ columnId: "units", row });

    expect(screen.getByRole("menu", { name: "Cell in units" })).toBeVisible();
    choose("Only rows at or above 4");
    expect(onSettingsChange).toHaveBeenCalledWith({
      filters: [{ type: "range", field: "units", min: 4, max: 9 }],
    });
  });

  it("clears a column's filter and hides the column from a cell", () => {
    const { onSettingsChange } = openMenu({ columnId: "units", row });
    choose("Clear the units filter");
    expect(onSettingsChange).toHaveBeenCalledWith({ filters: [] });
  });
});
