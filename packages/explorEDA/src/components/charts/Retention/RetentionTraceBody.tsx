import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { RetentionCell } from "./retentionPlan";

export interface RetentionTrace {
  kind: "retention-cell";
  id: string;
  revision: string;
  cohortLabel: string;
  cohortSize: number;
  cell: RetentionCell;
  periodName: string;
  entityLabel: string;
  /** How an entity enters its cohort, such as "its first signup event". */
  entryText: string;
  /** Which events count as active. */
  activityText: string;
  lastTime?: number;
  excluded: { reason: string; count: number }[];
}

const share = (value: number) =>
  value.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 });

export function RetentionTraceBody({ trace }: { trace: RetentionTrace }) {
  const { cell } = trace;
  const unit = trace.periodName.toLowerCase();
  return (
    <div className="space-y-2" aria-label="Retention trace">
      <TraceSection
        heading={`${trace.cohortLabel} cohort · ${trace.periodName} ${cell.period}`}
      >
        <TraceReadout label="Cohort">
          {trace.cohortSize.toLocaleString()} {trace.entityLabel} whose entry
          fell in the {unit} of {trace.cohortLabel}
        </TraceReadout>
        <TraceReadout label="Active">
          {cell.active.toLocaleString()} with {trace.activityText} in {unit}{" "}
          {cell.period}
        </TraceReadout>
        <TraceReadout label="Rate">
          {share(cell.rate)} = {cell.active.toLocaleString()} ÷{" "}
          {trace.cohortSize.toLocaleString()}
        </TraceReadout>
        <TraceReadout label="Rule">
          An entity enters on {trace.entryText}. {trace.periodName}{" "}
          {cell.period} is the calendar {unit} {cell.period} after the {unit} it
          entered, in UTC. Each entity counts once per {unit}.
        </TraceReadout>
        {cell.partial && trace.lastTime !== undefined && (
          <TraceReadout label="Partial">
            The data ends on{" "}
            {new Date(trace.lastTime).toISOString().slice(0, 10)}, partway
            through this {unit}, so the rate may still rise.
          </TraceReadout>
        )}
      </TraceSection>
      <TraceSection heading="Events that counted">
        {cell.rows.length > 0 ? (
          <AggregateContributorTable
            showInputs={false}
            row={{
              id: trace.id,
              groupValue: cell.period,
              groupLabel: `${trace.periodName} ${cell.period}`,
              value: cell.active,
              rowCount: cell.rows.length,
              contributors: cell.rows.map((sourceId) => ({
                sourceId,
                input: 1,
                included: true,
              })),
            }}
          />
        ) : (
          <p className="text-muted-foreground">
            No {trace.entityLabel} in this cohort were active in this {unit}.
          </p>
        )}
      </TraceSection>
      <TraceSection muted>
        <div>
          Counts use the events that pass the other charts&apos; filters.
          {trace.excluded.map(
            (item) =>
              ` ${item.count.toLocaleString()} left out: ${item.reason}.`
          )}
        </div>
        <div>
          Selecting this cell selects these {trace.entityLabel} by value, so
          linked views show all of their events.
        </div>
      </TraceSection>
    </div>
  );
}
