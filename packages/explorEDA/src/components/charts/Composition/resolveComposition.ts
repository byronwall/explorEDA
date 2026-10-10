import { dateTimestamp } from "@/lib/dateTime";
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
  periodKey,
  periodStart,
  resolveUnit,
  type CompositionData,
  type GlyphDatum,
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

export type SceneNode = TextNode | RectNode | CircleNode | LineNode;

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
          definition.artboard.background
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
    nodes,
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

/** The x of a value on a repeat's position scale, at the middle of its bin. */
export function positionX(
  instance: ResolvedInstance,
  value: { number?: number; text?: string }
): number | undefined {
  const position = instance.position;
  if (!position || !position.bins.length) return undefined;
  let key: string | undefined;
  if (position.scale.interval) {
    const time =
      value.number ??
      (value.text?.trim() ? dateTimestamp(value.text.trim()) : undefined);
    if (time === undefined || !Number.isFinite(time)) return undefined;
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
  groups.forEach((group, index) => {
    const first = group[0]!;
    let x: number | undefined;
    let text = guide.label;
    if (value.kind === "constant") {
      x = positionX(first, { text: value.value });
    } else if (calc) {
      const result = evaluateCalc(calc, data, perRepeat ? first : undefined);
      values.push(result);
      if (result.value !== undefined)
        x = positionX(
          first,
          result.kind === "date"
            ? { number: result.value }
            : { text: String(result.value) }
        );
      text = text.replace(/\{value\}/g, result.text);
    }
    if (x === undefined) return;
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
        missing: "The guide's value falls outside the unit's position scale.",
      },
    };
  const left = Math.min(...lines.map((line) => line.x1), label?.x ?? Infinity);
  const right = Math.max(
    ...lines.map((line) => line.x1),
    label ? label.x + measureText(label.text, 11, 600) : -Infinity
  );
  const top = Math.min(
    ...lines.map((line) => line.y1),
    label ? label.y - 11 : Infinity
  );
  const bottom = Math.max(
    ...lines.map((line) => line.y2),
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

function glyphCenter(node: RectNode | CircleNode) {
  return node.type === "rect"
    ? { x: node.x + node.width / 2, y: node.y + node.height / 2 }
    : { x: node.cx, y: node.cy };
}

function resolveAnnotation(
  note: AnnotationElement,
  units: Map<string, ResolvedUnit>,
  measureText: MeasureText,
  paper: string
) {
  const nodes: SceneNode[] = [];
  const anchor = note.anchor;
  let point: { x: number; y: number } | undefined;
  let glyph: GlyphDatum | undefined;
  let missing: string | undefined;
  let text = note.text;
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
        if (
          !picked ||
          (anchor.pick === "max" && value > picked.glyph!.value) ||
          (anchor.pick === "min" && value < picked.glyph!.value) ||
          anchor.pick === "last"
        )
          picked = node;
      }
      if (!picked) missing = "No glyph in this repeat passes the filters.";
      else {
        point = glyphCenter(picked);
        glyph = picked.glyph!;
        text = text
          .replace(/\{value\}/g, formatCalcValue(glyph.value, "number"))
          .replace(/\{label\}/g, glyph.bin.label);
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
