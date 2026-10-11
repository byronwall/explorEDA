import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  isFocused,
  MUTED_MARK,
  type CompositionDefinition,
  type PathMark,
  type PointMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type CircleNode,
  type PathNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Three countries over three months, as dates. Bo has no March value.
const rows: Record<string, datum>[] = [
  { Country: "Ada", Month: "2020-01-01", Index: 100 },
  { Country: "Ada", Month: "2020-02-01", Index: 102 },
  { Country: "Ada", Month: "2020-03-01", Index: 104 },
  { Country: "Bo", Month: "2020-01-01", Index: 99 },
  { Country: "Bo", Month: "2020-02-01", Index: 97 },
  { Country: "Cy", Month: "2020-01-01", Index: 101 },
  { Country: "Cy", Month: "2020-02-01", Index: 101 },
  { Country: "Cy", Month: "2020-03-01", Index: 103 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const path: PathMark = {
  type: "path",
  id: "mark-1",
  name: "Index",
  xScaleId: "n-1",
  yScaleId: "n-2",
  orderField: "Month",
  stroke: "#c00000",
  strokeWidth: 1.5,
  seriesField: "Country",
  focus: { kind: "repeat" },
  population: "composition",
};
const last: PointMark = {
  type: "point",
  id: "mark-2",
  name: "Latest",
  xScaleId: "n-1",
  yScaleId: "n-2",
  orderField: "Month",
  radius: 3,
  fill: "#c00000",
  labelEvery: 1,
  labelField: "Index",
  show: "last",
  seriesField: "Country",
  focus: { kind: "repeat" },
  population: "composition",
};
function grid(
  marks: (PathMark | PointMark)[] = [path, last],
  repeatField: string | null = "Country"
): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Countries",
    x: 0,
    y: 0,
    frame: { width: 300, height: 100 },
    label: { show: true, width: 0, fontSize: 12 },
    axis: true,
    marks,
    repeat: {
      field: repeatField ?? undefined,
      arrangement: "grid",
      columns: 3,
      gap: 10,
      order: "label",
      limit: 9,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Month",
        field: "Month",
        domain: "shared",
        zero: false,
        nice: false,
      },
      {
        id: "n-2",
        kind: "numeric",
        name: "Index",
        field: "Index",
        domain: "shared",
        zero: false,
        nice: true,
      },
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data());

describe("series paths with a focus", () => {
  it("draws every series in every repeat, the repeat's own in color and on top", () => {
    const definition = grid();
    expect(isCompositionDefinition(definition)).toBe(true);
    const paths = scene(definition).nodes.filter(
      (node): node is PathNode =>
        node.type === "path" && node.instanceKey === "Bo"
    );
    expect(paths.map((node) => [node.path.series, node.path.focused])).toEqual([
      ["Ada", false],
      ["Cy", false],
      ["Bo", true],
    ]);
    expect(paths[2]!.stroke).toBe("#c00000");
    expect(paths[0]!.stroke).toBe(MUTED_MARK);
    expect(paths[0]!.strokeWidth).toBeLessThan(paths[2]!.strokeWidth);
    // Bo's own path stops at February.
    expect(paths[2]!.segments[0]).toHaveLength(2);
  });

  it("focuses listed series across every repeat, and everything without a focus", () => {
    expect(isFocused({ kind: "values", values: "Ada, cy" }, "Cy", "Bo")).toBe(
      true
    );
    expect(isFocused({ kind: "values", values: "Ada" }, "Bo", "Bo")).toBe(
      false
    );
    expect(isFocused(undefined, "Bo", "Ada")).toBe(true);
    expect(isFocused({ kind: "repeat" }, undefined, "Ada")).toBe(true);
    const listed = grid(
      [{ ...path, focus: { kind: "values", values: "Cy" } }],
      null
    );
    const paths = scene(listed).nodes.filter(
      (node): node is PathNode => node.type === "path"
    );
    expect(paths.map((node) => [node.path.series, node.stroke])).toEqual([
      ["Ada", MUTED_MARK],
      ["Bo", MUTED_MARK],
      ["Cy", "#c00000"],
    ]);
  });

  it("picks the last point of each series and labels only the focused one", () => {
    const resolved = scene(grid());
    const ada = resolved.nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" &&
        node.instanceKey === "Ada" &&
        Boolean(node.glyph)
    );
    expect(
      ada.map((node) => [node.glyph!.point!.series, node.glyph!.value])
    ).toEqual([
      ["Bo", 97],
      ["Cy", 103],
      ["Ada", 104],
    ]);
    expect(ada[2]!.fill).toBe("#c00000");
    expect(ada[0]!.fill).toBe(MUTED_MARK);
    const labels = resolved.nodes.filter(
      (node) =>
        node.type === "text" &&
        node.instanceKey === "Ada" &&
        node.key.includes(":mark-2:") &&
        node.key.endsWith(":label")
    );
    expect(
      labels.map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
    ).toEqual(["104"]);
  });
});

describe("dates on numeric scales", () => {
  it("reads a date field as timestamps and labels its ticks as dates", () => {
    const resolved = scene(grid());
    const instance = resolved.elements[0]!.instances![0]!;
    expect(instance.xy!.x.dates).toBe(true);
    expect(instance.xy!.x.domain[0]).toBe(Date.UTC(2020, 0, 1));
    expect(instance.xy!.x.domain[1]).toBe(Date.UTC(2020, 2, 1));
    const ticks = resolved.nodes.filter(
      (node) => node.type === "text" && node.key.includes(":axis:x:")
    );
    expect(ticks.length).toBeGreaterThan(0);
    for (const tick of ticks)
      expect(tick.type === "text" && tick.lines[0]!.text).toMatch(
        /^[A-Z][a-z]{2} \d+$|^[A-Z][a-z]{2} 2020$/
      );
    // Points land where the path's vertices do, by date.
    const circle = resolved.nodes.find(
      (node): node is CircleNode =>
        node.type === "circle" &&
        node.instanceKey === "Ada" &&
        node.glyph?.point?.series === "Ada"
    )!;
    const own = resolved.nodes.find(
      (node): node is PathNode =>
        node.type === "path" &&
        node.instanceKey === "Ada" &&
        node.path.series === "Ada"
    )!;
    const end = own.segments[0]![own.segments[0]!.length - 1]!;
    expect(circle.cx).toBeCloseTo(end.x);
    expect(circle.cy).toBeCloseTo(end.y);
  });
});
