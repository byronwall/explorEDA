import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { heatmapDefinition, type HeatmapSettings } from "./definition";
import { heatText } from "../heatScale";
import {
  planHeatmap,
  toggleAxisFilters,
  toggleCellFilters,
} from "./heatmapPlan";
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

  it("places values on the scale and picks text that reads on the fill", () => {
    const result = plan({ aggregation: "sum", measureField: "Revenue" });
    expect(cell(result, "North", "Web").position).toBe(1);
    expect(cell(result, "South", "Store").position).toBeCloseTo(-4 / 15);
    expect(heatText(1)).toBe("var(--eda-heat-text-strong)");
    expect(heatText(0.2)).toBe("var(--eda-heat-text-weak)");
  });

  it("gives each count its share of the shown total", () => {
    const result = plan();
    expect(result.shareLabel).toBe("Share of total");
    expect(cell(result, "North", "Web").share).toBeCloseTo(2 / 6);
    // A share means nothing for averages or sums that cross zero.
    expect(cell(plan({ aggregation: "average", measureField: "Revenue" }), "North", "Web").share).toBeUndefined();
    expect(cell(plan({ aggregation: "sum", measureField: "Revenue" }), "North", "Web").share).toBeUndefined();
  });

  it("selects a whole row or column from its label, and clears it on a second click", () => {
    const base = settings();
    const result = plan();
    const north = result.rows.find((row) => row.label === "North")!;
    const filters = toggleAxisFilters(base, result, "row", north);
    expect(filters).toEqual([{ type: "value", field: "Region", values: ["North"] }]);
    const selected = plan({ filters });
    expect(cell(selected, "North", "Store").selected).toBe(true);
    expect(cell(selected, "South", "Web").selected).toBe(false);
    expect(toggleAxisFilters({ ...base, filters }, selected, "row", north)).toEqual([]);
    const web = selected.columns.find((column) => column.label === "Web")!;
    expect(toggleAxisFilters({ ...base, filters }, selected, "column", web)).toEqual([
      { type: "value", field: "Channel", values: ["Web"] },
    ]);
  });
});
