import { useId, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { convertFieldValue } from "@/lib/fieldSettings";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { BaseChartProps, datum } from "@/types/ChartTypes";
import {
  useChartTraceApi,
  useTraceRevision,
  useTraceSource,
} from "../trace/ChartTraceScope";
import type { TraceSource } from "../trace/traceTypes";
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

  const plan = useMemo(() => {
    const liveIds = crossfilter.getFilteredRowIds();
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
          Math.max(24, height * 0.3)
        )
      : Math.min(28, Math.max(18, width / 15));

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-1 overflow-auto px-4 py-2"
      style={{ justifyContent: "safe center" }}
      aria-label={plan.metricLabel}
    >
      <p className="break-words text-sm text-muted-foreground">
        {plan.metricLabel}
      </p>
      <p
        className="break-words font-semibold leading-tight tabular-nums"
        style={{ fontSize }}
      >
        {plan.valueText}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-xs text-muted-foreground">
          {plan.rowCount.toLocaleString()} matching{" "}
          {plan.rowCount === 1 ? "row" : "rows"}
          {plan.excludedCount > 0 &&
            ` · ${plan.excludedCount.toLocaleString()} excluded`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 px-2 text-xs"
          onClick={() =>
            traceApi?.inspect(owner, "metric-card", "metric-card:total")
          }
        >
          Inspect records
        </Button>
      </div>
    </div>
  );
}
