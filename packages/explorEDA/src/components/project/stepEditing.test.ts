import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import {
  appendSteps,
  calculateStep,
  expressionProblem,
  filterValue,
  followRelationship,
  queryFields,
  relationshipQuery,
  removeStep,
} from "./stepEditing";
import { compileProjectText, exportProjectText } from "@/lib/dsl/project";
import { sourceView } from "./queryEditing";

const { project } = createShopFixture();
const query = (id: string) => project.queries.find((item) => item.id === id)!;

describe("step editing", () => {
  it("follows a relationship as a lookup at the end of the query", () => {
    const result = followRelationship({
      project,
      query: query("customer-instance"),
      relationship: project.relationships.find(
        (item) => item.id === "order-customer"
      )!,
      mode: "lookup",
    });
    expect(result.kind).toBe("replace");
    if (result.kind !== "replace") return;
    const next = result.project.queries.find(
      (item) => item.id === "customer-instance"
    )!;
    const added = next.steps.at(-1)!;
    expect(added).toMatchObject({
      kind: "lookup",
      relationshipId: "order-customer",
    });
    expect(next.outputStepId).toBe(added.id);
    expect(
      queryFields(result.project, next.id).output.some((field) =>
        field.id.endsWith(".name")
      )
    ).toBe(true);
  });

  it("opens expansion as a new view instead of changing the rows", () => {
    const result = followRelationship({
      project,
      query: query("orders-by-customer"),
      relationship: project.relationships.find(
        (item) => item.id === "item-order"
      )!,
      mode: "expand",
    });
    expect(result.kind).toBe("open");
  });

  it("adds a calculation with a unique field and checks its inputs", () => {
    const orders = query("customer-instance");
    const fields = queryFields(project, orders.id).output;
    expect(expressionProblem('["nope"] * 2', fields)).toBe(
      "Unknown fields: nope"
    );
    const step = calculateStep(
      orders,
      [...fields, { id: "double", name: "x", origin: { stepId: "x" } }],
      "Double",
      '["orders.amount"] * 2'
    );
    expect(step.fieldId).toBe("double_2");
    const next = appendSteps(project, orders, [step]);
    expect(
      queryFields(next, orders.id).output.map((field) => field.id)
    ).toContain("double_2");
  });

  it("reads filter text as the field's type", () => {
    expect(
      filterValue("20", {
        id: "a",
        name: "a",
        type: "number",
        origin: { stepId: "s" },
      })
    ).toBe(20);
    expect(
      filterValue("20", {
        id: "a",
        name: "a",
        type: "string",
        origin: { stepId: "s" },
      })
    ).toBe("20");
  });

  it("names the fields and views a removal breaks", () => {
    const orders = query("orders-by-customer");
    const settings = {
      charts: [
        {
          id: "bar",
          type: "bar",
          title: "By customer",
          field: "customer.name",
          filters: [],
        },
      ],
      calculations: [],
    } as unknown as SavedDataStructure;
    const removal = removeStep(project, orders, "order-customer-lookup", [
      { id: "v", name: "By customer", queryId: orders.id, settings },
    ]);
    expect(removal.blocked).toBeUndefined();
    expect(removal.lostFields).toContain("Customers Name");
    expect(removal.brokenViews).toEqual([
      { id: "v", name: "By customer", fields: ["Customers Name"] },
    ]);
    const next = removal.project!.queries.find(
      (item) => item.id === orders.id
    )!;
    expect(next.outputStepId).toBe("orders-source");
  });

  it("keeps the first step that reads a table", () => {
    expect(
      removeStep(project, query("orders-by-customer"), "orders-source").blocked
    ).toBeTruthy();
  });

  it("writes a relationship's lookup as plain project text", () => {
    const relationship = project.relationships.find(
      (item) => item.id === "order-customer"
    )!;
    // A query that reads one table, as each added table gets.
    const start = sourceView(project, "orders");
    const orders = start.project.queries.find(
      (item) => item.id === start.view.queryId
    )!;
    const result = followRelationship({
      project: start.project,
      query: orders,
      relationship,
      mode: "lookup",
    });
    if (result.kind !== "replace") throw new Error(result.kind);
    const text = exportProjectText(result.project);
    expect(text).toMatch(
      /query @orders glyph=\S+ frame=Orders \{\n {2}source orders\n {2}lookup customers via=order-customer on=orders\.customerId\n\}/
    );
    const compiled = compileProjectText(text);
    expect(compiled.diagnostics).toEqual([]);
    expect(
      compiled.project.queries.find((item) => item.id === "orders")
    ).toEqual(result.project.queries.find((item) => item.id === "orders"));
  });

  it("starts a new query from a relationship's many side with its lookup", () => {
    const next = relationshipQuery(
      project,
      project.relationships.find((item) => item.id === "item-product")!
    );
    expect(next.name).toBe("Items with Products");
    expect(next.view.queryId).toBe("items");
    const text = exportProjectText(next.project);
    expect(text).toMatch(
      /query @items "Items with Products" glyph=\S+ frame=Items \{\n {2}source items\n {2}lookup products via=item-product on=items\.productId\n\}/
    );
    expect(
      queryFields(next.project, "items").output.map((field) => field.id)
    ).toContain("products.name");
  });
});
