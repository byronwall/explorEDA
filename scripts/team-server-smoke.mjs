// Builds the team server image from a packed exploreda tarball and runs it
// with docker/compose.yaml: the server starts and serves the app, the first
// visitor sets up the admin, an author creates a project and uploads a file,
// and reads a table from an uploaded SQLite file, and all of it is still
// there after the container restarts.
//
// Usage: node scripts/team-server-smoke.mjs [pack-folder]
//   pack-folder  holds exploreda-<version>.tgz (default: pack)
//   EXPLOREDA_SMOKE_DATA=<folder>  start from a copy of this data folder
//   instead of an empty volume, to prove an upgrade keeps older data.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const packDir = path.resolve(process.argv[2] ?? "pack");
const tarball = readdirSync(packDir).find((name) =>
  /^exploreda-.*\.tgz$/.test(name)
);
if (!tarball) {
  console.error(`No exploreda-*.tgz in ${packDir}. Run pnpm pack first.`);
  process.exit(66);
}

const image = "exploreda-team-smoke";
const project = "exploreda-smoke";
const port = 18080;
const base = `http://127.0.0.1:${port}`;
// Its own volume name, so `down -v` never touches a real exploreda-data.
const env = {
  ...process.env,
  EXPLOREDA_IMAGE: image,
  EXPLOREDA_PORT: String(port),
  EXPLOREDA_VOLUME: "exploreda-smoke-data",
};
const compose = (...args) =>
  execFileSync(
    "docker",
    ["compose", "-p", project, "-f", "docker/compose.yaml", ...args],
    { env, stdio: "inherit" }
  );
const started = Date.now();
const step = (text) =>
  console.log(`[${((Date.now() - started) / 1000).toFixed(1)}s] ${text}`);

let cookie = "";
async function call(pathname, { method = "GET", body, raw } = {}) {
  const response = await fetch(`${base}${pathname}`, {
    method,
    headers: {
      origin: base,
      ...(cookie ? { cookie } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    cookie = setCookie.split(";")[0];
  }
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${pathname}: ${response.status} ${text}`);
  }
  return text.startsWith("{") || text.startsWith("[") ? JSON.parse(text) : text;
}

async function healthy() {
  for (let tries = 0; tries < 120; tries++) {
    try {
      const health = await (await fetch(`${base}/api/health`)).json();
      if (health.ok) {
        return health;
      }
    } catch {
      // Still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("The server didn't answer its health check in 60 s.");
}

const check = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

try {
  step(`Building ${image} from ${tarball}`);
  execFileSync(
    "docker",
    ["build", "-t", image, "-f", "docker/Dockerfile", packDir],
    { stdio: "inherit" }
  );
  compose("down", "-v", "--remove-orphans");
  if (process.env.EXPLOREDA_SMOKE_DATA) {
    // Fill the volume before the server first starts, as an upgrade finds it.
    step(`Copying ${process.env.EXPLOREDA_SMOKE_DATA} into the volume`);
    compose("create");
    const container = execFileSync(
      "docker",
      ["compose", "-p", project, "-f", "docker/compose.yaml", "ps", "-aq"],
      { env }
    )
      .toString()
      .trim();
    execFileSync("docker", [
      "cp",
      `${path.resolve(process.env.EXPLOREDA_SMOKE_DATA)}/.`,
      `${container}:/data/`,
    ]);
    // docker cp writes as root; the server runs as the node user.
    compose(
      "run",
      "--rm",
      "--no-deps",
      "--user",
      "root",
      "--entrypoint",
      "chown",
      "exploreda",
      "-R",
      "node:node",
      "/data"
    );
  }
  compose("up", "-d");
  const health = await healthy();
  step(`Server ${health.version} is up`);
  check(
    (await call("/")).includes("<!doctype html>"),
    "The app page wasn't served."
  );

  if (process.env.EXPLOREDA_SMOKE_DATA) {
    const { needed } = await call("/api/setup");
    check(!needed, "The copied data folder lost its accounts.");
    await call("/api/session", {
      method: "POST",
      body: { email: "ana@example.com", password: "exploreda-dev" },
    });
    const projects = await call("/api/projects");
    check(projects.length > 0, "The copied data folder lost its projects.");
    const files = await call("/api/projects/shop/files");
    check(
      files.includes("data/uploaded.csv") && files.includes("orders.eda"),
      `The copied project lost files: ${JSON.stringify(files)}`
    );
    step(`Signed in to the copied data; ${projects.length} project(s) kept`);
  } else {
    const { needed } = await call("/api/setup");
    check(needed, "A new server should ask for its admin account.");
    await call("/api/setup", {
      method: "POST",
      body: {
        name: "Ana Admin",
        email: "ana@example.com",
        password: "exploreda-dev",
      },
    });
    step("Created the admin account");
    await call("/api/projects", { method: "POST", body: { name: "Smoke" } });
    await call("/api/projects/smoke/upload?path=data/sales.csv", {
      method: "POST",
      raw: "region,revenue\nEast,10\nWest,12\n",
    });
    step("Created a project and uploaded a file");
    await call("/api/projects/smoke/upload?path=data/shop.db", {
      method: "POST",
      raw: readFileSync("packages/explorEDA/examples/database/data/shop.db"),
    });
    await call("/api/projects/smoke/file?path=exploreda.eda", {
      method: "PUT",
      raw: "project @smoke\n\nconnection @shop driver=sqlite path=data/shop.db\n\nsource @orders db=shop table=orders\n",
    });
    const read = await call("/api/projects/smoke/sources/orders/refresh", {
      method: "POST",
    });
    check(
      read.rowCount === 80,
      `Reading orders answered ${JSON.stringify(read)}`
    );
    step("Read 80 rows from an uploaded SQLite file");
  }

  const before = await call("/api/projects");
  compose("restart");
  await healthy();
  step("Restarted the container");
  const after = await call("/api/projects");
  check(
    JSON.stringify(after) === JSON.stringify(before),
    `Projects changed across the restart: ${JSON.stringify(after)}`
  );
  if (!process.env.EXPLOREDA_SMOKE_DATA) {
    const files = await call("/api/projects/smoke/files");
    check(
      files.includes("data/sales.csv"),
      `The uploaded file is gone: ${JSON.stringify(files)}`
    );
    const text = await call("/api/projects/smoke/file?path=data/sales.csv");
    check(text.includes("West,12"), "The uploaded file changed.");
    const snapshot = await call(
      "/api/projects/smoke/file?path=.exploreda/snapshots/orders.json"
    );
    check(snapshot.rowCount === 80, "The database snapshot is gone.");
  }
  step("Accounts, the session, projects, and files survived the restart");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  try {
    compose("logs", "--no-color", "--tail", "100");
  } catch {
    // Nothing more to show.
  }
  process.exitCode = 1;
} finally {
  compose("down", "-v", "--remove-orphans");
}
