import { describe, expect, it } from "vitest";
import { dodgePositions } from "./labelDodge";

describe("dodgePositions", () => {
  it("leaves well-spaced positions where they are", () => {
    expect(dodgePositions([10, 40, 70], 12, [0, 100])).toEqual([10, 40, 70]);
  });

  it("separates a cluster while keeping its order, in input order", () => {
    const placed = dodgePositions([50, 52, 10, 51], 12, [0, 200]);
    expect(placed[2]).toBe(10);
    // The three clustered labels spread down from the first.
    expect(placed[0]).toBe(50);
    expect(placed[3]).toBe(62);
    expect(placed[1]).toBe(74);
  });

  it("pulls a stack back inside the bounds when it would overflow the bottom", () => {
    const placed = dodgePositions([90, 95, 100], 12, [0, 100]);
    expect(placed).toEqual([76, 88, 100]);
  });

  it("starts at the top and overflows the bottom when the stack cannot fit", () => {
    const placed = dodgePositions([5, 5, 5, 5], 10, [0, 20]);
    expect(placed).toEqual([0, 10, 20, 30]);
  });
});
