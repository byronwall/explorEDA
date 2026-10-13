// @vitest-environment node
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { nodeProjectFiles } from "../node/projectFiles";
import { isLocalHost, TOKEN_HEADER } from "./handler";
import { startServer, type StartedServer } from "./server";

const token = "test-token-0123456789";
let server: StartedServer;

/** A raw request, so the test can send any Host header. */
function get(
  pathname: string,
  headers: Record<string, string> = {}
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: "127.0.0.1",
        port: server.port,
        path: pathname,
        headers: { host: `127.0.0.1:${server.port}`, ...headers },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

beforeAll(async () => {
  const root = mkdtempSync(path.join(tmpdir(), "exploreda-server-"));
  mkdirSync(path.join(root, "data"));
  writeFileSync(path.join(root, "data/sales.csv"), "id,revenue\nA,1\n");
  const appDir = mkdtempSync(path.join(tmpdir(), "exploreda-app-"));
  writeFileSync(path.join(appDir, "index.html"), "<!doctype html>app");
  server = await startServer({
    files: nodeProjectFiles(root),
    token,
    version: "test",
    appDir,
    port: 0,
  });
});

afterAll(async () => {
  await server.close();
});

describe("local server", () => {
  it("lists and reads files for a request with the run's key", async () => {
    const auth = { [TOKEN_HEADER]: token };
    expect(JSON.parse((await get("/api/files", auth)).body)).toEqual([
      "data/sales.csv",
    ]);
    expect(await get("/api/file?path=data/sales.csv", auth)).toEqual({
      status: 200,
      body: "id,revenue\nA,1\n",
    });
    expect((await get("/api/file?path=nope.csv", auth)).status).toBe(404);
  });

  it("refuses API requests without the key", async () => {
    expect((await get("/api/files")).status).toBe(403);
    expect((await get("/api/files", { [TOKEN_HEADER]: "wrong" })).status).toBe(
      403
    );
  });

  it("refuses requests addressed to another host name", async () => {
    const response = await get("/api/files", {
      [TOKEN_HEADER]: token,
      host: "attacker.example:80",
    });
    expect(response.status).toBe(403);
    expect((await get("/", { host: "evil.test" })).status).toBe(403);
  });

  it("serves the app page for any other path", async () => {
    expect(await get("/")).toEqual({
      status: 200,
      body: "<!doctype html>app",
    });
    expect((await get("/some/route")).body).toBe("<!doctype html>app");
  });

  it("knows which host names are this machine", () => {
    expect(isLocalHost("127.0.0.1:3939")).toBe(true);
    expect(isLocalHost("localhost")).toBe(true);
    expect(isLocalHost("[::1]:3939")).toBe(true);
    expect(isLocalHost("127.0.0.1.nip.io")).toBe(false);
    expect(isLocalHost(undefined)).toBe(false);
  });
});
