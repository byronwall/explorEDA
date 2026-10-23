---
name: research-triage
description: Triage, act on, slim, and merge explorEDA's open ChatGPT Pro research PRs (the `codex/*-research-*` branches a Codex automation opens). Use when Byron asks which research PRs are worth acting on, to process or retire research PRs, to fix what the research found, or to merge the research backlog.
---

# Research PR triage

A research PR is docs-only, but it often hides reproduced defects under "repair remains proposed" wording and buries the useful reasoning under Pro originals and receipts. Byron's goal for these runs is serious feature work, not timid fixes or docs nits ([DIRECTION.md](../../../docs/research/DIRECTION.md)). Run the whole loop below without asking him to name the next step.

## 1. Audit (read-only)

For each open research PR, `gh pr view <n> --json headRefName,files`, then read its `README.md`, `decisions.md` and `evidence.md` with `git show origin/<branch>:<path>`. Don't check out research branches in the main checkout: a Codex automation works there every 6 hours.

Search for "Investigate bounded repair", "reproduces", "source confirms", and executed local probes (`*probe*.test.ts(x)`, `local-results.json`). Report per PR:

- **Defects:** labelled Reproduced (a probe ran) or Source-confirmed (exact inputs, expected and actual, never run). Name the file and symbol, the inputs, and the docs page the fix touches. Check each one against current `origin/main` and drop the ones already fixed.
- **Feature material:** shelved design proposals, two or three lines each. These matter most.
- **Verdict:** Fix, Feature, or Record.

Skip wording nits, demand gates, and "keep current" conclusions. Cover every open research PR, not only the newest batch, and say how many were audited.

## 2. Act

- **Fix:** group defects into tasks that touch disjoint files, then start one worker session per task, each in its own worktree. The brief names the PR and research IDs, the branch, the files to read with `git show`, the failing case, the intended behavior, and the docs page. Tell the worker to port the probe into a package test that fails first, add a changeset, and open its own PR against `main`.
- **Feature:** turn the material into an initiative under `docs/intent/` or an entry in DIRECTION.md's candidate directions, and tell Byron which feature it would unlock.
- **Record:** nothing to do beyond slimming.

## 3. Slim and merge

One session, in its own worktree, oldest PR first. On each head branch:

1. Keep the summary or README, `decisions.md`, `evidence.md`, `research-queue.md`, `run.md`, the prompt, local probe tests with their small JSON results, and edits to `docs/intent/**`.
2. Delete the bulk: `*.zip`, `originals/`, `raw/` (including vendored source), and the receipt and integrity JSON (`source-*.json`, `embedded-integrity.json`, `authored-links.json`, `collection.json`, `validation.json`, `*-audit.json`, `*-checks.json`).
3. Point links to deleted files at the Pro conversation URL, or drop them. Revert `.prettierignore` lines that only covered deleted files.
4. Commit "Slim research record to its decisions and probes", push, and add to the PR body: "Slimmed before merge: Pro originals, archives and integrity receipts removed; the Pro conversation link remains the source."
5. Merge with `--merge`, then bring the next PR up to date with `main`. Conflicts are usually in `docs/intent/current-analysis-trust/*` and `docs/intent/research-ideas-100/*`; keep every PR's additions, in date order.

Research PRs are docs-only, so skip changesets. Keep every research branch until all fix workers are merged, since they read from it.

## 4. Report

List each research PR's verdict, the fix PRs with their CI state, the feature material and where it now lives, and anything left unreproduced that you chose to drop.
