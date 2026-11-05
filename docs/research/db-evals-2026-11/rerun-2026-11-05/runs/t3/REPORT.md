```json
{
  "outcome": "done",
  "deliverableLabel": "QB scouting",
  "minutes": 28,
  "joins": "none",
  "browserNeededForCli": false,
  "outsideTools": [],
  "readSource": false,
  "blockers": 0,
  "major": 2,
  "minor": 5
}
```

## 1. Outcome

Done (with caveats on method, see Friction). Deliverable: sidebar analysis "QB scouting", file `t3/qb-scouting.eda` (view "Plays"), source in `t3/exploreda.eda`.

## 2. What I built

Source `plays` read from `data/nfl.db` with 16 chosen columns (of 372), through the app's "Pick columns" flow. Two calculated fields: `QB` (recode of passer_player_name to the five names, else "Other") and `Real attempt` (1 - sack - qb_spike). Workspace filter QB = the five. Four charts:

- Pivot (rows QB, columns Sack): avg complete_pass, avg air_yards, count, avg sack.
- Box plot of air yards by QB.
- Bar: sack / qb_dropback by QB (Rate operation).
- Bar: complete_pass / Real attempt by QB (Rate operation).

Findings (3,325 rows, 184 sacks, 5 spikes):

- Completion on non-sack rows: Prescott .692, Mahomes .677, Allen .663, Jackson .663, Hurts .657. Bar chart (spikes also excluded) shows about 66-69%.
- Mean air yards (sacks have no value and are ignored, shown as "No valid values" in the sack column): Hurts 8.57, Jackson 8.43, Allen 8.42, Prescott 7.85, Mahomes 6.51.
- Sack rate per dropback: Jackson about 7.8%, Hurts 6.4%, Prescott 6.2%, Mahomes 4.1%, Allen 3.8%.
- Missing air yards are handled on purpose: air_yards is missing on sack rows, so averages skip them; sacks are removed from the completion denominator via `Real attempt`.

## 3. Steps

1. Started server, opened link in own tab (tabs_create worked).
2. Add a database: SQLite, name "nfl", path data/nfl.db. Tables listed with row counts.
3. Checked `plays`; app warned "plays has 372 columns, likely more than a 100 MB read keeps across 49,665 rows. Pick columns to read only the ones you need." Opened Pick columns. Ticked 16 columns by clicking checkboxes through page script (a long list, no search-then-tick flow I could easily drive). Add and read worked in a few seconds.
4. Tried a workspace text filter on Passer player name: only Contains/Equals/Starts/Ends, one value. Clicking a value in the field inspector did nothing. Dead end for "five names".
5. Calculations > New calculation. Used recode() (found in the Functions tab) to make `QB`. Live preview said "Valid for all 49,665 rows".
6. Filter on QB: checkbox list, ticked five. 3,325 rows left.
7. Pivot Table: tried to clear the Column Field (the x only reopened the picker). Used Sack as column field instead. Added four value fields with Average/Count.
8. Box Plot grouped by QB. Search in field picker failed on "air_y" (matches labels, not column names).
9. Bar Chart, Operation "Rate (sum ÷ sum)", Sack / Qb dropback. Found it by listing the select options.
10. Created `Real attempt` calc; it reported 1,488 failed rows (missing sack on non-play rows). Bar chart with Complete pass / Real attempt.
11. Renamed analysis. Rename box could not be cleared with select-all (got "PlaysQB scouting"); fixed with many backspaces.
12. Stopped server.

## 4. Friction

- Pivot Table forces a Column Field. Tried to clear it (x button); it just reopened the picker. Expected a plain one-row-per-QB table. Workaround: use Sack as columns, which splits and totals the measures. Severity: major.
- No clean way to say "these five values" on a text field. Filter dialog has one text box with Contains/Equals; had to write a recode calculation. Expected an "is one of" list like the QB filter ended up showing. Severity: major (the QB calc works well, but it is not discoverable).
- Calculation "Real attempt" shows "1,488 of 49,665 rows failed" and a persistent "1 problem" in the sidebar although it is fine in the filtered view. Expected missing to propagate quietly, or an easy way to restrict the calc. Severity: minor.
- Pivot headers are truncated in the dashboard tile ("Comple...", "Air yard...", "Game I...") and the count column is labelled by game_id. Severity: minor.
- Box plot and Bar chart keep an empty "Other" slot (box plot) or faded "Other" bar (the add-chart preview of a category bar) after the filter. Severity: minor.
- Rename box: select-all key did nothing; Enter did not save. New name saved as "PlaysQB scouting" first, and the file name followed ("playsqb-scouting.eda"). Severity: minor.
- Dialogs often needed a second click on the close X (first click only focused). Severity: minor.
- Field pickers search the display label ("Air yards"), not the column name ("air_yards"), and fuzzy matches like "ai" return Game ID first. Severity: minor (counted with the above; not double-listed).

## 5. Confusion

- The Rate (sum ÷ sum) option is good but easy to miss; defaults after switching show "Yards gained ÷ Air yards", which looks real until you change both fields.
- It is unclear whether sack rows count in pass_attempt (all 3,325 rows show pass_attempt=1, including sacks), so I did not use it. I built Real attempt instead.
- "Qb dropback" includes spikes (5 rows); I left them in the sack denominator.
- Calculation applies as soon as "Create calculation" is clicked, but the dialog title changes to "Inspect calculation"; not obvious it was saved.

## 6. Missing

- A "keep only these values" multi-select filter on text fields (or on a category chart).
- A pivot with no column field.
- A completion % that can use a per-chart row filter (e.g. only non-sack rows) without making a calc.
- Ability to see a combined scorecard table of Rate measures directly (Rate in the pivot).

## 7. Source reading

None.
