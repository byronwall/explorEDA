import { describe, expect, it } from "vitest";
import { moveElement, reorderElement } from "./compositionEdits";
import {
  createEmptyComposition,
  createTextElement,
  type CompositionDefinition,
  type TextElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, wrapText } from "./resolveComposition";
import { isCompositionDefinition } from "./validateComposition";

function withText(): CompositionDefinition {
  let definition = createEmptyComposition();
  for (const role of ["title", "subtitle"] as const) {
    definition = {
      ...definition,
      elements: [...definition.elements, createTextElement(definition, role)],
    };
  }
  return definition;
}

describe("composition text", () => {
  it("stacks a new subtitle below the title", () => {
    const [title, subtitle] = withText().elements as TextElement[];
    expect(title).toMatchObject({ id: "title-1", x: 32, y: 32 });
    expect(subtitle!.y).toBeGreaterThan(title!.y + title!.fontSize);
  });

  it("wraps words to the element width and keeps explicit line breaks", () => {
    const measure = (text: string) => text.length * 10;
    expect(wrapText("aa bb cc\ndd", 50, 10, 400, measure)).toEqual([
      "aa bb",
      "cc",
      "dd",
    ]);
  });

  it("resolves each text element into lines and a selectable box", () => {
    const definition = withText();
    const scene = resolveComposition(definition, estimateTextWidth);
    expect(scene).toMatchObject({ width: 960, height: 600 });
    expect(scene.nodes.map((node) => node.elementId)).toEqual([
      "title-1",
      "subtitle-1",
    ]);
    expect(scene.elements[0]!.bounds).toEqual({
      x: 32,
      y: 32,
      width: 896,
      height: 33,
    });
  });
});

describe("composition edits", () => {
  it("moves an element by whole artboard pixels", () => {
    const moved = moveElement(withText(), "title-1", 10.4, -2.6);
    expect(moved.elements[0]).toMatchObject({ x: 42, y: 29 });
  });

  it("reorders within the drawing order and stops at the ends", () => {
    const definition = withText();
    const forward = reorderElement(definition, "title-1", 1);
    expect(forward.elements.map((element) => element.id)).toEqual([
      "subtitle-1",
      "title-1",
    ]);
    expect(reorderElement(forward, "title-1", 1)).toBe(forward);
  });
});

describe("saved compositions", () => {
  it("accepts a valid definition", () => {
    expect(isCompositionDefinition(withText())).toBe(true);
  });

  it("rejects duplicate element IDs and unknown kinds", () => {
    const definition = withText();
    expect(
      isCompositionDefinition({
        ...definition,
        elements: [definition.elements[0], definition.elements[0]],
      })
    ).toBe(false);
    expect(
      isCompositionDefinition({
        ...definition,
        elements: [{ ...definition.elements[0], kind: "polygon" }],
      })
    ).toBe(false);
  });
});
