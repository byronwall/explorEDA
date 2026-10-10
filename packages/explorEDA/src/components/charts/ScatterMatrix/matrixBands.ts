import { scaleBand } from "d3-scale";
import {
  categoryIncludes,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import {
  BAND_PADDING,
  type ScatterAxisScale,
} from "../ScatterPlot/scatterAxis";

/** The label the workspace uses for categories folded together. */
export const OTHER_LABEL = "Other categories";

/** The bands of one category field, and the source values each one holds. */
export interface MatrixBands {
  labels: string[];
  /** Source values in each band. Other holds every value it folds. */
  values: datum[][];
  /** Band index by category label. */
  lookup: Map<string, number>;
  /** Index of the Other band, or -1 when every value has its own band. */
  other: number;
}

export type BandAxis = Extract<ScatterAxisScale, { kind: "band" }>;

const labelOrder = new Intl.Collator(undefined, { numeric: true });

/**
 * One band per category from every source row, missing values last. Past
 * `max` bands, the most common values keep theirs and the rest share Other.
 */
export function planBands(
  ids: number[],
  data: Record<number, datum>,
  max: number
): MatrixBands {
  const counts = new Map<string, { value: datum; count: number }>();
  for (const id of ids) {
    const value = categoryValue(data[id]);
    const label = categoryLabel(value);
    const entry = counts.get(label);
    if (entry) {
      entry.count++;
    } else {
      counts.set(label, { value, count: 1 });
    }
  }
  const missing = counts.get(categoryLabel(null));
  const present = [...counts]
    .filter(([, entry]) => entry.value != null)
    .map(([label, entry]) => ({ label, ...entry }));
  const room = max - (missing ? 1 : 0);
  let kept = present;
  let folded: typeof present = [];
  if (present.length > room) {
    const byCount = [...present].sort(
      (a, b) => b.count - a.count || labelOrder.compare(a.label, b.label)
    );
    kept = byCount.slice(0, room - 1);
    folded = byCount.slice(room - 1);
  }
  kept.sort((a, b) => labelOrder.compare(a.label, b.label));
  const labels = kept.map((entry) => entry.label);
  const values = kept.map((entry) => [entry.value]);
  const lookup = new Map(labels.map((label, index) => [label, index]));
  let other = -1;
  if (folded.length) {
    other = labels.length;
    labels.push(OTHER_LABEL);
    values.push(folded.map((entry) => entry.value));
    for (const entry of folded) {
      lookup.set(entry.label, other);
    }
  }
  if (missing) {
    lookup.set(categoryLabel(null), labels.length);
    labels.push(categoryLabel(null));
    values.push([null]);
  }
  return { labels, values, lookup, other };
}

export function bandAxis(
  bands: MatrixBands,
  range: [number, number]
): BandAxis {
  return {
    kind: "band",
    type: "band",
    scale: scaleBand<string>()
      .domain(bands.labels)
      .range(range)
      .padding(BAND_PADDING),
    categories: bands.labels.map((label, index) => ({
      label,
      value: bands.values[index]![0],
    })),
  };
}

/** The band a raw value falls in, or -1. */
export function bandOf(bands: MatrixBands, raw: datum) {
  return bands.lookup.get(categoryLabel(categoryValue(raw))) ?? -1;
}

/** Each band's full step, so every offset on the axis belongs to one band. */
export function bandSteps(axis: BandAxis) {
  const gap = axis.scale.step() - axis.scale.bandwidth();
  return axis.categories.map((category) => {
    const start = axis.scale(category.label) ?? 0;
    return {
      start: start - gap / 2,
      end: start + axis.scale.bandwidth() + gap / 2,
      center: start + axis.scale.bandwidth() / 2,
    };
  });
}

/** The band under an offset, or -1. */
export function bandAt(axis: BandAxis, offset: number) {
  return bandSteps(axis).findIndex(
    (step) => offset >= step.start && offset < step.end
  );
}

/** Offsets a brush edge may cross into a band without selecting it. */
const EDGE_TOLERANCE = 0.5;

/** The value filter for the bands a span of offsets covers. */
export function bandSpanFilter(
  field: string,
  bands: MatrixBands,
  axis: BandAxis,
  [a, b]: [number, number]
): Filter {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  const covered = bandSteps(axis).flatMap((step, index) =>
    high > step.start + EDGE_TOLERANCE && low < step.end - EDGE_TOLERANCE
      ? bands.values[index]!
      : []
  );
  return { type: "value", field, values: covered };
}

/** The value filter that selects one band. */
export function bandFilter(
  field: string,
  bands: MatrixBands,
  band: number
): Filter {
  return { type: "value", field, values: [...bands.values[band]!] };
}

/** The span of offsets the bands a field's value filter selects. */
export function bandFilterSpan(
  field: string,
  bands: MatrixBands,
  axis: BandAxis,
  filters: Filter[]
): [number, number] | undefined {
  const filter = filters.find(
    (item) => item.type === "value" && item.field === field
  );
  if (filter?.type !== "value") {
    return undefined;
  }
  const steps = bandSteps(axis).filter((_, index) =>
    bands.values[index]!.some((value) => categoryIncludes(filter.values, value))
  );
  if (!steps.length) {
    return undefined;
  }
  return [
    Math.min(...steps.map((step) => step.start)),
    Math.max(...steps.map((step) => step.end)),
  ];
}
