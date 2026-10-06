import type { AnalysisProject, AnalysisSourceRow, SourceDefinition } from "@/types/AnalysisProject";

export type ShopFixtureVariant = "default" | "duplicate-customer-key" | "null-key" | "mixed-key-types" | "duplicate-entity-id" | "missing-customer";

export const shopSourceDefinitions: SourceDefinition[] = [
  { id: "customers", name: "Customers", glyph: "C", entityKey: "customerId", fields: [{ id: "customerId", name: "Customer ID", type: "string" }, { id: "name", name: "Name", type: "string" }, { id: "joinedAt", name: "Joined", type: "date" }] },
  { id: "orders", name: "Orders", glyph: "O", entityKey: "orderId", fields: [{ id: "orderId", name: "Order ID", type: "string" }, { id: "customerId", name: "Customer ID", type: "string" }, { id: "amount", name: "Amount", type: "number" }, { id: "orderedAt", name: "Ordered", type: "date" }] },
  { id: "items", name: "Items", glyph: "I", entityKey: "itemId", fields: [{ id: "itemId", name: "Item ID", type: "string" }, { id: "orderId", name: "Order ID", type: "string" }, { id: "productId", name: "Product ID", type: "string" }, { id: "revenue", name: "Revenue", type: "number" }] },
  { id: "products", name: "Products", glyph: "P", entityKey: "productId", fields: [{ id: "productId", name: "Product ID", type: "string" }, { id: "name", name: "Product", type: "string" }] },
];

