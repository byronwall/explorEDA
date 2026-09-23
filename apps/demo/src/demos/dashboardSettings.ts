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
): Chart => ({
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
): Chart => ({
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
): Chart => ({
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
  beeSwarmOverlay: false,
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
    row("shop-region", "Regional order mix", "Region", layout(8, 5, 4)),
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
      layout(0, 9, 4),
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
  ],
  [
    categoricalScale("phase-colors", "Phase", [
      "Baseline",
      "Release",
      "Follow-up",
    ]),
  ]
);

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
  "10,000 orders · 15 linked views",
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
        layout(0, 26, 12, 7),
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
  ],
  shopDashboard.colorScales
);

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
