import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { CrossfilterWrapper } from "./CrossfilterWrapper";
import {
  dataTableDefinition,
  DataTableSettings,
} from "@/components/charts/DataTable/definition";

const makeChart = (id: string, filters: DataTableSettings["filters"]) => ({
  ...dataTableDefinition.createDefaultSettings({ x: 0, y: 0, w: 1, h: 1 }),
  id,
  columns: [
    { id: "name", field: "name" },
    { id: "category", field: "category" },
  ],
  filters,
});

describe("CrossfilterWrapper", () => {
  beforeAll(() => registerAllCharts());

  it("counts rows that survive every chart filter", () => {
    const data = [
      { __ID: 0, name: "A", category: "x" },
      { __ID: 1, name: "B", category: "x" },
      { __ID: 2, name: "A", category: "y" },
    ];
    const wrapper = new CrossfilterWrapper(data, (row) => row.__ID);

    wrapper.setFieldGetter((field) =>
      Object.fromEntries(
        data.map((row) => [row.__ID, row[field as keyof typeof row]])
      )
    );
    wrapper.addChart(
      makeChart("names", [
        { type: "text", field: "name", operator: "equals", value: "A" },
      ])
    );
    wrapper.addChart(
      makeChart("categories", [
        { type: "value", field: "category", values: ["x"] },
      ])
    );

    expect(wrapper.ref.size()).toBe(3);
    expect(wrapper.getFilteredRowCount()).toBe(1);
  });

  it("keeps a chart's local filters out of every other chart", () => {
    const data = [
      { __ID: 0, name: "A", category: "web" },
      { __ID: 1, name: "B", category: "web" },
      { __ID: 2, name: "C", category: "store" },
      { __ID: 3, name: "D", category: null },
    ];
    const wrapper = new CrossfilterWrapper(data, (row) => row.__ID);
    wrapper.setFieldGetter((field) =>
      Object.fromEntries(
        data.map((row) => [row.__ID, row[field as keyof typeof row]])
      )
    );
    const live = (id: string) =>
      wrapper
        .getAllData()
        [id]!.items.filter((item) => item.value > 0)
        .map((item) => item.key);

    wrapper.addChart({
      ...makeChart("web", []),
      localFilters: [{ type: "value", field: "category", values: ["web"] }],
    });
    wrapper.addChart({
      ...makeChart("store", []),
      localFilters: [{ type: "value", field: "category", values: ["store"] }],
    });
    wrapper.addChart(makeChart("all", []));

    expect(live("web")).toEqual([0, 1]);
    expect(live("store")).toEqual([2]);
    expect(live("all")).toEqual([0, 1, 2, 3]);
    expect(wrapper.getFilteredRowCount()).toBe(4);

    // A linked selection on one chart still reaches the others.
    wrapper.updateChart({
      ...makeChart("all", [
        { type: "text", field: "name", operator: "equals", value: "B" },
      ]),
    });
    expect(live("web")).toEqual([1]);
    expect(live("store")).toEqual([]);
  });

  it("shows no rows when a local filter names a missing field", () => {
    const data = [{ __ID: 0, name: "A", category: "web" }];
    const wrapper = new CrossfilterWrapper(data, (row) => row.__ID);
    wrapper.setFieldGetter(() => ({}));
    wrapper.addChart({
      ...makeChart("broken", []),
      localFilters: [{ type: "range", field: "missing", min: 0 }],
    });
    const items = wrapper.getAllData().broken!.items;
    expect(items).toEqual([]);
  });
});
