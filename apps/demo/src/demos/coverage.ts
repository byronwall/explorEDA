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
    id: "chart:map",
    label: "Map",
    family: "Chart types",
    description: "Locate source rows by latitude and longitude.",
    chartType: "map",
    required: true,
    status: "supported",
  },
  {
    id: "mode:scatter-density",
    label: "Binned scatter density",
    family: "Chart modes",
    description:
      "Count numeric coordinate pairs in fixed rectangular bins and inspect exact membership.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:scatter-regression",
    label: "Scatter regression",
    family: "Chart modes",
    description:
      "Fit each color group within each facet, read equations and R², and trace each fit's rows.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:scatter-hexbin",
    label: "Hexagonal scatter bins",
    family: "Chart modes",
    description:
      "Count coordinate pairs in fixed hexagons and select or inspect each hexagon's exact rows.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:scatter-contour",
    label: "Smoothed 2D density",
    family: "Chart modes",
    description:
      "Estimate density with a Gaussian kernel and draw filled regions and contour lines with bandwidth and level controls.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:bubble-scatter",
    label: "Bubble scatter",
    family: "Chart modes",
    description:
      "Map a nonnegative value to point area, select source rows, and inspect the size calculation.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:area",
    label: "Area and stacked area",
    family: "Chart modes",
    description:
      "Fill calendar summaries from zero or add nonnegative period totals, with exact band and source tracing.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:stacked-bars",
    label: "Stacked and 100% bars",
    family: "Chart modes",
    description:
      "Compare signed totals or nonnegative shares and inspect each category denominator.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:grouped-bars",
    label: "Grouped bars",
    family: "Chart modes",
    description:
      "Compare category–series pairs and inspect each bar's source rows.",
    required: true,
    status: "supported",
  },
  {
    id: "mode:calendar-series",
    label: "Calendar time series",
    family: "Chart modes",
    description:
      "Summarize dated rows by UTC day, week, or month and inspect each period.",
    required: true,
    status: "supported",
  },
  {
    id: "chart:metric-card",
    label: "Metric card",
    family: "Chart types",
    description:
      "Read the count, sum, or average for matching rows and inspect its inputs.",
    required: true,
    status: "supported",
    chartType: "metric-card",
  },
  {
    id: "chart:row",
    label: "Row chart",
    family: "Chart types",
    description:
      "Rank category counts or a grouped summary, such as revenue, in horizontal rows.",
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
    id: "chart:sankey",
    label: "Sankey diagram",
    family: "Chart types",
    description:
      "Follow rows through ordered category stages and select a node or link.",
    required: true,
    status: "supported",
    chartType: "sankey",
  },
  {
    id: "chart:parallel-coordinates",
    label: "Parallel coordinates",
    family: "Chart types",
    description:
      "Follow each row across several fields and brush ranges on any axis.",
    required: true,
    status: "supported",
    chartType: "parallel-coordinates",
  },
  {
    id: "chart:hierarchy",
    label: "Hierarchy",
    family: "Chart types",
    description:
      "See how a total divides through nested categories as a treemap, and select a branch.",
    required: true,
    status: "supported",
    chartType: "hierarchy",
  },
  {
    id: "chart:scatter-matrix",
    label: "Scatter matrix",
    family: "Chart types",
    description:
      "Compare every pair of several fields, with each field's distribution on the diagonal.",
    required: true,
    status: "supported",
    chartType: "scatter-matrix",
  },
  {
    id: "chart:calendar",
    label: "Calendar heatmap",
    family: "Chart types",
    description: "Show a count or measure for each day of a year.",
    required: true,
    status: "supported",
    chartType: "calendar",
  },
  {
    id: "chart:heatmap",
    label: "Heatmap",
    family: "Chart types",
    description: "Compare a count or measure across two categories.",
    required: true,
    status: "supported",
    chartType: "heatmap",
  },
  {
    id: "chart:ecdf",
    label: "ECDF",
    family: "Chart types",
    description:
      "Read the share of values at or below any threshold, without bins.",
    required: true,
    status: "supported",
    chartType: "ecdf",
  },
  {
    id: "chart:donut",
    label: "Donut",
    family: "Chart types",
    description:
      "Show each category's share of a small whole, with the smaller categories pooled into Other.",
    required: true,
    status: "supported",
    chartType: "donut",
  },
  {
    id: "chart:waterfall",
    label: "Waterfall",
    family: "Chart types",
    description:
      "Bridge one total to another, such as plan to actual, with one signed step per category and group subtotals.",
    required: true,
    status: "supported",
    chartType: "waterfall",
  },
  {
    id: "chart:composition",
    label: "Composition",
    family: "Chart types",
    description:
      "Build a report graphic on a blank artboard from text, repeated chart units, and guides.",
    required: true,
    status: "supported",
    chartType: "composition",
  },
  {
    id: "labels:meaningful-title",
    label: "Meaningful titles",
    family: "Labels and guides",
    description: "State the question or finding that a view answers.",
    required: true,
    status: "supported",
  },
  {
    id: "labels:axes",
    label: "Axis labels",
    family: "Labels and guides",
    description: "Name axes and include units when they affect meaning.",
    required: true,
    status: "supported",
  },
  {
    id: "guides:ticks",
    label: "Ticks",
    family: "Labels and guides",
    description: "Use readable tick values at a useful density.",
    required: true,
    status: "supported",
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
    description: "Use a linear numerical scale.",
    required: true,
    status: "supported",
  },
  {
    id: "scale:log",
    label: "Log scale",
    family: "Scales",
    description: "Use a logarithmic numerical scale.",
    required: true,
    status: "not-supported",
  },
  {
    id: "scale:time",
    label: "Time scale",
    family: "Scales",
    description: "Use UTC dates in Line Chart calendar summaries.",
    required: true,
    status: "supported",
  },
  {
    id: "scale:band",
    label: "Band scale",
    family: "Scales",
    description: "Position categories on a band scale.",
    required: true,
    status: "supported",
  },
  {
    id: "scale:symlog",
    label: "Symmetric log scale",
    family: "Scales",
    description: "Use a symmetric log scale for numerical values.",
    required: true,
    status: "supported",
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
    status: "supported",
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
    status: "supported",
  },
  {
    id: "interaction:saved-filter-state",
    label: "Saved filter state",
    family: "Interaction",
    description: "Open an example with a deliberate filter already active.",
    required: true,
    status: "supported",
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
    status: "supported",
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
    status: "supported",
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
    status: "supported",
  },
  {
    id: "state:invalid",
    label: "Invalid state",
    family: "States",
    description: "Explain invalid data or chart settings without data loss.",
    required: true,
    status: "supported",
  },
  {
    id: "accessibility:naming",
    label: "Accessibility naming",
    family: "Accessibility",
    description: "Give charts and controls useful accessible names.",
    required: true,
    status: "supported",
  },
  {
    id: "responsive:desktop-resize",
    label: "Desktop resize",
    family: "Responsive behavior",
    description: "Remain usable across supported desktop widths.",
    required: true,
    status: "supported",
  },
] as const satisfies readonly FeatureDefinition[];

