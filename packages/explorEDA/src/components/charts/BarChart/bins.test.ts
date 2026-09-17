import { expect, it } from "vitest";
import { numericBins } from "./bins";

it("keeps every valid observation, including the maximum and constant values", () => {
  expect(numericBins([0, 1, 2], [0, 1, 2], 2).map((bin) => bin.value)).toEqual([
    1, 2,
  ]);
  expect(
    numericBins([5, 5], [5, 5], 10).reduce((sum, bin) => sum + bin.value, 0)
  ).toBe(2);
  expect(numericBins([], [], 10)).toEqual([]);
});
