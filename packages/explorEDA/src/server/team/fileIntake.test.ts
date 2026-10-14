// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { createServer, request, type Server } from "node:http";
import type { AddressInfo, LookupFunction } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startHttpServer, type StartedServer } from "../server";
import { memoryAccountStore } from "./accounts";
import {
  guardedLookup,
  isBlockedAddress,
  pathForUrl,
  FETCHED_FILE,
} from "./fileIntake";
import { createTeamHandler } from "./teamHandler";

const PASSWORD = "correct horse";
let server: StartedServer;
let files: Server;
let filesPort: number;
let dataDir: string;
let origin: string;
let author: string;
let viewer: string;
const logged: Array<Record<string, unknown>> = [];
let ordersCsv = "id,amount\n1,10\n2,20\n";

/** `files.test` stands for a company host; it reaches the local server. */
const testLookup: LookupFunction = (hostname, options, callback) => {
  if (hostname === "files.test") {
    if ((options as { all?: boolean }).all) {
      (callback as unknown as (e: null, a: unknown[]) => void)(null, [
        { address: "127.0.0.1", family: 4 },
      ]);
    } else {
      callback(null, "127.0.0.1", 4);
    }
    return;
  }
  guardedLookup(hostname, options, callback);
};

function call(
  pathname: string,
  {
    method = "GET",
    body,
    cookie,
  }: { method?: string; body?: string; cookie?: string } = {}
): Promise<{ status: number; body: any }> {
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
          })
        );
      }
    );
    req.on("error", reject);
    req.end(body);
  });
}

async function signIn(email: string) {
  return new Promise<string>((resolve) => {
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
        resolve(res.headers["set-cookie"]![0]!.split(";")[0]!);
      }
    );
    req.end(JSON.stringify({ email, password: PASSWORD }));
  });
}

const fetchUrl = (cookie: string, body: Record<string, string>) =>
  call("/api/projects/shop/fetch", {
    method: "POST",
    body: JSON.stringify(body),
    cookie,
  });

const onDisk = (relative: string) =>
  readFileSync(path.join(dataDir, "projects/shop", relative), "utf8");

