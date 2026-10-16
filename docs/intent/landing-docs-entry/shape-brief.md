---
title: "Landing and docs entry paths — shape brief"
slug: "landing-docs-entry"
phase: shape
status: current
last_updated: "2026-10-15"
---

# Landing and docs entry paths — what we are adding

**Outcome:** A visitor can see every way to run explorEDA today. Each route leads to a walkthrough that we have run step by step.

**Primary flow:** The visitor sees linked charts on the landing page, then chooses a file, an example, or `npx exploreda`. Below that are links to the local project, database, notebook, team server, and React paths. Each lands on a docs page that opens with a walkthrough ending in a visible result.

## Feature scope

```text
Landing and docs entry
├── PLANNED ADDITIONS
│   ├── Accurate claims
│   │   ├── Database safety wording scoped per driver (SQL Server rolls back, it is not read-only)
│   │   ├── Team-server network wording names database connections, not only downloads
│   │   ├── Seed wording: sample accounts are temporary, copied project files stay on disk
│   │   ├── Docs home stops promising a live example on every page
│   │   └── Current-status pointers on the stale notebook and database intent briefs
│   ├── Landing page
│   │   ├── Hero: "explore data" headline · Open a file · Try an example · copyable `npx exploreda`
│   │   ├── Workflow section below the live demo: local project, database snapshots,
│   │   │   notebook, team server, React. Each card names where it runs.
│   │   ├── Developer section holds the React install (moved out of the hero)
│   │   └── Closing routes and footer describe the product, not only "a React workspace"
│   ├── Docs home
│   │   └── "Choose your path" replaces React / tour / examples as the first block;
│   │       the chart chooser and catalogue stay below it
│   ├── Walkthroughs at the top of existing pages (reference keeps its place below)
│   │   ├── Project folders: run the shop example → open an analysis → change it → save → reopen
│   │   ├── Database sources: run the SQLite example → Read all → chart → Refresh
│   │   ├── Notebooks: run the forecast example → edit text and a chart → see the file change → reopen
│   │   └── Team server: try it with seed accounts → sign in as author and viewer → persistent Compose setup
│   ├── `npx exploreda --example forecast` so the notebook walkthrough has a one-line start
│   └── Redesign of the landing page and docs home after the content settles
└── LATER POSSIBILITIES
    └── File and React walkthroughs · landing proof strip · search tuning · runtime-orientation page
```

## Behavior

| Situation                                       | Expected result                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| A walkthrough step fails when run from main     | Fix the product (patch changeset) or change the step. The route does not promise that step until it passes. |
| A visitor copies `npx exploreda` from the hero  | Copies the command. The link beside it goes to the Project folders walkthrough.                             |
| A visitor opens a workflow card                 | Lands on the page anchor where that walkthrough starts, not the page top or a reference section             |
| The docs describe features newer than npm 0.2.0 | Allowed. Each PR carries its changeset, and the public site catches up at the next release.                 |
| A notebook chart selection                      | The copy says selections stay within each chart. No claim of linked dashboards.                             |

## Decisions and boundaries

**Appetite:** Six stacked PRs on PR #430. Docs and landing work plus small product fixes that the walkthroughs turn up. No new demo system, datasets, or navigation structure.

**Key decision:** Run the four tasks before writing any route copy. The research traced claims through code but never ran a task. A five-minute run of each path decides what the landing page can promote and which product fixes come first. Copy written before that check would have to be rewritten.

**Key decision:** Add `--example forecast` instead of telling notebook readers to clone the repo. Today the notebook page sends them to a repository path. One CLI option makes the notebook path as easy to start as the shop and database paths. It is the only planned library change, so it gets a `minor` changeset.

**Key decision:** Redesign last. The redesign builds on decided copy and routes, so it changes how the page looks, not what it says. That keeps the redesign PR reviewable from screenshots alone.

**Boundary:** Existing URLs, MDX, generated reference, the chart chooser, the sidebar groups, and the order-book example stay. The walkthroughs run from source on local fixtures: SQLite, the forecast and shop examples, seed accounts, and a source-built Docker image. No live deployment or real database credentials. Each PR reverts independently, because content and the redesign are separate PRs.

**First proof:** **Try:** run the local-folder, database, notebook, and team-server tasks from main with the bundled examples, step by step, as the docs describe them today. **Observe:** pass or fail for each step, with the exact failing step and output. **Decide:** a path that passes gets its route and walkthrough as planned. A failing step gets a fix in the walkthrough's milestone, or its route links the docs without a walkthrough promise until it passes.

Builds on the [intent brief](intent-brief.md). Order and verification are in the [implementation plan](implementation-plan.md).
