import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChartTraceRowSteps,
  TraceReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";
import { useChartTrace, useChartTraceApi } from "../trace/ChartTraceScope";
import { projectionLabel } from "./mapGeometry";
import type { MapTrace } from "./mapTrace";

export function MapTraceBody({ trace }: { trace: MapTrace }) {
  const { plan, point, settings } = trace;
  const state = useChartTrace();
  const api = useChartTraceApi();
  const [page, setPage] = useState(0);
  const rows = trace.kind === "map-exclusions" ? plan.excluded : plan.offscreen;
  const pages = Math.max(1, Math.ceil(rows.length / 25));
  const current = Math.min(page, pages - 1);
  return (
    <div className="space-y-3 text-xs" aria-label="Map trace">
      {point ? (
        <>
          <TraceSection heading={`Source row ${point.sourceId}`}>
            <p className="font-medium">{point.label}</p>
            <TraceReadout label="State">
              {point.reason ??
                (!point.inScope
                  ? "Excluded by another chart filter"
                  : point.offscreen
                    ? "Outside the current view"
                    : "Drawn")}
            </TraceReadout>
            <TraceReadout label="All filters">
              {point.matching ? "Matches" : "Does not match"}
            </TraceReadout>
            <TraceReadout label="Latitude">
              {point.latitude ?? "Invalid"}°
            </TraceReadout>
            <TraceReadout label="Longitude">
              {point.longitude ?? "Invalid"}°
            </TraceReadout>
            {point.x !== undefined && (
              <TraceReadout label="Position">
                {point.x.toFixed(2)}, {point.y?.toFixed(2)} px
              </TraceReadout>
            )}
          </TraceSection>
          <ChartTraceRowSteps fields={trace.fields ?? []} />
          {!point.reason && (
            <TraceSection heading="Point encoding">
              <TraceReadout label="Color">
                <TraceSwatch color={point.color} /> {point.color}
                {settings.colorField
                  ? ` · ${settings.colorField}`
                  : " · chart color"}
              </TraceReadout>
              <TraceReadout label="Radius">
                {point.radius.toFixed(2)} px
              </TraceReadout>
              <TraceReadout label="Opacity">
                {plan.hasSelection && !point.matching
                  ? settings.pointOpacity * 0.2
                  : settings.pointOpacity}
              </TraceReadout>
              {settings.sizeField && (
                <>
                  <TraceReadout label="Area field">
                    {settings.sizeField} = {point.value ?? "Invalid"}
                  </TraceReadout>
                  <TraceReadout label="Size domain">
                    0 to {plan.maxSize} · all source rows
                  </TraceReadout>
                  <p>
                    Radius = {settings.pointRadius} × √(value / {plan.maxSize}).
                    Zero uses a hollow 2 px marker. Negative and invalid sizes
                    are omitted.
                  </p>
                </>
              )}
            </TraceSection>
          )}
        </>
      ) : trace.kind === "map-background" ? (
        <TraceSection heading="Land outline">
          <p>
            The outline supplies geographic context. It has no source rows and
            does not filter records.
          </p>
          <p>
            <a
              className="underline"
              href="https://github.com/topojson/world-atlas"
              target="_blank"
              rel="noreferrer"
            >
              World Atlas 2.0.2
            </a>{" "}
            · Natural Earth land, 1:110m. WGS 84 decimal degrees. Bundled with
            the chart; no tile service.
          </p>
        </TraceSection>
      ) : (
        <TraceSection
          heading={
            trace.kind === "map-exclusions"
              ? "Omitted rows"
              : "Outside the view"
          }
        >
          <p>
            {rows.length} rows in the chart population. Other filters and the
            facet define this population.
          </p>
          <div className="max-h-72 overflow-auto rounded border border-border">
            <table className="w-full text-left">
              <caption className="sr-only">Map source records</caption>
              <thead>
                <tr>
                  <th className="px-2 py-1">Row</th>
                  <th className="px-2 py-1">Reason</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(current * 25, (current + 1) * 25).map((row) => (
                  <tr key={row.sourceId} className="border-t border-border">
                    <td className="px-2 py-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-xs"
                        tooltip="Inspect this source row and its coordinate preparation."
                        onClick={() =>
                          state?.selection &&
                          api?.inspect(
                            state.selection.owner,
                            "map-point",
                            String(row.sourceId)
                          )
                        }
                      >
                        {row.sourceId}
                      </Button>
                    </td>
                    <td className="px-2 py-1">
                      {row.reason ?? "Outside the current view"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between gap-2">
              <span>
                Page {current + 1} of {pages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={!current}
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
      )}
      <TraceSection heading="Projection and view">
        <TraceReadout label="Projection">
          {projectionLabel(settings.projection)}
        </TraceReadout>
        <TraceReadout label="Center">
          {plan.view.center[0].toFixed(5)}° longitude,{" "}
          {plan.view.center[1].toFixed(5)}° latitude
        </TraceReadout>
        <TraceReadout label="Zoom">
          {plan.view.zoom.toFixed(3)} × world scale
        </TraceReadout>
        <TraceReadout label="Scale">
          {plan.projection.scale().toFixed(3)} px/radian
        </TraceReadout>
        <TraceReadout label="Viewport">
          {plan.width.toFixed(1)} × {plan.mapHeight.toFixed(1)} px
        </TraceReadout>
        <p>
          Coordinates use longitude, latitude order. Mark centers outside the
          viewport are not drawn. Pan, zoom, and resize do not change row
          selection.
        </p>
      </TraceSection>
    </div>
  );
}
