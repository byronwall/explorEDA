import {
  penguinDashboard,
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
  scatterMatrixDashboard,
  scatterSurfaceDashboard,
  pointMapDashboard,
  regionMapDashboard,
  distributionDashboard,
  messageDashboard,
  drivingDashboard,
  sparklinesDashboard,
  fanDashboard,
  timeUseDashboard,
  mediaDeathsDashboard,
  measlesDashboard,
  causesByAgeDashboard,
  consumerConfidenceDashboard,
  pewMeaningDashboard,
  incomeLifeDashboard,
  covidTilesDashboard,
  covidCompareDashboard,
  electionsDashboard,
  lincolnRidgelineDashboard,
} from "./dashboardSettings";
import { demoSettings } from "@/demos/lorenz";
import type {
  AnalysisProject,
  AnalysisSourceRow,
  SavedDataStructure,
} from "exploreda";
import {
  shopProject,
  shopProjectViews,
  shopQueryPresets,
} from "./multiSourceShop";
import {
  MapPin,
  Bird,
  BarChart3,
  Calculator,
  Spline,
  TableProperties,
  AreaChart,
  LayoutGrid as GridIcon,
  Columns3,
  Grid3x3,
  Layers,
  LayoutPanelTop,
  Dumbbell,
  CircleDot,
  Map as MapIcon,
  PictureInPicture2,
  Vote,
  Mountain,
  CloudFog,
  Globe,
  Activity,
  LayoutGrid,
  LayoutTemplate,
  LineChart,
  LucideIcon,
  Orbit,
  Plane,
  ScatterChart,
  ShoppingCart,
  Tags,
  ThermometerSun,
  Trophy,
  Wine,
} from "lucide-react";
import { boxPlotSettings } from "./boxPlotSettings";
import { beijingAnalysis } from "./analyses/beijing";
import { earthquakesAnalysis } from "./analyses/earthquakes";
import { flightsAnalysis } from "./analyses/flights";
import { shopText } from "./analyses/shop";
import { wineText } from "./analyses/wine";
import { worldBankAnalysis } from "./analyses/worldbank";
import type { ExampleAnalysis } from "./analyses/types";
import { categoricalChartSettings } from "./categoricalChartSettings";
import { nbaStatsSettings } from "./nbaStatsSettings";
import { calendarViews, penguinViews, type ExampleView } from "./exampleViews";

export interface ExampleDataset {
  /** Row count with its unit, such as "344 penguins". */
  rows: string;
  fields: number;
  source: "Real" | "Synthetic";
}

/** Capabilities a visitor can look for; each catalogue tab names its own. */
export const capabilities = {
  "Related tables":
    "Lookups across source tables, with each match and miss inspectable.",
  Maps: "Points placed by latitude and longitude, linked to the other charts.",
  "Density and bins":
    "Hexagons, binned counts, and smoothed density for many points.",
  Fits: "Linear, polynomial, and LOESS fits, per group and pooled.",
  Distributions:
    "Histograms, box and violin plots, and ECDFs compared by group.",
  "Time and calendars":
    "Daily to yearly series, stacked areas, and calendar heatmaps.",
  Flows: "Sankey flows from one category to the next.",
  Profiles: "Parallel coordinates: one line per row across several measures.",
  "Shares and mixes":
    "Stacked and 100% bars, heatmaps, and pivots of category mixes.",
  Calculations: "Calculated fields with formulas you can inspect and change.",
  "3D": "Rotatable 3D scatter plots with synchronized cameras.",
} as const;
export type Capability = keyof typeof capabilities;

/** A catalogue tab: its name in the workspace and what it shows. */
export interface ExampleTab {
  name: string;
  capabilities: Capability[];
}

