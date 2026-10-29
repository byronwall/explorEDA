import { describe, expect, it } from "vitest";
import {
  averageRanks,
  collectPairs,
  correlate,
  pairCorrelation,
} from "./pairCorrelation";

const both = ["pearson", "spearman"] as const;

describe("pairCorrelation", () => {
  it("gives tied values their average rank", () => {
    const x = [1, 1, 2, 3];
    const y = [10, 20, 20, 30];
    expect([...averageRanks(x)]).toEqual([1.5, 1.5, 3, 4]);
    expect([...averageRanks(y)]).toEqual([1, 2.5, 2.5, 4]);
    const result = pairCorrelation(x, y, both);
    expect(result.spearman!.value).toBeCloseTo(5 / 6, 12);
    expect(result.pearson!.value).toBeCloseTo(4 / Math.sqrt(22), 12);
    expect(result.spearman!.n).toBe(4);
  });

  it("ties signed zeros and keeps close values apart", () => {
    expect([...averageRanks([0, -0, 1])]).toEqual([1.5, 1.5, 3]);
    expect([...averageRanks([1, 1 + Number.EPSILON, 1])]).toEqual([
      1.5, 3, 1.5,
    ]);
  });

  it("ranks each pair over only the rows that have both values", () => {
    const missing = NaN;
    const x = [1, 2, 3, 4, 5, missing, missing, Infinity];
    const y = [1, missing, missing, 2, 3, 4, missing, 5];
    const z = [1, 2, 3, missing, missing, 4, missing, 5];
    const xy = collectPairs(x, y);
    expect([...xy.index]).toEqual([0, 3, 4]);
    expect([...collectPairs(x, z).index]).toEqual([0, 1, 2]);
    expect([...collectPairs(y, z).index]).toEqual([0, 5, 7]);
    for (const [a, b] of [
      [x, y],
      [x, z],
      [y, z],
    ] as const) {
      const result = pairCorrelation(a, b, both);
      expect(result.counts).toEqual({
        paired: 3,
        missingX: 2,
        missingY: 2,
        missingBoth: 1,
      });
      expect(result.spearman!.value).toBeCloseTo(1, 12);
    }
    expect(pairCorrelation(x, y, both).pearson!.value).toBeCloseTo(
      Math.sqrt(12 / 13),
      12
    );
  });

  it("ranks again within each group instead of averaging groups", () => {
    const x = [1, 4, 5, 2, 3, 6, 7, 8];
    const y = [1, 2, 3, 50, 40, 30, 20, 10];
    const a = pairCorrelation(x, y, both, [0, 1, 2]);
    const b = pairCorrelation(x, y, both, [3, 4, 5, 6, 7]);
    expect(a.spearman).toMatchObject({ status: "ok", n: 3 });
    expect(a.spearman!.value).toBeCloseTo(1, 12);
    expect(b.spearman!.value).toBeCloseTo(-1, 12);
    expect(b.spearman!.n).toBe(5);
    const pooled = pairCorrelation(x, y, both);
    expect(pooled.spearman!.value).toBeCloseTo(1 / 21, 12);
    expect(pooled.pearson!.value).toBeCloseTo(-58 / Math.sqrt(42 * 2472), 12);
    // Peer filters that keep different rows of one size rank them apart.
    expect(
      pairCorrelation(x, y, ["spearman"], [3, 4, 5]).spearman!.value
    ).toBeCloseTo(-1, 12);
  });

  it("names why a pair has no correlation", () => {
    expect(correlate([1, 1, 1], [1, 2, 3], "spearman").status).toBe(
      "constant-x"
    );
    expect(correlate([1, 2, 3], [4, 4, 4], "pearson").status).toBe(
      "constant-y"
    );
    expect(correlate([2, 2, 2], [4, 4, 4], "pearson").status).toBe(
      "constant-both"
    );
    // Too few pairs wins over a constant field.
    expect(correlate([1, 1], [1, 2], "spearman").status).toBe(
      "insufficient-pairs"
    );
    expect(correlate([1, 2], [10, 20], "pearson")).toEqual({
      method: "pearson",
      status: "insufficient-pairs",
      n: 2,
    });
  });

  it("reads curves by rank and stays finite at extreme magnitudes", () => {
    const x = [1, 2, 3, 4, 5];
    const growth = [1, 10, 100, 1000, 10000];
    const result = pairCorrelation(x, growth, both);
    expect(result.spearman!.value).toBeCloseTo(1, 12);
    expect(result.pearson!.value).toBeCloseTo(20988 / Math.sqrt(763192368), 12);
    const u = pairCorrelation([-2, -1, 0, 1, 2], [4, 1, 0, 1, 4], both);
    expect(u.spearman!.value).toBeCloseTo(0, 12);
    expect(u.pearson!.value).toBeCloseTo(0, 12);
    const huge = correlate(
      [1e300, 2e300, 3e300],
      [1e-300, 3e-300, 2e-300],
      "pearson"
    );
    expect(huge.status).toBe("ok");
    expect(huge.value).toBeCloseTo(0.5, 12);
  });
});
