import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { convertMark } from "./compositionEdits";
import {
  createEmptyComposition,
  createUnitElement,
  STACK_COLORS,
  type CompositionDefinition,
  type StackMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type RectNode } from "./resolveComposition";
import { inkOn, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two sources. Deaths: cancer 3, heart 2 (so 60% and 40%). Press: heart 1,
// terror 4, cancer 0 rows. A third source has no rows at all once filtered.
const rows: Record<string, datum>[] = [
  { Source: "Deaths", Cause: "Cancer", Count: 3 },
  { Source: "Deaths", Cause: "Heart", Count: 2 },
  { Source: "Press", Cause: "Heart", Count: 1 },
  { Source: "Press", Cause: "Terror", Count: 4 },
  { Source: "Radio", Cause: "Terror", Count: 1 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const stack: StackMark = {
  type: "stack",
  id: "mark-1",
  name: "Shares",
  categoryField: "Cause",
  aggregation: "sum",
  measureField: "Count",
  normalize: true,
  order: "total",
  colors: ["#111111", "#222222", "#333333"],
  labelMinHeight: 10,
  inset: 0,
};
function columns(patch: Partial<StackMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Sources",
    x: 10,
    y: 10,
    frame: { width: 60, height: 200 },
    label: { show: true, width: 0, fontSize: 12 },
    axis: true,
    marks: [{ ...stack, ...patch }],
    repeat: {
      field: "Source",
      arrangement: "columns",
      columns: 3,
      gap: 20,
      order: "label",
      limit: 24,
    },
  };
  return { ...createEmptyComposition(), elements: [unit] };
}
const segments = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds)).nodes.filter(
    (node): node is RectNode =>
      node.type === "rect" && Boolean(node.glyph?.stack)
  );

describe("stack marks", () => {
  it("stacks shares of each repeat's total to 100%, in a graphic-wide order", () => {
    const definition = columns();
    expect(isCompositionDefinition(definition)).toBe(true);
    const deaths = segments(definition).filter(
      (node) => node.instanceKey === "Deaths"
    );
    // Terror has the largest total (5), then cancer (3), then heart (3; A–Z breaks the tie).
    expect(
      deaths.map((node) => [node.glyph!.bin.key, node.glyph!.value])
    ).toEqual([
      ["Cancer", 0.6],
      ["Heart", 0.4],
    ]);
    expect(deaths[0]!.glyph!.stack).toMatchObject({
      count: 3,
      total: 5,
      lower: 0,
      upper: 0.6,
    });
    expect(deaths[1]!.glyph!.stack).toMatchObject({ lower: 0.6, upper: 1 });
    // The first category sits at the bottom of the frame and the column fills it.
    const frame = resolveComposition(definition, estimateTextWidth, data())
      .elements[0]!.instances![0]!.frame;
    expect(deaths[0]!.y + deaths[0]!.height).toBeCloseTo(
      frame.y + frame.height
    );
    expect(deaths[1]!.y).toBeCloseTo(frame.y);
    expect(deaths[0]!.height + deaths[1]!.height).toBeCloseTo(frame.height);
  });

  it("keeps one color per category across repeats and lists every contributor", () => {
    const drawn = segments(columns());
    const color = (key: string, cause: string) =>
      drawn.find(
        (node) => node.instanceKey === key && node.glyph!.bin.key === cause
      )!.fill;
    expect(color("Deaths", "Heart")).toBe(color("Press", "Heart"));
    expect(color("Press", "Terror")).toBe("#111111");
    const press = drawn.find(
      (node) => node.instanceKey === "Press" && node.glyph!.bin.key === "Heart"
    )!;
    expect(press.glyph!.stack!.contributors).toEqual([
      { category: "Terror", count: 4 },
      { category: "Heart", count: 1 },
    ]);
    expect(press.glyph!.value).toBe(0.2);
  });

  it("recomputes the denominator from the filtered population and leaves an empty repeat blank", () => {
    // Filter out Deaths' heart rows: cancer becomes 100% of the Deaths column.
    const filtered = segments(columns(), [0, 2, 3]);
    const deaths = filtered.filter((node) => node.instanceKey === "Deaths");
    expect(deaths).toHaveLength(1);
    expect(deaths[0]!.glyph!.value).toBe(1);
    expect(deaths[0]!.glyph!.stack!.total).toBe(3);
    // Radio has no live rows: no segments, no invented shares.
    expect(
      filtered.filter((node) => node.instanceKey === "Radio")
    ).toHaveLength(0);
    // The order and colors still come from every row, so Terror stays first.
    const press = filtered.filter((node) => node.instanceKey === "Press");
    expect(press[0]!.glyph!.bin.key).toBe("Terror");
  });

  it("scales column heights by total when not normalized", () => {
    const drawn = segments(columns({ normalize: false }));
    const height = (key: string) =>
      drawn
        .filter((node) => node.instanceKey === key)
        .reduce((sum, node) => sum + node.height, 0);
    // Deaths and Press both total 5; Radio totals 1.
    expect(height("Deaths")).toBeCloseTo(200);
    expect(height("Press")).toBeCloseTo(200);
    expect(height("Radio")).toBeCloseTo(40);
  });

  it("labels segments tall enough to hold their category and share", () => {
    const scene = resolveComposition(
      columns({ labelMinHeight: 100 }),
      estimateTextWidth,
      data()
    );
    const labels = scene.nodes.filter(
      (node) =>
        node.type === "text" &&
        node.key.includes(":mark-1:") &&
        node.key.endsWith(":label")
    );
    // Deaths' cancer (120 px), Press' terror (160 px), and Radio's terror
    // (200 px) pass 100 px; the smaller segments stay unlabeled.
    expect(
      labels.map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
    ).toEqual(["Cancer 60%", "Terror 80%", "Terror 100%"]);
  });

  it("converts a strip to a stack with the data's category field and palette", () => {
    const created = createUnitElement(createEmptyComposition(), [
      { name: "Source", dataType: "categorical", uniqueCount: 3 },
      { name: "Cause", dataType: "categorical", uniqueCount: 3 },
      { name: "Count", dataType: "numeric", uniqueCount: 4 },
    ])!;
    const definition = { ...created.definition, elements: [created.element] };
    const converted = convertMark(
      definition,
      created.element,
      "mark-1",
      "stack",
      [
        { name: "Source", dataType: "categorical", uniqueCount: 3 },
        { name: "Cause", dataType: "categorical", uniqueCount: 3 },
        { name: "Count", dataType: "numeric", uniqueCount: 4 },
      ]
    );
    const mark = (converted.elements[0] as UnitElement).marks[0] as StackMark;
    expect(mark).toMatchObject({
      type: "stack",
      categoryField: "Source",
      aggregation: "sum",
      measureField: "Count",
    });
    expect(mark.colors).toBe(STACK_COLORS);
    expect(isCompositionDefinition(converted)).toBe(true);
  });
});

