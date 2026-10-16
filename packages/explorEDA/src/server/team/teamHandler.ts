/**
 * The team server's requests. People sign in with a session cookie, and
 * each project's files sit under `/api/projects/<id>/`, the same routes
 * the local server answers at `/api`. Authors may write; viewers only
 * read. A save is announced to the project's other open pages with the
 * name of the person who saved.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { LookupFunction } from "node:net";
import path from "node:path";
import {
  nodeProjectFiles,
  type NodeProjectFiles,
} from "../../node/projectFiles";
import {
  fileRoutes,
  openEvents,
  readBody,
  send,
  sendError,
  serveApp,
} from "../http";
import { createAccountRoutes } from "./accountRoutes";
import {
  checkDeclaredSize,
  dataPath,
  DEFAULT_UPLOAD_LIMIT,
  download,
  IntakeError,
  pathForUrl,
  readFetched,
  streamIntoPlace,
  writeFetched,
  FETCHED_FILE,
} from "./fileIntake";
import { signInLimiter } from "./signInLimiter";
import type { SecretStore } from "../../node/secrets";
import { snapshotPath } from "../../lib/project/snapshots";
import { sourceRoutes } from "../sources/routes";
import type { DatabaseDriver } from "../sources/types";
import {
  AccountError,
  projectRole,
  SESSION_DAYS,
  type Account,
  type AccountStore,
  type Project,
  type ProjectRole,
} from "./accounts";

export const SESSION_COOKIE = "exploreda_session";
/** Names the page that made a request, so its own saves aren't echoed. */
export const CLIENT_HEADER = "x-exploreda-client";

export interface TeamHandlerOptions {
  store: AccountStore;
  /** Holds `projects/<id>/` folders. */
  dataDir: string;
  version: string;
  /** The built app; without it, requests outside `/api` go to `next`. */
  appDir?: string;
  /**
   * The address people open, such as `https://eda.example.com`. Writes
   * must come from a page at this origin. Without it, a write's origin
   * must match its Host header.
   */
  publicUrl?: string;
  /** The largest upload or download, in bytes. */
  uploadLimit?: number;
  /** Where each download is recorded; one JSON object per call. */
  log?: (entry: Record<string, unknown>) => void;
  /** Resolves download hosts; tests use it to reach a local server. */
  lookup?: LookupFunction;
  /** Database passwords, which only admins enter. */
  secrets?: SecretStore;
  /** Database drivers by name; tests pass a fake. */
  drivers?: Record<string, DatabaseDriver>;
}

type Next = () => void;

export interface TeamProjectInfo {
  name: string;
  root: string;
  version: string;
  layout: "visible";
  project: string;
  role: "author" | "viewer";
  account: Pick<Account, "name" | "email">;
  /** True for admins, who enter database passwords for everyone. */
  canEnterSecrets: boolean;
}

function cookies(req: IncomingMessage) {
  const found = new Map<string, string>();
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index > 0) {
      found.set(part.slice(0, index).trim(), part.slice(index + 1).trim());
    }
  }
  return found;
}

