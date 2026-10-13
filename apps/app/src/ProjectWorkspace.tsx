import { useEffect, useMemo, useRef, useState } from "react";
import {
  analysisFileText,
  ExplorEdaProject,
  projectFileText,
  type AnalysisProject,
  type AnalysisView,
  type ExplorEdaProjectChange,
  type ProjectFolder,
  type SavedDataStructure,
} from "exploreda";
import { createAnalysisWorker } from "exploreda/analysis";
import type { ServerInfo } from "./httpFiles";
import type { FolderSaver, SaveState } from "./saver";

/** A view's ID: its analysis file and its place in that file. */
const viewId = (path: string, index: number) => `${path}#${index}`;

function folderViews(folder: ProjectFolder): Map<string, AnalysisView[]> {
  return new Map(
    folder.analyses.map((analysis) => [
      analysis.path,
      analysis.result.views.map((view, index) => ({
        id: viewId(analysis.path, index),
        name: view.name,
        queryId: view.queryId,
        ...(view.bindings ? { bindings: view.bindings } : {}),
        settings: view.settings,
      })),
    ])
  );
}

const textViews = (views: AnalysisView[]) =>
  views.map((view) => ({
    name: view.name,
    queryId: view.queryId,
    ...(view.bindings ? { bindings: view.bindings } : {}),
    settings: view.settings ?? ({} as SavedDataStructure),
  }));

export interface Selection {
  path?: string;
  index: number;
}

