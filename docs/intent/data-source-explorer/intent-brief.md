---
title: "Explore a data source from the project rail"
slug: "data-source-explorer"
phase: intent
status: draft
last_updated: "2026-11-27"
---

# Explore a data source from the project rail

## My read

In the project app, the Data section of the left rail lists each source by name and row count. Nothing happens on a click. On the TASK-0091 CI project (14 tables, 9 to 21,813 rows), Byron called this section "begging for a drill in and an explorer", and asked to "click on this and do like a data explorer of some sort".

The durable outcome: a source row is a door, not a label. One click on "Runs · 9,091 rows" should answer "what is in this table, and is it what I think it is?" before Byron commits to an analysis. Today the only way into a table's contents is to chart it, which writes a new `.eda` file, or to open the Schema diagram, which shows every table at once.

"Data explorer" is Byron's phrase, not a design. It could mean a profile, a row browser, a scratch workspace, or key-following drill-down across tables. Which one is the main open question.

## What matters most

- A click on a source opens something useful at once, with no setup and no new file.
- The first view answers the questions you ask of a table you did not write: which columns, what values, how many missing, what time span, what the rows look like.
- A path from "I see something" to a saved analysis or notebook block, without starting over.

## The experience you appear to want

Byron opens the CI project. He clicks Runs. The main pane shows Runs: 13 columns, `repo` with 11 values (srcly has 3,815 runs), `result` with 6 values (847 failures, 818 cancelled), `created` from 29 Sep to 27 Nov, and `attempt` 1 for 8,527 runs. He clicks `failure`, and the view narrows to the 847 failed runs. He sees which repositories and workflows they come from and reads a few rows. If the view is worth keeping, he saves it as an analysis.

## Boundaries

### Must be true

- Opening a source never writes a file and never queries a database. Database sources read their snapshot.
- The explorer uses the same fields, types, and labels as the analyses, so the two never disagree.
- It works at 21,813 rows (Steps) without a noticeable wait.

### Must be avoided

- A second grid or profile engine beside the workspace's Summary and Rows.
- Layout changes in the rail itself. W1 owns the rail layout.
- Redrawing the Schema diagram. W5 owns it.

## What seems settled

- The trigger is a click on a Data row in the project app rail.
- This is the project app (`apps/app`), not the demo.

## Possibilities, not decisions

- Reuse the workspace's unsaved start: Summary plus a source table, which `ExplorEda` already shows for data with no saved state.
- Show which analyses and notebooks read the source.
- Follow keys from one table to another: a run's `run_id` to its jobs, then to their steps. The CI project has 0 declared relationships, so this needs drafted links first.
- Open the source in the Schema diagram with it focused (`schemaFocus` exists).

## Current reality that matters

- `ProjectWorkspace.tsx` renders Data rows as plain list items. Analyses and notebooks are buttons that set `selected`.
- `ExplorEdaProject` takes an in-memory `view` and `queryPresets`, so an unsaved view over one source is cheap.
- Profiles, the Summary view, Rows mode, the Fields list, and the field inspector exist in the package.
- 11 of the 14 CI tables are summaries an agent derived from Runs, Jobs, and Steps. Most of the exploration value is in those three.

## What still needs your input

See the first question round.

## Next step after confirmation

Shape the chosen approach, then plan milestones.
