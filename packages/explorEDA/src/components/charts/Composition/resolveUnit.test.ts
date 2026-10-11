import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  createUnitElement,
  type CompositionDefinition,
  type StripMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type RectNode } from "./resolveComposition";
import {
  positionBins,
  repeatSubsets,
  resolveUnit,
  valueShare,
  type CompositionData,
} from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two people: Ana writes in January and March, Bo three times in February.
const rows: Record<string, datum>[] = [
  { Date: "2024-01-05", Who: "Ana", Words: 10 },
  { Date: "2024-03-02", Who: "Ana", Words: 30 },
  { Date: "2024-02-10", Who: "Bo", Words: 5 },
  { Date: "2024-02-11", Who: "Bo", Words: 7 },
  { Date: "2024-02-12", Who: "Bo", Words: 9 },
];

function dataFor(liveIds = rows.map((_, id) => id)): CompositionData {
  return {
    allIds: rows.map((_, id) => id),
    liveIds,
    column: (field) =>
      Object.fromEntries(rows.map((row, id) => [id, row[field]])),
  };
}

function build(repeatField?: string): {
  definition: CompositionDefinition;
  unit: UnitElement;
} {
  const created = createUnitElement(createEmptyComposition(), [
    { name: "Date", dataType: "datetime", uniqueCount: 5 },
    { name: "Who", dataType: "categorical", uniqueCount: 2 },
  ])!;
  const unit = {
    ...created.element,
    repeat: { ...created.element.repeat, field: repeatField },
  };
  return {
    definition: { ...created.definition, elements: [unit] },
    unit,
  };
}

const glyphs = (nodes: ReturnType<typeof resolveUnit>["nodes"]) =>
  nodes.filter((node): node is RectNode => node.type === "rect");

describe("chart unit", () => {
  it("creates a month position scale and a count color scale", () => {
    const { definition, unit } = build();
    expect(definition.scales).toMatchObject([
      { kind: "position", field: "Date", interval: "month", domain: "shared" },
      { kind: "value", domain: "shared" },
    ]);
    expect(unit.marks[0]).toMatchObject({
      aggregation: "count",
      encoding: "color",
    });
    expect(isCompositionDefinition(definition)).toBe(true);
  });

  it("lays out every month between the first and last, gaps included", () => {
    const { definition } = build();
    const scale = definition.scales[0]!;
    if (scale.kind !== "position") throw new Error("position scale");
    expect(
      positionBins(scale, dataFor().column("Date"), dataFor().allIds).map(
        (bin) => bin.label
      )
    ).toEqual(["Jan 2024", "Feb 2024", "Mar 2024"]);
  });

  it("repeats by subset, most rows first, keyed by value", () => {
    const { unit } = build("Who");
    expect(
      repeatSubsets(unit, dataFor()).map((subset) => [
        subset.key,
        subset.allIds.length,
      ])
    ).toEqual([
      ["Bo", 3],
      ["Ana", 2],
    ]);
  });

  it("draws one glyph per bin with rows, sharing the value domain", () => {
    const { definition, unit } = build("Who");
    const resolved = resolveUnit(definition, unit, dataFor());
    const drawn = glyphs(resolved.nodes);
    expect(
      drawn.map((node) => [
        node.instanceKey,
        node.glyph!.bin.label,
        node.glyph!.value,
      ])
    ).toEqual([
      ["Bo", "Feb 2024", 3],
      ["Ana", "Jan 2024", 1],
      ["Ana", "Mar 2024", 1],
    ]);
    // A shared domain: Ana's single message is lighter than Bo's three.
    expect(drawn[1]!.fill).not.toBe(drawn[0]!.fill);
    // Every glyph keeps its source rows.
    expect(drawn[0]!.glyph!.rowIds).toEqual([2, 3, 4]);
  });

  it("fits each repeat to its own maximum with a per-unit domain", () => {
    const { definition, unit } = build("Who");
    const perUnit = {
      ...definition,
      scales: definition.scales.map((scale) =>
        scale.kind === "value"
          ? { ...scale, domain: "instance" as const }
          : scale
      ),
    };
    const drawn = glyphs(resolveUnit(perUnit, unit, dataFor()).nodes);
    // Each person's busiest month now reaches the top of the ramp.
    expect(drawn[0]!.fill).toBe(drawn[1]!.fill);
  });

  it("keeps every repeat and the domain when filters remove rows", () => {
    const { definition, unit } = build("Who");
    // Only Ana's January message passes the filters.
    const resolved = resolveUnit(definition, unit, dataFor([0]));
    expect(
      resolved.instances.map((item) => [item.key, item.liveCount])
    ).toEqual([
      ["Bo", 0],
      ["Ana", 1],
    ]);
    const drawn = glyphs(resolved.nodes);
    expect(drawn).toHaveLength(1);
    // The frame still spans January to March.
    expect(drawn[0]!.x).toBeLessThan(unit.x + unit.label.width + 10);
  });

  it("sums a measure per bin", () => {
    const { definition, unit } = build();
    const summed: UnitElement = {
      ...unit,
      marks: [
        {
          ...(unit.marks[0] as StripMark),
          aggregation: "sum",
          measureField: "Words",
        },
      ],
    };
    const drawn = glyphs(
      resolveUnit({ ...definition, elements: [summed] }, summed, dataFor())
        .nodes
    );
    expect(drawn.map((node) => node.glyph!.value)).toEqual([10, 21, 30]);
  });

  it("stacks rows under the unit and selects the whole group", () => {
    const { definition } = build("Who");
    const scene = resolveComposition(definition, estimateTextWidth, dataFor());
    const [element] = scene.elements;
    expect(element!.instances!.map((item) => item.frame.y)).toEqual([
      definition.elements[0]!.y,
      definition.elements[0]!.y + 18 + 6,
    ]);
    expect(element!.bounds.height).toBeGreaterThan(18 * 2 + 6);
  });
});

describe("value scales", () => {
  it("compresses large values with log spacing", () => {
    const scale = {
      id: "v",
      kind: "value" as const,
      name: "v",
      domain: "shared" as const,
      colors: ["#fff", "#000"] as [string, string],
    };
    expect(valueShare({ ...scale, transform: "linear" }, 10, 100)).toBe(0.1);
    expect(valueShare({ ...scale, transform: "log" }, 10, 100)).toBeGreaterThan(
      0.4
    );
    expect(valueShare({ ...scale, transform: "sqrt" }, 0, 100)).toBe(0);
  });
});
