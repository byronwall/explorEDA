import { applyFilter } from "@/hooks/applyFilter";
import {
  DEFAULT_AXIS_TYPOGRAPHY,
  type AxisTypography,
} from "../Axis/axisPlan";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { defaultCategoricalColors, makeColorScale } from "@/lib/colorScaleMath";
import {
  DAY_MS,
  rollupByPeriod,
  utcPeriod,
  type TimeBucket,
} from "@/lib/dailyRollup";
import type { datum } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { Filter } from "@/types/FilterTypes";
import { scaleLinear } from "d3-scale";
import { area, curveLinear, curveStepAfter, line } from "d3-shape";
import { numericScale } from "../Axis/numericScale";
import type { LineChartSettings } from "./definition";

export interface TimeSeriesSnapshot {
  revision: string;
  allIds: number[];
  liveIds: number[];
  dates: Record<number, datum>;
  measures: Record<number, datum>;
  groups: Record<number, datum>;
  rawDates: Record<number, datum>;
  rawInputs: Record<number, datum>;
  exclusionReasons: Record<number, string>;
  colorScale?: ColorScaleType;
  facetData?: Record<string, Record<number, datum>>;
}

export interface TimePoint extends TimeBucket {
  id: string;
  seriesKey: string;
  seriesValue: datum;
  seriesLabel: string;
  label: string;
  valueText: string;
  state: "value" | "empty" | "invalid";
  selected: boolean;
  x: number;
  y: number;
  color: string;
  band?: { lower: number; upper: number; complete: boolean };
}

export function periodFilter(field: string, start: number, end: number) {
  return {
    type: "date-range" as const,
    field,
    min: new Date(start).toISOString().slice(0, 10),
    max: new Date(end - DAY_MS).toISOString().slice(0, 10),
  };
}

export function timePointFilters(
  settings: LineChartSettings,
  point: TimePoint,
  facetFilters: Filter[] = []
): Filter[] {
  const fields = new Set([
    settings.xField,
    settings.time?.splitField,
    ...facetFilters.map((filter) => filter.field),
  ]);
  const rest = settings.filters.filter((filter) => !fields.has(filter.field));
  const next: Filter[] = [
    periodFilter(settings.xField, point.start, point.end),
  ];
  if (settings.time?.splitField)
    next.push({
      type: "value",
      field: settings.time.splitField,
      values: [point.seriesValue],
    });
  next.push(
    ...facetFilters.filter(
      (filter) => !next.some((item) => item.field === filter.field)
    )
  );
  const own = settings.filters.filter((filter) => fields.has(filter.field));
  return JSON.stringify(own) === JSON.stringify(next)
    ? rest
    : [...rest, ...next];
}

