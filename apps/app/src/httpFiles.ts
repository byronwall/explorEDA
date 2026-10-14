import {
  ProjectFileError,
  type ProjectFiles,
  type SnapshotInfo,
} from "exploreda";

/** Must match the server's TOKEN_HEADER. */
const TOKEN_HEADER = "x-exploreda-token";

export interface ServerInfo {
  name: string;
  /** The folder on disk; empty on a team server. */
  root: string;
  version: string;
  /** Where a new project keeps its text: the root, or `.exploreda/`. */
  layout: "visible" | "hidden";
  /** On a team server: what the signed-in person may do here. */
  role?: "author" | "viewer";
  account?: { name: string; email: string };
}

export type ThemePreference = "system" | "light" | "dark";

export interface GlobalConfig {
  theme: ThemePreference;
}

/** Where a downloaded data file came from; the server records it. */
export interface FetchedRecord {
  url: string;
  fetchedAt: string;
  bytes: number;
  etag?: string;
}

/** Adding data files from outside the folder, on a team server. */
export interface DataIntake {
  upload(file: Blob, path: string): Promise<void>;
  /** Downloads `url`, or downloads `path`'s recorded URL again. */
  fetchUrl(input: { url?: string; path?: string }): Promise<string>;
  /** Every downloaded file's record, by path. */
  fetched(): Promise<Record<string, FetchedRecord>>;
}

/** A refresh the server couldn't finish, with what to do about it. */
export class RefreshError extends Error {
  constructor(
    message: string,
    readonly suggestion?: string,
    readonly code?: string
  ) {
    super(message);
    this.name = "RefreshError";
  }
}

/** Reading database sources again, on a server that holds their secrets. */
export interface DatabaseRefresh {
  refresh(sourceId: string): Promise<SnapshotInfo>;
}

export type AppFiles = Omit<ProjectFiles, "watch"> & {
  intake?: DataIntake;
  databases?: DatabaseRefresh;
  info(): Promise<ServerInfo>;
  config(): Promise<GlobalConfig>;
  setConfig(change: Partial<GlobalConfig>): Promise<GlobalConfig>;
  /** `by` names who saved, when another person's save changed the files. */
  watch?(onChange: (paths: string[], by?: string) => void): () => void;
};

interface HttpFilesOptions {
  /** Where the project's API routes start, such as `/api`. */
  api: string;
  headers: Record<string, string>;
  /** The event stream's address; EventSource can't send headers. */
  events: string;
  config?: Pick<AppFiles, "config" | "setConfig">;
}

function createHttpFiles({ api, headers, events, config }: HttpFilesOptions) {
  const call = async (url: string, path = "", init: RequestInit = {}) => {
    const response = await fetch(url, {
      ...init,
      headers: { ...init.headers, ...headers },
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        code?: "missing" | "refused" | "unreadable";
        error?: string;
      };
      throw new ProjectFileError(
        body.code ?? (response.status === 404 ? "missing" : "unreadable"),
        path,
        body.error ?? `${response.status} ${response.statusText}`
      );
    }
    return response;
  };
  const files: AppFiles = {
    async info() {
      return (await call(`${api}/info`)).json() as Promise<ServerInfo>;
    },
    async config() {
      if (config) {
        return config.config();
      }
      return (await call(`${api}/config`)).json() as Promise<GlobalConfig>;
    },
    async setConfig(change) {
      if (config) {
        return config.setConfig(change);
      }
      return (
        await call(`${api}/config`, "", {
          method: "PUT",
          body: JSON.stringify(change),
        })
      ).json() as Promise<GlobalConfig>;
    },
    async list() {
      return (await call(`${api}/files`)).json() as Promise<string[]>;
    },
    async read(path) {
      return (
        await call(`${api}/file?path=${encodeURIComponent(path)}`, path)
      ).text();
    },
    async write(path, text) {
      await call(`${api}/file?path=${encodeURIComponent(path)}`, path, {
        method: "PUT",
        body: text,
      });
    },
    async remove(path) {
      await call(`${api}/file?path=${encodeURIComponent(path)}`, path, {
        method: "DELETE",
      });
    },
    watch(onChange) {
      const source = new EventSource(events);
      source.addEventListener("change", (event) => {
        const { paths, by } = JSON.parse(
          (event as MessageEvent<string>).data
        ) as { paths: string[]; by?: string };
        onChange(paths, by);
      });
      return () => source.close();
    },
  };
  return files;
}

