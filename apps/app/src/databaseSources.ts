/**
 * Which database sources an analysis needs, and which of them haven't been
 * read yet, so the app can ask for a read instead of drawing empty charts.
 */
import type { AnalysisProject, ProjectFolder } from "exploreda";

/** Every source a query reads: its own, and those its lookups reach. */
export function querySources(project: AnalysisProject, queryId: string) {
  const query = project.queries.find((item) => item.id === queryId);
  const sources = new Set<string>();
  for (const step of query?.steps ?? []) {
    if (step.kind === "source") {
      sources.add(step.sourceId);
    } else if (step.kind === "lookup" || step.kind === "expand") {
      const relationship = project.relationships.find(
        (item) => item.id === step.relationshipId
      );
      if (relationship) {
        sources.add(relationship.from.sourceId);
        sources.add(relationship.to.sourceId);
      }
    }
  }
  return [...sources];
}

/** Database sources with no snapshot yet. */
export function unreadSources(folder: ProjectFolder) {
  return Object.keys(folder.databases).filter(
    (sourceId) => !folder.snapshots[sourceId]
  );
}

/** The unread database sources a query needs. */
export function waitingFor(
  folder: ProjectFolder,
  project: AnalysisProject,
  queryId: string
) {
  const unread = new Set(unreadSources(folder));
  return querySources(project, queryId).filter((id) => unread.has(id));
}

/**
 * Problems worth showing: those caused only by data that hasn't been read
 * yet are left out, since the sources list already says so.
 */
export function visibleProblems(
  folder: ProjectFolder,
  project: AnalysisProject
) {
  const unread = new Set(unreadSources(folder));
  if (!unread.size) {
    return folder.problems;
  }
  const waiting = new Set(
    folder.analyses
      .filter((analysis) =>
        analysis.result.views.some(
          (view) => waitingFor(folder, project, view.queryId).length > 0
        )
      )
      .map((analysis) => analysis.path)
  );
  return folder.problems.filter(
    (problem) =>
      !waiting.has(problem.path) &&
      !(problem.subject && unread.has(problem.subject))
  );
}
