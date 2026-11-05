# Database eval: causes, target, and choices

This follows the [eval report](README.md). The report says what the agents hit. This page says why, from the code, then describes the best database experience we can picture, measures the gap stage by stage, and compares the main ways to close it. Every finding is a work item under **Database UX eval 2026-11** in Product Grid (`pnpm -s pgm node list --search "Database UX eval"`).

## What went wrong

Six causes explain almost every finding. The first two explain most of the time lost.

### 1. explorEDA's join model is in the product, but the app hides it

explorEDA has a real model for combining tables: `relate` declares a link, and a query's `lookup` step brings fields from a related table at the same row grain. The library has the controls. The project app hides or gates most of them:

- The app never passes `onOpenView` to `ExplorEdaProject` (`apps/app/src/ProjectWorkspace.tsx:573-583`). Without it, "New query from this table" returns null (`SchemaStepEditors.tsx:414`), and the **expand** step is not offered (`SchemaStepEditors.tsx:141-143`, `QueryRelationshipBuilder.tsx:75`). Only the demo passes it.
- **Use a relationship** sits at the bottom of the Query panel (`ProjectQueryPanel.tsx:276-286`). It shows only when a relationship touches a field of the open query (`QueryRelationshipBuilder.tsx:56-59`).
- The relationship inspector ends with "No query follows this relationship yet." and offers nothing next (`SchemaInspector.tsx:857-861`). That is where task 4 gave up after making three correct relations.
- **Add database** makes one source and one analysis per table, each on an implicit one-step query (`projectActions.ts:99-131`, `lib/project/folder.ts:282-297`). A user who adds four tables gets four analyses that know nothing about each other.
- Nothing proposes relations. explorEDA reads no foreign keys and matches no key names. Relations come only from a drag in the schema diagram or from project text.

**Result:** every agent took the one route it already knew, which was SQL. Then they hit what SQL can't give explorEDA: rows that trace back to base tables, a visible row grain, and cross-filtering across tables. Task 5's wrong-looking rate came from its own SQL join copying a per-category rate onto every return line, which is the fan-out that `lookup` exists to prevent.

### 2. The text surface trails the app

The coding agents had a worse product than the browser agents, because the CLI lacks pieces the app has:

- **No read command.** `refreshSource` exists (`server/sources/refresh.ts:171`) but only the HTTP route calls it. `exploreda-dsl check` reports `… is not a field … fix: Fields: .` with an empty list. The real reason, `… hasn't been read from its database yet.` with "Refresh it to read its rows." (`lib/project/folder.ts:170`), shows only in `project` output.
- **Stale snapshots can't be detected.** A snapshot records its connection, driver, and read time, but not the `table=` or `sql=` it read (`lib/project/snapshots.ts:28-38`). After task 5 edited its SQL, the CLI kept reporting the old rows.
- **No reference for project text.** `exploreda-dsl reference` covers chart settings only. `reference notebook` answers `notebook is not a chart type.`
- **Docs can't be fetched.** The docs site is a single-page app that GitHub Pages serves through its `404.html` fallback (`apps/demo/vite.config.ts:16-30`). Every `/docs/*` URL returns HTTP 404 with an empty shell, including the URLs in the new `sitemap.xml`. `/daily` already builds static pages, so there is a precedent.
- **`exploreda-dsl fields` crashes** on a snapshot JSON with a minified stack trace.

### 3. Errors lose their fix on the way to the screen

The server writes helpful errors. Task 7 got `inventory has more than 100,000 rows. Raise its limit, as limit=200000, or read fewer rows with sql=.` Task 3 got only `Added plays, but it couldn't be read: plays is larger than 100 MB.` The byte-limit error has a suggestion ("Read fewer columns or rows with sql=.", `server/sources/read.ts:110`), but the Add-database notice builds its text from `error.message` alone (`apps/app/src/App.tsx:438`). The **Read** button path keeps the suggestion (`DatabaseSourceViews.tsx:178`). One flow is fixed, the other is not.

### 4. Chart defaults assume a CSV, not a warehouse table

