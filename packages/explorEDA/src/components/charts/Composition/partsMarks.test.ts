import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { convertMark } from "./compositionEdits";
import {
  createEmptyComposition,
  STACK_COLORS,
  type CompositionDefinition,
  type DonutMark,
  type MarkDefinition,
  type UnitElement,
  type WaterfallMark,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type ArcNode,
  type SceneNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { makeCompositionTraceSource } from "./compositionTrace";
import { isCompositionDefinition } from "./validateComposition";

// Two labs, each with a plan and an actual for three lines.
const rows: Record<string, datum>[] = [
  {
    Lab: "North",
    Group: "Funding",
    Line: "Grants",
    Scenario: "Plan",
    Amount: 100,
  },
  {
    Lab: "North",
    Group: "Funding",
    Line: "Grants",
    Scenario: "Actual",
    Amount: 80,
  },
  {
    Lab: "North",
    Group: "Costs",
    Line: "Staff",
    Scenario: "Plan",
    Amount: -60,
  },
  {
    Lab: "North",
    Group: "Costs",
    Line: "Staff",
    Scenario: "Actual",
    Amount: -70,
  },
  {
    Lab: "North",
    Group: "Costs",
    Line: "Travel",
    Scenario: "Plan",
    Amount: -10,
  },
  {
    Lab: "North",
    Group: "Costs",
    Line: "Travel",
    Scenario: "Actual",
    Amount: -5,
  },
  {
    Lab: "South",
    Group: "Funding",
    Line: "Grants",
    Scenario: "Plan",
    Amount: 50,
  },
  {
    Lab: "South",
    Group: "Funding",
    Line: "Grants",
    Scenario: "Actual",
    Amount: 70,
  },
  {
    Lab: "South",
    Group: "Costs",
    Line: "Staff",
    Scenario: "Plan",
    Amount: -30,
  },
  {
    Lab: "South",
    Group: "Costs",
    Line: "Staff",
    Scenario: "Actual",
    Amount: -30,
  },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});

const waterfall: WaterfallMark = {
  type: "waterfall",
  id: "bridge",
  name: "Bridge",
  mode: "bridge",
  aggregation: "sum",
  measureField: "Amount",
  stepField: "Line",
  parentField: "Group",
  states: [
    {
      label: "Plan",
      filters: [{ type: "value", field: "Scenario", values: ["Plan"] }],
    },
    {
      label: "Actual",
      filters: [{ type: "value", field: "Scenario", values: ["Actual"] }],
    },
  ],
  up: "#00aa00",
  down: "#aa0000",
  total: "#333333",
  labelWidth: 60,
};

const donut: DonutMark = {
  type: "donut",
  id: "share",
  name: "Share",
  categoryField: "Line",
  aggregation: "count",
  order: "total",
  colors: ["#111111", "#222222", "#333333"],
  hole: 0.6,
  showTotal: true,
};

function labs(mark: MarkDefinition): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Labs",
    x: 10,
    y: 10,
    frame: { width: 240, height: 160 },
    label: { show: true, width: 0, fontSize: 12 },
    axis: false,
    marks: [mark],
    repeat: {
      field: "Lab",
      arrangement: "columns",
      columns: 2,
      gap: 20,
      order: "label",
      limit: 24,
    },
  };
  return { ...createEmptyComposition(), elements: [unit] };
}

const glyphs = (nodes: SceneNode[], repeat: string) =>
  nodes.filter(
    (node) =>
      node.instanceKey === repeat &&
      "glyph" in node &&
      node.glyph?.markId !== undefined
  ) as (SceneNode & { glyph: NonNullable<ArcNode["glyph"]> })[];

