import { examples } from "./examples";

export type ImplementationStatus =
  | "supported"
  | "not-supported"
  | "not-checked";
export type ReviewStatus = "reviewed" | "not-reviewed";
export type ExampleUsageStatus = "shown" | "reviewed" | "not-used";

type FeatureDefinition = {
  id: string;
  label: string;
  family: string;
  description: string;
  required: boolean;
  status: ImplementationStatus;
  gaps?: readonly string[];
  chartType?: string;
};

export const coverageFeatures = [
  {
    id: "chart:row",
    label: "Row chart",
    family: "Chart types",
    description: "Compare category counts in horizontal rows.",
    required: true,
    status: "supported",
    chartType: "row",
  },
  {
    id: "chart:bar",
    label: "Bar chart",
    family: "Chart types",
    description: "Show a numerical distribution in bins.",
    required: true,
    status: "supported",
    chartType: "bar",
  },
  {
    id: "chart:scatter",
    label: "Scatter plot",
    family: "Chart types",
    description: "Show the relationship between two numerical fields.",
    required: true,
    status: "supported",
    chartType: "scatter",
  },
  {
    id: "chart:3d-scatter",
    label: "3D scatter plot",
    family: "Chart types",
    description: "Show the relationship between three numerical fields.",
    required: true,
    status: "supported",
    chartType: "3d-scatter",
  },
  {
    id: "chart:pivot",
    label: "Pivot table",
    family: "Chart types",
    description: "Aggregate values across row and column groups.",
    required: true,
    status: "supported",
    chartType: "pivot",
  },
  {
    id: "chart:data-table",
    label: "Data table",
    family: "Chart types",
    description: "Inspect selected fields from source rows.",
    required: true,
    status: "supported",
    chartType: "data-table",
  },
  {
    id: "chart:summary",
    label: "Summary table",
    family: "Chart types",
    description: "Summarize fields and their distributions.",
    required: true,
    status: "supported",
    chartType: "summary",
  },
  {
    id: "chart:markdown",
    label: "Markdown",
    family: "Chart types",
    description: "Add explanatory text to a dashboard.",
    required: true,
    status: "supported",
    chartType: "markdown",
  },
  {
    id: "chart:boxplot",
    label: "Box plot",
    family: "Chart types",
    description: "Compare distributions, spread, and outliers.",
    required: true,
    status: "supported",
    chartType: "boxplot",
  },
  {
    id: "chart:color-legend",
    label: "Color legend",
    family: "Chart types",
    description: "Explain categorical and numerical color encodings.",
    required: true,
    status: "supported",
    chartType: "color-legend",
  },
  {
    id: "chart:line",
    label: "Line chart",
    family: "Chart types",
    description: "Show change across an ordered field.",
    required: true,
    status: "supported",
    chartType: "line",
  },
  {
    id: "labels:meaningful-title",
    label: "Meaningful titles",
    family: "Labels and guides",
    description: "State the question or finding that a view answers.",
    required: true,
    status: "not-checked",
    gaps: ["No example is the declared reference for question-led titles."],
  },
  {
    id: "labels:axes",
    label: "Axis labels",
    family: "Labels and guides",
    description: "Name axes and include units when they affect meaning.",
    required: true,
    status: "not-checked",
    gaps: ["No example is the declared reference for axis labels and units."],
  },
  {
    id: "guides:ticks",
    label: "Ticks",
    family: "Labels and guides",
    description: "Use readable tick values at a useful density.",
    required: true,
    status: "not-checked",
    gaps: ["No example intentionally demonstrates readable tick choices."],
  },
  {
    id: "guides:grids",
    label: "Grid lines",
    family: "Labels and guides",
    description: "Use grid lines only where they help comparison.",
    required: true,
    status: "supported",
  },
  {
    id: "scale:linear",
    label: "Linear scale",
    family: "Scales",
    description: "Demonstrate a deliberate linear numerical scale.",
    required: true,
    status: "not-checked",
    gaps: ["No example intentionally demonstrates a deliberate linear scale."],
  },
  {
    id: "scale:log",
    label: "Log scale",
    family: "Scales",
    description: "Demonstrate a logarithmic numerical scale.",
    required: true,
    status: "not-checked",
    gaps: ["No example intentionally demonstrates a logarithmic scale."],
  },
  {
    id: "scale:time",
    label: "Time scale",
    family: "Scales",
    description: "Demonstrate a scale that interprets values as dates.",
    required: true,
    status: "not-checked",
    gaps: ["No example intentionally demonstrates a time scale."],
  },
  {
    id: "scale:band",
    label: "Band scale",
    family: "Scales",
    description: "Demonstrate a categorical position scale.",
    required: true,
    status: "not-checked",
    gaps: ["No example intentionally demonstrates a band scale."],
  },
  {
    id: "color:categorical",
    label: "Categorical color",
    family: "Color",
    description: "Map categories to distinct colors.",
    required: true,
    status: "supported",
  },
  {
    id: "color:numerical",
    label: "Numerical color",
    family: "Color",
    description: "Map numerical values to a continuous palette.",
    required: true,
    status: "supported",
  },
  {
    id: "color:legend",
    label: "Legends",
    family: "Color",
    description: "Explain every non-obvious color encoding.",
    required: true,
    status: "supported",
  },
  {
    id: "facet:wrap",
    label: "Wrap facets",
    family: "Facets",
    description: "Repeat one view across values in a wrapped layout.",
    required: true,
    status: "supported",
  },
  {
    id: "facet:grid",
    label: "Grid facets",
    family: "Facets",
    description: "Repeat one view across row and column values.",
    required: true,
    status: "supported",
  },
  {
    id: "facet:shared-scales",
    label: "Shared scales",
    family: "Facets",
    description: "Keep repeated views comparable with shared domains.",
    required: true,
    status: "not-checked",
    gaps: ["No example verifies shared facet domains."],
  },
  {
    id: "interaction:brushing",
    label: "Brushing",
    family: "Interaction",
    description: "Select a visible range directly on a chart.",
    required: true,
    status: "supported",
  },
  {
    id: "interaction:cross-filter",
    label: "Cross-chart filtering",
    family: "Interaction",
    description: "Use one chart selection to filter related views.",
    required: true,
    status: "supported",
  },
  {
    id: "interaction:active-filter",
    label: "Active filter display",
    family: "Interaction",
    description: "Keep the current filter state visible and removable.",
    required: true,
    status: "not-checked",
    gaps: ["No example opens with a visible active-filter display."],
  },
  {
    id: "interaction:saved-filter-state",
    label: "Saved filter state",
    family: "Interaction",
    description: "Open an example with a deliberate filter already active.",
    required: true,
    status: "not-checked",
    gaps: ["No example restores with a deliberate filter already active."],
  },
  {
    id: "table:sorting",
    label: "Table sorting",
    family: "Tables",
    description: "Sort rows by a selected column.",
    required: true,
    status: "supported",
  },
  {
    id: "table:filtering",
    label: "Table filtering",
    family: "Tables",
    description: "Filter rows with a visible query or field control.",
    required: true,
    status: "not-checked",
    gaps: ["No example is the declared reference for table filtering."],
  },
  {
    id: "table:virtualization",
    label: "Virtual table scrolling",
    family: "Tables",
    description: "Scroll through rows while rendering only the visible range.",
    required: true,
    status: "supported",
  },
  {
    id: "table:formatting",
    label: "Table formatting",
    family: "Tables",
    description: "Format values and widths for fast scanning.",
    required: true,
    status: "not-checked",
    gaps: ["No example is the declared reference for table formatting."],
  },
  {
    id: "layout:dashboard",
    label: "Dashboard layout",
    family: "Layout",
    description: "Arrange related views in a clear reading order.",
    required: true,
    status: "supported",
  },
  {
    id: "state:empty",
    label: "Empty state",
    family: "States",
    description: "Explain when no rows or results are available.",
    required: true,
    status: "not-checked",
    gaps: ["No example demonstrates a useful empty state."],
  },
  {
    id: "state:invalid",
    label: "Invalid state",
    family: "States",
    description: "Explain invalid data or chart settings without data loss.",
    required: true,
    status: "not-checked",
    gaps: ["No example demonstrates recovery from invalid data or settings."],
  },
  {
    id: "accessibility:naming",
    label: "Accessibility naming",
    family: "Accessibility",
    description: "Give charts and controls useful accessible names.",
    required: true,
    status: "not-checked",
    gaps: ["No example has a recorded accessible-name review."],
  },
  {
    id: "responsive:desktop-resize",
    label: "Desktop resize",
    family: "Responsive behavior",
    description: "Remain usable across supported desktop widths.",
    required: true,
    status: "not-checked",
    gaps: ["No example has a recorded desktop resize review."],
  },
] as const satisfies readonly FeatureDefinition[];

