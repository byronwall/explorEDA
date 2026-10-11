import { describe, expect, it } from "vitest";
import { clampView, FULL_VIEW, MAX_ZOOM, zoomAbout } from "./artboardZoom";
import { fitArtboard } from "./compositionEdits";
import {
  createEmptyComposition,
  type CompositionDefinition,
} from "./compositionTypes";

describe("artboard zoom", () => {
  it("keeps the artboard point under the pointer while zooming", () => {
    const view = zoomAbout(FULL_VIEW, 2, 0.25, 0.75, 800, 400);
    expect(view.k).toBe(2);
    // The point a quarter across and three quarters down stays put.
    expect(view.x + (0.25 * 800) / view.k).toBeCloseTo(200);
    expect(view.y + (0.75 * 400) / view.k).toBeCloseTo(300);
  });

  it("stays inside the artboard and between the whole view and the limit", () => {
    expect(clampView({ x: -50, y: 900, k: 4 }, 800, 400)).toEqual({
      x: 0,
      y: 300,
      k: 4,
    });
    expect(zoomAbout(FULL_VIEW, 0.5, 0.5, 0.5, 800, 400)).toEqual(FULL_VIEW);
    expect(zoomAbout({ x: 0, y: 0, k: 6 }, 4, 0.5, 0.5, 800, 400).k).toBe(
      MAX_ZOOM
    );
  });
});

describe("fitting the artboard", () => {
  it("moves notes under the content and ends the artboard below them", () => {
    const definition: CompositionDefinition = {
      ...createEmptyComposition(),
      artboard: { width: 600, height: 400, background: "#fff" },
      elements: [
        {
          id: "note-1",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source",
          x: 20,
          y: 300,
          width: 500,
          fontSize: 10,
          fontWeight: 400,
          color: "#000",
        },
      ],
    };
    const fitted = fitArtboard(definition, [
      { id: "unit-1", bounds: { y: 40, height: 420 } },
      { id: "note-1", bounds: { y: 300, height: 13 } },
    ]);
    expect(fitted.elements[0]!.y).toBe(484);
    expect(fitted.artboard.height).toBe(484 + 13 + 24);
    expect(fitted.artboard.width).toBe(600);
  });
});
