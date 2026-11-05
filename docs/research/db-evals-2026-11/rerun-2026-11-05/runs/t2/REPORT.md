```json
{
  "outcome": "done",
  "deliverableLabel": "nfl",
  "minutes": 25,
  "joins": "explorEDA",
  "browserNeededForCli": false,
  "outsideTools": ["sqlite3"],
  "readSource": false,
  "blockers": 0,
  "major": 2,
  "minor": 2
}
```

## 1. Outcome

Done. Notebook: `t2/nfl.eda.md` (sidebar label "nfl"); project text: `t2/exploreda.eda`. It renders in the app with 2 scatter charts and a table.

## 2. What I built

- Notebook with prose, scatter of EPA per pass play vs win rate (R2 0.59, r about 0.77), scatter of EPA per run play vs win rate (R2 0.16, r about 0.40), and a 32-row team table. Each team has 17 games, home or away. Conclusion: passing efficiency tracks winning much more than rushing; association, not cause.
- Project: `plays` source (narrow SQL column select, regular season pass/run with EPA), `games` source, relationship plays.game_id -> games.game_id, and one query: lookup game, calc pass EPA / run EPA / won (win decided by posteam vs home_team, so both home and away games count), aggregate by team+game, then aggregate by team.

## 3. Steps

1. Read BRIEF, `--help`, `exploreda-dsl reference project` and `reference notebook`. Used sqlite3 `.schema` and a few selects.
2. First `source @plays ... table=plays`: `exploreda read` failed (see Friction). Switched to `sql=` with 8 columns.
3. Tried a home+away stack via `append games` of the same source: "Two steps in team-games are named games." Replaced with two SQL-aliased sources and `append`. Worked, but then found a simpler route and removed them.
4. Final approach: lookup game from plays, calc win from posteam side, two-level aggregate.
5. Second aggregate referencing `pg.pe` gave all-null columns with a clean `ok` check. Used `output=pg` to inspect; field is just `pe`. Fixed.
6. Wrote notebook, `fmt --write`, `check` (ok: 3 charts). Computed the correlations with sqlite3 for prose only (the app shows R2 on the chart).
7. Opened in browser: renders, scatter labels and regression lines show. Stopped the server.

## 4. Friction

- Major: `exploreda read` on `table=plays` (372 columns, 50k rows): `plays  failed: plays is larger than 100 MB.` / `fix: Read fewer columns or rows with sql=.` I expected a way to pick columns without hand-writing SQL; had to write a select. The fix text is accurate, but the column-picker is not usable from text.
- Major: In a second `aggregate`, referencing a first aggregate's measure as `pg.pe` (stepname.measure) produced all-null columns with `exploreda-dsl project`/`check` still saying `ok`. Browser showed `null` everywhere. Expected an error ("no field pg.pe, use pe"). Silent wrong output.
- Minor: `append games` into a query starting from `games`: "Two steps in team-games are named games." The fix ("Give one of them its own @name") does not say how to name a source step; there is no way to make the same source appear in both sides of an append, so a home/away long form needs SQL or a different route.
- Minor: `Defines pass, run, wr, team` stub line shows under the prose for an alias-only block; harmless but looks like leftover text.

## 5. Confusion

- Field names: before aggregate they are `plays.epa`, calc fields are bare (`pass_epa`), after aggregate they are bare measure ids (`pe`). Not stated in the reference.
- Whether null in `average` is skipped by the calc `? :` null pattern: it was (pass/run split worked), but the docs do not say.
- `output=step` is only found in the project reference, a useful debug tool I only guessed at.

## 6. Missing

- A fast way to see a query's intermediate steps (output=pg trick worked but felt hidden).
- Error on unknown fields in aggregate measures.
- A way to select columns from a wide table without SQL.
- Correlation as a number in prose (a finding for r); I used sqlite3 for r.

## 7. Source reading

None.
