import { describe, expect, it } from "vitest";
import type { HierarchyNode } from "./hierarchyPlan";
import {
  arcPath,
  layoutIcicle,
  layoutSunburst,
  shownDepth,
} from "./partitionLayout";

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

describe("layoutSunburst", () => {
  const root = node("root", 4, [
    node("Home", 3, [node("Lamp", 1), node("Rug", 2)]),
    node("Office", 1, [node("Desk", 1)]),
  ]);

  it("gives each level a ring and each node its share of the circle", () => {
    const arcs = layoutSunburst(root, { radius: 100, hole: 20 });
    const byId = new Map(arcs.map((arc) => [arc.node.id, arc]));
    const home = byId.get("Home")!;
    expect(home.a0).toBe(0);
    expect(home.a1).toBeCloseTo(Math.PI * 1.5, 9);
    expect([home.r0, home.r1]).toEqual([20, 60]);
    const rug = byId.get("Rug")!;
    expect(rug.a1 - rug.a0).toBeCloseTo(Math.PI, 9);
    expect([rug.r0, rug.r1]).toEqual([60, 100]);
    expect(byId.get("Desk")!.a1).toBeCloseTo(Math.PI * 2, 9);
  });

  it("draws a full ring as two half arcs", () => {
    const path = arcPath({
      node: root,
      a0: 0,
      a1: Math.PI * 2,
      r0: 10,
      r1: 20,
    });
    expect(path.match(/A/g)).toHaveLength(4);
    expect(arcPath({ node: root, a0: 0, a1: 1, r0: 0, r1: 20 })).not.toContain(
      "A0,0"
    );
  });
});