Warehouse tables lead with surrogate keys: `ss_ticket_number`, `ss_customer_sk`, `game_id`. The defaults take the first field of the needed type:

- New charts use `numeric[0]` or the first non-numeric field (`hooks/useCreateCharts.ts:37-52`). The default sum or average measure is `measureFields[0]` (`RowChartSettingsPanel.tsx:57`). So task 4's first chart summed ticket numbers, and task 6's first bar chart grouped by `Customer sk`.
- Formulas need qualified ids (`["qb_dropbacks.sack"]`), but the UI shows labels (`Sack`). The calculator matches ids exactly (`lib/calculations/engine/Calculator.ts:25-31`). The field buttons insert the id, but anyone who types the label gets `Unknown field: Sack`.
- New charts are 6 of 12 columns wide at `x:0` (`hooks/useCreateCharts.ts:22-30`). Under 960 px, or on an empty grid, **Add to grid** skips placement (`ChartDraftContext.tsx:80-97`), so every chart stacks in the left half.
- The Add-chart dialog merges the deprecated `min: 0, max: 100` axis keys into every chart (`utils/defaultSettings.ts:106-115`). Export diffs against definition defaults that lack them, so `xAxis.min=0 xAxis.max=100` lands in dashboard text.

### 5. Stable context and "filter as scope" pull in opposite directions

Charts rank, cut to Top N, and set axes from all rows, so the picture holds still while other charts filter. This is a stated rule: "A chart's axes span all of its rows before any filtering" ([UI defaults](../../ui-defaults.md)). Row charts rank by the all-rows total (`RowChart/rowChartPlan.ts:37-49`), and the time axis takes its periods from all rows (`LineChart/timeSeriesPlan.ts:137-150`).

That rule is right for brushing, where a user compares a selection with the whole. It is wrong when a filter defines the question, as in task 7's "last quarter only". Then the item chart showed 20 items with a value of 0, and the 13 weeks sat in a clump at the right edge of a 5-year axis. Date axes also accept no limits (`axisBounds.ts:171-199`, `line: { x: !settings.time }`), but `compile.ts` still accepts `x.min` and `x.max` and drops them without a warning. The open [date-time handling brief](../../intent/date-time-handling/intent-brief.md) lists date-axis bounds as unbuilt. **The stable-scales session works in this area now, so coordinate with it before any change here.**

### 6. Rates are not a first-class measure

Aggregations are count, sum, average, max, and min (`lib/aggregates.ts:9`). No `sum(a)/sum(b)` exists. Agents built 0/1 helper fields and averaged them. A percent display does exist, as a field format (`lib/fieldSettings.ts:24`), and task 5 found it. The other agents looked for it on the chart or axis, where it isn't. (The pivot Total row is correct. It recomputes the aggregate over all covered rows, `PivotTable/utils/calculations.ts:383-426`.)

## The best experience we can picture

The test is task 4 for a first-time user: "monthly store sales by category and state" on a 24-table warehouse, with no SQL and no docs. In the best version:

1. **Connect.** Pick the file. explorEDA lists every table with its row count, column count, and columns. Tables over the read limit are marked before anyone tries them.
2. **Model is drafted for you.** explorEDA reads foreign keys and matches key names (`ss_item_sk` → `item.i_item_sk`), checks value overlap, and proposes relations with match counts. One click accepts them.
3. **Pick what one row is.** "One row is a store sale." explorEDA picks the fact table, reads it, and keeps the dimensions ready.
4. **Every related field is in the field picker**, grouped by table: Item › Category, Store › State, Date › Month. Picking one adds the `lookup` step. A field that would multiply rows (a one-to-many link) asks first and shows the effect.
5. **Defaults fit the table.** The measure defaults to a money or quantity field, never a key. Dimensions default to readable labels. Dates group by month. A new chart fills the next free place.
6. **Rates are measures.** "Share", "Rate (a ÷ b)", and percent axes are in the Measure menu.
7. **Filters say what they do.** A filter is either a selection ("compare with all") or a scope ("only Q4"). The charts act on that, and the user can see which one is on.
8. **Big tables have a path.** When a read is too big, explorEDA offers to pick columns, filter, or aggregate in the database. It writes the SQL and labels the result as partial.
9. **Text and CLI do the same.** `exploreda read`, `exploreda schema`, and `exploreda-dsl reference project` give an agent everything the app gives a person. Docs fetch as plain HTML.

