import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import type { HexTrace } from "./hexPlan";
import type { ContourTrace } from "./contourPlan";

const show = (value: number) => String(Number(value.toPrecision(4)));

function HexBody({ trace }: { trace: HexTrace }) {
  const { bin, hex } = trace;
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(bin.sourceIds.length / 40));
  const counted = new Set(bin.rowIds);
  const ids = bin.sourceIds.slice(page * 40, page * 40 + 40);
  return (
    <div className="space-y-3 text-xs" aria-label="Hexagon trace">
      <div className="eda-trace-subject">
        <span className="font-semibold">Hexagon</span>
        <span className="text-muted-foreground">
          column {bin.column}, row {bin.row}
        </span>
      </div>
      <TraceSection heading="Count">
        <TraceReadout label="Rows counted">
          {bin.rowIds.length.toLocaleString()}
        </TraceReadout>
        {bin.sourceIds.length > bin.rowIds.length && (
          <TraceReadout label="Hidden by other charts">
            {(bin.sourceIds.length - bin.rowIds.length).toLocaleString()}
          </TraceReadout>
        )}
        <TraceReadout label="In this chart's selection">
          {bin.matching.toLocaleString()}
        </TraceReadout>
        <TraceReadout label="Center">
          {trace.xLabel} {show(trace.center[0])} · {trace.yLabel}{" "}
          {show(trace.center[1])}
        </TraceReadout>
        <TraceReadout label="Color">
          {bin.rowIds.length} of {hex.max} rows at full color
          {hex.max === hex.sourceMax
            ? " (largest full-source hexagon)"
            : " (fixed maximum)"}
        </TraceReadout>
      </TraceSection>
      <TraceSection heading={`Source rows (${bin.sourceIds.length})`}>
        <p className="font-mono leading-relaxed">
          {ids.map((id) => (
            <span
              key={id}
              className={
                counted.has(id)
                  ? undefined
                  : "text-muted-foreground line-through"
              }
            >
              {id}{" "}
            </span>
          ))}
        </p>
        {pages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span>
              {page + 1} of {pages}
            </span>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= pages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        )}
        <p className="text-muted-foreground">
          Struck-out rows fall in this hexagon but are hidden by other charts'
          filters. Clicking the hexagon selects exactly these source rows.
        </p>
      </TraceSection>
      <TraceSection heading="How hexagons are placed" muted>
        <p>
          {hex.columns} hexagon columns span the full-source axis ranges. A
          row's hexagon depends only on its X and Y values, so it stays the same
          while filtering and resizing; wide panels draw hexagons wider.
        </p>
      </TraceSection>
    </div>
  );
}

function ContourBody({ trace }: { trace: ContourTrace }) {
  const { level, contour } = trace;
  return (
    <div className="space-y-3 text-xs" aria-label="Density level trace">
      <div className="eda-trace-subject">
        <span className="font-semibold">
          Density level {level.index + 1} of {contour.levels.length}
        </span>
        <span className="text-muted-foreground">Smoothed 2D density</span>
      </div>
      <TraceSection heading="Region">
        <TraceReadout label="Threshold">
          {show(level.threshold)} rows per {trace.xLabel} × {trace.yLabel} unit
        </TraceReadout>
        <TraceReadout label="Rows inside">
          {Math.round(level.coverage * contour.rows).toLocaleString()} of{" "}
          {contour.rows.toLocaleString()} ({Math.round(level.coverage * 100)}%)
        </TraceReadout>
        <TraceReadout label="Peak density">{show(contour.peak)}</TraceReadout>
        <p className="text-muted-foreground">
          Levels are equal steps of this panel's peak density. The share of rows
          inside a region is counted from the rows themselves; a density
          threshold is not a probability.
        </p>
      </TraceSection>
      <TraceSection heading="Estimate">
        <TraceReadout label={`${trace.xLabel} bandwidth`}>
          {show(contour.bandwidth[0])}
        </TraceReadout>
        <TraceReadout label={`${trace.yLabel} bandwidth`}>
          {show(contour.bandwidth[1])}
        </TraceReadout>
        <TraceReadout label="Bandwidth scale">×{contour.scale}</TraceReadout>
        <p className="text-muted-foreground">
          A Gaussian kernel estimate from the plotted rows: those that pass the
          other filters and have numeric X and Y. Each axis uses Scott's rule,
          standard deviation × n^(−1/6), times the bandwidth scale. Rows are
          spread onto a grid over the axis ranges before smoothing. Density is
          in data units, so a symmetric log axis bends the regions without
          changing their values.
        </p>
      </TraceSection>
    </div>
  );
}

export function SurfaceTraceBody({
  trace,
}: {
  trace: HexTrace | ContourTrace;
}) {
  return trace.kind === "hex-bin" ? (
    <HexBody key={trace.id} trace={trace} />
  ) : (
    <ContourBody trace={trace} />
  );
}
