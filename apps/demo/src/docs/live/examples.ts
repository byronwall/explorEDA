import { boxPlotSettings } from "@/demos/boxPlotSettings";
import { categoricalChartSettings } from "@/demos/categoricalChartSettings";
import {
  activityDashboard,
  messageDashboard,
  penguinDashboard,
  pointMapDashboard,
  scatterMatrixDashboard,
  scatterTraceDashboard,
  shopDashboard,
  timeSeriesDashboard,
} from "@/demos/dashboardSettings";
import { demoSettings as lorenzSettings } from "@/demos/lorenz";
import type { SavedDataStructure } from "exploreda";

/**
 * One scripted step. The docs browser check runs a page's steps against its
 * live example, so a claim tied to a step fails the deploy when it stops
 * being true.
 */
export type LiveStep =
  /** Drag across a chart's numeric X axis from one value to another. */
  | { brush: { chart: string; from: number; to: number } }
  /** The workspace row count after the steps so far. */
  | { expectRows: number }
  /** A filter chip whose text contains this, after the steps so far. */
  | { expectChip: string }
  /** Pick an option in the select with this accessible label. */
  | { select: { label: string; option: string } }
  /** A mark whose accessible name is exactly this, after the steps so far. */
  | { expectMark: string }
  /** Click the mark whose accessible name is exactly this. */
  | { click: string }
  /** Text that shows in the example, after the steps so far. */
  | { expectText: string };

export type LiveExampleSpec = {
  /** The workspace region's accessible name. */
  label: string;
  /** A CSV under `public/`, such as `/datasets/shop-operations.csv`. */
  data: string;
  savedData: SavedDataStructure;
  /** The example to open in full, from `demos/examples.ts`. */
  exampleId: string;
  /** Alt text for the screenshot shown on narrow screens. */
  shotAlt: string;
  steps: readonly LiveStep[];
  /**
   * Shows one chart beside a real workspace surface instead of the whole
   * workspace. `chart` names the chart in `savedData`.
   */
  surface?: { kind: "settings"; chart: string };
};

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

const SHOP = "/datasets/shop-operations.csv";

