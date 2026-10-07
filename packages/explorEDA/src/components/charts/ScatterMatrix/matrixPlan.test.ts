import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import {
  DEFAULT_DIAGONAL_CELLS,
  DEFAULT_LOWER_CELLS,
  DEFAULT_UPPER_CELLS,
  type ScatterMatrixSettings,
} from "./definition";
import {
  brushFilters,
  filterOffsets,
  offsetFilter,
  pearson,
  planScatterMatrix,
  replaceSelection,
  type MatrixSnapshot,
} from "./matrixPlan";

/** Palmer penguins: 344 rows, two with no measurements, eleven with no sex. */
function penguins(): MatrixSnapshot {
  const text = readFileSync(
    resolve(
      __dirname,
      "../../../../../../apps/demo/public/datasets/palmer-penguins.csv"
    ),
    "utf8"
  );
  const [header, ...lines] = text.trim().split("\n");
  const names = header!.split(",");
  const columns: Record<string, Record<number, datum>> = {};
  for (const name of names) columns[name] = {};
  lines.forEach((line, id) => {
    line.split(",").forEach((cell, index) => {
      const value = cell === "" || cell === "NA" ? null : cell;
      const number = value === null ? NaN : Number(value);
      columns[names[index]!]![id] = Number.isFinite(number) ? number : value;
    });
  });
  const ids = lines.map((_, id) => id);
  return {
    allIds: ids,
    liveIds: ids,
    columns,
    types: {
      bill_length_mm: "numeric",
      body_mass_g: "numeric",
      flipper_length_mm: "numeric",
      species: "categorical",
      sex: "categorical",
    },
  };
}

function settings(
  fields: string[],
  filters: Filter[] = []
): ScatterMatrixSettings {
  return {
    ...DEFAULT_CHART_SETTINGS,
    id: "matrix",
    type: "scatter-matrix",
    fields,
    lower: DEFAULT_LOWER_CELLS,
    upper: DEFAULT_UPPER_CELLS,
    diagonal: DEFAULT_DIAGONAL_CELLS,
    margin: { top: 4, right: 4, bottom: 4, left: 4 },
    filters,
  };
}

const FIELDS = ["bill_length_mm", "body_mass_g", "species", "sex"];

