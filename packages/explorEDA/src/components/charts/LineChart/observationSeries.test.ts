import { describe, expect, it } from "vitest";
import { planObservationSeries } from "./observationSeries";

describe("planObservationSeries", () => {
  it("draws one line per field without a split", () => {
    const series = planObservationSeries({
      fields: ["a", "b"],
      xs: [2, 1, undefined],
      ys: { a: [20, 10, 5], b: [null, 1, 2] },
    });
    expect(series.map((item) => item.name)).toEqual(["a", "b"]);
    expect(series[0]!.data).toEqual([
      { x: 1, y: 10 },
      { x: 2, y: 20 },
      { x: NaN, y: null },
    ]);
    // A missing value breaks the line.
    expect(series[1]!.data[1]).toEqual({ x: 2, y: null });
  });

  it("splits each field by group, ordering each line by x", () => {
    const series = planObservationSeries({
      fields: ["rate"],
      xs: [3, 1, 2, 1, 3, 2],
      ys: { rate: [30, 10, 20, 1, 3, 2] },
      groups: ["A", "A", "A", "B", "B", "B"],
    });
    expect(series.map((item) => [item.field, item.group])).toEqual([
      ["rate", "A"],
      ["rate", "B"],
    ]);
    expect(series[0]!.data.map((point) => point.y)).toEqual([10, 20, 30]);
    expect(series[1]!.data.map((point) => point.y)).toEqual([1, 2, 3]);
    expect(new Set(series.map((item) => item.name)).size).toBe(2);
  });

  it("keeps rows without a group as their own line", () => {
    const series = planObservationSeries({
      fields: ["y"],
      xs: [1, 2, 3],
      ys: { y: [1, 2, 3] },
      groups: ["A", null, "A"],
    });
    expect(series).toHaveLength(2);
    expect(series[0]!.data.map((point) => point.x)).toEqual([1, 3]);
    expect(series[1]!.group).toBeNull();
  });
});
