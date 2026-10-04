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
    expect(
      rollup.days.get("2023-12-31")?.contributors.map((c) => c.sourceId)
    ).toEqual([0, 6]);
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
    const filter = {
      type: "date-range" as const,
      field: "date",
      min: "2024-01-01",
      max: "2024-01-01",
    };
    const inDay = ids.filter((id) => {
      const value = dates[id as keyof typeof dates];
      return typeof value === "string" && applyFilter(value, filter);
    });
    const rollup = rollupByDay(ids, dates, amounts, {
      dateField: "date",
      aggregation: "count",
    });
    expect(inDay).toEqual(
      rollup.days.get("2024-01-01")!.contributors.map((c) => c.sourceId)
    );
    expect(utcDay("2024-01-01T00:00:00.000Z")?.day).toBe("2024-01-01");
  });
});

describe("calendar periods", () => {
  it("keeps week boundaries and month ends equal to their date filters", async () => {
    const { rollupByPeriod } = await import("./dailyRollup");
    const dates = {
      0: "2023-12-31T23:59:59.999Z",
      1: "2024-01-01",
      2: "2024-01-07T23:59:59.999Z",
      3: "2024-01-08",
      4: "2024-02-29T23:59:59.999Z",
      5: "2024-03-01",
      6: "2024-03-01T01:00:00+05:00",
    };
    const ids = Object.keys(dates).map(Number);
    for (const interval of ["day", "week", "month"] as const)
      for (const weekStart of ["monday", "sunday"] as const) {
        const result = rollupByPeriod(
          ids,
          dates,
          {},
          { dateField: "date", interval, weekStart, aggregation: "count" }
        );
        for (const bucket of result.buckets) {
          const filter = {
            type: "date-range" as const,
            field: "date",
            min: new Date(bucket.start).toISOString(),
            max: new Date(bucket.end - 1).toISOString(),
          };
          expect(
            ids.filter((id) =>
              applyFilter(dates[id as keyof typeof dates], filter)
            )
          ).toEqual(bucket.contributors.map((row) => row.sourceId));
        }
      }
    const months = rollupByPeriod(
      ids,
      dates,
      {},
      { dateField: "date", interval: "month", aggregation: "count" }
    );
    expect(
      months.buckets
        .find((bucket) => bucket.day === "2024-02-01")
        ?.contributors.map((row) => row.sourceId)
    ).toEqual([4, 6]);
  });

  it("averages source values across unequal daily populations and retains conversion exclusions", async () => {
    const { rollupByPeriod } = await import("./dailyRollup");
    const result = rollupByPeriod(
      [0, 1, 2, 3, 4],
      {
        0: "2024-01-01",
        1: "2024-01-01",
        2: "2024-01-02",
        3: "2024-01-03",
        4: "bad",
      },
      { 0: 10, 1: 20, 2: 90, 3: undefined },
      {
        dateField: "date",
        interval: "month",
        aggregation: "average",
        measureField: "value",
      },
      { 3: "bad amount" },
      { 3: "Conversion failed" }
    );
    expect(result.buckets[0]?.value).toBe(40);
    expect(result.buckets[0]?.contributors[3]).toMatchObject({
      sourceId: 3,
      included: false,
      rawInput: "bad amount",
      exclusionReason: "Conversion failed",
    });
    expect(result.invalidDateIds).toEqual([4]);
  });
});
