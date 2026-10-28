import { useThemeColors } from "@/hooks/useDisplayColorScales";
import { useDisplayColorScale } from "@/hooks/useDisplayColorScales";
import { useAxisTypography } from "../chartTypography";
import { useId, useMemo, useRef, useState } from "react";
import { scaleUtc } from "d3-scale";
import { Button } from "@/components/ui/button";
import { convertFieldValue } from "@/lib/fieldSettings";
import { utcPeriod } from "@/lib/dailyRollup";
import { isAdditiveAggregation } from "@/lib/aggregates";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import { BaseChart } from "../BaseChart";
import { describeScale } from "../Axis/axisPlan";
import { annotationSlot } from "../annotations/ChartAnnotations";
import { ChartReadout } from "../ChartReadout";
import { planAxes } from "../Axis/axisPlan";
import {
  useChartTraceApi,
  useChartTrace,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import { guideTargets, resolveGuideTrace } from "../trace/traceTypes";
import { useGetAllIds, useGetLiveIds } from "../useGetLiveData";
import { useGetColumnData } from "../useGetColumnData";
import type { LineChartSettings } from "./definition";
import {
  periodFilter,
  planTimeSeries,
  timeAreaAt,
  timePointFilters,
  type TimePoint,
} from "./timeSeriesPlan";
import { timeSeriesTraceSource } from "./timeSeriesTrace";

const DENSE_PERIODS = 60;

export function TimeSeriesChart({
  settings,
  width,
  height,
  facetIds,
  facetKey,
}: BaseChartProps<LineChartSettings>) {
  const time = settings.time!;
  const owner = useId();
  const api = useChartTraceApi();
  const trace = useChartTrace();
  const revision = useTraceRevision(settings);
  const allIds = useGetAllIds(settings);
  const liveIds = useGetLiveIds(settings);
  const dates = useGetColumnData(settings.xField);
  const measures = useGetColumnData(time.measureField);
  const groups = useGetColumnData(time.splitField);
  const facetRows = useGetColumnData(settings.facet.rowVariable);
  const facetColumns = useGetColumnData(
    settings.facet.type === "grid" ? settings.facet.columnVariable : undefined
  );
  const rawData = useDataLayer((s) => s.rawData);
  const fields = useDataLayer((s) => s.fieldSettings);
  const profiles = useDataLayer((s) => s.fieldProfiles);
  const calculations = useDataLayer((s) => s.calculations);
  const getLabel = useDataLayer((s) => s.getFieldLabel);
  const format = useDataLayer((s) => s.formatFieldValue);
  const updateChart = useDataLayer((s) => s.updateChart);
  const colorScale = useDisplayColorScale(settings.colorScaleId);
  const themeColors = useThemeColors();
  const [activeId, setActiveId] = useState<string>();
  const refs = useRef(new Map<string, SVGCircleElement>());
  const typography = useAxisTypography();
  const plan = useMemo(() => {
    const facetSet = facetIds ? new Set(facetIds) : undefined;
    const scopeIds = allIds.filter((id) => !facetSet || facetSet.has(id));
    const rawDates: Record<number, datum> = {};
    const rawInputs: Record<number, datum> = {};
    const exclusionReasons: Record<number, string> = {};
    const field = time.measureField;
    for (const id of scopeIds) {
      const row = rawData[id] as Record<string, datum> | undefined;
      rawDates[id] = row?.[settings.xField];
      if (
        field &&
        !calculations.some((calc) => calc.resultColumnName === field)
      ) {
        rawInputs[id] = row?.[field];
        const fieldSettings = fields[field] ?? {};
        const type =
          fieldSettings.type ??
          profiles.find((profile) => profile.name === field)?.dataType ??
          "categorical";
        const converted = convertFieldValue(rawInputs[id], type, fieldSettings);
        if (converted.error)
          exclusionReasons[id] = `Conversion failed: ${converted.error}`;
      }
    }
    return planTimeSeries(
      settings,
      {
        revision: `${revision}:${JSON.stringify(time)}:${settings.xField}:${JSON.stringify(fields)}:${JSON.stringify(settings.facet)}`,
        allIds: scopeIds,
        liveIds: liveIds.filter((id) => !facetSet || facetSet.has(id)),
        dates,
        measures,
        groups,
        rawDates,
        rawInputs,
        exclusionReasons,
        colorScale,
        themeColors,
        facetData: facetIds
          ? {
              ...(settings.facet.rowVariable
                ? { [settings.facet.rowVariable]: facetRows }
                : {}),
              ...(settings.facet.type === "grid" &&
              settings.facet.columnVariable
                ? { [settings.facet.columnVariable]: facetColumns }
                : {}),
            }
          : undefined,
      },
      width,
      Math.max(1, height - 28),
      getLabel,
      format,
      typography
    );
  }, [
    settings,
    time,
    revision,
    allIds,
    liveIds,
    facetIds,
    dates,
    measures,
    groups,
    facetRows,
    facetColumns,
    rawData,
    fields,
    profiles,
    calculations,
    colorScale,
    themeColors,
    width,
    height,
    getLabel,
    format,
    typography,
  ]);
  const axes = useMemo(() => {
    // Ticks fall on calendar boundaries, such as each new year or quarter,
    // and read as 2021 or Apr rather than as the start of every nth period.
    const calendar = scaleUtc().domain(plan.xScale.domain());
    const count = settings.xGridLines || 5;
    const tickText = calendar.tickFormat(count);
    return planAxes({
      plotWidth: plan.plotWidth,
      plotHeight: plan.plotHeight,
      margin: plan.margin,
      x: {
        typography,
        scale: plan.xScale,
        tickValues: calendar.ticks(count).map((date) => date.getTime()),
        field: settings.xField,
        tickFontSize: settings.xAxis.tickFontSize,
        labelFontSize: settings.xAxis.labelFontSize,
        label: settings.xAxisLabel || `${plan.dateLabel} · UTC`,
        grid: settings.xAxis.grid,
        format: (value) => tickText(new Date(Number(value))),
      },
      y: {
        typography,
        scale: plan.yScale,
        scaleType: plan.yScaleType,
        tickFontSize: settings.yAxis.tickFontSize,
        labelFontSize: settings.yAxis.labelFontSize,
        label: settings.yAxisLabel || plan.metricLabel,
        grid: settings.yAxis.grid ?? true,
        density: settings.yGridLines,
        format: (value) => plan.formatValue(Number(value)),
        hidden: plan.yHidden,
      },
    });
  }, [plan, settings, typography]);
  const source = useMemo(() => {
    const source = timeSeriesTraceSource(plan);
    return {
      ...source,
      resolve: (kind: string, id: string) =>
        kind === "guide"
          ? resolveGuideTrace(axes, id, plan.revision)
          : source.resolve(kind, id),
      targets: () => [...source.targets!(), ...guideTargets(axes)],
    };
  }, [plan, axes]);
  useTraceSource(owner, source);
  const active = plan.points.find((point) => point.id === activeId);
  const inspect = (point: TimePoint) =>
    api?.inspect(owner, "time-bucket", point.id);
  const select = (point: TimePoint) =>
    updateChart(settings.id, {
      filters: timePointFilters(settings, point, plan.facetFilters),
    });
  const marks = plan.points.filter(
    (point) =>
      (point.value !== undefined || point.rowCount > 0) &&
      (!plan.stacked || point.band?.complete) &&
      !point.offScale
  );
  // Past this many periods per series, a dot on each one hides the line.
  // The dots stay as hit and keyboard targets and show when active.
  const denseMarks =
    marks.length / Math.max(1, plan.series.length) > DENSE_PERIODS;
  const periodText =
    time.interval === "day"
      ? "Daily"
      : time.interval === "week"
        ? "Weekly"
        : time.interval === "year"
          ? "Yearly"
          : "Monthly";

  return (
    <div className="relative" style={{ width, height }}>
      <div
        className="absolute inset-x-2 top-1 flex h-10 items-start gap-2 overflow-auto text-xs"
        aria-label="Time series legend"
      >
        <span className="shrink-0 text-muted-foreground">
          {periodText} · UTC
        </span>
        {!(settings.colorField === time.splitField && settings.colorScaleId) &&
          plan.series.map((series) => (
            <span
              key={series.key}
              className="inline-flex shrink-0 items-center gap-1"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: series.color }}
              />
              {series.label}
            </span>
          ))}
      </div>
      {plan.notice || !marks.length ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {plan.notice ??
            (plan.stacked && plan.points.length
              ? "No complete periods to stack. Choose Zero for missing periods, or inspect the source records."
              : plan.snapshot.liveIds.length
                ? "No readable dates for these rows"
                : "No rows match the current filters")}
        </div>
      ) : (
        <BaseChart
          width={width}
          height={Math.max(1, height - 28)}
          settings={{
            ...settings,
            margin: plan.margin,
            xAxis: { ...settings.xAxis, scaleType: "linear" },
          }}
          xScale={plan.xScale}
          yScale={plan.yScale}
          axes={axes}
          annotations={annotationSlot(
            settings,
            settings.annotations?.length
              ? {
                  // Marks are summaries of many rows, so there is no
                  // single record to attach to: no plotted rows here.
                  xScale: describeScale(plan.xScale),
                  yScale: describeScale(plan.yScale, plan.yScaleType),
                  plotWidth: plan.xScale.range()[1]!,
                  plotHeight: plan.yScale.range()[0]!,
                  facetKey,
                  marks: {
                    points: marks.map(({ x, y }) => ({ x, y, r: 4 })),
                    paths: plan.series.map((series) => series.path),
                  },
                }
              : undefined
          )}
          brushingMode="horizontal"
          onInspectGuide={(id) => api?.inspect(owner, "guide", id)}
          onInspectPlot={([x, y]) => {
            if (plan.filled) {
              const band = timeAreaAt(plan, x, y);
              if (band)
                return Boolean(api?.inspect(owner, "time-bucket", band.id));
            }
            const point = marks.reduce((best, point) =>
              Math.hypot(point.x - x, point.y - y) <
              Math.hypot(best.x - x, best.y - y)
                ? point
                : best
            );
            return Boolean(api?.inspect(owner, "time-bucket", point.id));
          }}
          onBrushChange={(extent) => {
            const rest = settings.filters.filter(
              (filter) =>
                filter.field !== settings.xField &&
                filter.field !== time.splitField &&
                !plan.facetFilters.some((facet) => facet.field === filter.field)
            );
            const first =
              extent &&
              utcPeriod(
                new Date(plan.xScale.invert(extent[0][0])).toISOString(),
                time.interval,
                time.weekStart
              );
            const last =
              extent &&
              utcPeriod(
                new Date(plan.xScale.invert(extent[1][0])).toISOString(),
                time.interval,
                time.weekStart
              );
            updateChart(settings.id, {
              filters:
                first && last
                  ? [
                      ...rest,
                      periodFilter(settings.xField, first.start, last.end),
                      ...plan.facetFilters,
                    ]
                  : rest,
            });
          }}
          overlay={
            <g>
              {marks.map((point, index) => (
                <circle
                  key={point.id}
                  ref={(node) => {
                    if (node) refs.current.set(point.id, node);
                    else refs.current.delete(point.id);
                  }}
                  cx={point.x}
                  cy={point.y}
                  r={activeId === point.id ? 6 : 4}
                  fill={
                    point.state === "invalid"
                      ? "var(--background)"
                      : point.color
                  }
                  stroke={
                    activeId === point.id ||
                    (trace?.selection?.owner === owner &&
                      trace.selection.id === point.id)
                      ? "var(--foreground)"
                      : point.color
                  }
                  strokeWidth={2}
                  opacity={
                    denseMarks
                      ? activeId === point.id ||
                        (settings.filters.length > 0 && point.selected)
                        ? 1
                        : 0
                      : point.selected
                        ? 1
                        : 0.3
                  }
                  role="button"
                  tabIndex={
                    active?.id === point.id ||
                    (!marks.some((mark) => mark.id === active?.id) &&
                      index === 0)
                      ? 0
                      : -1
                  }
                  aria-label={`${point.seriesLabel} · ${point.label}: ${point.valueText}`}
                  aria-pressed={settings.filters.length > 0 && point.selected}
                  aria-description="Enter selects this period and series. Alt-Enter inspects its records. Arrow keys move between points."
                  className="cursor-pointer outline-none focus-visible:stroke-[var(--ring)]"
                  onPointerEnter={() => setActiveId(point.id)}
                  onFocus={() => setActiveId(point.id)}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (event.altKey) inspect(point);
                    else select(point);
                  }}
                  onKeyDown={(event) => {
                    if (
                      [
                        "ArrowRight",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowUp",
                        "Home",
                        "End",
                      ].includes(event.key)
                    ) {
                      event.preventDefault();
                      event.stopPropagation();
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? marks.length - 1
                            : Math.max(
                                0,
                                Math.min(
                                  marks.length - 1,
                                  index +
                                    (["ArrowLeft", "ArrowUp"].includes(
                                      event.key
                                    )
                                      ? -1
                                      : 1)
                                )
                              );
                      refs.current.get(marks[next]!.id)?.focus();
                    } else if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      if (event.altKey) inspect(point);
                      else select(point);
                    }
                  }}
                />
              ))}
            </g>
          }
        >
          {plan.series.map((series) => (
            <g key={series.key}>
              {plan.filled && (
                <path
                  d={series.areaPath}
                  fill={series.color}
                  fillOpacity={plan.stacked ? 0.65 : 0.25}
                />
              )}
              <path
                d={series.path}
                fill="none"
                stroke={series.color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </g>
          ))}
        </BaseChart>
      )}
      <div className="absolute inset-x-2 bottom-0 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">
          {plan.stacked && plan.incompletePeriods
            ? `${plan.incompletePeriods} incomplete ${plan.incompletePeriods === 1 ? "period breaks" : "periods break"} the stack`
            : !isAdditiveAggregation(time.aggregation) ||
                time.missingPeriods === "gap"
              ? "Missing periods are gaps"
              : "Missing periods are zero"}
        </span>
        {plan.invalidDateIds.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-1 text-xs"
            onClick={() => api?.inspect(owner, "time-omissions", "dates")}
          >
            {plan.invalidDateIds.length} unreadable dates
          </Button>
        )}
      </div>
      {active && (
        <ChartReadout fallbackClassName="sr-only">
          {width < 500 ? (
            <span
              aria-label={`${active.seriesLabel} · ${active.label} · ${active.valueText} · ${active.rowCount} rows`}
            >
              {active.seriesLabel} · {active.valueText}
            </span>
          ) : (
            <>
              {active.seriesLabel} · {active.label} · {active.valueText} ·{" "}
              {active.rowCount} rows
            </>
          )}
        </ChartReadout>
      )}
    </div>
  );
}
