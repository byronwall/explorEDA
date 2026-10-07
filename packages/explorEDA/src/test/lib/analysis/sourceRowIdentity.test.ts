import { describe, expect, it } from "vitest";
import type { SourceDefinition } from "@/types/AnalysisProject";
import {
  matchingSourceRows,
  resolveSourceRow,
} from "@/components/project/sourceRowIdentity";

describe("related source row identity", () => {
  it("keeps both physical rows when duplicate entity keys match a relationship", () => {
    const orders: SourceDefinition = {
      id: "orders",
      name: "Orders",
      glyph: "▦",
      entityKey: "orderId",
      fields: [],
    };
    const rows = [
      { orderId: "duplicate", customerId: "C1", amount: 12 },
      { orderId: "duplicate", customerId: "C1", amount: 19 },
    ];
    const matches = matchingSourceRows(orders, rows, "customerId", "C1");

    expect(matches).toHaveLength(2);
    expect(new Set(matches.map(({ ref }) => ref.rowKey)).size).toBe(2);
    expect(matches.map(({ issue }) => issue)).toEqual([
      "duplicate-key",
      "duplicate-key",
    ]);
    expect(
      matches.map(({ ref }) => resolveSourceRow(orders, rows, ref).row?.amount)
    ).toEqual([12, 19]);
    expect(
      matches.reduce((total, { row }) => total + Number(row.amount), 0)
    ).toBe(31);
  });
});
