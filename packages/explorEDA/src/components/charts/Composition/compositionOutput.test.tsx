import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompositionSvg } from "./CompositionSvg";
import { artboardMarkup } from "./compositionOutput";
import { createEmptyComposition, createTextElement } from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition } from "./resolveComposition";

describe("composition output", () => {
  it("serializes the artboard at its own size without editing overlays", () => {
    const base = createEmptyComposition();
    const definition = {
      ...base,
      elements: [createTextElement(base, "title")],
    };
    const scene = resolveComposition(definition, estimateTextWidth);
    const { container } = render(
      <CompositionSvg scene={scene} scale={0.5} label="Report" className="x">
        <rect data-testid="selection" />
      </CompositionSvg>
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("480");
    const { markup, width, height } = artboardMarkup(svg);
    expect([width, height]).toEqual([960, 600]);
    expect(markup).toContain('width="960"');
    expect(markup).toContain(">Title<");
    expect(markup).not.toContain("data-overlay");
    expect(markup).not.toContain("selection");
  });
});
