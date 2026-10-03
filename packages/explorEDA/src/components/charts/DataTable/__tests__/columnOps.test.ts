import { describe, expect, it } from "vitest";
import { hideColumn, moveColumn, pickColumns } from "../columnOps";

const columns = [
  { id: "a", field: "a", width: 120 },
  { id: "b", field: "b" },
  { id: "c", field: "c" },
];
const order = (list: typeof columns) =>
  list.map((column) => column.id).join("");

describe("moveColumn", () => {
  it("moves a column before the column at the target index", () => {
    expect(order(moveColumn(columns, "c", 0))).toBe("cab");
    expect(order(moveColumn(columns, "a", 2))).toBe("bac");
    expect(order(moveColumn(columns, "a", 3))).toBe("bca");
  });

  it("keeps the same array when the drop lands beside the column", () => {
    expect(moveColumn(columns, "b", 1)).toBe(columns);
    expect(moveColumn(columns, "b", 2)).toBe(columns);
    expect(moveColumn(columns, "missing", 0)).toBe(columns);
  });
});

describe("hideColumn", () => {
  it("removes a column but keeps the last one", () => {
    expect(order(hideColumn(columns, "b"))).toBe("ac");
    const one = [columns[0]!];
    expect(hideColumn(one, "a")).toBe(one);
  });
});

describe("pickColumns", () => {
  it("keeps the width of a column that stays", () => {
    expect(pickColumns(columns, ["c", "a", "d"])).toEqual([
      { id: "c", field: "c" },
      { id: "a", field: "a", width: 120 },
      { id: "d", field: "d" },
    ]);
  });
});
