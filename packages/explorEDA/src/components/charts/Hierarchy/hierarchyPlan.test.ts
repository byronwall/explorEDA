import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { hierarchyDefinition, type HierarchySettings } from "./definition";
import {
  planHierarchy,
  toggleBranch,
  type HierarchyNode,
  type HierarchySnapshot,
} from "./hierarchyPlan";

// "Lamp" sits under two categories, one row has no category, and two
// measures cannot be summed.
const rows: Record<string, datum>[] = [
  { region: "North", category: "Home", product: "Lamp", revenue: 10 },
  { region: "North", category: "Home", product: "Rug", revenue: 30 },
  { region: "North", category: "Office", product: "Lamp", revenue: 20 },
  { region: "South", category: "Home", product: "Lamp", revenue: 5 },
  { region: "South", category: "Office", product: "Desk", revenue: -3 },
  { region: "South", category: null, product: "Chair", revenue: 7 },
  { region: "North", category: "Office", product: "Desk", revenue: "n/a" },
];
const ids = rows.map((_, index) => index);
const column = (field: string) =>
  Object.fromEntries(ids.map((id) => [id, rows[id]![field]]));

function snapshot(liveIds = ids): HierarchySnapshot {
  return {
    revision: "r1",
    liveIds,
    levelData: {
      region: column("region"),
      category: column("category"),
      product: column("product"),
    },
    measureData: column("revenue"),
  };
}

function settings(overrides: Partial<HierarchySettings> = {}) {
  return {
    ...hierarchyDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "tree",
    levels: ["region", "category", "product"],
    ...overrides,
  } satisfies HierarchySettings;
}

const plan = (overrides: Partial<HierarchySettings> = {}, live = ids) =>
  planHierarchy({
    settings: settings(overrides),
    snapshot: snapshot(live),
    getFieldLabel: (field) => field.toUpperCase(),
  });

const find = (result: ReturnType<typeof plan>, ...labels: string[]) =>
  result.nodes.find(
    (node) =>
      node.depth === labels.length &&
      labels.every((label, index) =>
        index === labels.length - 1
          ? node.label === label
          : node.id.includes(JSON.stringify(label))
      )
  );

const pathOf = (node: HierarchyNode | undefined) => node?.path;

describe("planHierarchy", () => {
  it("counts rows through full paths, keeping repeated labels apart", () => {
    const result = plan();
    expect(result.root.weight).toBe(6);
    expect(result.incompleteCount).toBe(1);
    const lamps = result.nodes.filter((node) => node.label === "Lamp");
    expect(lamps.map((node) => node.path)).toEqual([
      ["North", "Home", "Lamp"],
      ["North", "Office", "Lamp"],
      ["South", "Home", "Lamp"],
    ]);
    expect(lamps.map((node) => node.weight)).toEqual([1, 1, 1]);
  });

  it("makes every parent the sum of its children", () => {
    const check = (node: HierarchyNode) => {
      if (node.children.length) {
        expect(
          node.children.reduce((sum, child) => sum + child.weight, 0)
        ).toBe(node.weight);
        node.children.forEach(check);
      }
    };
    check(plan().root);
    check(plan({ aggregation: "sum", measureField: "revenue" }).root);
  });

  it("sums a measure and reports rows it cannot use", () => {
    const result = plan({ aggregation: "sum", measureField: "revenue" });
    expect(result.metricLabel).toBe("Sum of REVENUE");
    // 10 + 30 + 20 + 5; -3 and "n/a" are left out, and the missing category is not drawn.
    expect(result.root.weight).toBe(65);
    expect(pathOf(result.root.children[0])).toEqual(["North"]);
    expect(result.root.children.map((node) => node.weight)).toEqual([60, 5]);
    expect(result.excluded).toHaveLength(2);
    expect(result.excluded.reduce((sum, item) => sum + item.count, 0)).toBe(2);
  });

  it("orders children largest first and shows missing values last when asked", () => {
    const result = plan({
      levels: ["region", "category"],
      missingLevels: "show",
    });
    const south = result.root.children.find((node) => node.label === "South")!;
    expect(south.children.map((node) => node.label)).toEqual([
      "Home",
      "Office",
      "(missing)",
    ]);
    expect(south.children[2]!.path).toEqual(["South", null]);
    expect(result.incompleteCount).toBe(0);
  });

  it("follows the live rows", () => {
    const result = plan({ levels: ["region"] }, [0, 1, 3]);
    expect(
      result.root.children.map((node) => [node.label, node.weight])
    ).toEqual([
      ["North", 2],
      ["South", 1],
    ]);
  });

  it("marks the selected branch and the rows it holds", () => {
    const filters: Filter[] = [
      { type: "value", field: "region", values: ["North"] },
      { type: "value", field: "category", values: ["Home"] },
    ];
    const result = plan({ levels: ["region", "category"], filters });
    expect(result.hasSelection).toBe(true);
    const selected = result.nodes.filter((node) => node.selected);
    expect(selected.map((node) => node.path)).toEqual([
      ["North"],
      ["North", "Home"],
    ]);
    expect(result.root.selectedWeight).toBe(2);
    expect(find(result, "North", "Office")?.selectedWeight).toBe(0);
  });

  it("gives a branch's descendants its color", () => {
    const result = plan();
    for (const branch of result.root.children) {
      const colors = new Set<string>();
      const walk = (node: HierarchyNode) => {
        colors.add(node.color);
        node.children.forEach(walk);
      };
      walk(branch);
      expect(colors.size).toBe(1);
    }
  });
});

