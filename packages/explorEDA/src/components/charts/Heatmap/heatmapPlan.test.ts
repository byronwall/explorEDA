import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { heatmapDefinition, type HeatmapSettings } from "./definition";
import { planHeatmap, textOn, toggleCellFilters } from "./heatmapPlan";
import { resolveHeatmapTrace } from "./heatmapTrace";

const rows: [string, string, datum][] = [
  ["North", "Web", 10],
  ["North", "Web", 5],
  ["North", "Store", "n/a"],
  ["South", "Web", 0],
  ["South", "Store", -4],
  ["East", "Web", 3],
];

function settings(extra: Partial<HeatmapSettings> = {}): HeatmapSettings {
  return {
    ...heatmapDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }, "Region"),
    id: "heat",
    columnField: "Channel",
    ...extra,
  };
}

function plan(extra: Partial<HeatmapSettings> = {}, liveIds?: number[]) {
  const column = (index: number) =>
    Object.fromEntries(rows.map((row, id) => [id, row[index]]));
  return planHeatmap({
    settings: settings(extra),
    width: 480,
    height: 320,
    snapshot: {
      revision: "r1",
      allIds: rows.map((_, id) => id),
      liveIds: liveIds ?? rows.map((_, id) => id),
      rowData: column(0),
      columnData: column(1),
      measureData: column(2),
    },
    getFieldLabel: (field) => field,
  });
}

const cell = (result: ReturnType<typeof plan>, row: string, column: string) =>
  result.cells.find((item) => item.row.label === row && item.column.label === column)!;

describe("planHeatmap", () => {
  it("counts each pair and keeps an empty pair distinct from zero", () => {
    const result = plan();
    expect(result.rows.map((row) => row.label)).toEqual(["North", "South", "East"]);
    expect(result.columns.map((column) => column.label)).toEqual(["Web", "Store"]);
    expect(cell(result, "North", "Web")).toMatchObject({ state: "value", value: 2 });
    expect(cell(result, "East", "Store")).toMatchObject({
      state: "empty",
      valueText: "No rows",
      rowCount: 0,
    });
    expect(result.hasEmpty).toBe(true);
  });

  it("separates zero, invalid measures, and negative sums", () => {
    const result = plan({ aggregation: "sum", measureField: "Revenue" });
    expect(cell(result, "North", "Web")).toMatchObject({ state: "value", value: 15 });
    expect(cell(result, "South", "Web")).toMatchObject({ state: "value", value: 0 });
    const invalid = cell(result, "North", "Store");
    expect(invalid).toMatchObject({ state: "invalid", rowCount: 1 });
    expect(invalid.contributors).toEqual([
      expect.objectContaining({ sourceId: 2, included: false }),
    ]);
    expect(result.scale).toMatchObject({ kind: "diverging", domain: [-4, 15] });
  });

  it("limits each axis to the values with the most rows and says how many rows it leaves out", () => {
    const result = plan({ maxCategories: 2 });
    expect(result.rows.map((row) => row.label)).toEqual(["North", "South"]);
    expect(result.omitted).toEqual({ rows: 1, columns: 0, sourceRows: 1 });
  });

  it("keeps category order and cell values from other charts' filters apart", () => {
    const result = plan({}, [0, 3]);
    expect(result.rows.map((row) => row.label)).toEqual(["North", "South", "East"]);
    expect(cell(result, "North", "Web").value).toBe(1);
    expect(cell(result, "East", "Web").state).toBe("empty");
  });

  it("selects one exact cell, and clears it on a second click", () => {
    const first = plan();
    const filters = toggleCellFilters(settings(), first, cell(first, "South", "Store"));
    expect(filters).toEqual([
      { type: "value", field: "Region", values: ["South"] },
      { type: "value", field: "Channel", values: ["Store"] },
    ]);
    const selected = plan({ filters });
    expect(selected.selection).toEqual({ row: "South", column: "Store" });
    expect(cell(selected, "South", "Store").selected).toBe(true);
    expect(cell(selected, "South", "Web").selected).toBe(false);
    expect(cell(selected, "North", "Store").selected).toBe(false);
    expect(
      toggleCellFilters(settings({ filters }), selected, cell(selected, "South", "Store"))
    ).toEqual([]);
  });

  it("filters source rows to the selected pair only", () => {
    const filter = heatmapDefinition.getFilterFunction(
      settings({
        filters: [
          { type: "value", field: "Region", values: ["North"] },
          { type: "value", field: "Channel", values: ["Web"] },
        ],
      }),
      (field) =>
        Object.fromEntries(
          rows.map((row, id) => [id, field === "Region" ? row[0] : row[1]])
        )
    );
    expect(rows.map((_, id) => id).filter(filter)).toEqual([0, 1]);
  });

  it("explains a cell with its keys, metric, and contributors", () => {
    const result = plan({ aggregation: "average", measureField: "Revenue" });
    const target = cell(result, "North", "Web");
    const trace = resolveHeatmapTrace(result, "cell", target.id);
    expect(trace).toMatchObject({
      kind: "cell",
      metricLabel: "Average of Revenue",
      cell: { value: 7.5, rowCount: 2 },
    });
    expect(trace?.cell.contributors.map((item) => item.sourceId)).toEqual([0, 1]);
  });

  it("chooses readable text for dark and light fills", () => {
    expect(textOn("rgb(8, 48, 107)")).toBe("#ffffff");
    expect(textOn("rgb(222, 235, 247)")).toBe("#1f2937");
  });
});
