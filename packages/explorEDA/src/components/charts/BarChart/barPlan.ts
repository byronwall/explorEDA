import { applyFilter } from "@/hooks/applyFilter";
import { getRangeFilterForField } from "@/hooks/getAxisFilter";
import {
  SMALL_SAMPLE,
  calculateGroupedAggregate,
  isAdditiveSpec,
  type AggregateResult,
  type AggregateResultRow,
} from "@/lib/aggregates";
import {
  rateIsFraction,
  resolveValueFormat,
  shareOf,
  significant,
  valueFormatters,
} from "../valueFormat";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import {
  finiteNumber,
  finiteNumbers,
  isMissingValue,
  isNumberLike,
} from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { Filter, ValueFilter } from "@/types/FilterTypes";
import { scaleBand } from "d3-scale";
import { formatTick } from "../Axis/Axis";
import {
  planAxes,
  planChartMargin,
  type AxisDomainSource,
  type ChartAxesPlan,
  type ScaleDescriptor,
  describeScale,
  type AxisTypography,
} from "../Axis/axisPlan";
import {
  boundedDomain,
  hasAxisBounds,
  hiddenByBounds,
  labelHidden,
} from "../Axis/axisBounds";
import { numericScale } from "../Axis/numericScale";
import { getChartAxisLabel } from "../chartAccessibility";
import { binIndex, binInRange, numericBins } from "./bins";
import type { BarChartSettings } from "./definition";
import {
  planHistogram,
  type HistogramBin,
  type HistogramPlan,
  type TailSide,
} from "./histogramPlan";

/** Grouped aggregate, count per category, or count per numeric bin. */
export type BarMode = "aggregate" | "count" | "bin";

const X_SCALE_PADDING = 0.05;
const Y_SCALE_PADDING = 0.1;
const DEFAULT_FILL = "#3479a8";
/** Bars outside this chart's own filter keep their color at this opacity. */
export const FILTERED_OUT_OPACITY = 0.3;

export interface BarSnapshot {
  revision: string;
  /** Every source value of the field. Count and bin domains use it. */
  allValues: datum[];
  /** Rows after other filters and the current facet. */
  liveIds: IdType[];
  fieldData: Record<IdType, datum>;
  fieldType?: string;
  /** The grouped aggregate result for an aggregate bar chart. */
  aggregate?: AggregateResult;
  /**
   * The same aggregate over every row the chart can draw, before other
   * filters. It sets the Y domain, so filtering elsewhere never rescales it.
   */
  domainAggregate?: AggregateResult;
}

export interface BarPlanInput {
  settings: BarChartSettings;
  snapshot: BarSnapshot;
  width: number;
  height: number;
  getColor: (value: datum) => string;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
  /** Formats value-axis ticks, which can be shorter than readout values. */
  /** Writes an axis tick; `reference` is the axis end, for one notation. */
  formatAxisValue?: (field: string, value: datum, reference?: number) => string;
  /** Bottom margin kept under the X axis title, such as for a summary row. */
  footer?: number;
  /** Whether bars show their count over every source row. Facets do not. */
  showTotals?: boolean;
  /** Describes the rows an aggregate result uses. */
  aggregateScope?: string;
  /** Theme axis sizes and text measurement. */
  typography?: AxisTypography;
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
  series?: { field: string; label: string; value: datum };
  selection?: Filter[];
  stack?: {
    mode: "stacked" | "percent";
    start: number;
    end: number;
    total: number;
    totalText: string;
    share?: number;
    valueText: string;
    parts: { label: string; row: AggregateResultRow }[];
  };
  bin?: { start: number; end: number; closed: boolean };
  /** A coverage tail of an engineering histogram, past the first or last edge. */
  tail?: TailSide;
  /**
   * The part of an engineering histogram bar the chart's own selection keeps,
   * drawn solid over the faded whole when a selection cuts through the bin.
   */
  selectedPart?: { value: number; y: number; height: number };
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  baseline: number;
  fill: string;
  /** 1, or FILTERED_OUT_OPACITY for a bar outside this chart's filter. */
  opacity: number;
  fillSource: BarFillSource;
  /** The value as the readout and accessible name show it. */
  valueText: string;
  /**
   * The count over every source row, when other filters lower the bar.
   * The chart draws it as a faint bar behind, so the share left reads at once.
   */
  total?: { value: number; y: number; height: number };
  /** Whether this chart's value filter includes the bar, when one exists. */
  selected?: boolean;
  /** The aggregate, count or bin row that sets the bar's value. */
  row: AggregateResultRow;
  /** A rate or average over fewer than SMALL_SAMPLE rows draws faded. */
  faded?: boolean;
}

