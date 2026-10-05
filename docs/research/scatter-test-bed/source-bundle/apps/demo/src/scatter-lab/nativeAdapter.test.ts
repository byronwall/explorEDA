import { describe, expect, it } from "vitest";
import { defaults } from "./settings";
import { makeFixture } from "./fixtures";
import { importNativeSelection, nativeSettings } from "./ExistingScatter";

describe("public scatter comparison adapter", () => {
  it("uses separate native chart filters and transfers only supported selections", () => {
    const s = defaults(); s.filters = { x: { min: 10 }, y: {}, group: "A", cohort: "held-out" };
    const fixture = makeFixture(s.fixture), native = nativeSettings(fixture, s);
    expect(native.charts.map(c => c.filters)).toEqual([
      [{ type: "range", field: "x", min: 10 }],
      [{ type: "value", field: "group", values: ["A"] }],
      [{ type: "value", field: "cohort", values: ["held-out"] }],
    ]);
    const transferred = importNativeSelection(native, defaults());
    expect(transferred.filters.x.min).toBe(10);
    expect(transferred.filters.group).toBe("A");
    expect(transferred.filters.cohort).toBe("held-out");
    const extra = { ...native, charts: [...native.charts, { ...native.charts[0]!, id: "unexpected" }] };
    expect(() => importNativeSelection(extra, s)).toThrow("original three");
    native.charts[0]!.filters = [{ type: "value", field: "x", values: ["A"] }];
    expect(() => importNativeSelection(native, s)).toThrow("numeric X/Y ranges");
  });
  it("preserves original rows and uses public wrap facets without narrowing domains", () => {
    const s = defaults(); s.facet = "A";
    const fixture = makeFixture(s.fixture), native = nativeSettings(fixture, s);
    expect(fixture.rows.length).toBe(1000);
    expect(native.charts[0]!.facet).toMatchObject({ enabled: true, type: "wrap", rowVariable: "group", visibleFacetIds: ['["[\\"string\\",\\"A\\"]",null]'] });
    expect(native.charts[0]!.xAxis.min).toBeUndefined();
    expect(native.charts[0]!.xAxis.max).toBeUndefined();
  });
});
