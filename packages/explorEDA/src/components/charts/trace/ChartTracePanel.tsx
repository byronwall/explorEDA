import { useState } from "react";
import { BarTraceBody } from "../BarChart/BarTraceBody";
import { ScatterTraceBody } from "../ScatterPlot/ScatterTraceBody";
import { useChartTrace, useChartTraceApi } from "./ChartTraceScope";
import {
  FacetTraceBody,
  GuideTraceBody,
  LegendTraceBody,
  TitleTraceBody,
} from "./TraceBodies";
import type { ChartTrace } from "./traceTypes";

function TraceBody({ trace }: { trace: ChartTrace }) {
  switch (trace.kind) {
    case "bar":
      return <BarTraceBody trace={trace} />;
    case "guide":
      return <GuideTraceBody trace={trace} />;
    case "title":
      return <TitleTraceBody trace={trace} />;
    case "facet":
      return <FacetTraceBody trace={trace} />;
    case "legend":
      return <LegendTraceBody trace={trace} />;
    default:
      return <ScatterTraceBody trace={trace} />;
  }
}

/** The trace for the selected object, a row finder and every traceable object. */
export function ChartTracePanel() {
  const trace = useChartTrace();
  const api = useChartTraceApi();
  const [rowText, setRowText] = useState("");
  const [rowMessage, setRowMessage] = useState("");
  if (!trace || !api) return null;
  const findRow = () => {
    const id = Number(rowText);
    if (!rowText.trim() || !Number.isInteger(id) || id < 0) {
      setRowMessage("Enter a valid source row ID.");
      return;
    }
    setRowMessage(
      api.findRow(id) ? "" : "No drawn object uses this row, or it does not exist."
    );
  };
  return (
    <div className="space-y-3 text-xs">
      {trace.trace && <TraceBody trace={trace.trace} />}
      <form
        className="flex gap-2 border-t border-border pt-2"
        onSubmit={(event) => {
          event.preventDefault();
          findRow();
        }}
      >
        <input
          className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-1"
          aria-label="Source row ID"
          placeholder="Row ID"
          type="number"
          min="0"
          value={rowText}
          onChange={(event) => setRowText(event.target.value)}
        />
        <button className="rounded border border-border px-2" type="submit">
          Find row
        </button>
      </form>
      {rowMessage && <p role="status">{rowMessage}</p>}
      {trace.targets.length > 0 && (
        <details className="border-t border-border pt-2">
          <summary className="cursor-pointer">
            Browse {trace.targets.length} chart objects
          </summary>
          <div className="mt-2 flex max-h-36 flex-wrap gap-1 overflow-y-auto">
            {trace.targets.map((target) => (
              <button
                key={`${target.owner}:${target.kind}:${target.id}`}
                type="button"
                className="rounded border border-border px-1"
                onClick={() => api.inspect(target.owner, target.kind, target.id)}
              >
                {target.label}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
