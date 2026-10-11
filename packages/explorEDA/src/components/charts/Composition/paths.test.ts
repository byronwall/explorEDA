import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { convertMark } from "./compositionEdits";
import {
  createEmptyComposition,
  createUnitElement,
  createXyUnitElement,
  normalizeComposition,
  type AnnotationElement,
  type CompositionDefinition,
  type GuideElement,
  type NumericScale,
  type PathMark,
  type PointMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type CircleNode,
  type LineNode,
  type PathNode,
} from "./resolveComposition";
import { numericDomain, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Years out of file order, miles that fall back in 2008, a year with no gas
// price, and a row with no year at all.
const rows: Record<string, datum>[] = [
  { Year: 2008, Miles: 9880, Gas: 3.31, Group: "a" },
  { Year: 1956, Miles: 3675, Gas: 2.38, Group: "a" },
  { Year: 2010, Miles: 9596, Gas: 2.61, Group: "a" },
  { Year: 1980, Miles: 7000, Gas: null, Group: "a" },
  { Year: 2009, Miles: 9657, Gas: 2.38, Group: "a" },
  { Year: null, Miles: 5000, Gas: 2, Group: "a" },
  { Year: 1970, Miles: 5500, Gas: 1.8, Group: "b" },
  { Year: 1971, Miles: 5600, Gas: 1.7, Group: "b" },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const FIELDS = [
  { name: "Year", dataType: "numeric" as const, uniqueCount: 7 },
  { name: "Miles", dataType: "numeric" as const, uniqueCount: 8 },
  { name: "Gas", dataType: "numeric" as const, uniqueCount: 7 },
  { name: "Group", dataType: "categorical" as const, uniqueCount: 2 },
];

function driving(repeatField?: string) {
  const created = createXyUnitElement(createEmptyComposition(), FIELDS)!;
  const unit: UnitElement = {
    ...created.element,
    repeat: { ...created.element.repeat, field: repeatField },
  };
  return { ...created.definition, elements: [unit] };
}

const scene = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds));
const paths = (definition: CompositionDefinition, liveIds?: number[]) =>
  scene(definition, liveIds).nodes.filter(
    (node): node is PathNode => node.type === "path"
  );
const points = (definition: CompositionDefinition, liveIds?: number[]) =>
  scene(definition, liveIds).nodes.filter(
    (node): node is CircleNode => node.type === "circle" && Boolean(node.glyph)
  );

