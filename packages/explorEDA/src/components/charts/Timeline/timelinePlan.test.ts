import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  overlapsWindow,
  planTimeline,
  type TimelineInput,
} from "./timelinePlan";

type Row = [lane: datum, start: datum, end: datum];

function input(rows: Row[], ids?: number[]): TimelineInput {
  const column = (index: number) =>
    Object.fromEntries(rows.map((row, id) => [id, row[index]]));
  const all = rows.map((_, id) => id);
  return {
    ids: ids ?? all,
    allIds: all,
    lane: column(0),
    start: column(1),
    end: column(2),
  };
}

const t = (hour: number) =>
  `2025-03-03T${String(hour).padStart(2, "0")}:00:00Z`;
const ms = (hour: number) => Date.UTC(2025, 2, 3, hour);

const rows: Row[] = [
  ["Room 10", t(9), t(10)],
  ["Room 2", t(8), t(12)],
  ["Room 2", t(11), null],
  ["Room 10", t(14), t(16)],
  [null, t(9), t(10)],
  ["Room 2", "soon", t(10)],
  ["Room 2", t(13), t(12)],
];

describe("planTimeline", () => {
  it("sorts lanes by label, numbers as numbers", () => {
    expect(planTimeline(input(rows)).lanes.map((lane) => lane.label)).toEqual([
      "Room 2",
      "Room 10",
    ]);
  });

  it("spans every readable row and draws open ends to the range's end", () => {
    const plan = planTimeline(input(rows));
    expect(plan.domain).toEqual([ms(8), ms(16)]);
    const open = plan.intervals.find((item) => item.id === 2)!;
    expect(open).toMatchObject({ open: true, start: ms(11), end: ms(16) });
  });

  it("keeps lanes and range when other filters narrow the rows", () => {
    const plan = planTimeline(input(rows, [0]));
    expect(plan.lanes).toHaveLength(2);
    expect(plan.domain).toEqual([ms(8), ms(16)]);
    expect(plan.intervals.map((item) => item.id)).toEqual([0]);
  });

  it("counts the rows it cannot draw", () => {
    expect(planTimeline(input(rows)).excluded).toEqual([
      { reason: "rows with no lane value", count: 1 },
      { reason: "rows with no readable start", count: 1 },
      { reason: "rows that end before they start", count: 1 },
    ]);
  });
});

describe("overlapsWindow", () => {
  const window = { min: ms(10), max: ms(12) };
  it("keeps intervals that share time with the window, touching included", () => {
    expect(overlapsWindow(ms(8), ms(10), window)).toBe(true);
    expect(overlapsWindow(ms(12), ms(13), window)).toBe(true);
    expect(overlapsWindow(ms(9), ms(13), window)).toBe(true);
    expect(overlapsWindow(ms(8), ms(9), window)).toBe(false);
    expect(overlapsWindow(ms(13), ms(14), window)).toBe(false);
  });

  it("treats an open end as not yet ended", () => {
    expect(overlapsWindow(ms(8), undefined, window)).toBe(true);
    expect(overlapsWindow(ms(13), undefined, window)).toBe(false);
  });
});
