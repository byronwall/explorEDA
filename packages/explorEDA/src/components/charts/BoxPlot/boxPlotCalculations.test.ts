import { describe, expect, it } from "vitest";
import {
  calculateBeeSwarmPositions,
  calculateBoxPlotStats,
  calculateKernelDensity,
  MAX_BEE_SWARM_POINTS_PER_GROUP,
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

  it("keeps a violin finite when the bandwidth is empty or zero", () => {
    for (const bandwidth of [NaN, 0, -1]) {
      const density = calculateKernelDensity([1, 2, 3, 10], bandwidth);
      expect(density).toHaveLength(100);
      expect(
        density.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
      ).toBe(true);
    }
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