describe("stacks across bars", () => {
  it("runs segments left to right in first-seen order, joined row to row", () => {
    const base = columns({
      order: "first",
      direction: "across",
      connect: true,
      labelContent: "share",
      texture: "hand",
    });
    const unit = base.elements[0] as UnitElement;
    const definition: CompositionDefinition = {
      ...base,
      elements: [
        {
          ...unit,
          frame: { width: 200, height: 20 },
          repeat: { ...unit.repeat, arrangement: "rows", gap: 30 },
        },
      ],
    };
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = resolveComposition(definition, estimateTextWidth, data());
    const deaths = resolved.nodes.filter(
      (node): node is RectNode =>
        node.type === "rect" &&
        node.instanceKey === "Deaths" &&
        Boolean(node.glyph?.stack)
    );
    // Cancer appears first in the rows, so it leads even with a smaller total.
    expect(deaths.map((node) => node.glyph!.bin.key)).toEqual([
      "Cancer",
      "Heart",
    ]);
    const frame = resolved.elements[0]!.instances![0]!.frame;
    expect(deaths[0]!.x).toBe(frame.x);
    expect(deaths[0]!.width).toBeCloseTo(120);
    expect(deaths[1]!.x).toBeCloseTo(frame.x + 120);
    expect(deaths[0]!.height).toBe(20);
    expect(deaths[0]!.texture).toBe("hand");
    const label = resolved.nodes.find(
      (node) =>
        node.type === "text" && node.key === "unit-1:Deaths:mark-1:Cancer:label"
    );
    expect(label?.type === "text" && label.lines[0]!.text).toBe("60%");
    // No category but the last is shared by neighboring rows here.
    expect(
      resolved.nodes.some(
        (node) => node.type === "line" && node.key.endsWith(":connector")
      )
    ).toBe(false);
  });

  it("joins each shared category's edge from one row to the next", () => {
    const shares: Record<string, datum>[] = [
      { Class: "A", Item: "Rent", Share: 20 },
      { Class: "A", Item: "Food", Share: 80 },
      { Class: "B", Item: "Rent", Share: 50 },
      { Class: "B", Item: "Food", Share: 50 },
    ];
    const ids = shares.map((_, id) => id);
    const definition: CompositionDefinition = {
      ...createEmptyComposition(),
      elements: [
        {
          id: "unit-1",
          kind: "unit",
          name: "Classes",
          x: 0,
          y: 0,
          frame: { width: 100, height: 10 },
          label: { show: false, width: 0, fontSize: 12 },
          axis: false,
          marks: [
            {
              ...stack,
              categoryField: "Item",
              measureField: "Share",
              order: "first",
              direction: "across",
              connect: true,
            },
          ],
          repeat: {
            field: "Class",
            arrangement: "rows",
            columns: 1,
            gap: 20,
            order: "label",
            limit: 24,
          },
        },
      ],
    };
    const [connector, ...rest] = resolveComposition(
      definition,
      estimateTextWidth,
      {
        allIds: ids,
        liveIds: ids,
        column: (field) =>
          Object.fromEntries(shares.map((row, id) => [id, row[field]])),
      }
    ).nodes.filter(
      (node) => node.type === "line" && node.key.endsWith(":connector")
    );
    expect(rest).toHaveLength(0);
    // From the end of A's rent at its bottom to the end of B's rent at its top.
    expect(connector).toMatchObject({ x1: 20, y1: 10, x2: 50, y2: 30 });
  });
});

describe("label ink", () => {
  it("writes dark ink on light fills and white on dark ones, without a halo", () => {
    expect(inkOn("#edc948")).toEqual({ fill: "#1f2328" });
    expect(inkOn("#4e79a7")).toEqual({ fill: "#ffffff" });
    expect(inkOn("#fff")).toEqual({ fill: "#1f2328" });
    // A named color keeps ink on a white halo.
    expect(inkOn("teal")).toEqual({ fill: "#1f2328", halo: "#ffffff" });
  });
});