describe("planScatterMatrix", () => {
  const snapshot = penguins();

  it("lays out one cell per field pair with kinds by pair type", () => {
    const plan = planScatterMatrix({
      settings: settings(FIELDS),
      snapshot,
      width: 800,
      height: 800,
    });
    expect(plan.fields.map((field) => field.kind)).toEqual([
      "numeric",
      "numeric",
      "band",
      "band",
    ]);
    const kind = (row: number, column: number) =>
      plan.cells.find((cell) => cell.row === row && cell.column === column)!
        .kind;
    expect(kind(0, 0)).toBe("histogram");
    expect(kind(2, 2)).toBe("bars");
    expect(kind(1, 0)).toBe("points");
    expect(kind(0, 1)).toBe("correlation");
    expect(kind(2, 0)).toBe("points");
    expect(kind(0, 2)).toBe("points");
    expect(kind(3, 2)).toBe("points");
  });

  it("uses pairwise-valid rows and reports reduced counts", () => {
    const plan = planScatterMatrix({
      settings: settings(FIELDS),
      snapshot,
      width: 800,
      height: 800,
    });
    const cell = (row: number, column: number) =>
      plan.cells.find((item) => item.row === row && item.column === column)!;
    expect(plan.liveIds).toHaveLength(344);
    // Two penguins have no measurements.
    expect(cell(1, 0).n).toBe(342);
    // Species is never missing; a missing sex gets its own band.
    expect(cell(2, 0).n).toBe(342);
    expect(cell(2, 2).n).toBe(344);
    expect(
      plan.fields[3]!.axis.kind === "band" &&
        plan.fields[3]!.axis.categories.length
    ).toBe(3);
  });

  it("computes Pearson r for continuous pairs", () => {
    const plan = planScatterMatrix({
      settings: settings(FIELDS),
      snapshot,
      width: 800,
      height: 800,
    });
    const r = plan.cells.find(
      (cell) => cell.row === 0 && cell.column === 1
    )!.r!;
    // Bill length and body mass correlate at about 0.595 in this data.
    expect(r).toBeCloseTo(0.595, 2);
    expect(pearson([1, 2, 3, 4], [2, 4, 6, 8])).toBeCloseTo(1);
    expect(pearson([1, 1, 1], [1, 2, 3])).toBeUndefined();
  });

  it("brushes a numeric pair into two range filters and keeps domains still", () => {
    const base = planScatterMatrix({
      settings: settings(FIELDS),
      snapshot,
      width: 800,
      height: 800,
    });
    const cell = base.cells.find(
      (item) => item.row === 1 && item.column === 0
    )!;
    const filters = brushFilters(
      base,
      cell,
      [0, 0],
      [base.cellSize / 2, base.cellSize / 2]
    );
    expect(filters.map((filter) => [filter.type, filter.field])).toEqual([
      ["range", "bill_length_mm"],
      ["range", "body_mass_g"],
    ]);
    const brushed = planScatterMatrix({
      settings: settings(FIELDS, filters),
      snapshot,
      width: 800,
      height: 800,
    });
    expect(brushed.fields[0]!.axis.scale.domain()).toEqual(
      base.fields[0]!.axis.scale.domain()
    );
    expect(Array.from(brushed.fields[0]!.offset)).toEqual(
      Array.from(base.fields[0]!.offset)
    );
    expect(brushed.hasSelection).toBe(true);
    const expected = snapshot.liveIds.filter((id) =>
      filters.every((filter) =>
        applyFilter(snapshot.columns[filter.field]![id], filter)
      )
    ).length;
    expect(brushed.selectedCount).toBe(expected);
    expect(expected).toBeGreaterThan(0);
    expect(expected).toBeLessThan(342);
    // The diagonal stacks the selection inside each bin's total.
    const bars = brushed.cells.find(
      (item) => item.row === 0 && item.column === 0
    )!.bars!;
    expect(bars.reduce((sum, bar) => sum + bar.selected, 0)).toBe(expected);
    expect(bars.reduce((sum, bar) => sum + bar.total, 0)).toBe(342);
  });

  it("brushes bands into value filters on the categories it covers", () => {
    const plan = planScatterMatrix({
      settings: settings(FIELDS),
      snapshot,
      width: 800,
      height: 800,
    });
    const species = plan.fields[2]!;
    const filter = offsetFilter(species, [0, plan.cellSize]);
    expect(filter).toEqual({
      type: "value",
      field: "species",
      values: ["Adelie", "Chinstrap", "Gentoo"],
    });
    const span = filterOffsets(species, [filter]);
    expect(span![0]).toBeLessThan(15);
    expect(span![1]).toBeGreaterThan(plan.cellSize - 15);
  });

  it("plans continuous date axes and date-range brushes", () => {
    const ids = [0, 1, 2, 3];
    const dates: MatrixSnapshot = {
      allIds: ids,
      liveIds: ids,
      columns: {
        day: { 0: "2024-01-01", 1: "2024-02-01", 2: "2024-03-01", 3: null },
        value: { 0: 1, 1: 2, 2: 3, 3: 4 },
      },
      types: { day: "datetime", value: "numeric" },
    };
    const plan = planScatterMatrix({
      settings: settings(["day", "value"]),
      snapshot: dates,
      width: 400,
      height: 400,
    });
    expect(plan.fields[0]!.kind).toBe("date");
    expect(plan.fields[0]!.valid).toBe(3);
    expect(plan.fields[0]!.ticks.length).toBeGreaterThan(0);
    const filter = offsetFilter(plan.fields[0]!, [0, plan.cellSize]);
    expect(filter.type).toBe("date-range");
    expect(applyFilter("2024-02-01", filter)).toBe(true);
    expect(filterOffsets(plan.fields[0]!, [filter])).toBeDefined();
  });

  it("replaces the previous selection with a new brush", () => {
    const current = settings(FIELDS, [
      { type: "range", field: "bill_length_mm", min: 1, max: 2 },
      { type: "value", field: "__ID", values: [3] },
      { type: "value", field: "island", values: ["Dream"] },
    ]);
    expect(
      replaceSelection(current, [
        { type: "value", field: "species", values: ["Gentoo"] },
      ])
    ).toEqual([
      { type: "value", field: "island", values: ["Dream"] },
      { type: "value", field: "species", values: ["Gentoo"] },
    ]);
  });

  it("keeps cells at a minimum size and grows the content to scroll", () => {
    const plan = planScatterMatrix({
      settings: settings(FIELDS),
      snapshot,
      width: 300,
      height: 300,
    });
    expect(plan.cellSize).toBe(72);
    expect(plan.contentWidth).toBeGreaterThan(300);
  });
});
