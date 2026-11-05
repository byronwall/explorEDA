// Collects one database UX eval after its agents finish: reads each task's
// REPORT.md scorecard, writes scorecard.json, prints a results table, and
// (with --shots) screenshots each deliverable at 1280 px.
//
// Usage: node scripts/db-evals/collect.mjs <eval-id> [--shots] [--compare <scorecard.json>]
//
// --compare takes an earlier eval's scorecard.json, such as
// docs/research/db-evals-2026-11/scorecard.json, and prints the change per task.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);
const evalId = args[0];
if (!evalId || evalId.startsWith("--")) {
  throw new Error(
    "Give the eval id, as in: node scripts/db-evals/collect.mjs 2026-12-01"
  );
}
const dir = path.join(root, "tmp/db-evals", evalId);
const compareIndex = args.indexOf("--compare");
const before =
  compareIndex < 0
    ? undefined
    : JSON.parse(readFileSync(args[compareIndex + 1], "utf8"));
const { tasks } = JSON.parse(
  readFileSync(path.join(import.meta.dirname, "tasks.json"), "utf8")
);

const cards = {};
for (const id of readdirSync(dir)
  .filter((name) => /^t\d+$/.test(name))
  .sort()) {
  const report = path.join(dir, id, "REPORT.md");
  if (!existsSync(report)) {
    cards[id] = { outcome: "missing" };
    continue;
  }
  const block = readFileSync(report, "utf8").match(/```json\n([\s\S]*?)\n```/);
  try {
    cards[id] = JSON.parse(block[1]);
  } catch {
    cards[id] = { outcome: "unscored" };
  }
}
writeFileSync(
  path.join(dir, "scorecard.json"),
  `${JSON.stringify(cards, null, 2)}\n`
);

const cell = (id, key) => {
  const now = cards[id]?.[key];
  const then = before?.[id]?.[key];
  const show = (value) =>
    Array.isArray(value) ? value.join(" ") || "–" : String(value ?? "–");
  return before && show(then) !== show(now)
    ? `${show(then)} → ${show(now)}`
    : show(now);
};
const keys = [
  "outcome",
  "joins",
  "browserNeededForCli",
  "outsideTools",
  "blockers",
  "major",
  "minor",
  "minutes",
];
console.log(`| Task | ${keys.join(" | ")} |`);
console.log(`| --- | ${keys.map(() => "---").join(" | ")} |`);
for (const id of Object.keys(cards)) {
  const title = tasks.find((task) => task.id === id)?.title ?? id;
  console.log(
    `| ${id} ${title} | ${keys.map((key) => cell(id, key)).join(" | ")} |`
  );
}

if (!args.includes("--shots")) {
  process.exit(0);
}
for (const [id, card] of Object.entries(cards)) {
  if (!card.deliverableLabel) {
    continue;
  }
  const port = 4200 + Number(id.slice(1));
  const server = spawn(path.join(dir, "bin/exploreda"), [
    path.join(dir, id),
    "--no-open",
    "--port",
    String(port),
  ]);
  const url = await new Promise((resolve, reject) => {
    let text = "";
    server.stdout.on("data", (chunk) => {
      text += chunk;
      const match = text.match(/http:\/\/\S+token=\S+/);
      if (match) {
        resolve(match[0]);
      }
    });
    server.on("exit", () =>
      reject(new Error(`${id}: the server stopped before it printed a link`))
    );
  });
  const label = card.deliverableLabel;
  spawnSync(
    "node",
    [
      "scripts/app-shot.mjs",
      url,
      "--name",
      `db-evals/${evalId}/${id}`,
      "--widths",
      "1280",
      "--height",
      "1000",
      "--full",
      "--wait",
      `text=${label}`,
      "--click",
      `text=${label}`,
      "--after",
      "svg",
    ],
    { cwd: root, stdio: "inherit" }
  );
  server.kill();
}
