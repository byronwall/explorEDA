---
title: "Local CLI projects with npx exploreda"
slug: "local-cli-projects"
phase: intent
status: draft
last_updated: "2026-10-12"
---

# Local CLI projects with npx exploreda

## My read

You want explorEDA to work like Jupyter for exploratory analysis. Run `npx exploreda` in a folder and that folder becomes a project. The project holds shared project information and one file per analysis, like notebooks in a repo. Run it in another folder and you get another project. A global config holds preferences shared across projects.

The command starts a local server and opens the standalone app in the browser. There is no sign-in: the local user is the only user. This is the first mode to build, and the goal is a **public launch**, so install, first run, docs, and the file format must be good enough to announce.

## What matters most

- One command in any folder opens that folder as a project.
- Analyses are files, one per analysis, readable and stable to diff and commit.
- The file format is shared with the demo, which can open the same project folder.
- Polished enough to announce publicly.

## The experience you appear to want

An analyst runs `npx exploreda` in a repo with some CSVs. The browser opens on the project, listing its data files and saved analyses. They build an analysis, and it is saved as a file in the folder. A teammate pulls the repo, and the open app refreshes because it watches the files. Later they run an export command and send a standalone HTML report.

## First release

- Open a folder as a project; read data files in place.
- One file per analysis, plus shared project info.
- **Config location is the user's choice per project:** keep it all in a hidden `.exploreda/` folder, or in visible project and workspace files.
- Project-relative paths by default; absolute paths to outside files are allowed.
- Global config across projects.
- File watching, so outside edits refresh the app.
- Static HTML export of an analysis.

**Next, not first:** database sources, built on the [database adapters](../database-adapters/intent-brief.md) work. **Later:** the notebook view from [notebook analysis](../notebook-analysis/intent-brief.md).

## Boundaries

### Must be true

- Ships as a bin in the `exploreda` package, so `npx exploreda` works.
- The server listens only on the local machine by default.
- Reopening a project restores its analyses exactly.

### Must be avoided

- No accounts, database, or Docker requirement.
- Server code must not weigh down apps that only use the component.
- Never write outside the project folder and the global config location.

## Possibilities, not decisions

- Analysis files built on dashboard text (`src/lib/dsl/`), which is already a readable text form.
- `~/.config/exploreda` as the global config location.
- Marking analyses that use absolute paths as not portable.

## Current reality that matters

The `exploreda` package is a React library with no bin, server, or Node runtime code. Its build and exports would need a separate server entry point.

## What still needs your input

- What does an analysis file contain: dashboard text only, or text plus explanatory notes?

## Next step after confirmation

Shape the project-folder format and the local server together.
