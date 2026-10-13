import { useEffect, useRef, useState } from "react";
import { isDataFile, readProjectFolder, type ProjectFolder } from "exploreda";
import type { AppFiles, ServerInfo, ThemePreference } from "./httpFiles";
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
      info: ServerInfo;
      /** Counts reloads, so the workspace starts over from the new files. */
      generation: number;
      notice?: string;
    };

/** Files whose change alters the project: text and data. */
const affectsProject = (path: string) =>
  path.toLowerCase().endsWith(".eda") || isDataFile(path);

function describeChange(paths: string[]) {
  const [first, ...rest] = paths;
  return rest.length
    ? `${first} and ${rest.length} other file${rest.length === 1 ? "" : "s"} changed on disk, so the project reloaded.`
    : `${first} changed on disk, so the project reloaded.`;
}

/** Light or dark follows the preference, or the system when it says so. */
function applyTheme(theme: ThemePreference) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", Boolean(dark));
}

export function App({ files }: { files: AppFiles }) {
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });
  const [saveState, setSaveState] = useState<SaveState>({ status: "saved" });
  const [saver] = useState(() => new FolderSaver(files, setSaveState));
  const selection = useRef<Selection | undefined>(undefined);
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
    const folder = await readProjectFolder(files);
    selection.current = path ? { path, index: 0 } : selection.current;
    setLoaded((previous) =>
      previous.status === "ready"
        ? {
            ...previous,
            folder,
            generation: previous.generation + 1,
            notice,
          }
        : previous
    );
  };

  useEffect(() => {
    let current = true;
    Promise.all([files.info(), readProjectFolder(files)])
      .then(([info, folder]) => {
        if (!current) {
          return;
        }
        document.title = `${info.name} · explorEDA`;
        setLoaded({ status: "ready", info, folder, generation: 0 });
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
    const stop = files.watch?.((paths) => {
      const changed = paths.filter(affectsProject);
      if (!changed.length) {
        return;
      }
      reloading = reloading.then(async () => {
        for (const path of changed) {
          saver.cancel(path);
        }
        await saver.flush();
        const folder = await readProjectFolder(files);
        setLoaded((previous) =>
          previous.status === "ready"
            ? {
                ...previous,
                folder,
                generation: previous.generation + 1,
                notice: describeChange(changed),
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
        <p>
          Check that the <code>exploreda</code> command is still running, then
          reload this page.
        </p>
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
      theme={theme}
      onThemeChange={changeTheme}
      folder={loaded.folder}
      info={loaded.info}
      saver={saver}
      saveState={saveState}
      notice={loaded.notice}
      initialSelection={selection.current}
      onSelect={(next) => {
        selection.current = next;
      }}
    />
  );
}
