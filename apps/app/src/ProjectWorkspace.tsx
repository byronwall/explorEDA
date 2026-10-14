import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  analysisFileText,
  ExplorEdaProject,
  projectFileText,
  readAgo,
  type AnalysisProject,
  type AnalysisView,
  type ExplorEdaProjectChange,
  type ProjectFolder,
  type SavedDataStructure,
} from "exploreda";
import { createAnalysisWorker } from "exploreda/analysis";
import { AddData, fetchedLabel } from "./AddData";
import {
  RefreshError,
  type FetchedRecord,
  type ServerInfo,
  type ThemePreference,
} from "./httpFiles";
import type { FolderSaver, SaveState } from "./saver";
import { unreadSources, visibleProblems, waitingFor } from "./databaseSources";

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
  /** On a team server: add a data file from this computer or a URL. */
  upload?(file: File, path: string): Promise<void>;
  fetchUrl?(url: string): Promise<void>;
  refetch?(path: string): Promise<void>;
  /** Reads database sources again; rejects with why one couldn't. */
  refreshSources?(sourceIds: string[]): Promise<void>;
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
  readOnly = false,
  team,
  fetched = {},
}: {
  /** Where downloaded data files came from, by path. */
  fetched?: Record<string, FetchedRecord>;
  actions: ProjectActions;
  /** Viewing only: no saving, creating, renaming, or deleting. */
  readOnly?: boolean;
  team?: ReactNode;
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
  const [adding, setAdding] = useState(false);
  const [refreshAllError, setRefreshAllError] = useState<string>();
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

  const { upload, fetchUrl } = actions;
  const addData =
    upload && fetchUrl
      ? (onDone?: () => void) => (
          <AddData
            existing={folder.dataFiles}
            onUpload={upload}
            onFetch={fetchUrl}
            onDone={onDone}
          />
        )
      : undefined;

  const databaseIds = Object.keys(folder.databases);
  const unread = unreadSources(folder);
  const problems = visibleProblems(folder, project);
  const waiting = view ? waitingFor(folder, project, view.queryId) : [];

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
        {team}
        <header className="app-rail-head">
          <h1>{info.name}</h1>
          {info.root && <p className="app-muted app-path">{info.root}</p>}
          {readOnly ? (
            <p className="app-save app-muted">
              Viewing · your changes aren't saved
            </p>
          ) : (
            <SaveStatus state={saveState} onDisk={!team} />
          )}
          {notice && (
            <p className="app-notice" role="status">
              {notice}
            </p>
          )}
        </header>

        <nav aria-labelledby="analyses-heading">
          <div className="app-section-head">
            <h2 id="analyses-heading">Analyses</h2>
            {!readOnly && project.queries.length > 0 && (
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
                  {!readOnly && analysis.path === selected.path && (
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
          <div className="app-section-head">
            <h2 id="data-heading">Data</h2>
            {databaseIds.length > 1 && !readOnly && actions.refreshSources && (
              <RefreshAll
                sourceIds={databaseIds}
                unread={unread.length}
                onRefresh={actions.refreshSources}
                onError={setRefreshAllError}
              />
            )}
            {addData && (
              <button
                type="button"
                className="app-button"
                aria-expanded={adding}
                onClick={() => setAdding((open) => !open)}
              >
                Add data
              </button>
            )}
          </div>
          {addData && adding && addData(() => setAdding(false))}
          {refreshAllError && (
            <p className="app-source-error app-refresh-error" role="alert">
              {refreshAllError}
            </p>
          )}
          <ul className="app-list">
            {project.sources.map((source) => {
              const database = folder.databases[source.id];
              if (database) {
                return (
                  <DatabaseSourceItem
                    key={source.id}
                    name={source.name}
                    sourceId={source.id}
                    connection={database.connection}
                    rows={folder.tables[source.id]?.length ?? 0}
                    snapshot={folder.snapshots[source.id]}
                    onRefresh={
                      readOnly || !actions.refreshSources
                        ? undefined
                        : (id) => actions.refreshSources!([id])
                    }
                  />
                );
              }
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
                  <Fetched
                    path={folder.paths[source.id]}
                    fetched={fetched}
                    onRefetch={actions.refetch}
                  />
                </li>
              );
            })}
            {looseFiles.map((path) => (
              <li key={path} className="app-source">
                <span>{path}</span>
                {!readOnly && (
                  <button
                    type="button"
                    className="app-button"
                    aria-label={`Chart ${path}`}
                    onClick={() => void actions.chartFile(path)}
                  >
                    Chart
                  </button>
                )}
                <Fetched
                  path={path}
                  fetched={fetched}
                  onRefetch={actions.refetch}
                />
              </li>
            ))}
          </ul>
        </section>

        {problems.length > 0 && (
          <details className="app-problems">
            <summary>
              {problems.length} problem
              {problems.length === 1 ? "" : "s"}
            </summary>
            <ul>
              {problems.map((problem, index) => (
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
        {view && waiting.length ? (
          <WaitingForData
            analysis={names.get(selected.path ?? "") ?? view.name}
            sourceIds={waiting}
            connections={[
              ...new Set(waiting.map((id) => folder.databases[id]!.connection)),
            ]}
            onRead={readOnly ? undefined : actions.refreshSources}
          />
        ) : view ? (
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
            addData={addData}
            readOnly={readOnly}
            dataFiles={looseFiles}
            onChart={(path) => void actions.chartFile(path)}
          />
        )}
      </main>
    </div>
  );
}

function SaveStatus({
  state,
  onDisk,
}: {
  state: SaveState;
  /** A folder the person can see; a team server keeps files out of sight. */
  onDisk: boolean;
}) {
  if (state.status === "failed") {
    return (
      <p className="app-save app-save-failed" role="alert">
        Couldn't save {state.path}: {state.message}
      </p>
    );
  }
  return (
    <p className="app-save app-muted" aria-live="polite">
      {state.status === "saving"
        ? "Saving…"
        : onDisk
          ? "Saved to the folder"
          : "Saved"}
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

/** A list of names in words: "a", "a and b", "a, b, and c". */
function listWords(items: string[]) {
  if (items.length < 3) {
    return items.join(" and ");
  }
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

/** Reads every database source again, in one go. */
function RefreshAll({
  sourceIds,
  unread,
  onRefresh,
  onError,
}: {
  sourceIds: string[];
  unread: number;
  onRefresh: (sourceIds: string[]) => Promise<void>;
  onError: (message: string | undefined) => void;
}) {
  const [reading, setReading] = useState(false);
  const run = async () => {
    setReading(true);
    onError(undefined);
    try {
      await onRefresh(sourceIds);
    } catch (error) {
      onError(
        `${error instanceof Error ? error.message : String(error)}${
          error instanceof RefreshError && error.suggestion
            ? ` ${error.suggestion}`
            : ""
        }`
      );
    } finally {
      setReading(false);
    }
  };
  return (
    <button
      type="button"
      className="app-button app-section-action"
      aria-label={`Read all ${sourceIds.length} database sources again`}
      disabled={reading}
      onClick={() => void run()}
    >
      {reading
        ? "Reading…"
        : unread === sourceIds.length
          ? "Read all"
          : "Refresh all"}
    </button>
  );
}

/** In place of an analysis whose database sources haven't been read. */
function WaitingForData({
  analysis,
  sourceIds,
  connections,
  onRead,
}: {
  analysis: string;
  sourceIds: string[];
  connections: string[];
  onRead?: (sourceIds: string[]) => Promise<void>;
}) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "reading" }
    | { status: "failed"; message: string; suggestion?: string }
  >({ status: "idle" });
  const read = async () => {
    if (!onRead) {
      return;
    }
    setState({ status: "reading" });
    try {
      await onRead(sourceIds);
    } catch (error) {
      setState({
        status: "failed",
        message: error instanceof Error ? error.message : String(error),
        ...(error instanceof RefreshError && error.suggestion
          ? { suggestion: error.suggestion }
          : {}),
      });
    }
  };
  const them = sourceIds.length === 1 ? "it" : "them";
  return (
    <div className="app-message">
      <h2>{analysis} needs its data</h2>
      <p>
        It reads {listWords(sourceIds)} from {listWords(connections)}, which{" "}
        {sourceIds.length === 1 ? "hasn't" : "haven't"} been read yet.{" "}
        {onRead
          ? `Read ${them} once; after that the project opens from the copy explorEDA keeps, and Refresh reads ${them} again.`
          : `An author of this project needs to read ${them} first.`}
      </p>
      {onRead && (
        <button
          type="button"
          className="app-button app-button-primary"
          disabled={state.status === "reading"}
          onClick={() => void read()}
        >
          {state.status === "reading"
            ? `Reading from ${listWords(connections)}…`
            : `Read ${listWords(sourceIds)}`}
        </button>
      )}
      {state.status === "failed" && (
        <p className="app-source-error" role="alert">
          {state.message}
          {state.suggestion && (
            <span className="app-muted"> {state.suggestion}</span>
          )}
        </p>
      )}
    </div>
  );
}

/** The time since a read, kept current while the page stays open. */
function useReadAgo(readAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!readAt) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [readAt]);
  return readAt ? readAgo(readAt, now) : undefined;
}

/** A database source: its rows, when they were read, and Refresh. */
function DatabaseSourceItem({
  name,
  sourceId,
  connection,
  rows,
  snapshot,
  onRefresh,
}: {
  name: string;
  sourceId: string;
  connection: string;
  rows: number;
  snapshot?: ProjectFolder["snapshots"][string];
  onRefresh?: (sourceId: string) => Promise<void>;
}) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "reading" }
    | { status: "failed"; message: string; suggestion?: string }
  >({ status: "idle" });
  const ago = useReadAgo(snapshot?.readAt);
  const refresh = async () => {
    if (!onRefresh) {
      return;
    }
    setState({ status: "reading" });
    try {
      await onRefresh(sourceId);
      setState({ status: "idle" });
    } catch (error) {
      setState({
        status: "failed",
        message: error instanceof Error ? error.message : String(error),
        ...(error instanceof RefreshError && error.suggestion
          ? { suggestion: error.suggestion }
          : {}),
      });
    }
  };
  return (
    <li className="app-source">
      <span>{name}</span>
      <span className="app-muted">
        {snapshot ? `${rows.toLocaleString()} rows · ` : ""}from {connection}
      </span>
      {!snapshot && state.status !== "reading" && (
        <span className="app-badge app-badge-warning">Not read</span>
      )}
      <span className="app-fetched">
        {(state.status === "reading" || ago) && (
          <span className="app-muted">
            {state.status === "reading"
              ? `Reading from ${connection}…`
              : `Read ${ago}`}
          </span>
        )}
        {onRefresh && state.status !== "reading" && (
          <button
            type="button"
            className="app-button"
            aria-label={`Read ${sourceId} again from ${connection}`}
            onClick={() => void refresh()}
          >
            {snapshot ? "Refresh" : "Read now"}
          </button>
        )}
      </span>
      {state.status === "failed" && (
        <p className="app-source-error" role="alert">
          {state.message}
          {state.suggestion && (
            <span className="app-muted"> {state.suggestion}</span>
          )}
        </p>
      )}
    </li>
  );
}

/** When and where a downloaded file came from, with a way to refresh it. */
function Fetched({
  path,
  fetched,
  onRefetch,
}: {
  path: string | undefined;
  fetched: Record<string, FetchedRecord>;
  onRefetch?: (path: string) => Promise<void>;
}) {
  const record = path ? fetched[path] : undefined;
  if (!path || !record) {
    return null;
  }
  return (
    <span className="app-fetched">
      <span className="app-muted">{fetchedLabel(record)}</span>
      {onRefetch && (
        <button
          type="button"
          className="app-button"
          aria-label={`Refetch ${path} from ${record.url}`}
          onClick={() => void onRefetch(path)}
        >
          Refetch
        </button>
      )}
    </span>
  );
}

function FirstRun({
  dataFiles,
  onChart,
  readOnly,
  addData,
}: {
  dataFiles: string[];
  onChart: (path: string) => void;
  readOnly: boolean;
  addData?: () => ReactNode;
}) {
  if (readOnly) {
    return (
      <div className="app-message">
        <h2>No analyses yet</h2>
        <p>An author of this project hasn't made one yet.</p>
      </div>
    );
  }
  if (!dataFiles.length && addData) {
    return (
      <div className="app-message">
        <h2>Add data to start</h2>
        <p>
          Add a CSV or JSON file to this project. Then chart it to start an
          analysis.
        </p>
        {addData()}
      </div>
    );
  }
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
        {addData
          ? "Charting a file adds it to the project and creates an analysis."
          : "Charting a file adds it to the project and creates an analysis. Both are text files in this folder, ready to commit."}
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
