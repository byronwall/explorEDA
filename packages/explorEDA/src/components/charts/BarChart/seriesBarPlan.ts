import { scaleBand } from "d3-scale";
import { applyFilter } from "@/hooks/applyFilter";
import type { AggregateResult } from "@/lib/aggregates";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { describeScale, planAxes } from "../Axis/axisPlan";
import { boundedDomain } from "../Axis/axisBounds";
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
  const layout = settings.seriesLayout ?? "grouped";
  const stacked = layout !== "grouped";
  const percent = layout === "percent";
  const metricLabel =
    operation === "count"
      ? "Row count"
      : `${operation === "sum" ? "Sum" : "Average"} of ${getLabel(spec?.measureField ?? "")}`;
  const formatValue = (value: number) =>
    operation === "count"
      ? value.toLocaleString("en-US")
      : format(spec?.measureField ?? "", value);
  const valueLabel = percent ? "Share of category total (%)" : metricLabel;
  const formatAxis = (value: number) =>
    percent ? `${Math.round(value * 10) / 10}%` : formatValue(value);
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
  const totals = new Map<string, number>();
  const parts = new Map<string, NonNullable<BarMark["stack"]>["parts"]>();
  for (const { row, seriesValue } of rows) {
    const key = categoryKey(row.groupValue);
    totals.set(key, (totals.get(key) ?? 0) + (row.value ?? 0));
    const item = { label: categoryLabel(seriesValue), row };
    const group = parts.get(key);
    if (group) group.push(item);
    else parts.set(key, [item]);
  }
  const offsets = new Map<string, { positive: number; negative: number }>();
  const segments = rows.map(({ row, seriesValue }) => {
    const key = categoryKey(row.groupValue);
    const total = totals.get(key)!;
    const share =
      total > 0 && row.value !== undefined ? row.value / total : undefined;
    const value = percent ? (share ?? 0) * 100 : (row.value ?? 0);
    const offset = offsets.get(key) ?? { positive: 0, negative: 0 };
    const sign = value < 0 ? "negative" : "positive";
    const start = stacked ? offset[sign] : 0;
    const end = start + value;
    offset[sign] = end;
    offsets.set(key, offset);
    return { row, seriesValue, start, end, total, share };
  });
  const values = segments.flatMap(({ row, seriesValue, end }) =>
    row.value === undefined
      ? []
      : [
          {
            id: row.id,
            label: `${row.groupLabel} · ${categoryLabel(seriesValue)}`,
            value: end,
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
  const domain: [number, number] = percent
    ? [0, 100]
    : [
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
              formatAxis(low.value).length,
              formatAxis(high.value).length
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
  const yScaleType = stacked ? "linear" : settings.yAxis.scaleType;
  const y = numericScale({ ...settings.yAxis, scaleType: yScaleType })
    .domain(boundedDomain(domain, settings.yAxis))
    .range([plotHeight, 0]);
  const notice =
    stacked && operation === "average"
      ? "Choose count or sum to stack series. Compare averages with grouped bars."
      : percent && rows.some(({ row }) => (row.value ?? 0) < 0)
        ? "100% bars need nonnegative series totals. Choose stacked bars to compare signed totals."
        : categories.size > 30 || legend.length > 20
          ? "Filter the data in another view to show at most 30 categories and 20 series."
          : (stacked ? x.bandwidth() : nested.bandwidth()) < 2 && rows.length
            ? "Widen this chart or filter another view to make each bar visible."
            : undefined;
  const bars: BarMark[] = notice
    ? []
    : segments.map(({ row, seriesValue, start, end, total, share }, order) => {
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
        const empty = start === end;
        const markHeight = empty ? 6 : Math.max(2, Math.abs(y(end) - y(start)));
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
          ...(stacked
            ? {
                stack: {
                  mode: layout,
                  start,
                  end,
                  total,
                  totalText: formatValue(total),
                  share,
                  valueText:
                    row.value === undefined
                      ? "No valid values"
                      : formatValue(row.value),
                  parts: parts.get(categoryKey(row.groupValue))!,
                },
              }
            : {}),
          value,
          valueText:
            row.value === undefined
              ? "No valid values"
              : percent
                ? share === undefined
                  ? "No share (zero total)"
                  : `${(share * 100).toFixed(1)}%`
                : formatValue(value),
          x:
            x(categoryKey(row.groupValue))! +
            (stacked && !empty ? 0 : nested(categoryKey(seriesValue))!),
          y: empty
            ? Math.max(
                0,
                Math.min(plotHeight - markHeight, y(start) - markHeight / 2)
              )
            : Math.min(y(start), y(end)),
          width: stacked && !empty ? x.bandwidth() : nested.bandwidth(),
          height: markHeight,
          baseline: y(0),
          fill: color,
          opacity: settings.filters.length && !selected ? 0.25 : 1,
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
      tickFontSize: settings.xAxis.tickFontSize,
      labelFontSize: settings.xAxis.labelFontSize,
      field,
      fieldLabel: getLabel(field),
      label: settings.xAxisLabel || getLabel(field),
      format: (key) => categoryLabel(categories.get(String(key))),
    },
    y: {
      scale: y,
      tickFontSize: settings.yAxis.tickFontSize,
      labelFontSize: settings.yAxis.labelFontSize,
      field: spec?.measureField,
      label: settings.yAxisLabel || valueLabel,
      scaleType: yScaleType,
      density: settings.yGridLines,
      grid: settings.yAxis.grid ?? true,
      zero: true,
      format: (value) => formatAxis(Number(value)),
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
    yScale: describeScale(y, yScaleType),
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
      padding: percent
        ? "Fixed 0% to 100%"
        : "10% outside the signed value span",
      domain,
    },
    scopeNote:
      "Rows after other chart filters and facet selection. This chart's own selection keeps the surrounding bars visible.",
  };
  return {
    ...plan,
    legend,
    notice,
    x,
    y,
    percent,
    zeroTotals: percent && [...totals.values()].some((total) => total === 0),
  };
}
