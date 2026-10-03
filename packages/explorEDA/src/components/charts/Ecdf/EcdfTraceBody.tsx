import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import { TraceReadout, TraceSection, TraceSwatch } from "../ChartTraceDetails";
import type { EcdfTrace } from "./ecdfTrace";

const round = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 3 });
const pct = (value: number) =>
  value.toLocaleString("en-US", { style: "percent", maximumFractionDigits: 2 });

export function EcdfTraceBody({ trace }: { trace: EcdfTrace }) {
  const { curve } = trace;
  const comparator = trace.direction === "below" ? "≤" : "≥";
  const excluded = trace.excluded.reduce(
    (total, item) => total + item.count,
    0
  );
  return (
    <div className="space-y-2" aria-label="ECDF step trace">
      <TraceSection
        heading={`${curve.label} · ${comparator} ${round(trace.x)}`}
      >
        {trace.groupLabel && !curve.overall && (
          <TraceReadout label={trace.groupLabel}>{curve.label}</TraceReadout>
        )}
        <TraceReadout label="Value">
          {trace.fieldLabel} {comparator} {round(trace.x)}
        </TraceReadout>
        <TraceReadout label="Share">
          {pct(trace.share)} = {trace.throughIds.length.toLocaleString()} ÷{" "}
          {curve.count.toLocaleString()} rows with a valid value
        </TraceReadout>
        <TraceReadout label="At this value">
          {trace.atIds.length.toLocaleString()} rows share this exact value, so
          they form one step
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Rendered point">
        <TraceReadout label="Position">
          x {round(trace.position.x)} px, y {round(trace.position.y)} px
        </TraceReadout>
        <TraceReadout label="Stroke">
          <TraceSwatch color={curve.color} /> {curve.color}
        </TraceReadout>
        <TraceReadout label="Left out">
          {excluded
            ? trace.excluded
                .map((item) => `${item.count} · ${item.reason}`)
                .join("; ")
            : "No rows; every value is a number"}
        </TraceReadout>
      </TraceSection>
      <TraceSection heading={`Rows ${comparator} ${round(trace.x)}`}>
        <AggregateContributorTable
          row={{
            id: trace.id,
            groupValue: curve.value,
            groupLabel: curve.label,
            value: trace.throughIds.length,
            rowCount: trace.throughIds.length,
            contributors: trace.throughIds.map((sourceId) => ({
              sourceId,
              input: curve.steps.find((step) => step.ids.includes(sourceId))?.x,
              included: true,
            })),
          }}
        />
      </TraceSection>
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
      </TraceSection>
    </div>
  );
}
