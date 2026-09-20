import "exploreda";
// @ts-expect-error The package uses export maps, but this project uses legacy module resolution.
import { chartRegistry as packageRegistry } from "exploreda/core";
import { describe, expect, it } from "vitest";
import {
  coverageFeatures,
  exampleCoverage,
  findCoverageErrors,
  getExampleUsageStatus,
  getExamplesUsingFeature,
  getFeatureGapCount,
  getFeatureReviewStatus,
  getImplementationStatus,
  getOpenGapCount,
  type ExampleCoverage,
} from "./coverage";
import { examples } from "./examples";

const chartRegistry = packageRegistry as {
  getAll: () => Array<{ type: string }>;
};

describe("example coverage manifest", () => {
  it("uses known IDs, declares required coverage or gaps, and covers the chart registry", () => {
    expect(findCoverageErrors()).toEqual([]);

    const invalid = [
      ...exampleCoverage,
      {
        exampleId: "unknown-example",
        intent: "Exercise validation.",
        features: { "unknown:feature": "shown" },
      },
    ] as unknown as readonly ExampleCoverage[];
    expect(findCoverageErrors(invalid)).toEqual([
      "Unknown example: unknown-example",
      "Unknown feature: unknown:feature",
    ]);

    expect(exampleCoverage.map(({ exampleId }) => exampleId).sort()).toEqual(
      examples.map(({ id }) => id).sort()
    );

    const registeredTypes = chartRegistry
      .getAll()
      .map(({ type }) => type)
      .sort();
    const coveredTypes = coverageFeatures
      .flatMap((feature) => ("chartType" in feature ? [feature.chartType] : []))
      .sort();
    expect(coveredTypes).toEqual(registeredTypes);
  });

  it("keeps implementation, review, usage, and gaps distinct", () => {
    expect(getExampleUsageStatus("chart:row", "palmer-penguins")).toBe(
      "not-used"
    );
    expect(getExampleUsageStatus("chart:row", "categorical-charts")).toBe(
      "shown"
    );
    expect(getImplementationStatus("chart:row")).toBe("supported");
    expect(getImplementationStatus("scale:log")).toBe("not-checked");
    expect(getFeatureReviewStatus("chart:row")).toBe("not-reviewed");
    expect(getExamplesUsingFeature("chart:row")).toEqual([
      "calculated-orders",
      "shop-10000",
      "product-activity",
      "categorical-charts",
    ]);
    expect(getFeatureGapCount("scale:log")).toBe(1);
    expect(getOpenGapCount()).toBeGreaterThan(0);

    const reviewed = [
      {
        exampleId: "categorical-charts",
        intent: "Exercise summary priority.",
        features: { "chart:row": "reviewed" },
      },
    ] as const satisfies readonly ExampleCoverage[];
    expect(getFeatureReviewStatus("chart:row", reviewed)).toBe("reviewed");
  });
});
