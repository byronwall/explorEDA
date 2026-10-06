import type { TraceTarget } from "../trace/traceTypes";
import type { MetricCardPlan } from "./metricCardPlan";
import type { Filter } from "@/types/FilterTypes";

export interface MetricCardTrace {
  kind: "metric-card";
  id: string;
  revision: string;
  plan: MetricCardPlan;
  filters: Filter[];
  fields: string[];
}

export function makeMetricCardTraceSource(
  plan: MetricCardPlan,
  filters: Filter[],
  fields: string[]
) {
  return {
    resolve(kind: string, id: string): MetricCardTrace | undefined {
      if (kind !== "metric-card" || id !== "metric-card:total")
        return undefined;
      return {
        kind: "metric-card",
        id,
        revision: plan.revision,
        plan,
        filters,
        fields,
      };
    },
    findRow(sourceId: number) {
      return plan.contributors.some((item) => item.sourceId === sourceId)
        ? { kind: "metric-card", id: "metric-card:total" }
        : undefined;
    },
    targets(): TraceTarget[] {
      return [
        {
          kind: "metric-card",
          id: "metric-card:total",
          label: "Metric card total",
        },
      ];
    },
  };
}
