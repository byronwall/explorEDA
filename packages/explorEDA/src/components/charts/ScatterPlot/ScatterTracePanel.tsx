import { useState } from "react";
import type { RowCalculationTrace } from "@/lib/calculations/CalculationState";
import type { datum } from "@/types/ChartTypes";
import { planScatterOverlay, type ScatterPlan } from "./scatterPlan";
import type { FieldTrace, ScatterTrace } from "./scatterTrace";
import type { ScatterSelection } from "./ScatterTraceContext";

const show = (value: datum | Date) =>
  value === undefined ? "undefined" : value === null ? "null" : String(value);

const facetHeading = (item: {
  field: string;
  raw?: datum;
  value: datum;
  label: string;
}) =>
  `${item.field} ${show(item.raw)}${item.raw !== item.value ? ` → ${show(item.value)}` : ""}${item.label !== show(item.value) ? ` → ${item.label}` : ""}`;

function RowSteps({ fields }: { fields: FieldTrace[] }) {
  const sources = new Map<
    string,
    { raw: datum; prepared: datum; error?: string }
  >();
  const calculations = new Map<string, RowCalculationTrace>();
  const addCalculation = (trace: RowCalculationTrace) => {
    trace.dependencies.forEach(addCalculation);
    calculations.set(trace.field, trace);
  };
  for (const field of fields) {
    if (field.calculation) {
      addCalculation(field.calculation);
      for (const source of field.sources) {
        sources.set(source.field, {
          raw: source.raw,
          prepared: source.prepared,
          error: source.conversion?.error,
        });
      }
    } else {
      sources.set(field.field, {
        raw: field.raw,
        prepared: field.prepared,
        error: field.conversion?.error,
      });
    }
  }
  return (
    <div className="space-y-2 border-t border-border pt-2">
      <div>
        <h4 className="font-medium">Source row</h4>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
          {[...sources].map(([field, value]) => (
            <div className="contents" key={field}>
              <span className="min-w-0 break-words text-muted-foreground">
                {field}
              </span>
              <span className="text-right">
                {show(value.raw)}
                {value.raw !== value.prepared && ` → ${show(value.prepared)}`}
                {value.error && ` · ${value.error}`}
              </span>
            </div>
          ))}
        </div>
      </div>
      {calculations.size > 0 && (
        <div className="border-t border-border pt-2">
          <h4 className="font-medium">Calculations</h4>
          {[...calculations.values()].map((calc) => (
            <details key={calc.field} className="group">
              <summary className="cursor-pointer py-0.5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {calc.field} = {calc.error ?? show(calc.value)}
              </summary>
              <div className="ml-3 space-y-1 border-l border-border pl-2 pb-1 text-muted-foreground">
                <code className="block break-words">{calc.expression}</code>
                <ol aria-label={`${calc.field} calculation steps`}>
                  {calc.steps.map((step, index) => (
                    <li
                      key={`${step.id}-${index}`}
                      style={{ paddingLeft: Math.min(step.depth, 5) * 8 }}
                    >
                      {step.label} → {step.error ?? show(step.value)}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScatterTracePanel({
  plan,
  trace,
  onSelect,
  onFindRow,
}: {
  plan?: ScatterPlan;
  trace?: ScatterTrace;
  onSelect: (selection: ScatterSelection) => void;
  onFindRow?: (id: number) => boolean;
}) {
  const [rowText, setRowText] = useState("");
  const [rowMessage, setRowMessage] = useState("");
  const brushObjects = plan
    ? planScatterOverlay(plan, plan.brushExtent, null).brush
    : [];
  const findRow = () => {
    const id = Number(rowText);
    if (!rowText.trim() || !Number.isInteger(id) || id < 0) {
      setRowMessage("Enter a valid source row ID.");
      return;
    }
    if (onFindRow) {
      setRowMessage(
        onFindRow(id)
          ? ""
          : "This row is outside the visible facets or does not exist."
      );
      return;
    }
    if (!plan) return;
    const point =
      Number.isInteger(id) && plan.points.find((item) => item.sourceId === id);
    if (point) {
      onSelect({ kind: "point", id: point.id, plan });
      setRowMessage("");
    } else {
      const excluded =
        Number.isInteger(id) &&
        plan.exclusions.some((item) => item.sourceId === id);
      if (excluded) {
        onSelect({ kind: "excluded", id: String(id), plan });
        setRowMessage("");
      } else {
        setRowMessage(
          "This row is outside the chart population or does not exist."
        );
      }
    }
  };
  return (
    <div className="space-y-3 text-xs" aria-label="Scatter trace">
      <div>
        <h3 className="text-sm font-semibold">Scatter trace</h3>
        {!trace && (
          <p className="text-muted-foreground">
            Alt-click a point, axis object, or color label to trace it.
          </p>
        )}
      </div>
      {trace?.kind === "point" && plan && (
        <div className="space-y-2">
          <div className="font-medium">Row {trace.sourceId} → point</div>
          <div className="text-muted-foreground">
            Other filters{" "}
            {plan.rowSets.chart.includes(trace.sourceId) ? "pass" : "exclude"} ·
            This chart {trace.passesOwnFilter ? "pass" : "dim"} · All filters{" "}
            {trace.passesAllFilters ? "pass" : "exclude"}
          </div>
          {trace.facet && (
            <div className="border-t border-border pt-2">
              <h4 className="font-medium">Facet placement</h4>
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
            </div>
          )}
          <RowSteps
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
          <div className="border-t border-border pt-2">
            <h4 className="font-medium">Rendered point</h4>
            <div>
              {trace.x.field} {show(trace.x.prepared)} → x{" "}
              {Math.round(trace.x.pixel)} px
            </div>
            <div>
              {trace.y.field} {show(trace.y.prepared)} → y{" "}
              {Math.round(trace.y.pixel)} px
            </div>
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
          </div>
          <details className="border-t border-border pt-2">
            <summary className="cursor-pointer">Scale and plan details</summary>
            <div className="mt-1 text-muted-foreground">
              <div>
                X {plan.xScale.type}: {plan.xScale.domain.join(" to ")} →{" "}
                {plan.xScale.range.join(" to ")} px
              </div>
              <div>
                Y {plan.yScale.type}: {plan.yScale.domain.join(" to ")} →{" "}
                {plan.yScale.range.join(" to ")} px
              </div>
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
          <RowSteps fields={[trace.x, trace.y]} />
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
      {trace?.kind === "guide" && (
        <div className="space-y-1">
          <div className="font-medium">{trace.id}</div>
          <div>
            Object: {trace.detail.role} · Source: {trace.detail.source}
          </div>
          <div>
            Field: {trace.field}
            {trace.detail.value !== undefined &&
              ` · Tick value: ${trace.detail.value}`}
          </div>
          {trace.primitive.kind === "text" && (
            <>
              <div>Rendered text: {trace.primitive.text}</div>
              <div>
                Position: x {Math.round(trace.primitive.x)} px · y{" "}
                {Math.round(trace.primitive.y)} px
              </div>
              <div>
                Text size {trace.primitive.fontSize ?? "SVG default"} · anchor{" "}
                {trace.primitive.textAnchor ?? "SVG default"} ← guide style
              </div>
              {trace.primitive.title &&
                trace.primitive.title !== trace.primitive.text && (
                  <div>Full formatted text: {trace.primitive.title}</div>
                )}
            </>
          )}
          {trace.primitive.kind === "line" && (
            <div>
              Planned line: ({Math.round(trace.primitive.x1)},{" "}
              {Math.round(trace.primitive.y1)}) → (
              {Math.round(trace.primitive.x2)}, {Math.round(trace.primitive.y2)}
              ) px · stroke{" "}
              {trace.primitive.stroke ??
                trace.primitive.className ??
                "SVG default"}
              {trace.primitive.hitStrokeWidth &&
                ` · ${trace.primitive.hitStrokeWidth} px hit target`}
            </div>
          )}
          <div>
            {trace.scale.type} scale · domain {trace.scale.domain.join(" to ")}{" "}
            · range {trace.scale.range.join(" to ")} px
          </div>
          <div>
            Raw bounds: {trace.sourceBounds.join(" to ")} · {trace.population}{" "}
            full-source rows · {Math.round(trace.buffer * 100)}% padding
          </div>
          <div>Inputs: {trace.refs.join(", ")}</div>
          <div>
            Margins: left {trace.policy.requestedLeftMargin} px setting →{" "}
            {trace.policy.labelLeftMargin} px for Y labels →{" "}
            {Math.min(trace.policy.labelLeftMargin, trace.policy.maxLeftMargin)}{" "}
            px after keeping {trace.policy.minPlotWidth} px for the plot; bottom{" "}
            {trace.policy.bottomMargin} px for the X label
          </div>
          <div>
            Tick density targets: grid X {trace.policy.x.gridRequested}, Y{" "}
            {trace.policy.y.gridRequested} · Labels X{" "}
            {trace.policy.x.axisRequested}, Y {trace.policy.y.axisRequested}
          </div>
          <div className="text-muted-foreground">
            Targets come from each chart setting, or 5 by default. D3 chooses
            rounded candidate values near each target. Grid lines use those
            candidates. Labels need room, so the spacing rule can omit them.
          </div>
          <div>
            {trace.detail.axis.toUpperCase()} tick candidates:{" "}
            {trace.policy[trace.detail.axis].candidates.join(", ") || "none"}
            {" · "}Shown:{" "}
            {trace.policy[trace.detail.axis].kept.join(", ") || "none"}
            {" · "}Omitted for spacing:{" "}
            {trace.policy[trace.detail.axis].omitted.join(", ") || "none"}
            {" · "}Minimum label gap{" "}
            {trace.policy[trace.detail.axis].minLabelGap} px
          </div>
          {trace.primitive.kind === "text" && (
            <div>
              Label limit {trace.policy[trace.detail.axis].maxLabelChars}{" "}
              characters; formatting follows field settings. X label width uses
              6 px per character. Y labels use 12 px for spacing. Both need an 8
              px gap.
            </div>
          )}
          <div>
            SVG clip: {Math.round(trace.scale.range[0])} to{" "}
            {Math.round(trace.scale.range[1])} px on this axis. Object
            coordinates come from the scale and margins.
          </div>
          <div>Plan revision: {trace.revision}</div>
        </div>
      )}
      {trace?.kind === "title" && (
        <div className="space-y-1">
          <div className="font-medium">Chart title · {trace.text}</div>
          <div>
            Source:{" "}
            {trace.source === "chart-setting"
              ? "fixed chart setting"
              : `label for ${trace.field}`}
          </div>
          <div className="text-muted-foreground">
            Plan revision: {trace.revision}
          </div>
        </div>
      )}
      {trace?.kind === "facet" && (
        <div className="space-y-1">
          <div className="font-medium">
            Facet {trace.role.replace("-", " ")}
          </div>
          {trace.row && (
            <div>
              {facetHeading(trace.row)}
              {trace.row.calculation &&
                ` · calculated from row ${trace.row.sampleSourceId}: ${trace.row.calculation.expression}`}
            </div>
          )}
          {trace.column && (
            <div>
              {facetHeading(trace.column)}
              {trace.column.calculation &&
                ` · calculated from row ${trace.column.sampleSourceId}: ${trace.column.calculation.expression}`}
            </div>
          )}
          <div>
            Grouped by prepared facet value · {trace.layout.mode} layout ·{" "}
            {trace.layout.width} × {trace.layout.height} px
          </div>
          {trace.layout.mode === "grid" && (
            <div>
              {trace.layout.rowCount} rows, {trace.layout.columnCount} columns ·{" "}
              {trace.layout.rowPageSize} rows and {trace.layout.columnPageSize}{" "}
              columns per page · Page {trace.layout.page + 1} of{" "}
              {trace.layout.pageCount} · Cell{" "}
              {Math.round(trace.layout.cellWidth)} ×{" "}
              {Math.round(trace.layout.cellHeight)} px · Measured heading{" "}
              {trace.layout.tableHeaderHeight} px
            </div>
          )}
          {trace.layout.mode === "wrap" && (
            <div>
              Requested {trace.layout.requestedColumns} columns →{" "}
              {trace.layout.columnCount} at this width · {trace.layout.rowCount}{" "}
              rows · {trace.layout.pageSize} facets per page · Page{" "}
              {trace.layout.page + 1} of {trace.layout.pageCount} · Card{" "}
              {Math.round(trace.layout.facetWidth)} ×{" "}
              {Math.round(trace.layout.facetHeight)} px
            </div>
          )}
          <div>
            {trace.sourceIds.length} source rows belong to this facet ·{" "}
            {trace.chartIds.length} pass other chart filters
          </div>
          <div className="text-muted-foreground">
            Source row IDs: {trace.sourceIds.slice(0, 12).join(", ")}
            {trace.sourceIds.length > 12 &&
              `, … (${trace.sourceIds.length} total)`}
          </div>
          <div className="text-muted-foreground">
            Plan revision: {trace.revision}
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
      {trace?.kind === "legend" && (
        <div className="space-y-1">
          <div className="font-medium">Color legend · {trace.legend.field}</div>
          <div>
            Scale: {trace.legend.scaleId} · {trace.legend.type}
          </div>
          {trace.item ? (
            <>
              <div>
                Category: {trace.item.label} · {trace.item.count}{" "}
                own-filter-exempt rows
              </div>
              <div>
                Resolved color:{" "}
                <span
                  className="inline-block h-3 w-3 align-middle"
                  style={{ background: trace.item.color }}
                />{" "}
                {trace.item.color}
              </div>
              <div>
                Selected by color filter: {trace.item.selected ? "yes" : "no"}
              </div>
            </>
          ) : (
            <>
              <div>
                Domain:{" "}
                {trace.legend.domain?.join(" to ") ?? "category mapping"} ·
                Palette: {String(trace.legend.palette)}
              </div>
              {trace.numericalPlan && (
                <div>
                  Ramp width {trace.numericalPlan.width} px · Requested{" "}
                  {trace.numericalPlan.requestedBreakpoints} stops · One stop
                  per {trace.numericalPlan.widthPerStop} px when space allows
                  {trace.numericalPlan.stops.map((stop) => (
                    <div key={stop.value}>
                      {stop.label} → {stop.color}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          <div>
            Source row IDs: {trace.rowIds.slice(0, 12).join(", ")}
            {trace.rowIds.length > 12 && `, … (${trace.rowIds.length} total)`}
          </div>
        </div>
      )}
      {!trace && (
        <p>
          Normal clicks keep chart interactions. You can also find a source row
          below.
        </p>
      )}
      {(plan || onFindRow) && (
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
      )}
      {rowMessage && <p role="status">{rowMessage}</p>}
      {plan && (
        <details className="border-t border-border pt-2">
          <summary className="cursor-pointer">
            Browse {plan.grid.length + plan.axes.length} guides,{" "}
            {brushObjects.length} brush objects, and{" "}
            {plan.legend?.items.length ?? 0} colors
          </summary>
          <div className="mt-2 flex max-h-36 flex-wrap gap-1 overflow-y-auto">
            {[...plan.grid, ...plan.axes].map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded border border-border px-1"
                onClick={() => onSelect({ kind: "guide", id: item.id, plan })}
              >
                {item.id}
              </button>
            ))}
            {brushObjects.map(({ id }) => (
              <button
                key={id}
                type="button"
                className="rounded border border-border px-1"
                onClick={() => onSelect({ kind: "overlay", id, plan })}
              >
                {id}
              </button>
            ))}
            {plan.legend?.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded border border-border px-1"
                onClick={() => onSelect({ kind: "legend", id: item.id, plan })}
              >
                Color: {item.label}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