### How far we are

Scored 0 to 10, where 10 is the experience above and 0 is "a user can't do this step without SQL or outside tools."

| Stage                           | Today | Gap                                                                                                                                           |
| ------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Connect                      |     7 | The connection form works on the first try. There are no columns, row counts, or size warnings before a read.                                 |
| 2. Model drafted                |     2 | Relations by drag only, in a diagram most users don't open. No foreign keys and no suggestions. Match counts are good once a relation exists. |
| 3. Pick the grain               |     3 | Each table becomes its own analysis. There is no "one row is…" step.                                                                          |
| 4. Related fields in the picker |     2 | The lookup step exists but is hidden, and expand is off in the app. No field picker shows related tables.                                     |
| 5. Fitting defaults             |     3 | First-field defaults pick keys. Placement stacks left. Titles are long and qualified.                                                         |
| 6. Rates                        |     3 | Percent exists as a field format. There is no ratio measure.                                                                                  |
| 7. Filter scope                 |     4 | Stable context works well for brushing. There is no scope filter, and date limits are ignored without a warning.                              |
| 8. Big tables                   |     5 | The row-cap message is good. The byte-cap message loses its fix in one flow. There is no column picker.                                       |
| 9. Text and CLI parity          |     2 | No read command, no project reference, no fetchable docs.                                                                                     |

The weakest stages are 2, 4, and 9. They are also the ones that sent all 8 agents to SQL.

## Choices

### How users combine tables

**Decision:** which approach should make "chart a measure from one table by an attribute of another" work without SQL?

Dimensions come from the eval's failures:

- **Join tasks without SQL:** of the 6 join tasks, how many a first-time user finishes with no SQL. Today 0 of 6.
- **Grain safety:** a join that multiplies rows (task 5) is prevented or shown.
- **Rows stay linked:** cross-filtering, traces, and record callouts still reach base-table rows.
- **Same in text:** an agent can do it in project text with the same steps.

| Approach                                                                                                                                                         | Join tasks without SQL | Grain safety | Rows stay linked | Same in text | Main tradeoff                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------: | -----------: | ---------------: | -----------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. Make today's controls findable: wire `onOpenView`, a "Use in this analysis" button on the relationship dialog, the step builder at the top of the Query panel |                      5 |            7 |                9 |            8 | Cheap and keeps the model. Users still have to find the schema diagram and draw relations by hand.                                                                    |
| B. Related fields in every field picker, with relations drafted from keys and names                                                                              |                      9 |            8 |                9 |            7 | Matches stage 4 of the target. Needs a relation proposer and a picker that knows about lookups. Text needs a short form for "field from a related table".             |
| C. A query builder that writes SQL                                                                                                                               |                      6 |            3 |                2 |            5 | Familiar, but it repeats today's failure: flat rows, no traces, fan-out left to the user.                                                                             |
| D. Database-side joins and aggregates (pushdown)                                                                                                                 |                      7 |            5 |                4 |            6 | Fixes big tables. But it breaks "every row or none" snapshots and the local evaluator, which the database-sources work ruled out until both agree on nulls and grain. |

- **Choice:** B, delivered through A. First ship A (small, and it unblocks the hidden steps). Then the relation proposer from foreign keys and name matches. Then related fields in the pickers.
- **Why:** "Join tasks without SQL" and "rows stay linked" decide it. Only A and B keep explorEDA's row model, and only B removes the hunt for the diagram.
- **Watch:** a lookup through a one-to-many link must ask first, or B brings task 5's fan-out back into the picker.
- **Next:** work items in Theme 1 below.

### How a coding agent gets the data

**Decision:** how does an agent read and check database sources without a browser?

