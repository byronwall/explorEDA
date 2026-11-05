```json
{
  "outcome": "done",
  "deliverableLabel": "Store sales",
  "minutes": 25,
  "joins": "explorEDA",
  "browserNeededForCli": false,
  "outsideTools": [
    "python3 (read the app's own snapshot JSON to check the total)"
  ],
  "readSource": false,
  "blockers": 0,
  "major": 3,
  "minor": 5
}
```

## 1. Outcome

Done (with caveats below). Deliverable: the analysis "Store sales" at `t4/store-sales.eda`; project text in `t4/exploreda.eda` (connection, 4 sources, 4 relates).

## 2. What I built

Analysis "Store sales" (rows = store_sales) with lookups to date_dim, item and store, made through the Query panel. Charts on one grid:

- Line: monthly sum of ss_ext_sales_price by date_dim.d_date, 1998 to 2003 (seasonal peaks each Q4).
- Bar: sales by item category (10 categories plus a "(missing)" bar).
- Bar: sales by store state. Only TN exists (plus "(missing)" for rows with no store), so it is a single real bar. This is the data, not an app bug.
- Metric card: total sales 52,365,502.91 over 28,694 rows. I checked it against the app's snapshot file (sum of ss_ext_sales_price = 52365502.91). Correct, and the joins did not multiply rows.
- Row chart, top 10 by item product name (sum of sales). It is a bar chart, not a table. The top entry is "(missing)" at 134.7K, then scrambled names.
- Cross-filtering works through joined fields: clicking "Shoes" cut the metric to 5,353,390.49 (10%) and redrew the line and state charts. I cleared it afterwards.

## 3. Steps

1. Started the server, opened the link in my own tab (tab-1).
2. "Add a database": chose Kind = DuckDB file, name "retail", file data/retail.duckdb. Added the connection. Table list showed all 24 tables with row counts.
3. Ticked date_dim, store, store_sales, item using the "Find a table" box. My first store_sales click was lost while the list re-rendered (button said "Add 3 tables"). Fixed it. The "Which table is one row of your analysis?" dropdown defaulted to store_sales.
4. "Add 4 tables and read". About 120K rows read in a few seconds. Sidebar showed "4 suggested links to review".
5. Opened the schema diagram and clicked "Accept 4 links". It accepted the 3 right links plus one spurious one: store.s_closed_date_sk -> date_dim.
6. Added a Line chart. Fields offered only store_sales columns, with no date_dim, item or store fields. The Calendar summaries mode defaulted to ss_sold_date_sk and said "No readable dates for these rows".
7. Found the Query panel (toolbar branch icon). Its "Use a relationship" section with "Add Date dim fields" fixed it. I did it three times (date, item, store). Afterwards the chart pickers offered the D, I and S fields.
8. Line chart: Calendar summaries, Date = D date, Interval = Month, Metric = Sum, Measure = Ss ext sales price (it defaulted to Ss quantity).
9. Two bar charts (category, state): Operation = Sum, Measure = ext sales price.
10. Metric card: Sum of Ss ext sales price.
11. Top items: tried Pivot Table with row field item.i_product_name. The browser tab crashed ("This page crashed") right after I picked the field. Reloaded; the project came back with all charts. Used a Row Chart with Top N = 10 instead. Worked.
12. Checked total, cross-filter. Stopped the server.

## 4. Friction

- Major: the field pickers in Add chart show no related-table fields at first. The line chart's Date picker showed only ss\_\* columns. I did not know to go to the Query panel. The "4 links accepted" step did not hint that I still needed to "Add Date dim fields". Expected: after accepting links, fields from related tables are offered (or the picker says "Add related fields").
- Major: Pivot Table with item.i_product_name (about 13K distinct values) crashed the browser tab ("This page crashed / Reload to try again"). Expected: a cap or a warning. The saved project survived the reload.
- Major: no table for "top items". The Row Chart with Top N works, but "Other categories" is the biggest bar (51.9M), which swamps the top 10 values and makes them look tiny. A ranked table with a sum column was what I wanted. "Data Table" and "Summary Table" exist but I did not find a way to aggregate by item in them.
- Minor: the Calendar-summaries line chart picked ss_sold_date_sk (an integer key) as the default Date even after D date was available, and reported "No readable dates".
- Minor: the line chart's measure defaulted to Ss quantity. The file stores `y=store-sales.ss_quantity` beside `time.measureField=...ss_ext_sales_price`. This is confusing text, though the chart is right.
- Minor: changing the Row Chart Data Field resets Measure to Count rows. I had to define "New sum of a field…" again.
- Minor: the field search matches underscores literally. "product name" found nothing in the pivot picker; "product" found item.i_product_name. Pivot pickers show `item.i_product_name`, other pickers show "I product name".
- Minor: the Query panel's "1,291 rows without a related record" warning stays on the later steps (for example 2,546 after the store step) and is hard to read as per-step or cumulative. Also the Relationship dropdown after each step moves to the next unused link, including the spurious "Store to Date dim".
- Note on the line chart: 1,291 "unreadable dates" because 4% of ss_sold_date_sk are null. Fine, and the app reports it. Same for 1,277 rows without a sales price.

## 5. Confusion

- "Which table is one row of your analysis?" is a good question but I only understood it after reading the helper line ("Opens one analysis of store_sales. The other 3 tables are added beside it, ready to relate.").
- "Accept 4 links" does not say which links. The diagram shows "100% match" labels only. I could only see the actual four in exploreda.eda.
- "Once per: Every row counts" (fan-out control) appears on bar, row and metric. I left it alone. No explanation seen.
- The Add chart dialog's "Selected: ..." footer and Chart type / Fields tabs: I had to click Fields every time after picking a type.

## 6. Missing

- Offer related-table fields directly in pickers (with a one-click "add the join"), or at least a prompt after accepting links.
- A top-N table (ranked, aggregated) and a way to hide "Other categories".
- A way to drop spurious suggested links one by one at accept time.
- Per-chart choice of which date field (line uses D date but defaults to the key).
- A saved name for the dashboard besides "Store sales" (the analysis name equals the table name).

## 7. Source reading

None. One slip: on the second bar chart, three of my browser calls went without tabId and landed in another tester's tab ("seed", 127.0.0.1:5174): one click at (178,180) and typing "state". It showed a call-center analysis; no visible change. I noticed, then used tabId tab-1 only. I did not close or navigate other tabs.
