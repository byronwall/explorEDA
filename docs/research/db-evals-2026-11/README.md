# Database UX/DX eval, 2026-11-04

Eight clean Sonnet agents each did one realistic task against a database, as a first-time user would. Four built dashboards in the browser app. Four wrote notebooks as coding agents, with project text and `exploreda-dsl`. This report ranks what got in their way.

- Design, databases, and tasks: [design.md](design.md)
- Each agent's full report and project files: [runs/](runs/)
- Build tested: this branch at `0d4ced91`, the CLI and app built from source

## Summary

Every agent connected to a database and made a deliverable: five done, three partial. That is the good news. The bad news is how they got there: **all eight wrote raw SQL in a `sql=` source to do their joins, filters, and aggregates**. Only task 5 used `relate` and `lookup`, and only to attach one SQL result to another. In practice, explorEDA was a chart layer on top of hand-written SQL.

The coding agents hit a second wall. **No command reads a database source.** `exploreda-dsl check` and `project` see no fields until a person clicks **Read** in the browser. The CLI reference also has no syntax for connections, sources, or notebooks. Each agent copied it from `--example database`.

## Results

| #   | Task                   | DB     | Surface | Outcome | Top friction                                                                                                                                                                   |
| --- | ---------------------- | ------ | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Fourth-down board      | NFL    | Browser | Done    | No binning in calculations: two 7–10 level `if` chains. No rate measure or percent format.                                                                                     |
| 2   | Passing vs winning     | NFL    | CLI     | Done    | `check` shows empty fields until a browser Read. Notebook syntax only from the example.                                                                                        |
| 3   | Five-QB scout          | NFL    | Browser | Done    | `plays is larger than 100 MB.` with no next step. Rates show as 0.69 / 0.68 / 0.67 and are hard to tell apart.                                                                 |
| 4   | Monthly store sales    | Retail | Browser | Partial | Made 3 relations in the schema diagram, then found no UI that uses them ("No query follows this relationship yet."). Fell back to SQL. Default measure sums the ticket number. |
| 5   | Return reasons         | Retail | CLI     | Done    | A notebook charts one query. A per-category table joined to return lines made the pivot total an average of averages.                                                          |
| 6   | Web vs catalog buyers  | Retail | Browser | Partial | Joins and the channel union in hand SQL. The 100% stack shows channel share per group, not group share per channel.                                                            |
| 7   | Low stock by week      | Retail | CLI     | Partial | Under a date filter, the time axis still spans 1998–2002, and `x.min`/`x.max` did nothing. Row charts rank by unfiltered totals.                                               |
| 8   | Cold start, 3 findings | NFL    | CLI     | Done    | One query per notebook forced a `UNION ALL` of three result shapes. The docs site returned 404.                                                                                |

Totals were checked where possible. Task 4's $52.3M matches `SUM(ss_ext_sales_price)` in DuckDB ($52,282,031). Task 5's 94 returns with no reason matches a direct count.

## Findings

Ranked by severity, then by how many runs hit them. "Verified" means I reproduced it or saw it in a screenshot, not only in an agent's report.

### Blockers and major problems