export type CoverageFeature = (typeof coverageFeatures)[number] &
  Pick<FeatureDefinition, "gaps">;
export type CoverageFeatureId = CoverageFeature["id"];
const typedCoverageFeatures: readonly CoverageFeature[] = coverageFeatures;
export type DemonstrationStatus = Extract<
  ExampleUsageStatus,
  "shown" | "reviewed"
>;

export type ExampleReview = {
  date: string;
  report: string;
  evidence: Partial<Record<CoverageFeatureId, string>>;
};

export type ExampleCoverage = {
  exampleId: string;
  intent: string;
  features: Partial<Record<CoverageFeatureId, DemonstrationStatus>>;
  review?: ExampleReview;
};

export const exampleCoverage = [
  {
    exampleId: "distribution-discovery",
    intent:
      "Discover distributions and inspect exact category members behind Other.",
    features: {
      "chart:bar": "shown",
      "chart:boxplot": "shown",
      "chart:row": "shown",
      "chart:metric-card": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "region-map",
    intent:
      "Join geographic regions to records and inspect each metric and join.",
    features: {
      "chart:map": "shown",
      "chart:pivot": "shown",
      "chart:metric-card": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "point-map",
    intent:
      "Locate service sites, inspect their coordinates, and select exact source rows.",
    features: {
      "chart:map": "shown",
      "chart:bar": "shown",
      "chart:metric-card": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "scatter-density",
    intent:
      "Resolve overlap in 10,000 daily observations and reconcile each bin with its source rows.",
    features: {
      "mode:scatter-density": "shown",
      "chart:scatter": "shown",
      "chart:bar": "shown",
      "chart:metric-card": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "wine-chemistry",
    intent:
      "Read chemical relationships through density, counts, grouped and faceted fits, and summaries, then refit from a quality filter.",
    features: {
      "mode:scatter-contour": "shown",
      "mode:scatter-hexbin": "shown",
      "mode:scatter-regression": "shown",
      "chart:scatter": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "color:categorical": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "scatter-regression",
    intent:
      "Compare pooled and per-species relationships, then refit from another chart's filter.",
    features: {
      "mode:scatter-regression": "shown",
      "chart:scatter": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "color:categorical": "shown",
      "interaction:brushing": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "scatter-matrix",
    intent:
      "Compare every pair of measurements, species, and sex, then brush one cell to follow the same penguins everywhere.",
    features: {
      "chart:scatter-matrix": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "interaction:brushing": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "scatter-surfaces",
    intent:
      "Compare hexagonal counts with a smoothed density estimate and refit as another filters.",
    features: {
      "mode:scatter-hexbin": "shown",
      "mode:scatter-contour": "shown",
      "mode:scatter-regression": "shown",
      "chart:scatter": "shown",
      "chart:bar": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "bubble-scatter",
    intent:
      "Compare response time, conversion, and trial volume, with exact source rows and size tracing.",
    features: {
      "mode:bubble-scatter": "shown",
      "chart:scatter": "shown",
      "chart:metric-card": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "area-charts",
    intent:
      "Compare monthly revenue layers and inspect each period's stack bounds and source rows.",
    features: {
      "mode:area": "shown",
      "mode:calendar-series": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
      "chart:metric-card": "shown",
      "chart:calendar": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "stacked-bars",
    intent:
      "Compare regional totals and channel shares, with source records for each denominator.",
    features: {
      "mode:stacked-bars": "shown",
      "chart:bar": "shown",
      "chart:metric-card": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "grouped-bars",
    intent:
      "Compare regional revenue by channel and inspect an exact category–series pair.",
    features: {
      "mode:grouped-bars": "shown",
      "chart:bar": "shown",
      "chart:metric-card": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "calendar-series",
    intent:
      "Compare monthly channel revenue, select a period, and inspect its source rows.",
    features: {
      "mode:calendar-series": "shown",
      "scale:time": "shown",
      "chart:line": "shown",
      "chart:calendar": "shown",
      "chart:metric-card": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "january-flights",
    intent:
      "Read a complete delay analysis over four related tables, and follow any chart to its flights, aircraft, and weather hours.",
    features: {
      "chart:markdown": "shown",
      "chart:sankey": "shown",
      "chart:metric-card": "shown",
      "chart:bar": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "chart:scatter": "shown",
      "chart:ecdf": "shown",
      "chart:line": "shown",
      "chart:heatmap": "shown",
      "chart:parallel-coordinates": "shown",
      "mode:scatter-hexbin": "shown",
      "mode:scatter-regression": "shown",
      "mode:stacked-bars": "shown",
      "mode:calendar-series": "shown",
      "scale:symlog": "shown",
      "facet:wrap": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "beijing-air",
    intent:
      "Check measurement coverage before comparing stations, then follow daily pollution through seasons, densities, fits, and profiles.",
    features: {
      "chart:calendar": "shown",
      "chart:markdown": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
      "chart:boxplot": "shown",
      "chart:metric-card": "shown",
      "chart:data-table": "shown",
      "chart:heatmap": "shown",
      "chart:pivot": "shown",
      "chart:bar": "shown",
      "chart:scatter": "shown",
      "chart:ecdf": "shown",
      "chart:parallel-coordinates": "shown",
      "mode:scatter-contour": "shown",
      "mode:scatter-regression": "shown",
      "mode:calendar-series": "shown",
      "facet:wrap": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "world-development",
    intent:
      "Compare economies across five lookups on one country-year key, keeping matched cohorts and weighting explicit.",
    features: {
      "chart:scatter": "shown",
      "chart:markdown": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "chart:ecdf": "shown",
      "chart:line": "shown",
      "chart:heatmap": "shown",
      "chart:map": "shown",
      "chart:bar": "shown",
      "chart:boxplot": "shown",
      "mode:bubble-scatter": "shown",
      "mode:scatter-regression": "shown",
      "mode:calendar-series": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "earthquakes-2023",
    intent:
      "Treat a thresholded catalogue as a defined population: where, when, magnitude against depth, and which fields each record carries.",
    features: {
      "chart:map": "shown",
      "chart:markdown": "shown",
      "chart:bar": "shown",
      "chart:row": "shown",
      "chart:metric-card": "shown",
      "chart:data-table": "shown",
      "chart:calendar": "shown",
      "chart:line": "shown",
      "chart:scatter": "shown",
      "chart:ecdf": "shown",
      "chart:boxplot": "shown",
      "mode:scatter-hexbin": "shown",
      "mode:area": "shown",
      "mode:stacked-bars": "shown",
      "mode:calendar-series": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "multi-source-shop",
    intent:
      "Chart related tables with an explicit row meaning, and follow each chart back to its query steps and source records.",
    features: {
      "chart:metric-card": "shown",
      "chart:bar": "shown",
      "chart:data-table": "shown",
    },
  },
  {
    exampleId: "shop-operations",
    intent:
      "Click one channel and watch every linked view and the orders table narrow.",
    features: {
      "chart:metric-card": "shown",
      "chart:scatter": "reviewed",
      "chart:row": "shown",
      "chart:bar": "shown",
      "chart:boxplot": "shown",
      "chart:data-table": "shown",
      "chart:sankey": "shown",
      "chart:heatmap": "shown",
      "chart:hierarchy": "shown",
      "labels:meaningful-title": "reviewed",
      "labels:axes": "reviewed",
      "guides:ticks": "reviewed",
      "scale:symlog": "reviewed",
      "color:categorical": "reviewed",
      "color:legend": "reviewed",
      "interaction:cross-filter": "reviewed",
      "layout:dashboard": "reviewed",
      "responsive:desktop-resize": "reviewed",
      "accessibility:naming": "reviewed",
    },
    review: {
      date: "2026-10-02",
      report: "docs/reviews/2026-10-02-example-coverage.md#shop-operations",
      evidence: {
        "chart:scatter":
          "Revenue and margin scatter responds to channel filtering.",
        "labels:meaningful-title":
          "Dashboard titles state the question each view answers.",
        "labels:axes": "Scatter axes name Revenue and Margin with units.",
        "guides:ticks":
          "Scatter ticks remain readable at the reviewed desktop width.",
        "scale:symlog": "Revenue and Margin axes use symmetric-log scales.",
        "color:categorical": "Channel categories use distinct, named colors.",
        "color:legend": "The channel legend identifies each plotted category.",
        "interaction:cross-filter":
          "Selecting Web narrows all linked views to 167 of 500 orders.",
        "layout:dashboard":
          "The order book and linked charts remain readable together.",
        "responsive:desktop-resize":
          "The dashboard fits at 1280 and 1024 pixels.",
        "accessibility:naming":
          "Chart names and filter controls are exposed to assistive technology.",
      },
    },
  },
  {
    exampleId: "palmer-penguins",
    intent:
      "Separate three penguin species with one shared color key across linked views.",
    features: {
      "chart:scatter": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
      "chart:boxplot": "shown",
      "chart:data-table": "shown",
      "chart:parallel-coordinates": "shown",
      "color:categorical": "shown",
      "interaction:brushing": "shown",
      "interaction:cross-filter": "shown",
      "layout:dashboard": "shown",
    },
  },
  {
    exampleId: "nba-stats",
    intent:
      "Summarize a real season, compare positions in a pivot, and rank players in a sorted table.",
    features: {
      "chart:summary": "reviewed",
      "chart:scatter": "shown",
      "chart:color-legend": "shown",
      "chart:pivot": "reviewed",
      "chart:data-table": "reviewed",
      "labels:meaningful-title": "shown",
      "labels:axes": "shown",
      "guides:ticks": "shown",
      "color:categorical": "reviewed",
      "color:legend": "reviewed",
      "table:sorting": "reviewed",
      "table:formatting": "reviewed",
      "table:virtualization": "shown",
      "accessibility:naming": "reviewed",
    },
    review: {
      date: "2026-10-02",
      report: "docs/reviews/2026-10-02-example-coverage.md#nba-stats",
      evidence: {
        "chart:summary":
          "Summary table shows season field counts and distributions.",
        "chart:pivot": "Pivot compares player positions and season statistics.",
        "chart:data-table": "Data table lists player rows and selected fields.",
        "color:categorical": "Position groups use distinct colors.",
        "color:legend":
          "Legend names the position groups used by the scatter plot.",
        "table:sorting":
          "Scoring table sorts players from highest to lowest points.",
        "table:formatting": "Point totals use grouped thousands separators.",
        "accessibility:naming":
          "Summary, pivot, scatter, and table regions have useful names.",
      },
    },
  },
  {
    exampleId: "categorical-charts",
    intent:
      "Break down a categorical catalog with counts, a pivot, a facet grid, and a table search.",
    features: {
      "chart:row": "shown",
      "chart:pivot": "shown",
      "chart:hierarchy": "shown",
      "chart:data-table": "shown",
      "labels:meaningful-title": "shown",
      "labels:axes": "shown",
      "guides:ticks": "shown",
      "scale:band": "reviewed",
      "color:categorical": "shown",
      "facet:grid": "reviewed",
      "interaction:active-filter": "reviewed",
      "table:filtering": "reviewed",
      "state:empty": "reviewed",
      "table:sorting": "shown",
      "accessibility:naming": "reviewed",
    },
    review: {
      date: "2026-10-02",
      report: "docs/reviews/2026-10-02-example-coverage.md#categorical-charts",
      evidence: {
        "scale:band":
          "Product categories occupy discrete bands in the row chart.",
        "facet:grid":
          "The material-by-size grid repeats the same measure across categories.",
        "interaction:active-filter":
          "The table displays a removable Sports filter chip.",
        "table:filtering": "Text search narrows matching product rows.",
        "state:empty":
          "An unmatched search shows a no-rows message; clearing it restores rows.",
        "accessibility:naming":
          "Chart and search controls expose useful accessible names.",
      },
    },
  },
  {
    exampleId: "box-plot",
    intent:
      "Carry a numeric color scale across a scatter, a legend, and violin box plots.",
    features: {
      "chart:summary": "shown",
      "chart:scatter": "shown",
      "chart:color-legend": "shown",
      "chart:boxplot": "shown",
      "chart:bar": "shown",
      "color:numerical": "shown",
      "color:legend": "shown",
      "interaction:brushing": "shown",
    },
  },
  {
    exampleId: "message-log",
    intent:
      "Repeat a strip of monthly squares per correspondent, beside linked views of the same messages.",
    features: {
      "chart:composition": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "driving-shifts",
    intent:
      "Rebuild a connected scatterplot: a path through the years at numeric x and y, with callouts anchored to chosen years.",
    features: {
      "chart:composition": "shown",
      "chart:scatter": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "tech-sparklines",
    intent:
      "Order company rows by a first-to-last change calculation and mark each sparkline's low, high, and latest price.",
    features: {
      "chart:composition": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "forecast-fan",
    intent:
      "Layer supplied percentile bands around a central path with a shaded projection and a horizontal reference guide.",
    features: {
      "chart:composition": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "time-use",
    intent:
      "Summarize two cohorts' quartiles inside each activity panel and color the change in median.",
    features: {
      "chart:composition": "shown",
      "chart:boxplot": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "media-deaths",
    intent:
      "Stack causes as shares of each source's total with every denominator open to inspection.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "measles",
    intent:
      "Draw 51 state strips in the publisher's order with a placed multistop ramp and explicit missing cells.",
    features: {
      "chart:composition": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "causes-by-age",
    intent:
      "Spread one stack across age as areas of each cause's share, labeled where each band is thickest.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "budget-bridge",
    intent:
      "Bridge a lab's planned net position to its actual one line item at a time, with group subtotals, quarter filters, and the rows behind each step.",
    features: {
      "chart:waterfall": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "battery-day",
    intent:
      "Run a battery's state of charge through a day, adding each hour's signed energy flows to a start value, with a subtotal per part of the day.",
    features: {
      "chart:waterfall": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "channel-share",
    intent:
      "Show revenue's share by channel beside 100% bars of the same mix by region, in shared colors, and pool smaller products into Other.",
    features: {
      "chart:donut": "shown",
      "chart:bar": "shown",
      "mode:stacked-bars": "shown",
      "chart:data-table": "shown",
      "interaction:cross-filter": "shown",
    },
  },
  {
    exampleId: "consumer-confidence",
    intent:
      "Draw every country in every panel and light up its own, with the latest point per series on a date scale.",
    features: {
      "chart:composition": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "pew-meaning",
    intent:
      "Draw each topic as a dumbbell row with colored party dots, a connector, a legend, and the signed gap.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "income-life",
    intent:
      "Place economies on a log income scale, sized by population and colored by region, with a legend and labels on chosen countries.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "covid-tiles",
    intent:
      "Place each state's weekly case-rate path at its cell on a tile grid, on one shared scale.",
    features: {
      "chart:composition": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "covid-compare",
    intent:
      "Show each state's recent window beside the nation in the main frame and the full history in an inset.",
    features: {
      "chart:composition": "shown",
      "chart:line": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "elections",
    intent:
      "Place a strip of eleven elections at each state's tile on a US map, colored by a capped diverging margin ramp.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "lincoln-ridgeline",
    intent:
      "Overlap a density of each month's daily temperatures down the page on one shared scale and height.",
    features: {
      "chart:composition": "shown",
      "chart:boxplot": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "banana-yields",
    intent:
      "Lay out a sparkline table: ordered rows, a trend inset, decade heat cells with values written in, and an average column.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "yield-gap",
    intent:
      "Stack one square per country into a small waffle over each whole value along x, a unit histogram per crop colored by continent.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "middle-class-jobs",
    intent:
      "Color each slope-chart line by a numeric field through a diverging value scale across a grid of occupation groups.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "du-bois-income",
    intent:
      "Stack each income class's spending across a bar as shares, joined class to class at each share's edge, after Du Bois.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "climate-ridgeline",
    intent:
      "Overlap 84 yearly densities of daily temperatures, shaded along x through a diverging scale, with every fifth year named.",
    features: {
      "chart:composition": "shown",
      "chart:scatter": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "tax-slope",
    intent:
      "Join each country's two readings with a line named at both ends, colored by whether the share rose or fell.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "titanic-waffle",
    intent:
      "Draw one cell per passenger in each class, grouped by fate, so counts and survival compare at a glance.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "unemployment-stream",
    intent:
      "Stack each industry's unemployed across months on a wiggling baseline with smooth edges.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "population-pyramid",
    intent:
      "Mirror men and women about a baseline per age group, 1900 beside 2000, on one shared length axis.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "gdp-bump",
    intent:
      "Rank the largest economies at every year and join each one's ranks into a smooth path named at the end.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "scotus-timeline",
    intent:
      "Lay every justice's term in its seat's lane, colored by the appointing party, with sitting justices running to today.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "stocks-horizon",
    intent:
      "Fold each stock's growth since 2000 into stacked bands per row, losses mirrored upward in red.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "co2-swarm",
    intent:
      "Swarm every economy along a log scale of emissions per person within its region, sized by population.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
      "chart:bar": "shown",
    },
  },
  {
    exampleId: "titanic-mosaic",
    intent:
      "Size each class's column by its share of passengers and stack the shares who survived and died, so area is people.",
    features: {
      "chart:composition": "shown",
      "chart:row": "shown",
    },
  },
  {
    exampleId: "product-activity",
    intent:
      "Explore linked product traffic, conversion, and response-time views.",
    features: {
      "chart:ecdf": "shown",
      "chart:line": "reviewed",
      "chart:row": "shown",
      "chart:scatter": "shown",
      "chart:bar": "shown",
      "chart:boxplot": "shown",
      "chart:data-table": "shown",
      "labels:meaningful-title": "shown",
      "labels:axes": "shown",
      "guides:ticks": "shown",
      "scale:linear": "reviewed",
      "color:legend": "shown",
      "accessibility:naming": "shown",
    },
    review: {
      date: "2026-10-02",
      report: "docs/reviews/2026-10-02-example-coverage.md#product-activity",
      evidence: {
        "chart:line":
          "Visitors per day is drawn across the ordered 0–90 study-day field.",
        "scale:linear":
          "Study day and visitor values use numeric linear scales.",
      },
    },
  },
  {
    exampleId: "scatter-trace",
    intent:
      "Trace one scatter point from source values through calculations, filters, scales, and color.",
    features: {
      "chart:scatter": "shown",
      "chart:row": "shown",
      "chart:data-table": "shown",
      "chart:markdown": "shown",
      "guides:grids": "shown",
      "color:categorical": "shown",
      "color:legend": "shown",
      "interaction:brushing": "shown",
      "interaction:cross-filter": "shown",
      "layout:dashboard": "shown",
    },
  },
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
      "state:invalid": "reviewed",
    },
    review: {
      date: "2026-10-02",
      report: "docs/reviews/2026-10-02-example-coverage.md#calculated-orders",
      evidence: {
        "state:invalid":
          "Invalid formula shows a parse error and disabled save; discarding preserves saved rows.",
      },
    },
  },
  {
    exampleId: "shop-10000",
    intent:
      "Explore 10,000 orders through 16 linked views, a daily revenue calendar, and comparable regional facets.",
    features: {
      "chart:row": "shown",
      "chart:bar": "shown",
      "chart:scatter": "shown",
      "chart:boxplot": "shown",
      "chart:data-table": "shown",
      "chart:line": "shown",
      "labels:meaningful-title": "shown",
      "labels:axes": "shown",
      "guides:ticks": "shown",
      "scale:symlog": "shown",
      "chart:calendar": "shown",
      "facet:wrap": "shown",
      "facet:shared-scales": "reviewed",
      "table:virtualization": "shown",
      "layout:dashboard": "shown",
      "accessibility:naming": "shown",
    },
    review: {
      date: "2026-10-02",
      report: "docs/reviews/2026-10-02-example-coverage.md#shop-10000",
      evidence: {
        "facet:shared-scales":
          "North and South facets use matching order and revenue ticks.",
      },
    },
  },
  {
    exampleId: "lorenz-3d",
    intent: "Show coordinated brushing across 2D and 3D views.",
    features: {
      "chart:scatter": "reviewed",
      "chart:3d-scatter": "reviewed",
      "chart:markdown": "shown",
      "labels:meaningful-title": "shown",
      "labels:axes": "shown",
      "guides:ticks": "shown",
      "scale:linear": "shown",
      "color:numerical": "reviewed",
      "facet:wrap": "reviewed",
      "interaction:brushing": "reviewed",
      "interaction:cross-filter": "reviewed",
      "interaction:saved-filter-state": "reviewed",
      "layout:dashboard": "shown",
      "accessibility:naming": "reviewed",
    },
    review: {
      date: "2026-10-02",
      report: "docs/reviews/2026-10-02-example-coverage.md#lorenz-3d",
      evidence: {
        "chart:scatter":
          "2D scatter shows the selected Lorenz runs and filters.",
        "chart:3d-scatter": "3D scatter shows the same runs on the Z axis.",
        "color:numerical":
          "Numerical Run ID uses a visible Cool palette on the 3D view.",
        "facet:wrap": "Run facets preserve shared scales across panels.",
        "interaction:brushing": "A time-range brush changes the selected data.",
        "interaction:cross-filter": "The range filters linked 2D and 3D views.",
        "interaction:saved-filter-state":
          "The example opens with Time and Z filters active.",
        "accessibility:naming":
          "Dashboard regions and filtering controls have accessible names.",
      },
    },
  },
] as const satisfies readonly ExampleCoverage[];

export const coverageFamilies = [
  ...new Set(coverageFeatures.map(({ family }) => family)),
] as [CoverageFeature["family"], ...CoverageFeature["family"][]];

const featureById = new Map(
  typedCoverageFeatures.map((feature) => [feature.id, feature] as const)
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
  return feature?.gaps?.length ?? 0;
}

export function getOpenGapCount(): number {
  return typedCoverageFeatures.reduce(
    (total, feature) => total + (feature.gaps?.length ?? 0),
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

    const reviewed = Object.entries(entry.features)
      .filter(([, status]) => status === "reviewed")
      .map(([id]) => id);
    if (reviewed.length > 0) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.review?.date ?? "")) {
        errors.push(`Missing review date: ${entry.exampleId}`);
      }
      if (!entry.review?.report?.startsWith("docs/reviews/")) {
        errors.push(`Missing review report: ${entry.exampleId}`);
      }
    }
    for (const id of reviewed) {
      if (!entry.review?.evidence[id as CoverageFeatureId]?.trim()) {
        errors.push(`Missing review evidence: ${entry.exampleId}/${id}`);
      }
    }
    for (const id of Object.keys(entry.review?.evidence ?? {})) {
      if (!reviewed.includes(id)) {
        errors.push(
          `Review evidence without reviewed assignment: ${entry.exampleId}/${id}`
        );
      }
    }
  }

  for (const feature of typedCoverageFeatures) {
    if (
      feature.required &&
      getImplementationStatus(feature.id) !== "not-supported" &&
      !feature.gaps?.length &&
      !declaredFeatures.has(feature.id)
    ) {
      errors.push(`Required feature has no example: ${feature.id}`);
    }
  }

  return errors;
}
