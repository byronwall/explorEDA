import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileNotebook } from "@/lib/notebook";
import { exploreChartCopy } from "./exploreCopy";

const rows = [
  { region: "North", sales: 4 },
  { region: "South", sales: 9 },
];
const text = [
  "```eda",
  "calc double = sales * 2",
  "row @a region",
  "scatter @b x=sales y=double",
  "```",
].join("\n");

beforeAll(() => registerAllCharts());

describe("exploreChartCopy", () => {
  it("adds copies under each other with the notebook's calculations once", () => {
    const { settings } = compileNotebook(text, { rows });
    const first = exploreChartCopy(settings, "b");
    const both = exploreChartCopy(settings, "b", first);
    expect(both.charts.map((chart) => chart.id)).toEqual([
      "b-copy",
      "b-copy-2",
    ]);
    expect(both.charts[1]!.layout.y).toBe(
      first.charts[0]!.layout.y + first.charts[0]!.layout.h
    );
    expect(
      both.calculations.filter((item) => item.resultColumnName === "double")
    ).toHaveLength(1);
  });
});
