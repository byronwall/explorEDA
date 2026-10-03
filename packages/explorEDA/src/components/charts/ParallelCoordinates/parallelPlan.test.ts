import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import {
  parallelCoordinatesDefinition,
  type ParallelCoordinatesSettings,
} from "./definition";
import {
  brushToFilter,
  findNearestLine,
  moveAxis,
  planParallelCoordinates,
  stableJitter,
  withAxisFilter,
  type ParallelSnapshot,
} from "./parallelPlan";
import { resolveParallelTrace } from "./parallelTrace";

// Four numeric fields with a missing value, a tie, and one outlier, plus a category.
const rows: Record<string, datum>[] = [
  { a: 1, b: 10, c: 5, d: 100, kind: "x" },
  { a: 2, b: 20, c: 5, d: 110, kind: "y" },
  { a: 3, b: null, c: 5, d: 120, kind: "x" },
  { a: 4, b: 40, c: 5, d: 130, kind: "z" },
  { a: 5, b: 50, c: 5, d: 9000, kind: "y" },
];
const ids = rows.map((_, index) => index);
const column = (field: string) =>
  Object.fromEntries(ids.map((id) => [id, rows[id]![field]]));

function snapshot(liveIds = ids): ParallelSnapshot {
  return {
    revision: "r1",
    allIds: ids,
    liveIds,
    columns: Object.fromEntries(
      ["a", "b", "c", "d", "kind"].map((f) => [f, column(f)])
    ),
    kinds: {
      a: "numeric",
      b: "numeric",
      c: "numeric",
      d: "numeric",
      kind: "categorical",
    },
  };
}

function settings(
  filters: Filter[] = [],
  inverted = false
): ParallelCoordinatesSettings {
  return {
    ...parallelCoordinatesDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 6,
      h: 4,
    }),
    id: "pc",
    axes: ["a", "b", "c", "d", "kind"].map((field) => ({
      field,
      inverted: field === "a" && inverted,
    })),
    filters,
  };
}

const plan = (filters: Filter[] = [], inverted = false, live = ids) =>
  planParallelCoordinates({
    settings: settings(filters, inverted),
    width: 600,
    height: 320,
    snapshot: snapshot(live),
    getFieldLabel: (field) => field.toUpperCase(),
  });

const selectedIds = (result: ReturnType<typeof plan>) =>
  result.lines.filter((line) => line.selected).map((line) => line.id);

