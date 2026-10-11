/**
 * Saved annotations on an ordinary chart. Each one keeps its attachment (what
 * it means), its content, and its style apart, so a chart can project the
 * same annotation through whatever scales it draws today.
 */

/** A key value as the source data holds it. */
export type AnnotationKeyValue = string | number;

/**
 * One source record, found by the values of fields that identify it. Row
 * positions change when data is replaced or reordered, so a record attachment
 * never stores one.
 */
export interface RecordAttachment {
  kind: "record";
  /** Fields whose values together identify one record. */
  keyFields: string[];
  /** The record's value for each key field, in the same order. */
  key: AnnotationKeyValue[];
}

/** A fixed point in data units. It stays put whatever the rows do. */
export interface CoordinateAttachment {
  kind: "coordinate";
  x: number;
  y: number;
}

export type CalloutAttachment = RecordAttachment | CoordinateAttachment;

interface AnnotationBase {
  id: string;
  /** Shown in the annotation list; the content stands in when blank. */
  name?: string;
  hidden?: boolean;
  /** A CSS color; the theme's foreground when unset. */
  color?: string;
}

/**
 * Text beside a subject. The offset is in display pixels, so moving the label
 * never moves what it describes.
 */
export interface CalloutAnnotation extends AnnotationBase {
  type: "callout";
  text: string;
  attach: CalloutAttachment;
  offset: { dx: number; dy: number };
  /** Draw a line from the subject to the label. */
  leader?: boolean;
}

/** A fixed reference value: a vertical rule at x or a horizontal rule at y. */
export interface ReferenceLineAnnotation extends AnnotationBase {
  type: "reference-line";
  axis: "x" | "y";
  value: number;
  label?: string;
  lineStyle?: "solid" | "dashed";
}

export type ChartAnnotation = CalloutAnnotation | ReferenceLineAnnotation;
export type ChartAnnotationType = ChartAnnotation["type"];

/** Charts that can draw saved annotations. */
export const ANNOTATION_CHART_TYPES = ["scatter"] as const;

/** Whether this chart, as configured, draws saved annotations. */
export function chartDrawsAnnotations(settings: {
  type: string;
  display?: string;
}) {
  return (
    (ANNOTATION_CHART_TYPES as readonly string[]).includes(settings.type) &&
    // Rectangular density bins draw through a separate renderer.
    settings.display !== "density"
  );
}

/** The words the list and readers use for an annotation. */
export function annotationLabel(annotation: ChartAnnotation) {
  if (annotation.name?.trim()) return annotation.name.trim();
  if (annotation.type === "callout")
    return annotation.text.trim() || "Untitled callout";
  return (
    annotation.label?.trim() ||
    `${annotation.axis === "x" ? "X" : "Y"} = ${annotation.value}`
  );
}
