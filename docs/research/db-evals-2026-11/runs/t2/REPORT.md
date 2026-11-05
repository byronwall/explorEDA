1. **Outcome:** done. Notebook: runs/t2/passing.eda.md (project config: runs/t2/exploreda.eda). In the app, open the project and click "passing" under Notebooks (http://127.0.0.1:4102/, server now stopped).

2. **What I built:** A SQL source `teams` (one row per team, regular season only) built from a union of home and away games, so every team has 17 games. It joins win rate to per-team EPA per pass play and per run play. The notebook has prose, two scatter charts with linear fits (pass EPA vs win rate, run EPA vs win rate) and a team table. Finding: pass EPA explains about 57% of win rate variance (R2 0.57, r 0.75). Run EPA is weak (R2 0.16, r 0.40). SF best passer (+0.27, 12 wins); NYJ, NE, CAR worst. The conclusion notes correlation is not causation.

3. **Steps:**

   1. Read brief, inspected db schema with sqlite3 (plays, games; 272 REG games, no ties).
   2. Ran `exploreda-dsl reference`; no notebook format in help. Copied `--example forecast` and `--example database` into a subfolder of my folder to learn the syntax (deleted afterwards).
   3. Wrote exploreda.eda (connection + sql source + query) and passing.eda.md.
   4. `exploreda-dsl check passing.eda.md` failed: every field "is not a field, alias, or calculation". Cause: the DB source had not been read yet.
   5. Started the server, opened the link, clicked Read on the Teams source (32 rows). Charts rendered. After that `exploreda-dsl project .` passed ("3 charts").
   6. Computed R2 values independently in python to write accurate prose, edited the notebook, reloaded; charts and text render.

4. **Friction:**

   - minor: CLI check cannot see database rows until the source is read in the browser app. Errors read `teams.pass_epa is not a field, alias, or calculation ... fix: Fields: .` (empty field list). The real fix, "Refresh it to read its rows", only shows in `project` output as a warning, not in `check`. Expected a hint in `check`, or a CLI way to read the source.
   - minor: `exploreda-dsl reference notebook` says "notebook is not a chart type." No docs from the CLI on notebook syntax; I learned it from the example.
   - minor: The page showed "Reading the project folder..." for a few seconds after load, then rendered.
   - minor: A "Definitions" label appears in the notebook above the first section (probably the hidden eda block); unclear what it is.
   - minor: No way to label points by team on a scatter that I found; with 32 anonymous dots you cannot see which team is which without the table.

5. **Confusion:** Source "key=team" plus `db=` vs `path=` for sql sources; chart fields are written `teams.pass_epa` (source-qualified) in a query-based notebook, which I only learned from the example. "Read" vs "Refresh" button for data.

6. **Missing:** point labels or tooltips naming the team on the scatter (tooltips not tried); a CLI command to read database sources; notebook syntax in `exploreda-dsl reference`; a way to compute joins or aggregates without hand-writing a SQL string on one long line.

7. **Source reading:** none.
