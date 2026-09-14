import { describe, expect, it } from "vitest";
import {
  initializeData,
  invalidateCalculationCache,
} from "../../providers/lib/dataLayerState";

describe("data layer state helpers", () => {
  it("initializes rows and an empty column from stable row IDs", () => {
    const result = initializeData([{ value: 2 }, { value: 3 }]);

    expect(result.dataWithIds).toEqual([
      { value: 2, __ID: 0 },
      { value: 3, __ID: 1 },
    ]);
    expect(result.emptyColumn).toEqual({ 0: undefined, 1: undefined });
  });

  it("invalidates selected cached calculations without mutating the cache", () => {
    const cache = { base: { 0: 2 }, dependent: { 0: 3 }, other: { 0: 4 } };

    expect(invalidateCalculationCache(cache, ["base", "dependent"])).toEqual({
      other: { 0: 4 },
    });
    expect(cache).toHaveProperty("base");
  });
});
