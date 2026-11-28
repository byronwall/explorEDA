// Pre-push hook (.githooks/pre-push): runs the PR checks CI runs first, so a
// missing changeset or a native tooltip fails here instead of on the PR.
//
// Each pushed branch runs `check:pr` against the base its PR will have: the
// layer below it in a gh stack, else its open PR's base, else origin/main.
// `check:ui` runs on the working tree when the checked-out commit is pushed.
// Skip once with `git push --no-verify`.
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) => {
  try {
    return execFileSync(cmd, args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 15_000,
    }).trim();
  } catch {
    return null;
  }
};

const pushed = readFileSync(0, "utf8")
  .split("\n")
  .map((line) => line.split(" "))
  .filter(
    ([ref, sha]) => ref?.startsWith("refs/heads/") && sha && !/^0+$/.test(sha)
  )
  .map(([ref, sha]) => ({ branch: ref.slice("refs/heads/".length), sha }));
if (!pushed.length) process.exit(0);

// Parent of each branch in the current gh stack, if there is one.
const parents = new Map();
const stackJson = run("gh", ["stack", "view", "--json"]);
if (stackJson) {
  const { trunk, branches } = JSON.parse(stackJson);
  branches.forEach((b, i) =>
    parents.set(b.name, i ? branches[i - 1].name : `origin/${trunk}`)
  );
}
const baseFor = (branch) => {
  if (parents.has(branch)) return parents.get(branch);
  const prBase = run("gh", [
    "pr",
    "view",
    branch,
    "--json",
    "baseRefName,state",
    "--jq",
    'select(.state == "OPEN") | .baseRefName',
  ]);
  return `origin/${prBase || "main"}`;
};

let failed = false;
for (const { branch, sha } of pushed) {
  if (branch === "main") continue;
  const base = baseFor(branch);
  const check = spawnSync(
    "node",
    [resolve(root, "scripts/check-pr.mjs"), base, sha],
    { cwd: root, encoding: "utf8" }
  );
  if (check.status !== 0) {
    console.error(
      `pre-push: ${branch} (against ${base}):\n${check.stderr || check.stdout}`
    );
    failed = true;
  }
}

if (pushed.some(({ sha }) => sha === run("git", ["rev-parse", "HEAD"]))) {
  const ui = spawnSync("node", [resolve(root, "scripts/check-ui.mjs")], {
    cwd: root,
    encoding: "utf8",
  });
  if (ui.status !== 0) {
    console.error(`pre-push: check:ui:\n${ui.stderr || ui.stdout}`);
    failed = true;
  }
}

if (failed) {
  console.error("pre-push: fix the above, or skip once with --no-verify.");
  process.exit(1);
}