export interface ExampleData {
  id: string;
  title: string;
  /** What the data is and why these views answer its question. */
  description: string;
  dataset: ExampleDataset;
  /** Workspace capabilities this example is built to show. */
  shows: string[];
  icon: LucideIcon;
  /** Listed in the catalogue. Other examples open only from their URL. */
  listed?: boolean;
  /** The tabs it opens with, for capability discovery. Listed examples only. */
  tabs?: ExampleTab[];
  /** A complete analysis: related tables from files, tabs from dashboard text. */
  analysis?: ExampleAnalysis;
  /** Dashboard text for a single-file example, with one `view` per tab. */
  text?: string;
  /** Related tables: the example opens a project instead of one file. */
  project?: AnalysisProject;
  tables?: Record<string, readonly AnalysisSourceRow[]>;
  queryPresets?: Record<string, SavedDataStructure>;
  /** The first tab's name, when the title does not fit a tab. */
  viewName?: string;
  data: string; // path to the data file
  savedData?: SavedDataStructure;
  /** More saved views that open as tabs beside the main one. */
  views?: ExampleView[];
}

const viewNames: Record<string, string> = {
  "3d-scatter": "3D scatter",
  bar: "histogram",
  calendar: "calendar",
  boxplot: "box plot",
  "color-legend": "legend",
  composition: "composition",
  "data-table": "table",
  heatmap: "heatmap",
  ecdf: "ECDF",
  line: "line",
  markdown: "notes",
  "metric-card": "metric card",
  map: "map",
  "parallel-coordinates": "parallel coordinates",
  "scatter-matrix": "scatter matrix",
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
  return {
    count: charts.length,
    types,
    tabs: 1 + (example.views?.length ?? 0),
  };
}

export const FEATURED_EXAMPLE_ID = "shop-operations";

