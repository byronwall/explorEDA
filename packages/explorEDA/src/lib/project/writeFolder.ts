/**
 * Text for a project folder's files from the project and views as they are
 * now. A save writes only files whose text changed, so an edit to one chart
 * rewrites one analysis file. Parts the folder reader supplied, such as
 * fields read from data and queries made for an analysis's own source,
 * are written the way the files declared them.
 */
import type {
  AnalysisProject,
  SourceDefinition,
} from "@/types/AnalysisProject";
import { exportProjectText, exportSourceText } from "@/lib/dsl/project";
import { exportAnalysisText, type AnalysisTextView } from "./analysisText";
import { analysisNameFromPath, type ProjectFolder } from "./folder";

function sameJson(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * A source as its file should declare it: unchanged inferred sources keep
 * the short form their text used.
 */
function declaredSource(
  folder: ProjectFolder,
  source: SourceDefinition
): SourceDefinition {
  const declared = folder.declaredSources[source.id];
  const loaded = folder.project.sources.find((item) => item.id === source.id);
  return declared && sameJson(loaded, source) ? declared : source;
}

/** The project text for the folder's project file. */
export function projectFileText(
  folder: ProjectFolder,
  project: AnalysisProject
): string {
  const local = new Set(Object.keys(folder.localSources));
  const implicit = new Set(folder.implicitQueries);
  const sources = project.sources
    .filter((source) => !local.has(source.id))
    .map((source) => declaredSource(folder, source));
  const paths = Object.fromEntries(
    sources
      .filter((source) => folder.paths[source.id] !== undefined)
      .map((source) => [source.id, folder.paths[source.id]!])
  );
  return exportProjectText(
    {
      ...project,
      id: project.id || "project",
      sources,
      queries: project.queries.filter((query) => !implicit.has(query.id)),
    },
    { paths }
  );
}

/** The text of one analysis file: its own sources, then its views. */
export function analysisFileText(
  folder: ProjectFolder,
  path: string,
  views: AnalysisTextView[],
  project: AnalysisProject,
  name: string = analysisNameFromPath(path)
): string {
  const sources = Object.entries(folder.localSources)
    .filter(([, file]) => file === path)
    .flatMap(([sourceId]) => {
      const source = project.sources.find((item) => item.id === sourceId);
      return source
        ? [
            exportSourceText(
              declaredSource(folder, source),
              folder.paths[sourceId]
            ),
          ]
        : [];
    });
  const { text } = exportAnalysisText(views, {
    project,
    tables: folder.tables,
    name,
  });
  return [...sources, text].join("\n");
}
