/**
 * A composition is a report graphic built on a fixed-size artboard from
 * primitives: text, repeated chart units, and annotations. The definition is
 * plain data, so it saves with the chart and resolves the same way for
 * viewing and output.
 */
export interface CompositionDefinition {
  artboard: CompositionArtboard;
  elements: CompositionElement[];
  /** Named scales that chart units reference, shared across their repeats. */
  scales: CompositionScale[];
  /** Values computed from the data for labels, text, and guides. */
  calculations: CompositionCalculation[];
  /** Saved exceptions for single repeats, kept apart from their template. */
  overrides: InstanceOverride[];
}

/**
 * Visual changes to one repeat of a chart unit. It is keyed by the subset
 * value, not by position, so reordering keeps it on the same repeat. Data
 * bindings, calculations, and scales always come from the template.
 */
export interface InstanceOverride {
  unitId: string;
  instanceKey: string;
  /** A nudge from the automatic layout, in artboard pixels. */
  dx: number;
  dy: number;
  /** Replaces the high end of a color ramp, or the fill of other marks. */
  accent?: string;
  /** Fades the repeat's marks, from 0.1 to 1. */
  opacity?: number;
  /** Bold the repeat's label. */
  emphasize?: boolean;
}

export function findOverride(
  definition: CompositionDefinition,
  unitId: string,
  instanceKey: string
) {
  return definition.overrides.find(
    (item) => item.unitId === unitId && item.instanceKey === instanceKey
  );
}

/** True when an override changes nothing, so it can be dropped. */
export function isEmptyOverride(override: InstanceOverride) {
  return (
    !override.dx &&
    !override.dy &&
    override.accent === undefined &&
    override.opacity === undefined &&
    !override.emphasize
  );
}

export interface CompositionArtboard {
  width: number;
  height: number;
  /** The paper color. Report graphics keep it in either app theme. */
  background: string;
}

export type CompositionElement =
  | TextElement
  | UnitElement
  | GuideElement
  | AnnotationElement;

export type CompositionElementKind = CompositionElement["kind"];

interface ElementBase {
  id: string;
  /** The layer name the inspector lists. */
  name: string;
  /** Top-left corner on the artboard, in artboard pixels. */
  x: number;
  y: number;
}

export type TextRole = "title" | "subtitle" | "note";

export interface TextElement extends ElementBase {
  kind: "text";
  role: TextRole;
  text: string;
  /** Lines wrap at this width. */
  width: number;
  fontSize: number;
  fontWeight: 400 | 600 | 700;
  color: string;
}

export type TimeInterval = "day" | "week" | "month" | "year";

/**
 * Places a field along a frame. A date field bins by its interval; any other
 * field gets one band per distinct value.
 */
export interface PositionScale {
  id: string;
  kind: "position";
  name: string;
  field: string;
  interval?: TimeInterval;
  /** Shared: every repeat uses one domain. Per unit: each fits its own rows. */
  domain: ScaleDomain;
}

/** Maps a mark's aggregated value to color, size, or height. */
export interface ValueScale {
  id: string;
  kind: "value";
  name: string;
  domain: ScaleDomain;
  transform: "linear" | "sqrt" | "log";
  /** The low and high ends of the color ramp. */
  colors: [string, string];
}

/**
 * Maps a numeric field along a frame's width or height. Point and path marks
 * bind one numeric scale to x and one to y, so a circle and a path vertex for
 * the same row always land on the same spot.
 */
export interface NumericScale {
  id: string;
  kind: "numeric";
  name: string;
  field: string;
  /** Shared: every repeat uses one extent. Per unit: each fits its own rows. */
  domain: ScaleDomain;
  /** Extend the extent to include zero. */
  zero: boolean;
  /** Round the extent out to tidy tick values. */
  nice: boolean;
  /** Fixed limits replace the data's extent when set. */
  min?: number;
  max?: number;
}

export type CompositionScale = PositionScale | ValueScale | NumericScale;
export type ScaleDomain = "shared" | "instance";

export type MarkShape = "rect" | "circle";
export type MarkEncoding = "color" | "size" | "height";
export type MarkAggregation = "count" | "sum" | "average";

/**
 * Draws one glyph per position bin in each repeated unit, from the rows of
 * that unit and bin. The definition is edited once for every repeat.
 */
export interface StripMark {
  type: "strip";
  id: string;
  name: string;
  shape: MarkShape;
  positionScaleId: string;
  valueScaleId: string;
  aggregation: MarkAggregation;
  measureField?: string;
  encoding: MarkEncoding;
  /** Fill when the encoding is size or height. */
  fill: string;
  /** Space between neighboring glyphs, in artboard pixels. */
  inset: number;
}

