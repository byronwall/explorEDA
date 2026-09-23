import { expect, it } from "vitest";
import { planFacetGridLayout, planFacetWrapLayout } from "./facetLayout";

it("plans the visible facet page and its rendered cell sizes", () => {
  const grid = planFacetGridLayout(500, 430, 4, 3, 1, 40);
  expect(grid).toMatchObject({
    rowPageSize: 2,
    columnPageSize: 1,
    rowPage: 0,
    columnPage: 1,
    cellWidth: 410,
    cellHeight: 185,
  });
  const wrap = planFacetWrapLayout(600, 500, 8, 3, 1);
  expect(wrap).toMatchObject({
    columnCount: 2,
    rowCount: 2,
    pageSize: 4,
    page: 1,
    facetWidth: 296,
    facetHeight: 236,
  });
});
