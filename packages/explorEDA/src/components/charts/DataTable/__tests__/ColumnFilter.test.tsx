import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ColumnFilter } from "../components/ColumnFilter";
import type { FieldProfile } from "@/lib/fieldProfiles";

const profile = (overrides: Partial<FieldProfile> = {}): FieldProfile => ({
  name: "name",
  dataType: "categorical",
  totalCount: 3,
  uniqueCount: 3,
  nullCount: 0,
  categories: {
    topValues: [],
    distribution: [
      { value: "John", count: 1 },
      { value: "Jane", count: 1 },
      { value: "Bob", count: 1 },
    ],
  },
  ...overrides,
});

describe("ColumnFilter", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("uses text controls for high-cardinality fields", () => {
    render(
      <ColumnFilter
        columnId="name"
        columnLabel="Name"
        profile={profile({ uniqueCount: 20 })}
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText("Filter Name...")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("updates a text filter", () => {
    const onChange = vi.fn();
    render(
      <ColumnFilter
        columnId="name"
        columnLabel="Name"
        profile={profile({ uniqueCount: 20 })}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Filter Name..."), {
      target: { value: "John" },
    });
    expect(onChange).toHaveBeenCalledWith("name", {
      type: "text",
      field: "name",
      operator: "contains",
      value: "John",
    });
  });

  it("renders numeric range inputs", () => {
    const onChange = vi.fn();
    render(
      <ColumnFilter
        columnId="age"
        columnLabel="Age"
        profile={profile({
          name: "age",
          dataType: "numeric",
          uniqueCount: 3,
          categories: undefined,
          statistics: { min: 1, max: 3, mean: 2, median: 2, stdDev: 1 },
        })}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Minimum Age"), {
      target: { value: "2" },
    });
    expect(onChange).toHaveBeenCalledWith("age", {
      type: "range",
      field: "age",
      min: 2,
    });
  });

  it("renders categorical values and missing", () => {
    const onChange = vi.fn();
    render(
      <ColumnFilter
        columnId="species"
        columnLabel="Species"
        profile={profile({
          name: "species",
          uniqueCount: 2,
          nullCount: 1,
          categories: {
            topValues: [],
            distribution: [
              { value: "Adelie", count: 2 },
              { value: "Gentoo", count: 1 },
            ],
          },
        })}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText(/Missing ·/));
    expect(onChange).toHaveBeenCalledWith("species", {
      type: "value",
      field: "species",
      values: [null],
    });
  });

  it("renders date range inputs", () => {
    const onChange = vi.fn();
    render(
      <ColumnFilter
        columnId="created"
        columnLabel="Created"
        profile={profile({
          name: "created",
          dataType: "datetime",
          uniqueCount: 3,
          categories: undefined,
        })}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    fireEvent.input(screen.getByLabelText("Start date Created"), {
      target: { value: "2026-01-01" },
    });
    expect(onChange).toHaveBeenCalledWith("created", {
      type: "date-range",
      field: "created",
      min: "2026-01-01",
    });
  });

  it("clears a filter", () => {
    const onClear = vi.fn();
    render(
      <ColumnFilter
        columnId="name"
        columnLabel="Name"
        profile={profile({ uniqueCount: 20 })}
        onChange={vi.fn()}
        onClear={onClear}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Clear filter for Name" })
    );
    expect(onClear).toHaveBeenCalled();
  });
  it("offers only missing values for numeric fields and locks the range", () => {
    const onChange = vi.fn();
    const numeric = profile({
      name: "price",
      dataType: "numeric",
      nullCount: 4,
      categories: undefined,
    });
    const { rerender } = render(
      <ColumnFilter
        columnId="price"
        columnLabel="Price"
        profile={numeric}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText(/Only missing values/));
    expect(onChange).toHaveBeenCalledWith("price", {
      type: "value",
      field: "price",
      values: [null],
    });

    rerender(
      <ColumnFilter
        columnId="price"
        columnLabel="Price"
        profile={numeric}
        filter={{ type: "value", field: "price", values: [null] }}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Only missing values/)).toBeChecked();
    expect(screen.getByLabelText("Minimum Price")).toBeDisabled();
  });

  it("disables only missing values when a field has none", () => {
    render(
      <ColumnFilter
        columnId="name"
        columnLabel="Name"
        profile={profile({ uniqueCount: 20 })}
        onChange={vi.fn()}
        onClear={vi.fn()}
      />
    );
    expect(screen.getByLabelText(/Only missing values/)).toBeDisabled();
  });

  it("draws a number field's distribution over a range slider", () => {
    const onChange = vi.fn();
    const numeric = profile({
      name: "age",
      dataType: "numeric",
      uniqueCount: 30,
      totalCount: 40,
      categories: undefined,
      statistics: {
        min: 20,
        max: 60,
        mean: 40,
        median: 40,
        stdDev: 5,
        bins: [10, 20, 10],
      },
    });
    render(
      <ColumnFilter
        columnId="age"
        columnLabel="Age"
        profile={numeric}
        distribution={numeric}
        filter={{ type: "range", field: "age", min: 30 }}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByText("Range 20 to 60, median 40")).toBeInTheDocument();
    const lower = screen.getByRole("slider", { name: "Lower bound of Age" });
    const upper = screen.getByRole("slider", { name: "Upper bound of Age" });
    expect(lower).toHaveAttribute("aria-valuenow", "30");
    expect(upper).toHaveAttribute("aria-valuenow", "60");

    fireEvent.focus(upper);
    fireEvent.keyDown(upper, { key: "ArrowLeft" });
    expect(onChange).toHaveBeenLastCalledWith("age", {
      type: "range",
      field: "age",
      min: 30,
      max: 59,
    });
  });

  it("leaves a side open when its thumb reaches the end of the range", () => {
    const onChange = vi.fn();
    const numeric = profile({
      name: "age",
      dataType: "numeric",
      uniqueCount: 30,
      categories: undefined,
      statistics: { min: 20, max: 60, mean: 40, median: 40, stdDev: 5 },
    });
    render(
      <ColumnFilter
        columnId="age"
        columnLabel="Age"
        profile={numeric}
        distribution={numeric}
        filter={{ type: "range", field: "age", min: 21 }}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    fireEvent.keyDown(
      screen.getByRole("slider", { name: "Lower bound of Age" }),
      { key: "ArrowLeft" }
    );
    expect(onChange).toHaveBeenLastCalledWith("age", undefined);
  });
});
