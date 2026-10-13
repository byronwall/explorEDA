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
import type { ServerInfo, ThemePreference } from "./httpFiles";
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

export interface ProjectActions {
  chartFile(dataPath: string): Promise<void>;
  createAnalysis(name: string, queryId: string): Promise<void>;
  renameAnalysis(path: string, name: string): Promise<void>;
  deleteAnalysis(path: string): Promise<void>;
}

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
  actions,
  theme,
  onThemeChange,
}: {
  actions: ProjectActions;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
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
  const [creating, setCreating] = useState(false);
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
          <div className="app-section-head">
            <h2 id="analyses-heading">Analyses</h2>
            {project.queries.length > 0 && (
              <button
                type="button"
                className="app-button"
                aria-expanded={creating}
                onClick={() => setCreating((open) => !open)}
              >
                New analysis
              </button>
            )}
          </div>
          {creating && (
            <NewAnalysisForm
              queries={project.queries.map((query) => ({
                id: query.id,
                name: query.name,
              }))}
              onCancel={() => setCreating(false)}
              onCreate={(name, queryId) =>
                void actions.createAnalysis(name, queryId)
              }
            />
          )}
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
                  {analysis.path === selected.path && (
                    <AnalysisActions
                      path={analysis.path}
                      name={analysis.result.name}
                      actions={actions}
                    />
                  )}
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
                <button
                  type="button"
                  className="app-button"
                  aria-label={`Chart ${path}`}
                  onClick={() => void actions.chartFile(path)}
                >
                  Chart
                </button>
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

        <ThemeChoice theme={theme} onChange={onThemeChange} />
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
          <FirstRun
            dataFiles={looseFiles}
            onChart={(path) => void actions.chartFile(path)}
          />
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

function NewAnalysisForm({
  queries,
  onCreate,
  onCancel,
}: {
  queries: Array<{ id: string; name: string }>;
  onCreate: (name: string, queryId: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [queryId, setQueryId] = useState(queries[0]?.id ?? "");
  return (
    <form
      className="app-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (name.trim() && queryId) {
          onCreate(name.trim(), queryId);
        }
      }}
    >
      <label>
        <span>Name</span>
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Revenue by region"
        />
      </label>
      <label>
        <span>Charts</span>
        <select
          value={queryId}
          onChange={(event) => setQueryId(event.target.value)}
        >
          {queries.map((query) => (
            <option key={query.id} value={query.id}>
              {query.name}
            </option>
          ))}
        </select>
      </label>
      <div className="app-form-actions">
        <button type="submit" className="app-button app-button-primary">
          Create
        </button>
        <button type="button" className="app-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AnalysisActions({
  path,
  name,
  actions,
}: {
  path: string;
  name: string;
  actions: ProjectActions;
}) {
  const [mode, setMode] = useState<"idle" | "rename" | "delete">("idle");
  const [draft, setDraft] = useState(name);
  if (mode === "rename") {
    return (
      <form
        className="app-form app-form-inline"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.trim() && draft.trim() !== name) {
            void actions.renameAnalysis(path, draft.trim());
          } else {
            setMode("idle");
          }
        }}
      >
        <input
          autoFocus
          aria-label={`New name for ${name}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="app-button app-button-primary">
          Save
        </button>
        <button
          type="button"
          className="app-button"
          onClick={() => setMode("idle")}
        >
          Cancel
        </button>
      </form>
    );
  }
  if (mode === "delete") {
    return (
      <div className="app-form-inline" role="group" aria-label="Delete">
        <span className="app-muted">Delete {path}?</span>
        <button
          type="button"
          className="app-button app-button-danger"
          onClick={() => void actions.deleteAnalysis(path)}
        >
          Delete
        </button>
        <button
          type="button"
          className="app-button"
          onClick={() => setMode("idle")}
        >
          Keep
        </button>
      </div>
    );
  }
  return (
    <div className="app-form-inline">
      <button
        type="button"
        className="app-button"
        onClick={() => setMode("rename")}
      >
        Rename
      </button>
      <button
        type="button"
        className="app-button"
        onClick={() => setMode("delete")}
      >
        Delete
      </button>
    </div>
  );
}

function FirstRun({
  dataFiles,
  onChart,
}: {
  dataFiles: string[];
  onChart: (path: string) => void;
}) {
  if (!dataFiles.length) {
    return (
      <div className="app-message">
        <h2>Add data to start</h2>
        <p>
          Put a CSV or JSON file in this folder. It shows up here as soon as
          it's saved, ready to chart.
        </p>
      </div>
    );
  }
  return (
    <div className="app-message">
      <h2>Chart a data file to start</h2>
      <p>
        Charting a file adds it to the project and creates an analysis. Both are
        text files in this folder, ready to commit.
      </p>
      <ul className="app-start-list">
        {dataFiles.map((path) => (
          <li key={path}>
            <code>{path}</code>
            <button
              type="button"
              className="app-button app-button-primary"
              aria-label={`Chart ${path}`}
              onClick={() => onChart(path)}
            >
              Chart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const THEMES: Array<{ id: ThemePreference; label: string }> = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];

function ThemeChoice({
  theme,
  onChange,
}: {
  theme: ThemePreference;
  onChange: (theme: ThemePreference) => void;
}) {
  return (
    <div className="app-theme" role="radiogroup" aria-label="Theme">
      {THEMES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={theme === item.id}
          className="app-segment"
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
