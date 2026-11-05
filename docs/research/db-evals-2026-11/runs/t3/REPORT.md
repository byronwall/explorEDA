# explorEDA user test t3: five-QB scouting dashboard

## 1. Outcome

Done (with caveats). Dashboard: `runs/t3/qb-dropbacks.eda` (analysis "Qb dropbacks"); source query and connection in `runs/t3/exploreda.eda`. Open the app at `http://127.0.0.1:4103/` (token link from the server) and pick "Qb dropbacks" in the Analyses list. Server is stopped. Leftover analyses "Plays" (never read, too big) and "Sample" (my 2,000-row probe) remain.

## 2. What I built

Source: a SQL query on `plays` (connection `nfl`): passer in P.Mahomes, J.Allen, L.Jackson, J.Hurts, D.Prescott and `qb_dropback = 1`, selecting passer, game, week, play type, complete_pass, sack, interception, air_yards, epa, desc etc. 3,319 rows (Mahomes 776, Prescott 695, Allen 675, Hurts 613, Jackson 560). Includes playoff weeks (week up to 22).

Six charts on the grid:

1. Rows by passer (dropback count, the denominator).
2. Average of Sack by passer = sack rate per dropback: Jackson 0.08, Hurts 0.06, Prescott 0.06, Mahomes 0.04, Allen 0.04.
3. Average of air_yards by passer (nulls skipped): Hurts 8.57, Allen 8.45, Jackson 8.45, Prescott 7.85, Mahomes 6.51.
4. Box plot of air yards by passer.
5. Average of calculated field "Completed (attempts only)" = `if ["qb_dropbacks.sack"] == 1 then null else ["qb_dropbacks.complete_pass"]`, so completion % is per attempt, not per dropback: Prescott 0.69, Mahomes 0.68, Allen 0.67, Jackson 0.66, Hurts 0.66.
6. ECDF of air yards split by passer (footer: "191 rows without a number left out", medians per QB: Mahomes 4, Prescott 5, Allen 5, Hurts 6, Jackson 8).

Null handling: 191 of 3,319 rows have no air yards. Using the "191 missing" chip I filtered to them: 184 are sacks (the calc field is also missing there), about 7 are other plays (spikes/throwaways or similar; I did not look at each). Air-yards charts leave them out on purpose (not zero); the completion calc excludes sacks from the denominator; sack rate keeps them in. Not written onto the dashboard itself (no notes/text tile added).

## 3. Steps

1. Started server on 4103, opened link in a new tab. Empty state: "Add data to start" + "Add a database".
2. Add database: SQLite file, name `nfl`, file `data/nfl.db` (the file field shows the placeholder). First click on "Add connection" only blurred the field; second click worked.
3. Picked table `plays` -> "Add and read". Failed: "Added plays, but it couldn't be read: plays is larger than 100 MB." Dead end (left a "Plays" source marked Not read yet).
4. Switched to "A query", read `select * from plays limit 2000` as `sample` to learn columns (372 columns; plays table also carries game/player columns).
5. Wrote a filtered query as `qb_dropbacks`, 3,319 rows.
6. Add chart -> Row Chart (count rows) -> Add to grid. Then Row Chart with measure "New average of a field" = Sack. Then average Air yards. Then Distribution (box plot) air yards grouped by passer.
7. Calculations -> New calculation; first formula used `["Sack"]`: "Unknown field: Sack". Used `["qb_dropbacks.sack"]` and it validated with a live row preview. Created.
8. Row chart averaging the calc field. ECDF of air yards split by passer.
9. Checked the missing air-yards rows through the Fields table chip (adds a workspace filter), then removed the filter chip.
10. Stopped server.

## 4. Friction

- Table >100 MB cannot be read: "plays is larger than 100 MB." Major. The only workaround was a query with a where/limit, found by trial. I expected a hint like "use a query to read a subset". The failed table stays as a "Not read yet" source and analysis.
- No schema browser before reading: I could not see columns without reading a sample. Minor/major for large DBs. I had to guess column names (snake_case) in my SQL.
- Calculation field names: formula needs `["qb_dropbacks.sack"]` (source.column), but the error is only "Unknown field: Sack" and the UI labels say "Sack". Minor. The Fields tab in the calc dialog does list the qualified names, which saved me.
- Formula editor: select-all (cmd+a / ctrl+a) did not select text in the formula box, so I had to backspace to clear it. Minor (may be a test-harness artifact).
- Rate charts show averages rounded to 2 decimals and no percent format (0.08, 0.06, 0.69, 0.68, 0.67, 0.66, 0.66), so completion % for five QBs is hard to tell apart. Major for this task. I did not find a number format option.
- Chart titles are auto-generated ("Average of qb_dropbacks.sack by qb_dropbacks.passer_player_name", truncated on the card). Minor. I did not find or try to rename charts.
- Box plot x-axis showed only 3 of 5 QB labels (D.Prescott, J.Hurts, P.Mahomes) at this width. Minor.
- Missing column in Fields summary reads like "1085%" / "191 6%" in extracted text (count and percent run together) and the sample table had missing counts over 100% in text. Probably only a text-extraction effect; visually "191 | 6%". Minor/unclear.
- Clicking a column's "N missing" chip applies a workspace-wide filter that also changes every chart (sack chart showed 0.98), easy to forget to clear. Minor.
- Layout shifted after reads (panel moves down), so coordinate clicks sometimes missed; my screenshots also lagged one step. Environment-related, minor.

## 5. Confusion

- "Pass attempt" is 1 for every row of my query (includes sacks), so it is not a safe attempts flag; I had to define attempts as sack == 0 myself. Dataset semantics, not explorEDA.
- `qb_spike` and `qb_scramble` are all 0 in my data. Scrambles are run plays, so they are not in my dropback set and sack-per-dropback is slightly overstated relative to true dropbacks. Spikes seem absent.
- "Once per: Every row" in the measure panel; unclear what other options mean for grouping.
- Whether the average measure skips nulls or counts them as zero is not stated in the measure panel. The ECDF says how many rows were left out; the row chart average does not.

## 6. Missing

- Percent/number formatting and more decimals on measure labels.
- A ratio measure (sum(a)/sum(b)) or a conditional "average where" without writing a calculated field.
- Per-chart filters and a way to add a short note to the dashboard stating the exclusions (nulls, sacks).
- Table size workaround/hint for large DB tables; schema/column list before reading.
- Chart rename/title editing (not found; may exist).
- A small-multiples histogram by passer (I used ECDF and box plot instead).

## 7. Source reading

None. I did not read explorEDA source and did not inspect the database outside the app. I read the produced project files only via `ls`.
