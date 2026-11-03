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
