1. **Outcome:** partial. Notebook `low-stock.eda.md` renders with prose and 4 charts, but the two weekly line charts are unreadable because the x axis shows 1998-2002. Files: `<t7>/low-stock.eda.md`, `<t7>/exploreda.eda`. Open the app on the project and pick the notebook "Low stock by category" in the sidebar (title came out as the last chart name; notebook title is "Which warehouses run low on stock?").
   (t7 = the run folder)

2. **What I built:** One SQL source joining all 188,400 inventory rows to date_dim, item, warehouse (nothing filtered at the source; null quantities kept). Notebook text states the low-stock line (qty < 100, about the 10th percentile, median 499), the quarter (Q4 2002, 2002-10-03 to 2002-12-26, 13 weekly snapshots), and what is left out (null quantity ~5%, unnamed warehouse 5). Charts: weekly units on hand per warehouse; weekly count of items below 100 per warehouse; low snapshots by category; low snapshots by item. Findings (checked with DuckDB): warehouses are near equal (low counts 149-173; on-hand 715k-761k); about 10% of readings are low everywhere; raw counts lead with Jewelry/Women (120) but by share Home/Books/Electronics are highest (~11%).

3. **Steps:**

   1. Read the brief, `exploreda --help`, `exploreda-dsl reference`. Neither explains project files, database sources, SQL, or notebooks.
   2. Started the server with a trailing `&` inside a background command: it exited and a second server started on another port (4108, then my later one 4107). Re-ran it without `&`.
   3. Opened the app: empty folder says "Add data to start". Used "Add a database" (DuckDB file) and "Add and read" on inventory to learn the text syntax (`connection @retail driver=duckdb path=...`, `source @inventory db=retail table=inventory`).
   4. Read failed: "inventory has more than 100,000 rows. Raise its limit, as limit=200000, or read fewer rows with sql:." I wrongly set limit=20000000, then switched to a `sql=` source with limit=200000.
   5. No duckdb CLI, so I made a venv in my folder with pip duckdb to inspect data (schema, nulls, date range, percentiles).
   6. Wrote the notebook with guessed ```eda fences. `exploreda-dsl check`said "qty is not a field in the source rows" with "Did you mean inventory.qty?": fields are prefixed with the source name. Fixed with`qty:num=inventory.qty`. Check then said ok.
   7. Rendered in the browser. The filter works but the time axis spans 1998-2002. Tried `x.min`/`x.max` as ISO dates and as epoch ms: no effect. Removed them.
   8. Browser pane: my tab was taken over by other testers' pages twice (tab-8 became t8's app) and tabs_create failed (tab cap).
   9. Stopped my servers.

4. **Friction:**

   - Weekly line charts ignore the date filter for the x axis and `x.min`/`x.max` (docs say they set the shown range). All 13 weeks squeeze into the right edge; lines look like blobs. Major. Expected zoom to filtered data or honored x.min.
   - `exploreda-dsl reference` and `--help` say nothing about `source`, `connection`, `sql=`, `limit=`, notebooks, or `eda source=` fences. I learned the syntax by clicking the UI and reading the saved file. Major for a coding agent.
   - Default row limit error ("inventory has more than 100,000 rows...") is helpful, but 188k rows is small. Minor.
   - Field names get a `inventory.` prefix that `check` only reveals via "Did you mean". Minor.
   - `exploreda-dsl check` fails before the first read ("source inventory: 0 rows (missing)"); the read only happens in the browser. A CLI read command is missing. Major for agent workflow.
   - Notebook sidebar title was "Low stock by category" (the last `dashboard` name), not the `#` heading. Minor.
   - All eda blocks merge into one dashboard (warning "low is also calculated on line 32; this one is used"), so definitions go in the first block only. Minor.
   - Category bar chart: faint background bars (~2,000 per category) look unfiltered next to the filtered totals (e.g. 104 vs ~1,100 for Q4). Item chart lists items sorted with 0 first, not by count. I did not scroll to the bottom to see the item chart fully. Minor.
   - Legend text truncated warehouse names (the data itself is truncated at 20 chars). Minor.

5. **Confusion:** What `eda source=` vs `eda query=` means; how `group` + `row` work together; whether `filter` is chart-level or workspace-level (it is workspace-level: it applies to all charts).

6. **Missing:** A CLI way to read a database source; docs for notebooks and sources in the CLI reference; axis zoom to the filtered range; a way to set a threshold line (rule y=) tied to the count chart; sort/limit (top N) on grouped row charts.

7. **Source reading:** none. (I used the pip duckdb package in my folder to inspect the data file, not explorEDA source.)
