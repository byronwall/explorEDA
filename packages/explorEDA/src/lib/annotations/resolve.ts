import {
  buildScale,
  type ScaleDescriptor,
} from "@/components/charts/Axis/axisPlan";
import { finiteNumber, isMissingValue, timestampOf } from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type {
  AnnotationKeyValue,
  AnnotationPopulation,
  AnnotationStatistic,
  AnnotationYAxis,
  BandAnnotation,
  CalloutAnnotation,
  CategoryAttachment,
  ChartAnnotation,
  IntervalAnnotation,
  RecordAttachment,
  RecordSetAnnotation,
  ReferenceLineAnnotation,
  RegionAnnotation,
} from "./types";

export type ColumnGetter = (field: string) => Record<IdType, datum>;

/** Where a record attachment points in the current rows. */
export type RecordResolution =
  | { status: "found"; id: IdType }
  | { status: "missing" }
  | { status: "ambiguous"; count: number }
  | { status: "invalid" };

/**
 * How an annotation reads on the current chart. Only `shown` draws; every
 * other status stays editable in the annotation list.
 */
export type AnnotationStatus =
  | "shown"
  | "hidden"
  | "filtered"
  | "missing"
  | "ambiguous"
  | "invalid"
  | "offscreen"
  | "unsupported"
  | "empty"
  | "elsewhere";

export const ANNOTATION_STATUS_TEXT: Record<
  Exclude<AnnotationStatus, "shown">,
  { label: string; help: string }
> = {
  hidden: {
    label: "Hidden",
    help: "Hidden on the chart. Show it again from this list.",
  },
  filtered: {
    label: "Filtered out",
    help: "Its record is outside the current filters. It returns when the filters include it again.",
  },
  missing: {
    label: "Record missing",
    help: "No row has this key now. Choose another record or key, or remove the callout.",
  },
  ambiguous: {
    label: "Key not unique",
    help: "More than one row has this key, so the callout attaches to none of them. Choose key fields that identify one row.",
  },
  invalid: {
    label: "Incomplete",
    help: "A callout needs key fields and values that identify one record; an interval needs rows with both bounds.",
  },
  offscreen: {
    label: "Outside the view",
    help: "Its position is outside the axis range. Widen the axis limits to see it.",
  },
  elsewhere: {
    label: "Other panel",
    help: "It draws only in one facet panel, which isn't shown here or no longer has rows.",
  },
  empty: {
    label: "No rows",
    help: "The rows it reads are all filtered out or have no value for its field.",
  },
  unsupported: {
    label: "Not on this chart",
    help: "This chart can't place it: a categorical axis has no numeric position, and a chart of grouped values has no single records.",
  },
};

/** Compares a stored key to a cell. Numbers and their text match. */
function keyText(value: datum | AnnotationKeyValue) {
  return typeof value === "number" ? String(value) : String(value).trim();
}

function compositeKey(values: (datum | AnnotationKeyValue)[]) {
  return JSON.stringify(values.map(keyText));
}

/** The rows whose key fields hold these values. */
function matchingRows(
  attach: RecordAttachment,
  getColumn: ColumnGetter,
  ids: IdType[]
) {
  const columns = attach.keyFields.map((field) => getColumn(field));
  const wanted = compositeKey(attach.key);
  const found: IdType[] = [];
  for (const id of ids) {
    const values = columns.map((column) => column[id]);
    if (values.some(isMissingValue)) continue;
    if (compositeKey(values) === wanted) found.push(id);
  }
  return found;
}

/**
 * Rows by key for one set of key fields, so many keys resolve in one pass.
 */
export function recordIndex(
  keyFields: string[],
  getColumn: ColumnGetter,
  ids: IdType[]
) {
  const columns = keyFields.map((field) => getColumn(field));
  const index = new Map<string, IdType[]>();
  for (const id of ids) {
    const values = columns.map((column) => column[id]);
    if (values.some(isMissingValue)) continue;
    const key = compositeKey(values);
    const rows = index.get(key);
    if (rows) rows.push(id);
    else index.set(key, [id]);
  }
  return (key: (datum | AnnotationKeyValue)[]) =>
    index.get(compositeKey(key)) ?? [];
}

/**
 * Finds the one row an attachment names. A missing or repeated key never
 * falls back to a row position.
 */
