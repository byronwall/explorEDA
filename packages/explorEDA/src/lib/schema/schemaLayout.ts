import { route, type EdgeIn } from "@draftably/runtime/route";
import {
  HEADER_ROW,
  type SchemaEdge,
  type SchemaEndpoint,
  type SchemaGraph,
  type SchemaNode,
} from "./schemaGraph";

/** Lines up to this many get the router's full pass; more route quickly. */
const FULL_ROUTE_LIMIT = 15;

/** Fixed sizes, so lines can find a row without measuring the page. */
export const SCHEMA_SIZES = {
  cardWidth: 248,
  header: 46,
  row: 26,
  footer: 8,
  columnGap: 112,
  cardGap: 28,
  margin: 32,
} as const;

export interface SchemaBox {
  x: number;
  y: number;
  width: number;
  height: number;
  column: number;
}

export interface SchemaLayout {
  boxes: Record<string, SchemaBox>;
  width: number;
  height: number;
}

const KIND_ORDER: Record<SchemaNode["kind"], number> = {
  table: 0,
  query: 1,
  view: 2,
  list: 3,
};

/**
 * How far below a card's top a line meets a row: the middle of the row, or
 * of the header for a line that joins the card as a whole.
 */
export function rowOffset(node: SchemaNode | undefined, rowId: string) {
  if (rowId === HEADER_ROW) return SCHEMA_SIZES.header / 2;
  const index = node?.rows.findIndex((row) => row.id === rowId) ?? -1;
  if (index < 0) return undefined;
  return SCHEMA_SIZES.header + (index + 0.5) * SCHEMA_SIZES.row;
}

export function nodeHeight(node: SchemaNode) {
  const { header, row, footer } = SCHEMA_SIZES;
  return header + Math.max(1, node.rows.length) * row + footer;
}

/**
 * Columns for tables by how many many-to-one steps lead to them: detail
 * tables on the left, the tables they look up to their right. Unrelated
 * tables start at the left. A cycle keeps the first column it reached.
 */
function tableColumns(graph: SchemaGraph, tables: SchemaNode[]) {
  const ids = new Set(tables.map((node) => node.id));
  const next = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  for (const edge of graph.edges) {
    if (edge.kind !== "relationship") continue;
    // Point every line from the many side to the one side.
    const [from, to] =
      edge.cardinality === "one-to-many"
        ? [edge.to.nodeId, edge.from.nodeId]
        : [edge.from.nodeId, edge.to.nodeId];
    if (from === to || !ids.has(from) || !ids.has(to)) continue;
    next.set(from, [...(next.get(from) ?? []), to]);
    incoming.set(to, (incoming.get(to) ?? 0) + 1);
  }
  const column = new Map<string, number>();
  const visit = (id: string, depth: number, path: Set<string>) => {
    if (path.has(id) || (column.get(id) ?? -1) >= depth) return;
    column.set(id, depth);
    path.add(id);
    for (const target of next.get(id) ?? []) visit(target, depth + 1, path);
    path.delete(id);
  };
  for (const node of tables) {
    if (!incoming.get(node.id)) visit(node.id, 0, new Set());
  }
  // Tables only reachable through a cycle.
  for (const node of tables) {
    if (!column.has(node.id)) visit(node.id, 0, new Set());
  }
  return column;
}

/**
 * One column per depth: tables, then queries, then views, left to right.
 * Within a column, cards sit near the rows they connect to in the column
 * before.
 */
