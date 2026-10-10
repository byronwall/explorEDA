import { getChartDefinition } from "@/charts/registry";
import { applyFilter } from "@/hooks/applyFilter";
import { getPopulationTest, restrictToPopulation } from "@/lib/chartPopulation";
import { IdType } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import crossfilter from "crossfilter2";
import isEqual from "react-fast-compare";

type FieldValue = string | number | boolean | null | undefined;

type ChartDimension<TData, TId extends IdType> = {
  dimension: crossfilter.Dimension<TData, TId>;
  chart: ChartSettings;
  group: crossfilter.Group<TData, TId, number>;
};

type WorkspaceDimension<TData, TId extends IdType> = {
  dimension: crossfilter.Dimension<TData, TId>;
  filter: Filter;
  group: crossfilter.Group<TData, TId, number>;
};

/** The live items key for a workspace filter on one field. */
export function workspaceLiveKey(field: string) {
  return `workspace:${field}`;
}

export class CrossfilterWrapper<T> {
  ref: crossfilter.Crossfilter<T>;
  private nonce = 0;
  charts: Map<string, ChartDimension<T, IdType>> = new Map();
  /**
   * Filters no chart owns, one dimension per field. Like a chart's own
   * filter, a field's dimension leaves its own filter out of its group, so
   * that field's control can still show every value the other filters allow.
   */
  workspace: Map<string, WorkspaceDimension<T, IdType>> = new Map();
  idFunction: (item: T) => IdType;

  // assume this gets set after creation
  fieldGetter: (name: string) => Record<IdType, FieldValue> = () => ({});

  constructor(data: T[], idFunction: (item: T) => IdType) {
    this.ref = crossfilter(data);
    this.idFunction = idFunction;
  }

  setFieldGetter(fieldGetter: (name: string) => Record<IdType, FieldValue>) {
    this.fieldGetter = fieldGetter;
  }

  updateChart(chart: ChartSettings) {
    const existing = this.charts.get(chart.id);
    if (!existing) {
      this.addChart(chart);
      return;
    }
    if (!isEqual(existing.chart, chart)) this.updateChartFilters(chart);
    existing.chart = chart;
  }

  updateChartFilters(chart: ChartSettings) {
    // get the filters from the chart
    const filterFunc = this.getFilterFunction(chart);

    const foundChart = this.charts.get(chart.id);

    // apply the filters to the dimension
    const dimension = foundChart?.dimension;
    if (!dimension) {
      return;
    }

    dimension.filterFunction(filterFunc);

    // this gives an object with key + value
    // the value will be 1 if the item should be rendered
    // will still need to check the value = 1 items in the actual chart with the filter func again
    // ideally wire up the hook to the raw crossfilter obj so charts can get IDs to render per dim
  }

  addChart(chart: ChartSettings) {
    // need to create a dimension for the chart
    const dimension = this.ref.dimension(this.idFunction);

    const chartDimension: ChartDimension<T, IdType> = {
      dimension,
      chart,
      group: dimension.group<IdType, number>(),
    };

    this.charts.set(chart.id, chartDimension);

    this.updateChartFilters(chart);
  }

  removeChart(chart: ChartSettings) {
    const savedChart = this.charts.get(chart.id);
    if (!savedChart) {
      throw new Error(`Chart ${chart.id} not found`);
    }

    savedChart.dimension.filterAll();
    savedChart.group.dispose();
    savedChart.dimension.dispose();
    this.charts.delete(chart.id);
  }

  removeAllCharts() {
    // Clear and dispose all dimensions
    for (const chart of this.charts.values()) {
      chart.dimension.filterAll();
      chart.group.dispose();
      chart.dimension.dispose();
    }
    // Clear the charts map
    this.charts.clear();
  }

  /**
   * Applies the workspace's filters: at most one per field. `refresh`
   * re-reads every column, for when calculated values change.
   */
  setWorkspaceFilters(filters: readonly Filter[], refresh = false) {
    const next = new Map(filters.map((filter) => [filter.field, filter]));
    for (const [field, entry] of this.workspace) {
      if (next.has(field)) continue;
      entry.dimension.filterAll();
      entry.group.dispose();
      entry.dimension.dispose();
      this.workspace.delete(field);
    }
    for (const [field, filter] of next) {
      const existing = this.workspace.get(field);
      if (!refresh && existing && isEqual(existing.filter, filter)) continue;
      const entry = existing ?? this.addWorkspaceDimension(field, filter);
      entry.filter = filter;
      // Look the column up once; the test runs once per row.
      const values = this.fieldGetter(field);
      entry.dimension.filterFunction((id) => applyFilter(values[id], filter));
    }
  }

  private addWorkspaceDimension(field: string, filter: Filter) {
    const dimension = this.ref.dimension(this.idFunction);
    const entry: WorkspaceDimension<T, IdType> = {
      dimension,
      filter,
      group: dimension.group<IdType, number>(),
    };
    this.workspace.set(field, entry);
    return entry;
  }

  getFilterFunction(chart: ChartSettings): (d: IdType) => boolean {
    const definition = getChartDefinition(chart.type);
    return definition.getFilterFunction(chart, this.fieldGetter);
  }

  getFilteredRowCount() {
    return this.ref.allFiltered().length;
  }

  getFilteredRowIds(): IdType[] {
    return this.ref.allFiltered().map(this.idFunction);
  }

  /** Rows that pass every filter and belong to the chart's own population. */
  getChartFilteredRowIds(chart: ChartSettings): IdType[] {
    return restrictToPopulation(
      this.getFilteredRowIds(),
      chart,
      this.fieldGetter
    );
  }

  getAllData() {
    // obj with key as id and value as datum

    // id -> count
    const data: LiveItemMap = {};

    const commonNonce = ++this.nonce;

    for (const chart of this.charts.values()) {
      // Rows outside a chart's own population do not exist for that chart.
      const inPopulation = getPopulationTest(chart.chart, this.fieldGetter);
      const items = chart.group.all();
      data[chart.chart.id] = {
        items: inPopulation
          ? items.filter((item) => inPopulation(item.key))
          : items,
        nonce: commonNonce,
      };
    }
    for (const [field, entry] of this.workspace) {
      data[workspaceLiveKey(field)] = {
        items: entry.group.all(),
        nonce: commonNonce,
      };
    }

    return data;
  }
}

export type LiveItem = {
  items: readonly crossfilter.Grouping<IdType, number>[];
  nonce: number;
};

export type LiveItemMap = Record<string, LiveItem>;
