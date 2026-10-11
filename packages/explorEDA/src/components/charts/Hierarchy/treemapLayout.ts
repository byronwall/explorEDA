import type { HierarchyNode } from "./hierarchyPlan";

export interface TreemapRect {
  node: HierarchyNode;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Height of the label strip a parent keeps above its children; 0 when none. */
  header: number;
}

export interface TreemapOptions {
  width: number;
  height: number;
  /** Strip above each parent's children for its label. */
  headerHeight?: number;
  /** Space between a parent's edge and its children. */
  padding?: number;
}

/** Golden ratio: the aspect squarified rows aim for. */
const PHI = (1 + Math.sqrt(5)) / 2;

interface Item {
  node: HierarchyNode;
  value: number;
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Lays items side by side across a box, each as wide as its share. */
function slice(items: Item[], total: number, box: Box, out: Map<Item, Box>) {
  const k = total > 0 ? (box.x1 - box.x0) / total : 0;
  let x = box.x0;
  for (const item of items) {
    const next = x + item.value * k;
    out.set(item, { x0: x, y0: box.y0, x1: next, y1: box.y1 });
    x = next;
  }
}

/** Stacks items down a box, each as tall as its share. */
function dice(items: Item[], total: number, box: Box, out: Map<Item, Box>) {
  const k = total > 0 ? (box.y1 - box.y0) / total : 0;
  let y = box.y0;
  for (const item of items) {
    const next = y + item.value * k;
    out.set(item, { x0: box.x0, y0: y, x1: box.x1, y1: next });
    y = next;
  }
}

/**
 * Squarified treemap (Bruls, Huizing, and van Wijk): fills the box in rows,
 * adding items to a row while that keeps its rectangles closer to square.
 * Items must be sorted largest first.
 */
export function squarify(items: Item[], box: Box): Map<Item, Box> {
  const out = new Map<Item, Box>();
  let value = items.reduce((total, item) => total + item.value, 0);
  let { x0, y0 } = box;
  const { x1, y1 } = box;
  let i0 = 0;
  let i1 = 0;
  const n = items.length;
  while (i0 < n) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    // Skip to the next item with a size.
    let sumValue = 0;
    do {
      sumValue = items[i1++]!.value;
    } while (!sumValue && i1 < n);
    let minValue = sumValue;
    let maxValue = sumValue;
    const alpha = Math.max(dy / dx, dx / dy) / (value * PHI);
    let beta = sumValue * sumValue * alpha;
    let minRatio = Math.max(maxValue / beta, beta / minValue);
    for (; i1 < n; i1 += 1) {
      const nodeValue = items[i1]!.value;
      sumValue += nodeValue;
      minValue = Math.min(minValue, nodeValue);
      maxValue = Math.max(maxValue, nodeValue);
      beta = sumValue * sumValue * alpha;
      const ratio = Math.max(maxValue / beta, beta / minValue);
      if (ratio > minRatio) {
        sumValue -= nodeValue;
        break;
      }
      minRatio = ratio;
    }
    const row = items.slice(i0, i1);
    if (dx < dy) {
      // A row across the top of a tall box.
      const y = value ? y0 + (dy * sumValue) / value : y1;
      slice(row, sumValue, { x0, y0, x1, y1: y }, out);
      y0 = y;
    } else {
      // A column down the left of a wide box.
      const x = value ? x0 + (dx * sumValue) / value : x1;
      dice(row, sumValue, { x0, y0, x1: x, y1 }, out);
      x0 = x;
    }
    value -= sumValue;
    i0 = i1;
  }
  return out;
}

/**
 * Nested rectangles for every node below the whole, parents before their
 * children. A parent keeps a label strip when it has room for one.
 */
export function layoutTreemap(
  root: HierarchyNode,
  { width, height, headerHeight = 18, padding = 2 }: TreemapOptions
): TreemapRect[] {
  const rects: TreemapRect[] = [];
  const place = (node: HierarchyNode, box: Box) => {
    const items = node.shown
      .filter((child) => child.weight > 0)
      .map((child) => ({ node: child, value: child.weight }));
    if (!items.length || box.x1 - box.x0 <= 0 || box.y1 - box.y0 <= 0) {
      return;
    }
    for (const [item, rect] of squarify(items, box)) {
      const hasChildren = item.node.shown.some((child) => child.weight > 0);
      const w = rect.x1 - rect.x0;
      const h = rect.y1 - rect.y0;
      // A strip only when the children keep at least as much room as it takes.
      const header =
        hasChildren && h >= headerHeight * 2 && w >= 24 ? headerHeight : 0;
      rects.push({ node: item.node, ...rect, header });
      if (hasChildren) {
        const inset = Math.min(padding, w / 4, h / 4);
        place(item.node, {
          x0: rect.x0 + inset,
          y0: rect.y0 + (header || inset),
          x1: rect.x1 - inset,
          y1: rect.y1 - inset,
        });
      }
    }
  };
  place(root, { x0: 0, y0: 0, x1: width, y1: height });
  return rects;
}
