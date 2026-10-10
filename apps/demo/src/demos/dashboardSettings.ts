import { serviceDistricts } from "./regionMapGeometry";
import type { SavedDataStructure } from "exploreda";

type Chart = SavedDataStructure["charts"][number];
const palette = ["#3479a8", "#c77a45", "#4b9688", "#9c6eac", "#bd596a"];
const base = {
  field: "",
  colorField: undefined,
  colorScaleId: undefined,
  xAxis: { grid: false },
  yAxis: { grid: true },
  margin: { top: 16, right: 24, bottom: 44, left: 62 },
  facet: {
    enabled: false,
    type: "wrap" as const,
    rowVariable: "",
    columnCount: 2,
  },
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 5,
  yGridLines: 4,
  filters: [],
};
const layout = (x: number, y: number, w: number, h = 4) => ({ x, y, w, h });
const row = (
  id: string,
  title: string,
  field: string,
  position: ReturnType<typeof layout>,
  colorScaleId?: string
): Extract<Chart, { type: "row" }> => ({
  ...base,
  id,
  type: "row",
  title,
  field,
  layout: position,
  minRowHeight: 22,
  maxRowHeight: 36,
  xAxisLabel: "Records",
  xAxis: { grid: true },
  yAxis: { grid: false },
  colorField: colorScaleId ? field : undefined,
  colorScaleId,
});
const histogram = (
  id: string,
  title: string,
  field: string,
  position: ReturnType<typeof layout>,
  label = field
): Extract<Chart, { type: "bar" }> => ({
  ...base,
  id,
  type: "bar",
  title,
  field,
  layout: position,
  binCount: 20,
  xAxisLabel: label,
  yAxisLabel: "Records",
});
const scatter = (
  id: string,
  title: string,
  xField: string,
  yField: string,
  position: ReturnType<typeof layout>,
  labels: [string, string],
  colorField?: string,
  colorScaleId?: string
): Extract<Chart, { type: "scatter" }> => ({
  ...base,
  id,
  type: "scatter",
  title,
  xField,
  yField,
  layout: position,
  xAxisLabel: labels[0],
  yAxisLabel: labels[1],
  colorField,
  colorScaleId,
});
const box = (
  id: string,
  title: string,
  field: string,
  group: string,
  position: ReturnType<typeof layout>,
  colorScaleId?: string,
  label = field
): Extract<Chart, { type: "boxplot" }> => ({
  ...base,
  id,
  type: "boxplot",
  title,
  field,
  colorField: group,
  colorScaleId,
  layout: position,
  yAxisLabel: label,
  whiskerType: "tukey",
  showOutliers: true,
  violinOverlay: false,
  sortBy: "label",
  violinBandwidth: 0.3,
  autoBandwidth: true,
  styles: {
    boxFill: palette[0]!,
    boxStroke: palette[0]!,
    boxStrokeWidth: 0,
    medianStroke: "white",
    medianStrokeWidth: 2,
    whiskerStroke: palette[0]!,
    whiskerStrokeWidth: 1.5,
    outlierSize: 2,
    outlierStroke: palette[0]!,
    outlierFill: "none",
  },
});
const table = (
  id: string,
  title: string,
  fields: string[],
  position: ReturnType<typeof layout>
): Chart => ({
  ...base,
  id,
  type: "data-table",
  title,
  layout: position,
  columns: fields.map((field) => ({ id: field, field })),
  sortDirection: "asc",
  globalSearch: "",
});
const line = (
  id: string,
  title: string,
  fields: string[],
  position: ReturnType<typeof layout>,
  label: string
): Extract<Chart, { type: "line" }> => ({
  ...base,
  id,
  type: "line",
  title,
  layout: position,
  xField: "Day",
  seriesField: fields,
  xAxisLabel: "Day of study",
  yAxisLabel: label,
  seriesSettings: Object.fromEntries(
    fields.map((field, i) => [
      field,
      {
        showPoints: false,
        pointSize: 3,
        pointOpacity: 0.8,
        lineWidth: 2,
        lineOpacity: 1,
        lineColor: palette[i],
        lineStyle: "solid",
        useRightAxis: false,
      },
    ])
  ),
  styles: { curveType: "linear" },
  showXGrid: true,
  showYGrid: false,
  showLegend: fields.length > 1,
  legendPosition: "top",
});
const dashboard = (
  name: string,
  charts: Chart[],
  colorScales: SavedDataStructure["colorScales"] = []
): SavedDataStructure => ({
  charts,
  calculations: [],
  colorScales,
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: {
    name,
    version: 1,
    createdAt: "2026-09-16T00:00:00Z",
    modifiedAt: "2026-09-16T00:00:00Z",
  },
});
const categoricalScale = (
  id: string,
  name: string,
  labels: string[]
): SavedDataStructure["colorScales"][number] => ({
  id,
  name,
  sourceField: name,
  type: "categorical",
  palette,
  mapping: labels.map((label, i) => [label, palette[i % palette.length]!]),
});

export const penguinDashboard = dashboard(
  "Penguin field notes",
  [
    scatter(
      "penguin-size",
      "Body size & flipper length",
      "flipper_length_mm",
      "body_mass_g",
      layout(0, 0, 6, 5),
      ["Flipper length (mm)", "Body mass (g)"],
      "species",
      "species-colors"
    ),
    row(
      "penguin-species",
      "Species · shared color key",
      "species",
      layout(6, 0, 3, 5),
      "species-colors"
    ),
    row("penguin-island", "Sampling islands", "island", layout(9, 0, 3, 5)),
    scatter(
      "penguin-bill",
      "Bill shape separates species",
      "bill_length_mm",
      "bill_depth_mm",
      layout(0, 5, 4, 4),
      ["Bill length (mm)", "Bill depth (mm)"],
      "species",
      "species-colors"
    ),
    box(
      "penguin-mass",
      "Body mass by species",
      "body_mass_g",
      "species",
      layout(4, 5, 4, 4),
      "species-colors",
      "Body mass (g)"
    ),
    histogram(
      "penguin-flipper",
      "Flipper length distribution",
      "flipper_length_mm",
      layout(8, 5, 4, 4),
      "Flipper length (mm)"
    ),
    table(
      "penguin-records",
      "Selected observations",
      [
        "species",
        "island",
        "sex",
        "bill_length_mm",
        "bill_depth_mm",
        "flipper_length_mm",
        "body_mass_g",
        "year",
      ],
      layout(0, 9, 12, 5)
    ),
    {
      ...base,
      id: "penguin-profile",
      type: "parallel-coordinates",
      title: "Four measurements, one line per penguin",
      colorField: "species",
      colorScaleId: "species-colors",
      axes: [
        { field: "bill_length_mm", inverted: false },
        { field: "bill_depth_mm", inverted: false },
        { field: "flipper_length_mm", inverted: false },
        { field: "body_mass_g", inverted: false },
        { field: "island", inverted: false },
      ],
      lineOpacity: 0.45,
      lineWidth: 1.25,
      layout: layout(0, 14, 12, 6),
      margin: { top: 8, right: 8, bottom: 8, left: 8 },
    },
  ],
  [
    categoricalScale("species-colors", "species", [
      "Adelie",
      "Chinstrap",
      "Gentoo",
    ]),
  ]
);

export const shopDashboard = dashboard(
  "Inside the order book",
  [
    scatter(
      "shop-margin",
      "Revenue & margin per order",
      "Revenue",
      "Margin",
      layout(0, 0, 6, 5),
      ["Revenue ($)", "Margin ($)"],
      "Category",
      "category-colors"
    ),
    row(
      "shop-category",
      "Orders by category",
      "Category",
      layout(6, 0, 3, 5),
      "category-colors"
    ),
    row("shop-channel", "Sales channels", "Channel", layout(9, 0, 3, 5)),
    histogram(
      "shop-delivery",
      "How long does delivery take?",
      "Delivery Days",
      layout(0, 5, 4),
      "Delivery time (days)"
    ),
    box(
      "shop-order",
      "Order value by category",
      "Revenue",
      "Category",
      layout(4, 5, 4),
      "category-colors"
    ),
    {
      ...base,
      id: "shop-region",
      type: "bar",
      title: "Revenue by region",
      field: "Revenue",
      aggregateId: "revenue-by-region",
      layout: layout(8, 5, 4),
      xAxisLabel: "Region",
      yAxisLabel: "Revenue ($)",
    },
    table(
      "shop-orders",
      "Orders in this selection",
      [
        "Order Date",
        "Region",
        "Channel",
        "Category",
        "Product",
        "Revenue",
        "Margin",
        "Delivery Days",
        "Returned",
      ],
      layout(0, 9, 12, 5)
    ),
  ],
  [
    categoricalScale("category-colors", "Category", [
      "Home",
      "Outdoors",
      "Electronics",
      "Kitchen",
    ]),
  ]
);

export const activityDashboard = dashboard(
  "90 days of product activity",
  [
    line(
      "activity-traffic",
      "Daily active & returning visitors",
      ["Visitors", "Returning visitors"],
      layout(0, 0, 8, 5),
      "Visitors / day"
    ),
    row(
      "activity-weekday",
      "Days by release phase",
      "Phase",
      layout(8, 0, 4, 5),
      "phase-colors"
    ),
    line(
      "activity-conversion",
      "Trial conversion over time",
      ["Conversion (%)"],
      layout(0, 5, 4),
      "Conversion (%)"
    ),
    scatter(
      "activity-speed",
      "Does speed relate to conversion?",
      "Response time (ms)",
      "Conversion (%)",
      layout(4, 5, 4),
      ["Response time (ms)", "Conversion (%)"],
      "Phase",
      "phase-colors"
    ),
    histogram(
      "activity-latency",
      "Response time distribution",
      "Response time (ms)",
      layout(8, 5, 4),
      "Response time (ms)"
    ),
    box(
      "activity-distribution",
      "Conversion by release phase",
      "Conversion (%)",
      "Phase",
      layout(0, 9, 4, 5),
      "phase-colors"
    ),
    table(
      "activity-records",
      "Daily observations",
      [
        "Day",
        "Phase",
        "Visitors",
        "Returning visitors",
        "Trials",
        "Conversion (%)",
        "Response time (ms)",
      ],
      layout(4, 9, 8, 5)
    ),
    {
      ...base,
      id: "activity-speed-share",
      type: "ecdf",
      title: "How many days stay under a response time?",
      field: "Response time (ms)",
      colorField: "Phase",
      colorScaleId: "phase-colors",
      direction: "below",
      logX: false,
      showQuantiles: true,
      showOverall: false,
      layout: layout(0, 14, 12, 5),
      margin: { top: 8, right: 16, bottom: 8, left: 8 },
    },
  ],
  [
    categoricalScale("phase-colors", "Phase", [
      "Baseline",
      "Release",
      "Follow-up",
    ]),
  ]
);

