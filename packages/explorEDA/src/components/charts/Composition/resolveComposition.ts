import { timestampOf } from "@/lib/valueParsing";
import {
  evaluateCalc,
  fillCalcTokens,
  formatCalcValue,
  type CalcResult,
} from "./calculations";
import type {
  AnnotationElement,
  CompositionDefinition,
  CompositionElement,
  GuideElement,
  TextElement,
} from "./compositionTypes";
import {
  numericPixel,
  periodKey,
  periodStart,
  resolveUnit,
  type BandDatum,
  type CompositionData,
  type GlyphDatum,
  type PathDatum,
  type ResolvedInstance,
  type ResolvedUnit,
} from "./resolveUnit";

/** Measures one line of text at a size and weight, in pixels. */
export type MeasureText = (
  text: string,
  fontSize: number,
  fontWeight: number
) => number;

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface NodeBase {
  /** Unique within the scene. */
  key: string;
  /** The element whose definition drew this node. */
  elementId: string;
  /** The repeat that drew this node, for chart units. */
  instanceKey?: string;
  opacity?: number;
  /** Clip the node to this box, such as a frame with fixed scale limits. */
  clip?: Bounds;
  /** Draw beneath every other node, such as a guide's shaded region. */
  under?: boolean;
}

export interface TextNode extends NodeBase {
  type: "text";
  x: number;
  /** Baseline of each line. */
  lines: { text: string; y: number }[];
  fontSize: number;
  fontWeight: number;
  fill: string;
  anchor: "start" | "middle" | "end";
  /** A paper-colored outline that keeps text legible over marks. */
  halo?: string;
}

export interface RectNode extends NodeBase {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  glyph?: GlyphDatum;
}

export interface CircleNode extends NodeBase {
  type: "circle";
  cx: number;
  cy: number;
  r: number;
  fill: string;
  /** An outline instead of a fill, such as an anchor ring. */
  stroke?: string;
  glyph?: GlyphDatum;
}

export interface LineNode extends NodeBase {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  dash?: string;
}

/** One path through ordered points, drawn as connected runs. */
export interface PathNode extends NodeBase {
  type: "path";
  /** Connected runs of vertices; a gap in the data starts a new run. */
  segments: { x: number; y: number; rowId: number }[][];
  stroke: string;
  strokeWidth: number;
  path: PathDatum;
}

/** The area between two bounds along ordered points, drawn as connected runs. */
export interface AreaNode extends NodeBase {
  type: "area";
  segments: { x: number; y0: number; y1: number; rowId: number }[][];
  fill: string;
  fillOpacity: number;
  band: BandDatum;
}

export type SceneNode =
  | TextNode
  | RectNode
  | CircleNode
  | LineNode
  | PathNode
  | AreaNode;

/** Why a guide or annotation sits where it does. */
export interface ResolvedAnchor {
  kind: "page" | "frame" | "data" | "guide";
  /** The anchor point before any offset. */
  point: { x: number; y: number };
  /** The values a guide was placed at, one per repeat or one for all. */
  values?: CalcResult[];
  /** The glyph a data anchor follows. */
  glyph?: GlyphDatum;
  /** Set when the anchor's target is not drawn, such as a filtered-out repeat. */
  missing?: string;
}

/** One element as drawn, with the box that selects and moves it. */
export interface ResolvedElement {
  id: string;
  kind: CompositionElement["kind"];
  name: string;
  bounds: Bounds;
  /** Each repeat of a chart unit. */
  instances?: ResolvedInstance[];
  anchor?: ResolvedAnchor;
}

export interface CompositionScene {
  width: number;
  height: number;
  background: string;
  nodes: SceneNode[];
  elements: ResolvedElement[];
}

export const NO_DATA: CompositionData = {
  allIds: [],
  liveIds: [],
  column: () => ({}),
};

/**
 * Resolves a definition into the nodes the artboard draws. Viewing, editing,
 * and PNG output all draw this one scene.
 */
