import { describe, expect, it } from "vitest";
import { summarizeGroup } from "@/lib/aggregates";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";

const measures = [
  { id: "count", label: "Entities", operation: "count" as const },
  { id: "present", label: "Present", operation: "count" as const },
  { id: "sum", label: "Sum", operation: "sum" as const },
  { id: "average", label: "Average", operation: "average" as const },
].map((measure) => ({
  ...measure,
  entityFieldId: "entities.id",
  ...(measure.id === "count" ? {} : { fieldId: "w.amount" }),
}));

// Each entity expands to its witness rows, then one aggregate counts and
// totals the witness amount once per entity.
const project: AnalysisProject = {
  id: "entity-grain",
  version: 1,
  sources: [
    {
      id: "entities",
      name: "Entities",
      glyph: "E",
      entityKey: "id",
      fields: [{ id: "id", name: "ID" }],
    },
    {
      id: "witnesses",
      name: "Witnesses",
      glyph: "W",
      entityKey: "id",
      fields: ["id", "entity", "amount"].map((id) => ({ id, name: id })),
    },
  ],
  relationships: [
    {
      id: "w",
      name: "Witnesses",
      from: { sourceId: "entities", fieldId: "id" },
      to: { sourceId: "witnesses", fieldId: "entity" },
      cardinality: "one-to-many",
    },
  ],
  queries: [
    {
      id: "q",
      name: "Q",
      glyph: "Q",
      frameLabel: "entities",
      outputStepId: "total",
      steps: [
        { id: "start", kind: "source", sourceId: "entities" },
        {
          id: "expand",
          kind: "expand",
          inputStepId: "start",
          relationshipId: "w",
          as: "w",
        },
        {
          id: "total",
          kind: "aggregate",
          inputStepId: "expand",
          groupBy: [],
          measures,
        },
      ],
    },
  ],
};

function evaluate(witnesses: AnalysisSourceRow[], entityIds = ["x", "y"]) {
  const result = evaluateAnalysisQuery(
    project,
    { entities: entityIds.map((id) => ({ id })), witnesses },
    "q"
  );
  const shared = (aggregation: "count" | "sum", measureField?: string) =>
    summarizeGroup(
      witnesses.map((row, __ID) => ({
        __ID,
        entity: row.entity,
        amount: row.amount,
      })),
      { aggregation, entityField: "entity", measureField }
    ).value;
  return { result, values: result.rows[0]!.values, shared };
}

describe("measured count once per entity", () => {
  it("is unavailable when one entity's rows disagree, as in the shared summary", () => {
    const { result, values, shared } = evaluate([
      { id: "x1", entity: "x", amount: 10 },
      { id: "x2", entity: "x", amount: 20 },
      { id: "y1", entity: "y", amount: 5 },
    ]);
    expect(shared("count", "amount")).toBeUndefined();
    expect(values.present).toBe(shared("count", "amount"));
    expect(values).toMatchObject({
      count: 2,
      sum: undefined,
      average: undefined,
    });
    expect(values.count).toBe(shared("count"));
    expect(
      result.diagnostics.filter(
        (item) => item.code === "conflicting-entity-measure"
      )
    ).toHaveLength(3);
  });

  it("counts each entity once when its rows agree", () => {
    const { result, values, shared } = evaluate([
      { id: "x1", entity: "x", amount: 10 },
      { id: "x2", entity: "x", amount: 10 },
      { id: "y1", entity: "y", amount: 5 },
    ]);
    expect(values).toMatchObject({
      count: 2,
      present: 2,
      sum: 15,
      average: 7.5,
    });
    expect(values.present).toBe(shared("count", "amount"));
    expect(result.diagnostics).toEqual([]);
  });

  it("counts present values, including invalid text, and leaves out missing ones", () => {
    const { values } = evaluate([
      { id: "x1", entity: "x", amount: "n/a" },
      { id: "x2", entity: "x", amount: "n/a" },
      { id: "y1", entity: "y", amount: null },
    ]);
    expect(values).toMatchObject({
      count: 2,
      present: 1,
      sum: undefined,
    });
  });

  it("counts zero when nothing matches", () => {
    const { values } = evaluate([], []);
    expect(values).toMatchObject({ count: 0, present: 0 });
  });
});
