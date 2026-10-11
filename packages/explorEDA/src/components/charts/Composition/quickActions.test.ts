import { describe, expect, it, vi } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { describeMark } from "./markSummary";
import { quickActions, type QuickActionApi } from "./quickActions";
import { resolveComposition } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";

const rows: Record<string, datum>[] = [
  { Country: "Ada", Year: 2000, GDP: 1 },
  { Country: "Ada", Year: 2001, GDP: 2 },
  { Country: "Bo", Year: 2000, GDP: 3 },
  { Country: "Bo", Year: 2001, GDP: 1 },
];
const all = rows.map((_, id) => id);
const data: CompositionData = {
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
};
const unit: UnitElement = {
  id: "unit-1",
  kind: "unit",
  name: "Countries",
  x: 0,
  y: 0,
  frame: { width: 200, height: 100 },
  label: { show: true, width: 40, fontSize: 10 },
  axis: true,
  marks: [
    {
      type: "path",
      id: "mark-1",
      name: "Growth",
      xScaleId: "n-1",
      yScaleId: "n-2",
      orderField: "Year",
      stroke: "#000",
      strokeWidth: 1,
      rank: "desc",
      colorField: "Country",
    },
  ],
  repeat: {
    field: "Country",
    arrangement: "rows",
    columns: 1,
    gap: 4,
    order: "label",
    limit: 10,
  },
};
const definition: CompositionDefinition = {
  ...createEmptyComposition(),
  scales: [
    {
      id: "n-1",
      kind: "numeric",
      name: "Year",
      field: "Year",
      domain: "shared",
      zero: false,
      nice: false,
    },
    {
      id: "n-2",
      kind: "numeric",
      name: "GDP",
      field: "GDP",
      domain: "shared",
      zero: true,
      nice: false,
    },
  ],
  elements: [
    unit,
    {
      id: "title-1",
      kind: "text",
      role: "title",
      name: "Title",
      text: "Hello",
      x: 0,
      y: 200,
      width: 100,
      fontSize: 12,
      fontWeight: 700,
      color: "#000",
    },
  ],
};
const scene = resolveComposition(definition, estimateTextWidth, data);
const api = (): QuickActionApi => ({
  edit: vi.fn(),
  editMark: vi.fn(),
  editScale: vi.fn(),
  trace: vi.fn(),
  filterRepeat: vi.fn(),
  clearFilters: vi.fn(),
  remove: vi.fn(),
});

describe("quickActions", () => {
  it("lists the mark, its scales, the unit, the repeat, trace, and the filter for a drawn path", () => {
    const path = scene.nodes.find(
      (node) => node.type === "path" && node.instanceKey === "Ada"
    )!;
    const actions = quickActions({
      definition,
      mode: "view",
      node: path,
      hasFilters: false,
    });
    expect(actions.map((action) => action.id)).toEqual([
      "mark:mark-1",
      "scale:n-1",
      "scale:n-2",
      "unit:unit-1",
      "repeat:unit-1:Ada",
      `trace:path:${path.key}`,
      "filter:Ada",
    ]);
    expect(actions[0]!.label).toBe("Edit mark: Growth");
    expect(actions[0]!.detail).toBe(
      "Path · Year → GDP as ranks · colored by Country"
    );
    const calls = api();
    actions[0]!.run(calls);
    expect(calls.editMark).toHaveBeenCalledWith("unit-1", "mark-1");
    actions[2]!.run(calls);
    expect(calls.editScale).toHaveBeenCalledWith("n-2");
    actions[4]!.run(calls);
    expect(calls.edit).toHaveBeenCalledWith("unit-1", "Ada");
    actions[6]!.run(calls);
    expect(calls.filterRepeat).toHaveBeenCalledWith("Country", "Ada");
  });

  it("offers removal only while editing, and clearing only with filters", () => {
    const title = scene.nodes.find((node) => node.elementId === "title-1")!;
    const editing = quickActions({
      definition,
      mode: "edit",
      node: title,
      hasFilters: true,
    });
    expect(editing.map((action) => action.id)).toEqual([
      "element:title-1",
      "remove:title-1",
    ]);
    expect(editing[1]!.destructive).toBe(true);
    const viewing = quickActions({
      definition,
      mode: "view",
      node: undefined,
      hasFilters: true,
    });
    expect(viewing.map((action) => action.id)).toEqual(["clear-filters"]);
    expect(
      quickActions({
        definition,
        mode: "view",
        node: undefined,
        hasFilters: false,
      })
    ).toEqual([]);
  });
});

describe("describeMark", () => {
  it("summarizes each mark type in one line", () => {
    expect(
      describeMark(
        {
          type: "stack",
          id: "s",
          name: "s",
          categoryField: "Industry",
          aggregation: "sum",
          measureField: "Count",
          normalize: false,
          order: "total",
          colors: ["#000"],
          labelMinHeight: 0,
          inset: 0,
          xScaleId: "n-1",
        },
        definition
      )
    ).toBe("Stack · Industry · sum of Count across Year");
    expect(
      describeMark(
        {
          type: "waffle",
          id: "w",
          name: "w",
          categoryField: "Fate",
          each: 10,
          normalize: false,
          columns: 10,
          gap: 1,
          from: "top",
          order: "label",
          colors: ["#000"],
        },
        definition
      )
    ).toBe("Waffle · Fate · one cell per 10 rows");
    expect(
      describeMark(
        {
          type: "bar",
          id: "b",
          name: "b",
          aggregation: "count",
          order: "label",
          colors: ["#000"],
          inset: 0,
          labelMinWidth: 0,
          categoryField: "Sex",
        },
        definition
      )
    ).toBe("Bars · count · split by Sex");
  });
});
