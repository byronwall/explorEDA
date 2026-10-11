/**
 * Saved annotations on an ordinary chart. Each one keeps its attachment (what
 * it means), its content, and its style apart, so a chart can project the
 * same annotation through whatever scales it draws today.
 *
 * Values are in data units. A date axis stores timestamps in milliseconds.
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
  /**
   * The measure that places the record vertically, on charts that draw
   * several per row, such as a line chart's series. The first one when unset.
   */
  yField?: string;
}

/** A fixed point in data units. It stays put whatever the rows do. */
export interface CoordinateAttachment {
  kind: "coordinate";
  x: number;
  y: number;
}

export type CalloutAttachment = RecordAttachment | CoordinateAttachment;

/** Which vertical axis a y value reads on, for charts with a right axis. */
export type AnnotationYAxis = "left" | "right";

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
  /** End the leader with an arrowhead at the subject. */
  arrow?: boolean;
  yAxis?: AnnotationYAxis;
}

/**
 * A fixed value: a vertical rule at x, such as an event or threshold, or a
 * horizontal rule at y, such as a target.
 */
export interface ReferenceLineAnnotation extends AnnotationBase {
  type: "reference-line";
  axis: "x" | "y";
  value: number;
  label?: string;
  lineStyle?: "solid" | "dashed";
  yAxis?: AnnotationYAxis;
}

/**
 * The span between two fixed values: a tolerance band on y, a duration or
 * period on x. A bracket draws the span along the plot edge instead of
 * shading it.
 */
export interface BandAnnotation extends AnnotationBase {
  type: "band";
  axis: "x" | "y";
  from: number;
  to: number;
  label?: string;
  display?: "fill" | "bracket";
  yAxis?: AnnotationYAxis;
}

/**
 * Lower and upper bounds that the data supplies for each row, drawn as a
 * ribbon. It shows the bounds as given; `meaning` says what they are, since
 * the chart computes no interval of its own.
 */
export interface IntervalAnnotation extends AnnotationBase {
  type: "interval";
  lowerField: string;
  upperField: string;
  /** What the bounds are, such as "Supplied 90% forecast range". */
  meaning: string;
  yAxis?: AnnotationYAxis;
}

export type ChartAnnotation =
  | CalloutAnnotation
  | ReferenceLineAnnotation
  | BandAnnotation
  | IntervalAnnotation;
export type ChartAnnotationType = ChartAnnotation["type"];

export const ANNOTATION_TYPE_NAMES: Record<ChartAnnotationType, string> = {
  callout: "Callout",
  "reference-line": "Reference line",
  band: "Band",
  interval: "Supplied interval",
};

/** Charts that can draw saved annotations. */
export const ANNOTATION_CHART_TYPES = ["scatter", "line"] as const;

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

const AXIS_NAME = { x: "X", y: "Y" };

/** The words the list and readers use for an annotation. */
export function annotationLabel(annotation: ChartAnnotation) {
  if (annotation.name?.trim()) return annotation.name.trim();
  switch (annotation.type) {
    case "callout":
      return annotation.text.trim() || "Untitled callout";
    case "reference-line":
      return (
        annotation.label?.trim() ||
        `${AXIS_NAME[annotation.axis]} = ${annotation.value}`
      );
    case "band":
      return (
        annotation.label?.trim() ||
        `${AXIS_NAME[annotation.axis]} ${annotation.from} to ${annotation.to}`
      );
    case "interval":
      return (
        annotation.meaning.trim() ||
        `${annotation.lowerField} to ${annotation.upperField}`
      );
  }
}
