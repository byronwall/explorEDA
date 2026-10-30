import {
  penguinDashboard,
  largeShopDashboard,
  calculationDashboard,
  scatterTraceDashboard,
  chartControlsDashboard,
  activityDashboard,
  timeSeriesDashboard,
  groupedBarsDashboard,
  stackedBarsDashboard,
  areaDashboard,
  bubbleDashboard,
  densityDashboard,
  scatterRegressionDashboard,
  scatterRegressionUnitsDashboard,
  scatterMatrixDashboard,
  rankCorrelationDashboard,
  categoryMappingsDashboard,
  rankPairsDashboard,
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
  climateRidgelineDashboard,
  duBoisIncomeDashboard,
  bananaYieldsDashboard,
  yieldGapDashboard,
  middleClassJobsDashboard,
  taxSlopeDashboard,
  titanicWaffleDashboard,
  unemploymentStreamDashboard,
  populationPyramidDashboard,
  gdpBumpDashboard,
  scotusTimelineDashboard,
  stocksHorizonDashboard,
  co2SwarmDashboard,
  titanicMosaicDashboard,
  incomeLifeScatterDashboard,
  mediaDeathsBarDashboard,
  duBoisIncomeBarDashboard,
  unemploymentAreaDashboard,
  drivingScatterDashboard,
  taxSlopeScatterDashboard,
  pewMeaningScatterDashboard,
  middleClassJobsScatterDashboard,
  fanLineDashboard,
  messageHeatmapDashboard,
  measlesHeatmapDashboard,
  electionsHeatmapDashboard,
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
  ChartColumnStacked,
  Calculator,
  Spline,
  TableProperties,
  AreaChart,
  BatteryCharging,
  Donut as DonutIcon,
  ArrowDownWideNarrow as FunnelIcon,
  Grid2x2 as RetentionIcon,
  ChartGantt as TimelineIcon,
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
  TrendingUp,
  Waves,
  Users,
  ListOrdered,
  GanttChart,
  AlignStartVertical,
  Bug,
  CloudFog,
  Globe,
  Activity,
  LayoutGrid,
  LayoutTemplate,
  LineChart,
  LucideIcon,
  Orbit,
  Ruler,
  Plane,
  ScatterChart,
  ShoppingCart,
  Tags,
  Thermometer,
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
import { engineeringHistogramsDashboard } from "./engineeringHistograms";
import {
  batteryDayDashboard,
  budgetBridgeDashboard,
  budgetReportDashboard,
  channelShareDashboard,
} from "./partsAndChangeDashboards";
import {
  productFunnelDashboard,
  productRetentionDashboard,
  roomBookingsDashboard,
} from "./journeyDashboards";
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
  /**
   * The same analysis built another way: a composition's ordinary-chart
   * route, or the authored composition a built-in example stands beside.
   */
  counterpart?: { id: string; label: string };
}

