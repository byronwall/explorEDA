import type { SavedDataStructure } from "exploreda";

// The fixture for the "local trust" journey from
// docs/intent/current-analysis-trust. Tools has three source rows (O-101,
// O-102, O-103) but only two numeric contributors, because O-103 has no
// revenue: sum 12, mean 6. The library test keeps the same rows in
// packages/explorEDA/src/test/providers/localTrustJourney.test.tsx.
export const trustRows = [
  { order: "O-101", category: "Tools", revenue: 4 },
  { order: "O-102", category: "Tools", revenue: 8 },
  { order: "O-103", category: "Tools", revenue: null },
  { order: "O-104", category: "Toys", revenue: 5 },
  { order: "O-105", category: "Garden", revenue: 7 },
];

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

export const trustSettings: SavedDataStructure = {
  charts: [
    {
      ...base,
      id: "bar",
      type: "bar",
      title: "Revenue by category",
      field: "category",
      aggregateId: "revenue-by-category",
      layout: { x: 0, y: 0, w: 6, h: 4 },
    },
    {
      ...base,
      id: "total",
      type: "metric-card",
      title: "Revenue",
      aggregation: "sum",
      measureField: "revenue",
      layout: { x: 6, y: 0, w: 3, h: 2 },
    },
    {
      ...base,
      id: "mean",
      type: "metric-card",
      title: "Average revenue",
      aggregation: "average",
      measureField: "revenue",
      layout: { x: 9, y: 0, w: 3, h: 2 },
    },
    {
      ...base,
      id: "orders",
      type: "data-table",
      title: "Orders",
      columns: ["order", "category", "revenue"].map((field) => ({
        id: field,
        field,
      })),
      sortDirection: "asc",
      globalSearch: "",
      layout: { x: 0, y: 4, w: 12, h: 4 },
    },
  ],
  aggregates: [
    {
      id: "revenue-by-category",
      name: "Sum of revenue by category",
      groupField: "category",
      measureField: "revenue",
      aggregation: "sum",
    },
  ],
  calculations: [],
  colorScales: [],
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: {
    name: "Local trust",
    version: 1,
    createdAt: "2026-10-22T00:00:00Z",
    modifiedAt: "2026-10-22T00:00:00Z",
  },
};
