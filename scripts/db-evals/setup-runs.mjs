// Prepares one database UX eval: a folder per task with its own database
// copy and BRIEF.md, plus wrapper commands for this checkout's CLI.
//
// Usage: node scripts/db-evals/setup-runs.mjs [eval-id] [--tasks t1,t3] [--no-build]
//
// Writes tmp/db-evals/<eval-id>/ (eval-id defaults to today's date):
//   bin/exploreda, bin/exploreda-dsl   this checkout's CLI
//   t1/BRIEF.md, t1/data/<db>          one folder per task; t1 uses port 4101
//   prompts.txt                        the one-line prompt for each agent
//
// Run build-dbs.mjs first. Without --no-build it builds the package and the
// project app, since the CLI serves the built app.
import { execSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args.splice(index, 2)[1];
};
const only = flag("--tasks")?.split(",");
const build = !args.includes("--no-build");
const evalId =
  args.find((arg) => !arg.startsWith("--")) ??
  new Date().toISOString().slice(0, 10);

const dbs = path.join(root, "tmp/db-evals/dbs");
const dir = path.join(root, "tmp/db-evals", evalId);
const { tasks } = JSON.parse(
  readFileSync(path.join(import.meta.dirname, "tasks.json"), "utf8")
);
const common = readFileSync(
  path.join(import.meta.dirname, "brief-common.md"),
  "utf8"
);

for (const db of new Set(tasks.map((task) => task.db))) {
  if (!existsSync(path.join(dbs, db))) {
    throw new Error(
      `${db} is missing. Run node scripts/db-evals/build-dbs.mjs first.`
    );
  }
}

if (build) {
  execSync("pnpm --filter exploreda build && pnpm --filter app build", {
    cwd: root,
    stdio: "inherit",
  });
}

const bin = path.join(dir, "bin");
mkdirSync(bin, { recursive: true });
for (const name of ["exploreda", "exploreda-dsl"]) {
  const file = path.join(bin, name);
  writeFileSync(
    file,
    `#!/bin/sh\nexec node ${path.join(root, "packages/explorEDA/dist/cli", `${name}.js`)} "$@"\n`
  );
  chmodSync(file, 0o755);
}

const SURFACE = {
  browser:
    "Work in the browser app like a person would. Use the app's own controls to connect the database and build charts. You may look at the project files the app writes, but build through the UI.",
  cli: "Work as a coding agent would. Write the project text and notebook files yourself, and use `exploreda-dsl` to check them. At the end, open the notebook in the browser app to confirm it renders.",
};

const prompts = [];
for (const task of tasks) {
  if (only && !only.includes(task.id)) {
    continue;
  }
  const folder = path.join(dir, task.id);
  mkdirSync(path.join(folder, "data"), { recursive: true });
  copyFileSync(path.join(dbs, task.db), path.join(folder, "data", task.db));
  const port = 4100 + Number(task.id.slice(1));
  const brief = `# Your task

- Your folder: ${folder} (empty except \`data/${task.db}\`).
- Your port: ${port}.
- Database: \`data/${task.db}\`, ${task.dbNote}.
- Surface: ${SURFACE[task.surface]}${task.extra ? ` ${task.extra}` : ""}
- Deliverable: a ${task.deliverable}.

Goal, in the user's words: "${task.goal}"

Expected: ${task.expected}

${common.replaceAll("<bin>", bin)}`;
  writeFileSync(path.join(folder, "BRIEF.md"), brief);
  prompts.push(
    `${task.id} (${task.surface}): You are a user testing explorEDA. Read ${path.join(folder, "BRIEF.md")} and follow it exactly.`
  );
}
writeFileSync(path.join(dir, "prompts.txt"), `${prompts.join("\n")}\n`);
console.log(`Eval ${evalId} is ready in ${dir}`);
console.log(prompts.join("\n"));
