import { describe, expect, it } from "vitest";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { createShopFixture } from "@/lib/analysis/shopFixture";
import { parseAnalysisProject, selectAnalysisProjectView, stringifyAnalysisProject, stringifyAnalysisState, parseAnalysisState } from "@/lib/analysis/projectFile";
import type { AnalysisProject } from "@/types/AnalysisProject";

describe("multi-source analysis", () => {
  it("keeps lookup row counts and totals at their declared grain", () => {
    const { project, sources } = createShopFixture();
    const orders = evaluateAnalysisQuery(project, sources, "orders-by-customer");
    const items = evaluateAnalysisQuery(project, sources, "items-by-order");
    const orderTotal = evaluateAnalysisQuery(project, sources, "order-totals");
    const itemTotal = evaluateAnalysisQuery(project, sources, "item-totals");
    const distinctOrderTotal = evaluateAnalysisQuery(project, sources, "order-amount-on-items");
    const orderItems = evaluateAnalysisQuery(project, sources, "orders-and-items");
    const orderRevision = orderTotal.revision;

    expect(orders.rows).toHaveLength(5);
    expect(orders.rows.reduce((sum, row) => sum + Number(row.values["orders.amount"]), 0)).toBe(150);
    expect(orders.diagnostics.filter((item) => item.code === "missing-lookup")).toHaveLength(1);
    expect(items.rows).toHaveLength(8);
    expect(new Set(items.rows.map((row) => row.values["order.orderId"])).size).toBe(4);
    expect(orderTotal.rows[0]!.values.orderAmount).toBe(150);
    expect(itemTotal.rows[0]!.values.itemRevenue).toBe(140);
    expect(distinctOrderTotal.rows[0]!.values.distinctOrderAmount).toBe(140);
    expect(distinctOrderTotal.stages.map((stage) => stage.outputCount)).toEqual([8, 8, 1]);
    expect(distinctOrderTotal.rows[0]!.contributors.filter((item) => item.sourceId === "orders")).toHaveLength(4);
    expect(orderItems.rows).toHaveLength(5);
    expect(orderItems.rows.reduce((sum, row) => sum + Number(row.values.orderAmount), 0)).toBe(150);
    expect(orderItems.rows.reduce((sum, row) => sum + Number(row.values.itemRevenue ?? 0), 0)).toBe(140);
    expect(orderItems.rows.find((row) => row.values["orders.orderId"] === "O5")?.values.itemRevenue).toBeUndefined();
    expect(orderItems.rows.map((row) => row.values.itemCount)).toEqual([2, 1, 3, 2, 0]);
    const changedSources = structuredClone(sources);
    changedSources.orders![0]!.amount = 31;
    expect(evaluateAnalysisQuery(project, changedSources, "order-totals").revision).not.toBe(orderRevision);
    const changedProject = structuredClone(project);
    const totalStep = changedProject.queries.find((query) => query.id === "order-totals")!.steps[1]!;
    if (totalStep.kind === "aggregate") totalStep.measures[0]!.label = "Revised order amount";
    expect(evaluateAnalysisQuery(changedProject, sources, "order-totals").revision).not.toBe(orderRevision);
  });

  it("reports ambiguity and duplicate identity without choosing the first match", () => {
    const ambiguous = createShopFixture("duplicate-customer-key");
    const result = evaluateAnalysisQuery(ambiguous.project, ambiguous.sources, "orders-by-customer");
    const o1 = result.rows.find((row) => row.values["orders.orderId"] === "O1")!;
    expect(o1.values["customer.name"]).toBeUndefined();
    expect(result.diagnostics.some((item) => item.code === "ambiguous-lookup")).toBe(true);
    expect(o1.contributors.filter((item) => item.sourceId === "customers")).toHaveLength(2);

    const duplicateEntity = createShopFixture("duplicate-entity-id");
    const duplicateResult = evaluateAnalysisQuery(duplicateEntity.project, duplicateEntity.sources, "orders-by-customer");
    expect(duplicateResult.diagnostics.some((item) => item.code === "duplicate-key" && item.sourceId === "orders")).toBe(true);
    expect(new Set(duplicateResult.rows.map((row) => row.sourceRows[0]!.rowKey)).size).toBe(5);
  });

  it("keeps null and unlike scalar keys from matching", () => {
    const nullKey = createShopFixture("null-key");
    const nullResult = evaluateAnalysisQuery(nullKey.project, nullKey.sources, "orders-by-customer");
    expect(nullResult.diagnostics.some((item) => item.code === "missing-key" && item.sourceId === "customers")).toBe(true);
    expect(nullResult.rows.find((row) => row.values["orders.orderId"] === "O1")?.values["customer.name"]).toBeUndefined();

    const mixed = createShopFixture("mixed-key-types");
    const mixedResult = evaluateAnalysisQuery(mixed.project, mixed.sources, "orders-by-customer");
    expect(mixedResult.rows.find((row) => row.values["orders.orderId"] === "O1")?.values["customer.name"]).toBeUndefined();
    expect(mixedResult.diagnostics.some((item) => item.code === "missing-lookup" && item.value === 1)).toBe(true);
  });

  it("follows calculation, filter, aggregate, and typed parameter steps", () => {
    const { project, sources } = createShopFixture();
    const revenue = evaluateAnalysisQuery(project, sources, "product-revenue");
    expect(revenue.rows.reduce((sum, row) => sum + Number(row.values.revenueByProduct), 0)).toBe(140);
    expect(revenue.stages.map((stage) => [stage.inputCount, stage.outputCount])).toEqual([[8, 8], [8, 8], [8, 8], [8, 8], [8, 3]]);

    const customer = evaluateAnalysisQuery(project, sources, "customer-instance", { customerId: "C1", dateStart: "2025-01-01", dateEnd: "2025-02-01" });
    expect(customer.rows).toHaveLength(2);
    expect(customer.rows.map((row) => row.values["orders.orderId"])).toEqual(["O1", "O2"]);
    const empty = evaluateAnalysisQuery(project, sources, "customer-instance", { customerId: "C4", dateStart: "2025-01-01", dateEnd: "2025-12-31" });
    expect(empty.rows).toHaveLength(0);
    const missingBinding = evaluateAnalysisQuery(project, sources, "customer-instance", {});
    expect(missingBinding.diagnostics.filter((item) => item.code === "missing-parameter")).toHaveLength(3);
  });

  it("rejects cyclic queries and round trips project and view dependencies", () => {
    const { project, sources } = createShopFixture();
    const cyclic = structuredClone(project) as AnalysisProject;
    cyclic.queries[0]!.steps[0] = { id: "orders-source", kind: "filter", inputStepId: "order-customer-lookup", fieldId: "orders.amount", operator: "gt", value: 0 };
    expect(() => evaluateAnalysisQuery(cyclic, sources, "orders-by-customer")).toThrow("cycle");

    const file = { format: "exploreda-project" as const, version: 1 as const, project, tables: { ...sources, customers: [...sources.customers!, { customerId: "C5", name: undefined, joinedAt: "2025-06-01" }] }, views: [{ id: "items-view", name: "Items", queryId: "items-by-order", selectedRowKeys: ["items:string:I1"] }] };
    const parsed = parseAnalysisProject(stringifyAnalysisProject(file));
    expect(parsed.tables.customers![4]!.name).toBeUndefined();
    const closure = selectAnalysisProjectView(parsed, "items-view");
    expect(closure.project.queries.map((query) => query.id)).toEqual(["items-by-order"]);
    expect(Object.keys(closure.tables).sort()).toEqual(["items", "orders", "products"]);
    expect(parseAnalysisState<{ value: number }>(stringifyAnalysisState({ value: Infinity })).value).toBe(Infinity);
  });
});