export function resolveRecord(
  attach: RecordAttachment,
  getColumn: ColumnGetter,
  ids: IdType[]
): RecordResolution {
  if (
    !attach.keyFields.length ||
    attach.keyFields.length !== attach.key.length ||
    attach.key.some((value) => keyText(value) === "")
  )
    return { status: "invalid" };
  const rows = matchingRows(attach, getColumn, ids);
  if (rows.length === 1) return { status: "found", id: rows[0]! };
  if (rows.length === 0) return { status: "missing" };
  return { status: "ambiguous", count: rows.length };
}

/** The key that names one row, from its values in the key fields. */
export function recordKey(
  keyFields: string[],
  getColumn: ColumnGetter,
  id: IdType
): AnnotationKeyValue[] | undefined {
  const values = keyFields.map((field) => getColumn(field)[id]);
  if (values.some(isMissingValue)) return undefined;
  return values.map((value) =>
    typeof value === "number" ? value : String(value)
  );
}

/**
 * Fields whose values identify every row: present in each and never
 * repeated. The internal row sequence is left out because it follows row
 * order.
 */
export function uniqueKeyFields(
  fields: string[],
  getColumn: ColumnGetter,
  ids: IdType[]
) {
  return fields.filter((field) => {
    if (field === "__ID" || !ids.length) return false;
    const column = getColumn(field);
    const seen = new Set<string>();
    for (const id of ids) {
      const value = column[id];
      if (isMissingValue(value)) return false;
      const text = keyText(value);
      if (seen.has(text)) return false;
      seen.add(text);
    }
    return true;
  });
}

/** A plotted record in plot pixels. */
export interface PlottedRecord {
  x: number;
  y: number;
  /** False when the row is drawn but outside the chart's filters. */
  selected: boolean;
}

/**
 * What a chart offers annotations: its current scales and plot size, the
 * source rows for record keys, and, where marks are rows, where each one is
 * drawn. A chart whose marks summarize many rows leaves `plotted` and
 * `visibleIds` out, and record callouts and intervals report unsupported.
 */
export interface AnnotationFrame {
  xScale: ScaleDescriptor;
  yScale: ScaleDescriptor;
  /** The right-hand y axis, on charts that draw one. */
  yRightScale?: ScaleDescriptor;
  plotWidth: number;
  plotHeight: number;
  ids: IdType[];
  getColumn: ColumnGetter;
  /** The plotted position of a row this chart draws. */
  plotted?: (id: IdType, attach: RecordAttachment) => PlottedRecord | undefined;
  /** Rows drawn and selected now, with the field that places them on x. */
  visibleIds?: IdType[];
  xField?: string;
  /** The measure on the y axis, for calculations and largest-value picks. */
  yField?: string;
  /**
   * The rows calculations read: every row the chart can draw, and those that
   * pass the current filters. Charts of grouped values leave it out.
   */
  population?: Record<AnnotationPopulation, IdType[]>;
  /**
   * Values calculations read on an axis whose marks summarize rows, such as
   * a grouped row chart's per-group measure. They take the place of
   * `population` for that axis.
   */
  axisValues?: Partial<
    Record<"x" | "y", Record<AnnotationPopulation, number[]>>
  >;
  /** Where an aggregate mark, such as a bar, is drawn for a category. */
  category?: (attach: CategoryAttachment) => PlottedRecord | undefined;
  /**
   * On a chart drawn as a grid of cells, such as a heatmap or calendar, where
   * the cell a record callout's key values name is drawn. Its key fields must
   * be the fields that place a cell, since a cell holds many rows.
   */
  cell?: (
    attach: RecordAttachment
  ) => PlottedRecord | Exclude<AnnotationStatus, "shown">;
  /** The facet panel this frame draws, by its facet values. */
  facetKey?: string;
}

/** A statistic of a field over some rows, or undefined without values. */
export function calculate(
  statistic: AnnotationStatistic,
  field: string,
  ids: IdType[],
  getColumn: ColumnGetter
) {
  const column = getColumn(field);
  return statisticOf(
    statistic,
    ids
      .map((id) => finiteNumber(column[id]))
      .filter((value): value is number => value !== undefined)
  );
}

/** A statistic of some values, or undefined without any. */
export function statisticOf(statistic: AnnotationStatistic, input: number[]) {
  const values = input.filter(Number.isFinite);
  if (!values.length) return undefined;
  if (statistic === "mean")
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  if (statistic === "min") return Math.min(...values);
  if (statistic === "max") return Math.max(...values);
  values.sort((a, b) => a - b);
  const middle = values.length / 2;
  return values.length % 2
    ? values[Math.floor(middle)]!
    : (values[middle - 1]! + values[middle]!) / 2;
}

