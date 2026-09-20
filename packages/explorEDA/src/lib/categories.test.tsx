import { ColumnFilter } from "@/components/charts/DataTable/components/ColumnFilter";
import { buildFieldProfiles } from "./fieldProfiles";
import { vi } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { useEffect } from "react";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { useGetAllIds } from "@/components/charts/useGetLiveData";
import { ActiveFilterStatus } from "@/components/ActiveFilterStatus";
import { RowChart } from "@/components/charts/RowChart/RowChart";
import { rowChartDefinition } from "@/components/charts/RowChart/definition";
import { BarChart } from "@/components/charts/BarChart/BarChart";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { groupFacetData } from "@/components/charts/FacetRelated/FacetContainer";
import { categoryKey, categoryLabel } from "./categories";

beforeAll(registerAllCharts);

function FilterProbe({ chartId }: { chartId: string }) {
  const filters = useDataLayer(
    (state) => state.charts.find((item) => item.id === chartId)?.filters ?? []
  );
  const values = filters.flatMap((filter) =>
    filter.type === "value"
      ? filter.values.map((value) => typeof value + ":" + String(value))
      : []
  );
  return <div data-testid="category-filter">{values.join("|")}</div>;
}

function CategoryChart({ chartId }: { chartId: string }) {
  const settings = useDataLayer((state) =>
    state.charts.find((item) => item.id === chartId)
  );
  if (!settings || (settings.type !== "row" && settings.type !== "bar"))
    return null;
  return settings.type === "row" ? (
    <RowChart settings={settings} width={700} height={600} />
  ) : (
    <BarChart settings={settings} width={700} height={600} />
  );
}

it("clicks typed and missing categories without merging their rows or facet keys", () => {
  const values = [
    1,
    "1",
    true,
    "true",
    null,
    undefined,
    "a__b",
    "__proto__",
    NaN,
    Infinity,
    -Infinity,
  ];
  const data = values.map((category) => ({ category }));
  const total = values.length;
  for (const type of ["row", "bar"] as const) {
    const definition = type === "row" ? rowChartDefinition : barChartDefinition;
    const chart = {
      ...definition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 6 },
        "category"
      ),
      forceString: true,
    };
    render(
      <DataLayerProvider data={data} charts={[chart]}>
        <ActiveFilterStatus />
        <FilterProbe chartId={chart.id} />
        <CategoryChart chartId={chart.id} />
      </DataLayerProvider>
    );
    for (const value of [
      1,
      "1",
      true,
      "true",
      null,
      NaN,
      Infinity,
      -Infinity,
    ]) {
      const expectedCount = value === null ? 2 : 1;
      fireEvent.click(
        screen.getByRole("button", {
          name: `${categoryLabel(value)}: ${expectedCount} ${type === "row" ? "rows" : "records"}`,
        })
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        `Showing ${expectedCount} of ${total} rows`
      );
      expect(screen.getByTestId("category-filter")).toHaveTextContent(
        `${typeof value}:${String(value)}`
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: `${categoryLabel(value)}: ${expectedCount} ${type === "row" ? "rows" : "records"}`,
        })
      );
      expect(screen.getByRole("status")).toHaveTextContent(
        `Showing ${total} of ${total} rows`
      );
      expect(screen.getByTestId("category-filter")).toHaveTextContent("");
    }
    cleanup();
  }
  const facets = groupFacetData(
    [0, 1, 2, 3, 4],
    { 0: 1, 1: "1", 2: "a__b", 3: "a", 4: "__proto__" },
    { 0: "x", 1: "x", 2: "c", 3: "b__c", 4: "" }
  );
  expect(facets).toHaveLength(5);
  expect(facets.map((facet) => facet.ids)).toEqual([[0], [1], [2], [3], [4]]);
  expect(facets.map((facet) => facet.rowRawValue)).toEqual([
    1,
    "1",
    "a__b",
    "a",
    "__proto__",
  ]);
});

it("keeps mixed types in table category options", () => {
  const profile = buildFieldProfiles([
    { value: 1 },
    { value: "1" },
    { value: true },
    { value: "true" },
    { value: "__proto__" },
  ])[0]!;
  const onChange = vi.fn();
  render(
    <ColumnFilter
      columnId="value"
      columnLabel="value"
      profile={profile}
      onChange={onChange}
      onClear={() => {}}
    />
  );
  fireEvent.click(screen.getByRole("checkbox", { name: '\"1\"' }));
  expect(onChange).toHaveBeenLastCalledWith("value", {
    type: "value",
    field: "value",
    values: ["1"],
  });
  fireEvent.click(screen.getByRole("checkbox", { name: "1" }));
  expect(onChange).toHaveBeenLastCalledWith("value", {
    type: "value",
    field: "value",
    values: [1],
  });
});

it("keeps row bars separate when display precision makes labels equal", async () => {
  const chart = rowChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "category"
  );
  function ApplyDisplayFormat() {
    const updateFieldSettings = useDataLayer(
      (state) => state.updateFieldSettings
    );
    useEffect(() => {
      updateFieldSettings("category", { format: "number", precision: 0 });
    }, [updateFieldSettings]);
    return null;
  }

  render(
    <DataLayerProvider data={[{ category: 1.1 }, { category: 1.2 }]} charts={[chart]}>
      <ApplyDisplayFormat />
      <CategoryChart chartId={chart.id} />
    </DataLayerProvider>
  );

  await waitFor(() => {
    expect(screen.getAllByRole("button", { name: "1: 1 rows" })).toHaveLength(2);
  });
  cleanup();
});

it("keeps non-finite categories distinct", () => {
  expect(new Set([NaN, Infinity, -Infinity].map(categoryKey)).size).toBe(3);
});

it("refreshes facet IDs and groups when the provider data changes size", () => {
  let replaceData!: (rows: { category: string }[]) => void;
  function Probe() {
    const ids = useGetAllIds();
    const getColumnData = useDataLayer((state) => state.getColumnData);
    replaceData = useDataLayer((state) => state.setData);
    const groups = groupFacetData(ids, getColumnData("category"), null);
    return (
      <>
        <output data-testid="facet-ids">{ids.join(",")}</output>
        <output data-testid="facet-groups">
          {groups.map((group) => group.rowValue).join(",")}
        </output>
      </>
    );
  }

  render(
    <DataLayerProvider data={[{ category: "A" }, { category: "B" }]}>
      <Probe />
    </DataLayerProvider>
  );
  expect(screen.getByTestId("facet-ids")).toHaveTextContent("0,1");
  expect(screen.getByTestId("facet-groups")).toHaveTextContent("A,B");

  act(() =>
    replaceData([{ category: "A" }, { category: "B" }, { category: "C" }])
  );
  expect(screen.getByTestId("facet-ids")).toHaveTextContent("0,1,2");
  expect(screen.getByTestId("facet-groups")).toHaveTextContent("A,B,C");

  act(() => replaceData([{ category: "Z" }]));
  expect(screen.getByTestId("facet-ids")).toHaveTextContent("0");
  expect(screen.getByTestId("facet-groups")).toHaveTextContent("Z");
  cleanup();
});
