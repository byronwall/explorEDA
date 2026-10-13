// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { request, type IncomingMessage } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startHttpServer, type StartedServer } from "../server";
import { memoryAccountStore, type AccountStore } from "./accounts";
import { CLIENT_HEADER, createTeamHandler } from "./teamHandler";

const PASSWORD = "correct horse";
let server: StartedServer;
let store: AccountStore;
let dataDir: string;
let origin: string;

interface Reply {
  status: number;
  body: string;
  cookie?: string;
}

function call(
  pathname: string,
  {
    method = "GET",
    body,
    headers = {},
  }: { method?: string; body?: string; headers?: Record<string, string> } = {}
): Promise<Reply> {
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
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            body: text,
            cookie: res.headers["set-cookie"]?.[0]?.split(";")[0],
          })
        );
      }
    );
    req.on("error", reject);
    req.end(body);
  });
}

/** Signs in and returns the cookie header to send. */
async function signIn(email: string) {
  const reply = await call("/api/session", {
    method: "POST",
    headers: { origin },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  expect(reply.status).toBe(200);
  return reply.cookie!;
}

/** An open event stream that collects each `change` event's data. */
function listen(cookie: string, client: string) {
  const events: unknown[] = [];
  let response: IncomingMessage | undefined;
  const ready = new Promise<void>((resolve) => {
    const req = request(
      {
        host: "127.0.0.1",
        port: server.port,
        path: `/api/projects/shop/events?client=${client}`,
        headers: { host: `127.0.0.1:${server.port}`, cookie },
      },
      (res) => {
        response = res;
        res.on("data", (chunk: Buffer) => {
          for (const line of chunk.toString().split("\n")) {
            if (line.startsWith("data: ")) {
              events.push(JSON.parse(line.slice(6)));
            }
          }
          resolve();
        });
      }
    );
    req.end();
  });
  return { events, ready, close: () => response?.destroy() };
}

const until = async (check: () => boolean) => {
  for (let tries = 0; tries < 100 && !check(); tries++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};

beforeAll(async () => {
  dataDir = mkdtempSync(path.join(tmpdir(), "exploreda-team-"));
  mkdirSync(path.join(dataDir, "projects/shop/data"), { recursive: true });
  writeFileSync(path.join(dataDir, "projects/shop/data/sales.csv"), "id\n1\n");
  const appDir = mkdtempSync(path.join(tmpdir(), "exploreda-app-"));
  writeFileSync(path.join(appDir, "index.html"), "<!doctype html>app");
  store = memoryAccountStore();
  await store.createProject({ id: "shop", name: "Shop orders" });
  for (const [email, name, kind] of [
    ["ana@example.com", "Ana", "author"],
    ["vic@example.com", "Vic", "viewer"],
    ["out@example.com", "Out", "author"],
  ] as const) {
    const account = await store.createAccount({
      email,
      name,
      kind,
      password: PASSWORD,
    });
    if (email !== "out@example.com") {
      await store.setMember("shop", { accountId: account.id, role: kind });
    }
  }
  server = await startHttpServer({
    handle: createTeamHandler({ store, dataDir, version: "test", appDir }),
    port: 0,
    host: "127.0.0.1",
    link: (port) => `http://127.0.0.1:${port}/`,
  });
  origin = `http://127.0.0.1:${server.port}`;
});

afterAll(async () => {
  await server.close();
});

describe("team server", () => {
  it("answers a health check without signing in", async () => {
    expect(JSON.parse((await call("/api/health")).body)).toEqual({
      ok: true,
      version: "test",
    });
  });

  it("asks for a sign-in before listing projects", async () => {
    expect((await call("/api/projects")).status).toBe(401);
    expect((await call("/api/projects/shop/files")).status).toBe(401);
  });

  it("refuses a wrong password and sets a same-site cookie for a right one", async () => {
    const wrong = await call("/api/session", {
      method: "POST",
      headers: { origin },
      body: JSON.stringify({ email: "ana@example.com", password: "nope" }),
    });
    expect(wrong.status).toBe(401);
    const right = await new Promise<string[]>((resolve) => {
      const req = request(
        {
          host: "127.0.0.1",
          port: server.port,
          path: "/api/session",
          method: "POST",
          headers: { host: `127.0.0.1:${server.port}`, origin },
        },
        (res) => {
          res.resume();
          resolve(res.headers["set-cookie"] ?? []);
        }
      );
      req.end(JSON.stringify({ email: "ana@example.com", password: PASSWORD }));
    });
    expect(right[0]).toMatch(/HttpOnly/);
    expect(right[0]).toMatch(/SameSite=Lax/);
  });

  it("lists only the projects an account belongs to, with its role", async () => {
    const vic = await signIn("vic@example.com");
    expect(
      JSON.parse(
        (await call("/api/projects", { headers: { cookie: vic } })).body
      )
    ).toEqual([{ id: "shop", name: "Shop orders", role: "viewer" }]);
    const out = await signIn("out@example.com");
    expect(
      JSON.parse(
        (await call("/api/projects", { headers: { cookie: out } })).body
      )
    ).toEqual([]);
    expect(
      (await call("/api/projects/shop/files", { headers: { cookie: out } }))
        .status
    ).toBe(404);
  });

  it("lets a viewer read files but not write or remove them", async () => {
    const vic = await signIn("vic@example.com");
    const read = await call("/api/projects/shop/file?path=data/sales.csv", {
      headers: { cookie: vic },
    });
    expect(read).toMatchObject({ status: 200, body: "id\n1\n" });
    for (const method of ["PUT", "DELETE"]) {
      const write = await call("/api/projects/shop/file?path=data/sales.csv", {
        method,
        body: method === "PUT" ? "id\n2\n" : undefined,
        headers: { cookie: vic, origin },
      });
      expect(write.status).toBe(403);
      expect(JSON.parse(write.body).code).toBe("refused");
    }
    expect(
      readFileSync(path.join(dataDir, "projects/shop/data/sales.csv"), "utf8")
    ).toBe("id\n1\n");
    const info = JSON.parse(
      (await call("/api/projects/shop/info", { headers: { cookie: vic } })).body
    );
    expect(info).toMatchObject({ role: "viewer", name: "Shop orders" });
  });

  it("refuses a write from another site or with no origin", async () => {
    const ana = await signIn("ana@example.com");
    const attempts: Array<Record<string, string>> = [
      { cookie: ana },
      { cookie: ana, origin: "https://attacker.example" },
    ];
    for (const headers of attempts) {
      const write = await call("/api/projects/shop/file?path=a.eda", {
        method: "PUT",
        body: "x",
        headers,
      });
      expect(write.status).toBe(403);
    }
  });

  it("tells other pages who saved, but not the page that saved", async () => {
    const ana = await signIn("ana@example.com");
    const vic = await signIn("vic@example.com");
    const own = listen(ana, "page-a");
    const other = listen(vic, "page-v");
    await Promise.all([own.ready, other.ready]);
    const write = await call("/api/projects/shop/file?path=revenue.eda", {
      method: "PUT",
      body: "eda\n",
      headers: { cookie: ana, origin, [CLIENT_HEADER]: "page-a" },
    });
    expect(write.status).toBe(200);
    await until(() => other.events.length > 0);
    expect(other.events).toEqual([{ paths: ["revenue.eda"], by: "Ana" }]);
    // Give the disk watcher time to settle; it must not echo the save.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(own.events).toEqual([]);
    expect(other.events).toHaveLength(1);
    own.close();
    other.close();
  });

  it("ends the session on sign-out", async () => {
    const vic = await signIn("vic@example.com");
    const out = await call("/api/session", {
      method: "DELETE",
      headers: { cookie: vic, origin },
    });
    expect(out.status).toBe(200);
    expect(
      (await call("/api/projects", { headers: { cookie: vic } })).status
    ).toBe(401);
  });

  it("serves the app page for any other path", async () => {
    expect(await call("/p/shop")).toMatchObject({
      status: 200,
      body: "<!doctype html>app",
    });
  });

  it("answers a page request when it has no app files", async () => {
    const bare = await startHttpServer({
      handle: createTeamHandler({ store, dataDir, version: "test" }),
      port: 0,
      host: "127.0.0.1",
      link: (port) => `http://127.0.0.1:${port}/`,
    });
    const reply = await new Promise<number>((resolve) => {
      request({ host: "127.0.0.1", port: bare.port, path: "/" }, (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      }).end();
    });
    expect(reply).toBe(404);
    await bare.close();
  });
});
