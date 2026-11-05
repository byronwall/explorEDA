# T6 report: web vs catalog buyers

## 1. Outcome

Partial/done: a working dashboard exists, but it answers the question indirectly (see Friction). Files: runs/t6/buyers.eda (dashboard), runs/t6/exploreda.eda (connection `retail`). Open http://127.0.0.1:4106/ (analysis "Buyers", needs the token link) while the server runs.

## 2. What I built

One source `buyers` from a SQL query (2,179 rows): one row per customer per channel, from web_sales (ws_bill_customer_sk) and catalog_sales (cs_bill_customer_sk), left-joined to customer, customer_demographics, customer_address. Nulls become 'Unknown'. Fields: channel, customer_sk, birth year, gender, marital status, education, state, lines, net_paid.
Four 100%-stacked bar charts (gender, marital status, education, state), each split/colored by channel, plus a Markdown note on missing data.
Finding: catalog 1,581 buyers, web 598 (about 73% catalog). The channel mix is near 73/27 in every gender, marital, education bucket, so web and catalog buyers look alike demographically. State shows more noise (small counts). 80 buyers (4%) lack birth year; gender Unknown ~70 buyers. Only ~11 customers appear in both channels (2,168 distinct of 2,179).

## 3. Steps

1. Started server on 4106, opened token link in a new tab.
2. Add a database -> kind DuckDB file, name retail, file data/retail.duckdb. Worked first time.
3. Switched to "A query", pasted the join SQL (I wrote it from TPC-DS column knowledge; I did not browse the table list). Read in ~4s.
4. Add chart -> Bar Chart -> Fields: Group by Gender, Split by Channel, Display 100%. Repeated for marital status, education, state.
5. First tried grouped counts; the unequal channel sizes made them hard to compare, so switched to 100%.
6. Added a Markdown note. First attempt typed into the dialog editor and the text was lost; typing into the card on the grid worked.

## 4. Friction

- Bar chart default Group by is Customer sk, producing an empty-looking chart with unreadable axis (minor).
- Typed text in the Markdown editor inside the Add-a-chart dialog was not kept; the card was added empty (minor/major, lost input).
- Charts are titled "Distribution of Gender" etc. with no hint of the split or the 100% meaning; the axis label "Share of category total (%)" is confusing: it shows channel share within each gender, not gender share within each channel (minor).
- In the dialog preview the channel legend is absent; it only appears once on the grid (minor).
- State chart with 50 categories at 100% is hard to read; labels show every 3rd state (minor).
- Marital status labels are codes (S, U, D, W, M) with no decoding (minor).
- Dialog is cramped at the 1024x768 pane; the grid's top toolbar scrolls out of the sidebar layout oddly (minor).
- Server wrapper shell: backgrounded server command appeared "completed" but server kept running (tooling, not product).

## 5. Confusion

- "Split by" vs "Use as color field" toggle (seen in first mode) vs "Display". Unclear which does what until tried.
- "Category count" Data mode vs Operation.

## 6. Missing

- Schema browser to see columns before writing SQL (I relied on prior knowledge; the "A table" picker listed tables but I did not use it for columns).
- A join builder in the UI; joins had to be hand-written SQL.
- Per-channel (group by channel, split by attribute) vs per-attribute option labeled plainly; a direct "compare two groups" view.
- Legend/preview parity, chart titles that reflect the fields, a way to rename Distribution titles.

## 7. Source reading

None.
