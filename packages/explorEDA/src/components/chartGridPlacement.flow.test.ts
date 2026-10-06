import { expect, it } from "vitest";
import { flowTwoColumns, narrowColumnCount } from "./chartGridPlacement";

it("flows narrow charts two to a row and gives wide charts the whole row", () => {
  const charts = [
    { id: "a", layout: { x: 0, y: 0, w: 4, h: 2 } },
    { id: "b", layout: { x: 4, y: 0, w: 4, h: 2 } },
    { id: "c", layout: { x: 8, y: 0, w: 4, h: 2 } },
    { id: "wide", layout: { x: 0, y: 2, w: 12, h: 4 } },
  ];
  const placed = flowTwoColumns(charts, 12);
  expect(placed.get("a")).toEqual({ x: 0, y: 0, w: 1 });
  expect(placed.get("b")).toEqual({ x: 1, y: 0, w: 1 });
  expect(placed.get("c")).toEqual({ x: 0, y: 2, w: 1 });
  expect(placed.get("wide")).toEqual({ x: 0, y: 4, w: 2 });
});

it("stacks one chart per row on phones", () => {
  expect(narrowColumnCount(390)).toBe(1);
  expect(narrowColumnCount(783)).toBe(2);
});
