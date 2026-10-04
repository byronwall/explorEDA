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
      {mark.stack && (
        <>
          <TraceReadout label="Stack interval">
            {mark.stack.start} to {mark.stack.end}
            {mark.stack.mode === "percent" ? "%" : ""}
          </TraceReadout>
          <TraceReadout label="Category total before formatting">
            {mark.stack.total}
          </TraceReadout>
        </>
      )}
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
          ? ` at ${Math.round(mark.opacity * 100)}% opacity ← outside this chart's filter (color scale gives ${mark.fillSource.baseFill})`
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
        {mark.stack && (
          <>
            {mark.stack.mode === "percent" && (
              <TraceReadout label="Segment total">
                {mark.stack.valueText}
              </TraceReadout>
            )}
            <TraceReadout
              label={
                mark.stack.mode === "percent" ? "Denominator" : "Category total"
              }
            >
              {mark.stack.totalText} · sum of {mark.stack.parts.length} series
              totals
            </TraceReadout>
            {mark.stack.mode === "percent" && (
              <TraceReadout label="Share">
                {mark.stack.share === undefined
                  ? "No share: no valid numerator or the category total is zero."
                  : `${mark.stack.valueText} ÷ ${mark.stack.totalText} × 100 = ${(mark.stack.share * 100).toFixed(1)}%`}
              </TraceReadout>
            )}
          </>
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
      {mark.stack && (
        <details>
          <summary className="cursor-pointer text-muted-foreground">
            Category total records ·{" "}
            {mark.stack.parts.reduce(
              (count, part) => count + part.row.contributors.length,
              0
            )}{" "}
            rows
          </summary>
          <p className="py-1">
            The category total adds these series totals from the current scope.
            Excluded inputs do not contribute.
          </p>
          {mark.stack.parts.map((part) => (
            <details key={part.label} className="py-1">
              <summary className="cursor-pointer">
                {part.label} · {part.row.value ?? "No valid values"} ·{" "}
                {part.row.rowCount} {part.row.rowCount === 1 ? "row" : "rows"}
              </summary>
              <AggregateContributorTable
                row={part.row}
                compact
                showInputs={!trace.aggregation.startsWith("count")}
              />
            </details>
          ))}
        </details>
      )}
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
