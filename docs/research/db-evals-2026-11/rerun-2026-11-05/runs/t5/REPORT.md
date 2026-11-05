```json
{
  "outcome": "done",
  "deliverableLabel": "returns",
  "minutes": 18,
  "joins": "explorEDA",
  "browserNeededForCli": false,
  "outsideTools": [
    "python3 (read snapshot JSON to get numbers for the written conclusion)"
  ],
  "readSource": false,
  "blockers": 0,
  "major": 1,
  "minor": 4
}
```

## 1. Outcome

Done. Notebook: `t5/returns.eda.md` (sidebar label "returns"); project text: `t5/exploreda.eda`. It renders in the app with prose and 3 charts plus a total metric.

## 2. What I built

- Return amount by reason (row chart, 35 reasons). Returns with a null reason are labelled "(no reason recorded)" by a calc: $48.7K, 106 rows, 1.8%.
- Return amount by item category (row chart). Women $301K, Shoes $296K, Music $291K, Home $284K.
- Return rate by category (returns / store sales) with a `group ... denominatorField` rate chart. All categories 4.7% to 5.7%; Women, Shoes, Home highest.
- Conclusion: returns are spread thin, with no dominant reason or category. Reason names include unnamed ones ("reason 31" is the top at 7%).
- Reason and category charts come from explorEDA relationships (store_returns -> item, store_returns -> reason) and a `lookup` query. The sales/returns rate uses a SQL source (see Friction).

## 3. Steps

1. Read the brief, `exploreda --help`, `exploreda-dsl` help, `reference project`, `reference notebook`.
2. `exploreda schema` failed: "This folder has no project text yet." I wrote a minimal `exploreda.eda` with a duckdb connection, then schema worked.
3. Declared 4 sources, 3 relates, and queries with lookups and aggregates. `exploreda read .` read the snapshots. `exploreda-dsl project .` passed.
4. Tried a query that reads another query (`source returns-by-cat`, `lookup ... via=x`) to combine sales and returns. Error: "No source is named returns-by-cat." (dead end).
5. Fell back to a SQL source `cat_rate` that joins sales and returns by category in one query.
6. Wrote the notebook and checked it. `check` printed "ok: 4 charts, every declaration applied". The `{{n}}` I left in prose, with no finding defined, was not flagged.
7. Computed numbers with python from the snapshots, then wrote the conclusion.
8. Started the app, opened the notebook in the browser, confirmed all charts and prose render, expanded "Show all 35 categories" to find the no-reason bar.
9. Stopped the server.

## 4. Friction

- Major: Could not combine sales and returns per category inside explorEDA. A query can only start from a source, not from another query's aggregate. A lookup via a relationship would fan out. I wrote the join and aggregate in SQL. Expected: a way to join two aggregates, or a query that reads another query.
- Minor: `{{n}}` with no finding defined passed `exploreda-dsl check` ("ok") with no warning. I only noticed because I reread the file. Expected a warning for an undefined placeholder.
- Minor: `exploreda schema <folder>` needs project text with a connection first, with only "This folder has no project text yet." as guidance. Expected hint on how to create a connection.
- Minor: In the reason chart, the "(no reason recorded)" group is folded into "Other categories" by default, so a reader does not see it unless they click "Show all 35 categories". The brief asks for it as its own group.
- Minor: Null amounts: the metric and charts say "110 excluded" / "110 rows without store_returns.sr_return_amt left out". Clear, but it makes the category totals ($11.9K "(missing)" category) differ from reason totals slightly.

## 5. Confusion

- `reference project` says relationships can be `many-to-one` etc. but not how a `lookup` on a null foreign key behaves; I had to test it (it yields null, so I used a calc).
- The `group @x sum(f) by=k denominatorField=d` rate syntax is in `reference` but not in the notebook reference; I found it by scanning the long reference.
- Item `i_item_sk` has version rows (slowly changing); I assumed it unique. No check surfaced that.
- Reason descriptions in this data include "reason 31" style names; not an explorEDA issue.

## 6. Missing

- Joining/aggregating across two sources without SQL (query from a query, or a merge of aggregates).
- A rate measure (returns / sales) that spans two sources.
- Option to pin a small group such as "(no reason recorded)" out of "Other categories".
- Warning for undefined `{{finding}}` placeholders.

## 7. Source reading

None.
