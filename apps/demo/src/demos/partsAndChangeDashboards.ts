import type { SavedDataStructure } from "exploreda";
import { groupedBarsDashboard } from "./dashboardSettings";

type Chart = SavedDataStructure["charts"][number];

const base = {
  field: "",
  colorField: undefined,
  colorScaleId: undefined,
  xAxis: { grid: true },
  yAxis: { grid: false },
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
const layout = (x: number, y: number, w: number, h: number) => ({
  x,
  y,
  w,
  h,
});
const AMOUNT = "Amount ($K)";

/** Plan to actual for the lab budget, one step per line item. */
const budgetBridge: Chart = {
  ...base,
  id: "budget-bridge",
  type: "waterfall",
  title: "A planned surplus became a deficit",
  subtitle: "Net position, plan to actual, by line item ($K)",
  field: "Line item",
  layout: layout(0, 0, 7, 7),
  mode: "bridge",
  aggregation: "sum",
  measureField: AMOUNT,
  parentField: "Group",
  xAxisLabel: "Net position ($K)",
  states: [
    {
      label: "Plan",
      filters: [{ type: "value", field: "Scenario", values: ["Plan"] }],
    },
    {
      label: "Actual",
      filters: [{ type: "value", field: "Scenario", values: ["Actual"] }],
    },
  ],
};

const quarters: Chart = {
  ...base,
  id: "budget-quarter",
  type: "row",
  title: "Pick quarters to bridge",
  field: "Quarter",
  layout: layout(7, 0, 5, 3),
  minRowHeight: 14,
  maxRowHeight: 28,
  xAxisLabel: "Rows",
};

const lineItems: Chart = {
  ...base,
  id: "budget-lines",
  type: "data-table",
  title: "Budget rows in view",
  layout: layout(7, 3, 5, 4),
  columns: ["Quarter", "Line item", "Scenario", AMOUNT].map((field) => ({
    id: field,
    field,
  })),
  sortDirection: "asc",
  globalSearch: "",
};

export const budgetBridgeDashboard: SavedDataStructure = {
  charts: [budgetBridge, quarters, lineItems],
  calculations: [],
  colorScales: [],
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Lab budget: plan to actual",
    version: 1,
    createdAt: "2026-10-12T00:00:00Z",
    modifiedAt: "2026-10-12T00:00:00Z",
  },
};

const ENERGY = "Energy (kWh)";

/** The battery's state of charge through a day, hour by hour. */
const batteryCharge: Chart = {
  ...base,
  id: "battery-charge",
  type: "waterfall",
  title: "The battery ended the day fuller than it began",
  subtitle: "State of charge, hour by hour (kWh)",
  field: "Hour",
  layout: layout(0, 0, 7, 9),
  mode: "accumulate",
  aggregation: "sum",
  measureField: ENERGY,
  parentField: "Period",
  startValue: 40,
  xAxisLabel: "State of charge (kWh)",
  states: [
    { label: "Charge at midnight", filters: [] },
    { label: "Charge at day's end", filters: [] },
  ],
};

const batteryFlows: Chart = {
  ...base,
  id: "battery-flows",
  type: "row",
  title: "Pick flows to follow",
  field: "Flow",
  layout: layout(7, 0, 5, 3),
  minRowHeight: 14,
  maxRowHeight: 28,
  xAxisLabel: "Hours",
};

const batteryRows: Chart = {
  ...base,
  id: "battery-rows",
  type: "data-table",
  title: "Hourly flows in view",
  layout: layout(7, 3, 5, 6),
  columns: ["Hour", "Period", "Flow", ENERGY].map((field) => ({
    id: field,
    field,
  })),
  sortDirection: "asc",
  globalSearch: "",
};

export const batteryDayDashboard: SavedDataStructure = {
  ...budgetBridgeDashboard,
  charts: [batteryCharge, batteryFlows, batteryRows],
  metadata: {
    ...budgetBridgeDashboard.metadata,
    name: "A day in the battery",
  },
};

const SHARED_CHANNEL_SCALE = groupedBarsDashboard.colorScales.find(
  (scale) => scale.id === "grouped-channel"
)!;
const ordersByCategory = groupedBarsDashboard.charts.find(
  (chart) => chart.id === "grouped-count"
)!;

/** Revenue's share by channel, in the channel colors the bars use. */
const channelShare: Chart = {
  ...base,
  id: "share-channel",
  type: "donut",
  title: "Web brings in over half of revenue",
  subtitle: "Share of revenue by sales channel",
  field: "Channel",
  layout: layout(0, 0, 5, 4),
  aggregation: "sum",
  measureField: "Revenue",
  colorField: "Channel",
  colorScaleId: SHARED_CHANNEL_SCALE.id,
};

/** The same channel mix within each region, as 100% bars. */
const regionMix: Chart = {
  ...ordersByCategory,
  id: "share-region-mix",
  title: "Channel mix in each region",
  field: "Region",
  layout: layout(5, 0, 7, 4),
  seriesLayout: "percent",
  yAxisLabel: "Share of orders (%)",
} as Chart;