/** The row with the largest or smallest value of a field. */
function pickRow(
  pick: "max" | "min",
  field: string,
  ids: IdType[],
  getColumn: ColumnGetter
) {
  const column = getColumn(field);
  let best: IdType | undefined;
  let bestValue = pick === "max" ? -Infinity : Infinity;
  for (const id of ids) {
    const value = finiteNumber(column[id]);
    if (value === undefined) continue;
    if (pick === "max" ? value > bestValue : value < bestValue) {
      best = id;
      bestValue = value;
    }
  }
  return best;
}

/** How a record set's members fared on this draw. */
export interface RecordSetCounts {
  total: number;
  shown: number;
  filtered: number;
  missing: number;
  ambiguous: number;
}

/** One point of a supplied interval, in plot pixels. */
export interface IntervalPoint {
  x: number;
  lower: number;
  upper: number;
}

type Shown<T extends ChartAnnotation, G> = {
  annotation: T;
  status: "shown";
} & G;

export type ProjectedAnnotation =
  | {
      annotation: ChartAnnotation;
      status: Exclude<AnnotationStatus, "shown">;
    }
  | Shown<CalloutAnnotation, { x: number; y: number }>
  /** Pixel position along the annotation's axis, and the value it marks. */
  | Shown<ReferenceLineAnnotation, { position: number; value: number }>
  /** The region's box in plot pixels, which may extend past the plot. */
  | Shown<
      RegionAnnotation,
      { left: number; top: number; width: number; height: number }
    >
  | Shown<
      RecordSetAnnotation,
      { points: { x: number; y: number }[]; counts: RecordSetCounts }
    >
  /** Pixel span along the annotation's axis, clamped to the plot. */
  | Shown<BandAnnotation, { start: number; end: number }>
  | Shown<
      IntervalAnnotation,
      {
        /** Points in X order, split wherever an in-order row lacks bounds. */
        runs: IntervalPoint[][];
        evidence: IntervalEvidence;
      }
    >;

/** What a supplied interval was drawn from, for the Notes list. */
export interface IntervalEvidence {
  /** Rows with both bounds that the ribbon passes through. */
  rows: number;
  /** Rows inside the ribbon's X span that lack a bound and split it. */
  breaks: number;
  /** Rows whose lower bound is above the upper bound, drawn swapped. */
  reversed: number;
  /** X values shared by several rows; the ribbon takes their outer bounds. */
  duplicates: number;
}

