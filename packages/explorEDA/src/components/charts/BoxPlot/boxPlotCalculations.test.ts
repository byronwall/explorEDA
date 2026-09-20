import { describe, expect, it } from "vitest";
import { calculateBoxPlotStats } from "./boxPlotCalculations";

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
});
