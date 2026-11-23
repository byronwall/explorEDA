// Smoke test for `npx exploreda` from a packed tarball, the way a user runs
// it. Starts the command on the sample project, checks the server answers
// with the run's key and refuses without it, serves the app, and that every
// view of the sample builds.
//
// Usage: node scripts/cli-smoke.mjs <folder with exploreda-*.tgz | tarball>
import { spawn, spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? ".");
const tarball = statSync(target).isDirectory()
  ? path.join(
      target,
      readdirSync(target).find((name) => /^exploreda-.*\.tgz$/.test(name)) ?? ""
    )
  : target;
if (!tarball.endsWith(".tgz")) {
  console.error(`No exploreda-*.tgz in ${target}`);
  process.exit(1);
}

const windows = process.platform === "win32";
const cwd = mkdtempSync(path.join(tmpdir(), "exploreda-smoke-"));
// Windows runs npm and npx through their .cmd shims, which need a shell.
const run = (command, args, options = {}) =>
  spawn(command, args, { cwd, shell: windows, ...options });
const runSync = (command, args) =>
  spawnSync(command, args, { cwd, shell: windows, encoding: "utf8" });

// Install first, as npx would, so a slow install and a slow start show apart.
writeFileSync(path.join(cwd, "package.json"), '{ "private": true }\n');
const installStarted = Date.now();
const install = runSync("npm", ["install", "--no-audit", "--no-fund", tarball]);
console.log(
  `installed in ${((Date.now() - installStarted) / 1000).toFixed(1)} s (exit ${install.status})`
);
if (install.status !== 0) {
  console.error(install.stdout, install.stderr);
  process.exit(1);
}
const npx = (args) => run("npx", ["--no-install", ...args]);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

/** Starts `exploreda` with these arguments and resolves with its link. */
async function start(args) {
  const server = npx(["exploreda", ...args, "--no-open", "--port", "0"]);
  let output = "";
  server.stderr.on("data", (chunk) => (output += chunk));
  const link = await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`no link after 60 s:\n${output}`)),
      60_000
    );
    server.stdout.on("data", (chunk) => {
      output += chunk;
      const match = /Open\s+(http:\/\/\S+)/.exec(output);
      if (match) {
        clearTimeout(timer);
        resolve(match[1]);
      }
    });
    server.on("exit", (code) =>
      reject(new Error(`exited ${code}:\n${output}`))
    );
  });
  return { server, link };
}

function stop(server) {
  if (windows) {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
  } else {
    server.kill("SIGINT");
  }
}

const started = Date.now();
const { server, link } = await start(["--example"]);
console.log(
  `started in ${((Date.now() - started) / 1000).toFixed(1)} s: ${link}`
);

const url = new URL(link);
const token = url.searchParams.get("token");
const api = (pathname, headers = {}) =>
  fetch(new URL(pathname, url.origin), { headers });

try {
  const info = await (
    await api("/api/info", { "x-exploreda-token": token })
  ).json();
  if (info.name !== "exploreda-example") fail(`info.name is ${info.name}`);
  const files = await (
    await api("/api/files", { "x-exploreda-token": token })
  ).json();
  for (const expected of ["exploreda.eda", "orders.eda", "data/orders.csv"]) {
    if (!files.includes(expected)) fail(`${expected} is not listed: ${files}`);
  }
  if ((await api("/api/files")).status !== 403)
    fail("a request without the key was answered");
  const page = await (await api("/")).text();
  if (!page.includes('id="root"')) fail("the app page didn't load");

  // An agent's first /mcp call loads the checker and builds an analysis.
  const orders = await (
    await api("/api/file?path=orders.eda", { "x-exploreda-token": token })
  ).text();
  const mcp = await fetch(new URL("/mcp", url.origin), {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "check",
        arguments: { path: "orders.eda", text: orders },
      },
    }),
  });
  const checked = (await mcp.json()).result?.structuredContent;
  if (!checked?.complete || !checked.charts)
    fail(`/mcp check answered ${JSON.stringify(checked)}`);
  else console.log(`/mcp check built ${checked.charts} charts in orders.eda`);
} finally {
  stop(server);
}

