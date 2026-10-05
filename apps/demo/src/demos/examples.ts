import {
  penguinDashboard,
  shopDashboard,
  largeShopDashboard,
  calculationDashboard,
  scatterTraceDashboard,
  activityDashboard,
  timeSeriesDashboard,
  groupedBarsDashboard,
  stackedBarsDashboard,
  areaDashboard,
  bubbleDashboard,
  densityDashboard,
  scatterRegressionDashboard,
  scatterSurfaceDashboard,
  pointMapDashboard,
  regionMapDashboard,
  distributionDashboard,
} from "./dashboardSettings";
import { demoSettings } from "@/demos/lorenz";
import { SavedDataStructure } from "exploreda";
import {
  MapPin,
  Bird,
  BarChart3,
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
  calendar: "calendar",
  boxplot: "box plot",
  "color-legend": "legend",
  "data-table": "table",
  heatmap: "heatmap",
  ecdf: "ECDF",
  line: "line",
  markdown: "notes",
  "metric-card": "metric card",
  map: "map",
  "parallel-coordinates": "parallel coordinates",
  pivot: "pivot",
  row: "row",
  sankey: "sankey",
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
    id: "distribution-discovery",
    title: "Delivery times and smaller routes",
    description: "Compare 78 synthetic shipments with a histogram and distributions. Inspect smaller routes together, then select their exact categories.",
    dataset: { rows: "78 shipments", fields: 3, source: "Synthetic" },
    shows: ["Histogram", "Distribution", "Other categories", "Source tracing"],
    guide: "Try this: Alt-click Other categories and select a route. Open Distribution settings to compare Box, Violin, and Observations. Add chart lists Histogram and Distribution by name.",
    icon: BarChart3,
    data: "/delivery-times.csv",
    savedData: distributionDashboard,
  },
  {
    id: "region-map",
    title: "Requests across service districts",
    description: "Join 15 synthetic records to six service districts. Compare totals, inspect the joined records, and see zero values, missing measures, and regions with no rows.",
    dataset: {rows:"15 records",fields:3,source:"Synthetic"},
    shows:["Region map","Typed region joins","Metric tracing"],
    guide:"Try this: select Central and compare its 500 requests with the pivot. Alt-click outside the regions to see unassigned rows. Alt-click East to see two features joined as one region.",
    icon:MapPin,
    data:"/region-requests.csv",
    savedData:regionMapDashboard,
  },
  {
    id: "point-map",
    title: "Where service requests originate",
    description: "Compare 30 synthetic service sites. Point area shows requests; color shows region. Inspect any site to follow its coordinates and size.",
    dataset: { rows: "30 sites", fields: 5, source: "Synthetic" },
    shows: ["Point map", "Geographic view", "Source tracing"],
    guide: "Try this: click a site to select its source row. Alt-click it to see its coordinates. Drag to pan, then choose Reset view. Omitted rows explains the unlocated site.",
    icon: MapPin,
    data: "/map-sites.csv",
    savedData: pointMapDashboard,
  },
  {
    id: "scatter-density",
    title: "Where daily observations cluster",
    description: "Count 10,000 daily observations in temperature and sales bins. Darker cells show where more days share similar values.",
    dataset: { rows: "10,000 days", fields: 12, source: "Synthetic" },
    shows: ["Density bins", "Exact bin selection", "Source tracing"],
    guide: "Try this: click a dark bin. The count and records show its days. Alt-click it to see exact boundaries. Change Display to Points to compare individual rows.",
    icon: ScatterChart,
    data: "/correlated_medium.csv",
    savedData: densityDashboard,
  },
  {
    id: "scatter-regression",
    title: "Bill shape within each species",
    description: "Pooled together, longer penguin bills look shallower. Fit each species on its own and the slope turns positive. Equations, slopes, and R² read on the chart; a filter from another view refits them.",
    dataset: { rows: "344 penguins", fields: 8, source: "Real" },
    shows: ["Grouped regression", "Faceted fits", "Fit tracing"],
    guide: "Try this: click an island to refit every species. Drag across the points; the fits stay put. Alt-click a fit line to see its coefficients and rows.",
    icon: ScatterChart,
    data: "/datasets/palmer-penguins.csv",
    savedData: scatterRegressionDashboard,
  },
  {
    id: "scatter-surfaces",
    title: "Ten thousand days, two ways to see density",
    description: "Hexagons count the days in fixed cells; the smoothed density estimates rows per unit area and outlines where days concentrate. A linear fit and paired summary sit over the density.",
    dataset: { rows: "10,000 days", fields: 12, source: "Synthetic" },
    shows: ["Hexagonal bins", "Smoothed density", "Contour tracing"],
    guide: "Try this: click a dark hexagon to select its days. Alt-click a shaded region to see its threshold and the share of days inside. Drag across the humidity histogram to re-estimate the density.",
    icon: ScatterChart,
    data: "/correlated_medium.csv",
    savedData: scatterSurfaceDashboard,
  },
  {
    id: "bubble-scatter",
    title: "Trial volume, speed, and conversion",
    description: "Compare daily response time and conversion. Bubble area shows trial volume, and color marks each release phase.",
    dataset: { rows: "90 days", fields: 7, source: "Synthetic" },
    shows: ["Bubble area", "Row selection", "Size tracing"],
    guide: "Try this: click a bubble to select its day. Alt-click it to see its size calculation. Change Size by in settings to compare another measure.",
    icon: ScatterChart,
    data: "/datasets/product-activity.csv",
    savedData: bubbleDashboard,
  },
  {
    id: "shop-operations",
    title: "Inside the order book",
    description:
      "Follow orders from revenue and margin to delivery, channels, and individual records. Click any bar and every other view narrows to match, or follow orders from channel to category to returns in the flow at the bottom.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Metric cards", "Click to filter", "Sankey flow", "Filter chips", "Symmetric log scales"],
    guide:
      "Try this: click Web in Sales channels. The order count, revenue, and average-order cards update with the charts and table. Alt-click a card to see its inputs. Click Web again to clear the filter.",
    icon: ShoppingCart,
    data: "/datasets/shop-operations.csv",
    savedData: shopDashboard,
  },
  {
    id: "calendar-series",
    title: "Orders through the calendar",
    description: "Compare monthly revenue by channel, weekly order counts, and daily activity. Every period links to the orders behind it.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Calendar summaries", "Period selection", "Source tracing"],
    guide: "Try this: click a point in Monthly revenue by channel. Alt-click it to see how the value was calculated. Open its settings to change Day, Week, or Month.",
    icon: LineChart,
    data: "/datasets/shop-operations.csv",
    savedData: timeSeriesDashboard,
  },
  {
    id: "grouped-bars",
    title: "Sales by region and channel",
    description: "Compare revenue across regions, with one bar for each channel. Select a pair to inspect the matching orders.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Grouped bars", "Pair selection", "Source tracing"],
    guide: "Try this: select a region–channel bar. Alt-click it to see its source records. Open settings to compare counts, sums, or averages.",
    icon: BarChart3,
    data: "/datasets/shop-operations.csv",
    savedData: groupedBarsDashboard,
  },
  {
    id: "area-charts",
    title: "Revenue layers through the year",
    description: "Follow monthly revenue totals and the channels that contribute to them. Compare the stack with separate areas and inspect each period.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Area charts", "Stacked areas", "Period tracing"],
    guide: "Try this: inspect a point in Monthly revenue layers. The trace shows its band bounds and source records. Change Display to Area to compare each channel from zero.",
    icon: LineChart,
    data: "/datasets/shop-operations.csv",
    savedData: areaDashboard,
  },
  {
    id: "stacked-bars",
    title: "Regional totals and channel shares",
    description: "Compare each region's revenue and channel mix with stacked totals and percentage bars.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Stacked bars", "100% bars", "Denominator tracing"],
    guide: "Try this: inspect a revenue segment, then choose 100% in Display. The trace shows its share and category denominator.",
    icon: BarChart3,
    data: "/datasets/shop-operations.csv",
    savedData: stackedBarsDashboard,
  },
  {
    id: "palmer-penguins",
    title: "Penguin field notes",
    description:
      "Three species measured on three Antarctic islands. Body size overlaps, but bill shape pulls the species apart. One color key follows them through every view, and parallel coordinates draw each penguin as one line across four measurements.",
    dataset: { rows: "344 penguins", fields: 8, source: "Real" },
    shows: ["Shared color key", "Parallel coordinates", "Scatter brushing"],
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
    guide:
      "Try this: search Sports products for text with no matches. Clear the search to restore rows.",
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
      "Daily traffic, conversion, and response time before and after a release. Lines show the trend, color by release phase shows what changed, and cumulative curves show how many days stay under any response time.",
    dataset: { rows: "90 days", fields: 7, source: "Synthetic" },
    shows: ["Time series", "Color by phase", "ECDF thresholds"],
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
    guide:
      "Try this: open Calculations, start a calculation, and enter an invalid formula. Check the parse error, then discard the draft.",
    icon: Calculator,
    data: "/datasets/shop-10000.csv",
    savedData: calculationDashboard,
  },
  {
    id: "shop-10000",
    title: "10,000 orders · 16 linked views",
    description:
      "The order book at full size. Every chart, table, and regional facet stays linked, so a filter anywhere, including a day on the revenue calendar, updates all 16 views.",
    dataset: { rows: "10,000 orders", fields: 16, source: "Synthetic" },
    shows: ["16 linked views", "Calendar heatmap", "Shared facet scales"],
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
