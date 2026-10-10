import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { evaluateCalc } from "./calculations";
import {
  createEmptyComposition,
  createXyUnitElement,
  type CompositionCalculation,
  type CompositionDefinition,
  type PointMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type CircleNode } from "./resolveComposition";
import { repeatSubsets, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Three stocks sampled on four days, in file order that is not date order.
// Ace doubles, Bee halves, and Cee has one day without a price.
const rows: Record<string, datum>[] = [
  { Company: "Ace", Date: "2020-03-01", Observation: 3, Open: 15 },
  { Company: "Ace", Date: "2020-01-01", Observation: 1, Open: 10 },
  { Company: "Ace", Date: "2020-04-01", Observation: 4, Open: 20 },
  { Company: "Ace", Date: "2020-02-01", Observation: 2, Open: 8 },
  { Company: "Bee", Date: "2020-01-01", Observation: 1, Open: 40 },
  { Company: "Bee", Date: "2020-02-01", Observation: 2, Open: 30 },
  { Company: "Bee", Date: "2020-03-01", Observation: 3, Open: 20 },
  { Company: "Cee", Date: "2020-01-01", Observation: 1, Open: null },
  { Company: "Cee", Date: "2020-02-01", Observation: 2, Open: 5 },
  { Company: "Cee", Date: "2020-03-01", Observation: 3, Open: 6 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const change: CompositionCalculation = {
  id: "calc-1",
  name: "Change",
  aggregation: "change",
  field: "Open",
  orderField: "Date",
  population: "repeat",
  filters: "ignore",
};
const subset = (key: string) => {
  const ids = all.filter((id) => rows[id]!.Company === key);
  return { key, allIds: ids, liveIds: ids };
};

describe("ordered calculations", () => {
  it("reads the first and last values by date, not by file order", () => {
    expect(
      evaluateCalc({ ...change, aggregation: "first" }, data(), subset("Ace"))
        .value
    ).toBe(10);
    expect(
      evaluateCalc({ ...change, aggregation: "last" }, data(), subset("Ace"))
        .value
    ).toBe(20);
    // Without an order field, the file order stands.
    expect(
      evaluateCalc(
        { ...change, aggregation: "first", orderField: undefined },
        data(),
        subset("Ace")
      ).value
    ).toBe(15);
  });

  it("reports the change from first to last as a signed percent", () => {
    const ace = evaluateCalc(change, data(), subset("Ace"));
    expect(ace.value).toBe(1);
    expect(ace.text).toBe("+100%");
    const bee = evaluateCalc(change, data(), subset("Bee"));
    expect(bee.text).toBe("-50%");
    // The first readable value counts; a missing opening price is skipped.
    const cee = evaluateCalc(change, data(), subset("Cee"));
    expect(cee.value).toBeCloseTo(0.2);
    expect(
      evaluateCalc(change, data(), { key: "none", allIds: [], liveIds: [] })
        .text
    ).toBe("–");
  });
});

function sparklines(): CompositionDefinition {
  const created = createXyUnitElement(createEmptyComposition(), [
    { name: "Observation", dataType: "numeric", uniqueCount: 4 },
    { name: "Open", dataType: "numeric", uniqueCount: 9 },
  ])!;
  const unit: UnitElement = {
    ...created.element,
    repeat: {
      ...created.element.repeat,
      field: "Company",
      order: "value",
      orderCalcId: "calc-1",
    },
    label: { show: true, width: 120, fontSize: 12, valueCalcId: "calc-1" },
  };
  return { ...created.definition, calculations: [change], elements: [unit] };
}

describe("repeat order by value", () => {
  it("orders repeats by a per-repeat calculation, low first, and flips on request", () => {
    const definition = sparklines();
    const unit = definition.elements[0] as UnitElement;
    expect(
      repeatSubsets(unit, data(), definition).map((item) => item.key)
    ).toEqual(["Bee", "Cee", "Ace"]);
    const flipped = {
      ...unit,
      repeat: { ...unit.repeat, direction: "desc" as const },
    };
    expect(
      repeatSubsets(flipped, data(), definition).map((item) => item.key)
    ).toEqual(["Ace", "Cee", "Bee"]);
    // Without the definition, the value order cannot evaluate; labels stand in.
    expect(repeatSubsets(unit, data()).map((item) => item.key)).toEqual([
      "Ace",
      "Bee",
      "Cee",
    ]);
    expect(isCompositionDefinition(definition)).toBe(true);
  });

  it("keeps the order while filtering, and shows the value beside each label", () => {
    const definition = sparklines();
    const unit = definition.elements[0] as UnitElement;
    // Only Ace's last day passes: its change still reads every row.
    const filtered = repeatSubsets(unit, data([2]), definition);
    expect(filtered.map((item) => item.key)).toEqual(["Bee", "Cee", "Ace"]);
    const scene = resolveComposition(definition, estimateTextWidth, data());
    const values = scene.nodes.filter(
      (node) => node.type === "text" && node.key.endsWith(":value")
    );
    expect(
      values.map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
    ).toEqual(["-50%", "+20%", "+100%"]);
  });
});

describe("point marks that show one row", () => {
  const withShow = (show: PointMark["show"]) => {
    const definition = sparklines();
    const unit = definition.elements[0] as UnitElement;
    const marks = unit.marks.map((mark) =>
      mark.type === "point" ? { ...mark, show } : mark
    );
    const next = { ...definition, elements: [{ ...unit, marks }] };
    return resolveComposition(next, estimateTextWidth, data())
      .nodes.filter(
        (node): node is CircleNode =>
          node.type === "circle" && Boolean(node.glyph)
      )
      .map((node) => [node.instanceKey, node.glyph!.rowIds[0]]);
  };

  it("draws only the lowest, highest, first, or last point of each repeat", () => {
    expect(withShow("max")).toEqual([
      ["Bee", 4],
      ["Cee", 9],
      ["Ace", 2],
    ]);
    expect(withShow("min")).toEqual([
      ["Bee", 6],
      ["Cee", 8],
      ["Ace", 3],
    ]);
    // Cee's first day has no price, so its first drawable point is the second.
    expect(withShow("first")).toEqual([
      ["Bee", 4],
      ["Cee", 8],
      ["Ace", 1],
    ]);
    expect(withShow("last")).toEqual([
      ["Bee", 6],
      ["Cee", 9],
      ["Ace", 2],
    ]);
    expect(withShow("all")).toHaveLength(9);
  });
});
