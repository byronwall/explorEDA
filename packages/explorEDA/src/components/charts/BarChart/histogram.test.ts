import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";
import { validateSavedData } from "@/utils/saveDataUtils";
import { finiteNumbers } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { barChartDefinition, type BarChartSettings } from "./definition";
import { planBarChart } from "./barPlan";
import { edgeAt, fitIndices, widthEdges } from "./histogramBins";
import { planHistogram } from "./histogramPlan";

beforeAll(() => registerAllCharts());

/** Fixture A from the engineering histogram plan, keyed by record. */
const A: [string, datum][] = [
  ["a0", -1],
  ["a1", 0],
  ["a2", 2],
  ["a3", 2],
  ["a4", 4],
  ["a5", 6],
  ["a6", 13],
  ["a7", null],
  ["a8", "bad"],
  ["b0", 1],
  ["b1", 2],
  ["b2", 4],
  ["b3", "6"],
  ["b4", 7],
  ["b5", 12],
  ["b6", " "],
  ["b7", Infinity],
  ["c0", 3],
  ["c1", 6],
  ["c2", NaN],
  ["e0", null],
];

function chart(extra: Partial<BarChartSettings> = {}): BarChartSettings {
  return {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "M"
    ),
    id: "hist",
    histogram: {
      binning: {
        mode: "width",
        width: 2,
        origin: 0,
        firstIndex: 0,
        lastIndex: 6,
      },
    },
    ...extra,
  };
}

/** Plans a fixture and reads results back as record keys. */
function run(records: [string, datum][], settings = chart(), order?: string[]) {
  const keys = records.map(([key]) => key);
  const fieldData = Object.fromEntries(
    records.map(([, value], id) => [id, value])
  );
  const ids = (order ?? keys).map((key) => keys.indexOf(key));
  const plan = planHistogram(
    settings,
    records.map(([, value]) => value),
    ids,
    fieldData
  );
  const named = (list: number[]) => list.map((id) => keys[id]).sort();
  return {
    plan,
    named,
    counts: plan.bins.map((bin) => bin.ids.length),
    below: named(plan.tails.below?.ids ?? []),
    above: named(plan.tails.above?.ids ?? []),
  };
}

