import type { ChartTrace } from "./traceTypes";

/**
 * The runtime row IDs behind a traced mark, for traces that stand for rows.
 * Guides, titles, and legends have none.
 */
export function traceRowIds(trace: ChartTrace): number[] | undefined {
  switch (trace.kind) {
    case "metric-card":
      return trace.plan.contributors.map((item) => item.sourceId);
    case "bar":
      return trace.mark.row.contributors.map((item) => item.sourceId);
    case "time-bucket":
      return trace.point?.contributors.map((item) => item.sourceId);
    case "point":
      return [trace.sourceId];
    case "composition":
      return trace.rowIds;
    default:
      return undefined;
  }
}
