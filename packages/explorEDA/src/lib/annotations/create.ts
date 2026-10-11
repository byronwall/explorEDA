import { finiteNumber } from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import { recordKey, uniqueKeyFields, type ColumnGetter } from "./resolve";
import type { CalloutAnnotation, ReferenceLineAnnotation } from "./types";

interface AnnotationSource {
  /** The fields the chart can offer as record keys. */
  fields: string[];
  ids: IdType[];
  getColumn: ColumnGetter;
  /** The chart's measure: the record with its largest value gets the callout. */
  valueField?: string;
}

function largestRecord(source: AnnotationSource) {
  if (!source.valueField) return source.ids[0];
  const column = source.getColumn(source.valueField);
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

function middle(source: AnnotationSource, field: string | undefined) {
  if (!field) return 0;
  const column = source.getColumn(field);
  const values = source.ids
    .map((id) => finiteNumber(column[id]))
    .filter((value): value is number => value !== undefined)
    .sort((a, b) => a - b);
  return values.length ? values[Math.floor(values.length / 2)]! : 0;
}

/**
 * A new callout on the record with the chart's largest value, keyed by the
 * first field that identifies every row. Without such a field it starts at
 * a fixed point, which the user can attach to a record once a key exists.
 */
export function createCallout(
  source: AnnotationSource & { xField?: string; yField?: string }
): CalloutAnnotation {
  const base = {
    id: crypto.randomUUID(),
    type: "callout" as const,
    offset: { dx: 24, dy: -24 },
    leader: true,
  };
  const [keyField] = uniqueKeyFields(
    source.fields,
    source.getColumn,
    source.ids
  );
  const id = largestRecord({ ...source, valueField: source.yField });
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
      x: middle(source, source.xField),
      y: middle(source, source.yField),
    },
  };
}

/** A new horizontal target at the median of the chart's y values. */
export function createReferenceLine(
  source: AnnotationSource & { yField?: string }
): ReferenceLineAnnotation {
  return {
    id: crypto.randomUUID(),
    type: "reference-line",
    axis: "y",
    value: middle(source, source.yField),
    label: "Target",
  };
}
