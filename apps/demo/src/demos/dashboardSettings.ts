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
): Chart => ({
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
): Chart => ({
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