export interface BarDomain {
  population:
    | "current result"
    | "all source rows"
    | "all source rows and the current result";
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
  /** Bars show shares of the total of all bars. */
  shared?: boolean;
  aggregation: string;
  axes: ChartAxesPlan;
  xScale: ScaleDescriptor;
  yScale: ScaleDescriptor;
  bars: BarMark[];
  /** Faint all-row bars for categories with no rows after other filters. */
  emptySlots: {
    id: string;
    label: string;
    value: number;
    x: number;
    width: number;
    y: number;
    height: number;
    fill: string;
  }[];
  /** Bin boundaries in bin mode, lowest first. Range filters snap to them. */
  binEdges: number[];
  /**
   * Whole-number bins centered on integers. Their edges fall halfway between
   * values, so no value sits on one.
   */
  wholeNumberBins: boolean;
  groupOrder: string[];
  /** Exact bins, tails, and exclusions when the chart has histogram settings. */
  histogram?: HistogramPlan;
  /** Rows without a finite value have no bar. */
  unplotted: { row: AggregateResultRow; reason: string }[];
  /** Why the plot is empty although rows exist, such as bars too narrow. */
  notice?: string;
  domain: BarDomain;
  zeroBaseline: number;
  scopeNote: string;
}

export function isNumericBarField(
  settings: BarChartSettings,
  snapshot: Pick<BarSnapshot, "allValues" | "fieldType">
) {
  // A numeric field needs one finite value; Infinity and NaN still count as
  // numbers. Histogram settings declare the field numeric, so a stray text
  // value is reported as invalid instead of turning bins into categories.
  return (
    !settings.aggregateId &&
    snapshot.fieldType !== "categorical" &&
    !settings.forceString &&
    snapshot.allValues.some((value) => finiteNumber(value) !== undefined) &&
    (Boolean(settings.histogram) ||
      snapshot.allValues
        .filter((value) => !isMissingValue(value))
        .every(isNumberLike))
  );
}

/** Sorts categories A to Z, numbers in numeric order; missing values last. */
export function sortByLabel<T>(items: readonly T[], value: (item: T) => datum) {
  return [...items].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    if (isMissingValue(left) || isMissingValue(right)) {
      return Number(isMissingValue(left)) - Number(isMissingValue(right));
    }
    return typeof left === "number" && typeof right === "number"
      ? left - right
      : categoryLabel(left).localeCompare(categoryLabel(right), undefined, {
          numeric: true,
        });
  });
}

/**
 * Sorts largest value first; rows without a finite value go last. Rows that
 * `small` marks, such as a rate over a few rows, follow every other row.
 */
export function sortByValue<T>(
  items: readonly T[],
  value: (item: T) => number | undefined,
  small?: (item: T) => boolean
) {
  const of = (item: T) => {
    const number = value(item);
    return number !== undefined && Number.isFinite(number) ? number : -Infinity;
  };
  const band = (item: T) => (small?.(item) ? 1 : 0);
  return [...items].sort((a, b) => band(a) - band(b) || of(b) - of(a) || 0);
}

/**
 * Each category's value over every source row, so a value order holds still
 * while other charts filter: its count, or its summary over all rows.
 */
function allRowValue(mode: BarMode, snapshot: BarSnapshot) {
  const values = new Map<string, number | undefined>();
  if (mode === "aggregate")
    for (const row of snapshot.domainAggregate?.rows ?? [])
      values.set(categoryKey(row.groupValue), row.value);
  else
    for (const value of snapshot.allValues) {
      const key = categoryKey(value);
      values.set(key, (values.get(key) ?? 0) + 1);
    }
  return (row: AggregateResultRow) => {
    const key = categoryKey(row.groupValue);
    return values.has(key) ? values.get(key) : row.value;
  };
}

