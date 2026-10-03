import { AggregateContributorTable } from "../BarChart/GroupedAggregateInspector";
import {
  TraceMarkGeometry,
  TraceReadout,
  TraceSection,
} from "../ChartTraceDetails";
import type { HeatmapTrace } from "./heatmapTrace";

const round = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 3 });

const STATE_TEXT = {
  value: "Value",
  empty: "No source rows",
  invalid: "Rows, but no valid measure values",
};

export function HeatmapTraceBody({ trace }: { trace: HeatmapTrace }) {
  const { cell, scale, omitted } = trace;
  const included = cell.contributors.filter((item) => item.included).length;
  const excluded = cell.contributors.length - included;
  return (
    <div className="space-y-2" aria-label="Heatmap cell trace">
      <TraceSection heading={`Cell · ${cell.row.label} × ${cell.column.label}`}>
        <TraceReadout label={trace.rowFieldLabel}>{cell.row.label}</TraceReadout>
        <TraceReadout label={trace.columnFieldLabel}>
          {cell.column.label}
        </TraceReadout>
        <TraceReadout label="Metric">{trace.metricLabel}</TraceReadout>
        <TraceReadout label="Result">
          {cell.state === "value" ? cell.valueText : STATE_TEXT[cell.state]}
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Rendered cell">
        <TraceMarkGeometry label="Cell geometry" geometry={cell} />
        <TraceReadout label="Fill">
          {cell.state === "value" ? (
            <>
              <span
                className="inline-block h-3 w-3 align-middle"
                style={{ background: cell.fill }}
              />{" "}
              {cell.fill} ← {scale.kind} scale over {round(scale.domain[0])}{" "}
              to {round(scale.domain[1])}
            </>
          ) : (
            "No fill; the cell has no valid value"
          )}
        </TraceReadout>
        <TraceReadout label="Color domain">{scale.population}</TraceReadout>
      </TraceSection>
      <TraceSection heading="Contributors">
        <TraceReadout label="Rows">
          {included} of {cell.contributors.length} used
          {excluded > 0 && ` · ${excluded} excluded`}
        </TraceReadout>
        {cell.contributors.length > 0 && (
          <AggregateContributorTable
            row={{
              id: cell.id,
              groupValue: cell.row.value,
              groupLabel: cell.row.label,
              value: cell.value,
              rowCount: cell.rowCount,
              contributors: cell.contributors,
            }}
          />
        )}
      </TraceSection>
      <TraceSection muted>
        <div>{trace.scopeNote}</div>
        {(omitted.rows > 0 || omitted.columns > 0) && (
          <div>
            {omitted.rows + omitted.columns} categories past the limit are not
            drawn ({omitted.sourceRows} rows).
          </div>
        )}
      </TraceSection>
    </div>
  );
}