/**
 * Draws one circle per row at numeric x and y. Points share their scales with
 * a path in the same frame, so the path runs through its points.
 */
export interface PointMark {
  type: "point";
  id: string;
  name: string;
  xScaleId: string;
  yScaleId: string;
  /** Orders the rows for `first`/`last` picks and every-nth labels; row order otherwise. */
  orderField?: string;
  radius: number;
  fill: string;
  /** Label each point with this field's value. */
  labelField?: string;
  /** Label every nth point in order; 1 labels all, 0 labels none. */
  labelEvery: number;
  /** Which rows draw: every row, or only the first, last, lowest, or highest. */
  show?: PointShow;
}

export type PointShow = "all" | "first" | "last" | "min" | "max";

/**
 * Connects a repeat's rows in the order of one field, such as year, into one
 * path. A row with a missing x, y, or order value breaks the path there.
 */
export interface PathMark {
  type: "path";
  id: string;
  name: string;
  xScaleId: string;
  yScaleId: string;
  orderField: string;
  stroke: string;
  strokeWidth: number;
}

/**
 * Fills the area between two fields along x, in the order of one field: a
 * supplied interval such as a forecast's 10th to 90th percentile. Several
 * bands layer in drawing order, so the widest goes first. A row with a
 * missing bound breaks the band there.
 */
export interface BandMark {
  type: "band";
  id: string;
  name: string;
  xScaleId: string;
  yScaleId: string;
  orderField: string;
  lowerField: string;
  upperField: string;
  fill: string;
  /** From 0.05 to 1. */
  opacity: number;
}

export type MarkDefinition = StripMark | PointMark | PathMark | BandMark;
export type MarkType = MarkDefinition["type"];

/** The scales a mark reads, by ID. */
export function markScaleIds(mark: MarkDefinition): string[] {
  return mark.type === "strip"
    ? [mark.positionScaleId, mark.valueScaleId]
    : [mark.xScaleId, mark.yScaleId];
}

/** The fields a mark reads, beyond its scales. */
export function markFields(mark: MarkDefinition): string[] {
  switch (mark.type) {
    case "strip":
      return mark.measureField ? [mark.measureField] : [];
    case "point":
      return [mark.orderField, mark.labelField].filter(
        (field): field is string => Boolean(field)
      );
    case "path":
      return [mark.orderField];
    case "band":
      return [mark.orderField, mark.lowerField, mark.upperField];
  }
}

export type RepeatArrangement = "rows" | "columns" | "grid";

/** Splits rows into subsets and draws the unit once for each. */
export interface RepeatRule {
  /** No field draws one unit for all rows. */
  field?: string;
  arrangement: RepeatArrangement;
  /** Units per row in a grid. */
  columns: number;
  gap: number;
  /** Most rows first, A–Z by label, or by a per-repeat calculation's value. */
  order: RepeatOrder;
  /** The calculation whose value orders the repeats, for the value order. */
  orderCalcId?: string;
  /** Ascending unless set. */
  direction?: "asc" | "desc";
  /** Most units to draw, in order. */
  limit: number;
}

export type RepeatOrder = "count" | "label" | "value";

/** A chart template: a frame, its marks, and the rule that repeats it. */
export interface UnitElement extends ElementBase {
  kind: "unit";
  frame: { width: number; height: number };
  /** Each repeat's subset name, beside a row or above a column. */
  label: {
    show: boolean;
    width: number;
    fontSize: number;
    /** A calculation shown beside each repeat's name. */
    valueCalcId?: string;
  };
  /** Draw position labels under the units. */
  axis: boolean;
  marks: MarkDefinition[];
  repeat: RepeatRule;
}

export type CalcAggregation =
  | "count"
  | "sum"
  | "average"
  | "min"
  | "max"
  | "first"
  | "last"
  | "change";

/**
 * One value from the data. Population and filter policy are separate
 * choices: a value can cover each repeat or the whole graphic, and it can
 * follow the active filters or ignore them.
 */
export interface CompositionCalculation {
  id: string;
  name: string;
  aggregation: CalcAggregation;
  field?: string;
  /**
   * Orders the rows for first, last, and change: the field's value in the
   * first row, in the last row, or the change from first to last as a share
   * of the first. Row order when unset.
   */
  orderField?: string;
  /** Each repeat's own rows, or every row in the composition. */
  population: "repeat" | "composition";
  filters: "follow" | "ignore";
}

