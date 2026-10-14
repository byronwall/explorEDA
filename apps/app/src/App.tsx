import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  isDataFile,
  isNotebookPath,
  isSnapshotPath,
  readProjectFolder,
  snapshotPath,
  type ProjectFolder,
} from "exploreda";
import type {
  AppFiles,
  FetchedRecord,
  ServerInfo,
  ThemePreference,
} from "./httpFiles";
import {
  chartDataFile,
  createAnalysis,
  renameAnalysis,
} from "./projectActions";
import {
  ProjectWorkspace,
  type ProjectActions,
  type Selection,
} from "./ProjectWorkspace";
import { FolderSaver, type SaveState } from "./saver";

type Loaded =
  | { status: "loading" }
  | { status: "failed"; message: string }
  | {
      status: "ready";
      folder: ProjectFolder;
      /** Where downloaded data files came from, by path. */
      fetched: Record<string, FetchedRecord>;
      info: ServerInfo;
      /** Counts reloads, so the workspace starts over from the new files. */
      generation: number;
      notice?: string;
    };

/** Files whose change alters the project: text, notebooks, and data. */
const affectsProject = (path: string) =>
  path.toLowerCase().endsWith(".eda") ||
  isNotebookPath(path) ||
  isDataFile(path);

/** The source a snapshot file belongs to. */
const snapshotSource = (path: string) =>
  decodeURIComponent(
    path
      .split("/")
      .at(-1)!
      .replace(/\.json$/, "")
  );

export function describeChange(paths: string[], by?: string) {
  if (paths.every(isSnapshotPath)) {
    const sources = paths.map(snapshotSource).join(", ");
    return by
      ? `${by} refreshed ${sources}, so the project reloaded.`
      : `${sources} ${paths.length === 1 ? "was" : "were"} read again from the database, so the project reloaded.`;
  }
  const [first, ...rest] = paths;
  const files = rest.length
    ? `${first} and ${rest.length} other file${rest.length === 1 ? "" : "s"}`
    : first;
  return by
    ? `${by} changed ${files}, so the project reloaded.`
    : `${files} changed on disk, so the project reloaded.`;
}

/** What a refresh read, in a sentence. */
export function describeReads(
  read: { sourceId: string; rows: number; connection: string }[]
) {
  const rows = (count: number) =>
    `${count.toLocaleString()} row${count === 1 ? "" : "s"}`;
  if (read.length === 1) {
    const [only] = read;
    return `Read ${rows(only!.rows)} into ${only!.sourceId} from ${only!.connection}.`;
  }
  const total = read.reduce((sum, item) => sum + item.rows, 0);
  return `Read ${rows(total)} into ${read.map((item) => item.sourceId).join(", ")}.`;
}

/** Light or dark follows the preference, or the system when it says so. */
function applyTheme(theme: ThemePreference) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", Boolean(dark));
}

/** The folder, and on a team server the record of downloaded files. */
async function readAll(files: AppFiles) {
  const [folder, fetched] = await Promise.all([
    readProjectFolder(files),
    files.intake?.fetched() ?? Promise.resolve({}),
  ]);
  return { folder, fetched };
}

