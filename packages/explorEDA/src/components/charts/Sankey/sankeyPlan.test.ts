import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { sankeyDefinition, type SankeySettings } from "./definition";
import {
  bandPath,
  planSankey,
  toggleLinkFilters,
  toggleNodeFilters,
  type SankeySnapshot,
} from "./sankeyPlan";
import { findSankeyTraceRow, resolveSankeyTrace } from "./sankeyTrace";

// A branch (North splits), a merge (both reach Done), "A" in two stages, and a missing middle value.
const rows: Record<string, datum>[] = [
  { from: "North", via: "A", to: "Done", amount: 10 },
  { from: "North", via: "B", to: "Done", amount: 5 },
  { from: "South", via: "A", to: "Done", amount: 2 },
  { from: "South", via: "B", to: "A", amount: -4 },
  { from: "South", via: null, to: "Done", amount: 1 },
  { from: "North", via: "A", to: "A", amount: "n/a" },
];
const ids = rows.map((_, index) => index);
const column = (field: string) =>
  Object.fromEntries(ids.map((id) => [id, rows[id]![field]]));

function snapshot(liveIds = ids): SankeySnapshot {
  return {
    revision: "r1",
    allIds: ids,
    liveIds,
    stageData: { from: column("from"), via: column("via"), to: column("to") },
    measureData: column("amount"),
  };
}

function settings(overrides: Partial<SankeySettings> = {}): SankeySettings {
  return {
    ...sankeyDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "flow",
    stages: ["from", "via", "to"],
    ...overrides,
  };
}

const plan = (overrides: Partial<SankeySettings> = {}, live = ids) =>
  planSankey({
    settings: settings(overrides),
    width: 600,
    height: 300,
    snapshot: snapshot(live),
    getFieldLabel: (field) => field.toUpperCase(),
  });

const linkIds = (result: ReturnType<typeof plan>, from: string, to: string) =>
  result.links
    .find((link) => link.source.label === from && link.target.label === to)
    ?.contributors.map((item) => item.sourceId);