function layeredLayout(
  graph: SchemaGraph,
  viewport?: { width: number; height: number }
): SchemaLayout {
  const { columnGap, cardGap, margin } = SCHEMA_SIZES;
  // A table no view reads sits with the list of such tables, last.
  const tables = graph.nodes.filter(
    (node) => node.kind === "table" && !node.unused
  );
  const tableColumn = tableColumns(graph, tables);
  const tableColumnCount = Math.max(0, ...tableColumn.values()) + 1;

  const columnOf = new Map<string, number>();
  for (const node of graph.nodes) {
    columnOf.set(
      node.id,
      node.kind === "table" && !node.unused
        ? (tableColumn.get(node.id) ?? 0)
        : tableColumnCount +
            KIND_ORDER[node.kind === "table" ? "list" : node.kind] -
            1
    );
  }
  const layers: SchemaNode[][] = [];
  graph.nodes.forEach((node) => {
    const index = columnOf.get(node.id)!;
    (layers[index] ??= []).push(node);
  });
  // The list comes before the tables opened from it.
  for (const layer of layers) {
    layer?.sort(
      (a, b) => Number(a.kind === "table") - Number(b.kind === "table")
    );
  }
  const columns = viewport
    ? spread(graph, layers, viewport)
    : layers.map((layer) => layer ?? []);
  // One column in a narrow viewport: cards narrow so they, and a lane for
  // lines beside them, still fit at full size.
  const cardWidth =
    viewport && columns.length === 1
      ? Math.max(
          160,
          Math.min(SCHEMA_SIZES.cardWidth, viewport.width - margin * 2 - 48)
        )
      : SCHEMA_SIZES.cardWidth;

  const boxes: Record<string, SchemaBox> = {};
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const offsetOf = (endpoint: SchemaEndpoint) =>
    rowOffset(nodesById.get(endpoint.nodeId), endpoint.rowId) ??
    SCHEMA_SIZES.header / 2;

  /**
   * Where a card's top would put each of its linked rows level with the row
   * it joins, averaged over the placed cards it links to.
   */
  const desiredTop = (node: SchemaNode, placed: (id: string) => boolean) => {
    const tops: number[] = [];
    for (const edge of graph.edges) {
      // Lines to views would pull cards apart and leave gaps; views and the
      // tables they read stack in reading order instead.
      if (edge.kind === "reads" || edge.kind === "usage") continue;
      const [own, other] =
        edge.from.nodeId === node.id
          ? [edge.from, edge.to]
          : edge.to.nodeId === node.id
            ? [edge.to, edge.from]
            : [undefined, undefined];
      if (!own || !other || other.nodeId === node.id) continue;
      const box = boxes[other.nodeId];
      if (!box || !placed(other.nodeId)) continue;
      tops.push(box.y + offsetOf(other) - offsetOf(own));
    }
    return tops.length
      ? tops.reduce((sum, top) => sum + top, 0) / tops.length
      : null;
  };

  // Empty columns, such as queries in a project without any, take no room.
  const populated = columns
    .map((nodes, column) => ({ nodes: nodes ?? [], column }))
    .filter(({ nodes }) => nodes.length);
  const ordinal = new Map(
    populated.map(({ column }, index) => [column, index])
  );
  const columnX = (column: number) =>
    margin + (ordinal.get(column) ?? 0) * (cardWidth + columnGap);

  /** Stack a column's cards near their desired tops without overlapping. */
  const placeColumn = (
    nodes: SchemaNode[],
    column: number,
    placed: (id: string) => boolean
  ) => {
    const definitionOrder = new Map(
      nodes.map((node, index) => [node.id, index])
    );
    const wanted = nodes.map((node) => ({
      node,
      top: desiredTop(node, placed),
    }));
    wanted.sort((a, b) => {
      if (a.top !== null && b.top !== null && a.top !== b.top) {
        return a.top - b.top;
      }
      if (a.top === null && b.top !== null) return 1;
      if (b.top === null && a.top !== null) return -1;
      return definitionOrder.get(a.node.id)! - definitionOrder.get(b.node.id)!;
    });
    let next = -Infinity;
    for (const { node, top } of wanted) {
      const y = Math.max(top ?? next, next === -Infinity ? margin : next);
      const heightValue = nodeHeight(node);
      boxes[node.id] = {
        x: columnX(column),
        y,
        width: cardWidth,
        height: heightValue,
        column,
      };
      next = y + heightValue + cardGap;
    }
  };

  // Left to right, each column aligns with the columns before it. Then the
  // first column, which had nothing to align with, aligns with the rest.
  const columnOfNode = (id: string) => boxes[id]?.column ?? -1;
  for (const { nodes, column } of populated) {
    placeColumn(nodes, column, (id) => columnOfNode(id) < column);
  }
  const first = populated[0];
  if (first && populated.length > 1) {
    placeColumn(
      first.nodes,
      first.column,
      (id) => columnOfNode(id) > first.column
    );
  }

  // Start the topmost card at the margin.
  const top = Math.min(...Object.values(boxes).map((box) => box.y));
  let height = 0;
  for (const box of Object.values(boxes)) {
    box.y += margin - top;
    height = Math.max(height, box.y + box.height + margin);
  }
  const x = margin + populated.length * (cardWidth + columnGap);

  return {
    boxes,
    width: Math.max(x - columnGap + margin, margin * 2),
    height: Math.max(height, margin * 2),
  };
}