export type CoverageFeature = (typeof coverageFeatures)[number];
export type CoverageFeatureId = CoverageFeature["id"];
export type DemonstrationStatus = Extract<
  ExampleUsageStatus,
  "shown" | "reviewed"
>;

export type ExampleCoverage = {
  exampleId: string;
  intent: string;
  features: Partial<Record<CoverageFeatureId, DemonstrationStatus>>;
};

export const exampleCoverage = [
  {
    exampleId: "calculated-orders",
    intent:
      "Trace chained calculations from source orders to contribution, dates, and service rules.",
    features: {
      "chart:row": "shown",
      "chart:bar": "shown",
      "chart:scatter": "shown",
      "chart:data-table": "shown",
      "chart:line": "shown",
      "chart:pivot": "shown",
      "chart:markdown": "shown",
      "facet:wrap": "shown",
    },
  },
  {
    exampleId: "shop-10000",
    intent:
      "Explore 10,000 orders through 15 linked views and comparable regional facets.",
    features: {
      "chart:row": "shown",
      "chart:bar": "shown",
      "chart:scatter": "shown",
      "chart:boxplot": "shown",
      "chart:data-table": "shown",
      "chart:line": "shown",
      "facet:wrap": "shown",
      "facet:shared-scales": "shown",
      "layout:dashboard": "shown",
    },
  },
  {
    exampleId: "product-activity",
    intent:
      "Explore linked product traffic, conversion, and response-time views.",
    features: {
      "chart:line": "shown",
      "chart:row": "shown",
      "chart:scatter": "shown",
      "chart:bar": "shown",
      "chart:boxplot": "shown",
      "chart:data-table": "shown",
      "color:legend": "shown",
    },
  },
  {
    exampleId: "palmer-penguins",
    intent: "Start an unsaved exploration with a familiar mixed dataset.",
    features: {},
  },
  {
    exampleId: "shop-operations",
    intent: "Start an unsaved exploration with operational measures.",
    features: {},
  },
  {
    exampleId: "lorenz-3d",
    intent: "Show coordinated brushing across 2D and 3D views.",
    features: {
      "chart:scatter": "shown",
      "chart:3d-scatter": "shown",
      "chart:markdown": "shown",
      "facet:wrap": "shown",
      "interaction:brushing": "shown",
      "interaction:cross-filter": "shown",
      "layout:dashboard": "shown",
    },
  },
  {
    exampleId: "box-plot",
    intent:
      "Compare a box plot with a beeswarm, histogram, and summary table.",
    features: {
      "chart:bar": "shown",
      "chart:boxplot": "shown",
      "color:numerical": "shown",
    },
  },
  {
    exampleId: "categorical-charts",
    intent: "Compare categorical totals and a two-variable facet grid.",
    features: {
      "chart:row": "shown",
      "chart:pivot": "shown",
      "color:categorical": "shown",
      "facet:grid": "shown",
    },
  },
  {
    exampleId: "color-legend",
    intent: "Show categorical and numerical color beside a shared legend.",
    features: {
      "chart:color-legend": "shown",
      "color:categorical": "shown",
      "color:numerical": "shown",
      "color:legend": "shown",
    },
  },
  {
    exampleId: "line-chart",
    intent: "Show several numerical series on one line chart.",
    features: {
      "chart:line": "shown",
      "guides:grids": "shown",
      "color:legend": "shown",
    },
  },
  {
    exampleId: "tables",
    intent: "Show source rows beside field summaries.",
    features: {
      "chart:summary": "shown",
      "chart:data-table": "shown",
      "table:sorting": "shown",
      "table:virtualization": "shown",
    },
  },
  {
    exampleId: "fifa",
    intent: "Explore a large categorical player dataset.",
    features: {},
  },
  {
    exampleId: "world-bank-population",
    intent: "Compare country trends in a wrapped line-chart layout.",
    features: { "facet:wrap": "shown" },
  },
  {
    exampleId: "nba-stats",
    intent: "Compare player measures across charts and tables.",
    features: {},
  },
] as const satisfies readonly ExampleCoverage[];

