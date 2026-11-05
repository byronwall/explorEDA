import { describe, expect, it } from "vitest";
import { describeHeatPosition, planHeatScale } from "./heatScale";

describe("planHeatScale", () => {
  it("spreads sequential values from the lowest to the highest", () => {
    const scale = planHeatScale([10, 20, 40]);
    expect(scale).toMatchObject({ kind: "sequential", domain: [10, 40] });
    expect(scale.position(10)).toBe(0);
    expect(scale.position(25)).toBeCloseTo(0.5);
    expect(scale.position(40)).toBe(1);
  });

  it("gives each side of a diverging scale its own end", () => {
    const scale = planHeatScale([-50, 100], { min: -5, max: 100 });
    expect(scale.domain).toEqual([-5, 100]);
    // Past the fixed low end, a value takes the end's color.
    expect(scale.position(-50)).toBe(-1);
    expect(scale.position(-5)).toBe(-1);
    expect(scale.position(-2.5)).toBeCloseTo(-0.5);
    expect(scale.position(0)).toBe(0);
    expect(scale.position(50)).toBeCloseTo(0.5);
    expect(scale.position(100)).toBe(1);
    expect(describeHeatPosition(-1, scale)).toBe(
      "100% of the way from 0 to -5 on a diverging scale"
    );
    expect(describeHeatPosition(0.5, scale)).toBe(
      "50% of the way from 0 to 100 on a diverging scale"
    );
  });

  it("orders the ends when a fixed end sits past the shown values", () => {
    const aboveAll = planHeatScale([10, 40], { min: 50 });
    expect(aboveAll).toMatchObject({ kind: "sequential", domain: [40, 50] });
    expect(aboveAll.position(10)).toBe(0);
    expect(aboveAll.position(40)).toBe(0);
    expect(aboveAll.position(45)).toBeCloseTo(0.5);
    const belowAll = planHeatScale([10, 40], { max: 5 });
    expect(belowAll.domain).toEqual([5, 10]);
    expect(belowAll.position(10)).toBe(1);
    expect(belowAll.position(40)).toBe(1);
    expect(belowAll.position(5)).toBe(0);
  });

  it("clamps values past a fixed end to the end's color", () => {
    const scale = planHeatScale([0, 10], { max: 4 });
    expect(scale.position(10)).toBe(1);
    expect(scale.position(2)).toBeCloseTo(0.5);
    const low = planHeatScale([0, 10], { min: 5 });
    expect(low.position(0)).toBe(0);
    expect(low.position(7.5)).toBeCloseTo(0.5);
  });

  it("keeps the square-root transform on each side", () => {
    const scale = planHeatScale([-16, 4], { transform: "sqrt" });
    expect(scale.position(-4)).toBeCloseTo(-0.5);
    expect(scale.position(1)).toBeCloseTo(0.5);
    expect(scale.position(-16)).toBe(-1);
    expect(scale.position(4)).toBe(1);
  });
});
