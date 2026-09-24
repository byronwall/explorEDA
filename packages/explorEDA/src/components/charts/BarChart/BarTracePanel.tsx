import { useState } from "react";
import { displayAggregateValue } from "@/lib/aggregates";
import {
  TraceGuideDetails,
  TraceMarkGeometry,
  TraceReadout,
  TraceScaleReadout,
  TraceSection,
  showTraceValue,
} from "../ChartTraceDetails";
import type { BarTraceSelection } from "./BarTraceContext";
import { AggregateContributorTable } from "./GroupedAggregateInspector";

export function BarTracePanel({
  selection,
  onFindRow,
  onSelect,
  guides,
}: {
  selection: BarTraceSelection | null;
  onFindRow?: (id: number) => boolean;
  onSelect: (selection: BarTraceSelection) => void;
  guides: BarTraceSelection[];
}) {
  const [rowText, setRowText] = useState("");
  const [rowMessage, setRowMessage] = useState("");
  const findRow = () => {
    const id = Number(rowText);
    if (!rowText.trim() || !Number.isInteger(id) || id < 0) {
      setRowMessage("Enter a valid source row ID.");
      return;
    }
    setRowMessage(
      onFindRow?.(id) ? "" : "This row is outside the visible bars or does not exist."
    );
  };
  const bar = selection?.bar;
  const result = selection?.result;
  const row = selection && result?.rows.find((item) => item.id === selection.selectedRowId);
  return (
    <div className="space-y-3 text-xs" aria-label="Bar trace">
      {selection?.kind === "title" && (
        <TraceSection heading="Chart title">
          <TraceReadout label="Field">{selection.fieldLabel ?? selection.field}</TraceReadout>
          <div>Alt-click a bar, axis object, or zero baseline to inspect its rendering.</div>
        </TraceSection>
      )}
      {selection?.kind === "guide" && selection.guide && (
        <TraceGuideDetails
          heading={selection.guide.id}
          guide={{
            object: selection.guide.role,
            source:
              selection.guide.role === "grid" || selection.guide.role === "tick"
                ? "scale"
                : "chart setting",
            field: selection.fieldLabel ?? selection.field,
            tickValue: selection.guide.value,
            bin:
              selection.guide.start !== undefined && selection.guide.end !== undefined
                ? { start: selection.guide.start, end: selection.guide.end }
                : undefined,
            position: { x: selection.guide.x, y: selection.guide.y },
            line: {
              x1: selection.guide.x1,
              y1: selection.guide.y1,
              x2: selection.guide.x2,
              y2: selection.guide.y2,
            },
            scale:
              selection.guide.axis === "x"
                ? { axis: "x", ...selection.xScale }
                : { axis: "y", ...selection.yScale },
            label: selection.guide.label,
          }}
        />
      )}
      {selection?.kind === "guide" && selection.guide?.role === "zero" && (
        <TraceReadout label="Zero baseline">
          {Math.round(selection.guide.y ?? selection.yScale.range[0] as number)} px
        </TraceReadout>
      )}
      {selection?.kind === "bar" && bar && (
        <TraceSection heading={`Bar · ${bar.label}`}>
          <TraceReadout label="Field">{selection.fieldLabel ?? selection.field}</TraceReadout>
          <TraceReadout label="Value">{displayAggregateValue(bar.value)}</TraceReadout>
          {result && (
            <TraceReadout label="Aggregation">
              {result.spec.aggregation}
              {result.spec.measureField && ` of ${result.spec.measureField}`}
            </TraceReadout>
          )}
          {bar.start !== undefined && bar.end !== undefined && (
            <TraceReadout label="Bin interval">
              {showTraceValue(bar.start)} to {showTraceValue(bar.end)}
            </TraceReadout>
          )}
          <TraceMarkGeometry label="Bar geometry" geometry={bar.geometry} />
          {bar.baseline !== undefined && <TraceReadout label="Zero baseline">{Math.round(bar.baseline)} px</TraceReadout>}
          {bar.fill && <TraceReadout label="Fill">{bar.fill}</TraceReadout>}
          <TraceScaleReadout axis="x" {...selection.xScale} />
          <TraceScaleReadout axis="y" {...selection.yScale} />
        </TraceSection>
      )}
      {row && selection?.kind === "bar" && (
        <TraceSection heading={`${row.groupLabel} contributors`}>
          <TraceReadout label="Contributors">
            {row.contributors.filter((item) => item.included).length} of {row.contributors.length}
          </TraceReadout>
          <TraceReadout label="Exact result">{displayAggregateValue(row.value)}</TraceReadout>
          <AggregateContributorTable row={row} />
        </TraceSection>
      )}
      {result && selection.scopeDescription && (
        <TraceSection muted>
          <div>{selection.scopeDescription}</div>
        </TraceSection>
      )}
      {guides.length > 0 && (
        <details className="border-t border-border pt-2">
          <summary className="cursor-pointer">Browse {guides.length} chart guides</summary>
          <div className="mt-2 flex flex-wrap gap-1">
            {guides.map((guide) => (
              <button
                key={guide.id}
                type="button"
                className="rounded border border-border px-1"
                onClick={() => onSelect(guide)}
              >
                {guide.id}
              </button>
            ))}
          </div>
        </details>
      )}
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
    </div>
  );
}
