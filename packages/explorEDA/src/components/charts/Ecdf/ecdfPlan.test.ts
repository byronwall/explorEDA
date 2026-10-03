import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { ecdfDefinition, type EcdfSettings } from "./definition";
import {
  buildSteps,
  countInRange,
  planEcdf,
  shareAt,
  snapToValue,
  thresholdFilter,
  type EcdfSnapshot,
} from "./ecdfPlan";
import { findEcdfTraceRow, resolveEcdfTrace } from "./ecdfTrace";

// Ties at 2, a missing value, a non-number, and two groups of different size.
const values: datum[] = [1, 2, 2, 3, 10, null, "n/a", 4, 5];
const groups: datum[] = ["a", "a", "b", "a", "b", "a", "b", "b", "b"];
const ids = values.map((_, index) => index);
const byId = (list: datum[]) =>
  Object.fromEntries(list.map((value, id) => [id, value]));

function snapshot(liveIds = ids): EcdfSnapshot {
  return {
    revision: "r",
    allIds: ids,
    liveIds,
    values: byId(values),
    groupData: byId(groups),
  };
}
function settings(overrides: Partial<EcdfSettings> = {}): EcdfSettings {
  return {
    ...ecdfDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }, "v"),
    id: "e",
    ...overrides,
  };
}
const plan = (overrides: Partial<EcdfSettings> = {}, live = ids) =>
  planEcdf({
    settings: settings(overrides),
    width: 500,
    height: 300,
    snapshot: snapshot(live),
    getFieldLabel: (field) => field,
  });

describe("planEcdf", () => {
  it("gives equal values one step and leaves out values that are not numbers", () => {
    const result = plan();
    const [curve] = result.curves;
    expect(curve!.count).toBe(7);
    expect(curve!.steps.map((step) => step.x)).toEqual([1, 2, 3, 4, 5, 10]);
    expect(curve!.steps[1]).toMatchObject({
      atOrBelow: 3,
      atOrAbove: 6,
      ids: [1, 2],
    });
    expect(result.excluded).toEqual([
      { reason: "Missing value", count: 1 },
      { reason: "Not a finite number", count: 1 },
    ]);
  });

  it("reads the share at or below and at or above any value", () => {
    const [curve] = plan().curves;
    expect(shareAt(curve!, 2, "below")).toBeCloseTo(3 / 7);
    expect(shareAt(curve!, 2.5, "below")).toBeCloseTo(3 / 7);
    expect(shareAt(curve!, 0, "below")).toBe(0);
    expect(shareAt(curve!, 10, "below")).toBe(1);
    expect(shareAt(curve!, 2, "above")).toBeCloseTo(6 / 7);
    expect(shareAt(curve!, 11, "above")).toBe(0);
    expect(countInRange(curve!, 2, 4)).toBe(4);
  });

  it("splits by color with each group as its own 100%", () => {
    const result = plan({ colorField: "g" });
    const a = result.curves.find((curve) => curve.label === "a")!;
    const b = result.curves.find((curve) => curve.label === "b")!;
    expect(a.count).toBe(3);
    expect(b.count).toBe(4);
    expect(shareAt(a, 2, "below")).toBeCloseTo(2 / 3);
    expect(shareAt(b, 2, "below")).toBeCloseTo(1 / 4);
    const withAll = plan({ colorField: "g", showOverall: true });
    expect(withAll.curves.find((curve) => curve.overall)?.count).toBe(7);
  });

  it("marks where each curve crosses 50% and 90%", () => {
    const [curve] = plan().curves;
    expect(curve!.quantiles.map((item) => [item.level, item.x])).toEqual([
      [0.5, 3],
      [0.9, 10],
    ]);
    const [above] = plan({ direction: "above" }).curves;
    expect(above!.quantiles.map((item) => [item.level, item.x])).toEqual([
      [0.5, 3],
      [0.9, 1],
    ]);
  });

  it("keeps the x range from all rows while other charts filter", () => {
    expect(plan({}, [0, 1]).domain).toEqual(plan().domain);
  });

  it("falls back to a linear scale when log cannot show a value", () => {
    expect(plan({ logX: true })).toMatchObject({
      log: true,
      logUnavailable: false,
    });
    const zero = planEcdf({
      settings: settings({ logX: true }),
      width: 500,
      height: 300,
      snapshot: { ...snapshot(), values: byId([0, ...values.slice(1)]) },
      getFieldLabel: (field) => field,
    });
    expect(zero).toMatchObject({ log: false, logUnavailable: true });
  });

  it("draws a step path that ends at 100%", () => {
    const [curve] = plan().curves;
    expect(curve!.path.startsWith("M")).toBe(true);
    expect(curve!.path).toContain(`V${plan().py(1)}`);
  });

  it("snaps to observed values and saves thresholds in data units", () => {
    const result = plan();
    expect(snapToValue(result, result.px(2.4))).toBe(2);
    expect(thresholdFilter("v", "below", 3)).toEqual({
      type: "range",
      field: "v",
      max: 3,
    });
    expect(thresholdFilter("v", "above", 3)).toEqual({
      type: "range",
      field: "v",
      min: 3,
    });
    expect(thresholdFilter("v", "below", 5, 2)).toEqual({
      type: "range",
      field: "v",
      min: 2,
      max: 5,
    });
    const selected = plan({ filters: [{ type: "range", field: "v", max: 3 }] });
    expect(selected.selection?.x0).toBe(0);
    expect(selected.selection?.x1).toBeCloseTo(selected.px(3));
  });

  it("traces a step with its rows and finds a source row", () => {
    const result = plan();
    const trace = resolveEcdfTrace(result, "ecdf-step", "__all__@2");
    expect(trace?.share).toBeCloseTo(3 / 7);
    expect(trace?.throughIds.sort()).toEqual([0, 1, 2]);
    expect(trace?.atIds).toEqual([1, 2]);
    expect(findEcdfTraceRow(result, 4)).toEqual({
      kind: "ecdf-step",
      id: "__all__@10",
    });
    expect(findEcdfTraceRow(result, 5)).toBeUndefined();
  });

  it("orders ties by row ID", () => {
    expect(
      buildSteps([
        { id: 3, value: 1 },
        { id: 1, value: 1 },
      ])[0]!.ids
    ).toEqual([1, 3]);
  });
});
