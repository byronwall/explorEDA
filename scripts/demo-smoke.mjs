// Runs the demo stack in docker/demo from a packed exploreda tarball: the
// warehouse seeds, the server starts with the Retail project, an author
// reads every database source, and every analysis builds on what was read.
//
// Usage: node scripts/demo-smoke.mjs [pack-folder]
//   pack-folder  holds exploreda-<version>.tgz (default: pack)
//   --keep       leave the stack running afterwards, to look at it
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const keep = args.includes("--keep");
const packDir = path.resolve(
  args.find((arg) => !arg.startsWith("--")) ?? "pack"
);
const tarball = readdirSync(packDir).find((name) =>
  /^exploreda-.*\.tgz$/.test(name)
);
if (!tarball) {
  console.error(`No exploreda-*.tgz in ${packDir}. Run pnpm pack first.`);
  process.exit(66);
}

const image = "exploreda-demo-smoke";
const project = "exploreda-demo-smoke";
const port = Number(process.env.EXPLOREDA_PORT ?? 18081);
const base = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  EXPLOREDA_IMAGE: image,
  EXPLOREDA_PORT: String(port),
};
const compose = (...rest) =>
  execFileSync(
    "docker",
    ["compose", "-p", project, "-f", "docker/demo/compose.yaml", ...rest],
    { env, stdio: "inherit" }
  );

const started = Date.now();
const step = (text) =>
  console.log(`[${((Date.now() - started) / 1000).toFixed(1)}s] ${text}`);
const check = (condition, message) => {
  if (!condition) throw new Error(message);
};

let cookie = "";
async function call(pathname, { method = "GET", body } = {}) {
  const response = await fetch(`${base}${pathname}`, {
    method,
    headers: {
      origin: base,
      ...(cookie ? { cookie } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${pathname}: ${response.status} ${text}`);
  }
  return text.startsWith("{") || text.startsWith("[") ? JSON.parse(text) : text;
}

try {
  step(`Building ${image} from ${tarball}`);
  execFileSync(
    "docker",
    ["build", "-t", image, "-f", "docker/Dockerfile", packDir],
    { stdio: "inherit" }
  );
  compose("down", "-v", "--remove-orphans");
  compose("up", "-d", "--wait");
  step("The warehouse is seeded and the server is up");

  await call("/api/session", {
    method: "POST",
    body: { email: "ana@example.com", password: "exploreda-dev" },
  });
  const projects = await call("/api/projects");
  check(
    projects.some((item) => item.id === "retail"),
    `No Retail project: ${JSON.stringify(projects)}`
  );
  step("Signed in; the Retail project is there");

  const sources = ["orders", "customers", "products", "lines", "monthly"];
  for (const source of sources) {
    const read = await call(`/api/projects/retail/sources/${source}/refresh`, {
      method: "POST",
    });
    check(read.rowCount > 0, `${source} read no rows`);
    step(`Read ${read.rowCount.toLocaleString()} rows into ${source}`);
  }

  // Every analysis must build on the rows it reads: copy the project out
  // and check it with the package's own checker.
  const folder = mkdtempSync(path.join(tmpdir(), "exploreda-demo-"));
  for (const file of await call("/api/projects/retail/files")) {
    const text = await call(
      `/api/projects/retail/file?path=${encodeURIComponent(file)}`
    );
    mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
    writeFileSync(
      path.join(folder, file),
      typeof text === "string" ? text : JSON.stringify(text)
    );
  }
  const report = execFileSync(
    "node",
    ["packages/explorEDA/dist/cli/exploreda-dsl.js", "project", folder],
    { encoding: "utf8" }
  );
  console.log(report.trim());
  check(/every declaration applied/.test(report), "An analysis didn't build.");
  step("Every analysis builds on the warehouse's rows");
  console.log("demo smoke test passed");
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  try {
    compose("logs", "--no-color", "--tail", "60");
  } catch {
    // Nothing more to show.
  }
  process.exitCode = 1;
} finally {
  if (!keep) compose("down", "-v", "--remove-orphans");
}
