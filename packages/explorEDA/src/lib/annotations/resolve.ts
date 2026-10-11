import {
  buildScale,
  type ScaleDescriptor,
} from "@/components/charts/Axis/axisPlan";
import { isMissingValue } from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type {
  AnnotationKeyValue,
  ChartAnnotation,
  RecordAttachment,
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
    label: "Needs a key",
    help: "Choose the key fields and values that identify the record.",
  },
  offscreen: {
    label: "Outside the view",
    help: "Its position is outside the axis range. Widen the axis limits to see it.",
  },
  unsupported: {
    label: "Not on this axis",
    help: "This axis is categorical, so it has no position for a numeric value.",
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

export interface AnnotationFrame {
  xScale: ScaleDescriptor;
  yScale: ScaleDescriptor;
  plotWidth: number;
  plotHeight: number;
  ids: IdType[];
  getColumn: ColumnGetter;
  /** The plotted position of a row this chart draws. */
  plotted: (id: IdType) => PlottedRecord | undefined;
}

export type ProjectedAnnotation =
  | {
      annotation: ChartAnnotation;
      status: Exclude<AnnotationStatus, "shown">;
    }
  | {
      annotation: Extract<ChartAnnotation, { type: "callout" }>;
      status: "shown";
      /** The subject in plot pixels. */
      x: number;
      y: number;
    }
  | {
      annotation: Extract<ChartAnnotation, { type: "reference-line" }>;
      status: "shown";
      /** Pixel position along the annotation's axis. */
      position: number;
    };

function numericPosition(descriptor: ScaleDescriptor, value: number) {
  if (descriptor.type === "band") return undefined;
  if (descriptor.type === "log" && value <= 0) return undefined;
  const position = (buildScale(descriptor) as (v: number) => number)(value);
  return Number.isFinite(position) ? position : undefined;
}

const inside = (value: number, size: number) =>
  value >= -0.5 && value <= size + 0.5;

/**
 * Resolves each annotation's attachment, then projects it through the
 * chart's current scales. Positions are recomputed on every draw; nothing
 * stores pixels except a label's offset from its subject.
 */
export function projectAnnotations(
  annotations: ChartAnnotation[] | undefined,
  frame: AnnotationFrame
): ProjectedAnnotation[] {
  return (annotations ?? []).map((annotation): ProjectedAnnotation => {
    if (annotation.hidden) return { annotation, status: "hidden" };
    if (annotation.type === "reference-line") {
      const descriptor = annotation.axis === "x" ? frame.xScale : frame.yScale;
      if (descriptor.type === "band")
        return { annotation, status: "unsupported" };
      const position = numericPosition(descriptor, annotation.value);
      const size = annotation.axis === "x" ? frame.plotWidth : frame.plotHeight;
      if (position === undefined || !inside(position, size))
        return { annotation, status: "offscreen" };
      return { annotation, status: "shown", position };
    }
    const attach = annotation.attach;
    if (attach.kind === "coordinate") {
      const x = numericPosition(frame.xScale, attach.x);
      const y = numericPosition(frame.yScale, attach.y);
      if (frame.xScale.type === "band" || frame.yScale.type === "band")
        return { annotation, status: "unsupported" };
      if (
        x === undefined ||
        y === undefined ||
        !inside(x, frame.plotWidth) ||
        !inside(y, frame.plotHeight)
      )
        return { annotation, status: "offscreen" };
      return { annotation, status: "shown", x, y };
    }
    const resolution = resolveRecord(attach, frame.getColumn, frame.ids);
    if (resolution.status !== "found")
      return { annotation, status: resolution.status };
    const point = frame.plotted(resolution.id);
    if (!point || !point.selected) return { annotation, status: "filtered" };
    if (!inside(point.x, frame.plotWidth) || !inside(point.y, frame.plotHeight))
      return { annotation, status: "offscreen" };
    return { annotation, status: "shown", x: point.x, y: point.y };
  });
}
