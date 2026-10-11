// Starts this checkout's demo dev server in the background and waits until it
// answers. Each worktree gets its own port, derived from its path, so parallel
// sessions never collide. The log goes to tmp/dev-server.log.
// Usage: pnpm dev:agent          start (or reuse) and print the URL
//        pnpm dev:agent --stop   stop this checkout's server
import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statePath = join(root, "tmp/dev-server.json");
const logPath = join(root, "tmp/dev-server.log");

const responds = async (url) => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
};

const portIsFree = (port) =>
  new Promise((done) => {
    const server = createServer()
      .once("error", () => done(false))
      .once("listening", () => server.close(() => done(true)))
      .listen(port, "127.0.0.1");
  });

const readState = () => {
  try {
    return JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return null;
  }
};

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/** The URL of this checkout's running server, or null. */
export async function runningServerUrl() {
  const state = readState();
  if (state && isAlive(state.pid) && (await responds(state.url)))
    return state.url;
  return null;
}

/** Starts the server if needed and resolves to its URL. */
export async function ensureDevServer({ quiet = false } = {}) {
  const running = await runningServerUrl();
  if (running) return running;

  const hash = createHash("sha1").update(root).digest().readUInt16BE(0);
  let port = 5300 + (hash % 600);
  while (!(await portIsFree(port))) port += 1;

  // A fresh worktree has no installed packages.
  if (!existsSync(join(root, "apps/demo/node_modules/.bin/vite"))) {
    if (!quiet) console.error("Installing packages for this checkout…");
    execFileSync("pnpm", ["install", "--frozen-lockfile"], {
      cwd: root,
      stdio: ["ignore", "ignore", "inherit"],
    });
  }

  mkdirSync(dirname(logPath), { recursive: true });
  const log = openSync(logPath, "w");
  const child = spawn(
    "pnpm",
    [
      "--filter",
      "demo",
      "dev",
      "--port",
      String(port),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    { cwd: root, detached: true, stdio: ["ignore", log, log] }
  );
  child.unref();
  const url = `http://127.0.0.1:${port}`;
  writeFileSync(
    statePath,
    JSON.stringify({ pid: child.pid, port, url }, null, 2)
  );

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (await responds(url)) {
      if (!quiet)
        console.error(`Demo dev server ready (log: tmp/dev-server.log)`);
      return url;
    }
    if (!isAlive(child.pid)) break;
    await new Promise((done) => setTimeout(done, 500));
  }
  const tail = existsSync(logPath)
    ? readFileSync(logPath, "utf8").split("\n").slice(-20).join("\n")
    : "";
  throw new Error(`Demo dev server did not start on ${url}.\n${tail}`);
}

export function stopDevServer() {
  const state = readState();
  if (state && isAlive(state.pid)) {
    process.kill(-state.pid, "SIGTERM");
    console.log(`Stopped the demo dev server on ${state.url}`);
  } else {
    console.log("No demo dev server is running for this checkout.");
  }
  rmSync(statePath, { force: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--stop")) stopDevServer();
  else console.log(await ensureDevServer());
}
