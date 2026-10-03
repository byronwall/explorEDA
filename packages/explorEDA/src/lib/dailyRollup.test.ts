import { describe, expect, it } from "vitest";
import { applyFilter } from "@/hooks/applyFilter";
import { rollupByDay, utcDay } from "./dailyRollup";

describe("rollupByDay", () => {
  const dates = {
    0: "2023-12-31T23:59:59.999",
    1: "2024-01-01",
    2: "2024-01-01T23:59:59.999Z",
    3: "2024-02-29",
    4: "not a date",
    5: null,
    6: "2024-01-01T02:00:00+05:00",
  };
  const amounts = { 0: 5, 1: 10, 2: "x", 3: 0, 6: 1 };
  const ids = [0, 1, 2, 3, 4, 5, 6];

  it("groups rows by UTC day, including the last millisecond and offsets", () => {
    const rollup = rollupByDay(ids, dates, amounts, {
      dateField: "date",
      aggregation: "count",
    });
    expect([...rollup.days.keys()].sort()).toEqual([
      "2023-12-31",
      "2024-01-01",
      "2024-02-29",
    ]);
    // 02:00 at +05:00 is 21:00 UTC the previous day.
    expect(rollup.days.get("2023-12-31")?.contributors.map((c) => c.sourceId)).toEqual([0, 6]);
    expect(rollup.days.get("2024-01-01")?.value).toBe(2);
    expect(rollup.invalidDateIds).toEqual([4, 5]);
    expect(rollup.years).toEqual([2023, 2024]);
  });

  it("sums valid measures and records excluded rows", () => {
    const rollup = rollupByDay(ids, dates, amounts, {
      dateField: "date",
      aggregation: "sum",
      measureField: "amount",
    });
    const day = rollup.days.get("2024-01-01")!;
    expect(day.value).toBe(10);
    expect(day.contributors.find((c) => c.sourceId === 2)).toMatchObject({
      included: false,
    });
    expect(rollup.days.get("2024-02-29")?.value).toBe(0);
  });

  it("agrees with the one-day date filter at both edges", () => {
    const filter = { type: "date-range" as const, field: "date", min: "2024-01-01", max: "2024-01-01" };
    const inDay = ids.filter((id) => {
      const value = dates[id as keyof typeof dates];
      return typeof value === "string" && applyFilter(value, filter);
    });
    const rollup = rollupByDay(ids, dates, amounts, { dateField: "date", aggregation: "count" });
    expect(inDay).toEqual(
      rollup.days.get("2024-01-01")!.contributors.map((c) => c.sourceId)
    );
    expect(utcDay("2024-01-01T00:00:00.000Z")?.day).toBe("2024-01-01");
  });
});
