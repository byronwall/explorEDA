```json
{
  "outcome": "done",
  "deliverableLabel": "Fourth",
  "minutes": 12,
  "joins": "none",
  "browserNeededForCli": false,
  "outsideTools": [],
  "readSource": false,
  "blockers": 0,
  "major": 1,
  "minor": 4
}
```

## 1. Outcome

Done. A dashboard named "Fourth" with 4 charts plus a field summary, all on fourth-down plays. Click on a bar filters the other charts. Files: `t1/exploreda.eda`, `t1/fourth.eda`. Note: the brief's "brush" (drag) did not filter; click did.

## 2. What I built

Source `fourth` = plays where down = 4, 8 columns, 4,490 rows (read through the "Pick columns" + "Only rows where" form, no SQL typed).
Three calculations: Went for it (converted + failed, 0/1), Yard line bin (width 10), Score margin bin (width 8).
Charts:

1. Go-for-it rate by yard line bin (yardline_100: 0 = opponent goal line). Rate is highest at 0-9 (about 35%) and 30-49 (about 31%), and falls to 2% at 90+.
2. Go-for-it rate by score margin bin. About 10% when tied or within a score, rising to 40-50% when trailing by 24 or more.
3. Success rate of attempts by yard line bin (converted / went-for-it). About 50-60% everywhere, no strong trend.
4. Go-for-it rate per team (row chart): DET 31%, CAR 29%, down to about 12% for the lowest.
   Cross-filter: clicking yard line 0 in chart 1 filtered all other charts (327 of 4,490 rows) and drew the unfiltered values as ghost bars. A filter chip appeared in the footer and cleared with X.

## 3. Steps

1. Started server, opened the link in a new tab (tabs_create worked).
2. Add a database: New connection, SQLite, name nfl, file data/nfl.db. Tables listed with row counts.
3. Checked plays (372 columns). Orange warning said it was likely more than the 100 MB read limit. Clicked "Pick columns".
4. Searched columns by name, ticked down, fourth_down_converted, fourth_down_failed, yardline_100, posteam, score_differential, play_type, ydstogo. Typed `down = 4` in "Only rows where". Named source "fourth". Add and read gave 4,490 rows and an auto analysis.
5. Calculations panel: tried `recode(["play_type"], "run", 1, "pass", 1, 0)`. Failed with "recode targets must be text or null, not 1". Switched to `sum(["fourth_down_converted"], ["fourth_down_failed"])`: worked, 14 rows fail (missing inputs).
6. Made the two bin calculations with `bin()`.
7. Add chart > Bar Chart > Fields: group by Yard line bin, Average of Went for it, order A to Z, Format Percent. Repeated for score margin.
8. Success rate: Operation "Rate (sum ÷ sum)", Sum of Fourth down converted, Divided by Went for it.
9. Per-team: Row Chart, Measure "New average of a field...", Went for it, Top N 32.
10. Tested click filter (works) and drag brush (highlights a bar, does not filter).

## 4. Friction

- major: Brief expects "click or brush". Dragging across bars in a bar chart only highlighted one bar (hint text "Click bars or ..." was cut off). Click filters; I never found a way to brush a range. Expected a range selection on binned axes.
- minor: Go-for-it rate needs a 0/1 flag. `recode` rejects numbers ("recode targets must be text or null, not 1"), and there is no if/then in the function list. I had to use sum of two outcome columns. The error is clear, but the workaround is not obvious.
- minor: Chart-picker checkboxes in the column picker have no accessible name (read as "on"), so screen readers and find tools cannot tell them apart.
- minor: The 14 rows where converted/failed are missing make "Went for it" fail on 14 rows, and the project check ends "partial: 1 problem" (warning). Those are likely penalty/no-play rows; it is unclear how to drop them cleanly.
- minor: Row chart in the grid cell still shows "Other categories" (15 smaller) though the spec has topN=32; it only showed all 32 in the dialog preview. Cell is small.

## 5. Confusion

- yardline_100 means yards from the opponent end zone, so "0" is the goal line; nothing in the app says so (the data's own meaning).
- Operation vs Measure vs Rate labels: in Row chart, Measure is a dropdown of saved measures with "New average of a field...", unlike Bar chart's Operation. Two models for the same thing.
- The success-rate bar chart is titled "Fourth down converted ÷ Went for it by Yard line bin", which reads fine but the y-axis label is long.

## 6. Missing

- Conditional/if expression for calculations.
- Range brush on binned bars.
- A way to put a rate such as "success among attempts" without a second calculation; rate (sum ÷ sum) worked well, though.
- Score-margin and yard-line bins as built-in bin options on a chart without a calculation.

## 7. Source reading

None. I read only the project files the app wrote (exploreda.eda, fourth.eda) and `exploreda schema` output for column names.
