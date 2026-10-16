/**
 * The database routes a project answers under its API path:
 * `POST sources/<id>/refresh` reads a database source again, and
 * `GET connections/<id>/tables` lists what a connection can read, and
 * `PUT connections/<id>/secret` checks a connection's password and keeps
 * it on this computer (`DELETE` forgets it). A secret is never sent back.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolveSecret, type SecretStore } from "../../node/secrets";
import { readBody, send } from "../http";
import {
  checkSecret,
  listTables,
  projectConnection,
  refreshSource,
  type SourceOptions,
} from "./refresh";
import type { SnapshotInfo } from "../../lib/project/snapshots";
import { SourceReadError } from "./types";

export interface SourceRouteOptions
  extends Omit<SourceOptions, "signal" | "secret"> {
  /** Where this server keeps connection secrets. */
  secrets?: SecretStore;
  /** False refuses refreshes and secrets, as for a viewer. */
  canRefresh?: boolean;
  /** False refuses entering passwords; on a team server only admins can. */
  canSaveSecret?: boolean;
  /** Called after a read writes a new snapshot. */
  onRead?: (info: SnapshotInfo) => void;
}

/** Answers a database route, or returns false for any other path. */
export async function sourceRoutes(
  route: string,
  req: IncomingMessage,
  res: ServerResponse,
  {
    secrets,
    canRefresh = true,
    canSaveSecret = true,
    onRead,
    ...options
  }: SourceRouteOptions
): Promise<boolean> {
  const refresh = /^sources\/([^/]+)\/refresh$/.exec(route);
  const secret = /^connections\/([^/]+)\/secret$/.exec(route);
  const tables = /^connections\/([^/]+)\/tables$/.exec(route);
  if (
    !(refresh && req.method === "POST") &&
    !(tables && req.method === "GET") &&
    !secret
  ) {
    return false;
  }
  if (!canRefresh) {
    send(res, 403, { error: "Only authors can read databases." });
    return true;
  }
  if (refresh) {
    // A closed page stops the read it asked for.
    const controller = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });
    const info = await refreshSource(decodeURIComponent(refresh[1]!), {
      ...options,
      secret: resolveSecret(secrets),
      signal: controller.signal,
    });
    onRead?.(info);
    send(res, 200, info);
    return true;
  }
  if (tables) {
    send(
      res,
      200,
      await listTables(decodeURIComponent(tables[1]!), {
        ...options,
        secret: resolveSecret(secrets),
      })
    );
    return true;
  }
  if (!secrets) {
    send(res, 404, { error: "This server doesn't keep passwords." });
    return true;
  }
  const connection = await projectConnection(
    decodeURIComponent(secret![1]!),
    options.root
  );
  if (!canSaveSecret) {
    send(res, 403, {
      code: "secret",
      error: `Only an admin can enter ${connection.id}'s password.`,
    });
    return true;
  }
  if (req.method === "DELETE") {
    await secrets.remove(connection);
    send(res, 200, { saved: false });
    return true;
  }
  if (req.method !== "PUT") {
    return false;
  }
  const { secret: value } = JSON.parse(await readBody(req)) as {
    secret?: unknown;
  };
  if (typeof value !== "string" || !value) {
    throw new SourceReadError("secret", "Enter the password.");
  }
  await checkSecret(connection, value, options);
  await secrets.set(connection, value);
  send(res, 200, { saved: true });
  return true;
}
