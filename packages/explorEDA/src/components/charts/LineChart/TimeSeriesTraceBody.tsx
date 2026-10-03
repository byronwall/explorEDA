import { useState } from "react";
import { displayAggregateValue } from "@/lib/aggregates";
import { Button } from "@/components/ui/button";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { TimeSeriesTrace } from "./timeSeriesTrace";

export function TimeSeriesTraceBody({ trace }: { trace: TimeSeriesTrace }) {
  const { plan, point } = trace;
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
      <TraceSection muted>{plan.scopeNote}</TraceSection>
    </div>
  );
}
