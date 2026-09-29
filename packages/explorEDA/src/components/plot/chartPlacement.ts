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
