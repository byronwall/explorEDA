import {
  summarizeGroup,
  type AggregateContributor,
  type AggregateInputRow,
} from "@/lib/aggregates";
import type { datum } from "@/types/ChartTypes";
import type { MetricCardSettings } from "./definition";

export type MetricCardState = "value" | "empty" | "invalid";

export interface MetricCardPlan {
  revision: string;
  aggregation: MetricCardSettings["aggregation"];
  measureField?: string;
  measureLabel?: string;
  metricLabel: string;
  state: MetricCardState;
  value?: number;
  valueText: string;
  rowCount: number;
  includedCount: number;
  excludedCount: number;
  contributors: AggregateContributor[];
  /** Total rows or entities, when filters narrow the card. */
  totalRows?: number;
  /** How the value compares with the same metric over every row. */
  comparison?: MetricCardComparison;
  scopeNote: string;
}

export type MetricCardComparison =
  | { kind: "share"; share: number; baselineText: string }
  | { kind: "delta"; delta: number; deltaText: string; baselineText: string };

export interface MetricCardSnapshot {
  revision: string;
  liveIds: number[];
  /** Every source row. With it, a filtered card compares against all rows. */
  allIds?: number[];
  measureData: Record<number, datum>;
  entityData?: Record<number, datum>;
  rawInputs?: Record<number, datum>;
  exclusionReasons?: Record<number, string>;
}

export function planMetricCard(
  settings: MetricCardSettings,
  snapshot: MetricCardSnapshot,
  getFieldLabel: (field: string) => string,
  formatFieldValue: (field: string, value: datum) => string
): MetricCardPlan {
  const measureField =
    settings.aggregation === "count" ? undefined : settings.measureField;
  const group: AggregateInputRow[] = snapshot.liveIds.map((__ID) => ({
    __ID,
    ...(measureField ? { [measureField]: snapshot.measureData[__ID] } : {}),
    ...(settings.entityField
      ? { [settings.entityField]: snapshot.entityData?.[__ID] }
      : {}),
  }));
  const result = summarizeGroup(
    group,
    {
      aggregation: settings.aggregation,
      measureField,
      entityField: settings.entityField,
    },
    snapshot.rawInputs,
    snapshot.exclusionReasons
  );
  const measureLabel = measureField ? getFieldLabel(measureField) : undefined;
  const metricLabel =
    settings.aggregation === "count"
      ? settings.entityField
        ? `Distinct ${getFieldLabel(settings.entityField)}`
        : "Row count"
      : `${settings.aggregation === "sum" ? "Sum" : "Average"} of ${measureLabel}${settings.entityField ? `, once per ${getFieldLabel(settings.entityField)}` : ""}`;
  const state: MetricCardState =
    group.length === 0
      ? "empty"
      : result.value === undefined
        ? "invalid"
        : "value";
  const valueText =
    state === "empty"
      ? "No rows"
      : state === "invalid"
        ? result.identityIssues?.some(
            (issue) => issue.reason === "conflicting-values"
          )
          ? "Values differ within one ID"
          : "No valid values"
        : measureField
          ? formatFieldValue(measureField, result.value!)
          : result.value!.toLocaleString("en-US");

  const format = (value: number) =>
    measureField
      ? formatFieldValue(measureField, value)
      : value.toLocaleString("en-US");
  const filtered =
    snapshot.allIds !== undefined &&
    snapshot.liveIds.length < snapshot.allIds.length;
  let comparison: MetricCardComparison | undefined;
  let totalRows = snapshot.allIds?.length;
  if (filtered && state === "value") {
    const baselineResult = summarizeGroup(
      snapshot.allIds!.map((__ID) => ({
        __ID,
        ...(measureField ? { [measureField]: snapshot.measureData[__ID] } : {}),
        ...(settings.entityField
          ? { [settings.entityField]: snapshot.entityData?.[__ID] }
          : {}),
      })),
      {
        aggregation: settings.aggregation,
        measureField,
        entityField: settings.entityField,
      }
    );
    totalRows = baselineResult.rowCount;
    const baseline = baselineResult.value;
    if (baseline !== undefined) {
      const value = result.value!;
      if (settings.aggregation === "average") {
        const delta = value - baseline;
        comparison = {
          kind: "delta",
          delta,
          deltaText: `${delta < 0 ? "−" : "+"}${format(Math.abs(delta))}`,
          baselineText: format(baseline),
        };
      } else if (baseline > 0 && value >= 0) {
        // A share only reads when every part adds toward a positive whole.
        comparison = {
          kind: "share",
          share: value / baseline,
          baselineText: format(baseline),
        };
      }
    }
  }

  return {
    revision: snapshot.revision,
    aggregation: settings.aggregation,
    measureField,
    measureLabel,
    metricLabel,
    state,
    value: result.value,
    valueText,
    rowCount: result.rowCount,
    includedCount: result.contributors.filter((item) => item.included).length,
    excludedCount: result.contributors.filter(
      (item) =>
        !item.included &&
        item.exclusionReason !== "Repeats an ID already counted"
    ).length,
    contributors: result.contributors,
    totalRows: filtered ? totalRows : undefined,
    comparison,
    scopeNote: settings.entityField
      ? `Each ${getFieldLabel(settings.entityField)} once, among rows that pass this chart's filters and the other active chart filters.`
      : "Rows that pass this chart's filters and the other active chart filters.",
  };
}