export const bubbleDashboard: SavedDataStructure = {
  ...activityDashboard,
  metadata: {
    ...activityDashboard.metadata,
    name: "Trial volume, speed, and conversion",
  },
  charts: [
    {
      ...scatter(
        "bubble-trials",
        "Speed, conversion, and trial volume",
        "Response time (ms)",
        "Conversion (%)",
        layout(0, 0, 8, 6),
        ["Response time (ms)", "Conversion (%)"],
        "Phase",
        "phase-colors"
      ),
      sizeField: "Trials",
      maxBubbleRadius: 20,
      pointOpacity: 0.5,
    },
    {
      ...base,
      id: "bubble-total",
      type: "metric-card",
      title: "Trials in this selection",
      aggregation: "sum",
      measureField: "Trials",
      layout: layout(8, 0, 4, 2),
    },
    row(
      "bubble-phase",
      "Days by release phase",
      "Phase",
      layout(8, 2, 4, 4),
      "phase-colors"
    ),
    table(
      "bubble-records",
      "Daily observations",
      [
        "Day",
        "Phase",
        "Visitors",
        "Returning visitors",
        "Trials",
        "Conversion (%)",
        "Response time (ms)",
      ],
      layout(0, 6, 12, 5)
    ),
  ],
};

// Region bars sum revenue; clicking one selects that region everywhere.
const revenueByRegion: NonNullable<SavedDataStructure["aggregates"]> = [
  {
    id: "revenue-by-region",
    name: "Revenue by region",
    groupField: "Region",
    measureField: "Revenue",
    aggregation: "sum",
  },
];
shopDashboard.aggregates = revenueByRegion;

// Wide order values include genuine outliers; keep them visible without flattening the main population.
for (const chart of shopDashboard.charts) {
  if (chart.type === "scatter") {
    chart.xAxis = { ...chart.xAxis, scaleType: "symlog" };
    chart.yAxis = { ...chart.yAxis, scaleType: "symlog" };
  }
  if (chart.type === "boxplot") {
    chart.yAxis = { ...chart.yAxis, scaleType: "symlog" };
    chart.yAxisLabel = "Revenue ($)";
  }
}

export const largeShopDashboard = dashboard(
  "10,000 orders · 16 linked views",
  [
    ...shopDashboard.charts,
    histogram("large-units", "Units per order", "Units", layout(0, 14, 4)),
    histogram(
      "large-discount",
      "Discount distribution",
      "Discount",
      layout(4, 14, 4)
    ),
    row("large-returned", "Returned orders", "Returned", layout(8, 14, 4)),
    scatter(
      "large-volume",
      "Units & revenue",
      "Units",
      "Revenue",
      layout(0, 18, 6),
      ["Units", "Revenue ($)"]
    ),
    scatter(
      "large-cost",
      "Revenue & cost",
      "Revenue",
      "Cost",
      layout(6, 18, 6),
      ["Revenue ($)", "Cost ($)"]
    ),
    box(
      "large-margin",
      "Margin by category",
      "Margin",
      "Category",
      layout(0, 22, 6),
      "category-colors",
      "Margin ($)"
    ),
    row(
      "large-segment",
      "Customer segments",
      "Customer Segment",
      layout(6, 22, 6)
    ),
    {
      ...line(
        "large-trend",
        "Order values by region",
        ["Revenue"],
        layout(0, 26, 12, 5),
        "Revenue ($)"
      ),
      xField: "Order",
      xAxisLabel: "Order sequence",
      facet: {
        enabled: true,
        type: "wrap",
        rowVariable: "Region",
        columnCount: 2,
      },
    } as Chart,
    {
      ...base,
      id: "large-daily-revenue",
      type: "calendar",
      title: "Daily revenue through 2024",
      field: "Order Date",
      aggregation: "sum",
      measureField: "Revenue",
      weekStart: "monday",
      layout: layout(0, 31, 12, 4),
      margin: { top: 8, right: 16, bottom: 8, left: 8 },
    },
  ],
  shopDashboard.colorScales
);
largeShopDashboard.aggregates = revenueByRegion;

// Only the 500-order book gets the heatmap; the large book fills this row.
shopDashboard.charts.push({
  ...base,
  id: "shop-category-region",
  type: "heatmap",
  title: "Where does revenue come from?",
  field: "Category",
  columnField: "Region",
  aggregation: "sum",
  measureField: "Revenue",
  maxCategories: 20,
  sortBy: "count",
  showValues: true,
  layout: layout(0, 14, 6, 6),
  margin: { top: 8, right: 16, bottom: 8, left: 8 },
});

export const scatterTraceDashboard: SavedDataStructure = {
  ...dashboard(
    "Trace a scatter point",
    [
      {
        ...base,
        id: "trace-guide",
        type: "markdown",
        title: "Source to scatter glyph",
        layout: layout(0, 0, 12, 2),
        content:
          "<p>Use the chart-header trace icon, or Alt-click a point, chart title, axis object, color label, or facet label. Normal clicks keep brushing and filtering. Find a source row in the trace panel. Each point links raw values, calculations, filters, scales, and pixels. Rows T-006 and T-013 have missing numeric inputs.</p>",
      },
      {
        ...scatter(
          "trace-scatter",
          "Net sales to contribution",
          "Net sales",
          "Contribution",
          layout(0, 2, 9, 7),
          ["Net sales ($)", "Contribution ($)"],
          "Channel",
          "trace-channel-colors"
        ),
        xAxis: { grid: true },
        yAxis: { grid: true },
      },
      row("trace-channel", "Filter by channel", "Channel", layout(9, 2, 3, 7)),
      table(
        "trace-rows",
        "Source rows and calculated values",
        [
          "Order",
          "Units",
          "Unit Price",
          "Discount",
          "Cost",
          "Channel",
          "Gross sales",
          "Net sales",
          "Contribution",
        ],
        layout(0, 9, 12, 5)
      ),
    ],
    [
      categoricalScale("trace-channel-colors", "Channel", [
        "Online",
        "Store",
        "Partner",
      ]),
    ]
  ),
  calculations: [
    { resultColumnName: "Gross sales", expression: 'Units * ["Unit Price"]' },
    { resultColumnName: "Net sales", expression: '["Gross sales"] - Discount' },
    { resultColumnName: "Contribution", expression: '["Net sales"] - Cost' },
  ],
  fieldSettings: {
    Units: { type: "numeric" },
    "Unit Price": { type: "numeric" },
    Discount: { type: "numeric" },
    Cost: { type: "numeric" },
    "Net sales": { format: "currency", precision: 0 },
    Contribution: { format: "currency", precision: 0 },
  },
};

const orderCalculations = [
  [
    "Discount rate",
    "min(0.25, max(0, if Discount == null then 0 else Discount))",
  ],
  ["Gross sales", 'Units * ["Unit Price"]'],
  ["Discount amount", '["Gross sales"] * ["Discount rate"]'],
  ["Net sales", '["Gross sales"] - ["Discount amount"]'],
  ["Contribution", '["Net sales"] - Cost'],
  [
    "Contribution rate",
    'if ["Net sales"] > 0 then ["Contribution"] / ["Net sales"] * 100 else 0',
  ],
  ["Sales per unit", '["Net sales"] / max(1, Units)'],
  [
    "Order band",
    'if ["Net sales"] >= 500 then "Large" else if ["Net sales"] >= 100 then "Standard" else "Small"',
  ],
  [
    "Service score",
    '100 * avg(if Fulfilled then 1 else 0, if Returned then 0 else 1, if ["Delivery Days"] == null then 0 else if ["Delivery Days"] <= 5 then 1 else 0)',
  ],
  [
    "Risk points",
    'sum(if Returned then 10 else 0, if !Fulfilled then 5 else 0, if ["Delivery Days"] != null && ["Delivery Days"] > 7 then 2 else 0)',
  ],
  ["Needs review", '["Risk points"] >= 5 || ["Contribution"] < 0'],
  ["Order month", 'formatDate(["Order Date"], "%Y-%m")'],
  ["Order quarter", 'extractDateComponent(["Order Date"], "quarter")'],
  ["Target gap", 'max(0, 45 - ["Contribution rate"])'],
].map(([resultColumnName, expression]) => ({
  resultColumnName: resultColumnName!,
  expression: expression!,
}));

export const calculationDashboard: SavedDataStructure = {
  ...dashboard("From orders to contribution", [
    {
      ...base,
      id: "calc-guide",
      type: "markdown",
      title: "Follow a value from source to result",
      layout: layout(0, 0, 12, 2),
      content:
        "<p><strong>Gross sales → Discount amount → Net sales → Contribution.</strong> Hover an <strong>ƒx</strong> field to inspect its chain. In Discount rate, try a 10% cap, preview, then Apply.</p>",
    },
    {
      ...scatter(
        "calc-sales-contribution",
        "How much of each order remains?",
        "Net sales",
        "Contribution",
        layout(0, 2, 6, 5),
        ["Net sales ($)", "Contribution ($)"]
      ),
      xAxis: { scaleType: "symlog", grid: false },
      yAxis: { scaleType: "symlog", grid: true },
    },
    row("calc-order-band", "Orders by size", "Order band", layout(6, 2, 3, 5)),
    row(
      "calc-review",
      "Which orders need review?",
      "Needs review",
      layout(9, 2, 3, 5)
    ),
    histogram(
      "calc-rate",
      "Contribution as a share of sales",
      "Contribution rate",
      layout(0, 7, 4),
      "Contribution (%)"
    ),
    histogram(
      "calc-unit-sales",
      "Sales per unit",
      "Sales per unit",
      layout(4, 7, 4)
    ),
    histogram(
      "calc-discounts",
      "Discount amount per order",
      "Discount amount",
      layout(8, 7, 4)
    ),
    table(
      "calc-chain-table",
      "Trace the order calculation",
      [
        "Order",
        "Units",
        "Unit Price",
        "Gross sales",
        "Discount rate",
        "Discount amount",
        "Net sales",
        "Cost",
        "Contribution",
        "Contribution rate",
      ],
      layout(0, 11, 12, 5)
    ),
    row(
      "calc-service",
      "Service score: three checks",
      "Service score",
      layout(0, 16, 4)
    ),
    row("calc-risk", "Risk points by order", "Risk points", layout(4, 16, 4)),
    row(
      "calc-quarter",
      "Orders by UTC quarter",
      "Order quarter",
      layout(8, 16, 4)
    ),
    {
      ...line(
        "calc-quarter-sales",
        "Net sales across quarters",
        ["Net sales"],
        layout(0, 20, 8, 6),
        "Net sales"
      ),
      xField: "Order",
      xAxisLabel: "Order sequence",
      facet: {
        enabled: true,
        type: "wrap",
        rowVariable: "Order quarter",
        columnCount: 2,
      },
    },
    {
      ...base,
      id: "calc-monthly",
      type: "pivot",
      title: "Monthly sales and contribution",
      layout: layout(8, 20, 4, 6),
      rowFields: ["Order month"],
      columnField: "",
      valueFields: [
        { field: "Net sales", aggregation: "sum", label: "Net sales" },
        { field: "Contribution", aggregation: "sum", label: "Contribution" },
      ],
    },
    histogram(
      "calc-target",
      "Gap to 45% contribution target",
      "Target gap",
      layout(0, 26, 12),
      "Percentage points below target"
    ),
  ]),
  calculations: orderCalculations,
};

