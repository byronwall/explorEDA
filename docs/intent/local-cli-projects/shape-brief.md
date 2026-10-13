---
title: "Local CLI projects with npx exploreda — shape brief"
slug: "local-cli-projects"
phase: shape
status: draft
last_updated: "2026-10-12"
---

# Local CLI projects — what we are adding

**Outcome:** `npx exploreda` turns any folder into an explorEDA project whose sources, joins, and analyses are readable text files that you can commit.

**Primary flow:** run `npx exploreda` in a folder → the browser opens on its data files → build an analysis → it autosaves as `.eda` text → commit, pull, and the open app reloads.

## Feature scope

```text
npx exploreda
├── PLANNED ADDITIONS
│   ├── Command: `exploreda` bin in the exploreda package
│   │   ├── starts a local server on 127.0.0.1 and opens the browser
│   │   ├── `--hidden` keeps project config in .exploreda/
│   │   └── `--example` opens a bundled sample project
│   ├── Project folder (format shared with the demo)
│   │   ├── project text: sources with paths, relationships, queries
│   │   ├── one .eda per analysis: views, charts, fields, filters, calcs
│   │   ├── visible by default: exploreda.eda at the root
│   │   └── --hidden: .exploreda/project.eda; analysis files stay visible
│   ├── Data: CSV and JSON read in place, up to about 100 MB
│   │   ├── relative paths by default; absolute paths allowed and flagged
│   │   └── joins across files through the project's relationships
│   ├── Saving: debounced autosave of every change
│   │   └── undo history in memory only, lost when the CLI stops
│   ├── File watching: outside edits reload the app with a notice
│   ├── Global config at ~/.config/exploreda (preferences only)
│   └── Demo opens the same project folder (File System Access, Chromium)
├── EVALUATE BEFORE COMMITTING
│   └── Undo surviving a restart, if losing it feels bad in use
└── LATER POSSIBILITIES
    ├── Database sources (database-adapters)
    ├── Notebook view (notebook-analysis)
    └── Static HTML export
```

## Behavior

| Situation | Expected result |
| --- | --- |
| First run in a folder with no project | The app lists the data files. Nothing is written until the first save, which creates the project file. |
| A source path names a missing file | The analysis opens with that source marked missing and a fix suggestion. Other sources still load. |
| The same source name appears in the project and in an `.eda` | The project's definition wins. |
| An analysis uses an absolute path | It works, and the app labels the analysis as not portable. |
| An `.eda` changes on disk while open | The app reloads from disk and shows a notice. In-memory undo can step back. |
| A state has no text form yet | Export writes `set path=value`, `check` reports the gap, and nothing is lost. |
| A write would land outside the project or the global config | It is refused. |

## Examples

Proposed project text, not final syntax. It extends DSL v2:

```text
# exploreda.eda
source @orders    path=data/orders.csv    key=orderId
source @customers path=data/customers.csv key=customerId
relate orders.customerId -> customers.customerId
query @order-lines from=orders {
  lookup customers on=customerId fields=name,region
}

# revenue.eda
eda query=order-lines
metric @amount sum(orders.amount) title="Order amount"
hist   customers.region title="Amount by region"
```

## Decisions and boundaries

**Appetite:** A launch-quality CLI for local file projects. It includes the cross-platform smoke run, a docs page with a README quickstart, an example project, and project folders in the demo. DSL v2 (#334→#360) merges first. This work builds on it and does not change its syntax.

**Key decision:** Sources, relationships, and queries get a text form, so the whole project is reviewable text. This is the largest new piece and the main risk. Proving it first, against the existing `AnalysisProject` model, keeps it from stalling the server and launch work. The `exploreda-project` JSON stays the import and export format. It is not stored in the folder.

**Boundary:** No accounts, database, Docker, or export. The server binds to localhost only. Server code ships in its own bin build, so component users don't load it. Disable the feature by not running the bin; the component and the demo are unchanged without a project folder.

**First proof:** Passed on 2026-10-12; see [the results](raw/proof/results.md). Every demo project round-trips exactly with no `set` lines, and a cold agent's draft compiled cleanly and matched the demo's rows. **Try:** Write the project grammar for sources, relationships, and all six query step types. Round-trip every multi-source demo example through `AnalysisProject` → text → `AnalysisProject`, and have a cold agent write the multi-source shop project from the reference. **Observe:** Whether the round trips are exact, how many query steps need `set`, and whether the agent's draft passes `check`. **Decide:** If every example round-trips and `set` covers under 5% of query lines, build the folder format on this text. Otherwise launch with a project JSON file for sources and joins, and move the text form below the cut line.

See the [intent brief](intent-brief.md) and the [runtime modes program](../runtime-modes/intent-brief.md).
