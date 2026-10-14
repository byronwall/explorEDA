---
title: "Check releases, not every pull request"
slug: "release-gated-checks"
phase: intent
status: draft
last_updated: "2026-10-13"
---

# Check releases, not every pull request

## My read

The full check suite runs on every pull request, and with many stacked PRs open at once that has become noise: runs to wait on, cancelled duplicates, and timing flakes to chase on branches that are fine. You want the expensive verification to sit in front of the thing users receive, the npm release, and you accept that `main` can be broken for a while between releases. The outcome is fewer per-PR checks to wait on and fix, with a release that still cannot ship broken.

This is about where verification happens, not about checking less overall. A broken `main` is acceptable; a broken published package is not.

## What matters most

- Nothing broken reaches npm or the team server image.
- Stacked PRs merge without waiting on, or repairing, per-PR CI.
- When a release is blocked, it is obvious what broke and where to fix it.

## The experience or behavior you appear to want

You merge PRs as they are ready, including whole stacks, without a CI gate on each one. Agents still run their local checks (`pnpm check`, the pre-commit hook) while working. When you decide to release, the release path runs the full suite against `main` as it stands. If it fails, the release stops and says why; you fix `main` and try again.

## Boundaries

### Must be true

- Publishing to npm and pushing the GHCR image only happen after the full suite passes on the exact commit being released.
- A blocked release names the failing check.

### Must be avoided

- A release that skips checks because none ran on its PR.
- Per-PR checks that keep demanding fixes on branches that are about to merge anyway.

## What seems settled

- Some breakage on `main` is acceptable (your words, 2026-10-12).
- Checks belong on the release path.

## Possibilities, not decisions

- Keep a few cheap PR checks, such as the changeset and author check, and drop only `pnpm check` and the docs browser check.
- Run the full suite on a schedule or on push to `main`, as information rather than a gate.
- Run the suite inside the release workflow before the Changesets step, instead of on the Version Packages PR.

## Current reality that matters

- **PR checks today.** CI (`check:pr`, `pnpm check`, `docs:verify`) runs on every PR. CLI smoke and team server smoke run on PRs that touch the package or app. That was about 165 PR runs from Oct 11 to 13.
- **The release is already partly gated.** The Changesets action publishes with `pnpm run release`, which runs `pnpm check` before `changeset publish`. The docs browser check and the smokes don't run there.
- **The Version Packages PR gets no checks.** The Changesets action opens it with `GITHUB_TOKEN`, and GitHub doesn't start `pull_request` workflows for PRs opened that way. Checks on "the release PR" therefore need a different trigger, or have to live in the release workflow itself.
- **The docs site deploys from `main`.** The Pages deploy runs on every push to `main` and runs the build, the demo tests, and `docs:verify` first, so a broken `main` holds the site at its last good version.
- **Local guardrails now exist.** The pre-commit hook formats staged files and blocks ESLint errors, and AGENTS.md still asks agents to run `pnpm check` before a PR.

## What still needs your input

1. Does the public docs site count as "released"? It deploys from `main` today, so it would either keep its own gate or follow `main`'s breakage.
2. Should any check stay on PRs, such as the changeset and author check, which takes seconds and catches mistakes that are hard to fix after merge?
3. Should agents keep running `pnpm check` before opening each PR, or only when you ask?

## Next step after confirmation

Shape it: pick where the full suite runs in the release path, given that the Version Packages PR gets no `pull_request` runs, and decide what, if anything, stays on PRs.
