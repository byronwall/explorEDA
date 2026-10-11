import {
  showTraceValue,
  TraceReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";
import {
  cellKindName,
  type MatrixCellTrace,
  type MatrixRowTrace,
  type MatrixTrace,
} from "./matrixTrace";

const formatR = (r: number | undefined) =>
  r === undefined
    ? "undefined (fewer than 3 pairs or a constant field)"
    : r.toFixed(3);

function RowBody({ trace }: { trace: MatrixRowTrace }) {
  return (
    <div className="space-y-2" aria-label="Scatter matrix row trace">
      <TraceSection heading={`Row ${trace.sourceId}`}>
        <TraceReadout label="State">
          {!trace.hasSelection
            ? "Drawn; the matrix has no selection"
            : trace.selected
              ? "Selected: passes every filter the matrix sets"
              : "Dimmed: outside at least one of the matrix's filters"}
        </TraceReadout>
        <TraceReadout label="Color">
          {trace.color ? (
            <>
              <TraceSwatch color={trace.color.color} /> {trace.color.color} ←{" "}
              {trace.color.field} = {showTraceValue(trace.color.value)}
            </>
          ) : (
            "One color"
          )}
        </TraceReadout>
        <TraceReadout label="Point cells">
          {`Drawn in ${trace.drawnIn} of ${trace.pointCells}; a cell skips the row when either of its values is missing`}
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Values, in field order">
        {trace.values.map((value) => (
          <TraceReadout key={value.field.field} label={value.field.label}>
            {showTraceValue(value.raw)} → {value.position}
            {value.passes !== undefined &&
              (value.passes ? " · passes the filter" : " · outside the filter")}
          </TraceReadout>
        ))}
      </TraceSection>
    </div>
  );
}

function CellBody({ trace }: { trace: MatrixCellTrace }) {
  const { cell, column, row } = trace;
  const diagonal = cell.row === cell.column;
  return (
    <div className="space-y-2" aria-label="Scatter matrix cell trace">
      <TraceSection
        heading={diagonal ? column.label : `${column.label} × ${row.label}`}
      >
        <TraceReadout label="Draws">{cellKindName(cell.kind)}</TraceReadout>
        {!diagonal && (
          <TraceReadout label="Axes">
            {`${column.label} across, ${row.label} up`}
          </TraceReadout>
        )}
        <TraceReadout label="Rows used">
          {`${cell.n.toLocaleString()} of ${trace.liveCount.toLocaleString()} rows after other filters`}
        </TraceReadout>
        <TraceReadout label="Missing">
          {diagonal
            ? `${trace.missing[0].toLocaleString()} rows have no ${column.label}`
            : `${trace.missing[0].toLocaleString()} rows have no ${column.label}; ${trace.missing[1].toLocaleString()} have no ${row.label}`}
        </TraceReadout>
        {cell.kind === "correlation" && (
          <TraceReadout label="Pearson r">{formatR(cell.r)}</TraceReadout>
        )}
      </TraceSection>
      {trace.groups && (
        <TraceSection heading="Pearson r by group">
          {trace.groups.map((group) => (
            <TraceReadout key={group.label} label={group.label}>
              <TraceSwatch color={group.color} /> {formatR(group.r)}
            </TraceReadout>
          ))}
        </TraceSection>
      )}
      <TraceSection muted>
        <div>
          Domains and categories come from every source row, so they hold still
          while charts filter. The matrix&apos;s own selection dims rows but
          never changes counts, correlations, or bins.
        </div>
      </TraceSection>
    </div>
  );
}

export function MatrixTraceBody({ trace }: { trace: MatrixTrace }) {
  return trace.kind === "matrix-row" ? (
    <RowBody trace={trace} />
  ) : (
    <CellBody trace={trace} />
  );
}