function header(req: IncomingMessage, name: string) {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

/** True when a state-changing request comes from this server's own page. */
export function sameOrigin(req: IncomingMessage, publicUrl?: string) {
  const origin = header(req, "origin");
  if (!origin) {
    return false;
  }
  try {
    const given = new URL(origin);
    if (publicUrl) {
      return given.origin === new URL(publicUrl).origin;
    }
    return given.host === header(req, "host");
  } catch {
    return false;
  }
}

interface Listener {
  res: ServerResponse;
  client: string | undefined;
}

interface OpenProject {
  files: NodeProjectFiles;
  listeners: Set<Listener>;
  stopWatching?: () => void;
  /** Paths written by uploads and downloads, so the watcher skips them. */
  recent: Map<string, number>;
}

/** How long a watcher event for an upload counts as its own echo. */
const ECHO_MS = 3000;

export function createTeamHandler(options: TeamHandlerOptions) {
  const { store, dataDir, version, appDir, publicUrl } = options;
  const uploadLimit = options.uploadLimit ?? DEFAULT_UPLOAD_LIMIT;
  const log =
    options.log ??
    ((entry: Record<string, unknown>) =>
      // eslint-disable-next-line no-console -- the server's activity log
      console.log(JSON.stringify(entry)));
  const secure = publicUrl?.startsWith("https:") ?? false;
  const open = new Map<string, OpenProject>();
  const projectFolder = (id: string) => path.join(dataDir, "projects", id);
  const openProject = (id: string) => {
    let project = open.get(id);
    if (!project) {
      project = {
        files: nodeProjectFiles(projectFolder(id)),
        listeners: new Set(),
        recent: new Map(),
      };
      open.set(id, project);
    }
    return project;
  };
  const announce = (
    project: OpenProject,
    paths: string[],
    by?: { name: string; client?: string }
  ) => {
    const message = `event: change\ndata: ${JSON.stringify(
      by ? { paths, by: by.name } : { paths }
    )}\n\n`;
    for (const listener of project.listeners) {
      if (!by?.client || listener.client !== by.client) {
        listener.res.write(message);
      }
    }
  };

  const sessionCookie = (secret: string, maxAge: number) =>
    [
      `${SESSION_COOKIE}=${secret}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${maxAge}`,
      ...(secure ? ["Secure"] : []),
    ].join("; ");

  const startSession = async (res: ServerResponse, account: Account) => {
    const secret = await store.createSession(account.id);
    send(res, 200, { account }, undefined, {
      "set-cookie": sessionCookie(secret, SESSION_DAYS * 86_400),
    });
  };
  const routes = createAccountRoutes({ store, dataDir, startSession });
  const limiter = signInLimiter();

  const signedIn = async (req: IncomingMessage) => {
    const secret = cookies(req).get(SESSION_COOKIE);
    return secret ? store.sessionAccount(secret) : undefined;
  };

  async function sessionRoutes(req: IncomingMessage, res: ServerResponse) {
    if (req.method === "GET") {
      const account = await signedIn(req);
      if (!account) {
        send(res, 401, { error: "Sign in to continue." });
        return;
      }
      send(res, 200, { account });
      return;
    }
    if (req.method === "POST") {
      const { email, password } = JSON.parse(await readBody(req, 16_384)) as {
        email?: unknown;
        password?: unknown;
      };
      const key = `${String(email).trim().toLowerCase()}|${req.socket.remoteAddress ?? ""}`;
      const wait = limiter.wait(key);
      if (wait > 0) {
        send(res, 429, {
          error: `Too many wrong passwords. Try again in ${Math.ceil(wait / 60_000)} minutes, or ask an admin for a new link.`,
        });
        return;
      }
      const account =
        typeof email === "string" && typeof password === "string"
          ? await store.checkPassword(email, password)
          : undefined;
      if (!account) {
        limiter.failed(key);
        send(res, 401, { error: "That email and password don't match." });
        return;
      }
      limiter.succeeded(key);
      await startSession(res, account);
      return;
    }
    if (req.method === "DELETE") {
      const secret = cookies(req).get(SESSION_COOKIE);
      if (secret) {
        await store.endSession(secret);
      }
      send(res, 200, { signedOut: true }, undefined, {
        "set-cookie": sessionCookie("", 0),
      });
      return;
    }
    send(res, 405, { error: `No ${req.method} /api/session.` });
  }

  async function projectRoutes(
    account: Account,
    url: URL,
    req: IncomingMessage,
    res: ServerResponse
  ) {
    const [, , , id = "", route = "", ...rest] = url.pathname.split("/");
    const project = await store.project(id);
    const role = project && (await projectRole(store, account, id));
    if (project && role && route === "members" && rest.length <= 1) {
      await routes.memberRoutes(account, id, rest[0], req, res);
      return;
    }
    if (
      project &&
      role &&
      (route === "sources" || route === "connections") &&
      rest.length === 2
    ) {
      const opened = openProject(id);
      const handled = await sourceRoutes([route, ...rest].join("/"), req, res, {
        root: projectFolder(id),
        confined: true,
        canRefresh: role === "author",
        canSaveSecret: account.admin,
        ...(options.secrets ? { secrets: options.secrets } : {}),
        ...(options.drivers ? { drivers: options.drivers } : {}),
        onRead: (info) => {
          const target = snapshotPath(info.sourceId);
          opened.recent.set(target, Date.now());
          announce(opened, [target], {
            name: account.name,
            client: header(req, CLIENT_HEADER),
          });
          log({
            at: new Date().toISOString(),
            event: "database-read",
            project: id,
            account: account.email,
            source: info.sourceId,
            connection: info.connection,
            rows: info.rowCount,
          });
        },
      });
      if (!handled) {
        send(res, 404, { error: `No ${req.method} ${url.pathname}.` });
      }
      return;
    }
    if (!project || !role || rest.length) {
      send(res, 404, {
        error: "There's no such project, or it isn't shared with you.",
      });
      return;
    }
    const opened = openProject(id);
    if (req.method === "GET" && route === "info") {
      const info: TeamProjectInfo = {
        name: project.name,
        root: "",
        version,
        layout: "visible",
        project: id,
        role,
        account: { name: account.name, email: account.email },
        canEnterSecrets: account.admin,
      };
      send(res, 200, info);
      return;
    }
    if (req.method === "GET" && route === "events") {
      const listener = {
        res,
        client: url.searchParams.get("client") ?? undefined,
      };
      openEvents(req, res, () => {
        opened.listeners.delete(listener);
        if (!opened.listeners.size) {
          opened.stopWatching?.();
          opened.stopWatching = undefined;
        }
      });
      opened.listeners.add(listener);
      // Edits made on the server's disk reach every page, unnamed.
      opened.stopWatching ??= opened.files.watch?.((paths) => {
        const now = Date.now();
        const outside = paths.filter(
          (item) =>
            item !== FETCHED_FILE &&
            !(now - (opened.recent.get(item) ?? 0) < ECHO_MS)
        );
        if (outside.length) {
          announce(opened, outside);
        }
      });
      return;
    }
    if (req.method === "POST" && (route === "upload" || route === "fetch")) {
      if (role !== "author") {
        send(res, 403, { error: "Viewers can't add data to this project." });
        return;
      }
      const folder = projectFolder(id);
      const saved = (target: string) => {
        opened.recent.set(target, Date.now());
        announce(opened, [target], {
          name: account.name,
          client: header(req, CLIENT_HEADER),
        });
      };
      if (route === "upload") {
        const target = dataPath(url.searchParams.get("path") ?? "");
        checkDeclaredSize(req.headers["content-length"], uploadLimit);
        const bytes = await streamIntoPlace(
          req,
          opened.files.resolve(target)!,
          uploadLimit
        );
        const records = await readFetched(folder);
        if (records[target]) {
          delete records[target];
          await writeFetched(folder, records);
        }
        saved(target);
        send(res, 200, { saved: target, bytes });
        return;
      }
      const body = JSON.parse(await readBody(req, 16_384)) as {
        url?: unknown;
        path?: unknown;
      };
      const records = await readFetched(folder);
      const known =
        typeof body.path === "string"
          ? records[dataPath(body.path)]
          : undefined;
      const address =
        typeof body.url === "string" && body.url.trim()
          ? body.url.trim()
          : known?.url;
      if (!address) {
        send(res, 400, { error: "Enter the address of a CSV or JSON file." });
        return;
      }
      const target = dataPath(
        typeof body.path === "string" && body.path
          ? body.path
          : pathForUrl(address)
      );
      const entry = {
        at: new Date().toISOString(),
        event: "fetch",
        project: id,
        account: account.email,
        url: address,
        path: target,
      };
      try {
        const fetched = await download(address, {}, options.lookup);
        let bytes: number;
        try {
          checkDeclaredSize(
            fetched.body.headers["content-length"],
            uploadLimit
          );
          bytes = await streamIntoPlace(
            fetched.body,
            opened.files.resolve(target)!,
            uploadLimit
          );
        } finally {
          fetched.body.destroy();
        }
        const record = {
          url: address,
          fetchedAt: new Date().toISOString(),
          bytes,
          ...(fetched.etag ? { etag: fetched.etag } : {}),
        };
        await writeFetched(folder, {
          ...(await readFetched(folder)),
          [target]: record,
        });
        log({ ...entry, outcome: "saved", bytes });
        saved(target);
        send(res, 200, { saved: target, ...record });
      } catch (error) {
        log({
          ...entry,
          outcome: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
      return;
    }
    const handled = await fileRoutes(opened.files, route, url, req, res, {
      canWrite: role === "author",
      onWrite: (paths) =>
        announce(opened, paths, {
          name: account.name,
          client: header(req, CLIENT_HEADER),
        }),
    });
    if (!handled) {
      send(res, 404, { error: `No ${req.method} ${url.pathname}.` });
    }
  }

  return async (req: IncomingMessage, res: ServerResponse, next?: Next) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!url.pathname.startsWith("/api/")) {
      if (appDir) {
        await serveApp(appDir, url.pathname, res);
      } else if (next) {
        next();
      } else {
        send(res, 404, {
          error: "This copy of exploreda is missing its app files.",
        });
      }
      return;
    }
    const reads = req.method === "GET" || req.method === "HEAD";
    if (!reads && !sameOrigin(req, publicUrl)) {
      send(res, 403, {
        error: "This change didn't come from this server's own page.",
      });
      return;
    }
    try {
      if (url.pathname === "/api/health") {
        send(res, 200, { ok: true, version });
        return;
      }
      if (url.pathname === "/api/session") {
        await sessionRoutes(req, res);
        return;
      }
      if (await routes.publicRoutes(url, req, res)) {
        return;
      }
      const account = await signedIn(req);
      if (!account) {
        send(res, 401, { error: "Sign in to continue." });
        return;
      }
      if (
        url.pathname === "/api/accounts" ||
        url.pathname.startsWith("/api/accounts/")
      ) {
        await routes.accountRoutes(account, url, req, res);
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/people") {
        await routes.people(account, res);
        return;
      }
      if (req.method === "POST" && url.pathname === "/api/projects") {
        await routes.createProject(account, req, res);
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/projects") {
        const listed: Array<Project & { role: ProjectRole }> = [];
        for (const project of await store.projects()) {
          const role = await projectRole(store, account, project.id);
          if (role) {
            listed.push({ ...project, role });
          }
        }
        send(res, 200, listed);
        return;
      }
      if (url.pathname.startsWith("/api/projects/")) {
        await projectRoutes(account, url, req, res);
        return;
      }
      send(res, 404, { error: `No ${req.method} ${url.pathname}.` });
    } catch (error) {
      if (error instanceof AccountError) {
        send(res, { missing: 404, exists: 409, invalid: 400 }[error.code], {
          code: error.code,
          error: error.message,
        });
        return;
      }
      if (error instanceof IntakeError) {
        send(res, error.status, { error: error.message });
        return;
      }
      if (error instanceof SyntaxError) {
        send(res, 400, { error: "The request wasn't valid JSON." });
        return;
      }
      sendError(res, error);
    }
  };
}
