import { expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { hideColumn } from "../columnOps";
import { dataTableDefinition, type DataTableSettings } from "../definition";
import { getFilteredRows } from "../filteredRows";

const rows = [
  { __ID: 0, name: "A", score: 1 },
  { __ID: 1, name: "B", score: 5 },
  { __ID: 2, name: "C", score: 9 },
];
const fieldGetter = (field: string) =>
  Object.fromEntries(
    rows.map((row) => [row.__ID, row[field as keyof typeof row] as datum])
  );

it("keeps a filter's linked rows when its column is hidden", () => {
  const table: DataTableSettings = {
    ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    columns: [
      { id: "name", field: "name" },
      { id: "score", field: "score" },
    ],
    filters: [{ type: "range", field: "score", min: 4 }],
  };
  const hidden = { ...table, columns: hideColumn(table.columns, "score") };
  const linked = (settings: DataTableSettings) => {
    const keep = dataTableDefinition.getFilterFunction(settings, fieldGetter);
    return rows.filter((row) => keep(row.__ID)).map((row) => row.__ID);
  };
  const shown = (settings: DataTableSettings) =>
    getFilteredRows(
      rows,
      { items: rows.map((row) => ({ key: row.__ID, value: 1 })), nonce: 0 },
      settings
    ).map((row) => row.__ID);

  expect(linked(table)).toEqual([1, 2]);
  expect(linked(hidden)).toEqual(linked(table));
  expect(linked(hidden)).toEqual(shown(hidden));
});
