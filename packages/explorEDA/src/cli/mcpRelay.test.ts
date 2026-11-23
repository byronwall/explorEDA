import { mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { nodeProjectFiles } from "../node/projectFiles";
import {
  readServerFile,
  writeServerFile,
  type ServerRecord,
} from "../node/serverFile";
import { startServer, type StartedServer } from "../server/server";
import { createRelay } from "./mcpRelay";

const servers: StartedServer[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

/** Starts a server on `folder` with a fresh key and records it there. */
async function serve(folder: string, token: string): Promise<ServerRecord> {
  const server = await startServer({
    files: nodeProjectFiles(folder),
    token,
    version: "test",
    port: 0,
    loadMcp: () => import("../mcp/server"),
  });
  servers.push(server);
  return {
    url: server.url,
    port: server.port,
    token,
    pid: process.pid,
    version: "test",
  };
}

const list = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" });

describe("exploreda mcp relay", () => {
  it("follows the server across a restart with a new key", async () => {
    const folder = mkdtempSync(path.join(tmpdir(), "exploreda-relay-"));
    await writeServerFile(folder, await serve(folder, "first-key-0123456789"));
    if (process.platform !== "win32") {
      const mode = statSync(path.join(folder, ".exploreda/server.json")).mode;
      expect(mode & 0o777).toBe(0o600);
    }
    expect(await nodeProjectFiles(folder).list()).toEqual([
      ".exploreda/.gitignore",
    ]);
    const relay = createRelay(folder, async () => undefined);
    expect(JSON.parse((await relay(list))!).result.tools.length).toBe(5);

    await servers.shift()!.close();
    await writeServerFile(folder, await serve(folder, "second-key-012345678"));
    expect(JSON.parse((await relay(list))!).result.tools.length).toBe(5);
    expect((await readServerFile(folder))?.token).toBe("second-key-012345678");
  });

  it("starts a server when none runs, and answers a notification with nothing", async () => {
    const folder = mkdtempSync(path.join(tmpdir(), "exploreda-relay-"));
    let starts = 0;
    const relay = createRelay(folder, async () => {
      starts += 1;
      return serve(folder, "started-key-01234567");
    });
    expect(
      await relay(
        JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" })
      )
    ).toBeUndefined();
    expect(JSON.parse((await relay(list))!).id).toBe(1);
    expect(starts).toBe(1);
  });
});
