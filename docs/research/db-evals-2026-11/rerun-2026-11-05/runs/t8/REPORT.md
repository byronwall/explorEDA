```json
{
  "outcome": "done",
  "deliverableLabel": "nfl",
  "minutes": 20,
  "joins": "explorEDA",
  "browserNeededForCli": false,
  "outsideTools": [],
  "readSource": false,
  "blockers": 0,
  "major": 1,
  "minor": 3
}
```

1. **Outcome:** done. Notebook at t8/nfl.eda.md, project text at t8/exploreda.eda. Renders in the app (sidebar "nfl", under NOTEBOOKS).

2. **What I built:** a notebook with three findings on 2023 NFL data (games, plays, players).

   - Average total points by roof: open 51, closed 48.7, dome 44.3, outdoors 42 (row chart).
   - Average EPA per play by down, pass vs run (line chart): pass slightly ahead on 1st/2nd down, run far ahead on 3rd/4th (+0.6 vs -0.35 on 4th).
   - Average EPA per pass by passer draft round, via a relationship plays -> players (row chart): no trend (round 7 best, round 5 worst, undrafted shown as "(missing)").

3. **Steps:**

   1. Read BRIEF, ran `exploreda --help` and `exploreda-dsl` (no args), `reference project`, `reference notebook`.
   2. Created exploreda.eda with only project + sqlite connection. `exploreda schema t8` gave 3 tables with row counts; `exploreda schema . nfl games players plays` gave all columns (plays has ~370).
   3. Added sources: games, players, plays (a sql= source filtered to pass/run with 15 columns), two `relate` lines. `exploreda read .` then `exploreda-dsl project .` passed.
   4. Used `exploreda-dsl fields --data .exploreda/snapshots/games.json` to see types and ranges (all season 2023).
   5. Wrote three queries and a notebook. Check flagged `d.epa` and `r.draft_round` not being fields (aggregate output names are bare, e.g. `epa`); fixed.
   6. Opened in browser. Third chart was wrong: aggregating by draft_round then `bar` gave a count of rows per round, not average EPA. Dead end; replaced with a `group avg(plays.epa) by=passer.draft_round` + `row` chart. `check` said "ok" for both versions.
   7. My first heading ("Passing beats running on every down") was contradicted by the chart; rewrote headings and prose after reading the rendered chart.
   8. Started with a trailing `&` in my command (against the brief), the server still ran. Killed it at the end.

4. **Friction:**

   - Major: `exploreda-dsl check` reports "ok" for a chart that is semantically wrong (bar of an aggregated key shows row counts, not my measure). The first draft passed check and only the browser showed it. Expected a hint when a bar/row chart has no measure.
   - Minor: after an aggregate, output field names (`epa`) drop the step prefix while group-by fields keep it (`plays.down`). Not stated in `reference project`; found via error "d.epa is not a field... Did you mean epa?".
   - Minor: `group @x avg(...) by=` in a notebook only works with fields that sit in the query; I had to learn by trial that group avoids needing `aggregate`. Docs show `group` in dashboard reference but not how it relates to `aggregate`.
   - Minor: first page load right after navigate showed "Reading the project folder…" for a few seconds; page text read too early returned just that.
   - Observation: the app picked up edits to nfl.eda.md and exploreda.eda on reload; no restart needed.

5. **Confusion:**

   - Whether a chart should aggregate in the query (`aggregate`) or via `group` on the chart; both exist and neither is recommended.
   - `line ... color=plays.play_type` legend shows counts "4" next to run/pass (number of points), unclear meaning.
   - Draft round "(missing)" for undrafted passers is shown but not explained (null label).

6. **Missing:**

   - A way to see row/value counts alongside an average (to judge noisy small groups like draft rounds); I could not chart `n` next to `epa` without another chart.
   - `exploreda schema` lists 370 columns for plays in one long dump; no filter/search.
   - A check warning for an aggregated measure that no chart uses.

7. **Source reading:** none.
