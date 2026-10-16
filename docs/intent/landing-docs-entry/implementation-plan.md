---
title: "Landing and docs entry paths — implementation plan"
slug: "landing-docs-entry"
phase: plan
status: current
last_updated: "2026-10-15"
---

# Landing and docs entry paths — implementation plan

## Plan at a glance

Six stacked PRs, each on the one before, starting from PR #430. The first one runs the four tasks before any copy changes. The research traced every claim through code, but nobody ran `npx exploreda --example database` or signed in to a seed server. Running each path from main takes minutes. It tells us which routes the landing page can promise and which product fixes have to land first.

The order follows the decisions: claims, then routes and copy, then walkthroughs, then the redesign. The routes PR links to page tops, and each walkthrough PR repoints its landing card and docs-home path to the new walkthrough anchor. Every intermediate state is shippable: true claims, findable routes, and walkthroughs that each work by themselves.

The walkthroughs go in order of setup cost. Local folder and database share the CLI and bundled SQLite. The notebook needs one small CLI option. The team server needs Docker. Only one new dependency enters at a time.

The redesign comes last. It restyles content that has already been decided, so its PR can be reviewed from screenshots, and reverting it leaves the content intact.

## Implementation strategy

- **First proof:** each of the four tasks run step by step from a source build, with the result for each step recorded.
- **Primary seam:** the docs pages and landing components. Product code changes only when a walkthrough step fails, plus the `--example forecast` option.
- **Fast local loop:** `pnpm --filter demo dev` for the landing page and docs. `pnpm --filter demo docs:check` for the gate (links, anchors, catalogue). `pnpm --filter exploreda build`, then `node <repo>/packages/explorEDA/dist/cli/exploreda.js --example <name>` from a scratchpad folder for CLI tasks, because the CLI is the path users run.
- **Local dependencies:** bundled examples (`shop`, `database` with `shop.db`, `forecast`), seed accounts from `exploreda server --seed-dev`, an image built from `docker/Dockerfile`, and `docker/demo/compose.yaml` for PostgreSQL. Docker 28 is available locally.
- **Live confirmation:** none in this initiative. exploreda.dev and npm catch up at the next Version Packages release.
- **Rollout and rollback:** each PR reverts by itself. The landing and docs changes are demo-only, so they need no changeset. `--example forecast` gets a `minor` changeset, and any walkthrough bug fix gets a `patch` changeset.

### Material dependency proof strategy

The only material external dependency is Docker, for the team server's persistent setup. The trial path (`--seed-dev`) runs without it, so the walkthrough can be proven first and Compose added after. The persistent proof uses an image built from source, because `ghcr.io/byronwall/exploreda:latest` is 0.2.0. The PR must not publish an image.

## Milestone 1: Every path has a run record and every claim is true

This milestone answers the main uncertainty before any copy changes. It changes no layout.

- **Spike — Run the four tasks from main**
  - Decision required: for each path, does the walkthrough go ahead as planned, need a product fix first, or have to promise less?
  - Evidence to gather: pass or fail for each step of the local-folder, database (SQLite), notebook (forecast example, through `EXPLOREDA_FOLDER`), and team (`--seed-dev`, author and viewer) tasks. Record the output of any step that fails.
  - Fallback: if a failure is too large to fix here, move it to its own session. That path's route links to its docs page with no walkthrough promise.
- **Change — Claim fixes**
  - `database-sources.mdx`: replace the absolute no-write claims with each driver's safeguards. SQL Server describes the query and then rolls back. Point readers to the read-only user section. Put the Node 22.16+ requirement for SQLite reads next to the SQLite steps.
  - `team-server.mdx`: say that network use covers database connections as well as author downloads, and scope "no calls home". Sample accounts are temporary; copied project files stay in the data folder.
  - `notebooks.mdx`: state that chart selections stay within each chart, and how this differs from declared global filters.
  - `components/home.tsx`: narrow the "live example on every page" promise.
- **Change — Status pointers:** add a dated current-status note to the notebook-analysis and database-adapters intent briefs. Keep their history.

### Desired end state

- The run record is in `initiative-map.json` (milestone evidence), with the pass or fail decision for each path.
- No absolute claim about writes, network, or selection scope remains without its runtime scope.
- `docs:check` passes. The PR is docs-only, with no changeset.

## Milestone 2: The landing page and docs home show every path

This milestone settles the copy and links in the current visual style. Visual change is limited to the new section.

