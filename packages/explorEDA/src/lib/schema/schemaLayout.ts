import type {
  SchemaEdge,
  SchemaEndpoint,
  SchemaGraph,
  SchemaNode,
} from "./schemaGraph";

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
};

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
function layeredLayout(graph: SchemaGraph): SchemaLayout {
  const { cardWidth, columnGap, cardGap, margin } = SCHEMA_SIZES;
  const tables = graph.nodes.filter((node) => node.kind === "table");
  const tableColumn = tableColumns(graph, tables);
  const tableColumnCount = Math.max(0, ...tableColumn.values()) + 1;

  const columnOf = new Map<string, number>();
  for (const node of graph.nodes) {
    columnOf.set(
      node.id,
      node.kind === "table"
        ? (tableColumn.get(node.id) ?? 0)
        : tableColumnCount + KIND_ORDER[node.kind] - 1
    );
  }
  const columns: SchemaNode[][] = [];
  graph.nodes.forEach((node) => {
    const index = columnOf.get(node.id)!;
    (columns[index] ??= []).push(node);
  });

  const boxes: Record<string, SchemaBox> = {};
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const rowOffset = (endpoint: SchemaEndpoint) => {
    const node = nodesById.get(endpoint.nodeId);
    const index =
      node?.rows.findIndex((row) => row.id === endpoint.rowId) ?? -1;
    return SCHEMA_SIZES.header + (Math.max(0, index) + 0.5) * SCHEMA_SIZES.row;
  };

  /**
   * Where a card's top would put each of its linked rows level with the row
   * it joins, averaged over the placed cards it links to.
   */
  const desiredTop = (node: SchemaNode, placed: (id: string) => boolean) => {
    const tops: number[] = [];
    for (const edge of graph.edges) {
      const [own, other] =
        edge.from.nodeId === node.id
          ? [edge.from, edge.to]
          : edge.to.nodeId === node.id
            ? [edge.to, edge.from]
            : [undefined, undefined];
      if (!own || !other || other.nodeId === node.id) continue;
      const box = boxes[other.nodeId];
      if (!box || !placed(other.nodeId)) continue;
      tops.push(box.y + rowOffset(other) - rowOffset(own));
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
  /** Where each end meets its card, for cardinality marks. */
  start: { x: number; y: number; side: -1 | 1 };
  end: { x: number; y: number; side: -1 | 1 };
}

/**
 * A smooth line from row to row. Lines leave a card on the side that faces
 * the other card. Rows of one card, or of cards in one column, join on the
 * right with an arc that clears the cards.
 */
export function routeSchemaEdge(
  graph: SchemaGraph,
  layout: SchemaLayout,
  edge: SchemaEdge
): SchemaEdgePath | undefined {
  const point = (endpoint: SchemaEndpoint) => {
    const box = layout.boxes[endpoint.nodeId];
    const node = graph.nodes.find((item) => item.id === endpoint.nodeId);
    const index = node?.rows.findIndex((row) => row.id === endpoint.rowId);
    if (!box || index === undefined || index < 0) return undefined;
    return {
      box,
      y: box.y + SCHEMA_SIZES.header + (index + 0.5) * SCHEMA_SIZES.row,
    };
  };
  const a = point(edge.from);
  const b = point(edge.to);
  if (!a || !b) return undefined;

  if (a.box.column === b.box.column) {
    const x = a.box.x + a.box.width;
    const reach = Math.min(
      SCHEMA_SIZES.columnGap * 0.45,
      18 + Math.abs(b.y - a.y) * 0.25
    );
    return {
      edge,
      d: `M ${x} ${a.y} C ${x + reach} ${a.y}, ${x + reach} ${b.y}, ${x} ${b.y}`,
      start: { x, y: a.y, side: 1 },
      end: { x, y: b.y, side: 1 },
    };
  }
  const rightward = a.box.column < b.box.column;
  const x1 = rightward ? a.box.x + a.box.width : a.box.x;
  const x2 = rightward ? b.box.x : b.box.x + b.box.width;
  const start = { x: x1, y: a.y, side: (rightward ? 1 : -1) as 1 | -1 };
  const end = { x: x2, y: b.y, side: (rightward ? -1 : 1) as 1 | -1 };

  // A line that skips a column runs in a lane above or below the cards it
  // passes, so it never seems to end at a row it only crosses.
  const [low, high] = [
    Math.min(a.box.column, b.box.column),
    Math.max(a.box.column, b.box.column),
  ];
  const between = Object.values(layout.boxes).filter(
    (box) => box.column > low && box.column < high
  );
  if (between.length) {
    const clearance = SCHEMA_SIZES.cardGap / 2;
    const above = Math.min(...between.map((box) => box.y)) - clearance;
    const below =
      Math.max(...between.map((box) => box.y + box.height)) + clearance;
    const lane =
      Math.abs(above - a.y) + Math.abs(above - b.y) <=
      Math.abs(below - a.y) + Math.abs(below - b.y)
        ? above
        : below;
    const gap = SCHEMA_SIZES.columnGap / 2;
    const out = x1 + (rightward ? gap : -gap);
    const into = x2 + (rightward ? -gap : gap);
    return {
      edge,
      d: roundedPath([
        [x1, a.y],
        [out, a.y],
        [out, lane],
        [into, lane],
        [into, b.y],
        [x2, b.y],
      ]),
      start,
      end,
    };
  }
  const bend = Math.max(40, Math.abs(x2 - x1) * 0.45);
  const c1 = rightward ? x1 + bend : x1 - bend;
  const c2 = rightward ? x2 - bend : x2 + bend;
  return {
    edge,
    d: `M ${x1} ${a.y} C ${c1} ${a.y}, ${c2} ${b.y}, ${x2} ${b.y}`,
    start,
    end,
  };
}

/** A polyline with its corners rounded, as an SVG path. */
function roundedPath(points: [number, number][], radius = 10) {
  let d = `M ${points[0]![0]} ${points[0]![1]}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const [px, py] = points[index - 1]!;
    const [x, y] = points[index]!;
    const [nx, ny] = points[index + 1]!;
    const inLength = Math.hypot(x - px, y - py);
    const outLength = Math.hypot(nx - x, ny - y);
    const r = Math.min(radius, inLength / 2, outLength / 2);
    if (!r) {
      d += ` L ${x} ${y}`;
      continue;
    }
    const ax = x - ((x - px) / inLength) * r;
    const ay = y - ((y - py) / inLength) * r;
    const bx = x + ((nx - x) / outLength) * r;
    const by = y + ((ny - y) / outLength) * r;
    d += ` L ${ax} ${ay} Q ${x} ${y} ${bx} ${by}`;
  }
  const [lx, ly] = points[points.length - 1]!;
  return `${d} L ${lx} ${ly}`;
}

/**
 * The layered order, poured into columns no taller than `maxHeight`: cards
 * read top to bottom, then on to the next column, so a tall layer wraps
 * instead of leaving the rest of the screen empty.
 */
function flowLayout(order: SchemaNode[], maxHeight: number): SchemaLayout {
  const { cardWidth, columnGap, cardGap, margin } = SCHEMA_SIZES;
  const boxes: Record<string, SchemaBox> = {};
  let column = 0;
  let y = margin;
  let height = 0;
  for (const node of order) {
    const nodeHeightValue = nodeHeight(node);
    if (y > margin && y + nodeHeightValue > margin + maxHeight) {
      column += 1;
      y = margin;
    }
    boxes[node.id] = {
      x: margin + column * (cardWidth + columnGap),
      y,
      width: cardWidth,
      height: nodeHeightValue,
      column,
    };
    y += nodeHeightValue + cardGap;
    height = Math.max(height, y - cardGap + margin);
  }
  return {
    boxes,
    width: margin * 2 + (column + 1) * cardWidth + column * columnGap,
    height: Math.max(height, margin * 2),
  };
}

/** How large the diagram can draw while all of it fits the viewport. */
export function fitScale(
  layout: { width: number; height: number },
  viewport: { width: number; height: number }
) {
  return Math.min(
    1,
    viewport.width / layout.width,
    viewport.height / layout.height
  );
}

/**
 * A fixed layout that reads left to right and top to bottom. Given the
 * viewport, it picks the arrangement that shows the whole diagram largest,
 * so it reads without zooming or panning: one column per depth when that
 * fits, otherwise the same order wrapped into columns that match the
 * viewport's shape. The same graph and viewport always give the same layout.
 */
export function layoutSchemaGraph(
  graph: SchemaGraph,
  viewport?: { width: number; height: number }
): SchemaLayout {
  const layered = layeredLayout(graph);
  if (!viewport?.width || !viewport.height || graph.nodes.length < 2) {
    return layered;
  }
  const order = [...graph.nodes].sort((a, b) => {
    const boxA = layered.boxes[a.id]!;
    const boxB = layered.boxes[b.id]!;
    return boxA.column - boxB.column || boxA.y - boxB.y;
  });

  // Every column height worth trying ends a column after some run of cards.
  const heights = new Set<number>();
  for (let start = 0; start < order.length; start += 1) {
    let total = -SCHEMA_SIZES.cardGap;
    for (let end = start; end < order.length; end += 1) {
      total += nodeHeight(order[end]!) + SCHEMA_SIZES.cardGap;
      heights.add(total);
    }
  }

  // Draw largest; between equal sizes, fill the viewport's shape. A layered
  // layout keeps depths in their own columns, which reads best, so it wins
  // unless wrapping draws noticeably larger.
  const shapeMiss = (layout: SchemaLayout) =>
    Math.abs(
      Math.log(
        layout.width / layout.height / (viewport.width / viewport.height)
      )
    );
  let best = layered;
  let bestScale = fitScale(layered, viewport) * 1.08;
  let bestMiss = shapeMiss(layered);
  for (const maxHeight of [...heights].sort((a, b) => a - b)) {
    const candidate = flowLayout(order, maxHeight);
    const scale = fitScale(candidate, viewport);
    const miss = shapeMiss(candidate);
    if (
      scale > bestScale + 0.005 ||
      (best !== layered && scale > bestScale - 0.005 && miss < bestMiss)
    ) {
      best = candidate;
      bestScale = scale;
      bestMiss = miss;
    }
  }
  return best;
}