export function planTimeSeries(
  settings: LineChartSettings,
  snapshot: TimeSeriesSnapshot,
  width: number,
  height: number,
  getLabel: (field: string) => string,
  format: (field: string, value: datum) => string,
  typography: AxisTypography = DEFAULT_AXIS_TYPOGRAPHY
) {
  const time = settings.time!;
  const filled = time.display === "area" || time.display === "stacked-area";
  const stacked = time.display === "stacked-area";
  const facetFilters: Filter[] = Object.entries(snapshot.facetData ?? {}).map(
    ([field, data]) => ({
      type: "value",
      field,
      values: [
        ...new Map(
          snapshot.allIds.map((id) => [
            categoryKey(categoryValue(data[id])),
            categoryValue(data[id]),
          ])
        ).values(),
      ],
    })
  );
  const metricLabel =
    time.aggregation === "count"
      ? "Row count"
      : `${time.aggregation === "sum" ? "Sum" : "Average"} of ${getLabel(time.measureField ?? "")}`;
  const formatValue = (value: number) =>
    time.aggregation === "count"
      ? value.toLocaleString("en-US")
      : format(time.measureField ?? "", value);
  const range = snapshot.liveIds.flatMap((id) => {
    const period = utcPeriod(snapshot.dates[id], time.interval, time.weekStart);
    return period ? [period] : [];
  });
  const start = range.reduce(
    (min, period) => Math.min(min, period.start),
    Infinity
  );
  const end = range.reduce(
    (max, period) => Math.max(max, period.end),
    -Infinity
  );
  const periods: NonNullable<ReturnType<typeof utcPeriod>>[] = [];
  for (let cursor = start; cursor < end && periods.length <= 2000; ) {
    const period = utcPeriod(
      new Date(cursor).toISOString(),
      time.interval,
      time.weekStart
    )!;
    periods.push(period);
    cursor = period.end;
  }
  const groupMap = new Map<string, datum>();
  for (const id of snapshot.allIds) {
    const value = time.splitField ? categoryValue(snapshot.groups[id]) : null;
    groupMap.set(categoryKey(value), value);
  }
  const liveSet = new Set(snapshot.liveIds);
  const liveGroups = new Set(
    snapshot.liveIds.map((id) =>
      categoryKey(time.splitField ? categoryValue(snapshot.groups[id]) : null)
    )
  );
  const tooMany =
    periods.length > 2000
      ? "Choose a larger interval or filter the dates in another view to show at most 2,000 periods."
      : liveGroups.size > 30
        ? "Filter the series field in another view to show at most 30 series."
        : undefined;
  const color = snapshot.colorScale
    ? makeColorScale(snapshot.colorScale)
    : undefined;
  const invalidDateIds: number[] = [];
  const points: TimePoint[] = [];
  const series = [...groupMap]
    .map(([key, value], index) => {
      const label = time.splitField ? categoryLabel(value) : metricLabel;
      const seriesColor =
        color?.(value) ??
        defaultCategoricalColors[index % defaultCategoricalColors.length]!;
      const ids = snapshot.allIds.filter(
        (id) =>
          liveSet.has(id) &&
          categoryKey(
            time.splitField ? categoryValue(snapshot.groups[id]) : null
          ) === key
      );
      const result = rollupByPeriod(
        ids,
        snapshot.dates,
        snapshot.measures,
        { ...time, dateField: settings.xField },
        snapshot.rawInputs,
        snapshot.exclusionReasons
      );
      invalidDateIds.push(...result.invalidDateIds);
      const buckets = new Map(
        result.buckets.map((bucket) => [bucket.start, bucket])
      );
      const seriesPoints: TimePoint[] = [];
      if (!tooMany && liveGroups.has(key))
        for (const period of periods) {
          const bucket = buckets.get(period.start);
          const state = !bucket
            ? "empty"
            : bucket.value === undefined
              ? "invalid"
              : "value";
          const value =
            bucket?.value ??
            (!bucket &&
            time.aggregation !== "average" &&
            time.missingPeriods === "zero"
              ? 0
              : undefined);
          const label =
            time.interval === "day"
              ? period.day
              : `${period.day} – ${new Date(period.end - DAY_MS).toISOString().slice(0, 10)}`;
          const selected =
            !settings.filters.length ||
            Boolean(
              bucket?.contributors.some((row) =>
                settings.filters.every((filter) => {
                  if (filter.field === settings.xField)
                    return applyFilter(snapshot.dates[row.sourceId], filter);
                  if (filter.field === time.splitField)
                    return applyFilter(snapshot.groups[row.sourceId], filter);
                  if (snapshot.facetData?.[filter.field])
                    return applyFilter(
                      snapshot.facetData[filter.field]![row.sourceId],
                      filter
                    );
                  return true;
                })
              )
            );
          const point: TimePoint = {
            ...period,
            value,
            rowCount: bucket?.rowCount ?? 0,
            contributors: bucket?.contributors ?? [],
            id: JSON.stringify([key, period.start]),
            seriesKey: key,
            seriesValue: groupMap.get(key),
            seriesLabel: time.splitField
              ? categoryLabel(groupMap.get(key))
              : metricLabel,
            label,
            state,
            valueText:
              value === undefined
                ? state === "empty"
                  ? "No rows"
                  : "No valid values"
                : formatValue(value),
            selected,
            x: 0,
            y: 0,
            color: seriesColor,
          };
          points.push(point);
          seriesPoints.push(point);
        }
      return {
        key,
        label,
        color: seriesColor,
        points: seriesPoints,
        path: "",
        areaPath: "",
      };
    })
    .filter((series) => series.points.length > 0);
  let incompletePeriods = 0;
  if (filled) {
    for (let i = 0; i < periods.length; i++) {
      const complete = series.every(
        (item) => item.points[i]?.value !== undefined
      );
      if (stacked && !complete) incompletePeriods++;
      let lower = 0;
      for (const item of series) {
        const point = item.points[i];
        if (!point) continue;
        point.band = {
          lower: stacked ? lower : 0,
          upper: (stacked ? lower : 0) + (point.value ?? 0),
          complete: stacked ? complete : point.value !== undefined,
        };
        lower = point.band.upper;
      }
    }
  }
  const notice =
    tooMany ??
    (stacked && time.aggregation === "average"
      ? "Choose count or sum to stack series. Use Area to compare averages."
      : stacked && points.some((point) => (point.value ?? 0) < 0)
        ? "Stacked areas need nonnegative period totals. Use Area or Line to compare signed totals."
        : undefined);
  const values = points.flatMap((point) =>
    point.value === undefined || point.band?.complete === false
      ? []
      : [point.band?.upper ?? point.value]
  );
  const yLow = Math.min(0, ...values);
  const yHigh = Math.max(0, ...values);
  // Y labels claim their measured width, never less than the old estimate.
  const yTickSize = settings.yAxis.tickFontSize ?? typography.tickSize;
  const yLabelWidth = Math.max(
    ...[yLow, yHigh].map((value) => {
      const text = formatValue(value);
      return Math.max(
        text.length * yTickSize * 0.6,
        typography.measure(text, yTickSize)
      );
    })
  );
  const margin = {
    ...settings.margin,
    top: Math.max(
      settings.colorField === time.splitField && settings.colorScaleId
        ? 28
        : 44,
      settings.margin.top
    ),
    bottom: Math.max(64, settings.margin.bottom),
    left: Math.min(
      width * 0.32,
      Math.max(
        58,
        settings.margin.left,
        yLabelWidth + 22 + Math.max(0, typography.labelSize - 11)
      )
    ),
    right: Math.max(16, Math.min(settings.margin.right, width * 0.12)),
  };
  const plotWidth = Math.max(1, width - margin.left - margin.right);
  const plotHeight = Math.max(1, height - margin.top - margin.bottom);
  const xScale = scaleLinear()
    .domain(Number.isFinite(start) ? [start, end] : [0, DAY_MS])
    .range([0, plotWidth]);
  const yScaleType = filled ? "linear" : settings.yAxis.scaleType;
  const yScale = numericScale({ ...settings.yAxis, scaleType: yScaleType })
    .domain(yHigh === yLow ? [yLow, yLow + 1] : [yLow, yHigh])
    .range([plotHeight, 0])
    .nice();
  for (const point of points) {
    point.x = xScale((point.start + point.end) / 2);
    point.y = yScale(
      point.band?.complete === false
        ? 0
        : (point.band?.upper ?? point.value ?? 0)
    );
  }
  const curve =
    settings.styles.curveType === "step" ? curveStepAfter : curveLinear;
  const defined = (point: TimePoint) =>
    point.value !== undefined && point.band?.complete !== false;
  for (const item of series) {
    item.path =
      line<TimePoint>()
        .defined(defined)
        .x((point) => point.x)
        .y((point) => point.y)
        .curve(curve)(item.points) ?? "";
    if (filled)
      item.areaPath =
        area<TimePoint>()
          .defined(defined)
          .x((point) => point.x)
          .y0((point) => yScale(point.band!.lower))
          .y1((point) => point.y)
          .curve(curve)(item.points) ?? "";
  }
  return {
    revision: snapshot.revision,
    aggregation: time.aggregation,
    facetFilters,
    metricLabel,
    snapshot,
    points,
    series,
    invalidDateIds,
    tooMany,
    notice,
    filled,
    stacked,
    incompletePeriods,
    yScaleType,
    curveType: settings.styles.curveType,
    margin,
    plotWidth,
    plotHeight,
    xScale,
    yScale,
    formatValue,
    dateLabel: getLabel(settings.xField),
    scopeNote:
      "UTC periods. Rows after other chart filters and facet selection; this chart's own selection keeps the surrounding series visible.",
  };
}
export type TimeSeriesPlan = ReturnType<typeof planTimeSeries>;

/** Match the painted band, then trace the closest period that defines it. */
export function timeAreaAt(plan: TimeSeriesPlan, x: number, y: number) {
  for (const series of [...plan.series].reverse()) {
    const right = series.points.findIndex((point) => point.x >= x);
    if (right < 0) continue;
    const a = series.points[Math.max(0, right - 1)]!;
    const b = series.points[right]!;
    if (!a.band?.complete || !b.band?.complete || x < a.x) continue;
    const fraction = a.x === b.x ? 0 : (x - a.x) / (b.x - a.x);
    const t = plan.curveType === "step" && fraction < 1 ? 0 : fraction;
    const lower = plan.yScale(a.band.lower + (b.band.lower - a.band.lower) * t);
    const upper = plan.yScale(a.band.upper + (b.band.upper - a.band.upper) * t);
    if (y >= Math.min(lower, upper) && y <= Math.max(lower, upper))
      return (plan.curveType === "step" ? t : fraction) < 0.5 ? a : b;
  }
  return undefined;
}
