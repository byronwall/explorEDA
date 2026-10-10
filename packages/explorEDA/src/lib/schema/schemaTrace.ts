import type { SchemaEdge, SchemaEndpoint, SchemaGraph } from "./schemaGraph";

export interface SchemaTrace {
  /** Rows the field comes from, nearest first. */
  upstream: SchemaEndpoint[];
  /** Rows that read the field, directly or through calculations. */
  downstream: SchemaEndpoint[];
  /** Every line on the way, in either direction. */
  edges: Set<string>;
}

const key = (end: SchemaEndpoint) => `${end.nodeId}\u0000${end.rowId}`;

/** Lines that carry a field's values; relationships only match keys. */
const FLOWS = new Set<SchemaEdge["kind"]>(["lineage", "calculation", "usage"]);

/**
 * Where a field comes from and everything that reads it: follow the lines
 * that carry values back to their sources and forward to every calculation
 * and view that uses them. Relationship lines join keys rather than carry a
 * field, so they show only when they touch the field itself.
 */
export function traceField(
  graph: SchemaGraph,
  field: SchemaEndpoint
): SchemaTrace {
  const forward = new Map<string, SchemaEdge[]>();
  const backward = new Map<string, SchemaEdge[]>();
  for (const edge of graph.edges) {
    if (!FLOWS.has(edge.kind)) continue;
    forward.set(key(edge.from), [...(forward.get(key(edge.from)) ?? []), edge]);
    backward.set(key(edge.to), [...(backward.get(key(edge.to)) ?? []), edge]);
  }
  const edges = new Set<string>();
  const walk = (
    start: SchemaEndpoint,
    next: Map<string, SchemaEdge[]>,
    end: (edge: SchemaEdge) => SchemaEndpoint
  ) => {
    const seen = new Set([key(start)]);
    const found: SchemaEndpoint[] = [];
    let frontier = [start];
    while (frontier.length) {
      const following: SchemaEndpoint[] = [];
      for (const point of frontier) {
        for (const edge of next.get(key(point)) ?? []) {
          edges.add(edge.id);
          const other = end(edge);
          if (seen.has(key(other))) continue;
          seen.add(key(other));
          found.push(other);
          following.push(other);
        }
      }
      frontier = following;
    }
    return found;
  };
  const upstream = walk(field, backward, (edge) => edge.from);
  const downstream = walk(field, forward, (edge) => edge.to);
  for (const edge of graph.edges) {
    if (
      edge.kind === "relationship" &&
      [edge.from, edge.to].some((end) => key(end) === key(field))
    ) {
      edges.add(edge.id);
    }
  }
  return { upstream, downstream, edges };
}
