import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  INK,
  MUTED_INK,
  type CompositionDefinition,
  type PathMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type PathNode,
  type TextNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Three countries read twice; Ada and Bo end within a pixel of each other.
const rows: Record<string, datum>[] = [
  { Country: "Ada", Year: 2000, Share: 10, Direction: "Rose" },
  { Country: "Ada", Year: 2023, Share: 30, Direction: "Rose" },
  { Country: "Bo", Year: 2000, Share: 40, Direction: "Fell" },
  { Country: "Bo", Year: 2023, Share: 30.5, Direction: "Fell" },
  { Country: "Cy", Year: 2000, Share: 20, Direction: "Rose" },
  { Country: "Cy", Year: 2023, Share: 50, Direction: "Rose" },
];
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const lines: PathMark = {
  type: "path",
  id: "mark-1",
  name: "Share",
  xScaleId: "n-1",
  yScaleId: "n-2",
  orderField: "Year",
  stroke: "#000",
  strokeWidth: 1,
  seriesField: "Country",
  colorField: "Direction",
  colors: ["#f00", "#00f"],
  labels: "both",
  labelValue: true,
};
function slope(patch: Partial<PathMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Countries",
    x: 100,
    y: 0,
    frame: { width: 200, height: 100 },
    label: { show: false, width: 0, fontSize: 12 },
    axis: true,
    marks: [{ ...lines, ...patch }],
    repeat: {
      arrangement: "rows",
      columns: 1,
      gap: 0,
      order: "label",
      limit: 1,
    },
  };
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
        ticks: "ends",
      },
      {
        id: "n-2",
        kind: "numeric",
        name: "Share",
        field: "Share",
        domain: "shared",
        zero: true,
        nice: false,
        ticks: "none",
      },
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data());
const labelsOf = (definition: CompositionDefinition) =>
  scene(definition).nodes.filter(
    (node): node is TextNode =>
      node.type === "text" && node.key.includes(":label:")
  );

describe("path end labels", () => {
  it("names each path at both ends with the value there, outside the frame", () => {
    const definition = slope();
    expect(isCompositionDefinition(definition)).toBe(true);
    const labels = labelsOf(definition);
    const text = (key: string) =>
      labels.find((node) => node.key.endsWith(key))!;
    expect(text("mark-1:Ada:label:start").lines[0]!.text).toBe("10  Ada");
    expect(text("mark-1:Ada:label:end").lines[0]!.text).toBe("30  Ada");
    expect(text("mark-1:Ada:label:start").anchor).toBe("end");
    expect(text("mark-1:Ada:label:start").x).toBeLessThan(100);
    expect(text("mark-1:Ada:label:end").anchor).toBe("start");
    expect(text("mark-1:Ada:label:end").x).toBeGreaterThan(300);
    expect(labels).toHaveLength(6);
  });

  it("dodges end labels that would overlap, keeping their order", () => {
    const labels = labelsOf(slope());
    const y = (key: string) =>
      labels.find((node) => node.key.endsWith(key))!.lines[0]!.y;
    // Ada (30) and Bo (30.5) end one pixel apart; Bo stays above Ada.
    expect(y("Bo:label:end")).toBeLessThan(y("Ada:label:end"));
    expect(y("Ada:label:end") - y("Bo:label:end")).toBeGreaterThanOrEqual(11);
    // The start labels sit far apart and keep their own positions.
    expect(y("Bo:label:start")).toBeLessThan(y("Cy:label:start"));
  });

  it("labels one end only, by name alone, or the repeat when there is no series", () => {
    const endOnly = labelsOf(slope({ labels: "end", labelValue: false }));
    expect(endOnly.map((node) => node.lines[0]!.text).sort()).toEqual([
      "Ada",
      "Bo",
      "Cy",
    ]);
    const unnamed = labelsOf(slope({ seriesField: undefined, labels: "end" }));
    expect(unnamed).toHaveLength(1);
    expect(unnamed[0]!.lines[0]!.text).toContain("Countries");
    expect(labelsOf(slope({ labels: undefined }))).toHaveLength(0);
  });
});

describe("paths colored by a field", () => {
  it("strokes each path by its first row's category and mutes the rest of a focus", () => {
    const paths = scene(slope()).nodes.filter(
      (node): node is PathNode => node.type === "path"
    );
    const stroke = (series: string) =>
      paths.find((node) => node.path.series === series)!;
    // Categories take colors in label order: Fell, then Rose.
    expect(stroke("Bo").stroke).toBe("#f00");
    expect(stroke("Ada").stroke).toBe("#00f");
    expect(stroke("Ada").path.category).toBe("Rose");
    const focused = scene(
      slope({ focus: { kind: "values", values: "Bo" } })
    ).nodes.filter((node): node is PathNode => node.type === "path");
    expect(focused.find((node) => node.path.series === "Ada")!.stroke).not.toBe(
      "#00f"
    );
    const labels = labelsOf(slope({ focus: { kind: "values", values: "Bo" } }));
    expect(labels.find((node) => node.key.includes(":Bo:"))!.fill).toBe(INK);
    expect(labels.find((node) => node.key.includes(":Ada:"))!.fill).toBe(
      MUTED_INK
    );
  });
});

describe("tick modes", () => {
  it("labels only the ends of the year scale and nothing on the share scale", () => {
    const resolved = scene(slope());
    const ticks = (axis: string) =>
      resolved.nodes
        .filter(
          (node): node is TextNode =>
            node.type === "text" && node.key.includes(`:axis:${axis}:`)
        )
        .map((node) => node.lines[0]!.text);
    expect(ticks("x")).toEqual(["2000", "2023"]);
    expect(ticks("y")).toEqual([]);
    expect(
      resolved.nodes.filter((node) => node.key.includes(":grid:"))
    ).toHaveLength(0);
  });
});
