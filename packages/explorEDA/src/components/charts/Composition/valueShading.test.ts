import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type CircleNode,
  type PathNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two occupations: one mostly men (−80), one mostly women (+80).
const rows: Record<string, datum>[] = [
  { Job: "Welders", Year: 1980, Jobs: 10, Lean: -80 },
  { Job: "Welders", Year: 2012, Jobs: 5, Lean: -80 },
  { Job: "Nurses", Year: 1980, Jobs: 8, Lean: 80 },
  { Job: "Nurses", Year: 2012, Jobs: 20, Lean: 80 },
];
const ids = rows.map((_, id) => id);
const data: CompositionData = {
  allIds: ids,
  liveIds: ids,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
};

function slopes(): CompositionDefinition {
  const shade = { valueField: "Lean", valueScaleId: "value-1" };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Year",
        field: "Year",
        domain: "shared",
        zero: false,
        nice: false,
      },
      {
        id: "n-2",
        kind: "numeric",
        name: "Jobs",
        field: "Jobs",
        domain: "shared",
        zero: true,
        nice: false,
      },
      {
        id: "value-1",
        kind: "value",
        name: "Lean",
        domain: "shared",
        transform: "linear",
        colors: ["#0000ff", "#ff0000"],
        center: "#888888",
      },
    ],
    elements: [
      {
        id: "unit-1",
        kind: "unit",
        name: "Jobs",
        x: 0,
        y: 0,
        frame: { width: 100, height: 100 },
        label: { show: false, width: 0, fontSize: 12 },
        axis: false,
        marks: [
          {
            type: "path",
            id: "mark-1",
            name: "Lines",
            xScaleId: "n-1",
            yScaleId: "n-2",
            orderField: "Year",
            stroke: "#000000",
            strokeWidth: 1,
            seriesField: "Job",
            ...shade,
          },
          {
            type: "point",
            id: "mark-2",
            name: "Ends",
            xScaleId: "n-1",
            yScaleId: "n-2",
            radius: 2,
            fill: "#000000",
            labelEvery: 0,
            ...shade,
          },
        ],
        repeat: {
          arrangement: "rows",
          columns: 1,
          gap: 0,
          order: "label",
          limit: 1,
        },
      },
    ],
  };
}

describe("paths and points shaded by a value", () => {
  it("colors each line and point by its field through a diverging scale", () => {
    const definition = slopes();
    expect(isCompositionDefinition(definition)).toBe(true);
    const nodes = resolveComposition(definition, estimateTextWidth, data).nodes;
    const stroke = (job: string) =>
      nodes.find(
        (node): node is PathNode =>
          node.type === "path" && node.path.series === job
      )!.stroke;
    // ±80 are the extremes, so each takes its end color in full.
    expect(stroke("Welders")).toBe("rgb(0, 0, 255)");
    expect(stroke("Nurses")).toBe("rgb(255, 0, 0)");
    const fills = nodes
      .filter((node): node is CircleNode => node.type === "circle")
      .map((node) => node.fill);
    expect(new Set(fills)).toEqual(
      new Set(["rgb(0, 0, 255)", "rgb(255, 0, 0)"])
    );
  });
});