export interface SchemaEdgePath {
  edge: SchemaEdge;
  d: string;
  /** The routed corners; an arc beside one card has just its two ends. */
  points: { x: number; y: number }[];
  /** Where each end meets its card, for cardinality marks. */
  start: { x: number; y: number; side: -1 | 1 };
  end: { x: number; y: number; side: -1 | 1 };
}

/**
 * Lines from row to row, routed together by Draftably's router so no line
 * runs through a card. Each end sits on its row (or the header's middle), on
 * the side that faces the other card; rows of cards in one column join on
 * the right. A line the router cannot place without crossing a card is
 * returned in `blocked` and drawn nowhere. A line between two rows of one
 * card stays an arc beside it.
 */
export function routeSchemaEdges(
  graph: SchemaGraph,
  layout: SchemaLayout,
  edges: SchemaEdge[]
): { paths: SchemaEdgePath[]; blocked: SchemaEdge[] } {
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const end = (endpoint: SchemaEndpoint) => {
    const box = layout.boxes[endpoint.nodeId];
    const offset = rowOffset(nodes.get(endpoint.nodeId), endpoint.rowId);
    return box && offset !== undefined ? { box, offset } : undefined;
  };
  const paths: SchemaEdgePath[] = [];
  const routed: { edge: SchemaEdge; input: EdgeIn }[] = [];
  for (const edge of edges) {
    const a = end(edge.from);
    const b = end(edge.to);
    if (!a || !b) continue;
    if (edge.from.nodeId === edge.to.nodeId) {
      const x = a.box.x + a.box.width;
      const [y1, y2] = [a.box.y + a.offset, b.box.y + b.offset];
      const reach = Math.min(
        SCHEMA_SIZES.columnGap * 0.4,
        18 + Math.abs(y2 - y1) * 0.25
      );
      paths.push({
        edge,
        d: `M ${x} ${y1} C ${x + reach} ${y1}, ${x + reach} ${y2}, ${x} ${y2}`,
        points: [
          { x, y: y1 },
          { x, y: y2 },
        ],
        start: { x, y: y1, side: 1 },
        end: { x, y: y2, side: 1 },
      });
      continue;
    }
    const sameColumn = a.box.column === b.box.column;
    const rightward = a.box.x < b.box.x;
    routed.push({
      edge,
      input: {
        id: edge.id,
        source: edge.from.nodeId,
        target: edge.to.nodeId,
        sourceSide: sameColumn || rightward ? "right" : "left",
        targetSide: sameColumn || !rightward ? "right" : "left",
        sourceAt: a.offset,
        targetAt: b.offset,
      },
    });
  }
  const blocked: SchemaEdge[] = [];
  if (!routed.length) return { paths, blocked };
  const out = route({
    nodes: Object.entries(layout.boxes).map(([id, box]) => ({
      id,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    })),
    edges: routed.map((item) => item.input),
    // A full pass costs about 0.5 s at 30 lines, so larger drawings route
    // quickly; both modes keep lines clear of cards.
    routing: {
      avoidNodes: "strict",
      quality: routed.length <= FULL_ROUTE_LIMIT ? "full" : "quick",
    },
  }).edges;
  for (const { edge } of routed) {
    const line = out[edge.id];
    if (!line || line.blocked || line.points.length < 2) {
      blocked.push(edge);
      continue;
    }
    const first = line.points[0]!;
    const last = line.points[line.points.length - 1]!;
    paths.push({
      edge,
      d: line.path,
      points: line.points,
      start: { ...first, side: line.sourceSide === "left" ? -1 : 1 },
      end: { ...last, side: line.targetSide === "left" ? -1 : 1 },
    });
  }
  return { paths, blocked };
}

