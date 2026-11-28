import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  analysisFileText,
  ExplorEdaNotebook,
  ExplorEdaProject,
  HIDDEN_PROJECT_FILE,
  PROJECT_FILE,
  projectFileText,
  proposeLinks,
  readNotebookText,
  withoutLocalSources,
  sourceUsage,
  type AnalysisProject,
  type ForeignKey,
  type AnalysisView,
  type ExplorEdaProjectChange,
  type ExplorEdaProjectHandle,
  type ProjectFolder,
  type SavedDataStructure,
} from "exploreda";
import { createAnalysisWorker } from "exploreda/analysis";
import { AddData } from "./AddData";
import type { FetchedRecord, ServerInfo, ThemePreference } from "./httpFiles";
import type { FolderSaver, SaveState } from "./saver";
import type { AddDatabaseActions } from "./AddDatabase";
import { visibleProblems, waitingFor } from "./databaseSources";
import { type ReadFailure, WaitingForData } from "./DatabaseSourceViews";
import { ProjectRail } from "./ProjectRail";
import {
  exploreView,
  ownQuery,
  savedName,
  usedByText,
  type ExploreDraft,
} from "./explore";

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
  /** A new analysis for a view a panel opened, with its new query if any. */
  openView(
    view: AnalysisView,
    name: string,
    project?: AnalysisProject,
    /** The project to write the view against, without writing its text. */
    context?: AnalysisProject
  ): Promise<void>;
  renameAnalysis(path: string, name: string): Promise<void>;
  deleteAnalysis(path: string): Promise<void>;
  /** On a team server: add a data file from this computer or a URL. */
  upload?(file: File, path: string): Promise<void>;
  fetchUrl?(url: string): Promise<void>;
  refetch?(path: string): Promise<void>;
  /** Removes a database source that couldn't be read. */
  removeSource?(sourceId: string): Promise<void>;
  /** Reads database sources again; rejects with why one couldn't. */
  refreshSources?(sourceIds: string[]): Promise<void>;
  /** Checks a connection's password and keeps it outside the project. */
  saveSecret?(connectionId: string, secret: string): Promise<void>;
  /** Adding database sources from the app, where the server reads them. */
  database?: Omit<AddDatabaseActions, "saveSecret">;
  /** Foreign keys a connection declares, to draft relationships from. */
  foreignKeys?(connectionId: string): Promise<ForeignKey[]>;
}

/** What to show open when the workspace starts again after a reload. */
export interface OpenPanel {
  /** The add-database panel, on this connection. */
  addDatabase?: string;
}

export interface Selection {
  path?: string;
  index: number;
  /** A source explored on its own, in an unsaved view. */
  source?: string;
}

