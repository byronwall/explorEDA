import { useState } from "react";
import { displayAggregateValue } from "@/lib/aggregates";
import { Button } from "@/components/ui/button";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { TimeSeriesTrace } from "./timeSeriesTrace";
import { useChartTrace, useChartTraceApi } from "../trace/ChartTraceScope";

export function TimeSeriesTraceBody({ trace }: { trace: TimeSeriesTrace }) {
  const { plan, point } = trace;
  const state = useChartTrace();
  const api = useChartTraceApi();
  const [page, setPage] = useState(0);
  const ids = point
    ? point.contributors.map((row) => row.sourceId)
    : plan.invalidDateIds;
  const pages = Math.max(1, Math.ceil(ids.length / 25));
  const current = Math.min(page, pages - 1);
  const showRawDates = ids.some(
    (id) => plan.snapshot.dates[id] !== plan.snapshot.rawDates[id]
  );
  const showInputs = Boolean(point && plan.aggregation !== "count");
  const showRawInputs =
    showInputs && point!.contributors.some((row) => row.input !== row.rawInput);
  return (
    <div className="space-y-2" aria-label="Time series trace">
      <TraceSection
        heading={
          point ? `${point.seriesLabel} · ${point.label}` : "Unreadable dates"
        }
      >
        {point && (
          <>
            <TraceReadout label="Interval">
              {new Date(point.start).toISOString()} up to{" "}
              {new Date(point.end).toISOString()} (end excluded)
            </TraceReadout>
            <TraceReadout label="Metric">{plan.metricLabel}</TraceReadout>
            <TraceReadout label="Result">{point.valueText}</TraceReadout>
            <TraceReadout label="Calculation">
              {plan.aggregation === "count"
                ? "Each row adds one."
                : plan.aggregation === "sum"
                  ? "Sum of valid inputs."
                  : "Sum of valid inputs divided by used rows."}
            </TraceReadout>
            <TraceReadout label="Rows">
              {point.contributors.filter((row) => row.included).length} used of{" "}
              {point.rowCount}
            </TraceReadout>
            <TraceReadout label="Before formatting">
              {point.value === undefined ? "No result" : String(point.value)}
            </TraceReadout>
            {point.band && (
              <>
                <TraceReadout label="Area band">
                  {plan.notice ??
                    (point.band.complete
                      ? `${plan.formatValue(point.band.lower)} to ${plan.formatValue(point.band.upper)}`
                      : "Not drawn: this period has an absent or invalid total.")}
                </TraceReadout>
                <TraceReadout label="Band height">
                  {point.valueText}
                </TraceReadout>
                <p className="text-muted-foreground">
                  {plan.curveType === "step"
                    ? "The band holds each value until the next period midpoint."
                    : "The band joins period midpoints with straight lines."}
                </p>
              </>
            )}
            <TraceReadout label="Position">
              {point.x.toFixed(2)}, {point.y.toFixed(2)} px within the plot
            </TraceReadout>
            <TraceReadout label="Y domain">
              {plan.yScale.domain().join(" to ")}
            </TraceReadout>
            {point.state === "empty" && (
              <p>
                No source rows.{" "}
                {point.value === 0
                  ? "The missing-period setting displays zero."
                  : "The line breaks here."}
              </p>
            )}
          </>
        )}
        {!point && (
          <p>
            {ids.length} rows have no readable date and do not contribute to a
            period.
          </p>
        )}
      </TraceSection>
      <TraceSection heading="Source records">
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted">
              <tr>
                {[
                  "Row ID",
                  "Date",
                  ...(showRawDates ? ["Raw date"] : []),
                  ...(showInputs
                    ? ["Input", ...(showRawInputs ? ["Raw input"] : []), "Used"]
                    : []),
                ].map((label) => (
                  <th
                    key={label}
                    className={`whitespace-nowrap px-2 py-1 ${["Row ID", "Input", "Raw input"].includes(label) ? "text-right" : ""}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ids.slice(current * 25, (current + 1) * 25).map((id) => {
                const row = point?.contributors.find(
                  (row) => row.sourceId === id
                );
                return (
                  <tr key={id} className="border-t border-border">
                    <td className="px-2 py-1 text-right tabular-nums">{id}</td>
                    <td className="whitespace-nowrap px-2 py-1">
                      {displayAggregateValue(plan.snapshot.dates[id])}
                    </td>
                    {showRawDates && (
                      <td className="whitespace-nowrap px-2 py-1">
                        {displayAggregateValue(plan.snapshot.rawDates[id])}
                      </td>
                    )}
                    {row && showInputs && (
                      <>
                        <td className="px-2 py-1 text-right">
                          {displayAggregateValue(row.input)}
                        </td>
                        {showRawInputs && (
                          <td className="px-2 py-1 text-right">
                            {displayAggregateValue(row.rawInput)}
                          </td>
                        )}
                        <td className="px-2 py-1">
                          {row.included ? "Yes" : row.exclusionReason}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {ids.length > 25 && (
          <div className="flex items-center justify-between gap-2 pt-1">
            <span>
              Page {current + 1} of {pages} · 25 per page
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={current + 1 === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </TraceSection>
      {plan.stacked && point && (
        <details>
          <summary className="cursor-pointer text-muted-foreground">
            Series in this stack
          </summary>
          <p className="py-1">
            Bands add in this order. Inspect a series to see its exact inputs.
          </p>
          {plan.series.map((series) => {
            const part = series.points.find(
              (item) => item.start === point.start
            )!;
            return (
              <div
                key={series.key}
                className="flex items-center justify-between gap-2 py-1"
              >
                <span>
                  {series.label} · {part.valueText} · {part.rowCount} rows
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Inspect ${series.label} for this period`}
                  onClick={() =>
                    state?.selection &&
                    api?.inspect(state.selection.owner, "time-bucket", part.id)
                  }
                >
                  Inspect
                </Button>
              </div>
            );
          })}
        </details>
      )}
      <TraceSection muted>{plan.scopeNote}</TraceSection>
    </div>
  );
}
