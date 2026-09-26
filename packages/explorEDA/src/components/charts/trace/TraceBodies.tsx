import {
  TraceReadout,
  TraceScaleReadout,
  TraceSection,
  showTraceValue,
} from "../ChartTraceDetails";
import type {
  FacetHeadingTrace,
  FacetTrace,
  GuideTrace,
  LegendTrace,
  TitleTrace,
} from "./traceTypes";

const round = Math.round;
const list = (values: readonly (string | number)[]) =>
  values.length ? values.join(", ") : "none";

const ROLE_NAMES = {
  rule: "axis line",
  tick: "tick",
  grid: "grid line",
  label: "axis label",
  zero: "zero",
};

const SOURCE_NAMES = {
  scale: "scale",
  "chart-setting": "fixed chart setting",
  "field-label": "field label",
};

export function GuideTraceBody({ trace }: { trace: GuideTrace }) {
  const { guide, axis, axes } = trace;
  const { ticks, domainSource } = axis;
  const policy = axes.marginPolicy;
  return (
    <div className="space-y-2">
      <TraceSection heading={guide.ariaLabel}>
        <TraceReadout label="Object">{ROLE_NAMES[guide.role]}</TraceReadout>
        <TraceReadout label="Source">{SOURCE_NAMES[guide.source]}</TraceReadout>
        {axis.fieldLabel && (
          <TraceReadout label="Field">{axis.fieldLabel}</TraceReadout>
        )}
        {guide.value !== undefined && (
          <TraceReadout label="Value">{showTraceValue(guide.value)}</TraceReadout>
        )}
        {guide.label && (
          <>
            <TraceReadout label="Rendered text">{guide.label.text}</TraceReadout>
            {guide.label.fullText !== guide.label.text && (
              <TraceReadout label="Full formatted text">
                {guide.label.fullText}
              </TraceReadout>
            )}
            <TraceReadout label="Text position">
              x {round(guide.label.x)} px · y {round(guide.label.y)} px ·{" "}
              {guide.label.fontSize} px, {guide.label.anchor} anchor
              {guide.label.rotate ? ` · ${guide.label.rotate}° rotation` : ""}
            </TraceReadout>
          </>
        )}
        {guide.line && (
          <TraceReadout label="Line">
            ({round(guide.line.x1)}, {round(guide.line.y1)}) → (
            {round(guide.line.x2)}, {round(guide.line.y2)}) px
          </TraceReadout>
        )}
        {guide.role === "zero" && guide.line && (
          <TraceReadout label="Zero baseline">
            {round(guide.line.y1)} px
          </TraceReadout>
        )}
        <TraceScaleReadout
          axis={axis.axis}
          type={axis.scale.type}
          domain={axis.scale.domain}
          range={axis.scale.range}
        />
      </TraceSection>
      {domainSource && (
        <TraceSection heading="Domain">
          <div>
            {domainSource.rows} values from {domainSource.population} span{" "}
            {domainSource.bounds.join(" to ")} · padding {domainSource.padding}
          </div>
          {domainSource.lower && (
            <div>
              Lower end set by {domainSource.lower.label} (
              {domainSource.lower.value})
            </div>
          )}
          {domainSource.upper && (
            <div>
              Upper end set by {domainSource.upper.label} (
              {domainSource.upper.value})
            </div>
          )}
        </TraceSection>
      )}
      <TraceSection heading="Ticks">
        <div>
          Density target {ticks.requested} · Candidates{" "}
          {list(ticks.candidates)} · Shown {list(ticks.shown)} · Omitted for
          spacing {list(ticks.omitted)}
        </div>
        <div className="text-muted-foreground">
          The chart setting sets the target, or 5 by default. D3 picks rounded
          candidates near it and grid lines use them. A label is dropped when
          it would sit within {ticks.minLabelGap} px of the one before it (
          {ticks.labelSpacing}). Labels longer than {ticks.maxLabelChars}{" "}
          characters are shortened.
        </div>
      </TraceSection>
      {policy && (
        <TraceSection heading="Margins" muted>
          Left {policy.requestedLeftMargin} px setting →{" "}
          {policy.labelLeftMargin} px for Y labels →{" "}
          {Math.min(policy.labelLeftMargin, policy.maxLeftMargin)} px after
          keeping {policy.minPlotWidth} px for the plot · bottom{" "}
          {policy.bottomMargin} px for the X label
        </TraceSection>
      )}
    </div>
  );
}

