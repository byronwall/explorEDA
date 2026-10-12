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
