import type { ScatterTrace } from "./scatterTrace";
import {
  ChartTraceRowSteps,
  TraceEncoding,
  TraceFilterStatus,
  TraceMarkGeometry,
  showTraceValue,
  TraceReadout,
  TraceScaleReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";

const show = showTraceValue;

export function ScatterTraceBody({ trace }: { trace: ScatterTrace }) {
  const plan = trace.kind === "point" ? trace.plan : undefined;
  return (
    <div className="space-y-3 text-xs" aria-label="Scatter trace">
      {trace?.kind === "point" && plan && (
        <div className="space-y-3">
          <div className="eda-trace-subject">
            <span className="font-semibold">Row {trace.sourceId}</span>
            <span className="text-muted-foreground">
              {trace.passesOwnFilter ? "Point" : "Dimmed point"}
            </span>
          </div>
          <TraceFilterStatus
            steps={[
              {
                label: "Other filters",
                state: plan.rowSets.chart.includes(trace.sourceId)
                  ? "pass"
                  : "exclude",
                ok: plan.rowSets.chart.includes(trace.sourceId),
              },
              {
                label: "This chart",
                state: trace.passesOwnFilter ? "pass" : "dim",
                ok: trace.passesOwnFilter,
              },
              {
                label: "All filters",
                state: trace.passesAllFilters ? "pass" : "exclude",
                ok: trace.passesAllFilters,
              },
            ]}
          />
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
          <TraceSection heading="How the point is drawn">
            <TraceEncoding
              channel="X"
              input={`${trace.x.field} ${show(trace.x.prepared)}`}
              output={`${Math.round(trace.x.pixel)} px`}
            />
            <TraceEncoding
              channel="Y"
              input={`${trace.y.field} ${show(trace.y.prepared)}`}
              output={`${Math.round(trace.y.pixel)} px`}
            />
            {trace.color && (
              <TraceEncoding
                channel="Color"
                input={`${trace.color.field} ${show(trace.color.prepared)}`}
                output={
                  <>
                    <TraceSwatch color={trace.color.mapped} />
                    {trace.color.mapped}
                  </>
                }
                note={
                  !trace.passesOwnFilter && (
                    <>
                      Dimmed by this chart’s filter to{" "}
                      <TraceSwatch color={trace.color.rendered} />
                      {trace.color.rendered}
                    </>
                  )
                }
              />
            )}
            <TraceEncoding
              channel="Size"
              output={`${trace.radius} px radius`}
              note={
                plan.pointStyle.radius.source === "chart-setting"
                  ? "Point size chart setting"
                  : "Built-in default"
              }
            />
            <TraceEncoding
              channel="Opacity"
              output={trace.opacity}
              note={
                trace.passesOwnFilter
                  ? plan.pointStyle.opacity.source === "chart-setting"
                    ? "Opacity chart setting"
                    : "Built-in default"
                  : `Dimmed by this chart’s filter. Base opacity ${plan.pointStyle.opacity.value} from ${plan.pointStyle.opacity.source === "chart-setting" ? "the chart setting" : "the built-in default"}.`
              }
            />
          </TraceSection>
          <TraceSection heading="Hover text">
            <div>
              {plan.xDisplay} {trace.hover.xText} · {plan.yDisplay}{" "}
              {trace.hover.yText}
              {trace.hover.colorText && ` · Color ${trace.hover.colorText}`}
              {trace.hover.facetRowText &&
                ` · Facet ${trace.hover.facetRowText}`}
              {trace.hover.facetColumnText &&
                ` / ${trace.hover.facetColumnText}`}
            </div>
          </TraceSection>
          <details className="eda-trace-more">
            <summary>Scales and canvas</summary>
            <div className="space-y-1 text-muted-foreground">
              <TraceMarkGeometry
                label="Point geometry"
                geometry={{ x: trace.x.pixel, y: trace.y.pixel }}
              />
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
              <TraceReadout label="Canvas">
                {Math.round(plan.width * plan.pixelRatio)} ×{" "}
                {Math.round(plan.height * plan.pixelRatio)} backing pixels at{" "}
                {plan.pixelRatio}× · plot clip {Math.round(plan.clipWidth)} ×{" "}
                {Math.round(plan.clipHeight)} px
              </TraceReadout>
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