export function resolveComposition(
  definition: CompositionDefinition,
  measureText: MeasureText,
  data: CompositionData = NO_DATA
): CompositionScene {
  // Units resolve first, so guides and annotations can find their frames.
  const units = new Map<string, ResolvedUnit>();
  for (const element of definition.elements)
    if (element.kind === "unit")
      units.set(element.id, resolveUnit(definition, element, data));

  const nodes: SceneNode[] = [];
  const elements: ResolvedElement[] = [];
  for (const element of definition.elements) {
    switch (element.kind) {
      case "text": {
        const node = resolveText(element, measureText, definition, data);
        nodes.push(node);
        elements.push({
          id: element.id,
          kind: element.kind,
          name: element.name,
          bounds: textBounds(element, node),
        });
        break;
      }
      case "unit": {
        const unit = units.get(element.id)!;
        nodes.push(...unit.nodes);
        elements.push({
          id: element.id,
          kind: element.kind,
          name: element.name,
          bounds: unit.bounds,
          instances: unit.instances,
        });
        break;
      }
      case "guide": {
        const guide = resolveGuide(
          element,
          definition,
          data,
          units,
          measureText
        );
        nodes.push(...guide.nodes);
        elements.push({
          id: element.id,
          kind: element.kind,
          name: element.name,
          bounds: guide.bounds,
          anchor: guide.anchor,
        });
        break;
      }
      case "annotation": {
        const note = resolveAnnotation(
          element,
          units,
          measureText,
          definition,
          data
        );
        nodes.push(...note.nodes);
        elements.push({
          id: element.id,
          kind: element.kind,
          name: element.name,
          bounds: note.bounds,
          anchor: note.anchor,
        });
        break;
      }
    }
  }
  return {
    width: definition.artboard.width,
    height: definition.artboard.height,
    background: definition.artboard.background,
    // Shaded regions go beneath the marks they sit behind, whatever the
    // element order, so a projection tint never covers a band or a click.
    nodes: [
      ...nodes.filter((node) => node.under),
      ...nodes.filter((node) => !node.under),
    ],
    elements,
  };
}

export function lineHeight(fontSize: number) {
  return Math.round(fontSize * 1.25);
}

function resolveText(
  element: TextElement,
  measureText: MeasureText,
  definition: CompositionDefinition,
  data: CompositionData
): TextNode {
  const lines = wrapText(
    fillCalcTokens(element.text, definition, data),
    element.width,
    element.fontSize,
    element.fontWeight,
    measureText
  );
  const step = lineHeight(element.fontSize);
  return {
    type: "text",
    key: element.id,
    elementId: element.id,
    x: element.x,
    lines: lines.map((text, index) => ({
      text,
      // The first baseline sits one ascent below the element's top.
      y: element.y + Math.round(element.fontSize * 0.95) + index * step,
    })),
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    fill: element.color,
    anchor: "start",
  };
}

function textBounds(element: TextElement, node: TextNode): Bounds {
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: Math.max(1, node.lines.length) * lineHeight(element.fontSize),
  };
}

/** Breaks text at spaces so each line fits the width. Newlines always break. */
export function wrapText(
  text: string,
  width: number,
  fontSize: number,
  fontWeight: number,
  measureText: MeasureText
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measureText(candidate, fontSize, fontWeight) > width) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * The x of a value on a repeat's position scale, at the middle of its bin, or
 * along its numeric x scale.
 */
export function positionX(
  instance: ResolvedInstance,
  value: { number?: number; text?: string }
): number | undefined {
  const position = instance.position;
  if (!position && instance.xy) {
    const number =
      value.number ??
      (value.text?.trim() ? Number(value.text.trim()) : undefined);
    if (number === undefined || !Number.isFinite(number)) return undefined;
    const [min, max] = instance.xy.x.domain;
    if (number < min || number > max) return undefined;
    return numericPixel(instance.xy.x, number);
  }
  if (!position || !position.bins.length) return undefined;
  let key: string | undefined;
  if (position.scale.interval) {
    const time = timestampOf(value.number) ?? timestampOf(value.text);
    if (time === undefined) return undefined;
    key = periodKey(periodStart(time, position.scale.interval));
  } else {
    key =
      value.text ??
      (value.number === undefined ? undefined : String(value.number));
  }
  const index = position.bins.findIndex((bin) => bin.key === key);
  if (index < 0) return undefined;
  const band = instance.frame.width / position.bins.length;
  return instance.frame.x + (index + 0.5) * band;
}

