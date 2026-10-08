import { scaleSymlog } from "d3-scale";
import { describe, expect, it } from "vitest";
import { axisDragMode, dragDomain } from "./axisDrag";

const x = {
  domain: [0, 100] as [number, number],
  range: [0, 500] as [number, number],
};
// A Y axis draws its minimum at the bottom.
const y = {
  domain: [0, 100] as [number, number],
  range: [400, 0] as [number, number],
};

describe("axisDragMode", () => {
  it("stretches near an end and pans elsewhere", () => {
    expect(axisDragMode(x.range, 6)).toBe("min");
    expect(axisDragMode(x.range, 490)).toBe("max");
    expect(axisDragMode(x.range, 250)).toBe("pan");
    expect(axisDragMode(y.range, 395)).toBe("min");
    expect(axisDragMode(y.range, 4)).toBe("max");
  });
});

describe("dragDomain", () => {
  it("pans with the pointer, so the content follows it", () => {
    // Dragging right by 50 px moves the view left by 10 units.
    expect(
      dragDomain({
        ...x,
        scaleType: "linear",
        mode: "pan",
        start: 250,
        current: 300,
      })
    ).toEqual([-10, 90]);
    // Dragging a Y axis down shows higher values.
    expect(
      dragDomain({
        ...y,
        scaleType: "linear",
        mode: "pan",
        start: 200,
        current: 240,
      })
    ).toEqual([10, 110]);
  });

  it("stretches one end and keeps the value under the pointer", () => {
    // Pull 50, at the middle, out to the right end: the axis halves.
    expect(
      dragDomain({
        ...x,
        scaleType: "linear",
        mode: "max",
        start: 250,
        current: 500,
      })
    ).toEqual([0, 50]);
    // Push the right end, 100, to the middle: the axis doubles.
    expect(
      dragDomain({
        ...x,
        scaleType: "linear",
        mode: "max",
        start: 500,
        current: 250,
      })
    ).toEqual([0, 200]);
    // Pull the left end out to the left: zero follows the pointer.
    expect(
      dragDomain({
        ...x,
        scaleType: "linear",
        mode: "min",
        start: 0,
        current: -100,
      })
    ).toEqual([16.7, 100]);
  });

  it("refuses to fold an end past the fixed one", () => {
    expect(
      dragDomain({
        ...x,
        scaleType: "linear",
        mode: "max",
        start: 500,
        current: -20,
      })
    ).toBeUndefined();
    expect(
      dragDomain({
        ...x,
        scaleType: "linear",
        mode: "max",
        start: 500,
        current: 4,
      })
    ).toBeUndefined();
  });

  it("moves a symlog axis in its drawn space", () => {
    const domain: [number, number] = [0, 10000];
    const range: [number, number] = [0, 400];
    const next = dragDomain({
      domain,
      range,
      scaleType: "symlog",
      mode: "pan",
      start: 200,
      current: 100,
    })!;
    // The value that sat under the pointer is still under it after the pan.
    const before = scaleSymlog().domain(domain).range(range);
    const after = scaleSymlog().domain(next).range(range);
    expect(Math.abs(after(before.invert(200)) - 100)).toBeLessThan(2);
  });

  it("rounds bounds to what a pixel can show", () => {
    const [low, high] = dragDomain({
      domain: [0, 1000],
      range: [0, 333],
      scaleType: "linear",
      mode: "pan",
      start: 100,
      current: 137,
    })!;
    expect(Number.isInteger(low)).toBe(true);
    expect(Number.isInteger(high)).toBe(true);
  });
});
