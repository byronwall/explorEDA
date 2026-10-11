import type { HierarchyNode } from "./hierarchyPlan";
import type { TreemapRect } from "./treemapLayout";

/** Levels drawn below `root`, counting only children that have a size. */
export function shownDepth(root: HierarchyNode): number {
  const below = root.shown
    .filter((child) => child.weight > 0)
    .map((child) => 1 + shownDepth(child));
  return below.length ? Math.max(...below) : 0;
}

/**
 * Splits [start, end) among a node's drawn children by their share, calling
 * `place` with each child's span and recursing one band deeper.
 */
function partition(
  node: HierarchyNode,
  start: number,
  end: number,
  band: number,
  place: (node: HierarchyNode, start: number, end: number, band: number) => void
) {
  const children = node.shown.filter((child) => child.weight > 0);
  const total = children.reduce((sum, child) => sum + child.weight, 0);
  if (!total) return;
  let at = start;
  for (const child of children) {
    const next = at + ((end - start) * child.weight) / total;
    place(child, at, next, band);
    partition(child, at, next, band + 1, place);
    at = next;
  }
}

/**
 * Icicle: one column per level, left to right, each node as tall as its
 * share of the root. Parents come before their children.
 */
export function layoutIcicle(
  root: HierarchyNode,
  { width, height }: { width: number; height: number }
): TreemapRect[] {
  const depth = shownDepth(root);
  if (!depth || width <= 0 || height <= 0) return [];
  const column = width / depth;
  const rects: TreemapRect[] = [];
  partition(root, 0, height, 0, (node, y0, y1, band) =>
    rects.push({
      node,
      x0: band * column,
      x1: (band + 1) * column,
      y0,
      y1,
      header: 0,
    })
  );
  return rects;
}
