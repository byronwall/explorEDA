import { useId, useMemo } from "react";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps } from "@/types/ChartTypes";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetAllIds } from "../useGetLiveData";
import type { MetricCardSettings } from "./definition";
import { measureInputs } from "./measureInputs";
import { planMetricCard } from "./metricCardPlan";
import { makeMetricCardTraceSource } from "./metricCardTrace";
import {
  planMetricTrend,
  type MetricTrend,
  type MetricTrendPoint,
} from "./metricTrend";
import { ActionTooltip } from "@/components/ui/tooltip";

export function MetricCard({
  settings,
  width,
  height,
}: BaseChartProps<MetricCardSettings>) {
  const owner = useId();
  const traceApi = useChartTraceApi();
  const revision = useTraceRevision(settings);
  const liveItems = useDataLayer((state) => state.liveItems);
  const crossfilter = useDataLayer((state) => state.crossfilterWrapper);
  const rawData = useDataLayer((state) => state.rawData);
  const fieldSettings = useDataLayer((state) => state.fieldSettings);
  const profiles = useDataLayer((state) => state.fieldProfiles);
  const calculations = useDataLayer((state) => state.calculations);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const formatFieldValue = useDataLayer((state) => state.formatFieldValue);
  const allIds = useGetAllIds(settings);

  const plan = useMemo(() => {
    const liveIds = crossfilter.getChartFilteredRowIds(settings);
    const field =
      settings.aggregation === "count" ? undefined : settings.measureField;
    const measureData = field ? getColumnData(field) : {};
    const entityData = settings.entityField
      ? getColumnData(settings.entityField)
      : undefined;
    const { rawInputs, exclusionReasons } = measureInputs(field, liveIds, {
      rawData,
      fieldSettings,
      profiles,
      calculations,
    });
    return planMetricCard(
      settings,
      {
        revision: `${revision}:${settings.aggregation}:${field ?? ""}:${settings.entityField ?? ""}:${JSON.stringify(fieldSettings)}`,
        liveIds,
        allIds,
        measureData,
        entityData,
        rawInputs,
        exclusionReasons,
      },
      getFieldLabel,
      formatFieldValue
    );
  }, [
    settings,
    revision,
    liveItems,
    allIds,
    crossfilter,
    rawData,
    fieldSettings,
    profiles,
    calculations,
    getColumnData,
    getFieldLabel,
    formatFieldValue,
  ]);

  const source = useMemo(
    (): TraceSource => ({
      role: "chart",
      revision: plan.revision,
      ...makeMetricCardTraceSource(plan),
    }),
    [plan]
  );
  useTraceSource(owner, source);

  const trend = useMemo(
    () =>
      settings.trendField
        ? planMetricTrend(
            settings,
            getColumnData(settings.trendField),
            settings.aggregation === "count" || !settings.measureField
              ? {}
              : getColumnData(settings.measureField),
            settings.entityField
              ? getColumnData(settings.entityField)
              : undefined,
            plan.liveIds,
            allIds
          )
        : undefined,
    // The plan's revision changes with the live rows and settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan, settings.trendField, getColumnData, allIds]
  );
  // Every size and slot below comes from the tile's size and the all-rows
  // value, never from the filtered value, so a filter changes text only and
  // nothing moves. A wide, short tile puts the trend beside the value; a tall
  // or narrow one puts it underneath. A very small tile has no room for it.
  const showTrend = Boolean(trend) && width >= 180;
  const trendBeside = showTrend && width >= 300 && height < 150;
  const valueWidth = trendBeside ? width * 0.5 : width;
  const sizingText =
    plan.state === "value" &&
    plan.valueText.length > (plan.allValueText ?? "").length
      ? plan.valueText
      : (plan.allValueText ?? plan.valueText);
  const fontSize = Math.min(
    64,
    Math.max(22, ((valueWidth - 40) / Math.max(4, sizingText.length)) * 1.5),
    // The two note lines, or a trend underneath, take room from the value.
    Math.max(24, height * (showTrend && !trendBeside ? 0.2 : 0.24))
  );

  const comparison = plan.comparison;
  const percent = (share: number) =>
    share.toLocaleString("en-US", {
      style: "percent",
      maximumFractionDigits: share < 0.1 ? 1 : 0,
    });

  const [oneUnit, manyUnits] = settings.entityField
    ? ["ID", "IDs"]
    : ["row", "rows"];
  const filteredRows =
    comparison && plan.aggregation !== "count" && plan.totalRows !== undefined
      ? `${plan.rowCount.toLocaleString()} of ${plan.totalRows.toLocaleString()} ${manyUnits}`
      : "";
  const excludedText =
    plan.excludedCount > 0
      ? `${plan.excludedCount.toLocaleString()} excluded`
      : "";
  const comparisonText = !comparison
    ? ""
    : comparison.kind === "share"
      ? plan.aggregation === "count"
        ? `${percent(comparison.share)} of all ${comparison.baselineText} rows`
        : `${percent(comparison.share)} of the ${comparison.baselineText} total`
      : comparison.delta === 0
        ? "Same as all rows"
        : `${comparison.deltaText} vs ${comparison.baselineText} for all rows`;
  // Without a comparison, the first note line says which rows the value covers.
  const scopeText =
    plan.totalRows === undefined
      ? plan.aggregation === "count"
        ? `All ${manyUnits}`
        : `All ${plan.rowCount.toLocaleString()} ${manyUnits}`
      : `${plan.rowCount.toLocaleString()} of ${plan.totalRows.toLocaleString()} ${manyUnits}`;
  const secondLine = [filteredRows, excludedText].filter(Boolean).join(" · ");
  // The panel title already names the metric, so the card does not repeat
  // it. The full definition shows on hover over the value.
  const definition = [
    plan.metricLabel,
    plan.aggregation === "count"
      ? ""
      : `${plan.rowCount.toLocaleString()} ${plan.rowCount === 1 ? oneUnit : manyUnits}`,
    comparisonText,
    excludedText,
    trend && showTrend
      ? `Line: ${trend.interval === "day" ? "dai" : trend.interval}ly ${plan.aggregation === "count" ? "rows" : plan.aggregation}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const value = (
    <ActionTooltip content={definition}>
      <p
        className="flex max-w-full items-center overflow-hidden font-semibold leading-tight tabular-nums"
        style={{ fontSize, height: `${fontSize * 1.25}px` }}
      >
        <span
          className="truncate"
          style={
            plan.state === "value"
              ? undefined
              : { fontSize: Math.min(fontSize, 18) }
          }
        >
          {plan.valueText}
        </span>
      </p>
    </ActionTooltip>
  );
  // Two note lines are always reserved, filtered or not, and span the tile
  // under the trend so they have room to read.
  const note = (
    <div className="eda-metric-note text-xs leading-tight text-muted-foreground tabular-nums">
      <p className="flex min-w-0 items-center gap-1.5">
        {comparison?.kind === "share" && (
          <span className="eda-metric-bar" aria-hidden="true">
            <span
              style={{
                width: `${Math.min(1, comparison.share) * 100}%`,
              }}
            />
          </span>
        )}
        {comparison && (
          <span className="truncate">
            {comparison.kind === "share" ? (
              <>
                <b>{percent(comparison.share)}</b>{" "}
                {plan.aggregation === "count"
                  ? `of all ${comparison.baselineText} rows`
                  : `of the ${comparison.baselineText} total`}
              </>
            ) : comparison.delta === 0 ? (
              "Same as all rows"
            ) : (
              <>
                <b>{comparison.deltaText}</b> vs {comparison.baselineText} for
                all rows
              </>
            )}
          </span>
        )}
        {!comparison && <span className="truncate">{scopeText}</span>}
      </p>
      <p className="truncate">{secondLine}</p>
    </div>
  );
  const sparkline = showTrend && trend && (
    <MetricSparkline
      trend={trend}
      label={`${plan.metricLabel} by ${trend.interval}`}
      fieldLabel={getFieldLabel(settings.trendField!)}
    />
  );

  return (
    <div
      className="eda-metric flex h-full min-h-0 flex-col gap-0.5 overflow-auto px-2.5 py-1"
      style={{ justifyContent: "safe center" }}
      aria-label={plan.metricLabel}
      aria-description="Alt-click or Alt-Enter to list the rows behind this value"
      tabIndex={0}
      onClick={(event) => {
        if (event.altKey)
          traceApi?.inspect(owner, "metric-card", "metric-card:total");
      }}
      onKeyDown={(event) => {
        if (event.altKey && event.key === "Enter") {
          event.preventDefault();
          traceApi?.inspect(owner, "metric-card", "metric-card:total");
        }
      }}
    >
      {trendBeside ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-0.5">
          <div className="flex min-h-0 flex-1 items-center gap-3">
            <div className="min-w-0 shrink-0 grow-0 basis-1/2">{value}</div>
            {sparkline}
          </div>
          {note}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            {value}
            {note}
          </div>
          {sparkline}
        </div>
      )}
    </div>
  );
}

/** Draws the card's metric per period, over the same metric for all rows. */
function MetricSparkline({
  trend,
  label,
  fieldLabel,
}: {
  trend: MetricTrend;
  label: string;
  fieldLabel: string;
}) {
  const values = [...trend.live, ...(trend.all ?? [])].flatMap((point) =>
    point.value === undefined ? [] : [point.value]
  );
  const low = Math.min(0, ...values);
  const high = Math.max(...values, low + 1);
  const last = trend.live.length - 1;
  const x = (index: number) => (index / last) * 100;
  const y = (value: number) => 38 - ((value - low) / (high - low)) * 36;
  const path = (points: MetricTrendPoint[]) =>
    points
      .map((point, index) =>
        point.value === undefined
          ? ""
          : `${index > 0 && points[index - 1]?.value !== undefined ? "L" : "M"}${x(index)},${y(point.value)}`
      )
      .join("");
  const line = path(trend.live);
  // Only an unbroken line gets an area under it.
  const fill = trend.live.every((point) => point.value !== undefined)
    ? `${line}L100,${y(low)}L0,${y(low)}Z`
    : "";

  // The axis names the time field and its span. Periods come from every
  // row, so these labels never change with a filter.
  const first = trend.live[0]!.start;
  const lastStart = trend.live[last]!.start;
  const [from, to] = periodRange(first, lastStart, trend.interval);
  const per = trend.interval === "day" ? "daily" : `${trend.interval}ly`;

  return (
    <div className="eda-metric-trend">
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}, ${from} to ${to}`}
      >
        {fill && <path className="eda-metric-trend-fill" d={fill} />}
        {trend.all && (
          <path className="eda-metric-trend-all" d={path(trend.all)} />
        )}
        <path className="eda-metric-trend-live" d={line} />
      </svg>
      <div className="eda-metric-trend-axis" aria-hidden="true">
        <span>{from}</span>
        <span>{to}</span>
      </div>
      <div className="eda-metric-trend-field" aria-hidden="true">
        {fieldLabel}, {per}
      </div>
    </div>
  );
}

/** Labels for the first and last period: months by month and year, else by day. */
function periodRange(
  first: number,
  last: number,
  interval: MetricTrend["interval"]
): [string, string] {
  const year = (time: number) => new Date(time).getUTCFullYear();
  const format = (time: number, withYear: boolean) =>
    new Date(time).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      ...(interval === "month" ? {} : { day: "numeric" }),
      ...(withYear ? { year: "numeric" } : {}),
    });
  if (interval === "month") return [format(first, true), format(last, true)];
  const sameYear = year(first) === year(last);
  return [format(first, !sameYear), format(last, true)];
}
