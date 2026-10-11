import type {
  SchemaEdge,
  SchemaGraph,
  SchemaNode,
  SchemaRow,
} from "./schemaGraph";

/**
 * Folds each view card that is not expanded to one row per chart or section,
 * saying how many fields it reads. Lines into a folded field land on its
 * chart's row, once per source, so lineage still reaches the view while the
 * diagram stays small enough to read without panning.
 */
export function compactViews(
  graph: SchemaGraph,
  expanded: ReadonlySet<string>
): SchemaGraph {
  const moved = new Map<string, string>();
  const nodes = graph.nodes.map((node): SchemaNode => {
    if (node.kind !== "view" || node.current || expanded.has(node.id)) {
      return node;
    }
    const rows: SchemaRow[] = [];
    let heading: SchemaRow | undefined;
    let count = 0;
    let missing = false;
    const close = () => {
      if (!heading) return;
      rows.push({
        ...heading,
        kind: "use",
        detail: `${count} ${count === 1 ? "field" : "fields"}`,
        status: missing ? "missing" : undefined,
      });
    };
    for (const row of node.rows) {
      if (row.kind === "heading") {
        close();
        heading = row;
        count = 0;
        missing = false;
        continue;
      }
      if (row.kind === "use" && heading) {
        count += 1;
        missing ||= row.status === "missing";
        moved.set(`${node.id}\u0000${row.id}`, heading.id);
        continue;
      }
      close();
      heading = undefined;
      rows.push(row);
    }
    close();
    return { ...node, rows, folded: true };
  });

  const seen = new Set<string>();
  const edges: SchemaEdge[] = [];
  for (const edge of graph.edges) {
    const target = moved.get(`${edge.to.nodeId}\u0000${edge.to.rowId}`);
    if (!target) {
      edges.push(edge);
      continue;
    }
    const to = { nodeId: edge.to.nodeId, rowId: target };
    const key = `${edge.from.nodeId}\u0000${edge.from.rowId}\u0000${target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push({ ...edge, id: `${edge.id}:folded`, to });
  }
  return { nodes, edges };
}
