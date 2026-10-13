import { ProjectFileError, type ProjectFiles } from "exploreda";

/** Must match the server's TOKEN_HEADER. */
const TOKEN_HEADER = "x-exploreda-token";

export interface ServerInfo {
  name: string;
  root: string;
  version: string;
}

/** The project's files, through the local server that `exploreda` starts. */
export function httpProjectFiles(token: string, base = "") {
  const call = async (url: string, path = "", init: RequestInit = {}) => {
    const response = await fetch(`${base}${url}`, {
      ...init,
      headers: { ...init.headers, [TOKEN_HEADER]: token },
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
  const files: ProjectFiles & { info(): Promise<ServerInfo> } = {
    async info() {
      return (await call("/api/info")).json() as Promise<ServerInfo>;
    },
    async list() {
      return (await call("/api/files")).json() as Promise<string[]>;
    },
    async read(path) {
      return (
        await call(`/api/file?path=${encodeURIComponent(path)}`, path)
      ).text();
    },
    async write(path, text) {
      await call(`/api/file?path=${encodeURIComponent(path)}`, path, {
        method: "PUT",
        body: text,
      });
    },
    async remove(path) {
      await call(`/api/file?path=${encodeURIComponent(path)}`, path, {
        method: "DELETE",
      });
    },
    watch(onChange) {
      const events = new EventSource(
        `${base}/api/events?token=${encodeURIComponent(token)}`
      );
      events.addEventListener("change", (event) => {
        const { paths } = JSON.parse((event as MessageEvent<string>).data) as {
          paths: string[];
        };
        onChange(paths);
      });
      return () => events.close();
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