describe("planParallelCoordinates", () => {
  it("draws one line per complete row and reports rows with a missing value", () => {
    const result = plan();
    expect(result.lines.map((line) => line.id)).toEqual([0, 1, 3, 4]);
    expect(result.omittedIds).toEqual([2]);
    expect(result.axes.find((axis) => axis.field === "b")!.missing).toBe(1);
    expect(result.hasSelection).toBe(false);
  });

  it("centers an axis whose values are all equal and keeps an outlier on the scale", () => {
    const result = plan();
    const c = result.axes.findIndex((axis) => axis.field === "c");
    expect(new Set(result.lines.map((line) => line.ys[c]))).toEqual(
      new Set([result.plotHeight / 2])
    );
    const d = result.axes.find((axis) => axis.field === "d")!;
    expect(d.domain[1]).toBeGreaterThanOrEqual(9000);
  });

  it("intersects two axis ranges and keeps the same rows after reorder, flip, and resize", () => {
    const filters: Filter[] = [
      { type: "range", field: "a", min: 2, max: 5 },
      { type: "range", field: "d", min: 100, max: 200 },
    ];
    const base = plan(filters);
    expect(selectedIds(base)).toEqual([1, 3]);
    expect(base.selectedCount).toBe(2);

    const reordered = planParallelCoordinates({
      settings: {
        ...settings(filters, true),
        axes: moveAxis(settings(filters, true).axes, 0, 3),
      },
      width: 280,
      height: 500,
      snapshot: snapshot(),
      getFieldLabel: (field) => field,
    });
    expect(selectedIds(reordered)).toEqual([1, 3]);
    expect(reordered.axes.map((axis) => axis.field)).toEqual([
      "b",
      "c",
      "d",
      "a",
      "kind",
    ]);
  });

  it("keeps axis ranges from all rows while other charts filter", () => {
    const all = plan().axes.find((axis) => axis.field === "a")!.domain;
    const filtered = plan([], false, [0, 1]).axes.find(
      (axis) => axis.field === "a"
    )!.domain;
    expect(filtered).toEqual(all);
  });

  it("flips an axis without changing its saved bounds", () => {
    const upright = plan([], false).axes[0]!;
    const flipped = plan([], true).axes[0]!;
    const line = (p: ReturnType<typeof plan>) =>
      p.lines.find((item) => item.id === 0)!.ys[0]!;
    expect(line(plan([], false))).toBeCloseTo(
      plan().plotHeight - line(plan([], true))
    );
    const span = [plan().plotHeight * 0.25, plan().plotHeight * 0.75] as const;
    const a = brushToFilter(upright, plan().plotHeight, ...span) as {
      min: number;
      max: number;
    };
    const b = brushToFilter(flipped, plan().plotHeight, ...span) as {
      min: number;
      max: number;
    };
    // The same pixels mean the same middle of the range either way up.
    expect(a.min).toBeCloseTo(b.min);
    expect(a.max).toBeCloseTo(b.max);
  });

  it("turns a dragged span into a range in data units", () => {
    const result = plan();
    const a = result.axes[0]!;
    const filter = brushToFilter(a, result.plotHeight, result.plotHeight, 0);
    expect(filter).toEqual({
      type: "range",
      field: "a",
      min: a.domain[0],
      max: a.domain[1],
    });
  });

  it("selects category values whose bands fall inside the span", () => {
    const result = plan();
    const kind = result.axes.find((axis) => axis.field === "kind")!;
    expect(kind.categories.map((item) => item.label)).toEqual(["x", "y", "z"]);
    const y = kind.categories.find((item) => item.label === "y")!;
    expect(
      brushToFilter(kind, result.plotHeight, y.center - 2, y.center + 2)
    ).toEqual({
      type: "value",
      field: "kind",
      values: ["y"],
    });
    expect(brushToFilter(kind, result.plotHeight, 0, 1)).toBeUndefined();

    const picked = plan([{ type: "value", field: "kind", values: ["y"] }]);
    expect(selectedIds(picked)).toEqual([1, 4]);
    expect(picked.axes.find((axis) => axis.field === "kind")!.brush?.text).toBe(
      "y"
    );
  });

  it("jitters category lines by row and field, the same way every time", () => {
    expect(stableJitter(7, "kind")).toBe(stableJitter(7, "kind"));
    expect(stableJitter(7, "kind")).not.toBe(stableJitter(8, "kind"));
    const first = plan().lines.map((line) => line.ys[4]);
    const resized = plan([], false, ids).lines.map((line) => line.ys[4]);
    expect(resized).toEqual(first);
  });

  it("rejects a category axis with too many values", () => {
    const result = planParallelCoordinates({
      settings: settings(),
      width: 600,
      height: 300,
      snapshot: {
        ...snapshot(),
        allIds: Array.from({ length: 60 }, (_, index) => index),
        columns: {
          ...snapshot().columns,
          kind: Object.fromEntries(
            Array.from({ length: 60 }, (_, i) => [i, `v${i}`])
          ),
        },
      },
      getFieldLabel: (field) => field,
    });
    expect(result.rejected).toEqual([
      { field: "kind", label: "kind", count: 60 },
    ]);
    expect(result.axes.map((axis) => axis.field)).not.toContain("kind");
  });

  it("finds the nearest line and traces its vertices", () => {
    const result = plan([{ type: "range", field: "a", min: 4, max: 5 }]);
    const line = result.lines.find((item) => item.id === 3)!;
    const found = findNearestLine(result, result.axes[0]!.x, line.ys[0]!);
    expect(found?.id).toBe(3);
    const trace = resolveParallelTrace(
      result,
      snapshot(),
      undefined,
      "polyline",
      "row:3"
    );
    expect(trace?.kind).toBe("polyline");
    if (trace?.kind !== "polyline") {
      return;
    }
    expect(trace.selected).toBe(true);
    expect(trace.vertices.map((vertex) => vertex.raw)).toEqual([
      4,
      40,
      5,
      130,
      "z",
    ]);
    expect(trace.vertices[0]!.passes).toBe(true);
    expect(trace.vertices[1]!.passes).toBeUndefined();
  });
});

describe("axis helpers", () => {
  it("replaces one axis filter and keeps the rest", () => {
    const filters: Filter[] = [
      { type: "range", field: "a", min: 1, max: 2 },
      { type: "value", field: "kind", values: ["x"] },
    ];
    expect(withAxisFilter(filters, "a", undefined)).toEqual([filters[1]]);
    expect(
      withAxisFilter(filters, "a", { type: "range", field: "a", min: 3 })
    ).toEqual([filters[1], { type: "range", field: "a", min: 3 }]);
  });

  it("moves an axis and clamps the target", () => {
    expect(moveAxis(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(moveAxis(["a", "b", "c"], 2, 9)).toEqual(["a", "b", "c"]);
    expect(moveAxis(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
  });
});