describe("waterfall marks", () => {
  it("bridges each repeat's plan to its actual, as the chart does", () => {
    const definition = labs(waterfall);
    expect(isCompositionDefinition(definition)).toBe(true);
    const { nodes } = resolveComposition(definition, estimateTextWidth, data());
    const north = glyphs(nodes, "North").map((node) => [
      node.glyph.waterfall?.kind,
      node.glyph.bin.label,
      node.glyph.value,
    ]);
    expect(north).toEqual([
      ["start", "Plan", 30],
      ["step", "Grants", -20],
      ["subtotal", "Funding", 10],
      ["step", "Staff", -10],
      ["step", "Travel", 5],
      ["subtotal", "Costs", 5],
      ["end", "Actual", 5],
    ]);
    const south = glyphs(nodes, "South");
    expect(south.at(-1)!.glyph.value).toBe(40);
  });

  it("shares one value axis, so a total sits at the same x in every repeat", () => {
    const { nodes } = resolveComposition(
      labs(waterfall),
      estimateTextWidth,
      data()
    );
    const zeroOf = (repeat: string) =>
      nodes.find((node) => node.key === `unit-1:${repeat}:bridge:zero`);
    const north = zeroOf("North") as { x1: number } | undefined;
    const south = zeroOf("South") as { x1: number } | undefined;
    // The two repeats sit side by side, so their zero lines differ only by the column offset.
    expect(north && south).toBeTruthy();
    expect(Math.round((south!.x1 - north!.x1) * 10) / 10).toBe(260);
  });

  it("traces a step to both states' rows", () => {
    const definition = labs(waterfall);
    const scene = resolveComposition(definition, estimateTextWidth, data());
    const grants = glyphs(scene.nodes, "North").find(
      (node) => node.glyph.bin.label === "Grants"
    )!;
    const trace = makeCompositionTraceSource(definition, scene, "r").resolve(
      "composition",
      `glyph:${grants.key}`
    );
    expect(trace?.kind === "composition" && trace.rowIds).toEqual([0, 1]);
  });

  it("runs a total through the steps in accumulate mode", () => {
    const { nodes } = resolveComposition(
      labs({
        ...waterfall,
        mode: "accumulate",
        parentField: undefined,
        startValue: 10,
      }),
      estimateTextWidth,
      data()
    );
    expect(glyphs(nodes, "South").map((node) => node.glyph.value)).toEqual([
      10, 120, -60, 70,
    ]);
  });
});

describe("donut marks", () => {
  it("draws each repeat's shares as arcs in one color order", () => {
    const definition = labs(donut);
    expect(isCompositionDefinition(definition)).toBe(true);
    const { nodes } = resolveComposition(definition, estimateTextWidth, data());
    const arcs = (repeat: string) =>
      nodes.filter(
        (node): node is ArcNode =>
          node.type === "arc" && node.instanceKey === repeat
      );
    const north = arcs("North");
    expect(north.map((node) => node.glyph?.bin.label)).toEqual([
      "Grants",
      "Staff",
      "Travel",
    ]);
    expect(north.at(-1)!.endAngle).toBeCloseTo(Math.PI * 2);
    expect(north[0]!.glyph?.donut?.share).toBeCloseTo(1 / 3);
    // Grants fills the same color in both repeats.
    expect(arcs("South")[0]!.fill).toBe(north[0]!.fill);
  });

  it("pools the smaller categories into Other", () => {
    const { nodes } = resolveComposition(
      labs({ ...donut, topN: 1 }),
      estimateTextWidth,
      data()
    );
    const other = nodes.find(
      (node): node is ArcNode =>
        node.type === "arc" &&
        node.instanceKey === "North" &&
        node.glyph?.bin.key === "__other"
    );
    expect(other?.glyph?.donut?.members).toEqual(["Staff", "Travel"]);
  });
});

describe("converting marks", () => {
  it("turns a mark into a waterfall or a donut with valid defaults", () => {
    const definition = labs(donut);
    const unit = definition.elements[0] as UnitElement;
    const fields = [
      { name: "Line", dataType: "categorical", uniqueCount: 3 },
      { name: "Amount", dataType: "numeric", uniqueCount: 9 },
    ] as Parameters<typeof convertMark>[4];
    const asWaterfall = convertMark(
      definition,
      unit,
      "share",
      "waterfall",
      fields
    );
    expect(isCompositionDefinition(asWaterfall)).toBe(true);
    expect((asWaterfall.elements[0] as UnitElement).marks[0]).toMatchObject({
      type: "waterfall",
      stepField: "Line",
      measureField: "Amount",
    });
    const back = convertMark(
      asWaterfall,
      asWaterfall.elements[0] as UnitElement,
      "share",
      "donut",
      fields
    );
    expect((back.elements[0] as UnitElement).marks[0]).toMatchObject({
      type: "donut",
      colors: STACK_COLORS,
    });
  });
});
