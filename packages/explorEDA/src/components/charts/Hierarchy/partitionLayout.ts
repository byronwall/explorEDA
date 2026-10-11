import type { HierarchyNode } from "./hierarchyPlan";
import type { TreemapRect } from "./treemapLayout";

export interface ArcRect {
  node: HierarchyNode;
  /** Angles in radians, clockwise from 12 o'clock. */
  a0: number;
  a1: number;
  /** Radii in pixels from the center. */
  r0: number;
  r1: number;
}

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

/**
 * Sunburst: one ring per level around an empty center, each node as wide an
 * arc as its share of the root.
 */
export function layoutSunburst(
  root: HierarchyNode,
  { radius, hole }: { radius: number; hole: number }
): ArcRect[] {
  const depth = shownDepth(root);
  if (!depth || radius <= hole) return [];
  const ring = (radius - hole) / depth;
  const arcs: ArcRect[] = [];
  partition(root, 0, Math.PI * 2, 0, (node, a0, a1, band) =>
    arcs.push({
      node,
      a0,
      a1,
      r0: hole + band * ring,
      r1: hole + (band + 1) * ring,
    })
  );
  return arcs;
}

/** SVG path for an annular sector, angles clockwise from 12 o'clock. */
export function arcPath({ a0, a1, r0, r1 }: ArcRect): string {
  const full = a1 - a0 >= Math.PI * 2 - 1e-9;
  const point = (r: number, a: number) =>
    `${(r * Math.sin(a)).toFixed(2)},${(-r * Math.cos(a)).toFixed(2)}`;
  if (full) {
    // Two half arcs; one arc cannot start and end at the same point.
    const mid = a0 + Math.PI;
    return [
      `M${point(r1, a0)}`,
      `A${r1},${r1} 0 1 1 ${point(r1, mid)}`,
      `A${r1},${r1} 0 1 1 ${point(r1, a0)}`,
      r0 > 0
        ? `M${point(r0, a0)}A${r0},${r0} 0 1 0 ${point(r0, mid)}A${r0},${r0} 0 1 0 ${point(r0, a0)}`
        : "",
      "Z",
    ].join("");
  }
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M${point(r1, a0)}`,
    `A${r1},${r1} 0 ${large} 1 ${point(r1, a1)}`,
    `L${point(r0, a1)}`,
    r0 > 0 ? `A${r0},${r0} 0 ${large} 0 ${point(r0, a0)}` : "",
    "Z",
  ].join("");
}
