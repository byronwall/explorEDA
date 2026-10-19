import { TraceReadout, TraceSection, TraceSwatch } from "../ChartTraceDetails";
import type { ConnectionPath, ConnectionPlan } from "./connectPlan";

export interface ConnectionTrace {
  kind: "connection";
  id: string;
  revision: string;
  plan: ConnectionPlan;
  path: ConnectionPath;
  xLabel: string;
  yLabel: string;
  /** Formats a source value the way the chart shows it. */
  format: (field: "x" | "y" | "order", value: unknown) => string;
}

const STATE_TEXT = {
  drawn: "Drawn",
  filtered: "Filtered out · breaks the path",
  unplotted: "No position · breaks the path",
} as const;

/** One connected path: its order rule, its rows in order, and every break. */
export function ConnectionTraceBody({ trace }: { trace: ConnectionTrace }) {
  const { path, plan } = trace;
  const drawn = path.rows.filter((row) => row.state === "drawn").length;
  const gaps = path.rows.length - drawn;
  const color = path.segments[0]?.color;
  return (
    <div className="space-y-3 text-xs" aria-label="Connection trace">
      <div className="eda-trace-subject">
        {color && <TraceSwatch color={color} />}
        <span className="font-semibold">{path.label}</span>
        <span className="text-muted-foreground">Connected path</span>
      </div>
      <TraceSection heading="Order">
        <TraceReadout label="Ordered by">
          {plan.orderField ?? "Source row order"}
        </TraceReadout>
        {plan.groupField && (
          <TraceReadout label="One path per">{plan.groupField}</TraceReadout>
        )}
        <TraceReadout label="Rows">
          {path.rows.length.toLocaleString()} in order ·{" "}
          {drawn.toLocaleString()} drawn
          {gaps > 0 && ` · ${gaps.toLocaleString()} break the path`}
        </TraceReadout>
        <TraceReadout label="Segments">
          {path.segments.length.toLocaleString()} in{" "}
          {path.runs.toLocaleString()} {path.runs === 1 ? "run" : "runs"}
        </TraceReadout>
      </TraceSection>
      <TraceSection heading="Rows in path order">
        <table className="w-full table-fixed border-collapse tabular-nums">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="w-12 font-medium">Row</th>
              <th className="font-medium">{plan.orderField ?? "Order"}</th>
              <th className="font-medium">{trace.xLabel}</th>
              <th className="font-medium">{trace.yLabel}</th>
              <th className="font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {path.rows.map((row) => (
              <tr
                key={row.sourceId}
                className={
                  row.state === "drawn" ? undefined : "text-muted-foreground"
                }
              >
                <td>{row.sourceId}</td>
                <td className="truncate">{trace.format("order", row.order)}</td>
                <td className="truncate">{trace.format("x", row.x)}</td>
                <td className="truncate">{trace.format("y", row.y)}</td>
                <td className="truncate">{STATE_TEXT[row.state]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TraceSection>
      <TraceSection heading="How the path is drawn" muted>
        <p>
          Rows are sorted by {plan.orderField ?? "their source order"}, ties by
          row. A straight segment joins each pair of neighbors that are both
          drawn. A row that another filter removes, or that has no position on
          an axis, ends the run, so the path never jumps across it.
        </p>
        <p>
          Each segment takes the color of the point it starts from.
          {plan.unordered.length > 0 &&
            ` ${plan.unordered.length.toLocaleString()} rows have no ${plan.orderField} value and join no path.`}
        </p>
      </TraceSection>
    </div>
  );
}
