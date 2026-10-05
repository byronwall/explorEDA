import type { ChartLayout } from "@/types/ChartTypes";

function overlaps(a: ChartLayout, b: ChartLayout) {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

export function overlapsAny(layout: ChartLayout, occupied: ChartLayout[]) {
  return occupied.some((other) => overlaps(layout, other));
}

/** The first free spot for a chart of this size, reading left to right. */
export function firstFreeSpot(
  size: { w: number; h: number },
  occupied: ChartLayout[],
  columnCount: number
): ChartLayout {
  const w = Math.min(size.w, columnCount);
  const bottom = Math.max(0, ...occupied.map((item) => item.y + item.h));
  for (let y = 0; y <= bottom; y++) {
    for (let x = 0; x + w <= columnCount; x++) {
      const candidate = { x, y, w, h: size.h };
      if (!overlapsAny(candidate, occupied)) return candidate;
    }
  }
  return { x: 0, y: bottom, w, h: size.h };
}

/**
 * The first free spot that fits inside the visible rows, so a new chart
 * starts where the user is looking. When none fits, it takes the top visible
 * row and the charts in its way move down.
 */
export function firstFreeSpotInView(
  size: { w: number; h: number },
  occupied: ChartLayout[],
  columnCount: number,
  view: { top: number; bottom: number }
): ChartLayout {
  const w = Math.min(size.w, columnCount);
  const top = Math.max(0, view.top);
  const lastY = Math.max(top, view.bottom - size.h);
  for (let y = top; y <= lastY; y++) {
    for (let x = 0; x + w <= columnCount; x++) {
      const candidate = { x, y, w, h: size.h };
      if (!overlapsAny(candidate, occupied)) return candidate;
    }
  }
  // Take the first chart edge in view, so the charts that move down are
  // whole rows rather than a chart cut by the top of the window.
  const edges = occupied
    .flatMap((item) => [item.y, item.y + item.h])
    .filter((y) => y >= top && y <= view.bottom)
    .sort((a, b) => a - b);
  return { x: 0, y: edges[0] ?? top, w, h: size.h };
}

/** Keeps a layout inside the grid's columns and below its top edge. */
export function clampLayout(layout: ChartLayout, columnCount: number) {
  const w = Math.min(layout.w, columnCount);
  return {
    ...layout,
    w,
    x: Math.min(Math.max(0, layout.x), columnCount - w),
    y: Math.max(0, layout.y),
  };
}

/**
 * Proposes new positions for the charts a placement would cover. Each one
 * moves straight down past whatever it now overlaps, and charts below it
 * follow. Charts that are clear of the new chart stay where they are.
 */
export function shiftForPlacement(
  spot: ChartLayout,
  charts: { id: string; layout: ChartLayout }[]
): Record<string, ChartLayout> {
  const placed = [spot];
  const moves: Record<string, ChartLayout> = {};
  const ordered = [...charts].sort(
    (a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x
  );
  for (const { id, layout } of ordered) {
    let next = layout;
    for (
      let blocker = placed.find((other) => overlaps(next, other));
      blocker;
      blocker = placed.find((other) => overlaps(next, other))
    ) {
      next = { ...next, y: blocker.y + blocker.h };
    }
    if (next.y !== layout.y) moves[id] = next;
    placed.push(next);
  }
  return moves;
}
