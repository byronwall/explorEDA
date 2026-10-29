import {
  showTraceValue,
  TraceReadout,
  TraceSection,
  TraceSwatch,
} from "../ChartTraceDetails";
import {
  unavailableReason,
  type CorrelationResult,
  type PairCorrelation,
} from "@/lib/pairCorrelation";
import {
  cellKindName,
  cellMethods,
  METHOD_NAMES,
  METHOD_SYMBOLS,
  type MatrixCellTrace,
  type MatrixRowTrace,
  type MatrixTrace,
} from "./matrixTrace";

/** A coefficient to three places, or why there is none. */
const formatResult = (result: CorrelationResult | undefined) =>
  !result
    ? "not computed"
    : result.value === undefined
      ? `none: ${unavailableReason(result)}`
      : result.value.toFixed(3);

/** Rows paired, then the rows each missing value leaves out. */
function pairCounts(correlation: PairCorrelation, column: string, row: string) {
  const { paired, missingX, missingY, missingBoth } = correlation.counts;
  const parts = [`${paired.toLocaleString()} paired`];
  if (missingX) parts.push(`${missingX.toLocaleString()} have no ${column}`);
  if (missingY) parts.push(`${missingY.toLocaleString()} have no ${row}`);
  if (missingBoth) parts.push(`${missingBoth.toLocaleString()} have neither`);
  return parts.join("; ");
}

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
  const correlation = cell.correlation;
  const methods = cellMethods(cell);
  return (
    <div className="space-y-2" aria-label="Scatter matrix cell trace">
      <TraceSection
        heading={diagonal ? column.label : `${column.label} × ${row.label}`}
      >
        <TraceReadout label="Draws">{cellKindName(cell)}</TraceReadout>
        {!diagonal && (
          <TraceReadout label="Axes">
            {`${column.label} across, ${row.label} up`}
          </TraceReadout>
        )}
        <TraceReadout label="Rows used">
          {`${cell.n.toLocaleString()} of ${trace.liveCount.toLocaleString()} rows after other filters`}
        </TraceReadout>
        {correlation ? (
          <TraceReadout label="Pairs">
            {pairCounts(correlation, column.label, row.label)}
          </TraceReadout>
        ) : (
          <TraceReadout label="Missing">
            {diagonal
              ? `${trace.missing[0].toLocaleString()} rows have no ${column.label}`
              : `${trace.missing[0].toLocaleString()} rows have no ${column.label}; ${trace.missing[1].toLocaleString()} have no ${row.label}`}
          </TraceReadout>
        )}
        {methods.map((method) => (
          <TraceReadout
            key={method}
            label={`${METHOD_NAMES[method]} ${METHOD_SYMBOLS[method]}`}
          >
            {formatResult(correlation?.[method])}
          </TraceReadout>
        ))}
      </TraceSection>
      {trace.groups && (
        <TraceSection
          heading={`${methods.map((method) => METHOD_SYMBOLS[method]).join(" and ")} by group, each over its own pairs`}
        >
          {trace.groups.map((group) => (
            <TraceReadout key={group.label} label={group.label}>
              <TraceSwatch color={group.color} />{" "}
              {methods
                .map(
                  (method) =>
                    `${METHOD_SYMBOLS[method]} ${formatResult(group.correlation[method])}`
                )
                .join(" · ")}
              {` · n ${group.correlation.counts.paired.toLocaleString()}`}
            </TraceReadout>
          ))}
        </TraceSection>
      )}
      {trace.paired && trace.paired.length > 0 && (
        <TraceSection
          heading={`Paired rows, first ${trace.paired.length} of ${correlation!.counts.paired.toLocaleString()}`}
        >
          <table className="w-full tabular-nums">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left font-normal">Row</th>
                <th className="text-right font-normal">{column.label}</th>
                <th className="text-right font-normal">Rank</th>
                <th className="text-right font-normal">{row.label}</th>
                <th className="text-right font-normal">Rank</th>
              </tr>
            </thead>
            <tbody>
              {trace.paired.map((item) => (
                <tr key={item.sourceId}>
                  <td>{item.sourceId}</td>
                  <td className="text-right">
                    {showTraceValue(
                      column.kind === "date" ? new Date(item.x) : item.x
                    )}
                  </td>
                  <td className="text-right">{item.rankX}</td>
                  <td className="text-right">
                    {showTraceValue(
                      row.kind === "date" ? new Date(item.y) : item.y
                    )}
                  </td>
                  <td className="text-right">{item.rankY}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TraceSection>
      )}
      <TraceSection muted>
        <div>
          Domains and categories come from every source row, so they hold still
          while charts filter. The matrix&apos;s own selection dims rows but
          never changes counts, correlations, or bins.
          {correlation &&
            " A correlation uses only rows with both values. Ranks start at 1, and tied values share their average rank."}
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
