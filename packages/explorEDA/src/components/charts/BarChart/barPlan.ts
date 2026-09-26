import { applyFilter } from "@/hooks/applyFilter";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import {
  calculateGroupedAggregate,
  type AggregateResult,
  type AggregateResultRow,
} from "@/lib/aggregates";
import {
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import {
  finiteNumber,
  finiteNumbers,
  isMissingValue,
  isNumberLike,
} from "@/lib/numeric";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { ValueFilter } from "@/types/FilterTypes";
import { scaleBand } from "d3-scale";
import { formatTick } from "../Axis/Axis";
import {
  planAxes,
  planChartMargin,
  type AxisDomainSource,
  type ChartAxesPlan,
  type ScaleDescriptor,
  describeScale,
} from "../Axis/axisPlan";
import { numericScale } from "../Axis/numericScale";
import { getChartAxisLabel } from "../chartAccessibility";
import { numericBins } from "./bins";
import type { BarChartSettings } from "./definition";

/** Grouped aggregate, count per category, or count per numeric bin. */
export type BarMode = "aggregate" | "count" | "bin";

const X_SCALE_PADDING = 0.05;
const Y_SCALE_PADDING = 0.1;
const DEFAULT_FILL = "#3479a8";
const FILTERED_OUT_FILL = "rgb(156 163 175)";

export interface BarSnapshot {
  revision: string;
  /** Every source value of the field. Count and bin domains use it. */
  allValues: datum[];
  /** Rows after other charts' filters and the current facet. */
  liveIds: IdType[];
  fieldData: Record<IdType, datum>;
  fieldType?: string;
  /** The grouped aggregate result for an aggregate bar chart. */
  aggregate?: AggregateResult;
}

export interface BarPlanInput {
  settings: BarChartSettings;
  snapshot: BarSnapshot;
  width: number;
  height: number;
  getColor: (value: datum) => string;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
  /** Describes the rows an aggregate result uses. */
  aggregateScope?: string;
}

export type BarFillSource =
  | { kind: "color-scale"; scaleId?: string; value: datum }
  | {
      kind: "own-filter";
      scaleId?: string;
      value: datum;
      baseFill: string;
    };

export interface BarMark {
  id: string;
  order: number;
  label: string;
  groupValue: datum;
  bin?: { start: number; end: number; closed: boolean };
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  fill: string;
  fillSource: BarFillSource;
  /** Whether this chart's value filter includes the bar, when one exists. */
  selected?: boolean;
  /** The aggregate, count or bin row that sets the bar's value. */
  row: AggregateResultRow;
}

export interface BarDomain {
  population: "current result" | "all source rows";
  values: { id: string; label: string; value: number }[];
  lower: { source: "zero" | "bar"; id?: string; label?: string; value: number };
  upper: { source: "zero" | "bar"; id?: string; label?: string; value: number };
  padding: string;
  domain: [number, number];
}

export interface BarChartPlan {
  revision: string;
  mode: BarMode;
  width: number;
  height: number;
  field: string;
  fieldLabel: string;
  valueLabel: string;
  aggregation: string;
  axes: ChartAxesPlan;
  xScale: ScaleDescriptor;
  yScale: ScaleDescriptor;
  bars: BarMark[];
  groupOrder: string[];
  /** Rows without a finite value have no bar. */
  unplotted: { row: AggregateResultRow; reason: string }[];
  domain: BarDomain;
  zeroBaseline: number;
  scopeNote: string;
}

export function isNumericBarField(
  settings: BarChartSettings,
  snapshot: Pick<BarSnapshot, "allValues" | "fieldType">
) {
  // A numeric field needs one finite value; Infinity and NaN still count as numbers.
  return (
    !settings.aggregateId &&
    snapshot.fieldType !== "categorical" &&
    !settings.forceString &&
    snapshot.allValues.some((value) => finiteNumber(value) !== undefined) &&
    snapshot.allValues
      .filter((value) => !isMissingValue(value))
      .every(isNumberLike)
  );
}

function countRows(
  settings: BarChartSettings,
  snapshot: BarSnapshot
): AggregateResult {
  const spec = {
    id: `${settings.id}:count`,
    name: `Count by ${settings.field}`,
    groupField: settings.field,
    aggregation: "count" as const,
  };
  const result = calculateGroupedAggregate(
    snapshot.liveIds.map((id) => ({
      __ID: id,
      [settings.field]: snapshot.fieldData[id],
    })),
    spec
  );
  const byKey = new Map(
    result.rows.map((row) => [categoryKey(row.groupValue), row])
  );
  const categories = new Map(
    snapshot.allValues.map((value) => [categoryKey(value), categoryValue(value)])
  );
  // Categories come from every source row, so a filtered-out category keeps its place.
  const rows = [...categories].map(
    ([key, category]) =>
      byKey.get(key) ?? {
        id: `${spec.id}:${key}`,
        groupValue: category,
        groupLabel: categoryLabel(category),
        value: 0,
        rowCount: 0,
        contributors: [],
      }
  );
  return { ...result, rows };
}

type BinRow = AggregateResultRow & { bin: { start: number; end: number } };

function binRows(settings: BarChartSettings, snapshot: BarSnapshot): BinRow[] {
  const all = finiteNumbers(snapshot.allValues);
  // Blank and nonfinite values are not measurements, so they match no bin.
  const live = snapshot.liveIds.flatMap((id) => {
    const value = finiteNumber(snapshot.fieldData[id]);
    return value === undefined ? [] : [{ id, value }];
  });
  const bins = numericBins(
    all,
    live.map((item) => item.value),
    settings.binCount || 20
  );
  const members = bins.map(() => [] as { id: IdType; value: number }[]);
  if (bins.length) {
    const min = bins[0]!.start;
    const max = bins[bins.length - 1]!.end;
    const step = (max - min) / bins.length;
    // Same rule as numericBins: half-open bins, with the last bin closed.
    for (const item of live) {
      if (item.value < min || item.value > max) continue;
      members[
        Math.min(bins.length - 1, Math.floor((item.value - min) / step))
      ]!.push(item);
    }
  }
  return bins.map((bin, index) => ({
    bin: { start: bin.start, end: bin.end },
    id: `bin:${bin.start}:${bin.end}`,
    groupValue: bin.start,
    groupLabel: bin.label,
    value: bin.value,
    rowCount: members[index]!.length,
    contributors: members[index]!.map((item) => ({
      sourceId: item.id,
      input: snapshot.fieldData[item.id],
      included: true,
    })),
  }));
}

function extremes(values: BarDomain["values"]) {
  const lower = values.reduce<BarDomain["values"][number] | undefined>(
    (winner, item) =>
      item.value < (winner?.value ?? 0) ? item : winner,
    undefined
  );
  const upper = values.reduce<BarDomain["values"][number] | undefined>(
    (winner, item) =>
      item.value > (winner?.value ?? 0) ? item : winner,
    undefined
  );
  const end = (item: typeof lower) =>
    item
      ? { source: "bar" as const, id: item.id, label: item.label, value: item.value }
      : { source: "zero" as const, value: 0 };
  return { lower: end(lower), upper: end(upper) };
}

/**
 * Plans every bar, both scales, the axes and the Y domain from one snapshot.
 * BarChart draws this plan and the trace reads it, so both use the same numbers.
 */
export function planBarChart({
  settings,
  snapshot,
  width,
  height,
  getColor,
  getFieldLabel,
  formatFieldValue,
  aggregateScope = "This result uses the current globally filtered source rows",
}: BarPlanInput): BarChartPlan {
  const numeric = isNumericBarField(settings, snapshot);
  const mode: BarMode = settings.aggregateId
    ? "aggregate"
    : numeric
      ? "bin"
      : "count";
  const spec = snapshot.aggregate?.spec;
  const result =
    mode === "aggregate"
      ? snapshot.aggregate
      : mode === "count"
        ? countRows(settings, snapshot)
        : undefined;
  const rows: (AggregateResultRow & Partial<Pick<BinRow, "bin">>)[] =
    mode === "bin" ? binRows(settings, snapshot) : (result?.rows ?? []);

  // Y domain: an aggregate uses its current values; counts use every source row
  // so bars keep their scale while other charts filter.
  let domainValues: BarDomain["values"];
  if (mode === "aggregate") {
    domainValues = rows.flatMap((row) =>
      typeof row.value === "number" && Number.isFinite(row.value)
        ? [{ id: row.id, label: row.groupLabel, value: row.value }]
        : []
    );
  } else if (mode === "bin") {
    const all = finiteNumbers(snapshot.allValues);
    domainValues = numericBins(all, all, settings.binCount || 20).map(
      (bin) => ({ id: `bin:${bin.start}:${bin.end}`, label: bin.label, value: bin.value })
    );
  } else {
    const counts = new Map<string, { id: string; label: string; value: number }>();
    for (const value of snapshot.allValues) {
      const key = categoryKey(value);
      const item = counts.get(key);
      if (item) item.value += 1;
      else
        counts.set(key, {
          id: `${settings.id}:count:${key}`,
          label: categoryLabel(categoryValue(value)),
          value: 1,
        });
    }
    domainValues = [...counts.values()];
  }
  const { lower, upper } = extremes(domainValues);
  let yDomain: [number, number];
  let padding: string;
  if (mode === "aggregate") {
    const pad =
      lower.value === upper.value ? 0.5 : (upper.value - lower.value) * Y_SCALE_PADDING;
    yDomain = [lower.value - (lower.value < 0 ? pad : 0), upper.value + pad];
    padding =
      lower.value === upper.value ? "0.5 above and below" : "10% of the value span";
  } else {
    yDomain = [0, Math.max(1, upper.value * (1 + Y_SCALE_PADDING))];
    padding = "10% above the tallest bar";
  }

  const xField = mode === "aggregate" && spec ? spec.groupField : settings.field;
  const yField =
    mode === "aggregate" && spec && spec.aggregation !== "count"
      ? spec.measureField
      : undefined;
  const xLabel = getChartAxisLabel(
    xField,
    settings.xAxisLabel,
    getFieldLabel
  );
  const yLabel =
    settings.yAxisLabel ||
    (mode === "aggregate" && spec
      ? spec.aggregation === "count"
        ? "Count"
        : getFieldLabel(spec.measureField ?? "Measure")
      : "");
  const { margin, policy } = planChartMargin({
    margin: settings.margin,
    width,
    yDomain,
    hasXLabel: Boolean(xLabel),
    hasYLabel: Boolean(yLabel),
  });
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  let xScale;
  let xDomainSource: AxisDomainSource | undefined;
  if (mode === "bin") {
    const all = finiteNumbers(snapshot.allValues);
    const low = Math.min(...all);
    const high = Math.max(...all);
    const min = low === high ? low - 0.5 : low;
    const max = low === high ? high + 0.5 : high;
    const pad = (max - min) * X_SCALE_PADDING;
    xScale = numericScale(settings.xAxis)
      .domain([min - pad, max + pad])
      .range([0, plotWidth]);
    xDomainSource = {
      population: "all source rows",
      rows: all.length,
      bounds: [low, high],
      padding: "5% on each side",
    };
  } else {
    const labels =
      mode === "aggregate"
        ? rows.map((row) => row.groupLabel)
        : Array.from(new Set(snapshot.allValues.map(categoryLabel)));
    xScale = scaleBand<string>().domain(labels).range([0, plotWidth]).padding(0.3);
  }
  const yScale = numericScale(settings.yAxis)
    .domain(yDomain)
    .range([plotHeight, 0]);
  const baseline = yScale(0);

  const format = (field: string | undefined) => (value: string | number) =>
    field && formatFieldValue ? formatFieldValue(field, value) : formatTick(value);
  const symlog = (label: string, type?: string) =>
    [label, type === "symlog" && "symlog"].filter(Boolean).join(" · ");
  const axes = planAxes({
    plotWidth,
    plotHeight,
    margin,
    marginPolicy: policy,
    x: {
      scale: xScale,
      scaleType: settings.xAxis.scaleType,
      field: xField,
      fieldLabel: xField ? getFieldLabel(xField) : undefined,
      density: settings.xGridLines,
      grid: settings.xAxis.grid,
      format: format(xField),
      label: symlog(xLabel, settings.xAxis.scaleType),
      labelSource: settings.xAxisLabel ? "chart-setting" : "field-label",
      domainSource: xDomainSource,
    },
    y: {
      scale: yScale,
      scaleType: settings.yAxis.scaleType,
      field: yField,
      fieldLabel: yLabel || undefined,
      density: settings.yGridLines,
      grid: settings.yAxis.grid ?? true,
      format: format(yField),
      label: symlog(yLabel, settings.yAxis.scaleType),
      labelSource: settings.yAxisLabel ? "chart-setting" : "field-label",
      zero: true,
      domainSource: {
        population:
          mode === "aggregate" ? "the current aggregate result" : "all source rows",
        rows: domainValues.length,
        bounds: [lower.value, upper.value],
        padding,
        lower: lower.label ? { label: lower.label, value: lower.value } : undefined,
        upper: upper.label ? { label: upper.label, value: upper.value } : undefined,
      },
    },
  });

  const valueFilter =
    mode === "aggregate"
      ? undefined
      : settings.filters.find(
          (filter): filter is ValueFilter =>
            filter.type === "value" && filter.field === settings.field
        );
  const rangeFilter =
    mode === "bin"
      ? getRangeFilterForField(settings.filters, settings.field)
      : undefined;
  const bars: BarMark[] = [];
  const unplotted: BarChartPlan["unplotted"] = [];
  rows.forEach((row, order) => {
    if (typeof row.value !== "number" || !Number.isFinite(row.value)) {
      unplotted.push({ row, reason: "No valid numbers" });
      return;
    }
    let x: number;
    let barWidth: number;
    let bin: BarMark["bin"];
    if (row.bin) {
      const linear = xScale as ReturnType<typeof numericScale>;
      const { start, end } = row.bin;
      bin = { start, end, closed: order === rows.length - 1 };
      x = linear(start);
      const span = linear(end) - x;
      if (span < 1) return;
      barWidth = Math.max(0, span - 1);
    } else {
      const band = xScale as ReturnType<typeof scaleBand<string>>;
      const at = band(row.groupLabel);
      if (at === undefined || band.bandwidth() < 1) return;
      x = at;
      barWidth = band.bandwidth();
    }
    const valuePosition = yScale(row.value);
    const baseFill = getColor(row.groupValue) || DEFAULT_FILL;
    const passes =
      rangeFilter
        ? applyFilter(row.groupValue, rangeFilter)
        : valueFilter
          ? applyFilter(row.groupValue, valueFilter)
          : true;
    bars.push({
      id: `bar:${row.id}`,
      order,
      label: row.groupLabel,
      groupValue: row.groupValue,
      bin,
      value: row.value,
      x,
      y: Math.min(baseline, valuePosition),
      width: barWidth,
      height: Math.max(1, Math.abs(baseline - valuePosition)),
      baseline,
      fill: passes ? baseFill : FILTERED_OUT_FILL,
      fillSource: passes
        ? { kind: "color-scale", scaleId: settings.colorScaleId, value: row.groupValue }
        : {
            kind: "own-filter",
            scaleId: settings.colorScaleId,
            value: row.groupValue,
            baseFill,
          },
      selected:
        mode === "count" && valueFilter
          ? applyFilter(row.groupValue, valueFilter)
          : undefined,
      row,
    });
  });

  return {
    revision: snapshot.revision,
    mode,
    width,
    height,
    field: xField,
    fieldLabel: getFieldLabel(xField),
    valueLabel: yLabel || "Row count",
    aggregation:
      mode === "aggregate" && spec
        ? `${spec.aggregation}${spec.measureField ? ` of ${getFieldLabel(spec.measureField)}` : ""}`
        : "count",
    axes,
    xScale: describeScale(xScale, settings.xAxis.scaleType),
    yScale: describeScale(yScale, settings.yAxis.scaleType),
    bars,
    groupOrder: rows.map((row) => row.groupLabel),
    unplotted,
    domain: {
      population: mode === "aggregate" ? "current result" : "all source rows",
      values: domainValues,
      lower,
      upper,
      padding,
      domain: yDomain,
    },
    zeroBaseline: baseline,
    scopeNote:
      mode === "aggregate"
        ? aggregateScope
        : mode === "count"
          ? "Rows after other chart filters; this chart's selected categories are shown in color"
          : "Rows after other chart filters; this chart's range is shown in color",
  };
}

/** The bar that counts a source row, if one is drawn. */
export function findBarForRow(plan: BarChartPlan, id: number) {
  return plan.bars.find((bar) =>
    bar.row.contributors.some((contributor) => contributor.sourceId === id)
  );
}

/** The bar under a point in plot coordinates. */
export function barAt(plan: BarChartPlan, x: number, y: number) {
  return plan.bars.find(
    (bar) =>
      x >= bar.x &&
      x <= bar.x + bar.width &&
      y >= bar.y &&
      y <= bar.y + bar.height
  );
}
