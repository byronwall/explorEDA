import type { ChartLayout } from "@/types/ChartTypes";

function overlaps(a: ChartLayout, b: ChartLayout) {
  return (
    a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
  );
}

/**
 * Moves each chart up as far as it can go without overlapping a chart above
 * it, closing the gaps a deleted or moved chart leaves. Charts keep their
 * columns, sizes and top-to-bottom order.
 */
export function compactChartLayouts<T extends { layout: ChartLayout }>(
  items: T[]
): T[] {
  const order = items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        a.item.layout.y - b.item.layout.y || a.item.layout.x - b.item.layout.x
    );
  const placed: ChartLayout[] = [];
  const result = [...items];

  for (const { item, index } of order) {
    const layout = { ...item.layout };
    while (
      layout.y > 0 &&
      !placed.some((other) => overlaps(other, { ...layout, y: layout.y - 1 }))
    ) {
      layout.y -= 1;
    }
    placed.push(layout);
    result[index] = layout.y === item.layout.y ? item : { ...item, layout };
  }

  return result;
}
