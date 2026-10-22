// Local research probe. Copied to research evidence after execution.
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  CrossfilterWrapper,
  workspaceLiveKey,
} from "@/hooks/CrossfilterWrapper";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { dataTableDefinition } from "@/components/charts/DataTable/definition";
import { metricCardDefinition } from "@/components/charts/MetricCard/definition";
import { planMetricCard } from "@/components/charts/MetricCard/metricCardPlan";
import { getFilteredRows } from "@/components/charts/DataTable/filteredRows";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { Filter } from "@/types/FilterTypes";
import type { datum } from "@/types/ChartTypes";
import fixture from "../../../../../docs/research/filter-ownership-2026-10-22/evidence/fixture.json";
import states from "../../../../../docs/research/filter-ownership-2026-10-22/evidence/states.json";
import oracle from "../../../../../docs/research/filter-ownership-2026-10-22/evidence/oracle.json";

beforeAll(registerAllCharts);
afterEach(cleanup);
const rows = fixture.rows.map((row, __ID) => ({ ...row, __ID }));
const column = (field: string): Record<number, datum> =>
  Object.fromEntries(
    rows.map((row) => [row.__ID, (row as Record<string, datum>)[field]])
  );
const names = (ids: number[]) => ids.map((id) => rows[id]!.orderId).sort();
const filter = (field: string, value: string | null): Filter[] =>
  value === null ? [] : [{ type: "value", field, values: [value] }];
const layout = { x: 0, y: 0, w: 6, h: 4 };
const A = {
  ...barChartDefinition.createDefaultSettings(layout, "region"),
  id: "A",
  localFilters: filter("channel", "Web"),
};
const B = {
  ...barChartDefinition.createDefaultSettings(layout, "category"),
  id: "B",
};
const table = {
  ...dataTableDefinition.createDefaultSettings(layout),
  id: "table",
};
const card = {
  ...metricCardDefinition.createDefaultSettings(layout),
  id: "card",
  aggregation: "sum" as const,
  measureField: "amount",
};

it("matches independent literal memberships through six declared states", () => {
  const wrapper = new CrossfilterWrapper(rows, (row) => row.__ID);
  wrapper.setFieldGetter(column);
  [A, B, table, card].forEach((chart) => wrapper.addChart(chart));
  for (const [i, state] of states.entries()) {
    wrapper.updateChart({ ...A, filters: filter("region", state.A_region) });
    wrapper.updateChart({
      ...B,
      filters: filter("category", state.B_category),
    });
    wrapper.setWorkspaceFilters(filter("region", state.W_region));
    const expected = oracle.tasks[i]!;
    const live = wrapper.getAllData();
    const ids = (key: string) =>
      live[key]?.items
        .filter((item) => item.value > 0)
        .map((item) => item.key) ?? [];
    const global = wrapper.getFilteredRowIds();
    expect(names(global)).toEqual(expected.G);
    expect(names(ids("A"))).toEqual(expected.C_A);
    expect(names(ids("B"))).toEqual(expected.P_B);
    expect(names(wrapper.getChartFilteredRowIds(A))).toEqual(expected.M_A);
    expect(
      expected.Q_workspace_region === null
        ? live[workspaceLiveKey("region")]
        : names(ids(workspaceLiveKey("region")))
    ).toEqual(expected.Q_workspace_region ?? undefined);
    const metric = planMetricCard(
      card,
      { revision: "local", liveIds: global, measureData: column("amount") },
      (field) => field,
      (_field, value) => String(value)
    );
    expect([metric.state, metric.value ?? null]).toEqual([
      expected.card_state,
      expected.card_value,
    ]);
    expect(
      names(
        metric.contributors
          .filter((item) => item.included)
          .map((item) => item.sourceId)
      )
    ).toEqual(expected.card_valid);
    expect(
      names(
        getFilteredRows(rows, live.table, {
          ...table,
          globalSearch: state.table_search,
        }).map((row) => row.__ID)
      )
    ).toEqual(expected.table_rows);
    const selected = rows.filter((row) => global.includes(row.__ID));
    expect(
      names(
        getFilteredRows(
          selected,
          { nonce: 0, items: global.map((key) => ({ key, value: 1 })) },
          {
            ...table,
            globalSearch: state.rows_search,
            filters: filter("status", state.rows_status),
          }
        ).map((row) => row.__ID)
      )
    ).toEqual(expected.rows_rows);
  }
});

it("retains notebook workspace scope without linked chart dimensions", () => {
  const wrapper = new CrossfilterWrapper(rows, (row) => row.__ID);
  wrapper.localSelections = true;
  wrapper.setFieldGetter(column);
  wrapper.addChart({ ...A, filters: filter("region", "West") });
  wrapper.addChart({ ...B, filters: filter("category", "Tech") });
  wrapper.setWorkspaceFilters(filter("region", "East"));
  expect(names(wrapper.getFilteredRowIds())).toEqual(oracle.notebook_T3.G);
  expect(names(wrapper.getChartFilteredRowIds(A))).toEqual(
    oracle.notebook_T3.getChartFilteredRowIds_A
  );
});

const useLayer = () => useDataLayer((state) => state);
it("clears active owners but retains local population and distinguishes aggregate inputs", () => {
  let state!: ReturnType<typeof useLayer>;
  function Read() {
    state = useLayer();
    return null;
  }
  render(
    <DataLayerProvider
      data={fixture.rows}
      fieldTypes={{ amount: "number" }}
      charts={[A, B, table, card]}
    >
      <Read />
    </DataLayerProvider>
  );
  act(() => {
    state.updateChart("A", { filters: filter("region", "West") });
    state.updateChart("B", { filters: filter("category", "Tech") });
    state.setWorkspaceFilter("region", filter("region", "West")[0]);
    state.updateChart("table", { globalSearch: "rush" });
    state.updateRowsSettings({
      globalSearch: "red",
      filters: filter("status", "Open"),
    });
  });
  expect(names(state.crossfilterWrapper.getFilteredRowIds())).toEqual(
    oracle.tasks[2]!.G
  );
  let aggregate!: ReturnType<typeof state.addAggregate>;
  act(() => {
    aggregate = state.addAggregate({
      name: "Amount by category",
      groupField: "category",
      measureField: "amount",
      aggregation: "sum",
    });
  });
  const peerIds = state
    .getLiveItems(state.charts.find((chart) => chart.id === "B")!)!
    .items.filter((item) => item.value > 0)
    .map((item) => item.key);
  const contextual = state.getAggregateResult(aggregate.id, peerIds)!;
  const selected = state.getAggregateResult(aggregate.id)!;
  expect(contextual.rows.map((row) => row.value)).toEqual([80, 200]);
  expect(selected.rows.map((row) => row.value)).toEqual([200]);
  act(() => state.clearAllFilters());
  expect(names(state.crossfilterWrapper.getFilteredRowIds())).toEqual(
    oracle.full
  );
  expect(state.charts.find((chart) => chart.id === "A")!.localFilters).toEqual(
    A.localFilters
  );
  expect(state.workspaceFilters).toEqual([]);
  expect(state.rowsSettings.globalSearch).toBe("");
  expect(state.rowsSettings.filters).toEqual([]);
  expect(
    (state.charts.find((chart) => chart.id === "table") as typeof table)
      .globalSearch
  ).toBe("");
});
