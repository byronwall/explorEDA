import { useEffect, useRef, useState } from "react";
import {
  isDataFile,
  readProjectFolder,
  type ProjectFiles,
  type ProjectFolder,
} from "exploreda";
import type { ServerInfo } from "./httpFiles";
import { ProjectWorkspace, type Selection } from "./ProjectWorkspace";
import { FolderSaver, type SaveState } from "./saver";

type AppFiles = ProjectFiles & { info(): Promise<ServerInfo> };

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

export function App({ files }: { files: AppFiles }) {
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });
  const [saveState, setSaveState] = useState<SaveState>({ status: "saved" });
  const [saver] = useState(() => new FolderSaver(files, setSaveState));
  const selection = useRef<Selection | undefined>(undefined);

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
  return (
    <ProjectWorkspace
      key={loaded.generation}
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