/** Orders by product, with the smaller products pooled into Other. */
const productShare: Chart = {
  ...base,
  id: "share-product",
  type: "donut",
  title: "Orders split almost evenly across products",
  subtitle: "Share of orders by product; the two smallest pool into Other",
  field: "Product",
  layout: layout(0, 4, 5, 4),
  aggregation: "count",
  topN: 4,
};

const shareRows: Chart = {
  ...base,
  id: "share-orders",
  type: "data-table",
  title: "Orders in view",
  layout: layout(5, 4, 7, 4),
  columns: ["Order Date", "Region", "Channel", "Product", "Revenue"].map(
    (field) => ({ id: field, field })
  ),
  sortDirection: "asc",
  globalSearch: "",
};

export const channelShareDashboard: SavedDataStructure = {
  ...budgetBridgeDashboard,
  charts: [channelShare, regionMix, productShare, shareRows],
  colorScales: [SHARED_CHANNEL_SCALE],
  metadata: {
    ...budgetBridgeDashboard.metadata,
    name: "Shares of the order book",
  },
};

const PALETTE = [
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
];
const text = (
  id: string,
  role: "title" | "subtitle" | "note",
  value: string,
  y: number,
  fontSize: number,
  fontWeight = 400,
  color = "#5f6368"
) => ({
  id,
  kind: "text" as const,
  role,
  name: role[0]!.toUpperCase() + role.slice(1),
  text: value,
  x: 32,
  y,
  width: 896,
  fontSize,
  fontWeight,
  color,
});

/** A report page: each quarter's bridge, and where each group's actual money went. */
const budgetReport: Chart = {
  ...base,
  id: "budget-report",
  type: "composition",
  title: "Lab budget report",
  layout: layout(0, 0, 12, 9),
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  composition: {
    artboard: { width: 960, height: 640, background: "#ffffff" },
    scales: [],
    calculations: [],
    overrides: [],
    elements: [
      text(
        "title-1",
        "title",
        "The second quarter turned the lab's surplus into a deficit",
        26,
        24,
        700,
        "#1f2328"
      ),
      text(
        "subtitle-1",
        "subtitle",
        "Each quarter's net position from plan to actual, by budget group ($K). Every quarter shares one scale.",
        58,
        13
      ),
      {
        id: "unit-bridges",
        kind: "unit",
        name: "Quarters",
        x: 32,
        y: 104,
        frame: { width: 206, height: 170 },
        label: { show: true, width: 0, fontSize: 13 },
        axis: false,
        marks: [
          {
            type: "waterfall",
            id: "mark-bridge",
            name: "Plan to actual",
            mode: "bridge",
            aggregation: "sum",
            measureField: "Amount ($K)",
            stepField: "Group",
            states: [
              {
                label: "Plan",
                filters: [
                  { type: "value", field: "Scenario", values: ["Plan"] },
                ],
              },
              {
                label: "Actual",
                filters: [
                  { type: "value", field: "Scenario", values: ["Actual"] },
                ],
              },
            ],
            up: "#1a7f5a",
            down: "#c0392b",
            total: "#4a5563",
            labelWidth: 70,
          },
        ],
        repeat: {
          field: "Quarter",
          arrangement: "columns",
          columns: 4,
          gap: 24,
          order: "label",
          limit: 4,
        },
      },
      text(
        "subtitle-2",
        "subtitle",
        "Where each group's actual money came from and went, by line item",
        330,
        15,
        600,
        "#1f2328"
      ),
      {
        id: "unit-shares",
        kind: "unit",
        name: "Groups",
        x: 32,
        y: 372,
        frame: { width: 150, height: 150 },
        label: { show: true, width: 0, fontSize: 13 },
        axis: false,
        marks: [
          {
            type: "donut",
            id: "mark-share",
            name: "Share of actual",
            categoryField: "Line item",
            aggregation: "sum",
            measureField: "Actual size ($K)",
            topN: 4,
            order: "total",
            colors: PALETTE,
            hole: 0.58,
            showTotal: true,
          },
        ],
        repeat: {
          field: "Group",
          arrangement: "columns",
          columns: 3,
          gap: 36,
          order: "label",
          limit: 3,
        },
      },
      {
        id: "legend-shares",
        kind: "legend",
        name: "Line items",
        x: 600,
        y: 380,
        width: 330,
        unitId: "unit-shares",
        markId: "mark-share",
        direction: "column",
        fontSize: 11,
        color: "#1f2328",
      },
      text(
        "note-1",
        "note",
        "Synthetic budget generated for this demo. Funding is positive and spending negative; the donuts size actual amounts without their sign.",
        606,
        11
      ),
    ],
  },
} as Chart;

export const budgetReportDashboard: SavedDataStructure = {
  ...budgetBridgeDashboard,
  charts: [budgetReport],
  metadata: {
    ...budgetBridgeDashboard.metadata,
    name: "Lab budget report",
  },
};
