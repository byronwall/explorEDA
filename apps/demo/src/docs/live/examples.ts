import { boxPlotSettings } from "@/demos/boxPlotSettings";
import { categoricalChartSettings } from "@/demos/categoricalChartSettings";
import {
  activityDashboard,
  areaDashboard,
  bubbleDashboard,
  densityDashboard,
  groupedBarsDashboard,
  histogram,
  lincolnCalendarDashboard,
  scatterRegressionDashboard,
  scatterRegressionUnitsDashboard,
  scatterSurfaceDashboard,
  stackedBarsDashboard,
  messageDashboard,
  penguinDashboard,
  pointMapDashboard,
  scatterMatrixDashboard,
  rankCorrelationDashboard,
  rankPairsDashboard,
  scatterTraceDashboard,
  chartControlsDashboard,
  shopDashboard,
  timeSeriesDashboard,
  categoryMappingsDashboard,
  supplierInvoicesDashboard,
} from "@/demos/dashboardSettings";
import { demoSettings as lorenzSettings } from "@/demos/lorenz";
import { engineeringHistogramsDashboard } from "@/demos/engineeringHistograms";
import {
  batteryDayDashboard,
  budgetBridgeDashboard,
  budgetReportDashboard,
  channelShareDashboard,
} from "@/demos/partsAndChangeDashboards";
import {
  productFunnelDashboard,
  productRetentionDashboard,
  roomBookingsDashboard,
} from "@/demos/journeyDashboards";
import { emptySelectionDashboard } from "@/demos/emptySelection";
import { orderGapsDashboard } from "@/demos/missingnessDashboards";
import type { SavedDataStructure } from "exploreda";

type LiveExampleBase = {
  /** The workspace region's accessible name. */
  label: string;
  /** A CSV under `public/`, such as `/datasets/shop-operations.csv`. */
  data: string;
  /** Alt text for the screenshot shown on narrow screens. */
  shotAlt: string;
};

export type LiveWorkspaceSpec = LiveExampleBase & {
  savedData: SavedDataStructure;
  /** The example to open in full, from `demos/examples.ts`. */
  exampleId: string;
  /**
   * Shows one chart beside a real workspace surface instead of the whole
   * workspace. `chart` names the chart in `savedData`.
   */
  surface?: { kind: "settings"; chart: string };
  /**
   * Keeps the workspace toolbar and status bar, for a page about them.
   * Other examples show only their charts.
   */
  chrome?: boolean;
  notebook?: undefined;
};

/** A notebook over the data instead of a workspace. */
export type LiveNotebookSpec = LiveExampleBase & {
  /** The notebook's text. */
  notebook: string;
  /** A page that shows the same feature in full, such as a Daily piece. */
  fullPath: string;
  /** How tall the notebook draws before it loads. */
  height: number;
};

export type LiveExampleSpec = LiveWorkspaceSpec | LiveNotebookSpec;

/** Grid columns and rows; the height defaults to the chart's own. */
type Placement = readonly [x: number, y: number, w: number, h?: number];

/**
 * A dashboard narrowed to some of its charts, each placed again. The charts
 * keep every other setting, so the docs show the same views the example does.
 * Docs columns are narrower than 960px, where the grid flows charts: one
 * wider than half the grid takes a whole row, and the rest pair up.
 */
function focus(
  source: SavedDataStructure,
  charts: Readonly<Record<string, Placement>>
): SavedDataStructure {
  const picked = Object.entries(charts).map(([id, [x, y, w, h]]) => {
    const chart = source.charts.find((item) => item.id === id);
    if (!chart) {
      throw new Error(`Live example: no chart "${id}" in the source layout`);
    }
    return { ...chart, layout: { x, y, w, h: h ?? chart.layout.h } };
  });
  return { ...source, charts: picked };
}

/** A layout with one more chart, placed by its own `layout`. */
function withChart(
  source: SavedDataStructure,
  chart: SavedDataStructure["charts"][number]
): SavedDataStructure {
  return { ...source, charts: [...source.charts, chart] };
}

const SHOP = "/datasets/shop-operations.csv";

