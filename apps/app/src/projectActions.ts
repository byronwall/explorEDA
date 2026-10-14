/**
 * What a person can create in a project, as file changes. Each returns the
 * analysis to show next; the app then reads the folder again.
 */
import {
  addSourceText,
  analysisPathFor,
  HIDDEN_PROJECT_FILE,
  labelFromId,
  newAnalysisText,
  PROJECT_FILE,
  sourceIdForFile,
  type ProjectFiles,
  type ProjectFolder,
} from "exploreda";

const takenPaths = (folder: ProjectFolder) =>
  folder.analyses.map((analysis) => analysis.path);

/**
 * Charts a data file: the project text gains a one-line source for it (the
 * first one creates the project text), and a new analysis charts it.
 */
export async function chartDataFile(
  files: ProjectFiles,
  folder: ProjectFolder,
  {
    dataPath,
    projectName,
    layout,
  }: { dataPath: string; projectName: string; layout: "visible" | "hidden" }
) {
  const sourceId = sourceIdForFile(
    dataPath,
    folder.project.sources.map((source) => source.id)
  );
  const projectPath =
    folder.projectPath ??
    (layout === "hidden" ? HIDDEN_PROJECT_FILE : PROJECT_FILE);
  const existing = folder.projectPath
    ? await files.read(folder.projectPath)
    : undefined;
  await files.write(
    projectPath,
    addSourceText(existing, {
      projectId: projectName,
      sourceId,
      path: dataPath,
    })
  );
  const path = analysisPathFor(sourceId, takenPaths(folder));
  await files.write(
    path,
    newAnalysisText(sourceId, path, labelFromId(sourceId), { starter: true })
  );
  return path;
}

/** A new analysis of one of the project's queries. */
export async function createAnalysis(
  files: ProjectFiles,
  folder: ProjectFolder,
  { name, queryId }: { name: string; queryId: string }
) {
  const path = analysisPathFor(name, takenPaths(folder));
  await files.write(
    path,
    newAnalysisText(queryId, path, name.trim() || undefined)
  );
  return path;
}

/** Renames an analysis: its file and the name its text gives it. */
export async function renameAnalysis(
  files: ProjectFiles,
  folder: ProjectFolder,
  { path, name }: { path: string; name: string }
) {
  const others = takenPaths(folder).filter((item) => item !== path);
  const next = analysisPathFor(name, others);
  const text = await files.read(path);
  const titled = /^dashboard .*$/m.test(text)
    ? text.replace(/^dashboard .*$/m, `dashboard ${JSON.stringify(name)}`)
    : `dashboard ${JSON.stringify(name)}\n${text}`;
  await files.write(next, titled);
  if (next !== path) {
    await files.remove(path);
  }
  return next;
}
