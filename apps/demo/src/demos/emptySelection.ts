import type { SavedDataStructure } from "exploreda";
import { shopDashboard } from "./dashboardSettings";

/**
 * The order book with a Home selection and an Outdoors workspace filter,
 * which leave no rows. Removing either one brings a category back.
 */
export const emptySelectionDashboard: SavedDataStructure = {
  ...shopDashboard,
  charts: shopDashboard.charts.flatMap((chart) =>
    chart.id === "shop-category"
      ? [
          {
            ...chart,
            layout: { ...chart.layout, x: 0, y: 0, w: 6 },
            filters: [{ type: "value", field: "Category", values: ["Home"] }],
          },
        ]
      : chart.id === "shop-channel"
        ? [{ ...chart, layout: { ...chart.layout, x: 6, y: 0, w: 6 } }]
        : []
  ),
  workspaceFilters: [
    { type: "value", field: "Category", values: ["Outdoors"] },
  ],
};

/**
 * Outdoors orders in Rows, filtered to Store and searched for Wholesale.
 * The Rows filter and the search rule each other out; removing the
 * workspace filter alone still leaves none.
 */
export const emptyRowsDashboard: SavedDataStructure = {
  ...emptySelectionDashboard,
  charts: emptySelectionDashboard.charts.map((chart) => ({
    ...chart,
    filters: [],
  })),
  rowsSettings: {
    columns: [
      "Order Date",
      "Region",
      "Channel",
      "Category",
      "Product",
      "Customer Segment",
      "Revenue",
    ].map((field) => ({ id: field, field })),
    sortDirection: "asc",
    filters: [{ type: "value", field: "Channel", values: ["Store"] }],
    globalSearch: "Wholesale",
  },
};
