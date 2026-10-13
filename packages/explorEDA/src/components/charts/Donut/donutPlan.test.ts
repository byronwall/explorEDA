import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { planDonut, type DonutInput } from "./donutPlan";

const rows: Record<string, datum>[] = [
  { channel: "Web", revenue: 50 },
  { channel: "Store", revenue: 30 },
  { channel: "Web", revenue: 20 },
  { channel: "Wholesale", revenue: 15 },
  { channel: "Phone", revenue: 5 },
  { channel: "Kiosk", revenue: 0 },
];
const column = (field: string, list = rows) =>
  Object.fromEntries(list.map((row, id) => [id, row[field]])) as Record<
    number,
    datum
  >;
const input = (overrides: Partial<DonutInput> = {}): DonutInput => ({
  ids: rows.map((_, id) => id),
  category: column("channel"),
  aggregation: "sum",
  measure: column("revenue"),
  ...overrides,
});

describe("planDonut", () => {
  it("shares a sum among categories, largest first", () => {
    const plan = planDonut(input());
    expect(plan.total).toBe(120);
    expect(
      plan.slices.map((slice) => [slice.label, slice.amount, slice.share])
    ).toEqual([
      ["Web", 70, 70 / 120],
      ["Store", 30, 0.25],
      ["Wholesale", 15, 0.125],
      ["Phone", 5, 5 / 120],
      ["Kiosk", 0, 0],
    ]);
    expect(plan.slices.reduce((sum, slice) => sum + slice.share, 0)).toBe(1);
  });

  it("pools categories past Top N into Other, keeping their rows", () => {
    const plan = planDonut(input({ topN: 2 }));
    const other = plan.slices.at(-1)!;
    expect(plan.slices.map((slice) => slice.label)).toEqual([
      "Web",
      "Store",
      "Other",
    ]);
    expect(other).toMatchObject({ key: "__other", amount: 20 });
    expect(other.members!.map((member) => member.label)).toEqual([
      "Wholesale",
      "Phone",
      "Kiosk",
    ]);
    expect(other.row.contributors.map((item) => item.sourceId)).toEqual([
      3, 4, 5,
    ]);
  });

  it("counts rows when there is no measure", () => {
    const plan = planDonut(input({ aggregation: "count", measure: undefined }));
    expect(plan.slices[0]).toMatchObject({ label: "Web", amount: 2 });
    expect(plan.total).toBe(6);
  });

  it("refuses a negative part instead of drawing a ring", () => {
    const signed = [...rows, { channel: "Returns", revenue: -40 }];
    const plan = planDonut(
      input({
        ids: signed.map((_, id) => id),
        category: column("channel", signed),
        measure: column("revenue", signed),
      })
    );
    expect(plan.slices).toEqual([]);
    expect(plan.message).toMatch(/^Returns is negative/);
  });

  it("refuses a whole that sums to zero", () => {
    const plan = planDonut(input({ ids: [5] }));
    expect(plan.message).toBe(
      "The values sum to zero, so there are no shares to show."
    );
  });

  it("draws nothing when no rows pass the other filters", () => {
    expect(planDonut(input({ ids: [] }))).toEqual({ slices: [], total: 0 });
  });
});