export function ProjectWorkspace({
  folder,
  info,
  saver,
  saveState,
  notice,
  initialSelection,
  onSelect,
}: {
  folder: ProjectFolder;
  info: ServerInfo;
  saver: FolderSaver;
  saveState: SaveState;
  notice?: string;
  initialSelection?: Selection;
  onSelect: (selection: Selection) => void;
}) {
  const [project, setProject] = useState<AnalysisProject>(folder.project);
  const [views, setViews] = useState(() => folderViews(folder));
  const [selected, setSelectedState] = useState<Selection>(() =>
    initialSelection?.path &&
    folder.analyses.some((analysis) => analysis.path === initialSelection.path)
      ? initialSelection
      : { path: folder.analyses[0]?.path, index: 0 }
  );
  const setSelected = (next: Selection) => {
    setSelectedState(next);
    onSelect(next);
  };

  const names = useMemo(
    () =>
      new Map(
        folder.analyses.map((analysis) => [analysis.path, analysis.result.name])
      ),
    [folder]
  );

  /** The text each file would hold for the project and views as they are. */
  const fileText = (
    path: string,
    state: { project: AnalysisProject; views: Map<string, AnalysisView[]> }
  ) =>
    path === folder.projectPath
      ? projectFileText(folder, state.project)
      : analysisFileText(
          folder,
          path,
          textViews(state.views.get(path) ?? []),
          state.project,
          names.get(path)
        );

  // What the folder holds now, in the form a save would write it. A file
  // is written only when an edit changes that text.
  useEffect(() => {
    const initial = { project: folder.project, views: folderViews(folder) };
    for (const analysis of folder.analyses) {
      saver.known(analysis.path, fileText(analysis.path, initial));
    }
    if (folder.projectPath) {
      saver.known(folder.projectPath, fileText(folder.projectPath, initial));
    }
    // The saver and folder are fixed for this workspace's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = useRef(new Set<string>());
  useEffect(() => {
    for (const path of dirty.current) {
      saver.queue(path, fileText(path, { project, views }));
    }
    dirty.current.clear();
    // fileText reads only folder and names, which don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, views, saver]);

  const analysisViews = selected.path ? (views.get(selected.path) ?? []) : [];
  const view = analysisViews[selected.index] ?? analysisViews[0];
  const allViews = useMemo(() => [...views.values()].flat(), [views]);

  const updateView = (id: string, change: Partial<AnalysisView>) => {
    const path = id.slice(0, id.lastIndexOf("#"));
    dirty.current.add(path);
    setViews((previous) => {
      const next = new Map(previous);
      const list = next.get(path);
      if (list) {
        next.set(
          path,
          list.map((item) => (item.id === id ? { ...item, ...change } : item))
        );
      }
      return next;
    });
  };

  const onProjectChange = ({
    project: next,
    view: changed,
  }: ExplorEdaProjectChange) => {
    if (folder.projectPath) {
      dirty.current.add(folder.projectPath);
    }
    // An analysis that brings its own source writes it in its own file.
    for (const path of new Set(Object.values(folder.localSources))) {
      dirty.current.add(path);
    }
    setProject(next);
    updateView(changed.id, changed);
  };
  const onStateChange = (settings: SavedDataStructure) => {
    if (view) {
      updateView(view.id, { settings });
    }
  };

  const usedFiles = new Set(Object.values(folder.paths));
  const looseFiles = folder.dataFiles.filter((path) => !usedFiles.has(path));

  const tabs = (
    <div className="app-tabs" role="tablist" aria-label="Views">
      {analysisViews.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === view?.id}
          className="app-tab"
          onClick={() => setSelected({ path: selected.path, index })}
        >
          {item.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="app">
      <aside className="app-rail" aria-label="Project">
        <header className="app-rail-head">
          <h1>{info.name}</h1>
          <p className="app-muted app-path">{info.root}</p>
          <SaveStatus state={saveState} />
          {notice && (
            <p className="app-notice" role="status">
              {notice}
            </p>
          )}
        </header>

        <nav aria-labelledby="analyses-heading">
          <h2 id="analyses-heading">Analyses</h2>
          {folder.analyses.length ? (
            <ul className="app-list">
              {folder.analyses.map((analysis) => (
                <li key={analysis.path}>
                  <button
                    type="button"
                    className="app-item"
                    aria-current={
                      analysis.path === selected.path ? "page" : undefined
                    }
                    onClick={() =>
                      setSelected({ path: analysis.path, index: 0 })
                    }
                  >
                    <span>{analysis.result.name}</span>
                    <span className="app-muted">{analysis.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="app-muted">No analyses yet.</p>
          )}
        </nav>

        <section aria-labelledby="data-heading">
          <h2 id="data-heading">Data</h2>
          <ul className="app-list">
            {project.sources.map((source) => {
              const missing = folder.missingSources.includes(source.id);
              const outside = folder.outsideSources.includes(source.id);
              return (
                <li key={source.id} className="app-source">
                  <span>{source.name}</span>
                  <span className="app-muted">
                    {missing
                      ? "file missing"
                      : `${(folder.tables[source.id]?.length ?? 0).toLocaleString()} rows`}
                    {outside ? " · outside the folder" : ""}
                  </span>
                  {missing && (
                    <span className="app-badge app-badge-error">Missing</span>
                  )}
                </li>
              );
            })}
            {looseFiles.map((path) => (
              <li key={path} className="app-source">
                <span>{path}</span>
                <span className="app-muted">not used yet</span>
              </li>
            ))}
          </ul>
        </section>

        {folder.problems.length > 0 && (
          <details className="app-problems">
            <summary>
              {folder.problems.length} problem
              {folder.problems.length === 1 ? "" : "s"}
            </summary>
            <ul>
              {folder.problems.map((problem, index) => (
                <li key={index}>
                  <span className="app-muted">
                    {problem.path}:{problem.line}
                  </span>{" "}
                  {problem.message}
                  {problem.suggestion && (
                    <span className="app-muted"> {problem.suggestion}</span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </aside>

      <main className="app-main">
        {view ? (
          <ExplorEdaProject
            key={view.id}
            project={project}
            tables={folder.tables}
            view={view}
            views={allViews}
            onProjectChange={onProjectChange}
            onStateChange={onStateChange}
            createWorker={createAnalysisWorker}
            toolbarStart={tabs}
          />
        ) : (
          <div className="app-message">
            <h2>No analyses in this folder yet</h2>
            <p>
              Add an <code>.eda</code> file that charts one of the project's
              queries, or a data file to start from.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state.status === "failed") {
    return (
      <p className="app-save app-save-failed" role="alert">
        Couldn't save {state.path}: {state.message}
      </p>
    );
  }
  return (
    <p className="app-save app-muted" aria-live="polite">
      {state.status === "saving" ? "Saving…" : "Saved to the folder"}
    </p>
  );
}