export function ProjectWorkspace({
  folder,
  info,
  saver,
  saveState,
  notice,
  readErrors = {},
  initialSelection,
  initialPanel,
  onSelect,
  notebookMemory,
  dismissedLinks,
  onDismissLink,
  exploreMemory,
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
  /** Each source's last failed read, by source ID. */
  readErrors?: Record<string, ReadFailure>;
  initialSelection?: Selection;
  initialPanel?: OpenPanel;
  onSelect: (selection: Selection) => void;
  /** A notebook's last working block text, kept by the host across reloads. */
  notebookMemory?: (path: string) => { current: Record<number, string> };
  /** Drafted links the user dismissed, kept by the host across reloads. */
  dismissedLinks?: ReadonlySet<string>;
  onDismissLink?: (id: string) => void;
  /** The explored source's unsaved edits, kept by the host across reloads. */
  exploreMemory?: { current?: ExploreDraft };
}) {
  const [project, setProject] = useState<AnalysisProject>(folder.project);
  const [views, setViews] = useState(() => folderViews(folder));
  const [addingDatabase, setAddingDatabase] = useState(
    initialPanel?.addDatabase !== undefined
  );
  const [selected, setSelectedState] = useState<Selection>(() =>
    (initialSelection?.path &&
      [...folder.analyses, ...folder.notebooks].some(
        (item) => item.path === initialSelection.path
      )) ||
    (initialSelection?.source &&
      folder.project.sources.some(
        (item) => item.id === initialSelection.source
      ))
      ? initialSelection!
      : {
          path: folder.analyses[0]?.path ?? folder.notebooks[0]?.path,
          index: 0,
        }
  );
  const notebook = folder.notebooks.find((item) => item.path === selected.path);
  // Notebook text as the app holds it, with chart edits written back.
  const [notebookTexts, setNotebookTexts] = useState(
    () => new Map(folder.notebooks.map((item) => [item.path, item.text]))
  );
  // The explored source's charts, filters, and inputs, until it is saved or
  // left. The host keeps them while the folder reloads under it.
  const [draft, setDraftState] = useState<ExploreDraft | undefined>(() => {
    const kept = exploreMemory?.current;
    // A draft made for a query that has since changed on disk starts over.
    return kept &&
      kept.source === selected.source &&
      kept.query === ownQuery(folder.project, kept.source)
      ? kept
      : undefined;
  });
  useEffect(() => {
    // A draft the reload set aside stays set aside, even if its query
    // comes back as it was.
    if (exploreMemory && exploreMemory.current !== draft) {
      exploreMemory.current = draft;
    }
    // The explored source is gone after a reload: the fallback is selected
    // now, and the source's draft goes with it.
    if (
      initialSelection?.source &&
      selected.source !== initialSelection.source
    ) {
      if (exploreMemory) exploreMemory.current = undefined;
      onSelect(selected);
    }
    // Once, for the selection this workspace opened on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setDraft = (next: ExploreDraft | undefined) => {
    setDraftState(next);
    if (exploreMemory) exploreMemory.current = next;
  };
  const setSelected = (next: Selection) => {
    if (next.source !== selected.source) setDraft(undefined);
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

  // Where project text goes; a folder without it gets it on the first
  // definition edit, such as a calculation on a source's own query.
  const projectPath =
    folder.projectPath ??
    (folder.layout === "hidden" ? HIDDEN_PROJECT_FILE : PROJECT_FILE);

  /** The text each file would hold for the project and views as they are. */
  const fileText = (
    path: string,
    state: { project: AnalysisProject; views: Map<string, AnalysisView[]> }
  ) =>
    path === projectPath
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
    // Missing project text that would say nothing new stays unwritten.
    saver.known(projectPath, fileText(projectPath, initial));
    for (const item of folder.notebooks) {
      saver.known(item.path, item.text);
    }
    // The saver and folder are fixed for this workspace's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = useRef(new Set<string>());
  const workspace = useRef<ExplorEdaProjectHandle>(null);
  useEffect(() => {
    for (const path of dirty.current) {
      saver.queue(path, fileText(path, { project, views }));
    }
    dirty.current.clear();
    // fileText reads only folder and names, which don't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, views, saver]);

  const analysisViews =
    selected.path && !notebook ? (views.get(selected.path) ?? []) : [];
  const explored = useMemo(
    () =>
      selected.source
        ? exploreView(project, folder.tables, selected.source)
        : undefined,
    [selected.source, project, folder.tables]
  );
  const exploring = Boolean(selected.source && explored);
  const view = explored
    ? {
        ...explored,
        ...draft?.view,
        id: explored.id,
        name: explored.name,
        queryId: explored.queryId,
      }
    : (analysisViews[selected.index] ?? analysisViews[0]);
  // Notebooks read queries too, so checks before removing one count them.
  const allViews = useMemo(
    () => [
      ...[...views.values()].flat(),
      ...folder.notebooks.flatMap((item) => {
        // A notebook edited here reads as its text is now, not as loaded.
        const text = notebookTexts.get(item.path) ?? item.text;
        const result =
          text === item.text
            ? item.result
            : readNotebookText(text, {
                project,
                tables: folder.tables,
                defaultQueryId: item.result.queryId,
                name: item.result.settings.metadata.name,
              });
        return [result.queryId, ...Object.keys(result.queryRows)].map(
          (queryId, index) => ({
            id: viewId(item.path, index),
            name: result.settings.metadata.name || item.path,
            queryId,
            // Each query's blocks compile apart, to their own charts.
            settings: index
              ? (result.querySettings[queryId] ?? result.settings)
              : result.settings,
          })
        );
      }),
    ],
    [views, folder.notebooks, folder.tables, notebookTexts, project]
  );

  // Each source's analyses and notebooks, by the files' names, as the
  // Schema diagram traces them.
  const usedBy = useMemo(() => {
    const fileName = (path: string) =>
      names.get(path) ??
      folder.notebooks.find((item) => item.path === path)?.result.settings
        .metadata.name ??
      path;
    const usage = sourceUsage(project, folder.tables, allViews);
    return Object.fromEntries(
      [...usage].map(([sourceId, viewIds]) => [
        sourceId,
        [
          ...new Set(
            viewIds.map((id) => fileName(id.slice(0, id.lastIndexOf("#"))))
          ),
        ],
      ])
    );
  }, [project, folder, allViews, names]);

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
    dirty.current.add(projectPath);
    // An analysis that brings its own source writes it in its own file.
    for (const path of new Set(Object.values(folder.localSources))) {
      dirty.current.add(path);
    }
    if (exploring && selected.source) {
      // The explorer stays on the source's own query. When that query's
      // steps change, its charts start again from the new fields.
      const query = ownQuery(next, selected.source);
      const { id: _id, name: _name, queryId: _queryId, ...kept } = changed;
      setDraft(
        query === ownQuery(project, selected.source)
          ? { source: selected.source, query, view: kept }
          : undefined
      );
    } else {
      updateView(changed.id, changed);
    }
    setProject(next);
  };
  const onStateChange = (settings: SavedDataStructure) => {
    if (exploring && selected.source) {
      setDraft({
        source: selected.source,
        query: ownQuery(project, selected.source),
        view: { ...draft?.view, settings },
      });
    } else if (view) {
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
  // Connections with two or more sources: the tables links are drafted for.
  const linkedConnections = [
    ...new Set(
      databaseIds
        .map((id) => folder.databases[id]!.connection)
        .filter((connection, index, all) => all.indexOf(connection) !== index)
    ),
  ];
  const [keys, setKeys] = useState<Record<string, ForeignKey[]>>({});
  const [dismissed, setDismissed] = useState(
    () => new Set(dismissedLinks ?? [])
  );
  useEffect(() => {
    if (readOnly) return;
    for (const connection of linkedConnections) {
      actions.foreignKeys?.(connection).then(
        (list) => setKeys((previous) => ({ ...previous, [connection]: list })),
        // Without declared keys, links are drafted from names alone.
        () => {}
      );
    }
    // Asked once per connection; the app caches the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedConnections.join("\u0000"), readOnly]);
  const proposals = useMemo(
    () =>
      readOnly
        ? []
        : proposeLinks({
            project: withoutLocalSources(project, folder.localSources),
            tables: folder.tables,
            databases: folder.databases,
            foreignKeys: keys,
            dismissed,
          }),
    [readOnly, project, folder, keys, dismissed]
  );
  const dismissLink = (id: string) => {
    setDismissed((previous) => new Set(previous).add(id));
    onDismissLink?.(id);
  };
  const canAddDatabase = !readOnly && Boolean(actions.database);
  const waiting = view ? waitingFor(folder, project, view.queryId) : [];

  const usedFiles = new Set(Object.values(folder.paths));
  const looseFiles = folder.dataFiles.filter((path) => !usedFiles.has(path));

  const source = explored
    ? project.sources.find((item) => item.id === explored.queryId)
    : undefined;
  const saveExplored = () => {
    if (!view || !source) return;
    const settings = workspace.current?.getSettings() ?? view.settings;
    const name = savedName(source.name, names.values());
    // Written against the project as it is now; the project's own text
    // saves through the saver, as any edit does.
    void actions.openView({ ...view, settings }, name, undefined, project);
  };
  const exploreHead = source && (
    <div className="app-explore-head">
      <h2>{source.name}</h2>
      <span className="app-muted">
        {plural(folder.tables[source.id]?.length ?? 0, "row")}
        {folder.paths[source.id] ? ` · ${folder.paths[source.id]}` : ""}
        {` · ${usedByText(usedBy[source.id])}`}
      </span>
    </div>
  );
  const exploreActions = source && !readOnly && (
    <button
      type="button"
      className="app-button app-button-sm app-button-primary"
      onClick={saveExplored}
    >
      Save as analysis
    </button>
  );

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
      <ProjectRail
        folder={folder}
        project={project}
        info={info}
        team={team}
        readOnly={readOnly}
        saveState={saveState}
        notice={notice}
        readErrors={readErrors}
        fetched={fetched}
        actions={actions}
        theme={theme}
        onThemeChange={onThemeChange}
        selected={selected}
        onSelect={setSelected}
        addingDatabase={addingDatabase}
        onAddingDatabase={setAddingDatabase}
        initialConnection={initialPanel?.addDatabase || undefined}
        problems={visibleProblems(folder, project)}
        suggestedLinks={proposals.length}
        usedBy={usedBy}
        onOpenSchema={
          project.sources.length > 1 && view && !notebook
            ? () => workspace.current?.openSchema?.()
            : undefined
        }
      />

      <main className="app-main">
        {notebook ? (
          <ExplorEdaNotebook
            key={notebook.path}
            text={notebookTexts.get(notebook.path) ?? notebook.text}
            data={notebook.result.rows}
            queries={notebook.result.queryRows}
            name={notebook.result.settings.metadata.name}
            lastValid={notebookMemory?.(notebook.path)}
            onTextChange={
              readOnly
                ? undefined
                : (next) => {
                    setNotebookTexts((previous) =>
                      new Map(previous).set(notebook.path, next)
                    );
                    saver.queue(notebook.path, next);
                  }
            }
          />
        ) : view && waiting.length ? (
          <WaitingForData
            analysis={
              source?.name ?? names.get(selected.path ?? "") ?? view.name
            }
            sourceIds={waiting}
            connections={[
              ...new Set(waiting.map((id) => folder.databases[id]!.connection)),
            ]}
            lastError={waiting.map((id) => readErrors[id]).find(Boolean)}
            onRead={readOnly ? undefined : actions.refreshSources}
            onSaveSecret={readOnly ? undefined : actions.saveSecret}
          />
        ) : view ? (
          <ExplorEdaProject
            ref={workspace}
            key={view.id}
            project={project}
            tables={folder.tables}
            view={view}
            views={allViews}
            onProjectChange={onProjectChange}
            onStateChange={onStateChange}
            onOpenView={
              readOnly
                ? undefined
                : (next, name, nextProject) =>
                    void actions.openView(next, name, nextProject)
            }
            onAddSource={
              canAddDatabase ? () => setAddingDatabase(true) : undefined
            }
            linkProposals={proposals}
            onDismissLinkProposal={dismissLink}
            createWorker={createAnalysisWorker}
            toolbarStart={exploreHead || tabs}
            toolbarEnd={exploreActions || undefined}
          />
        ) : (
          <FirstRun
            addData={addData}
            readOnly={readOnly}
            dataFiles={looseFiles}
            onChart={(path) => void actions.chartFile(path)}
            onAddDatabase={
              canAddDatabase ? () => setAddingDatabase(true) : undefined
            }
          />
        )}
      </main>
    </div>
  );
}

const plural = (count: number, word: string) =>
  `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

function FirstRun({
  dataFiles,
  onChart,
  readOnly,
  addData,
  onAddDatabase,
}: {
  dataFiles: string[];
  onChart: (path: string) => void;
  readOnly: boolean;
  addData?: () => ReactNode;
  onAddDatabase?: () => void;
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
        {onAddDatabase && (
          <>
            <p>Or read a table or a query from a database.</p>
            <button
              type="button"
              className="app-button app-button-primary"
              onClick={onAddDatabase}
            >
              Add a database
            </button>
          </>
        )}
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
