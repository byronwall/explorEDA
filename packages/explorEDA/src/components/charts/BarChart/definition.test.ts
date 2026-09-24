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