export type GuideValue =
  | { kind: "constant"; value: string }
  | { kind: "calc"; calcId: string };

/**
 * A rule across a chart unit's frames at one position, such as a date. The
 * element's x and y offset its label from the top of the rule.
 */
export interface GuideElement extends ElementBase {
  kind: "guide";
  unitId: string;
  value: GuideValue;
  label: string;
  color: string;
  /** A vertical rule at an x value, or a horizontal rule at a numeric y value. */
  axis?: "x" | "y";
  /** Tint the frame on one side of the rule, such as a projection period. */
  shade?: "none" | "after" | "before";
}

/** Where an annotation attaches. */
export type AnnotationAnchor =
  /** A fixed point on the page: the element's x and y. */
  | { kind: "page" }
  /** A point in one repeat's frame, as fractions of its width and height. */
  | {
      kind: "frame";
      unitId: string;
      instanceKey: string;
      fx: number;
      fy: number;
    }
  /** A glyph chosen from the data, which the annotation follows as data change. */
  | {
      kind: "data";
      unitId: string;
      instanceKey: string;
      markId: string;
      pick: AnchorPick;
      /** The glyph whose label equals this, for the `at` pick, such as a year. */
      at?: string;
    };

export type AnchorPick = "max" | "min" | "first" | "last" | "at";

/**
 * Text attached to the page, a frame, or a data mark. For frame and data
 * anchors, x and y are a visual offset from the anchor point, so a nudge
 * keeps the attachment.
 */
export interface AnnotationElement extends ElementBase {
  kind: "annotation";
  text: string;
  anchor: AnnotationAnchor;
  fontSize: number;
  color: string;
  /** Draw a line from the anchor point to the text. */
  leader: boolean;
}

export const COMPOSITION_FONT =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const INK = "#1f2328";
export const MUTED_INK = "#5f6368";
export const PAPER = "#ffffff";

export function createEmptyComposition(): CompositionDefinition {
  return {
    artboard: { width: 960, height: 600, background: PAPER },
    elements: [],
    scales: [],
    calculations: [],
    overrides: [],
  };
}

/** Fills fields that compositions saved by earlier versions lack. */
export function normalizeComposition(
  definition: CompositionDefinition
): CompositionDefinition {
  // Marks saved before point and path marks existed are strips.
  const untyped = definition.elements.some(
    (element) =>
      element.kind === "unit" &&
      element.marks.some((mark) => !(mark as Partial<MarkDefinition>).type)
  );
  if (
    definition.scales &&
    definition.calculations &&
    definition.overrides &&
    !untyped
  )
    return definition;
  return {
    ...definition,
    elements: untyped
      ? definition.elements.map((element) =>
          element.kind === "unit"
            ? {
                ...element,
                marks: element.marks.map((mark) =>
                  (mark as Partial<MarkDefinition>).type
                    ? mark
                    : ({ ...mark, type: "strip" } as StripMark)
                ),
              }
            : element
        )
      : definition.elements,
    scales: definition.scales ?? [],
    calculations: definition.calculations ?? [],
    overrides: definition.overrides ?? [],
  };
}

const TEXT_DEFAULTS: Record<
  TextRole,
  Pick<TextElement, "name" | "text" | "fontSize" | "fontWeight" | "color">
> = {
  title: {
    name: "Title",
    text: "Title",
    fontSize: 26,
    fontWeight: 700,
    color: INK,
  },
  subtitle: {
    name: "Subtitle",
    text: "Subtitle",
    fontSize: 15,
    fontWeight: 400,
    color: MUTED_INK,
  },
  note: {
    name: "Note",
    text: "Source: ",
    fontSize: 11,
    fontWeight: 400,
    color: MUTED_INK,
  },
};

/**
 * A new text element sits below the text already on the page, so adding a
 * title then a subtitle stacks them without manual placement.
 */
export function createTextElement(
  definition: CompositionDefinition,
  role: TextRole
): TextElement {
  const margin = 32;
  const texts = definition.elements.filter(
    (element): element is TextElement => element.kind === "text"
  );
  const bottom = texts.reduce(
    (max, element) =>
      Math.max(max, element.y + Math.round(element.fontSize * 1.3)),
    margin - 8
  );
  const y =
    role === "note"
      ? definition.artboard.height - margin
      : texts.length
        ? bottom + 8
        : margin;
  const defaults = TEXT_DEFAULTS[role];
  return {
    id: newElementId(definition, role),
    kind: "text",
    role,
    ...defaults,
    name: uniqueName(definition, defaults.name),
    x: margin,
    y,
    width: definition.artboard.width - margin * 2,
  };
}

