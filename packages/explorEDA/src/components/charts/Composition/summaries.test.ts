import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type SummaryMark,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type AreaNode,
  type CircleNode,
} from "./resolveComposition";
import { valueColorSigned, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two activities, two years. Sleeping rises from a median of 480 to 510;
// Working falls from 420 to 300. Naps have a 2020 cohort only.
const rows: Record<string, datum>[] = [
  { Activity: "Sleeping", Year: 2019, Minutes: 450 },
  { Activity: "Sleeping", Year: 2019, Minutes: 480 },
  { Activity: "Sleeping", Year: 2019, Minutes: 500 },
  { Activity: "Sleeping", Year: 2020, Minutes: 490 },
  { Activity: "Sleeping", Year: 2020, Minutes: 510 },
  { Activity: "Sleeping", Year: 2020, Minutes: 540 },
  { Activity: "Working", Year: 2019, Minutes: 400 },
  { Activity: "Working", Year: 2019, Minutes: 420 },
  { Activity: "Working", Year: 2019, Minutes: 480 },
  { Activity: "Working", Year: 2020, Minutes: 240 },
  { Activity: "Working", Year: 2020, Minutes: 300 },
  { Activity: "Working", Year: 2020, Minutes: "n/a" },
  { Activity: "Naps", Year: 2020, Minutes: 20 },
  { Activity: "Naps", Year: 2020, Minutes: 30 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});

const change: ValueScale = {
  id: "value-1",
  kind: "value",
  name: "Change",
  domain: "shared",
  transform: "linear",
  colors: ["#2060c0", "#c03020"],
  center: "#dddddd",
};
const summary: SummaryMark = {
  type: "summary",
  id: "mark-1",
  name: "Minutes a day",
  groupField: "Year",
  measureField: "Minutes",
  yScaleId: "n-1",
  valueScaleId: "value-1",
  fill: "#999999",
  opacity: 0.3,
};
function grid(
  domain: "shared" | "instance" = "instance"
): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Activities",
    x: 20,
    y: 20,
    frame: { width: 120, height: 100 },
    label: { show: true, width: 0, fontSize: 12 },
    axis: true,
    marks: [summary],
    repeat: {
      field: "Activity",
      arrangement: "grid",
      columns: 3,
      gap: 10,
      order: "label",
      limit: 24,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Minutes",
        field: "Minutes",
        domain,
        zero: false,
        nice: false,
      },
      change,
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds));
const markers = (definition: CompositionDefinition, liveIds?: number[]) =>
  scene(definition, liveIds).nodes.filter(
    (node): node is CircleNode =>
      node.type === "circle" && Boolean(node.glyph?.summary)
  );

describe("summary marks", () => {
  it("computes unweighted quartiles per group and pairs them by repeat", () => {
    const definition = grid();
    expect(isCompositionDefinition(definition)).toBe(true);
    const sleeping = markers(definition).filter(
      (node) => node.instanceKey === "Sleeping"
    );
    expect(sleeping.map((node) => node.glyph!.bin.key)).toEqual([
      "2019",
      "2020",
    ]);
    expect(sleeping.map((node) => node.glyph!.summary!.median)).toEqual([
      480, 510,
    ]);
    expect(sleeping[0]!.glyph!.summary).toMatchObject({
      q1: 465,
      q3: 490,
      count: 3,
    });
    // Working's "n/a" minute is left out of its count; its medians fall.
    const working = markers(definition).filter(
      (node) => node.instanceKey === "Working"
    );
    expect(working.map((node) => node.glyph!.summary!.median)).toEqual([
      420, 270,
    ]);
    expect(working[1]!.glyph!.summary!.count).toBe(2);
    expect(working[1]!.glyph!.rowIds).toEqual([9, 10, 11]);
  });

  it("colors each repeat's markers by its change in median, diverging around zero", () => {
    const definition = grid();
    const byRepeat = (key: string) =>
      markers(definition).filter((node) => node.instanceKey === key);
    const [up] = byRepeat("Sleeping");
    const [down] = byRepeat("Working");
    expect(up!.glyph!.summary!.changeText).toBe("+6%");
    expect(down!.glyph!.summary!.changeText).toBe("-36%");
    // Both markers in a repeat share the color; the two repeats differ in hue.
    expect(byRepeat("Sleeping")[1]!.fill).toBe(up!.fill);
    expect(up!.fill).not.toBe(down!.fill);
    // The largest change takes the full end color; the smaller stays nearer the center.
    expect(down!.fill).toBe(valueColorSigned(change, -0.36, 0.36));
    expect(valueColorSigned(change, 0, 1)).toBe("rgb(221, 221, 221)");
  });

  it("leaves a repeat with one group undefined and neutral, not falsely colored", () => {
    const [nap] = markers(grid()).filter((node) => node.instanceKey === "Naps");
    expect(nap!.glyph!.summary!.change).toBeUndefined();
    expect(nap!.glyph!.summary!.changeText).toBe("undefined");
    expect(nap!.fill).toBe("#dddddd");
  });

  it("joins the quartiles as a band and draws a neutral band with no value scale", () => {
    const definition = grid();
    const bands = scene(definition).nodes.filter(
      (node): node is AreaNode =>
        node.type === "area" && node.instanceKey === "Sleeping"
    );
    expect(bands).toHaveLength(1);
    expect(
      bands[0]!.segments[0]!.map((vertex) => [vertex.y1 < vertex.y0])
    ).toEqual([[true], [true]]);
    expect(bands[0]!.band.lowerField).toContain("first quartile");
    const plain: CompositionDefinition = {
      ...definition,
      elements: [
        {
          ...(definition.elements[0] as UnitElement),
          marks: [{ ...summary, valueScaleId: undefined }],
        },
      ],
    };
    expect(markers(plain)[0]!.fill).toBe("#999999");
  });

  it("fits the y domain to the quartiles drawn, per repeat or shared", () => {
    const perUnit = scene(grid("instance"));
    const frames = perUnit.elements[0]!.instances!;
    const sleepingFrame = frames.find((item) => item.key === "Sleeping")!.frame;
    const sleepingMarkers = markers(grid("instance")).filter(
      (node) => node.instanceKey === "Sleeping"
    );
    // With a per-unit domain spanning 465–525, both medians sit inside the frame.
    for (const node of sleepingMarkers) {
      expect(node.cy).toBeGreaterThanOrEqual(sleepingFrame.y);
      expect(node.cy).toBeLessThanOrEqual(
        sleepingFrame.y + sleepingFrame.height
      );
    }
    // Shared: Naps' 20-minute median sits near the bottom of the common span.
    const shared = markers(grid("shared")).find(
      (node) => node.instanceKey === "Naps"
    )!;
    const napFrame = scene(grid("shared")).elements[0]!.instances!.find(
      (item) => item.key === "Naps"
    )!.frame;
    expect(shared.cy).toBeGreaterThan(napFrame.y + napFrame.height * 0.9);
  });

  it("recomputes medians, color, and populations from the filtered rows", () => {
    // Drop the longest 2020 sleep: the 2020 median falls to 500.
    const filtered = markers(
      grid(),
      all.filter((id) => id !== 5)
    );
    const sleeping = filtered.filter((node) => node.instanceKey === "Sleeping");
    expect(sleeping.map((node) => node.glyph!.summary!.median)).toEqual([
      480, 500,
    ]);
    expect(sleeping[1]!.glyph!.summary!.count).toBe(2);
    expect(sleeping[1]!.glyph!.summary!.changeText).toBe("+4%");
  });
});
