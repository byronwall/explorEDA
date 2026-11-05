# t1 report: fourth-down board

## 1. Outcome

Done. Dashboard "Fourth downs" saved at fourth-downs.eda (data source in exploreda.eda in the same folder). Open the app root (http://127.0.0.1:4101/) and pick the "Fourth downs" analysis in the sidebar. Server stopped.

## 2. What I built

Source: a SQL query (via "Add database > A query") limited to fourth downs: pass/run/punt/field goal, 4,222 plays. 833 were go-for-it (about 20%), 52% of attempts converted.
Four calculated fields: Went for it (0/1), Converted (0/1, null for non-attempts), Yards to goal bin (10-yard bins), Score bin (7 bins).
Four bar charts plus the Fields summary:

1. Go-for-it rate by yards-to-goal bin: peaks at 31-40 and 01-10 (about 35%), falls under 5% from the own 20 and back.
2. Go-for-it rate by score bin: trailing by 17+ highest (about 46%), then 35% (down 9-16), 21%, then about 11-16% when tied or ahead.
3. Go-for-it rate by team: DET highest (33%), ordered largest first.
4. Conversion rate by yards-to-goal bin: roughly 40-58%, no clear trend; the 91-99 bin has no attempts.
   Clicking a bar in any chart filters the others (tested on team DET and score bin "2 down 9-16"; the filter chip clears with its x). No brush tested.

## 3. Steps

1. Started server, opened link in a new tab. Empty project showed "Add a database".
2. Add database: SQLite, name nfl, file data/nfl.db. Worked first try; table list shown.
3. Used "A query" with a fourth-down SQL (I read the schema with sqlite3 on the command line, since the UI has no way to browse columns before reading). Read 4,222 rows; an analysis fourth-downs.eda was created automatically.
4. Tried Histogram of Yardline 100 split by Decision: split silently turned it into a Bar Chart with 99 categories ("0 category-pair" empty state, "Widen this chart or filter another view to make each bar visible."). Cancelled.
5. Opened Calculations. First formula used ["Decision"]: "Unknown field: Decision". Needed ["fourth_downs.decision"].
6. Typing with cmd+a did not select the text in the formula box; I set the value via JavaScript instead (my automation, not a product problem per se).
7. Built the four calculations. Accidentally overwrote the edit draft of an existing calculation once (my automation); "Discard draft" restored it.
8. Built each bar chart: Group by, Operation=Average, Measure, Order. Added to grid. Tested cross-filtering.
9. Ran exploreda-dsl project: ok, 1 view, 5 items.

## 4. Friction

- Binning: no bin/round/floor function in calculations. Had to hand-write 10-level nested if/else for yard line and 7 for score. Severity: major. Expected a bin(field, width) function or a bin option on Group by.
- Histogram + "Split by" silently converts to a Bar Chart over every distinct value (99 categories), with a blank preview. Severity: minor-major (confusing).
- Formula field names must be the long form fourth_downs.decision, error "Unknown field: Decision" although the fields list shows "Decision". Severity: minor.
- No rate/percent aggregation: had to create 0/1 helper fields and use Average. It works but is not discoverable. Y axis shows 0.3 rather than 30%. Severity: minor.
- Calculation dialog: Close needed repeated clicks (first click after Create left the "Inspect calculation" view open); Escape worked. Screenshots lagged by one action. Severity: minor.
- Dashboard charts rescale their axes when filtered, so bars of different filters are not comparable at a glance (e.g. team DET filter shows conversion axis up to 1.0). Severity: minor.
- No counts shown, so rates from tiny subsets (e.g. 1.0 from a few attempts) look as solid as big ones. Severity: minor.
- Titles are default ("Average of Went for it by fourth_downs.team"); no obvious inline rename. Not tried hard.

## 5. Confusion

- "Once per / Every row" option in bar chart panel unclear.
- "Operation: Count rows / Sum / Average" is how a rate is made; not stated.
- Data panel says "Add database" but does queries too; fine once opened.

## 6. Missing

- Binning for numeric fields; percent axis formatting.
- A way to define a rate (success/attempts) directly.
- Brush selection on bar charts (only click tested); a visible sample-size hint.
- Schema/column browser for the query step.

## 7. Source reading

None. I used sqlite3 CLI on my own data file to read the schema.
