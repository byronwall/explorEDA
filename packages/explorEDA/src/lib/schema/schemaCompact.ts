import {
  HEADER_ROW,
  tableNodeId,
  type SchemaEdge,
  type SchemaEndpoint,
  type SchemaGraph,
  type SchemaNode,
  type SchemaRow,
} from "./schemaGraph";
import { querySources } from "./sourceUsage";
import { traceField } from "./schemaTrace";

/**
 * Folds each view card that is not expanded to one row per chart or section,
 * saying how many fields it reads. Lines into a folded field land on its
 * chart's row, once per source, so lineage still reaches the view while the
 * diagram stays small enough to read without panning. The current view stays
 * open unless `foldCurrent` is set.
 */
export function compactViews(
  graph: SchemaGraph,
  expanded: ReadonlySet<string>,
  { foldCurrent = false }: { foldCurrent?: boolean } = {}
): SchemaGraph {
  const moved = new Map<string, string>();
  const nodes = graph.nodes.map((node): SchemaNode => {
    if (
      node.kind !== "view" ||
      (node.current && !foldCurrent) ||
      expanded.has(node.id)
    ) {
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

export const UNUSED_LIST = "list:unused";

/** A query whose only step reads one table; a condensed drawing omits it. */
export const readsOneTable = (node: SchemaNode) =>
  node.kind === "query" &&
  node.rows.length === 1 &&
  node.rows[0]!.kind === "step" &&
  node.rows[0]!.step === "source";

const endKey = (end: SchemaEndpoint) => `${end.nodeId}\u0000${end.rowId}`;

/**
 * The drawing of a project that shows what its views use, on one readable
 * screen. A query that only reads one table draws no card: the line from the
 * table to each view that reads it says the same. Tables no view reads fold
 * into one list, except those in `open`; fields a view reads are marked.
 *
 * It only changes what is drawn. Who reads a table comes from the same
 * lineage lines `sourceUsage` reads, so the diagram and a source's "used by"
 * agree. With no views at all, nothing counts as unused.
 */
export function condenseProject(
  graph: SchemaGraph,
  open: ReadonlySet<string>
): SchemaGraph {
  // A single table has nothing to set aside or route around; it draws as is.
  if (graph.nodes.filter((node) => node.kind === "table").length <= 1) {
    return graph;
  }
  const views = graph.nodes.filter((node) => node.kind === "view");
  const reads = querySources(graph);
  const readers = new Map<string, SchemaNode[]>();
  for (const view of views) {
    for (const sourceId of reads.get(view.queryId ?? "") ?? []) {
      const id = tableNodeId(sourceId);
      readers.set(id, [...(readers.get(id) ?? []), view]);
    }
  }

  const passThrough = new Set(
    graph.nodes.filter(readsOneTable).map((node) => node.id)
  );
  const unused = new Set(
    views.length
      ? graph.nodes
          .filter((node) => node.kind === "table" && !readers.has(node.id))
          .map((node) => node.id)
      : []
  );
  const folded = new Set([...unused].filter((id) => !open.has(id)));

  const nodes: SchemaNode[] = [];
  for (const node of graph.nodes) {
    if (passThrough.has(node.id) || folded.has(node.id)) continue;
    if (node.kind !== "table") {
      nodes.push(node);
      continue;
    }
    const tableReaders = readers.get(node.id) ?? [];
    const rows = node.rows.map((row) => {
      const trace = traceField(graph, { nodeId: node.id, rowId: row.id });
      const used = trace.downstream.some((end) =>
        views.some((view) => view.id === end.nodeId)
      );
      return used ? { ...row, used: true } : row;
    });
    nodes.push({
      ...node,
      rows,
      readers: tableReaders.map((view) => view.title),
      detail: !tableReaders.length
        ? node.detail
        : tableReaders.length === 1
          ? tableReaders[0]!.title
          : `${tableReaders.length} views`,
      unused: unused.has(node.id) || undefined,
    });
  }
  const unusedTables = graph.nodes.filter((node) => unused.has(node.id));
  if (unusedTables.length) {
    nodes.push({
      id: UNUSED_LIST,
      kind: "list",
      title: "Not used by any view",
      detail: `${unusedTables.length}`,
      rows: unusedTables.map((node) => ({
        id: node.id,
        kind: "table",
        label: node.title,
        detail: `${node.rows.length} ${node.rows.length === 1 ? "field" : "fields"}${node.detail ? ` · ${node.detail}` : ""}`,
        open: open.has(node.id) || undefined,
      })),
    });
  }

  // Lines to a folded table land on its row in the list.
  const place = (end: SchemaEndpoint): SchemaEndpoint =>
    folded.has(end.nodeId) ? { nodeId: UNUSED_LIST, rowId: end.nodeId } : end;
  const seen = new Set<string>();
  const edges: SchemaEdge[] = [];
  for (const edge of graph.edges) {
    if (passThrough.has(edge.from.nodeId) || passThrough.has(edge.to.nodeId))
      continue;
    const from = place(edge.from);
    const to = place(edge.to);
    if (from.nodeId === to.nodeId && from.nodeId === UNUSED_LIST) continue;
    if (from === edge.from && to === edge.to) {
      edges.push(edge);
      continue;
    }
    const key = `${edge.kind}\u0000${endKey(from)}\u0000${endKey(to)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // The id stays, so a selected line still names the project's edge.
    edges.push({ ...edge, from, to });
  }
  for (const [tableId, tableReaders] of readers) {
    if (folded.has(tableId)) continue;
    for (const view of tableReaders) {
      edges.push({
        id: `reads:${tableId}:${view.id}`,
        kind: "reads",
        from: { nodeId: tableId, rowId: HEADER_ROW },
        to: { nodeId: view.id, rowId: HEADER_ROW },
      });
    }
  }
  return { nodes, edges };
}