| Approach                                                                                                    | CLI tasks needing a browser | Stale snapshot found | Password handling | Main tradeoff                                                                                           |
| ----------------------------------------------------------------------------------------------------------- | --------------------------: | -------------------: | ----------------: | ------------------------------------------------------------------------------------------------------- |
| A. `exploreda read [source…]` command, and `check` names it                                                 |                           9 |                    5 |                 8 | Uses `refreshSource` and the saved-secret store as they are. Staleness still depends on the user.       |
| B. A plus a source fingerprint (`table=` or `sql=` hash) in the snapshot, and `check` warns when it differs |                           9 |                    9 |                 8 | A small format change that ends task 5's silent stale rows.                                             |
| C. `check` reads by itself                                                                                  |                           9 |                    9 |                 4 | A check that queries a database and asks for passwords is a surprise. It breaks "only authors refresh". |
| D. An MCP server only                                                                                       |                           7 |                    7 |                 7 | Another session is scoping MCP. It helps agents with MCP and not shell scripts or CI.                   |

- **Choice:** B. An MCP server can call the same command later.
- **Why:** "CLI tasks needing a browser" and "stale snapshot found" decide it. Only B and C fix both, and C breaks the refresh rule.
- **Next:** work items in Theme 2.

### What a filter means to other charts

**Decision:** when a filter narrows the question (task 7), how should rank, Top N, and axes act?

| Approach                                                                                                                                                  | Scope tasks readable (task 7) | Brushing stays stable | Clear which mode is on | Main tradeoff                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------: | --------------------: | ---------------------: | -------------------------------------------------------------------------------------------------------------- |
| A. Keep stable context everywhere (today)                                                                                                                 |                             2 |                    10 |                      5 | Task 7's charts stay unreadable.                                                                               |
| B. Follow every filter                                                                                                                                    |                             9 |                     2 |                      6 | Bars jump and reorder on every brush, which the stable rule exists to stop.                                    |
| C. Two filter kinds: a scope filter (analysis or notebook level) changes the population that rank and axes use; a selection filter keeps today's behavior |                             9 |                     9 |                      7 | A new concept, which needs a clear label. It also fits notebooks, where a block's question often is the scope. |

- **Choice:** C. Also make date axes accept limits, or warn when `x.min` is ignored.
- **Watch:** this overlaps the running stable-scales work and the date-time brief. Decide it with that session, not here.

### How to rerun the eval

**Decision:** how do we run the eval again and compare?

| Approach                                                                                           | Same tasks and data each time | Finds problems no one listed | Comparable numbers | Main tradeoff                                                                                                             |
| -------------------------------------------------------------------------------------------------- | ----------------------------: | ---------------------------: | -----------------: | ------------------------------------------------------------------------------------------------------------------------- |
| A. Rerun by hand from this report                                                                  |                             4 |                            9 |                  3 | Drifts: different briefs, data, and counting each time.                                                                   |
| B. Scripted Playwright tests of the 8 flows                                                        |                            10 |                            1 |                  9 | Repeatable, but it tests our guesses about the flow. It would never have found the hidden join UI.                        |
| C. Scripted setup plus fresh agents plus a scorecard (`scripts/db-evals/`, the `db-ux-eval` skill) |                             9 |                            9 |                  7 | Agents differ run to run, so counts are rough. Fixed tasks, data, and scorecard fields keep the main measures comparable. |

- **Choice:** C, now in the repo. Add B only for a fixed flow worth guarding, such as "a lookup from the Query panel", after its fix lands.

## Measures for the next eval

From [scorecard.json](scorecard.json). Rerun with the [db-ux-eval skill](../../../.claude/skills/db-ux-eval/SKILL.md).

| Measure                                         | Baseline | Target |
| ----------------------------------------------- | -------- | ------ |
| Join tasks done with explorEDA's own joins      | 0 of 6   | 4 of 6 |
| CLI tasks that needed a browser click           | 4 of 4   | 0 of 4 |
| Agents that needed `sqlite3`, `duckdb`, or `jq` | 4 of 8   | 1 of 8 |
| Tasks done (not partial or blocked)             | 5 of 8   | 7 of 8 |
