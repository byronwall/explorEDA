import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { exportProjectText } from "@/lib/dsl/project";
import { sourceView } from "./queryEditing";
import { lookupField, relatedTables } from "./relatedFields";
import { queryFields } from "./stepEditing";

const { project } = createShopFixture();

function fresh(sourceId: string) {
  const start = sourceView(project, sourceId);
  const query = start.project.queries.find(
    (item) => item.id === start.view.queryId
  )!;
  return { project: start.project, query };
}

const related = (next: ReturnType<typeof fresh>) =>
  relatedTables(
    next.project,
    next.query,
    queryFields(next.project, next.query.id).output
  );

describe("related fields", () => {
  it("lists lookups that keep the rows, and links that multiply them apart", () => {
    const items = related(fresh("items"));
    expect(items.lookups.map((table) => table.label)).toEqual([
      "Orders",
      "Products",
    ]);
    // The matched key repeats the row's own field.
    expect(items.lookups[1]!.fields.map((field) => field.name)).toEqual([
      "Product",
    ]);
    expect(items.expands).toEqual([]);

    const orders = related(fresh("orders"));
    expect(orders.lookups.map((table) => table.label)).toEqual(["Customers"]);
    expect(orders.expands.map((table) => table.label)).toEqual(["Items"]);
  });

  it("leaves out followed relationships and reaches on through a lookup", () => {
    const query = project.queries.find((item) => item.id === "items-by-order")!;
    const { lookups } = relatedTables(
      project,
      query,
      queryFields(project, query.id).output
    );
    // Items already look up Orders and Products; Orders lead on to Customers.
    expect(lookups.map((table) => table.label)).toEqual(["Customers"]);
  });

  it("adds the lookup and names the field it brings", () => {
    const start = fresh("items");
    const result = lookupField(
      start.project,
      start.query,
      "item-product",
      "name"
    )!;
    expect(result.fieldId).toBe("products.name");
    expect(exportProjectText(result.project)).toMatch(
      /query @items glyph=\S+ frame=Items \{\n {2}source items\n {2}lookup products via=item-product on=items\.productId\n\}/
    );
    expect(
      queryFields(result.project, "items").output.map((field) => field.id)
    ).toContain("products.name");
  });
});
