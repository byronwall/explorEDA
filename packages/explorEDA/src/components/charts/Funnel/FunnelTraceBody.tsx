import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { FunnelStep } from "./funnelPlan";

export interface FunnelTrace {
  kind: "funnel-step";
  id: string;
  revision: string;
  step: FunnelStep;
  stepCount: number;
  previousLabel?: string;
  previousCount?: number;
  firstCount: number;
  entityLabel: string;
  eventLabel: string;
  windowDays?: number;
  excluded: { reason: string; count: number }[];
}

const share = (value: number) =>
  value.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 1 });
const count = (value: number) => value.toLocaleString();

export function FunnelTraceBody({ trace }: { trace: FunnelTrace }) {
  const { step } = trace;
  const never = step.dropped - step.droppedOutOfOrder;
  return (
    <div className="space-y-2" aria-label="Funnel trace">
      <TraceSection heading={`Step ${step.index + 1} · ${step.label}`}>
        <TraceReadout label="Event">
          {trace.eventLabel} = {step.label}
        </TraceReadout>
        <TraceReadout label="Reached">
          {count(step.count)} {trace.entityLabel}
        </TraceReadout>
        <TraceReadout label="Of first">
          {share(step.ofFirst)} = {count(step.count)} ÷{" "}
          {count(trace.firstCount)}
        </TraceReadout>
        {trace.previousCount !== undefined && (
          <TraceReadout label="Of previous">
            {share(step.ofPrevious)} = {count(step.count)} ÷{" "}
            {count(trace.previousCount)} who reached {trace.previousLabel}
          </TraceReadout>
        )}
        <TraceReadout label="Rule">
          {step.index === 0
            ? `The first ${step.label} event of each ${trace.entityLabel}.`
            : `The first ${step.label} event after the ${trace.previousLabel} that counted${trace.windowDays ? `, within ${trace.windowDays} days of the first step` : ""}.`}
        </TraceReadout>
      </TraceSection>
      {step.index > 0 && (
        <TraceSection heading="Dropped here">
          <TraceReadout label="Dropped">
            {count(step.dropped)} reached {trace.previousLabel} but not{" "}
            {step.label}
          </TraceReadout>
          <TraceReadout label="Never did it">{count(never)}</TraceReadout>
          <TraceReadout label="Did it too early">
            {count(step.droppedOutOfOrder)}, only before reaching{" "}
            {trace.previousLabel}
            {trace.windowDays ? " or after the window" : ""}
          </TraceReadout>
        </TraceSection>
      )}
      <TraceSection heading="Counted events">
        {step.contributors.length > 0 ? (
          <AggregateContributorTable
            showInputs={false}
            row={{
              id: trace.id,
              groupValue: step.value,
              groupLabel: step.label,
              value: step.count,
              rowCount: step.contributors.length,
              contributors: step.contributors,
            }}
          />
        ) : (
          <p className="text-muted-foreground">
            No {trace.entityLabel} reached this step.
          </p>
        )}
      </TraceSection>
      <TraceSection muted>
        <div>
          Counts use the events that pass the other charts&apos; filters.
          {trace.excluded.map(
            (item) => ` ${count(item.count)} rows left out: ${item.reason}.`
          )}
        </div>
        <div>
          Selecting this step keeps every event of the {trace.entityLabel} who
          reached it, across all rows, so linked views show their whole
          activity.
        </div>
      </TraceSection>
    </div>
  );
}