/** The live-findings fixture: one selection, a value, and its records. */
const FINDINGS_NOTEBOOK = [
  "Selected **{{n}}** of {{eligible}} active reviews. Their average score is {{mean-score}}; [show records](#finding:mean-score). Group A averages {{a-mean}} and group B {{b-mean}}, a difference of {{gap}} ([both sides](#finding:gap)). The selection is {{active-share}} of active reviews and {{all-share}} of all {{all}}.",
  "",
  "```eda",
  "field score as=numeric",
  "finding @n count chart=@regions",
  "finding @eligible count chart=@regions population=eligible",
  "finding @mean-score average score chart=@regions digits=2",
  "finding @a-mean average score chart=@regions where.group=A digits=2",
  "finding @b-mean average score chart=@regions where.group=B digits=2",
  "finding @all count",
  "finding @gap difference a-mean b-mean",
  "finding @active-share share n eligible",
  "finding @all-share share n all digits=1",
  'row region @regions where.active=true title="Active reviews by region"',
  'row group @groups title="All reviews by group"',
  "```",
].join("\n");

export const liveExamples = {
  "notebook-findings": {
    label: "Live notebook findings",
    data: "/datasets/live-findings.csv",
    notebook: FINDINGS_NOTEBOOK,
    fullPath: "/daily/flights-by-hour",
    height: 560,
    shotAlt:
      "A sentence with live values above two row charts of reviews by region and by group.",
  },
  "bar-histogram": {
    label: "Live delivery-time histogram",
    data: "/datasets/shop-operations.csv",
    // Both charts are bar charts: numeric bins beside category counts.
    savedData: withChart(
      focus(shopDashboard, { "shop-delivery": [0, 0, 6, 5] }),
      histogram(
        "shop-channel-bars",
        "Sales channels",
        "Channel",
        { x: 6, y: 0, w: 6, h: 5 },
        "Channel"
      )
    ),
    exampleId: "shop-operations",
    shotAlt:
      "A histogram of delivery days beside a bar chart of orders by sales channel.",
  },
  "engineering-width": {
    label: "Live shaft-diameter histogram in saved bins",
    data: "/shaft-diameters.csv",
    savedData: focus(engineeringHistogramsDashboard, {
      "diameter-bins": [0, 0, 8, 5],
      "diameter-machines": [8, 0, 4, 4],
    }),
    exampleId: "engineering-histograms",
    shotAlt:
      "A histogram of shaft diameters in 0.01 mm bins with a dashed tail bar past 12.08, beside parts by machine.",
  },
  "engineering-specs": {
    label: "Live shaft-diameter histogram with specification limits",
    data: "/shaft-diameters.csv",
    savedData: focus(engineeringHistogramsDashboard, {
      "diameter-bins": [0, 0, 8, 5],
      "diameter-machines": [8, 0, 4, 4],
    }),
    exampleId: "engineering-histograms",
    shotAlt:
      "A shaft-diameter histogram with dashed limit lines at 11.95 and 12.05, light tints past them, and Below, Within, Above, and Outside counts under the plot.",
  },
  "settings-bar": {
    label: "Live chart settings for the delivery-time histogram",
    data: "/datasets/shop-operations.csv",
    savedData: focus(shopDashboard, { "shop-delivery": [0, 0, 6, 5] }),
    exampleId: "shop-operations",
    shotAlt:
      "The delivery-time histogram beside its settings panel, open on the Data tab.",
    surface: { kind: "settings", chart: "shop-delivery" },
  },
  scatter: {
    label: "Live scatter plot of net sales against contribution",
    data: "/datasets/scatter-trace.csv",
    savedData: focus(scatterTraceDashboard, {
      "trace-scatter": [0, 0, 12, 6],
      "trace-channel": [0, 6, 6, 3],
    }),
    exampleId: "scatter-trace",
    shotAlt:
      "Calculated net sales against contribution for 18 orders, beside orders by channel.",
  },
  "dense-chart-controls": {
    label: "Live scatter plots with an editable color field",
    data: "/datasets/scatter-trace.csv",
    savedData: focus(chartControlsDashboard, {
      "controls-scatter": [0, 0, 6, 6],
      "controls-peer": [6, 0, 6, 6],
    }),
    exampleId: "dense-chart-controls",
    shotAlt:
      "An uncolored scatter with a Color: None label, beside a scatter colored by channel.",
  },
  row: {
    label: "Live category row chart",
    data: SHOP,
    savedData: focus(shopDashboard, {
      "shop-category": [0, 0, 6, 4],
      "shop-channel": [6, 0, 6, 4],
    }),
    exampleId: "shop-operations",
    shotAlt: "Orders by product category beside orders by sales channel.",
  },
  line: {
    label: "Live monthly revenue line chart",
    data: SHOP,
    savedData: focus(timeSeriesDashboard, { "time-revenue": [0, 0, 12] }),
    exampleId: "calendar-series",
    shotAlt: "Monthly revenue as one line per sales channel.",
  },
  boxplot: {
    label: "Live box plot",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-order": [0, 0, 12] }),
    exampleId: "shop-operations",
    shotAlt: "Order value by product category as box plots.",
  },
  "3d-scatter": {
    label: "Live 3D scatter plot",
    data: "/lorenz_3d_small.csv",
    savedData: focus(lorenzSettings, {
      "be9caf07-92eb-43ad-b3d5-4d3853c259c9": [0, 0, 12, 6],
    }),
    exampleId: "lorenz-3d",
    shotAlt: "Five Lorenz runs as colored points in a 3D scene.",
  },
  pivot: {
    label: "Live pivot table",
    data: "/categorical_medium.csv",
    savedData: focus(categoricalChartSettings, {
      "7a345418-85b6-42d7-a86d-018cefe74d6e": [0, 0, 12],
    }),
    exampleId: "categorical-charts",
    shotAlt: "A pivot table of grouped measures.",
  },
  hierarchy: {
    label: "Live hierarchy treemap",
    data: "/categorical_medium.csv",
    savedData: focus(categoricalChartSettings, {
      "5b0d2c8e-3f41-4a8b-9c3e-6e2a1f7d4c19": [0, 0, 12],
    }),
    exampleId: "categorical-charts",
    shotAlt:
      "A treemap of the catalog nested by category, subcategory, and material.",
  },
  "data-table": {
    label: "Live data table",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-orders": [0, 0, 12, 5] }),
    exampleId: "shop-operations",
    shotAlt: "A table of orders with a distribution under each column name.",
  },
  summary: {
    label: "Live field summary table",
    data: "/correlated_medium.csv",
    savedData: focus(boxPlotSettings, {
      "2d71ef50-9f8f-4435-8577-99d84a24e28e": [0, 0, 12],
    }),
    exampleId: "box-plot",
    shotAlt: "A summary table with one row per field and its distribution.",
  },
  "color-legend": {
    label: "Live color legend beside a box plot",
    data: "/correlated_medium.csv",
    savedData: focus(boxPlotSettings, {
      "0b8a3f5e-2c1d-4d9b-8f6e-3a7c9d2e4b15": [0, 0, 12, 1],
      "384f8bd5-0c6f-4997-86ef-822749431aff": [0, 1, 12],
    }),
    exampleId: "box-plot",
    shotAlt: "A color legend above box plots colored by the same scale.",
  },
  markdown: {
    label: "Live notes panel",
    data: "/datasets/scatter-trace.csv",
    savedData: focus(scatterTraceDashboard, { "trace-guide": [0, 0, 12] }),
    exampleId: "scatter-trace",
    shotAlt: "A notes panel with formatted text that explains the analysis.",
  },
  sankey: {
    label: "Live sankey chart",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-flow": [0, 0, 12] }),
    exampleId: "shop-operations",
    shotAlt: "Orders flowing from channel to category to region.",
  },
  funnel: {
    label: "Live signup funnel",
    data: "/datasets/product-events.csv",
    savedData: focus(productFunnelDashboard, {
      "funnel-signup": [0, 0, 7, 5],
      "funnel-channel": [7, 0, 5, 4],
    }),
    exampleId: "product-funnel",
    shotAlt:
      "A funnel of users from visit to upgrade, beside events by channel.",
  },
  retention: {
    label: "Live weekly retention",
    data: "/datasets/product-events.csv",
    savedData: focus(productRetentionDashboard, {
      "retention-weekly": [0, 0, 8, 7],
      "retention-channel": [8, 0, 4, 4],
    }),
    exampleId: "product-retention",
    shotAlt:
      "Weekly signup cohorts by the share active in each week after, beside events by channel.",
  },
  timeline: {
    label: "Live room bookings",
    data: "/datasets/room-bookings.csv",
    savedData: focus(roomBookingsDashboard, {
      "bookings-timeline": [0, 0, 12, 6],
    }),
    exampleId: "room-bookings",
    shotAlt:
      "Four weeks of room bookings in one lane per room, colored by status.",
  },
  "joint-missingness": {
    label: "Live joint missingness chart",
    data: "/datasets/order-gaps.csv",
    savedData: focus(orderGapsDashboard, {
      "order-gaps": [0, 0, 12, 10],
    }),
    exampleId: "order-gaps",
    shotAlt:
      "Exact missing patterns of 600 orders, with a missing count above each field.",
  },
  "parallel-coordinates": {
    label: "Live parallel coordinates chart",
    data: "/datasets/palmer-penguins.csv",
    savedData: focus(penguinDashboard, { "penguin-profile": [0, 0, 12] }),
    exampleId: "palmer-penguins",
    shotAlt: "Each penguin as a line across bill, flipper, and mass axes.",
  },
  "scatter-matrix": {
    label: "Live scatter matrix",
    data: "/datasets/palmer-penguins.csv",
    savedData: focus(scatterMatrixDashboard, { "matrix-penguins": [0, 0, 12] }),
    exampleId: "scatter-matrix",
    shotAlt: "A grid of scatter plots for every pair of penguin measurements.",
  },
  "rank-correlation-basics": {
    label: "Live Pearson and Spearman matrices",
    data: "/datasets/study-hours.csv",
    savedData: focus(rankCorrelationDashboard, {
      "rank-pearson": [0, 0, 6, 6],
      "rank-spearman": [6, 0, 6, 6],
      "rank-records": [0, 6, 12, 4],
    }),
    exampleId: "rank-correlation-basics",
    shotAlt:
      "Two scatter matrices of study hours, exam score, practice tests, and confidence: Pearson r on the left, Spearman ρ on the right.",
  },
  "rank-pair-discovery": {
    label: "Live matrix with both correlations",
    data: "/datasets/pair-shapes.csv",
    savedData: focus(rankPairsDashboard, { "pair-shapes": [0, 0, 12] }),
    exampleId: "rank-pair-discovery",
    shotAlt:
      "A scatter matrix of dose and four responses with r above ρ in each correlation cell.",
  },
  calendar: {
    label: "Live calendar heatmap",
    data: "/datasets/lincoln-weather.csv",
    savedData: lincolnCalendarDashboard,
    exampleId: "lincoln-ridgeline",
    shotAlt:
      "Each day of 2016 in Lincoln, Nebraska, shaded by its high temperature: pale winter weeks, dark summer ones.",
  },
  heatmap: {
    label: "Live heatmap",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-category-region": [0, 0, 12] }),
    exampleId: "shop-operations",
    shotAlt: "Orders by category and region as shaded cells.",
  },
  ecdf: {
    label: "Live ECDF chart",
    data: "/datasets/product-activity.csv",
    savedData: focus(activityDashboard, { "activity-speed-share": [0, 0, 12] }),
    exampleId: "product-activity",
    shotAlt: "Cumulative share curves of page speed.",
  },
  "metric-card": {
    label: "Live metric cards",
    data: SHOP,
    savedData: focus(shopDashboard, {
      "shop-count": [0, 0, 6],
      "shop-revenue": [6, 0, 6],
    }),
    exampleId: "shop-operations",
    shotAlt: "Two metric cards: matching orders and revenue.",
  },
  map: {
    label: "Live point map",
    data: "/map-sites.csv",
    savedData: focus(pointMapDashboard, { "map-sites": [0, 0, 12] }),
    exampleId: "point-map",
    shotAlt: "Service sites as points on a world map.",
  },
  waterfall: {
    label: "Live budget waterfall",
    data: "/datasets/lab-budget.csv",
    savedData: focus(budgetBridgeDashboard, {
      "budget-bridge": [0, 0, 7, 7],
      "budget-quarter": [7, 0, 5, 3],
    }),
    exampleId: "budget-bridge",
    shotAlt:
      "A waterfall from the lab's planned net position to its actual one, with a step per line item and a subtotal per group, beside a quarter picker.",
  },
  "waterfall-running": {
    label: "Live running-total waterfall",
    data: "/datasets/battery-day.csv",
    savedData: focus(batteryDayDashboard, {
      "battery-charge": [0, 0, 7, 9],
      "battery-flows": [7, 0, 5, 3],
    }),
    exampleId: "battery-day",
    shotAlt:
      "A battery's charge through a day: a start value, one step per hour, a subtotal per part of the day, and the charge at day's end, beside a flow picker.",
  },
  donut: {
    label: "Live revenue donut",
    data: "/datasets/shop-operations.csv",
    savedData: focus(channelShareDashboard, {
      "share-channel": [0, 0, 5, 4],
      "share-region-mix": [5, 0, 7, 4],
    }),
    exampleId: "channel-share",
    shotAlt:
      "A donut of revenue by sales channel beside 100% bars of the channel mix in each region, in the same colors.",
  },
  "composition-parts": {
    label: "Live lab budget report",
    data: "/datasets/lab-budget.csv",
    savedData: focus(budgetReportDashboard, { "budget-report": [0, 0, 12, 8] }),
    exampleId: "budget-report",
    shotAlt:
      "A report page: each quarter's plan-to-actual waterfall on one scale, and a donut of each budget group's line items with a legend.",
  },
  composition: {
    label: "Live composition",
    data: "/datasets/message-log.csv",
    savedData: focus(messageDashboard, { "messages-composition": [0, 0, 12] }),
    exampleId: "message-log",
    shotAlt: "A composed graphic built from the message log.",
  },
  "scatter-density": {
    label: "Live binned scatter density",
    data: "/correlated_medium.csv",
    savedData: focus(densityDashboard, { "density-days": [0, 0, 12] }),
    exampleId: "scatter-density",
    shotAlt: "10,000 daily observations counted in rectangular bins.",
  },
  "scatter-hexbin": {
    label: "Live hexagon bins",
    data: "/correlated_medium.csv",
    savedData: focus(scatterSurfaceDashboard, { "surface-hex": [0, 0, 12] }),
    exampleId: "scatter-surfaces",
    shotAlt: "Coordinate pairs counted in hexagons, shaded by count.",
  },
  "scatter-contour": {
    label: "Live smoothed density",
    data: "/correlated_medium.csv",
    savedData: focus(scatterSurfaceDashboard, { "surface-kde": [0, 0, 12] }),
    exampleId: "scatter-surfaces",
    shotAlt: "Filled density regions and contour lines over the points.",
  },
  "scatter-regression": {
    label: "Live regression fits",
    data: "/datasets/palmer-penguins.csv",
    savedData: focus(scatterRegressionDashboard, { "fit-bill": [0, 0, 12] }),
    exampleId: "scatter-regression",
    shotAlt: "Bill depth against bill length with a fit line for each species.",
  },
  "scatter-regression-units": {
    label: "Live quadratic fit far from zero",
    data: "/datasets/regression-units.csv",
    savedData: focus(scatterRegressionUnitsDashboard, {
      "units-mm": [0, 0, 6, 6],
      "units-m": [6, 0, 6, 6],
    }),
    exampleId: "scatter-regression-units",
    shotAlt:
      "Five readings near one billion millimetres, each panel labeled with a quadratic written around a round center.",
  },
  "scatter-bubble": {
    label: "Live bubble scatter",
    data: "/datasets/product-activity.csv",
    savedData: focus(bubbleDashboard, { "bubble-trials": [0, 0, 12] }),
    exampleId: "bubble-scatter",
    shotAlt: "Points sized by a value, so their areas compare.",
  },
  "bar-grouped": {
    label: "Live grouped bars",
    data: SHOP,
    savedData: focus(groupedBarsDashboard, { "grouped-revenue": [0, 0, 12] }),
    exampleId: "grouped-bars",
    shotAlt: "Revenue by region with one bar per channel side by side.",
  },
  "bar-stacked": {
    label: "Live stacked bars",
    data: SHOP,
    savedData: focus(stackedBarsDashboard, { "grouped-count": [0, 0, 12] }),
    exampleId: "stacked-bars",
    shotAlt: "Orders by category, each bar split into channel shares.",
  },
  "line-area": {
    label: "Live area chart",
    data: SHOP,
    savedData: focus(areaDashboard, { "time-weekly": [0, 0, 12] }),
    exampleId: "area-charts",
    shotAlt: "Weekly order counts as filled areas.",
  },
  facets: {
    label: "Live faceted scatter plot",
    data: "/datasets/palmer-penguins.csv",
    savedData: focus(scatterRegressionDashboard, {
      "fit-bill-sex": [0, 0, 12, 8],
    }),
    exampleId: "scatter-regression",
    shotAlt: "The same scatter plot repeated for each sex, with shared axes.",
  },
  "saved-filter": {
    label: "Live chart opened with a saved brush",
    data: "/lorenz_3d_small.csv",
    savedData: focus(lorenzSettings, {
      "5cc180fb-d35e-4249-a46c-cba04f13b6a8": [0, 0, 12, 5],
    }),
    exampleId: "lorenz-3d",
    shotAlt:
      "A scatter plot that opens with a rectangular brush already drawn.",
  },
  "recover-rows": {
    label: "Live workspace filtered to no rows",
    data: SHOP,
    savedData: emptySelectionDashboard,
    exampleId: "empty-selection",
    chrome: true,
    shotAlt:
      "Two row charts with no rows, and the Recover rows panel listing each filter with the rows it brings back.",
  },
  workspace: {
    label: "Live workspace tour",
    data: SHOP,
    savedData: focus(shopDashboard, {
      "shop-category": [0, 0, 6, 4],
      "shop-channel": [6, 0, 6, 4],
    }),
    exampleId: "shop-operations",
    chrome: true,
    shotAlt: "Two row charts with the workspace toolbar and row count.",
  },
  fields: {
    label: "Live field list",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-channel": [0, 0, 6, 4] }),
    exampleId: "shop-operations",
    chrome: true,
    shotAlt: "A row chart of sales channels beside the workspace toolbar.",
  },
  "category-mappings": {
    label: "Live category mapping",
    data: "/datasets/support-tickets.csv",
    savedData: focus(categoryMappingsDashboard, {
      "tickets-country": [0, 0, 6, 6],
      "tickets-country-group": [6, 0, 6, 6],
    }),
    exampleId: "category-mappings",
    shotAlt:
      "Two row charts of ticket countries: as typed, with USA, US, and U.S. apart, and mapped, with them merged into United States.",
  },
  "number-input": {
    label: "Live number input",
    data: "/datasets/supplier-invoices.csv",
    savedData: focus(supplierInvoicesDashboard, {
      "invoices-amount": [0, 0, 6, 5],
      "invoices-net": [6, 0, 6, 5],
    }),
    exampleId: "supplier-invoices",
    shotAlt:
      "Histograms of invoice amounts and of net amounts after discount, in euros; credit notes show as negative net amounts.",
  },
  calculations: {
    label: "Live calculated fields",
    data: "/datasets/scatter-trace.csv",
    savedData: focus(scatterTraceDashboard, { "trace-scatter": [0, 0, 12, 6] }),
    exampleId: "scatter-trace",
    chrome: true,
    shotAlt: "A scatter plot whose axes are calculated fields.",
  },
} satisfies Record<string, LiveExampleSpec>;

/**
 * Height that fits a layout's grid rows, plus the workspace toolbar and
 * status bar when the example keeps them. A loaded workspace sizes itself;
 * this holds its place while it loads.
 */
export function liveExampleHeight(spec: LiveExampleSpec) {
  if (spec.notebook !== undefined) {
    return spec.height;
  }
  if (spec.surface) {
    return 400;
  }
  const rows = Math.max(
    ...spec.savedData.charts.map(({ layout }) => layout.y + layout.h)
  );
  const { rowHeight, containerPadding } = spec.savedData.gridSettings;
  return rows * rowHeight + containerPadding * 2 + (spec.chrome ? 100 : 0);
}

export type LiveExampleId = keyof typeof liveExamples;

export function findLiveExample(id: string): LiveExampleSpec | undefined {
  return (liveExamples as Record<string, LiveExampleSpec>)[id];
}