export const coverageFamilies = [
  ...new Set(coverageFeatures.map(({ family }) => family)),
] as [CoverageFeature["family"], ...CoverageFeature["family"][]];

const featureById = new Map(
  coverageFeatures.map((feature) => [feature.id, feature])
);
const exampleById = new Map<string, ExampleCoverage>(
  exampleCoverage.map((example) => [example.exampleId, example])
);

export function getExampleUsageStatus(
  featureId: CoverageFeatureId,
  exampleId: string
): ExampleUsageStatus {
  return exampleById.get(exampleId)?.features[featureId] ?? "not-used";
}

export function getImplementationStatus(
  featureId: CoverageFeatureId
): ImplementationStatus {
  return featureById.get(featureId)?.status ?? "not-checked";
}

export function getFeatureReviewStatus(
  featureId: CoverageFeatureId,
  manifest: readonly ExampleCoverage[] = exampleCoverage
): ReviewStatus {
  return manifest.some((example) => example.features[featureId] === "reviewed")
    ? "reviewed"
    : "not-reviewed";
}

export function getExamplesUsingFeature(
  featureId: CoverageFeatureId,
  manifest: readonly ExampleCoverage[] = exampleCoverage
): string[] {
  return manifest
    .filter((example) => example.features[featureId] !== undefined)
    .map((example) => example.exampleId);
}

