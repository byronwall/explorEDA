import type {
  CompositionDefinition,
  CompositionElement,
  TextElement,
} from "./compositionTypes";

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
}

export type SceneNode = TextNode;

/** One element as drawn, with the box that selects and moves it. */
export interface ResolvedElement {
  id: string;
  kind: CompositionElement["kind"];
  name: string;
  bounds: Bounds;
}

export interface CompositionScene {
  width: number;
  height: number;
  background: string;
  nodes: SceneNode[];
  elements: ResolvedElement[];
}

/**
 * Resolves a definition into the nodes the artboard draws. Viewing, editing,
 * and PNG output all draw this one scene.
 */
export function resolveComposition(
  definition: CompositionDefinition,
  measureText: MeasureText
): CompositionScene {
  const nodes: SceneNode[] = [];
  const elements: ResolvedElement[] = [];
  for (const element of definition.elements) {
    if (element.kind === "text") {
      const node = resolveText(element, measureText);
      nodes.push(node);
      elements.push({
        id: element.id,
        kind: element.kind,
        name: element.name,
        bounds: textBounds(element, node),
      });
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

function resolveText(element: TextElement, measureText: MeasureText): TextNode {
  const lines = wrapText(
    element.text,
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
