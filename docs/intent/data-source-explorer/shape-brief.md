---
title: "Explore a data source from the project rail"
slug: "data-source-explorer"
phase: shape
status: draft
last_updated: "2026-11-27"
---

# Shape: explore a data source

**Outcome:** you can see what a source contains before you build anything with it.
**Primary flow:** point at Runs → field summary card → click → summary beside rows → click a value → rows and summary narrow → Save as analysis.

## Feature scope

- **Hover card** (mockup A1)
  - The existing Fields summary for that source: type, distinct, missing, a small distribution, and the top value or range for each column.
  - About a third of the viewport (460×440 at 1440×900). Columns scroll inside it. No charts.
  - Header: name, row count, column count, file or connection. Footer: "Click to explore" and which analyses use the source.
  - Database sources keep the connection and read time that W1's hover shows, in the same card.
- **Explorer view** (mockups A2, A3)
  - A click on a Data row puts the explorer in the main pane, where an analysis would show. The Data row shows as current.
  - Field summary docked on the left, all rows on the right. Both are the workspace's own parts, so the numbers match analyses.
  - A value click filters: the rows narrow and the summary re-describes every column for the filtered rows. A chip in the header shows the filter and clears it.
  - Header actions: **Save as analysis** writes an `.eda` file with this view and its filter. **Show in schema** opens the Schema diagram on this source.
  - Leaving without saving discards the view. Nothing is written until Save.
- **Later possibilities**
  - Sort and search the rows from the summary (for example, show only rows where `attempt` > 1).
  - Open a related table from a key column, once relationships exist.

## Behavior

| Situation                                      | Expected result                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| Point at Steps (21,813 rows)                   | The card shows within a moment. Its profile is computed once per source and read.       |
| Click a database source that has not been read | The explorer says the source needs a read and offers Read. It never queries on its own. |
| Click `failure` in `result`                    | 847 of 9,091 rows. `repo` shows 7 values. The chip reads "result = failure".            |
| Save as analysis                               | A new `runs.eda` opens in Analyses and shows the same summary, rows, and filter.        |
| Read-only viewer on the team server            | The explorer works. Save is hidden.                                                     |

## Decisions and boundaries

- **Chosen:** mockup A. B (suggested charts) guesses which columns matter. C hides the summary. D turns the rail into an explorer, which moves the layout and squeezes the work into a narrow column. A view of every table and field belongs in its own place: the Schema diagram (W5).
- **One source only.** Multi-source scope, relationships, and which sources the dashboards cover belong to W5. The "used by" line reads W5's usage data from `schemaGraph.ts`. It does not compute a second copy.
- **No new engine.** The explorer is an unsaved view of the source's existing query: a Summary chart and a table. The docked summary is the existing Fields list in a docked layout.
- **Rail:** W1 (PR #695) owns the rail and adds a hover for database sources. This work builds on #695 after it merges and adds one click and one card. It does not change the rail layout.
- **First proof:** on the CI project, click Runs, click `failure`, and save. The proof passes when the saved analysis reopens with the same 847 rows. If the docked Fields list cannot share the workspace's filter state without a large refactor, put the summary in the existing floating panel, opened by default, and keep the same flow.
- **Appetite:** about three PRs. The hover card cost is the main unknown (see the plan's spike).