export function getFeatureGapCount(featureId: CoverageFeatureId): number {
  const feature = featureById.get(featureId);
  return feature && "gaps" in feature ? feature.gaps.length : 0;
}

export function getOpenGapCount(): number {
  return coverageFeatures.reduce(
    (total, feature) => total + ("gaps" in feature ? feature.gaps.length : 0),
    0
  );
}

export function findCoverageErrors(
  manifest: readonly ExampleCoverage[] = exampleCoverage,
  knownExampleIds: readonly string[] = examples.map(({ id }) => id)
): string[] {
  const errors: string[] = [];
  const knownExamples = new Set(knownExampleIds);
  const knownFeatures = new Set<string>(coverageFeatures.map(({ id }) => id));
  const declaredFeatures = new Set<string>();

  for (const entry of manifest) {
    if (!knownExamples.has(entry.exampleId)) {
      errors.push(`Unknown example: ${entry.exampleId}`);
    }
    for (const id of Object.keys(entry.features)) {
      if (!knownFeatures.has(id)) {
        errors.push(`Unknown feature: ${id}`);
      }
      declaredFeatures.add(id);
    }
  }

  for (const feature of coverageFeatures) {
    if (
      feature.required &&
      getImplementationStatus(feature.id) !== "not-supported" &&
      !("gaps" in feature && feature.gaps.length > 0) &&
      !declaredFeatures.has(feature.id)
    ) {
      errors.push(`Required feature has no example: ${feature.id}`);
    }
  }

  return errors;
}
