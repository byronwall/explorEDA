import { describe, expect, it } from "vitest";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { createShopFixture } from "@/test/fixtures/shopProject";
import {
  parseAnalysisProject,
  selectAnalysisProjectView,
  stringifyAnalysisProject,
} from "@/lib/analysis/projectFile";
import type { AnalysisProject } from "@/types/AnalysisProject";

describe("multi-source analysis", () => {
  it("keeps lookup row counts and totals at their declared grain", () => {
    const { project, sources } = createShopFixture();
    const orders = evaluateAnalysisQuery(
      project,
      sources,
      "orders-by-customer"
    );
    const items = evaluateAnalysisQuery(project, sources, "items-by-order");
    const orderTotal = evaluateAnalysisQuery(project, sources, "order-totals");
    const itemTotal = evaluateAnalysisQuery(project, sources, "item-totals");
    const distinctOrderTotal = evaluateAnalysisQuery(
      project,
      sources,
      "order-amount-on-items"
    );
    const orderItems = evaluateAnalysisQuery(
      project,
      sources,
      "orders-and-items"
    );
    const orderRevision = orderTotal.revision;

    expect(orders.rows).toHaveLength(5);
    expect(
      orders.rows.reduce(
        (sum, row) => sum + Number(row.values["orders.amount"]),
        0
      )
    ).toBe(150);
    expect(
      orders.diagnostics.filter((item) => item.code === "missing-lookup")
    ).toHaveLength(1);
    expect(items.rows).toHaveLength(8);
    expect(
      new Set(items.rows.map((row) => row.values["order.orderId"])).size
    ).toBe(4);
    expect(orderTotal.rows[0]!.values.orderAmount).toBe(150);
    expect(itemTotal.rows[0]!.values.itemRevenue).toBe(140);
    expect(distinctOrderTotal.rows[0]!.values.distinctOrderAmount).toBe(140);
    expect(distinctOrderTotal.stages.map((stage) => stage.outputCount)).toEqual(
      [8, 8, 1]
    );
    expect(
      distinctOrderTotal.rows[0]!.contributors.filter(
        (item) => item.sourceId === "orders"
      )
    ).toHaveLength(4);
    expect(orderItems.rows).toHaveLength(5);
    expect(
      orderItems.rows.reduce(
        (sum, row) => sum + Number(row.values.orderAmount),
        0
      )
    ).toBe(150);
    expect(
      orderItems.rows.reduce(
        (sum, row) => sum + Number(row.values.itemRevenue ?? 0),
        0
      )
    ).toBe(140);
    expect(
      orderItems.rows.find((row) => row.values["orders.orderId"] === "O5")
        ?.values.itemRevenue
    ).toBeUndefined();
    expect(orderItems.rows.map((row) => row.values.itemCount)).toEqual([
      2, 1, 3, 2, 0,
    ]);
    const changedSources = structuredClone(sources);
    changedSources.orders![0]!.amount = 31;
    expect(
      evaluateAnalysisQuery(project, changedSources, "order-totals").revision
    ).not.toBe(orderRevision);
    const changedProject = structuredClone(project);
    const totalStep = changedProject.queries.find(
      (query) => query.id === "order-totals"
    )!.steps[1]!;
    if (totalStep.kind === "aggregate")
      totalStep.measures[0]!.label = "Revised order amount";
    expect(
      evaluateAnalysisQuery(changedProject, sources, "order-totals").revision
    ).not.toBe(orderRevision);
  });

  it("reports ambiguity and duplicate identity without choosing the first match", () => {
    const ambiguous = createShopFixture("duplicate-customer-key");
    const result = evaluateAnalysisQuery(
      ambiguous.project,
      ambiguous.sources,
      "orders-by-customer"
    );
    const o1 = result.rows.find(
      (row) => row.values["orders.orderId"] === "O1"
    )!;
    expect(o1.values["customer.name"]).toBeUndefined();
    expect(
      result.diagnostics.some((item) => item.code === "ambiguous-lookup")
    ).toBe(true);
    expect(
      o1.contributors.filter((item) => item.sourceId === "customers")
    ).toHaveLength(2);

    const duplicateEntity = createShopFixture("duplicate-entity-id");
    const duplicateResult = evaluateAnalysisQuery(
      duplicateEntity.project,
      duplicateEntity.sources,
      "orders-by-customer"
    );
    expect(
      duplicateResult.diagnostics.some(
        (item) => item.code === "duplicate-key" && item.sourceId === "orders"
      )
    ).toBe(true);
    expect(
      new Set(duplicateResult.rows.map((row) => row.sourceRows[0]!.rowKey)).size
    ).toBe(5);
  });

  it("keeps null and unlike scalar keys from matching", () => {
    const nullKey = createShopFixture("null-key");
    const nullResult = evaluateAnalysisQuery(
      nullKey.project,
      nullKey.sources,
      "orders-by-customer"
    );
    expect(
      nullResult.diagnostics.some(
        (item) => item.code === "missing-key" && item.sourceId === "customers"
      )
    ).toBe(true);
    expect(
      nullResult.rows.find((row) => row.values["orders.orderId"] === "O1")
        ?.values["customer.name"]
    ).toBeUndefined();

    const mixed = createShopFixture("mixed-key-types");
    const mixedResult = evaluateAnalysisQuery(
      mixed.project,
      mixed.sources,
      "orders-by-customer"
    );
    expect(
      mixedResult.rows.find((row) => row.values["orders.orderId"] === "O1")
        ?.values["customer.name"]
    ).toBeUndefined();
    expect(
      mixedResult.diagnostics.some(
        (item) => item.code === "missing-lookup" && item.value === 1
      )
    ).toBe(true);
    const invalidKey = createShopFixture();
    invalidKey.sources.customers![0]!.customerId = NaN;
    invalidKey.sources.orders![0]!.customerId = NaN;
    expect(
      evaluateAnalysisQuery(
        invalidKey.project,
        invalidKey.sources,
        "orders-by-customer"
      ).rows[0]!.values["customer.name"]
    ).toBeUndefined();
  });

  it("follows calculation, filter, aggregate, and typed parameter steps", () => {
    const { project, sources } = createShopFixture();
    const revenue = evaluateAnalysisQuery(project, sources, "product-revenue");
    expect(
      revenue.rows.reduce(
        (sum, row) => sum + Number(row.values.revenueByProduct),
        0
      )
    ).toBe(140);
    expect(
      revenue.stages.map((stage) => [stage.inputCount, stage.outputCount])
    ).toEqual([
      [8, 8],
      [8, 8],
      [8, 8],
      [8, 8],
      [8, 3],
    ]);
    const emptyTotal = evaluateAnalysisQuery(project, sources, "empty-total");
    expect(emptyTotal.stages.map((stage) => stage.outputCount)).toEqual([
      5, 0, 1,
    ]);
    expect(emptyTotal.rows[0]!.values.emptySum).toBeUndefined();
    expect(emptyTotal.rows[0]!.values.emptyCount).toBe(0);

    const customer = evaluateAnalysisQuery(
      project,
      sources,
      "customer-instance",
      { customerId: "C1", dateStart: "2025-01-01", dateEnd: "2025-02-01" }
    );
    expect(customer.rows).toHaveLength(2);
    expect(customer.rows.map((row) => row.values["orders.orderId"])).toEqual([
      "O1",
      "O2",
    ]);
    const empty = evaluateAnalysisQuery(project, sources, "customer-instance", {
      customerId: "C4",
      dateStart: "2025-01-01",
      dateEnd: "2025-12-31",
    });
    expect(empty.rows).toHaveLength(0);
    const missingBinding = evaluateAnalysisQuery(
      project,
      sources,
      "customer-instance",
      {}
    );
    expect(
      missingBinding.diagnostics.filter(
        (item) => item.code === "missing-parameter"
      )
    ).toHaveLength(3);
  });

  it("rejects cyclic queries and round trips project and view dependencies", () => {
    const { project, sources } = createShopFixture();
    const cyclic = structuredClone(project) as AnalysisProject;
    cyclic.queries[0]!.steps[0] = {
      id: "orders-source",
      kind: "filter",
      inputStepId: "order-customer-lookup",
      fieldId: "orders.amount",
      operator: "gt",
      value: 0,
    };
    expect(() =>
      evaluateAnalysisQuery(cyclic, sources, "orders-by-customer")
    ).toThrow("cycle");

    const fileProject = structuredClone(project);
    fileProject.sources
      .find((source) => source.id === "customers")!
      .fields.push({
        id: "__exploreda_value__",
        name: "Reserved name",
        type: "string",
      });
    const file = {
      format: "exploreda-project" as const,
      version: 1 as const,
      project: fileProject,
      tables: {
        ...sources,
        customers: [
          ...sources.customers!,
          { customerId: "C5", name: undefined, joinedAt: "2025-06-01" },
          { __exploreda_value__: "NaN" },
        ],
      },
      views: [
        {
          id: "items-view",
          name: "Items",
          queryId: "items-by-order",
          selectedRowKeys: ["items:string:I1"],
        },
      ],
    };
    const parsed = parseAnalysisProject(stringifyAnalysisProject(file));
    expect(parsed.tables.customers![4]!.name).toBeUndefined();
    expect(parsed.tables.customers![5]!.__exploreda_value__).toBe("NaN");
    const extendedFile = {
      ...parsed,
      history: [{ id: "old-query" }],
      path: "/private/project.json",
      cursor: 9,
    };
    const fullFile = parseAnalysisProject(
      stringifyAnalysisProject(extendedFile)
    );
    expect(
      "history" in fullFile || "path" in fullFile || "cursor" in fullFile
    ).toBe(false);
    const closure = selectAnalysisProjectView(extendedFile, "items-view");
    expect(closure.project.queries.map((query) => query.id)).toEqual([
      "items-by-order",
    ]);
    expect(Object.keys(closure.tables).sort()).toEqual([
      "items",
      "orders",
      "products",
    ]);
    expect(
      "history" in closure || "path" in closure || "cursor" in closure
    ).toBe(false);
    expect(() =>
      parseAnalysisProject(
        JSON.stringify({
          ...file,
          activeViewId: "items-view",
          tables: { ...file.tables, customers: [null] },
        })
      )
    ).toThrow("row 0 must be an object");
    const nonfinite = createShopFixture();
    nonfinite.sources.orders![0]!.amount = NaN;
    nonfinite.sources.orders![1]!.amount = Infinity;
    nonfinite.sources.orders![2]!.amount = -Infinity;
    nonfinite.sources.orders![3]!.amount = NaN;
    nonfinite.sources.orders![4]!.amount = NaN;
    const nonfiniteStep = nonfinite.project.queries.find(
      (query) => query.id === "order-totals"
    )!.steps[1]!;
    if (nonfiniteStep.kind === "aggregate")
      nonfiniteStep.groupBy = ["orders.amount"];
    const nonfiniteGroups = evaluateAnalysisQuery(
      nonfinite.project,
      nonfinite.sources,
      "order-totals"
    );
    expect(nonfiniteGroups.rows).toHaveLength(3);
    expect(
      new Set(nonfiniteGroups.rows.map((row) => row.values["orders.amount"]))
    ).toEqual(new Set([NaN, Infinity, -Infinity]));

    const badAliasProject = structuredClone(fileProject);
    const aliasStep = badAliasProject.queries.find(
      (query) => query.id === "items-by-order"
    )!.steps[1]!;
    if (aliasStep.kind === "lookup") aliasStep.as = "items";
    expect(() =>
      stringifyAnalysisProject({ ...file, project: badAliasProject })
    ).toThrow("duplicate field id");
    expect(() =>
      evaluateAnalysisQuery(badAliasProject, file.tables, "items-by-order")
    ).toThrow("duplicate field id");
    const duplicateMeasureProject = structuredClone(fileProject);
    const orderAggregate = duplicateMeasureProject.queries.find(
      (query) => query.id === "order-totals"
    )!.steps[1]!;
    if (orderAggregate.kind === "aggregate")
      orderAggregate.measures.push({ ...orderAggregate.measures[0]! });
    expect(() =>
      stringifyAnalysisProject({ ...file, project: duplicateMeasureProject })
    ).toThrow("duplicates output field");
    expect(() =>
      evaluateAnalysisQuery(
        duplicateMeasureProject,
        file.tables,
        "order-totals"
      )
    ).toThrow("duplicate field id");
  });
});
