# Database UX/DX eval: design

Status: approved 2026-11-04. Byron chose databases A and B, both surfaces split by task, 1 Sonnet run per task, and about 2 hours.

As built:

- **A (`nfl.db`, SQLite):** `plays` 49,665 rows × 372 columns, `games` 285 × 46 (2023 season only), `players` 24,864 × 39. Sources: nflverse `play_by_play_2023.csv.gz`, nfldata `games.csv`, nflverse `players.csv`.
- **B (`retail.duckdb`, DuckDB, 24 tables):** SF 0.01 had 1 store, 1 warehouse, and 1 return reason, so it could not answer tasks 4, 5, and 7. I generated SF 1 and kept about 1% of fact rows by order or ticket number (`store_sales` 28,694; `store_returns` 2,905; `catalog_sales` 14,252; `web_sales` 7,295). `inventory` keeps every 50th item: 188,400 rows, over the row cap on purpose. `customer`, `customer_demographics`, and `customer_address` keep only rows that the facts use. Other dimensions are whole (12 stores, 5 warehouses, 75 reasons, 18,000 items). Written with storage version v1.2.0, so older DuckDB clients open it.
- **Surface split:** tasks 1, 3, 4, 6 (dashboards) in the browser app; tasks 2, 5, 7, 8 (notebooks) through project text and `exploreda-dsl`, then opened in the app.
- **Build:** the CLI and app from this checkout at `0d4ced91`, run through wrapper scripts.

## What explorEDA does with databases today

Found from code and docs, not from runs. The runs test these claims.

- **Engines:** SQLite, PostgreSQL, MySQL, SQL Server, and DuckDB. DuckDB needs a separate `npm install @duckdb/node-api` in the project folder.
- **Surfaces:**
  - `npx exploreda <folder>` opens a local project in the browser (the `apps/app` project app). `--example database` copies a SQLite sample.
  - The team server (`docker/demo` has a PostgreSQL retail stack).
  - Project text: `connection @id driver=… path=…`, then `source @id db=… table=…` or `sql="select …"`, then `relate a.x -> b.y`.
  - Agent CLI: `exploreda-dsl check | fields | fmt | project | reference`.
- **App flow:** **Add database**, then pick or add a connection, then pick a table or write a query, then **Add and read**. Each source opens a new analysis on a field summary.
- **Table to dataset:** each source is one table or one `SELECT`, read once into a typed snapshot in `.exploreda/snapshots/`. Charts never query the database. Only an explicit refresh reads again.
- **Joins:** declared with `relate`, used in a query with `lookup` (many to one) or `expand`. There is a schema drawer in the library. Or the author writes the join in a `sql=` source.
- **Limits:** a source over 100,000 rows or 100 MB is refused with a fix (no sampling). `limit=` per source.
- **Deliverables:** a dashboard is an `.eda` file. A notebook is a `.eda.md` file of prose and `eda` blocks.

### Gaps and awkward points I expect (hypotheses only; not given to the agents)

1. Foreign keys are never read, so every join needs a hand-written `relate`. In a 24-table schema that is a lot of typing.
2. One source per table. Nothing adds "these 6 tables" at once.
3. `exploreda-dsl fields` takes only CSV or JSON. An agent can't list a database table's fields without the app or a prior read.
4. The 100k-row cap refuses normal fact tables. The fix is to write SQL that filters or aggregates, which moves analysis out of explorEDA.
5. DuckDB is an extra install step at the first read.
6. A `UNION` or a two-fact-table comparison has no project-text form, so it needs a `sql=` source.

## Databases

All are local files. Nothing needs a server unless we add C.

