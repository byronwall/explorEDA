import { describe, expect, it } from "vitest";
import { summaryTableDefinition } from "./definition";

describe("summaryTableDefinition", () => {
  it("keeps rows that pass every sparkline filter", () => {
    const settings = {
      ...summaryTableDefinition.createDefaultSettings({
        x: 0,
        y: 0,
        w: 1,
        h: 1,
      }),
      filters: [
        { type: "value" as const, field: "kind", values: ["a"] },
        { type: "range" as const, field: "score", min: 2, max: 3 },
      ],
    };
    const columns: Record<string, Record<number, string | number>> = {
      kind: { 0: "a", 1: "a", 2: "b" },
      score: { 0: 1, 1: 2, 2: 2 },
    };
    const passes = summaryTableDefinition.getFilterFunction(
      settings,
      (name) => columns[name]!
    );
    expect([0, 1, 2].filter((id) => passes(id))).toEqual([1]);
  });
});