/** Asks a server to read a database source again. */
export function databaseRefresh(
  api: string,
  headers: Record<string, string>
): DatabaseRefresh {
  return {
    async refresh(sourceId) {
      const response = await fetch(
        `${api}/sources/${encodeURIComponent(sourceId)}/refresh`,
        { method: "POST", headers }
      );
      const reply = (await response.json().catch(() => ({}))) as {
        error?: string;
        suggestion?: string;
        code?: string;
      };
      if (!response.ok) {
        throw new RefreshError(
          reply.error ?? `${response.status} ${response.statusText}`,
          reply.suggestion,
          reply.code
        );
      }
      return reply as SnapshotInfo;
    },
  };
}

/** The project's files, through the local server that `exploreda` starts. */
export function httpProjectFiles(token: string, base = "") {
  const headers = { [TOKEN_HEADER]: token };
  const files = createHttpFiles({
    api: `${base}/api`,
    headers,
    events: `${base}/api/events?token=${encodeURIComponent(token)}`,
  });
  files.databases = databaseRefresh(`${base}/api`, headers);
  return files;
}

/** Must match the team server's CLIENT_HEADER. */
const CLIENT_HEADER = "x-exploreda-client";
const THEME_KEY = "exploreda.theme";

/** Theme follows this browser on a team server; it isn't anyone's file. */
const browserConfig: Pick<AppFiles, "config" | "setConfig"> = {
  async config() {
    try {
      const theme = localStorage.getItem(THEME_KEY);
      if (theme === "light" || theme === "dark") {
        return { theme };
      }
    } catch {
      // Storage may be blocked; the default holds.
    }
    return { theme: "system" };
  },
  async setConfig(change) {
    const theme = change.theme ?? "system";
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage may be blocked; the choice lasts for this page.
    }
    return { theme };
  },
};

/**
 * A team server project's files. `client` names this page, so the server
 * doesn't announce this page's own saves back to it.
 */
export function teamProjectFiles(projectId: string, client: string) {
  const api = `/api/projects/${encodeURIComponent(projectId)}`;
  const files = createHttpFiles({
    api,
    headers: { [CLIENT_HEADER]: client },
    events: `${api}/events?client=${encodeURIComponent(client)}`,
    config: browserConfig,
  });
  const post = async (url: string, body: BodyInit, json = false) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        [CLIENT_HEADER]: client,
        ...(json ? { "content-type": "application/json" } : {}),
      },
      body,
    });
    const reply = (await response.json().catch(() => ({}))) as {
      error?: string;
      saved?: string;
    };
    if (!response.ok) {
      throw new Error(
        reply.error ?? `${response.status} ${response.statusText}`
      );
    }
    return reply;
  };
  files.intake = {
    async upload(file, path) {
      await post(`${api}/upload?path=${encodeURIComponent(path)}`, file);
    },
    async fetchUrl(input) {
      return (await post(`${api}/fetch`, JSON.stringify(input), true)).saved!;
    },
    async fetched() {
      try {
        return JSON.parse(
          await files.read(".exploreda/fetched.json")
        ) as Record<string, FetchedRecord>;
      } catch {
        return {};
      }
    },
  };
  return files;
}

const TOKEN_KEY = "exploreda.token";

/**
 * This run's key: from the link the command printed, then from the tab's
 * session. The link's copy is removed from the address bar.
 */
export function takeToken(): string | undefined {
  const url = new URL(window.location.href);
  const fromLink = url.searchParams.get("token");
  try {
    if (fromLink) {
      sessionStorage.setItem(TOKEN_KEY, fromLink);
      url.searchParams.delete("token");
      window.history.replaceState(null, "", url.pathname + url.search);
      return fromLink;
    }
    return sessionStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    return fromLink ?? undefined;
  }
}
