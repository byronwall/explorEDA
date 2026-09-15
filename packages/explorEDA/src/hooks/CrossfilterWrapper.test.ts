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
});
