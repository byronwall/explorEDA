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
    distribution: { John: 1, Jane: 1, Bob: 1 },
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
            distribution: { Adelie: 2, Gentoo: 1 },
          },
        })}
        onChange={onChange}
        onClear={vi.fn()}
      />
    );

    fireEvent.click(screen.getByLabelText("Missing"));
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
});