export function createShopFixture(variant: ShopFixtureVariant = "default"): { project: AnalysisProject; sources: Record<string, AnalysisSourceRow[]> } {
  const customers: AnalysisSourceRow[] = [
    { customerId: "C1", name: "Aster", joinedAt: "2025-01-10" },
    { customerId: "C2", name: "Birch", joinedAt: "2025-02-12" },
    { customerId: "C3", name: "Cedar", joinedAt: "2025-03-14" },
    { customerId: "C4", name: "Dogwood", joinedAt: "2025-04-16" },
  ];
  const orders: AnalysisSourceRow[] = [
    { orderId: "O1", customerId: "C1", amount: 30, orderedAt: "2025-01-15" },
    { orderId: "O2", customerId: "C1", amount: 20, orderedAt: "2025-01-20" },
    { orderId: "O3", customerId: "C2", amount: 50, orderedAt: "2025-02-15" },
    { orderId: "O4", customerId: "C3", amount: 40, orderedAt: "2025-03-15" },
    { orderId: "O5", customerId: "MISSING", amount: 10, orderedAt: "2025-05-15" },
  ];
  const items: AnalysisSourceRow[] = [
    { itemId: "I1", orderId: "O1", productId: "P1", revenue: 10 },
    { itemId: "I2", orderId: "O1", productId: "P2", revenue: 20 },
    { itemId: "I3", orderId: "O2", productId: "P1", revenue: 20 },
    { itemId: "I4", orderId: "O3", productId: "P2", revenue: 10 },
    { itemId: "I5", orderId: "O3", productId: "P3", revenue: 20 },
    { itemId: "I6", orderId: "O3", productId: "P2", revenue: 20 },
    { itemId: "I7", orderId: "O4", productId: "P1", revenue: 15 },
    { itemId: "I8", orderId: "O4", productId: "P3", revenue: 25 },
  ];
  const products: AnalysisSourceRow[] = [
    { productId: "P1", name: "Mug" }, { productId: "P2", name: "Notebook" },
    { productId: "P3", name: "Lamp" }, { productId: "P4", name: "Bag" },
  ];
  if (variant === "duplicate-customer-key") customers.push({ ...customers[0]! });
  if (variant === "null-key") { customers[0]!.customerId = null; orders[0]!.customerId = null; }
  if (variant === "mixed-key-types") orders[0]!.customerId = 1;
  if (variant === "duplicate-entity-id") orders[1]!.orderId = "O1";
  if (variant === "missing-customer") orders[0]!.customerId = "ABSENT";
  const project: AnalysisProject = {
    id: "shop-analysis", version: 1,
    sources: shopSourceDefinitions,
    relationships: [
      { id: "order-customer", name: "Order customer", from: { sourceId: "orders", fieldId: "customerId" }, to: { sourceId: "customers", fieldId: "customerId" }, cardinality: "many-to-one" },
      { id: "item-order", name: "Item order", from: { sourceId: "items", fieldId: "orderId" }, to: { sourceId: "orders", fieldId: "orderId" }, cardinality: "many-to-one" },
      { id: "item-product", name: "Item product", from: { sourceId: "items", fieldId: "productId" }, to: { sourceId: "products", fieldId: "productId" }, cardinality: "many-to-one" },
    ],
    queries: [
      { id: "orders-by-customer", name: "Orders by customer", glyph: "O", frameLabel: "Orders", outputStepId: "order-customer-lookup", steps: [
        { id: "orders-source", kind: "source", sourceId: "orders" },
        { id: "order-customer-lookup", kind: "lookup", inputStepId: "orders-source", relationshipId: "order-customer", as: "customer" },
      ] },
      { id: "items-by-order", name: "Items by order", glyph: "I", frameLabel: "Items", outputStepId: "item-product-lookup", steps: [
        { id: "items-source", kind: "source", sourceId: "items" },
        { id: "item-order-lookup", kind: "lookup", inputStepId: "items-source", relationshipId: "item-order", as: "order" },
        { id: "item-product-lookup", kind: "lookup", inputStepId: "item-order-lookup", relationshipId: "item-product", as: "product" },
      ] },
      { id: "customer-c1", name: "Customer C1", glyph: "C", frameLabel: "Orders", outputStepId: "customer-filter", steps: [
        { id: "c1-orders", kind: "source", sourceId: "orders" },
        { id: "customer-filter", kind: "filter", inputStepId: "c1-orders", fieldId: "orders.customerId", operator: "eq", value: "C1" },
      ] },
      { id: "order-totals", name: "Order totals", glyph: "ΣO", frameLabel: "Orders", outputStepId: "orders-sum", steps: [
        { id: "totals-source", kind: "source", sourceId: "orders" },
        { id: "orders-sum", kind: "aggregate", inputStepId: "totals-source", groupBy: [], measures: [{ id: "orderAmount", label: "Order amount", operation: "sum", fieldId: "orders.amount" }] },
      ] },
      { id: "item-totals", name: "Item totals", glyph: "ΣI", frameLabel: "Items", outputStepId: "items-sum", steps: [
        { id: "item-totals-source", kind: "source", sourceId: "items" },
        { id: "items-sum", kind: "aggregate", inputStepId: "item-totals-source", groupBy: [], measures: [{ id: "itemRevenue", label: "Item revenue", operation: "sum", fieldId: "items.revenue" }] },
      ] },
      { id: "order-amount-on-items", name: "Orders represented by items", glyph: "OI", frameLabel: "Items", outputStepId: "distinct-order-sum", steps: [
        { id: "item-order-amount-source", kind: "source", sourceId: "items" },
        { id: "item-order-amount-lookup", kind: "lookup", inputStepId: "item-order-amount-source", relationshipId: "item-order", as: "order" },
        { id: "distinct-order-sum", kind: "aggregate", inputStepId: "item-order-amount-lookup", groupBy: [], measures: [{ id: "distinctOrderAmount", label: "Order amount", operation: "sum", fieldId: "order.amount", entityFieldId: "order.orderId" }] },
      ] },
      { id: "orders-and-items", name: "Orders with item measures", glyph: "OM", frameLabel: "Orders", outputStepId: "orders-items-summary", steps: [
        { id: "orders-items-source", kind: "source", sourceId: "orders" },
        { id: "orders-items-expand", kind: "expand", inputStepId: "orders-items-source", relationshipId: "item-order", as: "item", keepUnmatched: true },
        { id: "orders-items-summary", kind: "aggregate", inputStepId: "orders-items-expand", groupBy: ["orders.orderId"], measures: [
          { id: "orderAmount", label: "Order amount", operation: "sum", fieldId: "orders.amount", entityFieldId: "orders.orderId" },
          { id: "itemCount", label: "Items", operation: "count", fieldId: "item.itemId" },
          { id: "itemRevenue", label: "Item revenue", operation: "sum", fieldId: "item.revenue" },
        ] },
      ] },
      { id: "customer-items-c1", name: "C1 items", glyph: "CI", frameLabel: "Items", outputStepId: "c1-items-filter", steps: [
        { id: "c1-item-source", kind: "source", sourceId: "items" },
        { id: "c1-item-order", kind: "lookup", inputStepId: "c1-item-source", relationshipId: "item-order", as: "order" },
        { id: "c1-item-customer", kind: "lookup", inputStepId: "c1-item-order", relationshipId: "order-customer", inputFieldId: "order.customerId", as: "customer" },
        { id: "c1-items-filter", kind: "filter", inputStepId: "c1-item-customer", fieldId: "customer.customerId", operator: "eq", value: "C1" },
      ] },
      { id: "customer-instance", name: "Customer and dates", glyph: "D", frameLabel: "Orders", outputStepId: "instance-date-end", steps: [
        { id: "instance-orders", kind: "source", sourceId: "orders" },
        { id: "instance-customer", kind: "filter", inputStepId: "instance-orders", fieldId: "orders.customerId", operator: "eq", parameterId: "customerId" },
        { id: "instance-date-start", kind: "filter", inputStepId: "instance-customer", fieldId: "orders.orderedAt", operator: "gte", parameterId: "dateStart" },
        { id: "instance-date-end", kind: "filter", inputStepId: "instance-date-start", fieldId: "orders.orderedAt", operator: "lte", parameterId: "dateEnd" },
      ] },
      { id: "product-revenue", name: "Product revenue", glyph: "R", frameLabel: "Items", outputStepId: "product-revenue-sum", steps: [
        { id: "product-items", kind: "source", sourceId: "items" },
        { id: "product-filter", kind: "filter", inputStepId: "product-items", fieldId: "items.revenue", operator: "gte", value: 10 },
        { id: "product-calc", kind: "calculate", inputStepId: "product-filter", fieldId: "items.netRevenue", label: "Net revenue", expression: "[\"items.revenue\"] * 1" },
        { id: "product-lookup", kind: "lookup", inputStepId: "product-calc", relationshipId: "item-product", as: "product" },
        { id: "product-revenue-sum", kind: "aggregate", inputStepId: "product-lookup", groupBy: ["product.name"], measures: [{ id: "revenueByProduct", label: "Revenue", operation: "sum", fieldId: "items.netRevenue" }] },
      ] },
      { id: "empty-total", name: "Empty total", glyph: "E", frameLabel: "Orders", outputStepId: "empty-summary", steps: [
        { id: "empty-orders", kind: "source", sourceId: "orders" },
        { id: "empty-filter", kind: "filter", inputStepId: "empty-orders", fieldId: "orders.amount", operator: "gt", value: 1000 },
        { id: "empty-summary", kind: "aggregate", inputStepId: "empty-filter", groupBy: [], measures: [
          { id: "emptySum", label: "Amount", operation: "sum", fieldId: "orders.amount" },
          { id: "emptyCount", label: "Orders", operation: "count" },
        ] },
      ] },
    ],
    parameters: [
      { id: "customerId", name: "Customer", type: "string", required: true },
      { id: "dateStart", name: "From date", type: "date", required: true },
      { id: "dateEnd", name: "To date", type: "date", required: true },
    ],
  };
  return { project, sources: { customers, orders, items, products } };
}
