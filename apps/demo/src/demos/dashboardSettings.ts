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
