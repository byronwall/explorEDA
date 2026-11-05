# explorEDA user test t4: retail dashboard

## 1. Outcome

Partial. Dashboard has the line, category and state charts and they cross-filter. No top-items table, and the join had to be written as SQL because I found no UI to build a query that uses the relationships. Files: runs/t4/sales-joined.eda (dashboard), runs/t4/exploreda.eda (connection, sources, relations, joined SQL source). Open the app and choose the "Sales joined" analysis.

## 2. What I built

- Connection `retail` (DuckDB) and tables store_sales, item, date_dim, store, each added as its own source and analysis.
- Three relations created by dragging fields in the Schema diagram (store_sales to date_dim, item, store). Match counts shown before creating: date 27,359 matched / 1,335 unmatched; item 28,694 / 0; store 27,392 / 1,302.
- Source `sales-joined`: a SQL query source (left joins) giving 28,694 rows, same as store_sales, so the join does not drop rows.
- Charts on "Sales joined": line (calendar summary, monthly sum of sales_amt = ss_ext_sales_price), row chart sum by category, row chart sum by state. Clicking the Sports bar filtered the other two charts (footer "Showing 2,881 of 28,694 rows", chip "Category: Sports").
- Findings: category bars are all about 5M (Music highest); only one state exists (TN, about 51M, plus about 1.3M with no store), so the by-state chart is one bar. About 5% of rows have NULL date/store keys and 77 rows have no category. Sales are strongly seasonal; data spans 1998 to 2003.
- Not verified: the total. I did not add a total metric or compare to a raw SUM (no duckdb CLI). State bars (51M + 1.3M) match the category bars (about 5M x 10 + 0.1M), so the total is about 52.3M and consistent.

## 3. Steps

1. Started the server, opened the link in a new tab.
2. Add a database: default kind is SQLite; switched to DuckDB, name retail, path data/retail.duckdb. Worked.
3. Added store_sales (28,694 rows), item, date_dim, store as tables. Each becomes its own analysis.
4. Looked for a join: Query panel (only "Read X", no add step), Add chart > Fields (no related fields), "+" (add chart). Dead end, about 10 min.
5. Schema panel says "Drag a field onto another to propose a relationship." Opened the diagram, dragged, created 3 relations. Afterwards it says "No query follows this relationship yet." with no way to make one.
6. Public docs (project-folders) show text `query ... { source; lookup ... via= }`. Found no UI for it. Fell back to Add database > A query with a SQL join.
7. Built the three charts via Add chart. No table.

## 4. Friction

- No UI to build a query that uses relations (lookup/expand). Dialog says "No query follows this relationship yet." and the Query panel has no add-step control. Expected "bring in fields from Item". Severity: major (relations I made are unused).
- Row chart Measure dropdown offers only "Count rows" / "New sum of a field…", and the field defaults to the first field (Ticket), so a user can easily sum a ticket number. Line chart Measure also defaults to Ticket. minor/major for correctness.
- Line chart has no sum in "Raw observations" mode; sum by month is under Data mode "Calendar summaries". It shows "1335 unreadable dates" for NULL dates. minor.
- Chart titles are raw ("Sum of sales-joined.sales_amt by sales-join…", truncated). minor.
- Brushing a category bar writes `select."sales-joined.category"=Sports` into the dashboard file. It was removed once I cleared the filter. Fine, noting it persists selections.
- Table buttons in Add database have no accessible names (`button [ref_49]`). minor.
- Page scroll/sidebar positions jumped after adding sources, so click targets moved. minor.
- Line chart saved `xAxis.min=0 xAxis.max=100 yAxis.max=100` in the file; odd but harmless.

## 5. Confusion

- Relationship vs query: the diagram shows both, but it is unclear how a relation becomes a joined table.
- Each added table becomes its own "analysis" in the sidebar; I expected sources and analyses to be separate.

## 6. Missing

- UI for query steps (lookup/expand, filter, calc) or a join builder.
- Top-items table (ran out of time; a pivot table would do it).
- A total/metric card (not tried).
- Sensible default measure for money fields.

## 7. Source reading

None. I read the public docs pages for project folders and database sources, and `exploreda-dsl reference` output.
