/**
 * What a person can create in a project, as file changes. Each returns the
 * analysis to show next; the app then reads the folder again.
 */
import {
  addConnectionText,
  addDatabaseSourceText,
  addSourceText,
  analysisPathFor,
  HIDDEN_PROJECT_FILE,
  labelFromId,
  newAnalysisText,
  PROJECT_FILE,
  sourceIdForFile,
  type ConnectionDefinition,
  type DatabaseSource,
  type ProjectFiles,
  type ProjectFolder,
} from "exploreda";

const takenPaths = (folder: ProjectFolder) =>
  folder.analyses.map((analysis) => analysis.path);

/** The project text's path, and its text when it exists yet. */
async function projectText(
  files: ProjectFiles,
  folder: ProjectFolder,
  layout: "visible" | "hidden"
) {
  const path =
    folder.projectPath ??
    (layout === "hidden" ? HIDDEN_PROJECT_FILE : PROJECT_FILE);
  const text = folder.projectPath
    ? await files.read(folder.projectPath)
    : undefined;
  return { path, text };
}

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
  const { path: projectPath, text: existing } = await projectText(
    files,
    folder,
    layout
  );
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

/** Adds a connection to the project text; the first creates that text. */
export async function addConnection(
  files: ProjectFiles,
  folder: ProjectFolder,
  {
    connection,
    projectName,
    layout,
  }: {
    connection: ConnectionDefinition;
    projectName: string;
    layout: "visible" | "hidden";
  }
) {
  const { path, text } = await projectText(files, folder, layout);
  await files.write(
    path,
    addConnectionText(text, { projectId: projectName, connection })
  );
}

/**
 * Adds a source that reads a database, and a new analysis that charts it,
 * as charting a data file does. Returns the source's ID and the analysis.
 */
export async function addDatabaseSource(
  files: ProjectFiles,
  folder: ProjectFolder,
  {
    sourceId,
    database,
    projectName,
    layout,
  }: {
    sourceId: string;
    database: DatabaseSource;
    projectName: string;
    layout: "visible" | "hidden";
  }
) {
  const { path, text } = await projectText(files, folder, layout);
  await files.write(
    path,
    addDatabaseSourceText(text, { projectId: projectName, sourceId, database })
  );
  const analysis = analysisPathFor(sourceId, takenPaths(folder));
  await files.write(
    analysis,
    newAnalysisText(sourceId, analysis, labelFromId(sourceId), {
      starter: true,
    })
  );
  return analysis;
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
