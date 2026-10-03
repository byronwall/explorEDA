import { displayAggregateValue } from "@/lib/aggregates";
import {
  TraceMarkGeometry,
  TraceReadout,
  TraceScaleReadout,
  TraceSection,
} from "../ChartTraceDetails";
import type { BarTrace } from "./barTrace";
import { AggregateContributorTable } from "./GroupedAggregateInspector";

export function BarTraceBody({ trace }: { trace: BarTrace }) {
  const { mark, domain } = trace;
  const included = mark.row.contributors.filter((item) => item.included);
  const excluded = mark.row.contributors.length - included.length;
  const setter = (end: BarTrace["domain"]["lower"]) =>
    end.source === "zero" ? "zero" : `${end.label} (${end.value})`;
  const geometry = (
    <TraceSection heading="Rendered bar">
      <TraceMarkGeometry label="Bar geometry" geometry={mark} />
      <TraceReadout label="Zero baseline">
        {Math.round(mark.baseline)} px
      </TraceReadout>
      <TraceReadout label="Fill">
        <span
          className="inline-block h-3 w-3 align-middle"
          style={{ background: mark.fill }}
        />{" "}
        {mark.fill}
        {mark.fillSource.kind === "own-filter"
          ? ` ← outside this chart's filter (color scale gives ${mark.fillSource.baseFill})`
          : mark.fillSource.scaleId
            ? ` ← color scale ${mark.fillSource.scaleId}`
            : " ← default bar color"}
      </TraceReadout>
      <TraceScaleReadout axis="x" {...trace.xScale} />
      <TraceScaleReadout axis="y" {...trace.yScale} />
      <div>
        Y domain from {domain.population}: lower {setter(domain.lower)} · upper{" "}
        {setter(domain.upper)} · padding {domain.padding}
      </div>
    </TraceSection>
  );
  return (
    <div className="space-y-2" aria-label="Bar trace">
      <TraceSection heading={`Bar · ${mark.label}`}>
        <TraceReadout label="Field">{trace.fieldLabel}</TraceReadout>
        {mark.series && (
          <TraceReadout label={mark.series.label}>
            {displayAggregateValue(mark.series.value)}
          </TraceReadout>
        )}
        <TraceReadout label="Value">
          {mark.row.value === undefined ? "No valid values" : mark.valueText}
        </TraceReadout>
        <TraceReadout label="Aggregation">{trace.aggregation}</TraceReadout>
        {mark.series && (
          <TraceReadout label="Calculation">
            {trace.aggregation.startsWith("count")
              ? "Each row adds one."
              : trace.aggregation.startsWith("average")
                ? "Sum of valid inputs divided by used rows."
                : "Sum of valid inputs."}
          </TraceReadout>
        )}
        {mark.bin && (
          <TraceReadout label="Bin interval">
            {mark.bin.start} to {mark.bin.end}
            {mark.bin.closed ? " (closed)" : " (end excluded)"}
          </TraceReadout>
        )}
        <TraceReadout label="Order">
          {mark.order + 1} of {trace.groupOrder.length}
        </TraceReadout>
      </TraceSection>
      {!mark.series && geometry}
      <TraceSection heading={`${mark.label} contributors`}>
        <TraceReadout label="Contributors">
          {included.length} of {mark.row.contributors.length}
          {excluded > 0 && ` · ${excluded} excluded`}
        </TraceReadout>
        <TraceReadout label="Exact result">
          {displayAggregateValue(mark.row.value)}
        </TraceReadout>
        <AggregateContributorTable
          row={mark.row}
          showInputs={!trace.aggregation.startsWith("count")}
          compact={Boolean(mark.series)}
        />
      </TraceSection>
      {mark.series && (
        <details>
          <summary className="cursor-pointer text-muted-foreground">
            Scale and geometry
          </summary>
          {geometry}
        </details>
      )}
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
      </TraceSection>
    </div>
  );
}