/** "16 rows in 2 runs · 1 row splits it", for an interval's Notes entry. */
export function intervalEvidenceText(evidence: IntervalEvidence, runs: number) {
  const plural = (n: number, word: string) =>
    `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;
  return [
    `${plural(evidence.rows, "row")} in ${plural(runs, "run")}`,
    evidence.breaks &&
      `${plural(evidence.breaks, "row")} without bounds ${evidence.breaks === 1 ? "splits" : "split"} it`,
    evidence.reversed &&
      `${plural(evidence.reversed, "reversed pair")} swapped`,
    evidence.duplicates &&
      `${plural(evidence.duplicates, "repeated X value")} use the outer bounds`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function numericPosition(descriptor: ScaleDescriptor, value: number) {
  if (descriptor.type === "band") return undefined;
  if (descriptor.type === "log" && value <= 0) return undefined;
  const position = (buildScale(descriptor) as (v: number) => number)(value);
  return Number.isFinite(position) ? position : undefined;
}

const inside = (value: number, size: number) =>
  value >= -0.5 && value <= size + 0.5;

function yScaleFor(frame: AnnotationFrame, axis: AnnotationYAxis | undefined) {
  return axis === "right" && frame.yRightScale
    ? frame.yRightScale
    : frame.yScale;
}

function projectOne(
  annotation: ChartAnnotation,
  frame: AnnotationFrame
): ProjectedAnnotation {
  if (annotation.hidden) return { annotation, status: "hidden" };
  if (
    annotation.facet !== undefined &&
    frame.facetKey !== undefined &&
    annotation.facet !== frame.facetKey
  )
    return { annotation, status: "elsewhere" };
  const yScale = yScaleFor(
    frame,
    "yAxis" in annotation ? annotation.yAxis : undefined
  );
  if (annotation.type === "reference-line" || annotation.type === "band") {
    const vertical = annotation.axis === "x";
    const descriptor = vertical ? frame.xScale : yScale;
    if (descriptor.type === "band")
      return { annotation, status: "unsupported" };
    const size = vertical ? frame.plotWidth : frame.plotHeight;
    if (annotation.type === "reference-line") {
      let value = annotation.value;
      if (annotation.calculated) {
        const { statistic, population } = annotation.calculated;
        const field = vertical ? frame.xField : frame.yField;
        const values = frame.axisValues?.[annotation.axis];
        if (!values && (!frame.population || !field))
          return { annotation, status: "unsupported" };
        const result = values
          ? statisticOf(statistic, values[population])
          : calculate(
              statistic,
              field!,
              frame.population![population],
              frame.getColumn
            );
        if (result === undefined) return { annotation, status: "empty" };
        value = result;
      }
      const position = numericPosition(descriptor, value);
      if (position === undefined || !inside(position, size))
        return { annotation, status: "offscreen" };
      return { annotation, status: "shown", position, value };
    }
    const a = numericPosition(descriptor, annotation.from);
    const b = numericPosition(descriptor, annotation.to);
    if (a === undefined || b === undefined)
      return { annotation, status: "offscreen" };
    const start = Math.max(0, Math.min(a, b));
    const end = Math.min(size, Math.max(a, b));
    if (end <= start) return { annotation, status: "offscreen" };
    return { annotation, status: "shown", start, end };
  }
  if (annotation.type === "region") {
    if (frame.xScale.type === "band" || yScale.type === "band")
      return { annotation, status: "unsupported" };
    const xs = [annotation.x0, annotation.x1].map((v) =>
      numericPosition(frame.xScale, v)
    );
    const ys = [annotation.y0, annotation.y1].map((v) =>
      numericPosition(yScale, v)
    );
    if ([...xs, ...ys].some((v) => v === undefined))
      return { annotation, status: "offscreen" };
    const [a, b] = xs as number[];
    const [c, d] = ys as number[];
    const left = Math.min(a!, b!);
    const top = Math.min(c!, d!);
    const width = Math.abs(b! - a!);
    const height = Math.abs(d! - c!);
    if (
      left > frame.plotWidth ||
      top > frame.plotHeight ||
      left + width < 0 ||
      top + height < 0
    )
      return { annotation, status: "offscreen" };
    return { annotation, status: "shown", left, top, width, height };
  }
  if (annotation.type === "record-set") {
    if (!frame.plotted) return { annotation, status: "unsupported" };
    if (!annotation.keyFields.length || !annotation.keys.length)
      return { annotation, status: "invalid" };
    const rowsFor = recordIndex(
      annotation.keyFields,
      frame.getColumn,
      frame.ids
    );
    const counts: RecordSetCounts = {
      total: annotation.keys.length,
      shown: 0,
      filtered: 0,
      missing: 0,
      ambiguous: 0,
    };
    const points: { x: number; y: number }[] = [];
    const attach: RecordAttachment = {
      kind: "record",
      keyFields: annotation.keyFields,
      key: [],
      yField: annotation.yField,
    };
    for (const key of annotation.keys) {
      const rows = rowsFor(key);
      if (rows.length === 0) counts.missing++;
      else if (rows.length > 1) counts.ambiguous++;
      else {
        const point = frame.plotted(rows[0]!, attach);
        if (point?.selected) {
          counts.shown++;
          points.push({ x: point.x, y: point.y });
        } else counts.filtered++;
      }
    }
    if (points.length) return { annotation, status: "shown", points, counts };
    if (counts.filtered) return { annotation, status: "filtered" };
    return {
      annotation,
      status: counts.ambiguous ? "ambiguous" : "missing",
    };
  }
  if (annotation.type === "interval") {
    if (!frame.visibleIds || !frame.xField || yScale.type === "band")
      return { annotation, status: "unsupported" };
    const xs = frame.getColumn(frame.xField);
    const lows = frame.getColumn(annotation.lowerField);
    const highs = frame.getColumn(annotation.upperField);
    // Every visible row with an X takes its place in order; one without
    // both bounds ends a run, so the ribbon never bridges a gap.
    const rows: { x: number; bounds?: [number, number] }[] = [];
    let reversed = 0;
    for (const id of frame.visibleIds) {
      const xValue = finiteNumber(xs[id]) ?? timestampOf(xs[id]);
      const x =
        xValue === undefined
          ? undefined
          : numericPosition(frame.xScale, xValue);
      if (x === undefined) continue;
      const low = finiteNumber(lows[id]);
      const high = finiteNumber(highs[id]);
      const lower =
        low === undefined || high === undefined
          ? undefined
          : numericPosition(yScale, Math.min(low, high));
      const upper =
        low === undefined || high === undefined
          ? undefined
          : numericPosition(yScale, Math.max(low, high));
      if (lower === undefined || upper === undefined) {
        rows.push({ x });
        continue;
      }
      if (low! > high!) reversed++;
      rows.push({ x, bounds: [lower, upper] });
    }
    rows.sort((a, b) => a.x - b.x);
    const evidence: IntervalEvidence = {
      rows: 0,
      breaks: 0,
      reversed,
      duplicates: 0,
    };
    const runs: IntervalPoint[][] = [];
    let run: IntervalPoint[] = [];
    let pendingBreaks = 0;
    for (const row of rows) {
      if (!row.bounds) {
        if (run.length) {
          runs.push(run);
          run = [];
        }
        if (runs.length) pendingBreaks++;
        continue;
      }
      if (!run.length) {
        evidence.breaks += pendingBreaks;
        pendingBreaks = 0;
      }
      evidence.rows++;
      const previous = run.at(-1);
      // Pixel bounds grow downward: the upper bound has the smaller pixel.
      const [lower, upper] = row.bounds;
      if (previous && previous.x === row.x) {
        evidence.duplicates++;
        previous.lower = Math.max(previous.lower, lower);
        previous.upper = Math.min(previous.upper, upper);
        continue;
      }
      run.push({ x: row.x, lower, upper });
    }
    if (run.length) runs.push(run);
    if (!runs.length) return { annotation, status: "invalid" };
    return { annotation, status: "shown", runs, evidence };
  }
  const attach = annotation.attach;
  if (attach.kind === "coordinate") {
    if (frame.xScale.type === "band" || yScale.type === "band")
      return { annotation, status: "unsupported" };
    const x = numericPosition(frame.xScale, attach.x);
    const y = numericPosition(yScale, attach.y);
    if (
      x === undefined ||
      y === undefined ||
      !inside(x, frame.plotWidth) ||
      !inside(y, frame.plotHeight)
    )
      return { annotation, status: "offscreen" };
    return { annotation, status: "shown", x, y };
  }
  if (attach.kind === "category") {
    if (!frame.category) return { annotation, status: "unsupported" };
    const point = frame.category(attach);
    if (!point) return { annotation, status: "missing" };
    if (!inside(point.x, frame.plotWidth) || !inside(point.y, frame.plotHeight))
      return { annotation, status: "offscreen" };
    // An aggregate mark stays drawn when filters dim it, so its note does too.
    return { annotation, status: "shown", x: point.x, y: point.y };
  }
  if (attach.kind === "record" && frame.cell) {
    const point = frame.cell(attach);
    if (typeof point === "string") return { annotation, status: point };
    if (!inside(point.x, frame.plotWidth) || !inside(point.y, frame.plotHeight))
      return { annotation, status: "offscreen" };
    return { annotation, status: "shown", x: point.x, y: point.y };
  }
  if (!frame.plotted) return { annotation, status: "unsupported" };
  if (attach.kind === "query") {
    const field = attach.field ?? frame.yField;
    if (!frame.population || !field)
      return { annotation, status: "unsupported" };
    const id = pickRow(
      attach.pick,
      field,
      frame.population[attach.population],
      frame.getColumn
    );
    if (id === undefined) return { annotation, status: "empty" };
    const point = frame.plotted(id, {
      kind: "record",
      keyFields: [],
      key: [],
      yField: attach.field,
    });
    if (!point || !point.selected) return { annotation, status: "filtered" };
    return { annotation, status: "shown", x: point.x, y: point.y };
  }
  const resolution = resolveRecord(attach, frame.getColumn, frame.ids);
  if (resolution.status !== "found")
    return { annotation, status: resolution.status };
  const point = frame.plotted(resolution.id, attach);
  if (!point || !point.selected) return { annotation, status: "filtered" };
  if (!inside(point.x, frame.plotWidth) || !inside(point.y, frame.plotHeight))
    return { annotation, status: "offscreen" };
  return { annotation, status: "shown", x: point.x, y: point.y };
}

/**
 * Resolves each annotation's attachment, then projects it through the
 * chart's current scales. Positions are recomputed on every draw; nothing
 * stores pixels except a label's offset from its subject.
 */
export function projectAnnotations(
  annotations: ChartAnnotation[] | undefined,
  frame: AnnotationFrame
): ProjectedAnnotation[] {
  return (annotations ?? []).map((annotation) => projectOne(annotation, frame));
}