export function TitleTraceBody({ trace }: { trace: TitleTrace }) {
  return (
    <TraceSection heading={`Chart title · ${trace.text}`}>
      <TraceReadout label="Source">
        {trace.source === "chart-setting"
          ? "fixed chart setting"
          : `label for ${trace.field}`}
      </TraceReadout>
    </TraceSection>
  );
}

const facetHeading = (item: FacetHeadingTrace) =>
  `${item.field} ${showTraceValue(item.raw)}${item.raw !== item.value ? ` → ${showTraceValue(item.value)}` : ""}${item.label !== showTraceValue(item.value) ? ` → ${item.label}` : ""}`;

export function FacetTraceBody({ trace }: { trace: FacetTrace }) {
  const { layout } = trace;
  return (
    <TraceSection heading={`Facet ${trace.role.replace("-", " ")}`}>
      {[trace.row, trace.column].map(
        (heading) =>
          heading && (
            <div key={heading.field}>
              {facetHeading(heading)}
              {heading.calculation &&
                ` · calculated from row ${heading.sampleSourceId}: ${heading.calculation.expression}`}
            </div>
          )
      )}
      <div>
        Grouped by prepared facet value · {layout.mode} layout · {layout.width}{" "}
        × {layout.height} px
      </div>
      {layout.mode === "grid" && (
        <div>
          {layout.rowCount} rows, {layout.columnCount} columns ·{" "}
          {layout.rowPageSize} rows and {layout.columnPageSize} columns per
          page · Page {layout.page + 1} of {layout.pageCount} · Cell{" "}
          {round(layout.cellWidth)} × {round(layout.cellHeight)} px · Measured
          heading {layout.tableHeaderHeight} px
        </div>
      )}
      {layout.mode === "wrap" && (
        <div>
          Requested {layout.requestedColumns} columns → {layout.columnCount} at
          this width · {layout.rowCount} rows · {layout.pageSize} facets per
          page · Page {layout.page + 1} of {layout.pageCount} · Card{" "}
          {round(layout.facetWidth)} × {round(layout.facetHeight)} px
        </div>
      )}
      <div>
        {trace.sourceIds.length} source rows belong to this facet ·{" "}
        {trace.chartIds.length} pass other chart filters
      </div>
      <div className="text-muted-foreground">
        Source row IDs: {trace.sourceIds.slice(0, 12).join(", ")}
        {trace.sourceIds.length > 12 && `, … (${trace.sourceIds.length} total)`}
      </div>
    </TraceSection>
  );
}

export function LegendTraceBody({ trace }: { trace: LegendTrace }) {
  return (
    <TraceSection heading={`Color legend · ${trace.fieldLabel}`}>
      <div>
        Scale: {trace.scaleId} · {trace.scaleType}
      </div>
      {trace.item ? (
        <>
          <div>
            Category: {trace.item.label} · {trace.item.count} rows after other
            chart filters
          </div>
          <div>
            Resolved color:{" "}
            <span
              className="inline-block h-3 w-3 align-middle"
              style={{ background: trace.item.color }}
            />{" "}
            {trace.item.color}
          </div>
          <div>Selected by color filter: {trace.item.selected ? "yes" : "no"}</div>
        </>
      ) : (
        <>
          <div>
            Domain: {trace.domain?.join(" to ") ?? "category mapping"} ·
            Palette: {String(trace.palette)}
          </div>
          {trace.numericalPlan && (
            <div>
              Ramp width {trace.numericalPlan.width} px · Requested{" "}
              {trace.numericalPlan.requestedBreakpoints} stops · One stop per{" "}
              {trace.numericalPlan.widthPerStop} px when space allows
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
    </TraceSection>
  );
}
