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
    expect(getExampleUsageStatus("chart:row", "box-plot")).toBe("not-used");
    expect(getExampleUsageStatus("chart:row", "categorical-charts")).toBe(
      "shown"
    );
    expect(getImplementationStatus("chart:row")).toBe("supported");
    expect(getImplementationStatus("scale:log")).toBe("not-supported");
    expect(getImplementationStatus("scale:time")).toBe("supported");
    expect(getImplementationStatus("scale:symlog")).toBe("supported");
    expect(getFeatureReviewStatus("chart:row")).toBe("not-reviewed");
    expect(getFeatureReviewStatus("scale:symlog")).toBe("reviewed");
    expect(getExampleUsageStatus("scale:symlog", "shop-operations")).toBe(
      "reviewed"
    );
    expect(getExamplesUsingFeature("chart:row")).toEqual([
      "distribution-discovery",
      "wine-chemistry",
      "scatter-regression",
      "scatter-matrix",
      "bubble-scatter",
      "area-charts",
      "stacked-bars",
      "grouped-bars",
      "calendar-series",
      "january-flights",
      "beijing-air",
      "world-development",
      "earthquakes-2023",
      "shop-operations",
      "palmer-penguins",
      "categorical-charts",
      "message-log",
      "tech-sparklines",
      "forecast-fan",
      "product-activity",
      "scatter-trace",
      "calculated-orders",
      "shop-10000",
    ]);
    expect(getFeatureGapCount("scale:log")).toBe(0);

    const missingEvidence = exampleCoverage.map((example) =>
      example.exampleId === "shop-operations"
        ? {
            ...example,
            review: {
              ...example.review!,
              evidence: {
                ...example.review!.evidence,
                "chart:scatter": "",
              },
            },
          }
        : example
    );
    expect(findCoverageErrors(missingEvidence)).toContain(
      "Missing review evidence: shop-operations/chart:scatter"
    );

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