export function newElementId(
  definition: CompositionDefinition,
  prefix: string
) {
  const ids = new Set(definition.elements.map((element) => element.id));
  let index = 1;
  while (ids.has(`${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}

function uniqueName(definition: CompositionDefinition, base: string) {
  const names = new Set(definition.elements.map((element) => element.name));
  if (!names.has(base)) return base;
  let index = 2;
  while (names.has(`${base} ${index}`)) index += 1;
  return `${base} ${index}`;
}

export function newScaleId(definition: CompositionDefinition, prefix: string) {
  const ids = new Set(definition.scales.map((scale) => scale.id));
  let index = 1;
  while (ids.has(`${prefix}-${index}`)) index += 1;
  return `${prefix}-${index}`;
}

export interface FieldChoice {
  name: string;
  dataType: "numeric" | "categorical" | "datetime" | "boolean";
  uniqueCount: number;
}

/**
 * A new chart unit draws one strip of squares: the first date field by month,
 * or else the first category, colored by row count. It sits below existing
 * elements and reuses scales already on the page for the same field.
 */
export function createUnitElement(
  definition: CompositionDefinition,
  fields: FieldChoice[]
): { definition: CompositionDefinition; element: UnitElement } | undefined {
  const date = fields.find((field) => field.dataType === "datetime");
  const category = fields.find(
    (field) => field.dataType !== "datetime" && field.uniqueCount <= 60
  );
  const positionField = date ?? category;
  if (!positionField) return undefined;
  const scales = [...definition.scales];
  let position = scales.find(
    (scale): scale is PositionScale =>
      scale.kind === "position" && scale.field === positionField.name
  );
  if (!position) {
    position = {
      id: newScaleId({ ...definition, scales }, "x"),
      kind: "position",
      name: date ? `${positionField.name} by month` : positionField.name,
      field: positionField.name,
      interval: date ? "month" : undefined,
      domain: "shared",
    };
    scales.push(position);
  }
  let value = scales.find(
    (scale): scale is ValueScale => scale.kind === "value"
  );
  if (!value) {
    value = {
      id: newScaleId({ ...definition, scales }, "value"),
      kind: "value",
      name: "Rows",
      domain: "shared",
      // A few busy months would otherwise wash out every typical month.
      transform: "log",
      colors: ["#f4e9df", "#a3241d"],
    };
    scales.push(value);
  }
  const margin = 32;
  const bottom = definition.elements.reduce(
    (max, element) =>
      element.kind === "text" && element.role !== "note"
        ? Math.max(max, element.y + Math.round(element.fontSize * 1.3))
        : element.kind === "unit"
          ? Math.max(max, element.y + element.frame.height)
          : max,
    margin
  );
  const labelWidth = 140;
  const element: UnitElement = {
    id: newElementId(definition, "unit"),
    kind: "unit",
    name: uniqueName(definition, "Chart unit"),
    x: margin,
    // Room above the first repeat for callouts.
    y: bottom + 32,
    frame: {
      width: definition.artboard.width - margin * 2 - labelWidth,
      height: 18,
    },
    label: { show: true, width: labelWidth, fontSize: 12 },
    axis: true,
    marks: [
      {
        type: "strip",
        id: "mark-1",
        name: "Squares",
        shape: "rect",
        positionScaleId: position.id,
        valueScaleId: value.id,
        aggregation: "count",
        encoding: "color",
        fill: "#3b6ea8",
        inset: 1,
      },
    ],
    repeat: {
      arrangement: "rows",
      columns: 3,
      gap: 6,
      order: "count",
      limit: 24,
    },
  };
  return { definition: { ...definition, scales }, element };
}

export function newMarkId(unit: Pick<UnitElement, "marks">) {
  const ids = new Set(unit.marks.map((mark) => mark.id));
  let index = 1;
  while (ids.has(`mark-${index}`)) index += 1;
  return `mark-${index}`;
}

/** Finds the numeric scale on a field, or adds one, and returns both. */
export function ensureNumericScale(
  definition: CompositionDefinition,
  field: string
): { definition: CompositionDefinition; scale: NumericScale } {
  const existing = definition.scales.find(
    (scale): scale is NumericScale =>
      scale.kind === "numeric" && scale.field === field
  );
  if (existing) return { definition, scale: existing };
  const scale: NumericScale = {
    id: newScaleId(definition, "n"),
    kind: "numeric",
    name: field,
    field,
    domain: "shared",
    zero: false,
    nice: true,
  };
  return {
    definition: { ...definition, scales: [...definition.scales, scale] },
    scale,
  };
}

/**
 * A new x–y unit draws a path through the rows in the order of one numeric
 * field, with a point on every row: a connected scatterplot. It takes the
 * first numeric field as the order and x, and the next as y.
 */
export function createXyUnitElement(
  definition: CompositionDefinition,
  fields: FieldChoice[]
): { definition: CompositionDefinition; element: UnitElement } | undefined {
  const numeric = fields.filter((field) => field.dataType === "numeric");
  // A sequence field such as year orders the path; the other two are x and y.
  const order =
    numeric.find((field) =>
      /year|date|time|index|order|seq/i.test(field.name)
    ) ?? numeric[0];
  const rest = numeric.filter((field) => field !== order);
  const xField = rest[0] ?? order;
  const yField = rest[1] ?? rest[0] ?? order;
  if (!order || !xField || !yField || numeric.length < 2) return undefined;
  const withX = ensureNumericScale(definition, xField.name);
  const withY = ensureNumericScale(withX.definition, yField.name);
  const margin = 32;
  const bottom = definition.elements.reduce(
    (max, element) =>
      element.kind === "text" && element.role !== "note"
        ? Math.max(max, element.y + Math.round(element.fontSize * 1.3))
        : element.kind === "unit"
          ? Math.max(max, element.y + element.frame.height)
          : max,
    margin
  );
  // Room on the left for y-axis labels and below for x-axis labels.
  const axisGutter = 56;
  const element: UnitElement = {
    id: newElementId(definition, "unit"),
    kind: "unit",
    name: uniqueName(definition, "X–Y unit"),
    x: margin + axisGutter,
    y: bottom + 24,
    frame: {
      width: definition.artboard.width - margin * 2 - axisGutter,
      height: Math.max(
        120,
        definition.artboard.height - bottom - 24 - margin - 40
      ),
    },
    label: { show: false, width: 0, fontSize: 12 },
    axis: true,
    marks: [
      {
        type: "path",
        id: "mark-1",
        name: "Path",
        xScaleId: withX.scale.id,
        yScaleId: withY.scale.id,
        orderField: order.name,
        stroke: INK,
        strokeWidth: 1.5,
      },
      {
        type: "point",
        id: "mark-2",
        name: "Points",
        xScaleId: withX.scale.id,
        yScaleId: withY.scale.id,
        orderField: order.name,
        radius: 3.5,
        fill: INK,
        labelField: order.name,
        labelEvery: 0,
      },
    ],
    repeat: {
      arrangement: "rows",
      columns: 3,
      gap: 6,
      order: "count",
      limit: 24,
    },
  };
  return { definition: withY.definition, element };
}

export function newCalculationId(definition: CompositionDefinition) {
  const ids = new Set(definition.calculations.map((calc) => calc.id));
  let index = 1;
  while (ids.has(`calc-${index}`)) index += 1;
  return `calc-${index}`;
}

export function createGuideElement(
  definition: CompositionDefinition,
  unit: UnitElement
): GuideElement {
  return {
    id: newElementId(definition, "guide"),
    kind: "guide",
    name: uniqueName(definition, "Guide"),
    x: 0,
    y: 0,
    unitId: unit.id,
    value: { kind: "constant", value: "" },
    label: "",
    color: "#1f2328",
  };
}

export function createAnnotationElement(
  definition: CompositionDefinition,
  unit: UnitElement | undefined,
  instanceKey: string | undefined
): AnnotationElement {
  // A path has no glyphs to follow, so prefer a strip or point mark.
  const mark =
    unit?.marks.find((item) => item.type !== "path") ?? unit?.marks[0];
  const base = {
    id: newElementId(definition, "note"),
    kind: "annotation" as const,
    name: uniqueName(definition, "Annotation"),
    fontSize: 12,
    color: INK,
    leader: true,
  };
  if (unit && mark && instanceKey !== undefined)
    return {
      ...base,
      text:
        mark.type === "point"
          ? "Highest point: {label} ({x}, {y})"
          : "Busiest month: {label} ({value})",
      x: 14,
      y: -20,
      anchor: {
        kind: "data",
        unitId: unit.id,
        instanceKey,
        markId: mark.id,
        pick: "max",
      },
    };
  return {
    ...base,
    text: "Annotation",
    x: definition.artboard.width / 2,
    y: definition.artboard.height / 2,
    leader: false,
    anchor: { kind: "page" },
  };
}
