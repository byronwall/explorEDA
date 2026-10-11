import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  createInset,
  type CompositionDefinition,
  type PathMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type PathNode,
  type RectNode,
} from "./resolveComposition";
import { repeatSubsets, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two regions over six weeks, plus a national series marked US.
const weeks = [
  "2020-01-06",
  "2020-01-13",
  "2020-01-20",
  "2020-01-27",
  "2020-02-03",
  "2020-02-10",
];
const rows: Record<string, datum>[] = [];
for (const [region, rates] of [
  ["Ada", [1, 2, 3, 4, 5, 6]],
  ["Bo", [6, 5, 4, 3, 2, 1]],
  ["US", [3, 3, 3, 3, 3, 3]],
] as const)
  weeks.forEach((week, index) =>
    rows.push({ Region: region, Week: week, Rate: rates[index]! })
  );
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const own: PathMark = {
  type: "path",
  id: "mark-1",
  name: "Recent",
  xScaleId: "n-1",
  yScaleId: "n-2",
  orderField: "Week",
  stroke: "#c00",
  strokeWidth: 1.5,
};
function compound(): CompositionDefinition {
  const base: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Regions",
    x: 0,
    y: 0,
    frame: { width: 400, height: 200 },
    label: { show: false, width: 0, fontSize: 12 },
    axis: false,
    marks: [own],
    repeat: {
      field: "Region",
      arrangement: "columns",
      columns: 2,
      gap: 20,
      order: "label",
      limit: 10,
      skip: "US",
    },
    // The main frame shows the last three weeks only.
    window: { field: "Week", min: "2020-01-27" },
  };
  const inset = createInset(base);
  const unit: UnitElement = {
    ...base,
    insets: [{ ...inset, name: "All weeks", axis: true }],
    marks: [
      own,
      {
        ...own,
        id: "mark-2",
        name: "History",
        frameId: inset.id,
        stroke: "#999",
      },
      {
        ...own,
        id: "mark-3",
        name: "National",
        frameId: inset.id,
        stroke: "#000",
        population: "composition",
        seriesField: "Region",
        focus: { kind: "values", values: "US" },
      },
    ],
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Week",
        field: "Week",
        domain: "shared",
        zero: false,
        nice: false,
      },
      {
        id: "n-2",
        kind: "numeric",
        name: "Rate",
        field: "Rate",
        domain: "shared",
        zero: true,
        nice: false,
      },
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data());

describe("display windows", () => {
  it("draws only the window's rows in the main frame and spans the window on its field", () => {
    const definition = compound();
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = scene(definition);
    const instance = resolved.elements[0]!.instances!.find(
      (item) => item.key === "Ada"
    )!;
    const recent = resolved.nodes.find(
      (node): node is PathNode =>
        node.type === "path" &&
        node.instanceKey === "Ada" &&
        node.path.markId === "mark-1"
    )!;
    expect(recent.segments[0]).toHaveLength(3);
    expect(recent.path.rowIds).toHaveLength(3);
    // The x domain starts at the window's lower bound and the frame clips.
    expect(instance.xy!.x.domain[0]).toBe(Date.UTC(2020, 0, 27));
    expect(recent.segments[0]![0]!.x).toBeCloseTo(instance.frame.x);
    expect(recent.clip).toEqual(instance.frame);
  });

  it("leaves skipped subsets out of the repeats but keeps their rows for comparison marks", () => {
    const definition = compound();
    const unit = definition.elements[0] as UnitElement;
    expect(repeatSubsets(unit, data()).map((item) => item.key)).toEqual([
      "Ada",
      "Bo",
    ]);
    const national = scene(definition).nodes.filter(
      (node): node is PathNode =>
        node.type === "path" &&
        node.path.markId === "mark-3" &&
        Boolean(node.path.focused)
    );
    expect(national.map((node) => node.path.series)).toEqual(["US", "US"]);
  });
});

describe("inset frames", () => {
  it("draws the inset's paper and its marks inside the main frame with the full history", () => {
    const definition = compound();
    const unit = definition.elements[0] as UnitElement;
    const inset = unit.insets![0]!;
    const resolved = scene(definition);
    const instance = resolved.elements[0]!.instances!.find(
      (item) => item.key === "Bo"
    )!;
    const paper = resolved.nodes.find(
      (node): node is RectNode =>
        node.type === "rect" &&
        node.key.endsWith(`${inset.id}:paper`) &&
        node.instanceKey === "Bo"
    )!;
    expect(paper.x).toBe(instance.frame.x + inset.x);
    expect(paper.width).toBe(inset.width);
    expect(paper.stroke).toBeDefined();
    const history = resolved.nodes.find(
      (node): node is PathNode =>
        node.type === "path" &&
        node.instanceKey === "Bo" &&
        node.path.markId === "mark-2"
    )!;
    // All six weeks, inside the inset's box, drawn after the main frame's path.
    expect(history.segments[0]).toHaveLength(6);
    for (const vertex of history.segments[0]!) {
      expect(vertex.x).toBeGreaterThanOrEqual(paper.x - 0.01);
      expect(vertex.x).toBeLessThanOrEqual(paper.x + paper.width + 0.01);
      expect(vertex.y).toBeGreaterThanOrEqual(paper.y - 0.01);
    }
    const order = resolved.nodes.map((node) => node.key);
    expect(order.indexOf(history.key)).toBeGreaterThan(
      order.indexOf(`unit-1:Bo:mark-1`)
    );
    // The inset labels its own axes at a smaller size.
    const ticks = resolved.nodes.filter(
      (node) => node.type === "text" && node.key.includes(`:${inset.id}:axis:`)
    );
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]!.type === "text" && ticks[0]!.fontSize).toBe(8);
  });

  it("rejects an inset without a size and a repeat skip that is not text", () => {
    const definition = compound();
    const unit = definition.elements[0] as UnitElement;
    const bad = {
      ...definition,
      elements: [{ ...unit, insets: [{ ...unit.insets![0]!, width: 0 }] }],
    };
    expect(isCompositionDefinition(bad)).toBe(false);
  });
});
