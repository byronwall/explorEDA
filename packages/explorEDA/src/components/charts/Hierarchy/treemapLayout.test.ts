import { describe, expect, it } from "vitest";
import type { HierarchyNode } from "./hierarchyPlan";
import { layoutTreemap, squarify } from "./treemapLayout";

function node(
  id: string,
  weight: number,
  children: HierarchyNode[] = []
): HierarchyNode {
  return {
    id,
    depth: 0,
    field: "",
    label: id,
    kind: "value",
    value: id,
    path: [id],
    children,
    weight,
    selectedWeight: 0,
    rowCount: 1,
    color: "#000",
    selected: false,
    contributors: [],
  };
}

const area = (r: { x0: number; y0: number; x1: number; y1: number }) =>
  (r.x1 - r.x0) * (r.y1 - r.y0);

describe("squarify", () => {
  it("fills the box exactly, each item in proportion to its value", () => {
    const values = [6, 6, 4, 3, 2, 2, 1];
    const items = values.map((value, index) => ({
      node: node(String(index), value),
      value,
    }));
    const boxes = squarify(items, { x0: 0, y0: 0, x1: 600, y1: 400 });
    const total = values.reduce((sum, value) => sum + value, 0);
    let covered = 0;
    for (const item of items) {
      const box = boxes.get(item)!;
      expect(area(box)).toBeCloseTo((600 * 400 * item.value) / total, 6);
      expect(box.x0).toBeGreaterThanOrEqual(-1e-9);
      expect(box.y1).toBeLessThanOrEqual(400 + 1e-9);
      covered += area(box);
    }
    expect(covered).toBeCloseTo(600 * 400, 6);
    // Squarified rows keep rectangles far from slivers.
    const ratios = [...boxes.values()].map((box) => {
      const w = box.x1 - box.x0;
      const h = box.y1 - box.y0;
      return Math.max(w / h, h / w);
    });
    expect(Math.max(...ratios)).toBeLessThan(3);
  });
});

describe("layoutTreemap", () => {
  it("nests children inside their parent below its label strip", () => {
    const home = node("Home", 3, [node("Lamp", 1), node("Rug", 2)]);
    const office = node("Office", 1, [node("Desk", 1)]);
    const root = node("root", 4, [home, office]);
    const rects = layoutTreemap(root, {
      width: 400,
      height: 300,
      headerHeight: 18,
      padding: 2,
    });
    expect(rects.map((rect) => rect.node.id)).toEqual([
      "Home",
      "Lamp",
      "Rug",
      "Office",
      "Desk",
    ]);
    const byId = new Map(rects.map((rect) => [rect.node.id, rect]));
    const parent = byId.get("Home")!;
    expect(parent.header).toBe(18);
    expect(area(parent) / (400 * 300)).toBeCloseTo(0.75, 6);
    for (const id of ["Lamp", "Rug"]) {
      const child = byId.get(id)!;
      expect(child.y0).toBeGreaterThanOrEqual(parent.y0 + 18 - 1e-9);
      expect(child.x0).toBeGreaterThanOrEqual(parent.x0);
      expect(child.x1).toBeLessThanOrEqual(parent.x1);
      expect(child.y1).toBeLessThanOrEqual(parent.y1);
    }
    expect(area(byId.get("Rug")!) / area(byId.get("Lamp")!)).toBeCloseTo(2, 6);
  });

  it("skips empty nodes", () => {
    const root = node("root", 2, [node("A", 2), node("B", 0)]);
    const rects = layoutTreemap(root, { width: 100, height: 100 });
    expect(rects.map((rect) => rect.node.id)).toEqual(["A"]);
  });
});
