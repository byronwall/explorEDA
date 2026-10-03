import { scaleBand } from "d3-scale";
import { applyFilter } from "@/hooks/applyFilter";
import type { AggregateResult } from "@/lib/aggregates";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { describeScale, planAxes } from "../Axis/axisPlan";
import { numericScale } from "../Axis/numericScale";
import type { BarChartSettings } from "./definition";
import type { BarChartPlan, BarMark } from "./barPlan";

export interface SeriesSummary {
  value: datum;
  result: AggregateResult;
}

export function selectSeriesBar(settings: BarChartSettings, bar: BarMark) {
  const next = bar.selection ?? [];
  const fields = new Set(next.map((filter) => filter.field));
  const own = settings.filters.filter((filter) => fields.has(filter.field));
  const rest = settings.filters.filter((filter) => !fields.has(filter.field));
  return JSON.stringify(own) === JSON.stringify(next)
    ? rest
    : [...rest, ...next];
}

export function planSeriesBars({
  settings,
  summaries,
  revision,
  width,
  height,
  getColor,
  getLabel,
  format,
  facetFilters = [],
  categoryOrder = [],
}: {
  settings: BarChartSettings;
  summaries: SeriesSummary[];
  revision: string;
  width: number;
  height: number;
  getColor: (value: datum) => string;
  getLabel: (field: string) => string;
  format: (field: string, value: datum) => string;
  facetFilters?: Filter[];
  categoryOrder?: datum[];
}) {
  const spec = summaries[0]?.result.spec;
  const field = spec?.groupField ?? settings.field;
  const seriesField = settings.seriesField!;
  const operation = spec?.aggregation ?? "count";
  const valueLabel =
    operation === "count"
      ? "Row count"
      : `${operation === "sum" ? "Sum" : "Average"} of ${getLabel(spec?.measureField ?? "")}`;
  const formatValue = (value: number) =>
    operation === "count"
      ? value.toLocaleString("en-US")
      : format(spec?.measureField ?? "", value);
  const liveCategories = new Set(
    summaries.flatMap(({ result }) =>
      result.rows.map((row) => categoryKey(row.groupValue))
    )
  );
  const categories = new Map(
    categoryOrder
      .filter((value) => liveCategories.has(categoryKey(value)))
      .map((value) => [categoryKey(value), categoryValue(value)])
  );
  summaries.forEach(({ result }) =>
    result.rows.forEach((row) =>
      categories.set(categoryKey(row.groupValue), categoryValue(row.groupValue))
    )
  );
  const legend = summaries.map(({ value, result }) => ({
    key: categoryKey(value),
    value,
    label: categoryLabel(value),
    color: getColor(value),
    count: result.sourceRowCount,
  }));
  const rows = summaries.flatMap(({ value, result }) =>
    result.rows.map((row) => ({ row, seriesValue: value }))
  );
  const categoryPositions = new Map(
    [...categories.keys()].map((key, index) => [key, index])
  );
  const seriesPositions = new Map(
    legend.map((item, index) => [item.key, index])
  );
  rows.sort(
    (a, b) =>
      categoryPositions.get(categoryKey(a.row.groupValue))! -
        categoryPositions.get(categoryKey(b.row.groupValue))! ||
      seriesPositions.get(categoryKey(a.seriesValue))! -
        seriesPositions.get(categoryKey(b.seriesValue))!
  );
  const values = rows.flatMap(({ row, seriesValue }) =>
    row.value === undefined
      ? []
      : [
          {
            id: row.id,
            label: `${row.groupLabel} · ${categoryLabel(seriesValue)}`,
            value: row.value,
          },
        ]
  );
  const low = values.reduce(
    (best, item) => (item.value < best.value ? item : best),
    { id: "", label: "zero", value: 0 }
  );
  const high = values.reduce(
    (best, item) => (item.value > best.value ? item : best),
    { id: "", label: "zero", value: 0 }
  );
  const pad = (high.value - low.value) * 0.1 || 1;
  const domain: [number, number] = [
    low.value < 0 ? low.value - pad : 0,
    high.value > 0 ? high.value + pad : 0,
  ];
  if (domain[0] === domain[1]) domain[1] = 1;
  const margin = {
    ...settings.margin,
    top: Math.max(44, settings.margin.top),
    bottom: Math.max(52, settings.margin.bottom),
    left: Math.min(
      width * 0.32,
      Math.max(
        settings.margin.left,
        26 +
          6 *
            Math.max(
              formatValue(low.value).length,
              formatValue(high.value).length
            )
      )
    ),
    right: Math.max(12, Math.min(settings.margin.right, width * 0.1)),
  };
  const plotWidth = Math.max(1, width - margin.left - margin.right);
  const plotHeight = Math.max(1, height - margin.top - margin.bottom);
  const x = scaleBand<string>()
    .domain([...categories.keys()])
    .range([0, plotWidth])
    .padding(0.2);
  const nested = scaleBand<string>()
    .domain(legend.map((item) => item.key))
    .range([0, x.bandwidth()])
    .padding(0.08);
  const y = numericScale(settings.yAxis).domain(domain).range([plotHeight, 0]);
  const notice =
    categories.size > 30 || legend.length > 20
      ? "Filter the data to show at most 30 categories and 20 series."
      : nested.bandwidth() < 2 && rows.length
        ? "Widen this chart or filter the data to make each bar visible."
        : undefined;
  const bars: BarMark[] = notice
    ? []
    : rows.map(({ row, seriesValue }, order) => {
        const selection: Filter[] = [
          { type: "value", field, values: [row.groupValue] },
          ...(seriesField === field
            ? []
            : [
                {
                  type: "value" as const,
                  field: seriesField,
                  values: [seriesValue],
                },
              ]),
          ...facetFilters.filter(
            (filter) => filter.field !== field && filter.field !== seriesField
          ),
        ];
        const selected = settings.filters.every((filter) => {
          const selected = selection.find(
            (item) => item.field === filter.field
          );
          return (
            !selected ||
            selected.type !== "value" ||
            selected.values.some((value) => applyFilter(value, filter))
          );
        });
        const color = getColor(seriesValue);
        const value = row.value ?? 0;
        return {
          id: JSON.stringify([
            categoryKey(row.groupValue),
            categoryKey(seriesValue),
          ]),
          order,
          label: `${row.groupLabel} · ${categoryLabel(seriesValue)}`,
          groupValue: row.groupValue,
          series: {
            field: seriesField,
            label: getLabel(seriesField),
            value: seriesValue,
          },
          selection,
          value,
          valueText:
            row.value === undefined ? "No valid values" : formatValue(value),
          x:
            x(categoryKey(row.groupValue))! + nested(categoryKey(seriesValue))!,
          y: Math.min(y(0), y(value)),
          width: nested.bandwidth(),
          height: Math.max(2, Math.abs(y(value) - y(0))),
          baseline: y(0),
          fill: color,
          fillSource: {
            kind: "color-scale",
            scaleId: settings.colorScaleId,
            value: seriesValue,
          },
          selected: settings.filters.length ? selected : undefined,
          row,
        };
      });
  const axes = planAxes({
    plotWidth,
    plotHeight,
    margin,
    x: {
      scale: x,
      field,
      fieldLabel: getLabel(field),
      label: settings.xAxisLabel || getLabel(field),
      format: (key) => categoryLabel(categories.get(String(key))),
    },
    y: {
      scale: y,
      field: spec?.measureField,
      label: settings.yAxisLabel || valueLabel,
      scaleType: settings.yAxis.scaleType,
      density: settings.yGridLines,
      grid: settings.yAxis.grid ?? true,
      zero: true,
      format: (value) => formatValue(Number(value)),
    },
  });
  const plan: BarChartPlan = {
    revision,
    mode: "aggregate",
    width,
    height,
    field,
    fieldLabel: getLabel(field),
    valueLabel,
    aggregation:
      operation === "count"
        ? "count"
        : `${operation} of ${getLabel(spec?.measureField ?? "")}`,
    axes,
    xScale: describeScale(x),
    yScale: describeScale(y, settings.yAxis.scaleType),
    bars,
    binEdges: [],
    groupOrder: bars.map((bar) => bar.label),
    unplotted: [],
    zeroBaseline: y(0),
    domain: {
      population: "current result",
      values,
      lower: low.id ? { source: "bar", ...low } : { source: "zero", value: 0 },
      upper: high.id
        ? { source: "bar", ...high }
        : { source: "zero", value: 0 },
      padding: "10% outside the signed value span",
      domain,
    },
    scopeNote:
      "Rows after other chart filters and facet selection. This chart's own selection keeps the surrounding bars visible.",
  };
  return { ...plan, legend, notice, x, y };
}
