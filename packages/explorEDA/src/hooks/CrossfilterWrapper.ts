import { getChartDefinition } from "@/charts/registry";
import { IdType } from "@/providers/DataLayerProvider";
import { ChartSettings } from "@/types/ChartTypes";
import crossfilter from "crossfilter2";
import isEqual from "react-fast-compare";

type FieldValue = string | number | boolean | undefined;

type ChartDimension<TData, TId extends IdType> = {
  dimension: crossfilter.Dimension<TData, TId>;
  chart: ChartSettings;
};

export class CrossfilterWrapper<T> {
  ref: crossfilter.Crossfilter<T>;
  charts: Map<string, ChartDimension<T, IdType>> = new Map();
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
    // check if the filters have changed
    const oldChart = this.charts.get(chart.id);

    // Compare filters directly
    if (!isEqual(oldChart?.chart.filters, chart.filters)) {
      this.updateChartFilters(chart);
    }

    // need to update internal defs so diff works again

    if (!oldChart) {
      // will hit this case if we did an update and should have done remove/add
      this.charts.set(chart.id, {
        dimension: this.ref.dimension(this.idFunction),
        chart,
      });
    } else {
      this.charts.set(chart.id, {
        ...oldChart,
        chart,
      });
    }
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
    savedChart.dimension.dispose();
    this.charts.delete(chart.id);
  }

  removeAllCharts() {
    // Clear and dispose all dimensions
    for (const chart of this.charts.values()) {
      chart.dimension.filterAll();
      chart.dimension.dispose();
    }
    // Clear the charts map
    this.charts.clear();
  }

  getFilterFunction(chart: ChartSettings): (d: IdType) => boolean {
    const definition = getChartDefinition(chart.type);
    return definition.getFilterFunction(chart, this.fieldGetter);
  }

  getAllData() {
    // obj with key as id and value as datum

    // id -> count
    const data: LiveItemMap = {};

    const commonNonce = new Date().getTime();

    for (const chart of this.charts.values()) {
      data[chart.chart.id] = {
        items: chart.dimension.group<IdType, number>().all(),
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
