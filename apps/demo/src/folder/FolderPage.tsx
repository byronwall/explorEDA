import { useState } from "react";
import { Link } from "react-router";
import { directoryProjectFiles, type DirectoryHandleLike } from "exploreda";
// The standalone app's project shell, so a folder works the same here as
// under `npx exploreda`.
import { App } from "../../../app/src/App";
import type { AppFiles, GlobalConfig } from "../../../app/src/httpFiles";
import "../../../app/src/app.css";

const CONFIG_KEY = "exploreda.folder-config";

declare global {
  interface Window {
    showDirectoryPicker?: (options?: {
      mode?: "read" | "readwrite";
    }) => Promise<DirectoryHandleLike>;
  }
}

function readConfig(): GlobalConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(CONFIG_KEY) ?? "{}") as {
      theme?: GlobalConfig["theme"];
    };
    return { theme: saved.theme ?? "system" };
  } catch {
    return { theme: "system" };
  }
}

/** The app's file adapter for a folder this page opened. */
function folderFiles(handle: DirectoryHandleLike): AppFiles {
  return {
    ...directoryProjectFiles(handle),
    async info() {
      return {
        name: handle.name,
        root: handle.name,
        version: "browser",
        layout: "visible",
      };
    },
    async config() {
      return readConfig();
    },
    async setConfig(change) {
      const next = { ...readConfig(), ...change };
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
      } catch {
        // The preference lasts for this visit only.
      }
      return next;
    },
  };
}

/**
 * `/folder`: opens a project folder from this computer, the same files
 * `npx exploreda` reads and writes, and saves changes back to it.
 */
export default function FolderPage() {
  const [files, setFiles] = useState<AppFiles>();
  const [error, setError] = useState<string>();
  const supported = typeof window.showDirectoryPicker === "function";

  if (files) {
    return (
      <div className="h-screen">
        <App files={files} />
      </div>
    );
  }

  const open = async () => {
    setError(undefined);
    try {
      const handle = await window.showDirectoryPicker!({ mode: "readwrite" });
      setFiles(folderFiles(handle));
    } catch (problem) {
      if (problem instanceof Error && problem.name === "AbortError") {
        return;
      }
      setError(problem instanceof Error ? problem.message : String(problem));
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <Link
        to="/"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        explorEDA
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">Open a project folder</h1>
      <p className="mt-3 text-muted-foreground">
        Open a folder of CSV or JSON files, or one you work on with{" "}
        <code>npx exploreda</code>. Analyses save back to the folder as text
        files you can commit.
      </p>
      {supported ? (
        <button
          type="button"
          onClick={() => void open()}
          className="mt-6 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Choose a folder
        </button>
      ) : (
        <p className="mt-6 rounded-md border border-border bg-card p-4 text-sm">
          This browser can't open folders. Use Chrome or Edge, or run{" "}
          <code>npx exploreda</code> in the folder to open it from your
          terminal.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </main>
  );
}
