import { describe, expect, it } from "vitest";
import type { AnalysisProject } from "exploreda";
import { projectSchemaGraph } from "../../../../../packages/explorEDA/src/lib/schema/schemaGraph";
import {
  compactViews,
  condenseProject,
} from "../../../../../packages/explorEDA/src/lib/schema/schemaCompact";
import {
  layoutSchemaGraph,
  routeSchemaEdges,
} from "../../../../../packages/explorEDA/src/lib/schema/schemaLayout";
import { shopProject } from "../multiSourceShop";
import { beijingAnalysis } from "./beijing";
import { earthquakesAnalysis } from "./earthquakes";
import { flightsAnalysis } from "./flights";
import { worldBankAnalysis } from "./worldbank";

const projects: [string, AnalysisProject][] = [
  ["shop", shopProject.project],
  ["beijing", beijingAnalysis.project],
  ["earthquakes", earthquakesAnalysis.project],
  ["flights", flightsAnalysis.project],
  ["world bank", worldBankAnalysis.project],
];

/** Whether an axis-aligned segment runs through the inside of a box. */
function crosses(
  a: { x: number; y: number },
  b: { x: number; y: number },
  box: { x: number; y: number; width: number; height: number }
) {
  const inset = 1;
  return (
    Math.max(a.x, b.x) > box.x + inset &&
    Math.min(a.x, b.x) < box.x + box.width - inset &&
    Math.max(a.y, b.y) > box.y + inset &&
    Math.min(a.y, b.y) < box.y + box.height - inset
  );
}

describe("schema diagram lines", () => {
  for (const [name, project] of projects) {
    for (const width of [1512, 783]) {
      it(`never cross a card in ${name} at ${width}px`, () => {
        // One view per query, so every query has a reader.
        const views = project.queries.map((query) => ({
          id: query.id,
          name: query.name,
          queryId: query.id,
        }));
        const drawn = condenseProject(
          compactViews(projectSchemaGraph(project, {}, views), new Set(), {
            foldCurrent: true,
          }),
          new Set()
        );
        const layout = layoutSchemaGraph(drawn, { width, height: 900 });
        const { paths, blocked } = routeSchemaEdges(drawn, layout, drawn.edges);
        expect(blocked.map((edge) => edge.id)).toEqual([]);
        expect(paths).toHaveLength(drawn.edges.length);
        expect(paths.length).toBeGreaterThan(0);
        for (const path of paths) {
          for (let index = 1; index < path.points.length; index += 1) {
            for (const box of Object.values(layout.boxes)) {
              expect(
                crosses(path.points[index - 1]!, path.points[index]!, box),
                `${path.edge.id} runs through a card`
              ).toBe(false);
            }
          }
        }
      });
    }
  }
});