export function App({
  files,
  readOnly = false,
  team,
}: {
  files: AppFiles;
  /** Edits stay in the page and are never saved. */
  readOnly?: boolean;
  /** On a team server: the bar above the project, with sign-out. */
  team?: ReactNode;
}) {
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });
  const [saveState, setSaveState] = useState<SaveState>({ status: "saved" });
  const [saver] = useState(
    () => new FolderSaver(files, setSaveState, undefined, readOnly)
  );
  const selection = useRef<Selection | undefined>(undefined);
  /** Snapshots this page asked for, which it reloads itself. */
  const ownSnapshots = useRef(new Map<string, number>());
  // Each notebook's last working block text, kept across reloads.
  const notebookMemory = useRef(
    new Map<string, { current: Record<number, string> }>()
  );
  const [theme, setTheme] = useState<ThemePreference>("system");

  useEffect(() => {
    files
      .config()
      .then((config) => setTheme(config.theme))
      .catch(() => {});
  }, [files]);
  useEffect(() => {
    applyTheme(theme);
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const follow = () => applyTheme(theme);
    media?.addEventListener("change", follow);
    return () => media?.removeEventListener("change", follow);
  }, [theme]);
  const changeTheme = (next: ThemePreference) => {
    setTheme(next);
    void files.setConfig({ theme: next }).catch(() => {});
  };

  /** Saves what is waiting, reads the folder again, and opens `path`. */
  const reload = async (path: string | undefined, notice?: string) => {
    await saver.flush();
    const { folder, fetched } = await readAll(files);
    selection.current = path ? { path, index: 0 } : selection.current;
    setLoaded((previous) =>
      previous.status === "ready"
        ? {
            ...previous,
            folder,
            fetched,
            generation: previous.generation + 1,
            notice,
          }
        : previous
    );
  };

  useEffect(() => {
    let current = true;
    Promise.all([files.info(), readAll(files)])
      .then(([info, { folder, fetched }]) => {
        if (!current) {
          return;
        }
        document.title = `${info.name} · explorEDA`;
        setLoaded({ status: "ready", info, folder, fetched, generation: 0 });
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

  // Outside edits win: drop unsaved changes to those files, save the rest,
  // and read the folder again.
  useEffect(() => {
    let reloading = Promise.resolve();
    const stop = files.watch?.((paths, by) => {
      const changed = paths.filter((path) => {
        const asked = ownSnapshots.current.get(path);
        if (asked !== undefined && Date.now() - asked < 10_000) {
          ownSnapshots.current.delete(path);
          return false;
        }
        return affectsProject(path);
      });
      if (!changed.length) {
        return;
      }
      reloading = reloading.then(async () => {
        for (const path of changed) {
          saver.cancel(path);
        }
        await saver.flush();
        const { folder, fetched } = await readAll(files);
        setLoaded((previous) =>
          previous.status === "ready"
            ? {
                ...previous,
                folder,
                fetched,
                generation: previous.generation + 1,
                notice: describeChange(changed, by),
              }
            : previous
        );
      });
    });
    return stop;
  }, [files, saver]);

  // A notice about a reload fades after a few seconds.
  const notice = loaded.status === "ready" ? loaded.notice : undefined;
  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = setTimeout(
      () =>
        setLoaded((previous) =>
          previous.status === "ready"
            ? { ...previous, notice: undefined }
            : previous
        ),
      6000
    );
    return () => clearTimeout(timer);
  }, [notice]);

  // Leaving the page writes what is still waiting.
  useEffect(() => {
    const flush = () => void saver.flush();
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [saver]);

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
        {team ? (
          <p>Reload this page, or go back to your projects.</p>
        ) : (
          <p>
            Check that the <code>exploreda</code> command is still running, then
            reload this page.
          </p>
        )}
      </main>
    );
  }
  const { folder, info } = loaded;
  const act =
    (
      run: () => Promise<string | undefined>,
      notice: (path?: string) => string
    ) =>
    async () => {
      try {
        await saver.flush();
        const path = await run();
        await reload(path, notice(path));
      } catch (error) {
        await reload(
          undefined,
          `That didn't work: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    };
  const actions: ProjectActions = {
    chartFile: (dataPath) =>
      act(
        () =>
          chartDataFile(files, folder, {
            dataPath,
            projectName: info.name,
            layout: info.layout,
          }),
        (path) => `Created ${path} to chart ${dataPath}.`
      )(),
    createAnalysis: (name, queryId) =>
      act(
        () => createAnalysis(files, folder, { name, queryId }),
        (path) => `Created ${path}.`
      )(),
    renameAnalysis: (path, name) =>
      act(
        () => renameAnalysis(files, folder, { path, name }),
        (next) => `Renamed ${path} to ${next}.`
      )(),
    ...(files.intake && !readOnly
      ? {
          upload: (file: File, path: string) =>
            act(
              async () => {
                await files.intake!.upload(file, path);
                return undefined;
              },
              () => `Added ${path}. Chart it to start an analysis.`
            )(),
          fetchUrl: (url: string) => {
            let saved = "";
            return act(
              async () => {
                saved = await files.intake!.fetchUrl({ url });
                return undefined;
              },
              () => `Downloaded ${saved}. Chart it to start an analysis.`
            )();
          },
          refetch: (path: string) =>
            act(
              async () => {
                await files.intake!.fetchUrl({ path });
                return undefined;
              },
              () => `Downloaded a fresh copy of ${path}.`
            )(),
        }
      : {}),
    ...(files.databases && !readOnly
      ? {
          refreshSources: async (sourceIds: string[]) => {
            await saver.flush();
            const read: {
              sourceId: string;
              rows: number;
              connection: string;
            }[] = [];
            try {
              for (const sourceId of sourceIds) {
                const path = snapshotPath(sourceId);
                ownSnapshots.current.set(path, Date.now());
                try {
                  const info = await files.databases!.refresh(sourceId);
                  read.push({
                    sourceId,
                    rows: info.rowCount,
                    connection: info.connection,
                  });
                } catch (error) {
                  ownSnapshots.current.delete(path);
                  throw error;
                }
              }
            } finally {
              if (read.length) {
                await reload(undefined, describeReads(read));
              }
            }
          },
        }
      : {}),
    deleteAnalysis: (path) =>
      act(
        async () => {
          saver.cancel(path);
          await files.remove(path);
          return undefined;
        },
        () => `Deleted ${path}.`
      )(),
  };

  return (
    <ProjectWorkspace
      key={loaded.generation}
      actions={actions}
      readOnly={readOnly}
      team={team}
      theme={theme}
      onThemeChange={changeTheme}
      folder={loaded.folder}
      fetched={loaded.fetched}
      info={loaded.info}
      saver={saver}
      saveState={saveState}
      notice={loaded.notice}
      initialSelection={selection.current}
      notebookMemory={(path) => {
        let memory = notebookMemory.current.get(path);
        if (!memory) {
          memory = { current: {} };
          notebookMemory.current.set(path, memory);
        }
        return memory;
      }}
      onSelect={(next) => {
        selection.current = next;
      }}
    />
  );
}
