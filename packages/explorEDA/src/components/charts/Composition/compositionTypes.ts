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
}

export interface CompositionArtboard {
  width: number;
  height: number;
  /** The paper color. Report graphics keep it in either app theme. */
  background: string;
}

export type CompositionElement = TextElement | UnitElement;

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

export type CompositionScale = PositionScale | ValueScale;
export type ScaleDomain = "shared" | "instance";

export type MarkShape = "rect" | "circle";
export type MarkEncoding = "color" | "size" | "height";
export type MarkAggregation = "count" | "sum" | "average";

/**
 * Draws one glyph per position bin in each repeated unit, from the rows of
 * that unit and bin. The definition is edited once for every repeat.
 */
export interface MarkDefinition {
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

export type RepeatArrangement = "rows" | "columns" | "grid";

/** Splits rows into subsets and draws the unit once for each. */
export interface RepeatRule {
  /** No field draws one unit for all rows. */
  field?: string;
  arrangement: RepeatArrangement;
  /** Units per row in a grid. */
  columns: number;
  gap: number;
  order: "count" | "label";
  /** Most units to draw, in order. */
  limit: number;
}

/** A chart template: a frame, its marks, and the rule that repeats it. */
export interface UnitElement extends ElementBase {
  kind: "unit";
  frame: { width: number; height: number };
  /** Each repeat's subset name, beside a row or above a column. */
  label: { show: boolean; width: number; fontSize: number };
  /** Draw position labels under the units. */
  axis: boolean;
  marks: MarkDefinition[];
  repeat: RepeatRule;
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
  };
}

/** Fills fields that compositions saved by earlier versions lack. */
export function normalizeComposition(
  definition: CompositionDefinition
): CompositionDefinition {
  return definition.scales ? definition : { ...definition, scales: [] };
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

export function newElementId(definition: CompositionDefinition, prefix: string) {
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
      element.kind === "text" && element.role === "note"
        ? max
        : Math.max(
            max,
            element.y +
              (element.kind === "text"
                ? Math.round(element.fontSize * 1.3)
                : element.frame.height)
          ),
    margin
  );
  const labelWidth = 140;
  const element: UnitElement = {
    id: newElementId(definition, "unit"),
    kind: "unit",
    name: uniqueName(definition, "Chart unit"),
    x: margin,
    y: bottom + 20,
    frame: {
      width: definition.artboard.width - margin * 2 - labelWidth,
      height: 18,
    },
    label: { show: true, width: labelWidth, fontSize: 12 },
    axis: true,
    marks: [
      {
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
