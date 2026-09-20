import { describe, expect, it } from "vitest";
import { reduceDataPoints } from "./chartUtils";

describe("reduceDataPoints", () => {
  it("orders small data, keeps tied X values stable, and reduces wide data", () => {
    const data = [
      { x: 3, y: 30 },
      { x: 2, y: 21 },
      { x: 2, y: 22 },
      { x: 1, y: 10 },
      { x: 0, y: 0 },
    ];

    expect(reduceDataPoints(data, 10).map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [1, 10],
      [2, 21],
      [2, 22],
      [3, 30],
    ]);
    expect(reduceDataPoints(data, 1).map(({ x }) => x)).toEqual([0, 3]);
  });
});