// Placed beside the revenue heatmap, which shares its row and height.
shopDashboard.charts.push({
  ...base,
  id: "shop-flow",
  type: "sankey",
  title: "Which channels and categories lead to returns?",
  stages: ["Channel", "Category", "Returned"],
  aggregation: "count",
  missingStages: "omit",
  maxNodesPerStage: 8,
  nodeOrder: "value",
  flowColor: "first",
  layout: layout(6, 14, 6, 6),
  margin: { top: 8, right: 12, bottom: 8, left: 12 },
});

// Add the metric row only to this example; the large order book keeps its layout.
shopDashboard.charts = [
  ...(
    [
      ["shop-count", "Matching orders", "count"],
      ["shop-revenue", "Revenue in this selection", "sum"],
      ["shop-average", "Average order value", "average"],
    ] as const
  ).map(
    ([id, title, aggregation], index): Chart => ({
      ...base,
      id,
      type: "metric-card",
      title,
      aggregation,
      measureField: aggregation === "count" ? undefined : "Revenue",
      layout: layout(index * 4, 0, 4, 2),
    })
  ),
  ...shopDashboard.charts.map((chart) => ({
    ...chart,
    layout: { ...chart.layout, y: chart.layout.y + 2 },
  })),
];
shopDashboard.fieldSettings = {
  ...shopDashboard.fieldSettings,
  Revenue: { format: "currency", currency: "USD", precision: 2 },
};

export const timeSeriesDashboard = dashboard(
  "Orders through the calendar",
  [
    {
      ...line(
        "time-revenue",
        "Monthly revenue by channel",
        [],
        layout(0, 0, 8, 6),
        "Revenue ($)"
      ),
      xField: "Order Date",
      xAxisLabel: "Order date · UTC",
      colorField: "Channel",
      colorScaleId: "time-channel",
      time: {
        interval: "month",
        weekStart: "monday",
        aggregation: "sum",
        measureField: "Revenue",
        splitField: "Channel",
        missingPeriods: "gap",
      },
    },
    {
      ...base,
      id: "time-count",
      type: "metric-card",
      title: "Matching orders",
      aggregation: "count",
      layout: layout(8, 0, 4, 2),
    },
    row(
      "time-channels",
      "Sales channels",
      "Channel",
      layout(8, 2, 4, 4),
      "time-channel"
    ),
    {
      ...line(
        "time-weekly",
        "Weekly order count",
        [],
        layout(0, 6, 6, 5),
        "Orders"
      ),
      xField: "Order Date",
      xAxisLabel: "Order date · UTC",
      time: {
        interval: "week",
        weekStart: "monday",
        aggregation: "count",
        missingPeriods: "zero",
      },
    },
    {
      ...base,
      id: "time-calendar",
      type: "calendar",
      title: "Daily orders",
      field: "Order Date",
      aggregation: "count",
      weekStart: "monday",
      layout: layout(6, 6, 6, 5),
    },
    table(
      "time-records",
      "Matching source records",
      ["Order Date", "Channel", "Revenue", "Region"],
      layout(0, 11, 12, 5)
    ),
  ],
  [categoricalScale("time-channel", "Channel", ["Web", "Store", "Wholesale"])]
);
timeSeriesDashboard.fieldSettings = {
  Revenue: {
    type: "numeric",
    format: "currency",
    currency: "USD",
    precision: 2,
  },
};

export const groupedBarsDashboard = dashboard(
  "Sales by region and channel",
  [
    {
      ...base,
      id: "grouped-revenue",
      type: "bar",
      title: "Revenue by region and channel",
      field: "Revenue",
      aggregateId: "grouped-sales",
      seriesField: "Channel",
      colorField: "Channel",
      colorScaleId: "grouped-channel",
      layout: layout(0, 0, 8, 6),
      yAxisLabel: "Revenue ($)",
    },
    {
      ...base,
      id: "grouped-total",
      type: "metric-card",
      title: "Matching revenue",
      aggregation: "sum",
      measureField: "Revenue",
      layout: layout(8, 0, 4, 2),
    },
    row(
      "grouped-categories",
      "Product categories",
      "Category",
      layout(8, 2, 4, 4)
    ),
    {
      ...base,
      id: "grouped-count",
      type: "bar",
      title: "Orders by category and channel",
      field: "Category",
      seriesField: "Channel",
      colorField: "Channel",
      colorScaleId: "grouped-channel",
      layout: layout(0, 6, 12, 5),
      yAxisLabel: "Orders",
    },
    table(
      "grouped-records",
      "Matching source records",
      ["Region", "Channel", "Category", "Revenue"],
      layout(0, 11, 12, 5)
    ),
  ],
  [
    categoricalScale("grouped-channel", "Channel", [
      "Web",
      "Store",
      "Wholesale",
    ]),
  ]
);
groupedBarsDashboard.aggregates = [
  {
    id: "grouped-sales",
    name: "Revenue by region",
    groupField: "Region",
    measureField: "Revenue",
    aggregation: "sum",
  },
];
groupedBarsDashboard.fieldSettings = {
  Revenue: {
    type: "numeric",
    format: "currency",
    currency: "USD",
    precision: 2,
  },
};

export const stackedBarsDashboard: SavedDataStructure = {
  ...groupedBarsDashboard,
  metadata: {
    ...groupedBarsDashboard.metadata,
    name: "Regional totals and channel shares",
  },
  charts: groupedBarsDashboard.charts.map((chart) =>
    chart.type === "bar"
      ? {
          ...chart,
          seriesLayout: chart.aggregateId ? "stacked" : "percent",
          title: chart.aggregateId
            ? "Regional revenue by channel"
            : "Channel share of regional orders",
          field: chart.aggregateId ? chart.field : "Region",
          yAxisLabel: chart.aggregateId
            ? "Revenue ($)"
            : "Share of regional orders (%)",
        }
      : chart
  ),
};

export const areaDashboard: SavedDataStructure = {
  ...timeSeriesDashboard,
  metadata: {
    ...timeSeriesDashboard.metadata,
    name: "Revenue layers through the year",
  },
  charts: timeSeriesDashboard.charts.map((chart) =>
    chart.type === "line" && chart.time
      ? {
          ...chart,
          title:
            chart.id === "time-revenue"
              ? "Monthly revenue layers"
              : "Weekly orders as an area",
          time: {
            ...chart.time,
            display: chart.id === "time-revenue" ? "stacked-area" : "area",
          },
        }
      : chart
  ),
};

export const densityDashboard = dashboard("Where daily observations cluster", [
  {
    ...scatter(
      "density-days",
      "Temperature and ice cream sales",
      "Temperature (°C)",
      "Ice Cream Sales",
      layout(0, 0, 8, 6),
      ["Temperature (°C)", "Ice cream sales"]
    ),
    display: "density",
    density: { xBins: 24, yBins: 20 },
  },
  {
    ...base,
    id: "density-count",
    type: "metric-card",
    title: "Days in this selection",
    aggregation: "count",
    layout: layout(8, 0, 4, 2),
  },
  histogram(
    "density-humidity",
    "Humidity of matching days",
    "Humidity (%)",
    layout(8, 2, 4, 4),
    "Humidity (%)"
  ),
  table(
    "density-records",
    "Daily source records",
    [
      "Temperature (°C)",
      "Ice Cream Sales",
      "Humidity (%)",
      "Beach Visitors",
      "Mood Index",
    ],
    layout(0, 6, 12, 5)
  ),
]);

export const pointMapDashboard = dashboard(
  "Where service requests originate",
  [
    {
      ...base,
      id: "map-sites",
      type: "map",
      mode: "point",
      title: "Service sites around the world",
      latitudeField: "Latitude",
      longitudeField: "Longitude",
      labelField: "Site",
      colorField: "Region",
      colorScaleId: "map-regions",
      sizeField: "Requests",
      pointRadius: 18,
      pointOpacity: 0.75,
      projection: "equal-earth",
      layout: layout(0, 0, 8, 7),
    },
    {
      ...base,
      id: "map-count",
      type: "metric-card",
      title: "Sites in this selection",
      aggregation: "count",
      layout: layout(8, 0, 4, 2),
    },
    {
      ...base,
      id: "map-regions",
      type: "bar",
      title: "Sites by region",
      field: "Region",
      layout: layout(8, 2, 4, 5),
      binCount: 20,
      yAxisLabel: "Sites",
    },
    table(
      "map-records",
      "Site source records",
      ["Site", "Latitude", "Longitude", "Region", "Requests"],
      layout(0, 7, 12, 5)
    ),
  ],
  [
    categoricalScale("map-regions", "Region", [
      "Americas",
      "Europe",
      "Africa",
      "Asia-Pacific",
    ]),
  ]
);

export const regionMapDashboard: SavedDataStructure = {
  ...dashboard("Requests across service districts", [
    {
      ...base,
      id: "district-map",
      type: "map",
      mode: "region",
      title: "Requests by service district",
      latitudeField: "",
      longitudeField: "",
      pointRadius: 6,
      pointOpacity: 0.8,
      projection: "equal-earth",
      view: { center: [-74.5, 41.5], zoom: 20 },
      geometryAssetId: "service-districts",
      regionField: "District",
      featureKey: "district",
      aggregation: "sum",
      measureField: "Requests",
      showRegionLabels: true,
      outlineWidth: 1,
      layout: layout(0, 0, 8, 7),
    },
    {
      ...base,
      id: "district-total",
      type: "metric-card",
      title: "Requests in this selection",
      aggregation: "sum",
      measureField: "Requests",
      layout: layout(8, 0, 4, 2),
    },
    {
      ...base,
      id: "district-pivot",
      type: "pivot",
      title: "Check the region totals",
      rowFields: ["District"],
      columnField: "",
      valueFields: [
        { field: "Requests", aggregation: "sum", label: "Requests" },
      ],
      layout: layout(8, 2, 4, 5),
    },
    table(
      "district-rows",
      "Request source records",
      ["District", "Team", "Requests"],
      layout(0, 7, 12, 4)
    ),
  ]),
  geometryAssets: [serviceDistricts],
  fieldSettings: { Requests: { type: "numeric" } },
};