export const liveExamples = {
  "bar-histogram": {
    label: "Live delivery-time histogram",
    data: "/datasets/shop-operations.csv",
    savedData: focus(shopDashboard, {
      "shop-delivery": [0, 0, 6, 5],
      "shop-channel": [6, 0, 6, 5],
    }),
    exampleId: "shop-operations",
    shotAlt:
      "A histogram of delivery days beside a bar chart of orders by sales channel.",
    steps: [
      { expectRows: 500 },
      { brush: { chart: "shop-delivery", from: 2, to: 4 } },
      { expectChip: "Delivery Days: 1.5–4.5" },
      { expectRows: 265 },
    ],
  },
  "settings-bar": {
    label: "Live chart settings for the delivery-time histogram",
    data: "/datasets/shop-operations.csv",
    savedData: focus(shopDashboard, { "shop-delivery": [0, 0, 6, 5] }),
    exampleId: "shop-operations",
    shotAlt:
      "The delivery-time histogram beside its settings panel, open on the Data tab.",
    surface: { kind: "settings", chart: "shop-delivery" },
    steps: [
      { select: { label: "Data mode", option: "Category count" } },
      { expectMark: "(missing): 9 records" },
    ],
  },
  scatter: {
    label: "Live scatter plot of net sales against contribution",
    data: "/datasets/scatter-trace.csv",
    savedData: focus(scatterTraceDashboard, {
      "trace-scatter": [0, 0, 12, 6],
      "trace-channel": [0, 6, 6, 4],
    }),
    exampleId: "scatter-trace",
    shotAlt:
      "Calculated net sales against contribution for 18 orders, beside orders by channel.",
    steps: [{ expectRows: 18 }, { click: "Online: 6 rows" }, { expectRows: 6 }],
  },
  row: {
    label: "Live category row chart",
    data: SHOP,
    savedData: focus(shopDashboard, {
      "shop-category": [0, 0, 6],
      "shop-region": [6, 0, 6],
    }),
    exampleId: "shop-operations",
    shotAlt: "Orders by product category beside revenue by region.",
    steps: [
      { expectRows: 500 },
      { click: "Home: 168 rows" },
      { expectChip: "Category" },
      { expectRows: 168 },
    ],
  },
  line: {
    label: "Live monthly revenue line chart",
    data: SHOP,
    savedData: focus(timeSeriesDashboard, { "time-revenue": [0, 0, 12] }),
    exampleId: "calendar-series",
    shotAlt: "Monthly revenue as one line per sales channel.",
    steps: [{ expectRows: 500 }],
  },
  boxplot: {
    label: "Live box plot",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-order": [0, 0, 12] }),
    exampleId: "shop-operations",
    shotAlt: "Order value by product category as box plots.",
    steps: [{ expectRows: 500 }],
  },
  "3d-scatter": {
    label: "Live 3D scatter plot",
    data: "/lorenz_3d_small.csv",
    savedData: focus(lorenzSettings, {
      "be9caf07-92eb-43ad-b3d5-4d3853c259c9": [0, 0, 12, 6],
    }),
    exampleId: "lorenz-3d",
    shotAlt: "Five Lorenz runs as colored points in a 3D scene.",
    steps: [{ expectRows: 1000 }],
  },
  pivot: {
    label: "Live pivot table",
    data: "/categorical_medium.csv",
    savedData: focus(categoricalChartSettings, {
      "7a345418-85b6-42d7-a86d-018cefe74d6e": [0, 0, 12],
    }),
    exampleId: "categorical-charts",
    shotAlt: "A pivot table of grouped measures.",
    steps: [
      { expectRows: 10000 },
      { click: "Filter Rating by 1" },
      { expectRows: 1967 },
    ],
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
    steps: [{ expectRows: 10000 }],
  },
  "data-table": {
    label: "Live data table",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-orders": [0, 0, 12, 5] }),
    exampleId: "shop-operations",
    shotAlt: "A table of orders with a distribution under each column name.",
    steps: [{ expectRows: 500 }],
  },
  summary: {
    label: "Live field summary table",
    data: "/correlated_medium.csv",
    savedData: focus(boxPlotSettings, {
      "2d71ef50-9f8f-4435-8577-99d84a24e28e": [0, 0, 12],
    }),
    exampleId: "box-plot",
    shotAlt: "A summary table with one row per field and its distribution.",
    steps: [{ expectRows: 10000 }],
  },
  "color-legend": {
    label: "Live color legend beside a box plot",
    data: "/correlated_medium.csv",
    savedData: focus(boxPlotSettings, {
      "0b8a3f5e-2c1d-4d9b-8f6e-3a7c9d2e4b15": [0, 0, 12, 2],
      "384f8bd5-0c6f-4997-86ef-822749431aff": [0, 2, 12],
    }),
    exampleId: "box-plot",
    shotAlt: "A color legend above box plots colored by the same scale.",
    steps: [{ expectRows: 10000 }],
  },
  markdown: {
    label: "Live notes panel",
    data: "/datasets/scatter-trace.csv",
    savedData: focus(scatterTraceDashboard, { "trace-guide": [0, 0, 12] }),
    exampleId: "scatter-trace",
    shotAlt: "A notes panel with formatted text that explains the analysis.",
    steps: [{ expectRows: 18 }],
  },
  sankey: {
    label: "Live sankey chart",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-flow": [0, 0, 12] }),
    exampleId: "shop-operations",
    shotAlt: "Orders flowing from channel to category to region.",
    steps: [
      { expectRows: 500 },
      { click: "Web to Home: 84 rows" },
      { expectRows: 84 },
    ],
  },
  "parallel-coordinates": {
    label: "Live parallel coordinates chart",
    data: "/datasets/palmer-penguins.csv",
    savedData: focus(penguinDashboard, { "penguin-profile": [0, 0, 12] }),
    exampleId: "palmer-penguins",
    shotAlt: "Each penguin as a line across bill, flipper, and mass axes.",
    steps: [{ expectRows: 344 }],
  },
  "scatter-matrix": {
    label: "Live scatter matrix",
    data: "/datasets/palmer-penguins.csv",
    savedData: focus(scatterMatrixDashboard, { "matrix-penguins": [0, 0, 12] }),
    exampleId: "scatter-matrix",
    shotAlt: "A grid of scatter plots for every pair of penguin measurements.",
    steps: [{ expectRows: 344 }],
  },
  calendar: {
    label: "Live calendar heatmap",
    data: SHOP,
    savedData: focus(timeSeriesDashboard, { "time-calendar": [0, 0, 12] }),
    exampleId: "calendar-series",
    shotAlt: "Daily order counts as a calendar of shaded day cells.",
    steps: [{ expectRows: 500 }],
  },
  heatmap: {
    label: "Live heatmap",
    data: SHOP,
    savedData: focus(shopDashboard, { "shop-category-region": [0, 0, 12] }),
    exampleId: "shop-operations",
    shotAlt: "Orders by category and region as shaded cells.",
    steps: [
      { expectRows: 500 },
      { click: "Home, East: $10,307.62" },
      { expectRows: 42 },
    ],
  },
  ecdf: {
    label: "Live ECDF chart",
    data: "/datasets/product-activity.csv",
    savedData: focus(activityDashboard, { "activity-speed-share": [0, 0, 12] }),
    exampleId: "product-activity",
    shotAlt: "Cumulative share curves of page speed.",
    steps: [{ expectRows: 90 }],
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
    steps: [{ expectRows: 500 }, { expectText: "$184,249.66" }],
  },
  map: {
    label: "Live point map",
    data: "/map-sites.csv",
    savedData: focus(pointMapDashboard, { "map-sites": [0, 0, 12] }),
    exampleId: "point-map",
    shotAlt: "Service sites as points on a world map.",
    steps: [{ expectRows: 30 }],
  },
  composition: {
    label: "Live composition",
    data: "/datasets/message-log.csv",
    savedData: focus(messageDashboard, { "messages-composition": [0, 0, 12] }),
    exampleId: "message-log",
    shotAlt: "A composed graphic built from the message log.",
    steps: [{ expectRows: 10376 }],
  },
} satisfies Record<string, LiveExampleSpec>;

