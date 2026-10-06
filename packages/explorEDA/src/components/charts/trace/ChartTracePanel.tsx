import { RowTraceBody } from "../RowChart/RowTraceBody";
import { DistributionTraceBody } from "../BoxPlot/DistributionTraceBody";
import { RegionTraceBody } from "../Map/RegionTraceBody";
import { MapTraceBody } from "../Map/MapTraceBody";
import { useState } from "react";
import { BarTraceBody } from "../BarChart/BarTraceBody";
import { SankeyTraceBody } from "../Sankey/SankeyTraceBody";
import { ParallelTraceBody } from "../ParallelCoordinates/ParallelTraceBody";
import { CalendarTraceBody } from "../Calendar/CalendarTraceBody";
import { HeatmapTraceBody } from "../Heatmap/HeatmapTraceBody";
import { EcdfTraceBody } from "../Ecdf/EcdfTraceBody";
import { MetricCardTraceBody } from "../MetricCard/MetricCardTraceBody";
import { TimeSeriesTraceBody } from "../LineChart/TimeSeriesTraceBody";
import { ScatterTraceBody } from "../ScatterPlot/ScatterTraceBody";
import { DensityTraceBody } from "../ScatterPlot/DensityTraceBody";
import { FitTraceBody } from "../ScatterPlot/FitTraceBody";
import { MarginalTraceBody } from "../ScatterPlot/MarginalTraceBody";
import { SurfaceTraceBody } from "../ScatterPlot/SurfaceTraceBody";
import { useChartTrace, useChartTraceApi } from "./ChartTraceScope";
import { useAnalysisChartContext } from "@/components/AnalysisChartContext";
import {
  FacetTraceBody,
  GuideTraceBody,
  LegendTraceBody,
  TitleTraceBody,
} from "./TraceBodies";
import type { ChartTrace } from "./traceTypes";

function TraceBody({ trace }: { trace: ChartTrace }) {
  switch (trace.kind) {
    case "row-category":
      return <RowTraceBody key={trace.id} trace={trace} />;
    case "distribution":
      return <DistributionTraceBody trace={trace} />;
    case "map-region":
    case "map-region-row":
    case "map-joins":
      return <RegionTraceBody trace={trace} />;
    case "map-point":
    case "map-exclusions":
    case "map-offscreen":
    case "map-background":
      return <MapTraceBody key={trace.id} trace={trace} />;
    case "density-bin":
    case "density-omissions":
    case "density-row":
      return <DensityTraceBody key={trace.id} trace={trace} />;
    case "fit":
    case "fit-results":
    case "paired-summary":
      return <FitTraceBody trace={trace} />;
    case "hex-bin":
    case "contour-level":
      return <SurfaceTraceBody trace={trace} />;
    case "marginal-bin":
      return <MarginalTraceBody trace={trace} />;
    case "time-bucket":
    case "time-omissions":
      return <TimeSeriesTraceBody key={trace.id} trace={trace} />;
    case "metric-card":
      return <MetricCardTraceBody trace={trace} />;
    case "bar":
      return <BarTraceBody trace={trace} />;
    case "sankey-node":
    case "sankey-link":
      return <SankeyTraceBody trace={trace} />;
    case "polyline":
    case "pc-axis":
      return <ParallelTraceBody trace={trace} />;
    case "day":
      return <CalendarTraceBody trace={trace} />;
    case "cell":
      return <HeatmapTraceBody trace={trace} />;
    case "ecdf-step":
      return <EcdfTraceBody trace={trace} />;
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
  const analysisContext = useAnalysisChartContext();
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
      api.findRow(id)
        ? ""
        : "No drawn object uses this row, or it does not exist."
    );
  };
  const sourceId = (() => {
    const selected = trace.trace as { sourceId?: unknown } | undefined;
    if (typeof selected?.sourceId === "number") return selected.sourceId;
    const seen = new Set<object>();
    const find = (value: unknown): number | undefined => {
      if (!value || typeof value !== "object" || seen.has(value))
        return undefined;
      seen.add(value);
      if ("sourceId" in value && typeof value.sourceId === "number")
        return value.sourceId;
      for (const child of Object.values(value)) {
        const found = find(child);
        if (found !== undefined) return found;
      }
      return undefined;
    };
    return find(trace.trace);
  })();
  const resultRowKey =
    sourceId === undefined
      ? undefined
      : analysisContext?.resultRowsById[sourceId]?.key;
  return (
    <div className="space-y-3 text-xs">
      {trace.trace && <TraceBody trace={trace.trace} />}
      {analysisContext?.onOpenQueryFlow && (
        <button
          type="button"
          className="rounded border border-border px-2 py-1 hover:bg-muted"
          onClick={() => analysisContext.onOpenQueryFlow?.(resultRowKey)}
        >
          Open query flow{resultRowKey ? " for this row" : ""}
        </button>
      )}
      <section
        className="eda-trace-finder"
        aria-label={trace.trace ? "Trace another object" : "Find a source row"}
      >
        <h4>{trace.trace ? "Trace another object" : "Find a source row"}</h4>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            findRow();
          }}
        >
          <input
            className="h-7 min-w-0 flex-1 rounded border border-input bg-background px-2"
            aria-label="Source row ID"
            placeholder="Source row ID"
            type="number"
            min="0"
            value={rowText}
            onChange={(event) => setRowText(event.target.value)}
          />
          <button
            className="h-7 rounded border border-border px-2 hover:bg-muted"
            type="submit"
          >
            Find row
          </button>
        </form>
        {rowMessage && (
          <p role="status" className="text-muted-foreground">
            {rowMessage}
          </p>
        )}
        {trace.targets.length > 0 && (
          <details className="eda-trace-more">
            <summary>Browse {trace.targets.length} chart objects</summary>
            <div className="flex max-h-36 flex-wrap gap-1 overflow-y-auto">
              {trace.targets.map((target) => (
                <button
                  key={`${target.owner}:${target.kind}:${target.id}`}
                  type="button"
                  className="rounded border border-border px-1.5 py-0.5 hover:bg-muted"
                  onClick={() =>
                    api.inspect(target.owner, target.kind, target.id)
                  }
                >
                  {target.label}
                </button>
              ))}
            </div>
          </details>
        )}
      </section>
    </div>
  );
}
