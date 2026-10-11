// Checks a branch against its base before it merges:
// - a change to what exploreda users get carries a changeset;
// - every commit has a real author (not a flag such as "--worktree").
// Usage: pnpm check:pr [base]   (default base: origin/main)
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const base = process.argv[2] ?? process.env.PR_BASE ?? "origin/main";
const mergeBase = git("merge-base", base, "HEAD");
const failures = [];

const changed = git(
  "diff",
  "--name-only",
  "--diff-filter=ACMRD",
  mergeBase,
  "HEAD"
)
  .split("\n")
  .filter(Boolean);
const packageChanges = changed.filter(
  (path) =>
    path.startsWith("packages/explorEDA/") &&
    !/(\.test\.[jt]sx?|__tests__\/|\/test\/)/.test(path)
);
const changesets = changed.filter(
  (path) => /^\.changeset\/.+\.md$/.test(path) && !path.endsWith("README.md")
);
if (packageChanges.length && !changesets.length) {
  failures.push(
    `This branch changes the exploreda package but adds no changeset:\n` +
      packageChanges.map((path) => `  ${path}`).join("\n") +
      `\nRun: pnpm changeset:add <patch|minor> "What package users can now do."`
  );
}

// Commits authored before the bad "--worktree" identity was fixed are mapped
// in .mailmap instead; only later commits must carry a real author.
const authorCheckFrom = "2026-10-11";
const badAuthors = git(
  "log",
  "--date=short",
  "--format=%ad %h %an <%ae>",
  `${mergeBase}..HEAD`
)
  .split("\n")
  .filter(Boolean)
  .filter((line) => line.slice(0, 10) >= authorCheckFrom)
  .map((line) => line.slice(11))
  .filter((line) => {
    const [, name, email] = line.match(/^\S+ (.*) <(.*)>$/) ?? [];
    return (
      !name || name.startsWith("-") || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    );
  });
if (badAuthors.length) {
  failures.push(
    `These commits have an invalid author:\n` +
      badAuthors.map((line) => `  ${line}`).join("\n") +
      `\nCheck \`git config --show-origin user.name\`, then fix them with ` +
      `\`git rebase --exec 'git commit --amend --no-edit --reset-author' ${mergeBase}\`.`
  );
}

if (failures.length) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}
console.log("PR checks pass: changeset and commit authors.");
