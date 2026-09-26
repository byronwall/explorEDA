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
 * Prefers the default chart size with its top-left corner at the cell, then
 * slides the rectangle up and left, then tries smaller sizes. Returns null
 * when no rectangle of at least the minimum size fits.
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
    let best: ChartLayout | null = null;
    let bestDistance = Infinity;
    for (let y = Math.max(0, cell.y - h + 1); y <= cell.y; y++) {
      for (
        let x = Math.max(0, cell.x - w + 1);
        x <= Math.min(cell.x, columnCount - w);
        x++
      ) {
        const candidate = { x, y, w, h };
        const distance = cell.x - x + (cell.y - y);
        if (
          distance < bestDistance &&
          !occupied.some((layout) => overlaps(layout, candidate))
        ) {
          best = candidate;
          bestDistance = distance;
        }
      }
    }
    if (best) return best;
  }

  return null;
}
