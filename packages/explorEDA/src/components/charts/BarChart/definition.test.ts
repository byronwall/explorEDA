import { describe, expect, it } from "vitest";
import { barChartDefinition } from "./definition";

describe("bar chart aggregate filters", () => {
  it("applies a grouped chart range to the filter field", () => {
    const settings = {
      ...barChartDefinition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 4 },
        "id"
      ),
      aggregateId: "sales",
      filters: [{ type: "range" as const, field: "value", min: 0 }],
    };
    const filter = barChartDefinition.getFilterFunction(settings, (field) =>
      field === "value" ? { 1: -1, 2: 4 } : { 1: "one", 2: "two" }
    );

    expect(filter(1)).toBe(false);
    expect(filter(2)).toBe(true);
  });
});

describe("bar chart group selection", () => {
  it("filters a grouped chart to its selected groups and measure range", () => {
    const settings = {
      ...barChartDefinition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 4 },
        "Revenue"
      ),
      aggregateId: "revenue-by-region",
      filters: [
        { type: "value" as const, field: "Region", values: ["West"] },
        { type: "range" as const, field: "Revenue", min: 10 },
      ],
    };
    const columns: Record<string, Record<number, string | number>> = {
      Region: { 1: "West", 2: "West", 3: "East" },
      Revenue: { 1: 5, 2: 20, 3: 30 },
    };
    const filter = barChartDefinition.getFilterFunction(
      settings,
      (field) => columns[field] ?? {}
    );

    expect([1, 2, 3].filter(filter)).toEqual([2]);
  });
});
