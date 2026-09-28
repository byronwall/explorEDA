import { expect, it } from "vitest";
import { numericBins } from "./bins";

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
