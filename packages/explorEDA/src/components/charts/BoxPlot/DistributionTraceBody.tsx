import type { AggregateContributor } from "@/lib/aggregates";
import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { BoxPlotStats } from "./boxPlotCalculations";

export interface DistributionTrace {
  kind: "distribution";
  id: string;
  revision: string;
  label: string;
  field: string;
  stats: BoxPlotStats;
  whiskerType: string;
  bandwidth?: number;
  sourceId?: number;
  contributors: AggregateContributor[];
}
export function DistributionTraceBody({ trace }: { trace: DistributionTrace }) {
  const { stats } = trace;
  return (
    <div className="space-y-2">
      <TraceSection heading={trace.label}>
        <TraceReadout label="Numeric field">{trace.field}</TraceReadout>
        <TraceReadout label="Used rows">
          {stats.totalCount} of {trace.contributors.length}
        </TraceReadout>
        {trace.sourceId !== undefined && (
          <TraceReadout label="Selected observation">
            Source row {trace.sourceId}
          </TraceReadout>
        )}
        {stats.totalCount > 0 ? (
          <>
            <TraceReadout label="Lower quartile">{stats.q1}</TraceReadout>
            <TraceReadout label="Median">{stats.median}</TraceReadout>
            <TraceReadout label="Upper quartile">{stats.q3}</TraceReadout>
            <TraceReadout label="Whiskers">
              {stats.whiskerLow}–{stats.whiskerHigh}
            </TraceReadout>
            <TraceReadout label="Outliers">
              {stats.outliers.length}
            </TraceReadout>
            <p>
              Quartiles interpolate sorted values at (n − 1) × p, where p is
              0.25, 0.5, or 0.75.
            </p>
            <p>
              {trace.whiskerType === "tukey"
                ? "Whiskers end at observations within 1.5 × IQR of each quartile."
                : trace.whiskerType === "minmax"
                  ? "Whiskers end at the minimum and maximum."
                  : "Whiskers end at the mean ± 2 population standard deviations."}
            </p>
            {trace.bandwidth !== undefined && (
              <>
                <TraceReadout label="Density bandwidth">
                  {trace.bandwidth}
                </TraceReadout>
                <p>
                  Gaussian density uses 100 values from the minimum to the
                  maximum. Each group’s largest density sets its width.
                </p>
              </>
            )}
          </>
        ) : (
          <p>No valid numeric values in this group.</p>
        )}
      </TraceSection>
      <TraceSection heading="Source rows">
        <AggregateContributorTable
          showInputs
          row={{
            id: trace.id,
            groupValue: undefined,
            groupLabel: trace.label,
            value: stats.totalCount ? stats.median : undefined,
            rowCount: trace.contributors.length,
            contributors:
              trace.sourceId === undefined
                ? trace.contributors
                : trace.contributors.filter(
                    (item) => item.sourceId === trace.sourceId
                  ),
          }}
        />
      </TraceSection>
      <TraceSection muted>
        Statistics use every valid value after other filters. Observations show
        the first 300 valid source rows per group. Horizontal position separates
        points; it does not encode a value.
      </TraceSection>
    </div>
  );
}
