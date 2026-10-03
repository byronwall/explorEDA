import {
  showTraceValue,
  TraceReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";
import type { ParallelAxis } from "./parallelPlan";
import type {
  ParallelAxisTrace,
  ParallelLineTrace,
  ParallelTrace,
} from "./parallelTrace";

const round = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 3 });

function axisScale(axis: ParallelAxis, plotHeight: number) {
  if (axis.kind === "categorical") {
    return `${axis.categories.length} bands of ${round(axis.bandHeight)} px${axis.inverted ? ", flipped" : ""}`;
  }
  const [low, high] = axis.domain;
  return axis.inverted
    ? `${round(low)} at the top to ${round(high)} at ${round(plotHeight)} px (flipped)`
    : `${round(high)} at the top to ${round(low)} at ${round(plotHeight)} px`;
}

function LineBody({ trace }: { trace: ParallelLineTrace }) {
  return (
    <div className="space-y-2" aria-label="Parallel coordinates line trace">
      <TraceSection heading={`Row ${trace.sourceId}`}>
        <TraceReadout label="Source row">{trace.sourceId}</TraceReadout>
        <TraceReadout label="State">
          {!trace.hasSelection
            ? "Drawn; this chart has no selection"
            : trace.selected
              ? "Selected: passes every axis range"
              : "Dimmed: outside at least one axis range"}
        </TraceReadout>
        <TraceReadout label="Stroke">
          <TraceSwatch color={trace.color} /> {trace.color}
          {trace.colorField
            ? ` ← ${trace.colorField} = ${showTraceValue(trace.colorValue)}`
            : " (one color)"}
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Vertices, left to right">
        {trace.vertices.map((vertex) => (
          <TraceReadout key={vertex.axis.id} label={vertex.axis.label}>
            {showTraceValue(vertex.raw)} → {vertex.position} → y{" "}
            {round(vertex.y)} px
            {vertex.passes !== undefined &&
              (vertex.passes ? " · in range" : " · outside the range")}
          </TraceReadout>
        ))}
      </TraceSection>
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
        <div>
          Each segment only connects two of this row's values. It is not a trend
          between the fields.
        </div>
      </TraceSection>
    </div>
  );
}

function AxisBody({ trace }: { trace: ParallelAxisTrace }) {
  const { axis } = trace;
  return (
    <div className="space-y-2" aria-label="Parallel coordinates axis trace">
      <TraceSection heading={`Axis · ${axis.label}`}>
        <TraceReadout label="Field">{axis.field}</TraceReadout>
        <TraceReadout label="Position">
          {axis.index + 1} of the axes, x {round(axis.x)} px
        </TraceReadout>
        <TraceReadout label="Scale">
          {axis.kind === "numeric" ? "Linear" : "Category bands"} ·{" "}
          {axisScale(axis, trace.plotHeight)}
        </TraceReadout>
        <TraceReadout label="Domain from">{axis.domainNote}</TraceReadout>
        {axis.kind === "categorical" && (
          <TraceReadout label="Jitter">
            Each line gets a fixed offset inside its band from its row ID and
            this field, so lines never reshuffle.
          </TraceReadout>
        )}
      </TraceSection>
      <TraceSection heading="Selection">
        <TraceReadout label="Saved as">
          {!axis.brush
            ? "None"
            : axis.brush.filter.type === "range"
              ? `${axis.field} from ${axis.brush.filter.min ?? "−∞"} to ${axis.brush.filter.max ?? "∞"}, inclusive`
              : `${axis.field} is one of ${axis.brush.filter.values.map(showTraceValue).join(", ")}`}
        </TraceReadout>
        {axis.brush && (
          <TraceReadout label="Rows in range">
            {axis.matching?.toLocaleString() ?? 0} of{" "}
            {trace.liveCount.toLocaleString()} rows after other filters
          </TraceReadout>
        )}
        <TraceReadout label="No value here">
          {axis.missing.toLocaleString()} rows after other filters
        </TraceReadout>
      </TraceSection>
      <TraceSection muted>
        <div>
          Saved bounds are in data units, so resizing, flipping, or reordering
          keeps the same rows selected.
        </div>
      </TraceSection>
    </div>
  );
}

export function ParallelTraceBody({ trace }: { trace: ParallelTrace }) {
  return trace.kind === "polyline" ? (
    <LineBody trace={trace} />
  ) : (
    <AxisBody trace={trace} />
  );
}
