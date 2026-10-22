import { categoryKey, categoryValue } from "@/lib/categories";
import { finiteNumber } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";

export interface ObservationPoint {
  x: number;
  /** Null breaks the line: the row has no x or no value. */
  y: number | null;
}

export interface ObservationSeries {
  /** Unique per drawn line: the field, plus the group's key when split. */
  name: string;
  field: string;
  /** The color field's value this line draws, when the chart splits. */
  group?: datum;
  data: ObservationPoint[];
}

/**
 * The lines a row-drawing line chart draws: one per y field, or, with a
 * split field, one per y field and split value. Each line takes its rows in
 * x order, rows without an x last, so a numeric x such as a year draws as a
 * path per category without any bucketing. `reduce` thins a run of points.
 */
export function planObservationSeries({
  fields,
  xs,
  ys,
  groups,
  reduce = (points) => points,
}: {
  fields: string[];
  /** Each row's x as a number; undefined when it has none. */
  xs: (number | undefined)[];
  ys: Record<string, datum[]>;
  /** Each row's split value; absent draws one line per field. */
  groups?: datum[];
  reduce?: (points: { x: number; y: number }[]) => ObservationPoint[];
}): ObservationSeries[] {
  const ordered = xs
    .map((_, index) => index)
    .sort((a, b) => {
      const aX = xs[a];
      const bX = xs[b];
      if ((aX === undefined) !== (bX === undefined))
        return aX === undefined ? 1 : -1;
      return aX === undefined || bX === undefined ? a - b : aX - bX || a - b;
    });

  // Split values in the order their first row appears along x.
  const runs = new Map<string, { group?: datum; rows: number[] }>();
  if (groups) {
    for (const index of ordered) {
      const group = categoryValue(groups[index]);
      const key = categoryKey(group);
      const run = runs.get(key);
      if (run) run.rows.push(index);
      else runs.set(key, { group, rows: [index] });
    }
  } else {
    runs.set("", { rows: ordered });
  }

  return fields.flatMap((field) => {
    const values = ys[field] ?? [];
    return [...runs].map(([key, run]): ObservationSeries => {
      const data: ObservationPoint[] = [];
      let segment: { x: number; y: number }[] = [];
      const flush = () => {
        if (segment.length) data.push(...reduce(segment));
        segment = [];
      };
      for (const index of run.rows) {
        const x = xs[index];
        const y = finiteNumber(values[index]);
        if (x === undefined || y === undefined) {
          flush();
          data.push({ x: x ?? NaN, y: null });
          continue;
        }
        segment.push({ x, y });
      }
      flush();
      return groups
        ? { name: `${field}\u0000${key}`, field, group: run.group, data }
        : { name: field, field, data };
    });
  });
}