describe("authored width bins", () => {
  it("counts fixture A into bins and strict coverage tails", () => {
    const { plan, named, counts, below, above } = run(A);
    expect(plan.edges).toEqual([0, 2, 4, 6, 8, 10, 12]);
    expect(counts).toEqual([2, 4, 2, 4, 0, 1]);
    expect(below).toEqual(["a0"]);
    expect(above).toEqual(["a6"]);
    expect(plan.n).toBe(15);
    expect(named(plan.missing)).toEqual(["a7", "b6", "e0"]);
    expect(named(plan.invalid)).toEqual(["a8", "b7", "c2"]);
    // The last bin keeps its upper edge: 12 is in, 13 is a tail.
    expect(named(plan.bins[5]!.ids)).toEqual(["b5"]);
  });

  it("builds decimal edges once and never rounds a measurement into them", () => {
    const C: [string, datum][] = [
      ["d0", 0.1],
      ["d1", 0.2],
      ["d2", 0.3],
      ["d3", 0.30000000000000004],
      ["d4", 0.4],
      ["d5", 0.5],
      ["d6", 0.29999999999999993],
      ["d7", 0.5000000000000001],
      ["d8", 0.09999999999999999],
    ];
    const { plan, named, below, above } = run(
      C,
      chart({
        histogram: {
          binning: {
            mode: "width",
            width: 0.1,
            origin: 0,
            firstIndex: 1,
            lastIndex: 5,
          },
        },
      })
    );
    expect(plan.edges).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
    expect(plan.bins.map((bin) => named(bin.ids))).toEqual([
      ["d0"],
      ["d1", "d6"],
      ["d2", "d3"],
      ["d4", "d5"],
    ]);
    expect(below).toEqual(["d8"]);
    expect(above).toEqual(["d7"]);
  });

  it("fits large magnitudes and rejects edges that collapse", () => {
    expect(fitIndices([8e307, 9e307], 1e307, -1e308)).toEqual({
      firstIndex: 18,
      lastIndex: 19,
    });
    expect(edgeAt(-1e308, 1e307, 18)).toBe(8e307);
    expect(
      widthEdges({
        mode: "width",
        width: 0.1,
        origin: 1e16,
        firstIndex: 0,
        lastIndex: 2,
      })
    ).toEqual({
      problem: "Edges collapse at this magnitude. Use a wider width.",
    });
    expect(
      widthEdges({
        mode: "width",
        width: 1,
        origin: 0,
        firstIndex: 0,
        lastIndex: 513,
      })
    ).toHaveProperty("problem");
    expect(fitIndices([], 2, 0)).toEqual({ firstIndex: 0, lastIndex: 1 });
  });

  it("keeps saved edges and selections when rows change, and Fit covers them", () => {
    // Fixture D: reverse A, change a6 to 5, append b8=14 and r0=4.
    const D: [string, datum][] = [
      ...A.map(([key, value]): [string, datum] => [
        key,
        key === "a6" ? 5 : value,
      ]),
      ["b8", 14],
      ["r0", 4],
    ];
    const order = D.map(([key]) => key).reverse();
    const saved = run(D, chart(), order);
    expect(saved.plan.edges).toEqual([0, 2, 4, 6, 8, 10, 12]);
    expect(saved.plan.n).toBe(17);
    expect(saved.counts).toEqual([2, 4, 4, 4, 0, 1]);

    const fit = fitIndices(finiteNumbers(D.map(([, value]) => value)), 2, 0);
    const selection: Filter = { type: "range", field: "M", min: 10, max: 12 };
    const fitted = run(
      D,
      chart({
        filters: [selection],
        histogram: { binning: { mode: "width", width: 2, origin: 0, ...fit } },
      }),
      order
    );
    expect(fitted.plan.edges).toEqual([-2, 0, 2, 4, 6, 8, 10, 12, 14]);
    expect(fitted.counts).toEqual([1, 2, 4, 4, 4, 0, 0, 2]);
    expect(fitted.plan.tails).toEqual({});
    // The saved inclusive 10..12 still keeps only b5, now in [12, 14].
    expect(fitted.named(fitted.plan.selection!.ids)).toEqual(["b5"]);
    expect(fitted.plan.bins[7]!.selected).toBe(1);
  });

  it("draws tails as bars whose clicks select strict ranges", () => {
    const values = A.map(([, value]) => value);
    const plan = planBarChart({
      settings: chart(),
      width: 600,
      height: 300,
      snapshot: {
        revision: "r",
        allValues: values,
        liveIds: values.map((_, id) => id),
        fieldData: Object.fromEntries(values.map((value, id) => [id, value])),
      },
      getColor: () => "blue",
      getFieldLabel: (name) => name,
    });
    expect(plan.mode).toBe("bin");
    expect(plan.bars.map((bar) => [bar.tail, bar.value])).toEqual([
      ["below", 1],
      [undefined, 2],
      [undefined, 4],
      [undefined, 2],
      [undefined, 4],
      [undefined, 0],
      [undefined, 1],
      ["above", 1],
    ]);
  });
});

describe("authored histograms in saved data and text", () => {
  const rows = A.map(([key, value]) => ({ key, M: value }));
  const filters: Filter[] = [
    { type: "range", field: "M", min: 0, max: 2, maxExclusive: true },
  ];

  it("round-trips width bins and strict ranges through every filter context", () => {
    const text = `filter M=(12..)
rows where.M=[0..2)
bar M @hist where.M=(..0) select.M=[0..2) bins.mode=width bins.width=2 bins.origin=0 bins.first=0 bins.last=6`;
    const built = compileDocument(text, { rows });
    expect(built.diagnostics).toEqual([]);
    const saved = built.settings;
    const bar = saved.charts[0] as BarChartSettings;
    expect(bar.histogram).toEqual(chart().histogram);
    expect(bar.filters).toEqual(filters);
    expect(bar.localFilters).toEqual([
      { type: "range", field: "M", max: 0, maxExclusive: true },
    ]);
    expect(saved.workspaceFilters).toEqual([
      { type: "range", field: "M", min: 12, minExclusive: true },
    ]);
    expect(saved.rowsSettings?.filters).toEqual(filters);
    expect(validateSavedData(saved)).toBe(true);

    const again = exportDocument(saved, { rows });
    expect(again.omitted).toEqual([]);
    expect(again.text).toContain("filter M=(12..)");
    expect(again.text).toContain("select.M=[0..2)");
    expect(again.text).toContain("bins.mode=width");
    const rebuilt = compileDocument(again.text, { rows }).settings;
    expect({ ...rebuilt, metadata: saved.metadata }).toEqual(saved);
  });

  it("rejects saved width bins without a positive width", () => {
    const saved = compileDocument("bar M", { rows }).settings;
    (saved.charts[0] as BarChartSettings).histogram = {
      binning: {
        mode: "width",
        width: 0,
        origin: 0,
        firstIndex: 0,
        lastIndex: 2,
      },
    };
    expect(validateSavedData(saved)).toBe(false);
  });
});

