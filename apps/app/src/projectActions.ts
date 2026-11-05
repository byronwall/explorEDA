/**
 * What a person can create in a project, as file changes. Each returns the
 * analysis to show next; the app then reads the folder again.
 */
import {
  addConnectionText,
  addDatabaseSourceText,
  addSourceText,
  analysisFileText,
  analysisPathFor,
  HIDDEN_PROJECT_FILE,
  labelFromId,
  newAnalysisText,
  PROJECT_FILE,
  projectFileText,
  sourceIdForFile,
  type AnalysisProject,
  type AnalysisView,
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
 * Adds sources that read a database, and a new analysis that charts `main`,
 * as charting a data file does. The other sources get no analysis of their
 * own; they are there to relate. Returns the analysis.
 */
export async function addDatabaseSources(
  files: ProjectFiles,
  folder: ProjectFolder,
  {
    sources,
    main,
    projectName,
    layout,
  }: {
    sources: { sourceId: string; database: DatabaseSource }[];
    main: string;
    projectName: string;
    layout: "visible" | "hidden";
  }
) {
  const { path, text } = await projectText(files, folder, layout);
  let next = text;
  for (const { sourceId, database } of sources) {
    next = addDatabaseSourceText(next, {
      projectId: projectName,
      sourceId,
      database,
    });
  }
  await files.write(path, next!);
  const analysis = analysisPathFor(main, takenPaths(folder));
  await files.write(
    analysis,
    newAnalysisText(main, analysis, labelFromId(main), { starter: true })
  );
  return analysis;
}

/**
 * Removes a source from the project text, with the analysis adding it made
 * when that analysis is still untouched. Other analyses are kept.
 */
export async function removeSource(
  files: ProjectFiles,
  folder: ProjectFolder,
  sourceId: string
) {
  if (!folder.projectPath) {
    return;
  }
  const lines = (await files.read(folder.projectPath)).split("\n");
  const start = lines.findIndex((line) =>
    new RegExp(`^source @${sourceId}(\\s|$)`).test(line)
  );
  if (start < 0) {
    return;
  }
  let end = start;
  if (lines[start]!.trimEnd().endsWith("{")) {
    while (end < lines.length - 1 && lines[end]!.trim() !== "}") {
      end += 1;
    }
  }
  // The blank line that set it apart goes with it.
  const first = start > 0 && !lines[start - 1]!.trim() ? start - 1 : start;
  lines.splice(first, end - first + 1);
  await files.write(folder.projectPath, lines.join("\n"));
  for (const analysis of folder.analyses) {
    const starter = newAnalysisText(
      sourceId,
      analysis.path,
      labelFromId(sourceId),
      { starter: true }
    );
    if ((await files.read(analysis.path)) === starter) {
      await files.remove(analysis.path);
    }
  }
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

/**
 * A view a panel opened, such as a new query from a table: a new analysis
 * file for it, and the project text when the view brings a new query.
 */
export async function openView(
  files: ProjectFiles,
  folder: ProjectFolder,
  {
    view,
    name,
    project,
    layout,
  }: {
    view: AnalysisView;
    name: string;
    project?: AnalysisProject;
    layout: "visible" | "hidden";
  }
) {
  if (project) {
    const { path } = await projectText(files, folder, layout);
    await files.write(path, projectFileText(folder, project));
  }
  const path = analysisPathFor(name, takenPaths(folder));
  await files.write(
    path,
    view.settings
      ? analysisFileText(
          folder,
          path,
          [{ ...view, name, settings: view.settings }],
          project ?? folder.project,
          name
        )
      : newAnalysisText(view.queryId, path, name, { starter: true })
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