describe("toggleBranch", () => {
  const levels = ["region", "category"];
  const result = plan({ levels });
  const node = (...path: string[]) =>
    result.nodes.find(
      (item) => JSON.stringify(item.path) === JSON.stringify(path)
    )!;
  const toggle = (filters: Filter[], target: HierarchyNode, add = false) => {
    const outcome = toggleBranch(filters, target, levels, add);
    if (!outcome.ok) throw new Error(outcome.reason);
    return outcome.filters;
  };

  it("selects exactly a branch's path, and clears it on a second click", () => {
    const filters = toggle([], node("North", "Home"));
    expect(filters).toEqual([
      { type: "value", field: "region", values: ["North"] },
      { type: "value", field: "category", values: ["Home"] },
    ]);
    expect(toggle(filters, node("North", "Home"))).toEqual([]);
    expect(toggle(filters, node("North"))).toEqual([
      { type: "value", field: "region", values: ["North"] },
    ]);
  });

  it("adds and removes siblings under the same parent", () => {
    const home = toggle([], node("North", "Home"));
    const both = toggle(home, node("North", "Office"), true);
    expect(both).toEqual([
      { type: "value", field: "region", values: ["North"] },
      { type: "value", field: "category", values: ["Home", "Office"] },
    ]);
    expect(toggle(both, node("North", "Office"), true)).toEqual(home);
    // Removing the last sibling leaves the parent selected.
    expect(toggle(home, node("North", "Home"), true)).toEqual([
      { type: "value", field: "region", values: ["North"] },
    ]);
    const regions = toggle(toggle([], node("North")), node("South"), true);
    expect(regions).toEqual([
      { type: "value", field: "region", values: ["North", "South"] },
    ]);
    // From a selected parent, a child narrows the selection.
    expect(
      toggle(toggle([], node("North")), node("North", "Home"), true)
    ).toEqual(home);
  });

  it("refuses a sibling under a different parent", () => {
    const home = toggle([], node("North", "Home"));
    const outcome = toggleBranch(home, node("South", "Office"), levels, true);
    expect(outcome.ok).toBe(false);
  });

  it("leaves other fields' filters alone", () => {
    const other: Filter = { type: "value", field: "product", values: ["Lamp"] };
    expect(toggle([other], node("South"))).toEqual([
      other,
      { type: "value", field: "region", values: ["South"] },
    ]);
  });
});
