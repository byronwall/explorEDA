import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import {
  projectSchemaGraph,
  type SchemaGraph,
  type SchemaViewInput,
} from "./schemaGraph";

/**
 * The views that read each source, by source ID: the Schema diagram's own
 * lines, followed back from each view's fields through query steps and
 * calculations to the tables they come from.
 */
export function sourceUsage(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  views: SchemaViewInput[]
): Map<string, string[]> {
  return usageFromGraph(projectSchemaGraph(project, tables, views));
}

export function usageFromGraph(graph: SchemaGraph): Map<string, string[]> {
  // Where each card's rows come from. Relationships join tables but feed no
  // field, so a view reading orders doesn't read customers through them.
  const feeds = new Map<string, Set<string>>();
  for (const edge of graph.edges) {
    if (edge.kind === "relationship") continue;
    const from = feeds.get(edge.to.nodeId) ?? new Set<string>();
    from.add(edge.from.nodeId);
    feeds.set(edge.to.nodeId, from);
  }
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const usage = new Map<string, string[]>();
  for (const view of graph.nodes) {
    if (view.kind !== "view" || !view.viewId) continue;
    const seen = new Set([view.id]);
    const queue = [view.id];
    while (queue.length) {
      for (const from of feeds.get(queue.pop()!) ?? []) {
        if (seen.has(from)) continue;
        seen.add(from);
        queue.push(from);
        const sourceId = nodes.get(from)?.sourceId;
        if (nodes.get(from)?.kind === "table" && sourceId) {
          const list = usage.get(sourceId) ?? [];
          if (!list.includes(view.viewId)) list.push(view.viewId);
          usage.set(sourceId, list);
        }
      }
    }
  }
  return usage;
}
