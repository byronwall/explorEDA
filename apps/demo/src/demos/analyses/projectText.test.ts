import { readFileSync } from "node:fs";
import path from "node:path";
import type { AnalysisProject, AnalysisSourceRow } from "exploreda";
import {
  compileProjectText,
  evaluateAnalysisQuery,
  exportProjectText,
} from "exploreda/analysis";
import { describe, expect, it } from "vitest";
import { catalogue } from "../examples";
import { shopProject } from "../multiSourceShop";
import { analysisQueryId, parseTable } from "./loadAnalysis";

const publicDir = path.resolve(__dirname, "../../../public");

const projects: Array<{
  name: string;
  project: AnalysisProject;
  paths?: Record<string, string>;
}> = [
  { name: "shop", project: shopProject.project },
  ...catalogue.flatMap((example) =>
    example.analysis
      ? [
          {
            name: example.id,
            project: example.analysis.project,
            paths: example.analysis.tableFiles,
          },
        ]
      : []
  ),
];

describe("project text for every demo project", () => {
  it.each(projects)("$name reads back exactly", ({ project, paths }) => {
    const text = exportProjectText(project, { paths });
    const result = compileProjectText(text);
    expect(result.diagnostics).toEqual([]);
    expect(result.project).toEqual(project);
    expect(result.paths).toEqual(paths ?? {});
    expect(exportProjectText(result.project, { paths })).toBe(text);
  });

  it.each(catalogue.filter((example) => example.analysis))(
    "$id evaluates the same rows from text",
    async ({ analysis }) => {
      const tables: Record<string, AnalysisSourceRow[]> = {};
      for (const [sourceId, url] of Object.entries(analysis!.tableFiles)) {
        tables[sourceId] = await parseTable(
          readFileSync(path.join(publicDir, url), "utf8")
        );
      }
      const { project } = compileProjectText(
        exportProjectText(analysis!.project)
      );
      const queryId = analysisQueryId(analysis!);
      expect(evaluateAnalysisQuery(project, tables, queryId).rows).toEqual(
        evaluateAnalysisQuery(analysis!.project, tables, queryId).rows
      );
    }
  );
});
