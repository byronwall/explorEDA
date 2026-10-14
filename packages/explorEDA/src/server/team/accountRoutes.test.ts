// @vitest-environment node
import { existsSync, mkdtempSync } from "node:fs";
import { request } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { startHttpServer, type StartedServer } from "../server";
import { memoryAccountStore, type AccountStore } from "./accounts";
import { projectId } from "./accountRoutes";
import { signInLimiter } from "./signInLimiter";
import { createTeamHandler } from "./teamHandler";

let server: StartedServer;
let store: AccountStore;
let dataDir: string;
let origin: string;

interface Reply {
  status: number;
  body: any;
  cookie?: string;
}

function call(
  pathname: string,
  {
    method = "GET",
    body,
    cookie,
  }: { method?: string; body?: unknown; cookie?: string } = {}
): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: "127.0.0.1",
        port: server.port,
        path: pathname,
        method,
        headers: {
          host: `127.0.0.1:${server.port}`,
          origin,
          ...(cookie ? { cookie } : {}),
        },
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            body: text ? JSON.parse(text) : undefined,
            cookie: res.headers["set-cookie"]?.[0]?.split(";")[0],
          })
        );
      }
    );
    req.on("error", reject);
    req.end(body === undefined ? undefined : JSON.stringify(body));
  });
}

const PASSWORD = "correct horse";

async function signIn(email: string, password = PASSWORD) {
  const reply = await call("/api/session", {
    method: "POST",
    body: { email, password },
  });
  expect(reply.status).toBe(200);
  return reply.cookie!;
}

/** Sets up the server with an admin, and returns the admin's cookie. */
async function setUp() {
  const reply = await call("/api/setup", {
    method: "POST",
    body: { email: "ana@example.com", name: "Ana", password: PASSWORD },
  });
  expect(reply.status).toBe(200);
  return reply.cookie!;
}

/** An admin adds an account, and the person sets a password by its link. */
async function invite(
  admin: string,
  person: { email: string; name: string; kind: "author" | "viewer" }
) {
  const created = await call("/api/accounts", {
    method: "POST",
    body: person,
    cookie: admin,
  });
  expect(created.status).toBe(200);
  const used = await call("/api/password-link", {
    method: "POST",
    body: { secret: created.body.secret, password: PASSWORD },
  });
  expect(used.status).toBe(200);
  return { id: created.body.account.id as string, cookie: used.cookie! };
}

beforeEach(async () => {
  dataDir = mkdtempSync(path.join(tmpdir(), "exploreda-team-"));
  store = memoryAccountStore();
  server = await startHttpServer({
    handle: createTeamHandler({ store, dataDir, version: "test" }),
    port: 0,
    host: "127.0.0.1",
    link: (port) => `http://127.0.0.1:${port}/`,
  });
  origin = `http://127.0.0.1:${server.port}`;
});

afterEach(async () => {
  await server.close();
});

describe("first-run setup", () => {
  it("creates the admin once, signed in", async () => {
    expect((await call("/api/setup")).body).toEqual({ needed: true });
    const admin = await setUp();
    const session = await call("/api/session", { cookie: admin });
    expect(session.body.account).toMatchObject({
      email: "ana@example.com",
      kind: "author",
      admin: true,
    });
    expect((await call("/api/setup")).body).toEqual({ needed: false });
    const again = await call("/api/setup", {
      method: "POST",
      body: { email: "eve@example.com", name: "Eve", password: PASSWORD },
    });
    expect(again.status).toBe(403);
  });
});

describe("accounts", () => {
  it("lets a new person set a password once through their link", async () => {
    const admin = await setUp();
    const created = await call("/api/accounts", {
      method: "POST",
      body: { email: "vic@example.com", name: "Vic", kind: "viewer" },
      cookie: admin,
    });
    const { secret } = created.body;
    expect((await call(`/api/password-link?secret=${secret}`)).body).toEqual({
      email: "vic@example.com",
      name: "Vic",
    });
    const used = await call("/api/password-link", {
      method: "POST",
      body: { secret, password: PASSWORD },
    });
    expect(used.body.account.email).toBe("vic@example.com");
    expect((await call(`/api/password-link?secret=${secret}`)).status).toBe(
      404
    );
    await signIn("vic@example.com");
  });

  it("keeps account management to admins and keeps one admin", async () => {
    const admin = await setUp();
    const ben = await invite(admin, {
      email: "ben@example.com",
      name: "Ben",
      kind: "author",
    });
    expect((await call("/api/accounts", { cookie: ben.cookie })).status).toBe(
      403
    );
    const anaId = (await call("/api/session", { cookie: admin })).body.account
      .id;
    const demote = await call(`/api/accounts/${anaId}`, {
      method: "PATCH",
      body: { admin: false },
      cookie: admin,
    });
    expect(demote.status).toBe(403);
    await call(`/api/accounts/${ben.id}`, {
      method: "PATCH",
      body: { admin: true },
      cookie: admin,
    });
    expect(
      (
        await call(`/api/accounts/${anaId}`, {
          method: "PATCH",
          body: { admin: false },
          cookie: admin,
        })
      ).body.admin
    ).toBe(false);
  });

  it("ends a disabled account's sessions", async () => {
    const admin = await setUp();
    const ben = await invite(admin, {
      email: "ben@example.com",
      name: "Ben",
      kind: "author",
    });
    await call(`/api/accounts/${ben.id}`, {
      method: "PATCH",
      body: { disabled: true },
      cookie: admin,
    });
    expect((await call("/api/projects", { cookie: ben.cookie })).status).toBe(
      401
    );
    const retry = await call("/api/session", {
      method: "POST",
      body: { email: "ben@example.com", password: PASSWORD },
    });
    expect(retry.status).toBe(401);
  });

  it("makes people wait after five wrong passwords", async () => {
    await setUp();
    for (let attempt = 0; attempt < 5; attempt++) {
      const wrong = await call("/api/session", {
        method: "POST",
        body: { email: "ana@example.com", password: "nope" },
      });
      expect(wrong.status).toBe(401);
    }
    const locked = await call("/api/session", {
      method: "POST",
      body: { email: "ana@example.com", password: PASSWORD },
    });
    expect(locked.status).toBe(429);
  });
});

