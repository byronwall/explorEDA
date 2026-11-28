import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { projectSchemaGraph } from "@/lib/schema/schemaGraph";
import { compactViews, condenseProject } from "@/lib/schema/schemaCompact";
import { layoutSchemaGraph, routeSchemaEdges } from "@/lib/schema/schemaLayout";
import type { AnalysisProject } from "@/types/AnalysisProject";

/**
 * A project shaped like an agent-built one: many tables, each read by its
 * own one-step query, a few of them charted, and a chain of related keys.
 */
function agentProject(): AnalysisProject {
  const names = ["runs", "jobs", "steps", "trend", "hotspots", "matrix"];
  const extra = Array.from({ length: 9 }, (_, index) => `extra${index}`);
  const sources = [...names, ...extra].map((id) => ({
    id,
    name: id,
    entityKey: `${id}_id`,
    fields: [
      { id: `${id}_id`, name: `${id} id`, type: "string" as const },
      ...Array.from({ length: 8 }, (_, index) => ({
        id: `f${index}`,
        name: `field ${index}`,
        type: "number" as const,
      })),
      ...(id === "jobs" || id === "steps"
        ? [{ id: "runs_id", name: "run id", type: "string" as const }]
        : []),
    ],
  }));
  return {
    id: "agent",
    version: 1,
    sources,
    relationships: [
      {
        id: "jobs-runs",
        name: "Run",
        from: { sourceId: "jobs", fieldId: "runs_id" },
        to: { sourceId: "runs", fieldId: "runs_id" },
        cardinality: "many-to-one",
      },
      {
        id: "steps-runs",
        name: "Run",
        from: { sourceId: "steps", fieldId: "runs_id" },
        to: { sourceId: "runs", fieldId: "runs_id" },
        cardinality: "many-to-one",
      },
    ],
    queries: sources.map((source) => ({
      id: source.id,
      name: source.name,
      glyph: "◆",
      frameLabel: source.name,
      steps: [{ id: `${source.id}-read`, kind: "source", sourceId: source.id }],
      outputStepId: `${source.id}-read`,
    })),
  } as AnalysisProject;
}

const chart = (field: string) => ({
  charts: [{ id: "c", type: "bar", title: field, field, filters: [] }],
  calculations: [],
});

const cases: [
  string,
  AnalysisProject,
  { id: string; name: string; queryId: string; settings?: unknown }[],
][] = [
  [
    "shop",
    createShopFixture().project,
    createShopFixture().project.queries.map((query) => ({
      id: query.id,
      name: query.name,
      queryId: query.id,
    })),
  ],
  [
    "agent-built",
    agentProject(),
    ["trend", "hotspots", "matrix", "matrix", "trend"].map((id, index) => ({
      id: `v${index}`,
      name: `View ${index}`,
      queryId: id,
      settings: chart("f1"),
    })),
  ],
];

/** Whether an axis-aligned segment runs through the inside of a box. */
function crosses(
  a: { x: number; y: number },
  b: { x: number; y: number },
  box: { x: number; y: number; width: number; height: number }
) {
  return (
    Math.max(a.x, b.x) > box.x + 1 &&
    Math.min(a.x, b.x) < box.x + box.width - 1 &&
    Math.max(a.y, b.y) > box.y + 1 &&
    Math.min(a.y, b.y) < box.y + box.height - 1
  );
}

describe("schema diagram lines", () => {
  for (const [name, project, views] of cases) {
    for (const relationships of [false, true]) {
      for (const width of [1512, 783, 390]) {
        it(`never cross a card: ${name}, ${width}px${relationships ? ", relationships" : ""}`, () => {
          const drawn = condenseProject(
            compactViews(
              projectSchemaGraph(project, {}, views as never),
              new Set(),
              { foldCurrent: true }
            ),
            new Set(),
            { relationships }
          );
          const layout = layoutSchemaGraph(drawn, { width, height: 900 });
          const { paths, blocked } = routeSchemaEdges(
            drawn,
            layout,
            drawn.edges
          );
          expect(blocked.map((edge) => edge.id)).toEqual([]);
          expect(paths).toHaveLength(drawn.edges.length);
          for (const path of paths) {
            // Lines stay inside the drawer too, not just clear of cards.
            for (const point of path.points) {
              expect(
                point.x,
                `${path.edge.id} leaves the drawer`
              ).toBeLessThanOrEqual(width);
            }
            for (let index = 1; index < path.points.length; index += 1) {
              for (const box of Object.values(layout.boxes)) {
                expect(
                  crosses(path.points[index - 1]!, path.points[index]!, box),
                  `${path.edge.id} runs through a card`
                ).toBe(false);
              }
            }
          }
          for (const box of Object.values(layout.boxes)) {
            expect(box.x + box.width).toBeLessThanOrEqual(width);
          }
        });
      }
    }
  }
});
