import { createShopFixture, type SavedDataStructure } from "exploreda";
import type { ExampleView } from "./exampleViews";

export const shopProject = createShopFixture();
type Chart = SavedDataStructure["charts"][number];
const base = {
  field: "",
  colorField: undefined,
  colorScaleId: undefined,
  filters: [],
  facet: {
    enabled: false,
    type: "wrap" as const,
    rowVariable: "",
    columnCount: 2,
  },
  xAxis: { grid: false },
  yAxis: { grid: true },
  margin: { top: 12, right: 16, bottom: 38, left: 52 },
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 5,
  yGridLines: 4,
};

function preset(queryId: string): SavedDataStructure {
  const items = queryId === "items-by-order";
  const instance = queryId === "customer-instance";
  const amount = items ? "items.revenue" : "orders.amount";
  const group = items
    ? "product.name"
    : instance
      ? "orders.customerId"
      : "customer.name";
  const charts: Chart[] = [
    {
      ...base,
      id: `${queryId}-count`,
      type: "metric-card",
      title: items ? "Items" : "Orders",
      aggregation: "count",
      layout: { x: 0, y: 0, w: 4, h: 2 },
    },
    {
      ...base,
      id: `${queryId}-amount`,
      type: "metric-card",
      title: items ? "Item revenue" : "Order amount",
      aggregation: "sum",
      measureField: amount,
      layout: { x: 4, y: 0, w: 4, h: 2 },
    },
    {
      ...base,
      id: `${queryId}-mean`,
      type: "metric-card",
      title: items ? "Amount of distinct orders" : "Average order amount",
      aggregation: items ? "sum" : "average",
      measureField: items ? "order.amount" : amount,
      ...(items ? { entityField: "order.orderId" } : {}),
      layout: { x: 8, y: 0, w: 4, h: 2 },
    },
    {
      ...base,
      id: `${queryId}-group`,
      type: "bar",
      title: items ? "Revenue by product" : "Amount by customer",
      field: group,
      aggregateId: `${queryId}-amount-by-group`,
      layout: { x: 0, y: 2, w: 12, h: 5 },
    },
    {
      ...base,
      id: `${queryId}-rows`,
      type: "data-table",
      columns: (items
        ? [
            "items.itemId",
            "items.orderId",
            "product.name",
            "items.revenue",
            "order.amount",
          ]
        : [
            "orders.orderId",
            instance ? "orders.customerId" : "customer.name",
            "orders.amount",
            "orders.orderedAt",
          ]
      ).map((field) => ({ id: field, field })),
      sortDirection: "asc",
      globalSearch: "",
      title: items ? "Backing item records" : "Backing order records",
      field: items ? "items.itemId" : "orders.orderId",
      layout: { x: 0, y: 7, w: 12, h: 5 },
    },
  ];
  return {
    charts,
    calculations: [],
    colorScales: [],
    aggregates: [
      {
        id: `${queryId}-amount-by-group`,
        name: items ? "Item revenue by product" : "Order amount by customer",
        groupField: group,
        measureField: amount,
        aggregation: "sum",
      },
    ],
    fieldSettings: {
      [amount]: {
        label: items ? "Item revenue" : "Order amount",
        format: "currency",
        currency: "USD",
        precision: 2,
      },
      ...(items ? {"order.amount": {
        label: "Order amount",
        format: "currency" as const,
        currency: "USD",
        precision: 2,
      }} : {}),
    },
    gridSettings: {
      columnCount: 12,
      rowHeight: 76,
      containerPadding: 0,
      showBackgroundMarkers: false,
    },
    metadata: {
      name: items ? "Items" : "Orders",
      version: 1,
      createdAt: "2026-10-05T00:00:00Z",
      modifiedAt: "2026-10-05T00:00:00Z",
    },
  };
}
export const shopQueryPresets: Record<string, SavedDataStructure> = {
  "orders-by-customer": preset("orders-by-customer"),
  "items-by-order": preset("items-by-order"),
  "customer-instance": preset("customer-instance"),
};
export const shopProjectViews: ExampleView[] = [
  {
    name: "Items",
    queryId: "items-by-order",
    savedData: shopQueryPresets["items-by-order"]!,
  },
  {
    name: "Customer orders",
    queryId: "customer-instance",
    bindings: {
      customerId: "C1",
      dateStart: "2025-01-01",
      dateEnd: "2025-12-31",
    },
    savedData: shopQueryPresets["customer-instance"]!,
  },
];
