import { describe, expect, it } from "vitest";
import { calculateGroupedAggregate, AggregateInputRow } from "./aggregates";

const rows: AggregateInputRow[] = [
  { __ID: 0, region: "North", revenue: 10 },
  { __ID: 1, region: "North", revenue: "5" },
  { __ID: 2, region: "South", revenue: 7 },
  { __ID: 3, region: "South", revenue: null },
  { __ID: 4, region: null, revenue: 3 },
];

describe("calculateGroupedAggregate", () => {
  it("keeps typed groups, source IDs, exclusions, and known results", () => {
    const result = calculateGroupedAggregate(rows, {
      id: "revenue-by-region",
      name: "Revenue by region",
      groupField: "region",
      measureField: "revenue",
      aggregation: "sum",
    });

    expect(result.rows).toMatchObject([
      { groupLabel: "North", value: 15, rowCount: 2 },
      { groupLabel: "South", value: 7, rowCount: 2 },
      { groupLabel: "(missing)", value: 3, rowCount: 1 },
    ]);
    expect(result.rows[0]?.contributors.map((item) => item.sourceId)).toEqual([
      0, 1,
    ]);
    expect(result.rows[1]?.contributors[1]).toMatchObject({
      sourceId: 3,
      included: false,
      exclusionReason: "Missing value",
    });
  });

  it("counts rows and returns undefined for an all-invalid numeric group", () => {
    const count = calculateGroupedAggregate(rows, {
      id: "rows-by-region",
      name: "Rows by region",
      groupField: "region",
      aggregation: "count",
    });
    expect(count.rows.map((row) => row.value)).toEqual([2, 2, 1]);

    const average = calculateGroupedAggregate(
      [{ __ID: 0, region: "Only", revenue: null }],
      {
        id: "average-revenue",
        name: "Average revenue",
        groupField: "region",
        measureField: "revenue",
        aggregation: "average",
      }
    );
    expect(average.rows[0]?.value).toBeUndefined();
  });

  it("keeps numeric and string group identities separate", () => {
    const result = calculateGroupedAggregate(
      [
        { __ID: 0, region: "North", revenue: "12.50" },
        { __ID: 1, region: "North", revenue: "7.5" },
        { __ID: 2, region: "North", revenue: "bad" },
        { __ID: 3, region: "South", revenue: "20" },
        { __ID: 4, region: "South", revenue: null },
        { __ID: 5, region: "South", revenue: "5.25" },
        { __ID: 6, region: 1, revenue: "4" },
        { __ID: 7, region: "1", revenue: "6" },
      ],
      {
        id: "revenue-by-region",
        name: "Revenue by region",
        groupField: "region",
        measureField: "revenue",
        aggregation: "sum",
      }
    );

    expect(result.rows.map((row) => [row.groupValue, row.value])).toEqual([
      ["North", 20],
      ["South", 25.25],
      [1, 4],
      ["1", 6],
    ]);
    expect(result.rows[0]?.contributors[2]).toMatchObject({
      sourceId: 2,
      input: "bad",
      included: false,
      exclusionReason: "Not a finite number",
    });
    expect(result.rows[1]?.contributors[1]).toMatchObject({
      sourceId: 4,
      input: null,
      included: false,
      exclusionReason: "Missing value",
    });
  });

  it("keeps zero and negative results without inventing values", () => {
    const result = calculateGroupedAggregate(
      [
        { __ID: 0, group: "zero", value: 0 },
        { __ID: 1, group: "negative", value: -2 },
        { __ID: 2, group: "negative", value: 1 },
        { __ID: 3, group: "invalid", value: "bad" },
      ],
      {
        id: "signed-values",
        name: "Signed values",
        groupField: "group",
        measureField: "value",
        aggregation: "sum",
      }
    );

    expect(result.rows.map((row) => row.value)).toEqual([0, -1, undefined]);
  });

  it("preserves exact raw inputs and supplied conversion reasons", () => {
    const result = calculateGroupedAggregate(
      [
        { __ID: 0, group: "x", value: undefined },
        { __ID: 1, group: "x", value: undefined },
        { __ID: 2, group: "x", value: undefined },
      ],
      {
        id: "forensics",
        name: "Forensics",
        groupField: "group",
        measureField: "value",
        aggregation: "sum",
      },
      { 0: "bad", 1: "NULL", 2: null },
      { 0: "Conversion failed: Not a finite number" }
    );

    expect(result.rows[0]?.contributors).toMatchObject([
      { rawInput: "bad", exclusionReason: "Conversion failed: Not a finite number" },
      { rawInput: "NULL", exclusionReason: "Missing value" },
      { rawInput: null, exclusionReason: "Missing value" },
    ]);
  });
});
