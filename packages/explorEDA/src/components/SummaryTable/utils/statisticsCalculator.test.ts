import { describe, expect, it } from "vitest";
import { calculateValueStatistics } from "./statisticsCalculator";

describe("calculateValueStatistics", () => {
  it("counts distinct numbers, not distinct spellings, in a numeric field", () => {
    const statistics = calculateValueStatistics(
      [1, "1", " ", 2, "2.0", null, "n/a"],
      "numeric"
    );

    expect(statistics).toMatchObject({
      totalCount: 7,
      uniqueCount: 2,
      nullCount: 2,
      excludedCount: 1,
    });
  });
});