/** Whether a group's rate or average rests on few rows, over every source row. */
function smallOverAllRows(snapshot: BarSnapshot) {
  const sizes = new Map(
    (snapshot.domainAggregate?.rows ?? []).map((row) => [
      categoryKey(row.groupValue),
      row.sampleSize,
    ])
  );
  return (row: AggregateResultRow) => {
    const key = categoryKey(row.groupValue);
    const n = sizes.has(key) ? sizes.get(key) : row.sampleSize;
    return n !== undefined && n < SMALL_SAMPLE;
  };
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
    snapshot.allValues.map((value) => [
      categoryKey(value),
      categoryValue(value),
    ])
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

type BinRow = AggregateResultRow & {
  bin: { start: number; end: number; closed?: boolean };
  tail?: TailSide;
  /** Rows the chart's own selection keeps, in engineering histograms. */
  selected?: number;
  sourceCount?: number;
};

function histogramRowId(bin: HistogramBin) {
  return typeof bin.key === "number"
    ? `bin:${bin.start}:${bin.end}`
    : `tail:${bin.key}`;
}

/** Engineering histogram rows: the lower tail, every bin, the upper tail. */
function histogramRows(
  plan: HistogramPlan,
  snapshot: BarSnapshot,
  format: (value: number) => string
): BinRow[] {
  const bins = [
    ...(plan.tails.below ? [plan.tails.below] : []),
    ...plan.bins,
    ...(plan.tails.above ? [plan.tails.above] : []),
  ];
  return bins.map((bin) => ({
    bin: { start: bin.start, end: bin.end, closed: bin.closed },
    tail: typeof bin.key === "number" ? undefined : bin.key,
    selected: bin.selected,
    sourceCount: bin.sourceCount,
    id: histogramRowId(bin),
    groupValue: bin.start,
    groupLabel:
      bin.key === "below"
        ? `< ${format(bin.end)}`
        : bin.key === "above"
          ? `> ${format(bin.start)}`
          : `[${bin.start}, ${bin.end}${bin.closed ? "]" : ")"}`,
    value: bin.ids.length,
    rowCount: bin.ids.length,
    contributors: bin.ids.map((id) => ({
      sourceId: id,
      input: snapshot.fieldData[id],
      rawInput: snapshot.fieldData[id],
      included: true,
    })),
  }));
}

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
  // Same rule as numericBins: half-open bins, with the last bin closed.
  for (const item of live) {
    const index = binIndex(bins, item.value);
    if (index !== undefined) members[index]!.push(item);
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
    (winner, item) => (item.value < (winner?.value ?? 0) ? item : winner),
    undefined
  );
  const upper = values.reduce<BarDomain["values"][number] | undefined>(
    (winner, item) => (item.value > (winner?.value ?? 0) ? item : winner),
    undefined
  );
  const end = (item: typeof lower) =>
    item
      ? {
          source: "bar" as const,
          id: item.id,
          label: item.label,
          value: item.value,
        }
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
  formatAxisValue,
  footer = 0,
  showTotals = false,
  aggregateScope = "Rows after other filters; this chart's selected groups are shown in color",
  typography,
}: BarPlanInput): BarChartPlan {
  const numeric = isNumericBarField(settings, snapshot);
  const mode: BarMode = settings.aggregateId
    ? "aggregate"
    : numeric
      ? "bin"
      : "count";
  const spec = snapshot.aggregate?.spec;
  const histogram =
    mode === "bin" && settings.histogram
      ? planHistogram(
          settings,
          snapshot.allValues,
          snapshot.liveIds,
          snapshot.fieldData
        )
      : undefined;
  const formatMeasure = (value: number) =>
    formatFieldValue
      ? formatFieldValue(settings.field, value)
      : formatTick(value);
  const result =
    mode === "aggregate"
      ? snapshot.aggregate
      : mode === "count"
        ? countRows(settings, snapshot)
        : undefined;
  // A share divides each bar by the total of all bars: counts and sums only.
  const shared =
    Boolean(settings.share) &&
    !histogram &&
    (mode !== "aggregate" || (spec !== undefined && isAdditiveSpec(spec)));
  const shareRows = <T extends { value: number | undefined }>(items: T[]) =>
    shared ? shareOf(items) : items;
  const rate = mode === "aggregate" ? spec?.denominatorField : undefined;
  const rawRows: (AggregateResultRow & Partial<Pick<BinRow, "bin">>)[] =
    mode === "bin"
      ? histogram
        ? histogramRows(histogram, snapshot, formatMeasure)
        : binRows(settings, snapshot)
      : settings.categoryOrder === "label"
        ? sortByLabel(result?.rows ?? [], (row) => row.groupValue)
        : settings.categoryOrder === "value"
          ? sortByValue(
              result?.rows ?? [],
              allRowValue(mode, snapshot),
              smallOverAllRows(snapshot)
            )
          : (result?.rows ?? []);
  // The same categories over every row, in the order the bars use.
  const domainRows = snapshot.domainAggregate?.rows ?? [];
  const slotRows =
    mode !== "aggregate"
      ? []
      : settings.categoryOrder === "label"
        ? sortByLabel(domainRows, (row) => row.groupValue)
        : settings.categoryOrder === "value"
          ? sortByValue(domainRows, allRowValue(mode, snapshot))
          : domainRows;
  const rows = shareRows(rawRows);

  // Y domain: every source row, so bars keep their scale while other charts
  // filter. An aggregate also takes its current values, so a filtered value
  // past the all-row domain, such as a higher average, grows it to fit. A
  // chart set to fit the filtered rows uses only the bars it draws.
  const fitted = settings.scaleTo === "filtered";
  let domainValues: BarDomain["values"];
  if (fitted) {
    domainValues = rows.flatMap((row) =>
      typeof row.value === "number" && Number.isFinite(row.value)
        ? [{ id: row.id, label: row.groupLabel, value: row.value }]
        : []
    );
  } else if (mode === "aggregate") {
    const values = (items: AggregateResultRow[], prefix = "") =>
      items.flatMap((row) =>
        typeof row.value === "number" && Number.isFinite(row.value)
          ? [
              {
                id: `${prefix}${row.id}`,
                label: row.groupLabel,
                value: row.value,
              },
            ]
          : []
      );
    domainValues = [
      ...values(shareRows(snapshot.domainAggregate?.rows ?? []), "all:"),
      ...values(rows),
    ];
  } else if (histogram) {
    domainValues = (rows as BinRow[]).map((row) => ({
      id: row.id,
      label: row.groupLabel,
      value: row.sourceCount ?? 0,
    }));
  } else if (mode === "bin") {
    const all = finiteNumbers(snapshot.allValues);
    domainValues = shareRows(
      numericBins(all, all, settings.binCount || 20).map((bin) => ({
        id: `bin:${bin.start}:${bin.end}`,
        label: bin.label,
        value: bin.value,
      }))
    ) as BarDomain["values"];
  } else {
    const counts = new Map<
      string,
      { id: string; label: string; value: number }
    >();
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
    domainValues = shareRows([...counts.values()]) as BarDomain["values"];
  }
  const { lower, upper } = extremes(domainValues);
  let yDomain: [number, number];
  let padding: string;
  if (mode === "aggregate") {
    const pad =
      lower.value === upper.value
        ? 0.5
        : (upper.value - lower.value) * Y_SCALE_PADDING;
    yDomain = [lower.value - (lower.value < 0 ? pad : 0), upper.value + pad];
    padding =
      lower.value === upper.value
        ? "0.5 above and below"
        : "10% of the value span";
  } else {
    // Shares stop near the largest one rather than at 100%.
    yDomain = [
      0,
      shared
        ? upper.value * (1 + Y_SCALE_PADDING) || 1
        : Math.max(1, upper.value * (1 + Y_SCALE_PADDING)),
    ];
    padding = "10% above the tallest bar";
  }
  if (hasAxisBounds(settings.yAxis)) {
    yDomain = boundedDomain(yDomain, settings.yAxis);
    padding = "bounds set on the axis";
  }

  const xField =
    mode === "aggregate" && spec ? spec.groupField : settings.field;
  // A rate or share is a ratio, never in its measure's units.
  const yField =
    mode === "aggregate" &&
    spec &&
    spec.aggregation !== "count" &&
    !rate &&
    !shared
      ? spec.measureField
      : undefined;
  const valueFormat = resolveValueFormat(
    { ...settings, share: shared },
    Boolean(rate && rateIsFraction(snapshot.domainAggregate?.rows ?? rows))
  );
  const formatters = valueFormat
    ? valueFormatters(valueFormat, settings.valueDecimals)
    : undefined;
  const xLabel = getChartAxisLabel(xField, settings.xAxisLabel, getFieldLabel);
  const measureLabel =
    mode === "aggregate" && spec
      ? spec.aggregation === "count"
        ? "Count"
        : rate
          ? `${getFieldLabel(spec.measureField ?? "")} ÷ ${getFieldLabel(rate)}`
          : getFieldLabel(spec.measureField ?? "Measure")
      : "";
  const yLabel =
    settings.yAxisLabel ||
    (shared
      ? `Share of ${!measureLabel || measureLabel === "Count" ? "rows" : measureLabel.toLowerCase()}`
      : measureLabel);
  const yReference = Math.max(Math.abs(yDomain[0]), Math.abs(yDomain[1]));
  const format = (field: string | undefined) => (value: string | number) =>
    field && formatFieldValue
      ? formatFieldValue(field, value)
      : formatTick(value);
  const formatAxis = (field: string | undefined, reference?: number) =>
    formatters
      ? (value: string | number) =>
          typeof value === "number" ? formatters.tick(value) : value
      : field && formatAxisValue
        ? (value: string | number) => formatAxisValue(field, value, reference)
        : (value: string | number) =>
            field && formatFieldValue
              ? formatFieldValue(field, value)
              : formatTick(value, reference);
  // Labels: the chart's format, else 3 significant digits for a rate.
  const formatValue = (value: number) =>
    formatters
      ? formatters.label(value)
      : rate
        ? significant(value)
        : format(yField)(value);
  const { margin, policy } = planChartMargin({
    margin: settings.margin,
    width,
    yDomain,
    hasXLabel: Boolean(xLabel),
    hasYLabel: Boolean(yLabel),
    yTickFontSize: settings.yAxis.tickFontSize,
    xTickFontSize: settings.xAxis.tickFontSize,
    yScaleType: settings.yAxis.scaleType,
    yFormat: formatAxis(yField, yReference),
    typography,
  });
  margin.bottom += footer;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  let xScale;
  let xDomainSource: AxisDomainSource | undefined;
  if (mode === "bin") {
    const all = finiteNumbers(snapshot.allValues);
    const low = Math.min(...all);
    const high = Math.max(...all);
    // Span the bins themselves, which can extend past the data for integers.
    const first = rows[0]?.bin;
    const last = rows.at(-1)?.bin;
    const min = first ? first.start : low === high ? low - 0.5 : low;
    const max = last ? last.end : low === high ? high + 0.5 : high;
    const pad = (max - min) * X_SCALE_PADDING;
    xScale = numericScale(settings.xAxis)
      .domain(boundedDomain([min - pad, max + pad], settings.xAxis))
      .range([0, plotWidth]);
    xDomainSource = {
      population: "all source rows",
      rows: all.length,
      bounds: [low, high],
      padding: "5% on each side",
    };
  } else {
    // Count rows hold every source category, so both modes band in row order.
    // An aggregate keeps a slot for every category over all rows, so bars
    // do not widen or shift as other charts filter groups out.
    const labels =
      mode === "aggregate"
        ? [
            ...new Set([
              ...(fitted ? [] : slotRows).map((row) => row.groupLabel),
              ...rows.map((row) => row.groupLabel),
            ]),
          ]
        : rows.map((row) => categoryLabel(row.groupValue));
    xScale = scaleBand<string>()
      .domain(labels)
      .range([0, plotWidth])
      .padding(0.3);
  }
  const yScale = numericScale(settings.yAxis)
    .domain(yDomain)
    .range([plotHeight, 0]);
  const baseline = yScale(0);

  const symlog = (label: string, type?: string) =>
    [label, type === "symlog" && "symlog"].filter(Boolean).join(" · ");
  // Bars past a bound are cut off at the edge; the axis says how many.
  const yHidden = hiddenByBounds(
    settings.yAxis,
    yDomain,
    rows.flatMap((row) =>
      typeof row.value === "number" && Number.isFinite(row.value)
        ? [row.value]
        : []
    ),
    ["bar", "bars"],
    true
  );
  // A histogram's bound hides the rows whose values fall past it.
  const xHidden =
    mode === "bin"
      ? hiddenByBounds(
          settings.xAxis,
          xScale.domain() as [number, number],
          snapshot.liveIds.flatMap((id) => {
            const value = finiteNumber(snapshot.fieldData[id]);
            return value === undefined ? [] : [value];
          })
        )
      : undefined;
  const axes = planAxes({
    plotWidth,
    plotHeight,
    margin,
    marginPolicy: policy,
    footer,
    x: {
      typography,
      scale: xScale,
      scaleType: settings.xAxis.scaleType,
      field: xField,
      fieldLabel: xField ? getFieldLabel(xField) : undefined,
      density: settings.xGridLines,
      tickFontSize: settings.xAxis.tickFontSize,
      labelFontSize: settings.xAxis.labelFontSize,
      grid: settings.xAxis.grid,
      format: format(xField),
      label: symlog(xLabel, settings.xAxis.scaleType),
      labelSource: settings.xAxisLabel ? "chart-setting" : "field-label",
      domainSource: xDomainSource,
      hidden: labelHidden(xHidden, format(xField)),
    },
    y: {
      typography,
      scale: yScale,
      scaleType: settings.yAxis.scaleType,
      field: yField,
      fieldLabel: yLabel || undefined,
      density: settings.yGridLines,
      tickFontSize: settings.yAxis.tickFontSize,
      labelFontSize: settings.yAxis.labelFontSize,
      grid: settings.yAxis.grid ?? true,
      format: formatAxis(yField, yReference),
      label: symlog(yLabel, settings.yAxis.scaleType),
      labelSource: settings.yAxisLabel ? "chart-setting" : "field-label",
      zero: true,
      hidden: labelHidden(yHidden, formatAxis(yField, yReference)),
      domainSource: {
        population: fitted
          ? "rows after other filters (fitted to filtered rows)"
          : mode === "aggregate"
            ? snapshot.domainAggregate
              ? "all source rows and the current aggregate result"
              : "the current aggregate result"
            : "all source rows",
        rows: domainValues.length,
        bounds: [lower.value, upper.value],
        padding,
        lower: lower.label
          ? { label: lower.label, value: lower.value }
          : undefined,
        upper: upper.label
          ? { label: upper.label, value: upper.value }
          : undefined,
      },
    },
  });

  // A grouped bar selects its group, so its value filter names the group field.
  const selectField = mode === "aggregate" ? spec?.groupField : settings.field;
  const valueFilter = selectField
    ? settings.filters.find(
        (filter): filter is ValueFilter =>
          filter.type === "value" && filter.field === selectField
      )
    : undefined;
  const rangeFilter =
    mode === "bin"
      ? getRangeFilterForField(settings.filters, settings.field)
      : undefined;
  const binEdges =
    histogram?.edges ??
    rows.flatMap((row, index) =>
      row.bin
        ? index === 0
          ? [row.bin.start, row.bin.end]
          : [row.bin.end]
        : []
    );
  // Counts over every source row, by bar row id, for the faint bars behind.
  // An aggregate's faint bar is its summary over every row.
  const allRowSummary = new Map(
    domainRows.map((row) => [categoryKey(row.groupValue), row.value])
  );
  const totals =
    fitted || !showTotals
      ? undefined
      : mode === "aggregate"
        ? new Map(
            rows.flatMap((row) => {
              const value = allRowSummary.get(categoryKey(row.groupValue));
              return typeof value === "number" && Number.isFinite(value)
                ? [[row.id, value] as const]
                : [];
            })
          )
        : new Map(domainValues.map((item) => [item.id, item.value]));
  const bars: BarMark[] = [];
  const unplotted: BarChartPlan["unplotted"] = [];
  let tooNarrow = 0;
  rows.forEach((row, order) => {
    if (typeof row.value !== "number" || !Number.isFinite(row.value)) {
      unplotted.push({
        row,
        reason: row.identityIssues?.some(
          (issue) => issue.reason === "conflicting-values"
        )
          ? "Values differ within one ID"
          : "No valid numbers",
      });
      return;
    }
    let x: number;
    let barWidth: number;
    let bin: BarMark["bin"];
    if (row.bin) {
      const linear = xScale as ReturnType<typeof numericScale>;
      const { start, end } = row.bin;
      bin = { start, end, closed: row.bin.closed ?? order === rows.length - 1 };
      x = linear(start);
      const span = linear(end) - x;
      if (span < 1) {
        tooNarrow++;
        return;
      }
      barWidth = Math.max(0, span - 1);
    } else {
      const band = xScale as ReturnType<typeof scaleBand<string>>;
      const at = band(row.groupLabel);
      if (at === undefined) return;
      if (band.bandwidth() < 1) {
        tooNarrow++;
        return;
      }
      x = at;
      barWidth = band.bandwidth();
    }
    const valuePosition = yScale(row.value);
    const totalValue = totals?.get(row.id);
    const total =
      totalValue !== undefined && totalValue > row.value
        ? {
            value: totalValue,
            y: Math.min(baseline, yScale(totalValue)),
            height: Math.abs(baseline - yScale(totalValue)),
          }
        : undefined;
    const baseFill = getColor(row.groupValue) || DEFAULT_FILL;
    // A bin passes only when the range covers all of it, which snapped
    // filters always do. An engineering histogram fades every bar under a
    // selection and draws the kept part solid on top.
    const selectedCount = histogram?.selection
      ? ((row as BinRow).selected ?? 0)
      : undefined;
    const selectedPosition =
      selectedCount === undefined ? undefined : yScale(selectedCount);
    const passes = histogram
      ? !histogram.selection
      : rangeFilter
        ? row.bin
          ? binInRange(row.bin, rangeFilter, binEdges)
          : applyFilter(row.groupValue, rangeFilter)
        : valueFilter
          ? applyFilter(row.groupValue, valueFilter)
          : true;
    bars.push({
      id: `bar:${row.id}`,
      order,
      label: row.groupLabel,
      groupValue: row.groupValue,
      bin,
      tail: (row as BinRow).tail,
      selectedPart:
        selectedCount && selectedPosition !== undefined
          ? {
              value: selectedCount,
              y: Math.min(baseline, selectedPosition),
              height: Math.max(1, Math.abs(baseline - selectedPosition)),
            }
          : undefined,
      value: row.value,
      valueText: formatValue(row.value),
      x,
      y: Math.min(baseline, valuePosition),
      width: barWidth,
      height: Math.max(1, Math.abs(baseline - valuePosition)),
      baseline,
      total,
      fill: baseFill,
      opacity: passes ? 1 : FILTERED_OUT_OPACITY,
      fillSource: passes
        ? {
            kind: "color-scale",
            scaleId: settings.colorScaleId,
            value: row.groupValue,
          }
        : {
            kind: "own-filter",
            scaleId: settings.colorScaleId,
            value: row.groupValue,
            baseFill,
          },
      selected:
        mode !== "bin" && valueFilter
          ? applyFilter(row.groupValue, valueFilter)
          : undefined,
      row,
      faded:
        row.sampleSize !== undefined && row.sampleSize < SMALL_SAMPLE
          ? true
          : undefined,
    });
  });
  // A category other charts filter out keeps its faint all-row bar, so its
  // slot does not read as zero.
  const shownLabels = new Set(rows.map((row) => row.groupLabel));
  const emptySlots: BarChartPlan["emptySlots"] = [];
  if (mode === "aggregate" && totals)
    for (const row of slotRows) {
      const band = xScale as ReturnType<typeof scaleBand<string>>;
      const at = band(row.groupLabel);
      if (
        shownLabels.has(row.groupLabel) ||
        at === undefined ||
        typeof row.value !== "number" ||
        !Number.isFinite(row.value)
      )
        continue;
      emptySlots.push({
        id: `empty:${row.id}`,
        label: row.groupLabel,
        value: row.value,
        x: at,
        width: band.bandwidth(),
        y: Math.min(baseline, yScale(row.value)),
        height: Math.abs(baseline - yScale(row.value)),
        fill: getColor(row.groupValue) || DEFAULT_FILL,
      });
    }

  return {
    revision: snapshot.revision,
    emptySlots,
    mode,
    width,
    height,
    field: xField,
    fieldLabel: getFieldLabel(xField),
    valueLabel: yLabel || "Row count",
    shared: shared || undefined,
    aggregation:
      mode === "aggregate" && spec
        ? rate
          ? `sum of ${getFieldLabel(spec.measureField ?? "")} ÷ sum of ${getFieldLabel(rate)}`
          : `${spec.aggregation}${spec.measureField ? ` of ${getFieldLabel(spec.measureField)}` : ""}`
        : "count",
    axes,
    xScale: describeScale(xScale, settings.xAxis.scaleType),
    yScale: describeScale(yScale, settings.yAxis.scaleType),
    bars,
    binEdges,
    histogram,
    wholeNumberBins:
      mode === "bin" &&
      !histogram &&
      rows.length > 0 &&
      !rows[0]!.groupLabel.startsWith("["),
    groupOrder: rows.map((row) => row.groupLabel),
    unplotted,
    notice:
      tooNarrow > 0 && bars.length === 0
        ? "Widen this chart or filter another view to make each bar visible."
        : undefined,
    domain: {
      population:
        mode !== "aggregate"
          ? "all source rows"
          : snapshot.domainAggregate
            ? "all source rows and the current result"
            : "current result",
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
          ? "Rows after other filters; this chart's selected categories are shown in color"
          : "Rows after other filters; this chart's range is shown in color",
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
