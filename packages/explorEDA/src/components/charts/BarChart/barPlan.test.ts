import { describe, expect, it } from "vitest";
import { calculateGroupedAggregate } from "@/lib/aggregates";
import type { datum } from "@/types/ChartTypes";
import { findAxisGuide } from "../Axis/axisPlan";
import { barChartDefinition } from "./definition";
import { barAt, findBarForRow, planBarChart } from "./barPlan";
import { resolveBarTrace } from "./barTrace";

const layout = { x: 0, y: 0, w: 6, h: 4 };

function settings(field: string, extra = {}) {
  return {
    ...barChartDefinition.createDefaultSettings(layout, field),
    id: "chart",
    colorScaleId: "groups",
    ...extra,
  };
}

function plan(
  field: string,
  values: datum[],
  options: {
    liveIds?: number[];
    extra?: object;
    aggregate?: ReturnType<typeof calculateGroupedAggregate>;
  } = {}
) {
  const fieldData = Object.fromEntries(values.map((value, id) => [id, value]));
  return planBarChart({
    settings: settings(field, options.extra),
    width: 400,
    height: 240,
    snapshot: {
      revision: "r1",
      allValues: values,
      liveIds: options.liveIds ?? values.map((_, id) => id),
      fieldData,
      aggregate: options.aggregate,
    },
    getColor: (value) => (value === "Z" ? "red" : "blue"),
    getFieldLabel: (name) => name,
  });
}

describe("planBarChart", () => {
  it("plans aggregate bars with contributors, exclusions, domain setters and geometry", () => {
    const result = calculateGroupedAggregate(
      [
        { __ID: 1, group: "Z", amount: 6 },
        { __ID: 2, group: "Z", amount: "bad" },
        { __ID: 3, group: "A", amount: -2 },
      ],
      {
        id: "sales",
        name: "Sales",
        groupField: "group",
        measureField: "amount",
        aggregation: "sum",
      },
      { 2: "bad" }
    );
    const bars = plan("group", ["Z", "Z", "A"], {
      aggregate: result,
      extra: { aggregateId: "sales" },
    });

    expect(bars.mode).toBe("aggregate");
    expect(bars.groupOrder).toEqual(["Z", "A"]);
    expect(bars.yScale.domain).toEqual([-2.8, 6.8]);
    expect(bars.domain.lower).toMatchObject({ source: "bar", label: "A", value: -2 });
    expect(bars.domain.upper).toMatchObject({ source: "bar", label: "Z", value: 6 });
    const [positive, negative] = bars.bars;
    expect(positive).toMatchObject({
      id: 'bar:sales:["string","Z"]',
      value: 6,
      fill: "red",
      fillSource: { kind: "color-scale", scaleId: "groups", value: "Z" },
    });
    // A positive bar rises from the baseline; a negative bar hangs below it.
    expect(positive!.y + positive!.height).toBeCloseTo(bars.zeroBaseline, 10);
    expect(negative!.y).toBeCloseTo(bars.zeroBaseline, 10);
    expect(negative!.height).toBeGreaterThan(0);
    expect(positive!.row.contributors).toEqual([
      expect.objectContaining({ sourceId: 1, included: true }),
      expect.objectContaining({
        sourceId: 2,
        included: false,
        exclusionReason: "Not a finite number",
      }),
    ]);

    const trace = resolveBarTrace(bars, "bar", positive!.id);
    expect(trace).toMatchObject({
      kind: "bar",
      aggregation: "sum of amount",
      domain: { population: "current result" },
      mark: { x: positive!.x, height: positive!.height },
    });
    expect(resolveBarTrace(bars, "bar", "bar:gone")).toBeUndefined();
    expect(findBarForRow(bars, 3)?.id).toBe(negative!.id);
    expect(barAt(bars, positive!.x + 1, positive!.y + 1)?.id).toBe(positive!.id);
  });

  it("keeps count bars in source order, dims filtered categories and uses stable ids", () => {
    const values = ["A", "B", "A", "C"];
    const unfiltered = plan("category", values);
    const filtered = plan("category", values, {
      liveIds: [0, 2, 3],
      extra: { filters: [{ type: "value", field: "category", values: ["A"] }] },
    });
    expect(filtered.mode).toBe("count");
    expect(filtered.groupOrder).toEqual(["A", "B", "C"]);
    expect(filtered.bars.map((bar) => bar.id)).toEqual(
      unfiltered.bars.map((bar) => bar.id)
    );
    // Counts from every source row set the domain, so other filters keep the scale.
    expect(filtered.yScale.domain).toEqual(unfiltered.yScale.domain);
    expect(filtered.domain.upper).toMatchObject({ label: "A", value: 2 });
    const [a, b, c] = filtered.bars;
    expect(a).toMatchObject({ value: 2, selected: true, fill: "blue" });
    expect(b).toMatchObject({ value: 0, selected: false });
    expect(c).toMatchObject({
      value: 1,
      fill: "rgb(156 163 175)",
      fillSource: { kind: "own-filter", baseFill: "blue" },
    });
    expect(findBarForRow(filtered, 3)?.id).toBe(c!.id);
    expect(findBarForRow(filtered, 1)).toBeUndefined();
  });

  it("bins finite values only and lists each bin's source rows", () => {
    const values: datum[] = [1, 2, "", "  ", Infinity, "NaN", 10, null];
    const bins = plan("value", values, { extra: { binCount: 3 } });
    expect(bins.mode).toBe("bin");
    expect(bins.bars.map((bar) => bar.row.contributors.map((c) => c.sourceId)))
      .toEqual([[0, 1], [], [6]]);
    expect(bins.bars.map((bar) => bar.value)).toEqual([2, 0, 1]);
    // The last bin includes its end value.
    expect(bins.bars.at(-1)!.bin).toMatchObject({ end: 10, closed: true });
    expect(bins.bars[0]!.bin?.closed).toBe(false);
    expect(findBarForRow(bins, 4)).toBeUndefined();
    expect(findBarForRow(bins, 2)).toBeUndefined();
    expect(bins.bars[0]!.id).toBe(`bar:bin:1:${1 + 3}`);
  });

  it("counts categories when a field has no finite number", () => {
    const counts = plan("value", ["", Infinity, "NaN"]);
    expect(counts.mode).toBe("count");
  });

  it("plans the guides it draws, including the zero baseline", () => {
    const bars = plan("category", ["A", "B"]);
    const zero = findAxisGuide(bars.axes, "y:zero");
    expect(zero?.guide.line?.y1).toBeCloseTo(bars.zeroBaseline, 10);
    expect(resolveBarTrace(bars, "guide", "y:zero")).toMatchObject({
      kind: "guide",
      guide: { role: "zero" },
      axis: { domainSource: { population: "all source rows" } },
    });
    expect(bars.axes.x.ticks.shown).toEqual(["A", "B"]);
  });
});