const viewNames: Record<string, string> = {
  "3d-scatter": "3D scatter",
  bar: "histogram",
  calendar: "calendar",
  boxplot: "box plot",
  "color-legend": "legend",
  composition: "composition",
  waterfall: "waterfall",
  funnel: "funnel",
  retention: "retention",
  timeline: "timeline",
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
  hierarchy: "hierarchy",
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
      { name: "By country", capabilities: ["Maps"] },
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
    id: "engineering-histograms",
    title: "Shaft diameters in saved bins",
    description:
      "162 synthetic turned shafts from three lathes, measured in millimetres. Bins 0.01 mm wide stay where they are saved; parts past the range count in coverage tails, and limits of 12.00 ± 0.05 mm count every part below, within, and above specification.",
    dataset: { rows: "162 parts", fields: 4, source: "Synthetic" },
    shows: ["Saved bin width", "Coverage tails", "Specification limits"],
    icon: Ruler,
    data: "/shaft-diameters.csv",
    savedData: engineeringHistogramsDashboard,
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
    id: "scatter-regression-units",
    title: "A fitted curve far from zero",
    description:
      "Five sensor readings sit a billion millimetres from zero. The quadratic's equation is written around a round center, so its rounded numbers still give the curve, in millimetres or metres.",
    dataset: { rows: "5 readings", fields: 4, source: "Synthetic" },
    shows: ["Polynomial fit", "Centered equation", "Unit change"],
    icon: ScatterChart,
    data: "/datasets/regression-units.csv",
    savedData: scatterRegressionUnitsDashboard,
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
    id: "category-mappings",
    title: "Hand-typed countries",
    description:
      "Support agents typed each ticket's country by hand: USA, US, U.S., us, and a stray space. One mapping merges the spellings someone has checked into United States and Canada; the rest keep their value until you map them.",
    dataset: { rows: "240 tickets", fields: 5, source: "Synthetic" },
    shows: ["Map categories", "recode()", "Exact matches"],
    icon: Tags,
    data: "/datasets/support-tickets.csv",
    savedData: categoryMappingsDashboard,
  },
  {
    id: "rank-correlation-basics",
    title: "Straight lines and steady rises",
    description:
      "Exam scores rise with study hours, then level off. Pearson reads the bend as a weaker link; Spearman ranks each pair first and reads the steady rise. Practice tests have gaps and Confidence has ties, so each pair ranks only its own rows.",
    dataset: { rows: "40 students", fields: 6, source: "Synthetic" },
    shows: ["Spearman correlation", "Tied ranks", "Missing values"],
    icon: LayoutGrid,
    data: "/datasets/study-hours.csv",
    savedData: rankCorrelationDashboard,
  },
  {
    id: "rank-pair-discovery",
    title: "Pairs that bend, curve, or hang on one row",
    description:
      "Each cell shows Pearson r above Spearman ρ. Growth curves away from a line, the U response scores near 0 on both, and Spike rises only because of its last batch. Pairs lists every pair sorted by the gap between r and ρ.",
    dataset: { rows: "40 batches", fields: 6, source: "Synthetic" },
    shows: ["Pearson and Spearman", "Pairs list", "Outliers"],
    icon: LayoutGrid,
    data: "/datasets/pair-shapes.csv",
    savedData: rankPairsDashboard,
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
    id: "dense-chart-controls",
    title: "Change a chart where it sits",
    description:
      "Change a scatter's color field from the label above the plot. The choice applies at once, keeps the chart's filter, and undoes in one step.",
    dataset: { rows: "18 orders", fields: 6, source: "Synthetic" },
    shows: ["Color in place", "Shared color scale", "One-step undo"],
    icon: ScatterChart,
    data: "/datasets/scatter-trace.csv",
    savedData: chartControlsDashboard,
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
    title: "Six years of correspondence",
    description:
      "Six years of messages with 12 correspondents: one strip of monthly squares per person, darker for busier months, with a count beside each name and a callout on the busiest month.",
    dataset: { rows: "10,376 messages", fields: 5, source: "Synthetic" },
    shows: ["Monthly strips", "Repeated chart units", "Copy as PNG"],
    icon: LayoutTemplate,
    data: "/datasets/message-log.csv",
    savedData: messageDashboard,
    counterpart: {
      id: "message-log-heatmap",
      label: "The same analysis as a built-in heatmap",
    },
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
    counterpart: {
      id: "driving-scatter",
      label: "The same analysis as a built-in scatter",
    },
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
    counterpart: {
      id: "forecast-fan-line",
      label: "The same analysis as built-in line charts",
    },
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
    counterpart: {
      id: "media-deaths-bar",
      label: "The same analysis as a built-in bar chart",
    },
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
    counterpart: {
      id: "measles-heatmap",
      label: "The same analysis as a built-in heatmap",
    },
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
    id: "budget-bridge",
    title: "Lab budget: plan to actual",
    description:
      "A research lab planned a $104K surplus and ended $39K short. A waterfall bridges plan to actual one line item at a time, with a subtotal for funding, staff, and operations; pick quarters to bridge part of the year, and click a step to see its rows.",
    dataset: {
      rows: "96 budget rows",
      fields: 6,
      source: "Synthetic",
    },
    shows: ["Waterfall bridge", "Group subtotals", "Plan and actual states"],
    icon: ChartColumnStacked,
    data: "/datasets/lab-budget.csv",
    savedData: budgetBridgeDashboard,
  },
  {
    id: "battery-day",
    title: "A day in the battery",
    description:
      "A building's battery starts the day at 40 kWh. A running-total waterfall adds each hour's solar, grid, and load flows to its charge, with a subtotal for each part of the day; pick flows to see what solar alone added.",
    dataset: { rows: "45 hourly flows", fields: 4, source: "Synthetic" },
    shows: ["Running total", "Ordered steps", "Period subtotals"],
    icon: BatteryCharging,
    data: "/datasets/battery-day.csv",
    savedData: batteryDayDashboard,
  },
  {
    id: "channel-share",
    title: "Shares of the order book",
    description:
      "500 orders split by sales channel and product. A donut shows each channel's share of revenue beside 100% bars of the same mix in each region, in the same colors; a second donut pools the smaller products into Other. Click a slice and every view narrows.",
    dataset: { rows: "500 orders", fields: 15, source: "Synthetic" },
    shows: ["Donut shares", "Other slice", "Shared channel colors"],
    icon: DonutIcon,
    data: "/datasets/shop-operations.csv",
    savedData: channelShareDashboard,
  },
  {
    id: "product-funnel",
    title: "Who gets from a first visit to a paid plan",
    description:
      "2,000 visitors to a fictional app, one row per event. A funnel follows each user through visit, signup, first project, team invite, and upgrade in order, so a step done too early never counts. Click a step to see everything its users did; click a channel to compare funnels.",
    dataset: { rows: "11,296 events", fields: 5, source: "Synthetic" },
    shows: [
      "Ordered funnel steps",
      "Drop-off between steps",
      "Users behind a step",
    ],
    icon: FunnelIcon,
    data: "/datasets/product-events.csv",
    savedData: productFunnelDashboard,
  },
  {
    id: "product-retention",
    title: "Who keeps coming back after signing up",
    description:
      "The same 2,000 visitors, grouped by the week they signed up. Each cell is the share of that week's signups active in each week after, so the newest cohorts end where the data ends. Click a cell to see everything its users did; click a channel to compare retention.",
    dataset: { rows: "11,296 events", fields: 5, source: "Synthetic" },
    shows: ["Weekly cohorts", "Share active by week", "Users behind a cell"],
    icon: RetentionIcon,
    data: "/datasets/product-events.csv",
    savedData: productRetentionDashboard,
  },
  {
    id: "room-bookings",
    title: "Which rooms are booked, and when",
    description:
      "Four weeks of bookings across 12 fictional rooms, one row per booking, with double bookings, cancellations, and holds that have no end yet. Drag across the timeline to keep the bookings that overlap that time, or click a bar to select one booking; the team chart and table follow.",
    dataset: { rows: "673 bookings", fields: 8, source: "Synthetic" },
    shows: ["Lanes per room", "Brush a time window", "Open-ended holds"],
    icon: TimelineIcon,
    data: "/datasets/room-bookings.csv",
    savedData: roomBookingsDashboard,
  },
  {
    id: "budget-report",
    title: "Lab budget report",
    description:
      "A report page built in Composition: each quarter's plan-to-actual bridge as small multiples on one scale, and a donut per budget group of where its actual money came from and went. Filters and traces work as on any chart.",
    dataset: { rows: "96 budget rows", fields: 6, source: "Synthetic" },
    shows: ["Waterfall marks", "Donut marks", "Small multiples"],
    icon: LayoutTemplate,
    data: "/datasets/lab-budget.csv",
    savedData: budgetReportDashboard,
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
    counterpart: {
      id: "pew-meaning-scatter",
      label: "The same analysis as a built-in scatter",
    },
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
    counterpart: {
      id: "income-life-scatter",
      label: "The same analysis as a built-in scatter",
    },
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
      "Fifty-one states on a tile map, each a strip of its eleven presidential elections. Cell color follows the signed Democratic margin through a diverging ramp capped at 40 points, so swings read state by state and region by region.",
    dataset: { rows: "561 state-elections", fields: 8, source: "Real" },
    shows: ["Tile-addressed strips", "Signed strip colors", "Capped ramp"],
    icon: Vote,
    data: "/datasets/elections.csv",
    savedData: electionsDashboard,
    counterpart: {
      id: "elections-heatmap",
      label: "The same analysis as a built-in heatmap",
    },
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
  {
    id: "climate-ridgeline",
    title: "More days at the highest temperatures",
    description:
      "Eighty-four overlapping ridges, one per year since 1940: the spread of each year's daily global temperatures against the 1991–2020 average, shaded from colder to warmer, with El Niño years and 2023 called out.",
    dataset: { rows: "30,660 days", fields: 3, source: "Synthetic" },
    shows: [
      "Shaded density ridges",
      "Diverging fill along x",
      "Every fifth year named",
    ],
    icon: Thermometer,
    data: "/datasets/daily-global-temperature.csv",
    savedData: climateRidgelineDashboard,
  },
  {
    id: "banana-yields",
    title: "Long-term top yielding banana-producing countries",
    description:
      "A sparkline table: fifteen countries in order of their long-term banana yield, each with a trend line, a heat cell per decade with its value written in, NA where a decade has no figure, and the overall average in a tinted column.",
    dataset: { rows: "806 country-years", fields: 4, source: "Real" },
    shows: ["Values in heat cells", "Sparkline insets", "Missing as NA"],
    icon: TableProperties,
    data: "/datasets/banana-yields.csv",
    savedData: bananaYieldsDashboard,
  },
  {
    id: "yield-gap",
    title: "The yield gap",
    description:
      "A waffle histogram: for wheat and maize, one square per country stacked over its yield gap in whole tonnes per hectare and colored by continent, so the spread and the regional mix read together.",
    dataset: { rows: "197 crop-countries", fields: 4, source: "Synthetic" },
    shows: ["Waffles binned along x", "One square per row", "Category legend"],
    icon: Grid3x3,
    data: "/datasets/yield-gap.csv",
    savedData: yieldGapDashboard,
  },
  {
    id: "middle-class-jobs",
    title: "The changing nature of middle-class jobs",
    description:
      "Ten occupation groups as small slope charts from 1980 to 2012, every occupation's line colored through a diverging scale from mostly men to mostly women, with the group's change in each label.",
    dataset: { rows: "134 occupation-years", fields: 8, source: "Synthetic" },
    shows: ["Paths colored by a value", "Slope-chart grid", "Signed labels"],
    icon: TrendingUp,
    data: "/datasets/middle-class-jobs.csv",
    savedData: middleClassJobsDashboard,
    counterpart: {
      id: "middle-class-jobs-scatter",
      label: "The same analysis as a built-in scatter",
    },
  },
  {
    id: "du-bois-income",
    title: "Income and expenditure of 150 families in Atlanta",
    description:
      "W. E. B. Du Bois's 1900 plate rebuilt: one bar per income class, its spending stacked left to right as shares, joined class to class by lines at each share's edge, in a hand-colored texture on paper.",
    dataset: { rows: "33 class shares", fields: 5, source: "Real" },
    shows: [
      "Stacks across a bar",
      "Connectors between repeats",
      "Hand-colored texture",
    ],
    icon: Columns3,
    data: "/datasets/du-bois-income.csv",
    savedData: duBoisIncomeDashboard,
    counterpart: {
      id: "du-bois-income-bar",
      label: "The same analysis as a built-in bar chart",
    },
  },
  {
    id: "tax-slope",
    title: "Central government tax revenue, 2000 and 2023",
    description:
      "A slope chart: one line per OECD country between its two readings of tax revenue as a share of GDP, named and valued at both ends, colored by whether the share rose or fell.",
    dataset: { rows: "68 readings", fields: 6, source: "Real" },
    shows: ["End labels", "Paths colored by field", "End ticks"],
    icon: TrendingUp,
    data: "/datasets/tax-slope.csv",
    savedData: taxSlopeDashboard,
    counterpart: {
      id: "tax-slope-scatter",
      label: "The same analysis as a built-in scatter",
    },
  },
  {
    id: "titanic-waffle",
    title: "Every passenger on the Titanic",
    description:
      "A waffle per class: one cell per passenger, filled from the bottom with those who died and then those who survived, so column heights compare class sizes and the blue blocks compare survival.",
    dataset: { rows: "1,309 passengers", fields: 8, source: "Real" },
    shows: ["Waffle marks", "One cell per row", "Shared category colors"],
    icon: Grid3x3,
    data: "/datasets/titanic.csv",
    savedData: titanicWaffleDashboard,
  },
  {
    id: "unemployment-stream",
    title: "Unemployed Americans by industry, 2000 to 2010",
    description:
      "A streamgraph: fourteen industries' unemployed stacked month by month on a wiggling baseline with smooth edges, so the stream's thickness is the total and each layer's swell is its own.",
    dataset: { rows: "1,708 months", fields: 5, source: "Real" },
    shows: ["Stream baselines", "Smooth curves", "Dated stacks"],
    icon: Waves,
    data: "/datasets/unemployment-industries.csv",
    savedData: unemploymentStreamDashboard,
    counterpart: {
      id: "unemployment-area",
      label: "The same analysis as a built-in line chart",
    },
  },
  {
    id: "population-pyramid",
    title: "The United States grew older",
    description:
      "Two population pyramids, 1900 and 2000: bar marks per age group with men mirrored left of the baseline, on one shared length axis, each unit windowed to its census.",
    dataset: { rows: "570 rows", fields: 5, source: "Real" },
    shows: ["Bar marks", "Mirrored categories", "Windowed units"],
    icon: Users,
    data: "/datasets/us-population.csv",
    savedData: populationPyramidDashboard,
  },
  {
    id: "gdp-bump",
    title: "The world's largest economies, ranked each year since 1980",
    description:
      "A bump chart: each economy's rank by GDP at every year, computed on the spot among the rows shown, joined into smooth paths colored by region and named at the right with the latest rank.",
    dataset: { rows: "740 rows", fields: 5, source: "Real" },
    shows: ["Ranks on the fly", "Smooth paths", "End labels"],
    icon: ListOrdered,
    data: "/datasets/gdp-ranks.csv",
    savedData: gdpBumpDashboard,
  },
  {
    id: "scotus-timeline",
    title: "Every seat on the Supreme Court, 1789 to today",
    description:
      "A timeline: one lane per seat, one span per justice from oath to departure, colored by the appointing president's party, with open ends for sitting justices and names inside the longer terms.",
    dataset: { rows: "121 terms", fields: 13, source: "Real" },
    shows: ["Span marks", "Open ends", "Labels inside spans"],
    icon: GanttChart,
    data: "/datasets/scotus.csv",
    savedData: scotusTimelineDashboard,
  },
  {
    id: "stocks-horizon",
    title: "Five tech stocks, 2000 to 2010, as horizon bands",
    description:
      "A horizon chart: each stock's growth since 2000 folded into three stacked bands per row, gains in blue and losses mirrored upward in red, so five decades-long swings fit in a few rows.",
    dataset: { rows: "560 months", fields: 4, source: "Real" },
    shows: ["Horizon marks", "Baselines from a first value", "Mirrored losses"],
    icon: AlignStartVertical,
    data: "/datasets/tech-stocks.csv",
    savedData: stocksHorizonDashboard,
  },
  {
    id: "co2-swarm",
    title: "Carbon dioxide per person, 2020",
    description:
      "A beeswarm per region: every economy as a dot sized by population and colored by income group, pushed off the line just far enough to clear its neighbors along a shared log scale.",
    dataset: { rows: "203 economies", fields: 6, source: "Real" },
    shows: ["Swarmed dot rows", "Log scale", "Sized and colored points"],
    icon: Bug,
    data: "/datasets/co2-per-capita.csv",
    savedData: co2SwarmDashboard,
  },
  {
    id: "titanic-mosaic",
    title: "Who survived the Titanic, by class",
    description:
      "A mosaic plot: columns sized by each class's share of passengers through a per-repeat calculation, each stacking the shares who survived and died, so area reads as people and filters resize the columns.",
    dataset: { rows: "1,309 passengers", fields: 8, source: "Real" },
    shows: ["Weighted repeats", "Normalized stacks", "Label values"],
    icon: Columns3,
    data: "/datasets/titanic.csv",
    savedData: titanicMosaicDashboard,
  },
  {
    id: "income-life-scatter",
    title: "Richer countries live longer, as a scatter",
    description:
      "The income and life composition rebuilt as an ordinary scatter: 197 economies on a log income axis, circles sized by population and colored by region, with a dozen countries labeled by Country-keyed callouts in Notes.",
    dataset: { rows: "197 economies", fields: 7, source: "Real" },
    shows: ["Log x axis", "Bubble size", "Record callouts"],
    icon: CircleDot,
    data: "/datasets/gapminder-2023.csv",
    savedData: incomeLifeScatterDashboard,
    counterpart: { id: "income-life", label: "The authored composition" },
  },
  {
    id: "media-deaths-bar",
    title: "What Americans die from, and what the news covers, as bars",
    description:
      "The media and deaths composition rebuilt as an ordinary 100% bar chart: each source sums its counts and splits them by cause, so every column is a share of its own total. Alt-click a segment for the source's denominator.",
    dataset: { rows: "60 source-cause counts", fields: 5, source: "Real" },
    shows: ["100% series bars", "Summed groups", "Per-source denominators"],
    icon: Columns3,
    data: "/datasets/media-deaths.csv",
    savedData: mediaDeathsBarDashboard,
    counterpart: { id: "media-deaths", label: "The authored composition" },
  },
  {
    id: "du-bois-income-bar",
    title: "Income and expenditure of 150 families, as bars",
    description:
      "Du Bois's 1900 plate as an ordinary 100% bar chart: one column per income class in its own order, each class's spending split by category as shares of its total. The traces list the 33 class shares, the data the plate was drawn from.",
    dataset: { rows: "33 class shares", fields: 5, source: "Real" },
    shows: ["100% series bars", "Data order", "Shared category colors"],
    icon: Columns3,
    data: "/datasets/du-bois-income.csv",
    savedData: duBoisIncomeBarDashboard,
    counterpart: { id: "du-bois-income", label: "The authored composition" },
  },
  {
    id: "unemployment-area",
    title: "Unemployed Americans by industry, as stacked areas",
    description:
      "The unemployment streamgraph as an ordinary line chart: fourteen industries' unemployed summed per month and stacked from zero, so the top edge is the national total and each band is one industry. Pick an industry to see it alone.",
    dataset: { rows: "1,708 months", fields: 5, source: "Real" },
    shows: ["Stacked areas", "Monthly sums", "Split by industry"],
    icon: Layers,
    data: "/datasets/unemployment-industries.csv",
    savedData: unemploymentAreaDashboard,
    counterpart: {
      id: "unemployment-stream",
      label: "The authored composition",
    },
  },
  {
    id: "driving-scatter",
    title: "Driving shifts into reverse, as a connected scatter",
    description:
      "Miles driven against the price of gas, 1956 to 2010, as an ordinary scatter with Connect points ordered by Year. The path doubles back whenever driving fell, and a filtered-out year breaks it instead of being skipped.",
    dataset: { rows: "55 years", fields: 4, source: "Real" },
    shows: ["Connected points", "Order by a field", "Record callouts"],
    icon: Spline,
    data: "/datasets/driving.csv",
    savedData: drivingScatterDashboard,
    counterpart: { id: "driving-shifts", label: "The authored composition" },
  },
  {
    id: "tax-slope-scatter",
    title: "Central government tax revenue, as a slope scatter",
    description:
      "Each OECD country's two readings joined by Year into a slope, named at both ends, and colored by whether its share rose or fell. Pick a direction to see only those countries.",
    dataset: { rows: "68 readings", fields: 6, source: "Real" },
    shows: [
      "One path per country",
      "Labels at both ends",
      "Color by direction",
    ],
    icon: TrendingUp,
    data: "/datasets/tax-slope.csv",
    savedData: taxSlopeScatterDashboard,
    counterpart: { id: "tax-slope", label: "The authored composition" },
  },
  {
    id: "pew-meaning-scatter",
    title: "What makes life meaningful, by party, as dumbbells",
    description:
      "Each topic's two party shares on one percentage scale, joined into a dumbbell by connecting points per Topic. Connected points sit at the center of their row instead of jittering.",
    dataset: { rows: "14 topic-party shares", fields: 4, source: "Real" },
    shows: ["Paired dots", "Categorical rows", "Color by party"],
    icon: Dumbbell,
    data: "/datasets/pew-meaning.csv",
    savedData: pewMeaningScatterDashboard,
    counterpart: { id: "pew-meaning", label: "The authored composition" },
  },
  {
    id: "middle-class-jobs-scatter",
    title: "The changing nature of middle-class jobs, as slope panels",
    description:
      "Every occupation's jobs per 1,000 from 1980 to 2012 as a connected path, one panel per occupation group, colored through a diverging scale from mostly men to mostly women.",
    dataset: { rows: "134 occupation-years", fields: 8, source: "Synthetic" },
    shows: ["One path per occupation", "Facets", "Numerical color"],
    icon: TrendingUp,
    data: "/datasets/middle-class-jobs.csv",
    savedData: middleClassJobsScatterDashboard,
    counterpart: { id: "middle-class-jobs", label: "The authored composition" },
  },
  {
    id: "forecast-fan-line",
    title: "Inflation and growth forecasts, as line charts with intervals",
    description:
      "The forecast fan as two ordinary line charts, one per measure through a chart-local filter. Each draws the central path and four supplied percentile ranges as Interval notes; the bounds widen the y axis, and the Notes list says how many rows each ribbon reads.",
    dataset: { rows: "104 quarter-measures", fields: 13, source: "Synthetic" },
    shows: [
      "Supplied intervals",
      "Chart-local filters",
      "Bounds in the domain",
    ],
    icon: AreaChart,
    data: "/datasets/inflation-fan.csv",
    savedData: fanLineDashboard,
    counterpart: { id: "forecast-fan", label: "The authored composition" },
  },
  {
    id: "message-log-heatmap",
    title: "Six years of messages, as a heatmap",
    description:
      "Twelve correspondents by month, 2019 to 2024, in an ordinary heatmap that bins the Date column by month: all 72 months show, a quiet month stays an empty cell, and color follows the square root of each count so light months still read. Click a cell for that month's messages.",
    dataset: { rows: "10,376 messages", fields: 5, source: "Synthetic" },
    shows: ["Monthly date bins", "Square-root color", "Date-range selection"],
    icon: LayoutTemplate,
    data: "/datasets/message-log.csv",
    savedData: messageHeatmapDashboard,
    counterpart: { id: "message-log", label: "The authored composition" },
  },
  {
    id: "measles-heatmap",
    title: "Measles before and after the vaccine, as a heatmap",
    description:
      "All 51 states and 85 years in an ordinary heatmap, states in the publisher's order and years in sequence. Color runs on fixed ends with a square root, so a state-year keeps its color through filters; years a state did not report read as cells without a valid value.",
    dataset: { rows: "4,335 state-years", fields: 6, source: "Real" },
    shows: ["51 × 85 cells", "Data order", "Fixed color ends"],
    icon: Grid3x3,
    data: "/datasets/measles.csv",
    savedData: measlesHeatmapDashboard,
    counterpart: { id: "measles", label: "The authored composition" },
  },
  {
    id: "elections-heatmap",
    title: "How each state voted, as a heatmap",
    description:
      "Fifty-one states by eleven elections, colored by the Democratic margin on a fixed signed scale from −40 to +40, so a margin keeps its color when you filter to a region or a winner. The tile map stays in the composed version.",
    dataset: { rows: "561 state-elections", fields: 8, source: "Real" },
    shows: ["Diverging fixed scale", "Average margin", "51 × 11 cells"],
    icon: Vote,
    data: "/datasets/elections.csv",
    savedData: electionsHeatmapDashboard,
    counterpart: { id: "elections", label: "The authored composition" },
  },
];

/** The catalogue: complete analyses, in the order the landing page lists them. */
export const catalogue = examples.filter((example) => example.listed);
