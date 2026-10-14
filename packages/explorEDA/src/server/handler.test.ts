// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { nodeProjectFiles } from "../node/projectFiles";
import { memorySecretStore } from "../node/secrets";
import { writeContractSqlite } from "./sources/fixtures/sqliteContract";
import { isLocalHost, TOKEN_HEADER } from "./handler";
import { startServer, type StartedServer } from "./server";

const token = "test-token-0123456789";
let server: StartedServer;
let root: string;
const secrets = memorySecretStore();

/** A raw request, so the test can send any Host header. */
function get(
  pathname: string,
  headers: Record<string, string> = {},
  method = "GET",
  body?: string
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: "127.0.0.1",
        port: server.port,
        path: pathname,
        method,
        headers: { host: `127.0.0.1:${server.port}`, ...headers },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
      }
    );
    req.on("error", reject);
    req.end(body);
  });
}

beforeAll(async () => {
  root = mkdtempSync(path.join(tmpdir(), "exploreda-server-"));
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
    secrets,
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

  it("saves and removes files inside the folder only", async () => {
    const auth = { [TOKEN_HEADER]: token };
    const saved = await get(
      "/api/file?path=sales.eda",
      auth,
      "PUT",
      "hist revenue\n"
    );
    expect(saved.status).toBe(200);
    expect(readFileSync(path.join(root, "sales.eda"), "utf8")).toBe(
      "hist revenue\n"
    );
    expect(
      (await get("/api/file?path=../escape.eda", auth, "PUT", "x")).status
    ).toBe(403);
    expect((await get("/api/file?path=sales.eda", auth, "DELETE")).status).toBe(
      200
    );
    expect(
      (
        await get(
          "/api/file?path=sales.eda",
          { "x-exploreda-token": "no" },
          "PUT",
          "x"
        )
      ).status
    ).toBe(403);
  });

  it("streams outside changes, not its own saves", async () => {
    const events: string[] = [];
    const stream = await new Promise<import("node:http").IncomingMessage>(
      (resolve) => {
        request(
          {
            host: "127.0.0.1",
            port: server.port,
            path: `/api/events?token=${token}`,
            headers: { host: `127.0.0.1:${server.port}` },
          },
          resolve
        ).end();
      }
    );
    stream.on("data", (chunk) => events.push(String(chunk)));
    await new Promise((resolve) => setTimeout(resolve, 200));
    await get(
      "/api/file?path=own.eda",
      { [TOKEN_HEADER]: token },
      "PUT",
      "row a\n"
    );
    writeFileSync(path.join(root, "outside.eda"), "row b\n");
    await new Promise((resolve) => setTimeout(resolve, 800));
    stream.destroy();
    const changed = events
      .filter((event) => event.includes("event: change"))
      .flatMap((event) => JSON.parse(event.split("data: ")[1]!).paths);
    expect(changed).toContain("outside.eda");
    expect(changed).not.toContain("own.eda");
  });

  it("refreshes a database source on request", async () => {
    await writeContractSqlite(path.join(root, "data/app.db"));
    writeFileSync(
      path.join(root, "exploreda.eda"),
      `project @p

connection @app driver=sqlite path=data/app.db

source @items db=app table=contract_items

source @many db=app table=contract_many limit=5
`
    );
    const auth = { [TOKEN_HEADER]: token };
    expect((await get("/api/sources/items/refresh", {}, "POST")).status).toBe(
      403
    );
    const done = await get("/api/sources/items/refresh", auth, "POST");
    expect(done.status).toBe(200);
    expect(JSON.parse(done.body)).toMatchObject({
      sourceId: "items",
      rowCount: 4,
    });
    expect(
      JSON.parse(
        readFileSync(path.join(root, ".exploreda/snapshots/items.json"), "utf8")
      ).rows
    ).toHaveLength(4);

    const tooMany = await get("/api/sources/many/refresh", auth, "POST");
    expect(tooMany.status).toBe(422);
    expect(JSON.parse(tooMany.body)).toEqual({
      code: "too-many-rows",
      error: "many has more than 5 rows.",
      suggestion: "Raise its limit, as limit=10, or read fewer rows with sql=.",
    });
    const unknown = await get("/api/sources/nope/refresh", auth, "POST");
    expect(unknown.status).toBe(404);

    // A password is checked, kept outside the project, and never sent back.
    const saved = await get(
      "/api/connections/app/secret",
      auth,
      "PUT",
      JSON.stringify({ secret: "test-only" })
    );
    expect(JSON.parse(saved.body)).toEqual({ saved: true });
    expect(
      await secrets.get({
        id: "app",
        driver: "sqlite",
        settings: { path: "data/app.db" },
      })
    ).toBe("test-only");
    expect(readFileSync(path.join(root, "exploreda.eda"), "utf8")).not.toMatch(
      /test-only/
    );
    const empty = await get(
      "/api/connections/app/secret",
      auth,
      "PUT",
      JSON.stringify({ secret: "" })
    );
    expect(empty.status).toBe(422);
    await get("/api/connections/app/secret", auth, "DELETE");
    expect(
      await secrets.get({
        id: "app",
        driver: "sqlite",
        settings: { path: "data/app.db" },
      })
    ).toBeUndefined();
  });

  it("knows which host names are this machine", () => {
    expect(isLocalHost("127.0.0.1:3939")).toBe(true);
    expect(isLocalHost("localhost")).toBe(true);
    expect(isLocalHost("[::1]:3939")).toBe(true);
    expect(isLocalHost("127.0.0.1.nip.io")).toBe(false);
    expect(isLocalHost(undefined)).toBe(false);
  });
});
