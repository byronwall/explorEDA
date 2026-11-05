import { describe, expect, it } from "vitest";
import { firstFreeSpotInView, nextFreeSpot } from "./chartPlacement";

describe("nextFreeSpot", () => {
  it("fills the last row before starting a new one, never an older gap", () => {
    const size = { w: 6, h: 4 };
    const one = [{ x: 0, y: 0, w: 6, h: 4 }];
    expect(nextFreeSpot(size, [], 12)).toEqual({ x: 0, y: 0, w: 6, h: 4 });
    expect(nextFreeSpot(size, one, 12)).toEqual({ x: 6, y: 0, w: 6, h: 4 });
    const gapAbove = [...one, { x: 0, y: 4, w: 12, h: 4 }];
    expect(nextFreeSpot(size, gapAbove, 12)).toEqual({
      x: 0,
      y: 8,
      w: 6,
      h: 4,
    });
  });
});

describe("firstFreeSpotInView", () => {
  const size = { w: 6, h: 4 };

  it("uses free space inside the visible rows", () => {
    const occupied = [
      { x: 0, y: 0, w: 12, h: 10 },
      { x: 0, y: 10, w: 6, h: 6 },
    ];
    expect(
      firstFreeSpotInView(size, occupied, 12, { top: 8, bottom: 20 })
    ).toEqual({ x: 6, y: 10, w: 6, h: 4 });
  });

  it("takes the first chart edge in view when nothing is free", () => {
    const occupied = [
      { x: 0, y: 0, w: 12, h: 10 },
      { x: 0, y: 10, w: 12, h: 6 },
      { x: 0, y: 16, w: 12, h: 6 },
    ];
    expect(
      firstFreeSpotInView(size, occupied, 12, { top: 7, bottom: 15 })
    ).toEqual({ x: 0, y: 10, w: 6, h: 4 });
  });
});
