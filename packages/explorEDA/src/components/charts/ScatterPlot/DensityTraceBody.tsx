import type { datum } from "@/types/ChartTypes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { finiteNumber } from "@/lib/numeric";
import {
  TraceReadout,
  TraceSection,
  TraceSwatch,
  showTraceValue,
  ChartTraceRowSteps,
} from "../ChartTraceDetails";
import { useChartTrace, useChartTraceApi } from "../trace/ChartTraceScope";
import type { DensityTrace } from "./densityPlan";

export function DensityTraceBody({ trace }: { trace: DensityTrace }) {
  const { plan, bin } = trace;
  const { scatter, snapshot } = plan;
  const state = useChartTrace();
  const api = useChartTraceApi();
  const [page, setPage] = useState(0);
  const ids = bin?.sourceIds ?? plan.omittedIds;
  const counted = new Set(bin?.rowIds);
  const pages = Math.max(1, Math.ceil(ids.length / 25));
  const current = Math.min(page, pages - 1);
  const interval = ([low, high]: [number, number], last: boolean) =>
    `${low} ≤ value ${last ? "≤" : "<"} ${high}`;
  const show = showTraceValue;
  if (trace.row)
    return (
      <div className="space-y-3 text-xs" aria-label="Density row trace">
        <TraceSection heading={`Source row ${trace.row.sourceId}`}>
          <p>This coordinate pair adds one to the bin count.</p>
          <TraceReadout label={scatter.xDisplay}>
            {interval(bin!.xBounds, bin!.xLast)}
          </TraceReadout>
          <TraceReadout label={scatter.yDisplay}>
            {interval(bin!.yBounds, bin!.yLast)}
          </TraceReadout>
        </TraceSection>
        <ChartTraceRowSteps fields={[trace.row.x, trace.row.y]} />
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            state?.selection &&
            api?.inspect(state.selection.owner, "density-bin", bin!.id)
          }
        >
          Inspect this bin's {bin!.rowIds.length} counted rows
        </Button>
      </div>
    );
  return (
    <div className="space-y-3 text-xs" aria-label="Density trace">
      <TraceSection heading={bin ? "Density bin" : "Omitted coordinates"}>
        {bin ? (
          <>
            <TraceReadout label={scatter.xDisplay}>
              {interval(bin.xBounds, bin.xLast)}
            </TraceReadout>
            <TraceReadout label={scatter.yDisplay}>
              {interval(bin.yBounds, bin.yLast)}
            </TraceReadout>
            <TraceReadout label="Count">{bin.rowIds.length} rows</TraceReadout>
            <TraceReadout label="Source bin">
              {bin.sourceIds.length} rows before other filters
            </TraceReadout>
            <TraceReadout label="All filters">
              {bin.matching} matching rows
            </TraceReadout>
            <p className="text-muted-foreground">
              Each valid coordinate pair adds one. Counts follow other chart
              filters; this chart's selection changes linked views.
            </p>
          </>
        ) : (
          <p>
            {ids.length} rows have a missing, invalid, or nonfinite coordinate.
            They add no count to any bin.
          </p>
        )}
      </TraceSection>
      {bin && (
        <TraceSection heading="Color and geometry">
          <TraceReadout label="Fill">
            <TraceSwatch color={bin.fill} /> {bin.fill}
          </TraceReadout>
          <TraceReadout label="Color domain">
            0 to {plan.max} rows ·{" "}
            {plan.scatterSettings.density?.colorMax === undefined
              ? "full-source bins, shared across facets"
              : "chart setting"}
          </TraceReadout>
          {bin.rowIds.length > plan.max && (
            <p>
              Color saturates at {plan.max}; the count remains{" "}
              {bin.rowIds.length}.
            </p>
          )}
          <TraceReadout label="Position">
            {bin.x.toFixed(2)}, {bin.y.toFixed(2)} px
          </TraceReadout>
          <TraceReadout label="Size">
            {bin.width.toFixed(2)} × {bin.height.toFixed(2)} px
          </TraceReadout>
          <TraceReadout label="Bin grid">
            {plan.xBins} × {plan.yBins} equal numeric intervals
          </TraceReadout>
          <p className="text-muted-foreground">
            Bin edges use the full-source scatter domains. A boundary value
            belongs to the next bin; the final upper edge is included.
          </p>
        </TraceSection>
      )}
      <TraceSection heading={bin ? "Source records" : "Excluded records"}>
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-right tabular-nums">
            <caption className="sr-only">Density source records</caption>
            <thead className="bg-muted">
              <tr>
                <th className="px-2 py-1" scope="col">
                  Row ID
                </th>
                <th className="px-2 py-1" scope="col">
                  {scatter.xDisplay}
                </th>
                <th className="px-2 py-1" scope="col">
                  {scatter.yDisplay}
                </th>
                <th className="px-2 py-1" scope="col">
                  {bin ? "Counted" : "Reason"}
                </th>
              </tr>
            </thead>
            <tbody>
              {ids.slice(current * 25, (current + 1) * 25).map((id) => {
                const x = snapshot.xData[id];
                const y = snapshot.yData[id];
                const input = (field: string, prepared: datum) => {
                  const raw = trace.rawRows[id]?.[field];
                  return raw === prepared
                    ? show(prepared)
                    : `${show(raw)} → ${show(prepared)}`;
                };
                const canInspect = !bin || counted.has(id);
                return (
                  <tr key={id} className="border-t border-border">
                    <td className="px-2 py-1">
                      {canInspect ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-xs"
                          tooltip="Inspect this source row, its coordinate preparation, and calculations."
                          onClick={() =>
                            state?.selection &&
                            api?.inspect(
                              state.selection.owner,
                              bin ? "density-row" : "excluded",
                              String(id)
                            )
                          }
                        >
                          {id}
                        </Button>
                      ) : (
                        id
                      )}
                    </td>
                    <td className="px-2 py-1">{input(scatter.xField, x)}</td>
                    <td className="px-2 py-1">{input(scatter.yField, y)}</td>
                    <td className="px-2 py-1">
                      {bin
                        ? counted.has(id)
                          ? "Yes"
                          : "Other filter"
                        : finiteNumber(x) === undefined
                          ? "Invalid X"
                          : finiteNumber(y) === undefined
                            ? "Invalid Y"
                            : "No finite position"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {pages > 1 && (
          <div className="flex items-center justify-between gap-2">
            <span>
              Page {current + 1} of {pages} · 25 rows per page
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={current + 1 === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </TraceSection>
      {bin && plan.omittedIds.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            state?.selection &&
            api?.inspect(
              state.selection.owner,
              "density-omissions",
              "omissions"
            )
          }
        >
          Inspect {plan.omittedIds.length} omitted coordinate rows
        </Button>
      )}
    </div>
  );
}
