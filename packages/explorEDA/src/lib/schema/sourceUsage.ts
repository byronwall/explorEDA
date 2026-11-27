import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { projectSchemaGraph, type SchemaGraph } from "./schemaGraph";

/**
 * The views that read each source, by source ID. A view reads every source
 * its query does: the one it starts from, and each it looks up, expands, or
 * appends, as the Schema diagram's lineage lines into the query show. Any of
 * them can change the view's rows, so the view depends on all of them.
 */
export function sourceUsage(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  views: Array<{ id: string; queryId: string }>
): Map<string, string[]> {
  const reads = querySources(projectSchemaGraph(project, tables));
  const usage = new Map<string, string[]>();
  for (const view of views) {
    for (const sourceId of reads.get(view.queryId) ?? []) {
      const list = usage.get(sourceId) ?? [];
      if (!list.includes(view.id)) list.push(view.id);
      usage.set(sourceId, list);
    }
  }
  return usage;
}

/** The sources each query reads, by query ID. */
export function querySources(graph: SchemaGraph): Map<string, Set<string>> {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const reads = new Map<string, Set<string>>();
  for (const edge of graph.edges) {
    if (edge.kind !== "lineage") continue;
    const query = nodes.get(edge.to.nodeId);
    const table = nodes.get(edge.from.nodeId);
    if (query?.kind !== "query" || !query.queryId) continue;
    if (table?.kind !== "table" || !table.sourceId) continue;
    const set = reads.get(query.queryId) ?? new Set<string>();
    set.add(table.sourceId);
    reads.set(query.queryId, set);
  }
  return reads;
}
