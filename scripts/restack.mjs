// Brings a stack of pull requests up to date with main: merges main into the
// bottom branch, then each branch into the one above it, in a scratch
// worktree under tmp/restack. Stops at the first conflict so you can resolve
// it there, then resumes with --continue. Pushes are fast-forwards, never
// force. Works from any checkout; your own branch is untouched.
//
// Usage: pnpm restack <pr-number|branch> [options]
//   Any PR or branch in the stack; the script walks down to the PR based on
//   main and up through the PRs based on each head.
//   --continue        resume after resolving a conflict (git add, git commit
//                     --no-edit in tmp/restack, then rerun with --continue)
//   --no-verify       skip the check at the top of the stack
//   --verify <cmd>    check to run at the top (default: install, then
//                     pnpm --filter exploreda check-types)
//   --no-push         stop before pushing; prints what it would push
//   --merge           after pushing, merge the PRs bottom-up into main
//   --abort           drop the restack worktree and its state
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const work = join(root, "tmp/restack");
const statePath = join(root, "tmp/restack.json");

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    continue: { type: "boolean" },
    "no-verify": { type: "boolean" },
    verify: { type: "string" },
    "no-push": { type: "boolean" },
    merge: { type: "boolean" },
    abort: { type: "boolean" },
  },
});

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
const git = (args, cwd = work) => run("git", args, { cwd });
const tryGit = (args, cwd = work) =>
  spawnSync("git", args, { cwd, encoding: "utf8" });
const say = (line) => console.log(line);
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const removeWorktree = () => {
  if (existsSync(work)) tryGit(["worktree", "remove", "--force", work], root);
  rmSync(work, { recursive: true, force: true });
  tryGit(["worktree", "prune"], root);
};

if (values.abort) {
  removeWorktree();
  rmSync(statePath, { force: true });
  say("Dropped the restack worktree and state.");
  process.exit(0);
}

const openPrs = () =>
  JSON.parse(
    run("gh", [
      "pr",
      "list",
      "--state",
      "open",
      "--limit",
      "200",
      "--json",
      "number,headRefName,baseRefName,title",
    ])
  );

