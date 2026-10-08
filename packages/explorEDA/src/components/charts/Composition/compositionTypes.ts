/**
 * A composition is a report graphic built on a fixed-size artboard from
 * primitives: text, repeated chart units, and annotations. The definition is
 * plain data, so it saves with the chart and resolves the same way for
 * viewing and output.
 */
export interface CompositionDefinition {
  artboard: CompositionArtboard;
  elements: CompositionElement[];
}

export interface CompositionArtboard {
  width: number;
  height: number;
  /** The paper color. Report graphics keep it in either app theme. */
  background: string;
}

export type CompositionElement = TextElement;

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

export const COMPOSITION_FONT =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const INK = "#1f2328";
export const MUTED_INK = "#5f6368";
export const PAPER = "#ffffff";

export function createEmptyComposition(): CompositionDefinition {
  return {
    artboard: { width: 960, height: 600, background: PAPER },
    elements: [],
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
