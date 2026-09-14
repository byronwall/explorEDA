import { describe, expect, it } from "vitest";
import { calculatePivotData } from "../utils/calculations";
import { pivotTableDefinition, PivotTableSettings } from "../definition";

const settings = (overrides: Partial<PivotTableSettings>) =>
  ({
    rowFields: [],
    columnField: "",
    valueFields: [],
    ...overrides,
  }) as PivotTableSettings;

describe("calculatePivotData", () => {
  it("keeps composite row values and types separate", () => {
    const result = calculatePivotData(
      [
        { first: "a:b", second: "c", amount: 1 },
        { first: "a", second: "b:c", amount: 2 },
        { first: 1, second: "same", amount: 3 },
        { first: "1", second: "same", amount: 4 },
      ],
      settings({
        rowFields: ["first", "second"],
        valueFields: [{ field: "amount", aggregation: "sum" }],
      })
    );

    expect(result.rows).toHaveLength(4);
    expect(result.rows.map((row) => row.cells[0]!.value)).toEqual([1, 2, 3, 4]);
  });

  it("ignores invalid numeric values instead of treating them as zero", () => {
    const result = calculatePivotData(
      [
        { group: "all", amount: 10 },
        { group: "all", amount: "bad" },
        { group: "all", amount: 20 },
      ],
      settings({
        rowFields: ["group"],
        valueFields: [{ field: "amount", aggregation: "avg" }],
      })
    );

    expect(result.rows[0]!.cells[0]!.value).toBe(15);
  });
});

describe("pivotTableDefinition.validateSettings", () => {
  it("rejects empty value fields and malformed selections", () => {
    expect(
      pivotTableDefinition.validateSettings(settings({ valueFields: [] }))
    ).toBe(false);
    expect(
      pivotTableDefinition.validateSettings(
        settings({
          rowFields: ["group", "group"],
          valueFields: [{ field: "amount", aggregation: "sum" }],
        })
      )
    ).toBe(false);
    expect(
      pivotTableDefinition.validateSettings(
        settings({
          rowFields: ["group"],
          valueFields: [{ field: "", aggregation: "count" }],
        })
      )
    ).toBe(false);
    expect(
      pivotTableDefinition.validateSettings(
        settings({
          rowFields: ["group"],
          valueFields: [{ field: "amount", aggregation: "sum" }],
        })
      )
    ).toBe(true);
  });
});
