import type { ChartLayout } from "@/types/ChartTypes";

export const DEFAULT_CHART_SIZE = { w: 6, h: 4 };
const MIN_CHART_SIZE = { w: 3, h: 3 };

export interface GridCell {
  x: number;
  y: number;
}

function overlaps(a: ChartLayout, b: ChartLayout) {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

export function isCellOccupied(cell: GridCell, occupied: ChartLayout[]) {
  return occupied.some((layout) =>
    overlaps(layout, { x: cell.x, y: cell.y, w: 1, h: 1 })
  );
}

/**
 * Finds a rectangle that covers `cell` without overlapping any occupied chart.
 * Prefers the default chart size, slid as far up and then left as it can go
 * while still covering the cell, so it sits flush with the free region's
 * edge. Tries smaller sizes when the default does not fit. Returns null when
 * no rectangle of at least the minimum size fits.
 */
export function findEmptyPlacement(
  cell: GridCell,
  occupied: ChartLayout[],
  columnCount: number
): ChartLayout | null {
  if (
    cell.x < 0 ||
    cell.y < 0 ||
    cell.x >= columnCount ||
    isCellOccupied(cell, occupied)
  ) {
    return null;
  }

  const sizes: { w: number; h: number }[] = [];
  for (let w = DEFAULT_CHART_SIZE.w; w >= MIN_CHART_SIZE.w; w--) {
    for (let h = DEFAULT_CHART_SIZE.h; h >= MIN_CHART_SIZE.h; h--) {
      if (w <= columnCount) sizes.push({ w, h });
    }
  }
  sizes.sort((a, b) => b.w * b.h - a.w * a.h || b.w - a.w);

  for (const { w, h } of sizes) {
    for (let y = Math.max(0, cell.y - h + 1); y <= cell.y; y++) {
      for (
        let x = Math.max(0, cell.x - w + 1);
        x <= Math.min(cell.x, columnCount - w);
        x++
      ) {
        const candidate = { x, y, w, h };
        if (!occupied.some((layout) => overlaps(layout, candidate))) {
          return candidate;
        }
      }
    }
  }

  return null;
}

/**
 * Returns the largest size a chart may reach while one handle is dragged, so
 * a top or left resize stops at the nearest chart instead of pushing it.
 * Right and bottom edges may push neighboring charts down.
 */
export function resizeLimits(
  item: ChartLayout,
  axis: string,
  others: ChartLayout[]
): { maxW?: number; maxH?: number } {
  const inRows = others.filter(
    (other) => other.y < item.y + item.h && item.y < other.y + other.h
  );
  const inColumns = others.filter(
    (other) => other.x < item.x + item.w && item.x < other.x + other.w
  );
  const limits: { maxW?: number; maxH?: number } = {};

  if (axis.includes("w")) {
    const edge = Math.max(
      0,
      ...inRows
        .filter((other) => other.x + other.w <= item.x)
        .map((other) => other.x + other.w)
    );
    limits.maxW = item.x + item.w - edge;
  }

  if (axis.includes("n")) {
    const edge = Math.max(
      0,
      ...inColumns
        .filter((other) => other.y + other.h <= item.y)
        .map((other) => other.y + other.h)
    );
    limits.maxH = item.y + item.h - edge;
  }

  return limits;
}

/** Below this width the grid shows a view-only flow of the saved layout. */
export const NARROW_GRID_WIDTH = 960;

/**
 * Between phone and desktop widths, charts flow two to a row instead of
 * stacking one per row, so small cards don't stretch across the screen.
 */
export function narrowColumnCount(containerWidth: number) {
  return containerWidth >= 640 ? 2 : 1;
}

/**
 * Places charts two to a row in their saved reading order. A chart wider
 * than half the saved grid takes the whole row; the others fill the shorter
 * column, so cards of equal height pair up side by side.
 */
export function flowTwoColumns(
  charts: {
    id: string;
    layout: { x: number; y: number; h: number; w: number };
  }[],
  columnCount: number
) {
  const placed = new Map<string, { x: number; y: number; w: number }>();
  const heights = [0, 0];
  const ordered = [...charts].sort(
    (a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x
  );
  for (const chart of ordered) {
    if (chart.layout.w > columnCount / 2) {
      const y = Math.max(heights[0]!, heights[1]!);
      placed.set(chart.id, { x: 0, y, w: 2 });
      heights[0] = heights[1] = y + chart.layout.h;
    } else {
      const x = heights[1]! < heights[0]! ? 1 : 0;
      placed.set(chart.id, { x, y: heights[x]!, w: 1 });
      heights[x] = heights[x]! + chart.layout.h;
    }
  }
  return placed;
}
