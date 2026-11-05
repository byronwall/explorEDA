```json
{
  "outcome": "done",
  "deliverableLabel": "lowstock",
  "minutes": 25,
  "joins": "explorEDA",
  "browserNeededForCli": false,
  "outsideTools": [
    "python3 (read snapshot JSON to find date range, null counts, quantile)"
  ],
  "readSource": false,
  "blockers": 0,
  "major": 1,
  "minor": 4
}
```

## 1. Outcome

Done. Notebook: `t7/lowstock.eda.md`; project text: `t7/exploreda.eda`. It renders in the app (sidebar "lowstock", file lowstock.eda.md); `exploreda-dsl check` says "ok: 5 charts".

## 2. What I built

- Project text: duckdb connection, 4 sources (inventory with limit=300000, warehouse, item, date_dim), 3 `relate` lines (inventory to warehouse/item/date_dim), 3 queries (weekly by warehouse, by category, by item) that look up and filter to Q4 2002.
- Data facts: inventory is weekly snapshots, 209 weeks, 1998-01-01 to 2002-12-26. The last quarter is Q4 2002 (13 weeks, 7,800 rows). 407 of them have null quantity and were dropped (4.9% over all data). Warehouse 5 has a null name (shown as "Warehouse 5 (no name)").
- Low-stock line: quantity below 100 (bottom tenth of the 0-1000 range), stated in the notebook.
- Charts: line of units on hand by week per warehouse (about 45k-65k, no warehouse clearly lower; they cross); line of items below the line per week per warehouse; row chart of low item-weeks by category (Women and Jewelry 120, Sports 36); category table with rate (Home 12.4% highest, Sports 8.4% lowest); table of 13 items below the line in 10+ item-weeks (top: barbarpriantiought, Women, 15).
- Honest finding: no warehouse stands out; the low rate is about 10% everywhere.
- Prose states what was left out (null quantities, other quarters).

## 3. Steps

1. Read brief, `--help`, `exploreda-dsl` help and `reference project|notebook`. Started server on 4107.
2. `exploreda schema .` failed: "This folder has no project text yet." Wrote a connection first.
3. Wrote sources, relates, one joined query. Forgot the default 100,000-row read limit; inventory has 188,400, so set `limit=300000` (found in the reference). `exploreda read .` OK.
4. Used python to read the snapshot JSON for date range, nulls, quantiles (no SQL tool in explorEDA CLI for ad hoc stats).
5. Wrote aggregate queries and notebook. Check errors: aggregate output fields are not named `wk.onhand` but `onhand`; `rows` is a reserved word (measure `count @rows` broke the alias); `calc x "Label" = ...` is invalid in a notebook block (but valid in a query); alias `cat:cat=...` then `row cat` failed.
6. `sum @lowrows inventory.low` read as a category with all-null calc; changed to `sum @lowrows low` and it worked.
7. In the browser the row chart showed "1" for every category (counts rows, not my measure); fixed with `group @lowbycat sum(lowrows) by=category` and `group=lowbycat`.
8. A "(missing)" warehouse showed in the legend (null name); added a calc label.
9. `sortBy=` on a table was accepted without effect; used a post-aggregate `filter lowrows >= 10` to shorten the item list instead.
10. Reloaded; verified text and chart rendering. Stopped server.

## 4. Friction

- Aggregate result field naming undocumented: I wrote `wk.onhand` and got "wk.onhand is not a field in the source rows, so onhand is unavailable. fix: Did you mean onhand?" The fix hint was useful but the docs don't say aggregate output fields are bare. minor.
- `sum @lowrows inventory.low` (a calc from the same query) produced "lowrows reads as a category, not a number" with no explanation; bare `low` worked. The reference shows field names as `step.field` so the right form for calcs is unclear. major (silent all-null, took several tries).
- `count @rows`: "rows is a keyword, so it can't name a field." Clear message but the keyword list is not documented. minor.
- A `row` chart on an aggregated query silently counts rows (all bars = 1) rather than using a measure; needs `group` definition. The `check` passed with no warning. minor.
- `table ... { sortBy=itemlow }` was silently ignored; no way found to sort a table from text. minor.
- Check passed even though the first render showed an unlabeled "(missing)" warehouse; null names are surfaced only in the chart. (not counted)

## 5. Confusion

- `exploreda-dsl fields --data .exploreda/snapshots/inventory.json` dumped a huge JS error (36 KB) instead of fields; I did not recover from it. (Likely because it expected a different input; the help says snapshot.json is accepted.)
- Calc label syntax differs between query and notebook blocks.
- Which side of `lookup` takes `via=` the relation id vs source name was clear from the example.

## 6. Missing

- Ad hoc query/profile CLI (min/max date, null counts) without leaving explorEDA.
- Table sort and top-N in text.
- A warning when a row chart on aggregate output only counts rows.
- Week-over-week "last quarter" helper (I hard-coded year 2002 and quarter 4 after finding the max date outside explorEDA).

## 7. Source reading

None. Server log was written to /tmp/x7.log (outside my folder, log only).
