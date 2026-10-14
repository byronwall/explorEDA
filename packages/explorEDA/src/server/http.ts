/**
 * Pieces every server mode shares: JSON replies, the built app's files,
 * request bodies, and the project file routes.
 */
import { createReadStream, promises as fs } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { ProjectFileError, type ProjectFiles } from "../lib/project/files";
import { SourceReadError } from "./sources/types";

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

export function send(
  res: ServerResponse,
  status: number,
  body: unknown,
  type = "application/json; charset=utf-8",
  headers: Record<string, string | string[]> = {}
) {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...headers,
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

export async function serveApp(
  appDir: string,
  pathname: string,
  res: ServerResponse
) {
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
export const MAX_BODY = 50 * 1024 * 1024;

export function readBody(
  req: IncomingMessage,
  limit = MAX_BODY
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
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

/** Sends a project file error with the status that matches its code. */
export function sendError(res: ServerResponse, error: unknown) {
  if (error instanceof SourceReadError) {
    send(res, error.code === "unknown-source" ? 404 : 422, {
      code: error.code,
      error: error.message,
      ...(error.suggestion ? { suggestion: error.suggestion } : {}),
    });
    return;
  }
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

export interface FileRouteOptions {
  /** False refuses writes and removals. */
  canWrite: boolean;
  /** Called after a write or removal through these routes. */
  onWrite?: (paths: string[]) => void;
}

/**
 * Answers `files`, `file` (GET, PUT, DELETE) under a project's API path.
 * Returns false when `route` is none of them.
 */
export async function fileRoutes(
  files: ProjectFiles,
  route: string,
  url: URL,
  req: IncomingMessage,
  res: ServerResponse,
  { canWrite, onWrite }: FileRouteOptions
) {
  if (req.method === "GET" && route === "files") {
    send(res, 200, await files.list());
    return true;
  }
  if (route !== "file") {
    return false;
  }
  const filePath = url.searchParams.get("path") ?? "";
  if (req.method === "GET") {
    send(res, 200, await files.read(filePath), "text/plain; charset=utf-8");
    return true;
  }
  if (req.method !== "PUT" && req.method !== "DELETE") {
    return false;
  }
  if (!canWrite) {
    send(res, 403, {
      code: "refused",
      path: filePath,
      error: "Viewers can't change this project.",
    });
    return true;
  }
  if (req.method === "PUT") {
    await files.write(filePath, await readBody(req));
    onWrite?.([filePath]);
    send(res, 200, { saved: filePath });
  } else {
    await files.remove(filePath);
    onWrite?.([filePath]);
    send(res, 200, { removed: filePath });
  }
  return true;
}

/** Opens a server-sent event stream and calls `onClose` when it ends. */
export function openEvents(
  req: IncomingMessage,
  res: ServerResponse,
  onClose: () => void
) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-store",
    connection: "keep-alive",
  });
  res.write(": connected\n\n");
  req.on("close", onClose);
}
