import { useId, useMemo } from "react";
import { convertFieldValue } from "@/lib/fieldSettings";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
import { useGetAllIds } from "../useGetLiveData";
import type { MetricCardSettings } from "./definition";
import { planMetricCard } from "./metricCardPlan";
import { makeMetricCardTraceSource } from "./metricCardTrace";

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
    const rawInputs: Record<number, datum> = {};
    const exclusionReasons: Record<number, string> = {};
    if (
      field &&
      !calculations.some((calc) => calc.resultColumnName === field)
    ) {
      const format = fieldSettings[field] ?? {};
      const type =
        format.type ??
        profiles.find((profile) => profile.name === field)?.dataType ??
        "categorical";
      for (const id of liveIds) {
        const raw = (rawData[id] as Record<string, datum> | undefined)?.[field];
        rawInputs[id] = raw;
        const converted = convertFieldValue(raw, type, format);
        if (converted.error)
          exclusionReasons[id] = `Conversion failed: ${converted.error}`;
      }
    }
    return planMetricCard(
      settings,
      {
        revision: `${revision}:${settings.aggregation}:${field ?? ""}:${JSON.stringify(fieldSettings)}`,
        liveIds,
        allIds,
        measureData,
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

  const fontSize =
    plan.state === "value"
      ? Math.min(
          64,
          Math.max(
            22,
            ((width - 40) / Math.max(4, plan.valueText.length)) * 1.5
          ),
          // A comparison line takes room from the value.
          Math.max(24, height * (plan.comparison ? 0.24 : 0.3))
        )
      : Math.min(28, Math.max(18, width / 15));

  const comparison = plan.comparison;
  const percent = (share: number) =>
    share.toLocaleString("en-US", {
      style: "percent",
      maximumFractionDigits: share < 0.1 ? 1 : 0,
    });

  // The top line counts rows; a filtered card says it under the value.
  const rowsText = comparison
    ? ""
    : `${plan.rowCount.toLocaleString()} ${plan.rowCount === 1 ? "row" : "rows"}`;
  const filteredRows =
    comparison && plan.aggregation !== "count" && plan.totalRows !== undefined
      ? `${plan.rowCount.toLocaleString()} of ${plan.totalRows.toLocaleString()} rows`
      : "";
  const excludedText =
    plan.excludedCount > 0
      ? `${plan.excludedCount.toLocaleString()} excluded`
      : "";

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
      <div className="flex items-center justify-between gap-x-3">
        <p className="min-w-0 text-xs text-muted-foreground">
          {plan.metricLabel}
          {(rowsText || excludedText) && (
            <span className="text-xs tabular-nums">
              {" · "}
              {[rowsText, excludedText].filter(Boolean).join(" · ")}
            </span>
          )}
        </p>
      </div>
      <p
        className="break-words font-semibold leading-tight tabular-nums"
        style={{ fontSize }}
      >
        {plan.valueText}
      </p>
      {comparison && (
        <p className="flex min-w-0 items-center gap-1.5 text-xs leading-tight text-muted-foreground tabular-nums">
          {comparison.kind === "share" && (
            <>
              <span className="eda-metric-bar" aria-hidden="true">
                <span
                  style={{ width: `${Math.min(1, comparison.share) * 100}%` }}
                />
              </span>
              <span>
                <b>{percent(comparison.share)}</b>{" "}
                {plan.aggregation === "count"
                  ? `of all ${comparison.baselineText} rows`
                  : `of the ${comparison.baselineText} total`}
                {filteredRows && (
                  <span className="whitespace-nowrap"> · {filteredRows}</span>
                )}
              </span>
            </>
          )}
          {comparison.kind === "delta" &&
            (comparison.delta === 0 ? (
              <span>
                Same as all rows
                {filteredRows && (
                  <span className="whitespace-nowrap"> · {filteredRows}</span>
                )}
              </span>
            ) : (
              <>
                <span>
                  <b>{comparison.deltaText}</b> vs {comparison.baselineText} for
                  all rows
                  {filteredRows && (
                    <span className="whitespace-nowrap"> · {filteredRows}</span>
                  )}
                </span>
              </>
            ))}
        </p>
      )}
    </div>
  );
}
