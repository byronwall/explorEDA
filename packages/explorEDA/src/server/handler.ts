/**
 * The local server's requests: the app's files, and the project folder's
 * files under `/api`. The browser runs the folder reader; the server only
 * lists and reads files. Every API call must carry this run's token and
 * reach the server by a local host name, so another website open in the
 * same browser can't read the folder.
 */
import { createReadStream, promises as fs } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { timingSafeEqual } from "node:crypto";
import { ProjectFileError } from "../lib/project/files";
import type { NodeProjectFiles } from "../node/projectFiles";

export const TOKEN_HEADER = "x-exploreda-token";

export interface ServerInfo {
  /** The folder's name, for the page title. */
  name: string;
  root: string;
  version: string;
}

export interface HandlerOptions {
  files: NodeProjectFiles;
  token: string;
  version: string;
  /** The built app; without it, requests outside `/api` go to `next`. */
  appDir?: string;
}

type Next = () => void;

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

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

function send(
  res: ServerResponse,
  status: number,
  body: unknown,
  type = "application/json; charset=utf-8"
) {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

async function serveApp(appDir: string, pathname: string, res: ServerResponse) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  let target = path.resolve(appDir, relative || "index.html");
  if (!target.startsWith(path.resolve(appDir) + path.sep)) {
    send(res, 404, { error: "not found" });
    return;
  }
  const stat = await fs.stat(target).catch(() => undefined);
  // The app has one page; unknown paths load it.
  if (!stat?.isFile()) {
    target = path.join(appDir, "index.html");
  }
  res.writeHead(200, {
    "content-type":
      CONTENT_TYPES[path.extname(target)] ?? "application/octet-stream",
    "cache-control": target.endsWith("index.html")
      ? "no-store"
      : "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
  });
  createReadStream(target).pipe(res);
}

/** The largest file a save may send. */
const MAX_BODY = 50 * 1024 * 1024;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error("The file is too large to save."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function createRequestHandler(options: HandlerOptions) {
  const { files, token, appDir, version } = options;
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
      } else if (req.method === "GET" && url.pathname === "/api/files") {
        send(res, 200, await files.list());
      } else if (req.method === "GET" && url.pathname === "/api/file") {
        const filePath = url.searchParams.get("path") ?? "";
        send(res, 200, await files.read(filePath), "text/plain; charset=utf-8");
      } else if (req.method === "PUT" && url.pathname === "/api/file") {
        const filePath = url.searchParams.get("path") ?? "";
        await files.write(filePath, await readBody(req));
        send(res, 200, { saved: filePath });
      } else if (req.method === "DELETE" && url.pathname === "/api/file") {
        const filePath = url.searchParams.get("path") ?? "";
        await files.remove(filePath);
        send(res, 200, { removed: filePath });
      } else if (req.method === "GET" && url.pathname === "/api/events") {
        res.writeHead(200, {
          "content-type": "text/event-stream",
          "cache-control": "no-store",
          connection: "keep-alive",
        });
        res.write(": connected\n\n");
        listeners.add(res);
        stopWatching ??= files.watch?.(broadcast);
        req.on("close", () => {
          listeners.delete(res);
          if (!listeners.size) {
            stopWatching?.();
            stopWatching = undefined;
          }
        });
      } else {
        send(res, 404, { error: `No ${req.method} ${url.pathname}.` });
      }
    } catch (error) {
      if (error instanceof ProjectFileError) {
        send(res, error.code === "missing" ? 404 : 403, {
          code: error.code,
          path: error.path,
          error: error.message,
        });
        return;
      }
      send(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };
}
