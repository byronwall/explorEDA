import { describe, expect, it } from "vitest";
import {
  layoutLabels,
  markGrid,
  pathPoints,
  placeLabel,
  textBox,
  type AnnotationMarks,
} from "./labelLayout";
import type { ProjectedAnnotation } from "./resolve";
import type {
  BandAnnotation,
  CalloutAnnotation,
  ReferenceLineAnnotation,
} from "./types";

const measure = (text: string) => text.length * 6;
const plot = { plotWidth: 400, plotHeight: 200 };

const rule = (
  id: string,
  axis: "x" | "y",
  position: number,
  label = "Target"
): ProjectedAnnotation => ({
  status: "shown",
  annotation: {
    id,
    type: "reference-line",
    axis,
    value: position,
    label,
  } satisfies ReferenceLineAnnotation,
  position,
  value: position,
});

const callout = (
  id: string,
  x: number,
  y: number,
  offset = { dx: 0, dy: 0 }
): ProjectedAnnotation =>
  ({
    status: "shown",
    annotation: {
      id,
      type: "callout",
      text: "Peak",
      attach: { kind: "coordinate", x, y },
      offset,
    } satisfies CalloutAnnotation,
    x,
    y,
  }) as ProjectedAnnotation;

const layout = (projected: ProjectedAnnotation[], marks?: AnnotationMarks) =>
  layoutLabels({ projected, ...plot, marks, measure });

describe("annotation label layout", () => {
  it("reads path data as polylines, relative commands included", () => {
    expect(pathPoints("M0,10H20V30l5,5Z M1 2 3 4")).toEqual([
      [
        [0, 10],
        [20, 10],
        [20, 30],
        [25, 35],
        [0, 10],
      ],
      [
        [1, 2],
        [3, 4],
      ],
    ]);
  });

  it("counts the marked cells under a box", () => {
    const marked = markGrid(
      { rects: [{ x: 0, y: 0, width: 40, height: 40 }] },
      100,
      100
    );
    expect(marked({ x0: 50, y0: 50, x1: 90, y1: 90 })).toBe(0);
    expect(marked({ x0: 0, y0: 0, x1: 20, y1: 20 })).toBeGreaterThan(0);
  });

  it("keeps a horizontal rule's label at the right end above its line when clear", () => {
    expect(layout([rule("r", "y", 100)]).rules.get("r")).toEqual({
      x: 396,
      y: 96,
      anchor: "end",
    });
  });

  it("slides a horizontal rule's label off a point that sits on it", () => {
    const place = layout([rule("r", "y", 100)], {
      points: [{ x: 370, y: 90, r: 20 }],
    }).rules.get("r")!;
    // Still above its own line, but clear of the bubble.
    expect(place.y).toBe(96);
    const box = textBox(place, measure("Target"));
    expect(box.x1).toBeLessThan(350);
  });

  it("moves a vertical rule's label down off a line that crosses its top", () => {
    const place = layout([rule("r", "x", 100)], {
      paths: ["M0,8H400"],
    }).rules.get("r")!;
    expect(place.y).toBeGreaterThan(20);
  });

  it("stacks labels of close vertical rules instead of overlapping them", () => {
    const { rules } = layout([rule("a", "x", 100), rule("b", "x", 110)]);
    const a = textBox(rules.get("a")!, measure("Target"));
    const b = textBox(rules.get("b")!, measure("Target"));
    const overlaps = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
    expect(overlaps).toBe(false);
  });

  it("keeps a rule's label off a callout the author placed", () => {
    // The saved callout label sits where the rule label would go.
    const { rules, callouts } = layout([
      callout("c", 330, 120, { dx: 10, dy: -24 }),
      rule("r", "y", 100),
    ]);
    expect(callouts.get("c")).toMatchObject({ x: 340, y: 96, auto: false });
    const box = textBox(rules.get("r")!, measure("Target"));
    expect(box.x1 < 338 || box.y1 < 90).toBe(true);
  });

  it("places a callout without an offset on the clearest side of its subject", () => {
    const up = layout([callout("c", 200, 100)]).callouts.get("c")!;
    expect(up).toMatchObject({ anchor: "start", auto: true });
    expect(up.dy).toBeLessThan(0);
    // A mark above and to the right sends it elsewhere.
    const moved = layout([callout("c", 200, 100)], {
      rects: [{ x: 200, y: 60, width: 60, height: 40 }],
    }).callouts.get("c")!;
    expect(moved.dx > 0 && moved.dy < 0).toBe(false);
  });

  it("lays out the same way every time", () => {
    const shown = [
      rule("a", "x", 120),
      rule("b", "y", 60),
      callout("c", 300, 50),
      {
        status: "shown",
        annotation: {
          id: "band",
          type: "band",
          axis: "x",
          from: 0,
          to: 1,
          label: "Window",
        } satisfies BandAnnotation,
        start: 20,
        end: 80,
      } as ProjectedAnnotation,
    ];
    const marks = { paths: ["M0,190L400,10"] };
    const first = layout(shown, marks);
    expect(layout(shown, marks)).toEqual(first);
    expect(first.bands.get("band")).toBeDefined();
  });

  it("reads a saved label from its other end at the plot edge and stops it at the top", () => {
    expect(placeLabel(90, 50, "start", 40, 1, 100, 100)).toMatchObject({
      anchor: "end",
      y: 50,
    });
    expect(placeLabel(10, 50, "end", 40, 1, 100, 100).anchor).toBe("start");
    expect(placeLabel(50, -80, "start", 10, 1, 100, 100).y).toBe(-6.5);
  });
});
