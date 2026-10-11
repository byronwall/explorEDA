import { finiteNumber, timestampOf } from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { AnnotationContext } from "./context";
import { recordKey, uniqueKeyFields, type ColumnGetter } from "./resolve";
import type {
  BandAnnotation,
  CalloutAnnotation,
  ChartAnnotation,
  IntervalAnnotation,
  RecordSetAnnotation,
  ReferenceLineAnnotation,
  RegionAnnotation,
} from "./types";

export interface AnnotationSource extends Partial<AnnotationContext> {
  /** The fields the chart can offer as record keys. */
  fields: string[];
  ids: IdType[];
  getColumn: ColumnGetter;
}

function sortedValues(
  source: AnnotationSource,
  field: string | undefined,
  date = false
) {
  if (!field) return [];
  const column = source.getColumn(field);
  return source.ids
    .map((id) => (date ? timestampOf(column[id]) : finiteNumber(column[id])))
    .filter((value): value is number => value !== undefined)
    .sort((a, b) => a - b);
}

/** The value at a share of the way through the sorted values, or 0. */
function quantile(values: number[], share: number) {
  return values.length ? values[Math.floor(share * (values.length - 1))]! : 0;
}

function largestRecord(source: AnnotationSource) {
  if (!source.yField) return source.ids[0];
  const column = source.getColumn(source.yField);
  let best: IdType | undefined;
  let bestValue = -Infinity;
  for (const id of source.ids) {
    const value = finiteNumber(column[id]);
    if (value !== undefined && value > bestValue) {
      best = id;
      bestValue = value;
    }
  }
  return best ?? source.ids[0];
}

const newId = () => crypto.randomUUID();

/**
 * A new callout on the record with the chart's largest value, keyed by the
 * first field that identifies every row. Without such a field, or on a chart
 * of grouped values, it starts at a fixed point the user can move.
 */
export function createCallout(source: AnnotationSource): CalloutAnnotation {
  const base = {
    id: newId(),
    type: "callout" as const,
    offset: { dx: 24, dy: -24 },
  };
  const [keyField] =
    source.records === false
      ? []
      : uniqueKeyFields(source.fields, source.getColumn, source.ids);
  const id = largestRecord(source);
  const key =
    keyField && id !== undefined
      ? recordKey([keyField], source.getColumn, id)
      : undefined;
  if (keyField && key)
    return {
      ...base,
      text: String(key[0]),
      attach: { kind: "record", keyFields: [keyField], key },
    };
  return {
    ...base,
    text: "Note",
    attach: {
      kind: "coordinate",
      x: quantile(sortedValues(source, source.xField, source.xDate), 0.5),
      y: quantile(sortedValues(source, source.yField), 0.5),
    },
  };
}

/**
 * A new target at the median of the chart's values, or, on a date axis, an
 * event at the middle date.
 */
export function createReferenceLine(
  source: AnnotationSource
): ReferenceLineAnnotation {
  if (source.xDate || !source.yField)
    return {
      id: newId(),
      type: "reference-line",
      axis: "x",
      value: quantile(sortedValues(source, source.xField, source.xDate), 0.5),
      label: source.xDate ? "Event" : "Threshold",
    };
  return {
    id: newId(),
    type: "reference-line",
    axis: "y",
    value: quantile(sortedValues(source, source.yField), 0.5),
    label: "Target",
  };
}

/**
 * A new band over the middle half of the values: a period on a date axis,
 * otherwise a range of the measure.
 */
export function createBand(source: AnnotationSource): BandAnnotation {
  const onX = source.xDate || !source.yField;
  const values = onX
    ? sortedValues(source, source.xField, source.xDate)
    : sortedValues(source, source.yField);
  return {
    id: newId(),
    type: "band",
    axis: onX ? "x" : "y",
    from: quantile(values, 0.25),
    to: quantile(values, 0.75),
    label: onX ? "Period" : "Range",
  };
}

const LOWER = /(^|[^a-z])(lower|low|lo|min)([^a-z]|$)/i;
const UPPER = /(^|[^a-z])(upper|high|hi|max)([^a-z]|$)/i;

/**
 * A new supplied interval, guessing its bound fields from names such as
 * "lower" and "upper". The user confirms both and says what they mean.
 */
export function createInterval(source: AnnotationSource): IntervalAnnotation {
  const numeric = source.fields.filter(
    (field) => sortedValues(source, field).length > 0
  );
  return {
    id: newId(),
    type: "interval",
    lowerField: numeric.find((field) => LOWER.test(field)) ?? "",
    upperField: numeric.find((field) => UPPER.test(field)) ?? "",
    meaning: "Supplied range",
  };
}

/** A new rectangle around the middle half of the chart's values. */
export function createRegion(source: AnnotationSource): RegionAnnotation {
  const xs = sortedValues(source, source.xField, source.xDate);
  const ys = sortedValues(source, source.yField);
  return {
    id: newId(),
    type: "region",
    shape: "rect",
    x0: quantile(xs, 0.25),
    x1: quantile(xs, 0.75),
    y0: quantile(ys, 0.25),
    y1: quantile(ys, 0.75),
    label: "Region",
  };
}

/** Saved records, keyed by a field that identifies every row. */
export function createRecordSet(
  keyField: string,
  ids: IdType[],
  getColumn: ColumnGetter
): RecordSetAnnotation {
  return {
    id: newId(),
    type: "record-set",
    keyFields: [keyField],
    keys: ids.flatMap((id) => {
      const key = recordKey([keyField], getColumn, id);
      return key ? [key] : [];
    }),
    label: "Saved records",
  };
}

/** A copy with a new id, nudged so it doesn't hide the original. */
export function duplicateAnnotation(
  annotation: ChartAnnotation
): ChartAnnotation {
  const copy = structuredClone(annotation);
  copy.id = newId();
  if (copy.type === "callout")
    copy.offset = { dx: copy.offset.dx + 12, dy: copy.offset.dy + 12 };
  if (copy.name) copy.name = `${copy.name} copy`;
  return copy;
}
