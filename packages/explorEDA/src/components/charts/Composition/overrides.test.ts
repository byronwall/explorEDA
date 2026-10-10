import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { resetOverride, updateOverride } from "./compositionEdits";
import {
  createEmptyComposition,
  createUnitElement,
  type CompositionDefinition,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type RectNode } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

const rows: Record<string, datum>[] = [
  { Date: "2024-01-05", Who: "Ana" },
  { Date: "2024-02-10", Who: "Bo" },
  { Date: "2024-02-11", Who: "Bo" },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) => Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});

function strips(order: "count" | "label"): CompositionDefinition {
  const created = createUnitElement(createEmptyComposition(), [
    { name: "Date", dataType: "datetime", uniqueCount: 3 },
  ])!;
  const unit: UnitElement = {
    ...created.element,
    repeat: { ...created.element.repeat, field: "Who", order },
  };
  return { ...created.definition, elements: [unit] };
}

const instances = (definition: CompositionDefinition, liveIds = all) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds)).elements[0]!
    .instances!;

describe("repeat overrides", () => {
  it("stays with its subset when the order changes", () => {
    // Most rows first puts Bo first; A–Z puts Ana first.
    const byCount = updateOverride(strips("count"), "unit-1", "Ana", {
      dx: 12,
      dy: 4,
    });
    const byLabel: CompositionDefinition = {
      ...byCount,
      elements: [
        {
          ...(byCount.elements[0] as UnitElement),
          repeat: { ...(byCount.elements[0] as UnitElement).repeat, order: "label" },
        },
      ],
    };
    for (const definition of [byCount, byLabel]) {
      const ana = instances(definition).find((item) => item.key === "Ana")!;
      expect(ana.bounds.x - ana.layoutOrigin.x).toBe(12);
      expect(ana.bounds.y - ana.layoutOrigin.y).toBe(4);
      const bo = instances(definition).find((item) => item.key === "Bo")!;
      expect(bo.bounds.x).toBe(bo.layoutOrigin.x);
    }
    expect(instances(byLabel)[0]!.key).toBe("Ana");
    expect(isCompositionDefinition(byLabel)).toBe(true);
  });

  it("recolors only its repeat and survives filtering", () => {
    const definition = updateOverride(strips("count"), "unit-1", "Bo", {
      accent: "#0000ff",
    });
    const fills = (liveIds?: number[]) =>
      resolveComposition(definition, estimateTextWidth, data(liveIds))
        .nodes.filter((node): node is RectNode => node.type === "rect")
        .map((node) => [node.instanceKey, node.fill]);
    const [bo, ana] = fills();
    expect(bo![1]).not.toBe(ana![1]);
    // With Ana filtered out, Bo keeps the accent.
    expect(fills([1, 2])).toEqual([bo]);
  });

  it("drops an override once it changes nothing, and resets on request", () => {
    let definition = updateOverride(strips("count"), "unit-1", "Bo", { dx: 5 });
    expect(definition.overrides).toHaveLength(1);
    definition = updateOverride(definition, "unit-1", "Bo", { dx: 0 });
    expect(definition.overrides).toEqual([]);
    definition = updateOverride(definition, "unit-1", "Bo", { emphasize: true });
    expect(resetOverride(definition, "unit-1", "Bo").overrides).toEqual([]);
  });
});