describe("planSankey", () => {
  it("draws complete rows as paths and leaves out a missing stage by default", () => {
    const result = plan();
    expect(result.drawnRows).toBe(5);
    expect(result.incompleteIds).toEqual([4]);
    // Each link's rows match a direct query on the two stage fields.
    expect(linkIds(result, "North", "A")).toEqual([0, 5]);
    expect(linkIds(result, "North", "B")).toEqual([1]);
    expect(linkIds(result, "A", "Done")).toEqual([0, 2]);
    expect(linkIds(result, "B", "A")).toEqual([3]);
  });

  it("keeps the same label in two stages as two nodes", () => {
    const result = plan();
    const a = result.nodes.filter((node) => node.label === "A");
    expect(a.map((node) => node.stage)).toEqual([1, 2]);
    expect(new Set(a.map((node) => node.id)).size).toBe(2);
  });

  it("conserves flow through a middle stage", () => {
    const result = plan();
    for (const node of result.nodes.filter((item) => item.stage === 1)) {
      expect(node.inWeight).toBe(node.outWeight);
      expect(node.inWeight).toBe(node.weight);
    }
    const total = (stage: number) =>
      result.stages[stage]!.nodes.reduce((sum, node) => sum + node.weight, 0);
    expect(total(0)).toBe(total(1));
    expect(total(1)).toBe(total(2));
  });

  it("shows a missing stage as its own node when asked", () => {
    const result = plan({ missingStages: "show" });
    expect(result.incompleteIds).toEqual([]);
    const missing = result.nodes.find((node) => node.kind === "missing");
    expect(missing?.label).toBe("(missing)");
    expect(missing?.members).toEqual([null]);
    expect(linkIds(result, "South", "(missing)")).toEqual([4]);
  });

  it("uses only rows that pass other filters", () => {
    const result = plan({}, [0, 1]);
    expect(result.drawnRows).toBe(2);
    expect(result.nodes.map((node) => node.label)).toEqual([
      "North",
      "A",
      "B",
      "Done",
    ]);
  });

  it("sums a measure and leaves out negative and non-numeric values with reasons", () => {
    const result = plan({ aggregation: "sum", measureField: "amount" });
    expect(result.totalWeight).toBe(17);
    expect(result.excluded).toEqual([
      { reason: "Negative values cannot be a flow", count: 1 },
      { reason: "Not a finite number", count: 1 },
    ]);
    const link = result.links.find(
      (item) => item.source.label === "B" && item.target.label === "A"
    )!;
    expect(link.weight).toBe(0);
    expect(link.contributors[0]).toMatchObject({
      sourceId: 3,
      included: false,
    });
  });

  it("folds small values into an Other node that lists its members", () => {
    const many = Object.fromEntries(ids.map((id) => [id, `v${id}`]));
    const result = planSankey({
      settings: settings({ maxNodesPerStage: 2, stages: ["from", "via"] }),
      width: 600,
      height: 300,
      snapshot: {
        ...snapshot(),
        stageData: { ...snapshot().stageData, via: many },
      },
      getFieldLabel: (field) => field,
    });
    const other = result.nodes.find((node) => node.kind === "other")!;
    expect(other.label).toBe("Other (4)");
    expect(other.members).toHaveLength(4);
    expect(toggleNodeFilters([], other)).toEqual([
      { type: "value", field: "via", values: other.members },
    ]);
  });

  it("highlights the selected share of each link without changing its width", () => {
    const base = plan();
    const result = plan({
      filters: [{ type: "value", field: "to", values: ["A"] }],
    });
    expect(result.hasSelection).toBe(true);
    expect(result.selectedWeight).toBe(2);
    const north = result.links.find(
      (link) => link.source.label === "North" && link.target.label === "A"
    )!;
    expect(north.selectedWeight).toBe(1);
    expect(north.thickness).toBeCloseTo(
      base.links.find((link) => link.id === north.id)!.thickness
    );
  });

  it("traces a link and finds a source row", () => {
    const result = plan();
    const link = result.links.find(
      (item) => item.source.label === "North" && item.target.label === "A"
    )!;
    const trace = resolveSankeyTrace(result, "sankey-link", link.id);
    expect(trace?.kind).toBe("sankey-link");
    if (trace?.kind !== "sankey-link") {
      return;
    }
    expect(trace.shareOfSource).toBeCloseTo(2 / 3);
    expect(findSankeyTraceRow(result, 1)).toEqual({
      kind: "sankey-link",
      id: result.links.find((item) =>
        item.contributors.some((c) => c.sourceId === 1)
      )!.id,
    });
    expect(bandPath(0, 0, 10, 5, 2)).toMatch(/^M0,0C5,0 5,5 10,5L10,7/);
  });
});

describe("selection helpers", () => {
  const result = plan();
  const north = result.nodes.find((node) => node.label === "North")!;
  const south = result.nodes.find((node) => node.label === "South")!;
  const link = result.links.find(
    (item) => item.source.label === "North" && item.target.label === "B"
  )!;

  it("selects, adds, and clears nodes on one stage", () => {
    const one = toggleNodeFilters([], north);
    expect(one).toEqual([{ type: "value", field: "from", values: ["North"] }]);
    const both = toggleNodeFilters(one, south, true);
    expect(both).toEqual([
      { type: "value", field: "from", values: ["North", "South"] },
    ]);
    expect(toggleNodeFilters(both, south, true)).toEqual(one);
    expect(toggleNodeFilters(one, north)).toEqual([]);
  });

  it("selects one link as two value filters and keeps other stages' filters", () => {
    const keep: Filter = { type: "value", field: "to", values: ["Done"] };
    const selected = toggleLinkFilters([keep], link);
    expect(selected).toEqual([
      keep,
      { type: "value", field: "from", values: ["North"] },
      { type: "value", field: "via", values: ["B"] },
    ]);
    expect(toggleLinkFilters(selected, link)).toEqual([keep]);
  });
});
