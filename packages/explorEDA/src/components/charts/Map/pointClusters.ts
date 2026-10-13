import type { MapPoint } from "./pointMapPlan";

/** Above this many drawn points, nearby points group into counted circles. */
export const CLUSTER_THRESHOLD = 2000;
/** Screen size of a grouping cell; zooming in splits groups apart. */
const CELL = 36;

export interface MapCluster {
  id: string;
  x: number;
  y: number;
  radius: number;
  /** Source rows in the group, in source order. */
  sourceIds: number[];
  /** The most common point color, so groups keep the color encoding. */
  color: string;
  label: string;
  matching: boolean;
}

/**
 * Groups drawn points by screen cell. A cell with one point keeps it as a
 * point; a cell with several becomes one circle sized by its count.
 */
export function clusterPoints(points: MapPoint[]) {
  const cells = new Map<string, MapPoint[]>();
  for (const point of points) {
    const key = `${Math.floor(point.x! / CELL)}:${Math.floor(point.y! / CELL)}`;
    const cell = cells.get(key);
    if (cell) cell.push(point);
    else cells.set(key, [point]);
  }
  const singles: MapPoint[] = [];
  let groups: { id: string; points: MapPoint[] }[] = [];
  for (const [id, cell] of cells)
    if (cell.length === 1) singles.push(cell[0]!);
    else groups.push({ id, points: cell });
  const center = (group: MapPoint[]) => [
    group.reduce((sum, point) => sum + point.x!, 0) / group.length,
    group.reduce((sum, point) => sum + point.y!, 0) / group.length,
  ];
  const radius = (count: number, largest: number) =>
    7 + 11 * Math.sqrt(count / largest);
  // Groups near cell edges can overlap their neighbors; merge until none do.
  for (let pass = 0; pass < 4; pass++) {
    const largest = Math.max(1, ...groups.map((group) => group.points.length));
    groups.sort((a, b) => b.points.length - a.points.length);
    const merged: typeof groups = [];
    let changed = false;
    for (const group of groups) {
      const [x, y] = center(group.points);
      const host = merged.find((other) => {
        const [ox, oy] = center(other.points);
        return (
          Math.hypot(x! - ox!, y! - oy!) <
          radius(group.points.length, largest) +
            radius(other.points.length, largest)
        );
      });
      if (host) {
        host.points.push(...group.points);
        changed = true;
      } else merged.push({ id: group.id, points: [...group.points] });
    }
    groups = merged;
    if (!changed) break;
  }
  const largest = Math.max(1, ...groups.map((group) => group.points.length));
  const clusters = groups.map(({ id, points: cell }): MapCluster => {
    const colors = new Map<string, number>();
    for (const point of cell)
      colors.set(point.color, (colors.get(point.color) ?? 0) + 1);
    const sourceIds = cell.map((point) => point.sourceId).sort((a, b) => a - b);
    const [x, y] = center(cell);
    return {
      id,
      x: x!,
      y: y!,
      radius: radius(cell.length, largest),
      sourceIds,
      color: [...colors].sort((a, b) => b[1] - a[1])[0]![0],
      label: cell.find((point) => point.sourceId === sourceIds[0])!.label,
      matching: cell.some((point) => point.matching),
    };
  });
  return { singles, clusters };
}
