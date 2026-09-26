import type { ScatterTrace } from "./scatterTrace";
import {
  ChartTraceRowSteps,
  TraceMarkGeometry,
  showTraceValue,
  TraceReadout,
  TraceScaleReadout,
  TraceSection,
} from "../ChartTraceDetails";

const show = showTraceValue;

export function ScatterTraceBody({ trace }: { trace: ScatterTrace }) {
  const plan = trace.kind === "point" ? trace.plan : undefined;
  return (
    <div className="space-y-3 text-xs" aria-label="Scatter trace">
      {trace?.kind === "point" && plan && (
        <div className="space-y-2">
          <div className="font-medium">Row {trace.sourceId} → point</div>
          <TraceReadout label="Other filters">
            {plan.rowSets.chart.includes(trace.sourceId) ? "pass" : "exclude"} ·
            This chart {trace.passesOwnFilter ? "pass" : "dim"} · All filters{" "}
            {trace.passesAllFilters ? "pass" : "exclude"}
          </TraceReadout>
          {trace.facet && (
            <TraceSection heading="Facet placement">
              <div>
                {trace.facet.row.field} {show(trace.facet.row.prepared)}
                {trace.facet.column &&
                  ` · ${trace.facet.column.field} ${show(trace.facet.column.prepared)}`}
                {" → "}
                {trace.facet.type === "grid" ? "grid cell" : "facet panel"}
              </div>
              <div className="text-muted-foreground">
                {trace.facet.sourceRows} source rows in this facet ·{" "}
                {trace.facet.chartRows} pass chart filters
              </div>
            </TraceSection>
          )}
          <ChartTraceRowSteps
            fields={[
              trace.x,
              trace.y,
              ...(trace.color ? [trace.color] : []),
              ...(trace.facet
                ? [
                    trace.facet.row,
                    ...(trace.facet.column ? [trace.facet.column] : []),
                  ]
                : []),
            ]}
          />
          <TraceSection heading="Rendered point">
            <div>
              {trace.x.field} {show(trace.x.prepared)} → x{" "}
              {Math.round(trace.x.pixel)} px
            </div>
            <div>
              {trace.y.field} {show(trace.y.prepared)} → y{" "}
              {Math.round(trace.y.pixel)} px
            </div>
            <TraceMarkGeometry
              label="Point geometry"
              geometry={{ x: trace.x.pixel, y: trace.y.pixel }}
            />
            {trace.color && (
              <>
                <div>
                  {trace.color.field} {show(trace.color.prepared)} → mapped
                  color{" "}
                  <span
                    className="inline-block h-3 w-3 align-middle"
                    style={{ background: trace.color.mapped }}
                  />{" "}
                  {trace.color.mapped}
                </div>
                {!trace.passesOwnFilter && (
                  <div>
                    Chart filter dimming → point fill{" "}
                    <span
                      className="inline-block h-3 w-3 align-middle"
                      style={{ background: trace.color.rendered }}
                    />{" "}
                    {trace.color.rendered}
                  </div>
                )}
              </>
            )}
            <div>
              Radius {trace.radius} px{" "}
              <span className="text-muted-foreground">
                ← Point size (
                {plan.pointStyle.radius.source === "chart-setting"
                  ? "fixed chart setting"
                  : "built-in default"}
                )
              </span>
            </div>
            <div>
              Opacity {trace.opacity}{" "}
              <span className="text-muted-foreground">
                ←{" "}
                {trace.passesOwnFilter
                  ? `Opacity (${plan.pointStyle.opacity.source === "chart-setting" ? "fixed chart setting" : "built-in default"})`
                  : "chart filter dimming rule"}
              </span>
            </div>
            {!trace.passesOwnFilter && (
              <div className="text-muted-foreground">
                Base opacity {plan.pointStyle.opacity.value} from{" "}
                {plan.pointStyle.opacity.source === "chart-setting"
                  ? "fixed chart setting"
                  : "built-in default"}
              </div>
            )}
            <div>
              Hover: {plan.xDisplay} {trace.hover.xText} · {plan.yDisplay}{" "}
              {trace.hover.yText}
              {trace.hover.colorText && ` · Color ${trace.hover.colorText}`}
              {trace.hover.facetRowText &&
                ` · Facet ${trace.hover.facetRowText}`}
              {trace.hover.facetColumnText &&
                ` / ${trace.hover.facetColumnText}`}
            </div>
            <div>
              Canvas {Math.round(plan.width * plan.pixelRatio)} ×{" "}
              {Math.round(plan.height * plan.pixelRatio)} backing pixels at{" "}
              {plan.pixelRatio} device pixels per CSS pixel; plot clip{" "}
              {Math.round(plan.clipWidth)} × {Math.round(plan.clipHeight)} px
            </div>
          </TraceSection>
          <details className="border-t border-border pt-2">
            <summary className="cursor-pointer">Scale and plan details</summary>
            <div className="mt-1 text-muted-foreground">
              <TraceScaleReadout
                axis="x"
                type={plan.xScale.type}
                domain={plan.xScale.domain}
                range={plan.xScale.range}
              />
              <TraceScaleReadout
                axis="y"
                type={plan.yScale.type}
                domain={plan.yScale.domain}
                range={plan.yScale.range}
              />
              <div>
                {plan.rowSets.all.length} full-source rows set the domains ·
                Revision {trace.revision}
              </div>
            </div>
          </details>
        </div>
      )}
      {trace?.kind === "excluded" && (
        <div className="space-y-2">
          <div className="font-medium">
            Source row {trace.sourceId} has no point
          </div>
          <div>
            {trace.reason === "invalid-x"
              ? `${trace.x.field} has no finite value.`
              : trace.reason === "invalid-y"
                ? `${trace.y.field} has no finite value.`
                : "The scale has no finite position for this row."}
          </div>
          <ChartTraceRowSteps fields={[trace.x, trace.y]} />
        </div>
      )}
      {trace?.kind === "badge" && (
        <div className="space-y-1">
          <div className="font-medium">
            Calculated axis badge · {trace.badge.field}
          </div>
          <div>
            Placement: {Math.round(trace.badge.x)} × {Math.round(trace.badge.y)}{" "}
            px · {trace.badge.rotation}° rotation
          </div>
          <div>
            Source: calculated field and axis label position. Select a point to
            inspect this field’s row calculation.
          </div>
        </div>
      )}
      {trace?.kind === "overlay" && (
        <div className="space-y-1">
          <div className="font-medium">Brush object · {trace.id}</div>
          <div>Source: X/Y range filters on this chart</div>
          {trace.filters.map((filter) => (
            <div key={`${filter.field}:${filter.type}`}>
              {filter.field}:{" "}
              {filter.type === "range"
                ? `${filter.min ?? "start"} to ${filter.max ?? "end"}`
                : ""}
            </div>
          ))}
          <div>
            Planned extent:{" "}
            {trace.extent?.map((point) => point.join(", ")).join(" → ") ??
              "none"}{" "}
            px
          </div>
          <div className="text-muted-foreground">
            Plan revision: {trace.revision}
          </div>
        </div>
      )}
    </div>
  );
}
