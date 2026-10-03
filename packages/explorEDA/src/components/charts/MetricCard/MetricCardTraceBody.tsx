import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { MetricCardTrace } from "./metricCardTrace";

export function MetricCardTraceBody({ trace }: { trace: MetricCardTrace }) {
  const { plan } = trace;
  return (
    <div className="space-y-2" aria-label="Metric card trace">
      <TraceSection heading={plan.metricLabel}>
        <TraceReadout label="Result">{plan.valueText}</TraceReadout>
        <TraceReadout label="Calculation">
          {plan.aggregation === "count"
            ? "Each matching row adds 1."
            : plan.includedCount === 0
              ? "A result needs at least one valid measure value."
              : plan.aggregation === "sum"
                ? `Sum of ${plan.includedCount} valid measure values.`
                : `Sum of valid measure values ÷ ${plan.includedCount} used rows.`}
        </TraceReadout>
        {plan.state === "value" && plan.aggregation !== "count" && (
          <TraceReadout label="Before formatting">
            {String(plan.value)}
          </TraceReadout>
        )}
        <TraceReadout label="Matching rows">
          {plan.rowCount.toLocaleString()}
        </TraceReadout>
        <TraceReadout label="Used rows">
          {plan.includedCount.toLocaleString()}
        </TraceReadout>
        {plan.excludedCount > 0 && (
          <TraceReadout label="Excluded rows">
            {plan.excludedCount.toLocaleString()}
          </TraceReadout>
        )}
      </TraceSection>
      <TraceSection heading="Contributors">
        {plan.contributors.length > 0 ? (
          <AggregateContributorTable
            showInputs={plan.aggregation !== "count"}
            row={{
              id: "metric-card:total",
              groupValue: undefined,
              groupLabel: plan.metricLabel,
              value: plan.value,
              rowCount: plan.rowCount,
              contributors: plan.contributors,
            }}
          />
        ) : (
          <p className="text-muted-foreground">
            There are no matching source rows.
          </p>
        )}
      </TraceSection>
      <TraceSection muted>{plan.scopeNote}</TraceSection>
    </div>
  );
}
