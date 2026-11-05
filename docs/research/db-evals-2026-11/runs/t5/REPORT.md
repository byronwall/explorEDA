# t5 report: retail returns notebook

## 1. Outcome

Done (with caveats). Notebook: `.../runs/t5/returns.eda.md`; project file `.../runs/t5/exploreda.eda` (same folder; full path prefix is the scratchpad `runs/t5`). Open `http://127.0.0.1:4105/` (server now stopped); the app opens the notebook "returns" directly.

## 2. What I built

Notebook with prose, 3 row charts and a pivot, using store_sales and store_returns:

- Return amount by reason (reasons joined from `reason`; returns with a null reason key shown as "No reason recorded").
- Return amount by item category.
- Return rate by category (returned / sales) as a row chart plus a pivot of sales, returned, rate.
- Written conclusion.
  Findings: about $2.67M returned. 70% ($1.88M) sits under 54 reason codes that have no name in the reason table ("reason 23".."reason 75"); I grouped them as "Unlabelled reason code". 94 returns ($40.5K) have no reason: own group. Named reasons are small and flat (top: "Not the product that was ordred" $64K). Children ($327K, 6.2% of sales) and Shoes ($300K, 5.5%) cost most; Home lowest (4.2%). 7 returns have no item category ("Unknown"). 103 return lines have no amount.

## 3. Steps

1. Read brief; `exploreda --help`, `exploreda-dsl` help and `reference`. Nothing explains how to declare a database source (the `reference` output only covers dashboard/notebook text).
2. Started the app on 4105. No `exploreda.eda` was created for a folder holding only a .duckdb file; the UI said "Add data to start".
3. Guessed `connection @wh driver=duckdb path=...` was not documented anywhere I looked, so I ran `exploreda --example database` (SQLite) to copy the syntax, then substituted `driver=duckdb`. It worked.
4. `exploreda-dsl project .` said "returns hasn't been read from its database yet". Had to open the browser and click Read; only then did the CLI see rows (snapshot in `.exploreda/snapshots`).
5. No duckdb CLI or python module, so I explored the schema via the app's Add-database table list and the snapshot JSON.
6. Wrote sources with `sql=` joining store_returns, reason, item; a per-category sales/returns source (aggregated separately to avoid join fan-out).
7. Wrote a notebook with two `eda query=` blocks: error, a notebook takes one query ("No query is named cat_rate" style errors; fields listed only for the first query).
8. Added `relate` + `query ... { source; lookup }`. Error "A query needs a name and a glyph." Added `glyph=◆`.
9. Changed SQL for reason grouping; had to click "Read all" again to refresh the snapshot before numbers updated.
10. First render: rate axis showed 0.02..0.08 and a `table` showed 2,905 rows with each category repeated. Fixed with `field cat.return_rate format=percent precision=1` and a `pivot`.
11. Verified in the browser at `http://127.0.0.1:4105/`: all charts and prose render.

## 4. Friction

- No guidance for DuckDB/database sources in the CLI help; I only found the syntax by copying the `--example database` project. Severity: major.
- A folder with only a .duckdb file is not detected; no auto-suggestion. minor.
- `exploreda-dsl project` cannot read a database; it depends on a browser "Read" click, and after editing `sql=` the old snapshot is silently kept until re-read (the CLI reported "2905 rows (fields from data)" for a changed query). major for agent workflows.
- One query per notebook: `eda query=cat_rate` in a second block errors; joining needs `relate`/`query` in exploreda.eda. Error text was: "No query is named return-lines." / "Use query=returns, query=cat_rate." (the suggestion misled; a query was missing the glyph). minor-major.
- "A query needs a name and a glyph." glyph requirement is surprising. minor.
- Joining a pre-aggregated per-category table onto return rows repeats it per return line; a `table` shows 2,905 rows and a pivot "Total" row averages the averages (5.1%, not the true total rate). Wrong-looking total. major for rate-style metrics.
- Row chart groups the tail into "Other categories" (3 smaller categories, 64.6K) with no obvious setting; rate chart axis defaulted to 0.02 style numbers until `format=percent` was set on the field (not on the chart axis). minor.
- Missing return amounts (103 rows) are silently excluded from sums; no warning. minor.

## 5. Confusion

- "Read" vs refresh vs snapshot; project `.exploreda/snapshots` is not documented in CLI help.
- `row <field> group=@g`: the chart shows group sums, but the title "Row chart showing returns.reason" does not say what value it plots.
- Reason table placeholder names ("reason 23") are a data issue, but nothing in the tool helps surface "labels that look like placeholders".

## 6. Missing

- A documented database-source guide in `exploreda-dsl reference` (connection, source sql=, relate, query, glyph).
- Schema listing (columns per table) from the CLI; a way to run a read from the CLI without the browser.
- Multiple queries per notebook, or per-block source choice.
- A true ratio measure (sum(a)/sum(b)) in groups, so rates need no SQL pre-aggregation.
- Axis format option on charts for percent.

## 7. Source reading

None. I did not read explorEDA source. I used the built-in `--example` sample projects and the public CLI help only.
