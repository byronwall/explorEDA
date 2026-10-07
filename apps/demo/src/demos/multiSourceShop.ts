import type {
  AnalysisProject,
  AnalysisSourceRow,
  SavedDataStructure,
} from "exploreda";
import type { ExampleView } from "./exampleViews";

// Four customers, five orders, eight items, four products. Orders total 150;
// items total 140 across four orders. C4 has no orders, O5 names a missing
// customer, and the Bag is never sold.
const tables: Record<string, AnalysisSourceRow[]> = {
  customers: [
    { customerId: "C1", name: "Aster", joinedAt: "2025-01-10" },
    { customerId: "C2", name: "Birch", joinedAt: "2025-02-12" },
    { customerId: "C3", name: "Cedar", joinedAt: "2025-03-14" },
    { customerId: "C4", name: "Dogwood", joinedAt: "2025-04-16" },
  ],
  orders: [
    { orderId: "O1", customerId: "C1", amount: 30, orderedAt: "2025-01-15" },
    { orderId: "O2", customerId: "C1", amount: 20, orderedAt: "2025-01-20" },
    { orderId: "O3", customerId: "C2", amount: 50, orderedAt: "2025-02-15" },
    { orderId: "O4", customerId: "C3", amount: 40, orderedAt: "2025-03-15" },
    { orderId: "O5", customerId: "C9", amount: 10, orderedAt: "2025-05-15" },
  ],
  items: [
    { itemId: "I1", orderId: "O1", productId: "P1", revenue: 10 },
    { itemId: "I2", orderId: "O1", productId: "P2", revenue: 20 },
    { itemId: "I3", orderId: "O2", productId: "P1", revenue: 20 },
    { itemId: "I4", orderId: "O3", productId: "P2", revenue: 10 },
    { itemId: "I5", orderId: "O3", productId: "P3", revenue: 20 },
    { itemId: "I6", orderId: "O3", productId: "P2", revenue: 20 },
    { itemId: "I7", orderId: "O4", productId: "P1", revenue: 15 },
    { itemId: "I8", orderId: "O4", productId: "P3", revenue: 25 },
  ],
  products: [
    { productId: "P1", name: "Mug" },
    { productId: "P2", name: "Notebook" },
    { productId: "P3", name: "Lamp" },
    { productId: "P4", name: "Bag" },
  ],
};

const project: AnalysisProject = {
  id: "shop-analysis",
  version: 1,
  sources: [
    {
      id: "customers",
      name: "Customers",
      glyph: "C",
      entityKey: "customerId",
      fields: [
        { id: "customerId", name: "Customer ID", type: "string" },
        { id: "name", name: "Name", type: "string" },
        { id: "joinedAt", name: "Joined", type: "date" },
      ],
    },
    {
      id: "orders",
      name: "Orders",
      glyph: "O",
      entityKey: "orderId",
      fields: [
        { id: "orderId", name: "Order ID", type: "string" },
        { id: "customerId", name: "Customer ID", type: "string" },
        { id: "amount", name: "Amount", type: "number" },
        { id: "orderedAt", name: "Ordered", type: "date" },
      ],
    },
    {
      id: "items",
      name: "Items",
      glyph: "I",
      entityKey: "itemId",
      fields: [
        { id: "itemId", name: "Item ID", type: "string" },
        { id: "orderId", name: "Order ID", type: "string" },
        { id: "productId", name: "Product ID", type: "string" },
        { id: "revenue", name: "Revenue", type: "number" },
      ],
    },
    {
      id: "products",
      name: "Products",
      glyph: "P",
      entityKey: "productId",
      fields: [
        { id: "productId", name: "Product ID", type: "string" },
        { id: "name", name: "Product", type: "string" },
      ],
    },
  ],
  relationships: [
    {
      id: "order-customer",
      name: "Order customer",
      from: { sourceId: "orders", fieldId: "customerId" },
      to: { sourceId: "customers", fieldId: "customerId" },
      cardinality: "many-to-one",
    },
    {
      id: "item-order",
      name: "Item order",
      from: { sourceId: "items", fieldId: "orderId" },
      to: { sourceId: "orders", fieldId: "orderId" },
      cardinality: "many-to-one",
    },
    {
      id: "item-product",
      name: "Item product",
      from: { sourceId: "items", fieldId: "productId" },
      to: { sourceId: "products", fieldId: "productId" },
      cardinality: "many-to-one",
    },
  ],
  queries: [
    {
      id: "orders-by-customer",
      name: "Orders with customers",
      glyph: "◆",
      frameLabel: "orders",
      outputStepId: "order-customer",
      steps: [
        { id: "orders", kind: "source", sourceId: "orders" },
        {
          id: "order-customer",
          kind: "lookup",
          inputStepId: "orders",
          relationshipId: "order-customer",
          as: "customer",
        },
      ],
    },
    {
      id: "items-by-order",
      name: "Items with orders and products",
      glyph: "◇",
      frameLabel: "items",
      outputStepId: "item-product",
      steps: [
        { id: "items", kind: "source", sourceId: "items" },
        {
          id: "item-order",
          kind: "lookup",
          inputStepId: "items",
          relationshipId: "item-order",
          as: "order",
        },
        {
          id: "item-product",
          kind: "lookup",
          inputStepId: "item-order",
          relationshipId: "item-product",
          as: "product",
        },
      ],
    },
    {
      id: "customer-instance",
      name: "One customer's orders",
      glyph: "●",
      frameLabel: "orders",
      outputStepId: "until",
      steps: [
        { id: "all-orders", kind: "source", sourceId: "orders" },
        {
          id: "customer",
          kind: "filter",
          inputStepId: "all-orders",
          fieldId: "orders.customerId",
          operator: "eq",
          parameterId: "customerId",
        },
        {
          id: "from",
          kind: "filter",
          inputStepId: "customer",
          fieldId: "orders.orderedAt",
          operator: "gte",
          parameterId: "dateStart",
        },
        {
          id: "until",
          kind: "filter",
          inputStepId: "from",
          fieldId: "orders.orderedAt",
          operator: "lte",
          parameterId: "dateEnd",
        },
      ],
    },
  ],
  parameters: [
    {
      id: "customerId",
      name: "Customer",
      type: "string",
      required: true,
      options: { sourceId: "customers", labelFieldId: "name" },
    },
    { id: "dateStart", name: "From", type: "date", required: true },
    { id: "dateEnd", name: "Until", type: "date", required: true },
  ],
};

export const shopProject = { project, sources: tables };
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
      title: items ? "Order amount, once per order" : "Average order amount",
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
      ...(items
        ? {
            "order.amount": {
              label: "Order amount",
              format: "currency" as const,
              currency: "USD",
              precision: 2,
            },
          }
        : {}),
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
