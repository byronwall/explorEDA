/**
 * The local server's requests: the app's files, and the project folder's
 * files under `/api`. The browser runs the folder reader; the server only
 * lists and reads files. Every API call must carry this run's token and
 * reach the server by a local host name, so another website open in the
 * same browser can't read the folder.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import type { ConfigStore } from "../node/globalConfig";
import type { NodeProjectFiles } from "../node/projectFiles";
import {
  fileRoutes,
  openEvents,
  readBody,
  send,
  sendError,
  serveApp,
} from "./http";

export const TOKEN_HEADER = "x-exploreda-token";

export interface ServerInfo {
  /** The folder's name, for the page title. */
  name: string;
  root: string;
  version: string;
  /** Where a new project keeps its text: the root, or `.exploreda/`. */
  layout: "visible" | "hidden";
}

export interface HandlerOptions {
  files: NodeProjectFiles;
  token: string;
  version: string;
  /** The built app; without it, requests outside `/api` go to `next`. */
  appDir?: string;
  /** `--hidden`: a new project keeps its text in `.exploreda/`. */
  hidden?: boolean;
  /** Preferences shared by every project on this machine. */
  config?: ConfigStore;
}

type Next = () => void;

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

/** True when the request names this machine, not a name that resolves to it. */
export function isLocalHost(host: string | undefined) {
  if (!host) {
    return false;
  }
  const name = host.startsWith("[")
    ? host.slice(0, host.indexOf("]") + 1)
    : host.split(":")[0]!;
  return LOCAL_HOSTS.has(name.toLowerCase());
}

function sameToken(given: string | undefined, token: string) {
  if (!given) {
    return false;
  }
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createRequestHandler(options: HandlerOptions) {
  const { files, token, appDir, version, config } = options;
  // Every open page hears about outside changes over server-sent events.
  const listeners = new Set<ServerResponse>();
  let stopWatching: (() => void) | undefined;
  const broadcast = (paths: string[]) => {
    const message = `event: change\ndata: ${JSON.stringify({ paths })}\n\n`;
    for (const listener of listeners) {
      listener.write(message);
    }
  };
  const info: ServerInfo = {
    name: path.basename(files.root),
    root: files.root,
    version,
    layout: options.hidden ? "hidden" : "visible",
  };
  return async (req: IncomingMessage, res: ServerResponse, next?: Next) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!isLocalHost(req.headers.host)) {
      send(res, 403, {
        error: "This server answers only to 127.0.0.1 and localhost.",
      });
      return;
    }
    if (!url.pathname.startsWith("/api/")) {
      if (appDir) {
        await serveApp(appDir, url.pathname, res);
      } else {
        next?.();
      }
      return;
    }
    const header = req.headers[TOKEN_HEADER];
    // EventSource can't send headers, so the event stream takes the key in
    // its address.
    const given =
      url.pathname === "/api/events"
        ? (url.searchParams.get("token") ?? undefined)
        : Array.isArray(header)
          ? header[0]
          : header;
    if (!sameToken(given, token)) {
      send(res, 403, {
        error:
          "Open the link the exploreda command printed; it carries this run's key.",
      });
      return;
    }
    try {
      if (req.method === "GET" && url.pathname === "/api/info") {
        send(res, 200, info);
      } else if (url.pathname === "/api/config" && config) {
        if (req.method === "PUT") {
          send(res, 200, await config.write(JSON.parse(await readBody(req))));
        } else {
          send(res, 200, await config.read());
        }
      } else if (url.pathname === "/api/events" && req.method === "GET") {
        openEvents(req, res, () => {
          listeners.delete(res);
          if (!listeners.size) {
            stopWatching?.();
            stopWatching = undefined;
          }
        });
        listeners.add(res);
        stopWatching ??= files.watch?.(broadcast);
      } else if (
        !(await fileRoutes(files, url.pathname.slice(5), url, req, res, {
          canWrite: true,
        }))
      ) {
        send(res, 404, { error: `No ${req.method} ${url.pathname}.` });
      }
    } catch (error) {
      sendError(res, error);
    }
  };
}