describe("x–y unit", () => {
  it("takes year as the order and the next two numeric fields as x and y", () => {
    const definition = driving();
    const unit = definition.elements[0] as UnitElement;
    const [path, point] = unit.marks as [PathMark, PointMark];
    expect(path).toMatchObject({ type: "path", orderField: "Year" });
    expect(point).toMatchObject({ type: "point", labelField: "Year" });
    const scales = definition.scales as NumericScale[];
    expect(scales.map((scale) => [scale.kind, scale.field])).toEqual([
      ["numeric", "Miles"],
      ["numeric", "Gas"],
    ]);
    expect(isCompositionDefinition(definition)).toBe(true);
  });

  it("orders the path by year, not by file order or x, and breaks at a missing value", () => {
    const [path] = paths(driving());
    // 1980 has no gas price and one row has no year: both skipped, one gap.
    expect(path!.path.skipped).toEqual([3, 5]);
    expect(path!.path.segments).toBe(2);
    expect(
      path!.segments.map((run) => run.map((vertex) => vertex.rowId))
    ).toEqual([
      [1, 6, 7],
      [0, 4, 2],
    ]);
    // Miles reverse after 2008, so the path turns back on x.
    const [a, b, c] = path!.segments[1]!;
    expect(b!.x).toBeLessThan(a!.x);
    expect(c!.x).toBeLessThan(b!.x);
    // Ordered rows include the skipped ones, so inspection can list them.
    expect(path!.path.rowIds).toEqual([1, 6, 7, 3, 0, 4, 2, 5]);
  });

  it("puts a point and its path vertex on the same spot, also with fixed limits", () => {
    const definition = driving();
    const check = (current: CompositionDefinition) => {
      const [path] = paths(current);
      const vertices = new Map(
        path!.segments.flat().map((vertex) => [vertex.rowId, vertex])
      );
      for (const point of points(current)) {
        const vertex = vertices.get(point.glyph!.rowIds[0]!);
        if (!vertex) continue;
        expect(point.cx).toBeCloseTo(vertex.x);
        expect(point.cy).toBeCloseTo(vertex.y);
      }
    };
    check(definition);
    // Fixing the x limits changes every position; both marks follow, and clip.
    const fixed: CompositionDefinition = {
      ...definition,
      scales: definition.scales.map((scale) =>
        scale.kind === "numeric" && scale.field === "Miles"
          ? { ...scale, min: 4000, max: 9000 }
          : scale
      ),
    };
    check(fixed);
    const unit = scene(fixed).elements[0]!;
    expect(paths(fixed)[0]!.clip).toEqual(unit.instances![0]!.frame);
    expect(points(definition)[0]!.clip).toBeUndefined();
  });

  it("labels every nth point in order and reads coordinates into the glyph", () => {
    const definition = driving();
    const unit = definition.elements[0] as UnitElement;
    const labeled: CompositionDefinition = {
      ...definition,
      elements: [
        {
          ...unit,
          marks: unit.marks.map((mark) =>
            mark.type === "point" ? { ...mark, labelEvery: 3 } : mark
          ),
        },
      ],
    };
    const texts = scene(labeled).nodes.filter(
      (node) => node.type === "text" && node.key.endsWith(":label")
    );
    // Drawn points in order: 1956, 1970, 1971, 2008, 2009, 2010. The year
    // without a gas price is not drawn, so it is not counted, and the row
    // without a year has nothing to say.
    expect(
      texts.map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
    ).toEqual(["1956", "2008"]);
    const first = points(labeled).find((node) => node.glyph!.rowIds[0] === 1)!;
    expect(first.glyph!.point).toEqual({
      x: 3675,
      y: 2.38,
      xField: "Miles",
      yField: "Gas",
    });
    expect(first.glyph!.bin.label).toBe("1956");
  });

  it("keeps a shared domain across repeats and fits each with a per-unit domain", () => {
    const definition = driving("Group");
    const byGroup = (current: CompositionDefinition) => {
      const drawn = points(current);
      return {
        a: drawn.filter((node) => node.instanceKey === "a"),
        b: drawn.filter((node) => node.instanceKey === "b"),
      };
    };
    const shared = byGroup(definition);
    const frames = scene(definition).elements[0]!.instances!;
    // Group b's miles sit in the lower half of a shared 0–10,000 span.
    const bFrame = frames.find((item) => item.key === "b")!.frame;
    expect(Math.max(...shared.b.map((node) => node.cx))).toBeLessThan(
      bFrame.x + bFrame.width * 0.6
    );
    const perUnit: CompositionDefinition = {
      ...definition,
      scales: definition.scales.map((scale) => ({
        ...scale,
        domain: "instance",
      })),
    };
    const fitted = byGroup(perUnit);
    expect(Math.max(...fitted.b.map((node) => node.cx))).toBeGreaterThan(
      bFrame.x + bFrame.width * 0.9
    );
  });

  it("places a numeric guide at a calculated x and an annotation at a chosen year", () => {
    const base = driving();
    const unit = base.elements[0] as UnitElement;
    const guide: GuideElement = {
      id: "guide-1",
      kind: "guide",
      name: "Average",
      x: 0,
      y: 0,
      unitId: unit.id,
      value: { kind: "calc", calcId: "calc-1" },
      label: "Average {value} miles",
      color: "#000",
    };
    const note: AnnotationElement = {
      id: "note-1",
      kind: "annotation",
      name: "Peak",
      x: 10,
      y: -10,
      text: "{label}: {x} miles at ${y}",
      anchor: {
        kind: "data",
        unitId: unit.id,
        instanceKey: "all",
        markId: "mark-2",
        pick: "at",
        at: "2008",
      },
      fontSize: 12,
      color: "#000",
      leader: true,
    };
    const definition: CompositionDefinition = {
      ...base,
      elements: [unit, guide, note],
      calculations: [
        {
          id: "calc-1",
          name: "Average miles",
          aggregation: "average",
          field: "Miles",
          population: "composition",
          filters: "ignore",
        },
      ],
    };
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = scene(definition);
    const rule = resolved.nodes.find(
      (node): node is LineNode =>
        node.type === "line" && node.elementId === "guide-1"
    )!;
    const frame = resolved.elements[0]!.instances![0]!.frame;
    expect(rule.x1).toBeGreaterThan(frame.x);
    expect(rule.x1).toBeLessThan(frame.x + frame.width);
    const peak = resolved.elements.find((element) => element.id === "note-1")!;
    expect(peak.anchor!.glyph!.rowIds).toEqual([0]);
    const text = resolved.nodes.find(
      (node) => node.type === "text" && node.elementId === "note-1"
    );
    expect(text?.type === "text" && text.lines[0]!.text).toBe(
      "2008: 9,880 miles at $3.3"
    );
    // Filtering 2008 out reports the missing anchor instead of moving it.
    const hidden = scene(definition, [1, 2, 4]).elements.find(
      (element) => element.id === "note-1"
    )!;
    expect(hidden.anchor!.missing).toContain("2008");
  });
});

