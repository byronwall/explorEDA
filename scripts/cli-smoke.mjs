// Smoke test for `npx exploreda` from a packed tarball, the way a user runs
// it. Starts the command on the sample project, checks the server answers
// with the run's key and refuses without it, serves the app, and that every
// view of the sample builds.
//
// Usage: node scripts/cli-smoke.mjs <folder with exploreda-*.tgz | tarball>
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, statSync, writeFileSync } from "node:fs";
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
