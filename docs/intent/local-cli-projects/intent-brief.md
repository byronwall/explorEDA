---
title: "Local CLI projects with npx exploreda"
slug: "local-cli-projects"
phase: shape
status: current
last_updated: "2026-10-12"
---

# Local CLI projects with npx exploreda

## My read

You want explorEDA to work like Jupyter for exploratory analysis. Run `npx exploreda` in a folder and that folder becomes a project. The project holds its sources and joins, plus one dashboard-text (`.eda`) file per analysis, like notebooks in a repo. A global config holds preferences shared across projects.

The command starts a local server and opens the standalone app in the browser. There is no sign-in: the local user is the only user. This is the first mode to build, and the goal is a **public launch**, so install, first run, docs, and the file format must be good enough to announce.

## What matters most

- One command in any folder opens that folder as a project.
- The whole project is readable text: sources, joins, and analyses. It is stable to diff and commit.
- Reopening restores charts, fields, filters, calculations, and every view exactly.
- The demo can open the same project folder.

## The experience you appear to want

An analyst runs `npx exploreda` in a repo with some CSVs. The browser opens on the folder's data files, and nothing is written yet. They join orders to customers and build an analysis, which autosaves as an `.eda` file. A teammate pulls the repo, and the open app reloads because it watches the files.

## First release

- Open a folder as a project; read CSV and JSON in place, up to about 100 MB.
- Sources, relationships, and query steps written as text, so joins across files work.
- One `.eda` per analysis, on the DSL v2 syntax.
- Project config visible at the root by default; `--hidden` puts it in `.exploreda/`.
- Relative paths by default; absolute paths allowed and flagged as not portable.
- Debounced autosave; outside edits reload the app.
- Undo history in memory only. It is acceptable to lose it when the CLI stops; this will be judged in use.
- Global config across projects.
- Launch bar: tested on Mac, Linux, and Windows; a docs page and README quickstart; an example project; and project folders in the demo.

**Next:** database sources, on [database adapters](../database-adapters/intent-brief.md). **Later:** the notebook view and static HTML export.

## Boundaries

### Must be true

- Ships as a bin in the `exploreda` package, so `npx exploreda` works.
- The server listens only on the local machine.
- Builds on the [DSL v2 rewrite](https://github.com/byronwall/explorEDA/pull/334) after it merges, without changing its syntax.

### Must be avoided

- No accounts, database, Docker, or export requirement.
- Server code must not weigh down apps that only use the component.
- Never write outside the project folder and the global config location.

## What seems settled

- Analyses are DSL v2 `.eda` text; sources and joins get a text form too.
- Autosave, and the disk wins on outside edits.
- No export and no notebook view in the first release.

## Current reality that matters

The `exploreda` package already ships one bin, `exploreda-dsl`, which checks dashboard text against data. It has no server. The DSL v2 stack (#334→#360) is about to merge. It makes dashboard text round-trip exactly, with a `set` escape hatch, but its `source` line holds only a name. Project text for sources, relationships, and queries now exists in `exploreda/analysis` (`exportProjectText`, `compileProjectText`).

## Next step after confirmation

The first proof passed ([results](raw/proof/results.md)): sources, joins, and queries are project text. Next is the implementation plan.
