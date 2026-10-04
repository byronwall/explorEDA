import { describe, expect, it } from "vitest";
import {
  calculateBeeSwarmPositions,
  calculateBoxPlotStats,
  MAX_BEE_SWARM_POINTS_PER_GROUP,
  medianRange,
  selectBoxGroup,
} from "./boxPlotCalculations";

describe("calculateBoxPlotStats", () => {
  it("uses observed Tukey whisker endpoints inside the fences", () => {
    expect(calculateBoxPlotStats([1, 2, 3, 4, 100], "tukey")).toMatchObject({
      q1: 2,
      median: 3,
      q3: 4,
      iqr: 2,
      whiskerLow: 1,
      whiskerHigh: 4,
      outliers: [100],
      totalCount: 5,
    });
  });

  it("uses screen-space Y distances for beeswarm collisions", () => {
    expect(
      calculateBeeSwarmPositions([0, 1], 20, 1000, 0, (value) => value * 100)
    ).toEqual([
      [0, 0],
      [0, 1],
    ]);
    expect(
      calculateBeeSwarmPositions([0, 1], 20, 1000, 0, (value) => value)
    ).toEqual([
      [0, 0],
      [4, 1],
    ]);
  });

  it("samples deterministically at the group cap", () => {
    const data = Array.from(
      { length: MAX_BEE_SWARM_POINTS_PER_GROUP + 1 },
      (_, i) => i
    );
    const first = calculateBeeSwarmPositions(data, 100, undefined, 42);

    expect(first).toHaveLength(MAX_BEE_SWARM_POINTS_PER_GROUP);
    expect(first).toEqual(calculateBeeSwarmPositions(data, 100, undefined, 42));
  });
});

describe("selectBoxGroup", () => {
  const others = { type: "value" as const, field: "other", values: ["x"] };

  it("selects one group, then clears it on a second click", () => {
    const once = selectBoxGroup([others], "mood", 3);
    expect(once).toEqual([
      others,
      { type: "value", field: "mood", values: [3] },
    ]);
    expect(selectBoxGroup(once, "mood", 3)).toEqual([others]);
  });

  it("replaces the selection on click and toggles with add", () => {
    const one = selectBoxGroup([], "mood", 3);
    expect(selectBoxGroup(one, "mood", 5)).toEqual([
      { type: "value", field: "mood", values: [5] },
    ]);
    const two = selectBoxGroup(one, "mood", 5, true);
    expect(two).toEqual([{ type: "value", field: "mood", values: [3, 5] }]);
    expect(selectBoxGroup(two, "mood", 3, true)).toEqual([
      { type: "value", field: "mood", values: [5] },
    ]);
  });
});

describe("medianRange", () => {
  it("names the lowest and highest medians among groups with rows", () => {
    const group = (name: string, data: number[]) => ({
      name,
      stats: calculateBoxPlotStats(data, "tukey"),
    });
    const range = medianRange([
      group("a", [5, 6, 7]),
      group("b", []),
      group("c", [1, 2, 3]),
      group("d", [9, 10]),
    ]);
    expect(range?.low.name).toBe("c");
    expect(range?.high.name).toBe("d");
    expect(medianRange([group("a", [1])])).toBeUndefined();
  });
});
