import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import {
  projectSchemaGraph,
  type SchemaEndpoint,
  type SchemaGraph,
  type SchemaViewInput,
} from "./schemaGraph";

/**
 * The views that read each source, by source ID: the Schema diagram's own
 * lines, followed back from each field a view reads, through query steps and
 * calculations, to the table fields they come from. A Summary Table reads
 * every field of its query, so its view reads every source the query does.
 */
export function sourceUsage(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  views: SchemaViewInput[]
): Map<string, string[]> {
  const summaries = new Map(
    views
      .filter((view) =>
        view.settings?.charts.some((chart) => chart.type === "summary")
      )
      .map((view) => [view.id, view.queryId])
  );
  return usageFromGraph(projectSchemaGraph(project, tables, views), summaries);
}

const key = (end: SchemaEndpoint) => `${end.nodeId}\u0000${end.rowId}`;

/**
 * @param summaries Views that read every field of a query, by view ID.
 */
export function usageFromGraph(
  graph: SchemaGraph,
  summaries: ReadonlyMap<string, string> = new Map()
): Map<string, string[]> {
  // Where each row's value comes from. Relationships join tables but feed no
  // field, so a view reading orders doesn't read customers through them.
  const feeds = new Map<string, SchemaEndpoint[]>();
  // The rows of each card that something feeds, to start a walk from.
  const fed = new Map<string, SchemaEndpoint[]>();
  for (const edge of graph.edges) {
    if (edge.kind === "relationship") continue;
    const to = key(edge.to);
    if (!feeds.has(to)) {
      feeds.set(to, []);
      fed.set(edge.to.nodeId, [...(fed.get(edge.to.nodeId) ?? []), edge.to]);
    }
    feeds.get(to)!.push(edge.from);
  }
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const usage = new Map<string, string[]>();
  for (const view of graph.nodes) {
    if (view.kind !== "view" || !view.viewId) continue;
    const queryId = summaries.get(view.viewId);
    const queue = [
      ...(fed.get(view.id) ?? []),
      ...(queryId ? (fed.get(`query:${queryId}`) ?? []) : []),
    ];
    const seen = new Set(queue.map(key));
    while (queue.length) {
      for (const from of feeds.get(key(queue.pop()!)) ?? []) {
        if (seen.has(key(from))) continue;
        seen.add(key(from));
        queue.push(from);
        const node = nodes.get(from.nodeId);
        if (node?.kind === "table" && node.sourceId) {
          const list = usage.get(node.sourceId) ?? [];
          if (!list.includes(view.viewId)) list.push(view.viewId);
          usage.set(node.sourceId, list);
        }
      }
    }
  }
  return usage;
}
