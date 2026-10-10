import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { evaluateCalc, fillCalcTokens } from "./calculations";
import {
  createAnnotationElement,
  createEmptyComposition,
  createGuideElement,
  createUnitElement,
  type CompositionCalculation,
  type CompositionDefinition,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type LineNode } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

const rows: Record<string, datum>[] = [
  { Date: "2024-01-05", Who: "Ana", Words: 10 },
  { Date: "2024-03-02", Who: "Ana", Words: 30 },
  { Date: "2024-02-10", Who: "Bo", Words: 5 },
  { Date: "2024-02-11", Who: "Bo", Words: 7 },
  { Date: "2024-02-12", Who: "Bo", Words: 9 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) => Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const calc = (patch: Partial<CompositionCalculation>): CompositionCalculation => ({
  id: "c",
  name: "Total",
  aggregation: "count",
  population: "composition",
  filters: "follow",
  ...patch,
});
// Bo's rows only, as one repeat.
const bo = { key: "Bo", allIds: [2, 3, 4], liveIds: [2, 3, 4] };

describe("calculation scope", () => {
  it("keeps population and filter policy separate", () => {
    const filtered = data([0, 2]);
    const boFiltered = { ...bo, liveIds: [2] };
    expect(evaluateCalc(calc({}), filtered).value).toBe(2);
    expect(evaluateCalc(calc({ filters: "ignore" }), filtered).value).toBe(5);
    expect(
      evaluateCalc(calc({ population: "repeat" }), filtered, boFiltered).value
    ).toBe(1);
    expect(
      evaluateCalc(
        calc({ population: "repeat", filters: "ignore" }),
        filtered,
        boFiltered
      ).value
    ).toBe(3);
    // A shared value is not filter-independent unless it says so.
    expect(evaluateCalc(calc({ population: "composition" }), filtered, bo).value).toBe(2);
  });

  it("averages numbers and dates and keeps its rows", () => {
    const words = evaluateCalc(calc({ aggregation: "average", field: "Words" }), data());
    expect(words).toMatchObject({ value: 12.2, kind: "number", text: "12.2" });
    expect(words.rowIds).toEqual(all);
    const latest = evaluateCalc(calc({ aggregation: "max", field: "Date" }), data());
    expect(latest).toMatchObject({ kind: "date", text: "Mar 2, 2024" });
  });

  it("fills page text with calculations by name", () => {
    const definition: CompositionDefinition = {
      ...createEmptyComposition(),
      calculations: [calc({ name: "Messages" })],
    };
    expect(fillCalcTokens("{messages} sent, {Other}", definition, data())).toBe(
      "5 sent, {Other}"
    );
  });
});

function withUnit(): CompositionDefinition {
  const created = createUnitElement(createEmptyComposition(), [
    { name: "Date", dataType: "datetime", uniqueCount: 5 },
  ])!;
  const unit: UnitElement = {
    ...created.element,
    repeat: { ...created.element.repeat, field: "Who" },
  };
  return { ...created.definition, elements: [unit] };
}

describe("guides and annotations", () => {
  it("places a filter-following guide where the filtered rows put it", () => {
    let definition = withUnit();
    const unit = definition.elements[0] as UnitElement;
    definition = {
      ...definition,
      calculations: [calc({ aggregation: "max", field: "Date" })],
      elements: [
        unit,
        {
          ...createGuideElement(definition, unit),
          value: { kind: "calc", calcId: "c" },
          label: "Latest {value}",
        },
      ],
    };
    expect(isCompositionDefinition(definition)).toBe(true);
    const rule = (liveIds: number[]) =>
      resolveComposition(definition, estimateTextWidth, data(liveIds)).nodes.find(
        (node): node is LineNode => node.type === "line"
      )!;
    // March for every row; February once Ana's March message is filtered out.
    expect(rule(all).x1).toBeGreaterThan(rule([0, 2, 3, 4]).x1);
  });

  it("draws a guide per repeat for a per-repeat value", () => {
    let definition = withUnit();
    const unit = definition.elements[0] as UnitElement;
    definition = {
      ...definition,
      calculations: [calc({ aggregation: "min", field: "Date", population: "repeat" })],
      elements: [
        unit,
        { ...createGuideElement(definition, unit), value: { kind: "calc", calcId: "c" } },
      ],
    };
    const scene = resolveComposition(definition, estimateTextWidth, data());
    const lines = scene.nodes.filter((node) => node.type === "line");
    expect(lines.map((line) => line.instanceKey)).toEqual(["Bo", "Ana"]);
  });

  it("follows the largest glyph and reports when it has none", () => {
    let definition = withUnit();
    const unit = definition.elements[0] as UnitElement;
    const note = createAnnotationElement(definition, unit, "Ana");
    definition = { ...definition, elements: [unit, note] };
    const find = (liveIds: number[]) =>
      resolveComposition(definition, estimateTextWidth, data(liveIds)).elements.find(
        (element) => element.id === note.id
      )!.anchor!;
    // Ana's months tie at one message; the first wins.
    expect(find(all).glyph?.bin.label).toBe("Jan 2024");
    expect(find([1]).glyph?.bin.label).toBe("Mar 2024");
    expect(find([2]).missing).toMatch(/No glyph/);
  });
});