/** The y of a numeric value on a repeat's y scale, for horizontal guides. */
export function positionY(
  instance: ResolvedInstance,
  value: { number?: number; text?: string }
): number | undefined {
  if (!instance.xy) return undefined;
  const number =
    value.number ??
    (value.text?.trim() ? Number(value.text.trim()) : undefined);
  if (number === undefined || !Number.isFinite(number)) return undefined;
  const [min, max] = instance.xy.y.domain;
  if (number < min || number > max) return undefined;
  return numericPixel(instance.xy.y, number);
}

const emptyBounds = (x: number, y: number): Bounds => ({
  x,
  y,
  width: 24,
  height: 16,
});

function resolveGuide(
  guide: GuideElement,
  definition: CompositionDefinition,
  data: CompositionData,
  units: Map<string, ResolvedUnit>,
  measureText: MeasureText
) {
  const nodes: SceneNode[] = [];
  const unit = units.get(guide.unitId);
  const value = guide.value;
  const calc =
    value.kind === "calc"
      ? definition.calculations.find((item) => item.id === value.calcId)
      : undefined;
  if (!unit || !unit.instances.length)
    return {
      nodes,
      bounds: emptyBounds(guide.x, guide.y),
      anchor: {
        kind: "guide" as const,
        point: { x: guide.x, y: guide.y },
        missing: "The guide's chart unit is not on the page.",
      },
    };
  const perRepeat = calc?.population === "repeat";
  const values: CalcResult[] = [];
  // A rule per repeat when each repeat has its own value; otherwise one rule.
  const groups = perRepeat
    ? unit.instances.map((instance) => [instance])
    : [unit.instances];
  let label: { x: number; y: number; text: string } | undefined;
  const horizontal = guide.axis === "y";
  groups.forEach((group, index) => {
    const first = group[0]!;
    let x: number | undefined;
    let text = guide.label;
    const place = (input: { number?: number; text?: string }) =>
      horizontal ? positionY(first, input) : positionX(first, input);
    if (value.kind === "constant") {
      x = place({ text: value.value });
    } else if (calc) {
      const result = evaluateCalc(calc, data, perRepeat ? first : undefined);
      values.push(result);
      if (result.value !== undefined)
        x = place(
          result.kind === "date"
            ? { number: result.value }
            : { text: String(result.value) }
        );
      text = text.replace(/\{value\}/g, result.text);
    }
    if (x === undefined) return;
    if (horizontal) {
      // A horizontal rule per frame, with the shade above or below it.
      group.forEach((item, part) => {
        if (guide.shade && guide.shade !== "none") {
          const above = guide.shade === "after";
          nodes.push({
            type: "rect",
            key: `${guide.id}:${index}:${part}:shade`,
            elementId: guide.id,
            instanceKey: perRepeat ? first.key : undefined,
            x: item.frame.x,
            y: above ? item.frame.y : x,
            width: item.frame.width,
            height: above
              ? x - item.frame.y
              : item.frame.y + item.frame.height - x,
            fill: guide.color,
            opacity: 0.08,
            under: true,
          });
        }
        nodes.push({
          type: "line",
          key: `${guide.id}:${index}:${part}`,
          elementId: guide.id,
          instanceKey: perRepeat ? first.key : undefined,
          x1: item.frame.x - 3,
          x2: item.frame.x + item.frame.width + 3,
          y1: x,
          y2: x,
          stroke: guide.color,
          strokeWidth: 1.25,
          dash: "4 3",
        });
      });
      if (text && !label)
        label = {
          x: first.frame.x + 4 + guide.x,
          y: x - 5 + guide.y,
          text,
        };
      return;
    }
    if (guide.shade && guide.shade !== "none")
      group.forEach((item, part) => {
        const after = guide.shade === "after";
        nodes.push({
          type: "rect",
          key: `${guide.id}:${index}:${part}:shade`,
          elementId: guide.id,
          instanceKey: perRepeat ? first.key : undefined,
          x: after ? x + (item.frame.x - first.frame.x) : item.frame.x,
          y: item.frame.y,
          width: after
            ? item.frame.x +
              item.frame.width -
              (x + (item.frame.x - first.frame.x))
            : x + (item.frame.x - first.frame.x) - item.frame.x,
          height: item.frame.height,
          fill: guide.color,
          opacity: 0.08,
          under: true,
        });
      });
    // Repeats stacked in one column share a rule that runs through the gaps.
    const segments = group.every((item) => item.frame.x === first.frame.x)
      ? [
          {
            top: Math.min(...group.map((item) => item.frame.y)),
            bottom: Math.max(
              ...group.map((item) => item.frame.y + item.frame.height)
            ),
            offset: 0,
          },
        ]
      : group.map((item) => ({
          top: item.frame.y,
          bottom: item.frame.y + item.frame.height,
          offset: item.frame.x - first.frame.x,
        }));
    segments.forEach((segment, part) => {
      nodes.push({
        type: "line",
        key: `${guide.id}:${index}:${part}`,
        elementId: guide.id,
        instanceKey: perRepeat ? first.key : undefined,
        x1: x + segment.offset,
        x2: x + segment.offset,
        y1: segment.top - 3,
        y2: segment.bottom + 3,
        stroke: guide.color,
        strokeWidth: 1.25,
        dash: "4 3",
      });
    });
    // The label sits under the rule, below any position labels.
    if (text && !label)
      label = {
        x: x + 4 + guide.x,
        y: segments[segments.length - 1]!.bottom + 30 + guide.y,
        text,
      };
  });
  if (label)
    nodes.push({
      type: "text",
      key: `${guide.id}:label`,
      elementId: guide.id,
      x: label.x,
      lines: [{ text: label.text, y: label.y }],
      fontSize: 11,
      fontWeight: 600,
      fill: guide.color,
      anchor: "start",
    });
  const lines = nodes.filter((node): node is LineNode => node.type === "line");
  if (!lines.length)
    return {
      nodes,
      bounds: emptyBounds(unit.bounds.x, unit.bounds.y),
      anchor: {
        kind: "guide" as const,
        point: { x: unit.bounds.x, y: unit.bounds.y },
        values,
        missing: horizontal
          ? "The guide's value falls outside the unit's y scale."
          : "The guide's value falls outside the unit's position scale.",
      },
    };
  const left = Math.min(
    ...lines.flatMap((line) => [line.x1, line.x2]),
    label?.x ?? Infinity
  );
  const right = Math.max(
    ...lines.flatMap((line) => [line.x1, line.x2]),
    label ? label.x + measureText(label.text, 11, 600) : -Infinity
  );
  const top = Math.min(
    ...lines.flatMap((line) => [line.y1, line.y2]),
    label ? label.y - 11 : Infinity
  );
  const bottom = Math.max(
    ...lines.flatMap((line) => [line.y1, line.y2]),
    label ? label.y + 3 : -Infinity
  );
  return {
    nodes,
    bounds: {
      x: left - 3,
      y: top,
      width: Math.max(6, right - left + 6),
      height: bottom - top,
    },
    anchor: {
      kind: "guide" as const,
      point: { x: lines[0]!.x1, y: lines[0]!.y1 },
      values,
    },
  };
}