export const distributionDashboard = dashboard(
  "Delivery times and smaller routes",
  [
    {
      ...histogram(
        "delivery-histogram",
        "Delivery time histogram",
        "Hours",
        layout(0, 0, 7, 5),
        "Delivery time (hours)"
      ),
      binCount: 12,
      forceString: false,
    },
    {
      ...row(
        "delivery-routes",
        "Shipments by route",
        "Route",
        layout(7, 0, 5, 5)
      ),
      minRowHeight: 36,
      maxRowHeight: 42,
    },
    {
      ...box(
        "delivery-distribution",
        "Delivery time by service",
        "Hours",
        "Service",
        layout(0, 5, 8, 6)
      ),
      violinOverlay: true,
      showObservations: true,
    },
    {
      ...base,
      id: "delivery-count",
      type: "metric-card",
      title: "Matching shipments",
      aggregation: "count",
      layout: layout(8, 5, 4, 2),
    },
    table(
      "delivery-records",
      "Shipment source records",
      ["Route", "Service", "Hours"],
      layout(8, 7, 4, 4)
    ),
  ]
);
distributionDashboard.fieldSettings = { Hours: { type: "numeric" } };

export const scatterRegressionDashboard = dashboard(
  "Bill shape within each species",
  [
    {
      ...scatter(
        "fit-bill",
        "Bill depth against bill length",
        "bill_length_mm",
        "bill_depth_mm",
        layout(0, 0, 7, 6),
        ["Bill length (mm)", "Bill depth (mm)"],
        "species",
        "fit-species"
      ),
      regression: { method: "linear", overall: true },
      summary: true,
      marginals: { bins: 24 },
    },
    {
      ...scatter(
        "fit-bill-sex",
        "The same fits for each sex",
        "bill_length_mm",
        "bill_depth_mm",
        layout(7, 0, 5, 6),
        ["Bill length (mm)", "Bill depth (mm)"],
        "species",
        "fit-species"
      ),
      regression: { method: "linear" },
      facet: {
        enabled: true,
        type: "wrap",
        rowVariable: "sex",
        columnCount: 1,
      },
    },
    row("fit-island", "Filter by island", "island", layout(0, 6, 3, 5)),
    {
      ...scatter(
        "fit-mass",
        "Body mass along flipper length · LOESS over density",
        "flipper_length_mm",
        "body_mass_g",
        layout(3, 6, 5, 5),
        ["Flipper length (mm)", "Body mass (g)"],
        "species",
        "fit-species"
      ),
      regression: { method: "loess", span: 0.6 },
      display: "contour",
      contour: { bandwidth: 0.75, levels: 5 },
    },
    {
      ...scatter(
        "fit-curve",
        "Flipper length along bill length · quadratic",
        "bill_length_mm",
        "flipper_length_mm",
        layout(8, 6, 4, 5),
        ["Bill length (mm)", "Flipper length (mm)"]
      ),
      regression: { method: "polynomial", degree: 2 },
    },
    table(
      "fit-records",
      "Penguins in the fits",
      [
        "species",
        "island",
        "sex",
        "bill_length_mm",
        "bill_depth_mm",
        "flipper_length_mm",
        "body_mass_g",
      ],
      layout(0, 11, 12, 4)
    ),
  ],
  [
    categoricalScale("fit-species", "species", [
      "Adelie",
      "Chinstrap",
      "Gentoo",
    ]),
  ]
);

export const scatterMatrixDashboard = dashboard(
  "Every pair at once",
  [
    {
      ...base,
      id: "matrix-penguins",
      type: "scatter-matrix",
      title: "Measurements, species, and sex, pair by pair",
      colorField: "species",
      colorScaleId: "matrix-species",
      fields: [
        "bill_length_mm",
        "flipper_length_mm",
        "body_mass_g",
        "species",
        "sex",
      ],
      lower: { numeric: "points", mixed: "points", categorical: "shares" },
      upper: { numeric: "correlation", mixed: "box", categorical: "tiles" },
      diagonal: { continuous: "density", categorical: "bars" },
      layout: layout(0, 0, 8, 10),
      margin: { top: 4, right: 4, bottom: 4, left: 4 },
    },
    row("matrix-island", "Filter by island", "island", layout(8, 0, 4, 4)),
    table(
      "matrix-records",
      "Penguins in the matrix",
      [
        "species",
        "island",
        "sex",
        "bill_length_mm",
        "flipper_length_mm",
        "body_mass_g",
      ],
      layout(8, 4, 4, 6)
    ),
  ],
  [
    categoricalScale("matrix-species", "species", [
      "Adelie",
      "Chinstrap",
      "Gentoo",
    ]),
  ]
);

export const scatterSurfaceDashboard = dashboard(
  "Ten thousand days, two ways to see density",
  [
    {
      ...scatter(
        "surface-hex",
        "Hexagonal counts",
        "Temperature (°C)",
        "Ice Cream Sales",
        layout(0, 0, 6, 6),
        ["Temperature (°C)", "Ice cream sales"]
      ),
      display: "hexbin",
      hexbin: { columns: 24 },
    },
    {
      ...scatter(
        "surface-kde",
        "Smoothed density with a linear fit",
        "Temperature (°C)",
        "Ice Cream Sales",
        layout(6, 0, 6, 6),
        ["Temperature (°C)", "Ice cream sales"]
      ),
      display: "contour",
      contour: { bandwidth: 1, levels: 6, showPoints: false },
      regression: { method: "linear" },
      summary: true,
    },
    histogram(
      "surface-humidity",
      "Filter by humidity",
      "Humidity (%)",
      layout(0, 6, 5, 4),
      "Humidity (%)"
    ),
    table(
      "surface-records",
      "Daily source records",
      ["Temperature (°C)", "Ice Cream Sales", "Humidity (%)", "Beach Visitors"],
      layout(5, 6, 7, 4)
    ),
  ]
);

const wineBands = ["Ordinary (3–5)", "Good (6)", "Excellent (7–8)"];

export const wineChemistryDashboard: SavedDataStructure = {
  ...dashboard(
    "What separates a good red wine",
    [
      {
        ...scatter(
          "wine-density",
          "Density falls as alcohol rises",
          "alcohol",
          "density",
          layout(0, 0, 7, 7),
          ["Alcohol (% vol)", "Density (g/cm³)"],
          "Quality band",
          "wine-bands"
        ),
        display: "contour",
        contour: { bandwidth: 0.8, levels: 6 },
        regression: { method: "loess", span: 0.7 },
        summary: true,
        marginals: { bins: 24 },
      },
      {
        ...scatter(
          "wine-acid",
          "More fixed acid, lower pH",
          "fixed acidity",
          "pH",
          layout(7, 0, 5, 7),
          ["Fixed acidity (g/L)", "pH"]
        ),
        display: "hexbin",
        hexbin: { columns: 18 },
        regression: { method: "linear" },
        summary: true,
      },
      {
        ...scatter(
          "wine-volatile",
          "Volatile acidity and alcohol in each quality band",
          "volatile acidity",
          "alcohol",
          layout(0, 7, 8, 5),
          ["Volatile acidity (g/L)", "Alcohol (% vol)"],
          "Quality band",
          "wine-bands"
        ),
        regression: { method: "linear" },
        facet: {
          enabled: true,
          type: "wrap",
          rowVariable: "Quality band",
          columnCount: 3,
        },
      },
      {
        ...row(
          "wine-quality",
          "Filter by quality band",
          "Quality band",
          layout(8, 7, 4, 5),
          "wine-bands"
        ),
        minRowHeight: 28,
        maxRowHeight: 40,
      },
      table(
        "wine-records",
        "Wines in view",
        [
          "Quality band",
          "quality",
          "alcohol",
          "density",
          "volatile acidity",
          "fixed acidity",
          "pH",
        ],
        layout(0, 12, 12, 4)
      ),
    ],
    [categoricalScale("wine-bands", "Quality band", wineBands)]
  ),
  calculations: [
    {
      resultColumnName: "Quality band",
      expression: `if quality <= 5 then "${wineBands[0]}" else if quality == 6 then "${wineBands[1]}" else "${wineBands[2]}"`,
    },
  ],
};

// A blank artboard beside the linked views it can draw from, so the
// composition is authored from scratch.
export const messageDashboard = dashboard("Message log", [
  {
    ...base,
    id: "messages-composition",
    type: "composition",
    title: "Report graphic",
    layout: layout(0, 0, 12, 7),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 600, background: "#ffffff" },
      elements: [],
      scales: [],
      calculations: [],
      overrides: [],
    },
  },
  {
    ...line(
      "messages-monthly",
      "Messages per month",
      [],
      layout(0, 7, 8, 4),
      "Messages"
    ),
    xField: "Date",
    xAxisLabel: "Month · UTC",
    time: {
      interval: "month",
      weekStart: "monday",
      aggregation: "count",
      missingPeriods: "zero",
    },
  },
  row(
    "messages-direction",
    "Sent or received",
    "Direction",
    layout(8, 7, 4, 4)
  ),
  row(
    "messages-correspondents",
    "Messages by correspondent",
    "Correspondent",
    layout(0, 11, 4, 6)
  ),
  histogram(
    "messages-words",
    "Words per message",
    "Words",
    layout(4, 11, 3, 6)
  ),
  table(
    "messages-records",
    "Messages",
    ["Date", "Correspondent", "Role", "Direction", "Words"],
    layout(7, 11, 5, 6)
  ),
]);

/**
 * Driving shifts into reverse: a connected scatterplot. The composition's
 * path orders 55 shuffled rows by Year through numeric Miles and Gas scales,
 * with labeled points, a calculated guide, and callouts that follow years.
 */