/** The stack, bottom (based on main) first. */
const findStack = (target) => {
  const prs = openPrs();
  const main = run("gh", [
    "repo",
    "view",
    "--json",
    "defaultBranchRef",
    "-q",
    ".defaultBranchRef.name",
  ]);
  let current = prs.find((pr) =>
    /^\d+$/.test(target)
      ? pr.number === Number(target)
      : pr.headRefName === target
  );
  if (!current) fail(`No open PR for "${target}".`);
  const seen = new Set();
  while (current.baseRefName !== main) {
    if (seen.has(current.number)) fail("The PR bases form a loop.");
    seen.add(current.number);
    const below = prs.find((pr) => pr.headRefName === current.baseRefName);
    if (!below)
      fail(
        `#${current.number} is based on ${current.baseRefName}, which has no open PR and is not ${main}.`
      );
    current = below;
  }
  const stack = [current];
  for (;;) {
    const above = prs.filter(
      (pr) => pr.baseRefName === stack.at(-1).headRefName
    );
    if (above.length === 0) break;
    if (above.length > 1)
      fail(
        `${stack.at(-1).headRefName} has several PRs on top (${above
          .map((pr) => `#${pr.number}`)
          .join(", ")}); restack each branch of the fork separately.`
      );
    stack.push(above[0]);
  }
  return { main, stack };
};

const conflictReport = (branch) => {
  const files = git(["diff", "--name-only", "--diff-filter=U"]);
  say(`\nConflict while updating ${branch}. Files:\n${files}`);
  say(
    "git rerere may have filled in a resolution recorded earlier; review every file before committing."
  );
  say(
    `\nResolve them in ${work}, then:\n  git -C ${work} add -A && git -C ${work} commit --no-edit\n  pnpm restack --continue`
  );
  process.exit(2);
};

let state;
if (values.continue) {
  if (!existsSync(statePath)) fail("Nothing to continue.");
  state = JSON.parse(readFileSync(statePath, "utf8"));
  if (tryGit(["rev-parse", "-q", "--verify", "MERGE_HEAD"]).status === 0)
    fail(
      `A merge is still in progress in ${work}. Commit it first: git -C ${work} commit --no-edit`
    );
  if (state.next >= state.stack.length)
    fail("Every branch is merged already. Use --abort and start again.");
  state.results[state.stack[state.next].headRefName] = git([
    "rev-parse",
    "HEAD",
  ]);
  state.next += 1;
} else {
  const target = positionals[0];
  if (!target) fail("Usage: pnpm restack <pr-number|branch> [options]");
  if (existsSync(statePath))
    fail(
      "A restack is already in progress. Use --continue, or --abort to drop it."
    );
  const { main, stack } = findStack(target);
  say(
    `Stack: ${main} <- ${stack.map((pr) => `#${pr.number} ${pr.headRefName}`).join(" <- ")}`
  );
  run("git", [
    "fetch",
    "-q",
    "origin",
    main,
    ...stack.map((pr) => pr.headRefName),
  ]);
  removeWorktree();
  git(["worktree", "add", "-q", "--detach", work, `origin/${main}`], root);
  state = { main, stack, next: 0, results: {}, original: {} };
  for (const pr of stack)
    state.original[pr.headRefName] = git([
      "rev-parse",
      `origin/${pr.headRefName}`,
    ]);
}
const save = () => writeFileSync(statePath, JSON.stringify(state, null, 2));

for (; state.next < state.stack.length; state.next += 1) {
  save();
  const { headRefName: branch, number } = state.stack[state.next];
  const parent =
    state.next === 0
      ? `origin/${state.main}`
      : state.results[state.stack[state.next - 1].headRefName];
  git(["checkout", "-q", "--detach", state.original[branch]]);
  const merged = tryGit([
    "merge",
    "--no-edit",
    "-m",
    `Merge ${state.next === 0 ? state.main : state.stack[state.next - 1].headRefName} into ${branch}`,
    parent,
  ]);
  if (merged.status !== 0) {
    save();
    conflictReport(`#${number} ${branch}`);
  }
  state.results[branch] = git(["rev-parse", "HEAD"]);
  const changed = state.results[branch] !== state.original[branch];
  say(`#${number} ${branch}: ${changed ? "updated" : "already up to date"}`);
}
save();

if (!values["no-verify"]) {
  const command =
    values.verify ??
    "pnpm install --frozen-lockfile --prefer-offline --silent && pnpm --filter exploreda check-types";
  say(`\nChecking the top of the stack: ${command}`);
  const checked = spawnSync(command, {
    cwd: work,
    shell: true,
    stdio: "inherit",
  });
  if (checked.status !== 0) {
    say(
      `\nThe check failed at the top of the stack. Git found no conflict, so this is a semantic one. Nothing was pushed; the merged branches are in ${work}. Fix it on the lowest branch that introduces it, push that fix, then run pnpm restack --abort and pnpm restack ${state.stack[0].number} again.`
    );
    process.exit(3);
  }
}

const updates = state.stack.filter(
  (pr) => state.results[pr.headRefName] !== state.original[pr.headRefName]
);
if (values["no-push"]) {
  say(
    updates.length
      ? `\nWould push (fast-forward):\n${updates
          .map(
            (pr) =>
              `  ${state.results[pr.headRefName].slice(0, 9)} -> ${pr.headRefName}`
          )
          .join("\n")}`
      : "\nNothing to push."
  );
  say(`The merged stack stays in ${work}; pnpm restack --abort removes it.`);
  rmSync(statePath, { force: true });
  process.exit(0);
}
if (updates.length) {
  run("git", [
    "push",
    "-q",
    "origin",
    ...updates.map(
      (pr) => `${state.results[pr.headRefName]}:refs/heads/${pr.headRefName}`
    ),
  ]);
  say(`\nPushed ${updates.map((pr) => `#${pr.number}`).join(", ")}.`);
} else say("\nEvery branch was already up to date; nothing pushed.");

removeWorktree();
rmSync(statePath, { force: true });

if (values.merge) {
  for (const [index, pr] of state.stack.entries()) {
    if (index > 0)
      run("gh", ["pr", "edit", String(pr.number), "--base", state.main]);
    run("gh", ["pr", "merge", String(pr.number), "--merge"]);
    say(`Merged #${pr.number} into ${state.main}.`);
  }
}
