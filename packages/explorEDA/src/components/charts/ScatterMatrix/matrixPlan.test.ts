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
import { sortedBoxStats } from "./matrixCells";
import { OTHER_LABEL } from "./matrixBands";
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
  for (const name of names) {
    columns[name] = {};
  }
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
    diagonal: { ...DEFAULT_DIAGONAL_CELLS, continuous: "histogram" },
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
    expect(kind(0, 2)).toBe("box");
    expect(kind(3, 2)).toBe("shares");
    expect(kind(2, 3)).toBe("tiles");
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

  it("groups box plots by category and recounts the selection", () => {
    const filters: Filter[] = [
      { type: "range", field: "body_mass_g", min: 4500, max: 7000 },
    ];
    const plan = planScatterMatrix({
      settings: settings(FIELDS, filters),
      snapshot,
      width: 800,
      height: 800,
    });
    // Upper triangle: bill length (row 0) against species (column 2).
    const cell = plan.cells.find(
      (item) => item.row === 0 && item.column === 2
    )!;
    expect(cell.boxes!.horizontal).toBe(false);
    const groups = cell.boxes!.groups;
    expect(groups.map((group) => group.stats.count)).toEqual([151, 68, 123]);
    const gentoo = groups[2]!;
    const values = snapshot.liveIds
      .filter((id) => snapshot.columns.species![id] === "Gentoo")
      .map((id) => snapshot.columns.bill_length_mm![id])
      .filter((value): value is number => typeof value === "number")
      .sort((a, b) => a - b);
    expect(gentoo.stats.median).toBeCloseTo(
      values[Math.floor(values.length / 2)]!,
      5
    );
    // Every selected row is a heavy penguin, mostly Gentoo.
    const selected = cell.boxes!.selected!;
    expect(selected[2]!.count).toBeGreaterThan(selected[0]?.count ?? 0);
    expect(selected[2]!.count).toBeLessThanOrEqual(123);
  });

  it("computes Tukey whiskers from sorted values", () => {
    const stats = sortedBoxStats([1, 2, 3, 4, 5, 6, 7, 8, 100])!;
    expect(stats.median).toBe(5);
    expect(stats.q1).toBe(3);
    expect(stats.q3).toBe(7);
    expect(stats.high).toBe(8);
    expect(stats.low).toBe(1);
  });

  it("counts pairs of categories for tiles and shares", () => {
    const plan = planScatterMatrix({
      settings: settings(FIELDS, [
        { type: "value", field: "sex", values: ["male"] },
      ]),
      snapshot,
      width: 800,
      height: 800,
    });
    const tiles = plan.cells.find(
      (item) => item.row === 2 && item.column === 3
    )!;
    expect(tiles.kind).toBe("tiles");
    const pairs = tiles.pairs!;
    // Columns are sex (female, male, missing); rows are species.
    expect(pairs.columns).toBe(3);
    expect(pairs.rows).toBe(3);
    expect([...pairs.total].reduce((sum, count) => sum + count, 0)).toBe(344);
    expect([...pairs.columnTotal]).toEqual([165, 168, 11]);
    const selected = [...tiles.pairSelected!];
    expect(selected.reduce((sum, count) => sum + count, 0)).toBe(168);
    // Only the male column holds selected rows.
    expect(selected.slice(0, 3).every((count) => count === 0)).toBe(true);
  });

  it("folds rare categories into Other and selects all of them together", () => {
    const ids = Array.from({ length: 40 }, (_, id) => id);
    const many: MatrixSnapshot = {
      allIds: ids,
      liveIds: ids,
      columns: {
        // 20 distinct values: v0 appears 21 times, the rest once each.
        group: Object.fromEntries(
          ids.map((id) => [id, id < 21 ? "v0" : `v${id - 20}`])
        ),
        value: Object.fromEntries(ids.map((id) => [id, id])),
      },
      types: { group: "categorical", value: "numeric" },
    };
    const plan = planScatterMatrix({
      settings: settings(["group", "value"]),
      snapshot: many,
      width: 600,
      height: 600,
    });
    const group = plan.fields[0]!;
    expect(group.bands!.labels).toHaveLength(12);
    expect(group.bands!.labels.at(-1)).toBe(OTHER_LABEL);
    const other = group.bands!.other;
    const step = plan.cellSize / 12;
    const filter = offsetFilter(group, [
      plan.cellSize - step / 2,
      plan.cellSize,
    ]);
    expect(filter.type === "value" && filter.values).toHaveLength(9);
    const selected = many.liveIds.filter((id) =>
      applyFilter(many.columns.group![id], filter)
    );
    expect(selected).toHaveLength(9);
    expect(filterOffsets(group, [filter])).toBeDefined();
    const bars = plan.cells[0]!.bars!;
    expect(bars[other]!.total).toBe(9);
  });

  it("spreads jittered points by the jitter setting", () => {
    const tight = planScatterMatrix({
      settings: { ...settings(FIELDS), jitter: 0 },
      snapshot,
      width: 800,
      height: 800,
    });
    const species = tight.fields[2]!;
    const offsets = new Set(
      [...species.offset]
        .filter((value) => value === value)
        .map((v) => v.toFixed(3))
    );
    expect(offsets.size).toBe(3);
  });

  it("smooths density diagonals on counts so a selection sits inside", () => {
    const plan = planScatterMatrix({
      settings: {
        ...settings(FIELDS, [
          { type: "value", field: "species", values: ["Gentoo"] },
        ]),
        diagonal: DEFAULT_DIAGONAL_CELLS,
      },
      snapshot,
      width: 800,
      height: 800,
    });
    // Category diagonals keep their bars.
    expect(
      plan.cells.find((cell) => cell.row === 2 && cell.column === 2)!.kind
    ).toBe("bars");
    const cell = plan.cells.find(
      (item) => item.row === 1 && item.column === 1
    )!;
    expect(cell.kind).toBe("density");
    const curve = cell.density!;
    const sum = (values: Float64Array) => values.reduce((a, b) => a + b, 0);
    // Smoothing keeps each curve's total equal to its row count, give or
    // take the tails that fall past the domain.
    expect(sum(curve.total)).toBeGreaterThan(330);
    expect(sum(curve.total)).toBeLessThanOrEqual(342.0001);
    expect(sum(curve.selected!)).toBeGreaterThan(118);
    expect(sum(curve.selected!)).toBeLessThanOrEqual(123.0001);
    expect(
      curve.selected!.every((value, bin) => value <= curve.total[bin]! + 1e-9)
    ).toBe(true);
  });

  it("groups rows by the color field for points, bars, and correlations", () => {
    const plan = planScatterMatrix({
      settings: {
        ...settings(FIELDS),
        colorField: "species",
        colorScaleId: "species",
      },
      snapshot: {
        ...snapshot,
        colorScale: {
          id: "species",
          name: "Species",
          type: "categorical",
          palette: ["#ff0000", "#00ff00", "#0000ff"],
          mapping: new Map([
            ["Adelie", "#ff0000"],
            ["Chinstrap", "#00ff00"],
            ["Gentoo", "#0000ff"],
          ]),
        } as never,
      },
      width: 800,
      height: 800,
    });
    const groups = plan.groups!;
    expect(groups.labels).toEqual(["Adelie", "Chinstrap", "Gentoo"]);
    expect([...groups.index].filter((group) => group === 2)).toHaveLength(124);
    const r = plan.cells.find((cell) => cell.row === 0 && cell.column === 1)!;
    expect(r.groupR).toHaveLength(3);
    // Each group's r matches Pearson over that species alone.
    const gentoo = snapshot.liveIds.filter(
      (id) =>
        snapshot.columns.species![id] === "Gentoo" &&
        typeof snapshot.columns.bill_length_mm![id] === "number" &&
        typeof snapshot.columns.body_mass_g![id] === "number"
    );
    expect(r.groupR![2]).toBeCloseTo(
      pearson(
        gentoo.map((id) => snapshot.columns.body_mass_g![id] as number),
        gentoo.map((id) => snapshot.columns.bill_length_mm![id] as number)
      )!,
      10
    );
    expect(groups.colors[2]).toBe("#0000ff");
    const bars = plan.cells.find(
      (cell) => cell.row === 0 && cell.column === 0
    )!.bars!;
    const counted = bars.reduce(
      (sum, bar) => sum + bar.groups!.reduce((a, b) => a + b, 0),
      0
    );
    expect(counted).toBe(342);
  });
});