describe("specification limits", () => {
  const limited = (spec: { lower?: number; upper?: number }, filters = []) =>
    chart({
      filters,
      histogram: { ...chart().histogram!, spec },
    });
  const statuses = (settings: BarChartSettings) => {
    const { plan, named } = run(A, settings);
    return {
      below: named(plan.spec!.below),
      within: named(plan.spec!.within),
      above: named(plan.spec!.above),
      counts: [
        plan.spec!.below.length,
        plan.spec!.within.length,
        plan.spec!.above.length,
      ],
    };
  };

  it("counts fixture A as 3 below, 9 within, and 3 above, equality passing", () => {
    const result = statuses(limited({ lower: 2, upper: 6 }));
    expect(result.below).toEqual(["a0", "a1", "b0"]);
    expect(result.above).toEqual(["a6", "b4", "b5"]);
    expect(result.counts).toEqual([3, 9, 3]);
    expect(statuses(limited({ lower: 2, upper: 2 })).counts).toEqual([3, 3, 9]);
    expect(statuses(limited({ lower: 2 })).counts).toEqual([3, 12, 0]);
    expect(statuses(limited({ upper: 6 })).counts).toEqual([0, 12, 3]);
  });

  it("keeps an Outside selection on the chart's current limits", () => {
    const outside: Filter[] = [
      { type: "spec-status", field: "M", region: "outside" },
    ];
    const keys = A.map(([key]) => key);
    const data = Object.fromEntries(A.map(([, value], id) => [id, value]));
    const selected = (settings: BarChartSettings) => {
      const test = barChartDefinition.getFilterFunction(settings, () => data);
      return keys.filter((_, id) => test(id)).sort();
    };
    const before = limited({ lower: 2, upper: 6 }, outside as never);
    expect(selected(before)).toEqual(["a0", "a1", "a6", "b0", "b4", "b5"]);
    expect(run(A, before).plan.selection!.ids).toHaveLength(6);

    const after = limited({ lower: 2, upper: 7 }, outside as never);
    expect(statuses(after).counts).toEqual([3, 10, 2]);
    expect(selected(after)).toEqual(["a0", "a1", "a6", "b0", "b5"]);
    // The [6, 8) bin holds a5, b3, c1, and b4; at upper 6 only b4 fails.
    expect(run(A, before).plan.bins[3]!.selected).toBe(1);
    expect(run(A, after).plan.bins[3]!.selected).toBe(0);
  });

  it("round-trips limits and spec selections through chart text", () => {
    const rows = A.map(([key, value]) => ({ key, M: value }));
    const text = `bar M @hist where.M.spec=within select.M.spec=outside bins.mode=width bins.width=2 bins.origin=0 bins.first=0 bins.last=6 spec.lower=2 spec.upper=6`;
    const built = compileDocument(text, { rows });
    expect(built.diagnostics).toEqual([]);
    const bar = built.settings.charts[0] as BarChartSettings;
    expect(bar.histogram?.spec).toEqual({ lower: 2, upper: 6 });
    expect(bar.filters).toEqual([
      { type: "spec-status", field: "M", region: "outside" },
    ]);
    expect(bar.localFilters).toEqual([
      { type: "spec-status", field: "M", region: "within" },
    ]);
    expect(validateSavedData(built.settings)).toBe(true);
    const again = exportDocument(built.settings, { rows });
    expect(again.text).toContain("select.M.spec=outside");
    expect(again.text).toContain("spec.upper=6");
    const rebuilt = compileDocument(again.text, { rows }).settings;
    expect({ ...rebuilt, metadata: built.settings.metadata }).toEqual(
      built.settings
    );

    // Workspace and Rows filters have no histogram to read limits from.
    const loose = compileDocument("filter M.spec=outside\nbar M", { rows });
    expect(loose.settings.workspaceFilters ?? []).toEqual([]);
    expect(loose.diagnostics[0]?.severity).toBe("error");
  });
});
