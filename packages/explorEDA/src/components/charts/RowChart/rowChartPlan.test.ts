import { describe, expect, it } from "vitest";
import { calculateGroupedAggregate } from "@/lib/aggregates";
import type { AggregateSpec } from "@/lib/aggregates";
import { planRowCategories, planRowSummary } from "./rowChartPlan";

describe("planRowCategories", () => {
  it("ranks counts across all rows and gathers the smallest into Other", () => {
    const column = { 0: "A", 1: "A", 2: "A", 3: "B", 4: "B", 5: "C", 6: "D" };
    const plan = planRowCategories(column, [0, 3, 4, 6], 3);
    expect(
      plan.categories.map(({ key, label, total, sourceIds }) => ({
        key,
        label,
        total,
        sourceIds,
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "key": "["string","A"]",
          "label": "A",
          "sourceIds": [
            0,
          ],
          "total": 3,
        },
        {
          "key": "["string","B"]",
          "label": "B",
          "sourceIds": [
            3,
            4,
          ],
          "total": 2,
        },
        {
          "key": "["string","C"]",
          "label": "C",
          "sourceIds": [],
          "total": 1,
        },
        {
          "key": "["string","D"]",
          "label": "D",
          "sourceIds": [
            6,
          ],
          "total": 1,
        },
      ]
    `);
    expect(plan.visible.map((item) => item.label)).toEqual(["A", "B"]);
    expect(plan.other.map((item) => item.label)).toEqual(["C", "D"]);
  });

  it("shows every category when they fit", () => {
    const plan = planRowCategories({ 0: "A", 1: "B" }, [0, 1], 2);
    expect(plan.visible).toHaveLength(2);
    expect(plan.other).toEqual([]);
  });
});

const rows = [
  { region: "North", revenue: 10 },
  { region: "North", revenue: 30 },
  { region: "South", revenue: 5 },
  { region: "South", revenue: 7 },
  { region: "East", revenue: 50 },
  { region: "West", revenue: 2 },
  { region: "West", revenue: 4 },
].map((row, __ID) => ({ __ID, ...row }));
const spec = (aggregation: AggregateSpec["aggregation"]): AggregateSpec => ({
  id: "by-region",
  name: "Revenue by region",
  groupField: "region",
  measureField: "revenue",
  aggregation,
});
const summarize = (
  aggregation: AggregateSpec["aggregation"],
  ids: number[] = rows.map((row) => row.__ID)
) =>
  calculateGroupedAggregate(
    rows.filter((row) => ids.includes(row.__ID)),
    spec(aggregation)
  );

describe("planRowSummary", () => {
  it("ranks a sum by its all-row value and matches hand totals", () => {
    const plan = planRowSummary(summarize("sum"), summarize("sum"), 10);
    expect(
      plan.visible.map(({ label, total, current }) => [label, total, current])
    ).toEqual([
      ["East", 50, 50],
      ["North", 40, 40],
      ["South", 12, 12],
      ["West", 6, 6],
    ]);
    expect(plan.otherSummary).toBeUndefined();
  });

  it("holds the all-row order while filtered values change", () => {
    // Only South and West rows pass other charts' filters.
    const plan = planRowSummary(
      summarize("sum", [2, 3, 5]),
      summarize("sum"),
      10
    );
    expect(
      plan.visible.map(({ label, current, sourceIds }) => [
        label,
        current,
        sourceIds,
      ])
    ).toEqual([
      ["East", 0, []],
      ["North", 0, []],
      ["South", 12, [2, 3]],
      ["West", 2, [5]],
    ]);
  });

  it("leaves an average with no filtered rows unavailable", () => {
    const plan = planRowSummary(
      summarize("average", [0]),
      summarize("average"),
      10
    );
    expect(plan.visible.map((item) => item.current)).toEqual([
      undefined,
      10,
      undefined,
      undefined,
    ]);
  });

  it("pools Other from its members' rows, not from their averages", () => {
    const plan = planRowSummary(summarize("average"), summarize("average"), 3);
    expect(plan.visible.map((item) => item.label)).toEqual(["East", "North"]);
    expect(plan.other.map((item) => item.label)).toEqual(["South", "West"]);
    // (5 + 7 + 2 + 4) / 4, not the mean of 6 and 3.
    expect(plan.otherSummary?.total).toBe(4.5);
    expect(plan.otherSummary?.current).toBe(4.5);
  });

  it("adds sums and counts in Other", () => {
    const sum = planRowSummary(summarize("sum"), summarize("sum"), 3);
    expect(sum.otherSummary?.total).toBe(18);
    // North, South, and West have two rows each; West and East fall into Other.
    const count = planRowSummary(summarize("count"), summarize("count"), 3);
    expect(count.other.map((item) => item.label)).toEqual(["West", "East"]);
    expect(count.otherSummary?.total).toBe(3);
  });

  it("ranks unavailable values below every valued category", () => {
    const withText = calculateGroupedAggregate(
      [...rows, { __ID: 7, region: "Lab", revenue: "n/a" }],
      spec("sum")
    );
    const plan = planRowSummary(withText, withText, 10);
    expect(plan.visible.map((item) => item.label).at(-1)).toBe("Lab");
    expect(plan.visible.at(-1)?.total).toBeUndefined();
  });
});

describe("poolAggregateRows", () => {
  it("counts an ID shared by two groups once", () => {
    const shared = calculateGroupedAggregate(
      [
        { __ID: 0, region: "North", order: "A", revenue: 10 },
        { __ID: 1, region: "South", order: "A", revenue: 10 },
        { __ID: 2, region: "South", order: "B", revenue: 4 },
      ],
      { ...spec("sum"), entityField: "order" }
    );
    const plan = planRowSummary(shared, shared, 1);
    expect(plan.otherSummary?.total).toBe(14);
  });
});

describe("signed summaries", () => {
  it("ranks losses last, below every gain", () => {
    const signed = calculateGroupedAggregate(
      [
        { __ID: 0, region: "North", revenue: -5 },
        { __ID: 1, region: "South", revenue: 3 },
        { __ID: 2, region: "East", revenue: -12 },
        { __ID: 3, region: "West", revenue: 0 },
      ],
      spec("sum")
    );
    const plan = planRowSummary(signed, signed, 10);
    expect(plan.visible.map((item) => [item.label, item.total])).toEqual([
      ["South", 3],
      ["West", 0],
      ["North", -5],
      ["East", -12],
    ]);
  });
});
