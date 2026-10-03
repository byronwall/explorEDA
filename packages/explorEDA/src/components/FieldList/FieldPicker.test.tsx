import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { FieldPicker } from "./FieldPicker";

const data = [
  { region: "North", revenue: 10, units: 1 },
  { region: "North", revenue: 20, units: null },
  { region: "South", revenue: 30, units: 3 },
];

const renderPicker = (selected: string[]) => {
  const onChange = vi.fn();
  render(
    <DataLayerProvider data={data} charts={[]}>
      <FieldPicker
        heading="Visible columns"
        selected={selected}
        onChange={onChange}
      />
    </DataLayerProvider>
  );
  return onChange;
};

describe("FieldPicker", () => {
  it("lists every field with the field list's readings", () => {
    renderPicker(["region", "revenue"]);

    const rows = within(
      screen.getByRole("list", { name: "Visible columns" })
    ).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "region" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "units" })).not.toBeChecked();
    // Distinct and missing counts sit beside each field.
    expect(within(rows[2]!).getByText("Missing values:")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("10–30")).toBeInTheDocument();
  });

  it("adds a field at the end and removes one in place", () => {
    const onChange = renderPicker(["revenue", "region"]);

    fireEvent.click(screen.getByRole("checkbox", { name: "units" }));
    expect(onChange).toHaveBeenLastCalledWith(["revenue", "region", "units"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "revenue" }));
    expect(onChange).toHaveBeenLastCalledWith(["region"]);
  });

  it("shows all fields, keeping the current order first", () => {
    const onChange = renderPicker(["units"]);

    expect(screen.getByRole("checkbox", { name: "units" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(onChange).toHaveBeenCalledWith(["units", "region", "revenue"]);
  });

  it("finds fields by name", () => {
    renderPicker(["region"]);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "rev" },
    });
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: "revenue" })).toBeVisible();
  });
});
