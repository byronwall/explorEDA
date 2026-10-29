import { describe, expect, it } from "vitest";
import {
  planDiscoveryPairs,
  sortDiscoveryPairs,
  type DiscoveryField,
} from "./pairDiscoveryPlan";

const fields = (columns: Record<string, number[]>): DiscoveryField[] =>
  Object.entries(columns).map(([field, value], index) => ({
    field,
    label: field,
    index,
    value,
  }));

describe("pair discovery", () => {
  it("lists each pair once and orders by metric, then by ID", () => {
    const pairs = planDiscoveryPairs(
      fields({
        x: [1, 2, 3, 4, 5],
        inc: [1, 2, 3, 4, 5],
        dec: [-1, -2, -3, -4, -5],
        c: [7, 7, 7, 7, 7],
      })
    );
    expect(pairs).toHaveLength(6);
    expect(new Set(pairs.map((pair) => pair.id)).size).toBe(6);
    const ids = (order: Parameters<typeof sortDiscoveryPairs>[1]) =>
      sortDiscoveryPairs(pairs, order).map((pair) => JSON.parse(pair.id));
    const byMetric = [
      ["dec", "inc"],
      ["dec", "x"],
      ["inc", "x"],
      ["c", "dec"],
      ["c", "inc"],
      ["c", "x"],
    ];
    expect(ids("spearman")).toEqual(byMetric);
    expect(ids("pearson")).toEqual(byMetric);
    expect(ids("fields")).toEqual([
      ["inc", "x"],
      ["dec", "x"],
      ["c", "x"],
      ["dec", "inc"],
      ["c", "inc"],
      ["c", "dec"],
    ]);
  });

  it("keeps a pair's ID when its fields change places", () => {
    const a = planDiscoveryPairs(fields({ x: [1, 2, 3], y: [3, 1, 2] }));
    const b = planDiscoveryPairs(fields({ y: [3, 1, 2], x: [1, 2, 3] }));
    expect(a[0]!.id).toBe(b[0]!.id);
    expect(a[0]!.spearman!.value).toBeCloseTo(b[0]!.spearman!.value!, 12);
  });

  it("puts the largest gap between ρ and r first", () => {
    const pairs = planDiscoveryPairs(
      fields({
        x: [1, 2, 3, 4, 5],
        growth: [1, 10, 100, 1000, 10000],
        line: [2, 4, 6, 8, 10],
        u: [4, 1, 0, 1, 4],
      })
    );
    const growth = pairs.find((pair) => pair.id === '["growth","x"]')!;
    expect(growth.spearman!.value).toBeCloseTo(1, 12);
    expect(growth.pearson!.value).toBeCloseTo(20988 / Math.sqrt(763192368), 12);
    const u = pairs.find((pair) => pair.id === '["u","x"]')!;
    expect(u.spearman!.value).toBeCloseTo(0, 12);
    expect(u.pearson!.value).toBeCloseTo(0, 12);
    const sorted = sortDiscoveryPairs(pairs, "difference");
    const gaps = sorted.map((pair) =>
      Math.abs(pair.spearman!.value! - pair.pearson!.value!)
    );
    expect(gaps).toEqual([...gaps].sort((a, b) => b - a));
    // Growth against the U ranks to 0 but leans positive by value.
    expect(sorted[0]!.id).toBe('["growth","u"]');
    expect(gaps.at(-1)).toBeCloseTo(0, 12);
  });
});