describe("numeric domains", () => {
  const scale: NumericScale = {
    id: "n",
    kind: "numeric",
    name: "n",
    field: "v",
    domain: "shared",
    zero: false,
    nice: false,
  };
  const column = { 0: 12, 1: 48, 2: null, 3: "oops" };
  it("spans the finite values, then applies zero, nice, and fixed limits", () => {
    expect(numericDomain(scale, column, [0, 1, 2, 3])).toEqual([12, 48]);
    expect(numericDomain({ ...scale, zero: true }, column, [0, 1])).toEqual([
      0, 48,
    ]);
    expect(numericDomain({ ...scale, nice: true }, column, [0, 1])).toEqual([
      10, 50,
    ]);
    expect(
      numericDomain({ ...scale, min: 0, max: 100 }, column, [0, 1])
    ).toEqual([0, 100]);
    // One value still gets a span; no values span 0–1.
    expect(numericDomain(scale, column, [0])).toEqual([10.8, 13.2]);
    expect(numericDomain(scale, column, [2, 3])).toEqual([0, 1]);
  });
});

describe("mark types", () => {
  it("fills the strip type into marks saved before mark types existed", () => {
    const created = createUnitElement(createEmptyComposition(), [
      { name: "Year", dataType: "numeric", uniqueCount: 7 },
    ])!;
    const unit = created.element;
    const legacy = {
      ...created.definition,
      elements: [
        {
          ...unit,
          marks: unit.marks.map(({ type: _type, ...mark }) => mark),
        },
      ],
    } as unknown as CompositionDefinition;
    expect(isCompositionDefinition(legacy)).toBe(true);
    const normalized = normalizeComposition(legacy);
    expect((normalized.elements[0] as UnitElement).marks[0]!.type).toBe(
      "strip"
    );
  });

  it("converts a strip to a path by adding the numeric scales it needs", () => {
    const created = createUnitElement(createEmptyComposition(), FIELDS)!;
    const unit = { ...created.element, repeat: { ...created.element.repeat } };
    const definition = { ...created.definition, elements: [unit] };
    const converted = convertMark(definition, unit, "mark-1", "path", FIELDS);
    const mark = (converted.elements[0] as UnitElement).marks[0] as PathMark;
    expect(mark).toMatchObject({ type: "path", orderField: "Year" });
    expect(
      converted.scales.filter((scale) => scale.kind === "numeric")
    ).toHaveLength(2);
    expect(isCompositionDefinition(converted)).toBe(true);
    // Back to a strip reuses the position and value scales still on the page.
    const back = convertMark(
      converted,
      converted.elements[0] as UnitElement,
      "mark-1",
      "strip",
      FIELDS
    );
    expect((back.elements[0] as UnitElement).marks[0]!.type).toBe("strip");
    expect(back.scales).toHaveLength(4);
  });

  it("rejects a point mark bound to a position scale", () => {
    const definition = driving();
    const unit = definition.elements[0] as UnitElement;
    const wrong = {
      ...definition,
      scales: [
        ...definition.scales,
        {
          id: "x-1",
          kind: "position",
          name: "p",
          field: "Year",
          domain: "shared",
        },
      ],
      elements: [
        {
          ...unit,
          marks: unit.marks.map((mark) =>
            mark.type === "point" ? { ...mark, xScaleId: "x-1" } : mark
          ),
        },
      ],
    };
    expect(isCompositionDefinition(wrong)).toBe(false);
  });
});
