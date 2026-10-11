import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  isXyMark,
  type CompositionDefinition,
  type SpanMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type RectNode,
  type TextNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two seats; one justice still serving, one row with no start.
const rows: Record<string, datum>[] = [
  {
    Seat: "A",
    Name: "Ada",
    Start: "2000-01-01",
    End: "2010-01-01",
    Party: "Blue",
  },
  { Seat: "A", Name: "Bo", Start: "2010-01-01", End: null, Party: "Red" },
  {
    Seat: "B",
    Name: "Cy",
    Start: "2005-01-01",
    End: "2020-01-01",
    Party: "Blue",
  },
  { Seat: "B", Name: "Di", Start: null, End: "2001-01-01", Party: "Red" },
];
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const spans: SpanMark = {
  type: "span",
  id: "mark-1",
  name: "Terms",
  xScaleId: "n-1",
  startField: "Start",
  endField: "End",
  openEnd: true,
  fill: "#000",
  colorField: "Party",
  colors: ["#00f", "#f00"],
  labelField: "Name",
  labelMinWidth: 40,
  inset: 2,
};
function timeline(patch: Partial<SpanMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Seats",
    x: 0,
    y: 0,
    frame: { width: 200, height: 20 },
    label: { show: true, width: 40, fontSize: 10 },
    axis: true,
    marks: [{ ...spans, ...patch }],
    repeat: {
      field: "Seat",
      arrangement: "rows",
      columns: 1,
      gap: 0,
      order: "label",
      limit: 10,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Term",
        field: "Start",
        domain: "shared",
        zero: false,
        nice: false,
      },
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data());
const rects = (definition: CompositionDefinition) =>
  scene(definition).nodes.filter(
    (node): node is RectNode => node.type === "rect" && Boolean(node.glyph)
  );

describe("span marks", () => {
  it("draws each row from its start to its end on an x axis that covers both", () => {
    const definition = timeline();
    expect(isCompositionDefinition(definition)).toBe(true);
    expect(isXyMark(spans)).toBe(true);
    const resolved = scene(definition);
    const instance = resolved.elements[0]!.instances![0]!;
    // The domain runs from the earliest start to the latest end, not the latest start.
    expect(instance.xy!.x.domain).toEqual([
      Date.UTC(2000, 0, 1),
      Date.UTC(2020, 0, 1),
    ]);
    const drawn = rects(definition);
    const ada = drawn.find((node) => node.glyph!.bin.label === "Ada")!;
    expect(ada.x).toBeCloseTo(40);
    expect(ada.width).toBeCloseTo(100, 0);
    expect(ada.height).toBe(16);
    expect(ada.fill).toBe("#00f");
    expect(ada.glyph!.span).toMatchObject({ open: false, category: "Blue" });
    // Bo has no end: the span runs to the frame's right edge.
    const bo = drawn.find((node) => node.glyph!.bin.label === "Bo")!;
    expect(bo.x + bo.width).toBeCloseTo(240);
    expect(bo.glyph!.span!.open).toBe(true);
    // Di has no start and draws nothing.
    expect(drawn.map((node) => node.glyph!.bin.label).sort()).toEqual([
      "Ada",
      "Bo",
      "Cy",
    ]);
  });

  it("labels spans wide enough and clips the label to the span", () => {
    const labels = scene(timeline()).nodes.filter(
      (node): node is TextNode =>
        node.type === "text" && node.key.includes(":mark-1:")
    );
    expect(labels.map((node) => node.lines[0]!.text).sort()).toEqual([
      "Ada",
      "Bo",
      "Cy",
    ]);
    expect(labels[0]!.clip).toBeDefined();
    const narrow = scene(timeline({ labelMinWidth: 140 })).nodes.filter(
      (node) => node.type === "text" && node.key.includes(":mark-1:")
    );
    expect(narrow).toHaveLength(1);
  });

  it("leaves open-ended rows out when ends are required", () => {
    const drawn = rects(timeline({ openEnd: false }));
    expect(drawn.map((node) => node.glyph!.bin.label).sort()).toEqual([
      "Ada",
      "Cy",
    ]);
  });
});
