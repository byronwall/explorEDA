import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import type { SavedChartSettings } from "@/types/SavedDataTypes";
import { compileDocument } from "./compile";
import { exportDocument } from "./export";

beforeAll(() => registerAllCharts());

const rows = [
  { Day: 31, Date: "2024-06-03", Region: "West", Revenue: 10, Units: 2 },
  { Day: 32, Date: "2024-07-15", Region: "East", Revenue: 20, Units: 3 },
  { Day: 33, Date: "2024-09-02", Region: "West", Revenue: 15, Units: 1 },
];

function build(text: string) {
  const result = compileDocument(text, { rows });
  return {
    result,
    charts: result.settings.charts as SavedChartSettings[],
    again: () => {
      const { text: written } = exportDocument(result.settings, { rows });
      return { written, rebuilt: compileDocument(written, { rows }) };
    },
  };
}

describe("annotations", () => {
  it("reads child lines into the chart's annotations, with ISO dates", () => {
    const { result, charts, again } = build(`line @sales x=Date y=Revenue {
  band x=2024-06-01..2024-08-31 "Summer sale" display=bracket
  rule y=mean "Mean revenue" population=all
  callout "Peak" on=Day:32 offset=-10,12 leader=false
}`);
    expect(result.diagnostics).toEqual([]);
    expect(
      (charts[0] as unknown as { annotations: unknown[] }).annotations
    ).toEqual([
      {
        id: "sales-band-1",
        type: "band",
        axis: "x",
        from: Date.UTC(2024, 5, 1),
        to: Date.UTC(2024, 7, 31),
        label: "Summer sale",
        display: "bracket",
      },
      {
        id: "sales-reference-line-1",
        type: "reference-line",
        axis: "y",
        value: 0,
        calculated: { statistic: "mean", population: "all" },
        label: "Mean revenue",
      },
      {
        id: "sales-callout-1",
        type: "callout",
        text: "Peak",
        attach: { kind: "record", keyFields: ["Day"], key: [32] },
        offset: { dx: -10, dy: 12 },
        leader: false,
      },
    ]);
    const { written, rebuilt } = again();
    expect(written).toContain('band x=2024-06-01..2024-08-31 "Summer sale"');
    expect(written).not.toMatch(/annotations|\d{12}/);
    expect(rebuilt.settings.charts).toEqual(result.settings.charts);
  });

  it("names a bad annotation line and builds the chart", () => {
    const { result, charts } = build(`scatter x=Units y=Revenue {
  rule z=4
  band x=1..
}`);
    expect(result.diagnostics.map((item) => item.message)).toEqual([
      "A rule is on x or y, so this one was skipped.",
      "A band spans a range on x or y, so this one was skipped.",
    ]);
    expect(charts).toHaveLength(1);
  });
});

describe("lists of records", () => {
  it("writes columns, values, and axes as child lines and reads them back", () => {
    const { result, again } = build(`table @orders {
  column Revenue width=140
  column Region
}
pivot @months rows=Region {
  value sum(Revenue) label="Revenue"
  value avg(Units)
}
parallel @shape {
  axis Units inverted=true
  axis Revenue
}`);
    expect(result.diagnostics).toEqual([]);
    const [table, pivot, parallel] = result.settings.charts as unknown as Array<
      Record<string, unknown>
    >;
    expect(table!.columns).toEqual([
      { id: "Revenue", field: "Revenue", width: 140 },
      { id: "Region", field: "Region" },
    ]);
    expect(pivot!.rowFields).toEqual(["Region"]);
    expect(pivot!.valueFields).toEqual([
      { field: "Revenue", aggregation: "sum", label: "Revenue" },
      { field: "Units", aggregation: "avg" },
    ]);
    expect(parallel!.axes).toEqual([
      { field: "Units", inverted: true },
      { field: "Revenue", inverted: false },
    ]);
    const { written, rebuilt } = again();
    expect(written).toContain("column Revenue width=140");
    expect(written).toContain("value sum(Revenue) label=Revenue");
    expect(written).toContain("axis Units inverted=true");
    expect(written).not.toMatch(/\.\d+\.|\[\]=/);
    expect(rebuilt.settings.charts).toEqual(result.settings.charts);
  });
});

describe("aggregates and color maps", () => {
  it("reads sum(), avg(), and count, and asks for them by name", () => {
    const { result, charts } = build(`metric @a sum(Revenue)
metric @b avg(Units)
metric @c count
metric @d sum=Revenue
group @byRegion sum(Revenue) by=Region
row Region group=byRegion`);
    expect(
      charts.map((chart) => (chart as { aggregation?: string }).aggregation)
    ).toEqual(["sum", "average", "count", undefined]);
    expect(result.settings.aggregates).toEqual([
      {
        id: "byRegion",
        name: "byRegion",
        groupField: "Region",
        aggregation: "sum",
        measureField: "Revenue",
      },
    ]);
    expect(result.diagnostics.map((item) => item.message)).toEqual([
      "metric @d (line 4) needs count, sum(field), or avg(field), so it was skipped.",
    ]);
  });

  it("gives each value its own color with map=", () => {
    const { result, again } = build(
      `scale @regions field=Region map=West:#3479a8,"East":#c77a45\nrow Region colorScale=regions`
    );
    expect(result.diagnostics).toEqual([]);
    expect(result.settings.colorScales).toEqual([
      {
        id: "regions",
        name: "Region",
        type: "categorical",
        palette: ["#3479a8", "#c77a45"],
        mapping: [
          ["West", "#3479a8"],
          ["East", "#c77a45"],
        ],
        sourceField: "Region",
      },
    ]);
    const { written, rebuilt } = again();
    expect(written).toContain(
      "scale @regions field=Region map=West:#3479a8,East:#c77a45"
    );
    expect(rebuilt.settings.colorScales).toEqual(result.settings.colorScales);
  });
});