describe("projects and members", () => {
  it("lets an author create a project and become its author", async () => {
    const admin = await setUp();
    const created = await call("/api/projects", {
      method: "POST",
      body: { name: "Q3 Sales" },
      cookie: admin,
    });
    expect(created.body).toEqual({
      id: "q3-sales",
      name: "Q3 Sales",
      role: "author",
    });
    expect(existsSync(path.join(dataDir, "projects/q3-sales"))).toBe(true);
    const viewer = await invite(admin, {
      email: "vic@example.com",
      name: "Vic",
      kind: "viewer",
    });
    const refused = await call("/api/projects", {
      method: "POST",
      body: { name: "Mine" },
      cookie: viewer.cookie,
    });
    expect(refused.status).toBe(403);
  });

  it("lets a project's authors add, change, and remove members", async () => {
    const admin = await setUp();
    await call("/api/projects", {
      method: "POST",
      body: { name: "Shop" },
      cookie: admin,
    });
    const ben = await invite(admin, {
      email: "ben@example.com",
      name: "Ben",
      kind: "author",
    });
    const vic = await invite(admin, {
      email: "vic@example.com",
      name: "Vic",
      kind: "viewer",
    });
    expect(
      (
        await call(`/api/projects/shop/members/${vic.id}`, {
          method: "PUT",
          body: { role: "author" },
          cookie: admin,
        })
      ).status
    ).toBe(400);
    await call(`/api/projects/shop/members/${vic.id}`, {
      method: "PUT",
      body: { role: "viewer" },
      cookie: admin,
    });
    await call(`/api/projects/shop/members/${ben.id}`, {
      method: "PUT",
      body: { role: "viewer" },
      cookie: admin,
    });
    const members = await call("/api/projects/shop/members", {
      cookie: vic.cookie,
    });
    expect(
      members.body.map((member: { name: string; role: string }) => [
        member.name,
        member.role,
      ])
    ).toEqual([
      ["Ana", "author"],
      ["Vic", "viewer"],
      ["Ben", "viewer"],
    ]);
    // A viewer can see who's in the project but can't change it.
    expect(
      (
        await call(`/api/projects/shop/members/${ben.id}`, {
          method: "DELETE",
          cookie: vic.cookie,
        })
      ).status
    ).toBe(403);
    const anaId = (await call("/api/session", { cookie: admin })).body.account
      .id;
    expect(
      (
        await call(`/api/projects/shop/members/${anaId}`, {
          method: "DELETE",
          cookie: admin,
        })
      ).status
    ).toBe(403);
    await call(`/api/projects/shop/members/${ben.id}`, {
      method: "DELETE",
      cookie: admin,
    });
    expect((await call("/api/projects", { cookie: ben.cookie })).body).toEqual(
      []
    );
  });
});

describe("helpers", () => {
  it("turns a name into a unique folder-safe ID", () => {
    expect(projectId("Q3 Sales — Draft!", new Set())).toBe("q3-sales-draft");
    expect(projectId("Shop", new Set(["shop", "shop-2"]))).toBe("shop-3");
    expect(projectId("???", new Set())).toBe("project");
  });

  it("lets a pair try again once the lock passes", () => {
    let now = 0;
    const limiter = signInLimiter(() => now);
    for (let attempt = 0; attempt < 5; attempt++) {
      limiter.failed("a");
    }
    expect(limiter.wait("a")).toBe(15 * 60_000);
    expect(limiter.wait("b")).toBe(0);
    now = 15 * 60_000;
    expect(limiter.wait("a")).toBe(0);
  });
});