// The database example reads a SQLite file into a snapshot on request.
{
  const { server: database, link: databaseLink } = await start([
    "--example",
    "database",
  ]);
  const at = new URL(databaseLink);
  try {
    const response = await fetch(
      new URL("/api/sources/orders/refresh", at.origin),
      {
        method: "POST",
        headers: { "x-exploreda-token": at.searchParams.get("token") },
      }
    );
    const read = await response.json();
    if (read.rowCount !== 80)
      fail(`reading orders from SQLite answered ${JSON.stringify(read)}`);
    else console.log(`read ${read.rowCount} rows from the database example`);
  } finally {
    stop(database);
  }
}

// The command starts without chart code; /mcp loads exploreda-tools.js.
{
  const cli = path.join(cwd, "node_modules/exploreda/dist/cli");
  const loaded = new Set();
  const visit = (file) => {
    if (loaded.has(file)) return;
    loaded.add(file);
    const text = readFileSync(path.join(cli, file), "utf8");
    for (const [, next] of text.matchAll(/(?:from|^import) "\.\/([^"]+)"/gm))
      visit(next);
  };
  visit("exploreda.js");
  const charts = (file) =>
    readFileSync(path.join(cli, file), "utf8").includes("registerAllCharts");
  const eager = [...loaded].filter(charts);
  if (eager.length) fail(`exploreda loads chart code at start: ${eager}`);
}

// An agent's one config line: exploreda mcp over stdio. No server runs on
// the sample now, so the relay starts one for itself.
{
  const relay = npx(["exploreda", "mcp", "--example", "--port", "0"]);
  let stderr = "";
  relay.stderr.on("data", (chunk) => (stderr += chunk));
  const replies = new Map();
  let pending = "";
  relay.stdout.on("data", (chunk) => {
    pending += chunk;
    const lines = pending.split("\n");
    pending = lines.pop();
    for (const line of lines.filter(Boolean)) {
      const reply = JSON.parse(line);
      replies.set(reply.id, reply);
    }
  });
  const send = (message) =>
    relay.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", ...message })}\n`);
  const reply = (id) =>
    new Promise((resolve, reject) => {
      const started = Date.now();
      const poll = setInterval(() => {
        if (replies.has(id)) {
          clearInterval(poll);
          resolve(replies.get(id));
        } else if (Date.now() - started > 60_000) {
          clearInterval(poll);
          reject(new Error(`no reply ${id} after 60 s:\n${stderr}`));
        }
      }, 100);
    });
  try {
    send({
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "cli-smoke", version: "1" },
      },
    });
    const init = await reply(1);
    if (init.result?.serverInfo?.name !== "exploreda")
      fail(`exploreda mcp initialize answered ${JSON.stringify(init)}`);
    send({ method: "notifications/initialized" });
    send({
      id: 2,
      method: "tools/call",
      params: {
        name: "check",
        arguments: {
          path: "orders.eda",
          text: readFileSync(
            path.join(cwd, "exploreda-example", "orders.eda"),
            "utf8"
          ),
        },
      },
    });
    const checked = (await reply(2)).result?.structuredContent;
    if (!checked?.complete || !checked.charts)
      fail(`exploreda mcp check answered ${JSON.stringify(checked)}`);
    else
      console.log(
        `exploreda mcp check built ${checked.charts} charts over stdio`
      );
    // A new file through the packed command: the call that once hung.
    send({
      id: 3,
      method: "tools/call",
      params: {
        name: "write_eda",
        arguments: {
          path: "smoke-agent.eda",
          text: "eda query=order-lines\nrow orders.channel\n",
        },
      },
    });
    const saved = await reply(3);
    if (!saved.result?.structuredContent?.complete)
      fail(`exploreda mcp write_eda answered ${JSON.stringify(saved)}`);
    else console.log("exploreda mcp write_eda saved a new analysis over stdio");
  } catch (error) {
    fail(error.message);
  } finally {
    relay.stdin.end();
    await new Promise((resolve) => {
      const timer = setTimeout(() => {
        stop(relay);
        resolve();
      }, 10_000);
      relay.on("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}

const check = runSync("npx", [
  "--no-install",
  "exploreda-dsl",
  "project",
  "exploreda-example",
]);
console.log(check.stdout.trim());
if (check.status !== 0)
  fail(`exploreda-dsl project exited ${check.status}\n${check.stderr}`);

console.log(process.exitCode ? "smoke test failed" : "smoke test passed");
process.exit(process.exitCode ?? 0);