/** A run of cards stacked in one column, with gaps between them. */
const stackHeight = (nodes: SchemaNode[]) =>
  nodes.reduce((sum, node) => sum + nodeHeight(node), 0) +
  Math.max(0, nodes.length - 1) * SCHEMA_SIZES.cardGap;

/** Cards in order, cut into `count` columns of about equal height. */
function split(nodes: SchemaNode[], count: number): SchemaNode[][] {
  const target = stackHeight(nodes) / count;
  const columns: SchemaNode[][] = [[]];
  for (const [index, node] of nodes.entries()) {
    const current = columns[columns.length - 1]!;
    const left = nodes.length - index;
    const columnsLeft = count - columns.length;
    if (
      current.length &&
      columnsLeft > 0 &&
      (stackHeight([...current, node]) > target || left <= columnsLeft)
    ) {
      columns.push([node]);
    } else {
      current.push(node);
    }
  }
  return columns;
}

/**
 * Columns that read at full size in the viewport. While the tallest layer is
 * taller than the viewport and one more column still fits its width, that
 * layer takes another column. What is still too tall scrolls down; nothing
 * runs off to the right. Tables are ordered by the first view that reads
 * them, so lines to views cross less.
 */
function spread(
  graph: SchemaGraph,
  layers: (SchemaNode[] | undefined)[],
  viewport: { width: number; height: number }
): SchemaNode[][] {
  const { cardWidth, columnGap, margin } = SCHEMA_SIZES;
  const viewOrder = new Map(
    graph.nodes
      .filter((node) => node.kind === "view")
      .map((node, index) => [node.id, index])
  );
  const firstReader = new Map<string, number>();
  for (const edge of graph.edges) {
    if (edge.kind !== "reads") continue;
    const index = viewOrder.get(edge.to.nodeId) ?? Infinity;
    firstReader.set(
      edge.from.nodeId,
      Math.min(firstReader.get(edge.from.nodeId) ?? Infinity, index)
    );
  }
  const ordered = layers
    .filter((layer): layer is SchemaNode[] => Boolean(layer?.length))
    .map((layer) =>
      layer.every((node) => node.kind === "table") && firstReader.size
        ? [...layer].sort(
            (a, b) =>
              (firstReader.get(a.id) ?? Infinity) -
              (firstReader.get(b.id) ?? Infinity)
          )
        : layer
    );
  if (!ordered.length) return [];
  const widthFor = (total: number) =>
    margin * 2 + total * cardWidth + (total - 1) * columnGap;
  // Too many layers for the width: the last ones share a column, read top to
  // bottom, so nothing runs off to the right.
  const budget = Math.max(
    1,
    Math.floor(
      (viewport.width - margin * 2 + columnGap) / (cardWidth + columnGap)
    )
  );
  while (ordered.length > budget) {
    const last = ordered.pop()!;
    ordered[ordered.length - 1] = [...ordered[ordered.length - 1]!, ...last];
  }
  const counts = ordered.map(() => 1);
  const room = viewport.height - margin * 2;
  for (;;) {
    const heights = ordered.map((layer, index) =>
      Math.max(...split(layer, counts[index]!).map(stackHeight))
    );
    const tallest = heights.indexOf(Math.max(...heights));
    const total = counts.reduce((sum, count) => sum + count, 0);
    if (
      heights[tallest]! <= room ||
      counts[tallest]! >= ordered[tallest]!.length ||
      widthFor(total + 1) > viewport.width
    ) {
      break;
    }
    const next = Math.max(
      ...split(ordered[tallest]!, counts[tallest]! + 1).map(stackHeight)
    );
    if (next >= heights[tallest]!) break;
    counts[tallest]! += 1;
  }
  return ordered.flatMap((layer, index) => split(layer, counts[index]!));
}

/**
 * A fixed layout that reads left to right: tables, then queries, then views,
 * then the tables no view reads. Given the viewport, a tall layer spreads over
 * more columns while they fit its width, so the diagram reads at full size;
 * what still does not fit scrolls down. The same graph and viewport always
 * give the same layout.
 */
export function layoutSchemaGraph(
  graph: SchemaGraph,
  viewport?: { width: number; height: number }
): SchemaLayout {
  return layeredLayout(
    graph,
    viewport?.width && viewport.height ? viewport : undefined
  );
}
