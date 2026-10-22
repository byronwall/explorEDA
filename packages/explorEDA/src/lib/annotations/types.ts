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

/**
 * Which rows a calculation reads. "all" is every row the chart can draw,
 * whatever the interactive filters say; "filtered" follows the current
 * selection. Both respect the chart's own row limits.
 */
export type AnnotationPopulation = "all" | "filtered";

/**
 * Whichever row currently has the largest or smallest value. Unlike a record
 * attachment, its subject may change as rows or filters change, by design.
 */
export interface QueryAttachment {
  kind: "query";
  pick: "max" | "min";
  /** The measure compared; the chart's y measure when unset. */
  field?: string;
  population: AnnotationPopulation;
}

/**
 * One aggregate mark, such as a bar, found by its category value. A bar sums
 * many rows, so it is never treated as one record.
 */
export interface CategoryAttachment {
  kind: "category";
  value: string;
}

export type CalloutAttachment =
  | RecordAttachment
  | CoordinateAttachment
  | QueryAttachment
  | CategoryAttachment;

export type AnnotationStatistic = "mean" | "median" | "min" | "max";

/** A value calculated from the chart's rows instead of typed in. */
export interface CalculatedValue {
  statistic: AnnotationStatistic;
  population: AnnotationPopulation;
}

/** Which vertical axis a y value reads on, for charts with a right axis. */
export type AnnotationYAxis = "left" | "right";

interface AnnotationBase {
  id: string;
  /** Shown in the annotation list; the content stands in when blank. */
  name?: string;
  hidden?: boolean;
  /** A CSS color; the theme's foreground when unset. */
  color?: string;
  /**
   * On a faceted chart, the one panel it draws in, by the panel's facet
   * values. Every panel when unset. Panel order never matters.
   */
  facet?: string;
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
  /** The fixed value; ignored while `calculated` is set. */
  value: number;
  /** Calculate the value from the field on this axis instead. */
  calculated?: CalculatedValue;
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

/**
 * An area of the plot in data units. It means "this region": filtering can
 * change which marks fall inside it, unlike a record set.
 */
export interface RegionAnnotation extends AnnotationBase {
  type: "region";
  shape: "rect" | "ellipse";
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  label?: string;
  yAxis?: AnnotationYAxis;
}

/**
 * Saved records, each found by its key. It means "these records": membership
 * never changes with filters or with where the records are drawn.
 */
export interface RecordSetAnnotation extends AnnotationBase {
  type: "record-set";
  keyFields: string[];
  keys: AnnotationKeyValue[][];
  label?: string;
  /** The measure that places each record, as for a record callout. */
  yField?: string;
}

export type ChartAnnotation =
  | CalloutAnnotation
  | ReferenceLineAnnotation
  | BandAnnotation
  | IntervalAnnotation
  | RegionAnnotation
  | RecordSetAnnotation;
export type ChartAnnotationType = ChartAnnotation["type"];

export const ANNOTATION_TYPE_NAMES: Record<ChartAnnotationType, string> = {
  callout: "Callout",
  "reference-line": "Reference line",
  band: "Band",
  interval: "Supplied interval",
  region: "Region",
  "record-set": "Saved records",
};

/** Charts that can draw saved annotations. */
export const ANNOTATION_CHART_TYPES = [
  "scatter",
  "line",
  "bar",
  "row",
  "boxplot",
  "ecdf",
  "heatmap",
  "calendar",
] as const;

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

export const STATISTIC_NAMES: Record<AnnotationStatistic, string> = {
  mean: "Mean",
  median: "Median",
  min: "Minimum",
  max: "Maximum",
};

export const POPULATION_NAMES: Record<AnnotationPopulation, string> = {
  all: "all rows",
  filtered: "filtered rows",
};

/** The words the list and readers use for an annotation. */
export function annotationLabel(annotation: ChartAnnotation) {
  if (annotation.name?.trim()) return annotation.name.trim();
  switch (annotation.type) {
    case "callout":
      return annotation.text.trim() || "Untitled callout";
    case "reference-line":
      return (
        annotation.label?.trim() ||
        (annotation.calculated
          ? `${STATISTIC_NAMES[annotation.calculated.statistic]} of ${AXIS_NAME[annotation.axis]}`
          : `${AXIS_NAME[annotation.axis]} = ${annotation.value}`)
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
    case "region":
      return (
        annotation.label?.trim() ||
        (annotation.shape === "ellipse" ? "Ellipse" : "Rectangle")
      );
    case "record-set":
      return (
        annotation.label?.trim() ||
        `${annotation.keys.length.toLocaleString()} saved records`
      );
  }
}
