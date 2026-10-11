import {
  buildScale,
  type ScaleDescriptor,
} from "@/components/charts/Axis/axisPlan";
import { finiteNumber, isMissingValue } from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type {
  AnnotationKeyValue,
  AnnotationYAxis,
  BandAnnotation,
  CalloutAnnotation,
  ChartAnnotation,
  IntervalAnnotation,
  RecordAttachment,
  ReferenceLineAnnotation,
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
  | "unsupported";

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
  /** Pixel position along the annotation's axis. */
  | Shown<ReferenceLineAnnotation, { position: number }>
  /** Pixel span along the annotation's axis, clamped to the plot. */
  | Shown<BandAnnotation, { start: number; end: number }>
  | Shown<
      IntervalAnnotation,
      {
        points: IntervalPoint[];
        /** Rows whose lower bound is above the upper bound. */
        reversed: number;
      }
    >;

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
  const yScale = yScaleFor(frame, annotation.yAxis);
  if (annotation.type === "reference-line" || annotation.type === "band") {
    const vertical = annotation.axis === "x";
    const descriptor = vertical ? frame.xScale : yScale;
    if (descriptor.type === "band")
      return { annotation, status: "unsupported" };
    const size = vertical ? frame.plotWidth : frame.plotHeight;
    if (annotation.type === "reference-line") {
      const position = numericPosition(descriptor, annotation.value);
      if (position === undefined || !inside(position, size))
        return { annotation, status: "offscreen" };
      return { annotation, status: "shown", position };
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
  if (annotation.type === "interval") {
    if (!frame.visibleIds || !frame.xField || yScale.type === "band")
      return { annotation, status: "unsupported" };
    const xs = frame.getColumn(frame.xField);
    const lows = frame.getColumn(annotation.lowerField);
    const highs = frame.getColumn(annotation.upperField);
    let reversed = 0;
    const points: IntervalPoint[] = [];
    for (const id of frame.visibleIds) {
      const xValue = finiteNumber(xs[id]);
      const low = finiteNumber(lows[id]);
      const high = finiteNumber(highs[id]);
      if (xValue === undefined || low === undefined || high === undefined)
        continue;
      if (low > high) reversed++;
      const x = numericPosition(frame.xScale, xValue);
      const lower = numericPosition(yScale, Math.min(low, high));
      const upper = numericPosition(yScale, Math.max(low, high));
      if (x === undefined || lower === undefined || upper === undefined)
        continue;
      points.push({ x, lower, upper });
    }
    if (!points.length) return { annotation, status: "invalid" };
    points.sort((a, b) => a.x - b.x);
    return { annotation, status: "shown", points, reversed };
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
  if (!frame.plotted) return { annotation, status: "unsupported" };
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
