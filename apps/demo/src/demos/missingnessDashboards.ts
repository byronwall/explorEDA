import type { SavedDataStructure } from "exploreda";

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

/** Which order fields are missing together. */
const orderGaps: Chart = {
  ...base,
  id: "order-gaps",
  type: "joint-missingness",
  title: "Store orders explain most missing tracking",
  subtitle: "Exact missing patterns across fulfilment and feedback fields",
  fields: ["Shipped", "Tracking", "Delivered", "Rating", "Review", "Phone"],
  layout: layout(0, 0, 8, 8),
};

const channels: Chart = {
  ...base,
  id: "order-gaps-channel",
  type: "row",
  title: "Orders by channel",
  field: "Channel",
  layout: layout(8, 0, 4, 3),
  xAxisLabel: "Orders",
  minRowHeight: 14,
  maxRowHeight: 28,
} as Chart;

const rows: Chart = {
  ...base,
  id: "order-gaps-rows",
  type: "data-table",
  title: "Orders in view",
  layout: layout(8, 3, 4, 5),
  columns: ["Order", "Channel", "Shipped", "Tracking", "Delivered"].map(
    (field) => ({ id: field, field })
  ),
  sortDirection: "asc",
  globalSearch: "",
} as Chart;

export const orderGapsDashboard: SavedDataStructure = {
  charts: [orderGaps, channels, rows],
  calculations: [],
  colorScales: [],
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Order data gaps",
    version: 1,
    createdAt: "2026-11-02T00:00:00Z",
    modifiedAt: "2026-11-02T00:00:00Z",
  },
};
