import { describe, expect, it } from "vitest";
import { calculateGroupedAggregate } from "@/lib/aggregates";
import { planAggregateBars } from "./barPlanner";

describe("planAggregateBars", () => {
  it("keeps aggregate contributors and maps positive and negative values to bars", () => {
    const result = calculateGroupedAggregate(
      [
        { __ID: 1, group: "Z", amount: 6 },
        { __ID: 2, group: "Z", amount: "bad" },
        { __ID: 3, group: "A", amount: -2 },
      ],
      {
        id: "sales",
        name: "Sales",
        groupField: "group",
        measureField: "amount",
        aggregation: "sum",
      },
      { 2: "bad" }
    );
    const plan = planAggregateBars({
      rows: result.rows,
      width: 400,
      height: 240,
      margin: { top: 20, right: 20, bottom: 30, left: 60 },
      colorScaleId: "groups",
      getColor: (value) => (value === "Z" ? "red" : "blue"),
    });

    expect(result.rows[0]?.contributors).toEqual([
      expect.objectContaining({ sourceId: 1, included: true }),
      expect.objectContaining({
        sourceId: 2,
        included: false,
        exclusionReason: "Not a finite number",
      }),
    ]);
    expect(plan.domainValues).toEqual([
      { rowId: 'sales:["string","Z"]', value: 6 },
      { rowId: 'sales:["string","A"]', value: -2 },
    ]);
    expect(plan.groupOrder).toEqual(["Z", "A"]);
    expect(plan.yScale.domain).toEqual([-2.8, 6.8]);
    expect(plan.domainSetters.lower).toEqual({
      source: "aggregate",
      rowId: 'sales:["string","A"]',
      value: -2,
    });
    expect(plan.domainSetters.upper).toEqual({
      source: "aggregate",
      rowId: 'sales:["string","Z"]',
      value: 6,
    });
    expect(plan.zeroBaseline).toBeCloseTo(134.5833333333, 10);
    expect(plan.bars[0]!.x).toBeCloseTo(41.7391304348, 10);
    expect(plan.bars[0]!.y).toBeCloseTo(15.8333333333, 10);
    expect(plan.bars[0]!.width).toBeCloseTo(97.3913043478, 10);
    expect(plan.bars[0]!.height).toBeCloseTo(118.75, 10);
    expect(plan.bars[0]!.baseline).toBeCloseTo(134.5833333333, 10);
    expect(plan.bars[1]!.x).toBeCloseTo(180.8695652174, 10);
    expect(plan.bars[1]!.y).toBeCloseTo(134.5833333333, 10);
    expect(plan.bars[1]!.width).toBeCloseTo(97.3913043478, 10);
    expect(plan.bars[1]!.height).toBeCloseTo(39.5833333333, 10);
    expect(plan.bars[1]!.baseline).toBeCloseTo(134.5833333333, 10);
    expect(plan.bars[0]).toEqual(
      expect.objectContaining({
        markId: 'aggregate-bar:sales:["string","Z"]',
        rowId: 'sales:["string","Z"]',
        order: 0,
        value: 6,
        fill: "red",
        fillSource: { kind: "color-scale", scaleId: "groups", value: "Z" },
      })
    );
    expect(plan.bars[0]!.height).toBeGreaterThan(0);
    expect(plan.bars[1]!.height).toBeGreaterThan(0);
  });
});
