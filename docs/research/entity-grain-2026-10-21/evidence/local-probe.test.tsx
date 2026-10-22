import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { summarizeGroup } from "@/lib/aggregates";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { planMetricCard } from "@/components/charts/MetricCard/metricCardPlan";
import { MetricCardTraceBody } from "@/components/charts/MetricCard/MetricCardTraceBody";

const measures = (entityFieldId: string, fieldId: string) => [
  {
    id: "count",
    label: "Entities",
    operation: "count" as const,
    entityFieldId,
  },
  {
    id: "present",
    label: "Present",
    operation: "count" as const,
    entityFieldId,
    fieldId,
  },
  {
    id: "sum",
    label: "Sum",
    operation: "sum" as const,
    entityFieldId,
    fieldId,
  },
  {
    id: "average",
    label: "Average",
    operation: "average" as const,
    entityFieldId,
    fieldId,
  },
];

// Frozen controls come from proof-plan.md F2-min and F4, before these calls.
describe("R043 local research witnesses", () => {
  it("reproduces measured-count conflict with exact expansion witnesses and equal-value control", () => {
    const project: AnalysisProject = {
      id: "conflict",
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
              measures: measures("entities.id", "w.amount"),
            },
          ],
        },
      ],
    };
    for (const conflict of [true, false]) {
      const witnesses = [
        { id: "x1", entity: "x", amount: 10 },
        { id: "x2", entity: "x", amount: conflict ? 20 : 10 },
        { id: "y1", entity: "y", amount: 5 },
      ];
      const result = evaluateAnalysisQuery(
        project,
        { entities: [{ id: "x" }, { id: "y" }], witnesses },
        "q"
      );
      const expanded = result.stages.find((s) => s.stepId === "expand")!.rows;
      expect(
        expanded.map((r) => [
          r.values["entities.id"],
          r.values["w.id"],
          r.values["w.amount"],
        ])
      ).toEqual([
        ["x", "x1", 10],
        ["x", "x2", conflict ? 20 : 10],
        ["y", "y1", 5],
      ]);
      const row = result.rows[0]!;
      expect(row.sourceRows.map((r) => r.rowKey).sort()).toEqual([
        "entities:string:x",
        "entities:string:y",
        "witnesses:string:x1",
        "witnesses:string:x2",
        "witnesses:string:y1",
      ]);
      const inputs = witnesses.map((r, __ID) => ({
        __ID,
        entity: r.entity,
        amount: r.amount,
      }));
      const shared = summarizeGroup(inputs, {
        aggregation: "count",
        entityField: "entity",
        measureField: "amount",
      });
      expect(
        summarizeGroup(inputs, { aggregation: "count", entityField: "entity" })
          .value
      ).toBe(2);
      if (conflict) {
        expect(shared.value).toBeUndefined();
        expect(row.values).toMatchObject({
          count: 2,
          present: 1,
          sum: undefined,
          average: undefined,
        });
        expect(
          shared.contributors.map((c) => [
            c.sourceId,
            c.included,
            c.exclusionReason,
          ])
        ).toEqual([
          [0, false, "Values differ for this ID"],
          [1, false, "Values differ for this ID"],
          [2, true, undefined],
        ]);
        expect(row.measureContributors!.sum!.map((c) => c.rowKey)).toEqual([
          expanded[2]!.key,
        ]);
        expect(row.measureContributors!.present).toBeUndefined();
        expect(
          result.diagnostics.some(
            (d) =>
              d.code === "conflicting-entity-measure" &&
              d.message.includes("entities:string:x")
          )
        ).toBe(true);
      } else {
        expect(shared.value).toBe(2);
        expect(row.values).toMatchObject({
          count: 2,
          present: 2,
          sum: 15,
          average: 7.5,
        });
        expect(row.measureContributors!.sum!.map((c) => c.rowKey)).toEqual([
          expanded[0]!.key,
          expanded[2]!.key,
        ]);
        expect(result.diagnostics).toEqual([]);
      }
    }
  });

  it("distinguishes source identity, copied-null fallback and shared values despite equal counts", () => {
    const project: AnalysisProject = {
      id: "fallback",
      version: 1,
      sources: [
        {
          id: "left",
          name: "Left",
          glyph: "L",
          entityKey: "id",
          fields: ["id", "joinKey"].map((id) => ({ id, name: id })),
        },
        {
          id: "targets",
          name: "Targets",
          glyph: "T",
          entityKey: "pk",
          fields: ["pk", "joinKey", "amount"].map((id) => ({ id, name: id })),
        },
      ],
      relationships: [
        {
          id: "r",
          name: "Target",
          from: { sourceId: "left", fieldId: "joinKey" },
          to: { sourceId: "targets", fieldId: "joinKey" },
          cardinality: "many-to-one",
        },
      ],
      queries: [
        {
          id: "q",
          name: "Q",
          glyph: "Q",
          frameLabel: "targets",
          outputStepId: "total",
          steps: [
            { id: "start", kind: "source", sourceId: "left" },
            {
              id: "lookup",
              kind: "lookup",
              inputStepId: "start",
              relationshipId: "r",
              as: "target",
            },
            {
              id: "copy",
              kind: "calculate",
              inputStepId: "lookup",
              fieldId: "pkCopy",
              label: "Copy",
              expression: '["target.pk"]',
            },
            {
              id: "total",
              kind: "aggregate",
              inputStepId: "copy",
              groupBy: [],
              measures: [
                ...measures("target.pk", "target.amount"),
                ...measures("pkCopy", "target.amount").map((m) => ({
                  ...m,
                  id: "copy_" + m.id,
                })),
              ],
            },
          ],
        },
      ],
    };
    for (const clean of [false, true]) {
      const targets: AnalysisSourceRow[] = [
        { pk: clean ? "one" : null, joinKey: "j1", amount: 5 },
        { pk: clean ? "two" : "dup", joinKey: "j2", amount: 8 },
        { pk: clean ? "three" : "dup", joinKey: "j3", amount: 8 },
        { pk: "safe", joinKey: "j4", amount: 9 },
      ];
      const left = ["j1", "j1", "j2", "j2", "j3", "j4"].map((joinKey, i) => ({
        id: `L${i + 1}`,
        joinKey,
      }));
      const result = evaluateAnalysisQuery(project, { left, targets }, "q");
      const row = result.rows[0]!;
      expect(row.values).toMatchObject({
        count: 4,
        sum: 30,
        average: 7.5,
        copy_count: 4,
        copy_sum: clean ? 30 : 27,
        copy_average: clean ? 7.5 : 6.75,
      });
      const input = result.stages.find((s) => s.stepId === "copy")!.rows;
      expect(input.map((r) => r.values.pkCopy)).toEqual(
        clean
          ? ["one", "one", "two", "two", "three", "safe"]
          : [null, null, "dup", "dup", "dup", "safe"]
      );
      expect(
        row.sourceRows.filter((r) => r.sourceId === "left").map((r) => r.rowKey)
      ).toEqual(left.map((r) => `left:string:${r.id}`));
      expect(
        row.sourceRows
          .filter((r) => r.sourceId === "targets")
          .map((r) => r.rowKey)
      ).toEqual(
        clean
          ? [
              "targets:string:one",
              "targets:string:two",
              "targets:string:three",
              "targets:string:safe",
            ]
          : [
              "targets:row:0",
              "targets:row:1",
              "targets:row:2",
              "targets:string:safe",
            ]
      );
      expect(row.measureContributors!.sum!.map((c) => c.rowKey)).toEqual(
        ["L1", "L3", "L5", "L6"].map((id) => `left:string:${id}`)
      );
      expect(row.measureContributors!.copy_sum!.map((c) => c.rowKey)).toEqual(
        (clean ? ["L1", "L3", "L5", "L6"] : ["L1", "L2", "L3", "L6"]).map(
          (id) => `left:string:${id}`
        )
      );
      const shared = summarizeGroup(
        input.map((r, __ID) => ({
          __ID,
          pk: r.values.pkCopy,
          amount: r.values["target.amount"],
        })),
        { aggregation: "sum", entityField: "pk", measureField: "amount" }
      );
      expect(shared.value).toBe(clean ? 30 : 17);
      expect(
        shared.contributors
          .filter((c) => c.included)
          .map((c) => c.sourceId)
          .sort()
      ).toEqual(clean ? [0, 2, 4, 5] : [2, 5]);
      expect(
        result.diagnostics.filter((d) => d.code === "missing-key")
      ).toHaveLength(clean ? 0 : 1);
      expect(
        result.diagnostics.filter((d) => d.code === "duplicate-key")
      ).toHaveLength(clean ? 0 : 2);
    }
  });

  it("renders the current row wording for an entity count without treating it as measured-count evidence", () => {
    const plan = planMetricCard(
      { aggregation: "count", entityField: "id" } as Parameters<
        typeof planMetricCard
      >[0],
      {
        revision: "r",
        liveIds: [0, 1],
        measureData: {},
        entityData: { 0: "x", 1: "x" },
      },
      (f) => f,
      (_f, v) => String(v)
    );
    expect(plan.value).toBe(1);
    expect(plan.rowCount).toBe(1);
    expect(plan.contributors).toHaveLength(2);
    expect(plan.measureField).toBeUndefined();
    const html = renderToStaticMarkup(
      <MetricCardTraceBody
        trace={{ kind: "metric-card", id: "total", revision: "r", plan }}
      />
    );
    expect(html).toContain("Each matching row adds 1.");
    expect(html).toContain("Matching rows");
  });
});