/** True when a glyph's label, or its order value, equals the `at` text. */
function matchesAt(glyph: GlyphDatum, at: string | undefined) {
  const wanted = at?.trim().toLowerCase();
  if (!wanted) return false;
  return (
    glyph.bin.label.trim().toLowerCase() === wanted ||
    glyph.bin.key.trim().toLowerCase() === wanted
  );
}

/** Replaces `{label}`, `{value}`, `{x}`, and `{y}` with a glyph's values. */
export function fillGlyphTokens(text: string, glyph: GlyphDatum) {
  return text
    .replace(/\{value\}/g, formatCalcValue(glyph.value, "number"))
    .replace(/\{label\}/g, glyph.bin.label)
    .replace(
      /\{x\}/g,
      glyph.point ? formatCalcValue(glyph.point.x, "number") : "{x}"
    )
    .replace(
      /\{y\}/g,
      glyph.point ? formatCalcValue(glyph.point.y, "number") : "{y}"
    );
}

function glyphCenter(node: RectNode | CircleNode) {
  return node.type === "rect"
    ? { x: node.x + node.width / 2, y: node.y + node.height / 2 }
    : { x: node.cx, y: node.cy };
}

function resolveAnnotation(
  note: AnnotationElement,
  units: Map<string, ResolvedUnit>,
  measureText: MeasureText,
  definition: CompositionDefinition,
  data: CompositionData
) {
  const paper = definition.artboard.background;
  const nodes: SceneNode[] = [];
  const anchor = note.anchor;
  let point: { x: number; y: number } | undefined;
  let glyph: GlyphDatum | undefined;
  let missing: string | undefined;
  // Calculation tokens such as {Total} fill as they do in page text.
  let text = fillCalcTokens(note.text, definition, data);
  if (anchor.kind === "page") {
    point = { x: note.x, y: note.y };
  } else {
    const unit = units.get(anchor.unitId);
    const instance = unit?.instances.find(
      (item) => item.key === anchor.instanceKey
    );
    if (!unit || !instance) {
      missing = "The repeat this annotation attaches to is not drawn.";
    } else if (anchor.kind === "frame") {
      point = {
        x: instance.frame.x + anchor.fx * instance.frame.width,
        y: instance.frame.y + anchor.fy * instance.frame.height,
      };
    } else {
      let picked: RectNode | CircleNode | undefined;
      for (const node of unit.nodes) {
        if (node.type !== "rect" && node.type !== "circle") continue;
        if (
          node.glyph?.instanceKey !== anchor.instanceKey ||
          node.glyph.markId !== anchor.markId
        )
          continue;
        const value = node.glyph.value;
        if (anchor.pick === "at") {
          if (matchesAt(node.glyph, anchor.at)) picked = node;
          continue;
        }
        if (
          !picked ||
          (anchor.pick === "max" && value > picked.glyph!.value) ||
          (anchor.pick === "min" && value < picked.glyph!.value) ||
          anchor.pick === "last"
        )
          picked = node;
      }
      if (!picked)
        missing =
          anchor.pick === "at"
            ? `No glyph in this repeat is labeled ${anchor.at ?? "(empty)"}.`
            : "No glyph in this repeat passes the filters.";
      else {
        point = glyphCenter(picked);
        glyph = picked.glyph!;
        text = fillGlyphTokens(text, glyph);
      }
    }
  }
  if (!point)
    return {
      nodes,
      bounds: emptyBounds(note.x, note.y),
      anchor: { kind: anchor.kind, point: { x: note.x, y: note.y }, missing },
    };
  // Page text sits at its position; attached text sits at an offset from the anchor.
  const textX = anchor.kind === "page" ? point.x : point.x + note.x;
  const top =
    anchor.kind === "page" ? point.y : point.y + note.y - note.fontSize / 2;
  const lines = text.split("\n");
  const step = lineHeight(note.fontSize);
  const width = Math.max(
    8,
    ...lines.map((line) => measureText(line, note.fontSize, 600))
  );
  if (anchor.kind !== "page") {
    // Ring the anchor so the attachment reads even after a large nudge.
    nodes.push({
      type: "circle",
      key: `${note.id}:ring`,
      elementId: note.id,
      cx: point.x,
      cy: point.y,
      r: 5,
      fill: "none",
      stroke: note.color,
    });
    if (note.leader) {
      const toLeft = textX + width / 2 < point.x;
      nodes.push({
        type: "line",
        key: `${note.id}:leader`,
        elementId: note.id,
        x1: point.x + (toLeft ? -5 : 5),
        y1: point.y,
        x2: toLeft ? textX + width + 3 : textX - 3,
        y2: top + step / 2,
        stroke: note.color,
        strokeWidth: 1,
      });
    }
  }
  nodes.push({
    type: "text",
    key: note.id,
    elementId: note.id,
    x: textX,
    lines: lines.map((line, index) => ({
      text: line,
      y: top + Math.round(note.fontSize * 0.95) + index * step,
    })),
    fontSize: note.fontSize,
    fontWeight: 600,
    fill: note.color,
    anchor: "start",
    halo: paper,
  });
  return {
    nodes,
    bounds: { x: textX, y: top, width, height: lines.length * step },
    anchor: { kind: anchor.kind, point, glyph },
  };
}