beforeAll(async () => {
  files = createServer((req, res) => {
    if (req.url === "/orders.csv") {
      res.writeHead(200, { etag: '"v1"' });
      res.end(ordersCsv);
    } else if (req.url === "/moved") {
      res.writeHead(302, { location: "/orders.csv" });
      res.end();
    } else if (req.url === "/to-metadata") {
      res.writeHead(302, { location: "http://169.254.169.254/latest" });
      res.end();
    } else if (req.url === "/to-self") {
      res.writeHead(302, {
        location: `http://127.0.0.1:${filesPort}/orders.csv`,
      });
      res.end();
    } else if (req.url === "/big.csv") {
      res.writeHead(200);
      res.end("x".repeat(5000));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((resolve) => files.listen(0, "127.0.0.1", resolve));
  filesPort = (files.address() as AddressInfo).port;

  dataDir = mkdtempSync(path.join(tmpdir(), "exploreda-intake-"));
  const store = memoryAccountStore();
  await store.createProject({ id: "shop", name: "Shop" });
  for (const [email, kind] of [
    ["ana@example.com", "author"],
    ["vic@example.com", "viewer"],
  ] as const) {
    const account = await store.createAccount({
      email,
      name: email,
      kind,
      password: PASSWORD,
    });
    await store.setMember("shop", { accountId: account.id, role: kind });
  }
  server = await startHttpServer({
    handle: createTeamHandler({
      store,
      dataDir,
      version: "test",
      uploadLimit: 1000,
      lookup: testLookup,
      log: (entry) => logged.push(entry),
    }),
    port: 0,
    host: "127.0.0.1",
    link: (port) => `http://127.0.0.1:${port}/`,
  });
  origin = `http://127.0.0.1:${server.port}`;
  author = await signIn("ana@example.com");
  viewer = await signIn("vic@example.com");
});

afterAll(async () => {
  await server.close();
  await new Promise((resolve) => files.close(resolve));
});

describe("uploads", () => {
  it("writes an author's file into the project's data folder", async () => {
    const reply = await call("/api/projects/shop/upload?path=data/sales.csv", {
      method: "POST",
      body: "id\n1\n",
      cookie: author,
    });
    expect(reply).toEqual({
      status: 200,
      body: { saved: "data/sales.csv", bytes: 5 },
    });
    expect(onDisk("data/sales.csv")).toBe("id\n1\n");
  });

  it("refuses viewers, other file types, the app's folder, and big files", async () => {
    const tries = [
      ["data/a.csv", viewer, 403],
      ["data/a.exe", author, 400],
      [".exploreda/fetched.json", author, 400],
      ["../escape.csv", author, 400],
    ] as const;
    for (const [target, cookie, status] of tries) {
      const reply = await call(`/api/projects/shop/upload?path=${target}`, {
        method: "POST",
        body: "id\n1\n",
        cookie,
      });
      expect([target, reply.status]).toEqual([target, status]);
    }
    const big = await call("/api/projects/shop/upload?path=data/big.csv", {
      method: "POST",
      body: "x".repeat(5000),
      cookie: author,
    });
    expect(big.status).toBe(413);
    expect(existsSync(path.join(dataDir, "projects/shop/data/big.csv"))).toBe(
      false
    );
  });
});

describe("downloads", () => {
  it("fetches a URL, follows a redirect, and records where it came from", async () => {
    const reply = await fetchUrl(author, {
      url: `http://files.test:${filesPort}/moved`,
      path: "data/orders.csv",
    });
    expect(reply.status).toBe(200);
    expect(reply.body).toMatchObject({
      saved: "data/orders.csv",
      bytes: ordersCsv.length,
      etag: '"v1"',
    });
    expect(onDisk("data/orders.csv")).toBe(ordersCsv);
    const records = JSON.parse(onDisk(FETCHED_FILE));
    expect(records["data/orders.csv"].url).toBe(
      `http://files.test:${filesPort}/moved`
    );
    expect(logged.at(-1)).toMatchObject({
      event: "fetch",
      outcome: "saved",
      account: "ana@example.com",
    });
  });

  it("refetches a recorded file from the same address", async () => {
    ordersCsv = "id,amount\n1,10\n2,20\n3,30\n";
    const reply = await fetchUrl(author, { path: "data/orders.csv" });
    expect(reply.status).toBe(200);
    expect(onDisk("data/orders.csv")).toBe(ordersCsv);
  });

  it("keeps the last good copy when a download fails", async () => {
    const before = onDisk("data/orders.csv");
    const failures = [
      [`http://files.test:${filesPort}/missing.csv`, 502],
      [`http://files.test:${filesPort}/big.csv`, 413],
      [`http://files.test:${filesPort}/to-metadata`, 403],
      [`http://files.test:${filesPort}/to-self`, 403],
      ["http://169.254.169.254/latest/meta-data", 403],
      ["http://metadata.google.internal/", 403],
      ["file:///etc/passwd", 400],
    ] as const;
    for (const [url, status] of failures) {
      const reply = await fetchUrl(author, { url, path: "data/orders.csv" });
      expect([url, reply.status]).toEqual([url, status]);
    }
    expect(onDisk("data/orders.csv")).toBe(before);
    expect(logged.at(-1)).toMatchObject({ outcome: "failed" });
  });

  it("refuses a viewer", async () => {
    const reply = await fetchUrl(viewer, {
      url: `http://files.test:${filesPort}/orders.csv`,
    });
    expect(reply.status).toBe(403);
  });
});

describe("helpers", () => {
  it("blocks this machine, link-local, and metadata addresses only", () => {
    for (const address of [
      "127.0.0.1",
      "169.254.169.254",
      "0.0.0.0",
      "::1",
      "::ffff:127.0.0.1",
      "fe80::1",
      "fd00:ec2::254",
    ]) {
      expect([address, isBlockedAddress(address)]).toEqual([address, true]);
    }
    for (const address of [
      "10.0.0.5",
      "192.168.1.20",
      "172.16.4.4",
      "8.8.8.8",
    ]) {
      expect([address, isBlockedAddress(address)]).toEqual([address, false]);
    }
  });

  it("names a downloaded file from its URL", () => {
    expect(pathForUrl("https://x.test/reports/q3%20sales.csv?v=1")).toBe(
      "data/q3-sales.csv"
    );
    expect(pathForUrl("https://x.test/export")).toBe("data/export.csv");
    expect(pathForUrl("https://x.test/")).toBe("data/download.csv");
  });
});
