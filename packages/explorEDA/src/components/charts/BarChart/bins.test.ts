import { expect, it } from "vitest";
import { applyFilter } from "@/hooks/applyFilter";
import {
  binIndex,
  binInRange,
  binRangeFilter,
  numericBins,
  sameRange,
  snapRangeToBins,
} from "./bins";

it("keeps every valid observation, including the maximum and constant values", () => {
  expect(
    numericBins([0, 1, 2.5], [0, 1, 2.5], 2).map((bin) => bin.value)
  ).toEqual([2, 1]);
  expect(numericBins([0, 1, 2], [0, 1, 2], 2).map((bin) => bin.value)).toEqual([
    2, 1,
  ]);
  expect(
    numericBins([5, 5], [5, 5], 10).reduce((sum, bin) => sum + bin.value, 0)
  ).toBe(2);
  expect(numericBins([], [], 10)).toEqual([]);
});

it("centers whole-number bins on integers so no bar splits between values", () => {
  const values = [1, 2, 2, 3, 5, 10];
  const ones = numericBins(values, values, 20);
  expect(ones).toHaveLength(10);
  expect(ones[0]).toMatchObject({ start: 0.5, end: 1.5, label: "1", value: 1 });
  expect(ones.at(-1)).toMatchObject({ start: 9.5, end: 10.5, value: 1 });
  expect(ones.map((bin) => bin.value)).toEqual([1, 2, 1, 0, 1, 0, 0, 0, 0, 1]);

  const wide = numericBins(values, values, 3);
  expect(wide.map((bin) => bin.label)).toEqual(["1–4", "5–8", "9–12"]);
  expect(wide.map((bin) => bin.value)).toEqual([4, 1, 1]);
  expect(wide.every((bin) => bin.end - bin.start === 4)).toBe(true);
});

it("keeps fractional data in evenly split bins", () => {
  const values = [0, 0.5, 1];
  const bins = numericBins(values, values, 2);
  expect(bins.map((bin) => [bin.start, bin.end])).toEqual([
    [0, 0.5],
    [0.5, 1],
  ]);
});

it("snaps range bounds to the nearest bin edges", () => {
  const edges = [0, 10, 20, 30, 40];
  expect(snapRangeToBins(edges, { min: 12, max: 27 })).toEqual({
    min: 10,
    max: 30,
  });
  expect(snapRangeToBins(edges, { min: 3 })).toEqual({ min: 0 });
  // Halfway bounds move outward and keep the values they covered.
  expect(snapRangeToBins(edges, { min: 15, max: 25 })).toEqual({
    min: 10,
    max: 30,
  });
  // A drag inside one bar selects that bar instead of nothing.
  expect(snapRangeToBins(edges, { min: 21, max: 24 })).toEqual({
    min: 20,
    max: 30,
  });
  expect(snapRangeToBins(edges, { min: 39, max: 41 })).toEqual({
    min: 30,
    max: 40,
  });
});

it("counts a bin as in range only when the range covers all of it", () => {
  const edges = [0, 10, 20, 30];
  const range = { min: 10, max: 20.000000000001 };
  expect(binInRange({ start: 10, end: 20 }, range, edges)).toBe(true);
  expect(binInRange({ start: 0, end: 10 }, range, edges)).toBe(false);
  expect(binInRange({ start: 20, end: 30 }, range, edges)).toBe(false);
  expect(sameRange({ min: 10, max: 20 }, range, edges)).toBe(true);
});

it("puts each value in exactly the bar whose range filter matches it", () => {
  // Values on and beside interior edges, where float step arithmetic and a
  // comparison against the edge can disagree.
  for (const [low, high] of [
    [0, 1.5],
    [0.1, 0.7],
    [-1.3, 4.9],
  ] as const) {
    for (let count = 2; count <= 40; count++) {
      const bins = numericBins([low, high], [], count);
      const edges = [bins[0]!.start, ...bins.map((bin) => bin.end)];
      const values = edges.flatMap((edge) => [
        edge,
        Number(edge.toPrecision(12)),
        Math.round(edge * 1000) / 1000,
      ]);
      for (const value of values) {
        const matches = bins.flatMap((bin, index) =>
          applyFilter(value, {
            type: "range",
            field: "x",
            ...binRangeFilter(edges, { min: bin.start, max: bin.end }),
          })
            ? [index]
            : []
        );
        const inside = value >= edges[0]! && value <= edges.at(-1)!;
        expect(matches).toEqual(inside ? [binIndex(bins, value)] : []);
      }
    }
  }
});

it("leaves out the upper edge of a range that ends before the last bar", () => {
  const edges = [0, 0.5, 1];
  expect(binRangeFilter(edges, { min: 0, max: 0.5 })).toEqual({
    min: 0,
    max: 0.5,
    maxExclusive: true,
  });
  expect(binRangeFilter(edges, { min: 0.5, max: 1 })).toEqual({
    min: 0.5,
    max: 1,
  });
});
