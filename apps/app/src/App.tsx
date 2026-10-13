import { useEffect, useMemo, useState } from "react";
import {
  ExplorEdaProject,
  readProjectFolder,
  type AnalysisProject,
  type AnalysisView,
  type ExplorEdaProjectChange,
  type ProjectFiles,
  type ProjectFolder,
  type SavedDataStructure,
} from "exploreda";
import { createAnalysisWorker } from "exploreda/analysis";
import type { ServerInfo } from "./httpFiles";

type AppFiles = ProjectFiles & { info(): Promise<ServerInfo> };

type Loaded =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | { status: "ready"; folder: ProjectFolder; info: ServerInfo };

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

export function App({ files }: { files: AppFiles }) {
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });

  useEffect(() => {
    let current = true;
    Promise.all([files.info(), readProjectFolder(files)])
      .then(([info, folder]) => {
        if (!current) {
          return;
        }
        document.title = `${info.name} · explorEDA`;
        setLoaded({ status: "ready", info, folder });
      })
      .catch((error: unknown) => {
        if (current) {
          setLoaded({
            status: "failed",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });
    return () => {
      current = false;
    };
  }, [files]);

  if (loaded.status === "loading") {
    return (
      <main className="app-message" aria-busy="true">
        <p>Reading the project folder…</p>
      </main>
    );
  }
  if (loaded.status === "failed") {
    return (
      <main className="app-message">
        <h1>The project folder couldn't be read</h1>
        <p role="alert">{loaded.message}</p>
        <p>
          Check that the <code>exploreda</code> command is still running, then
          reload this page.
        </p>
      </main>
    );
  }
  return <ProjectWorkspace folder={loaded.folder} info={loaded.info} />;
}

function ProjectWorkspace({
  folder,
  info,
}: {
  folder: ProjectFolder;
  info: ServerInfo;
}) {
  const [project, setProject] = useState<AnalysisProject>(folder.project);
  const [views, setViews] = useState(() => folderViews(folder));
  const [selected, setSelected] = useState(() => ({
    path: folder.analyses[0]?.path,
    index: 0,
  }));

  const analysisViews = selected.path ? (views.get(selected.path) ?? []) : [];
  const view = analysisViews[selected.index] ?? analysisViews[0];
  const allViews = useMemo(() => [...views.values()].flat(), [views]);

  const updateView = (id: string, change: Partial<AnalysisView>) => {
    setViews((previous) => {
      const next = new Map(previous);
      for (const [path, list] of next) {
        if (list.some((item) => item.id === id)) {
          next.set(
            path,
            list.map((item) => (item.id === id ? { ...item, ...change } : item))
          );
        }
      }
      return next;
    });
  };

  const onProjectChange = ({
    project: next,
    view: changed,
  }: ExplorEdaProjectChange) => {
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
