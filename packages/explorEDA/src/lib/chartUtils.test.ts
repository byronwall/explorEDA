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

describe("reduceDataPoints keeps each bucket's last sample", () => {
  it("draws the series' final sample", () => {
    const cycle = [0, 10, 5, 3, 7];
    const data = Array.from({ length: 3000 }, (_, x) => ({
      x,
      y: cycle[x % cycle.length]!,
    }));

    const reduced = reduceDataPoints(data, 600);
    expect(reduced.at(-1)).toMatchObject({ x: 2999, y: 7 });
    expect(reduced.at(0)).toMatchObject({ x: 0, y: 0 });
  });

  it("keeps first, min, max, and last when every sample shares one x", () => {
    const data = Array.from({ length: 2000 }, (_, index) => ({
      x: 5,
      y: index === 0 ? 1 : index === 700 ? -10 : index === 1400 ? 20 : 2,
    }));

    expect(reduceDataPoints(data, 600).map(({ x, y }) => [x, y])).toEqual([
      [5, 1],
      [5, -10],
      [5, 20],
      [5, 2],
    ]);
  });
});
