// Pre-commit hook (.githooks/pre-commit): formats the staged files with
// Prettier and fails on ESLint errors in them. Warnings never block; the
// codebase has thousands of `curly` warnings already.
//
// A fully staged file is formatted and restaged. A file with unstaged edits
// too is only checked, so the commit never picks up those edits; format it
// and stage it again. Merge commits are skipped, so resolving a merge never
// reformats the other side's files. Skip once with `git commit --no-verify`.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bin = (name) => join(root, "node_modules/.bin", name);
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" });
const list = (text) => text.split("\0").filter(Boolean);

const gitDir = git("rev-parse", "--git-dir").trim();
if (existsSync(resolve(root, gitDir, "MERGE_HEAD"))) process.exit(0);
if (!existsSync(bin("prettier"))) {
  console.error("pre-commit: packages are not installed here; skipping.");
  process.exit(0);
}

const staged = list(
  git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z")
);
if (!staged.length) process.exit(0);
const unstaged = new Set(list(git("diff", "--name-only", "-z")));
const full = staged.filter((file) => !unstaged.has(file));
const partial = staged.filter((file) => unstaged.has(file));

let failed = false;
const prettier = (args, files) =>
  files.length
    ? spawnSync(
        bin("prettier"),
        [
          ...args,
          "--ignore-unknown",
          "--no-error-on-unmatched-pattern",
          ...files,
        ],
        { cwd: root, encoding: "utf8" }
      )
    : { status: 0, stdout: "" };

const formatted = prettier(["--list-different", "--write"], full);
const changed = formatted.stdout.split("\n").filter(Boolean);
if (changed.length) {
  git("add", "--", ...changed);
  console.error(`pre-commit: formatted ${changed.join(", ")}`);
}
if (formatted.status !== 0 && formatted.status !== 1) {
  console.error(formatted.stderr);
  failed = true;
}
const checked = prettier(["--list-different"], partial);
const unformatted = checked.stdout.split("\n").filter(Boolean);
if (unformatted.length) {
  console.error(
    `pre-commit: these files have unstaged edits and are not formatted:\n  ${unformatted.join("\n  ")}\nRun npx prettier --write on them and stage them again.`
  );
  failed = true;
}

// ESLint runs from each package so it finds that package's config.
for (const pkg of ["packages/explorEDA", "apps/demo"]) {
  const files = staged
    .filter(
      (file) =>
        file.startsWith(`${pkg}/`) &&
        /\.(ts|tsx)$/.test(file) &&
        !file.includes("/dist/")
    )
    .map((file) => relative(join(root, pkg), join(root, file)));
  const eslint = join(root, pkg, "node_modules/.bin/eslint");
  if (!files.length || !existsSync(eslint)) continue;
  const linted = spawnSync(eslint, ["--quiet", ...files], {
    cwd: join(root, pkg),
    encoding: "utf8",
  });
  if (linted.status !== 0) {
    console.error(`pre-commit: ESLint errors in ${pkg}:\n${linted.stdout}`);
    failed = true;
  }
}

if (failed) {
  console.error("pre-commit: fix the above, or skip once with --no-verify.");
  process.exit(1);
}
