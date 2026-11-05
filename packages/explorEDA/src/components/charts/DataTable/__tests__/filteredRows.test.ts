import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { dataTableDefinition, type DataTableSettings } from "../definition";
import { getFilteredRows, type DataTableRow } from "../filteredRows";

const table = (overrides: Partial<DataTableSettings>): DataTableSettings => ({
  ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
  columns: [{ id: "value", field: "value" }],
  ...overrides,
});

const rowsOf = (values: datum[]): DataTableRow[] =>
  values.map((value, index) => ({ __ID: index, value }));

const sorted = (
  values: datum[],
  sortDirection: "asc" | "desc",
  fieldTypes?: Parameters<typeof getFilteredRows>[3]
) => {
  const rows = rowsOf(values);
  return getFilteredRows(
    rows,
    { items: rows.map((row) => ({ key: row.__ID, value: 1 })), nonce: 0 },
    table({ sortBy: "value", sortDirection }),
    fieldTypes
  ).map((row) => row.value);
};

describe("getFilteredRows sorting", () => {
  it("keeps missing values last in both directions", () => {
    const values = [5, null, 1, "", 3, " ", undefined];
    expect(sorted(values, "asc")).toEqual([1, 3, 5, null, "", " ", undefined]);
    expect(sorted(values, "desc")).toEqual([5, 3, 1, null, "", " ", undefined]);
  });

  it("sorts a datetime column by time, not by text", () => {
    const dates = [
      "Mar 1 2024",
      "Jan 5 2024",
      "Feb 2 2024",
      "12/1/2023",
      "3/1/2023",
    ];
    expect(sorted(dates, "asc", { value: "datetime" })).toEqual([
      "3/1/2023",
      "12/1/2023",
      "Jan 5 2024",
      "Feb 2 2024",
      "Mar 1 2024",
    ]);
    expect(sorted(dates, "desc", { value: "datetime" })).toEqual([
      "Mar 1 2024",
      "Feb 2 2024",
      "Jan 5 2024",
      "12/1/2023",
      "3/1/2023",
    ]);
    // Text that is not a date falls back to a text comparison.
    expect(
      sorted(["Feb 2 2024", "unknown", "Jan 5 2024"], "asc", {
        value: "datetime",
      })
    ).toEqual(["Jan 5 2024", "Feb 2 2024", "unknown"]);
    // Without a type, the same text sorts as text.
    expect(sorted(dates, "asc")).toEqual([
      "3/1/2023",
      "12/1/2023",
      "Feb 2 2024",
      "Jan 5 2024",
      "Mar 1 2024",
    ]);
  });
});
