import { describe, expect, it } from "vitest";
import { buildFieldProfile } from "@/lib/fieldProfiles";
import {
  binPopulations,
  buildFieldDistribution,
  quantile,
  summarizeNumbers,
} from "./fieldDistribution";

const column = (values: unknown[]) =>
  Object.fromEntries(values.map((value, index) => [index, value])) as Record<
    number,
    string | number | boolean | null | undefined
  >;

describe("buildFieldDistribution", () => {
  it("counts missing and excluded numbers the same way as field profiles", () => {
    const values = column([10, 20, " ", null, Infinity, "30"]);
    const distribution = buildFieldDistribution(values, "numeric");
    const profile = buildFieldProfile("value", values, "numeric");

    expect(distribution.kind).toBe("numeric");
    expect(distribution.all).toMatchObject({
      rows: 6,
      values: 3,
      missing: profile.nullCount,
      excluded: profile.excludedCount,
      distinct: profile.uniqueCount,
    });
    expect(distribution.filtered).toBeUndefined();
    if (distribution.kind !== "numeric") return;
    expect(distribution.summary?.all).toMatchObject({
      min: 10,
      median: profile.statistics?.median,
      max: 30,
    });
  });

  it("bins filtered rows inside the full-source bins", () => {
    const values = column(Array.from({ length: 200 }, (_, index) => index / 2));
    const filteredIds = new Set(
      Array.from({ length: 50 }, (_, index) => index)
    );
    const distribution = buildFieldDistribution(values, "numeric", filteredIds);

    expect(distribution.filtered).toMatchObject({ rows: 50, values: 50 });
    if (distribution.kind !== "numeric") throw new Error("numeric expected");
    const { bins } = distribution;
    expect(bins.reduce((sum, bin) => sum + bin.all, 0)).toBe(200);
    expect(bins.reduce((sum, bin) => sum + bin.filtered, 0)).toBe(50);
    bins.forEach((bin) => expect(bin.filtered).toBeLessThanOrEqual(bin.all));
    // Round edges: every edge is a multiple of the step.
    const step = bins[0]!.end - bins[0]!.start;
    bins.forEach((bin) =>
      expect(
        Math.abs(bin.start / step - Math.round(bin.start / step))
      ).toBeLessThan(1e-9)
    );
    expect(distribution.summary?.filtered).toMatchObject({
      min: 0,
      max: 24.5,
    });
  });

  it("offers a core range when far outliers flatten the shape", () => {
    const values = column([
      ...Array.from({ length: 100 }, (_, index) => index + 1),
      10_000,
      -10_000,
    ]);
    const distribution = buildFieldDistribution(
      values,
      "numeric",
      new Set([0, 1, 100])
    );
    if (distribution.kind !== "numeric") throw new Error("numeric expected");

    expect(distribution.core).toMatchObject({
      min: 1,
      max: 100,
      below: { all: 1, filtered: 0 },
      above: { all: 1, filtered: 1 },
    });
    const coreRows = distribution.core!.bins.reduce(
      (sum, bin) => sum + bin.all,
      0
    );
    expect(coreRows).toBe(100);
  });

  it("keeps the full range when nothing is far out", () => {
    const values = column(Array.from({ length: 50 }, (_, index) => index * 3));
    const distribution = buildFieldDistribution(values, "numeric");
    if (distribution.kind !== "numeric") throw new Error("numeric expected");
    expect(distribution.core).toBeUndefined();
  });

  it("counts categories for both populations, most common first", () => {
    const values = column(["b", "a", "b", null, "c", "b", "a"]);
    const distribution = buildFieldDistribution(
      values,
      "categorical",
      new Set([0, 1, 3])
    );
    if (distribution.kind !== "category") throw new Error("category expected");

    expect(distribution.categories).toEqual([
      { value: "b", all: 3, filtered: 1 },
      { value: "a", all: 2, filtered: 1 },
      { value: "c", all: 1, filtered: 0 },
    ]);
    expect(distribution.all).toMatchObject({
      rows: 7,
      values: 6,
      missing: 1,
      distinct: 3,
    });
    expect(distribution.filtered).toMatchObject({
      rows: 3,
      values: 2,
      missing: 1,
      distinct: 2,
    });
  });

  it("bins dates by time and counts values that are not dates", () => {
    const values = column([
      "2026-01-01",
      "2026-01-31",
      "2026-03-01",
      "soon",
      null,
    ]);
    const distribution = buildFieldDistribution(values, "datetime");
    if (distribution.kind !== "date") throw new Error("date expected");

    expect(distribution.all).toMatchObject({
      values: 3,
      missing: 1,
      excluded: 1,
    });
    expect(distribution.range?.all.first).toBe(Date.parse("2026-01-01"));
    expect(distribution.bins.reduce((sum, bin) => sum + bin.all, 0)).toBe(3);
  });

  it("reports no filtered population when filters keep every row", () => {
    const distribution = buildFieldDistribution(
      column([1, 2, 3]),
      "numeric",
      new Set([0, 1, 2])
    );
    expect(distribution.filtered).toBeUndefined();
  });
});

describe("binPopulations", () => {
  it("gives small integer ranges one bin per value", () => {
    const bins = binPopulations([1, 2, 2, 5], [2]);
    expect(bins.map((bin) => [bin.start, bin.all, bin.filtered])).toEqual([
      [1, 1, 0],
      [2, 2, 1],
      [3, 0, 0],
      [4, 0, 0],
      [5, 1, 0],
    ]);
    expect(bins.every((bin) => bin.single)).toBe(true);
  });

  it("puts a constant field in one bin", () => {
    expect(binPopulations([4, 4, 4], [4])).toEqual([
      { start: 4, end: 4, single: true, all: 3, filtered: 1 },
    ]);
  });
});

describe("summarizeNumbers", () => {
  it("uses interpolated quartiles", () => {
    expect(quantile([1, 2, 3, 4], 0.25)).toBe(1.75);
    expect(summarizeNumbers([4, 1, 3, 2])).toMatchObject({
      min: 1,
      q1: 1.75,
      median: 2.5,
      q3: 3.25,
      max: 4,
      mean: 2.5,
    });
  });
});