| ID           | Database                                            | Engine     | Shape                                                                                                              | Size   | Why                                                                                                               |
| ------------ | --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------- |
| A            | NFL play-by-play, 2023 season (nflverse)            | SQLite     | Wide: 3 tables. `plays` has about 49k rows and 370+ columns; `games` has 285 × 45; `players` has about 20 columns. | ~60 MB | Real data, very wide, many nulls that mean "not applicable" (for example, `air_yards` on a run).                  |
| B            | TPC-DS, scale factor 0.01 (made by DuckDB `dsdgen`) | DuckDB     | Normalized: 24 tables (7 fact, 17 dimension), joins on surrogate keys                                              | ~20 MB | Many tables, star and snowflake joins, injected nulls. `inventory` is about 260k rows, which is over the row cap. |
| C (optional) | `docker/demo` retail warehouse                      | PostgreSQL | Mid: a few tables                                                                                                  | small  | The only server engine. It tests passwords and the team server.                                                   |

Alternatives if A or B is a poor fit: Ames Housing (1 table, 82 columns, NA means "none") for wide data; the SQLite port of AdventureWorks (about 70 tables) for normalized data with real names.

## Tasks

Four dashboards, four notebooks. "Joins", "filter", and "messy" mark what each task forces.

| #   | Database | Deliverable | Goal, in a user's words                                                              | Expected charts or findings                                                                                  | Success                                                                                                    | Forces        |
| --- | -------- | ----------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------- |
| 1   | A        | Dashboard   | "I want a fourth-down board: when do teams go for it, and does it work?"             | Go-for-it rate by yard line (binned) and by score difference; success rate; a team table.                    | Plays filtered to 4th down. 3+ linked charts. A click on one chart filters the others.                     | filter, wide  |
| 2   | A        | Notebook    | "Do teams that pass better win more games? Write it up."                             | EPA per dropback and per run, per team; joined to game results for win %; a scatter with a short conclusion. | A notebook with prose plus 2+ charts. The join to `games` is correct (home and away both counted).         | joins, wide   |
| 3   | A        | Dashboard   | "Scout five quarterbacks for me: accuracy, depth, sacks."                            | Completion %, average air yards, sack rate per QB; air yards distribution.                                   | The right columns are found among 370. Nulls on sacks and incompletions are handled, not dropped silently. | messy, wide   |
| 4   | B        | Dashboard   | "Monthly store sales by category and state, for the regional managers."              | Sales by month (line), by category, by state; top items table.                                               | `store_sales` joined to `item`, `date_dim`, `store`. Totals match a reference SQL query.                   | joins (3)     |
| 5   | B        | Notebook    | "Why do customers return things? Which categories and reasons cost the most?"        | Return amount by reason and by category; return rate per category (returns ÷ sales).                         | Both fact tables used. Null reasons are visible as their own group or are explained.                       | joins, messy  |
| 6   | B        | Dashboard   | "Compare who buys on the web against who buys from the catalog."                     | Gender, marital status, education, and state for each channel.                                               | Customer, demographics, and address joined. The two channels sit side by side.                             | joins, union  |
| 7   | B        | Notebook    | "Which warehouses run low on stock, week by week, last quarter?"                     | Weekly on-hand quantity per warehouse; items under a threshold.                                              | The agent gets past the row cap (filter or aggregate) and says what it left out.                           | filter, limit |
| 8   | A or C   | Notebook    | "Start from nothing: connect to this database and tell me three interesting things." | Free choice.                                                                                                 | A notebook with 3 findings, each with a chart. Measures the cold-start path with no table named.           | discovery     |

## Run protocol (proposed)

- One clean subagent per task. It gets only the task brief, the start steps, and the database path. It gets no source walkthrough and no hints about the gaps above.
- Each agent starts from an empty project folder: `npx exploreda <folder>` with this checkout's build, or the demo dev server for the browser path.
- Each agent reports what blocked or confused it, errors, missing features, and what it wanted. If it reads source, it says why, and says what it saw before and after.
- I save a screenshot of each final dashboard or notebook to `tmp/db-evals/`.
- Results go to `docs/research/db-evals-2026-11/README.md`.
