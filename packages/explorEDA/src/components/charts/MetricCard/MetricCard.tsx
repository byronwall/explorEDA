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
  // A wide, short tile puts the trend beside the value; a tall or narrow
  // one puts it underneath. A very small tile has no room for it.
  const showTrend = Boolean(trend) && plan.state === "value" && width >= 180;
  const trendBeside = showTrend && width >= 300 && height < 150;
  const valueWidth = trendBeside ? width * 0.5 : width;

  const fontSize =
    plan.state === "value"
      ? Math.min(
          64,
          Math.max(
            22,
            ((valueWidth - 40) / Math.max(4, plan.valueText.length)) * 1.5
          ),
          // A comparison line or a trend underneath takes room from the value.
          Math.max(
            24,
            height *
              (showTrend && !trendBeside ? 0.22 : plan.comparison ? 0.24 : 0.3)
          )
        )
      : Math.min(28, Math.max(18, width / 15));

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
  // The panel title already names the metric, so the card does not repeat
  // it. The full definition shows on hover over the value.
  const definition = [
    plan.metricLabel,
    plan.aggregation === "count"
      ? ""
      : `${plan.rowCount.toLocaleString()} ${plan.rowCount === 1 ? oneUnit : manyUnits}`,
    excludedText,
    trend && showTrend
      ? `Line: ${trend.interval === "day" ? "dai" : trend.interval}ly ${plan.aggregation === "count" ? "rows" : plan.aggregation}`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");

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
      <div
        className={
          trendBeside
            ? "flex min-h-0 flex-1 items-center gap-3"
            : "flex min-h-0 flex-1 flex-col justify-center gap-1"
        }
      >
        <div
          className={`flex min-w-0 flex-col gap-0.5 ${trendBeside ? "max-w-[55%] shrink-0" : ""}`}
        >
          <ActionTooltip content={definition}>
            <p
              className="w-fit break-words font-semibold leading-tight tabular-nums"
              style={{ fontSize }}
            >
              {plan.valueText}
            </p>
          </ActionTooltip>
          {comparison && (
            <p className="flex min-w-0 items-center gap-1.5 text-xs leading-tight text-muted-foreground tabular-nums">
              {comparison.kind === "share" && (
                <>
                  <span className="eda-metric-bar" aria-hidden="true">
                    <span
                      style={{
                        width: `${Math.min(1, comparison.share) * 100}%`,
                      }}
                    />
                  </span>
                  <span>
                    <b>{percent(comparison.share)}</b>{" "}
                    {plan.aggregation === "count"
                      ? `of all ${comparison.baselineText} rows`
                      : `of the ${comparison.baselineText} total`}
                    {filteredRows && (
                      <span className="whitespace-nowrap">
                        {" "}
                        · {filteredRows}
                      </span>
                    )}
                  </span>
                </>
              )}
              {comparison.kind === "delta" &&
                (comparison.delta === 0 ? (
                  <span>
                    Same as all rows
                    {filteredRows && (
                      <span className="whitespace-nowrap">
                        {" "}
                        · {filteredRows}
                      </span>
                    )}
                  </span>
                ) : (
                  <>
                    <span>
                      <b>{comparison.deltaText}</b> vs {comparison.baselineText}{" "}
                      for all rows
                      {filteredRows && (
                        <span className="whitespace-nowrap">
                          {" "}
                          · {filteredRows}
                        </span>
                      )}
                    </span>
                  </>
                ))}
            </p>
          )}
          {excludedText && (
            <p className="text-xs leading-tight text-muted-foreground tabular-nums">
              {excludedText}
            </p>
          )}
        </div>
        {showTrend && trend && (
          <MetricSparkline
            trend={trend}
            label={`${plan.metricLabel} by ${trend.interval}`}
          />
        )}
      </div>
    </div>
  );
}

/** Draws the card's metric per period, over the same metric for all rows. */
function MetricSparkline({
  trend,
  label,
}: {
  trend: MetricTrend;
  label: string;
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

  return (
    <svg
      className="eda-metric-trend"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      {fill && <path className="eda-metric-trend-fill" d={fill} />}
      {trend.all && (
        <path className="eda-metric-trend-all" d={path(trend.all)} />
      )}
      <path className="eda-metric-trend-live" d={line} />
    </svg>
  );
}