- **Change — Landing content** (`landing/Hero.tsx`, `SiteNav.tsx`, `IntegrationGuide.tsx`, `ClosingBand.tsx`, `LandingFooter.tsx`, `LandingPage.tsx`)
  - Hero: a broader "data" headline, Open a file, Try an example, and a copyable `npx exploreda` that links to Project folders. Keep the resume action.
  - New workflow section after `FeaturedExample`, with five cards: local project, database snapshots, notebook, team server, React. Each card has one line on where it runs.
  - The React install moves into the developer section. The closing band and footer get routes beyond React.
  - Update `LandingPage.test.tsx` for the new actions.
- **Change — Docs home:** a "Choose your path" block with the same five routes, above the chart chooser and catalogue.
- **Change — Cards follow M1:** a path that failed in M1 links to its page without promising a walkthrough.

### Desired end state

- Screenshots at 1280, 783, and 390 px of the hero, the workflow section, and the docs home (`pnpm shot / --name landing`, `pnpm shot /docs --name docs-home`).
- Every new link resolves, and the docs gate passes.

## Milestone 3: Local-folder and database walkthroughs work as written

- **Change — Project folders:** a walkthrough at the top of the page: `npx exploreda --example`, open an analysis, change a chart, save, restart the CLI, and see the change kept. Reference sections stay below.
- **Change — Database sources:** prerequisites (Node 22.16+), then `--example database`, Read all, the chart, the read time, and Refresh. After that come connection tasks and driver reference.
- **Change — Fixes:** any failing step from M1 on these paths, with tests and a `patch` changeset.
- **Change — Routes:** the landing cards and docs-home paths point to the walkthrough anchors.

### Desired end state

- Both walkthroughs run step by step from a fresh scratch folder, with each step recorded.
- `node scripts/app-shot.mjs` screenshots of the read/refresh state and the saved analysis appear in the PR.

## Milestone 4: A notebook starts in one command

- **Change — CLI:** add `forecast` to `EXAMPLES` in `cli/exploreda.ts`, copying to `exploreda-example-forecast`, and update the usage text. Add a CLI test. Write a `minor` changeset.
- **Change — Notebooks page:** a walkthrough at the top: `npx exploreda --example forecast`, open the notebook, edit a paragraph and a chart in the app, see `forecast.eda.md` change on disk, and reopen. Grammar and the `check` command go below.
- **Change — Routes:** repoint the landing card and docs-home path.

### Desired end state

- The walkthrough runs from a fresh folder, and the file diff from the chart edit is shown in the PR.
- The CLI test and `check-types` pass.

## Milestone 5: Try a team server, then keep one running

- **Change — Team server page:** two walkthroughs before operations.
  - Try it: `exploreda server --seed-dev`, sign in as an author and edit, sign in as a viewer and see the change, read-only. Data disappears on restart, except copied project files.
  - Keep it: Compose with a named volume, create the first administrator, add a person with a password link, restart, and see everything kept. Backup, upgrade, and roles go below.
- **Change — Fixes:** any failing step from M1, with a `patch` changeset.
- **Change — Routes:** repoint the landing card and docs-home path.

### Desired end state

- Both runs are recorded. The Compose run uses an image built locally from `docker/Dockerfile`, and survives `docker compose restart`.
- `pnpm team-shot` screenshots of the author and viewer views appear in the PR.

## Milestone 6: Redesigned landing page and docs home

- **Change — Redesign:** run `/10x`, then `/100x`, on the landing page and the docs-home entry, under `byron-ui-taste` and `docs/ui-defaults.md`. The content and routes from M2–M5 stay fixed. The live order book remains the first demo.
- **Change — Checks:** `pnpm check:ui`, the landing tests, `docs:verify` for narrow overflow, and a browser check at three widths.

### Desired end state

- Before and after screenshots at 1280, 783, and 390 px appear in the PR. There is no stop to approve a design comp.
- Reverting this PR restores the M5 layout with the same content.
- `pnpm check` passes once, before the PR opens.

## Cross-cutting verification

Each walkthrough PR records each step it ran in the initiative map. The last PR runs `pnpm check`. Earlier PRs run targeted tests and `docs:check`.

## Below the cut line

- File and React walkthroughs, and a landing strip of proof screenshots.
- Search-metadata tuning, a runtime-orientation page, sidebar restructure.
- Replacing the order-book example, new demo datasets.
- A PostgreSQL walkthrough. `docker/demo` stays a linked option.
- Publishing a release or image, managed hosting, SSO, new adapters.
