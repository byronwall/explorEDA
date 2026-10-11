import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import {
  addRelationship,
  blockedByAmbiguity,
  countMatches,
  proposalProblem,
  proposeRelationship,
  queriesUsingRelationship,
  removeRelationship,
} from "./relationshipEditing";

describe("relationship editing", () => {
  it("counts matched, unmatched, and ambiguous rows", () => {
    const counts = countMatches(
      [{ k: 1 }, { k: 2 }, { k: 3 }, { k: null }],
      "k",
      [{ k: 1 }, { k: 2 }, { k: 2 }],
      "k"
    );
    expect(counts).toEqual({
      matched: 2,
      unmatched: 2,
      ambiguous: 1,
      expanded: 1,
    });
    expect(blockedByAmbiguity(counts, "many-to-one")).toBe(true);
    expect(blockedByAmbiguity(counts, "one-to-many")).toBe(false);
  });

  it("names a new link and refuses a duplicate or same-table link", () => {
    const { project } = createShopFixture();
    const from = { sourceId: "items", fieldId: "productId" };
    const to = { sourceId: "products", fieldId: "productId" };
    const relationship = proposeRelationship(project, from, to, "many-to-one");
    expect(relationship.name).toBe("Items to Products");

    const added = addRelationship(
      removeRelationship(project, "item-product"),
      relationship
    );
    expect(proposalProblem(added, from, to)).toBe(
      "This relationship already exists."
    );
    expect(
      proposalProblem(project, from, { sourceId: "items", fieldId: "itemId" })
    ).toBe("Choose a field in another table.");
  });

  it("finds the queries that follow a relationship", () => {
    const { project } = createShopFixture();
    expect(
      queriesUsingRelationship(project, "order-customer").map(
        (query) => query.id
      )
    ).toContain("orders-by-customer");
  });
});
