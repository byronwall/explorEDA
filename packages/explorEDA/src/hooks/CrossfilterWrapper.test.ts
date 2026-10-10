import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { getChartDefinition } from "@/charts/registry";
import type { ChartSettings } from "@/types/ChartTypes";
import { CrossfilterWrapper, workspaceLiveKey } from "./CrossfilterWrapper";
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

  describe("workspace filters", () => {
    const rows = [
      { __ID: 0, region: "West", units: 5, day: "2024-01-03" },
      { __ID: 1, region: "East", units: 15, day: "2024-02-10" },
      { __ID: 2, region: "West", units: 25, day: "2024-03-20" },
      { __ID: 3, region: "South", units: 35, day: "2024-04-01" },
      { __ID: 4, region: null, units: null, day: null },
    ];
    const makeWrapper = () => {
      const wrapper = new CrossfilterWrapper(rows, (row) => row.__ID);
      wrapper.setFieldGetter((field) =>
        Object.fromEntries(
          rows.map((row) => [row.__ID, row[field as keyof typeof row]])
        )
      );
      return wrapper;
    };
    const liveIds = (wrapper: ReturnType<typeof makeWrapper>, key: string) =>
      wrapper
        .getAllData()
        [key]!.items.filter((item) => item.value > 0)
        .map((item) => item.key);

    it("narrows every chart exactly as a chart's linked filter does", () => {
      const bar = {
        ...getChartDefinition("bar").createDefaultSettings({
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        }),
        id: "bar",
        field: "region",
      } as ChartSettings;
      const viaChart = makeWrapper();
      viaChart.addChart({
        ...bar,
        filters: [{ type: "value", field: "region", values: ["West"] }],
      } as ChartSettings);
      viaChart.addChart(makeChart("table", []));

      const viaWorkspace = makeWrapper();
      viaWorkspace.addChart(bar);
      viaWorkspace.addChart(makeChart("table", []));
      viaWorkspace.setWorkspaceFilters([
        { type: "value", field: "region", values: ["West"] },
      ]);

      expect(viaWorkspace.getFilteredRowIds()).toEqual(
        viaChart.getFilteredRowIds()
      );
      expect(liveIds(viaWorkspace, "table")).toEqual([0, 2]);
      // Unlike a chart's own filter, a workspace filter narrows every chart.
      expect(liveIds(viaWorkspace, "bar")).toEqual([0, 2]);
    });

    it("applies range and date filters and narrows with no charts", () => {
      const wrapper = makeWrapper();
      wrapper.setWorkspaceFilters([
        { type: "range", field: "units", min: 10, max: 30 },
        { type: "date-range", field: "day", max: "2024-02-29" },
      ]);
      expect(wrapper.getFilteredRowIds()).toEqual([1]);
    });

    it("leaves a field's own filter out of that field's live items", () => {
      const wrapper = makeWrapper();
      wrapper.setWorkspaceFilters([
        { type: "value", field: "region", values: ["West"] },
        { type: "range", field: "units", min: 10 },
      ]);
      expect(wrapper.getFilteredRowIds()).toEqual([2]);
      // Region still sees every region the units filter allows.
      expect(liveIds(wrapper, workspaceLiveKey("region"))).toEqual([1, 2, 3]);
      expect(liveIds(wrapper, workspaceLiveKey("units"))).toEqual([0, 2]);
    });

    it("replaces a field's filter and restores every row when removed", () => {
      const wrapper = makeWrapper();
      wrapper.setWorkspaceFilters([
        { type: "value", field: "region", values: ["West"] },
      ]);
      wrapper.setWorkspaceFilters([
        { type: "value", field: "region", values: ["East"] },
      ]);
      expect(wrapper.getFilteredRowIds()).toEqual([1]);
      wrapper.setWorkspaceFilters([]);
      expect(wrapper.getFilteredRowCount()).toBe(rows.length);
      expect(wrapper.workspace.size).toBe(0);
      expect(wrapper.getAllData()).not.toHaveProperty(
        workspaceLiveKey("region")
      );
    });

    it("works past 32 dimensions", () => {
      const wrapper = makeWrapper();
      for (let index = 0; index < 34; index++) {
        wrapper.addChart(makeChart(`chart-${index}`, []));
      }
      wrapper.setWorkspaceFilters([
        { type: "value", field: "region", values: ["South"] },
      ]);
      expect(wrapper.getFilteredRowIds()).toEqual([3]);
      expect(liveIds(wrapper, "chart-33")).toEqual([3]);
    });
  });
});
