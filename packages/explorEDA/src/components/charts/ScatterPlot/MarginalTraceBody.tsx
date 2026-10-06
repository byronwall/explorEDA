import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { MarginalTrace } from "./marginalPlan";

const show = (value: number) => String(Number(value.toPrecision(6)));

/** One marginal histogram bin: its interval, counts, and population. */
export function MarginalTraceBody({ trace }: { trace: MarginalTrace }) {
  const { bin, marginals } = trace;
  const [low, high] = bin.bounds;
  const max = marginals.max[bin.axis];
  return (
    <div className="space-y-3 text-xs" aria-label="Marginal histogram trace">
      <div className="eda-trace-subject">
        <span className="font-semibold">{bin.label}</span>
        <span className="text-muted-foreground">
          {bin.axis === "x" ? "Top" : "Right"} histogram bin
        </span>
      </div>
      <TraceSection heading="Interval">
        <TraceReadout label="Range">
          {show(low)} ≤ value {bin.last ? "≤" : "<"} {show(high)}
        </TraceReadout>
        <TraceReadout label="Rows">
          {bin.sourceIds.length.toLocaleString()}
        </TraceReadout>
        {marginals.split && (
          <TraceReadout label="Selected here">
            {bin.selected.toLocaleString()}
          </TraceReadout>
        )}
        <TraceReadout label="Bar length">
          {bin.sourceIds.length} of {max} rows, the tallest bin on this axis
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Population" muted>
        <p>
          Plotted points: rows that pass the other charts' filters and have
          numeric X and Y. The {marginals.binCount} bins divide the full-source
          axis range into equal intervals, so edges stay put while filtering.
          {marginals.split &&
            " The darker share passes this chart's own selection."}
        </p>
        <p>Click the bin to filter {bin.label} to its range.</p>
      </TraceSection>
    </div>
  );
}
