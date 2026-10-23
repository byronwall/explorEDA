import { describe, expect, it } from "vitest";
import { buildValuesProfile } from "@/lib/fieldProfiles";
import { startSuggestions } from "./startSuggestions";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const regions = range(40).map((i) => ["North", "South", "East"][i % 3]);
const amounts = range(40).map((i) => i * 1.5);
const costs = range(40).map((i) => i * 0.75 + (i % 4));
const ids = range(40).map((i) => `order-${i}`);
const dates = range(40).map(
  (i) => `2024-01-${String(1 + (i % 15)).padStart(2, "0")}`
);

describe("startSuggestions", () => {
  it("offers counts by a category, a measure's spread, and a date by day", () => {
    const suggestions = startSuggestions([
      buildValuesProfile("Order ID", ids, "categorical"),
      buildValuesProfile("Region", regions, "categorical"),
      buildValuesProfile("Amount", amounts, "numeric"),
      buildValuesProfile("Ordered", dates, "datetime"),
    ]);
    expect(suggestions).toEqual([
      { type: "row", field: "Region" },
      { type: "bar", field: "Amount" },
      { type: "calendar", field: "Ordered" },
    ]);
  });

  it("plots two measures against each other when there is no date", () => {
    expect(
      startSuggestions([
        buildValuesProfile("Amount", amounts, "numeric"),
        buildValuesProfile("Cost", costs, "numeric"),
      ])
    ).toEqual([
      { type: "bar", field: "Amount" },
      { type: "scatter", field: "Amount", yField: "Cost" },
    ]);
  });

  it("skips fields that name each row or hold one value", () => {
    expect(
      startSuggestions([
        buildValuesProfile("Order ID", ids, "categorical"),
        buildValuesProfile(
          "Store",
          range(40).map(() => "Main"),
          "categorical"
        ),
      ])
    ).toEqual([]);
  });

  it("skips fields named like an ID but keeps words that end in id", () => {
    const counts = range(40).map((i) => i);
    expect(
      startSuggestions([
        buildValuesProfile("id", counts, "numeric"),
        buildValuesProfile("customerId", counts, "numeric"),
        buildValuesProfile("Order ID", counts, "numeric"),
        buildValuesProfile("Amount paid", amounts, "numeric"),
      ])
    ).toEqual([{ type: "bar", field: "Amount paid" }]);
  });
});
