# t8 report: NFL database, three findings

1. **Outcome:** done (with workarounds). Notebook: nfl-2023.eda.md. In the app (http://127.0.0.1:4109, server now stopped): Notebooks > nfl-2023.

2. **What I built:** The DB is the 2023 NFL season (tables games 285 rows, players 24,864, plays huge/wide with ~370 columns). Findings: (1) home teams won 56.5% of games, avg margin +2.9 points, histogram of margin; (2) team offense EPA per pass/run play, SF best (+0.17), BUF +0.11, NYJ worst (-0.25); (3) pass vs run EPA by down: pass leads on downs 1-2, run leads on 3-4 (run +0.60 vs pass -0.35 on 4th), caveat about selection. My first draft claimed "passing beats running on every down"; the charts showed that was false, so I corrected it.

3. **Steps:**
4. Started app (4108 was taken, it picked 4109). tabs_create failed ("Could not open a new tab..."); used navigate, which landed in shared tab-8. Another tester navigated that tab to their app mid-read twice.
5. UI Add database: typed name/file via form_input; connection was written to exploreda.eda but the form looked reset/empty. Reloaded, tables listed (games, players, plays).
6. Added games via UI. Appended players/plays sources by editing exploreda.eda; they showed "Not read yet" and needed a UI Read click. Players read fine. Plays full read never finished (hung/no snapshot), likely killed by tab navigation or size.
7. `exploreda-dsl fields --data .exploreda/snapshots/games.json` crashed with a raw minified stack trace. Used jq on the snapshot JSON to get field lists.
8. Switched plays to a `sql=` source with limit to see columns, then SQL aggregates (sql sources) for team/down EPA.
9. Learned notebook syntax from `--example forecast` and `--example database` samples (copied into my folder, then deleted; they polluted the project listing meanwhile). Public docs URL /docs returned 404.
10. Notebook allows only one data query. Blocks for a second source did not switch data. Tried project `query` declarations: same. Workaround: one SQL source `findings` that UNION ALLs three shapes (kind,label,grp,value) and charts filter with where.kind=.
11. Row charts counted rows until I added `group @g avg(value) by=label` and `group=g`. Facet by grp showed "(missing)", replaced with two charts using where.grp.
12. Fixed wrong text after reading rendered values.

13. **Friction:**

- Notebook can use only one source/query; no way to mix games, plays aggregates. Forced a UNION hack. Major.
- SQL/`source ... sql=` isn't documented in dsl help; found only in the example project. Public docs /docs 404. Major.
- Notebook/dashboard sources must be read by clicking in the browser; no CLI read, so `exploreda-dsl check` says "hasn't been read" / "Fields: ." until then. Reading is lost if the tab navigates away. Major for agent workflow.
- `exploreda-dsl fields --data .exploreda/snapshots/x.json` crashes with a stack trace (no message). Minor.
- Full read of the large plays table never completed, no progress or error. Major (unknown cause).
- Add database form: after Add connection, form fields appeared empty/reset with no confirmation; connection existed. Minor.
- Fields must be aliased with `x:num=source.field` before use; "result is not a field" error with "Did you mean games.result?" is unhelpful on first try. Minor.
- `row <field>` counts rows by default; value ranking needs `group`. Facet.rowVariable gave "(missing)". Minor.
- Port 4108 busy so app used 4109 without being told why. Minor.
- mcp tabs_create failed. Minor.

5. **Confusion:** Notebook `eda query=` naming a source vs project `query`; `where.kind=` vs `select.`; "Other categories" bucketing hides the worst teams until topN is set.

6. **Missing:** multi-source notebooks; CLI/command to read sources; schema/table browser output in text; docs for sql sources; a bar-of-value chart without needing group; a progress/cancel for long reads.

7. **Source reading:** none. I read explorEDA's own snapshot JSON files (.exploreda/snapshots) with jq to list field names; no sqlite3/Python used.
