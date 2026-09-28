import {
  penguinDashboard,
  shopDashboard,
  largeShopDashboard,
  calculationDashboard,
  scatterTraceDashboard,
  activityDashboard,
} from "./dashboardSettings";
import { demoSettings } from "@/demos/lorenz";
import { SavedDataStructure } from "exploreda";
import {
  Bird,
  Calculator,
  LineChart,
  LucideIcon,
  Orbit,
  ScatterChart,
  ShoppingCart,
  Tags,
  ThermometerSun,
  Trophy,
} from "lucide-react";
import { boxPlotSettings } from "./boxPlotSettings";
import { categoricalChartSettings } from "./categoricalChartSettings";
import { nbaStatsSettings } from "./nbaStatsSettings";

export interface ExampleDataset {
  /** Row count with its unit, such as "344 penguins". */
  rows: string;
  fields: number;
  source: "Real" | "Synthetic";
}

export interface ExampleData {
  id: string;
  title: string;
  /** What the data is and why these views answer its question. */
  description: string;
  dataset: ExampleDataset;
  /** Workspace capabilities this example is built to show. */
  shows: string[];
  /** One tested first action, shown above the workspace. */
  guide?: string;
  icon: LucideIcon;
  data: string; // path to the data file
  savedData?: SavedDataStructure;
}

const viewNames: Record<string, string> = {
  "3d-scatter": "3D scatter",
  bar: "histogram",
  boxplot: "box plot",
  "color-legend": "legend",
  "data-table": "table",
  line: "line",
  markdown: "notes",
  pivot: "pivot",
  row: "row",
  scatter: "scatter",
  summary: "summary",
};

/** Counts saved views and names each chart type once, in layout order. */
export function describeViews(example: ExampleData) {
  const charts = example.savedData?.charts ?? [];
  const types = [...new Set(charts.map(({ type }) => viewNames[type] ?? type))];
  return { count: charts.length, types };
}

export const FEATURED_EXAMPLE_ID = "shop-operations";

/** Every example, in the order the landing page lists them. */
export const examples: ExampleData[] = [
  {
    id: "shop-operations",
    title: "Inside the order book",
    description:
      "Follow orders from revenue and margin to delivery, channels, and individual records. Click any bar and every other view narrows to match.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Click to filter", "Filter chips", "Log scales"],
    guide:
      "Try this: click Web in Sales channels. The other charts and the orders table narrow to web orders. Click Web again, or use Reset workspace, to start over.",
    icon: ShoppingCart,
    data: "/datasets/shop-operations.csv",
    savedData: shopDashboard,
  },
  {
    id: "palmer-penguins",
    title: "Penguin field notes",
    description:
      "Three species measured on three Antarctic islands. Body size overlaps, but bill shape pulls the species apart, and one color key follows them through every view.",
    dataset: { rows: "344 penguins", fields: 8, source: "Real" },
    shows: ["Shared color key", "Scatter brushing", "Grouped box plots"],
    icon: Bird,
    data: "/datasets/palmer-penguins.csv",
    savedData: penguinDashboard,
  },
  {
    id: "nba-stats",
    title: "Who scores, and who passes?",
    description:
      "Season totals for every NBA player in 2023–24. Color by position separates scorers from playmakers, the pivot gives each position's medians, and the table ranks the leaders.",
    dataset: { rows: "735 player seasons", fields: 33, source: "Real" },
    shows: ["Summary table", "Pivot table", "Sortable table"],
    icon: Trophy,
    data: "/nba_stats.csv",
    savedData: nbaStatsSettings,
  },
  {
    id: "categorical-charts",
    title: "How does a product catalog break down?",
    description:
      "A catalog with no numbers worth plotting. Count categories, cross them in a pivot, and split material by stock and size in a facet grid, while the table searches for Sports.",
    dataset: { rows: "10,000 products", fields: 12, source: "Synthetic" },
    shows: ["Grid facets", "Pivot table", "Table search"],
    icon: Tags,
    data: "/categorical_medium.csv",
    savedData: categoricalChartSettings,
  },
  {
    id: "box-plot",
    title: "Does hot weather lift the mood?",
    description:
      "Temperature drives sales, visitors, and mood in these daily readings. A numeric color scale carries Mood Index across the scatter and the violin box plots.",
    dataset: { rows: "10,000 days", fields: 12, source: "Synthetic" },
    shows: ["Numeric color scale", "Violin overlay", "Histogram brushing"],
    icon: ThermometerSun,
    data: "/correlated_medium.csv",
    savedData: boxPlotSettings,
  },
  {
    id: "product-activity",
    title: "90 days of product activity",
    description:
      "Daily traffic, conversion, and response time before and after a release. Lines show the trend, and color by release phase shows what changed.",
    dataset: { rows: "90 days", fields: 7, source: "Synthetic" },
    shows: ["Time series", "Color by phase", "Grouped box plots"],
    icon: LineChart,
    data: "/datasets/product-activity.csv",
    savedData: activityDashboard,
  },
  {
    id: "scatter-trace",
    title: "Trace a scatter point",
    description:
      "Follow a point from raw order values through calculations, filters, scales, and color to its final position on the chart.",
    dataset: { rows: "18 orders", fields: 6, source: "Synthetic" },
    shows: ["Click to trace", "Calculated fields", "Linked table"],
    icon: ScatterChart,
    data: "/datasets/scatter-trace.csv",
    savedData: scatterTraceDashboard,
  },
  {
    id: "calculated-orders",
    title: "From orders to contribution",
    description:
      "14 calculated fields turn raw orders into contribution, dates, and service rules. Inspect the chains, preview a rule change, and apply it across linked views.",
    dataset: { rows: "10,000 orders", fields: 16, source: "Synthetic" },
    shows: ["Calculated fields", "Formula preview", "Wrap facets"],
    icon: Calculator,
    data: "/datasets/shop-10000.csv",
    savedData: calculationDashboard,
  },
  {
    id: "shop-10000",
    title: "10,000 orders · 15 linked views",
    description:
      "The order book at full size. Every chart, table, and regional facet stays linked, so a filter anywhere updates all 15 views.",
    dataset: { rows: "10,000 orders", fields: 16, source: "Synthetic" },
    shows: ["15 linked views", "Shared facet scales", "Large table"],
    icon: ShoppingCart,
    data: "/datasets/shop-10000.csv",
    savedData: largeShopDashboard,
  },
  {
    id: "lorenz-3d",
    title: "How quickly do nearby Lorenz runs diverge?",
    description:
      "Five simulated runs start almost together. A saved time brush on the 2D view shows where they part in the coordinated 3D views.",
    dataset: { rows: "1,000 points", fields: 5, source: "Synthetic" },
    shows: ["3D scatter", "Saved brush", "Faceted 3D"],
    icon: Orbit,
    data: "/lorenz_3d_small.csv",
    savedData: demoSettings,
  },
];
