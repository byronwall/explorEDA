// Smoke test for `npx exploreda` from a packed tarball, the way a user runs
// it. Starts the command on the sample project, checks the server answers
// with the run's key and refuses without it, serves the app, and that every
// view of the sample builds.
//
// Usage: node scripts/cli-smoke.mjs <folder with exploreda-*.tgz | tarball>
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const target = path.resolve(process.argv[2] ?? ".");
const tarball = statSync(target).isDirectory()
  ? path.join(
      target,
      readdirSync(target).find((name) => /^exploreda-.*\.tgz$/.test(name)) ??
        ""
    )
  : target;
if (!tarball.endsWith(".tgz")) {
  console.error(`No exploreda-*.tgz in ${target}`);
  process.exit(1);
}

const windows = process.platform === "win32";
const cwd = mkdtempSync(path.join(tmpdir(), "exploreda-smoke-"));
const npx = (args, options = {}) =>
  spawn("npx", ["--yes", "--package", tarball, ...args], {
    cwd,
    shell: windows,
    ...options,
  });

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

const started = Date.now();
const server = npx(["exploreda", "--example", "--no-open", "--port", "0"]);
let output = "";
server.stderr.on("data", (chunk) => (output += chunk));
const link = await new Promise((resolve, reject) => {
  const timer = setTimeout(
    () => reject(new Error(`no link after 180 s:\n${output}`)),
    180_000
  );
  server.stdout.on("data", (chunk) => {
    output += chunk;
    const match = /Open\s+(http:\/\/\S+)/.exec(output);
    if (match) {
      clearTimeout(timer);
      resolve(match[1]);
    }
  });
  server.on("exit", (code) => reject(new Error(`exited ${code}:\n${output}`)));
});
console.log(`started in ${((Date.now() - started) / 1000).toFixed(1)} s: ${link}`);

const url = new URL(link);
const token = url.searchParams.get("token");
const api = (pathname, headers = {}) =>
  fetch(new URL(pathname, url.origin), { headers });

try {
  const info = await (await api("/api/info", { "x-exploreda-token": token })).json();
  if (info.name !== "exploreda-example") fail(`info.name is ${info.name}`);
  const files = await (await api("/api/files", { "x-exploreda-token": token })).json();
  for (const expected of ["exploreda.eda", "orders.eda", "data/orders.csv"]) {
    if (!files.includes(expected)) fail(`${expected} is not listed: ${files}`);
  }
  if ((await api("/api/files")).status !== 403) fail("a request without the key was answered");
  const page = await (await api("/")).text();
  if (!page.includes('id="root"')) fail("the app page didn't load");
} finally {
  if (windows) {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
  } else {
    server.kill("SIGINT");
  }
}

const check = spawnSync(
  "npx",
  ["--yes", "--package", tarball, "exploreda-dsl", "project", "exploreda-example"],
  { cwd, shell: windows, encoding: "utf8" }
);
console.log(check.stdout.trim());
if (check.status !== 0) fail(`exploreda-dsl project exited ${check.status}\n${check.stderr}`);

console.log(process.exitCode ? "smoke test failed" : "smoke test passed");
process.exit(process.exitCode ?? 0);
