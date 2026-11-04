import { useState } from "react";
import { isMissingValue } from "@/lib/valueParsing";
import { useDataLayer } from "@/providers/DataLayerProvider";
import type { IdType } from "@/providers/lib/dataLayerState";
import type { datum } from "@/types/ChartTypes";
import { TraceReadout, TraceSection } from "../ChartTraceDetails";
import { sharePercent } from "./JointMissingness";

/** Records per page. Membership is never cut. */
const RECORD_PAGE_SIZE = 50;

export interface JointMissingnessTrace {
  kind: "missingness-pattern";
  id: string;
  revision: string;
  owner: string;
  chartId: string;
  label: string;
  missing: string[];
  fields: string[];
  ids: IdType[];
  total: number;
}

const rawText = (row: Record<string, datum> | undefined, field: string) => {
  if (!row || !(field in row)) return "(absent)";
  const value = row[field];
  return value === null
    ? "null"
    : typeof value === "string"
      ? JSON.stringify(value)
      : String(value);
};

export function JointMissingnessTraceBody({
  trace,
}: {
  trace: JointMissingnessTrace;
}) {
  const rawData = useDataLayer((state) => state.rawData);
  const getColumnData = useDataLayer((state) => state.getColumnData);
  const getFieldLabel = useDataLayer((state) => state.getFieldLabel);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(trace.ids.length / RECORD_PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = trace.ids.slice(
    current * RECORD_PAGE_SIZE,
    (current + 1) * RECORD_PAGE_SIZE
  );
  const columns = trace.fields.map((field) => getColumnData(field));
  const present = trace.fields.filter(
    (field) => !trace.missing.includes(field)
  );

  return (
    <div className="space-y-2" aria-label="Missing pattern trace">
      <TraceSection heading={trace.label}>
        <TraceReadout label="Missing">
          {trace.missing.length
            ? trace.missing.map(getFieldLabel).join(", ")
            : "None"}
        </TraceReadout>
        <TraceReadout label="Present">
          {present.length ? present.map(getFieldLabel).join(", ") : "None"}
        </TraceReadout>
        <TraceReadout label="Rows">
          {trace.ids.length.toLocaleString()} of {trace.total.toLocaleString()}{" "}
          ({sharePercent(trace.ids.length, trace.total)})
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Records">
        {trace.ids.length === 0 ? (
          <p className="text-muted-foreground">No rows have this pattern.</p>
        ) : (
          <>
            <div className="max-h-72 overflow-auto">
              <table className="eda-missingness-records">
                <thead>
                  <tr>
                    <th>Row</th>
                    {trace.fields.map((field) => (
                      <th key={field}>{getFieldLabel(field)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shown.map((id) => {
                    const raw = rawData[id] as
                      | Record<string, datum>
                      | undefined;
                    return (
                      <tr key={id}>
                        <td className="tabular-nums">{id + 1}</td>
                        {trace.fields.map((field, index) =>
                          isMissingValue(columns[index]![id]) ? (
                            <td key={field} data-missing>
                              {rawText(raw, field)} → missing
                            </td>
                          ) : (
                            <td key={field}>{rawText(raw, field)}</td>
                          )
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="eda-missingness-pager">
                <button
                  type="button"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {current + 1} of {pages} · {shown.length} of{" "}
                  {trace.ids.length.toLocaleString()} shown
                </span>
                <button
                  type="button"
                  disabled={current === pages - 1}
                  onClick={() => setPage(current + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </TraceSection>
      <TraceSection muted>
        Each row is a current input row. A value counts as missing after field
        settings: null, an absent key, blank text, or a null token. Shares use
        every row that passes the other charts&apos; filters.
      </TraceSection>
    </div>
  );
}
