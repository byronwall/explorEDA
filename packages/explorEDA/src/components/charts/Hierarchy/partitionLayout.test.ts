import { describe, expect, it } from "vitest";
import type { HierarchyNode } from "./hierarchyPlan";
import { layoutIcicle, shownDepth } from "./partitionLayout";

function node(id: string, weight: number, shown: HierarchyNode[] = []) {
  return {
    id,
    depth: 0,
    field: "",
    label: id,
    kind: "value",
    value: id,
    members: [id],
    path: [id],
    children: shown,
    shown,
    weight,
    selectedWeight: 0,
    rowCount: 1,
    color: "#000",
    selected: false,
    contributors: [],
  } satisfies HierarchyNode;
}

describe("layoutIcicle", () => {
  const root = node("root", 4, [
    node("Home", 3, [node("Lamp", 1), node("Rug", 2)]),
    node("Office", 1, [node("Desk", 1)]),
  ]);

  it("gives each level a column and each node its share of the height", () => {
    expect(shownDepth(root)).toBe(2);
    const rects = layoutIcicle(root, { width: 400, height: 200 });
    const byId = new Map(rects.map((rect) => [rect.node.id, rect]));
    expect(byId.get("Home")).toMatchObject({ x0: 0, x1: 200, y0: 0, y1: 150 });
    expect(byId.get("Office")).toMatchObject({ x0: 0, y0: 150, y1: 200 });
    expect(byId.get("Lamp")).toMatchObject({ x0: 200, x1: 400, y0: 0, y1: 50 });
    expect(byId.get("Rug")).toMatchObject({ y0: 50, y1: 150 });
    expect(rects.every((rect) => rect.header === 0)).toBe(true);
  });

  it("draws nothing for an empty root", () => {
    expect(layoutIcicle(node("root", 0), { width: 100, height: 100 })).toEqual(
      []
    );
  });
});
