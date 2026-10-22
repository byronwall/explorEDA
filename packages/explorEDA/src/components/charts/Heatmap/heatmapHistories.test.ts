import { describe, expect, it } from "vitest";
import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import { heatmapDefinition, type HeatmapSettings } from "./definition";
import { planHeatmap, toggleCellFilters } from "./heatmapPlan";

type Row = { who: string; date: datum; value?: datum };

function planFor(
  rows: Row[],
  extra: Partial<HeatmapSettings>,
  liveIds?: number[]
) {
  const settings: HeatmapSettings = {
    ...heatmapDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 12, h: 6 },
      "Who"
    ),
    id: "heat",
    columnField: "Date",
    ...extra,
  };
  const column = (key: keyof Row) =>
    Object.fromEntries(rows.map((row, id) => [id, row[key]]));
  const result = planHeatmap({
    settings,
    width: 1200,
    height: 400,
    snapshot: {
      revision: "r",
      allIds: rows.map((_, id) => id),
      liveIds: liveIds ?? rows.map((_, id) => id),
      rowData: column("who"),
      columnData: column("date"),
      measureData: column("value"),
    },
    getFieldLabel: (field) => field,
  });
  return { settings, result };
}

const messages: Row[] = [
  { who: "Avery", date: "2019-01-15" },
  { who: "Avery", date: "2019-01-20" },
  // February has no messages at all.
  { who: "Blake", date: "2019-03-02" },
  { who: "Avery", date: "2019-04-30" },
  { who: "Blake", date: "not a date" },
];

describe("heatmap date bins", () => {
  it("draws a column for every month from first to last", () => {
    const { result } = planFor(messages, { columnInterval: "month" });
    expect(result.columns.map((column) => column.label)).toEqual([
      "2019-01",
      "2019-02",
      "2019-03",
      "2019-04",
    ]);
    const cell = (who: string, month: string) =>
      result.cells.find(
        (item) => item.row.label === who && item.column.label === month
      )!;
    expect(cell("Avery", "2019-01")).toMatchObject({
      state: "value",
      value: 2,
    });
    // An absent month is an empty column, not a dropped one.
    expect(cell("Avery", "2019-02").state).toBe("empty");
    // The unreadable date sits in no column, and the chart says so.
    expect(result.omitted.sourceRows).toBe(1);
  });

  it("keeps the latest periods past the column limit and counts the rest", () => {
    const { result } = planFor(messages, {
      columnInterval: "month",
      maxColumns: 2,
    });
    expect(result.columns.map((column) => column.label)).toEqual([
      "2019-03",
      "2019-04",
    ]);
    expect(result.omitted.columns).toBe(2);
  });

  it("selects a month cell by date range and finds exactly its rows", () => {
    const { settings, result } = planFor(messages, { columnInterval: "month" });
    const cell = result.cells.find(
      (item) => item.row.label === "Avery" && item.column.label === "2019-01"
    )!;
    const filters = toggleCellFilters(settings, result, cell);
    const range = filters.find((filter) => filter.type === "date-range")!;
    expect(range).toMatchObject({ min: "2019-01-01", max: "2019-01-31" });
    const test = heatmapDefinition.getFilterFunction(
      { ...settings, filters },
      (field) =>
        Object.fromEntries(
          messages.map((row, id) => [id, field === "Who" ? row.who : row.date])
        )
    );
    expect(messages.map((_, id) => id).filter(test)).toEqual([0, 1]);
    // The selection reads back as that one cell, so a second click clears it.
    const selected = planFor(messages, {
      columnInterval: "month",
      filters,
    }).result;
    expect(selected.selection).toEqual({
      row: "Avery",
      column: cell.column.value,
    });
    expect(toggleCellFilters({ ...settings, filters }, selected, cell)).toEqual(
      []
    );
    expect(applyFilter("2019-01-31", range)).toBe(true);
    expect(applyFilter("2019-02-01", range)).toBe(false);
  });
});

describe("heatmap axes and color", () => {
  const rows: Row[] = [
    { who: "Zed", date: "B", value: 30 },
    { who: "Amy", date: "A", value: -10 },
    { who: "Amy", date: "B", value: 40 },
    { who: "Zed", date: "A", value: 5 },
  ];

  it("orders each axis on its own, including source order", () => {
    const { result } = planFor(rows, {
      sortBy: "data",
      columnSortBy: "label",
    });
    expect(result.rows.map((row) => row.label)).toEqual(["Zed", "Amy"]);
    expect(result.columns.map((column) => column.label)).toEqual(["A", "B"]);
  });

  it("keeps a value's color fixed through filters with set ends", () => {
    const domain = { min: -40, max: 40 };
    const all = planFor(rows, {
      aggregation: "sum",
      measureField: "Value",
      colorDomain: domain,
    }).result;
    const some = planFor(
      rows,
      { aggregation: "sum", measureField: "Value", colorDomain: domain },
      [0, 3]
    ).result;
    const fill = (result: typeof all, who: string, column: string) =>
      result.cells.find(
        (item) => item.row.label === who && item.column.label === column
      )!;
    expect(all.scale).toMatchObject({ kind: "diverging", domain: [-40, 40] });
    expect(fill(some, "Zed", "B").fill).toBe(fill(all, "Zed", "B").fill);
    expect(fill(all, "Zed", "B").position).toBeCloseTo(0.75);
    // Past an end, a value takes the end's color.
    const clamped = planFor(rows, {
      aggregation: "sum",
      measureField: "Value",
      colorDomain: { min: -40, max: 20 },
    }).result;
    expect(fill(clamped, "Amy", "B").position).toBe(1);
  });

  it("spreads small counts apart on a square-root scale with zero lowest", () => {
    const { result } = planFor(rows, {
      colorDomain: { min: 0, max: 4, transform: "sqrt" },
    });
    const cell = result.cells.find(
      (item) => item.row.label === "Zed" && item.column.label === "B"
    )!;
    // One row of four: √1 / √4 = 0.5, where a linear scale gives 0.25.
    expect(cell.position).toBeCloseTo(0.5);
    expect(result.scale.transform).toBe("sqrt");
  });
});

it("prints a numeric category plainly unless its field has a format", () => {
  const rows = [{ who: "A", year: 1928 }];
  const run = (formatted: boolean) =>
    planHeatmap({
      settings: {
        ...heatmapDefinition.createDefaultSettings(
          { x: 0, y: 0, w: 6, h: 4 },
          "Who"
        ),
        columnField: "Year",
      },
      width: 400,
      height: 300,
      snapshot: {
        revision: "r",
        allIds: [0],
        liveIds: [0],
        rowData: { 0: rows[0]!.who },
        columnData: { 0: rows[0]!.year },
        measureData: {},
      },
      getFieldLabel: (field) => field,
      formatFieldValue: (_, value) => Number(value).toLocaleString("en-US"),
      formatsCategory: () => formatted,
    }).columns[0]!.label;
  expect(run(false)).toBe("1928");
  expect(run(true)).toBe("1,928");
});
