import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { hierarchyDefinition, type HierarchySettings } from "./definition";
import {
  isZoomable,
  keepForLevels,
  planHierarchy,
  resolveFocus,
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

describe("resolveFocus", () => {
  const result = plan();
  const labels = (nodes: HierarchyNode[]) => nodes.map((node) => node.label);

  it("finds the zoomed branch by its values", () => {
    const north = resolveFocus(result.root, ["North"]);
    expect(north.node.path).toEqual(["North"]);
    expect(labels(north.trail)).toEqual(["North"]);
    const home = resolveFocus(result.root, ["North", "Home"]);
    expect(labels(home.trail)).toEqual(["North", "Home"]);
    expect(home.missing).toEqual([]);
    expect(resolveFocus(result.root, undefined).node).toBe(result.root);
  });

  it("keeps values apart by type", () => {
    const typed = planHierarchy({
      settings: settings({ levels: ["level", "leaf"] }),
      snapshot: {
        revision: "r",
        liveIds: [0, 1],
        levelData: { level: { 0: 1, 1: "1" }, leaf: { 0: "a", 1: "b" } },
        measureData: {},
      },
      getFieldLabel: (field) => field,
    });
    expect(resolveFocus(typed.root, [1]).node.children[0]!.label).toBe("a");
    expect(resolveFocus(typed.root, ["1"]).node.children[0]!.label).toBe("b");
  });

  it("falls back to the deepest ancestor with rows and keeps the rest", () => {
    // Only South rows are live, so North has no rows.
    const southOnly = plan({}, [3, 4]);
    const gone = resolveFocus(southOnly.root, ["North", "Home"]);
    expect(gone.node).toBe(southOnly.root);
    expect(gone.missing).toEqual(["North", "Home"]);
    const partial = resolveFocus(result.root, ["North", "Garden"]);
    expect(labels(partial.trail)).toEqual(["North"]);
    expect(partial.missing).toEqual(["Garden"]);
  });

  it("never zooms into a leaf", () => {
    const leafPath = ["North", "Home", "Lamp"];
    const resolved = resolveFocus(result.root, leafPath);
    expect(labels(resolved.trail)).toEqual(["North", "Home"]);
    const leaf = result.nodes.find(
      (node) => JSON.stringify(node.path) === JSON.stringify(leafPath)
    )!;
    expect(isZoomable(leaf)).toBe(false);
    expect(isZoomable(resolved.node)).toBe(true);
  });
});

describe("keepForLevels", () => {
  const current = {
    levels: ["region", "category", "product"],
    filters: [
      { type: "value", field: "region", values: ["North"] },
      { type: "value", field: "category", values: ["Home"] },
    ] as Filter[],
    focus: ["North", "Home"],
  };

  it("keeps the selection and zoom while levels stay in place", () => {
    expect(keepForLevels(current, current.levels)).toEqual({
      filters: current.filters,
      focus: ["North", "Home"],
    });
  });

  it("keeps only the unchanged prefix when a level changes", () => {
    expect(keepForLevels(current, ["region", "product", "category"])).toEqual({
      filters: [current.filters[0]],
      focus: ["North"],
    });
    expect(keepForLevels(current, ["category", "region"])).toEqual({
      filters: [],
      focus: undefined,
    });
  });

  it("stops the zoom above the last level", () => {
    expect(keepForLevels(current, ["region", "category"]).focus).toEqual([
      "North",
    ]);
  });
});

describe("small and many children", () => {
  // Under A: five categories of falling size; under B: two.
  const sizes: [string, string, number][] = [
    ["A", "a1", 5],
    ["A", "a2", 4],
    ["A", "a3", 3],
    ["A", "a4", 2],
    ["A", "a5", 1],
    ["B", "b1", 2],
    ["B", "b2", 1],
  ];
  const many = sizes.flatMap(([top, leaf, count]) =>
    Array.from({ length: count }, () => ({ top, leaf }))
  );
  const manyPlan = (overrides: Partial<HierarchySettings> = {}) =>
    planHierarchy({
      settings: settings({
        levels: ["top", "leaf"],
        ...overrides,
      }),
      snapshot: {
        revision: "r",
        liveIds: many.map((_, index) => index),
        levelData: {
          top: Object.fromEntries(many.map((row, index) => [index, row.top])),
          leaf: Object.fromEntries(many.map((row, index) => [index, row.leaf])),
        },
        measureData: {},
      },
      getFieldLabel: (field) => field,
    });

  it("draws every child with a size, with no catch-all group", () => {
    const result = manyPlan();
    const a = result.root.children.find((node) => node.label === "A")!;
    expect(a.shown.map((node) => node.label)).toEqual([
      "a1",
      "a2",
      "a3",
      "a4",
      "a5",
    ]);
    expect(result.nodes.every((node) => node.kind !== "root")).toBe(true);
    expect(a.shown.reduce((sum, node) => sum + node.weight, 0)).toBe(a.weight);
  });

  it("colors by branch, by level, or one color", () => {
    const colors = (colorBy: HierarchySettings["colorBy"]) => {
      const result = manyPlan({ colorBy });
      return result.nodes.map((node) => `${node.depth}:${node.color}`);
    };
    const byLevel = new Set(colors("level"));
    expect([...byLevel].filter((item) => item.startsWith("1:"))).toHaveLength(
      1
    );
    expect(new Set(colors("none").map((item) => item.slice(2))).size).toBe(1);
    expect(new Set(colors("branch").map((item) => item.slice(2))).size).toBe(2);
  });
});
