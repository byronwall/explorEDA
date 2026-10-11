import {
  BarChart3,
  CalendarDays,
  ChartBar,
  ChartCandlestick,
  ChartLine,
  ChartNetwork,
  Gauge,
  Grid3x3,
  LayoutGrid,
  Map as MapIcon,
  NotebookText,
  Orbit,
  Palette,
  ScatterChart,
  Settings2,
  Shapes,
  Sigma,
  Spline,
  Table,
  Table2,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { MDXContent } from "mdx/types";
import type { DocsTarget } from "./targets";

export type DocsGroup =
  | "plots"
  | "tables"
  | "supporting"
  | "surfaces"
  | "guides";

export const GROUP_LABELS: Record<DocsGroup, string> = {
  plots: "Plots",
  tables: "Tables",
  supporting: "Supporting views",
  surfaces: "Workspace",
  guides: "Shared guides",
};

export type DocsPage = {
  topic: string;
  title: string;
  group: DocsGroup;
  icon: LucideIcon;
  /** The page's eyebrow above its title. */
  eyebrow: string;
  /** One sentence under the title. */
  lede: string;
  /** One sentence on the index card. */
  summary: string;
  /** Short labels on the index card. */
  highlights: readonly string[];
  /** The live example whose screenshot illustrates the index card. */
  thumbnail?: string;
  /** The coverage targets this page documents. */
  covers: readonly DocsTarget[];
  /** The chart type the page is about, which each example must show. */
  chartType?: string;
  /** Ids from `demos/examples.ts`; each card's text comes from there. */
  examples: readonly string[];
  related: readonly string[];
};

export const catalogue: readonly DocsPage[] = [
  {
    topic: "scatter",
    thumbnail: "scatter",
    title: "Scatter plot",
    group: "plots",
    icon: ScatterChart,
    eyebrow: "Chart guide",
    lede: "Compare two fields across rows. Use the pattern to spot relationships, clusters, and unusual records.",
    summary:
      "Compare two fields row by row, brush a range, and trace a point back to its source values.",
    highlights: ["Brushing", "Point trace", "Calculated axes"],
    covers: ["chart:scatter", "interaction:brushing"],
    chartType: "scatter",
    examples: ["scatter-trace"],
    related: ["bar", "rendering"],
  },
  {
    topic: "bar",
    thumbnail: "bar-histogram",
    title: "Bar chart",
    group: "plots",
    icon: BarChart3,
    eyebrow: "Chart guide",
    lede: "Compare categories or group a numeric measure. The selected operation determines what each bar means.",
    summary:
      "Compare category counts, numeric bins, or a grouped measure, and filter by clicking or dragging.",
    highlights: ["Category counts", "Numeric bins", "Grouped summaries"],
    covers: ["chart:bar", "interaction:cross-filter"],
    chartType: "bar",
    examples: ["shop-operations"],
    related: ["scatter", "rendering"],
  },
  {
    topic: "row",
    thumbnail: "row",
    title: "Row chart",
    group: "plots",
    icon: ChartBar,
    eyebrow: "Chart guide",
    lede: "Compare counts across many categories, with labels that stay readable however long they are.",
    summary:
      "Count rows per category in horizontal bars, and click a bar to filter.",
    highlights: ["Category counts", "Click to filter"],
    covers: ["chart:row"],
    chartType: "row",
    examples: ["shop-operations"],
    related: ["bar", "heatmap"],
  },
  {
    topic: "line",
    thumbnail: "line",
    title: "Line chart",
    group: "plots",
    icon: ChartLine,
    eyebrow: "Chart guide",
    lede: "Follow a measure over time or along a numeric field, one line per series.",
    summary:
      "Draw series over dates or numbers, summarize by period, and fill areas.",
    highlights: ["Time intervals", "Series", "Areas"],
    covers: ["chart:line"],
    chartType: "line",
    examples: ["calendar-series"],
    related: ["calendar", "ecdf"],
  },
  {
    topic: "boxplot",
    thumbnail: "boxplot",
    title: "Box plot",
    group: "plots",
    icon: ChartCandlestick,
    eyebrow: "Chart guide",
    lede: "Compare the spread of a numeric field across groups: middle half, whiskers, and outliers.",
    summary:
      "Summarize a numeric field per group as boxes, violins, and points.",
    highlights: ["Quartiles", "Violins", "Outliers"],
    covers: ["chart:boxplot"],
    chartType: "boxplot",
    examples: ["shop-operations"],
    related: ["ecdf", "bar"],
  },
  {
    topic: "ecdf",
    thumbnail: "ecdf",
    title: "ECDF",
    group: "plots",
    icon: Spline,
    eyebrow: "Chart guide",
    lede: "Read what share of rows fall at or below any value, and compare groups fairly.",
    summary:
      "Plot cumulative shares, read quantiles, and compare groups of any size.",
    highlights: ["Cumulative share", "Quantiles"],
    covers: ["chart:ecdf"],
    chartType: "ecdf",
    examples: ["product-activity"],
    related: ["boxplot", "line"],
  },
  {
    topic: "heatmap",
    thumbnail: "heatmap",
    title: "Heatmap",
    group: "plots",
    icon: Grid3x3,
    eyebrow: "Chart guide",
    lede: "Compare a count or measure across two categories at once.",
    summary:
      "Shade each pair of categories by a count or a summary of a measure.",
    highlights: ["Two categories", "Cell values"],
    covers: ["chart:heatmap"],
    chartType: "heatmap",
    examples: ["shop-operations"],
    related: ["row", "pivot"],
  },
  {
    topic: "calendar",
    thumbnail: "calendar",
    title: "Calendar heatmap",
    group: "plots",
    icon: CalendarDays,
    eyebrow: "Chart guide",
    lede: "See a daily measure laid out as a year of weeks.",
    summary: "Shade each day by a count or measure, a year at a time.",
    highlights: ["Daily cells", "Week start"],
    covers: ["chart:calendar"],
    chartType: "calendar",
    examples: ["calendar-series"],
    related: ["line", "heatmap"],
  },
  {
    topic: "sankey",
    thumbnail: "sankey",
    title: "Sankey chart",
    group: "plots",
    icon: Workflow,
    eyebrow: "Chart guide",
    lede: "Follow rows as they flow through a sequence of categories.",
    summary:
      "Trace each row’s path through ordered categories as weighted flows.",
    highlights: ["Stages", "Flow width", "Other node"],
    covers: ["chart:sankey"],
    chartType: "sankey",
    examples: ["shop-operations"],
    related: ["heatmap", "row"],
  },
  {
    topic: "parallel-coordinates",
    thumbnail: "parallel-coordinates",
    title: "Parallel coordinates",
    group: "plots",
    icon: ChartNetwork,
    eyebrow: "Chart guide",
    lede: "Compare many numeric fields at once, with each row drawn as one line across them.",
    summary: "Draw each row as a line across several axes to compare profiles.",
    highlights: ["Many fields", "Line per row"],
    covers: ["chart:parallel-coordinates"],
    chartType: "parallel-coordinates",
    examples: ["palmer-penguins"],
    related: ["scatter-matrix", "scatter"],
  },
  {
    topic: "scatter-matrix",
    thumbnail: "scatter-matrix",
    title: "Scatter matrix",
    group: "plots",
    icon: LayoutGrid,
    eyebrow: "Chart guide",
    lede: "See every pairing of a set of fields in one grid.",
    summary:
      "Compare each pair of fields at once, with distributions on the diagonal.",
    highlights: ["Field pairs", "Correlation", "Mixed types"],
    covers: ["chart:scatter-matrix"],
    chartType: "scatter-matrix",
    examples: ["scatter-matrix"],
    related: ["scatter", "parallel-coordinates"],
  },
  {
    topic: "3d-scatter",
    thumbnail: "3d-scatter",
    title: "3D scatter plot",
    group: "plots",
    icon: Orbit,
    eyebrow: "Chart guide",
    lede: "Place rows by three numeric fields and turn the scene to read their shape.",
    summary: "Plot three fields in a scene you can orbit, with color and size.",
    highlights: ["Three axes", "Orbit"],
    covers: ["chart:3d-scatter"],
    chartType: "3d-scatter",
    examples: ["lorenz-3d"],
    related: ["scatter"],
  },
  {
    topic: "map",
    thumbnail: "map",
    title: "Map",
    group: "plots",
    icon: MapIcon,
    eyebrow: "Chart guide",
    lede: "Place rows on a map by their coordinates, or shade regions by a measure.",
    summary: "Plot points by latitude and longitude, or join rows to regions.",
    highlights: ["Points", "Regions", "Projection"],
    covers: ["chart:map"],
    chartType: "map",
    examples: ["point-map"],
    related: ["scatter"],
  },
  {
    topic: "composition",
    thumbnail: "composition",
    title: "Composition",
    group: "plots",
    icon: Shapes,
    eyebrow: "Chart guide",
    lede: "Build a custom graphic on an artboard from text, guides, and repeating chart units.",
    summary: "Arrange text, guides, and data-bound chart units on an artboard.",
    highlights: ["Artboard", "Repeats", "Computed text"],
    covers: ["chart:composition"],
    chartType: "composition",
    examples: ["message-log"],
    related: ["markdown"],
  },
  {
    topic: "data-table",
    thumbnail: "data-table",
    title: "Data table",
    group: "tables",
    icon: Table,
    eyebrow: "Chart guide",
    lede: "Read the rows themselves, sorted and searched, with each column’s distribution in its header.",
    summary:
      "Show rows with sorting, search, and a distribution under each column name.",
    highlights: ["Rows", "Header distributions"],
    covers: ["chart:data-table"],
    chartType: "data-table",
    examples: ["shop-operations"],
    related: ["summary", "pivot"],
  },
  {
    topic: "pivot",
    thumbnail: "pivot",
    title: "Pivot table",
    group: "tables",
    icon: Table2,
    eyebrow: "Chart guide",
    lede: "Group rows by fields and summarize measures in a grid, with totals.",
    summary: "Group rows and summarize measures, with totals and shaded cells.",
    highlights: ["Grouped measures", "Totals"],
    covers: ["chart:pivot"],
    chartType: "pivot",
    examples: ["categorical-charts"],
    related: ["data-table", "heatmap"],
  },
  {
    topic: "summary",
    thumbnail: "summary",
    title: "Summary table",
    group: "tables",
    icon: Sigma,
    eyebrow: "Chart guide",
    lede: "Profile every field at once: its type, its spread, and its distribution.",
    summary: "List each field with its statistics and distribution.",
    highlights: ["Field profiles"],
    covers: ["chart:summary"],
    chartType: "summary",
    examples: ["box-plot"],
    related: ["data-table"],
  },
  {
    topic: "metric-card",
    thumbnail: "metric-card",
    title: "Metric card",
    group: "supporting",
    icon: Gauge,
    eyebrow: "Chart guide",
    lede: "Show one number, a count or a summary of a measure, for the rows that pass every filter.",
    summary: "Show one count, sum, or average for the filtered rows.",
    highlights: ["One number", "Once per"],
    covers: ["chart:metric-card"],
    chartType: "metric-card",
    examples: ["shop-operations"],
    related: ["pivot"],
  },
  {
    topic: "color-legend",
    thumbnail: "color-legend",
    title: "Color legend",
    group: "supporting",
    icon: Palette,
    eyebrow: "Chart guide",
    lede: "Show the color scales that charts share, in one place.",
    summary: "Show what each shared color means, for one or more fields.",
    highlights: ["Shared colors"],
    covers: ["chart:color-legend"],
    chartType: "color-legend",
    examples: ["box-plot"],
    related: ["boxplot"],
  },
  {
    topic: "markdown",
    thumbnail: "markdown",
    title: "Notes",
    group: "supporting",
    icon: NotebookText,
    eyebrow: "Chart guide",
    lede: "Explain a dashboard in formatted text beside its charts.",
    summary: "Write formatted notes that sit in the dashboard grid.",
    highlights: ["Markdown"],
    covers: ["chart:markdown"],
    chartType: "markdown",
    examples: ["scatter-trace"],
    related: ["composition"],
  },
  {
    topic: "chart-settings",
    thumbnail: "settings-bar",
    title: "Chart settings",
    group: "surfaces",
    icon: Settings2,
    eyebrow: "Workspace",
    lede: "Change what a chart shows, how it is scaled, and how it reads, with the chart still in view.",
    summary:
      "Open a chart's settings, find the right tab, and undo a session of edits at once.",
    highlights: ["Tabs", "Live edits", "Reset"],
    covers: ["surface:settings-popover"],
    examples: ["shop-operations"],
    related: ["bar"],
  },
  {
    topic: "rendering",
    title: "How rendering works",
    group: "guides",
    icon: Workflow,
    eyebrow: "Shared guide",
    lede: "Follow one order through the host app, data layer, chart definitions, and saved settings.",
    summary:
      "Follow one order from its raw row through calculations, filters, chart plans, drawing, and saved settings.",
    highlights: [],
    covers: [],
    examples: ["scatter-trace"],
    related: ["scatter", "bar"],
  },
];

/** Each page's MDX, loaded when the page opens. */
export const pageModules = import.meta.glob<{ default: MDXContent }>(
  "./pages/*.mdx"
);

export function pageModulePath(topic: string) {
  return `./pages/${topic}.mdx`;
}

export function findPage(topic: string) {
  return catalogue.find((page) => page.topic === topic);
}