1. **Joins happen in SQL, not in explorEDA (8 of 8 runs).** Every agent wrote its base-table joins or aggregates in a `sql=` source. The app has a schema diagram that makes relations (task 4 made three and saw match counts), but no app control adds a `lookup` step or "fields from a related table" to a query. explorEDA never reads foreign keys, so a 24-table schema starts with no relations at all. The cost: rows lose their link to base tables, cross-filtering works only inside one flat result, and every rate or join check is the user's SQL to get right.
2. **No CLI read of a database source (4 of 4 CLI runs).** `check` reports `teams.pass_epa is not a field, alias, or calculation … fix: Fields: .` with an empty list. The real reason ("hasn't been read from its database yet") appears only in `project` output. After a `sql=` edit, the CLI kept the old snapshot and still reported the old row count (task 5). An agent can't finish without a browser.
3. **Database and notebook syntax is not in the CLI help (4 of 4 CLI runs).** `exploreda --help` and `exploreda-dsl reference` don't cover `connection`, `source … sql=`, `limit=`, `relate`, `query`, or notebook blocks. `exploreda-dsl reference notebook` says `notebook is not a chart type.` All four agents copied syntax from `--example database` or `--example forecast`.
4. **The docs site is invisible to non-browser clients (verified).** `curl https://exploreda.dev/docs/database-sources` returns HTTP 404 with an empty app shell. The same is true for `/docs`, which the new `sitemap.xml` lists. Agents that use a fetch tool see no docs. Search engines get a 404 for every docs URL too.
5. **No ratio or percent (5 of 8 runs).** Rates need a 0/1 calculated field plus Average. The axis then reads 0.3, not 30%, and labels round to 2 decimals, so 0.69 and 0.68 look alike. A pivot "Total" row averaged per-group rates (5.1%) instead of computing the true total (task 5).
6. **Filtered charts rank and scale by unfiltered data (task 7, verified in the screenshot).** Under a Q4 filter, the item row chart shows its top 20 by all-time count, all with a filtered value of 0, and folds the real values into "Other categories". The weekly line chart keeps a 1998–2002 axis and draws the 13 filtered weeks as a clump at the right edge. `x.min` and `x.max` had no effect.
7. **One query per notebook (tasks 5 and 8, and task 2 worked around it).** A second `eda query=` block is ignored, and the hint `Use query=returns, query=cat_rate.` reads like it should work. The docs do say this (`notebooks.mdx`), but no agent expected it. Task 8 merged three result shapes into one `UNION ALL` source to get around it.
8. **A wide table can't be read, with no route forward (tasks 3 and 8).** `plays` (49,665 rows × 372 columns) fails with `Added plays, but it couldn't be read: plays is larger than 100 MB.` There is no column picker and no hint to select fewer columns. The failed source stays listed as "Not read yet". In task 8, a Read of the same table showed no error and no progress. I did not reproduce that case. For contrast, the row-cap message in task 7 worked well: `inventory has more than 100,000 rows. Raise its limit, as limit=200000, or read fewer rows with sql:`.
9. **No schema browser before reading (tasks 1, 3, 6, 8).** The Add-database step lists tables but not columns. Agents used `sqlite3`, read a 2,000-row sample, or read snapshot JSON with `jq` to learn column names.
10. **The default measure is the first field (task 4).** Row and line charts default to summing `ss_ticket_number`. Bar charts default to grouping by `Customer sk` (task 6). This gives a plausible but wrong number.

### Minor problems

- **Field names must be source-qualified in formulas** (tasks 1, 3, 7, 8). The UI shows `Sack`, but `["Sack"]` fails with `Unknown field: Sack`. The `Did you mean inventory.qty?` hint in `check` helped.
- **Auto titles are long and get cut off** (tasks 1, 3, 4, 6): `Average of qb_dropbacks.sack by qb_dropbacks.passer_player_name`.
- **New charts stack in one half-width column** (verified in every dashboard screenshot). The right half of the grid stays empty.
- **No binning in calculations** (task 1). Histogram plus **Split by** turned into a 99-bar chart with an empty preview.
- **Markdown text typed in the Add-chart dialog is lost** (task 6). The card is added empty.
- **"Other categories" hides the tail** (tasks 5, 7, 8). Task 8 needed `topN=32` to see the worst teams.
- **Missing values drop out of sums without a note** (task 5: 103 return amounts). The ECDF does say `191 rows without a number left out`, so the behavior is not consistent.
- **`exploreda-dsl fields --data <snapshot>.json` crashes** with a minified stack trace and no message (verified).
- **The UI writes `xAxis.min=0 xAxis.max=100` into dashboard text** (task 4, in `runs/t4/sales-joined.eda`). These are the deprecated placeholder keys.
- **Each added table becomes its own analysis** in the sidebar (task 4), so four sources made four analyses.
- **Unclear labels:** "Once per / Every row", "Split by" vs "Use as color field", "Read" vs "Refresh", `eda query=` vs `eda source=`, and a "Definitions" heading in rendered notebooks.

### What worked

- The connection form worked on the first try for SQLite and DuckDB in every browser run.
- The match counts in the relationship dialog (task 4: `27,359 matched / 1,335 unmatched`) were the clearest join check any agent saw.
- Cross-filtering by a click worked in tasks 1 and 4.
- The Fields summary's "N missing" chip helped task 3 find its 191 null air-yards rows.
- The live row preview in calculations, and `check`'s "Did you mean" hints.

## Proposed follow-up work

In priority order.

1. **Join in explorEDA, not in SQL.** Add "Add fields from a related table" to the query panel, so a relation becomes a `lookup` step. Add "Use in this analysis" to the relationship dialog. Suggest relations from foreign keys and from `*_sk` / `*_id` name matches when a connection is added.
2. **An `exploreda read [source…]` command**, plus a `check` message that names it when a source is unread. Read again when a source's `sql=` changes.
3. **Agent-readable docs.** Prerender docs pages so they return HTTP 200 with content (this also fixes the sitemap's 404s). Add `exploreda-dsl reference project` and `reference notebook` with connection, source, relate, query, and block syntax.
4. **Ratios and percent format.** A `sum(a)/sum(b)` or "share" measure, a percent number format on chart axes and labels, and pivot totals that compute the ratio of totals.
5. **Rank and scale charts by filtered data**, and zoom a time axis to the filtered range. Make `x.min`/`x.max` work on date axes. This one looks like a bug, not a feature gap.
6. **A path for wide and big tables.** When a read is over the byte cap, offer a column picker that writes a `sql=` select. Remove or flag the failed source. Show progress and a cancel button on long reads.
7. **A schema browser in Add database**: columns and types per table before the read.
8. **Several queries in one notebook**, chosen per block.
9. **A polish batch:** a default measure that skips key and ID fields, unqualified names in formulas, short auto titles, a better default grid placement, the lost Markdown text, the `fields` crash, and the placeholder axis keys in exports.

## Limits of this eval

- One Sonnet run per task. Findings that only one run hit may depend on the agent.
- DuckDB's separate install step was not tested. The CLI ran from inside this repo, where `@duckdb/node-api` is already a dev dependency.
- Parallel agents shared one browser pane. Tasks 7 and 8 lost their tab to another tester, and `tabs_create` hit a tab cap. These are harness problems, not product problems. A stray server from task 7 also pushed task 8 to another port.
- Some odd results are real properties of the data, not product bugs. In TPC-DS SF 1, all 12 stores are in Tennessee and reasons 31–75 are named "reason 31" and so on.
- Two agents used tools outside explorEDA to inspect data (`sqlite3` in task 1, a local `duckdb` in task 7). No agent read explorEDA's source.
