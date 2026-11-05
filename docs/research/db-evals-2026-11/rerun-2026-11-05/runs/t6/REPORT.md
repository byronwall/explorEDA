```json
{
  "outcome": "partial",
  "deliverableLabel": "Catalog sales",
  "minutes": 30,
  "joins": "explorEDA",
  "browserNeededForCli": false,
  "outsideTools": [],
  "readSource": false,
  "blockers": 1,
  "major": 3,
  "minor": 3
}
```

# Report: web vs catalog buyers (t6)

## 1. Outcome

Partial. A catalog-only dashboard is done through the UI: `t6/catalog-sales.eda` (sidebar "Catalog sales"). The two-channel dashboard (`t6/all.eda`, sidebar "Web vs catalog buyers", query `all-sales` in `t6/exploreda.eda`) needed hand-written project text and does NOT work for web rows (web buyers all show "(missing)"). The web side was never charted properly.

## 2. What I built

- Connected `data/retail.duckdb`, read 5 tables (catalog_sales, web_sales, customer, customer_address, customer_demographics) and made 4 relationships (2 suggested and accepted, 2 drawn by dragging fields).
- In the UI, added lookup steps to the Catalog sales query: customer, then demographics, then address. The Query panel reported "616 rows without a related record".
- Four row charts on Catalog sales: gender, marital status, education, state (top 15). Each shows a "(missing)" bar: 498 for gender, marital and education; 470 for state. Catalog buyers: M 6,992, F 6,762, missing 498.
- Web side: no working chart. My text-edited `all-sales` query (append web-sales, coalesced buyer key) loads 21,547 rows (14,252 + 7,295), but every web row has missing demographics, and `color=channel` rendered grey. Do not trust `all.eda`.
- No finding on "are they different?" because the web channel was never charted.

## 3. Steps

1. Started the server, opened the link in my own tab (tabs_create worked).
2. Add a database, kind DuckDB file, name retail, file data/retail.duckdb. Tables listed with row counts. inventory is flagged "over the read limit".
3. Ticked the 5 tables. The footer asked "Which table is one row of your analysis?" and I chose catalog_sales. Result: one analysis (Catalog sales) plus 4 loose tables.
4. "2 suggested links to review" opened the schema diagram. Accepted both (catalog to customer, web to customer by bill_customer_sk). No suggestion for customer to demographics or address.
5. Dragged c_current_cdemo_sk to cd_demo_sk. The dialog showed Matched 4,954 / Unmatched 156 / Ambiguous 0. Created it. Same for c_current_addr_sk to ca_address_sk (5,110 / 0 / 0).
6. Clicked the Catalog sales query card in the diagram, then "Add a step", "Use a relationship". Added the three lookups. The Query panel then offered "Web sales to Customer" as a relationship to apply on catalog sales (odd).
7. Looked for a union or append step to stack web and catalog: step kinds are only "Use a relationship", "Calculate a field", "Keep matching rows". Relationship effects are add fields, summarize, or one row per related record.
8. Add chart, Row Chart, Fields tab, picked the field by typing. Added 4 charts, about 7 clicks each.
9. Read `exploreda-dsl reference project` and found `append`. Edited `exploreda.eda` by hand (outside the UI) to add an `all-sales` query. Tried several forms before it passed `exploreda-dsl project`. Loaded in the app, web rows all missing. Stopped at the time limit.
10. Killed the server.

## 4. Friction

- Blocker: Compare two fact tables (web vs catalog) in one chart. The UI has no append/union step. I tried the Query panel and the diagram "Add a step" menu. Expected: a way to stack two tables with a channel field. Workaround: `append` exists in project text only. Even there it fills only fields with the same names, so `ws_bill_customer_sk` and `cs_bill_customer_sk` do not line up. The result: web rows get no customer.
- Major: A lookup via a relationship needs the relationship's own input field. `lookup customer via=rel-catalog-sales-... on=buyer` failed with "Relationship rel-catalog-sales-cs_bill_customer_sk-customer-c_customer_sk has no matching input field in this frame". `on=all-sales.buyer` passed the check but web rows still came out empty, so I could not reach the goal even by text.
- Major: The first-run prompt "Which table is one row of your analysis?" forces one table. I picked catalog_sales; web_sales had no analysis of its own. I had to guess how to add a second one. Not hard to find after, but not obvious.
- Major: `color=channel` on a row chart in text silently did nothing: charts rendered all grey with no warning in the app. (`exploreda-dsl` also accepted the final form with no warning.)
- Minor: With the Add database panel open the sidebar and the page scroll together and coordinates move between actions. I had to re-screenshot often.
- Minor: In the Add step dialog the selected relationship text "Customer to Customer demographics" overflows its select box onto two lines.
- Minor: Relationship list for the Catalog sales query offers "Web sales to Customer", which cannot apply to catalog rows.

## 5. Confusion

- Which of web or catalog should be "one row of your analysis". It was not clear that I could not have both.
- Field labels like "Cs sold date sk" and "C salutation" (table prefix plus column) are noisy.
- Chart titles read "Rows by Cd gender" with no table context.
- "(missing)" in a chart does not say if it means no related customer, no demographics row, or a null value. The Query panel's "616 rows without a related record" is useful, but I did not see it surfaced on the charts.

## 6. Missing

- Append/union step in the UI (or "channel" as a source-of-rows option when choosing tables).
- Matching the foreign keys across different tables for a union (rename or coalesce in a step, not only in text).
- A colour-by-field picker that warns when the field does not resolve.
- A summary of how many buyers lack demographics, next to the charts.
- Percent-within-channel bars, so 14k catalog rows and 7k web rows compare fairly.

## 7. Source reading

None. I read project text files the app wrote, `exploreda-dsl reference`, and `exploreda-dsl project` output only. Hand-edited `exploreda.eda` (added `all-sales` query) and created `all.eda`; backup of the original was copied to `/private/tmp/claude-501/exploreda.eda.bak`.