/** Every example. Listed ones, first, make up the catalogue. */
export const examples: ExampleData[] = [
  {
    id: "january-flights",
    title: "Where January's flights lost time",
    description:
      "Every flight from New York's three airports in January 2013, joined to its airline, aircraft, and the weather in its scheduled hour. Follow delay from departure to arrival, set it against visibility, find the worst days, and profile routes and fleets.",
    dataset: { rows: "27,004 flights · 4 tables", fields: 13, source: "Real" },
    shows: [
      "Related tables",
      "Sankey flow",
      "Hexagon bins",
      "LOESS by group",
      "Calendar",
      "Parallel coordinates",
      "ECDF",
    ],
    listed: true,
    tabs: [
      {
        name: "Delays carry through",
        capabilities: ["Flows", "Shares and mixes", "Related tables"],
      },
      {
        name: "Departure predicts arrival",
        capabilities: ["Density and bins", "Fits", "Distributions"],
      },
      {
        name: "Weather at the scheduled hour",
        capabilities: [
          "Related tables",
          "Shares and mixes",
          "Density and bins",
        ],
      },
      {
        name: "When delays happened",
        capabilities: ["Time and calendars", "Shares and mixes"],
      },
      {
        name: "Routes and aircraft",
        capabilities: ["Profiles", "Related tables", "Distributions"],
      },
    ],
    icon: Plane,
    data: "",
    analysis: flightsAnalysis,
  },
  {
    id: "beijing-air",
    title: "A year of Beijing air, station by station",
    description:
      "Daily air quality at 12 Beijing monitoring stations through 2016, built from hourly readings. Check coverage first, then follow PM2.5 through the year, compare particles with NO₂, fit ozone against temperature by season, and brush six-pollutant profiles.",
    dataset: {
      rows: "4,392 station-days · 3 tables",
      fields: 16,
      source: "Real",
    },
    shows: [
      "Calendar heatmap",
      "Coverage heatmap",
      "Smoothed density",
      "LOESS by group",
      "Violin and observations",
      "Parallel coordinates",
      "Related tables",
    ],
    listed: true,
    tabs: [
      {
        name: "A year of PM2.5",
        capabilities: ["Time and calendars", "Distributions"],
      },
      {
        name: "Coverage and stations",
        capabilities: ["Shares and mixes", "Related tables"],
      },
      {
        name: "Particles and NO₂",
        capabilities: ["Density and bins", "Distributions"],
      },
      {
        name: "Ozone follows temperature",
        capabilities: ["Fits", "Distributions"],
      },
      {
        name: "Six-pollutant profiles",
        capabilities: ["Profiles", "Distributions"],
      },
    ],
    icon: CloudFog,
    data: "",
    analysis: beijingAnalysis,
  },
  {
    id: "world-development",
    title: "Income, longevity, and power across 217 economies",
    description:
      "World Bank indicators for every economy from 2000 to 2023, joined by country and year. Compare income with life expectancy, match electricity access at both endpoints, follow countries' paths, map who still lacks power, and see where gains were possible.",
    dataset: {
      rows: "5,208 country-years · 6 tables",
      fields: 20,
      source: "Real",
    },
    shows: [
      "Bubble scatter",
      "Point map",
      "Matched ECDF",
      "Grouped fits",
      "Yearly lines",
      "Related tables",
    ],
    listed: true,
    tabs: [
      {
        name: "Income and longevity",
        capabilities: ["Fits", "Related tables"],
      },
      {
        name: "Electricity, 2000 and 2023",
        capabilities: ["Distributions", "Related tables"],
      },
      {
        name: "Different paths",
        capabilities: ["Time and calendars", "Shares and mixes"],
      },
      {
        name: "Where people lack power",
        capabilities: ["Maps", "Related tables"],
      },
      { name: "Room to improve", capabilities: ["Distributions"] },
    ],
    icon: Globe,
    data: "",
    analysis: worldBankAnalysis,
  },
  {
    id: "earthquakes-2023",
    title: "Every strong earthquake of 2023",
    description:
      "All 7,643 magnitude 4.5+ earthquakes in the USGS catalogue for 2023. Map where they struck, find the busiest days, compare magnitude with depth within one magnitude type, and check which measurement fields each record carries.",
    dataset: { rows: "7,643 events", fields: 21, source: "Real" },
    shows: [
      "Point map",
      "Calendar heatmap",
      "Stacked area",
      "Hexagon bins",
      "ECDF by group",
      "100% bars",
    ],
    listed: true,
    tabs: [
      { name: "Where they struck", capabilities: ["Maps", "Distributions"] },
      { name: "When they happened", capabilities: ["Time and calendars"] },
      {
        name: "Magnitude and depth",
        capabilities: ["Density and bins", "Distributions"],
      },
      { name: "One magnitude type by depth", capabilities: ["Distributions"] },
      { name: "What each record carries", capabilities: ["Shares and mixes"] },
    ],
    icon: Activity,
    data: "",
    analysis: earthquakesAnalysis,
  },
  {
    id: "wine-chemistry",
    title: "What separates a good red wine",
    description:
      "1,599 Portuguese red wines with lab measurements and a tasting score. Smoothed density, hexagons, per-band fits, and marginals show how alcohol, density, and acidity move together; a second tab compares acidity and balance across quality bands.",
    dataset: { rows: "1,599 wines", fields: 12, source: "Real" },
    shows: [
      "Smoothed density",
      "LOESS by group",
      "Faceted fits",
      "Violins",
      "Parallel coordinates",
    ],
    icon: Wine,
    listed: true,
    tabs: [
      {
        name: "What separates a good red wine",
        capabilities: ["Density and bins", "Fits", "Calculations"],
      },
      {
        name: "Acidity and balance",
        capabilities: ["Distributions", "Profiles"],
      },
    ],
    data: "/datasets/wine-quality-red.csv",
    text: wineText,
  },
  {
    id: "shop-operations",
    title: "Inside the order book",
    description:
      "500 synthetic orders across regions, channels, and categories. Click any bar and every view narrows; compare the sales mix, follow revenue through the calendar, and trace each order's contribution through its calculated fields.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: [
      "Metric cards",
      "Click to filter",
      "Sankey flow",
      "100% bars",
      "Calendar heatmap",
      "Calculated fields",
    ],
    icon: ShoppingCart,
    listed: true,
    tabs: [
      {
        name: "Order book",
        capabilities: ["Flows", "Shares and mixes", "Distributions"],
      },
      {
        name: "Sales mix",
        capabilities: ["Shares and mixes", "Time and calendars"],
      },
      { name: "Calendar", capabilities: ["Time and calendars"] },
      {
        name: "Contribution and delivery",
        capabilities: ["Calculations", "Distributions"],
      },
    ],
    data: "/datasets/shop-operations.csv",
    text: shopText,
  },
  {
    id: "lorenz-3d",
    title: "How quickly do nearby Lorenz runs diverge?",
    description:
      "Five simulated runs start almost together. A saved time brush on the 2D view shows where they part in the coordinated 3D views.",
    dataset: { rows: "1,000 points", fields: 5, source: "Synthetic" },
    shows: ["3D scatter", "Saved brush", "Faceted 3D"],
    icon: Orbit,
    listed: true,
    tabs: [
      {
        name: "How quickly do nearby Lorenz runs diverge?",
        capabilities: ["3D", "Time and calendars"],
      },
    ],
    data: "/lorenz_3d_small.csv",
    savedData: demoSettings,
  },
  {
    id: "distribution-discovery",
    title: "Delivery times and smaller routes",
    description:
      "Compare 78 synthetic shipments with a histogram and distributions. Inspect smaller routes together, then select their exact categories.",
    dataset: { rows: "78 shipments", fields: 3, source: "Synthetic" },
    shows: ["Histogram", "Distribution", "Other categories", "Source tracing"],
    icon: BarChart3,
    data: "/delivery-times.csv",
    savedData: distributionDashboard,
  },
  {
    id: "region-map",
    title: "Requests across service districts",
    description:
      "Join 15 synthetic records to six service districts. Compare totals, inspect the joined records, and see zero values, missing measures, and regions with no rows.",
    dataset: { rows: "15 records", fields: 3, source: "Synthetic" },
    shows: ["Region map", "Typed region joins", "Metric tracing"],
    icon: MapPin,
    data: "/region-requests.csv",
    savedData: regionMapDashboard,
  },
  {
    id: "point-map",
    title: "Where service requests originate",
    description:
      "Compare 30 synthetic service sites. Point area shows requests; color shows region. Inspect any site to follow its coordinates and size.",
    dataset: { rows: "30 sites", fields: 5, source: "Synthetic" },
    shows: ["Point map", "Geographic view", "Source tracing"],
    icon: MapPin,
    data: "/map-sites.csv",
    savedData: pointMapDashboard,
  },
  {
    id: "scatter-density",
    title: "Where daily observations cluster",
    description:
      "Count 10,000 daily observations in temperature and sales bins. Darker cells show where more days share similar values.",
    dataset: { rows: "10,000 days", fields: 12, source: "Synthetic" },
    shows: ["Density bins", "Exact bin selection", "Source tracing"],
    icon: ScatterChart,
    data: "/correlated_medium.csv",
    savedData: densityDashboard,
  },
  {
    id: "scatter-regression",
    title: "Bill shape within each species",
    description:
      "Pooled together, longer penguin bills look shallower. Fit each species on its own and the slope turns positive. Equations, slopes, and R² read on the chart; a filter from another view refits them.",
    dataset: { rows: "344 penguins", fields: 8, source: "Real" },
    shows: ["Grouped regression", "Faceted fits", "Fit tracing"],
    icon: ScatterChart,
    data: "/datasets/palmer-penguins.csv",
    savedData: scatterRegressionDashboard,
  },
  {
    id: "scatter-matrix",
    title: "Every pair of penguin measurements",
    description:
      "A scatter matrix puts every pair of fields side by side, with each field's distribution on the diagonal. Numbers, species, and sex share one grid, and a brush in any cell highlights the same penguins everywhere.",
    dataset: { rows: "344 penguins", fields: 8, source: "Real" },
    shows: ["Scatter matrix", "Linked brushing", "Mixed field types"],
    icon: LayoutGrid,
    data: "/datasets/palmer-penguins.csv",
    savedData: scatterMatrixDashboard,
  },
  {
    id: "scatter-surfaces",
    title: "Ten thousand days, two ways to see density",
    description:
      "Hexagons count the days in fixed cells; the smoothed density estimates rows per unit area and outlines where days concentrate. A linear fit and paired summary sit over the density.",
    dataset: { rows: "10,000 days", fields: 12, source: "Synthetic" },
    shows: ["Hexagonal bins", "Smoothed density", "Contour tracing"],
    icon: ScatterChart,
    data: "/correlated_medium.csv",
    savedData: scatterSurfaceDashboard,
  },
  {
    id: "bubble-scatter",
    title: "Trial volume, speed, and conversion",
    description:
      "Compare daily response time and conversion. Bubble area shows trial volume, and color marks each release phase.",
    dataset: { rows: "90 days", fields: 7, source: "Synthetic" },
    shows: ["Bubble area", "Row selection", "Size tracing"],
    icon: ScatterChart,
    data: "/datasets/product-activity.csv",
    savedData: bubbleDashboard,
  },
  {
    id: "multi-source-shop",
    title: "Orders, items, and their sources",
    description:
      "Follow customers, orders, items, and products. Each view says what one row is before you chart it.",
    dataset: { rows: "5 orders · 8 items", fields: 15, source: "Synthetic" },
    shows: ["Related tables", "Row meaning", "Query flow", "Saved tabs"],
    icon: ShoppingCart,
    data: "",
    project: shopProject.project,
    tables: shopProject.sources,
    savedData: shopQueryPresets["orders-by-customer"],
    views: shopProjectViews,
    queryPresets: shopQueryPresets,
    viewName: "Orders",
  },
  {
    id: "calendar-series",
    title: "Orders through the calendar",
    description:
      "Compare monthly revenue by channel, weekly order counts, and daily activity. Every period links to the orders behind it.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: [
      "Calendar summaries",
      "Period selection",
      "Source tracing",
      "Saved tabs",
    ],
    icon: LineChart,
    data: "/datasets/shop-operations.csv",
    savedData: timeSeriesDashboard,
    views: calendarViews,
  },
  {
    id: "grouped-bars",
    title: "Sales by region and channel",
    description:
      "Compare revenue across regions, with one bar for each channel. Select a pair to inspect the matching orders.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Grouped bars", "Pair selection", "Source tracing"],
    icon: BarChart3,
    data: "/datasets/shop-operations.csv",
    savedData: groupedBarsDashboard,
  },
  {
    id: "area-charts",
    title: "Revenue layers through the year",
    description:
      "Follow monthly revenue totals and the channels that contribute to them. Compare the stack with separate areas and inspect each period.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Area charts", "Stacked areas", "Period tracing"],
    icon: LineChart,
    data: "/datasets/shop-operations.csv",
    savedData: areaDashboard,
  },
  {
    id: "stacked-bars",
    title: "Regional totals and channel shares",
    description:
      "Compare each region's revenue and channel mix with stacked totals and percentage bars.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Stacked bars", "100% bars", "Denominator tracing"],
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
    shows: [
      "Shared color key",
      "Parallel coordinates",
      "Scatter brushing",
      "Saved tabs",
    ],
    icon: Bird,
    data: "/datasets/palmer-penguins.csv",
    savedData: penguinDashboard,
    views: penguinViews,
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
    id: "message-log",
    title: "Compose a report graphic",
    description:
      "Six years of messages with 12 correspondents. Start from a blank artboard: add a title, build one strip of monthly squares, and repeat it for each correspondent.",
    dataset: { rows: "10,376 messages", fields: 5, source: "Synthetic" },
    shows: ["Blank composition", "Repeated chart units", "Copy as PNG"],
    icon: LayoutTemplate,
    data: "/datasets/message-log.csv",
    savedData: messageDashboard,
  },
  {
    id: "driving-shifts",
    title: "Driving shifts into reverse",
    description:
      "Fifty-five years of miles driven against the price of gas, as one connected path. The composition orders shuffled rows by year through shared numeric scales, labels every fourth year, and anchors callouts to 1980 and 2008.",
    dataset: { rows: "55 years", fields: 4, source: "Real" },
    shows: ["Ordered path", "Numeric x–y scales", "Callouts at a year"],
    icon: Spline,
    data: "/datasets/driving.csv",
    savedData: drivingDashboard,
  },
  {
    id: "tech-sparklines",
    title: "Big-tech sparkline table",
    description:
      "Fourteen company rows, each a line through 13 years of opening prices with the low, high, and latest marked. Rows order by a first-to-last change calculation that also prints beside each name.",
    dataset: { rows: "9,030 trading days", fields: 5, source: "Real" },
    shows: [
      "Order repeats by value",
      "First-to-last change",
      "Extrema markers",
    ],
    icon: TableProperties,
    data: "/datasets/big-tech-prices.csv",
    savedData: sparklinesDashboard,
  },
  {
    id: "forecast-fan",
    title: "Forecast fan",
    description:
      "Two measures with quarterly history and three projected years. Four nested bands come straight from supplied percentile columns, under a central path, a shaded projection period, and a 2% reference line.",
    dataset: { rows: "104 quarters", fields: 13, source: "Synthetic" },
    shows: [
      "Supplied interval bands",
      "Shaded projection guide",
      "Horizontal guide",
    ],
    icon: AreaChart,
    data: "/datasets/inflation-fan.csv",
    savedData: fanDashboard,
  },
  {
    id: "time-use",
    title: "How the day changed in 2020",
    description:
      "Twelve activities in a grid. Each panel summarizes minutes a day for the 2019 and 2020 cohorts on the spot: quartile bands joined across the years, medians marked, and a diverging color for the change in median.",
    dataset: { rows: "5,742 diary entries", fields: 6, source: "Synthetic" },
    shows: [
      "Quartile summaries per cohort",
      "Diverging change color",
      "Per-panel scales",
    ],
    icon: GridIcon,
    data: "/datasets/time-use.csv",
    savedData: timeUseDashboard,
  },
  {
    id: "media-deaths",
    title: "What Americans die from, and what the news covers",
    description:
      "Four normalized columns: deaths in 2023, then the causes three outlets wrote about. Each column stacks fifteen causes as shares of its own total, in one order and color, with the denominator spelled out in every segment's trace.",
    dataset: { rows: "60 source-cause counts", fields: 5, source: "Real" },
    shows: [
      "Normalized stacks",
      "Explainable denominators",
      "Shared category colors",
    ],
    icon: Columns3,
    data: "/datasets/media-deaths.csv",
    savedData: mediaDeathsDashboard,
  },
  {
    id: "measles",
    title: "Measles before and after the vaccine",
    description:
      "Fifty-one state strips, one cell per year from 1928 to 2012, colored by a placed multistop ramp. Years a state did not report draw as neutral cells, the one missing record stays blank, and the 1963 vaccine guide holds while you filter.",
    dataset: { rows: "4,335 state-years", fields: 6, source: "Real" },
    shows: [
      "Multistop color ramp",
      "Explicit missing cells",
      "Publisher row order",
    ],
    icon: Grid3x3,
    data: "/datasets/measles.csv",
    savedData: measlesDashboard,
  },
  {
    id: "causes-by-age",
    title: "What people die from, by age",
    description:
      "One stack spread across age from 0 to 100. Nine causes draw as areas of their share of each age's total, labeled where each band is thickest, with every denominator open to inspection.",
    dataset: { rows: "909 age-cause counts", fields: 3, source: "Synthetic" },
    shows: ["Stacked areas across x", "Shares per age", "Band labels"],
    icon: Layers,
    data: "/datasets/causes-by-age.csv",
    savedData: causesByAgeDashboard,
  },
  {
    id: "consumer-confidence",
    title: "Consumer confidence around the world",
    description:
      "Nine countries in a 3 × 3 grid. Every panel draws all nine index paths on one shared scale and lights up its own, with the latest value marked and a 100 reference line; the x axis is a real date scale.",
    dataset: { rows: "467 country-months", fields: 3, source: "Real" },
    shows: [
      "Series paths with a focus",
      "Date scales",
      "Latest point per series",
    ],
    icon: LayoutPanelTop,
    data: "/datasets/consumer-confidence.csv",
    savedData: consumerConfidenceDashboard,
  },
  {
    id: "pew-meaning",
    title: "What makes life meaningful, by party",
    description:
      "Seven topics as dumbbell rows: each party's share as a colored dot on one percentage scale, a connector between them, a legend, and the signed gap beside every row from a difference calculation.",
    dataset: { rows: "14 topic-party shares", fields: 4, source: "Real" },
    shows: [
      "Dot rows without a y scale",
      "Color by category",
      "Legend element",
    ],
    icon: Dumbbell,
    data: "/datasets/pew-meaning.csv",
    savedData: pewMeaningDashboard,
  },
  {
    id: "income-life",
    title: "Richer countries live longer",
    description:
      "One annotated scatter of 197 economies in 2023: life expectancy against income on a log scale, circles sized by population and colored by region, a region legend, and labels on a dozen chosen countries.",
    dataset: { rows: "197 economies", fields: 7, source: "Real" },
    shows: [
      "Log numeric scale",
      "Size by population",
      "Labels on listed values",
    ],
    icon: CircleDot,
    data: "/datasets/gapminder-2023.csv",
    savedData: incomeLifeDashboard,
  },
  {
    id: "covid-tiles",
    title: "Three years of Covid, state by state",
    description:
      "Fifty-one small case-rate paths, each at its state's cell on a US tile grid, on one shared scale with the latest week marked and the worst week in every label.",
    dataset: { rows: "8,109 state-weeks", fields: 5, source: "Real" },
    shows: ["Tile-addressed repeats", "Shared time scale", "Peak per repeat"],
    icon: MapIcon,
    data: "/datasets/covid-tiles.csv",
    savedData: covidTilesDashboard,
  },
  {
    id: "covid-compare",
    title: "The last nine months, against three years",
    description:
      "Six state panels with two frames each: the recent window in the main frame against the national rate, and the full three-year history in an inset, on a separate scale, for the state and the nation.",
    dataset: { rows: "1,119 state-weeks", fields: 4, source: "Real" },
    shows: [
      "Inset frames",
      "Display windows",
      "Comparison series left out of repeats",
    ],
    icon: PictureInPicture2,
    data: "/datasets/covid-compare.csv",
    savedData: covidCompareDashboard,
  },
  {
    id: "elections",
    title: "How each state voted, 1976 to 2016",
    description:
      "Fifty-one state strips across eleven presidential elections. Each cell's color follows the signed Democratic margin through a diverging ramp, rows sort by the latest margin, and a ramp legend keys the colors.",
    dataset: { rows: "561 state-elections", fields: 7, source: "Real" },
    shows: [
      "Signed strip colors",
      "Ramp legend",
      "Rows ordered by a calculation",
    ],
    icon: Vote,
    data: "/datasets/elections.csv",
    savedData: electionsDashboard,
  },
  {
    id: "lincoln-ridgeline",
    title: "Temperatures in Lincoln, Nebraska, in 2016",
    description:
      "Twelve overlapping ridges, one per month: the density of each month's daily mean temperatures on one shared scale and height, computed on the spot from the daily readings.",
    dataset: { rows: "366 days", fields: 6, source: "Real" },
    shows: ["Density marks", "Overlapping rows", "Shared height"],
    icon: Mountain,
    data: "/datasets/lincoln-weather.csv",
    savedData: lincolnRidgelineDashboard,
  },
];

/** The catalogue: complete analyses, in the order the landing page lists them. */
export const catalogue = examples.filter((example) => example.listed);

/** The analysis the landing page features. */
export const FEATURED_ANALYSIS_ID = "january-flights";
