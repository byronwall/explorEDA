/**
 * The database routes a project answers under its API path:
 * `POST sources/<id>/refresh` reads a database source again.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { send } from "../http";
import { refreshSource, type SourceOptions } from "./refresh";

/** Answers a database route, or returns false for any other path. */
export async function sourceRoutes(
  route: string,
  req: IncomingMessage,
  res: ServerResponse,
  options: Omit<SourceOptions, "signal">
): Promise<boolean> {
  const refresh = /^sources\/([^/]+)\/refresh$/.exec(route);
  if (!refresh || req.method !== "POST") {
    return false;
  }
  // A closed page stops the read it asked for.
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });
  const info = await refreshSource(decodeURIComponent(refresh[1]!), {
    ...options,
    signal: controller.signal,
  });
  send(res, 200, info);
  return true;
}
