import type { Anchor, Box } from "@/lib/annotations/labelLayout";

export const POINT_LABEL_SIZE = 10;
/** Past this many points, labels would only cover one another. */
export const POINT_LABEL_LIMIT = 500;

export interface PointLabel {
  id: string;
  x: number;
  y: number;
  anchor: Anchor;
  text: string;
}

const overlaps = (a: Box, b: Box) =>
  a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/**
 * Places one label beside each point: right, left, above, or below, in that
 * order. A label that would cover another label or point, or leave the plot,
 * is left out, so a crowded chart labels the points it can.
 */
export function placePointLabels(
  points: readonly {
    id: string;
    x: number;
    y: number;
    r: number;
    text: string;
  }[],
  measure: (text: string) => number,
  plotWidth: number,
  plotHeight: number
): PointLabel[] {
  if (points.length > POINT_LABEL_LIMIT) return [];
  const marks = points.map((point) => ({
    x0: point.x - point.r,
    y0: point.y - point.r,
    x1: point.x + point.r,
    y1: point.y + point.r,
  }));
  const placed: Box[] = [];
  const labels: PointLabel[] = [];
  const ascent = POINT_LABEL_SIZE * 0.8;
  const descent = POINT_LABEL_SIZE * 0.25;
  points.forEach((point, index) => {
    if (!point.text) return;
    const width = measure(point.text);
    const gap = point.r + 3;
    const candidates: { x: number; y: number; anchor: Anchor }[] = [
      { x: point.x + gap, y: point.y + ascent / 2, anchor: "start" },
      { x: point.x - gap, y: point.y + ascent / 2, anchor: "end" },
      { x: point.x, y: point.y - gap - descent, anchor: "middle" },
      { x: point.x, y: point.y + gap + ascent, anchor: "middle" },
    ];
    for (const place of candidates) {
      const x0 =
        place.anchor === "start"
          ? place.x
          : place.anchor === "end"
            ? place.x - width
            : place.x - width / 2;
      const box = {
        x0,
        y0: place.y - ascent,
        x1: x0 + width,
        y1: place.y + descent,
      };
      if (box.x0 < 0 || box.y0 < 0 || box.x1 > plotWidth || box.y1 > plotHeight)
        continue;
      if (placed.some((other) => overlaps(box, other))) continue;
      if (marks.some((mark, other) => other !== index && overlaps(box, mark)))
        continue;
      placed.push(box);
      labels.push({ id: point.id, ...place, text: point.text });
      return;
    }
  });
  return labels;
}
