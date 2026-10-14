import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  periodStart,
  planRetention,
  type RetentionInput,
} from "./retentionPlan";

type Row = [user: datum, event: datum, at: datum];

function input(rows: Row[], extra: Partial<RetentionInput> = {}) {
  const column = (index: number) =>
    Object.fromEntries(rows.map((row, id) => [id, row[index]]));
  const ids = rows.map((_, id) => id);
  return {
    ids,
    allIds: ids,
    entity: column(0),
    event: column(1),
    time: column(2),
    period: "week",
    periods: 4,
    ...extra,
  } satisfies RetentionInput;
}

// Worked out by hand. Weeks start Monday 2025-01-06; the data ends
// Wednesday 2025-01-29, partway through the week of 2025-01-27.
const fixture: Row[] = [
  ["a", "signup", "2025-01-06T09:00:00Z"],
  ["a", "session", "2025-01-14T09:00:00Z"],
  ["a", "session", "2025-01-28T09:00:00Z"],
  ["b", "signup", "2025-01-08T09:00:00Z"],
  ["b", "session", "2025-01-09T09:00:00Z"],
  ["b", "session", "2025-01-15T09:00:00Z"],
  ["b", "session", "2025-01-16T09:00:00Z"],
  ["c", "signup", "2025-01-14T09:00:00Z"],
  ["c", "session", "2025-01-22T09:00:00Z"],
  ["d", "visit", "2025-01-29T09:00:00Z"],
];

const sessions = { entryEvent: "signup", activityEvents: ["session"] };

describe("planRetention", () => {
  it("groups entities by their entry week and counts each later week once", () => {
    const plan = planRetention(input(fixture, sessions));
    expect(plan.cohorts.map((cohort) => [cohort.key, cohort.size])).toEqual([
      ["2025-01-06", 2],
      ["2025-01-13", 1],
    ]);
    const [first, second] = plan.cohorts;
    expect(first!.cells.map((cell) => cell.active)).toEqual([1, 2, 0, 1]);
    expect(first!.cells.map((cell) => cell.rate)).toEqual([0.5, 1, 0, 0.5]);
    expect(second!.cells.map((cell) => cell.active)).toEqual([0, 1, 0, 0]);
  });

  it("leaves periods past the data blank and marks the one it ends in", () => {
    const plan = planRetention(input(fixture, sessions));
    const [first, second] = plan.cohorts;
    expect(first!.cells.map((cell) => cell.observed)).toEqual([
      true,
      true,
      true,
      true,
    ]);
    expect(first!.cells.map((cell) => cell.partial)).toEqual([
      false,
      false,
      false,
      true,
    ]);
    expect(second!.cells.map((cell) => cell.observed)).toEqual([
      true,
      true,
      true,
      false,
    ]);
  });

  it("pools cohorts only over the periods each has reached", () => {
    const plan = planRetention(input(fixture, sessions));
    expect(plan.summary.map((cell) => [cell.active, cell.size])).toEqual([
      [1, 3],
      [3, 3],
      [0, 3],
      [1, 2],
    ]);
  });

  it("counts entities without the entry event as left out", () => {
    const plan = planRetention(input(fixture, sessions));
    expect(plan.entities).toBe(3);
    expect(plan.excluded).toEqual([
      { reason: "without the entry event", count: 1 },
    ]);
  });

  it("enters on the first event and counts any event without settings", () => {
    const plan = planRetention(input(fixture));
    expect(plan.cohorts.map((cohort) => cohort.size)).toEqual([2, 1, 1]);
    // Every entity is active in its entry week.
    expect(plan.cohorts.map((cohort) => cohort.cells[0]!.rate)).toEqual([
      1, 1, 1,
    ]);
  });

  it("uses calendar months", () => {
    const rows: Row[] = [
      ["a", "x", "2025-01-31T23:00:00Z"],
      ["a", "x", "2025-02-01T01:00:00Z"],
      ["b", "x", "2025-03-15T00:00:00Z"],
    ];
    const plan = planRetention(input(rows, { period: "month", periods: 3 }));
    expect(plan.cohorts[0]!.cells.map((cell) => cell.active)).toEqual([
      1, 1, 0,
    ]);
    expect(plan.cohorts[0]!.cells[2]!.partial).toBe(true);
  });

  it("starts weeks on Monday in UTC", () => {
    expect(
      new Date(periodStart(Date.UTC(2025, 0, 12, 23), "week")).toISOString()
    ).toBe("2025-01-06T00:00:00.000Z");
  });
});
