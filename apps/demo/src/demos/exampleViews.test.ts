import { describe, expect, it } from "vitest";
import { examples } from "./examples";

describe("example saved views", () => {
  const withViews = examples.filter((example) => example.views?.length);

  it("opens at least three examples with extra saved views", () => {
    expect(withViews.map((example) => example.id)).toEqual(
      expect.arrayContaining([
        "shop-operations",
        "palmer-penguins",
        "calendar-series",
      ])
    );
  });

  it("keeps each view's shared definitions and uses only its example's charts", () => {
    for (const example of withViews) {
      const main = example.savedData!;
      const ids = new Set(main.charts.map((chart) => chart.id));
      for (const view of example.views!) {
        const { savedData } = view;
        expect(savedData.metadata.name).toBe(view.name);
        expect(savedData.calculations).toBe(main.calculations);
        expect(savedData.colorScales).toBe(main.colorScales);
        expect(savedData.fieldSettings).toBe(main.fieldSettings);
        expect(savedData.aggregates).toBe(main.aggregates);
        expect(savedData.charts.length).toBeGreaterThan(0);
        expect(savedData.charts.every((chart) => ids.has(chart.id))).toBe(true);
      }
    }
  });
});