/** Height that fits a layout's grid rows plus the workspace toolbar and count. */
export function liveExampleHeight(spec: LiveExampleSpec) {
  if (spec.surface) {
    return 400;
  }
  const rows = Math.max(
    ...spec.savedData.charts.map(({ layout }) => layout.y + layout.h)
  );
  const rowHeight = spec.savedData.gridSettings.rowHeight;
  return rows * (rowHeight + 10) + 70;
}

/** A step as an instruction for the reader. */
export function describeStep(spec: LiveExampleSpec, step: LiveStep): string {
  if ("brush" in step) {
    const chart = spec.savedData.charts.find(
      ({ id }) => id === step.brush.chart
    );
    return `Drag across “${chart?.title ?? step.brush.chart}” from ${step.brush.from} to ${step.brush.to}.`;
  }
  if ("select" in step) {
    return `Set “${step.select.label}” to “${step.select.option}”.`;
  }
  if ("expectText" in step) {
    return `It reads “${step.expectText}”.`;
  }
  if ("click" in step) {
    return `Click “${step.click}”.`;
  }
  if ("expectMark" in step) {
    return `A bar now reads “${step.expectMark}”.`;
  }
  if ("expectChip" in step) {
    return `The filter reads “${step.expectChip}”.`;
  }
  return `The workspace shows ${step.expectRows.toLocaleString("en-US")} rows.`;
}

export type LiveExampleId = keyof typeof liveExamples;

export function findLiveExample(id: string): LiveExampleSpec | undefined {
  return (liveExamples as Record<string, LiveExampleSpec>)[id];
}
