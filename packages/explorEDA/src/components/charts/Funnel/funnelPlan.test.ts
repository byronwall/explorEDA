import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { funnelSelection, planFunnel, type FunnelInput } from "./funnelPlan";

type Row = [user: datum, event: datum, at: datum];

function input(rows: Row[], extra: Partial<FunnelInput> = {}): FunnelInput {
  const column = (index: number) =>
    Object.fromEntries(rows.map((row, id) => [id, row[index]]));
  return {
    ids: rows.map((_, id) => id),
    entity: column(0),
    event: column(1),
    time: column(2),
    steps: ["view", "signup", "pay"],
    ...extra,
  };
}

const day = (n: number) => `2025-01-${String(n).padStart(2, "0")}T10:00:00Z`;

// The fixture from the shape brief, worked out by hand: 4 → 3 → 2.
const fixture: Row[] = [
  ["u1", "view", day(1)],
  ["u1", "signup", day(2)],
  ["u1", "pay", day(3)],
  ["u2", "view", day(1)],
  ["u2", "pay", day(2)],
  ["u2", "signup", day(3)],
  ["u3", "signup", day(1)],
  ["u3", "view", day(2)],
  ["u3", "signup", day(3)],
  ["u3", "pay", day(4)],
  ["u4", "view", day(1)],
];

describe("planFunnel", () => {
  it("counts each step only after the step before it", () => {
    const plan = planFunnel(input(fixture));
    expect(plan.steps.map((step) => step.count)).toEqual([4, 3, 2]);
    expect(plan.entities).toBe(4);
    expect(plan.steps.map((step) => step.ofFirst)).toEqual([1, 0.75, 0.5]);
    expect(plan.steps[2]!.ofPrevious).toBeCloseTo(2 / 3);
    expect(plan.steps.map((step) => step.dropped)).toEqual([0, 1, 1]);
  });

  it("counts the first occurrence that follows the step before", () => {
    const plan = planFunnel(input(fixture));
    // u3's signup on day 1 came before its view; the day 3 signup counts.
    const signup = plan.steps[1]!.contributors.map((row) => row.sourceId);
    expect(signup).toEqual([1, 5, 8]);
  });

  it("tells an out-of-order drop from a step never taken", () => {
    const plan = planFunnel(input(fixture));
    // u4 never signed up; u2 paid, but before signing up.
    expect(plan.steps[1]!.droppedOutOfOrder).toBe(0);
    expect(plan.steps[2]!.droppedOutOfOrder).toBe(1);
  });

  it("counts later steps only inside the window", () => {
    const rows: Row[] = [
      ["a", "view", day(1)],
      ["a", "signup", day(3)],
      ["a", "pay", day(12)],
      ["b", "view", day(1)],
      ["b", "signup", day(8)],
    ];
    expect(
      planFunnel(input(rows, { windowDays: 6 })).steps.map((step) => step.count)
    ).toEqual([2, 1, 0]);
    // b signed up exactly 7 days after its view, which still counts.
    expect(
      planFunnel(input(rows, { windowDays: 7 })).steps.map((step) => step.count)
    ).toEqual([2, 2, 0]);
    expect(
      planFunnel(input(rows, { windowDays: 11 })).steps.map(
        (step) => step.count
      )
    ).toEqual([2, 2, 1]);
  });

  it("orders events at the same time by row", () => {
    const rows: Row[] = [
      ["a", "view", day(1)],
      ["a", "signup", day(1)],
      ["b", "signup", day(1)],
      ["b", "view", day(1)],
    ];
    expect(planFunnel(input(rows)).steps.map((step) => step.count)).toEqual([
      2, 1, 0,
    ]);
  });

  it("leaves out rows with no entity or no readable time", () => {
    const rows: Row[] = [
      ["a", "view", day(1)],
      [null, "view", day(1)],
      ["", "view", day(1)],
      ["b", "view", "soon"],
      ["b", "view", null],
    ];
    const plan = planFunnel(input(rows));
    expect(plan.steps[0]!.count).toBe(1);
    expect(plan.excluded).toEqual([
      { reason: "Missing entity", count: 2 },
      { reason: "Missing or unreadable time", count: 2 },
    ]);
  });

  it("returns zero shares when nothing reached the first step", () => {
    const plan = planFunnel(input([["a", "other", day(1)]]));
    expect(plan.steps.map((step) => [step.count, step.ofFirst])).toEqual([
      [0, 0],
      [0, 0],
      [0, 0],
    ]);
  });
});

describe("funnelSelection", () => {
  it("selects the entities that reached a step", () => {
    expect([...funnelSelection(input(fixture), ["pay"])].sort()).toEqual([
      '["string","u1"]',
      '["string","u3"]',
    ]);
    expect(funnelSelection(input(fixture), ["view"]).size).toBe(4);
  });

  it("selects entities with any other event value at all", () => {
    const rows: Row[] = [...fixture, ["u4", "share", day(5)]];
    expect([...funnelSelection(input(rows), ["share"])]).toEqual([
      '["string","u4"]',
    ]);
  });
});