export const drivingDashboard = dashboard("Driving", [
  {
    ...base,
    id: "driving-composition",
    type: "composition",
    title: "Driving shifts into reverse",
    layout: layout(0, 0, 12, 8),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 600, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Miles driven per person",
          field: "Miles",
          domain: "shared",
          zero: false,
          nice: true,
        },
        {
          id: "n-2",
          kind: "numeric",
          name: "Gas price",
          field: "Gas",
          domain: "shared",
          zero: false,
          nice: true,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Average miles",
          aggregation: "average",
          field: "Miles",
          population: "composition",
          filters: "ignore",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Driving shifts into reverse",
          x: 32,
          y: 28,
          width: 896,
          fontSize: 26,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Miles driven per person each year against the inflation-adjusted price of a gallon of gas, 1956–2010. The line follows the years.",
          x: 32,
          y: 64,
          width: 896,
          fontSize: 15,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Years",
          x: 96,
          y: 112,
          frame: { width: 824, height: 400 },
          label: { show: false, width: 0, fontSize: 12 },
          axis: true,
          marks: [
            {
              type: "path",
              id: "mark-1",
              name: "Path",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Year",
              stroke: "#1f2328",
              strokeWidth: 1.5,
            },
            {
              type: "point",
              id: "mark-2",
              name: "Points",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Year",
              radius: 3.5,
              fill: "#1f2328",
              labelField: "Year",
              labelEvery: 4,
            },
          ],
          repeat: {
            arrangement: "rows",
            columns: 3,
            gap: 6,
            order: "count",
            limit: 24,
          },
        },
        {
          id: "guide-1",
          kind: "guide",
          name: "Average miles",
          x: 6,
          y: -40,
          unitId: "unit-1",
          value: { kind: "calc", calcId: "calc-1" },
          label: "Average {value} miles a year",
          color: "#8a6d3b",
        },
        {
          id: "note-1",
          kind: "annotation",
          name: "2008 peak",
          text: "{label}: gas peaks at ${y} a gallon\nand driving falls for the first time",
          x: -230,
          y: -34,
          anchor: {
            kind: "data",
            unitId: "unit-1",
            instanceKey: "all",
            markId: "mark-2",
            pick: "at",
            at: "2008",
          },
          fontSize: 12,
          color: "#a3241d",
          leader: true,
        },
        {
          id: "note-2",
          kind: "annotation",
          name: "1980 shock",
          text: "{label}: the oil shock sends gas to ${y}\nwhile miles stall",
          x: 22,
          y: 18,
          anchor: {
            kind: "data",
            unitId: "unit-1",
            instanceKey: "all",
            markId: "mark-2",
            pick: "at",
            at: "1980",
          },
          fontSize: 12,
          color: "#1f4e8c",
          leader: true,
        },
        {
          id: "note-3",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: vega-datasets driving.json, after Hannah Fairfield, The New York Times (2010). Miles per person from the FHWA; gas price per gallon from the EIA, adjusted for inflation.",
          x: 32,
          y: 566,
          width: 896,
          fontSize: 11,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  scatter(
    "driving-scatter",
    "Gas against miles",
    "Miles",
    "Gas",
    layout(0, 8, 6, 5),
    ["Miles per person", "Gas, $ per gallon"]
  ),
  histogram("driving-years", "Years", "Year", layout(6, 8, 6, 5)),
  table(
    "driving-rows",
    "Years",
    ["Year", "Miles", "Gas"],
    layout(0, 13, 12, 5)
  ),
]);

/**
 * Big-tech sparklines: a table of 14 company rows, each a path through its
 * opening prices with the low, high, and latest prices marked. Rows order by
 * a first-to-last change calculation, which also prints beside each name.
 */
export const sparklinesDashboard = dashboard("Big tech", [
  {
    ...base,
    id: "sparklines-composition",
    type: "composition",
    title: "Big-tech opening prices",
    layout: layout(0, 0, 12, 9),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 760, height: 740, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Observation",
          field: "Observation",
          domain: "instance",
          zero: false,
          nice: false,
        },
        {
          id: "n-2",
          kind: "numeric",
          name: "Opening price",
          field: "Open",
          domain: "shared",
          zero: true,
          nice: false,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Change",
          aggregation: "change",
          field: "Open",
          orderField: "Date",
          population: "repeat",
          filters: "ignore",
        },
        {
          id: "calc-2",
          name: "Highest open",
          aggregation: "max",
          field: "Open",
          population: "composition",
          filters: "ignore",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Big-tech opening prices, 2010–2023",
          x: 32,
          y: 28,
          width: 696,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Each line follows one company's opening price on one shared dollar scale. Rows sort by the change from first to last day; purple marks the low, green the high, black the latest.",
          x: 32,
          y: 62,
          width: 696,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Companies",
          x: 32,
          y: 118,
          frame: { width: 420, height: 26 },
          label: {
            show: true,
            width: 260,
            fontSize: 12,
            valueCalcId: "calc-1",
          },
          axis: false,
          marks: [
            {
              type: "path",
              id: "mark-1",
              name: "Price line",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              stroke: "#1f2328",
              strokeWidth: 1,
            },
            {
              type: "point",
              id: "mark-2",
              name: "Low",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              radius: 3,
              fill: "#7b4ea3",
              labelEvery: 0,
              show: "min",
            },
            {
              type: "point",
              id: "mark-3",
              name: "High",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              radius: 3,
              fill: "#2f8f5b",
              labelEvery: 0,
              show: "max",
            },
            {
              type: "point",
              id: "mark-4",
              name: "Latest",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              radius: 2.5,
              fill: "#1f2328",
              labelField: "Open",
              labelEvery: 1,
              show: "last",
            },
          ],
          repeat: {
            field: "Company",
            arrangement: "rows",
            columns: 1,
            gap: 12,
            order: "value",
            orderCalcId: "calc-1",
            direction: "asc",
            limit: 24,
          },
        },
        {
          id: "note-1",
          kind: "annotation",
          name: "Shared scale",
          text: "Every row shares one split-adjusted dollar scale, from $0 to the highest opening price of ${Highest open}.",
          x: 32,
          y: 664,
          anchor: { kind: "page" },
          fontSize: 11,
          color: "#5f6368",
          leader: false,
        },
        {
          id: "note-2",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: TidyTuesday 2023-02-07, big tech stock prices (Yahoo Finance via Kaggle). Every fifth trading day plus each company's first and last day. After Albert Rapp's gt sparkline table.",
          x: 32,
          y: 706,
          width: 696,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  {
    ...line(
      "sparklines-prices",
      "Opening price by date",
      ["Open"],
      layout(0, 9, 8, 5),
      "Open, $"
    ),
    xField: "Date",
    xAxisLabel: "Date",
    time: {
      interval: "month",
      weekStart: "monday",
      aggregation: "average",
      measureField: "Open",
      missingPeriods: "gap",
    },
  },
  row("sparklines-companies", "Rows by company", "Company", layout(8, 9, 4, 5)),
  table(
    "sparklines-rows",
    "Prices",
    ["Company", "Date", "Observation", "Open"],
    layout(0, 14, 12, 5)
  ),
]);

const fanBand = (
  id: string,
  name: string,
  lowerField: string,
  upperField: string,
  opacity: number
) => ({
  type: "band" as const,
  id,
  name,
  xScaleId: "n-1",
  yScaleId: "n-2",
  orderField: "Year",
  lowerField,
  upperField,
  fill: "#1f4e8c",
  opacity,
});

/**
 * Forecast fan: two measure panels, each with four nested percentile bands
 * from supplied interval columns, a central path, a shaded projection
 * period, and a horizontal reference guide. Illustrative data.
 */
export const fanDashboard = dashboard("Forecast fan", [
  {
    ...base,
    id: "fan-composition",
    type: "composition",
    title: "Forecast fan",
    layout: layout(0, 0, 12, 7),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 540, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Year",
          field: "Year",
          domain: "shared",
          zero: false,
          nice: false,
        },
        {
          id: "n-2",
          kind: "numeric",
          name: "Percent",
          field: "Central",
          domain: "instance",
          zero: true,
          nice: true,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Latest central",
          aggregation: "last",
          field: "Central",
          orderField: "Year",
          population: "repeat",
          filters: "follow",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Two measures, three years ahead",
          x: 32,
          y: 28,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Quarterly history, then projections from 2025 with 20%, 40%, 60%, and 80% intervals around the central path. Illustrative figures; each panel keeps its own scale.",
          x: 32,
          y: 62,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Measures",
          x: 72,
          y: 110,
          frame: { width: 380, height: 300 },
          label: { show: true, width: 0, fontSize: 13, valueCalcId: "calc-1" },
          axis: true,
          marks: [
            fanBand("mark-1", "80% interval", "P10", "P90", 0.12),
            fanBand("mark-2", "60% interval", "P20", "P80", 0.16),
            fanBand("mark-3", "40% interval", "P30", "P70", 0.2),
            fanBand("mark-4", "20% interval", "P40", "P60", 0.26),
            {
              type: "path",
              id: "mark-5",
              name: "Central",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Year",
              stroke: "#1f2328",
              strokeWidth: 1.5,
            },
          ],
          repeat: {
            field: "Measure",
            arrangement: "columns",
            columns: 2,
            gap: 72,
            order: "label",
            limit: 24,
          },
        },
        {
          id: "guide-1",
          kind: "guide",
          name: "Projection",
          x: 4,
          y: -318,
          unitId: "unit-1",
          value: { kind: "constant", value: "2025" },
          label: "Projection",
          color: "#8a6d3b",
          shade: "after",
        },
        {
          id: "guide-2",
          kind: "guide",
          name: "2% reference",
          x: 4,
          y: 0,
          unitId: "unit-1",
          value: { kind: "constant", value: "2" },
          label: "2%",
          color: "#a3241d",
          axis: "y",
        },
        {
          id: "note-1",
          kind: "annotation",
          name: "How to read",
          text: "The darkest band holds the middle 20% of outcomes; the lightest, 80%.",
          x: 72,
          y: 452,
          anchor: { kind: "page" },
          fontSize: 11,
          color: "#5f6368",
          leader: false,
        },
        {
          id: "note-2",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Illustrative data generated for this demo: supplied percentile columns, not a forecast model. The layout follows central-bank fan charts.",
          x: 32,
          y: 506,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  {
    ...line(
      "fan-central",
      "Central path by quarter",
      ["Central"],
      layout(0, 7, 8, 5),
      "Percent"
    ),
    xField: "Year",
    xAxisLabel: "Year",
  },
  row("fan-kind", "History or projection", "Kind", layout(8, 7, 4, 5)),
  table(
    "fan-rows",
    "Quarters",
    ["Measure", "Period", "Kind", "Central", "P10", "P90"],
    layout(0, 12, 12, 5)
  ),
]);

/**
 * Time use, 2019 against 2020: a grid of activities. In each, a summary
 * mark draws the quartiles of minutes per day for the two cohorts as a
 * joined band, marks the medians, and colors them by the change in median
 * through a diverging scale.
 */
export const timeUseDashboard = dashboard("Time use", [
  {
    ...base,
    id: "time-use-composition",
    type: "composition",
    title: "How the day changed",
    layout: layout(0, 0, 12, 8),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 640, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Minutes a day",
          field: "Minutes",
          domain: "instance",
          zero: false,
          nice: true,
        },
        {
          id: "value-1",
          kind: "value",
          name: "Change in median",
          domain: "shared",
          transform: "sqrt",
          colors: ["#2b6cb0", "#c2410c"],
          center: "#b8bcc2",
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Diary entries",
          aggregation: "count",
          population: "repeat",
          filters: "follow",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "How the day changed in 2020",
          x: 32,
          y: 26,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Minutes a day for people who did each activity: the band spans the middle half of respondents, the dot marks the median, 2019 then 2020. Orange rose, blue fell; each panel keeps its own minute scale.",
          x: 32,
          y: 58,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Activities",
          x: 56,
          y: 112,
          frame: { width: 124, height: 88 },
          label: { show: true, width: 0, fontSize: 12, valueCalcId: "calc-1" },
          axis: true,
          marks: [
            {
              type: "summary",
              id: "mark-1",
              name: "Minutes a day",
              groupField: "Year",
              measureField: "Minutes",
              yScaleId: "n-1",
              valueScaleId: "value-1",
              fill: "#d9dde3",
              opacity: 0.7,
            },
          ],
          repeat: {
            field: "Activity",
            arrangement: "grid",
            columns: 4,
            gap: 40,
            order: "label",
            limit: 24,
          },
        },
        {
          id: "note-1",
          kind: "annotation",
          name: "Reading note",
          text: "Each label counts that activity's diary entries after the active filters. Respondents who skipped an activity have no entry.",
          x: 56,
          y: 586,
          anchor: { kind: "page" },
          fontSize: 11,
          color: "#5f6368",
          leader: false,
        },
        {
          id: "note-2",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Illustrative diary generated for this demo: 400 respondents a year, unweighted quartiles, not survey estimates. After Nathan Yau's time-use comparison.",
          x: 32,
          y: 612,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  box(
    "time-use-box",
    "Minutes by year",
    "Minutes",
    "Year",
    layout(0, 8, 6, 5),
    undefined,
    "Minutes a day"
  ),
  row("time-use-age", "Age group", "Age group", layout(6, 8, 3, 5)),
  row("time-use-weekday", "Day", "Weekday", layout(9, 8, 3, 5)),
  table(
    "time-use-rows",
    "Diary entries",
    ["Year", "Activity", "Respondent", "Age group", "Weekday", "Minutes"],
    layout(0, 13, 12, 5)
  ),
]);

/**
 * Deaths against media coverage: four normalized columns. Each stacks the
 * fifteen causes as shares of that source's total, in one order and color
 * across the columns, so the mortality column reads against the three
 * outlets. Real 2023 figures from Our World in Data.
 */
export const mediaDeathsDashboard = dashboard("Media and deaths", [
  {
    ...base,
    id: "media-deaths-composition",
    type: "composition",
    title: "What Americans die from, and what the news covers",
    layout: layout(0, 0, 12, 9),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 720, background: "#ffffff" },
      scales: [],
      calculations: [
        {
          id: "calc-1",
          name: "Total",
          aggregation: "sum",
          field: "Count",
          population: "repeat",
          filters: "follow",
        },
      ],
      overrides: [
        {
          unitId: "unit-1",
          instanceKey: "Deaths",
          dx: -40,
          dy: 0,
          emphasize: true,
        },
      ],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "What Americans die from, and what the news covers",
          x: 32,
          y: 26,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Each column stacks fifteen causes of death as shares of its own total: deaths in 2023 on the left, then articles that discussed each cause in three outlets. Homicide and terrorism fill the news; heart disease and cancer fill the death certificates.",
          x: 32,
          y: 58,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Sources",
          x: 108,
          y: 128,
          frame: { width: 150, height: 500 },
          label: { show: true, width: 0, fontSize: 12, valueCalcId: "calc-1" },
          axis: true,
          marks: [
            {
              type: "stack",
              id: "mark-1",
              name: "Share of total",
              categoryField: "Cause",
              aggregation: "sum",
              measureField: "Count",
              normalize: true,
              order: "total",
              colors: [
                "#4e79a7",
                "#f28e2b",
                "#e15759",
                "#76b7b2",
                "#59a14f",
                "#edc948",
                "#b07aa1",
                "#ff9da7",
                "#9c755f",
                "#bab0ac",
                "#1f77b4",
                "#8c564b",
                "#17becf",
                "#bcbd22",
                "#7f7f7f",
              ],
              labelMinHeight: 13,
              inset: 1.5,
            },
          ],
          repeat: {
            field: "Source",
            arrangement: "columns",
            columns: 4,
            gap: 56,
            order: "label",
            limit: 24,
          },
        },
        {
          id: "note-1",
          kind: "annotation",
          name: "Denominators",
          text: "Deaths are deaths from these fifteen causes, not all deaths. Articles count pieces that mention a cause several times, not every story.",
          x: 120,
          y: 652,
          anchor: { kind: "page" },
          fontSize: 11,
          color: "#5f6368",
          leader: false,
        },
        {
          id: "note-2",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: Our World in Data, media deaths analysis (CC BY). Deaths from the CDC; articles from Media Cloud, 2023. Accidents exclude drug overdoses. After the Our World in Data graphic.",
          x: 32,
          y: 692,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  row("media-deaths-causes", "Rows by cause", "Cause", layout(0, 9, 6, 6)),
  row("media-deaths-sources", "Rows by source", "Source", layout(6, 9, 6, 6)),
  table(
    "media-deaths-rows",
    "Counts",
    ["Source", "Cause", "Measure", "Count"],
    layout(0, 15, 12, 5)
  ),
]);

/**
 * Measles before and after the vaccine: 51 state strips in the publisher's
 * order, one cell per year colored by a placed multistop ramp, with not
 * reported years drawn as neutral cells and a fixed 1963 guide.
 */
export const measlesDashboard = dashboard("Measles", [
  {
    ...base,
    id: "measles-composition",
    type: "composition",
    title: "Measles",
    layout: layout(0, 0, 12, 9),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 900, height: 760, background: "#ffffff" },
      scales: [
        {
          id: "x-1",
          kind: "position",
          name: "Year",
          field: "Year",
          domain: "shared",
        },
        {
          id: "value-1",
          kind: "value",
          name: "Cases per 100,000",
          domain: "shared",
          transform: "linear",
          colors: [
            "#e7f0fa",
            "#c9e2f6",
            "#95cbee",
            "#0099dc",
            "#4ab04a",
            "#ffd73e",
            "#eec73a",
            "#e29421",
            "#e29421",
            "#f05336",
            "#ce472e",
          ],
          stops: [0, 0.01, 0.02, 0.03, 0.09, 0.1, 0.15, 0.25, 0.4, 0.5, 1],
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Row order",
          aggregation: "max",
          field: "Order",
          population: "repeat",
          filters: "ignore",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Measles",
          x: 32,
          y: 24,
          width: 836,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Reported cases per 100,000 people, by state and year. Grey cells are years a state did not report. The ramp climbs quickly: pale blue is under 30 cases, green about 270, and red 1,500 and above.",
          x: 32,
          y: 56,
          width: 836,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "States",
          x: 32,
          y: 104,
          frame: { width: 776, height: 10 },
          label: { show: true, width: 60, fontSize: 9 },
          axis: true,
          marks: [
            {
              type: "strip",
              id: "mark-1",
              name: "Cells",
              shape: "rect",
              positionScaleId: "x-1",
              valueScaleId: "value-1",
              aggregation: "average",
              measureField: "Rate",
              encoding: "color",
              fill: "#1f2328",
              inset: 1,
              missing: "#e6e8eb",
            },
          ],
          repeat: {
            field: "Label",
            arrangement: "rows",
            columns: 1,
            gap: 1,
            order: "value",
            orderCalcId: "calc-1",
            direction: "asc",
            limit: 60,
          },
        },
        {
          id: "guide-1",
          kind: "guide",
          name: "Vaccine",
          x: 4,
          y: -610,
          unitId: "unit-1",
          value: { kind: "constant", value: "1963" },
          label: "Vaccine introduced",
          color: "#1f2328",
        },
        {
          id: "note-1",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: The Wall Street Journal, Battling Infectious Diseases in the 20th Century (2015), from Project Tycho and CDC data. CDC data from 2003 to 2012 counts confirmed cases yearly rather than provisional cases weekly. Alaska's 2003 cell has no record and stays blank.",
          x: 32,
          y: 722,
          width: 836,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  {
    ...line(
      "measles-years",
      "Average rate by year",
      ["Rate"],
      layout(0, 9, 8, 5),
      "Cases per 100,000"
    ),
    xField: "Year",
    xAxisLabel: "Year",
  },
  row("measles-status", "Cell status", "Status", layout(8, 9, 4, 5)),
  table(
    "measles-rows",
    "Cells",
    ["State", "Year", "Rate", "Status"],
    layout(0, 14, 12, 5)
  ),
]);

/**
 * Causes of death by age: one stack spread across age. Each cause draws as
 * an area of its share of that age's total, labeled where it is thickest.
 * Illustrative counts.
 */
export const causesByAgeDashboard = dashboard("Causes by age", [
  {
    ...base,
    id: "causes-composition",
    type: "composition",
    title: "What people die from, by age",
    layout: layout(0, 0, 12, 8),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 600, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Age",
          field: "Age",
          domain: "shared",
          zero: true,
          nice: false,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Deaths",
          aggregation: "sum",
          field: "Count",
          population: "composition",
          filters: "follow",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "What people die from, by age",
          x: 32,
          y: 26,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Each band is one cause's share of deaths at that age, from birth to 100. Shares at every age add to 100%; {Deaths} deaths in all after the active filters.",
          x: 32,
          y: 58,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Ages",
          x: 72,
          y: 110,
          frame: { width: 848, height: 400 },
          label: { show: false, width: 0, fontSize: 12 },
          axis: true,
          marks: [
            {
              type: "stack",
              id: "mark-1",
              name: "Share of deaths",
              categoryField: "Cause",
              aggregation: "sum",
              measureField: "Count",
              normalize: true,
              order: "total",
              colors: [
                "#4e79a7",
                "#f28e2b",
                "#76b7b2",
                "#e15759",
                "#59a14f",
                "#edc948",
                "#b07aa1",
                "#9c755f",
                "#bab0ac",
              ],
              labelMinHeight: 14,
              inset: 0,
              xScaleId: "n-1",
            },
          ],
          repeat: {
            arrangement: "rows",
            columns: 1,
            gap: 0,
            order: "label",
            limit: 1,
          },
        },
        {
          id: "guide-1",
          kind: "guide",
          name: "Retirement",
          x: 4,
          y: -416,
          unitId: "unit-1",
          value: { kind: "constant", value: "65" },
          label: "65",
          color: "#5f6368",
        },
        {
          id: "note-1",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Illustrative counts generated for this demo; they describe no real population. After Nathan Yau's Causes of Death.",
          x: 32,
          y: 566,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  row("causes-list", "Rows by cause", "Cause", layout(0, 8, 4, 6)),
  histogram("causes-ages", "Ages", "Age", layout(4, 8, 8, 6)),
  table(
    "causes-rows",
    "Counts",
    ["Age", "Cause", "Count"],
    layout(0, 14, 12, 5)
  ),
]);

/**
 * Consumer confidence around the world: a 3 × 3 grid. Every panel draws all
 * nine countries' paths on one shared scale and lights up its own, with the
 * latest value marked and labeled and a 100 reference line.
 */
export const consumerConfidenceDashboard = dashboard("Consumer confidence", [
  {
    ...base,
    id: "confidence-composition",
    type: "composition",
    title: "Consumer confidence around the world",
    layout: layout(0, 0, 12, 9),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 760, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Month",
          field: "Month",
          domain: "shared",
          zero: false,
          nice: false,
        },
        {
          id: "n-2",
          kind: "numeric",
          name: "Index",
          field: "Index",
          domain: "shared",
          zero: false,
          nice: true,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Latest",
          aggregation: "last",
          field: "Index",
          orderField: "Month",
          population: "repeat",
          filters: "follow",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Consumer confidence around the world",
          x: 32,
          y: 26,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "OECD consumer confidence index, monthly from July 2018 to October 2022. Each panel shows all nine countries in grey and its own in color; 100 is the long-run average.",
          x: 32,
          y: 58,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Countries",
          x: 72,
          y: 112,
          frame: { width: 236, height: 150 },
          label: { show: true, width: 0, fontSize: 13, valueCalcId: "calc-1" },
          axis: true,
          marks: [
            {
              type: "path",
              id: "mark-1",
              name: "Index",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Month",
              stroke: "#c2410c",
              strokeWidth: 1.75,
              seriesField: "Country",
              focus: { kind: "repeat" },
              mutedStroke: "#d4d7dc",
              population: "composition",
            },
            {
              type: "point",
              id: "mark-2",
              name: "Latest",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Month",
              radius: 3,
              fill: "#c2410c",
              labelEvery: 0,
              show: "last",
              seriesField: "Country",
              focus: { kind: "repeat" },
              mutedFill: "#d4d7dc",
              population: "composition",
            },
          ],
          repeat: {
            field: "Country",
            arrangement: "grid",
            columns: 3,
            gap: 56,
            order: "label",
            limit: 9,
          },
        },
        {
          id: "guide-1",
          kind: "guide",
          name: "Average",
          x: 4,
          y: 0,
          unitId: "unit-1",
          value: { kind: "constant", value: "100" },
          label: "",
          color: "#8a8f98",
          axis: "y",
        },
        {
          id: "note-1",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: OECD consumer confidence indicator, via the R Graph Gallery's data file. Each panel's label shows its latest index after the active filters. After the Economist's small-multiples grid.",
          x: 32,
          y: 724,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  {
    ...line(
      "confidence-line",
      "Average index by month",
      ["Index"],
      layout(0, 9, 8, 5),
      "Index"
    ),
    xField: "Month",
    xAxisLabel: "Month",
    time: {
      interval: "month",
      weekStart: "monday",
      aggregation: "average",
      measureField: "Index",
      missingPeriods: "gap",
    },
  },
  row("confidence-countries", "Rows by country", "Country", layout(8, 9, 4, 5)),
  table(
    "confidence-rows",
    "Country-months",
    ["Country", "Month", "Index"],
    layout(0, 14, 12, 5)
  ),
]);

/**
 * Pew's dumbbell: one topic per row, the two parties' shares as colored dots
 * on a shared percentage scale with a connector, a legend above, and the
 * signed gap beside each row.
 */
export const pewMeaningDashboard = dashboard("Life's meaning by party", [
  {
    ...base,
    id: "pew-composition",
    type: "composition",
    title: "Republicans and Democrats differ over what makes life meaningful",
    layout: layout(0, 0, 12, 7),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 840, height: 560, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Share",
          field: "Share",
          domain: "shared",
          zero: true,
          nice: true,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Rep minus Dem",
          aggregation: "difference",
          field: "Share",
          orderField: "Party",
          population: "repeat",
          filters: "follow",
        },
        {
          id: "calc-2",
          name: "Row order",
          aggregation: "max",
          field: "Order",
          population: "repeat",
          filters: "ignore",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Republicans and Democrats in the U.S. differ over some factors that make life meaningful",
          x: 32,
          y: 24,
          width: 776,
          fontSize: 20,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "% of U.S. adults who mention each topic when describing what gives them meaning in life, by party. The number at the right is the Republican share minus the Democratic share.",
          x: 32,
          y: 82,
          width: 776,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "legend-1",
          kind: "legend",
          name: "Party key",
          x: 300,
          y: 134,
          unitId: "unit-1",
          markId: "mark-2",
          direction: "row",
          fontSize: 12,
          color: "#1f2328",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Topics",
          x: 32,
          y: 166,
          frame: { width: 420, height: 30 },
          label: {
            show: true,
            width: 268,
            fontSize: 13,
            valueCalcId: "calc-1",
          },
          axis: true,
          marks: [
            {
              type: "path",
              id: "mark-1",
              name: "Gap",
              xScaleId: "n-1",
              orderField: "Party",
              stroke: "#d4d7dc",
              strokeWidth: 4,
            },
            {
              type: "point",
              id: "mark-2",
              name: "Parties",
              xScaleId: "n-1",
              orderField: "Party",
              radius: 7,
              fill: "#1f2328",
              labelField: "Share",
              labelEvery: 1,
              colorField: "Party",
              colors: ["#436685", "#bf2f24"],
            },
          ],
          repeat: {
            field: "Topic",
            arrangement: "rows",
            columns: 1,
            gap: 14,
            order: "value",
            orderCalcId: "calc-2",
            direction: "asc",
            limit: 10,
          },
        },
        {
          id: "note-1",
          kind: "text",
          role: "note",
          name: "Note",
          text: 'Source: Pew Research Center, "What makes life meaningful? Views from 17 advanced economies" (November 2021), U.S. survey. Figures as transcribed in the R Graph Gallery\'s recreation.',
          x: 32,
          y: 524,
          width: 776,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  row("pew-topics", "Rows by topic", "Topic", layout(0, 7, 6, 5)),
  row("pew-parties", "Rows by party", "Party", layout(6, 7, 6, 5)),
  table(
    "pew-rows",
    "Shares",
    ["Topic", "Party", "Share"],
    layout(0, 12, 12, 4)
  ),
]);

/**
 * Income against life expectancy: one annotated scatter. Points sit on a log
 * income scale, size by population, color by region, and a few chosen
 * economies carry labels; a legend keys the regions.
 */
export const incomeLifeDashboard = dashboard("Income and life", [
  {
    ...base,
    id: "income-life-composition",
    type: "composition",
    title: "Richer countries live longer",
    layout: layout(0, 0, 12, 8),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 620, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "GDP per capita",
          field: "GDP per capita",
          domain: "shared",
          zero: false,
          nice: true,
          transform: "log",
        },
        {
          id: "n-2",
          kind: "numeric",
          name: "Life expectancy",
          field: "Life expectancy",
          domain: "shared",
          zero: false,
          nice: true,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Economies",
          aggregation: "count",
          population: "composition",
          filters: "follow",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Richer countries live longer",
          x: 32,
          y: 26,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Life expectancy at birth against GDP per capita in 2023, for {Economies} economies. Each tenfold step in income takes the same room; circle area follows population.",
          x: 32,
          y: 58,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "legend-1",
          kind: "legend",
          name: "Regions",
          x: 80,
          y: 96,
          unitId: "unit-1",
          markId: "mark-1",
          direction: "row",
          fontSize: 11,
          color: "#1f2328",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "Economies",
          x: 80,
          y: 126,
          frame: { width: 840, height: 410 },
          label: { show: false, width: 0, fontSize: 12 },
          axis: true,
          marks: [
            {
              type: "point",
              id: "mark-1",
              name: "Economies",
              xScaleId: "n-1",
              yScaleId: "n-2",
              radius: 22,
              fill: "#4e79a7",
              labelField: "Country",
              labelEvery: 1,
              labelValues:
                "China, India, United States, Nigeria, Japan, Chad, Qatar, Brazil, Indonesia, Lesotho, Luxembourg, Afghanistan",
              sizeField: "Population",
              colorField: "Region",
              colors: [
                "#4e79a7",
                "#f28e2b",
                "#59a14f",
                "#e15759",
                "#76b7b2",
                "#b07aa1",
                "#edc948",
              ],
            },
          ],
          repeat: {
            arrangement: "rows",
            columns: 1,
            gap: 0,
            order: "label",
            limit: 1,
          },
        },
        {
          id: "note-1",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: World Bank World Development Indicators, 2023 vintage (CC BY 4.0): population and life expectancy from the UN Population Division, GDP per capita in PPP constant 2021 dollars. After Gapminder's income and health chart.",
          x: 32,
          y: 586,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  row("income-life-regions", "Rows by region", "Region", layout(0, 8, 5, 5)),
  histogram(
    "income-life-expectancy",
    "Life expectancy",
    "Life expectancy",
    layout(5, 8, 7, 5)
  ),
  table(
    "income-life-rows",
    "Economies",
    [
      "Country",
      "Region",
      "Income",
      "Population",
      "GDP per capita",
      "Life expectancy",
    ],
    layout(0, 13, 12, 5)
  ),
]);

/**
 * Covid case rates on a tile-grid map: each state's seven-day average new
 * cases per 100,000 as a small path at its cell on the US tile grid, on one
 * shared scale, with the latest value in each label.
 */
export const covidTilesDashboard = dashboard("Covid tiles", [
  {
    ...base,
    id: "covid-tiles-composition",
    type: "composition",
    title: "Three years of Covid, state by state",
    layout: layout(0, 0, 12, 9),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 700, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Week",
          field: "Date",
          domain: "shared",
          zero: false,
          nice: false,
        },
        {
          id: "n-2",
          kind: "numeric",
          name: "Cases per 100k",
          field: "Cases per 100k",
          domain: "shared",
          zero: true,
          nice: false,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Peak",
          aggregation: "max",
          field: "Cases per 100k",
          population: "repeat",
          filters: "follow",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "Three years of Covid, state by state",
          x: 32,
          y: 24,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Seven-day average of new cases per 100,000 people, weekly from March 2020 to March 2023, on one shared scale. Each state sits roughly where it is on the map; its label gives its worst week.",
          x: 32,
          y: 56,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "States",
          x: 40,
          y: 110,
          frame: { width: 72, height: 40 },
          label: { show: true, width: 0, fontSize: 10, valueCalcId: "calc-1" },
          axis: false,
          marks: [
            {
              type: "path",
              id: "mark-1",
              name: "Cases",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              stroke: "#a3241d",
              strokeWidth: 1.25,
            },
            {
              type: "point",
              id: "mark-2",
              name: "Latest",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              radius: 2,
              fill: "#1f2328",
              labelEvery: 0,
              show: "last",
            },
          ],
          repeat: {
            field: "Code",
            arrangement: "tiles",
            tileField: "Tile",
            columns: 11,
            gap: 10,
            order: "label",
            limit: 60,
          },
        },
        {
          id: "note-1",
          kind: "annotation",
          name: "Omicron",
          text: "The January 2022 Omicron wave towers over every other peak in all 51 series.",
          x: 40,
          y: 650,
          anchor: { kind: "page" },
          fontSize: 11,
          color: "#5f6368",
          leader: false,
        },
        {
          id: "note-2",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: The New York Times, Covid-19 data in the United States (CC BY-NC 4.0), rolling averages, every seventh day. After the published tile-grid recreation.",
          x: 32,
          y: 672,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  {
    ...line(
      "covid-tiles-line",
      "National average by week",
      ["Cases per 100k"],
      layout(0, 9, 8, 5),
      "Cases per 100k"
    ),
    xField: "Date",
    xAxisLabel: "Week",
    time: {
      interval: "week",
      weekStart: "monday",
      aggregation: "average",
      measureField: "Cases per 100k",
      missingPeriods: "gap",
    },
  },
  row("covid-tiles-states", "Rows by state", "State", layout(8, 9, 4, 5)),
  table(
    "covid-tiles-rows",
    "State-weeks",
    ["State", "Date", "Cases per 100k"],
    layout(0, 14, 12, 5)
  ),
]);

/**
 * State case rates against the nation: six panels. The main frame shows
 * the last nine months with the state in color and the national rate in
 * black; an inset shows the full three years for both. The US series sits
 * in the data as a comparison and is left out of the repeats.
 */
export const covidCompareDashboard = dashboard("Covid compare", [
  {
    ...base,
    id: "covid-compare-composition",
    type: "composition",
    title: "The last nine months, against three years",
    layout: layout(0, 0, 12, 9),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 960, height: 720, background: "#ffffff" },
      scales: [
        {
          id: "n-1",
          kind: "numeric",
          name: "Week",
          field: "Date",
          domain: "shared",
          zero: false,
          nice: false,
        },
        {
          id: "n-2",
          kind: "numeric",
          name: "Cases per 100k",
          field: "Cases per 100k",
          domain: "shared",
          zero: true,
          nice: true,
        },
        {
          id: "n-3",
          kind: "numeric",
          name: "Cases per 100k, all weeks",
          field: "Cases per 100k",
          domain: "shared",
          zero: true,
          nice: false,
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "Latest",
          aggregation: "last",
          field: "Cases per 100k",
          orderField: "Date",
          population: "repeat",
          filters: "follow",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "The last nine months, against three years",
          x: 32,
          y: 24,
          width: 896,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "Seven-day average new Covid cases per 100,000 people. Each panel's main frame shows July 2022 to March 2023, the state in color and the United States in black; the inset shows the whole series from March 2020 on its own scale.",
          x: 32,
          y: 56,
          width: 896,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "States",
          x: 72,
          y: 116,
          frame: { width: 250, height: 190 },
          label: { show: true, width: 0, fontSize: 13, valueCalcId: "calc-1" },
          axis: true,
          window: { field: "Date", min: "2022-07-04" },
          insets: [
            {
              id: "inset-1",
              name: "All weeks",
              x: 100,
              y: 8,
              width: 142,
              height: 70,
              axis: false,
              background: "#f6f7f9",
            },
          ],
          marks: [
            {
              type: "path",
              id: "mark-1",
              name: "State, recent",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              stroke: "#c2410c",
              strokeWidth: 2,
            },
            {
              type: "path",
              id: "mark-2",
              name: "Nation, recent",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              stroke: "#1f2328",
              strokeWidth: 1.25,
              seriesField: "Code",
              focus: { kind: "values", values: "US" },
              mutedStroke: "#ffffff00",
              population: "composition",
            },
            {
              type: "point",
              id: "mark-3",
              name: "Latest",
              xScaleId: "n-1",
              yScaleId: "n-2",
              orderField: "Date",
              radius: 3,
              fill: "#c2410c",
              labelEvery: 0,
              show: "last",
            },
            {
              type: "path",
              id: "mark-4",
              name: "State, all weeks",
              frameId: "inset-1",
              xScaleId: "n-1",
              yScaleId: "n-3",
              orderField: "Date",
              stroke: "#c2410c",
              strokeWidth: 1,
            },
            {
              type: "path",
              id: "mark-5",
              name: "Nation, all weeks",
              frameId: "inset-1",
              xScaleId: "n-1",
              yScaleId: "n-3",
              orderField: "Date",
              stroke: "#1f2328",
              strokeWidth: 0.75,
              seriesField: "Code",
              focus: { kind: "values", values: "US" },
              mutedStroke: "#ffffff00",
              population: "composition",
            },
          ],
          repeat: {
            field: "State",
            arrangement: "grid",
            columns: 3,
            gap: 52,
            order: "label",
            limit: 10,
            skip: "United States",
          },
        },
        {
          id: "note-1",
          kind: "annotation",
          name: "Reading note",
          text: "Main frames share one recent scale; insets share one full-history scale, where the January 2022 Omicron peak dwarfs the recent months.",
          x: 72,
          y: 662,
          anchor: { kind: "page" },
          fontSize: 11,
          color: "#5f6368",
          leader: false,
        },
        {
          id: "note-2",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: The New York Times, Covid-19 data in the United States (CC BY-NC 4.0), rolling averages for states and the nation, every seventh day. After The Washington Post's state comparison layout.",
          x: 32,
          y: 688,
          width: 896,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  {
    ...line(
      "covid-compare-line",
      "Average of the six states by week",
      ["Cases per 100k"],
      layout(0, 9, 8, 5),
      "Cases per 100k"
    ),
    xField: "Date",
    xAxisLabel: "Week",
    time: {
      interval: "week",
      weekStart: "monday",
      aggregation: "average",
      measureField: "Cases per 100k",
      missingPeriods: "gap",
    },
  },
  row("covid-compare-states", "Rows by state", "State", layout(8, 9, 4, 5)),
  table(
    "covid-compare-rows",
    "Weekly rates",
    ["State", "Date", "Cases per 100k"],
    layout(0, 14, 12, 5)
  ),
]);

/**
 * Presidential margins by state: 51 strips of 11 elections. Each cell's
 * color follows the signed Democratic margin through a diverging ramp;
 * rows order by the latest margin, and a legend keys the ramp.
 */
export const electionsDashboard = dashboard("Presidential margins", [
  {
    ...base,
    id: "elections-composition",
    type: "composition",
    title: "How each state voted, 1976 to 2016",
    layout: layout(0, 0, 12, 9),
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    composition: {
      artboard: { width: 760, height: 760, background: "#ffffff" },
      scales: [
        {
          id: "x-1",
          kind: "position",
          name: "Election",
          field: "Year",
          domain: "shared",
        },
        {
          id: "value-1",
          kind: "value",
          name: "Democratic margin, points",
          domain: "shared",
          transform: "sqrt",
          colors: ["#c0392b", "#2b6cb0"],
          center: "#ece9e4",
        },
      ],
      calculations: [
        {
          id: "calc-1",
          name: "2016 margin",
          aggregation: "last",
          field: "Margin",
          orderField: "Year",
          population: "repeat",
          filters: "ignore",
        },
      ],
      overrides: [],
      elements: [
        {
          id: "title-1",
          kind: "text",
          role: "title",
          name: "Title",
          text: "How each state voted, 1976 to 2016",
          x: 32,
          y: 24,
          width: 696,
          fontSize: 24,
          fontWeight: 700,
          color: "#1f2328",
        },
        {
          id: "subtitle-1",
          kind: "text",
          role: "subtitle",
          name: "Subtitle",
          text: "One cell per state and presidential election, colored by the Democratic margin over the Republican in percentage points. Blue leans Democratic, red Republican; rows sort by the 2016 margin.",
          x: 32,
          y: 56,
          width: 696,
          fontSize: 13,
          fontWeight: 400,
          color: "#5f6368",
        },
        {
          id: "legend-1",
          kind: "legend",
          name: "Margin key",
          x: 560,
          y: 112,
          unitId: "unit-1",
          markId: "mark-1",
          scaleId: "value-1",
          direction: "row",
          fontSize: 10,
          color: "#1f2328",
        },
        {
          id: "unit-1",
          kind: "unit",
          name: "States",
          x: 32,
          y: 140,
          frame: { width: 396, height: 10 },
          label: { show: true, width: 150, fontSize: 9, valueCalcId: "calc-1" },
          axis: true,
          marks: [
            {
              type: "strip",
              id: "mark-1",
              name: "Cells",
              shape: "rect",
              positionScaleId: "x-1",
              valueScaleId: "value-1",
              aggregation: "average",
              measureField: "Margin",
              encoding: "color",
              fill: "#1f2328",
              inset: 2,
            },
          ],
          repeat: {
            field: "State",
            arrangement: "rows",
            columns: 1,
            gap: 1,
            order: "value",
            orderCalcId: "calc-1",
            direction: "desc",
            limit: 60,
          },
        },
        {
          id: "note-1",
          kind: "text",
          role: "note",
          name: "Note",
          text: "Source: MIT Election Data and Science Lab, U.S. President 1976–2020 state returns (CC0), 1976 to 2016. Margin is the Democratic share of all votes minus the Republican share. After the published state-strip graphic.",
          x: 32,
          y: 728,
          width: 696,
          fontSize: 10,
          fontWeight: 400,
          color: "#5f6368",
        },
      ],
    },
  },
  row("elections-winner", "Rows by winner", "Winner", layout(0, 9, 4, 5)),
  histogram("elections-margin", "Margins", "Margin", layout(4, 9, 8, 5)),
  table(
    "elections-rows",
    "State-elections",
    [
      "State",
      "Year",
      "Democratic share",
      "Republican share",
      "Margin",
      "Winner",
    ],
    layout(0, 14, 12, 5)
  ),
]);
